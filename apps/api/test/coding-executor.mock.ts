import { randomUUID } from "node:crypto";
import type { CodingExecution, CodingExecutionEvent, CodingExecutor, IsolatedCodingTask } from "../src/execution/coding-executor.ts";

/** Contract fixture only. Never registered as a production executor. */
export function mockCodingExecutor(): CodingExecutor {
  const executions = new Map<string, CodingExecutionEvent[]>();
  const keys = new Map<string, string>();
  function record(id: string, status: CodingExecution["status"]) {
    const events = executions.get(id) ?? [];
    events.push({ sequence: events.length + 1, status, occurredAt: new Date().toISOString() });
    executions.set(id, events);
    return { id, status };
  }
  function required(id: string) {
    const events = executions.get(id);
    if (!events) throw new Error("Unknown mock execution");
    return events;
  }
  async function lookup(id: string) {
    const last = executions.get(id)?.at(-1);
    return last ? { id, status: last.status } : null;
  }
  return {
    async start(task: IsolatedCodingTask, signal) {
      signal?.throwIfAborted();
      const key = JSON.stringify([task.organizationId, task.assignmentId, task.idempotencyKey]);
      const id = keys.get(key);
      if (id) return (await lookup(id))!;
      const created = record(randomUUID(), "QUEUED");
      keys.set(key, created.id);
      return created;
    },
    async *events(id, afterSequence = 0, signal) {
      for (const event of required(id).filter(({ sequence }) => sequence > afterSequence)) {
        signal?.throwIfAborted();
        yield { ...event };
      }
    },
    async changes(id) { required(id); return { files: [] }; },
    async testResults(id) { required(id); return { status: "NOT_RUN" }; },
    async cancel(id) {
      const current = (await lookup(id)) ?? { id, status: "UNKNOWN" };
      if (current.status === "UNKNOWN") throw new Error("Unknown mock execution");
      return current.status === "CANCELLED" ? current : record(id, "CANCELLED");
    },
    lookup,
    async recover(id, signal) { signal?.throwIfAborted(); return lookup(id); },
  };
}
