import { z } from "zod";
import { redactKnownSecrets } from "../llm/alex-prompt.ts";

export const repositoryEvidenceBudget = 9500;
export const maxEvidenceFileBytes = 64 * 1024;
const maxFiles = 7;
const maxPaths = 48;
const identifier = "[A-Za-z][A-Za-z0-9_]{0,63}";
const credentialPattern = /(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]+/;

const evidenceFile = z.object({
  path: z.string().max(160),
  bytes: z.number().int().nonnegative(),
  kind: z.enum(["configuration", "source"]),
  configurationKeys: z.array(z.string().max(32)).max(8),
  declarations: z.array(z.string().max(220)).max(12).optional(),
});
export const evidenceSchema = z.object({
  repository: z.string().max(255), defaultBranch: z.string().max(255).nullable(),
  commit: z.string().regex(/^[a-f0-9]{40}$/).nullable(), empty: z.boolean(), treeTruncated: z.boolean(),
  paths: z.array(z.string().max(160)).max(60),
  files: z.array(evidenceFile).max(maxFiles),
  formatVersion: z.literal(2).optional(),
  coverage: z.object({
    upstreamTreeTruncated: z.boolean(),
    schemaDeclarationsObserved: z.boolean(),
    routeDeclarationsObserved: z.boolean(),
    serviceDeclarationsObserved: z.boolean(),
    budgetLimited: z.boolean(),
  }).optional(),
});
export type RepositoryEvidence = z.infer<typeof evidenceSchema>;
type EvidenceFile = z.infer<typeof evidenceFile>;
type Entry = { path: string; sha: string; size?: number };

export function isSafeEvidencePath(path: string) {
  return path.length <= 160 && redactKnownSecrets(path) === path &&
    !credentialPattern.test(path) && /^[A-Za-z0-9_./@-]+$/.test(path) &&
    !path.split("/").some((part) => !part || part.startsWith(".") ||
      /^(?:node_modules|vendor|dist|build)$|secret|credential|private.?key|token|password|\.(?:pem|key|p12|pfx)$/i.test(part));
}

