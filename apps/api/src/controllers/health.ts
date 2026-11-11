import type { RequestHandler } from "express";
import type { DatabaseHealthResponse, HealthResponse } from "@forge-ai/shared";
import { checkDatabase } from "../services/database.ts";

export const getHealth: RequestHandler = (_request, response) => {
  const health: HealthResponse = {
    name: "FORGE AI",
    status: "ok",
    timestamp: new Date().toISOString(),
  };
  response.json(health);
};

export const getDatabaseHealth: RequestHandler = async (_request, response) => {
  const connected = await checkDatabase();
  const health: DatabaseHealthResponse = {
    status: connected ? "connected" : "unavailable",
    timestamp: new Date().toISOString(),
  };
  response.status(connected ? 200 : 503).json(health);
};
