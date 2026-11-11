import type { Request } from "express";
import { z } from "zod";
import { agents } from "../config/agents.ts";
import { ApiError } from "../errors/api-error.ts";
import { authenticatedUser } from "../middleware/auth.ts";
import * as runs from "../services/run-store.ts";
import { cancelPlanningRun, executeRunFixture } from "../services/run-workflow.ts";
import { enqueuePlanning } from "../services/planning-queue.ts";
import { taskParams, validate } from "../validation/demo.ts";
import type { AgentRunMode } from "../generated/prisma/enums.ts";
import type { DemoHandler } from "./demo.ts";

const organizationQuery = z.strictObject({ organizationId: z.uuid() });
const runParams = z.strictObject({ runId: z.uuid() });
const emptyBody = z.strictObject({});

function runScope(request: Request) {
  return { ...validate(runParams, request.params), ...validate(organizationQuery, request.query) };
}

function taskScope(request: Request) {
  return { ...validate(taskParams, request.params), ...validate(organizationQuery, request.query) };
}

function requireEmptyJson(request: Request): void {
  if (!request.is("application/json")) throw new ApiError(415, "Send an empty application/json object");
  validate(emptyBody, request.body);
}

export const createRun: DemoHandler = async (request, response) => {
  const scope = taskScope(request);
  requireEmptyJson(request);
  response.status(201).json({ data: await runs.createRun(scope) });
};

export const listRuns: DemoHandler = async (request, response) => {
  response.json({ data: await runs.listRuns(taskScope(request)) });
};

export const getRun: DemoHandler = async (request, response) => {
  response.json({ data: await runs.getRun(runScope(request)) });
};

export const listRunEvents: DemoHandler = async (request, response) => {
  response.json({ data: await runs.listRunEvents(runScope(request)) });
};

export const listRunMessages: DemoHandler = async (request, response) => {
  response.json({ data: await runs.listRunMessages(runScope(request)) });
};

export const runFixture: DemoHandler = async (request, response) => {
  const scope = runScope(request);
  requireEmptyJson(request);
  response.json({ data: await executeRunFixture(scope) });
};

export const listAgents: DemoHandler = (_request, response) => {
  response.json({ data: agents });
};

export const listLlmCalls: DemoHandler = async (request, response) => {
  response.json({ data: await runs.listLlmCalls(runScope(request)) });
};

export function startPlanning(mode: AgentRunMode): DemoHandler {
  return async (request, response) => {
    const scope = taskScope(request);
    requireEmptyJson(request);
    const key = request.get("Idempotency-Key");
    if (key !== undefined && !/^[A-Za-z0-9._~-]{1,128}$/.test(key)) {
      throw new ApiError(400, "Invalid Idempotency-Key");
    }
    const acknowledgment = request.get("Acknowledge-Unknown-Outcome");
    if (acknowledgment !== undefined && acknowledgment !== "true") throw new ApiError(400, "Invalid provider outcome acknowledgment");
    const { run, replayed } = await enqueuePlanning(scope, authenticatedUser(response).id, mode, key, acknowledgment === "true");
    response.location(`/api/runs/${run.id}?organizationId=${scope.organizationId}`)
      .status(replayed ? 200 : 202).json({ data: { run } });
  };
}

export const cancelRun: DemoHandler = async (request, response) => {
  const scope = runScope(request);
  requireEmptyJson(request);
  response.json({ data: await cancelPlanningRun(scope) });
};
