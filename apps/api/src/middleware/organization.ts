import type { RequestHandler } from "express";
import { requireOrganization } from "../services/access.ts";
import { getDatabase } from "../services/database.ts";
import { organizationParams, validate } from "../validation/demo.ts";
import { authenticatedUser } from "./auth.ts";

export function requireRunMembership(elevated = false): RequestHandler {
  return async (request, response, next) => {
    const { organizationId } = validate(organizationParams, request.query);
    await requireOrganization(getDatabase(), authenticatedUser(response).id, organizationId, elevated);
    next();
  };
}
