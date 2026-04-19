import { GameHeroCard } from "@/components/lobby/game-hero-card";
import { resolveGames } from "@/lib/nav";

export function OriginalsRow({
  locked = false,
  heading = "Originals",
}: {
  locked?: boolean;
  heading?: string;
}) {
  const games = resolveGames();
  return (
    <section
      id="originals"
      aria-labelledby="originals-heading"
      className="flex w-full max-w-4xl flex-col gap-4 px-6 pb-12 lg:px-10"
    >
      <div className="flex items-end justify-between">
        <h2
          id="originals-heading"
          className="font-display text-sm font-semibold tracking-[-0.01em] text-[var(--color-muted)]"
        >
          {heading}
        </h2>
      </div>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4">
        {games.map((game) => (
          <li key={game.slug}>
            <GameHeroCard
              game={game.slug}
              label={game.label}
              tag={game.tag}
              status={game.status}
              href={game.href}
              locked={locked}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
