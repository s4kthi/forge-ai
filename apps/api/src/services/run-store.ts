import { ApiError } from "../errors/api-error.ts";
import { Prisma } from "../generated/prisma/client.ts";
import type { AgentRunMode, AgentRunStatus, RunEventType } from "../generated/prisma/enums.ts";
import { getDatabase } from "./database.ts";

export interface RunScope {
  runId: string;
  organizationId: string;
}

export interface TaskScope {
  taskId: string;
  organizationId: string;
}

export interface LockedRun {
  id: string;
  status: AgentRunStatus;
  mode: AgentRunMode | null;
}

const publicJob = {
  select: { queuedAt: true, leaseExpiresAt: true, lastHeartbeatAt: true, recoveryCount: true, attentionRequired: true },
} satisfies Prisma.AgentRun$planningJobArgs;

function withPublicJob<T extends { planningJob: object | null }>(record: T) {
  const { planningJob, ...run } = record;
  return { ...run, ...(planningJob && { planningJob }) };
}

const chronological = [
  { createdAt: "asc" },
  { id: "asc" },
] satisfies Prisma.AgentRunOrderByWithRelationInput[];

function taskFilter({ taskId, organizationId }: TaskScope): Prisma.TaskWhereUniqueInput {
  return { id: taskId, project: { organizationId } };
}

function runFilter({ runId, organizationId }: RunScope): Prisma.AgentRunWhereUniqueInput {
  return { id: runId, task: { project: { organizationId } } };
}

export function createRun(scope: TaskScope) {
  return getDatabase().$transaction((database) => createRunInTransaction(database, scope));
}

export async function createRunInTransaction(
  database: Prisma.TransactionClient,
  scope: TaskScope,
  mode?: AgentRunMode,
) {
  const [task] = await database.$queryRaw<{ id: string }[]>`
    SELECT task."id"
    FROM "Task" AS task
    JOIN "Project" AS project ON project."id" = task."projectId"
    WHERE task."id" = ${scope.taskId}::uuid AND project."organizationId" = ${scope.organizationId}::uuid
    FOR SHARE OF task, project
  `;
  if (!task) throw new ApiError(404, "Task not found");

  const run = await database.agentRun.create({ data: { taskId: task.id, mode } }).catch((error: unknown) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError(409, "This task already has an active run");
    }
    throw error;
  });
  await appendEvent(database, run.id, "RUN_CREATED", { status: run.status });
  return run;
}

export async function listLlmCalls(scope: RunScope) {
  const run = await getDatabase().agentRun.findUnique({
    where: runFilter(scope),
    select: { llmCalls: { orderBy: [{ startedAt: "asc" }, { id: "asc" }] } },
  });
  if (!run) throw new ApiError(404, "Run not found");
  return run.llmCalls;
}

export async function listRuns(scope: TaskScope) {
  const task = await getDatabase().task.findUnique({
    where: taskFilter(scope),
    select: { runs: { orderBy: chronological, include: { planningJob: publicJob } } },
  });
  if (!task) throw new ApiError(404, "Task not found");
  return task.runs.map(withPublicJob);
}

export async function getRun(scope: RunScope) {
  const db = getDatabase();
  const run = await db.agentRun.findUnique({
    where: runFilter(scope),
    include: { steps: { orderBy: { sequence: "asc" } }, planningJob: publicJob },
  });
  if (!run) throw new ApiError(404, "Run not found");
  if (!run.planningJob) return withPublicJob(run);
  const [clock] = await db.$queryRaw<{ expired: boolean }[]>`
    SELECT COALESCE("leaseExpiresAt" <= clock_timestamp(), false) AS expired
    FROM "PlanningJob" WHERE "runId" = ${run.id}::uuid
  `;
  return { ...run, planningJob: { ...run.planningJob, leaseExpired: clock?.expired ?? false } };
}

export async function listRunEvents(scope: RunScope) {
  const run = await getDatabase().agentRun.findUnique({
    where: runFilter(scope),
    select: { events: { orderBy: { sequence: "asc" } } },
  });
  if (!run) throw new ApiError(404, "Run not found");
  return run.events;
}

export async function listRunMessages(scope: RunScope) {
  const run = await getDatabase().agentRun.findUnique({
    where: runFilter(scope),
    select: { messages: { orderBy: chronological } },
  });
  if (!run) throw new ApiError(404, "Run not found");
  return run.messages;
}

export function withActiveRun<T>(
  { runId, organizationId }: RunScope,
  write: (database: Prisma.TransactionClient, run: LockedRun) => Promise<T>,
  allowPlanning = false,
): Promise<T> {
  return getDatabase().$transaction(async (database) => {
    // Lock the run before allocating sequences or checking transitions.
    // Keep the task and project in the same tenant for the duration of the write.
    const [run] = await database.$queryRaw<LockedRun[]>`
      SELECT run."id", run."status"::text AS "status", run."mode"::text AS "mode"
      FROM "AgentRun" AS run
      JOIN "Task" AS task ON task."id" = run."taskId"
      JOIN "Project" AS project ON project."id" = task."projectId"
      WHERE run."id" = ${runId}::uuid AND project."organizationId" = ${organizationId}::uuid
      FOR UPDATE OF run
      FOR SHARE OF task, project
    `;
    if (!run) throw new ApiError(404, "Run not found");
    if (run.status !== "PENDING" && run.status !== "RUNNING") {
      throw new ApiError(409, "Terminal runs cannot be modified");
    }
    if (run.mode && !allowPlanning) throw new ApiError(409, "A planning run must be managed by the worker");

    return write(database, run);
  }, { isolationLevel: "ReadCommitted" });
}

// Call only while holding the run lock or within its creation transaction.
export async function appendEvent(
  database: Prisma.TransactionClient,
  runId: string,
  eventType: RunEventType,
  payload: Prisma.InputJsonObject,
  stepId?: string,
) {
  const previous = await database.runEvent.findFirst({
    where: { runId },
    orderBy: { sequence: "desc" },
    select: { sequence: true },
  });
  return database.runEvent.create({
    data: { runId, stepId, eventType, payload, sequence: (previous?.sequence ?? 0) + 1 },
  });
}
