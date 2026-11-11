import { ApiError } from "../errors/api-error.ts";
import type { Prisma } from "../generated/prisma/client.ts";

export function memberOf(userId: string) {
  return { members: { some: { userId } } };
}

export async function requireOrganization(
  database: Prisma.TransactionClient, userId: string, organizationId: string, elevated = false,
) {
  const membership = await database.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
    select: { role: true },
  });
  if (!membership) throw new ApiError(404, "Organization not found");
  if (elevated && membership.role === "MEMBER") throw new ApiError(403, "An organization owner or admin is required.");
  return membership.role;
}
