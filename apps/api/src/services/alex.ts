import { env } from "../config/env.ts";
import type { z } from "zod";
import type { Prisma } from "../generated/prisma/client.ts";
import type { LlmErrorCategory } from "../generated/prisma/enums.ts";
import { ApiError } from "../errors/api-error.ts";
import {
  alexPlanSchema, alexResponseSchema, alexSystemInstruction, redactKnownSecrets,
} from "../llm/alex-prompt.ts";
import { LlmError, safeProviderFailure } from "../llm/provider.ts";
import type { LlmMetadata, LlmProvider, LlmResult, ProviderFailure } from "../llm/provider.ts";
import { marcusProposalSchema, marcusResponseSchema, marcusSystemInstruction } from "../llm/marcus-prompt.ts";
import type { TaskScope } from "./run-store.ts";
import type { PlanningOutcome } from "./run-workflow.ts";

const errors = {
  NOT_CONFIGURED: [503, "Gemini is not configured"],
  AUTHENTICATION: [502, "Gemini denied access. Check the configured API key and its permissions."],
  MODEL_UNAVAILABLE: [502, "The configured Gemini model is unavailable"],
  PROVIDER_REJECTED: [502, "Gemini rejected the generation request"],
  PROVIDER_UNAVAILABLE: [503, "The Gemini request failed and the backend could not identify the cause."],
  RATE_LIMIT: [429, "Gemini rate limit or quota reached"],
  TIMEOUT: [504, "Gemini generation timed out"],
  INVALID_OUTPUT: [502, "Alex did not return a valid plan"],
  CANCELLED: [499, "Alex execution was cancelled"],
} as const satisfies Record<LlmErrorCategory, readonly [number, string]>;

export function publicError(category: LlmErrorCategory, agent: "ALEX" | "MARCUS" = "ALEX", failure?: ProviderFailure): ApiError {
  const [status, defaultMessage] = errors[category];
  let message: string = defaultMessage;
  if (category === "PROVIDER_UNAVAILABLE" || category === "TIMEOUT") {
    if (failure?.kind === "http") message = `Gemini returned HTTP ${failure.status}.`;
    if (failure?.kind === "transport") {
      message = category === "TIMEOUT"
        ? `The connection to Gemini timed out (${failure.code}).`
        : `The backend could not reach Gemini (${failure.code}).`;
    }
  }
  return new ApiError(status, agent === "MARCUS" ? message.replace("Alex", "Marcus") : message);
}

function redact(text: string): string {
  return redactKnownSecrets(text, env.geminiApiKey);
}

function identifier(value: string | undefined, limit: number): string | undefined {
  if (!value || value.length > limit || !/^[A-Za-z0-9._~+/:=-]+$/.test(value) || redact(value) !== value) {
    return undefined;
  }
  return value;
}

function tokenCount(value?: number): number | undefined {
  return value !== undefined && Number.isInteger(value) && value >= 0 && value <= 2_147_483_647 ? value : undefined;
}

function safeMetadata(metadata?: LlmMetadata): LlmMetadata {
  return {
    modelVersion: identifier(metadata?.modelVersion, 128),
    requestId: identifier(metadata?.requestId, 256),
    inputTokens: tokenCount(metadata?.inputTokens),
    outputTokens: tokenCount(metadata?.outputTokens),
    providerFailure: safeProviderFailure(metadata?.providerFailure),
  };
}

function parseOutput(result: LlmResult, schema: z.ZodType<Prisma.InputJsonObject>): Prisma.InputJsonObject {
  let candidate: unknown;
  try {
    if (result.text.length > 24_000) throw new Error();
    candidate = JSON.parse(result.text, (_key, value: unknown) => typeof value === "string" ? redact(value) : value);
  } catch {
    throw new LlmError("INVALID_OUTPUT", safeMetadata(result));
  }

  const parsed = schema.safeParse(candidate);
  if (!parsed.success) throw new LlmError("INVALID_OUTPUT", safeMetadata(result));
  return parsed.data;
}

export async function readTaskContext(database: Prisma.TransactionClient, { taskId, organizationId }: TaskScope) {
  const task = await database.task.findUnique({
    where: { id: taskId, project: { organizationId } },
    select: {
      title: true,
      description: true,
      project: { select: { name: true, githubRepositoryId: true, organization: { select: { name: true } } } },
    },
  });
  if (!task) throw new ApiError(404, "Task not found");

  return {
    task: { title: redact(task.title).slice(0, 200), description: redact(task.description ?? "").slice(0, 4000) },
    project: { name: redact(task.project.name).slice(0, 120) },
    organization: { name: redact(task.project.organization.name).slice(0, 120) },
    ...(task.project.githubRepositoryId && { repositoryId: task.project.githubRepositoryId }),
  };
}

interface PlanningPrompt {
  agent: "ALEX" | "MARCUS";
  systemInstruction: string;
  responseSchema: Record<string, unknown>;
  schema: z.ZodType<Prisma.InputJsonObject>;
}

export const alexPrompt: PlanningPrompt = {
  agent: "ALEX", systemInstruction: alexSystemInstruction, responseSchema: alexResponseSchema, schema: alexPlanSchema,
};
export const marcusPrompt: PlanningPrompt = {
  agent: "MARCUS", systemInstruction: marcusSystemInstruction, responseSchema: marcusResponseSchema,
  schema: marcusProposalSchema,
};

export async function generateOutcome(
  provider: LlmProvider,
  prompt: PlanningPrompt,
  context: unknown,
  signal?: AbortSignal,
): Promise<PlanningOutcome> {
  try {
    if (signal?.aborted) throw new LlmError("CANCELLED");
    const result = await provider.generate({
      systemInstruction: prompt.systemInstruction,
      context: JSON.stringify(context),
      responseSchema: prompt.responseSchema,
      signal,
    });
    return { status: "SUCCEEDED", output: parseOutput(result, prompt.schema), metadata: safeMetadata(result) };
  } catch (error) {
    const failure = error instanceof LlmError ? error : new LlmError("PROVIDER_UNAVAILABLE", { providerFailure: { kind: "unknown" } });
    const metadata = safeMetadata(failure.metadata);
    return {
      status: failure.category === "CANCELLED" ? "CANCELLED" : "FAILED",
      errorCategory: failure.category,
      errorMessage: publicError(failure.category, prompt.agent, metadata.providerFailure).message,
      metadata,
    };
  }
}
