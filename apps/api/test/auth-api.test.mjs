import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { once } from "node:events";
import { after, before, test } from "node:test";
import { verify } from "@node-rs/argon2";

if (!process.env.TEST_DATABASE_URL) throw new Error("Set TEST_DATABASE_URL to a migrated, disposable database.");
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.NODE_ENV = "production";
process.env.FRONTEND_ORIGIN = "https://forge.example.test";
process.env.ENABLE_DEMO_FIXTURES = "true";

const { createApp } = await import("../src/app.ts");
const { getDatabase, disconnectDatabase } = await import("../src/services/database.ts");
const db = getDatabase();
const origin = process.env.FRONTEND_ORIGIN;
const suffix = randomUUID();
const email = `day7-owner-${suffix}@example.invalid`;
const password = "synthetic account passphrase 42";
const users = [];
const organizations = [];
const servers = [];
let base;
let cookie;
let owner;
let authDigest;

async function listen() {
  const app = createApp();
  const server = app.listen(0, "127.0.0.1");
  servers.push(server);
  await once(server, "listening");
  return `http://127.0.0.1:${server.address().port}`;
}

async function call(method, path, { body, session, from = origin, url = base, extra } = {}) {
  const headers = new Headers(extra);
  if (from) headers.set("Origin", from);
  if (session) headers.set("Cookie", session);
  if (body) headers.set("Content-Type", "application/json");
  const response = await fetch(url + "/api" + path, {
    method, headers, body: body && JSON.stringify(body), signal: AbortSignal.timeout(8000),
  });
  return { status: response.status, headers: response.headers, body: await response.json() };
}

async function signIn(account = email, session) {
  const result = await call("POST", "/auth/login", { session, body: { email: account, password } });
  assert.equal(result.status, 200);
  return { ...result, cookie: result.headers.get("set-cookie").split(";")[0] };
}

before(async () => { base = await listen(); });
after(async () => {
  try {
    for (const server of servers) await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
    const organizationId = { in: organizations };
    const task = { project: { organizationId } };
    const run = { task };
    await db.$transaction([
      db.runEvent.deleteMany({ where: { run } }),
      db.agentRun.deleteMany({ where: { task } }),
      db.task.deleteMany({ where: task }),
      db.project.deleteMany({ where: { organizationId } }),
      db.organization.deleteMany({ where: { id: organizationId } }),
      db.user.deleteMany({ where: { email: { in: [email, ...users] } } }),
    ]);
  } finally {
    await disconnectDatabase();
  }
});

test("registers normalized email with Argon2id, gives generic duplicate responses and never grants a membership", async () => {
  const input = { name: "Test Owner", email: " " + email.toUpperCase() + " ", password };
  assert.equal((await call("POST", "/auth/register", { body: { ...input, password: "short" } })).status, 400);
  const registered = await call("POST", "/auth/register", { body: input });
  assert.equal(registered.status, 202);
  assert.equal(registered.headers.get("set-cookie"), null);
  const repeated = await call("POST", "/auth/register", { body: { ...input, password: "another valid synthetic phrase" } });
  assert.equal(repeated.status, 202);
  assert.deepEqual(repeated.body, registered.body);
  assert.equal(repeated.headers.get("set-cookie"), null);

  const legacy = `legacy-${suffix}@example.invalid`;
  users.push(legacy.toUpperCase());
  await db.user.create({ data: { name: "Legacy", email: legacy.toUpperCase() } });
  const legacyRegistration = await call("POST", "/auth/register", { body: { ...input, email: legacy } });
  assert.equal(legacyRegistration.status, 202);
  assert.deepEqual(legacyRegistration.body, registered.body);
  assert.equal((await db.user.findUniqueOrThrow({ where: { email: legacy.toUpperCase() } })).passwordHash, null);
  const reserved = "demo-owner@forge-ai.invalid";
  const reservedUser = await db.user.findUnique({ where: { email: reserved }, select: { id: true, passwordHash: true } });
  const reservedRegistration = await call("POST", "/auth/register", { body: { ...input, email: reserved.toUpperCase() } });
  assert.equal(reservedRegistration.status, 202);
  assert.deepEqual(reservedRegistration.body, registered.body);
  assert.deepEqual(await db.user.findUnique({ where: { email: reserved }, select: { id: true, passwordHash: true } }), reservedUser);

  const account = await db.user.findUniqueOrThrow({ where: { email }, include: { memberships: true } });
  owner = account.id;
  authDigest = account.passwordHash;
  assert.match(authDigest, /^\$argon2id\$/);
  assert.ok(await verify(authDigest, password));
  assert.deepEqual(account.memberships, []);
  const loginErrors = await Promise.all([
    call("POST", "/auth/login", { body: { email, password: "incorrect" } }),
    call("POST", "/auth/login", { body: { email: legacy, password } }),
    call("POST", "/auth/login", { body: { email: `missing-${suffix}@example.invalid`, password } }),
  ]);
  for (const result of loginErrors) {
    assert.equal(result.status, 401);
    assert.deepEqual(result.body, { error: "Invalid email or password." });
    assert.equal(result.headers.get("set-cookie"), null);
  }
});

