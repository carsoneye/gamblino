"use client";

import { useEffect, useState } from "react";
import { LiveDot } from "@/components/shell/live-dot";
import { type FloorWin, recentWins } from "@/lib/floor-activity";

const GAME_LABELS: Record<FloorWin["game"], string> = {
  crash: "Crash",
  mines: "Mines",
  plinko: "Plinko",
};

const ROTATE_MS = 1800;

export function Ticker() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setI((prev) => (prev + 1) % recentWins.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const win = recentWins[i];

  return (
    <div
      aria-live="polite"
      aria-atomic
      className="flex min-h-[56px] items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-deep)]/70 px-4 py-3"
    >
      <LiveDot tone={win.multiplier >= 10 ? "magenta" : "teal"} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <div className="flex items-baseline gap-1.5 truncate text-sm">
          <span className="font-medium text-[var(--color-text)]">{win.handle}</span>
          <span className="text-[var(--color-muted)]">hit</span>
          <span className="numeric font-semibold text-[var(--color-accent-hi)]">
            {win.multiplier.toFixed(2)}×
          </span>
          <span className="text-[var(--color-muted)]">on</span>
          <span className="text-[var(--color-text)]">{GAME_LABELS[win.game]}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[var(--color-muted)]">
          <span className="numeric">+{win.payout.toLocaleString()} cr</span>
          <span aria-hidden>·</span>
          <span className="numeric">{win.ago} ago</span>
        </div>
      </div>
    </div>
  );
}
