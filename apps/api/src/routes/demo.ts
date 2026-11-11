import { json, Router } from "express";
import {
  createOrganization,
  createProject,
  createTask,
  listOrganizations,
  listProjects,
  listTasks,
  updateTask,
} from "../controllers/demo.ts";
import * as runs from "../controllers/runs.ts";
import { requireRunMembership } from "../middleware/organization.ts";
import { env } from "../config/env.ts";
import { githubRouter } from "./github.ts";
import { workforceRouter } from "./workforce.ts";

export function createWorkspaceRouter() {
  const demoRouter = Router();

  demoRouter.use(json({ limit: "32kb" }));
  demoRouter.use("/organizations/:organizationId/github", githubRouter());
  demoRouter.use("/organizations/:organizationId/workforce", workforceRouter());

  demoRouter.route("/organizations")
    .get(listOrganizations)
    .post(createOrganization);

  demoRouter.route("/organizations/:organizationId/projects")
    .get(listProjects)
    .post(createProject);

  demoRouter.route("/projects/:projectId/tasks")
    .get(listTasks)
    .post(createTask);

  demoRouter.patch("/tasks/:taskId", updateTask);

  demoRouter.route("/tasks/:taskId/runs")
    .get(requireRunMembership(), runs.listRuns)
    .post(requireRunMembership(true), runs.createRun);

  demoRouter.get("/runs/:runId", requireRunMembership(), runs.getRun);
  demoRouter.get("/runs/:runId/events", requireRunMembership(), runs.listRunEvents);
  demoRouter.get("/runs/:runId/messages", requireRunMembership(), runs.listRunMessages);
  if (env.enableDemoFixtures) demoRouter.post("/runs/:runId/demo", requireRunMembership(true), runs.runFixture);
  demoRouter.get("/agents", runs.listAgents);
  demoRouter.post("/tasks/:taskId/runs/llm", requireRunMembership(true), runs.startPlanning("ALEX_SINGLE_AGENT"));
  demoRouter.post("/tasks/:taskId/runs/collaborate", requireRunMembership(true), runs.startPlanning("ALEX_MARCUS"));
  demoRouter.post("/runs/:runId/cancel", requireRunMembership(true), runs.cancelRun);
  demoRouter.get("/runs/:runId/llm-calls", requireRunMembership(), runs.listLlmCalls);

  return demoRouter;
}
