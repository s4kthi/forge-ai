import { useQuery } from "@tanstack/react-query";
import { Activity, ArrowRight, FolderKanban, ListTodo, Play, SquareStack } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { api } from "../api";
import type { Invocation } from "../api";
import { inBatches, newest, projectLimit, taskLimit, usageLimit, useInventory, useRuns } from "../queries";
import { Badge, Empty, InvocationTable, label, Loading, PageTitle, Panel, Problem, RunTable, tokens } from "../ui";

function ScopeNotice({ projectCount, taskCount }: { projectCount: number; taskCount: number }) {
  if (projectCount <= projectLimit && taskCount <= taskLimit) return null;
  return <p className="scope-note">Activity covers up to {projectLimit} projects and the {taskLimit} newest tasks within them.</p>;
}

export function Overview({ org }: { org: string }) {
  const inventory = useInventory(org);
  const runs = useRuns(org, inventory);
  const metrics = [
    { name: "Projects", value: inventory.projects.length, hint: "In this organization", icon: FolderKanban },
    { name: "Tasks", value: inventory.tasks.length, hint: "In loaded projects", icon: ListTodo },
    { name: "Saved runs", value: runs.data?.length, hint: "Across loaded tasks", icon: Activity },
  ];
  return <>
    <PageTitle title="Overview" subtitle="Follow projects, agent collaboration, and saved execution history."
      action={<Link className="button primary" to="/workforce"><Play size={15} /> Go to AI Workforce</Link>} />
    {inventory.pending ? <Loading /> : inventory.error ? <Problem error={inventory.error} retry={inventory.retry} /> : <>
      <section className="metrics" aria-label="Workspace counts">{metrics.map(({ name, value, hint, icon: Icon }) =>
        <div className="metric" key={name}><div className="metric-label"><Icon size={17} />{name}</div>
          <strong>{value == null ? runs.isPending ? "…" : "Unavailable" : value.toLocaleString()}</strong><small>{hint}</small></div>)}</section>
      <div className="overview-grid">
        <Panel title="Recent runs" aside={<Link className="text-link" to="/runs">All runs <ArrowRight size={14} /></Link>}>
          {runs.isPending ? <Loading label="Loading runs…" /> : runs.isError ?
            <Problem error={runs.error} retry={() => { void runs.refetch(); }} /> :
            <RunTable runs={runs.data.slice(0, 6)} tasks={inventory.tasks} projects={inventory.projects} />}
        </Panel>
        <Panel title="Projects" aside={<Link className="text-link" to="/projects">View all <ArrowRight size={14} /></Link>}>
          {!inventory.projects.length ? <Empty title="No projects yet">Projects appear here when added to this organization.</Empty> :
            <ul className="summary-list">{inventory.projects.slice(0, 5).map((project) => <li key={project.id}>
              <span className="entity-icon"><SquareStack size={17} /></span><div>
                <Link className="row-title" to={`/projects?project=${project.id}`}>{project.name}</Link>
                <small>{project.description ?? "No description"}</small></div><Badge value={project.status} />
            </li>)}</ul>}
        </Panel>
      </div>
      <Panel title="Recent tasks" aside={<Link className="text-link" to="/projects">Open Projects <ArrowRight size={14} /></Link>}>
        {!inventory.tasks.length ? <Empty title="No tasks in loaded projects">Create a task from the Projects page.</Empty> :
          <ul className="summary-list">{newest(inventory.tasks).slice(0, 5).map((task) => <li key={task.id}>
            <span className="entity-icon"><ListTodo size={17} /></span><div>
              <Link className="row-title" to={`/projects?project=${task.projectId}&task=${task.id}`}>{task.title}</Link>
              <small>{inventory.projects.find(({ id }) => id === task.projectId)?.name ?? "Project unavailable"}</small>
            </div><Badge value={task.status} />
          </li>)}</ul>}
      </Panel>
      <ScopeNotice projectCount={inventory.projects.length} taskCount={inventory.tasks.length} />
    </>}
  </>;
}

export function Runs({ org }: { org: string }) {
  const inventory = useInventory(org);
  const runs = useRuns(org, inventory);
  const [status, setStatus] = useState("");
  return <>
    <PageTitle title="Agent Runs" subtitle="Review persisted executions for tasks in the selected organization." />
    {inventory.error ? <Problem error={inventory.error} retry={inventory.retry} /> : runs.isError ?
      <Problem error={runs.error} retry={() => { void runs.refetch(); }} /> :
      inventory.pending || runs.isPending ? <Loading label="Loading runs…" /> :
      <Panel title="Execution history" aside={<label className="filter"><span>Status</span>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {["PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"].map((value) =>
            <option key={value} value={value}>{label(value)}</option>)}
        </select></label>}>
        <RunTable runs={runs.data.filter((run) => !status || run.status === status)}
          projects={inventory.projects} tasks={inventory.tasks} />
      </Panel>}
    <ScopeNotice projectCount={inventory.projects.length} taskCount={inventory.tasks.length} />
  </>;
}

function total(calls: Invocation[], field: "inputTokens" | "outputTokens") {
  const known = calls.map((call) => call[field]).filter((value): value is number => value != null);
  return { value: known.length ? known.reduce((sum, value) => sum + value, 0) : null, reported: known.length };
}

export function Usage({ org }: { org: string }) {
  const inventory = useInventory(org);
  const runs = useRuns(org, inventory);
  const ids = runs.data?.slice(0, usageLimit).map(({ id }) => id) ?? [];
  const calls = useQuery({
    queryKey: ["usage", org, ids],
    enabled: !!runs.data,
    queryFn: async ({ signal }) => (await inBatches(ids, async (id) =>
      (await api.invocations(id, org, signal)).map((call) => ({ ...call, runId: id })))).flat(),
  });
  const error = inventory.error ?? runs.error ?? calls.error;
  const invocations = calls.data ?? [];
  const input = total(invocations, "inputTokens");
  const output = total(invocations, "outputTokens");

  return <>
    <PageTitle title="Usage" subtitle="Reported token usage and invocation metadata from saved runs." />
    {error ? <Problem error={error} retry={() => {
      if (inventory.error) inventory.retry();
      else void (runs.isError ? runs.refetch() : calls.refetch());
    }} /> : calls.isPending ? <Loading label="Loading invocation usage…" /> : <>
      <section className="metrics usage-metrics" aria-label="Usage totals">
        {[{ name: "Reported input tokens", ...input }, { name: "Reported output tokens", ...output }].map((metric) =>
          <div key={metric.name} className="metric"><div className="metric-label">{metric.name}</div>
            <strong>{tokens(metric.value)}</strong><small>{metric.reported} of {invocations.length} invocations reported</small></div>)}
      </section>
      <Panel title="LLM invocations" aside={<span className="muted">{ids.length} recent runs</span>}>
        <InvocationTable calls={invocations} />
      </Panel>
      <p className="scope-note">Totals include reported values from the {usageLimit} latest runs in this view.</p>
      <ScopeNotice projectCount={inventory.projects.length} taskCount={inventory.tasks.length} />
    </>}
  </>;
}
