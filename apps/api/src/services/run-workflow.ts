import type { LlmMetadata } from "../llm/provider.ts";
import { ApiError } from "../errors/api-error.ts";
import { Prisma } from "../generated/prisma/client.ts";
import type { AgentMessageType, AgentRole, LlmErrorCategory, RunEventType } from "../generated/prisma/enums.ts";
import { appendEvent, withActiveRun } from "./run-store.ts";
import type { LockedRun, RunScope } from "./run-store.ts";

type RunChange =
  | { status: "RUNNING" | "COMPLETED" | "CANCELLED" }
  | { status: "FAILED"; errorMessage: string };

type StepChange =
  | { status: "RUNNING" | "SKIPPED" }
  | { status: "COMPLETED"; output?: Prisma.InputJsonValue }
  | { status: "FAILED"; errorMessage: string };

interface MessageInput {
  stepId?: string;
  fromAgent: AgentRole;
  toAgent?: AgentRole;
  messageType: AgentMessageType;
  content: string;
}

const stepEvents = {
  RUNNING: "STEP_STARTED",
  COMPLETED: "STEP_COMPLETED",
  FAILED: "STEP_FAILED",
  SKIPPED: "STEP_SKIPPED",
} as const satisfies Record<StepChange["status"], RunEventType>;

function boundedText(value: string, maximum: number, name: string): string {
  const text = value.trim();
  if (!text || text.length > maximum) {
    throw new ApiError(422, `${name} must contain 1 to ${maximum} characters`);
  }
  return text;
}

function requireRunning(run: LockedRun): void {
  if (run.status !== "RUNNING") throw new ApiError(409, "The run must be running");
}

export async function applyRunChange(
  database: Prisma.TransactionClient,
  run: LockedRun,
  change: RunChange,
  isFixture = false,
) {
  if (change.status === "RUNNING") {
    if (run.status !== "PENDING") throw new ApiError(409, "Only a pending run can be started");
    const started = await database.agentRun.update({
      where: { id: run.id },
      data: { status: "RUNNING", startedAt: new Date(), isFixture },
    });
    await appendEvent(database, run.id, "RUN_STARTED", { status: started.status, isFixture });
    return started;
  }

  if (change.status !== "CANCELLED") requireRunning(run);
  if (change.status === "COMPLETED") {
    const finished = await database.agentStep.count({
      where: { runId: run.id, status: { in: ["COMPLETED", "SKIPPED"] } },
    });
    const total = await database.agentStep.count({ where: { runId: run.id } });
    if (finished === 0 || finished !== total) {
      throw new ApiError(409, "Completion requires steps with no unfinished or failed steps");
    }
  }

  const completedAt = new Date();
  const errorMessage = change.status === "FAILED"
    ? boundedText(change.errorMessage, 500, "Error summary")
    : undefined;
  const { count: skippedSteps } = change.status === "COMPLETED"
    ? { count: 0 }
    : await database.agentStep.updateMany({
        where: { runId: run.id, status: { in: ["PENDING", "RUNNING"] } },
        data: { status: "SKIPPED", completedAt },
      });
  const updated = await database.agentRun.update({
    where: { id: run.id },
    data: { status: change.status, completedAt, errorMessage },
  });
  await database.planningJob.updateMany({
    where: { runId: run.id },
    data: { leaseToken: null, leaseExpiresAt: null, context: Prisma.DbNull },
  });
  await appendEvent(database, run.id, `RUN_${change.status}`, { status: updated.status, skippedSteps });
  return updated;
}

async function addStep(
  database: Prisma.TransactionClient,
  run: LockedRun,
  agentRole: AgentRole,
  input?: Prisma.InputJsonValue,
) {
  requireRunning(run);
  const previous = await database.agentStep.findFirst({
    where: { runId: run.id },
    orderBy: { sequence: "desc" },
    select: { sequence: true },
  });
  const step = await database.agentStep.create({
    data: { runId: run.id, agentRole, input, sequence: (previous?.sequence ?? 0) + 1 },
  });
  await appendEvent(database, run.id, "STEP_CREATED", {
    agentRole, sequence: step.sequence, status: step.status,
  }, step.id);
  return step;
}

async function findStep(database: Prisma.TransactionClient, runId: string, stepId: string) {
  const step = await database.agentStep.findUnique({ where: { runId_id: { runId, id: stepId } } });
  if (!step) throw new ApiError(404, "Step not found");
  return step;
}