test("stores only a token hash, restores and rotates sessions, rejects expired cookies and revokes on logout", async () => {
  const first = await signIn(email.toUpperCase());
  const set = first.headers.get("set-cookie");
  assert.match(set, /^__Host-forge_session=[A-Za-z0-9_-]{43};/);
  for (const part of ["HttpOnly", "Secure", "SameSite=Lax", "Path=/", "Max-Age=604800"]) assert.ok(set.includes(part));
  assert.ok(!set.includes("Domain="));
  assert.equal(first.headers.get("cache-control"), "no-store");
  const token = first.cookie.split("=")[1];
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const saved = await db.session.findUniqueOrThrow({ where: { tokenHash } });
  assert.equal(saved.userId, owner);
  assert.equal(saved.revokedAt, null);
  assert.ok(saved.expiresAt > saved.createdAt);
  assert.deepEqual(first.body, { data: { authenticated: true } });
  const me = await call("GET", "/auth/me", { session: first.cookie });
  assert.deepEqual(me.body, { data: { id: owner, name: "Test Owner", email } });
  assert.deepEqual((await call("GET", "/organizations", { session: first.cookie })).body, { data: [] });
  assert.equal((await call("GET", "/auth/me", { session: first.cookie + "; " + first.cookie })).status, 401);
  const rotated = await signIn(email, first.cookie);
  assert.notEqual(rotated.cookie, first.cookie);
  assert.equal((await call("GET", "/auth/me", { session: first.cookie })).status, 401);
  const rotatedHash = createHash("sha256").update(rotated.cookie.split("=")[1]).digest("hex");
  await db.session.update({ where: { tokenHash: rotatedHash }, data: { expiresAt: new Date(0) } });
  assert.equal((await call("GET", "/auth/me", { session: rotated.cookie })).status, 401);

  const live = await signIn();
  const logout = await call("POST", "/auth/logout", { session: live.cookie });
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get("set-cookie"), /^__Host-forge_session=;/);
  const liveHash = createHash("sha256").update(live.cookie.split("=")[1]).digest("hex");
  assert.ok((await db.session.findUniqueOrThrow({ where: { tokenHash: liveHash } })).revokedAt);
  assert.equal((await call("GET", "/organizations", { session: live.cookie })).status, 401);
  cookie = (await signIn()).cookie;
});

test("permits credentialed CORS only for the exact origin and blocks CSRF, including missing origins", async () => {
  const accepted = await call("GET", "/auth/me", { session: cookie });
  assert.equal(accepted.headers.get("access-control-allow-origin"), origin);
  assert.equal(accepted.headers.get("access-control-allow-credentials"), "true");
  const before = await db.organization.count({ where: { slug: `csrf-${suffix}` } });
  for (const from of [null, "null", origin + ".attacker.test", "https://other.forge.example.test"]) {
    for (const [path, body] of [
      ["/organizations", { name: "Blocked", slug: `csrf-${suffix}` }],
      ["/auth/logout", undefined],
      ["/auth/login", { email, password }],
      ["/auth/register", { email, name: "Blocked", password }],
    ]) {
      const blocked = await call("POST", path, { session: cookie, from, body });
      assert.equal(blocked.status, 403);
      assert.equal(blocked.headers.get("access-control-allow-origin"), null);
    }
  }
  assert.equal(await db.organization.count({ where: { slug: `csrf-${suffix}` } }), before);
  assert.equal((await call("GET", "/auth/me", { session: cookie })).status, 200);
  const preflight = await fetch(base + "/api/organizations", {
    method: "OPTIONS", headers: { origin, "access-control-request-method": "POST", "access-control-request-headers": "content-type" },
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), origin);
});

