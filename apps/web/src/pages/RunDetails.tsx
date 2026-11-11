import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { useRef } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api } from "../api";
import type { Run, RunDetail, Step } from "../api";
import { isActivePlanning, useInventory } from "../queries";
import { agentName, Badge, Empty, executionErrorMessage, InvocationTable, label, Loading, mode, PageTitle, Panel, Problem, When } from "../ui";

function Section({ title, children, open }: { title: string; children: ReactNode; open?: boolean }) {
  return <details className="panel disclosure" open={open}><summary><span>{title}</span><ChevronDown size={17} /></summary>
    <div className="disclosure-body">{children}</div></details>;
}

function fieldName(key: string) {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
}

function StructuredOutput({ step, field }: { step: Step; field: "plan" | "proposal" }) {
  const value = step.output?.[field];
  if (!value || typeof value !== "object" || Array.isArray(value)) return <Empty title="No structured output available" />;
  return <div className="structured"><p className="source-note">LLM-produced proposal · Independently unverified</p>
    {Object.entries(value).map(([key, item]) => <div key={key}><h3>{fieldName(key)}</h3>
      {Array.isArray(item) ? item.length ? <ul>{item.map((entry, index) => <li key={index}>{String(entry)}</li>)}</ul> :
        <p className="muted">None listed</p> : <p>{item == null ? "Unavailable" : String(item)}</p>}
    </div>)}</div>;
}

function RepositoryEvidence({ payload }: { payload: unknown }) {
  if (!payload || typeof payload !== "object" || !("repository" in payload) || typeof payload.repository !== "string") return null;
  const paths = "paths" in payload && Array.isArray(payload.paths) ? payload.paths.filter((path) => typeof path === "string") : [];
  const files = "files" in payload && Array.isArray(payload.files) ? payload.files : [];
  const coverage = "coverage" in payload && payload.coverage && typeof payload.coverage === "object" ? payload.coverage : undefined;
  return <Section title="Observed repository evidence">
    <div className="structured">
      <p>{payload.repository}{("defaultBranch" in payload && typeof payload.defaultBranch === "string") ? ` · ${payload.defaultBranch}` : ""}</p>
      {"commit" in payload && typeof payload.commit === "string" && <p>Commit <code>{payload.commit}</code></p>}
      {"empty" in payload && payload.empty === true && <p>The repository had no commits when inspected.</p>}
      {"treeTruncated" in payload && payload.treeTruncated === true && <p>Only part of the file tree is shown.</p>}
      {coverage && "schemaDeclarationsObserved" in coverage && coverage.schemaDeclarationsObserved === false &&
        <p>Prisma model declarations were unavailable in the captured evidence.</p>}
      {paths.length > 0 && <ul>{paths.map((path) => <li key={path}><code>{path}</code></li>)}</ul>}
      {files.map((file) => {
        if (!file || typeof file.path !== "string") return null;
        const keys = Array.isArray(file.configurationKeys) ? file.configurationKeys.filter((key: unknown) => typeof key === "string") : [];
        const declarations = Array.isArray(file.declarations) ? file.declarations.filter((line: unknown) => typeof line === "string") : [];
        if (!keys.length && !declarations.length) return null;
        return <div key={file.path}>
          <p><code>{file.path}</code>{keys.length > 0 && <> · Observed configuration keys: {keys.join(", ")}</>}</p>
          {declarations.length > 0 && <ul>{declarations.map((line: string) => <li key={line}>{line}</li>)}</ul>}
        </div>;
      })}
      <p className="muted">These facts were read from GitHub. The plans below are agent proposals and may contain assumptions.</p>
    </div>
  </Section>;
}