async function applyStepChange(
  database: Prisma.TransactionClient,
  run: LockedRun,
  stepId: string,
  change: StepChange,
) {
  requireRunning(run);
  const step = await findStep(database, run.id, stepId);
  const canTransition = step.status === "PENDING"
    ? change.status === "RUNNING" || change.status === "SKIPPED"
    : step.status === "RUNNING" && change.status !== "RUNNING";
  if (!canTransition) throw new ApiError(409, "Invalid step transition");

  const now = new Date();
  const updated = await database.agentStep.update({
    where: { runId_id: { runId: run.id, id: step.id } },
    data: {
      status: change.status,
      startedAt: change.status === "RUNNING" ? now : undefined,
      completedAt: change.status !== "RUNNING" ? now : undefined,
      output: change.status === "COMPLETED" ? change.output : undefined,
      errorMessage: change.status === "FAILED" ? boundedText(change.errorMessage, 500, "Error summary") : undefined,
    },
  });
  await appendEvent(database, run.id, stepEvents[change.status], {
    agentRole: step.agentRole, sequence: step.sequence, status: updated.status,
  }, step.id);
  return updated;
}

async function addMessage(database: Prisma.TransactionClient, run: LockedRun, input: MessageInput) {
  requireRunning(run);
  if (input.messageType === "HANDOFF" && (!input.toAgent || input.toAgent === input.fromAgent)) {
    throw new ApiError(422, "A handoff requires a different receiving agent");
  }
  if (input.stepId) {
    const step = await findStep(database, run.id, input.stepId);
    if (step.agentRole !== input.fromAgent) {
      throw new ApiError(422, "The message sender must match the linked step's agent");
    }
  }
  const message = await database.agentMessage.create({
    data: { ...input, runId: run.id, content: boundedText(input.content, 4000, "Message") },
  });
  const type = message.messageType === "HANDOFF" ? "HANDOFF_RECORDED" : "MESSAGE_RECORDED";
  await appendEvent(database, run.id, type, {
    messageId: message.id,
    messageType: message.messageType,
    fromAgent: message.fromAgent,
    toAgent: message.toAgent,
  }, input.stepId);
  return message;
}

// Internal orchestration operations. Callers must supply sanitized inputs and summaries.
export function transitionRun(scope: RunScope, change: RunChange) {
  return withActiveRun(scope, (database, run) => applyRunChange(database, run, change));
}

export function recordStep(scope: RunScope, agentRole: AgentRole, input?: Prisma.InputJsonValue) {
  return withActiveRun(scope, (database, run) => addStep(database, run, agentRole, input));
}

export function transitionStep(scope: RunScope, stepId: string, change: StepChange) {
  return withActiveRun(scope, (database, run) => applyStepChange(database, run, stepId, change));
}

export function recordMessage(scope: RunScope, input: MessageInput) {
  return withActiveRun(scope, (database, run) => addMessage(database, run, input));
}

const fixtureStages = [
  { agent: "ALEX", summary: "Fixture delivery brief recorded." },
  { agent: "MARCUS", summary: "Fixture implementation outline recorded." },
  { agent: "DEVON", summary: "Fixture implementation note recorded. No code was produced." },
  { agent: "TESSA", summary: "Fixture verification checklist recorded. No tests were executed." },
  { agent: "ELENA", summary: "Fixture review note recorded. No code was reviewed." },
] as const satisfies readonly { agent: AgentRole; summary: string }[];

export function executeRunFixture(scope: RunScope) {
  return withActiveRun(scope, async (database, run) => {
    const started = await applyRunChange(database, run, { status: "RUNNING" }, true);

    for (const [index, stage] of fixtureStages.entries()) {
      const previous = fixtureStages[index - 1];
      const next = fixtureStages[index + 1];
      const step = await addStep(database, started, stage.agent, {
        fixture: true,
        previousAgent: previous?.agent ?? null,
      });
      await applyStepChange(database, started, step.id, { status: "RUNNING" });
      await applyStepChange(database, started, step.id, {
        status: "COMPLETED",
        output: { fixture: true, summary: stage.summary },
      });
      await addMessage(database, started, {
        stepId: step.id,
        fromAgent: stage.agent,
        messageType: "RESULT",
        content: stage.summary,
      });
      if (next) {
        await addMessage(database, started, {
          stepId: step.id,
          fromAgent: stage.agent,
          toAgent: next.agent,
          messageType: "HANDOFF",
          content: `Deterministic fixture handoff from ${stage.agent} to ${next.agent}.`,
        });
      }
    }

    return applyRunChange(database, started, { status: "COMPLETED" });
  });
}

interface InvocationInfo {
  provider: string;
  model: string;
  promptVersion: string;
}

export type PlanningOutcome =
  | { status: "SUCCEEDED"; output: Prisma.InputJsonObject; metadata: LlmMetadata }
  | { status: "FAILED" | "CANCELLED"; errorCategory: LlmErrorCategory; errorMessage: string; metadata: LlmMetadata };

export async function beginPlanningStep(
  database: Prisma.TransactionClient,
  run: LockedRun,
  agent: AgentRole,
  info: InvocationInfo,
  pendingStepId?: string,
) {
  const step = pendingStepId
    ? await findStep(database, run.id, pendingStepId)
    : await addStep(database, run, agent, { source: "LLM", promptVersion: info.promptVersion });
  await applyStepChange(database, run, step.id, { status: "RUNNING" });
  const invocation = await database.llmInvocation.create({ data: { ...info, runId: run.id, stepId: step.id } });
  await appendEvent(database, run.id, "LLM_CALL_STARTED", { invocationId: invocation.id, ...info }, step.id);
  return invocation;
}

