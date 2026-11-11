import { Box } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "../api";
import { Problem } from "../ui";

export function SignIn({ onLogin, sessionExpired }: { onLogin: () => Promise<void>; sessionExpired: boolean }) {
  const [registering, setRegistering] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>();
  const [notice, setNotice] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = new FormData(form);
    const email = String(input.get("email"));
    const password = String(input.get("password"));
    setPending(true);
    setError(undefined);
    setNotice("");
    try {
      if (registering) {
        const result = await api.register({ name: String(input.get("name")), email, password });
        setNotice(result.message);
        setRegistering(false);
      } else {
        await api.login({ email, password });
        await onLogin();
      }
    } catch (problem) {
      setError(problem);
    } finally {
      const field = form.elements.namedItem("password");
      if (field instanceof HTMLInputElement) field.value = "";
      setPending(false);
    }
  }

  return <main className="auth-layout"><section className="panel auth-card">
    <div className="brand"><span className="brand-mark"><Box size={20} /></span><strong>FORGE AI</strong></div>
    <h1>{registering ? "Create your account" : "Sign in to FORGE AI"}</h1>
    <p className="muted">{registering ? "Start with your own workspace after signing in." : "Access your delivery workspace."}</p>
    {sessionExpired && <p role="status">Your session ended. Sign in to continue.</p>}
    {notice && <p role="status">{notice}</p>}
    {error != null && <Problem error={error} />}
    <form key={String(registering)} onSubmit={(event) => { void submit(event); }}>
      {registering && <label>Name<input name="name" autoComplete="name" required maxLength={120} /></label>}
      <label>Email<input name="email" type="email" autoComplete="username" required maxLength={254} /></label>
      <label>Password<input name="password" type="password" autoComplete={registering ? "new-password" : "current-password"}
        required minLength={registering ? 15 : 1} maxLength={128} /></label>
      {registering && <small className="muted">Use at least 15 characters.</small>}
      <button type="submit" className="button primary" disabled={pending}>
        {pending ? "Please wait…" : registering ? "Create account" : "Sign in"}</button>
    </form>
    <button className="button subtle" disabled={pending} onClick={() => {
      setRegistering(!registering); setError(undefined); setNotice("");
    }}>{registering ? "Back to sign in" : "Register an account"}</button>
  </section></main>;
}
