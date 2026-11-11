import type { RequestHandler } from "express";

export const requestLogger: RequestHandler = (request, response, next) => {
  const started = performance.now();
  const { method } = request;

  response.once("finish", () => {
    const elapsed = Math.round(performance.now() - started);
    const route: unknown = request.route?.path;
    const label = typeof route === "string" ? request.baseUrl + route : "(unmatched)";
    console.info("%s %s %d %dms", method, label, response.statusCode, elapsed);
  });

  next();
};
