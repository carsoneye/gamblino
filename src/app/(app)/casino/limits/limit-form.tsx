"use client";

import { useActionState } from "react";
import type { LimitKind } from "@/lib/wallet/limits";
import { type SetLimitState, setLimitAction } from "./actions";

type Props = {
  kind: LimitKind;
  unit: "credit" | "minutes";
};

export function LimitForm({ kind, unit }: Props) {
  const [state, action, pending] = useActionState<SetLimitState | undefined, FormData>(
    setLimitAction,
    undefined,
  );

  const unitSuffix = unit === "credit" ? "credits" : "min";
  const step = unit === "credit" ? "1" : "1";
  const placeholder = unit === "credit" ? "e.g. 1000" : "e.g. 60";

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="kind" value={kind} />
      <div className="flex items-center gap-2">
        <label htmlFor={`limit-${kind}`} className="sr-only">{`Set ${kind} limit`}</label>
        <input
          id={`limit-${kind}`}
          name="amount"
          type="text"
          inputMode="decimal"
          required
          placeholder={placeholder}
          step={step}
          aria-describedby={`limit-${kind}-unit`}
          className="numeric min-w-0 flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)]/60 bg-[var(--color-bg)]/40 px-3 py-2 text-[13px] text-[var(--color-text)] focus-visible:border-[var(--color-accent)] focus-visible:outline-none"
        />
        <span id={`limit-${kind}-unit`} className="text-[12px] text-[var(--color-muted)]">
          {unitSuffix}
        </span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-4 py-2 text-[13px] font-semibold text-[var(--color-bg-deep)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-accent-hi)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-deep)] disabled:opacity-50"
        >
          {pending ? "Saving…" : "Update"}
        </button>
      </div>
      {state?.error ? (
        <p role="alert" className="text-[12px] text-[var(--color-danger,#ff6b6b)]">
          {state.error}
        </p>
      ) : null}
      {state?.info ? (
        <p role="status" className="text-[12px] text-[var(--color-muted)]">
          {state.info}
        </p>
      ) : null}
    </form>
  );
}
