import type { ApiValidationIssue } from "@forge-ai/shared";

export class ApiError extends Error {
  readonly status: number;
  readonly issues?: ApiValidationIssue[];

  constructor(status: number, message: string, issues?: ApiValidationIssue[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.issues = issues;
  }
}

export class ExecutionApiError extends ApiError {
  readonly runId: string;
  readonly runStatus: "FAILED" | "CANCELLED";

  constructor(status: number, message: string, runId: string, runStatus: "FAILED" | "CANCELLED") {
    super(status, message);
    this.runId = runId;
    this.runStatus = runStatus;
  }
}
