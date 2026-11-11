import type { ErrorRequestHandler, Response } from "express";
import type { ApiErrorResponse } from "@forge-ai/shared";
import { ApiError, ExecutionApiError } from "../errors/api-error.ts";
import { Prisma } from "../generated/prisma/client.ts";

const requestErrors = new Map<string, [status: number, message: string]>([
  ["entity.parse.failed", [400, "Malformed JSON body"]],
  ["entity.too.large", [413, "Request body is too large"]],
  ["charset.unsupported", [415, "Unsupported request charset"]],
  ["encoding.unsupported", [415, "Unsupported request encoding"]],
]);

const databaseErrors = new Map<string, [status: number, message: string]>([
  ["P2002", [409, "A resource with that unique value already exists"]],
  ["P2003", [409, "A related resource changed or is in use"]],
  ["P2025", [404, "Resource not found"]],
  ["P1001", [503, "Database unavailable"]],
  ["P1002", [503, "Database unavailable"]],
  ["P1017", [503, "Database unavailable"]],
  ["P2024", [503, "Database unavailable"]],
]);

function sendError(response: Response, status: number, error: string): void {
  const body: ApiErrorResponse = { error };
  response.status(status).json(body);
}

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, next) => {
  if (response.headersSent) {
    next(new Error("Request failed after response headers were sent"));
    return;
  }

  if (error instanceof URIError && "status" in error && error.status === 400) {
    sendError(response, 400, "Malformed URL parameter");
    return;
  }

  if (error instanceof ApiError) {
    const execution = error instanceof ExecutionApiError ? { runId: error.runId, runStatus: error.runStatus } : {};
    const body: ApiErrorResponse = { error: error.message, issues: error.issues, ...execution };
    response.status(error.status).json(body);
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const details = databaseErrors.get(error.code);
    if (details) {
      sendError(response, ...details);
      return;
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    sendError(response, 503, "Database unavailable");
    return;
  }

  if (error instanceof Error && "type" in error && typeof error.type === "string") {
    const details = requestErrors.get(error.type);
    if (details) {
      sendError(response, ...details);
      return;
    }
  }

  // Driver and provider errors can contain connection details or input data.
  console.error("Unhandled API error");
  sendError(response, 500, "Internal server error");
};
