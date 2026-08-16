"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export function AdminLogin({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(signIn, {});

  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-4 py-20">
      <h1 className="font-display text-[32px] font-semibold leading-none text-ink">
        Order board
      </h1>
      <p className="mt-2.5 text-[13px] text-body">Staff access only.</p>

      {configured ? (
        <form action={action} className="mt-7 space-y-3">
          <label htmlFor="password" className="sr-only">
            Staff password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Password"
            className="w-full rounded-lg border border-rule bg-card px-3 py-3 text-[14px] text-ink placeholder:text-muted focus:border-accent focus:outline-none"
          />
          {state.error ? (
            <p role="alert" className="text-[12px] text-accent">
              {state.error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-cocoa px-4 py-3.5 text-[14px] font-semibold text-white transition hover:bg-ink disabled:opacity-50"
          >
            {pending ? "Checking…" : "Sign in"}
          </button>
        </form>
      ) : (
        <p className="mt-7 rounded-lg bg-note px-4 py-3 text-[12px] leading-relaxed text-body">
          This deployment has no <code className="font-mono">ADMIN_PASSWORD</code> set, so
          the board is closed. Add one in the project&rsquo;s environment variables to
          open it.
        </p>
      )}
    </main>
  );
}
