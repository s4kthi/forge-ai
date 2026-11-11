BEGIN;
ALTER TYPE "LlmInvocationStatus" ADD VALUE 'UNKNOWN';
ALTER TYPE "RunEventType" ADD VALUE 'RUN_RECOVERED';

CREATE TABLE "PlanningJob" (
    "runId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "keyHash" VARCHAR(64),
    "context" JSONB,
    "queuedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leaseToken" UUID,
    "leaseExpiresAt" TIMESTAMPTZ(3),
    "lastHeartbeatAt" TIMESTAMPTZ(3),
    "recoveryCount" INTEGER NOT NULL DEFAULT 0,
    "attentionRequired" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PlanningJob_pkey" PRIMARY KEY ("runId"),
    CONSTRAINT "PlanningJob_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AgentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PlanningJob_request_key" ON "PlanningJob"("userId", "organizationId", "taskId", "keyHash");
CREATE INDEX "PlanningJob_leaseExpiresAt_queuedAt_idx" ON "PlanningJob"("leaseExpiresAt", "queuedAt");
COMMIT;
