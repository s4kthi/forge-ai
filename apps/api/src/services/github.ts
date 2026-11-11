import { readFileSync } from "node:fs";
import { z } from "zod";
import { ApiError } from "../errors/api-error.ts";
import { requireOrganization } from "./access.ts";
import { getDatabase } from "./database.ts";
import { createGitHubClient, GitHubFailure } from "./github-client.ts";

const githubId = z.string().regex(/^[1-9][0-9]{0,15}$/).refine((value) => Number.isSafeInteger(Number(value)));
export const githubIdInput = githubId;
const bindingsSchema = z.record(githubId, z.uuid());
const metadata = { id: true, fullName: true, defaultBranch: true, private: true } as const;

function configured(installationId: string, organizationId: string) {
  let bindings;
  try { bindings = bindingsSchema.parse(JSON.parse(process.env.GITHUB_INSTALLATION_BINDINGS ?? "{}")); }
  catch { throw new GitHubFailure("configuration"); }
  if (bindings[installationId]?.toLowerCase() !== organizationId.toLowerCase()) throw new GitHubFailure("binding");
  try {
    const appId = githubId.parse(process.env.GITHUB_APP_ID);
    const key = readFileSync(z.string().min(1).parse(process.env.GITHUB_APP_PRIVATE_KEY_PATH), "utf8");
    return createGitHubClient(appId, key);
  } catch { throw new GitHubFailure("configuration"); }
}

function asApi(error: unknown): never {
  if (error instanceof GitHubFailure) {
    const status = { configuration: 503, binding: 403, revoked: 410, unavailable: 502, denied: 403, empty: 409 }[error.kind];
    throw new ApiError(status, error.message);
  }
  throw error;
}

async function withInstallation<T>(
  installation: { id: string; githubId: string; organizationId: string },
  read: (client: ReturnType<typeof createGitHubClient>) => Promise<T>,
) {
  const db = getDatabase();
  try {
    const result = await read(configured(installation.githubId, installation.organizationId));
    await db.gitHubInstallation.updateMany({ where: { id: installation.id, revokedAt: { not: null } }, data: { revokedAt: null } });
    return result;
  } catch (error) {
    if (error instanceof GitHubFailure && error.kind === "revoked") {
      await db.gitHubInstallation.updateMany({ where: { id: installation.id, revokedAt: null }, data: { revokedAt: new Date() } });
    }
    throw error;
  }
}

export async function connectInstallation(userId: string, organizationId: string, installationId: string) {
  const db = getDatabase();
  await requireOrganization(db, userId, organizationId, true);
  try {
    const account = await configured(installationId, organizationId).installation(installationId);
    return await db.gitHubInstallation.upsert({
      where: { githubId: installationId, organizationId }, update: { account, revokedAt: null },
      create: { githubId: installationId, organizationId, account },
      select: { id: true, account: true, revokedAt: true },
    });
  } catch (error) {
    if (error instanceof GitHubFailure && error.kind === "revoked") {
      await db.gitHubInstallation.updateMany({ where: { organizationId, githubId: installationId, revokedAt: null },
        data: { revokedAt: new Date() } });
    }
    asApi(error);
  }
}

export async function connections(userId: string, organizationId: string) {
  const db = getDatabase();
  await requireOrganization(db, userId, organizationId);
  return db.gitHubInstallation.findMany({
    where: { organizationId }, orderBy: { account: "asc" },
    select: { id: true, account: true, revokedAt: true, repositories: { select: metadata, orderBy: { fullName: "asc" } } },
  });
}

async function selectedInstallation(userId: string, organizationId: string, id: string) {
  const db = getDatabase();
  await requireOrganization(db, userId, organizationId, true);
  const installation = await db.gitHubInstallation.findUnique({ where: { id, organizationId } });
  if (!installation) throw new ApiError(404, "Installation not found.");
  return installation;
}

export async function catalog(userId: string, organizationId: string, id: string, page: number) {
  const installation = await selectedInstallation(userId, organizationId, id);
  try {
    const result = await withInstallation(installation, (client) => client.list(installation.githubId, page));
    return { hasMore: result.total_count > page * 30, repositories: result.repositories.map((repo) => ({
      githubId: String(repo.id), fullName: repo.full_name, defaultBranch: repo.default_branch ?? null, private: repo.private,
    })) };
  } catch (error) { asApi(error); }
}

export async function selectRepository(userId: string, organizationId: string, id: string, repositoryId: string) {
  const installation = await selectedInstallation(userId, organizationId, id);
  try {
    const repo = await withInstallation(installation, (client) => client.metadata(installation.githubId, repositoryId));
    const fields = { fullName: repo.full_name, defaultBranch: repo.default_branch ?? null, private: repo.private };
    return await getDatabase().gitHubRepository.upsert({
      where: { installationId_githubId: { installationId: id, githubId: repositoryId } },
      create: { organizationId, installationId: id, githubId: repositoryId, ...fields }, update: fields, select: metadata,
    });
  } catch (error) { asApi(error); }
}

export async function linkRepository(userId: string, organizationId: string, projectId: string, repositoryId: string | null) {
  const db = getDatabase();
  await requireOrganization(db, userId, organizationId, true);
  const project = await db.project.findUnique({ where: { id: projectId, organizationId }, select: { id: true } });
  if (!project) throw new ApiError(404, "Project not found.");
  if (repositoryId) {
    const repo = await db.gitHubRepository.findUnique({ where: { id: repositoryId, organizationId }, include: { installation: true } });
    if (!repo) throw new ApiError(404, "Repository not found.");
    try { await withInstallation(repo.installation, (client) => client.metadata(repo.installation.githubId, repo.githubId)); }
    catch (error) { asApi(error); }
  }
  return db.project.update({ where: { id: projectId, organizationId }, data: { githubRepositoryId: repositoryId },
    select: { id: true, githubRepository: { select: metadata } } });
}

export async function planningRepository(organizationId: string, repositoryId: string, taskId: string, task: string,
  signal: AbortSignal, capture: boolean) {
  const db = getDatabase();
  const link = await db.task.findUnique({ where: { id: taskId, project: { organizationId, githubRepositoryId: repositoryId } },
    select: { id: true } });
  if (!link) throw new GitHubFailure("denied");
  const repo = await db.gitHubRepository.findUnique({
    where: { id: repositoryId, organizationId }, include: { installation: true },
  });
  if (!repo) throw new GitHubFailure("denied");
  return withInstallation(repo.installation, async (client) => {
    if (capture) return client.evidence(repo.installation.githubId, repo.githubId, task, signal);
    await client.metadata(repo.installation.githubId, repo.githubId, signal);
    return undefined;
  });
}
