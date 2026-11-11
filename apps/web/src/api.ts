import type { ApiErrorResponse, ApiResponse, AuthUser, HealthResponse } from "@forge-ai/shared";

export interface Organization { id: string; name: string; slug: string; role: "OWNER" | "ADMIN" | "MEMBER" }
export interface Repository { id: string; fullName: string; defaultBranch: string | null; private: boolean }
export interface GitHubConnection { id: string; account: string; revokedAt: string | null; repositories: Repository[] }
export interface Project {
  id: string; organizationId: string; name: string; description: string | null; status: string;
  githubRepository?: (Repository & { installation: { revokedAt: string | null } }) | null;
}
export const workerRoles = ["PM", "ARCHITECT", "DESIGNER", "DEVELOPER", "QA", "REVIEWER"] as const;
export interface Worker { id: string; name: string; role: typeof workerRoles[number]; enabled: boolean }
type Progress = { completed: number; total: number };
interface TicketSummary { id: string; requirement: string; status: string; priority: string }
export interface Graph {
  tickets: TicketSummary[];
  ticket: (TicketSummary & { owner: string; progress: Progress; blockers: { id: string; reason: string }[];
    events: { id: string; kind: string; createdAt: string; payload: Record<string, unknown> }[] }) | null;
  nodes: { id: string; name: string; role: string; source: "ASSIGNMENT" | "PLANNING"; ticketId: string | null;
    task: { id: string; title: string } | null; status: string; startedAt: string | null; completedAt: string | null;
    blockedReason: string | null; error: string | null; progress: Progress }[];
  edges: { id: string; fromId: string; toId: string; kind: "DEPENDENCY" | "HANDOFF" }[];
  planningRun: { id: string; status: Run["status"] } | null;
}
export const taskStatuses = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"] as const;
export const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export interface NewTask {
  title: string;
  description?: string;
  status: typeof taskStatuses[number];
  priority: typeof priorities[number];
}
export interface Task extends Omit<NewTask, "description"> {
  id: string;
  projectId: string;
  description: string | null;
  createdAt: string;
}
export interface Agent { id: string; name: string; role: string; capabilities: string[] }
export interface Run {
  id: string;
  taskId: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  mode: "ALEX_SINGLE_AGENT" | "ALEX_MARCUS" | null;
  isFixture: boolean;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  planningJob?: {
    queuedAt: string;
    leaseExpiresAt: string | null;
    leaseExpired?: boolean;
    lastHeartbeatAt: string | null;
    recoveryCount: number;
    attentionRequired: boolean;
  } | null;
}
export interface Step {
  id: string;
  agentRole: string;
  status: string;
  sequence: number;
  output: Record<string, unknown> | null;
  errorMessage: string | null;
}
export interface RunDetail extends Run { steps: Step[] }
export interface Message {
  id: string;
  fromAgent: string;
  toAgent: string | null;
  messageType: string;
  content: string;
  createdAt: string;
}
export interface RunEvent { id: string; sequence: number; eventType: string; createdAt: string; payload: unknown }
export interface Invocation {
  id: string;
  stepId: string;
  provider: string;
  model: string;
  modelVersion: string | null;
  status: string;
  latencyMs: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedCostUsd: string | null;
  errorCategory: string | null;
}
interface Collaboration { run: Run }

