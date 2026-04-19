import Link from "next/link";
import { Footer } from "@/components/shell/footer";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div data-shell="marketing" className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border)]/60 bg-[var(--color-bg-deep)]/80 px-6 backdrop-blur-md lg:px-10">
        <Link
          href="/"
          className="inline-flex items-baseline rounded-[var(--radius-sm)] font-display text-xl font-semibold tracking-[-0.02em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          <span className="text-[var(--color-text)]">gamblino</span>
          <span aria-hidden className="text-[var(--color-accent)]">
            .
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm md:flex">
          <Link
            href="#originals"
            className="rounded-[var(--radius-sm)] text-[var(--color-muted)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            Originals
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-[var(--radius-sm)] text-[var(--color-muted)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            How it works
          </Link>
          <Link
            href="#faq"
            className="rounded-[var(--radius-sm)] text-[var(--color-muted)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-1 text-sm">
          <Link
            href="/signin"
            className="rounded-[var(--radius-sm)] px-4 py-2 font-medium text-[var(--color-muted)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-bg-deep)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-accent-hi)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-deep)]"
          >
            Take 10,000 credits
          </Link>
        </div>
      </header>
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
