"use client";

import { useActionState } from "react";
import { signupAction } from "./actions";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, {});
  return (
    <form action={formAction} className="space-y-4" noValidate>
      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--color-muted)]">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 outline-none focus:border-[var(--color-accent)]"
        />
        {state?.fieldErrors?.email && (
          <span className="text-sm text-[var(--color-loss)]">{state.fieldErrors.email}</span>
        )}
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--color-muted)]">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 outline-none focus:border-[var(--color-accent)]"
        />
        {state?.fieldErrors?.password && (
          <span className="text-sm text-[var(--color-loss)]">{state.fieldErrors.password}</span>
        )}
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--color-muted)]">Display name (optional)</span>
        <input
          name="name"
          type="text"
          maxLength={80}
          autoComplete="nickname"
          className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 outline-none focus:border-[var(--color-accent)]"
        />
      </label>
      {state?.error && (
        <p role="alert" className="text-sm text-[var(--color-loss)]">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-[10px] bg-[var(--color-accent)] px-4 py-3 font-medium text-[var(--color-bg-deep)] transition disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}