test("isolates every tenant route, enforces role permissions and blocks fixtures in production", async () => {
  assert.equal((await call("POST", "/organizations", {
    session: cookie, body: { name: "Reserved demo", slug: "forge-ai-demo" },
  })).status, 409);
  const created = await call("POST", "/organizations", { session: cookie, body: { name: "Owner Org", slug: `day7-${suffix}` } });
  assert.equal(created.status, 201);
  const org = created.body.data.id;
  organizations.push(org);
  assert.equal(created.body.data.role, "OWNER");
  const other = await db.organization.create({ data: { name: "Other Org", slug: `day7-other-${suffix}` } });
  organizations.push(other.id);

  const roleCookie = {};
  for (const [role, organizationId] of [["MEMBER", org], ["ADMIN", org], ["OWNER", other.id]]) {
    const address = `day7-${organizationId}-${role.toLowerCase()}@example.invalid`;
    users.push(address);
    await db.user.create({ data: { name: role, email: address, passwordHash: authDigest,
      memberships: { create: { role, organizationId } } } });
    roleCookie[role] = (await signIn(address)).cookie;
  }

  const projects = `/organizations/${org}/projects`;
  assert.equal((await call("POST", projects, { session: roleCookie.MEMBER, body: { name: "Denied" } })).status, 403);
  const project = await call("POST", projects, { session: roleCookie.ADMIN, body: { name: "Authorized" } });
  assert.equal(project.status, 201);
  const tasks = `/projects/${project.body.data.id}/tasks`;
  const task = await call("POST", tasks, { session: roleCookie.MEMBER, body: { title: "Member task" } });
  assert.equal(task.status, 201);
  const taskPath = `/tasks/${task.body.data.id}`;
  const scope = `?organizationId=${org}`;
  const runPath = taskPath + "/runs";
  assert.equal((await call("PATCH", taskPath, { session: roleCookie.MEMBER, body: { status: "DONE" } })).status, 200);
  for (const path of [runPath, runPath + "/llm", runPath + "/collaborate"]) {
    assert.equal((await call("POST", path + scope, { session: roleCookie.MEMBER, body: {} })).status, 403);
  }
  const run = await call("POST", runPath + scope, { session: roleCookie.ADMIN, body: {} });
  assert.equal(run.status, 201);
  const detail = `/runs/${run.body.data.id}`;
  assert.equal((await call("POST", detail + "/cancel" + scope, { session: roleCookie.MEMBER, body: {} })).status, 403);
  const endpoints = [
    ["GET", projects], ["POST", projects, { name: "Cross tenant" }],
    ["GET", tasks], ["POST", tasks, { title: "Cross tenant" }], ["PATCH", taskPath, { title: "Cross tenant" }],
    ["GET", runPath + scope], ["POST", runPath + scope, {}],
    ["POST", runPath + "/llm" + scope, {}], ["POST", runPath + "/collaborate" + scope, {}],
    ["POST", detail + "/cancel" + scope, {}],
    ...["", "/messages", "/events", "/llm-calls"].map((suffix) => ["GET", detail + suffix + scope]),
  ];
  for (const [method, path, body] of endpoints) {
    assert.equal((await call(method, path, { body })).status, 401, path);
    assert.equal((await call(method, path, { body, session: roleCookie.OWNER })).status, 404, path);
  }
  const outsiderScope = `?organizationId=${other.id}`;
  for (const path of [runPath, detail, detail + "/events", detail + "/messages", detail + "/llm-calls"]) {
    assert.equal((await call("GET", path + outsiderScope, { session: roleCookie.OWNER })).status, 404);
  }
  for (const path of [detail, detail + "/events", detail + "/messages", detail + "/llm-calls"]) {
    assert.equal((await call("GET", path + scope, { session: roleCookie.MEMBER })).status, 200);
  }
  assert.equal((await call("POST", detail + "/demo" + scope, { session: roleCookie.ADMIN, body: {} })).status, 404);
  assert.equal((await call("GET", "/agents")).status, 401);
  assert.equal((await call("GET", "/agents", { session: roleCookie.MEMBER })).status, 200);
  const visible = await call("GET", "/organizations", { session: roleCookie.OWNER });
  assert.deepEqual(visible.body.data.map(({ id }) => id), [other.id]);
  assert.equal(await db.planningJob.count({ where: { taskId: task.body.data.id } }), 0);
});

test("limits login and registration separately and ignores forged forwarding headers", async () => {
  const url = await listen();
  for (const [path, limit] of [["/auth/login", 10], ["/auth/register", 5]]) {
    for (let attempt = 1; attempt <= limit; attempt++) {
      const result = await call("POST", path, { url, body: {}, extra: { "x-forwarded-for": `192.0.2.${attempt}` } });
      assert.equal(result.status, 400);
    }
    const blocked = await call("POST", path, { url, body: {}, extra: { "x-forwarded-for": "192.0.2.100" } });
    assert.equal(blocked.status, 429);
    assert.ok(Number(blocked.headers.get("retry-after")) > 0);
  }
});
