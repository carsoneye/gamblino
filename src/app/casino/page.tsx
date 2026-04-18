import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GameTile } from "@/components/lobby/game-tile";
import { AppShell } from "@/components/shell/app-shell";
import { LiveDot } from "@/components/shell/live-dot";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  FLOOR_HEADCOUNT,
  FLOOR_PEAK_24H,
  FLOOR_TOP_WIN_24H,
  gameActivity,
  recentWins,
} from "@/lib/floor-activity";
import { formatCredits } from "@/lib/money";
import { games } from "@/lib/nav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Casino · gamblino" };

const GAME_COPY: Record<string, { tag: string }> = {
  crash: { tag: "Ride the curve. Cash out before it pops." },
  mines: { tag: "Reveal tiles. Miss the bombs. Stack multipliers." },
  plinko: { tag: "Drop the ball. Let the pegs decide your fate." },
};

const GAME_LABELS: Record<string, string> = {
  crash: "Crash",
  mines: "Mines",
  plinko: "Plinko",
};

export default async function CasinoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const row = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { id: true, email: true, name: true, balance: true },
  });
  if (!row) redirect("/signin");

  const enabled = games.filter((g) => g.enabled);

  return (
    <AppShell balance={row.balance} email={row.email} name={row.name}>
      <div className="flex flex-1 flex-col gap-10 px-6 py-8 lg:px-10 lg:py-10">
        <section
          aria-labelledby="lobby-heading"
          className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-6 py-8 lg:px-10 lg:py-10"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-80"
            style={{
              background:
                "conic-gradient(from 220deg at 20% 10%, color-mix(in oklab, var(--color-accent) 16%, transparent), color-mix(in oklab, var(--color-win) 14%, transparent), transparent 60%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-50 mix-blend-screen"
            style={{
              backgroundImage:
                "radial-gradient(1px 1px at 30% 40%, color-mix(in oklab, var(--color-accent) 40%, transparent) 50%, transparent 51%), radial-gradient(1px 1px at 70% 80%, color-mix(in oklab, var(--color-win) 40%, transparent) 50%, transparent 51%)",
              backgroundSize: "60px 60px, 80px 80px",
            }}
          />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-hi)]">
                <LiveDot tone="teal" size="xs" />
                <span>The floor · open now</span>
              </div>
              <h1
                id="lobby-heading"
                className="font-display text-4xl font-semibold leading-[0.95] tracking-[-0.01em] lg:text-6xl"
              >
                Welcome back{row.name ? `, ${row.name}` : ""}.
              </h1>
              <p className="max-w-xl text-sm text-[var(--color-muted)] lg:text-base">
                You&apos;re sitting on{" "}
                <span className="numeric font-semibold text-[var(--color-accent-hi)]">
                  {formatCredits(row.balance)}
                </span>{" "}
                credits. Pick a table. Every bet runs through the atomic wallet path — no floats, no
                cheats.
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-deep)]/50 px-4 py-3 text-left backdrop-blur lg:min-w-[320px]">
              <BannerStat label="On floor" value={FLOOR_HEADCOUNT.toLocaleString()} accent />
              <BannerStat label="24h peak" value={FLOOR_PEAK_24H.toLocaleString()} />
              <BannerStat
                label="Top win"
                value={FLOOR_TOP_WIN_24H.toLocaleString()}
                suffix="cr"
                magenta
              />
            </dl>
          </div>
        </section>

        <section aria-labelledby="games-heading" className="flex flex-col gap-5">
          <div className="flex items-baseline justify-between">
            <div className="flex flex-col gap-1">
              <h2 id="games-heading" className="font-display text-2xl font-semibold tracking-tight">
                Originals
              </h2>
              <p className="text-xs text-[var(--color-muted)]">
                Three games, built in-house. More tables dealt as the build lands.
              </p>
            </div>
            <span className="hidden rounded-[var(--radius-chip)] border border-[var(--color-border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)] sm:inline-block">
              Provably fair
            </span>
          </div>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {enabled.map((game) => {
              const activity = gameActivity[game.slug];
              return (
                <li key={game.slug}>
                  <GameTile
                    game={game.slug}
                    label={game.label}
                    tag={GAME_COPY[game.slug]?.tag ?? ""}
                    online={activity.online}
                    hot={activity.hot}
                    status={game.status}
                    href={game.href}
                  />
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="floor-activity" className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <div className="flex flex-col gap-1">
              <h2 id="floor-activity" className="font-display text-xl font-semibold tracking-tight">
                Recent floor
              </h2>
              <p className="text-xs text-[var(--color-muted)]">
                Wins in the last few minutes. Wired to the live feed once WS lands.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--color-muted)]">
              <LiveDot tone="teal" size="xs" />
              Stub · seeded
            </span>
          </div>
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]/50">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Player
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Table
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Multi
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Payout
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 py-3 text-right font-semibold sm:table-cell"
                  >
                    When
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentWins.map((win) => (
                  <tr
                    key={win.id}
                    className="border-t border-[var(--color-border)]/70 transition-colors hover:bg-[var(--color-bg-deep)]/40"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-[var(--color-text)]">{win.handle}</span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">{GAME_LABELS[win.game]}</td>
                    <td
                      className={`numeric px-4 py-3 text-right font-semibold ${
                        win.multiplier >= 10
                          ? "text-[var(--color-win)]"
                          : "text-[var(--color-accent-hi)]"
                      }`}
                    >
                      {win.multiplier.toFixed(2)}×
                    </td>
                    <td className="numeric px-4 py-3 text-right text-[var(--color-text)]">
                      +{win.payout.toLocaleString()}
                      <span className="ml-1 text-[10px] text-[var(--color-muted)]">cr</span>
                    </td>
                    <td className="numeric hidden px-4 py-3 text-right text-[var(--color-muted)] sm:table-cell">
                      {win.ago} ago
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function BannerStat({
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
      <dt className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">{label}</dt>
      <dd className="numeric text-base font-semibold leading-none" style={{ color }}>
        {value}
        {suffix ? (
          <span className="ml-0.5 text-[10px] font-medium text-[var(--color-muted)]">{suffix}</span>
        ) : null}
      </dd>
    </div>
  );
}
