import type { RequestHandler } from "express";
import type { ApiResponse } from "@forge-ai/shared";
import { authenticatedUser } from "../middleware/auth.ts";
import * as organizations from "../services/organizations.ts";
import * as projects from "../services/projects.ts";
import * as tasks from "../services/tasks.ts";
import {
  organizationInput,
  organizationParams,
  projectInput,
  projectParams,
  taskInput,
  taskParams,
  taskPatch,
  validate,
} from "../validation/demo.ts";

export type DemoHandler = RequestHandler<Record<string, string>, ApiResponse<unknown>, unknown>;

export const createOrganization: DemoHandler = async (request, response) => {
  const data = await organizations.createOrganization(authenticatedUser(response).id, validate(organizationInput, request.body));
  response.status(201).json({ data });
};

export const listOrganizations: DemoHandler = async (_request, response) => {
  response.json({ data: await organizations.listOrganizations(authenticatedUser(response).id) });
};

export const createProject: DemoHandler = async (request, response) => {
  const { organizationId } = validate(organizationParams, request.params);
  const data = await projects.createProject(authenticatedUser(response).id, organizationId, validate(projectInput, request.body));
  response.status(201).json({ data });
};

export const listProjects: DemoHandler = async (request, response) => {
  const { organizationId } = validate(organizationParams, request.params);
  response.json({ data: await projects.listProjects(authenticatedUser(response).id, organizationId) });
};

export const createTask: DemoHandler = async (request, response) => {
  const { projectId } = validate(projectParams, request.params);
  const data = await tasks.createTask(authenticatedUser(response).id, projectId, validate(taskInput, request.body));
  response.status(201).json({ data });
};

export const listTasks: DemoHandler = async (request, response) => {
  const { projectId } = validate(projectParams, request.params);
  response.json({ data: await tasks.listTasks(authenticatedUser(response).id, projectId) });
};

export const updateTask: DemoHandler = async (request, response) => {
  const { taskId } = validate(taskParams, request.params);
  const data = await tasks.updateTask(authenticatedUser(response).id, taskId, validate(taskPatch, request.body));
  response.json({ data });
};
