import { env } from "../config/env.ts";
import { createGeminiProvider } from "./gemini.ts";
import { LlmError } from "./provider.ts";

export function configuredProvider() {
  const key = env.geminiApiKey;
  const model = env.llmModel;
  if (env.llmProvider !== "gemini" || !key || !model || model === key ||
      !/^gemini-[a-z0-9][a-z0-9.-]{0,100}$/.test(model)) {
    throw new LlmError("NOT_CONFIGURED");
  }

  return createGeminiProvider({ apiKey: key, model });
}