export function RunDetails({ org, canCancel }: { org: string; canCancel: boolean }) {
  const { runId = "" } = useParams();
  const client = useQueryClient();
  const navigate = useNavigate();
  const restartKeys = useRef(new Map<string, string>());
  const inventory = useInventory(org);
  const runKey = ["run", org, runId];
  const runQuery = useQuery<RunDetail>({
    queryKey: runKey, queryFn: ({ signal }) => api.run(runId, org, signal),
    refetchInterval: ({ state }) => isActivePlanning(state.data) ? 2500 : false,
  });
  const run = runQuery.data;
  const active = isActivePlanning(run);
  const job = run?.planningJob;
  const auditVersion = [run?.status, job?.recoveryCount, run?.steps.map(({ status }) => status).join(",")];
  const cancel = useMutation({
    mutationFn: () => api.cancelRun(runId, org),
    onSettled: async () => {
      await Promise.all([client.invalidateQueries({ queryKey: runKey }), client.invalidateQueries({ queryKey: ["runs", org] })]);
    },
  });
  const restart = useMutation({
    mutationFn: ({ taskId, mode }: { taskId: string; mode: NonNullable<Run["mode"]> }) => {
      const key = restartKeys.current.get(runId) ?? crypto.randomUUID();
      restartKeys.current.set(runId, key);
      return api.restartPlanning(taskId, org, mode, key);
    },
    onSuccess: ({ run: next }) => {
      restartKeys.current.delete(runId);
      void client.invalidateQueries({ queryKey: ["runs", org] });
      navigate(`/runs/${next.id}`);
    },
  });
  const messages = useQuery({
    queryKey: ["messages", org, runId, auditVersion], enabled: !!run,
    queryFn: ({ signal }) => api.messages(runId, org, signal),
  });
  const events = useQuery({
    queryKey: ["events", org, runId, auditVersion], enabled: !!run,
    queryFn: ({ signal }) => api.events(runId, org, signal),
  });
  const calls = useQuery({
    queryKey: ["invocations", org, runId, auditVersion], enabled: !!run,
    queryFn: ({ signal }) => api.invocations(runId, org, signal),
  });
  const task = inventory.tasks.find(({ id }) => id === run?.taskId);
  const project = inventory.projects.find(({ id }) => id === task?.projectId);
  const alex = run?.steps.find((step) => step.agentRole === "ALEX" && step.output?.plan);
  const marcus = run?.steps.find((step) => step.agentRole === "MARCUS" && step.output?.proposal);
  const leaseExpired = active && job?.leaseExpired;
  const repositoryEvidence = events.data?.find(({ eventType }) => eventType === "REPOSITORY_OBSERVED");

  return <>
    <Link to="/runs" className="back-link"><ArrowLeft size={15} /> Agent Runs</Link>
    <PageTitle title={task?.title ?? "Execution details"} subtitle={run ? mode(run) : "Review a persisted run and its audit trail."}
      action={run && <div className="run-actions"><Badge value={run.status} />
        {canCancel && active && <button className="button secondary" disabled={cancel.isPending} onClick={() => cancel.mutate()}>
          {cancel.isPending ? "Cancelling…" : "Cancel run"}</button>}</div>} />
    {runQuery.isPending ? <Loading label="Loading execution…" /> :
      runQuery.isError ? <Problem error={runQuery.error} retry={() => { void runQuery.refetch(); }} /> :
      run && <>
        <Panel title="Run context" aside={<code className="id-tag">{run.id}</code>}>
          <dl className="run-context">
            <div><dt>Task</dt><dd>{task?.title ?? (inventory.pending ? "Loading…" : run.taskId)}</dd></div>
            <div><dt>Project</dt><dd>{project?.name ?? (inventory.pending ? "Loading…" : "Unavailable")}</dd></div>
            <div><dt>Mode</dt><dd>{mode(run)}</dd></div>
            <div><dt>Started</dt><dd><When value={run.startedAt} /></dd></div>
            <div><dt>Completed</dt><dd><When value={run.completedAt} /></dd></div>
          </dl>
          {run.isFixture && <p className="source-note inset">Deterministic fixture data. No LLM execution is represented by this run.</p>}
          {job && <dl className="run-context">
            <div><dt>Queued</dt><dd><When value={job.queuedAt} /></dd></div>
            <div><dt>Checkpoint</dt><dd>{marcus ? "Marcus complete" : alex ? "Alex complete" : "No completed steps"}</dd></div>
            <div><dt>Last heartbeat</dt><dd><When value={job.lastHeartbeatAt} /></dd></div>
            {job.leaseExpiresAt && <div><dt>Lease expires</dt><dd><When value={job.leaseExpiresAt} /></dd></div>}
            <div><dt>Recoveries</dt><dd>{job.recoveryCount}</dd></div>
          </dl>}
          {job?.attentionRequired && <p className="source-note inset" role="status">Attention required</p>}
          {job?.attentionRequired && canCancel && run.mode && <div className="source-note inset">
            <p>Review the recorded outcome and provider usage first. Starting again sends new provider requests and may incur charges.</p>
            <button className="button secondary" disabled={restart.isPending}
              onClick={() => { if (run.mode) restart.mutate({ taskId: run.taskId, mode: run.mode }); }}>
              {restart.isPending ? "Queuing…" : "Start a new run"}</button>
          </div>}
          {restart.isError && <Problem error={restart.error} />}
          {leaseExpired && <p className="source-note inset" role="status">Worker lease expired. Waiting for recovery.</p>}
          {active && run.status === "PENDING" && <p className="source-note inset" role="status">Queued for a worker.</p>}
          {cancel.isError && <Problem error={cancel.error} />}
          {run.errorMessage && <Problem error={new Error(run.errorMessage)} />}
        </Panel>
        <Panel title="Agent steps">
          {run.steps.length ? <ol className="step-list">{run.steps.map((step) => <li key={step.id}>
            <span className="step-number">{step.sequence}</span><div><strong>{agentName(step.agentRole)}</strong>
              {step.errorMessage && <small>{executionErrorMessage(step.errorMessage)}</small>}
              {run.isFixture && typeof step.output?.summary === "string" && <small>{step.output.summary}</small>}</div>
            <Badge value={step.status} />
          </li>)}</ol> : <Empty title="No steps saved" />}
        </Panel>
        {repositoryEvidence && <RepositoryEvidence payload={repositoryEvidence.payload} />}
        {alex && <Section title="Alex’s structured plan" open><StructuredOutput step={alex} field="plan" /></Section>}
        {marcus && <Section title="Marcus’s architecture proposal" open><StructuredOutput step={marcus} field="proposal" /></Section>}
        <Section title={`Messages & handoffs${messages.data ? ` · ${messages.data.length}` : ""}`}>
          {messages.isPending ? <Loading label="Loading messages…" /> : messages.isError ?
            <Problem error={messages.error} retry={() => { void messages.refetch(); }} /> :
            messages.data.length ? <ul className="audit-list">{messages.data.map((item) => <li key={item.id}>
              <div className="audit-heading"><strong>{agentName(item.fromAgent)}{item.toAgent &&
                <> <ArrowRight size={13} /> {agentName(item.toAgent)}</>}</strong><span className="accent-label">{label(item.messageType)}</span>
                <small><When value={item.createdAt} /></small></div><p>{item.content}</p>
            </li>)}</ul> : <Empty title="No messages saved" />}
        </Section>
        <Section title={`Event timeline${events.data ? ` · ${events.data.length}` : ""}`}>
          {events.isPending ? <Loading label="Loading events…" /> : events.isError ?
            <Problem error={events.error} retry={() => { void events.refetch(); }} /> :
            events.data.length ? <ol className="audit-list timeline">{[...events.data].sort((a, b) => a.sequence - b.sequence).map((event) =>
              <li key={event.id}><span className="step-number">{event.sequence}</span><div><strong>{label(event.eventType)}</strong>
                <small><When value={event.createdAt} /></small>
                {event.payload != null && <details className="event-data"><summary>Event metadata</summary>
                  <pre>{JSON.stringify(event.payload, null, 2)}</pre></details>}</div></li>)}</ol> : <Empty title="No events saved" />}
        </Section>
        <Section title={`LLM invocations${calls.data ? ` · ${calls.data.length}` : ""}`}>
          {calls.isPending ? <Loading label="Loading invocation data…" /> : calls.isError ?
            <Problem error={calls.error} retry={() => { void calls.refetch(); }} /> :
            <InvocationTable calls={calls.data} steps={run.steps} />}
        </Section>
      </>}
  </>;
}
