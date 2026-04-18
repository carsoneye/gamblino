import { ArrowUpRight, Search, TrendingUp } from "lucide-react";
import { signOut } from "@/auth";
import { LiveDot } from "@/components/shell/live-dot";
import { FLOOR_HEADCOUNT, sessionDelta } from "@/lib/floor-activity";
import { formatCredits } from "@/lib/money";

export function TopBar({
  balance,
  email,
  name,
}: {
  balance: bigint;
  email: string;
  name: string | null;
}) {
  const initial = (name ?? email)[0]?.toUpperCase() ?? "G";
  return (
    <div
      data-testid="top-bar"
      className="flex h-16 items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg-deep)]/70 px-4 backdrop-blur lg:px-6"
    >
      <button
        type="button"
        disabled
        aria-label="Open command palette (coming in phase 7)"
        className="group inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-3 py-1.5 text-xs text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface)] disabled:cursor-not-allowed"
      >
        <Search aria-hidden className="size-3.5" />
        <span className="hidden sm:inline">Jump to anything</span>
        <span className="ml-2 inline-flex items-center gap-0.5">
          <kbd className="rounded-[var(--radius-chip)] border border-[var(--color-border)] bg-[var(--color-bg-deep)] px-1.5 font-mono text-[10px] text-[var(--color-muted)]">
            ⌘
          </kbd>
          <kbd className="rounded-[var(--radius-chip)] border border-[var(--color-border)] bg-[var(--color-bg-deep)] px-1.5 font-mono text-[10px] text-[var(--color-muted)]">
            K
          </kbd>
        </span>
      </button>

      <div className="mx-auto hidden items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/40 px-3 py-1 md:inline-flex">
        <LiveDot tone="teal" size="xs" />
        <span className="numeric text-xs font-semibold text-[var(--color-text)]">
          {FLOOR_HEADCOUNT.toLocaleString()}
        </span>
        <span className="text-xs text-[var(--color-muted)]">on the floor</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div
          data-testid="balance-card"
          className="relative flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-accent)]/20 bg-[var(--color-surface)] px-4 py-1.5"
          style={{
            boxShadow: "inset 0 1px 0 color-mix(in oklab, var(--color-accent) 12%, transparent)",
          }}
        >
          <div className="flex flex-col leading-none">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Credits
            </span>
            <span
              data-testid="balance"
              className="numeric text-xl font-semibold leading-tight text-[var(--color-accent-hi)]"
              style={{
                textShadow: "0 0 18px color-mix(in oklab, var(--color-accent) 40%, transparent)",
              }}
            >
              {formatCredits(balance)}
            </span>
          </div>
          <span className="hidden items-center gap-1 rounded-[var(--radius-chip)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-accent-hi)] sm:inline-flex">
            <TrendingUp aria-hidden className="size-3" />
            <span className="numeric">+{sessionDelta.amount.toLocaleString()}</span>
          </span>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="flex size-9 items-center justify-center rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-elevated)] font-display text-sm font-semibold text-[var(--color-accent-hi)]"
            >
              {initial}
            </span>
            <div className="flex flex-col text-right leading-tight">
              {name ? (
                <span className="text-sm font-medium text-[var(--color-text)]">{name}</span>
              ) : null}
              <span className="text-[11px] text-[var(--color-muted)]">Signed in as {email}</span>
            </div>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="group inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-text)]"
            >
              Sign out
              <ArrowUpRight
                aria-hidden
                className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
