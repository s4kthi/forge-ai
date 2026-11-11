BEGIN;

-- CreateEnum
CREATE TYPE "AgentRole" AS ENUM ('ALEX', 'MARCUS', 'DEVON', 'TESSA', 'ELENA');

-- CreateEnum
CREATE TYPE "AgentRunStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AgentStepStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "AgentMessageType" AS ENUM ('INSTRUCTION', 'RESULT', 'QUESTION', 'HANDOFF');

-- CreateEnum
CREATE TYPE "RunEventType" AS ENUM ('RUN_CREATED', 'RUN_STARTED', 'RUN_COMPLETED', 'RUN_FAILED', 'RUN_CANCELLED', 'STEP_CREATED', 'STEP_STARTED', 'STEP_COMPLETED', 'STEP_FAILED', 'STEP_SKIPPED', 'MESSAGE_RECORDED', 'HANDOFF_RECORDED');

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "taskId" UUID NOT NULL,
    "status" "AgentRunStatus" NOT NULL DEFAULT 'PENDING',
    "isFixture" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMPTZ(3),
    "completedAt" TIMESTAMPTZ(3),
    "errorMessage" TEXT,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentStep" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "runId" UUID NOT NULL,
    "agentRole" "AgentRole" NOT NULL,
    "status" "AgentStepStatus" NOT NULL DEFAULT 'PENDING',
    "sequence" INTEGER NOT NULL,
    "input" JSONB,
    "output" JSONB,
    "startedAt" TIMESTAMPTZ(3),
    "completedAt" TIMESTAMPTZ(3),
    "errorMessage" TEXT,

    CONSTRAINT "AgentStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentMessage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "runId" UUID NOT NULL,
    "stepId" UUID,
    "fromAgent" "AgentRole" NOT NULL,
    "toAgent" "AgentRole",
    "messageType" "AgentMessageType" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "AgentMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RunEvent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "runId" UUID NOT NULL,
    "stepId" UUID,
    "eventType" "RunEventType" NOT NULL,
    "payload" JSONB NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "RunEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentRun_taskId_createdAt_id_idx" ON "AgentRun"("taskId", "createdAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AgentStep_runId_id_key" ON "AgentStep"("runId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AgentStep_runId_sequence_key" ON "AgentStep"("runId", "sequence");

-- CreateIndex
CREATE INDEX "AgentMessage_runId_createdAt_id_idx" ON "AgentMessage"("runId", "createdAt", "id");

-- CreateIndex
CREATE INDEX "AgentMessage_runId_stepId_idx" ON "AgentMessage"("runId", "stepId");

-- CreateIndex
CREATE INDEX "RunEvent_runId_stepId_idx" ON "RunEvent"("runId", "stepId");

-- CreateIndex
CREATE UNIQUE INDEX "RunEvent_runId_sequence_key" ON "RunEvent"("runId", "sequence");

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "AgentStep" ADD CONSTRAINT "AgentStep_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AgentRun"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "AgentMessage" ADD CONSTRAINT "AgentMessage_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AgentRun"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "AgentMessage" ADD CONSTRAINT "AgentMessage_runId_stepId_fkey" FOREIGN KEY ("runId", "stepId") REFERENCES "AgentStep"("runId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "RunEvent" ADD CONSTRAINT "RunEvent_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AgentRun"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "RunEvent" ADD CONSTRAINT "RunEvent_runId_stepId_fkey" FOREIGN KEY ("runId", "stepId") REFERENCES "AgentStep"("runId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Enforce one pending or running execution per task, across processes and SQL clients.
CREATE UNIQUE INDEX "AgentRun_one_active_per_task_idx" ON "AgentRun"("taskId")
WHERE "status" IN ('PENDING', 'RUNNING');

COMMIT;
