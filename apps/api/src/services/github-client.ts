import { createSign } from "node:crypto";
import { z } from "zod";
import { redactKnownSecrets } from "../llm/alex-prompt.ts";
import { boundEvidence, describeEvidenceFile, isSafeEvidencePath, maxEvidenceFileBytes, prioritizeEvidence } from "./repository-evidence.ts";
import type { RepositoryEvidence } from "./repository-evidence.ts";

export class GitHubFailure extends Error {
  readonly kind: "configuration" | "binding" | "revoked" | "unavailable" | "denied" | "empty";
  constructor(kind: GitHubFailure["kind"]) {
    super({ configuration: "GitHub App is not configured.", revoked: "GitHub installation was revoked or suspended.",
      binding: "This installation has not been approved for this Forge organization.",
      unavailable: "GitHub could not complete the read.", denied: "GitHub no longer grants access to this repository.",
      empty: "The repository has no commits." }[kind]);
    this.kind = kind;
  }
}

const id = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const repository = z.object({
  id, full_name: z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/).max(255)
    .refine((name) => name.split("/").every((part) => part !== "." && part !== "..")),
  default_branch: z.string().max(255).nullable().optional(), private: z.boolean(),
});
const sha = z.string().regex(/^[a-f0-9]{40}$/);
const treeSchema = z.object({ truncated: z.boolean(), tree: z.array(z.object({
  path: z.string().max(1000), mode: z.string(), sha, size: z.number().int().nonnegative().optional(),
})) });
const tokenSchema = z.object({ token: z.string().min(1).max(4096), expires_at: z.iso.datetime({ offset: true }) });
const installationSchema = z.object({
  id, account: z.object({ login: z.string().max(100) }), suspended_at: z.string().nullable(),
  permissions: z.object({ contents: z.literal("read"), metadata: z.literal("read") }),
});

async function boundedJson(response: Response): Promise<unknown> {
  const reader = response.body?.getReader();
  if (!reader) throw new GitHubFailure("unavailable");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 2_000_000) throw new GitHubFailure("unavailable");
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } finally {
    await reader.cancel().catch(() => {});
  }
}

