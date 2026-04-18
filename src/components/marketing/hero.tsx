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
      className="relative isolate flex flex-1 flex-col px-6 lg:px-10"
    >
      <div className="flex min-h-[64vh] flex-col justify-center gap-10 py-16 lg:py-20">
        <div className="flex flex-col gap-2">
          <span className="font-display text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-accent)]">
            A play-money social house
          </span>
        </div>
        <h1
          id="hero-title"
          className="max-w-4xl font-display font-semibold leading-[0.88] tracking-[-0.045em] text-[var(--color-text)]"
          style={{ fontSize: "clamp(3rem, 8.5vw, 7rem)" }}
        >
          The house keeps nothing
          <span aria-hidden className="text-[var(--color-accent)]">
            .
          </span>
          <br />
          So neither do you
          <span aria-hidden className="text-[var(--color-accent)]">
            .
          </span>
        </h1>
        <p className="max-w-lg text-base leading-relaxed text-[var(--color-muted)] lg:text-[17px]">
          Crash, Mines, Plinko — provably fair, play-money only. 10,000 credits on the way in. No
          card, no deposit, nothing real at stake.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-6 text-sm font-semibold tracking-tight text-[var(--color-bg-deep)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-accent-hi)]"
          >
            Take 10,000 credits
          </Link>
          <Link
            href="/signin"
            className="inline-flex h-11 items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-transparent px-6 text-sm font-medium tracking-tight text-[var(--color-text)] transition-colors duration-[var(--duration-fast)] hover:border-[var(--color-accent)]"
          >
            Sign in
          </Link>
        </div>
      </div>

      <section aria-labelledby="originals-heading" className="flex flex-col gap-6 pb-20">
        <div className="flex items-end justify-between border-b border-[var(--color-border)]/60 pb-3">
          <h2
            id="originals-heading"
            className="font-display text-xl font-semibold tracking-[-0.02em] text-[var(--color-text)]"
          >
            Originals
          </h2>
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--color-muted)]">
            Three tables · provably fair
          </span>
        </div>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
