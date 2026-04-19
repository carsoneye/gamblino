import Link from "next/link";

export function LandingHero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex flex-col gap-6 border-b border-[var(--color-border)]/60 px-6 py-16 lg:px-10 lg:py-20"
    >
      <span className="font-display text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-accent)]">
        A play-money social house
      </span>
      <h1
        id="hero-title"
        className="max-w-[22ch] font-display font-semibold leading-[0.9] tracking-[-0.04em] text-[var(--color-text)]"
        style={{ fontSize: "clamp(2.75rem, 7.5vw, 5.5rem)" }}
      >
        Play free
        <span aria-hidden className="text-[var(--color-accent)]">
          .
        </span>
        <br />
        Win nothing real
        <span aria-hidden className="text-[var(--color-accent)]">
          .
        </span>
      </h1>
      <p className="max-w-xl text-base leading-relaxed text-[var(--color-muted)] lg:text-[17px]">
        Crash, Mines, Plinko, and a daily Lottery. Provably fair, play-money only. 10,000 credits on
        the way in. No card. No crypto. Nothing real at stake.
      </p>
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Link
          href="/signup"
          className="inline-flex h-11 items-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-6 text-sm font-semibold tracking-tight text-[var(--color-bg-deep)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-accent-hi)]"
        >
          Take 10,000 credits
        </Link>
        <Link
          href="#how-it-works"
          className="inline-flex h-11 items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-transparent px-6 text-sm font-medium tracking-tight text-[var(--color-text)] transition-colors duration-[var(--duration-fast)] hover:border-[var(--color-accent)]"
        >
          How it works
        </Link>
      </div>
    </section>
  );
}
