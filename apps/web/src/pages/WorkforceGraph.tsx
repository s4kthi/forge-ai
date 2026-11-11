import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { api, workerRoles } from "../api";
import type { Graph } from "../api";
import { useProjects } from "../queries";
import { Badge, Empty, label, Loading, PageTitle, Panel, Problem, When } from "../ui";

function PersistedGraph({ nodes, edges }: Pick<Graph, "nodes" | "edges">) {
  const arrow = useId();
  const columns = Math.min(3, nodes.length);
  const width = columns * 240;
  const height = Math.ceil(nodes.length / columns) * 94 + 12;
  const positions = new Map(nodes.map((node, index) => [node.id, {
    x: (index % columns) * 240 + 120, y: Math.floor(index / columns) * 94 + 47,
  }]));
  if (!nodes.length) return <Empty title="No persisted work to display">Assign a configured worker to a ticket or start a planning run.</Empty>;
  return <div className="integration-form">
    <div className="work-graph-scroll"><svg width={width} height={height} role="img" aria-label="Persisted workforce dependencies and handoffs">
      <defs><marker id={arrow} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0 0 L8 4 L0 8 Z" fill="currentColor" /></marker></defs>
      {edges.map((edge) => {
        const from = positions.get(edge.fromId), to = positions.get(edge.toId);
        if (!from || !to) return null;
        const horizontal = from.y === to.y;
        const direction = horizontal ? Math.sign(to.x - from.x) : Math.sign(to.y - from.y);
        const startX = horizontal ? from.x + direction * 91 : from.x;
        const endX = horizontal ? to.x - direction * 96 : to.x;
        const startY = horizontal ? from.y : from.y + direction * 25;
        const endY = horizontal ? to.y : to.y - direction * 30;
        return <line key={edge.id} x1={startX} y1={startY} x2={endX} y2={endY} stroke="currentColor" strokeWidth="2"
          strokeDasharray={edge.kind === "HANDOFF" ? "5 4" : undefined} markerEnd={`url(#${arrow})`}>
          <title>{label(edge.kind)}</title></line>;
      })}
      {nodes.map((node) => {
        const position = positions.get(node.id)!;
        return <g key={node.id}><rect x={position.x - 91} y={position.y - 24} width="182" height="48" rx="6" />
          <text x={position.x} y={position.y - 3} textAnchor="middle">{node.name.slice(0, 23)}</text>
          <text x={position.x} y={position.y + 14} textAnchor="middle">{label(node.role)} · {label(node.status)}</text></g>;
      })}
    </svg></div>
    {edges.length > 0 && <ul aria-label="Graph edges">{edges.map((edge) => <li key={edge.id}>
      {nodes.find(({ id }) => id === edge.fromId)?.name} → {nodes.find(({ id }) => id === edge.toId)?.name} · {label(edge.kind)}
    </li>)}</ul>}
    <ul className="graph-node-list">{nodes.map((node) => <li key={node.id}>
      <strong>{node.name} · {label(node.role)}</strong> <Badge value={node.status} />
      <p>{node.source === "PLANNING" ? "Saved planning step" : "Tracked ticket assignment"}{node.task && ` · ${node.task.title}`}</p>
      <small>{node.progress.completed} of {node.progress.total} completed · Started <When value={node.startedAt} /> · Finished <When value={node.completedAt} /></small>
      {node.blockedReason && <p>Blocked: {node.blockedReason}</p>}{node.error && <p>Error: {node.error}</p>}
    </li>)}</ul>
  </div>;
}

