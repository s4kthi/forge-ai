import assert from "node:assert/strict";
import { setTimeout as sleep } from "node:timers/promises";
import { test } from "node:test";
import { createGeminiProvider } from "../src/llm/gemini.ts";

const apiKey = "mock-only-gemini-key";
const model = "gemini-3.1-flash-lite";
const request = { systemInstruction: "Return a short answer.", context: "Mock context" };

function response(text) {
  return Response.json({
    candidates: [{ content: { role: "model", parts: [{ text }] }, finishReason: "STOP" }],
    usageMetadata: { promptTokenCount: 12, candidatesTokenCount: 7 },
    modelVersion: model,
    responseId: "mock-response-id",
  });
}

function rejected(status, details = [], headers = {}) {
  return Response.json({ error: { code: status, message: apiKey, details } }, { status, headers });
}

test("Gemini SDK adapter sends text or JSON schema and reads only response text and reported usage", async () => {
  const requests = [];
  const provider = createGeminiProvider({ apiKey, model, fetch: async (url, init) => {
    requests.push(JSON.parse(init.body));
    assert.match(String(url), /:generateContent$/);
    assert.equal(new Headers(init.headers).get("x-goog-api-key"), apiKey);
    assert.ok(!init.body.includes(apiKey));
    return response("model output");
  } });

  assert.deepEqual(await provider.generate(request), {
    text: "model output", modelVersion: model, requestId: "mock-response-id", inputTokens: 12, outputTokens: 7,
  });
  const responseSchema = { type: "object", properties: { summary: { type: "string" } } };
  await provider.generate({ ...request, responseSchema });
  assert.equal(requests[0].generationConfig.responseMimeType, undefined);
  assert.equal(requests[1].generationConfig.responseMimeType, "application/json");
  assert.deepEqual(requests[1].generationConfig.responseJsonSchema, responseSchema);
});

test("Gemini SDK adapter retries 429 and 5xx with a bounded attempt count", async () => {
  let calls = 0;
  const provider = createGeminiProvider({ apiKey, model, fetch: async () => {
    calls++;
    if (calls === 1) return rejected(429, [], { "retry-after": "0" });
    if (calls === 2) return rejected(503, [{ "@type": "type.googleapis.com/google.rpc.RetryInfo", retryDelay: "0s" }]);
    return response("retried");
  } });
  assert.equal((await provider.generate(request)).text, "retried");
  assert.equal(calls, 3);

  calls = 0;
  const unavailable = createGeminiProvider({ apiKey, model, fetch: async () => {
    calls++;
    return rejected(503);
  } });
  await assert.rejects(unavailable.generate(request), {
    category: "PROVIDER_UNAVAILABLE", metadata: { requestId: undefined, providerFailure: { kind: "http", status: 503 } },
  });
  assert.equal(calls, 3);
});

test("Gemini SDK adapter honors out-of-budget retry guidance and never retries credentials or permanent errors", async () => {
  for (const [status, category, details, headers] of [
    [429, "RATE_LIMIT", [], { "retry-after": "60" }],
    [503, "PROVIDER_UNAVAILABLE", [{ "@type": "type.googleapis.com/google.rpc.RetryInfo", retryDelay: "60s" }], {}],
    [400, "AUTHENTICATION", [{ reason: "API_KEY_INVALID" }], {}],
    [403, "AUTHENTICATION", [], {}],
    [404, "MODEL_UNAVAILABLE", [], {}],
    [408, "TIMEOUT", [], {}],
    [400, "PROVIDER_REJECTED", [], {}],
  ]) {
    let calls = 0;
    const provider = createGeminiProvider({ apiKey, model, fetch: async () => {
      calls++;
      return rejected(status, details, headers);
    } });
    await assert.rejects(provider.generate(request), (error) => {
      assert.equal(error.category, category);
      assert.equal(error.message, category);
      assert.deepEqual(error.metadata.providerFailure, { kind: "http", status });
      assert.ok(!error.stack.includes(apiKey));
      return true;
    });
    assert.equal(calls, 1);
  }
});

test("Gemini SDK adapter distinguishes transport failures from HTTP failures and omits raw details", async () => {
  for (const [code, category, diagnostic] of [
    ["ECONNRESET", "PROVIDER_UNAVAILABLE", { kind: "transport", code: "ECONNRESET" }],
    ["UND_ERR_CONNECT_TIMEOUT", "TIMEOUT", { kind: "transport", code: "UND_ERR_CONNECT_TIMEOUT" }],
    [apiKey, "PROVIDER_UNAVAILABLE", { kind: "unknown" }],
  ]) {
    let calls = 0;
    const provider = createGeminiProvider({ apiKey, model, fetch: async () => {
      calls++;
      throw new TypeError("fetch failed", { cause: Object.assign(new Error(apiKey), { code }) });
    } });
    await assert.rejects(provider.generate(request), (error) => {
      assert.equal(error.category, category);
      assert.deepEqual(error.metadata.providerFailure, diagnostic);
      assert.equal(error.cause, undefined);
      assert.ok(!JSON.stringify(error).includes(apiKey));
      return true;
    });
    assert.equal(calls, 1);
  }
});

test("Gemini SDK adapter cancels transport on timeout and caller abort", async () => {
  let calls = 0;
  const waitingFetch = async (_url, init) => {
    calls++;
    await sleep(1000, undefined, { signal: init.signal });
    throw new Error("Expected an aborted request");
  };
  const timed = createGeminiProvider({ apiKey, model, fetch: waitingFetch, timeoutMs: 20 });
  await assert.rejects(timed.generate(request), { category: "TIMEOUT" });
  assert.equal(calls, 1);

  const cancelled = createGeminiProvider({ apiKey, model, fetch: waitingFetch });
  const controller = new AbortController();
  const generation = cancelled.generate({ ...request, signal: controller.signal });
  const timer = setTimeout(() => controller.abort(), 20);
  try {
    await assert.rejects(generation, { category: "CANCELLED" });
  } finally {
    clearTimeout(timer);
  }
  assert.equal(calls, 2);
});
