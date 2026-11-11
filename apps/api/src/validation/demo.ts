import { z } from "zod";
import { ApiError } from "../errors/api-error.ts";
import { ProjectStatus, TaskPriority, TaskStatus } from "../generated/prisma/enums.ts";

const uuid = z.uuid();
const name = z.string().trim().min(1).max(120);
const description = z.string().trim().max(5000).nullable().optional();

export const organizationParams = z.strictObject({ organizationId: uuid });
export const projectParams = z.strictObject({ projectId: uuid });
export const taskParams = z.strictObject({ taskId: uuid });

export const organizationInput = z.strictObject({
  name,
  slug: z.string().max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, digits, and hyphens."),
});

export const projectInput = z.strictObject({
  name,
  description,
  status: z.enum(ProjectStatus).optional(),
});

export const taskInput = z.strictObject({
  title: z.string().trim().min(1).max(200),
  description,
  status: z.enum(TaskStatus).optional(),
  priority: z.enum(TaskPriority).optional(),
  assigneeId: uuid.nullable().optional(),
});

export const taskPatch = taskInput.partial().refine(
  (body) => Object.keys(body).length > 0,
  "Provide at least one field to update.",
);

export function validate<Schema extends z.ZodType>(schema: Schema, input: unknown): z.output<Schema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ApiError(400, "Invalid request", result.error.issues.map(({ path, message }) => ({
      path: path.map(String),
      message,
    })));
  }
  return result.data;
}

export type OrganizationInput = z.output<typeof organizationInput>;
export type ProjectInput = z.output<typeof projectInput>;
export type TaskInput = z.output<typeof taskInput>;
export type TaskPatch = z.output<typeof taskPatch>;