export function createGitHubClient(appId: string, privateKey: string, transport = fetch) {
  function jwt() {
    try {
      const now = Math.floor(Date.now() / 1000);
      const enc = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
      const body = enc({ alg: "RS256", typ: "JWT" }) + "." + enc({ iss: appId, iat: now - 30, exp: now + 480 });
      return body + "." + createSign("RSA-SHA256").update(body).sign(privateKey, "base64url");
    } catch { throw new GitHubFailure("configuration"); }
  }

  async function request<T>(path: string, credential: string, schema: z.ZodType<T>, signal?: AbortSignal, body?: object): Promise<T> {
    try {
      const response = await transport("https://api.github.com" + path, {
        method: body ? "POST" : "GET", redirect: "error",
        headers: { Authorization: "Bearer " + credential, Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2026-03-10", "User-Agent": "FORGE-AI", ...(body && { "Content-Type": "application/json" }) },
        signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(7000)]) : AbortSignal.timeout(7000),
        ...(body && { body: JSON.stringify(body) }),
      });
      if (!response.ok) {
        await response.body?.cancel().catch(() => {});
        if (response.status === 429 || (response.status === 403 &&
            (response.headers.get("x-ratelimit-remaining") === "0" || response.headers.has("retry-after")))) {
          throw new GitHubFailure("unavailable");
        }
        throw new ResponseStatus(response.status);
      }
      const result = schema.safeParse(await boundedJson(response));
      if (!result.success) throw new GitHubFailure("unavailable");
      return result.data;
    } catch (error) {
      if (error instanceof GitHubFailure || error instanceof ResponseStatus) throw error;
      throw new GitHubFailure("unavailable");
    }
  }

  async function installation(installationId: string, signal?: AbortSignal) {
    try {
      const record = await request(`/app/installations/${installationId}`, jwt(), installationSchema, signal);
      if (String(record.id) !== installationId || record.suspended_at) throw new GitHubFailure("revoked");
      return record.account.login;
    } catch (error) {
      if (error instanceof ResponseStatus && error.status === 404) throw new GitHubFailure("revoked");
      if (error instanceof GitHubFailure) throw error;
      throw new GitHubFailure("unavailable");
    }
  }

  async function withToken<T>(installationId: string, repositoryId: string | undefined, signal: AbortSignal | undefined,
    read: (token: string) => Promise<T>): Promise<T> {
    await installation(installationId, signal);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const credentials = await request(`/app/installations/${installationId}/access_tokens`, jwt(), tokenSchema, signal, {
          permissions: { contents: "read", metadata: "read" }, ...(repositoryId && { repository_ids: [Number(repositoryId)] }),
        });
        if (Date.parse(credentials.expires_at) <= Date.now() + 5000) continue;
        return await read(credentials.token);
      } catch (error) {
        if (!(error instanceof ResponseStatus)) throw error;
        if (error.status === 401 && attempt === 0) continue;
        if (error.status === 409) throw new GitHubFailure("empty");
        if (error.status === 404 || error.status === 422 || error.status === 403) {
          await installation(installationId, signal);
          throw new GitHubFailure("denied");
        }
        throw new GitHubFailure("unavailable");
      }
    }
    throw new GitHubFailure("unavailable");
  }

  return {
    installation,
    list: (installationId: string, page = 1, signal?: AbortSignal) => withToken(installationId, undefined, signal,
      (token) => request(`/installation/repositories?per_page=30&page=${page}`, token,
        z.object({ total_count: z.number().int(), repositories: z.array(repository).max(30) }), signal)),
    metadata: (installationId: string, repositoryId: string, signal?: AbortSignal) =>
      withToken(installationId, repositoryId, signal, (token) => readMetadata(token, repositoryId, signal)),
    evidence: (installationId: string, repositoryId: string, task: string, signal?: AbortSignal) =>
      withToken(installationId, repositoryId, signal, async (token) => {
        const repo = await readMetadata(token, repositoryId, signal);
        const root = "/repos/" + repo.full_name;
        if (!repo.default_branch) return emptyEvidence(repo);
        let commits;
        try {
          commits = await request(root + "/commits?per_page=1&sha=" + encodeURIComponent(repo.default_branch), token,
            z.array(z.object({ sha, commit: z.object({ tree: z.object({ sha }) }) })).max(1), signal);
        } catch (error) {
          if (error instanceof ResponseStatus && error.status === 409) return emptyEvidence(repo);
          throw error;
        }
        if (!commits[0]) return emptyEvidence(repo);
        const tree = await request(root + "/git/trees/" + commits[0].commit.tree.sha + "?recursive=1", token, treeSchema, signal);
        const files = tree.tree.filter((entry) => entry.mode === "100644" || entry.mode === "100755")
          .filter(({ path }) => isSafeEvidencePath(path));
        const { selected, paths } = prioritizeEvidence(files, task);
        const evidence = await Promise.all(selected.map(async ({ path, sha: blobSha }) => {
          const blob = await request(root + "/git/blobs/" + blobSha, token,
            z.object({ sha, encoding: z.literal("base64"), content: z.string().max(100_000),
              size: z.number().int().nonnegative().max(maxEvidenceFileBytes) }), signal);
          const content = Buffer.from(blob.content, "base64");
          if (blob.sha !== blobSha || content.length !== blob.size) throw new GitHubFailure("unavailable");
          return describeEvidenceFile(path, blob.size, content.toString("utf8"), task);
        }));
        return boundEvidence({ ...evidenceIdentity(repo), commit: commits[0].sha, empty: false, formatVersion: 2,
          treeTruncated: tree.truncated || paths.length < files.length, paths, files: evidence, coverage: coverage(tree.truncated) });
      }),
  };

  async function readMetadata(token: string, repositoryId: string, signal?: AbortSignal) {
    const result = await request("/installation/repositories?per_page=1", token,
      z.object({ total_count: z.number().int(), repositories: z.array(repository).max(1) }), signal);
    const repo = result.repositories[0];
    if (result.total_count !== 1 || !repo || String(repo.id) !== repositoryId) throw new GitHubFailure("denied");
    return repo;
  }
}

class ResponseStatus extends Error {
  readonly status: number;
  constructor(status: number) {
    super("GitHub request failed");
    this.status = status;
  }
}

function coverage(upstreamTreeTruncated: boolean) {
  return { upstreamTreeTruncated, schemaDeclarationsObserved: false, routeDeclarationsObserved: false,
    serviceDeclarationsObserved: false, budgetLimited: false };
}
function emptyEvidence(repo: z.infer<typeof repository>): RepositoryEvidence {
  return { ...evidenceIdentity(repo), commit: null, empty: true, formatVersion: 2,
    treeTruncated: false, paths: [], files: [], coverage: coverage(false) };
}
function evidenceIdentity(repo: z.infer<typeof repository>) {
  const clean = (value: string) => redactKnownSecrets(value).replace(/(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]+/g, "[REDACTED]");
  return { repository: clean(repo.full_name), defaultBranch: repo.default_branch ? clean(repo.default_branch) : null };
}
