import assert from "node:assert/strict";
import { generateKeyPairSync, randomUUID } from "node:crypto";
import { once } from "node:events";
import { readFileSync } from "node:fs";
import { mkdtemp, rm, rmdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { browserOrigin, fixtureSession, registerFixture } from "./session-helpers.mjs";

if (!process.env.TEST_DATABASE_URL) throw new Error("Use a disposable migrated PostgreSQL database.");
const orgId = randomUUID();
const otherId = randomUUID();
const suffix = randomUUID();
const emails = ["owner", "other", "member"].map((name) => name + "-" + suffix + "@example.invalid");
const directory = await mkdtemp(join(tmpdir(), "forge-github-test-"));
const keyPath = join(directory, "test.pem");
const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
await writeFile(keyPath, privateKey.export({ type: "pkcs8", format: "pem" }));
Object.assign(process.env, {
  DATABASE_URL: process.env.TEST_DATABASE_URL, NODE_ENV: "test", FRONTEND_ORIGIN: browserOrigin,
  GITHUB_APP_ID: "123", GITHUB_APP_PRIVATE_KEY_PATH: keyPath, GITHUB_INSTALLATION_BINDINGS: JSON.stringify({ 72: orgId }),
});
const { createApp } = await import("../src/app.ts");
const { getDatabase, disconnectDatabase } = await import("../src/services/database.ts");
const { processPlanningJob } = await import("../src/services/planning-worker.ts");
const { repositoryEvidenceBudget } = await import("../src/services/repository-evidence.ts");
const db = getDatabase();
const realFetch = globalThis.fetch;
const gh = (org = orgId) => `/api/organizations/${org}/github`;
const workforce = (org = orgId) => `/api/organizations/${org}/workforce`;
const sha = (character) => character.repeat(40);
const repo = { id: 25, full_name: "acme/example", default_branch: "main", private: true };
const rawMarker = "PRIVATE_RAW_SOURCE_MARKER";
const backendSources = [
  ["apps/api/prisma/schema.prisma", "1"],
  ["apps/api/src/routes/workforce.ts", "2"],
  ["apps/api/src/services/workforce.ts", "3"],
  ["apps/api/prisma/migrations/20261111120000_repository_workforce/migration.sql", "4"],
  ["apps/api/src/routes/demo.ts", "5"],
].map(([path, char]) => ({
  path, sha: sha(char), content: readFileSync(new URL("../../../" + path, import.meta.url), "utf8"),
}));
let state = "normal";
let minted = 0;
let reads = [];
let server, base, owner, other, member, project, foreignProject, task, foreignTask, installation, selected;

function mockedFetch(input, init) {
  const url = new URL(String(input));
  if (url.hostname !== "api.github.com") return realFetch(input, init);
  const { pathname: path } = url;
  const json = (value, status = 200) => Response.json(value, { status });
  reads.push(path);
  if (path === "/app/installations/72") {
    assert.match(init.headers.Authorization, /^Bearer [\w-]+\.[\w-]+\.[\w-]+$/);
    if (state === "revoked") return json({}, 404);
    return json({ id: 72, account: { login: "acme" }, suspended_at: null, permissions: { contents: "read", metadata: "read" } });
  }
  if (path.endsWith("/access_tokens")) {
    minted++;
    const body = JSON.parse(init.body);
    assert.deepEqual(body.permissions, { contents: "read", metadata: "read" });
    if (body.repository_ids && body.repository_ids[0] !== 25) return json({}, 422);
    return json({ token: "mock-token-" + minted, expires_at: new Date(Date.now() + (state === "expired" && minted === 1 ? -1000 : 60000)).toISOString() }, 201);
  }
  assert.equal(init.method, "GET");
  if (path === "/installation/repositories") return state === "failure" ? json({ body: rawMarker }, 503) : json({ total_count: 1, repositories: [repo] });
  if (path.endsWith("/commits")) return state === "empty" ? json({}, 409) : json([{ sha: sha("a"), commit: { tree: { sha: sha("b") } } }]);
  if (state === "backend") {
    if (path.endsWith("/git/trees/" + sha("b"))) return json({ truncated: false, tree: [
      ...Array.from({ length: 70 }, (_, index) => ({ path: `apps/web/mock/ticket-${index}/package.json`, mode: "100644", size: 90, sha: sha("c") })),
      ...backendSources.map(({ path: name, sha: hash, content }) => ({ path: name, sha: hash, mode: "100644", size: Buffer.byteLength(content) })),
    ] });
    const source = backendSources.find(({ sha: hash }) => path.endsWith("/git/blobs/" + hash));
    if (source) return json({ sha: source.sha, size: Buffer.byteLength(source.content), encoding: "base64",
      content: Buffer.from(source.content).toString("base64") });
  }
  if (path.endsWith("/git/trees/" + sha("b"))) return json({ truncated: false, tree: [
    { path: "package.json", mode: "100644", size: 100, sha: sha("c") },
    { path: "src/routes.ts", mode: "100644", size: 30, sha: sha("d") },
    { path: ".env", mode: "100644", size: 20, sha: sha("e") },
    { path: "secret-key.pem", mode: "100644", size: 20, sha: sha("e") },
    { path: "src/symlink.ts", mode: "120000", size: 20, sha: sha("e") },
  ] });
  if (path.endsWith("/git/blobs/" + sha("c")) || path.endsWith("/git/blobs/" + sha("d"))) {
    const blobSha = path.slice(-40);
    const content = blobSha === sha("c") ? JSON.stringify({ scripts: { build: rawMarker }, dependencies: {} }) : rawMarker;
    return json({ sha: blobSha, size: Buffer.byteLength(content), encoding: "base64", content: Buffer.from(content).toString("base64") });
  }
  assert.fail("Unexpected mocked GitHub route");
}

async function call(method, path, body, cookie = owner) {
  const response = await realFetch(base + path, { method, headers: {
    origin: browserOrigin, ...(cookie && { cookie }), ...(body && { "content-type": "application/json" }),
  }, body: body && JSON.stringify(body), signal: AbortSignal.timeout(10000) });
  return { status: response.status, body: await response.json() };
}
async function success(method, path, body, expected = 200, cookie = owner) {
  const result = await call(method, path, body, cookie);
  assert.equal(result.status, expected, JSON.stringify(result.body));
  return result.body.data;
}

before(async () => {
  server = createApp().listen(0, "127.0.0.1");
  await once(server, "listening");
  base = `http://127.0.0.1:${server.address().port}`;
  for (const email of emails) await registerFixture(base, email);
  [owner, other, member] = await Promise.all(emails.map((email) => fixtureSession(base, email)));
  await db.organization.createMany({ data: [
    { id: orgId, name: "GitHub org", slug: "gh-" + suffix },
    { id: otherId, name: "Other", slug: "other-" + suffix },
  ] });
  for (const [index, email] of emails.entries()) {
    const { id } = await db.user.findUniqueOrThrow({ where: { email }, select: { id: true } });
    await db.organizationMember.create({ data: { userId: id, organizationId: index === 1 ? otherId : orgId, role: index === 2 ? "MEMBER" : "OWNER" } });
  }
  project = await db.project.create({ data: { name: "Repository project", organizationId: orgId } });
  foreignProject = await db.project.create({ data: { name: "Other project", organizationId: otherId } });
  task = await db.task.create({ data: { projectId: project.id, title: "Investigate routes" } });
  foreignTask = await db.task.create({ data: { projectId: foreignProject.id, title: "Foreign task" } });
  globalThis.fetch = mockedFetch;
});

after(async () => {
  globalThis.fetch = realFetch;
  if (server) await new Promise((resolve) => server.close(resolve));
  try {
    const organizationId = { in: [orgId, otherId] };
    const projectScope = { organizationId };
    const ticket = { project: projectScope };
    const run = { task: { project: projectScope } };
    await db.$transaction([
      db.workflowEvent.deleteMany({ where: { ticket } }), db.workflowDependency.deleteMany({ where: { from: { ticket } } }),
      db.workAssignment.deleteMany({ where: { ticket } }), db.ticket.deleteMany({ where: ticket }),
      db.agentWorker.deleteMany({ where: { organizationId } }), db.llmInvocation.deleteMany({ where: { run } }),
      db.runEvent.deleteMany({ where: { run } }), db.agentMessage.deleteMany({ where: { run } }), db.agentStep.deleteMany({ where: { run } }),
      db.agentRun.deleteMany({ where: run }), db.task.deleteMany({ where: { project: projectScope } }),
      db.project.deleteMany({ where: projectScope }), db.gitHubRepository.deleteMany({ where: { organizationId } }),
      db.gitHubInstallation.deleteMany({ where: { organizationId } }), db.organization.deleteMany({ where: { id: organizationId } }),
      db.user.deleteMany({ where: { email: { in: emails } } }),
    ]);
  } finally {
    await disconnectDatabase();
    await rm(keyPath, { force: true });
    await rmdir(directory);
  }
});

test("GitHub connection requires an approved tenant binding and owner/admin access", async () => {
  const input = { githubInstallationId: "72" };
  assert.equal((await call("POST", gh(), input, null)).status, 401);
  assert.equal((await call("POST", gh(), input, member)).status, 403);
  assert.equal((await call("POST", gh(otherId), input, other)).status, 403);
  assert.equal(reads.length, 0);
  installation = await success("POST", gh(), input, 201);
  const path = gh() + `/${installation.id}/repositories`;
  assert.equal((await call("GET", path, undefined, other)).status, 404);
  assert.equal((await call("GET", gh(otherId) + `/${installation.id}/repositories`, undefined, other)).status, 404);
  assert.equal((await call("GET", path, undefined, member)).status, 403);
  state = "expired"; minted = 0;
  assert.equal((await success("GET", path)).repositories[0].fullName, "acme/example");
  assert.equal(minted, 2);
  state = "normal";
  assert.equal((await call("POST", path, { githubRepositoryId: "999" })).status, 403);
  selected = await success("POST", path, { githubRepositoryId: "25" }, 201);
  assert.equal((await call("PATCH", gh(otherId) + `/projects/${foreignProject.id}`, { repositoryId: selected.id }, other)).status, 404);
  assert.equal((await call("PATCH", gh() + `/projects/${foreignProject.id}`, { repositoryId: selected.id })).status, 404);
  await success("PATCH", gh() + `/projects/${project.id}`, { repositoryId: selected.id });
});

const plan = { summary: "Review package.json", requirements: ["Keep routes"], implementationSteps: ["Inspect routes"],
  acceptanceCriteria: ["Routes still work"], risks: [], handoffNotes: "Review configuration" };
const proposal = { architectureSummary: "Observed package.json scripts. Assume routes need changes.", proposedComponents: ["Routes"],
  implementationApproach: ["Confirm behavior"], dataModelChanges: [], apiChanges: [], risks: ["Unknown behavior"],
  testingStrategy: ["Test routes"], openQuestions: ["Which routes?"] };
async function planning(mode, expected, planningTask = task) {
  state = mode;
  const accepted = await success("POST", `/api/tasks/${planningTask.id}/runs/collaborate?organizationId=${orgId}`, {}, 202);
  const seen = [];
  await processPlanningJob({ providerFactory: () => ({ name: "mock", model: "mock-planner", async generate(request) {
    seen.push(JSON.parse(request.context));
    assert.match(request.systemInstruction, /Cite only observed paths/);
    assert.match(request.systemInstruction, /missing declaration is an evidence gap/);
    return { text: JSON.stringify(seen.length === 1 ? plan : proposal) };
  } }) });
  const events = await success("GET", `/api/runs/${accepted.run.id}/events?organizationId=${orgId}`);
  const result = await success("GET", `/api/runs/${accepted.run.id}?organizationId=${orgId}`);
  assert.equal(result.status, expected);
  return { seen, events, result };
}

test("planning sends pinned structural evidence to Alex and Marcus without raw contents", async () => {
  reads = [];
  const { seen, events } = await planning("normal", "COMPLETED");
  assert.equal(seen.length, 2);
  assert.deepEqual(seen[0].observedRepository, seen[1].observedRepository);
  assert.equal(seen[0].observedRepository.commit, sha("a"));
  assert.equal(seen[0].observedRepository.coverage.schemaDeclarationsObserved, false);
  assert.deepEqual(seen[0].observedRepository.paths, ["package.json", "src/routes.ts"]);
  assert.deepEqual(seen[0].observedRepository.files[0].configurationKeys, ["scripts", "dependencies"]);
  assert.equal(reads.filter((path) => path.includes("/git/trees/")).length, 1);
  assert.equal(reads.some((path) => path.endsWith(sha("e"))), false);
  assert.ok(!JSON.stringify({ seen, events }).includes(rawMarker));
  assert.deepEqual(events.find(({ eventType }) => eventType === "REPOSITORY_OBSERVED").payload, seen[0].observedRepository);
});

test("backend task description prioritizes Prisma, mounted routes and workforce services over mock UI files", async () => {
  const backendTask = await db.task.create({ data: {
    projectId: project.id, title: "Design improvements",
    description: "Inspect ticket status, worker assignments, and workflow history. Reuse persisted models and APIs.",
  } });
  const { seen, events, result } = await planning("backend", "COMPLETED", backendTask);
  assert.equal(seen.length, 2);
  const evidence = seen[0].observedRepository;
  assert.deepEqual(seen[1].observedRepository, evidence);
  assert.deepEqual(events.find(({ eventType }) => eventType === "REPOSITORY_OBSERVED").payload, evidence);
  assert.equal(result.steps[1].input.promptVersion, "marcus-architecture-v1-repo-v2");
  assert.ok(JSON.stringify(evidence).length <= repositoryEvidenceBudget);
  assert.equal(evidence.treeTruncated, true);
  assert.equal(evidence.coverage.upstreamTreeTruncated, false);
  assert.equal(evidence.coverage.schemaDeclarationsObserved, true);
  assert.equal(evidence.coverage.routeDeclarationsObserved, true);
  assert.equal(evidence.coverage.serviceDeclarationsObserved, true);
  const declarations = (path) => evidence.files.find((file) => file.path === path)?.declarations?.join("\n") ?? "";
  const schema = declarations("apps/api/prisma/schema.prisma");
  for (const name of ["Ticket", "WorkAssignment", "WorkflowEvent", "WorkflowDependency", "AgentWorker", "WorkStatus"]) {
    assert.match(schema, new RegExp(`(?:model|enum) ${name} —`));
  }
  assert.match(schema, /assignments: WorkAssignment\[\]/);
  assert.match(declarations("apps/api/src/routes/workforce.ts"), /POST \/projects\/:projectId\/tickets\/:ticketId\/assignments/);
  assert.match(declarations("apps/api/src/routes/demo.ts"), /Mount \/organizations\/:organizationId\/workforce/);
  assert.match(declarations("apps/api/src/services/workforce.ts"), /Exported function changeAssignment/);
  assert.match(declarations("apps/api/prisma/migrations/20261111120000_repository_workforce/migration.sql"), /Creates WorkAssignment/);
  assert.ok(!JSON.stringify({ seen, events }).includes(rawMarker));
});

test("a saved repo-v1 Alex checkpoint still resumes Marcus with its original evidence", async () => {
  state = "normal";
  const { run } = await success("POST", `/api/tasks/${task.id}/runs/collaborate?organizationId=${orgId}`, {}, 202);
  const shutdown = new AbortController();
  await processPlanningJob({ signal: shutdown.signal, onCheckpoint: () => shutdown.abort(),
    providerFactory: () => ({ name: "mock", model: "mock-planner", generate: async () => ({ text: JSON.stringify(plan) }) }),
  });
  const job = await db.planningJob.findUniqueOrThrow({ where: { runId: run.id } });
  const { coverage, formatVersion, ...legacyEvidence } = job.context.repositoryEvidence;
  const steps = await db.agentStep.findMany({ where: { runId: run.id }, orderBy: { sequence: "asc" } });
  assert.deepEqual(steps.map(({ status }) => status), ["COMPLETED", "PENDING"]);
  await db.planningJob.update({ where: { runId: run.id }, data: {
    leaseExpiresAt: new Date(0), context: { ...job.context, repositoryEvidence: legacyEvidence },
  } });
  for (const step of steps) {
    await db.agentStep.update({ where: { id: step.id }, data: {
      input: { ...step.input, promptVersion: step.input.promptVersion.replace("-repo-v2", "-repo-v1") },
    } });
  }
  let invocations = 0;
  await processPlanningJob({ providerFactory: () => ({ name: "mock", model: "mock-planner", async generate(request) {
    invocations++;
    const context = JSON.parse(request.context);
    assert.ok(context.alexPlan);
    assert.deepEqual(context.observedRepository, legacyEvidence);
    assert.doesNotMatch(request.systemInstruction, /missing declaration is an evidence gap/);
    return { text: JSON.stringify(proposal) };
  } }) });
  assert.equal(invocations, 1);
  const resumed = await db.agentRun.findUniqueOrThrow({ where: { id: run.id }, include: { steps: true } });
  assert.equal(resumed.status, "COMPLETED");
  assert.equal(resumed.steps.find(({ agentRole }) => agentRole === "MARCUS").input.promptVersion, "marcus-architecture-v1-repo-v1");
});

test("empty repositories report observed emptiness and GitHub errors remain sanitized", async () => {
  const { seen } = await planning("empty", "COMPLETED");
  assert.equal(seen[0].observedRepository.empty, true);
  assert.equal(seen[0].observedRepository.commit, null);
  assert.deepEqual(seen[0].observedRepository.files, []);
  state = "failure";
  const path = gh() + `/${installation.id}/repositories`;
  const failure = await call("GET", path);
  assert.equal(failure.status, 502);
  assert.ok(!JSON.stringify(failure.body).includes(rawMarker));
  state = "revoked";
  assert.equal((await call("GET", path)).status, 410);
  assert.ok((await success("GET", gh()))[0].revokedAt);
  const revoked = await planning("revoked", "FAILED");
  assert.equal(revoked.seen.length, 0);
  assert.match(revoked.result.errorMessage, /revoked or suspended/);
});

test("workforce graph derives assignments and handoffs from stored records and rejects cross-tenant operations", async () => {
  const prefix = workforce() + `/projects/${project.id}`;
  assert.equal((await success("GET", prefix + "/graph")).ticket, null);
  const workerA = await success("POST", workforce() + "/workers", { name: "Alex North", role: "PM" }, 201);
  const workerB = await success("POST", workforce() + "/workers", { name: "Alex South", role: "PM" }, 201);
  const foreignWorker = await success("POST", workforce(otherId) + "/workers", { name: "Other QA", role: "QA" }, 201, other);
  assert.equal((await call("PATCH", workforce(otherId) + "/workers/" + workerA.id, { enabled: false }, other)).status, 404);
  assert.equal((await call("POST", workforce() + "/workers", { name: "Member worker", role: "QA" }, member)).status, 403);
  assert.equal((await call("GET", prefix + "/graph", undefined, other)).status, 404);
  const ticket = await success("POST", prefix + "/tickets", { requirement: "Deliver a tenant-safe graph" }, 201);
  const path = prefix + `/tickets/${ticket.id}`;
  assert.equal((await call("POST", path + "/assignments", { workerId: foreignWorker.id })).status, 404);
  assert.equal((await call("POST", path + "/assignments", { workerId: workerA.id, taskId: foreignTask.id })).status, 404);
  const first = await success("POST", path + "/assignments", { workerId: workerA.id, taskId: task.id }, 201);
  const second = await success("POST", path + "/assignments", { workerId: workerB.id }, 201);
  const edge = { fromId: first.id, toId: second.id, kind: "DEPENDENCY" };
  await success("POST", path + "/edges", edge, 201);
  assert.equal((await call("POST", path + "/edges", { ...edge, fromId: second.id, toId: first.id })).status, 409);
  const status = (assignment) => path + "/assignments/" + assignment.id;
  assert.equal((await call("PATCH", status(second), { status: "RUNNING" })).status, 409);
  await success("PATCH", status(first), { status: "RUNNING" });
  await success("PATCH", status(first), { status: "COMPLETED" });
  await success("POST", path + "/edges", { ...edge, kind: "HANDOFF" }, 201);
  await success("PATCH", status(second), { status: "BLOCKED", blockedReason: "Waiting for input" });
  const graph = await success("GET", prefix + "/graph", undefined, 200, member);
  assert.deepEqual(graph.ticket.progress, { completed: 1, total: 2 });
  assert.deepEqual(graph.ticket.blockers, [{ id: second.id, reason: "Waiting for input" }]);
  assert.deepEqual(graph.nodes.filter((node) => node.source === "ASSIGNMENT").map(({ name, status }) => [name, status]),
    [["Alex North", "COMPLETED"], ["Alex South", "BLOCKED"]]);
  assert.deepEqual(graph.edges.filter((link) => link.fromId === first.id).map(({ kind }) => kind), ["DEPENDENCY", "HANDOFF"]);
  assert.ok(graph.ticket.events.some(({ kind }) => kind === "STATUS_CHANGED"));
});
