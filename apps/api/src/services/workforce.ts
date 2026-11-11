import { z } from "zod";
import { agents } from "../config/agents.ts";
import { ApiError } from "../errors/api-error.ts";
import type { Prisma } from "../generated/prisma/client.ts";
import { TaskPriority, WorkStatus, WorkforceRole } from "../generated/prisma/enums.ts";
import type { WorkflowEventKind } from "../generated/prisma/enums.ts";
import { requireOrganization } from "./access.ts";
import { getDatabase } from "./database.ts";

const text = (max: number) => z.string().trim().min(1).max(max);
export const workerInput = z.strictObject({
  name: text(100), role: z.enum(WorkforceRole), enabled: z.boolean().default(true),
  configuration: z.strictObject({ specialization: text(200).optional(), maxParallelAssignments: z.number().int().min(1).max(20).optional() }).default({}),
});
export const workerPatch = workerInput.partial().refine((body) => Object.keys(body).length > 0);
export const ticketInput = z.strictObject({ requirement: text(4000), priority: z.enum(TaskPriority).default("MEDIUM") });
export const ticketPatch = z.strictObject({ status: z.enum(WorkStatus), priority: z.enum(TaskPriority).optional() });
export const assignmentInput = z.strictObject({ workerId: z.uuid(), taskId: z.uuid().optional() });
export const statusInput = z.strictObject({
  status: z.enum(WorkStatus), blockedReason: text(500).optional(), error: text(500).optional(),
}).refine((data) => (data.status === "BLOCKED") === !!data.blockedReason && (data.status === "FAILED") === !!data.error,
  "Provide a reason only for blocked work or an error only for failed work.");
export const edgeInput = z.strictObject({ fromId: z.uuid(), toId: z.uuid(), kind: z.enum(["DEPENDENCY", "HANDOFF"]) });

type Scope = { organizationId: string; projectId: string };
type TicketScope = Scope & { ticketId: string };

export async function listWorkers(userId: string, organizationId: string) {
  const db = getDatabase();
  await requireOrganization(db, userId, organizationId);
  return db.agentWorker.findMany({ where: { organizationId }, orderBy: [{ name: "asc" }, { id: "asc" }], take: 201 });
}
export async function saveWorker(userId: string, organizationId: string, input: z.output<typeof workerInput>) {
  const db = getDatabase();
  await requireOrganization(db, userId, organizationId, true);
  return db.agentWorker.create({ data: { ...input, organizationId } });
}
export async function updateWorker(userId: string, organizationId: string, workerId: string, input: z.output<typeof workerPatch>) {
  const db = getDatabase();
  await requireOrganization(db, userId, organizationId, true);
  return db.agentWorker.update({ where: { id: workerId, organizationId }, data: input });
}

