import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.ts";
import { errorHandler } from "./middleware/error-handler.ts";
import { requestLogger } from "./middleware/request-logger.ts";
import { requireSession, requireTrustedOrigin } from "./middleware/auth.ts";
import { createAuthRouter } from "./routes/auth.ts";
import { createWorkspaceRouter } from "./routes/demo.ts";
import { healthRouter } from "./routes/health.ts";

export function createApp() {
  const app = express();
  app.use(requestLogger);
  app.use(helmet());
  app.use(cors({
    origin: (origin, callback) => callback(null, origin === env.frontendOrigin),
    credentials: true,
    exposedHeaders: ["Location"],
  }));
  app.use("/health", (_request, response, next) => {
    response.set("Cache-Control", "no-store");
    next();
  }, healthRouter);
  app.use("/api", (_request, response, next) => {
    response.set("Cache-Control", "no-store");
    next();
  });
  app.use("/api/auth", createAuthRouter());
  app.use("/api", requireSession, requireTrustedOrigin, createWorkspaceRouter());
  app.use((_request, response) => {
    response.status(404).json({ error: "Not found" });
  });
  app.use(errorHandler);
  return app;
}

export const app = createApp();
