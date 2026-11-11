import { json, Router } from "express";
import { authenticatedUser, clearSessionCookie, readSessionToken, requireSession,
  requireTrustedOrigin, writeSessionCookie } from "../middleware/auth.ts";
import { authRateLimit } from "../middleware/auth-rate-limit.ts";
import { login, register, revokeSession } from "../services/auth.ts";
import { loginInput, registerInput } from "../validation/auth.ts";
import { validate } from "../validation/demo.ts";

export function createAuthRouter() {
  const router = Router();
  router.use(requireTrustedOrigin);
  const parseJson = json({ limit: "8kb" });
  router.post("/register", authRateLimit(5), parseJson, async (request, response) => {
    await register(validate(registerInput, request.body));
    response.status(202).json({ data: { message: "If registration is available for this email, you can now sign in." } });
  });
  router.post("/login", authRateLimit(10), parseJson, async (request, response) => {
    const token = await login(validate(loginInput, request.body), readSessionToken(request));
    writeSessionCookie(response, token);
    response.json({ data: { authenticated: true } });
  });
  router.post("/logout", async (request, response) => {
    const token = readSessionToken(request);
    if (token) await revokeSession(token);
    clearSessionCookie(response);
    response.json({ data: { authenticated: false } });
  });
  router.get("/me", requireSession, (_request, response) => {
    response.json({ data: authenticatedUser(response) });
  });
  return router;
}
