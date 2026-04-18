import Link from "next/link";

export function MarketingHeader() {
  return (
    <header className="flex h-16 items-center gap-4 px-5 lg:px-8">
      <Link
        href="/"
        className="group inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      >
        <span
          aria-hidden
          className="flex size-7 items-center justify-center rounded-sm bg-[var(--color-accent)] font-display text-sm font-bold text-[var(--color-bg-deep)]"
        >
          g
        </span>
        <span className="font-display text-lg font-semibold tracking-[-0.02em] text-[var(--color-text)]">
          gamblino
        </span>
      </Link>

      <nav aria-label="Marketing" className="ml-auto flex items-center gap-1 text-sm">
        <Link
          href="/signin"
          className="rounded-[var(--radius-md)] px-4 py-2 font-medium text-[var(--color-muted)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-text)]"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="inline-flex items-center rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-bg-deep)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-accent-hi)]"
        >
          Take 10,000 credits
        </Link>
      </nav>
    </header>
  );
}
