import { ApiError } from "../errors/api-error.ts";
import type { ProjectInput } from "../validation/demo.ts";
import { memberOf, requireOrganization } from "./access.ts";
import { getDatabase } from "./database.ts";

export function createProject(userId: string, organizationId: string, input: ProjectInput) {
  return getDatabase().$transaction(async (db) => {
    await requireOrganization(db, userId, organizationId, true);
    return db.project.create({ data: { ...input, organizationId } });
  });
}

export async function listProjects(userId: string, organizationId: string) {
  const organization = await getDatabase().organization.findUnique({
    where: { id: organizationId, ...memberOf(userId) },
    select: { projects: { orderBy: [{ createdAt: "asc" }, { id: "asc" }], include: {
      githubRepository: { select: { id: true, fullName: true, defaultBranch: true, private: true,
        installation: { select: { revokedAt: true } } } },
    } } },
  });
  if (!organization) throw new ApiError(404, "Organization not found");
  return organization.projects;
}
