BEGIN;

-- CreateEnum
CREATE TYPE "AgentRunMode" AS ENUM ('ALEX_SINGLE_AGENT');

-- CreateEnum
CREATE TYPE "LlmInvocationStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LlmErrorCategory" AS ENUM ('NOT_CONFIGURED', 'AUTHENTICATION', 'MODEL_UNAVAILABLE', 'PROVIDER_REJECTED', 'PROVIDER_UNAVAILABLE', 'RATE_LIMIT', 'TIMEOUT', 'INVALID_OUTPUT', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RunEventType" ADD VALUE 'LLM_CALL_STARTED';
ALTER TYPE "RunEventType" ADD VALUE 'LLM_CALL_FINISHED';

-- AlterTable
ALTER TABLE "AgentRun" ADD COLUMN     "mode" "AgentRunMode";

-- CreateTable
CREATE TABLE "LlmInvocation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "runId" UUID NOT NULL,
    "stepId" UUID NOT NULL,
    "provider" VARCHAR(32) NOT NULL,
    "model" VARCHAR(128) NOT NULL,
    "modelVersion" VARCHAR(128),
    "promptVersion" VARCHAR(64) NOT NULL,
    "status" "LlmInvocationStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT clock_timestamp(),
    "completedAt" TIMESTAMPTZ(3),
    "latencyMs" INTEGER,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "providerRequestId" VARCHAR(256),
    "errorCategory" "LlmErrorCategory",
    "estimatedCostUsd" DECIMAL(12,6),

    CONSTRAINT "LlmInvocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LlmInvocation_runId_startedAt_id_idx" ON "LlmInvocation"("runId", "startedAt", "id");

-- CreateIndex
CREATE INDEX "LlmInvocation_runId_stepId_idx" ON "LlmInvocation"("runId", "stepId");

-- AddForeignKey
ALTER TABLE "LlmInvocation" ADD CONSTRAINT "LlmInvocation_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AgentRun"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "LlmInvocation" ADD CONSTRAINT "LlmInvocation_runId_stepId_fkey" FOREIGN KEY ("runId", "stepId") REFERENCES "AgentStep"("runId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

COMMIT;
