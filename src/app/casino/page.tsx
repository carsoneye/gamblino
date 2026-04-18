import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GameHeroCard } from "@/components/lobby/game-hero-card";
import { AppShell } from "@/components/shell/app-shell";
import { db } from "@/db";
import { users } from "@/db/schema";
import { games } from "@/lib/nav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Casino · gamblino" };

const GAME_TAGS: Record<string, string> = {
  crash: "Ride the curve. Cash out before it bursts.",
  mines: "Reveal tiles. Avoid bombs. Stack multipliers.",
  plinko: "Drop the ball. Let the pegs decide.",
};

export default async function CasinoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const row = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { id: true, email: true, name: true, balance: true },
  });
  if (!row) redirect("/signin");

  return (
    <AppShell balance={row.balance} email={row.email} name={row.name}>
      <div className="flex flex-1 flex-col gap-10 px-6 py-8 lg:px-10 lg:py-10">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-4xl font-semibold leading-[0.95] tracking-[-0.02em] text-[var(--color-text)] lg:text-5xl">
            Welcome back{row.name ? `, ${row.name}` : ""}.
          </h1>
          <p className="text-base text-[var(--color-muted)]">Pick a table.</p>
        </div>

        <section aria-labelledby="originals-heading" className="flex flex-col gap-5">
          <div className="flex items-baseline justify-between">
            <h2
              id="originals-heading"
              className="font-display text-2xl font-semibold tracking-[-0.01em] text-[var(--color-text)]"
            >
              Originals
            </h2>
            <span className="text-sm text-[var(--color-muted)]">Provably fair</span>
          </div>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {games.map((game) => (
              <li key={game.slug}>
                <GameHeroCard
                  game={game.slug}
                  label={game.label}
                  tag={GAME_TAGS[game.slug] ?? ""}
                  status={game.status}
                  href={game.href}
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
