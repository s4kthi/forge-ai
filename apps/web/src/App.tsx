import { lazy, Suspense, useEffect, useState } from "react";
import { useIsMutating, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthUser } from "@forge-ai/shared";
import { Activity, Box, ChartNoAxesColumn, FolderKanban, LayoutGrid, Workflow } from "lucide-react";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router";
import { api, sessionEvents } from "./api";
import { Overview, Runs, Usage } from "./pages/Activity";
import { Projects } from "./pages/Projects";
import { RunDetails } from "./pages/RunDetails";
import { Workforce } from "./pages/Workforce";
import { SignIn } from "./pages/SignIn";
import { collaborationKey } from "./queries";
import { Loading, Problem } from "./ui";
import type { FormEvent } from "react";

const WorkforceGraph = lazy(() => import("./pages/WorkforceGraph").then(({ WorkforceGraph }) => ({ default: WorkforceGraph })));
const GitHub = lazy(() => import("./pages/GitHub").then(({ GitHub }) => ({ default: GitHub })));
const organizationKey = "forge-ai.organization";
const navigation = [
  { name: "Overview", path: "/", icon: LayoutGrid },
  { name: "Projects", path: "/projects", icon: FolderKanban },
  { name: "AI Workforce", path: "/workforce", icon: Workflow },
  { name: "Workflow graph", path: "/graph", icon: Workflow },
  { name: "GitHub", path: "/github", icon: FolderKanban },
  { name: "Agent Runs", path: "/runs", icon: Activity },
  { name: "Usage", path: "/usage", icon: ChartNoAxesColumn },
];

function savedOrganization() {
  try { return localStorage.getItem(organizationKey); } catch { return null; }
}

const sessionKey = ["session"] as const;

export function App() {
  const client = useQueryClient();
  const [expired, setExpired] = useState(false);
  const session = useQuery({ queryKey: sessionKey, queryFn: ({ signal }) => api.me(signal), staleTime: 0 });
  useEffect(() => {
    const expire = () => {
      setExpired(true);
      void client.cancelQueries({ queryKey: sessionKey });
      client.setQueryData(sessionKey, null);
      discardWorkspace(client);
    };
    sessionEvents.addEventListener("expired", expire);
    return () => sessionEvents.removeEventListener("expired", expire);
  }, [client]);

  if (session.isPending) return <main className="auth-layout"><Loading /></main>;
  if (session.isError) return <main className="auth-layout">
    <Problem error={session.error} retry={() => { void session.refetch(); }} />
  </main>;
  if (!session.data) return <SignIn sessionExpired={expired} onLogin={async () => {
    await session.refetch({ throwOnError: true });
    setExpired(false);
  }} />;
  return <Workspace key={session.data.id} user={session.data} onLogout={() => {
    void client.cancelQueries({ queryKey: sessionKey });
    client.setQueryData(sessionKey, null);
    discardWorkspace(client);
    setExpired(false);
  }} />;
}

function discardWorkspace(client: ReturnType<typeof useQueryClient>) {
  client.removeQueries({ predicate: ({ queryKey }) => queryKey[0] !== sessionKey[0] });
  client.getMutationCache().clear();
}

function CreateOrganization({ onCreated }: { onCreated: (id: string) => void }) {
  const [error, setError] = useState<unknown>();
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setError(undefined);
    setPending(true);
    try {
      const organization = await api.createOrganization({ name: String(values.get("name")), slug: String(values.get("slug")) });
      onCreated(organization.id);
    } catch (problem) {
      setError(problem);
    } finally {
      setPending(false);
    }
  }
  return <section className="panel auth-card">
    <h1>Create an organization</h1>
    <p className="muted">You don’t belong to an organization yet. Create a workspace you own.</p>
    {error != null && <Problem error={error} />}
    <form onSubmit={(event) => { void submit(event); }}>
      <label>Organization name<input name="name" required maxLength={120} /></label>
      <label>Organization slug<input name="slug" required maxLength={80} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /></label>
      <small>Use lowercase letters, digits, and hyphens.</small>
      <button className="button primary" disabled={pending}>{pending ? "Creating…" : "Create organization"}</button>
    </form>
  </section>;
}

