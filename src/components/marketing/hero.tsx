import Link from "next/link";
import { Ticker } from "@/components/marketing/ticker";
import { LiveDot } from "@/components/shell/live-dot";
import { FLOOR_HEADCOUNT, FLOOR_TOP_WIN_24H } from "@/lib/floor-activity";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex flex-1 flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          clipPath: "polygon(0 0, 62% 0, 48% 100%, 0 100%)",
          background:
            "linear-gradient(115deg, color-mix(in oklab, var(--color-accent) 10%, transparent) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          clipPath: "polygon(62% 0, 100% 0, 100% 100%, 48% 100%)",
          background:
            "radial-gradient(60% 80% at 80% 30%, color-mix(in oklab, var(--color-win) 14%, transparent) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 hidden w-px bg-gradient-to-b from-transparent via-[var(--color-accent)]/40 to-transparent lg:block"
        style={{ transform: "translateX(-50%) skewX(-14deg)" }}
      />

      <div className="grid flex-1 grid-cols-1 gap-10 px-6 pt-10 pb-6 lg:grid-cols-12 lg:gap-0 lg:px-10 lg:pt-20 lg:pb-10">
        <div className="flex flex-col justify-center gap-8 lg:col-span-7 lg:pr-12">
          <div className="flex items-center gap-3">
            <LiveDot tone="teal" size="sm" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent-hi)]">
              Midnight Arcade · Play-money only
            </p>
          </div>
          <h1
            id="hero-title"
            className="font-display font-semibold leading-[0.88] tracking-[-0.02em] text-[var(--color-text)]"
            style={{ fontSize: "clamp(3.25rem, 9vw, 8.25rem)" }}
          >
            House rules.
            <br />
            <span className="text-[var(--color-accent-hi)]">Zero stakes.</span>
          </h1>
          <p className="max-w-xl text-base text-[var(--color-muted)] sm:text-lg">
            Crash, Mines, Plinko — provably fair, play-money only. Land 10,000 credits on the way
            in. See how long you can ride the multiplier before the floor eats you.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-[var(--color-bg-deep)] transition-colors hover:bg-[var(--color-accent-hi)]"
              style={{
                boxShadow: "0 0 28px color-mix(in oklab, var(--color-accent) 40%, transparent)",
              }}
            >
              Take 10,000 credits
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <Link
              href="/signin"
              className="text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)] sm:ml-2"
            >
              or sign in →
            </Link>
          </div>
          <dl className="mt-2 grid max-w-lg grid-cols-3 gap-6 border-t border-[var(--color-border)] pt-6">
            <Stat label="Starter" value="10,000" suffix="cr" accent />
            <Stat label="On floor" value={FLOOR_HEADCOUNT.toLocaleString()} />
            <Stat
              label="Top win · 24h"
              value={FLOOR_TOP_WIN_24H.toLocaleString()}
              suffix="cr"
              magenta
            />
          </dl>
        </div>

        <div className="relative flex items-center lg:col-span-5 lg:pl-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-8 -z-10 rounded-[var(--radius-2xl)] opacity-70 blur-3xl"
            style={{
              background:
                "conic-gradient(from 180deg at 60% 40%, color-mix(in oklab, var(--color-accent) 22%, transparent), color-mix(in oklab, var(--color-win) 22%, transparent), transparent 60%)",
            }}
          />
          <div
            className="relative w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/70 p-5 backdrop-blur lg:rotate-[-1.5deg]"
            style={{
              boxShadow: "inset 0 1px 0 color-mix(in oklab, var(--color-accent) 14%, transparent)",
            }}
          >
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <LiveDot tone="magenta" size="sm" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text)]">
                  Floor feed
                </p>
              </div>
              <span className="rounded-[var(--radius-chip)] border border-[var(--color-border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Live
              </span>
            </div>
            <Ticker />
            <ul className="mt-4 space-y-2 text-[12px] text-[var(--color-muted)]">
              <li className="flex items-center justify-between">
                <span>Rounds per hour</span>
                <span className="numeric text-[var(--color-text)]">1,284</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Biggest multiplier tonight</span>
                <span className="numeric text-[var(--color-accent-hi)]">241.0×</span>
              </li>
              <li className="flex items-center justify-between">
                <span>House edge</span>
                <span className="numeric text-[var(--color-text)]">1.00%</span>
              </li>
            </ul>
            <p className="mt-5 border-t border-[var(--color-border)] pt-3 text-[11px] text-[var(--color-muted)]">
              Mines opens Phase 10 · Plinko Phase 11 · Crash Phase 13.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  suffix,
  accent,
  magenta,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent?: boolean;
  magenta?: boolean;
}) {
  const color = accent
    ? "var(--color-accent-hi)"
    : magenta
      ? "var(--color-win)"
      : "var(--color-text)";
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
        {label}
      </dt>
      <dd className="numeric text-xl font-semibold leading-none" style={{ color }}>
        {value}
        {suffix ? (
          <span className="ml-1 text-[11px] font-medium text-[var(--color-muted)]">{suffix}</span>
        ) : null}
      </dd>
    </div>
  );
}
