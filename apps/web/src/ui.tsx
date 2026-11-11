import { AlertCircle, ArrowRight, ChevronRight, Inbox, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { ApiError } from "./api";
import type { Invocation, Project, Run, Step, Task } from "./api";

export function PageTitle({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return <header className="page-title"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</header>;
}

export function Panel({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return <section className="panel"><div className="panel-head"><h2>{title}</h2>{aside}</div>{children}</section>;
}

export function Loading({ label = "Loading workspace…" }: { label?: string }) {
  return <div className="state" role="status"><LoaderCircle size={18} className="spin" />{label}</div>;
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="state empty"><span className="state-icon"><Inbox size={19} /></span><strong>{title}</strong>
    {children && <div className="muted">{children}</div>}</div>;
}

export function executionErrorMessage(message: string) {
  return message === "Gemini is temporarily unavailable"
    ? "The Gemini request failed. The underlying cause was not recorded."
    : message;
}

export function Problem({ error, retry }: { error: unknown; retry?: () => void }) {
  const apiError = error instanceof ApiError ? error : undefined;
  const savedRunId = apiError?.details?.runId;
  const timeout = error instanceof DOMException && error.name === "TimeoutError";
  const detail = savedRunId ? "This run was saved. Open it to review the recorded invocation and events." :
    apiError?.status === 403 ? "You don’t have permission to complete this request." :
    apiError?.status === 409 && apiError.message === "This task already has an active run" ?
      "Check Agent Runs before trying again." :
    apiError?.status === 404 ? "Check the selected organization and resource." :
    apiError?.status === 422 ? "Review the submitted fields and try again." :
    undefined;
  return <div className="problem" role="alert"><AlertCircle size={17} /><div>
    <strong>{timeout ? "The request timed out. Check Agent Runs before trying again." : error instanceof Error ? executionErrorMessage(error.message) : "Something went wrong."}</strong>
    {detail && <p>{detail}</p>}
    {apiError?.details?.issues?.length ? <ul>{apiError.details.issues.map((issue, index) =>
      <li key={index}>{issue.path.join(".")}{issue.path.length ? " · " : ""}{issue.message}</li>)}</ul> : null}
    {savedRunId && <Link to={`/runs/${savedRunId}`}>Open saved run <ArrowRight size={13} /></Link>}
  </div>{retry && <button className="button subtle" onClick={retry}>Retry</button>}</div>;
}

export function label(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

const names: Record<string, string> = { ALEX: "Alex", MARCUS: "Marcus", DEVON: "Devon", TESSA: "Tessa", ELENA: "Elena" };
export const agentName = (role: string) => names[role] ?? label(role);
export function Badge({ value }: { value: string }) {
  const tone = ["ACTIVE", "COMPLETED", "SUCCEEDED", "DONE"].includes(value) ? "green" :
    ["RUNNING", "IN_PROGRESS"].includes(value) ? "blue" :
    ["FAILED", "BLOCKED", "URGENT"].includes(value) ? "red" :
    ["PENDING", "HIGH", "PAUSED"].includes(value) ? "amber" : "gray";
  return <span className={`badge ${tone}`}><i />{label(value)}</span>;
}

export function mode(run: Run) {
  if (run.isFixture) return "Deterministic fixture";
  if (run.mode === "ALEX_MARCUS") return "Alex → Marcus";
  if (run.mode === "ALEX_SINGLE_AGENT") return "Alex planning";
  return "Manual run";
}

export function When({ value }: { value?: string | null }) {
  return value ? <time dateTime={value}>{new Date(value).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  })}</time> : <>Unavailable</>;
}

export function RunTable({ runs, tasks, projects }: { runs: Run[]; tasks: Task[]; projects: Project[] }) {
  if (!runs.length) return <Empty title="No runs in this view">Saved executions will appear here.</Empty>;
  return <div className="table-scroll"><table className="run-table"><thead><tr>
    <th scope="col">Run / task</th><th scope="col">Status</th><th scope="col">Created</th><th scope="col" aria-label="Open run" />
  </tr></thead><tbody>{runs.map((run) => {
    const task = tasks.find(({ id }) => id === run.taskId);
    const project = projects.find(({ id }) => id === task?.projectId);
    return <tr key={run.id}><td><Link className="row-title" to={`/runs/${run.id}`}>{task?.title ?? "Task unavailable"}</Link>
      <small>{mode(run)}{project ? ` · ${project.name}` : ""}</small><small className="mobile-created"><When value={run.createdAt} /></small></td><td><Badge value={run.status} /></td>
      <td className="muted nowrap"><When value={run.createdAt} /></td><td><Link className="row-arrow" to={`/runs/${run.id}`}
        aria-label={`Open run ${run.id}`}><ChevronRight size={16} /></Link></td></tr>;
  })}</tbody></table></div>;
}

export function tokens(value: number | null) {
  return value == null ? "Unavailable" : value.toLocaleString();
}

export function InvocationTable({ calls, steps = [] }: {
  calls: (Invocation & { runId?: string })[];
  steps?: Step[];
}) {
  if (!calls.length) return <Empty title="No invocation records">This selection has no stored LLM calls.</Empty>;
  return <div className="table-scroll"><table><thead><tr>
    <th scope="col">Provider / model</th><th scope="col">Status</th><th scope="col">Input</th><th scope="col">Output</th>
    <th scope="col">Latency</th><th scope="col">Estimated cost</th>
  </tr></thead><tbody>{calls.map((call) => {
    const step = steps.find(({ id }) => id === call.stepId);
    return <tr key={call.id}><td><strong>{call.modelVersion ?? call.model}</strong><small>{label(call.provider)}
      {step ? ` · ${agentName(step.agentRole)}` : ""}{call.runId && <> · <Link to={`/runs/${call.runId}`}>Open run</Link></>}</small></td>
      <td><Badge value={call.status} />{call.errorCategory && <small>{label(call.errorCategory)}</small>}</td>
      <td>{tokens(call.inputTokens)}</td><td>{tokens(call.outputTokens)}</td>
      <td className="nowrap">{call.latencyMs == null ? "Unavailable" : `${(call.latencyMs / 1000).toFixed(2)} s`}</td>
      <td>{call.estimatedCostUsd == null ? "Unavailable" : `$${call.estimatedCostUsd}`}</td></tr>;
  })}</tbody></table></div>;
}
