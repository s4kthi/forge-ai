import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { after, before, test } from "node:test";
import { PrismaPg } from "@prisma/adapter-pg";
import { browserOrigin, fixtureSession, registerFixture } from "./session-helpers.mjs";

if (!process.env.TEST_DATABASE_URL) {
  throw new Error("Set TEST_DATABASE_URL to a disposable PostgreSQL database with migrations applied.");
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.NODE_ENV = "development";
process.env.FRONTEND_ORIGIN = browserOrigin;
process.env.ENABLE_DEMO_FIXTURES = "true";

const { app } = await import("../src/app.ts");
const { disconnectDatabase, getDatabase } = await import("../src/services/database.ts");
const { PrismaClient } = await import("../src/generated/prisma/client.ts");
const { recordMessage, recordStep, transitionRun, transitionStep } = await import("../src/services/run-workflow.ts");

const db = getDatabase();
const agentIds = ["ALEX", "MARCUS", "DEVON", "TESSA", "ELENA"];
let fixtures;
let server;
let baseUrl;
let cookie;

before(async () => {
  const suffix = randomUUID();
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  const email = `execution-${suffix}@example.invalid`;
  await registerFixture(baseUrl, email);
  cookie = await fixtureSession(baseUrl, email);
  fixtures = await db.$transaction(async (tx) => {
    const alpha = await tx.organization.create({ data: { name: "Execution Alpha", slug: `exec-alpha-${suffix}` } });
    const beta = await tx.organization.create({ data: { name: "Execution Beta", slug: `exec-beta-${suffix}` } });
    const project = await tx.project.create({ data: { organizationId: alpha.id, name: "Execution project" } });
    const user = await tx.user.findUniqueOrThrow({ where: { email }, select: { id: true } });
    await tx.organizationMember.create({ data: { userId: user.id, organizationId: alpha.id, role: "OWNER" } });
    return { alpha, beta, project, user };
  });
});

after(async () => {
  try {
    if (server) {
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
    if (fixtures) {
      const organizationId = { in: [fixtures.alpha.id, fixtures.beta.id] };
      const task = { project: { organizationId } };
      const run = { task };
      await db.$transaction([
        db.runEvent.deleteMany({ where: { run } }),
        db.agentMessage.deleteMany({ where: { run } }),
        db.agentStep.deleteMany({ where: { run } }),
        db.agentRun.deleteMany({ where: run }),
        db.task.deleteMany({ where: task }),
        db.project.deleteMany({ where: { organizationId } }),
        db.organization.deleteMany({ where: { id: organizationId } }),
        db.user.delete({ where: { id: fixtures.user.id } }),
      ]);
    }
  } finally {
    await disconnectDatabase();
  }
});

async function request(method, path, body) {
  const response = await fetch(baseUrl + path, {
    method,
    headers: { origin: browserOrigin, cookie, ...(body === undefined ? {} : { "content-type": "application/json" }) },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  return { status: response.status, body: await response.json() };
}

function inOrganization(path, organizationId = fixtures.alpha.id) {
  return `${path}?organizationId=${organizationId}`;
}

function createTask(title) {
  return db.task.create({ data: { projectId: fixtures.project.id, title } });
}

async function createRun(taskId) {
  const result = await request("POST", inOrganization(`/api/tasks/${taskId}/runs`), {});
  assert.equal(result.status, 201, JSON.stringify(result.body));
  return result.body.data;
}

function scope(run) {
  return { runId: run.id, organizationId: fixtures.alpha.id };
}

async function readRun(run, suffix = "") {
  const result = await request("GET", inOrganization(`/api/runs/${run.id}${suffix}`));
  assert.equal(result.status, 200, JSON.stringify(result.body));
  return result.body.data;
}

function assertEventOrder(events) {
  assert.deepEqual(events.map(({ sequence }) => sequence), events.map((_event, index) => index + 1));
  const timestamps = events.map(({ createdAt }) => Date.parse(createdAt));
  assert.ok(timestamps.every(Number.isFinite));
  assert.deepEqual(timestamps, [...timestamps].sort((first, second) => first - second));
}

test("publishes the five fixed agent identities with their roles and capabilities", async () => {
  const response = await request("GET", "/api/agents");
  assert.equal(response.status, 200);
  assert.deepEqual(response.body.data.map(({ id }) => id), agentIds);
  assert.deepEqual(response.body.data.map(({ role }) => role), [
    "Project Manager", "Software Architect", "Developer", "QA Engineer", "Code Reviewer",
  ]);
  assert.ok(response.body.data.every(({ capabilities }) => capabilities.length > 0));
});

test("creates, lists, and retrieves a pending run and its creation event", async () => {
  const task = await createTask("Create execution");
  const run = await createRun(task.id);
  assert.equal(run.taskId, task.id);
  assert.equal(run.status, "PENDING");
  assert.equal(run.isFixture, false);
  assert.equal(run.startedAt, null);
  assert.equal(run.completedAt, null);
  assert.deepEqual(await readRun(run), { ...run, steps: [] });
  assert.deepEqual(await readRun(run, "/messages"), []);
  const events = await readRun(run, "/events");
  assertEventOrder(events);
  assert.deepEqual(events.map(({ eventType, payload }) => ({ eventType, payload })), [
    { eventType: "RUN_CREATED", payload: { status: "PENDING" } },
  ]);
  const list = await request("GET", inOrganization(`/api/tasks/${task.id}/runs`));
  assert.equal(list.status, 200);
  assert.deepEqual(list.body.data, [run]);
});

test("persists the labeled five-agent fixture, results, handoffs, and events", async () => {
  const task = await createTask("Fixture execution");
  const run = await createRun(task.id);
  const path = inOrganization(`/api/runs/${run.id}/demo`);
  const demo = await request("POST", path, {});
  assert.equal(demo.status, 200, JSON.stringify(demo.body));
  assert.equal(demo.body.data.status, "COMPLETED");
  assert.equal(demo.body.data.isFixture, true);

  const details = await readRun(run);
  assert.ok(details.startedAt && details.completedAt);
  assert.deepEqual(details.steps.map(({ sequence }) => sequence), [1, 2, 3, 4, 5]);
  assert.deepEqual(details.steps.map(({ agentRole }) => agentRole), agentIds);
  assert.ok(details.steps.every(({ status, input, output, startedAt, completedAt }) =>
    status === "COMPLETED" && input.fixture && output.fixture && startedAt && completedAt));

  const messages = await readRun(run, "/messages");
  assert.equal(messages.length, 9);
  assert.deepEqual(messages.filter(({ messageType }) => messageType === "RESULT").map(({ fromAgent }) => fromAgent), agentIds);
  assert.deepEqual(
    messages.filter(({ messageType }) => messageType === "HANDOFF").map(({ fromAgent, toAgent }) => [fromAgent, toAgent]),
    agentIds.slice(0, -1).map((agent, index) => [agent, agentIds[index + 1]]),
  );
  assert.ok(messages.every(({ stepId, fromAgent, content }) =>
    details.steps.some((step) => step.id === stepId && step.agentRole === fromAgent) && /fixture/i.test(content)));

  const events = await readRun(run, "/events");
  assertEventOrder(events);
  assert.equal(events.length, 27);
  assert.equal(events[0].eventType, "RUN_CREATED");
  assert.deepEqual(events[1].payload, { status: "RUNNING", isFixture: true });
  assert.equal(events.at(-1).eventType, "RUN_COMPLETED");
  assert.equal(events.filter(({ eventType }) => eventType === "HANDOFF_RECORDED").length, 4);
  assert.ok(events.filter(({ payload }) => payload.messageId).every(({ payload }) =>
    messages.some(({ id }) => id === payload.messageId) && !("content" in payload)));
  assert.equal((await request("POST", path, {})).status, 409);
  assert.deepEqual(await readRun(run, "/events"), events);
});

test("enforces run and step transitions and protects terminal history", async () => {
  const task = await createTask("Manual lifecycle");
  const run = await createRun(task.id);
  const runScope = scope(run);
  await assert.rejects(transitionRun(runScope, { status: "FAILED", errorMessage: "Early failure" }), { status: 409 });
  await assert.rejects(recordStep(runScope, "ALEX"), { status: 409 });
  assert.equal((await transitionRun(runScope, { status: "RUNNING" })).status, "RUNNING");
  await assert.rejects(transitionRun(runScope, { status: "RUNNING" }), { status: 409 });
  const step = await recordStep(runScope, "ALEX", { brief: "test fixture" });
  await assert.rejects(transitionStep(runScope, step.id, { status: "COMPLETED" }), { status: 409 });
  await assert.rejects(transitionRun(runScope, { status: "COMPLETED" }), { status: 409 });
  await transitionStep(runScope, step.id, { status: "RUNNING" });
  await assert.rejects(recordMessage(runScope, {
    stepId: step.id, fromAgent: "ELENA", messageType: "QUESTION", content: "Mismatched sender",
  }), { status: 422 });
  await assert.rejects(recordMessage(runScope, {
    stepId: step.id, fromAgent: "ALEX", messageType: "HANDOFF", content: "Missing recipient",
  }), { status: 422 });
  await recordMessage(runScope, {
    stepId: step.id, fromAgent: "ALEX", toAgent: "MARCUS", messageType: "QUESTION", content: "Fixture question",
  });
  await transitionStep(runScope, step.id, { status: "COMPLETED", output: { accepted: true } });
  await assert.rejects(transitionStep(runScope, step.id, { status: "RUNNING" }), { status: 409 });
  assert.equal((await transitionRun(runScope, { status: "COMPLETED" })).status, "COMPLETED");
  await assert.rejects(transitionRun(runScope, { status: "RUNNING" }), { status: 409 });
  await assert.rejects(recordStep(runScope, "DEVON"), { status: 409 });
  await assert.rejects(recordMessage(runScope, {
    fromAgent: "ELENA", messageType: "RESULT", content: "Late message",
  }), { status: 409 });
  assert.deepEqual((await readRun(run)).steps[0].output, { accepted: true });
  assert.equal((await readRun(run, "/messages")).length, 1);

  const next = await createRun(task.id);
  assert.notEqual(next.id, run.id);
  assert.equal((await transitionRun(scope(next), { status: "CANCELLED" })).status, "CANCELLED");
  assert.equal((await readRun(next, "/events")).at(-1).eventType, "RUN_CANCELLED");
  await assert.rejects(transitionRun(scope(next), { status: "RUNNING" }), { status: 409 });
});

test("records step and run failure and closes unfinished steps", async () => {
  const task = await createTask("Failure lifecycle");
  const run = await createRun(task.id);
  const runScope = scope(run);
  await transitionRun(runScope, { status: "RUNNING" });
  const failed = await recordStep(runScope, "DEVON");
  await recordStep(runScope, "TESSA");
  await transitionStep(runScope, failed.id, { status: "RUNNING" });
  await transitionStep(runScope, failed.id, { status: "FAILED", errorMessage: "Fixture step error" });
  await assert.rejects(transitionRun(runScope, { status: "COMPLETED" }), { status: 409 });
  await transitionRun(runScope, { status: "FAILED", errorMessage: "Fixture run error" });

  const details = await readRun(run);
  assert.equal(details.status, "FAILED");
  assert.equal(details.errorMessage, "Fixture run error");
  assert.ok(details.completedAt);
  assert.deepEqual(details.steps.map(({ status }) => status), ["FAILED", "SKIPPED"]);
  assert.equal(details.steps[0].errorMessage, "Fixture step error");
  assert.ok(details.steps.every(({ completedAt }) => completedAt));
  const events = await readRun(run, "/events");
  assert.equal(events.at(-1).eventType, "RUN_FAILED");
  assert.deepEqual(events.at(-1).payload, { status: "FAILED", skippedSteps: 1 });
  assert.ok(events.some(({ eventType }) => eventType === "STEP_FAILED"));
  assert.ok(events.every(({ payload }) => !("errorMessage" in payload)));
  await assert.rejects(transitionRun(runScope, { status: "RUNNING" }), { status: 409 });
});

test("validates request scope and bodies, hides missing and out-of-tenant resources, and denies event writes", async () => {
  const task = await createTask("Scoped execution");
  const run = await createRun(task.id);
  const taskPath = `/api/tasks/${task.id}/runs`;
  const runPath = `/api/runs/${run.id}`;
  const other = fixtures.beta.id;
  const missing = randomUUID();

  const invalid = [
    ["GET", taskPath, undefined, 400],
    ["GET", inOrganization(taskPath, "bad"), undefined, 400],
    ["GET", inOrganization("/api/runs/bad"), undefined, 400],
    ["POST", inOrganization(taskPath), undefined, 415],
    ["POST", inOrganization(taskPath), { status: "COMPLETED" }, 400],
    ["POST", inOrganization(runPath + "/demo"), { content: "injected" }, 400],
    ["GET", inOrganization(`/api/tasks/${missing}/runs`), undefined, 404],
    ["POST", inOrganization(`/api/tasks/${missing}/runs`), {}, 404],
    ["GET", inOrganization(`/api/runs/${missing}`), undefined, 404],
    ["GET", inOrganization(`/api/runs/${missing}/events`), undefined, 404],
    ["GET", inOrganization(`/api/runs/${missing}/messages`), undefined, 404],
    ["POST", inOrganization(`/api/runs/${missing}/demo`), {}, 404],
    ["GET", inOrganization(taskPath, other), undefined, 404],
    ["POST", inOrganization(taskPath, other), {}, 404],
    ["GET", inOrganization(runPath, other), undefined, 404],
    ["GET", inOrganization(runPath + "/events", other), undefined, 404],
    ["GET", inOrganization(runPath + "/messages", other), undefined, 404],
    ["POST", inOrganization(runPath + "/demo", other), {}, 404],
    ["POST", inOrganization(runPath + "/events"), {}, 404],
    ["POST", inOrganization(runPath + "/messages"), {}, 404],
  ];

  for (const [method, path, body, status] of invalid) {
    const response = await request(method, path, body);
    assert.equal(response.status, status, `${method} ${path}: ${JSON.stringify(response.body)}`);
  }
  await assert.rejects(transitionRun({ runId: run.id, organizationId: other }, { status: "RUNNING" }), { status: 404 });
  assert.equal((await readRun(run)).status, "PENDING");
  assert.equal((await readRun(run, "/events")).length, 1);
});

test("allows only one active run under concurrent create requests and database writes", async () => {
  const task = await createTask("Concurrent execution");
  const path = inOrganization(`/api/tasks/${task.id}/runs`);
  const attempts = await Promise.all(Array.from({ length: 6 }, () => request("POST", path, {})));
  assert.deepEqual(attempts.map(({ status }) => status).sort(), [201, 409, 409, 409, 409, 409]);
  const { data: run } = attempts.find(({ status }) => status === 201).body;
  assert.equal(await db.agentRun.count({ where: { taskId: task.id } }), 1);
  await assert.rejects(db.agentRun.create({ data: { taskId: task.id } }), { code: "P2002" });
  await transitionRun(scope(run), { status: "RUNNING" });
  assert.equal((await request("POST", path, {})).status, 409);
  await transitionRun(scope(run), { status: "CANCELLED" });
  assert.equal((await request("POST", path, {})).status, 201);
});

test("serializes concurrent event and step sequences and survives a fresh database connection", async () => {
  const task = await createTask("Concurrent audit events");
  const run = await createRun(task.id);
  const runScope = scope(run);
  await transitionRun(runScope, { status: "RUNNING" });
  const steps = await Promise.all(agentIds.map((agent) => recordStep(runScope, agent)));
  assert.deepEqual(steps.map(({ sequence }) => sequence).sort(), [1, 2, 3, 4, 5]);
  const messages = await Promise.all(Array.from({ length: 6 }, (_, index) =>
    recordMessage(runScope, { fromAgent: "ALEX", messageType: "INSTRUCTION", content: `Fixture message ${index}` })));
  await transitionRun(runScope, { status: "CANCELLED" });

  const events = await readRun(run, "/events");
  assertEventOrder(events);
  const recorded = events.filter(({ eventType }) => eventType === "MESSAGE_RECORDED");
  assert.deepEqual(new Set(recorded.map(({ payload }) => payload.messageId)), new Set(messages.map(({ id }) => id)));
  assert.deepEqual(events.at(-1).payload, { status: "CANCELLED", skippedSteps: 5 });

  const fresh = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.TEST_DATABASE_URL }) });
  try {
    const persisted = await fresh.agentRun.findUniqueOrThrow({
      where: { id: run.id },
      include: { steps: true, messages: true, events: { orderBy: { sequence: "asc" } } },
    });
    assert.equal(persisted.status, "CANCELLED");
    assert.equal(persisted.steps.length, 5);
    assert.equal(persisted.messages.length, 6);
    assert.deepEqual(persisted.events.map(({ id }) => id), events.map(({ id }) => id));
  } finally {
    await fresh.$disconnect();
  }
});

test("rejects cross-run step references in the workflow and PostgreSQL", async () => {
  const first = await createRun((await createTask("Foreign step")).id);
  const second = await createRun((await createTask("Foreign step target")).id);
  await transitionRun(scope(first), { status: "RUNNING" });
  await transitionRun(scope(second), { status: "RUNNING" });
  const step = await recordStep(scope(first), "ALEX");
  const message = { stepId: step.id, fromAgent: "ALEX", messageType: "RESULT", content: "Invalid step reference" };
  await assert.rejects(recordMessage(scope(second), message), { status: 404 });
  await assert.rejects(db.agentMessage.create({ data: { ...message, runId: second.id } }), { code: "P2003" });
  await assert.rejects(db.runEvent.create({
    data: { runId: second.id, stepId: step.id, sequence: 3, eventType: "STEP_CREATED", payload: {} },
  }), { code: "P2003" });
});
