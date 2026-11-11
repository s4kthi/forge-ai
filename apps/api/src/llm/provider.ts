import type { LlmErrorCategory } from "../generated/prisma/enums.ts";

export interface LlmRequest {
  systemInstruction: string;
  context: string;
  responseSchema?: Record<string, unknown>;
  signal?: AbortSignal;
}

export interface LlmMetadata {
  modelVersion?: string;
  requestId?: string;
  inputTokens?: number;
  outputTokens?: number;
  providerFailure?: ProviderFailure;
}

const transportCodes = [
  "ENOTFOUND", "EAI_AGAIN", "ECONNRESET", "ECONNREFUSED", "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT", "UND_ERR_HEADERS_TIMEOUT", "UND_ERR_BODY_TIMEOUT", "UND_ERR_SOCKET",
  "CERT_HAS_EXPIRED", "ERR_TLS_CERT_ALTNAME_INVALID", "SELF_SIGNED_CERT_IN_CHAIN",
] as const;
type TransportCode = typeof transportCodes[number];

export type ProviderFailure =
  | { kind: "http"; status: number }
  | { kind: "transport"; code: TransportCode }
  | { kind: "unknown" };

export function isTransportCode(value: unknown): value is TransportCode {
  return typeof value === "string" && transportCodes.some((code) => code === value);
}

export function isFailureStatus(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 400 && value <= 599;
}

// Rebuild the diagnostic from allowlisted fields before crossing the persistence boundary.
export function safeProviderFailure(failure?: ProviderFailure): ProviderFailure | undefined {
  if (failure?.kind === "http" && isFailureStatus(failure.status)) return { kind: "http", status: failure.status };
  if (failure?.kind === "transport" && isTransportCode(failure.code)) return { kind: "transport", code: failure.code };
  return failure ? { kind: "unknown" } : undefined;
}

export interface LlmResult extends LlmMetadata {
  text: string;
}

export interface LlmProvider {
  readonly name: string;
  readonly model: string;
  generate(request: LlmRequest): Promise<LlmResult>;
}

export type ProviderFactory = () => LlmProvider;

export class LlmError extends Error {
  readonly category: LlmErrorCategory;
  readonly metadata?: LlmMetadata;

  constructor(category: LlmErrorCategory, metadata?: LlmMetadata) {
    super(category);
    this.name = "LlmError";
    this.category = category;
    this.metadata = metadata;
  }
}