const base = (import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:3000" : "")).replace(/\/$/, "");
export const sessionEvents = new EventTarget();

export class ApiError extends Error {
  constructor(readonly status: number, readonly details?: Partial<ApiErrorResponse>) {
    super(status === 0 ? "The API could not be reached. Check that the backend is running." :
      details?.error ?? `The API returned HTTP ${status}.`);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, signal?: AbortSignal, body?: object, headers?: Record<string, string>, method = body ? "POST" : "GET"): Promise<T> {
  let response: Response;
  try {
    response = await fetch(base + path, {
      signal,
      credentials: "include",
      method,
      headers: body ? { "content-type": "application/json", ...headers } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError(0);
  }
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && path.startsWith("/api/") && !path.startsWith("/api/auth/")) {
      sessionEvents.dispatchEvent(new Event("expired"));
    }
    const details = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
      ? payload as ApiErrorResponse : undefined;
    throw new ApiError(response.status, details);
  }
  if (!payload || typeof payload !== "object") throw new Error("The API returned an unexpected response.");
  return payload as T;
}

async function data<T>(path: string, signal?: AbortSignal, body?: object, headers?: Record<string, string>, method?: string): Promise<T> {
  const envelope = await request<ApiResponse<T>>("/api" + path, signal, body, headers, method);
  if (!("data" in envelope)) throw new Error("The API response did not contain data.");
  return envelope.data;
}

const id = encodeURIComponent;
const githubPath = (org: string) => `/organizations/${id(org)}/github`;
const workforcePath = (org: string) => `/organizations/${id(org)}/workforce`;
const scope = (organizationId: string) => "?" + new URLSearchParams({ organizationId });
const runPath = (runId: string, organizationId: string, suffix = "") =>
  `/runs/${id(runId)}${suffix}${scope(organizationId)}`;

function enqueue(task: string, org: string, route: "llm" | "collaborate", key: string, acknowledged = false) {
  return data<Collaboration>(`/tasks/${id(task)}/runs/${route}${scope(org)}`, AbortSignal.timeout(10_000), {}, {
    "Idempotency-Key": key,
    ...(acknowledged && { "Acknowledge-Unknown-Outcome": "true" }),
  });
}

export const api = {
  githubConnections: (org: string, signal: AbortSignal) => data<GitHubConnection[]>(githubPath(org), signal),
  connectGitHub: (org: string, githubInstallationId: string) => data<GitHubConnection>(githubPath(org), undefined, { githubInstallationId }),
  githubCatalog: (org: string, installation: string, page: number, signal: AbortSignal) =>
    data<{ hasMore: boolean; repositories: (Omit<Repository, "id"> & { githubId: string })[] }>(
      githubPath(org) + `/${id(installation)}/repositories?page=${page}`, signal),
  selectRepository: (org: string, installation: string, githubRepositoryId: string) =>
    data<Repository>(githubPath(org) + `/${id(installation)}/repositories`, undefined, { githubRepositoryId }),
  linkRepository: (org: string, project: string, repositoryId: string | null) =>
    data(githubPath(org) + `/projects/${id(project)}`, undefined, { repositoryId }, undefined, "PATCH"),
  graph: (org: string, project: string, ticket: string, signal: AbortSignal) => data<Graph>(
    workforcePath(org) + `/projects/${id(project)}/graph` + (ticket ? "?ticketId=" + id(ticket) : ""), signal),
  workers: (org: string, signal: AbortSignal) => data<Worker[]>(workforcePath(org) + "/workers", signal),
  createWorker: (org: string, name: string, role: string) =>
    data<Worker>(workforcePath(org) + "/workers", undefined, { name, role }),
  createTicket: (org: string, project: string, requirement: string) =>
    data<TicketSummary>(workforcePath(org) + `/projects/${id(project)}/tickets`, undefined, { requirement }),
  assignWorker: (org: string, project: string, ticket: string, workerId: string) =>
    data(workforcePath(org) + `/projects/${id(project)}/tickets/${id(ticket)}/assignments`, undefined, { workerId }),
  async me(signal: AbortSignal) {
    try { return await data<AuthUser>("/auth/me", signal); }
    catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  },
  login: (input: { email: string; password: string }) => data<{ authenticated: true }>("/auth/login", undefined, input),
  register: (input: { name: string; email: string; password: string }) =>
    data<{ message: string }>("/auth/register", undefined, input),
  logout: () => data<{ authenticated: false }>("/auth/logout", undefined, {}),
  async health(signal: AbortSignal) {
    const response = await request<HealthResponse>("/health", AbortSignal.any([signal, AbortSignal.timeout(5000)]));
    if (response.name !== "FORGE AI" || response.status !== "ok") throw new Error("Unexpected health response.");
    return response;
  },
  organizations: (signal: AbortSignal) => data<Organization[]>("/organizations", signal),
  createOrganization: (input: { name: string; slug: string }) => data<Organization>("/organizations", undefined, input),
  projects: (org: string, signal: AbortSignal) => data<Project[]>(`/organizations/${id(org)}/projects`, signal),
  tasks: (project: string, signal: AbortSignal) => data<Task[]>(`/projects/${id(project)}/tasks`, signal),
  createTask: (project: string, task: NewTask) => data<Task>(`/projects/${id(project)}/tasks`, undefined, task),
  agents: (signal: AbortSignal) => data<Agent[]>("/agents", signal),
  runs: (task: string, org: string, signal: AbortSignal) => data<Run[]>(`/tasks/${id(task)}/runs${scope(org)}`, signal),
  run: (run: string, org: string, signal: AbortSignal) => data<RunDetail>(runPath(run, org), signal),
  messages: (run: string, org: string, signal: AbortSignal) => data<Message[]>(runPath(run, org, "/messages"), signal),
  events: (run: string, org: string, signal: AbortSignal) => data<RunEvent[]>(runPath(run, org, "/events"), signal),
  invocations: (run: string, org: string, signal: AbortSignal) =>
    data<Invocation[]>(runPath(run, org, "/llm-calls"), signal),
  collaborate: (task: string, org: string, key: string) => enqueue(task, org, "collaborate", key),
  restartPlanning: (task: string, org: string, mode: NonNullable<Run["mode"]>, key: string) =>
    enqueue(task, org, mode === "ALEX_SINGLE_AGENT" ? "llm" : "collaborate", key, true),
  cancelRun: (run: string, org: string) => data<Run>(runPath(run, org, "/cancel"), AbortSignal.timeout(10_000), {}),
};
