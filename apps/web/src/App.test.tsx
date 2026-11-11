import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

const alpha = { id: "11111111-1111-4111-8111-111111111111", name: "Demo Alpha", slug: "alpha", role: "OWNER" };
const beta = { id: "22222222-2222-4222-8222-222222222222", name: "Demo Beta", slug: "beta", role: "MEMBER" };
const user = { id: "signed-in-user", name: "Test User", email: "tester@example.invalid" };
const project = { id: "33333333-3333-4333-8333-333333333333", organizationId: alpha.id, name: "Delivery Workspace", description: null, status: "ACTIVE" };
const task = { id: "44444444-4444-4444-8444-444444444444", projectId: project.id, title: "Write the delivery brief",
  description: "Define clear delivery requirements.", status: "IN_PROGRESS", priority: "HIGH", createdAt: "2026-11-10T00:00:00Z" };
const run = { id: "55555555-5555-4555-8555-555555555555", taskId: task.id, status: "COMPLETED", mode: "ALEX_MARCUS",
  isFixture: false, createdAt: task.createdAt, startedAt: task.createdAt, completedAt: task.createdAt, errorMessage: null };
const steps = [
  { id: "alex-step", agentRole: "ALEX", status: "COMPLETED", sequence: 1,
    output: { source: "LLM", independentlyVerified: false, plan: { summary: "Clarify the delivery scope", requirements: ["Document scope"] } }, errorMessage: null },
  { id: "marcus-step", agentRole: "MARCUS", status: "COMPLETED", sequence: 2,
    output: { source: "LLM", independentlyVerified: false, proposal: { architectureSummary: "Propose a service boundary", openQuestions: ["Which repository owns the change?"] } }, errorMessage: null },
];
const invocation = { id: "call", stepId: "alex-step", provider: "gemini", model: "gemini-test", modelVersion: null, status: "SUCCEEDED",
  latencyMs: null, inputTokens: null, outputTokens: null, errorCategory: null, estimatedCostUsd: null };
const agents = [
  { id: "ALEX", name: "Alex", role: "Project Manager", capabilities: ["Clarify requirements"] },
  { id: "MARCUS", name: "Marcus", role: "Software Architect", capabilities: ["Assess architecture"] },
  { id: "DEVON", name: "Devon", role: "Developer", capabilities: ["Implement changes"] },
  { id: "TESSA", name: "Tessa", role: "QA Engineer", capabilities: ["Plan verification"] },
  { id: "ELENA", name: "Elena", role: "Code Reviewer", capabilities: ["Review changes"] },
];
const json = (data: unknown, status = 200) => Response.json({ data }, { status });
const scoped = (path: string) => `${path}?organizationId=${alpha.id}`;
const runPath = `/api/runs/${run.id}`;
const trigger = scoped(`/api/tasks/${task.id}/runs/collaborate`);

function fixtureRoutes() {
  return new Map<string, () => Response | Promise<Response>>([
    ["GET /health", () => Response.json({ name: "FORGE AI", status: "ok", timestamp: task.createdAt })],
    ["GET /api/auth/me", () => json(user)],
    ["GET /api/organizations", () => json([alpha, beta])],
    [`GET /api/organizations/${alpha.id}/projects`, () => json([project])],
    [`GET /api/organizations/${beta.id}/projects`, () => json([])],
    [`GET /api/projects/${project.id}/tasks`, () => json([task])],
    ["GET /api/agents", () => json(agents)],
    [`GET ${scoped(`/api/tasks/${task.id}/runs`)}`, () => json([run])],
    [`GET ${scoped(runPath)}`, () => json({ ...run, steps })],
    [`GET ${scoped(runPath + "/messages")}`, () => json([{ id: "message", fromAgent: "ALEX", toAgent: "MARCUS",
      messageType: "HANDOFF", content: "Planning proposal handed off", createdAt: task.createdAt }])],
    [`GET ${scoped(runPath + "/events")}`, () => json([
      { id: "event-2", sequence: 2, eventType: "RUN_COMPLETED", createdAt: task.createdAt, payload: {} },
      { id: "event-1", sequence: 1, eventType: "RUN_CREATED", createdAt: task.createdAt, payload: {} },
    ])],
    [`GET ${scoped(runPath + "/llm-calls")}`, () => json([invocation])],
  ]);
}