// Called only in a transaction holding the run lock and a valid worker lease.
export async function finishPlanningInvocation(
  database: Prisma.TransactionClient,
  run: LockedRun,
  invocationId: string,
  outcome: PlanningOutcome,
  latencyMs: number,
  marcusPromptVersion: string,
) {
  const call = await database.llmInvocation.findUnique({
    where: { id: invocationId, runId: run.id, status: "RUNNING" },
    include: { step: { select: { agentRole: true } } },
  });
  if (!call) throw new ApiError(409, "LLM invocation is no longer active");

  const agent = call.step.agentRole;
  const invocation = await database.llmInvocation.update({
    where: { id: call.id },
    data: {
      status: outcome.status,
      completedAt: new Date(),
      latencyMs,
      errorCategory: outcome.status === "SUCCEEDED" ? null : outcome.errorCategory,
      modelVersion: outcome.metadata.modelVersion,
      providerRequestId: outcome.metadata.requestId,
      inputTokens: outcome.metadata.inputTokens,
      outputTokens: outcome.metadata.outputTokens,
    },
  });
  await appendEvent(database, run.id, "LLM_CALL_FINISHED", {
    invocationId: call.id, status: invocation.status, errorCategory: invocation.errorCategory,
    ...(outcome.status === "FAILED" && outcome.metadata.providerFailure && { providerFailure: outcome.metadata.providerFailure }),
  }, call.stepId);

  if (outcome.status === "SUCCEEDED") {
    const result = agent === "ALEX" ? { plan: outcome.output } : { proposal: outcome.output };
    const step = await applyStepChange(database, run, call.stepId, {
      status: "COMPLETED",
      output: { source: "LLM", independentlyVerified: false, ...result },
    });
    await addMessage(database, run, {
      stepId: step.id, fromAgent: agent, messageType: "RESULT",
      content: agent === "ALEX"
        ? "Alex produced an LLM-generated planning proposal. It has not been independently verified."
        : "Marcus produced an LLM-generated architecture proposal. It has not been independently verified.",
    });
    if (agent === "ALEX" && run.mode === "ALEX_MARCUS") {
      const handoff = await addMessage(database, run, {
        stepId: step.id, fromAgent: "ALEX", toAgent: "MARCUS", messageType: "HANDOFF",
        content: "Alex handed the validated planning proposal to Marcus for architecture review.",
      });
      // A checkpoint must not imply the next provider request has been dispatched.
      await addStep(database, run, "MARCUS", {
        source: "LLM", promptVersion: marcusPromptVersion, alexStepId: step.id, handoffMessageId: handoff.id,
      });
      return { checkpoint: "ALEX" as const };
    }
    await applyRunChange(database, run, { status: "COMPLETED" });
  } else if (outcome.status === "CANCELLED") {
    await applyStepChange(database, run, call.stepId, { status: "SKIPPED" });
    await applyRunChange(database, run, { status: "CANCELLED" });
  } else {
    await applyStepChange(database, run, call.stepId, { status: "FAILED", errorMessage: outcome.errorMessage });
    await applyRunChange(database, run, { status: "FAILED", errorMessage: outcome.errorMessage });
  }
  return { checkpoint: null };
}

export async function closeInterruptedInvocations(
  database: Prisma.TransactionClient,
  run: LockedRun,
  status: "UNKNOWN" | "CANCELLED",
) {
  const calls = await database.llmInvocation.findMany({
    where: { runId: run.id, status: "RUNNING" },
    select: { id: true, stepId: true },
  });
  const errorMessage = "The worker stopped during a provider request. Its outcome is unknown. Review provider usage before starting a new run.";
  for (const call of calls) {
    await database.llmInvocation.update({
      where: { id: call.id },
      data: { status, completedAt: new Date(), errorCategory: status === "CANCELLED" ? "CANCELLED" : null },
    });
    await appendEvent(database, run.id, "LLM_CALL_FINISHED", {
      invocationId: call.id, status, providerOutcome: "UNCONFIRMED",
    }, call.stepId);
    if (status === "UNKNOWN") await applyStepChange(database, run, call.stepId, { status: "FAILED", errorMessage });
  }
  if (status === "UNKNOWN" && calls.length) {
    await database.planningJob.update({ where: { runId: run.id }, data: { attentionRequired: true } });
    await applyRunChange(database, run, { status: "FAILED", errorMessage });
  }
  return calls.length > 0;
}

export function cancelPlanningRun(scope: RunScope) {
  return withActiveRun(scope, async (database, run) => {
    if (!run.mode) throw new ApiError(409, "Only planning runs can be cancelled here");
    await closeInterruptedInvocations(database, run, "CANCELLED");
    return applyRunChange(database, run, { status: "CANCELLED" });
  }, true);
}
