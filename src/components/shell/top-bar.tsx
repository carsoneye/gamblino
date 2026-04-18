import { Search, Wallet } from "lucide-react";
import { signOut } from "@/auth";
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
  return (
    <div
      data-testid="top-bar"
      className="flex h-14 items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg-deep)]/60 px-4 backdrop-blur lg:px-6"
    >
      <button
        type="button"
        disabled
        aria-label="Open command palette (coming in phase 7)"
        className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-3 py-1.5 text-xs text-[var(--color-muted)] disabled:cursor-not-allowed"
      >
        <Search aria-hidden className="size-3.5" />
        <span>Search games, players…</span>
        <kbd className="ml-2 rounded-[var(--radius-chip)] border border-[var(--color-border)] px-1.5 font-mono text-[10px] text-[var(--color-muted)]">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-4">
        <div
          data-testid="balance-card"
          className="flex items-center gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5"
        >
          <Wallet aria-hidden className="size-4 text-[var(--color-accent-hi)]" />
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Balance
            </span>
            <span
              data-testid="balance"
              className="numeric text-base font-semibold text-[var(--color-accent-hi)]"
            >
              {formatCredits(balance)}
            </span>
          </div>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex flex-col text-right leading-tight">
            {name ? <span className="text-sm font-medium">{name}</span> : null}
            <span className="text-xs text-[var(--color-muted)]">Signed in as {email}</span>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--color-surface)]"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
