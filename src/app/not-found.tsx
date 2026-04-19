import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="font-display text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--color-accent)]">
        404
      </span>
      <h1 className="font-display text-5xl font-semibold tracking-[-0.03em] text-[var(--color-text)]">
        Nothing at this address.
      </h1>
      <p className="max-w-md text-[15px] leading-relaxed text-[var(--color-muted)]">
        The page you asked for isn't here. No harm done — every credit is still yours.
      </p>
      <Link
        href="/"
        className="inline-flex h-11 items-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-6 text-sm font-semibold text-[var(--color-bg-deep)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-accent-hi)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-deep)]"
      >
        Back to the house
      </Link>
    </main>
  );
}
