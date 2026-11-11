# FORGE AI

FORGE AI coordinates AI agents across software delivery tasks. This workspace includes authenticated organizations, projects and tasks, persistent execution history, and an Alex → Marcus planning workflow backed by Gemini.

| Path | Role |
| --- | --- |
| `apps/web` | React, Vite, and TanStack Query; sign-in, workspace pages, and run history |
| `apps/api` | Express API, Prisma services, authentication, and execution orchestration |
| `packages/shared` | Shared API contracts |
| `infrastructure/compose.yaml` | Optional local PostgreSQL 17 with a persistent volume |

## Local setup

Use Node.js 22.12+ or 24+, npm, and PostgreSQL 17. From the repository root:

```powershell
npm ci
# On a fresh checkout only:
Copy-Item .env.example .env
# Start PostgreSQL first, using your existing installation or the optional Compose setup.
npm run db:migrate:deploy
npm run db:seed  # Optional, only for a local demo database
npm run dev
```

Start a planning worker in a second terminal against the same database:

```powershell
npm run dev:worker
```

The API accepts runs while the worker is offline. They stay queued until a worker starts. For a built deployment, run `npm run build`, then start the API and `npm run start:worker` as separate processes.

Open [FORGE AI](http://localhost:5173). Register, then sign in. Registration starts with no memberships. Create an organization in the workspace to become its first owner, or follow the local demo claim below to access existing history. Run `npm run dev:web` or `npm run dev:api` to start either application separately.

| Setting | Purpose |
| --- | --- |
| `DATABASE_URL` | Server-only PostgreSQL connection URL |
| `POSTGRES_PASSWORD` | Password used only when initializing a fresh Compose volume; match the password in `DATABASE_URL` |
| `API_PORT` | API loopback port (default `3000`) |
| `FRONTEND_ORIGIN` | One exact browser origin (default `http://localhost:5173`); no trailing slash; HTTPS required in production |
| `VITE_API_URL` | Browser API base, default `http://localhost:3000` in dev and same-origin for a production build |
| `NODE_ENV` | Runtime environment; set to `development` for the local demo claim |
| `ENABLE_DEMO_FIXTURES` | Defaults off; `true` enables the authenticated fixture route only in development or test |
| `LLM_PROVIDER`, `LLM_MODEL`, `GEMINI_API_KEY` | Server-only Gemini configuration; the example uses `gemini-3.1-flash-lite` |

Keep database and provider credentials in the ignored root `.env`. Never put secrets in Vite configuration. When using the default frontend URL, use **localhost** for the browser-facing API too: a `127.0.0.1` API and a `localhost` frontend are different sites for the session cookie. PostgreSQL can continue using `127.0.0.1`. For HTTPS deployment, put the UI and API on the same site, preferably behind one origin. The app itself listens on loopback.

### PostgreSQL on Windows

This checkout uses existing PostgreSQL 17.11 binaries under `%LOCALAPPDATA%\FORGE-AI\postgresql-17.11\bin` and the existing `.local\postgres` cluster. Keep the existing data directory and credentials. Check whether it is running and start it only if needed. Run the final line in its own PowerShell window and leave it open.

```powershell
$pgBin = Join-Path $env:LOCALAPPDATA 'FORGE-AI\postgresql-17.11\bin'
$pgData = Join-Path (Get-Location).Path '.local\postgres'
& (Join-Path $pgBin 'pg_ctl.exe') -D $pgData status
& (Join-Path $pgBin 'postgres.exe') -D $pgData -h 127.0.0.1 -p 55432
```

For a planned shutdown when no work is active, use `& (Join-Path $pgBin 'pg_ctl.exe') -D $pgData -m fast -w stop`. If using Docker instead, `npm run db:up` waits for readiness and `npm run db:down` retains the volume. Never initialize a new cluster over existing data.

## Authentication and existing data

| Method and path | Behavior |
| --- | --- |
| `POST /api/auth/register` | Accepts `name`, `email`, and `password`. Returns the same 202 response for a new or already reserved email. Does not log in or grant memberships. |
| `POST /api/auth/login` | Accepts `email` and `password`. Returns an opaque session cookie. Missing accounts and incorrect credentials get the same 401. |
| `GET /api/auth/me` | Restores a verified session and returns public account fields, or 401. |
| `POST /api/auth/logout` | Revokes the current session in PostgreSQL and clears the cookie. Safe to repeat. |

Passwords are 15–128 characters on registration and hashed with Argon2id (19 MiB, two iterations, one lane). The API trims and lowercases emails and enforces uniqueness across normalized legacy and new addresses. Login and registration have separate per-peer limits (10 and 5 attempts in 15 minutes, respectively). Client-supplied forwarding headers are ignored.

Session cookies contain a random 256-bit token, are HttpOnly and SameSite=Lax, and use Secure with the `__Host-` prefix in production. PostgreSQL stores the SHA-256 token digest, never the token itself. Sessions expire after seven days and can be revoked; a successful login rotates the current cookie if present. The frontend sends credentials and never stores passwords or tokens in browser storage. It clears cached workspace data on logout or an authorization failure indicating session expiry. Auth and tenant responses are not cacheable. Credentialed CORS permits only `FRONTEND_ORIGIN`, and every state-changing API request also requires that exact `Origin` header, including login, registration, and logout. Missing or mismatched origins are rejected.

Migration `20261110150000_auth_sessions` adds a nullable password hash, a normalized email index, a session table, and a demo claim marker. It does not rewrite existing users or delete tenant records. If an older database contains emails that collide after normalization, deployment stops instead of merging accounts; resolve ownership before retrying.

### One-time local demo claim

The seeded user is deliberately unable to log in. The seed preserves existing organizations, projects, tasks, and runs when repeated. To access the existing demo as a real account:

1. Apply migrations and start the app in development mode against the local demo database. Run `npm run db:seed` only if the seed is absent.
2. Register and sign in to the account **you control**. Verify you can sign in before granting it demo ownership. Never use the reserved seeded email.
3. In a local terminal with access to the same loopback database, run `npm run db:claim-demo -- <registered-email>`. No password or claim token is accepted on the command line.
4. Reload the app. Select **FORGE AI Demo** if more than one organization appears.

The command requires direct database access, development mode, the existing seeded owner, and an unclaimed demo organization without a credentialed owner. It adds the selected account as owner and marks the organization claimed in one transaction. It preserves the seeded identity, task assignments, and execution history. There is no HTTP claim endpoint.

## Authorization and API

Every workspace API requires a verified session. The organization list returns only memberships for that session; creating an organization atomically adds the creator as OWNER. The API derives the caller from the session and does not accept a user ID as the caller. A task's assignee is a separate field and must belong to the same organization.

| Action | OWNER | ADMIN | MEMBER |
| --- | --- | --- | --- |
| Read organization projects, tasks, runs, messages, events, and invocation metadata | Yes | Yes | Yes |
| Create or update tasks | Yes | Yes | Yes |
| Create projects, create runs, or start or cancel either LLM workflow | Yes | Yes | No |
| Execute the deterministic fixture, when enabled | Yes | Yes | No |

Missing sessions return 401, nonmember resource access returns 404, and members missing the necessary role receive 403. Mutations require JSON where a body is expected. Success uses `{"data": ...}`; errors use `{"error": "..."}` with optional field issues or a saved run ID. Health endpoints remain public.

| Method and path | Result |
| --- | --- |
| `GET /health`, `GET /health/db` | API liveness and PostgreSQL readiness |
| `GET /api/organizations`, `POST /api/organizations` | List memberships or create an organization with `name` and lowercase, hyphenated `slug` |
| `GET/POST /api/organizations/:organizationId/projects` | List or create projects (`name`, optional `description`, `status`) |
| `GET/POST /api/projects/:projectId/tasks` | List or create tasks (`title`, optional `description`, `status`, `priority`, `assigneeId`) |
| `PATCH /api/tasks/:taskId` | Update one or more task fields |
| `GET /api/agents` | Fixed agent directory |
| `GET/POST /api/tasks/:taskId/runs` | List runs or create a pending fixture candidate outside the planning queue |
| `POST /api/tasks/:taskId/runs/llm` | Enqueue Alex alone |
| `POST /api/tasks/:taskId/runs/collaborate` | Enqueue Alex → Marcus sequentially |
| `GET /api/runs/:runId` | Status, structured checkpoints, and safe lease and recovery information |
| `POST /api/runs/:runId/cancel` | Cancel an active planning run. A terminal run returns 409. |
| `GET /api/runs/:runId/events`, `/messages`, `/llm-calls` | Run audit trail, messages and handoffs, or invocation metadata |
| `POST /api/runs/:runId/demo` | Complete a pending run with deterministic fixture data; unavailable in production |

All task-run and run routes require `?organizationId=<uuid>`. This filter must identify a membership and match the actual resource through Task → Project → Organization. Run POSTs take an empty JSON object. Use the signed-in browser for the API, or obtain a session with a cookie jar and supply the exact frontend origin header on mutations. For example, from the browser developer console while signed in locally:

```js
await fetch("http://localhost:3000/api/organizations", { credentials: "include" }).then(r => r.json())
```

## Durable planning and recovery

Migration `20261110160000_durable_planning` adds the `PlanningJob` table, `RUN_RECOVERED` events and the `UNKNOWN` invocation status. It leaves existing runs and audit data in place. Stop any previous API version before deploying the migration so it cannot still start synchronous runs. Pre-Day-8 runs without a queue job are never picked up by the worker. If an old planning run was left active, inspect its audit history and use the authorized cancellation endpoint to release the task.

Launches return HTTP 202 with `data.run` and a `Location` header. Send an `Idempotency-Key` of 1–128 ASCII letters, digits, dots, underscores, tildes, or hyphens. An identical replay returns HTTP 200 and the current state of the same run. Keys are hashed and scoped to the verified user, organization, and task. Reusing a key for the other workflow mode returns 409. Keep the key if the response is lost. A request without a key still obeys the database's one-active-run-per-task rule but cannot replay a terminal run.

The worker has two slots per process. PostgreSQL assigns each claim a random fencing token under a row lock using `FOR UPDATE SKIP LOCKED`. A lease lasts 15 seconds and renews every 3 seconds using the database clock. Only the current, unexpired lease can commit a step or invocation. Provider calls run outside database transactions. Workspace reads expose queue time, heartbeat, lease expiry, checkpoint, recovery count, and attention state to members. Internal lease tokens, actor IDs, key hashes and saved task context are excluded.

Alex's validated plan, completed step, handoff, and pending Marcus step commit together. A replacement worker resumes from that checkpoint and sends only the Marcus call. A persisted call intent without an outcome is treated as `UNKNOWN` even if the worker died just before dispatch. Recovery records that outcome, fails the run with an attention state, and never resends the call. After reviewing provider usage, an owner or admin can start a new run from the saved run page. API clients should use a fresh idempotency key and must send `Acknowledge-Unknown-Outcome: true` when the latest durable run for the task has an unknown invocation. Replaying the original key returns the original run. A new run begins from Alex and may incur new charges.

Cancellation is a database transaction. It revokes the lease, closes outstanding records and preserves completed steps. The worker notices on its next heartbeat and signals abort to Gemini. A late result cannot overwrite the cancelled run. Cancellation cannot guarantee stopping or refunding an already submitted provider request.

Workers may process a job more than once across leases. The fencing token protects local commits, and an interrupted external request is never automatically repeated during recovery. There is no exactly-once guarantee for external effects. The Gemini adapter's existing bounded retries for explicit HTTP 429 and 5xx responses still apply within a live invocation. Concurrency limits are per worker process. Capacity, alerting, and reconciliation of unknown provider charges remain operator responsibilities.

PostgreSQL enforces one pending or running run per task. Run changes and associated events use transactions and row locks for stable ordering. Terminal runs are immutable through the workflow services. Alex's validated planning proposal is committed before the handoff to Marcus. Both provider calls run outside database transactions. If Alex fails, Marcus is not invoked; if Marcus fails, Alex's output and the handoff remain available. The fixture produces labeled steps, messages and events without any provider calls, code changes, or tool execution.

Gemini requests use versioned instructions and bounded, redacted task context. Neither agent inspects repositories, and proposals are independently unverified. The dashboard preserves Overview, Projects, AI Workforce, Agent Runs, and Usage; it shows only the chosen membership's resources. Usage sums reported tokens only, and missing counts and prices remain unknown.

Once accepted, planning failures appear on the saved run. Review the sanitized invocation category and `LLM_CALL_FINISHED` diagnostic for quota, timeout, access, model, upstream response, and connection failures. The backend excludes raw provider errors, session cookies, credentials, and request bodies from its logs.

## Checks and remaining security work

```powershell
npm run db:validate
npm run typecheck
npm run build
npm run test:web
# In a separate shell, set DATABASE_URL to an existing disposable test database first.
npm run db:migrate:deploy
$env:TEST_DATABASE_URL = $env:DATABASE_URL
npm test
Invoke-RestMethod http://localhost:3000/health
Invoke-RestMethod http://localhost:3000/health/db
```

The backend suite uses real HTTP and PostgreSQL with mocked LLMs. Do not point tests at your application database. For local migration authoring only, use `npm run db:migrate:dev -- --name <change>` with a suitable shadow database. Use `db:migrate:deploy` for existing migrations. Do not reset a database containing history.

The planning tests start separate Node worker processes with mocked providers and short leases. They kill one process after Alex commits and another during a provider call, let PostgreSQL expire the leases, then start replacement processes. Assertions cover the preserved checkpoint, the exact agent dispatched after restart, and the unknown invocation with no second dispatch. Run the full backend suite using the migrated disposable database above.

Day 7 adds access control, not production readiness. Email ownership verification, account recovery, invitation and role management, session cleanup and account-wide revocation, distributed throttling, abuse monitoring, MFA, and deployment hardening are still needed. The fixed-window limit is per process and per socket peer; behind a reverse proxy it groups requests unless a trusted edge applies its own limits. Add user-level LLM quotas, stronger redaction and retention controls before accepting sensitive task context. Keep PostgreSQL and the API private behind a properly configured HTTPS deployment.

## Day 9: read-only GitHub and workforce graph

Apply the additive `20261111120000_repository_workforce` migration with `npm run db:migrate:deploy`. It adds the GitHub, worker, ticket, assignment, dependency and event tables, a tenant-scoped project link, and the `REPOSITORY_OBSERVED` event. Existing runs, plans, sessions and task data are preserved. `WorkforceRole` models job functions; the existing `AgentRole` identities are unchanged.

### GitHub App setup

1. In GitHub **Settings → Developer settings → GitHub Apps**, register an app. Set repository permissions to **Metadata: Read-only** and **Contents: Read-only**. Leave other permissions unset and disable webhooks for this version. A homepage URL is required by GitHub; use your project homepage. No OAuth callback or user token is used.
2. Generate a private key and keep the PEM outside the repository. On the app's **Install App** page, install it on a test GitHub account or organization and choose **Only select repositories**. Open the installation settings and copy the numeric installation ID from its URL. Separately record the app's numeric **App ID** from the app settings.
3. Sign in to Forge and select the target organization. Find its UUID from the organization list API or the browser's organization selector. Have the server operator set `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY_PATH` (absolute path accessible to both processes), and `GITHUB_INSTALLATION_BINDINGS` in the ignored root `.env`. The binding is JSON, for example `{"12345":"11111111-1111-4111-8111-111111111111"}`. Verify GitHub installation ownership before approving the binding. Restart the API and worker after changing it.
4. Start the API/UI with `npm run dev` and, in a second terminal, start `npm run dev:worker`. As a Forge owner or admin open **GitHub** at [the local GitHub screen](http://localhost:5173/github). Enter the installation ID and choose **Connect installation**, **Browse repositories**, then **Select repository**. In **Link a project**, pick the project and repository and save.
5. Open **Projects** and confirm the linked name and default branch. Open **AI Workforce**, select a task in that project, and launch Alex → Marcus once. In the saved run, open **Observed repository evidence** and verify the commit, paths and configuration keys. The agent proposals are separate from the observed facts.
6. To verify negative cases, try the same installation with an unbound Forge organization, then try selecting or linking with a member session. Those operations must be denied. Select an empty test repo to see the explicit no-commits result. Suspend or uninstall the test installation and browse again to see HTTP 410; a newly queued linked run should fail before dispatching an agent. Historical evidence stays in run history. Unlink a project to return to repository-independent planning.

GitHub tokens are minted on demand, scoped to a selected repository for repository reads, and kept in memory only. An expired credential is replaced once. Revocation is discovered on access, so the stored indication reflects the last check. Removing the operator binding also denies future reads. The adapter calls only GitHub's fixed API host, refuses redirects, and only writes to GitHub's token-mint endpoint. It ranks files against the task title and description and fetches at most seven regular files of up to 64 KiB each from a pinned commit. Backend tasks prioritize Prisma schemas, routes, services, and migrations. The worker sends up to 9,500 characters of serialized repository evidence, including paths, byte counts, allowlisted configuration keys, and selected declarations. The saved run reports whether schema, route, and service declarations were observed. GitHub planning can only see committed files in the connected repository. Missing evidence is a coverage gap, and an unpublished local backend remains outside the snapshot. Raw source, config values, keys and tokens are neither stored as repository evidence nor logged. Paths and repository metadata can still be sensitive; connect only repositories whose metadata may be sent to the configured provider. The worker rechecks repository access before Marcus, including after a restart. Large trees exceeding the response budget fail safely. No repository code is executed.

- [GitHub App repository permissions](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app)
- [GitHub App installation tokens](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app)

### Workforce and coding contract

Open **Workflow graph**, select a project, add two workers (they can share a role), create a ticket, and assign both. The graph shows those stored assignments and the latest non-fixture planning run for the project. A configured worker without an assignment has no graph node. Ticket details show the owner, events, blockers and completed assignment counts. Assignment status changes are reported by an authorized operator and do not start a coding engine.

For a full manual dependency check, use the authenticated API from the signed-in browser. Set `org`, `project`, `ticket`, `first`, and `second` to the UUIDs of the organization, project, ticket, and two assignments. Retrieve assignments and tickets with `GET /api/organizations/:org/workforce/projects/:project/graph`, optionally with `?ticketId=:ticket`. Filter the nodes to `source === "ASSIGNMENT"` for assignment IDs. Run:

```js
const path = `http://localhost:3000/api/organizations/${org}/workforce/projects/${project}/tickets/${ticket}`;
async function write(method, suffix, body) {
  const response = await fetch(path + suffix, {
    method, credentials: "include", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}
await write("POST", "/edges", { fromId: first, toId: second, kind: "DEPENDENCY" }); // 201
await write("PATCH", "/assignments/" + second, { status: "RUNNING" }); // 409: dependency incomplete
await write("PATCH", "/assignments/" + first, { status: "RUNNING" }); // 200
await write("PATCH", "/assignments/" + first, { status: "COMPLETED" }); // 200
await write("POST", "/edges", { fromId: first, toId: second, kind: "HANDOFF" }); // 201
await write("PATCH", "/assignments/" + second, { status: "BLOCKED", blockedReason: "Waiting for review input" }); // 200
```

The graph should show a dependency and a handoff, one completed assignment, and the blocker after its next refresh. The workforce API also exposes `GET/POST /workers`, `PATCH /workers/:workerId` (role, configuration or enabled state), `POST /projects/:projectId/tickets`, and `PATCH /projects/:projectId/tickets/:ticketId` under `/api/organizations/:organizationId/workforce`. Organization members can read; owners and admins can mutate.

The `CodingExecutor` TypeScript contract defines isolation input, event streaming, changes, test results, status, cancellation and recovery. Its in-memory implementation exists only in contract tests. Provider selection, sandbox provisioning, scheduling coding assignments, GitHub writes, and webhook-driven revocation are future work. Automated GitHub tests mock the upstream API, and planning tests use a mocked LLM. A real GitHub smoke test requires the setup above.
