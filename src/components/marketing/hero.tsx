import { Bomb, Diamond, Rocket } from "lucide-react";
import Link from "next/link";

const TEASERS = [
  { label: "Crash", icon: Rocket, tag: "Multiplier ramp" },
  { label: "Mines", icon: Bomb, tag: "Grid reveal" },
  { label: "Plinko", icon: Diamond, tag: "Drop the ball" },
] as const;

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="grid flex-1 grid-cols-1 items-center gap-10 px-6 py-12 lg:grid-cols-12 lg:gap-12 lg:px-10 lg:py-20"
    >
      <div className="flex flex-col gap-6 lg:col-span-7">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent-hi)]">
          Midnight Arcade · Play-money only
        </p>
        <h1
          id="hero-title"
          className="font-display text-5xl font-semibold leading-[0.95] tracking-tight text-[var(--color-text)] sm:text-6xl lg:text-7xl"
        >
          A social casino that doesn&apos;t ask for your wallet.
        </h1>
        <p className="max-w-xl text-base text-[var(--color-muted)] sm:text-lg">
          Crash, Mines, Plinko — provably fair and powered by play-money credits. Sign up, land
          10,000 credits, and see how long you can ride the multiplier.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/signup"
            className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--color-bg-deep)] transition-colors hover:bg-[var(--color-accent-hi)]"
          >
            Claim 10,000 credits
          </Link>
          <Link
            href="/signin"
            className="rounded-md border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface)]"
          >
            I already have an account
          </Link>
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-6 border-t border-[var(--color-border)] pt-6 text-left">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Starter grant
            </dt>
            <dd className="numeric mt-1 text-xl font-semibold text-[var(--color-accent-hi)]">
              10,000
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Originals
            </dt>
            <dd className="mt-1 text-xl font-semibold">3</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Real money
            </dt>
            <dd className="mt-1 text-xl font-semibold text-[var(--color-muted)]">None</dd>
          </div>
        </dl>
      </div>

      <div className="relative lg:col-span-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-6 rounded-[var(--radius-2xl)] bg-[conic-gradient(from_180deg_at_60%_40%,oklch(0.82_0.17_180_/_0.22),oklch(0.68_0.25_350_/_0.22),transparent_60%)] blur-3xl"
        />
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/70 p-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Tonight&apos;s floor
            </p>
            <span className="rounded-[var(--radius-chip)] border border-[var(--color-border)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
              Preview
            </span>
          </div>
          <ul className="mt-5 space-y-3">
            {TEASERS.map((t) => (
              <li
                key={t.label}
                className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
              >
                <div className="flex size-10 items-center justify-center rounded-md bg-[var(--color-elevated)]">
                  <t.icon aria-hidden className="size-5 text-[var(--color-accent-hi)]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-lg font-semibold">{t.label}</span>
                  <span className="text-xs text-[var(--color-muted)]">{t.tag}</span>
                </div>
                <span className="numeric ml-auto text-sm text-[var(--color-muted)]">1.00×</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-[var(--color-muted)]">
            Games unlock as the build advances — Mines in Phase 10, Plinko in Phase 11, Crash in
            Phase 13.
          </p>
        </div>
      </div>
    </section>
  );
}
