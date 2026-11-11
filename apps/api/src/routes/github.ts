import { Router } from "express";
import { z } from "zod";
import { authenticatedUser } from "../middleware/auth.ts";
import * as github from "../services/github.ts";
import { validate } from "../validation/demo.ts";

export function githubRouter() {
  const router = Router({ mergeParams: true });
  const org = z.object({ organizationId: z.uuid() });
  const installation = org.extend({ installationId: z.uuid() });
  router.get("/", async (req, res) => {
    const { organizationId } = validate(org, req.params);
    res.json({ data: await github.connections(authenticatedUser(res).id, organizationId) });
  });
  router.post("/", async (req, res) => {
    const { organizationId } = validate(org, req.params);
    const { githubInstallationId } = validate(z.strictObject({ githubInstallationId: github.githubIdInput }), req.body);
    res.status(201).json({ data: await github.connectInstallation(authenticatedUser(res).id, organizationId, githubInstallationId) });
  });
  router.get("/:installationId/repositories", async (req, res) => {
    const { organizationId, installationId } = validate(installation, req.params);
    const { page } = validate(z.strictObject({ page: z.coerce.number().int().min(1).max(100).default(1) }), req.query);
    res.json({ data: await github.catalog(authenticatedUser(res).id, organizationId, installationId, page) });
  });
  router.post("/:installationId/repositories", async (req, res) => {
    const { organizationId, installationId } = validate(installation, req.params);
    const { githubRepositoryId } = validate(z.strictObject({ githubRepositoryId: github.githubIdInput }), req.body);
    res.status(201).json({ data: await github.selectRepository(authenticatedUser(res).id, organizationId, installationId, githubRepositoryId) });
  });
  router.patch("/projects/:projectId", async (req, res) => {
    const { organizationId, projectId } = validate(org.extend({ projectId: z.uuid() }), req.params);
    const { repositoryId } = validate(z.strictObject({ repositoryId: z.uuid().nullable() }), req.body);
    res.json({ data: await github.linkRepository(authenticatedUser(res).id, organizationId, projectId, repositoryId) });
  });
  return router;
}