export function WorkforceGraph({ org, canManage }: { org: string; canManage: boolean }) {
  const client = useQueryClient();
  const [params, setParams] = useSearchParams();
  const projects = useProjects(org);
  const project = projects.data?.find(({ id }) => id === params.get("project")) ?? projects.data?.[0];
  const selected = params.get("ticket") ?? "";
  const graph = useQuery<Graph>({
    queryKey: ["workforce-graph", org, project?.id, selected], enabled: !!project,
    queryFn: ({ signal }) => api.graph(org, project!.id, selected, signal), refetchInterval: 5000,
  });
  const workers = useQuery({
    queryKey: ["workers", org], queryFn: ({ signal }) => api.workers(org, signal), enabled: canManage,
  });
  const [name, setName] = useState("");
  const [role, setRole] = useState("PM");
  const [requirement, setRequirement] = useState("");
  const [workerId, setWorkerId] = useState("");
  const refresh = () => client.invalidateQueries({ queryKey: ["workforce-graph", org] });
  const createWorker = useMutation({ mutationFn: () => api.createWorker(org, name, role), onSuccess: () => {
    setName(""); return client.invalidateQueries({ queryKey: ["workers", org] });
  } });
  const createTicket = useMutation({ mutationFn: () => api.createTicket(org, project!.id, requirement), onSuccess: (ticket) => {
    setRequirement(""); setParams({ project: project!.id, ticket: ticket.id }); return refresh();
  } });
  const assign = useMutation({ mutationFn: () => api.assignWorker(org, project!.id, graph.data!.ticket!.id, workerId), onSuccess: refresh });
  const ticket = graph.data?.ticket;
  return <>
    <PageTitle title="Workforce graph" subtitle="Track ticket assignments and the latest saved planning run for a project." />
    <Panel title="Project and ticket"><div className="integration-form">
      {projects.isPending && <Loading />}{projects.error && <Problem error={projects.error} />}
      <label>Project<select value={project?.id ?? ""} onChange={(event) => setParams({ project: event.target.value })}>
        {!project && <option value="">No projects</option>}
        {projects.data?.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
      </select></label>
      <label>Ticket<select value={ticket?.id ?? ""} onChange={(event) => setParams({ project: project!.id, ticket: event.target.value })}>
        {!ticket && <option value="">No tickets</option>}{graph.data?.tickets.map((entry) =>
          <option key={entry.id} value={entry.id}>{entry.requirement.slice(0, 100)}</option>)}
      </select></label>
    </div></Panel>
    <Panel title="Persisted workflow" aside={graph.data?.planningRun && <Link to={`/runs/${graph.data.planningRun.id}`}>
      Latest planning run · {label(graph.data.planningRun.status)}</Link>}>
      {!project ? <Empty title="Choose a project to see its workflow" /> : graph.isPending ? <Loading /> :
        graph.error ? <Problem error={graph.error} /> : <PersistedGraph nodes={graph.data.nodes} edges={graph.data.edges} />}
    </Panel>
    <Panel title="Ticket details">{ticket ? <div className="integration-form">
      <p>{ticket.requirement}</p><p><Badge value={ticket.status} /> · {label(ticket.priority)} priority · Owner: {ticket.owner}</p>
      <p>{ticket.progress.completed} of {ticket.progress.total} assignments completed</p>
      <h3>Blockers</h3>{ticket.blockers.length ? <ul>{ticket.blockers.map((blocker) => <li key={blocker.id}>{blocker.reason}</li>)}</ul> : <p>No blockers recorded.</p>}
      <h3>Events</h3>{ticket.events.length ? <ul>{ticket.events.map((event) => <li key={event.id}>
        {label(event.kind)}{typeof event.payload.status === "string" && ` · ${label(event.payload.status)}`} · <When value={event.createdAt} />
      </li>)}</ul> : <p>No events recorded.</p>}
    </div> : <Empty title="No ticket selected" />}</Panel>
    {canManage && <Panel title="Configure work">
      <form className="integration-form" onSubmit={(event) => { event.preventDefault(); createWorker.mutate(); }}>
        <TextField label="Worker name" size="small" required value={name} onChange={(event) => setName(event.target.value)} />
        <label>Role<select value={role} onChange={(event) => setRole(event.target.value)}>{workerRoles.map((item) =>
          <option key={item} value={item}>{label(item)}</option>)}</select></label>
        <Button type="submit" variant="outlined" disabled={createWorker.isPending}>Add worker</Button>
      </form>
      {project && <form className="integration-form" onSubmit={(event) => { event.preventDefault(); createTicket.mutate(); }}>
        <TextField label="Requirement" size="small" required value={requirement} onChange={(event) => setRequirement(event.target.value)} />
        <Button type="submit" variant="outlined" disabled={createTicket.isPending}>Create ticket</Button>
      </form>}
      {ticket && <form className="integration-form" onSubmit={(event) => { event.preventDefault(); assign.mutate(); }}>
        <label>Worker<select required value={workerId} onChange={(event) => setWorkerId(event.target.value)}>
          <option value="">Choose an enabled worker</option>{workers.data?.filter((worker) => worker.enabled).map((worker) =>
            <option key={worker.id} value={worker.id}>{worker.name} · {label(worker.role)}</option>)}</select></label>
        <Button type="submit" variant="outlined" disabled={assign.isPending || !workerId}>Assign to ticket</Button>
      </form>}
      {(createWorker.error ?? createTicket.error ?? assign.error ?? workers.error) &&
        <Problem error={createWorker.error ?? createTicket.error ?? assign.error ?? workers.error} />}
    </Panel>}
  </>;
}