function configPath(path: string) {
  return /(^|\/)(package\.json|tsconfig\.json|pyproject\.toml|Cargo\.toml|go\.mod|Dockerfile|compose\.ya?ml|README\.md)$/i.test(path);
}
function category(path: string) {
  if (/\.prisma$/i.test(path)) return "schema";
  if (/(^|\/)(routes?|controllers?)\//i.test(path) || /(^|\/)routes?\.[cm]?[jt]s$/i.test(path)) return "route";
  if (/(^|\/)(services?|repositories?)\//i.test(path)) return "service";
  if (/(^|\/)migrations\/.*\.sql$/i.test(path)) return "migration";
  return "general";
}
function terms(text: string) {
  return text.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase()
    .match(/[a-z][a-z0-9]{2,}/g)?.map((word) => word.replace(/(?:s|ing)$/, "")) ?? [];
}

export function prioritizeEvidence<T extends Entry>(entries: T[], task: string) {
  const keywords = new Set(terms(task).slice(0, 100));
  const workforce = ["ticket", "assignment", "worker", "workflow", "handoff", "history"].some((word) => keywords.has(word));
  const backend = workforce || ["database", "backend", "api", "prisma", "schema", "persistence"].some((word) => keywords.has(word));
  function score(path: string) {
    const kind = category(path);
    const matchingTerms = new Set(terms(path).filter((word) => keywords.has(word))).size;
    const affinity = workforce && /workforce|ticket|assignment|workflow|run-workflow/i.test(path) ? 12 : 0;
    const roleWeight = backend ? { schema: 24, route: 10, service: 10, migration: 7, general: 0 }[kind] : 0;
    return matchingTerms * 5 + affinity + roleWeight + (configPath(path) ? 10 : 0);
  }
  const ranked = [...entries].sort((a, b) => score(b.path) - score(a.path) || a.path.localeCompare(b.path));
  const readable = ranked.filter(({ path, size }) => size !== undefined && size <= maxEvidenceFileBytes &&
    (configPath(path) || /\.(?:prisma|ts|tsx|js|jsx|py|go|rs|java|cs)$/i.test(path) || category(path) === "migration"));
  const selected = new Set<T>();
  if (backend) {
    for (const kind of ["schema", "route", "service", "migration"]) {
      const match = readable.find(({ path }) => category(path) === kind);
      if (match) selected.add(match);
    }
    const mount = readable.find(({ path }) => /(^|\/)routes\/demo\.ts$/.test(path));
    if (mount) selected.add(mount);
  }
  for (const entry of readable) {
    if (selected.size >= maxFiles) break;
    selected.add(entry);
  }
  return { paths: ranked.slice(0, maxPaths).map(({ path }) => path), selected: [...selected], backend };
}

function prismaDeclarations(content: string, task: string) {
  const keywords = new Set(terms(task).slice(0, 100));
  const blocks = [...content.matchAll(new RegExp("^\\s*(model|enum) +(" + identifier + ") *\\{([^}]*)^\\s*\\}", "gm"))];
  function score(name: string) {
    const relevant = terms(name).filter((word) => keywords.has(word)).length;
    const related = /^(Ticket|WorkAssignment|WorkflowDependency|WorkflowEvent|AgentWorker|WorkStatus|WorkflowEventKind|AgentRun|AgentStep|RunEvent)$/.test(name);
    return relevant * 4 + (related ? 3 : 0);
  }
  const field = new RegExp("^\\s*(" + identifier + ") +(" + identifier + "(?:\\[\\]|\\?)?)(?:\\s|$)");
  return blocks.sort((a, b) => score(b[2]) - score(a[2])).slice(0, 10).map(([, kind, name, body]) => {
    const items = body.split(/\r?\n/).flatMap((line) => {
      if (kind === "model") {
        const match = field.exec(line);
        return match ? [match[1] + ": " + match[2]] : [];
      }
      const value = line.trim().split(/\s+/)[0];
      return /^[A-Z][A-Z0-9_]{0,47}$/.test(value) ? [value] : [];
    });
    let declaration = kind + " " + name + " —";
    for (const [index, item] of items.slice(0, 16).entries()) {
      const next = declaration + (index === 0 ? " " : ", ") + item;
      if (next.length > 220) break;
      declaration = next;
    }
    return declaration;
  });
}

export function describeEvidenceFile(path: string, bytes: number, content: string, task: string): EvidenceFile {
  const kind = configPath(path) || category(path) === "schema" ? "configuration" : "source";
  const configurationKeys: string[] = [];
  if (/(^|\/)(package|tsconfig)\.json$/i.test(path)) {
    try {
      const parsed = JSON.parse(content);
      for (const name of ["scripts", "dependencies", "devDependencies", "compilerOptions", "references", "workspaces", "extends"]) {
        if (parsed && typeof parsed === "object" && Object.hasOwn(parsed, name)) configurationKeys.push(name);
      }
    } catch { /* Nonstandard JSON still provides observed path and size evidence. */ }
  }

  const source = content.replace(/\/\*[\s\S]*?\*\//g, "");
  const declarations: string[] = [];
  switch (category(path)) {
    case "schema":
      declarations.push(...prismaDeclarations(source, task));
      break;
    case "route":
      for (const [, method, route] of source.matchAll(/^\s*(?:router|\w+Router)\.(get|post|patch|put|delete|use)\(\s*["'](\/[A-Za-z0-9_:/.-]{0,135})["']/gm)) {
        if (isSafeRoute(route)) declarations.push(method === "use" ? "Mount " + route : method.toUpperCase() + " " + route);
      }
      break;
    case "service": {
      const operations = new Set<string>();
      for (const [, model, operation] of source.matchAll(/\b(?:db|tx|getDatabase\(\))\.([A-Za-z][A-Za-z0-9_]{0,47})\.(create|update|upsert|findUnique|findFirst|findMany|count|deleteMany)\s*\(/g)) {
        operations.add(model + "." + operation);
      }
      if (operations.size) declarations.push("Prisma calls: " + [...operations].slice(0, 10).join(", ").slice(0, 200));
      for (const [, name] of source.matchAll(/^export (?:async )?function ([A-Za-z][A-Za-z0-9_]{0,63})\(/gm)) {
        declarations.push("Exported function " + name);
      }
      break;
    }
    case "migration":
      for (const [, name] of source.matchAll(/^CREATE (?:TABLE|TYPE) "([A-Za-z][A-Za-z0-9_]{0,63})"/gm)) declarations.push("Creates " + name);
      break;
  }
  const safe = [...new Set(declarations)].filter((line) => redactKnownSecrets(line) === line && !credentialPattern.test(line)).slice(0, 12);
  return { path, bytes, kind, configurationKeys, ...(safe.length && { declarations: safe }) };
}

function isSafeRoute(route: string) {
  return !route.includes("..") && redactKnownSecrets(route) === route && !credentialPattern.test(route);
}

export function boundEvidence(evidence: RepositoryEvidence) {
  const coverage = evidence.coverage;
  if (!coverage) return evidence;
  while (JSON.stringify(evidence).length > repositoryEvidenceBudget && evidence.paths.length) {
    evidence.paths.pop();
    coverage.budgetLimited = true;
    evidence.treeTruncated = true;
  }
  while (JSON.stringify(evidence).length > repositoryEvidenceBudget && evidence.files.length) {
    const last = evidence.files.at(-1);
    if (last?.declarations?.length) last.declarations.pop();
    else evidence.files.pop();
    coverage.budgetLimited = true;
  }
  coverage.schemaDeclarationsObserved = evidence.files.some((file) => category(file.path) === "schema" && !!file.declarations?.length);
  coverage.routeDeclarationsObserved = evidence.files.some((file) => category(file.path) === "route" && !!file.declarations?.length);
  coverage.serviceDeclarationsObserved = evidence.files.some((file) => category(file.path) === "service" && !!file.declarations?.length);
  return evidence;
}
