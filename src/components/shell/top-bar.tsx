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
      className="col-start-2 flex h-16 items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg-deep)] px-5 lg:px-6"
    >
      <div className="ml-auto flex items-center gap-5">
        <div data-testid="balance-card" className="flex flex-col items-end leading-none">
          <span className="text-[11px] font-medium text-[var(--color-muted)]">Credits</span>
          <span
            data-testid="balance"
            className="numeric mt-1 text-2xl font-semibold text-[var(--color-text)]"
          >
            {formatCredits(balance)}
          </span>
        </div>

        <div className="hidden h-8 w-px bg-[var(--color-border)] sm:block" />

        <div className="hidden items-center gap-3 sm:flex">
          <span
            aria-hidden
            className="flex size-9 items-center justify-center rounded-full bg-[var(--color-surface)] font-display text-sm font-semibold text-[var(--color-text)]"
          >
            {initial}
          </span>
          <div className="flex flex-col text-right leading-tight">
            {name ? (
              <span className="hidden text-sm font-semibold text-[var(--color-text)] xl:inline">
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
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-muted)] transition-colors duration-[var(--duration-fast)] hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
