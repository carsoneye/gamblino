import Link from "next/link";

export function MarketingHeader() {
  return (
    <header className="flex h-16 items-center gap-4 border-b border-[var(--color-border)]/60 px-6 lg:px-10">
      <Link
        href="/"
        className="group inline-flex items-baseline gap-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      >
        <span className="font-display text-lg font-semibold tracking-[-0.04em] text-[var(--color-text)]">
          gamblino
        </span>
        <span aria-hidden className="font-display text-lg font-semibold text-[var(--color-accent)]">
          .
        </span>
      </Link>

      <nav aria-label="Marketing" className="ml-auto flex items-center gap-1 text-sm">
        <Link
          href="/signin"
          className="rounded-[var(--radius-sm)] px-4 py-2 font-medium text-[var(--color-muted)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-text)]"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-bg-deep)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-accent-hi)]"
        >
          Take 10,000 credits
        </Link>
      </nav>
    </header>
  );
}