function Workspace({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const [selected, setSelected] = useState(savedOrganization);
  const [logoutError, setLogoutError] = useState<unknown>();
  const [leaving, setLeaving] = useState(false);
  const client = useQueryClient();
  const location = useLocation();
  const activePage = navigation.find(({ path }) => path === location.pathname ||
    (path !== "/" && location.pathname.startsWith(path + "/")));
  const organizations = useQuery({ queryKey: ["organizations", user.id], queryFn: ({ signal }) => api.organizations(signal) });
  const health = useQuery({
    queryKey: ["health"],
    queryFn: ({ signal }) => api.health(signal),
    refetchInterval: 30_000,
  });
  const pendingRun = useIsMutating({ mutationKey: collaborationKey }) > 0;
  const organization = organizations.data?.find(({ id }) => id === selected) ?? organizations.data?.[0];
  const org = organization?.id;
  const canManage = organization?.role === "OWNER" || organization?.role === "ADMIN";

  useEffect(() => {
    if (!org) return;
    try { localStorage.setItem(organizationKey, org); } catch { /* Storage is optional. */ }
  }, [org]);

  return <div className="shell">
    <a className="skip-link" href="#workspace">Skip to workspace</a>
    <aside className="sidebar">
      <NavLink className="brand" to="/"><span className="brand-mark"><Box size={20} strokeWidth={2.4} /></span>
        <span><strong>FORGE AI</strong><small>Delivery workspace</small></span></NavLink>
      <span className="nav-label">Workspace</span>
      <nav aria-label="Workspace navigation">
        {navigation.map(({ name, path, icon: Icon }) => <NavLink key={path} to={path} end={path === "/"}>
          <Icon size={17} strokeWidth={1.8} /><span>{name}</span>
        </NavLink>)}
      </nav>
      <div className="sidebar-bottom"><div><strong>{user.name}</strong>
        <small>{organization?.role ?? "Signed in"}</small></div></div>
    </aside>

    <div className="workspace">
      <header className="topbar">
        <div className="breadcrumb"><span>Workspace</span><span aria-hidden="true">/</span>
          <strong>{activePage?.name ?? "Overview"}</strong></div>
        <div className="top-actions">
          <label className="org-control"><span>Organization</span>
            <select aria-label="Organization" value={org ?? ""} disabled={!org || pendingRun}
              onChange={(event) => setSelected(event.target.value)}>
              {!org && <option value="">{organizations.isPending ? "Loading organizations…" : "No organization"}</option>}
              {organizations.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <div className={`health-pill ${health.isError ? "offline" : health.isPending ? "checking" : "online"}`}
            role="status"><i />{health.isError ? "Backend unavailable" : health.isPending ? "Checking backend…" : "Backend connected"}</div>
          <button className="button subtle" disabled={leaving} onClick={() => {
            setLeaving(true);
            setLogoutError(undefined);
            void api.logout().then(onLogout).catch(setLogoutError).finally(() => setLeaving(false));
          }}>{leaving ? "Signing out…" : "Sign out"}</button>
        </div>
      </header>
      <main id="workspace" className="content">
        {logoutError != null && <Problem error={logoutError} />}
        {organizations.isPending ? <Loading /> :
          organizations.isError ? <Problem error={organizations.error} retry={() => { void organizations.refetch(); }} /> :
          !org ? <CreateOrganization onCreated={(id) => {
            setSelected(id);
            void client.invalidateQueries({ queryKey: ["organizations", user.id] });
          }} /> :
          <Routes key={org}>
            <Route path="/" element={<Overview org={org} />} />
            <Route path="/projects" element={<Projects org={org} />} />
            <Route path="/workforce" element={<Workforce org={org} canLaunch={canManage} />} />
            <Route path="/graph" element={<Suspense fallback={<Loading />}><WorkforceGraph org={org} canManage={canManage} /></Suspense>} />
            <Route path="/github" element={<Suspense fallback={<Loading />}><GitHub org={org} canManage={canManage} /></Suspense>} />
            <Route path="/runs" element={<Runs org={org} />} />
            <Route path="/runs/:runId" element={<RunDetails org={org}
              canCancel={canManage} />} />
            <Route path="/usage" element={<Usage org={org} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>}
      </main>
    </div>
  </div>;
}
