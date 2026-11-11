BEGIN;
-- CreateEnum
CREATE TYPE "WorkforceRole" AS ENUM ('PM', 'ARCHITECT', 'DESIGNER', 'DEVELOPER', 'QA', 'REVIEWER');

-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('TODO', 'RUNNING', 'BLOCKED', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkflowEventKind" AS ENUM ('TICKET_CREATED', 'TICKET_UPDATED', 'ASSIGNED', 'STATUS_CHANGED', 'DEPENDENCY_ADDED', 'HANDOFF');

-- AlterEnum
ALTER TYPE "RunEventType" ADD VALUE 'REPOSITORY_OBSERVED';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "githubRepositoryId" UUID;

-- CreateTable
CREATE TABLE "GitHubInstallation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "githubId" VARCHAR(20) NOT NULL,
    "account" TEXT NOT NULL,
    "revokedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GitHubInstallation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubRepository" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "installationId" UUID NOT NULL,
    "githubId" VARCHAR(20) NOT NULL,
    "fullName" TEXT NOT NULL,
    "defaultBranch" TEXT,
    "private" BOOLEAN NOT NULL,

    CONSTRAINT "GitHubRepository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentWorker" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "role" "WorkforceRole" NOT NULL,
    "configuration" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AgentWorker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "projectId" UUID NOT NULL,
    "requirement" TEXT NOT NULL,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "WorkStatus" NOT NULL DEFAULT 'TODO',
    "ownerId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkAssignment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticketId" UUID NOT NULL,
    "workerId" UUID NOT NULL,
    "taskId" UUID,
    "status" "WorkStatus" NOT NULL DEFAULT 'TODO',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMPTZ(3),
    "completedAt" TIMESTAMPTZ(3),
    "blockedReason" TEXT,
    "error" TEXT,

    CONSTRAINT "WorkAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowDependency" (
    "ticketId" UUID NOT NULL,
    "fromId" UUID NOT NULL,
    "toId" UUID NOT NULL,

    CONSTRAINT "WorkflowDependency_pkey" PRIMARY KEY ("ticketId","fromId","toId")
);

-- CreateTable
CREATE TABLE "WorkflowEvent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticketId" UUID NOT NULL,
    "assignmentId" UUID,
    "actorId" UUID NOT NULL,
    "kind" "WorkflowEventKind" NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "WorkflowEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GitHubInstallation_githubId_key" ON "GitHubInstallation"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubInstallation_organizationId_id_key" ON "GitHubInstallation"("organizationId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubRepository_organizationId_id_key" ON "GitHubRepository"("organizationId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubRepository_installationId_githubId_key" ON "GitHubRepository"("installationId", "githubId");

-- CreateIndex
CREATE INDEX "AgentWorker_organizationId_idx" ON "AgentWorker"("organizationId");

-- CreateIndex
CREATE INDEX "Ticket_projectId_createdAt_idx" ON "Ticket"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkAssignment_workerId_idx" ON "WorkAssignment"("workerId");

-- CreateIndex
CREATE INDEX "WorkAssignment_taskId_idx" ON "WorkAssignment"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkAssignment_ticketId_id_key" ON "WorkAssignment"("ticketId", "id");

-- CreateIndex
CREATE INDEX "WorkflowDependency_ticketId_toId_idx" ON "WorkflowDependency"("ticketId", "toId");

-- CreateIndex
CREATE INDEX "WorkflowEvent_ticketId_createdAt_id_idx" ON "WorkflowEvent"("ticketId", "createdAt", "id");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_organizationId_githubRepositoryId_fkey" FOREIGN KEY ("organizationId", "githubRepositoryId") REFERENCES "GitHubRepository"("organizationId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "GitHubInstallation" ADD CONSTRAINT "GitHubInstallation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubRepository" ADD CONSTRAINT "GitHubRepository_organizationId_installationId_fkey" FOREIGN KEY ("organizationId", "installationId") REFERENCES "GitHubInstallation"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentWorker" ADD CONSTRAINT "AgentWorker_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkAssignment" ADD CONSTRAINT "WorkAssignment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkAssignment" ADD CONSTRAINT "WorkAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "AgentWorker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkAssignment" ADD CONSTRAINT "WorkAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowDependency" ADD CONSTRAINT "WorkflowDependency_ticketId_fromId_fkey" FOREIGN KEY ("ticketId", "fromId") REFERENCES "WorkAssignment"("ticketId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowDependency" ADD CONSTRAINT "WorkflowDependency_ticketId_toId_fkey" FOREIGN KEY ("ticketId", "toId") REFERENCES "WorkAssignment"("ticketId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowEvent" ADD CONSTRAINT "WorkflowEvent_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowEvent" ADD CONSTRAINT "WorkflowEvent_ticketId_assignmentId_fkey" FOREIGN KEY ("ticketId", "assignmentId") REFERENCES "WorkAssignment"("ticketId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
