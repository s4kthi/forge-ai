import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, expect, it, vi } from "vitest";
import { App } from "./App";

const user = { id: "user", name: "A signed-in user", email: "user@example.invalid" };
const org = { id: "private-org", name: "Private Team", slug: "private", role: "OWNER" };
const password = "synthetic test passphrase";
const data = (value: unknown, status = 200) => Response.json({ data: value }, { status });
const unauthorized = () => Response.json({ error: "Sign in to continue." }, { status: 401 });

function open(signedIn = false) {
  localStorage.clear();
  const requests = vi.fn<typeof fetch>(async (input) => {
    switch (new URL(String(input), "http://localhost").pathname) {
      case "/api/auth/me": return signedIn ? data(user) : unauthorized();
      case "/api/auth/login": signedIn = true; return data({ authenticated: true });
      case "/api/auth/register": return data({ message: "If registration is available for this email, you can now sign in." }, 202);
      case "/api/auth/logout": signedIn = false; return data({ authenticated: false });
      case "/api/organizations": return signedIn ? data([org]) : unauthorized();
      case "/api/organizations/private-org/projects": return signedIn ? data([]) : unauthorized();
      case "/health": return Response.json({ name: "FORGE AI", status: "ok" });
      default: throw new Error("Unexpected test URL");
    }
  });
  vi.stubGlobal("fetch", requests);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><MemoryRouter initialEntries={["/projects"]}><App /></MemoryRouter></QueryClientProvider>);
  return { requests, client, expire: () => { signedIn = false; } };
}

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("guards a deep link, registers and signs in with cookies, then signs out and clears workspace data", async () => {
  const { requests, client } = open();
  expect(await screen.findByRole("heading", { name: "Sign in to FORGE AI" })).toBeTruthy();
  expect(requests.mock.calls.some(([url]) => String(url).endsWith("/api/organizations"))).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: "Register an account" }));
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: user.name } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: user.email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: "Create account" }));
  expect(await screen.findByText(/registration is available/)).toBeTruthy();
  expect(screen.getByLabelText<HTMLInputElement>("Password").value).toBe("");
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: user.email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  expect(await screen.findByText("No projects in this organization", {}, { timeout: 5000 })).toBeTruthy();
  expect(screen.getByRole("option", { name: org.name })).toBeTruthy();
  expect(requests.mock.calls.every(([, options]) => options?.credentials === "include")).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
  expect(await screen.findByRole("heading", { name: "Sign in to FORGE AI" })).toBeTruthy();
  expect(screen.queryByText(org.name)).toBeNull();
  expect(client.getQueryData(["organizations", user.id])).toBeUndefined();
  expect(Object.values(localStorage)).not.toContain(password);
}, 12_000);

it("restores a session and clears private data when a protected request returns 401", async () => {
  const { client, expire } = open(true);
  expect(await screen.findByText("No projects in this organization", {}, { timeout: 5000 })).toBeTruthy();
  expire();
  await client.invalidateQueries({ queryKey: ["organizations"] });
  await waitFor(() => expect(screen.getByText("Your session ended. Sign in to continue.")).toBeTruthy());
  expect(screen.queryByText(org.name)).toBeNull();
}, 12_000);
