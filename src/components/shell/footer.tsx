import Link from "next/link";

const SECTIONS = [
  {
    title: "What this is",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Originals", href: "/#originals" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Play-money only", href: "/#faq" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
  {
    title: "House",
    links: [
      { label: "Sign in", href: "/signin" },
      { label: "Sign up", href: "/signup" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)]/60 bg-[var(--color-bg-deep)] px-6 py-12 lg:px-10 lg:py-16">
      <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-3">
          <span className="font-display text-2xl font-semibold tracking-[-0.02em] text-[var(--color-text)]">
            gamblino<span className="text-[var(--color-accent)]">.</span>
          </span>
          <p className="max-w-sm text-[13px] leading-relaxed text-[var(--color-muted)]">
            Play-money social casino. No conversion, no cash-out, nothing real at stake.
          </p>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-8 md:max-w-xl md:grid-cols-3">
          {SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h3 className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--color-muted)]">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded-[var(--radius-sm)] text-[var(--color-text)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-12 flex flex-col gap-2 border-t border-[var(--color-border)]/60 pt-6 text-[11px] text-[var(--color-muted)] md:flex-row md:items-center md:justify-between">
        <span>© 2026 gamblino · play-money only · no real-money gambling</span>
        <span>Credits have no cash value. If you need help, visit ncpgambling.org.</span>
      </div>
    </footer>
  );
}
