import { formatCredits } from "@/lib/money";

export type WinOutcome = "win" | "loss" | "cashed-out";

type Props = {
  outcome: WinOutcome | null;
  delta?: bigint;
  multiplier?: number;
};

const LABEL: Record<WinOutcome, string> = {
  win: "Win",
  loss: "Loss",
  "cashed-out": "Cashed out",
};

export function WinReveal({ outcome, delta, multiplier }: Props) {
  if (!outcome) return null;

  const positive = outcome !== "loss";
  const tone =
    outcome === "win"
      ? "var(--color-win)"
      : outcome === "cashed-out"
        ? "var(--color-live)"
        : "var(--color-loss)";
  const sign = delta === undefined ? "" : positive ? "+" : "−";
  const amount = delta === undefined ? null : formatCredits(delta < 0n ? -delta : delta);

  return (
    <div
      role="status"
      aria-live="polite"
      className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-[var(--duration-default)] flex items-baseline gap-3 rounded-[var(--radius-md)] border bg-[var(--color-elevated)] px-4 py-3"
      style={{ borderColor: `color-mix(in oklab, ${tone} 45%, transparent)` }}
    >
      <span
        className="font-display text-[11px] font-medium tracking-[0.32em] uppercase"
        style={{ color: tone }}
      >
        {LABEL[outcome]}
      </span>
      {amount !== null ? (
        <span className="numeric text-lg font-semibold" style={{ color: tone }}>
          {sign}
          {amount}
        </span>
      ) : null}
      {multiplier !== undefined ? (
        <span className="numeric ml-auto text-sm text-[var(--color-muted)]">
          ×{multiplier.toFixed(2)}
        </span>
      ) : null}
    </div>
  );
}
