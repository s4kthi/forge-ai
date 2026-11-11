import { createHash, randomUUID } from "node:crypto";
import { ApiError, ExecutionApiError } from "../errors/api-error.ts";
import type { Prisma } from "../generated/prisma/client.ts";
import type { AgentRunMode } from "../generated/prisma/enums.ts";
import { requireOrganization } from "./access.ts";
import { readTaskContext } from "./alex.ts";
import { getDatabase } from "./database.ts";
import { appendEvent, createRunInTransaction } from "./run-store.ts";
import type { LockedRun, TaskScope } from "./run-store.ts";
import { applyRunChange, closeInterruptedInvocations } from "./run-workflow.ts";

export function enqueuePlanning(
  scope: TaskScope, userId: string, mode: AgentRunMode, key?: string, acknowledgeUnknown = false,
) {
  const keyHash = key && createHash("sha256").update(key).digest("hex");
  return getDatabase().$transaction(async (db) => {
    await requireOrganization(db, userId, scope.organizationId, true);
    // Serialize enqueue/replay decisions for a task before the unique constraints are reached.
    const [task] = await db.$queryRaw<{ id: string }[]>`
      SELECT task."id" FROM "Task" AS task JOIN "Project" AS project ON project."id" = task."projectId"
      WHERE task."id" = ${scope.taskId}::uuid AND project."organizationId" = ${scope.organizationId}::uuid
      FOR UPDATE OF task FOR SHARE OF project
    `;
    if (!task) throw new ApiError(404, "Task not found");

    if (keyHash) {
      const prior = await db.planningJob.findUnique({
        where: { userId_organizationId_taskId_keyHash: { userId, ...scope, keyHash } },
        select: { run: true },
      });
      if (prior) {
        if (prior.run.mode !== mode) throw new ApiError(409, "Idempotency key was already used for a different workflow");
        return { run: prior.run, replayed: true };
      }
    }

    const context = await readTaskContext(db, scope);
    const run = await createRunInTransaction(db, scope, mode);
    // Check after the active-run constraint has admitted the insert, so an older run
    // finalizing concurrently cannot turn UNKNOWN between the check and admission.
    if (!acknowledgeUnknown) {
      const latest = await db.planningJob.findFirst({
        where: scope,
        orderBy: [{ queuedAt: "desc" }, { runId: "desc" }],
        select: { runId: true, run: { select: { llmCalls: { where: { status: "UNKNOWN" }, take: 1, select: { id: true } } } } },
      });
      if (latest?.run.llmCalls.length) {
        throw new ExecutionApiError(409, "The previous provider outcome is unknown. Review the saved run and provider usage before starting again.",
          latest.runId, "FAILED");
      }
    }

    await db.planningJob.create({ data: { ...scope, userId, runId: run.id, context, keyHash } });
    return { run, replayed: false };
  });
}

export interface PlanningLease {
  runId: string;
  token: string;
}

export function claimPlanningJob(leaseMs: number): Promise<PlanningLease | undefined> {
  return getDatabase().$transaction(async (db) => {
    const [run] = await db.$queryRaw<LockedRun[]>`
      SELECT run."id", run."status"::text AS "status", run."mode"::text AS "mode"
      FROM "PlanningJob" AS job JOIN "AgentRun" AS run ON run."id" = job."runId"
      WHERE job."context" IS NOT NULL
        AND run."status" IN ('PENDING', 'RUNNING')
        AND (job."leaseExpiresAt" IS NULL OR job."leaseExpiresAt" <= clock_timestamp())
      ORDER BY job."queuedAt", run."id"
      FOR UPDATE OF run SKIP LOCKED LIMIT 1
    `;
    if (!run) return;

    const token = randomUUID();
    const recovered = run.status === "RUNNING";
    // Recheck the expiration in case a heartbeat raced the candidate SELECT.
    const [job] = await db.$queryRaw<{ recoveryCount: number }[]>`
      UPDATE "PlanningJob"
      SET "leaseToken" = ${token}::uuid, "lastHeartbeatAt" = clock_timestamp(),
          "leaseExpiresAt" = clock_timestamp() + ${leaseMs}::int * interval '1 millisecond',
          "recoveryCount" = "recoveryCount" + ${recovered ? 1 : 0}::int
      WHERE "runId" = ${run.id}::uuid AND ("leaseExpiresAt" IS NULL OR "leaseExpiresAt" <= clock_timestamp())
      RETURNING "recoveryCount"
    `;
    if (!job) return;

    if (recovered) {
      await appendEvent(db, run.id, "RUN_RECOVERED", { recoveryCount: job.recoveryCount });
      if (await closeInterruptedInvocations(db, run, "UNKNOWN")) return;
    } else {
      await applyRunChange(db, run, { status: "RUNNING" });
    }
    return { runId: run.id, token };
  });
}

export async function heartbeat(lease: PlanningLease, leaseMs: number) {
  return (await getDatabase().$executeRaw`
    UPDATE "PlanningJob" SET "lastHeartbeatAt" = clock_timestamp(),
        "leaseExpiresAt" = clock_timestamp() + ${leaseMs}::int * interval '1 millisecond'
    WHERE "runId" = ${lease.runId}::uuid AND "leaseToken" = ${lease.token}::uuid
        AND "leaseExpiresAt" > clock_timestamp()
  `) === 1;
}

export function withPlanningLease<T>(
  lease: PlanningLease,
  work: (db: Prisma.TransactionClient, run: LockedRun) => Promise<T>,
): Promise<T | undefined> {
  return getDatabase().$transaction(async (db) => {
    const [run] = await db.$queryRaw<LockedRun[]>`
      SELECT "id", "status"::text AS "status", "mode"::text AS "mode"
      FROM "AgentRun" WHERE "id" = ${lease.runId}::uuid AND "status" = 'RUNNING'
      FOR UPDATE
    `;
    if (!run) return;
    // Evaluate the lease after obtaining the run lock, using PostgreSQL time.
    const [valid] = await db.$queryRaw<{ valid: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM "PlanningJob" WHERE "runId" = ${lease.runId}::uuid
        AND "leaseToken" = ${lease.token}::uuid AND "leaseExpiresAt" > clock_timestamp()
      ) AS valid
    `;
    if (!valid?.valid) return;
    return work(db, run);
  });
}
