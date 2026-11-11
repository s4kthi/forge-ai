import type { RequestHandler } from "express";
import { ApiError } from "../errors/api-error.ts";

const windowMs = 15 * 60 * 1000;
const maxBuckets = 4096;

export function authRateLimit(limit: number): RequestHandler {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  let nextSweep = 0;
  return (request, response, next) => {
    const now = Date.now();
    if (now >= nextSweep) {
      for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
      nextSweep = now + 60_000;
    }
    // Do not trust client-supplied forwarding headers.
    const key = request.socket.remoteAddress ?? "unknown";
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      if (!bucket && buckets.size >= maxBuckets) {
        response.set("Retry-After", "60");
        throw new ApiError(429, "Too many authentication attempts. Try again later.");
      }
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    if (bucket.count >= limit) {
      response.set("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
      throw new ApiError(429, "Too many authentication attempts. Try again later.");
    }
    bucket.count++;
    next();
  };
}
