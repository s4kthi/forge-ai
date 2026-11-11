import "./load-env.ts";

const port = Number(process.env.API_PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("API_PORT must be an integer between 1 and 65535.");
}

const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
const parsedOrigin = URL.parse(frontendOrigin);
if (!parsedOrigin || !["http:", "https:"].includes(parsedOrigin.protocol) || parsedOrigin.origin !== frontendOrigin) {
  throw new Error("FRONTEND_ORIGIN must be one exact HTTP(S) origin without a trailing slash.");
}
if (process.env.NODE_ENV === "production" && parsedOrigin.protocol !== "https:") {
  throw new Error("FRONTEND_ORIGIN must use HTTPS in production.");
}

export const env = {
  port,
  nodeEnv: process.env.NODE_ENV,
  frontendOrigin,
  enableDemoFixtures: process.env.ENABLE_DEMO_FIXTURES === "true" &&
    (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"),
  databaseUrl: process.env.DATABASE_URL,
  geminiApiKey: process.env.GEMINI_API_KEY?.trim(),
  llmProvider: process.env.LLM_PROVIDER?.trim().toLowerCase(),
  llmModel: process.env.LLM_MODEL?.trim(),
};
