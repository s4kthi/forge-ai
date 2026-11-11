import { Router } from "express";
import { getDatabaseHealth, getHealth } from "../controllers/health.ts";

export const healthRouter = Router();

healthRouter.get("/", getHealth);
healthRouter.get("/db", getDatabaseHealth);
