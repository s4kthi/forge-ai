import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { after, before, test } from "node:test";
import { browserOrigin, fixtureSession, registerFixture } from "./session-helpers.mjs";

if (!process.env.TEST_DATABASE_URL) {
  throw new Error("Set TEST_DATABASE_URL to a disposable PostgreSQL database with migrations applied.");
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.NODE_ENV = "development";
process.env.FRONTEND_ORIGIN = browserOrigin;

const { app } = await import("../src/app.ts");
const { disconnectDatabase, getDatabase } = await import("../src/services/database.ts");

const db = getDatabase();
const suffix = randomUUID();
const organizations = [];
const users = [];
let server;
let baseUrl;
let fixtures;
let cookie;

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  const email = `alpha-${suffix}@example.invalid`;
  await registerFixture(baseUrl, email);
  cookie = await fixtureSession(baseUrl, email);
  fixtures = await db.$transaction(async (tx) => {
    const alpha = await tx.organization.create({ data: { name: "Alpha", slug: `alpha-${suffix}` } });
    const beta = await tx.organization.create({ data: { name: "Beta", slug: `beta-${suffix}` } });
    const member = await tx.user.findUniqueOrThrow({ where: { email }, select: { id: true } });
    const outsider = await tx.user.create({ data: { name: "Beta User", email: `beta-${suffix}@example.invalid` } });
    await tx.organizationMember.createMany({
      data: [
        { organizationId: alpha.id, userId: member.id, role: "OWNER" },
        { organizationId: beta.id, userId: outsider.id, role: "MEMBER" },
      ],
    });
    const alphaProject = await tx.project.create({ data: { organizationId: alpha.id, name: "Alpha Project" } });
    const betaProject = await tx.project.create({ data: { organizationId: beta.id, name: "Beta Project" } });
    const betaTask = await tx.task.create({ data: { projectId: betaProject.id, title: "Beta Task" } });
    return { alpha, beta, member, outsider, alphaProject, betaProject, betaTask };
  });
  organizations.push(fixtures.alpha.id, fixtures.beta.id);
  users.push(fixtures.member.id, fixtures.outsider.id);

});

