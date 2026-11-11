import { demoOrganizationSlug, demoOwnerEmail } from "../config/demo.ts";
import { env } from "../config/env.ts";
import { ApiError } from "../errors/api-error.ts";
import { findAccount } from "./auth.ts";
import { getDatabase } from "./database.ts";

export async function claimDemoOrganization(email: string): Promise<void> {
  const databaseUrl = env.databaseUrl && URL.parse(env.databaseUrl);
  if (env.nodeEnv !== "development" || !databaseUrl ||
    !["postgres:", "postgresql:"].includes(databaseUrl.protocol) ||
    !["127.0.0.1", "[::1]", "localhost"].includes(databaseUrl.hostname)) {
    throw new ApiError(403, "The demo claim requires development mode and a loopback PostgreSQL database.");
  }
  const account = await findAccount(email);
  if (!account?.passwordHash) throw new ApiError(400, "Register the intended account first.");

  await getDatabase().$transaction(async (db) => {
    const claimed = await db.organization.updateMany({
      where: {
        slug: demoOrganizationSlug,
        demoClaimedAt: null,
        members: {
          some: { role: "OWNER", user: { email: demoOwnerEmail, passwordHash: null } },
          none: { role: "OWNER", user: { passwordHash: { not: null } } },
        },
      },
      data: { demoClaimedAt: new Date() },
    });
    if (claimed.count !== 1) throw new ApiError(409, "The seeded demo organization is missing or has already been claimed.");
    const { id: organizationId } = await db.organization.findUniqueOrThrow({
      where: { slug: demoOrganizationSlug }, select: { id: true },
    });
    const membership = { organizationId, userId: account.id };
    await db.organizationMember.upsert({
      where: { organizationId_userId: membership },
      create: { ...membership, role: "OWNER" },
      update: { role: "OWNER" },
    });
  });
}
