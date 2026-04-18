"use client";

import { useActionState } from "react";
import { signinCredentialsAction, signinMagicAction } from "./actions";

export function SigninForms() {
  const [credsState, credsAction, credsPending] = useActionState(signinCredentialsAction, {});
  const [magicState, magicAction, magicPending] = useActionState(signinMagicAction, {});

  return (
    <div className="space-y-8">
      <form action={credsAction} className="space-y-4" noValidate>
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--color-muted)]">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 outline-none focus:border-[var(--color-accent)]"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--color-muted)]">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 outline-none focus:border-[var(--color-accent)]"
          />
        </label>
        {credsState?.error && (
          <p role="alert" className="text-sm text-[var(--color-loss)]">
            {credsState.error}
          </p>
        )}
        <button
          type="submit"
          disabled={credsPending}
          className="w-full rounded-[10px] bg-[var(--color-accent)] px-4 py-3 font-medium text-[var(--color-bg-deep)] transition disabled:opacity-60"
        >
          {credsPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-[var(--color-border)]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[var(--color-bg)] px-3 text-xs uppercase tracking-wider text-[var(--color-muted)]">
            or
          </span>
        </div>
      </div>

      <form action={magicAction} className="space-y-4" noValidate>
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--color-muted)]">Magic-link email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 outline-none focus:border-[var(--color-accent)]"
          />
        </label>
        {magicState?.error && (
          <p role="alert" className="text-sm text-[var(--color-loss)]">
            {magicState.error}
          </p>
        )}
        {magicState?.info && (
          <p className="text-sm text-[var(--color-accent-hi)]">{magicState.info}</p>
        )}
        <button
          type="submit"
          disabled={magicPending}
          className="w-full rounded-[10px] border border-[var(--color-border)] bg-transparent px-4 py-3 font-medium transition disabled:opacity-60"
        >
          {magicPending ? "Sending…" : "Email me a link"}
        </button>
      </form>
    </div>
  );
}
