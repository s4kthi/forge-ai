export type CodingExecutionStatus = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED" | "UNKNOWN";

export interface IsolatedCodingTask {
  assignmentId: string;
  organizationId: string;
  repositoryId: string;
  commitSha: string;
  instruction: string;
  /** Stable per intended execution. Providers should document how they honor it. */
  idempotencyKey: string;
}

export interface CodingExecution {
  id: string;
  status: CodingExecutionStatus;
}
export interface CodingExecutionEvent {
  sequence: number;
  status: CodingExecutionStatus;
  occurredAt: string;
  summary?: string;
}
export interface CodingChanges {
  files: readonly { path: string; patch: string }[];
}
export interface CodingTestResults {
  status: "NOT_RUN" | "PASSED" | "FAILED";
  summary?: string;
}

/** Implementations must isolate repository code from the API process and its credentials. */
export interface CodingExecutor {
  start(task: IsolatedCodingTask, signal?: AbortSignal): Promise<CodingExecution>;
  events(id: string, afterSequence?: number, signal?: AbortSignal): AsyncIterable<CodingExecutionEvent>;
  changes(id: string): Promise<CodingChanges>;
  testResults(id: string): Promise<CodingTestResults>;
  cancel(id: string): Promise<CodingExecution>;
  lookup(id: string): Promise<CodingExecution | null>;
  recover(id: string, signal?: AbortSignal): Promise<CodingExecution | null>;
}
