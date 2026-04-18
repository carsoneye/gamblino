import Link from "next/link";
import { GameHeroCard } from "@/components/lobby/game-hero-card";
import { games } from "@/lib/nav";

const GAME_TAGS: Record<string, string> = {
  crash: "Ride the curve. Cash out before it bursts.",
  mines: "Reveal tiles. Avoid bombs. Stack multipliers.",
  plinko: "Drop the ball. Let the pegs decide.",
};

export function Hero() {
  const enabled = games.filter((g) => g.enabled);
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex flex-1 flex-col px-5 lg:px-8"
    >
      <div className="flex min-h-[62vh] flex-col justify-center gap-8 py-12 lg:py-16">
        <h1
          id="hero-title"
          className="max-w-4xl font-display font-semibold leading-[0.9] tracking-[-0.03em] text-[var(--color-text)]"
          style={{ fontSize: "clamp(3rem, 9vw, 7.5rem)" }}
        >
          Play free.
          <br />
          <span className="text-[var(--color-accent)]">Win nothing real.</span>
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-[var(--color-muted)] lg:text-lg">
          Crash, Mines, Plinko. Provably fair. No card, no deposit, nothing at stake. Take 10,000
          credits on the way in.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-[var(--color-accent)] px-6 text-sm font-semibold text-[var(--color-bg-deep)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-accent-hi)]"
          >
            Take 10,000 credits
          </Link>
          <Link
            href="/signin"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-transparent px-6 text-sm font-semibold text-[var(--color-text)] transition-colors duration-[var(--duration-fast)] hover:border-[var(--color-accent)]"
          >
            Sign in
          </Link>
        </div>
      </div>

      <section aria-labelledby="originals-heading" className="flex flex-col gap-5 pb-16">
        <div className="flex items-baseline justify-between">
          <h2
            id="originals-heading"
            className="font-display text-2xl font-semibold tracking-[-0.01em] text-[var(--color-text)]"
          >
            Originals
          </h2>
          <span className="text-sm text-[var(--color-muted)]">Three tables · provably fair</span>
        </div>
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {enabled.map((game) => (
            <li key={game.slug}>
              <GameHeroCard
                game={game.slug}
                label={game.label}
                tag={GAME_TAGS[game.slug] ?? ""}
                status={game.status}
                href={game.href}
                locked
              />
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
