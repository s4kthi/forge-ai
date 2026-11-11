import { ApiError } from "../errors/api-error.ts";
import type { Prisma } from "../generated/prisma/client.ts";
import type { TaskInput, TaskPatch } from "../validation/demo.ts";
import { memberOf } from "./access.ts";
import { getDatabase } from "./database.ts";

async function requireAssigneeMembership(
  database: Prisma.TransactionClient,
  organizationId: string,
  userId: string,
): Promise<void> {
  const membership = await database.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
    select: { id: true },
  });
  if (!membership) throw new ApiError(422, "Assignee must be a member of the project's organization");
}

export function createTask(userId: string, projectId: string, input: TaskInput) {
  return getDatabase().$transaction(async (database) => {
    const project = await database.project.findUnique({
      where: { id: projectId, organization: memberOf(userId) },
      select: { organizationId: true },
    });
    if (!project) throw new ApiError(404, "Project not found");
    if (input.assigneeId) {
      await requireAssigneeMembership(database, project.organizationId, input.assigneeId);
    }

    return database.task.create({ data: { ...input, projectId } });
  });
}

export async function listTasks(userId: string, projectId: string) {
  const project = await getDatabase().project.findUnique({
    where: { id: projectId, organization: memberOf(userId) },
    select: { tasks: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] } },
  });
  if (!project) throw new ApiError(404, "Project not found");
  return project.tasks;
}

export function updateTask(userId: string, taskId: string, input: TaskPatch) {
  return getDatabase().$transaction(async (database) => {
    const where = { id: taskId, project: { organization: memberOf(userId) } };
    if (input.assigneeId) {
      const task = await database.task.findUnique({
        where,
        select: { project: { select: { organizationId: true } } },
      });
      if (!task) throw new ApiError(404, "Task not found");
      await requireAssigneeMembership(database, task.project.organizationId, input.assigneeId);
    }

    return database.task.update({ where, data: input });
  });
}
