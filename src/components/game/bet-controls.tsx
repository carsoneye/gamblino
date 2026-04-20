"use client";

import { type ChangeEvent, type FormEvent, useId } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CURRENCY_UNITS, formatAmount } from "@/lib/wallet/currencies";

export type BetPhase = "idle" | "open" | "settling";

type Props = {
  balance: bigint;
  stake: bigint;
  onStakeChange: (next: bigint) => void;
  onPlaceBet: () => void;
  onCashOut?: () => void;
  phase?: BetPhase;
  minStake?: bigint;
  disabled?: boolean;
  placeBetLabel?: string;
  cashOutLabel?: string;
};

const ZERO = 0n;

function clamp(value: bigint, min: bigint, max: bigint): bigint {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function BetControls({
  balance,
  stake,
  onStakeChange,
  onPlaceBet,
  onCashOut,
  phase = "idle",
  minStake = CURRENCY_UNITS.credit,
  disabled = false,
  placeBetLabel = "Place bet",
  cashOutLabel = "Cash out",
}: Props) {
  const inputId = useId();
  const open = phase === "open";
  const settling = phase === "settling";
  const max = balance > ZERO ? balance : ZERO;
  const locked = disabled || settling;

  const displayCredits = Number(stake / CURRENCY_UNITS.credit);

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    const credits = digits === "" ? ZERO : BigInt(digits);
    onStakeChange(clamp(credits * CURRENCY_UNITS.credit, ZERO, max));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (open) {
      onCashOut?.();
    } else if (!locked && stake >= minStake && stake <= max) {
      onPlaceBet();
    }
  }

  function setStake(next: bigint) {
    if (locked || open) return;
    onStakeChange(clamp(next, ZERO, max));
  }

  const canPlace = !open && !locked && stake >= minStake && stake <= max;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
    >
      <Field label="Bet amount" suffix="credits">
        <div className="flex items-stretch divide-x divide-[var(--color-border)]">
          <input
            id={inputId}
            inputMode="numeric"
            autoComplete="off"
            value={displayCredits.toLocaleString("en-US")}
            onChange={handleInput}
            disabled={locked || open}
            aria-label="Bet amount in credits"
            className="numeric h-11 min-w-0 flex-1 bg-transparent px-3 text-base font-semibold outline-none disabled:opacity-70"
          />
          <button
            type="button"
            onClick={() => setStake(stake / 2n < minStake ? minStake : stake / 2n)}
            disabled={locked || open || stake <= minStake}
            className="numeric w-11 shrink-0 text-xs font-semibold text-[var(--color-muted)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-text)] disabled:opacity-40"
            aria-label="Halve bet"
          >
            ½
          </button>
          <button
            type="button"
            onClick={() => setStake(stake * 2n)}
            disabled={locked || open || stake * 2n > max}
            className="numeric w-11 shrink-0 text-xs font-semibold text-[var(--color-muted)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-text)] disabled:opacity-40"
            aria-label="Double bet"
          >
            2×
          </button>
          <button
            type="button"
            onClick={() => setStake(max)}
            disabled={locked || open || stake === max}
            className="w-12 shrink-0 text-[11px] font-semibold tracking-[0.14em] text-[var(--color-muted)] uppercase transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-text)] disabled:opacity-40"
            aria-label="Bet max"
          >
            Max
          </button>
        </div>
      </Field>

      <Meta label="Balance" value={`${formatAmount(balance, "credit")} credits`} />

      <Button
        type="submit"
        size="lg"
        disabled={open ? !onCashOut || locked : !canPlace}
        className={cn("h-11 w-full", open && "bg-[var(--color-win)] text-[var(--color-bg-deep)]")}
      >
        {settling ? "Settling…" : open ? cashOutLabel : placeBetLabel}
      </Button>
    </form>
  );
}

function Field({
  label,
  suffix,
  children,
}: {
  label: string;
  suffix?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[10.5px] font-medium tracking-[0.22em] text-[var(--color-muted)] uppercase">
          {label}
        </span>
        {suffix ? (
          <span className="numeric text-[11px] text-[var(--color-muted)]">{suffix}</span>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)]">
        {children}
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-[12px]">
      <span className="text-[var(--color-muted)]">{label}</span>
      <span className="numeric text-[var(--color-text)]">{value}</span>
    </div>
  );
}