let routes: ReturnType<typeof fixtureRoutes>;
let fetched: ReturnType<typeof vi.fn<typeof fetch>>;

beforeEach(() => {
  localStorage.clear();
  routes = fixtureRoutes();
  fetched = vi.fn<typeof fetch>(async (input, init) => {
    const url = new URL(String(input), "http://localhost");
    const key = `${init?.method ?? "GET"} ${url.pathname}${url.search}`;
    const handler = routes.get(key);
    return handler ? handler() : Response.json({ error: `Unexpected test request: ${key}` }, { status: 500 });
  });
  vi.stubGlobal("fetch", fetched);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function start(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[path]}><App /></MemoryRouter></QueryClientProvider>);
}

describe("workforce workspace", () => {
  it("restores an organization selection and persists changes", async () => {
    localStorage.setItem("forge-ai.organization", beta.id);
    start("/projects");
    expect(await screen.findByText("No projects in this organization")).toBeTruthy();
    const selector = screen.getByRole("combobox", { name: "Organization" }) as HTMLSelectElement;
    expect(selector.value).toBe(beta.id);
    fireEvent.change(selector, { target: { value: alpha.id } });
    expect(await screen.findByText(task.title, { selector: "h3" })).toBeTruthy();
    expect(localStorage.getItem("forge-ai.organization")).toBe(alpha.id);
  });

  it("loads project tasks and creates a task using the existing contract", async () => {
    const created = { ...task, id: "created-task", title: "Review the delivery brief", status: "TODO", priority: "MEDIUM" };
    routes.set(`POST /api/projects/${project.id}/tasks`, () => {
      routes.set(`GET /api/projects/${project.id}/tasks`, () => json([task, created]));
      return json(created, 201);
    });
    start("/projects");
    expect(await screen.findByText(task.description)).toBeTruthy();
    expect(screen.getByText("In progress")).toBeTruthy();
    expect(screen.getByText("High")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "New task" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Task title" }), { target: { value: created.title } });
    fireEvent.click(screen.getByRole("button", { name: "Create task" }));
    expect(await screen.findByText(created.title, { selector: "h3" })).toBeTruthy();
    const post = fetched.mock.calls.find(([, init]) => init?.method === "POST");
    expect(JSON.parse(String(post?.[1]?.body))).toEqual({ title: created.title, status: "TODO", priority: "MEDIUM" });
  });

  it("shows loading and useful empty organization guidance", async () => {
    let resolve!: (response: Response) => void;
    routes.set("GET /api/organizations", () => new Promise((done) => { resolve = done; }));
    start("/");
    expect(screen.getByText("Loading workspace…")).toBeTruthy();
    await waitFor(() => expect(resolve).toBeTypeOf("function"));
    resolve(json([]));
    expect(await screen.findByRole("heading", { name: "Create an organization" })).toBeTruthy();
    routes.set("POST /api/organizations", () => {
      routes.set("GET /api/organizations", () => json([alpha]));
      return json(alpha, 201);
    });
    fireEvent.change(screen.getByLabelText("Organization name"), { target: { value: alpha.name } });
    fireEvent.change(screen.getByLabelText("Organization slug"), { target: { value: alpha.slug } });
    fireEvent.click(screen.getByRole("button", { name: "Create organization" }));
    expect(await screen.findByRole("heading", { name: "Overview" })).toBeTruthy();
  });

  it("surfaces a task query failure and retries it", async () => {
    const key = `GET /api/projects/${project.id}/tasks`;
    routes.set(key, () => Response.json({ error: "Database unavailable" }, { status: 500 }));
    start("/projects");
    expect((await screen.findByRole("alert")).textContent).toContain("Database unavailable");
    routes.set(key, () => json([task]));
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText(task.description)).toBeTruthy();
  });

  it("makes one explicitly requested scoped collaboration call and opens the saved run", async () => {
    let resolve!: (response: Response) => void;
    routes.set("POST " + trigger, () => new Promise((done) => { resolve = done; }));
    start("/workforce");
    expect(await screen.findByRole("option", { name: task.title })).toBeTruthy();
    expect(fetched.mock.calls.filter(([, init]) => init?.method === "POST")).toHaveLength(0);
    const button = screen.getByRole("button", { name: "Run Alex → Marcus" });
    fireEvent.click(button);
    fireEvent.click(button);
    const pending = await screen.findByRole("button", { name: "Queuing collaboration…" }) as HTMLButtonElement;
    expect(pending.disabled).toBe(true);
    fireEvent.click(pending);
    const posts = fetched.mock.calls.filter(([, init]) => init?.method === "POST");
    expect(posts).toHaveLength(1);
    expect(new URL(String(posts[0][0])).pathname + new URL(String(posts[0][0])).search).toBe(trigger);
    expect(posts[0][1]?.body).toBe("{}");
    expect(new Headers(posts[0][1]?.headers).get("Idempotency-Key")).toMatch(/^[a-f0-9-]{36}$/);
    resolve(json({ run: { ...run, status: "PENDING" } }, 202));
    expect(await screen.findByText("Run context")).toBeTruthy();
  });

  it("polls a queued run and renders the saved attention-required result", async () => {
    const job = { queuedAt: run.createdAt, leaseExpiresAt: null, lastHeartbeatAt: null, recoveryCount: 0, attentionRequired: false };
    const route = `GET ${scoped(runPath)}`;
    routes.set(route, () => json({ ...run, status: "PENDING", steps: [], planningJob: job }));
    start(`/runs/${run.id}`);
    expect(await screen.findByText("Queued for a worker.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cancel run" })).toBeTruthy();
    routes.set(route, () => json({
      ...run, status: "FAILED", steps: [], errorMessage: "Provider outcome unknown.",
      planningJob: { ...job, recoveryCount: 1, attentionRequired: true },
    }));
    expect(await screen.findByText("Attention required", {}, { timeout: 4500 })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Cancel run" })).toBeNull();
  }, 8000);

  it("sends cancellation as a scoped mutation and refreshes run state", async () => {
    const job = { queuedAt: run.createdAt, leaseExpiresAt: null, lastHeartbeatAt: null, recoveryCount: 0, attentionRequired: false };
    const route = `GET ${scoped(runPath)}`;
    routes.set(route, () => json({ ...run, status: "PENDING", steps: [], planningJob: job }));
    routes.set(`POST ${scoped(runPath + "/cancel")}`, () => {
      const cancelled = { ...run, status: "CANCELLED", steps: [], planningJob: job };
      routes.set(route, () => json(cancelled));
      return json(cancelled);
    });
    start(`/runs/${run.id}`);
    fireEvent.click(await screen.findByRole("button", { name: "Cancel run" }));
    expect(await screen.findByText("Cancelled")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Cancel run" })).toBeNull();
  });

  it("offers a saved run link after a failed collaboration", async () => {
    routes.set("POST " + trigger, () => Response.json({
      error: "The backend could not reach Gemini (ECONNRESET).", runId: run.id, runStatus: "FAILED",
    }, { status: 503 }));
    routes.set(`GET ${scoped(runPath)}`, () => json({
      ...run, status: "FAILED", errorMessage: "Gemini is temporarily unavailable",
      steps: [{ ...steps[0], status: "FAILED", output: null }],
    }));
    start("/workforce");
    await screen.findByRole("option", { name: task.title });
    fireEvent.click(screen.getByRole("button", { name: "Run Alex → Marcus" }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("The backend could not reach Gemini (ECONNRESET).");
    expect(alert.textContent).toContain("This run was saved.");
    const savedRun = within(alert).getByRole("link", { name: "Open saved run" });
    expect(savedRun.getAttribute("href")).toBe(`/runs/${run.id}`);
    fireEvent.click(savedRun);
    expect(await screen.findByText("The Gemini request failed. The underlying cause was not recorded.")).toBeTruthy();
  });

  it("renders the saved plan, architecture proposal, handoff, and ordered events", async () => {
    start(`/runs/${run.id}`);
    expect(await screen.findByText("Clarify the delivery scope")).toBeTruthy();
    expect(screen.getByText("Propose a service boundary")).toBeTruthy();
    fireEvent.click(await screen.findByText("Messages & handoffs · 1"));
    expect(screen.getByText("Planning proposal handed off")).toBeTruthy();
    fireEvent.click(await screen.findByText("Event timeline · 2"));
    const created = screen.getByText("Run created");
    const completed = screen.getByText("Run completed");
    expect(created.compareDocumentPosition(completed) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("keeps missing usage unavailable and sums only reported counts", async () => {
    routes.set(`GET ${scoped(runPath + "/llm-calls")}`, () => json([invocation, {
      ...invocation, id: "reported-call", inputTokens: 160, outputTokens: 0,
    }]));
    start("/usage");
    const totals = await screen.findByRole("region", { name: "Usage totals" });
    expect(within(totals).getByText("160")).toBeTruthy();
    expect(within(totals).getByText("0")).toBeTruthy();
    expect(within(totals).getAllByText("1 of 2 invocations reported")).toHaveLength(2);
    expect(screen.getAllByText("Unavailable").length).toBeGreaterThan(2);
  });

  it("labels real execution and identity-only roles separately", async () => {
    start("/workforce");
    expect(await screen.findAllByText("Real LLM execution")).toHaveLength(2);
    expect(screen.getAllByText("Identity / demo only")).toHaveLength(3);
    expect(screen.getByText("Assess architecture")).toBeTruthy();
  });

  it("lets an administrator browse and select an installed repository", async () => {
    const path = `/api/organizations/${alpha.id}/github`;
    const entry = { id: "installation", account: "acme", revokedAt: null, repositories: [] };
    routes.set("GET " + path, () => json([entry]));
    const catalog = path + "/installation/repositories";
    routes.set("GET " + catalog + "?page=1", () => json({ hasMore: false,
      repositories: [{ githubId: "25", fullName: "acme/example", defaultBranch: "main", private: true }] }));
    routes.set("POST " + catalog, () => json({ id: "repo", fullName: "acme/example" }, 201));
    start("/github");
    fireEvent.click(await screen.findByRole("button", { name: "Browse repositories" }, { timeout: 5000 }));
    fireEvent.click(await screen.findByRole("button", { name: "Select repository" }));
    expect(await screen.findByText("Repository selected.")).toBeTruthy();
    const post = fetched.mock.calls.find(([url, init]) => String(url).endsWith(catalog) && init?.method === "POST");
    expect(JSON.parse(String(post?.[1]?.body))).toEqual({ githubRepositoryId: "25" });
  });

  it("renders only persisted graph work, its dependency and ticket blocker", async () => {
    const path = `/api/organizations/${alpha.id}/workforce`;
    routes.set("GET " + path + "/workers", () => json([]));
    const ticket = { id: "ticket", requirement: "Deliver the graph", priority: "HIGH", status: "BLOCKED" };
    const baseNode = { source: "ASSIGNMENT", ticketId: "ticket", task: null, startedAt: null, completedAt: null, error: null };
    routes.set("GET " + path + `/projects/${project.id}/graph`, () => json({
      tickets: [ticket], ticket: { ...ticket, owner: "Project owner", progress: { completed: 1, total: 2 },
        blockers: [{ id: "b", reason: "Needs a decision" }], events: [] },
      nodes: [
        { ...baseNode, id: "a", name: "Planner", role: "PM", status: "COMPLETED", blockedReason: null, progress: { completed: 1, total: 1 } },
        { ...baseNode, id: "b", name: "Reviewer", role: "REVIEWER", status: "BLOCKED", blockedReason: "Needs a decision", progress: { completed: 0, total: 1 } },
      ],
      edges: [{ id: "edge", fromId: "a", toId: "b", kind: "DEPENDENCY" }], planningRun: null,
    }));
    start("/graph");
    expect(await screen.findByRole("img", { name: "Persisted workforce dependencies and handoffs" }, { timeout: 5000 })).toBeTruthy();
    expect(within(screen.getByRole("list", { name: "Graph edges" })).getByText("Planner → Reviewer · Dependency")).toBeTruthy();
    expect(screen.getByText("1 of 2 assignments completed")).toBeTruthy();
    expect(screen.getByText("Needs a decision")).toBeTruthy();
  });
});
