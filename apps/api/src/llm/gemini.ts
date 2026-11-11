import { setTimeout as sleep } from "node:timers/promises";
import { ApiError as GeminiApiError, GoogleGenAI } from "@google/genai";
import { isFailureStatus, isTransportCode, LlmError } from "./provider.ts";
import type { LlmProvider, LlmRequest } from "./provider.ts";

const totalTimeoutMs = 30_000;
const maxAttempts = 3;
const maxBackoffMs = 5_000;

interface GeminiOptions {
  apiKey: string;
  model: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;
  if (/^\d+$/.test(value)) return Number(value) * 1000;
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : undefined;
}

function readErrorDetails(error: unknown): { invalidKey?: boolean; retryMs?: number } {
  if (!(error instanceof GeminiApiError) || error.message.length > 8192) return {};
  try {
    const parsed = JSON.parse(error.message);
    const details = parsed?.error?.details ?? parsed?.details;
    if (!Array.isArray(details)) return {};
    const delay = details.find((detail) => detail?.["@type"] === "type.googleapis.com/google.rpc.RetryInfo")?.retryDelay;
    return {
      invalidKey: details.some((detail) => detail?.reason === "API_KEY_INVALID"),
      retryMs: typeof delay === "string" && /^\d+(?:\.\d+)?s$/.test(delay) ? Number(delay.slice(0, -1)) * 1000 : undefined,
    };
  } catch {
    return {};
  }
}

function abortError(request: LlmRequest, signal: AbortSignal) {
  if (request.signal?.aborted) return new LlmError("CANCELLED");
  if (signal.aborted) return new LlmError("TIMEOUT");
  return undefined;
}

function readTransportFailure(error: unknown) {
  // Node fetch attaches socket errors as a cause, which the SDK can wrap again.
  for (let depth = 0; depth < 5 && error && typeof error === "object"; depth++) {
    const { code, cause } = error as { code?: unknown; cause?: unknown };
    if (isTransportCode(code)) return { kind: "transport" as const, code };
    error = cause;
  }
}

export function createGeminiProvider(options: GeminiOptions): LlmProvider {
  const client = new GoogleGenAI({ apiKey: options.apiKey, vertexai: false });
  const transport = options.fetch ?? fetch;
  const timeoutMs = options.timeoutMs ?? totalTimeoutMs;

  return {
    name: "gemini",
    model: options.model,
    async generate(request) {
      const deadline = performance.now() + timeoutMs;
      const timeout = AbortSignal.timeout(timeoutMs);
      const signal = request.signal ? AbortSignal.any([request.signal, timeout]) : timeout;

      for (let attempt = 1; ; attempt++) {
        const aborted = abortError(request, signal);
        if (aborted) throw aborted;

        let retryAfter: number | undefined;
        let requestId: string | undefined;
        let observedStatus: number | undefined;
        let transportFailure: ReturnType<typeof readTransportFailure>;
        try {
          const response = await client.models.generateContent({
            model: options.model,
            contents: request.context,
            config: {
              systemInstruction: request.systemInstruction,
              abortSignal: signal,
              automaticContinuation: false,
              automaticFunctionCalling: { disable: true },
              maxOutputTokens: 2048,
              ...(request.responseSchema && {
                responseMimeType: "application/json",
                responseJsonSchema: request.responseSchema,
              }),
              httpOptions: {
                retryOptions: { attempts: 1 },
                fetch: async (input, init) => {
                  const result = await transport(input, init).catch((error: unknown) => {
                    transportFailure = readTransportFailure(error);
                    throw error;
                  });
                  if (isFailureStatus(result.status)) observedStatus = result.status;
                  retryAfter = parseRetryAfter(result.headers.get("retry-after"));
                  requestId = result.headers.get("x-request-id") ?? undefined;
                  return result;
                },
              },
            },
          });
          const abortedAfterResponse = abortError(request, signal);
          if (abortedAfterResponse) throw abortedAfterResponse;
          return {
            text: response.text ?? "",
            modelVersion: response.modelVersion,
            requestId: response.responseId ?? requestId,
            inputTokens: response.usageMetadata?.promptTokenCount,
            outputTokens: response.usageMetadata?.candidatesTokenCount,
          };
        } catch (error) {
          const abortedDuringRequest = abortError(request, signal);
          if (abortedDuringRequest) throw abortedDuringRequest;
          const sdkStatus = error instanceof GeminiApiError ? error.status : undefined;
          const status = observedStatus ?? (isFailureStatus(sdkStatus) ? sdkStatus : undefined);
          const details = readErrorDetails(error);
          const providerFailure = status !== undefined
            ? { kind: "http" as const, status }
            : transportFailure ?? { kind: "unknown" as const };
          const metadata = { requestId, providerFailure };
          if (status === 401 || status === 403 || details.invalidKey) throw new LlmError("AUTHENTICATION", metadata);
          if (status === 404) throw new LlmError("MODEL_UNAVAILABLE", metadata);
          if (status === 408 || (providerFailure.kind === "transport" &&
            (providerFailure.code === "ETIMEDOUT" || providerFailure.code.endsWith("_TIMEOUT")))) {
            throw new LlmError("TIMEOUT", metadata);
          }
          const retryable = status === 429 || (status !== undefined && status >= 500 && status <= 599);
          const failure = new LlmError(
            status === 429 ? "RATE_LIMIT" : retryable || status === undefined ? "PROVIDER_UNAVAILABLE" : "PROVIDER_REJECTED",
            metadata,
          );
          if (!retryable || attempt === maxAttempts) throw failure;

          const backoff = 250 * 2 ** (attempt - 1);
          const delay = Math.max(backoff * (0.5 + Math.random() * 0.5), retryAfter ?? 0, details.retryMs ?? 0);
          if (delay > maxBackoffMs || delay >= deadline - performance.now()) throw failure;
          try {
            await sleep(delay, undefined, { signal });
          } catch {
            throw abortError(request, signal) ?? failure;
          }
        }
      }
    },
  };
}
