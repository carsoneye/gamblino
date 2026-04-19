"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="font-display text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--color-loss)]">
        Something broke
      </span>
      <h1 className="font-display text-5xl font-semibold tracking-[-0.03em] text-[var(--color-text)]">
        The table went quiet.
      </h1>
      <p className="max-w-md text-[15px] leading-relaxed text-[var(--color-muted)]">
        An unexpected error occurred. Your credits are safe — the house ledger is append-only.
      </p>
      {error.digest ? (
        <p className="text-[11px] font-medium text-[var(--color-muted)]">
          Ref: <span className="numeric">{error.digest}</span>
        </p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="inline-flex h-11 items-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-6 text-sm font-semibold text-[var(--color-bg-deep)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-accent-hi)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-deep)]"
      >
        Try again
      </button>
    </main>
  );
}
