import { Router } from "express";
import { z } from "zod";
import { authenticatedUser } from "../middleware/auth.ts";
import * as workforce from "../services/workforce.ts";
import { validate } from "../validation/demo.ts";

export function workforceRouter() {
  const router = Router({ mergeParams: true });
  const org = z.object({ organizationId: z.uuid() });
  const project = org.extend({ projectId: z.uuid() });
  const ticket = project.extend({ ticketId: z.uuid() });
  router.get("/workers", async (req, res) => {
    const { organizationId } = validate(org, req.params);
    res.json({ data: await workforce.listWorkers(authenticatedUser(res).id, organizationId) });
  });
  router.post("/workers", async (req, res) => {
    const { organizationId } = validate(org, req.params);
    res.status(201).json({ data: await workforce.saveWorker(authenticatedUser(res).id, organizationId, validate(workforce.workerInput, req.body)) });
  });
  router.patch("/workers/:workerId", async (req, res) => {
    const { organizationId, workerId } = validate(org.extend({ workerId: z.uuid() }), req.params);
    res.json({ data: await workforce.updateWorker(authenticatedUser(res).id, organizationId, workerId, validate(workforce.workerPatch, req.body)) });
  });
  router.get("/projects/:projectId/graph", async (req, res) => {
    const { ticketId } = validate(z.strictObject({ ticketId: z.uuid().optional() }), req.query);
    res.json({ data: await workforce.graph(authenticatedUser(res).id, validate(project, req.params), ticketId) });
  });
  router.post("/projects/:projectId/tickets", async (req, res) => {
    res.status(201).json({ data: await workforce.createTicket(authenticatedUser(res).id, validate(project, req.params), validate(workforce.ticketInput, req.body)) });
  });
  router.patch("/projects/:projectId/tickets/:ticketId", async (req, res) => {
    res.json({ data: await workforce.updateTicket(authenticatedUser(res).id, validate(ticket, req.params), validate(workforce.ticketPatch, req.body)) });
  });
  router.post("/projects/:projectId/tickets/:ticketId/assignments", async (req, res) => {
    res.status(201).json({ data: await workforce.assign(authenticatedUser(res).id, validate(ticket, req.params), validate(workforce.assignmentInput, req.body)) });
  });
  router.patch("/projects/:projectId/tickets/:ticketId/assignments/:assignmentId", async (req, res) => {
    const { assignmentId, ...scope } = validate(ticket.extend({ assignmentId: z.uuid() }), req.params);
    res.json({ data: await workforce.changeAssignment(authenticatedUser(res).id, scope, assignmentId, validate(workforce.statusInput, req.body)) });
  });
  router.post("/projects/:projectId/tickets/:ticketId/edges", async (req, res) => {
    res.status(201).json({ data: await workforce.addEdge(authenticatedUser(res).id, validate(ticket, req.params), validate(workforce.edgeInput, req.body)) });
  });
  return router;
}