after(async () => {
  try {
    if (server) {
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
    if (organizations.length) {
      const organizationId = { in: organizations };
      await db.$transaction([
        db.task.deleteMany({ where: { project: { organizationId } } }),
        db.project.deleteMany({ where: { organizationId } }),
        db.organization.deleteMany({ where: { id: organizationId } }),
        db.user.deleteMany({ where: { id: { in: users } } }),
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
    signal: AbortSignal.timeout(5000),
  });
  return { status: response.status, body: await response.json() };
}

test("Day 1 health endpoints still serve their original contracts", async () => {
  const health = await request("GET", "/health");
  assert.equal(health.status, 200);
  assert.equal(health.body.name, "FORGE AI");
  assert.equal(health.body.status, "ok");
  assert.ok(Number.isFinite(Date.parse(health.body.timestamp)));
  const database = await request("GET", "/health/db");
  assert.equal(database.status, 200);
  assert.equal(database.body.status, "connected");
});

test("validates UUIDs, enums, strict body shape, and required fields", async () => {
  const cases = [
    ["GET", "/api/organizations/not-a-uuid/projects"],
    ["GET", "/api/projects/not-a-uuid/tasks"],
    ["PATCH", "/api/tasks/not-a-uuid", { status: "DONE" }],
    ["POST", "/api/organizations", { name: "  ", slug: "Invalid Slug" }],
    ["POST", "/api/organizations", []],
    ["POST", `/api/organizations/${fixtures.alpha.id}/projects`, { name: "Bad", status: "OPEN" }],
    ["POST", `/api/organizations/${fixtures.alpha.id}/projects`, {
      name: "Bad", organizationId: fixtures.beta.id,
    }],
    ["POST", `/api/projects/${fixtures.alphaProject.id}/tasks`, { title: "Bad", priority: "IMMEDIATE" }],
    ["POST", `/api/projects/${fixtures.alphaProject.id}/tasks`, { title: "Bad", assigneeId: "not-a-uuid" }],
    ["POST", `/api/projects/${fixtures.alphaProject.id}/tasks`, { description: "Missing title" }],
    ["PATCH", `/api/tasks/${fixtures.betaTask.id}`, {}],
    ["PATCH", `/api/tasks/${fixtures.betaTask.id}`, { projectId: fixtures.alphaProject.id }],
  ];

  for (const [method, path, body] of cases) {
    const result = await request(method, path, body);
    assert.equal(result.status, 400, `${method} ${path}: ${JSON.stringify(result.body)}`);
    assert.equal(result.body.error, "Invalid request");
    assert.ok(result.body.issues.length > 0);
  }
});

test("returns JSON errors for malformed URLs and request bodies", async () => {
  const malformed = await request("GET", "/api/projects/%ZZ/tasks");
  assert.equal(malformed.status, 400);
  assert.deepEqual(malformed.body, { error: "Malformed URL parameter" });
  const response = await fetch(baseUrl + "/api/organizations", {
    method: "POST",
    headers: { origin: browserOrigin, cookie, "content-type": "application/json" },
    body: "{",
    signal: AbortSignal.timeout(5000),
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Malformed JSON body" });
});

test("creates and lists organizations, and reports duplicate slugs as conflicts", async () => {
  const input = { name: "  Integration Test  ", slug: `integration-${suffix}` };
  const created = await request("POST", "/api/organizations", input);
  assert.equal(created.status, 201);
  const { data } = created.body;
  organizations.push(data.id);
  assert.equal(data.name, "Integration Test");
  assert.equal(data.slug, input.slug);

  const list = await request("GET", "/api/organizations");
  assert.equal(list.status, 200);
  assert.deepEqual(list.body.data.find(({ id }) => id === data.id), data);
  assert.equal(data.role, "OWNER");
  assert.ok(!list.body.data.some(({ id }) => id === fixtures.beta.id));
  assert.equal((await request("POST", "/api/organizations", input)).status, 409);
});

test("creates projects under the path organization and scopes project lists", async () => {
  const path = `/api/organizations/${fixtures.alpha.id}/projects`;
  const created = await request("POST", path, { name: "Second Alpha Project", description: "Local scope" });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.organizationId, fixtures.alpha.id);
  assert.equal(created.body.data.status, "ACTIVE");

  const alpha = await request("GET", path);
  const beta = await request("GET", `/api/organizations/${fixtures.beta.id}/projects`);
  assert.equal(alpha.status, 200);
  assert.equal(beta.status, 404);
  assert.deepEqual(
    new Set(alpha.body.data.map(({ id }) => id)),
    new Set([fixtures.alphaProject.id, created.body.data.id]),
  );
});

test("creates and lists tasks by project, and validates tenant membership on create and patch", async () => {
  const path = `/api/projects/${fixtures.alphaProject.id}/tasks`;
  const wrongAssignee = await request("POST", path, { title: "Invalid assignment", assigneeId: fixtures.outsider.id });
  assert.equal(wrongAssignee.status, 422);

  const created = await request("POST", path, { title: "Scoped Task", assigneeId: fixtures.member.id });
  assert.equal(created.status, 201);
  const task = created.body.data;
  assert.equal(task.projectId, fixtures.alphaProject.id);
  assert.equal(task.assigneeId, fixtures.member.id);
  assert.equal(task.status, "TODO");
  assert.equal(task.priority, "MEDIUM");

  const alpha = await request("GET", path);
  const beta = await request("GET", `/api/projects/${fixtures.betaProject.id}/tasks`);
  assert.equal(alpha.status, 200);
  assert.equal(beta.status, 404);
  assert.deepEqual(alpha.body.data.map(({ id }) => id), [task.id]);

  const taskPath = `/api/tasks/${task.id}`;
  const rejected = await request("PATCH", taskPath, { status: "DONE", assigneeId: fixtures.outsider.id });
  assert.equal(rejected.status, 422);
  assert.deepEqual((await request("GET", path)).body.data, [task]);

  const updated = await request("PATCH", taskPath, { status: "IN_PROGRESS", priority: "HIGH" });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.status, "IN_PROGRESS");
  assert.equal(updated.body.data.priority, "HIGH");
  assert.equal(updated.body.data.title, task.title);
  assert.equal(updated.body.data.assigneeId, fixtures.member.id);

  const unassigned = await request("PATCH", taskPath, { status: "DONE", assigneeId: null });
  assert.equal(unassigned.status, 200);
  assert.equal(unassigned.body.data.status, "DONE");
  assert.equal(unassigned.body.data.assigneeId, null);
  assert.deepEqual((await request("GET", path)).body.data, [unassigned.body.data]);
});

test("returns 404 for missing organizations, projects, and tasks", async () => {
  const missing = randomUUID();
  const cases = [
    ["GET", `/api/organizations/${missing}/projects`],
    ["POST", `/api/organizations/${missing}/projects`, { name: "Missing organization" }],
    ["GET", `/api/projects/${missing}/tasks`],
    ["POST", `/api/projects/${missing}/tasks`, { title: "Missing project" }],
    ["PATCH", `/api/tasks/${missing}`, { status: "DONE" }],
    ["PATCH", `/api/tasks/${missing}`, { assigneeId: fixtures.member.id }],
  ];

  for (const [method, path, body] of cases) {
    const result = await request(method, path, body);
    assert.equal(result.status, 404, `${method} ${path}: ${JSON.stringify(result.body)}`);
    assert.equal(typeof result.body.error, "string");
  }
});
