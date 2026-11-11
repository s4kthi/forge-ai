import assert from "node:assert/strict";

export const browserOrigin = "http://localhost:5173";
export const fixturePassword = "test-only passphrase 24";

export async function registerFixture(baseUrl, email) {
  const response = await fetch(baseUrl + "/api/auth/register", {
    method: "POST",
    headers: { origin: browserOrigin, "content-type": "application/json" },
    body: JSON.stringify({ name: "Test Account", email, password: fixturePassword }),
  });
  assert.equal(response.status, 202);
}

export async function fixtureSession(baseUrl, email) {
  const response = await fetch(baseUrl + "/api/auth/login", {
    method: "POST",
    headers: { origin: browserOrigin, "content-type": "application/json" },
    body: JSON.stringify({ email, password: fixturePassword }),
  });
  assert.equal(response.status, 200);
  return response.headers.get("set-cookie").split(";")[0];
}
