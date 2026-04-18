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
  const initial = (name ?? email)[0]?.toUpperCase() ?? "G";
  return (
    <div
      data-testid="top-bar"
      className="col-start-2 flex h-16 items-center gap-6 border-b border-[var(--color-border)]/60 bg-[var(--color-bg-deep)] px-6 lg:px-8"
    >
      <div className="ml-auto flex items-center gap-6">
        <div data-testid="balance-card" className="flex items-baseline gap-2 leading-none">
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Credits
          </span>
          <span
            data-testid="balance"
            className="numeric text-xl font-semibold tracking-tight text-[var(--color-text)]"
          >
            {formatCredits(balance)}
          </span>
        </div>

        <div className="hidden h-6 w-px bg-[var(--color-border)] sm:block" />

        <div className="hidden items-center gap-4 sm:flex">
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-full border border-[var(--color-border)] font-display text-sm font-medium text-[var(--color-text)]"
          >
            {initial}
          </span>
          <div className="flex flex-col text-right leading-tight">
            {name ? (
              <span className="hidden text-sm font-medium text-[var(--color-text)] xl:inline">
                {name}
              </span>
            ) : null}
            <span className="text-[11px] text-[var(--color-muted)] max-xl:sr-only">
              Signed in as {email}
            </span>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="text-sm font-medium text-[var(--color-muted)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-text)]"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
