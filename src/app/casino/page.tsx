import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/shell/app-shell";
import { db } from "@/db";
import { users } from "@/db/schema";
import { games } from "@/lib/nav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Casino · gamblino" };

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
      <div className="flex flex-1 flex-col gap-10 px-6 py-10 lg:px-10 lg:py-14">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">
            Lobby
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight lg:text-5xl">
            Welcome{row.name ? `, ${row.name}` : ""}
          </h1>
          <p className="max-w-xl text-sm text-[var(--color-muted)]">
            Pick an original. Your balance sits in the top bar — every bet passes through the atomic
            wallet path.
          </p>
        </header>

        <section aria-labelledby="games-heading" className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 id="games-heading" className="font-display text-xl font-semibold tracking-tight">
              Originals
            </h2>
            <p className="text-xs text-[var(--color-muted)]">Unlocking as the build advances</p>
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {games
              .filter((g) => g.enabled)
              .map((game) => (
                <li
                  key={game.slug}
                  className="group flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-md bg-[var(--color-elevated)]">
                      <game.icon aria-hidden className="size-5 text-[var(--color-accent-hi)]" />
                    </div>
                    <span className="rounded-[var(--radius-chip)] border border-[var(--color-border)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
                      {game.status === "live" ? "Live" : "Soon"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-display text-xl font-semibold">{game.label}</h3>
                    <p className="text-sm text-[var(--color-muted)]">
                      Provably fair · Play-money credits
                    </p>
                  </div>
                </li>
              ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
