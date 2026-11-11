import type { CookieOptions, Request, RequestHandler, Response } from "express";
import type { AuthUser } from "@forge-ai/shared";
import { env } from "../config/env.ts";
import { ApiError } from "../errors/api-error.ts";
import { getSessionUser, sessionLifetimeMs } from "../services/auth.ts";

const secure = env.nodeEnv === "production";
const cookieName = secure ? "__Host-forge_session" : "forge_session";
const cookieOptions = { httpOnly: true, secure, sameSite: "lax", path: "/" } satisfies CookieOptions;

export function readSessionToken(request: Request): string | undefined {
  const matches = request.headers.cookie?.split(";").map((part) => part.trim())
    .filter((part) => part.startsWith(cookieName + "="));
  if (matches?.length !== 1) return;
  const token = matches[0].slice(cookieName.length + 1);
  if (/^[A-Za-z0-9_-]{43}$/.test(token)) return token;
}

export function writeSessionCookie(response: Response, token: string) {
  response.cookie(cookieName, token, { ...cookieOptions, maxAge: sessionLifetimeMs });
}

export function clearSessionCookie(response: Response) {
  response.clearCookie(cookieName, cookieOptions);
}

export function authenticatedUser(response: Response): AuthUser {
  const user = response.locals.user as AuthUser | undefined;
  if (!user) throw new ApiError(401, "Sign in to continue.");
  return user;
}

export const requireSession: RequestHandler = async (request, response, next) => {
  const token = readSessionToken(request);
  const user = token && await getSessionUser(token);
  if (!user) throw new ApiError(401, "Sign in to continue.");
  response.locals.user = user;
  next();
};

export const requireTrustedOrigin: RequestHandler = (request, _response, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && request.get("origin") !== env.frontendOrigin) {
    throw new ApiError(403, "Request origin is not allowed.");
  }
  next();
};
