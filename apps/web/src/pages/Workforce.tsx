import { useIsMutating, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, GitPullRequestArrow, LoaderCircle, Play, Workflow } from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { api, ApiError } from "../api";
import { collaborationKey, useProjects } from "../queries";
import { Empty, Loading, PageTitle, Panel, Problem } from "../ui";

export function Workforce({ org, canLaunch }: { org: string; canLaunch: boolean }) {
  const client = useQueryClient();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [projectId, setProjectId] = useState(params.get("project") ?? "");
  const [taskId, setTaskId] = useState(params.get("task") ?? "");
  const lock = useRef(false);
  const requestKeys = useRef(new Map<string, string>());
  const agents = useQuery({ queryKey: ["agents"], queryFn: ({ signal }) => api.agents(signal) });
  const projects = useProjects(org);
  const project = projects.data?.find(({ id }) => id === projectId) ?? projects.data?.[0];
  const tasks = useQuery({
    queryKey: ["tasks", org, project?.id],
    enabled: !!project,
    queryFn: ({ signal }) => api.tasks(project!.id, signal),
  });
  const task = tasks.data?.find(({ id }) => id === taskId) ?? tasks.data?.[0];
  const busy = useIsMutating({ mutationKey: collaborationKey }) > 0;
  const mutation = useMutation({
    mutationKey: collaborationKey,
    mutationFn: ({ id, key }: { id: string; key: string }) => api.collaborate(id, org, key),
    onSettled: () => {
      void client.invalidateQueries({ queryKey: ["runs", org] });
      void client.invalidateQueries({ queryKey: ["usage", org] });
    },
  });

  async function launch() {
    if (!task || !canLaunch || lock.current || busy) return;
    lock.current = true;
    const key = requestKeys.current.get(task.id) ?? crypto.randomUUID();
    requestKeys.current.set(task.id, key);
    try {
      const result = await mutation.mutateAsync({ id: task.id, key });
      requestKeys.current.delete(task.id);
      navigate(`/runs/${result.run.id}`);
    } catch (error) {
      // Reuse the key after a network error or timeout, when the enqueue may already have committed.
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) requestKeys.current.delete(task.id);
    } finally {
      lock.current = false;
    }
  }

  return <>
    <PageTitle title="AI Workforce" subtitle="Explore the agent roles and start a live planning collaboration." />
    <Panel title="Run collaboration" aside={<span className="accent-label"><Workflow size={14} /> Live workflow</span>}>
      <div className="collaboration">
        <div className="workflow-line"><span className="avatar alex">A</span><strong>Alex</strong><ArrowRight size={16} />
          <span className="avatar marcus">M</span><strong>Marcus</strong></div>
        <p className="muted">Alex proposes a plan and hands it to Marcus for architecture review.</p>
        {projects.isPending ? <Loading label="Loading projects…" /> :
          projects.isError ? <Problem error={projects.error} retry={() => { void projects.refetch(); }} /> :
          !project ? <Empty title="No projects to run">Create a project through the local API or seed demo data.</Empty> :
          <div className="run-fields">
            <label>Project<select value={project.id} disabled={busy} onChange={(event) => {
              setProjectId(event.target.value); setTaskId(""); mutation.reset();
            }}>{projects.data?.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}</select></label>
            <label>Task<select value={task?.id ?? ""} disabled={!task || busy} onChange={(event) => {
              setTaskId(event.target.value); mutation.reset();
            }}>
              {!task && <option value="">{tasks.isPending ? "Loading tasks…" : "No tasks available"}</option>}
              {tasks.data?.map(({ id, title }) => <option key={id} value={id}>{title}</option>)}
            </select></label>
          </div>}
        {tasks.isError && <Problem error={tasks.error} retry={() => { void tasks.refetch(); }} />}
        {project && tasks.isSuccess && !task && <p className="muted"><Link to={`/projects?project=${project.id}`}>Create a task in Projects</Link> to start a run.</p>}
        {!canLaunch && <p className="muted">Only organization owners and admins can launch workflows.</p>}
        <div className="run-actions"><button className="button primary" disabled={!task || !canLaunch || busy} onClick={() => { void launch(); }}>
          {busy ? <LoaderCircle size={15} className="spin" /> : <Play size={15} />}
          {busy ? "Queuing collaboration…" : "Run Alex → Marcus"}
        </button><span className="muted">Real Gemini calls may consume API quota or incur charges.</span></div>
        {busy && <p role="status" className="pending-run">Saving the run for the worker.</p>}
        {mutation.isError && <><Problem error={mutation.error} /><Link className="text-link" to="/runs">Check Agent Runs <ArrowRight size={14} /></Link></>}
      </div>
    </Panel>
    <Panel title="Agent directory" aside={<span className="muted">{agents.data ? `${agents.data.length} identities` : ""}</span>}>
      {agents.isPending ? <Loading label="Loading agents…" /> :
        agents.isError ? <Problem error={agents.error} retry={() => { void agents.refetch(); }} /> :
        !agents.data.length ? <Empty title="No agent identities" /> :
        <ul className="agents">{agents.data.map((agent) => {
          const live = agent.id === "ALEX" || agent.id === "MARCUS";
          return <li key={agent.id}><span className={`avatar ${agent.id.toLowerCase()}`}>{agent.name[0]}</span>
            <div className="agent-info"><strong>{agent.name}</strong><small>{agent.role}</small>
              <div className="tags">{agent.capabilities.map((item) => <span key={item}>{item}</span>)}</div></div>
            <span className={`capability ${live ? "live" : ""}`}>{live && <GitPullRequestArrow size={13} />}{live ? "Real LLM execution" : "Identity / demo only"}</span>
          </li>;
        })}</ul>}
    </Panel>
  </>;
}
