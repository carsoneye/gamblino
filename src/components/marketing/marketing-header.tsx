import Link from "next/link";

export function MarketingHeader() {
  return (
    <header className="flex h-14 items-center justify-between px-6 lg:px-10">
      <Link
        href="/"
        className="font-display text-2xl font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      >
        gamblino
      </Link>
      <nav aria-label="Marketing" className="flex items-center gap-2 text-sm">
        <Link
          href="/signin"
          className="rounded-md px-3 py-1.5 font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 font-medium text-[var(--color-bg-deep)] transition-colors hover:bg-[var(--color-accent-hi)]"
        >
          Get 10,000 credits
        </Link>
      </nav>
    </header>
  );
}