async function projectAccess(db: Prisma.TransactionClient, actor: string, scope: Scope, write = false) {
  await requireOrganization(db, actor, scope.organizationId, write);
  if (write) {
    const rows = await db.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "Project" WHERE "id" = ${scope.projectId}::uuid
      AND "organizationId" = ${scope.organizationId}::uuid FOR UPDATE
    `;
    if (!rows.length) throw new ApiError(404, "Project not found.");
  } else if (!(await db.project.findUnique({ where: { id: scope.projectId, organizationId: scope.organizationId }, select: { id: true } }))) {
    throw new ApiError(404, "Project not found.");
  }
}
async function withTicket<T>(actor: string, scope: TicketScope, work: (db: Prisma.TransactionClient) => Promise<T>) {
  return getDatabase().$transaction(async (db) => {
    await projectAccess(db, actor, scope, true);
    if (!(await db.ticket.findUnique({ where: { id: scope.ticketId, projectId: scope.projectId }, select: { id: true } }))) {
      throw new ApiError(404, "Ticket not found.");
    }
    return work(db);
  });
}

function event(db: Prisma.TransactionClient, ticketId: string, actorId: string, kind: WorkflowEventKind,
  payload: Prisma.InputJsonObject, assignmentId?: string) {
  return db.workflowEvent.create({ data: { ticketId, actorId, kind, payload, assignmentId } });
}

export function createTicket(actor: string, scope: Scope, input: z.output<typeof ticketInput>) {
  return getDatabase().$transaction(async (db) => {
    await projectAccess(db, actor, scope, true);
    if (await db.ticket.count({ where: { projectId: scope.projectId } }) >= 100) throw new ApiError(409, "Project ticket limit reached.");
    const ticket = await db.ticket.create({ data: { ...input, projectId: scope.projectId, ownerId: actor } });
    await event(db, ticket.id, actor, "TICKET_CREATED", { status: ticket.status, priority: ticket.priority });
    return ticket;
  });
}
export function updateTicket(actor: string, scope: TicketScope, input: z.output<typeof ticketPatch>) {
  return withTicket(actor, scope, async (db) => {
    const ticket = await db.ticket.update({ where: { id: scope.ticketId }, data: input });
    await event(db, ticket.id, actor, "TICKET_UPDATED", { status: ticket.status, priority: ticket.priority });
    return ticket;
  });
}
export function assign(actor: string, scope: TicketScope, input: z.output<typeof assignmentInput>) {
  return withTicket(actor, scope, async (db) => {
    const worker = await db.agentWorker.findUnique({ where: { id: input.workerId, organizationId: scope.organizationId, enabled: true } });
    if (!worker) throw new ApiError(404, "Enabled worker not found.");
    if (input.taskId && !(await db.task.findUnique({ where: { id: input.taskId, projectId: scope.projectId } }))) {
      throw new ApiError(404, "Task not found.");
    }
    if (await db.workAssignment.count({ where: { ticketId: scope.ticketId } }) >= 50) throw new ApiError(409, "Ticket assignment limit reached.");
    const assignment = await db.workAssignment.create({ data: { ...input, ticketId: scope.ticketId } });
    await event(db, scope.ticketId, actor, "ASSIGNED", { workerId: worker.id, status: assignment.status }, assignment.id);
    return assignment;
  });
}

const transitions: Record<WorkStatus, readonly WorkStatus[]> = {
  TODO: ["RUNNING", "BLOCKED", "CANCELLED"],
  RUNNING: ["BLOCKED", "COMPLETED", "FAILED", "CANCELLED"],
  BLOCKED: ["RUNNING", "FAILED", "CANCELLED"], COMPLETED: [], FAILED: [], CANCELLED: [],
};
export function changeAssignment(actor: string, scope: TicketScope, assignmentId: string, input: z.output<typeof statusInput>) {
  return withTicket(actor, scope, async (db) => {
    const current = await db.workAssignment.findUnique({ where: { id: assignmentId, ticketId: scope.ticketId },
      include: { worker: { select: { enabled: true } } } });
    if (!current) throw new ApiError(404, "Assignment not found.");
    if (!transitions[current.status].includes(input.status)) throw new ApiError(409, "Invalid assignment status transition.");
    if (input.status === "RUNNING" && (!current.worker.enabled || await db.workflowDependency.count({
      where: { ticketId: scope.ticketId, toId: assignmentId, from: { status: { not: "COMPLETED" } } },
    }))) throw new ApiError(409, "The worker is disabled or a dependency is incomplete.");
    const next = await db.workAssignment.update({
      where: { id: assignmentId }, data: { status: input.status, blockedReason: input.blockedReason ?? null, error: input.error ?? null,
        startedAt: !current.startedAt && input.status === "RUNNING" ? new Date() : undefined,
        completedAt: transitions[input.status].length === 0 ? new Date() : undefined },
    });
    await event(db, scope.ticketId, actor, "STATUS_CHANGED", { previous: current.status, status: next.status,
      blockedReason: next.blockedReason, error: next.error }, assignmentId);
    return next;
  });
}
export function addEdge(actor: string, scope: TicketScope, input: z.output<typeof edgeInput>) {
  return withTicket(actor, scope, async (db) => {
    const { fromId, toId, kind } = input;
    if (fromId === toId) throw new ApiError(400, "Choose two different assignments.");
    const nodes = await db.workAssignment.findMany({ where: { ticketId: scope.ticketId, id: { in: [fromId, toId] } } });
    if (nodes.length !== 2) throw new ApiError(404, "Assignment not found.");
    const from = nodes.find(({ id }) => id === fromId);
    const to = nodes.find(({ id }) => id === toId);
    if (kind === "HANDOFF") {
      if (from?.status !== "COMPLETED" || !to || !transitions[to.status].length) throw new ApiError(409, "A handoff requires completed source work and an active destination.");
      if (await db.workflowEvent.findFirst({ where: { ticketId: scope.ticketId, kind: "HANDOFF", payload: { equals: { fromId, toId } } } })) {
        throw new ApiError(409, "This handoff is already recorded.");
      }
    } else {
      if (to?.status !== "TODO" && to?.status !== "BLOCKED") throw new ApiError(409, "Add dependencies before work starts.");
      const links = await db.workflowDependency.findMany({ where: { ticketId: scope.ticketId } });
      const pending = [toId];
      const visited = new Set<string>();
      while (pending.length) {
        const node = pending.pop()!;
        if (node === fromId) throw new ApiError(409, "This dependency would create a cycle.");
        if (visited.has(node)) continue;
        visited.add(node);
        pending.push(...links.filter((link) => link.fromId === node).map((link) => link.toId));
      }
      await db.workflowDependency.create({ data: { ticketId: scope.ticketId, fromId, toId } });
    }
    return event(db, scope.ticketId, actor, kind === "HANDOFF" ? "HANDOFF" : "DEPENDENCY_ADDED", { fromId, toId }, fromId);
  });
}

const legacyRoles = { ALEX: "PM", MARCUS: "ARCHITECT", DEVON: "DEVELOPER", TESSA: "QA", ELENA: "REVIEWER" } as const;
const progress = (status: string) => ({ completed: status === "COMPLETED" ? 1 : 0, total: 1 });
interface GraphNode {
  id: string;
  source: "ASSIGNMENT" | "PLANNING";
  name: string;
  role: WorkforceRole;
  ticketId: string | null;
  task: { id: string; title: string } | null;
  status: string;
  startedAt: Date | null;
  completedAt: Date | null;
  blockedReason: string | null;
  error: string | null;
  progress: { completed: number; total: number };
}

export async function graph(actor: string, scope: Scope, ticketId?: string) {
  const db = getDatabase();
  await projectAccess(db, actor, scope);
  const tickets = await db.ticket.findMany({ where: { projectId: scope.projectId },
    select: { id: true, requirement: true, status: true, priority: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 100 });
  if (ticketId && !tickets.some(({ id }) => id === ticketId)) throw new ApiError(404, "Ticket not found.");
  const selected = ticketId ?? tickets[0]?.id;
  const ticket = selected ? await db.ticket.findUnique({ where: { id: selected, projectId: scope.projectId }, include: {
    owner: { select: { name: true } },
    assignments: { orderBy: [{ createdAt: "asc" }, { id: "asc" }], include: {
      worker: { select: { name: true, role: true } }, task: { select: { id: true, title: true } }, outgoing: true,
    } },
    events: { orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 100 },
  } }) : null;
  const latest = await db.agentRun.findFirst({
    where: { isFixture: false, mode: { not: null }, task: { projectId: scope.projectId } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: { task: { select: { id: true, title: true } }, steps: { orderBy: { sequence: "asc" } },
      messages: { where: { messageType: "HANDOFF" } } },
  });
  const nodes: GraphNode[] = (ticket?.assignments ?? []).map((node) => ({
    id: node.id, source: "ASSIGNMENT", name: node.worker.name, role: node.worker.role, ticketId: node.ticketId, task: node.task,
    status: node.status, startedAt: node.startedAt, completedAt: node.completedAt,
    blockedReason: node.blockedReason, error: node.error, progress: progress(node.status),
  }));
  const edges = (ticket?.assignments ?? []).flatMap((node) => node.outgoing.map(({ fromId, toId }) => ({
    id: fromId + ":" + toId, fromId, toId, kind: "DEPENDENCY",
  })));
  // The event list is bounded independently of the graph's persisted handoffs.
  if (ticket) {
    const handoffs = await db.workflowEvent.findMany({ where: { ticketId: ticket.id, kind: "HANDOFF" },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 2500 });
    for (const handoff of handoffs) {
      const data = edgeInput.pick({ fromId: true, toId: true }).safeParse(handoff.payload);
      if (data.success) edges.push({ id: handoff.id, ...data.data, kind: "HANDOFF" });
    }
  }
  if (latest) for (const step of latest.steps) nodes.push({
    id: step.id, source: "PLANNING", name: agents.find(({ id }) => id === step.agentRole)?.name ?? step.agentRole,
    role: legacyRoles[step.agentRole], ticketId: null, task: latest.task,
    status: step.status, startedAt: step.startedAt, completedAt: step.completedAt, blockedReason: null,
    error: step.errorMessage, progress: progress(step.status),
  });
  if (latest) for (const message of latest.messages) {
    const from = latest.steps.find(({ id }) => id === message.stepId);
    const to = latest.steps.find(({ agentRole, sequence }) => agentRole === message.toAgent && sequence > (from?.sequence ?? 0));
    if (from && to) edges.push({ id: message.id, fromId: from.id, toId: to.id, kind: "HANDOFF" });
  }
  return { tickets, ticket: ticket && {
    id: ticket.id, requirement: ticket.requirement, status: ticket.status, priority: ticket.priority, owner: ticket.owner.name,
    events: ticket.events.map(({ id, kind, payload, createdAt }) => ({ id, kind, payload, createdAt })),
    blockers: ticket.assignments.filter(({ status }) => status === "BLOCKED").map(({ id, blockedReason }) => ({ id, reason: blockedReason })),
    progress: { completed: ticket.assignments.filter(({ status }) => status === "COMPLETED").length, total: ticket.assignments.length },
  }, nodes, edges, planningRun: latest && { id: latest.id, status: latest.status } };
}
