import { demoOrganizationSlug } from "../config/demo.ts";
import { ApiError } from "../errors/api-error.ts";
import type { OrganizationInput } from "../validation/demo.ts";
import { getDatabase } from "./database.ts";

const fields = { id: true, name: true, slug: true, createdAt: true, updatedAt: true } as const;

export async function createOrganization(userId: string, input: OrganizationInput) {
  if (input.slug === demoOrganizationSlug) throw new ApiError(409, "A resource with that unique value already exists");
  const organization = await getDatabase().organization.create({
    data: { ...input, members: { create: { userId, role: "OWNER" } } },
    select: fields,
  });
  return { ...organization, role: "OWNER" as const };
}

export async function listOrganizations(userId: string) {
  const memberships = await getDatabase().organizationMember.findMany({
    where: { userId },
    select: { role: true, organization: { select: fields } },
    orderBy: [{ organization: { createdAt: "asc" } }, { organizationId: "asc" }],
  });
  return memberships.map(({ role, organization }) => ({ ...organization, role }));
}
