import { hash, verify } from "@node-rs/argon2";
import type { Options } from "@node-rs/argon2";
import { createHash, randomBytes } from "node:crypto";
import { demoOwnerEmail } from "../config/demo.ts";
import { ApiError } from "../errors/api-error.ts";
import { Prisma } from "../generated/prisma/client.ts";
import type { LoginInput, RegisterInput } from "../validation/auth.ts";
import { getDatabase } from "./database.ts";

// Argon2id is algorithm 2. The binding declares it as an ambient const enum.
const passwordOptions = { algorithm: 2, memoryCost: 19 * 1024, timeCost: 2, parallelism: 1 } satisfies Options;
const publicFields = { id: true, name: true, email: true } as const;
export const sessionLifetimeMs = 7 * 24 * 60 * 60 * 1000;
const invalidLogin = () => new ApiError(401, "Invalid email or password.");
let dummyHash: Promise<string> | undefined;

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export function findAccount(email: string) {
  return getDatabase().$queryRaw<{ id: string; passwordHash: string | null }[]>`
    SELECT "id", "passwordHash" FROM "User" WHERE lower(btrim("email")) = ${email}
  `.then(([user]) => user);
}

export async function register(input: RegisterInput): Promise<void> {
  const passwordHash = await hash(input.password, passwordOptions);
  if (input.email === demoOwnerEmail) return;
  // Duplicate and new emails produce the same public response. Legacy users are never claimed here.
  try {
    await getDatabase().user.create({
      data: { email: input.email, name: input.name, passwordHash },
      select: { id: true },
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
  }
}

export async function login(input: LoginInput, previousToken?: string): Promise<string> {
  // Both paths wait for the same initialization and perform one Argon2 verification.
  const fallback = await (dummyHash ??= hash(randomBytes(32), passwordOptions));
  const account = await findAccount(input.email);
  const matches = await verify(account?.passwordHash ?? fallback, input.password);
  if (!account?.passwordHash || !matches) throw invalidLogin();

  const token = randomBytes(32).toString("base64url");
  await getDatabase().$transaction(async (db) => {
    if (previousToken) await db.session.updateMany({
      where: { tokenHash: tokenHash(previousToken), revokedAt: null }, data: { revokedAt: new Date() },
    });
    await db.session.create({
      data: { tokenHash: tokenHash(token), userId: account.id, expiresAt: new Date(Date.now() + sessionLifetimeMs) },
      select: { id: true },
    });
  });
  return token;
}

export async function getSessionUser(token: string) {
  const session = await getDatabase().session.findUnique({
    where: { tokenHash: tokenHash(token), revokedAt: null, expiresAt: { gt: new Date() } },
    select: { user: { select: publicFields } },
  });
  return session?.user;
}

export async function revokeSession(token: string): Promise<void> {
  await getDatabase().session.updateMany({
    where: { tokenHash: tokenHash(token), revokedAt: null }, data: { revokedAt: new Date() },
  });
}
