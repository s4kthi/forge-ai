import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env.ts";
import { ApiError } from "../errors/api-error.ts";
import { PrismaClient } from "../generated/prisma/client.ts";

const prisma = env.databaseUrl
  ? new PrismaClient({
      adapter: new PrismaPg({
        connectionString: env.databaseUrl,
        // The Prisma pg adapter expects timestamptz values in UTC.
        options: "-c timezone=UTC",
        connectionTimeoutMillis: 2000,
        query_timeout: 2000,
      }),
    })
  : undefined;

export function getDatabase(): PrismaClient {
  if (!prisma) throw new ApiError(503, "Database unavailable");
  return prisma;
}

export async function checkDatabase(): Promise<boolean> {
  if (!prisma) return false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma?.$disconnect();
}
