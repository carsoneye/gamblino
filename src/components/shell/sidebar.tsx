import Link from "next/link";
import { GameNavItem } from "@/components/shell/game-nav-item";
import { LiveDot } from "@/components/shell/live-dot";
import { NavLink } from "@/components/shell/nav-link";
import {
  FLOOR_HEADCOUNT,
  FLOOR_PEAK_24H,
  FLOOR_TOP_WIN_24H,
  gameActivity,
} from "@/lib/floor-activity";
import { games, primaryNav } from "@/lib/nav";

export function Sidebar() {
  const enabledGames = games.filter((g) => g.enabled);
  return (
    <aside
      aria-label="Primary"
      className="row-span-2 hidden flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-deep)]/70 backdrop-blur md:flex md:w-16 lg:w-72"
    >
      <div className="flex h-16 items-center gap-2 border-b border-[var(--color-border)] px-4 lg:px-5">
        <Link
          href="/casino"
          className="group inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-md border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 font-display text-base font-semibold text-[var(--color-accent-hi)]"
            style={{
              boxShadow: "0 0 18px color-mix(in oklab, var(--color-accent) 30%, transparent)",
            }}
          >
            g.
          </span>
          <span className="hidden flex-col leading-tight lg:flex">
            <span className="font-display text-lg font-semibold tracking-tight">gamblino</span>
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
              <LiveDot tone="teal" size="xs" />
              Floor live
            </span>
          </span>
          <span className="sr-only lg:hidden">gamblino</span>
        </Link>
      </div>

      <nav
        aria-label="Main"
        className="flex flex-1 flex-col gap-7 overflow-y-auto px-2 py-5 lg:px-3"
      >
        <div className="space-y-1">
          <SectionLabel>House</SectionLabel>
          <ul className="space-y-0.5">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <div className="lg:hidden">
                    <NavLink
                      compact
                      href={item.href}
                      label={item.label}
                      icon={<Icon className="size-4" aria-hidden />}
                    />
                  </div>
                  <div className="hidden lg:block">
                    <NavLink
                      href={item.href}
                      label={item.label}
                      icon={<Icon className="size-4" aria-hidden />}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-1">
          <SectionLabel>Floor</SectionLabel>
          <ul className="space-y-0.5">
            {enabledGames.map((game) => {
              const Icon = game.icon;
              const activity = gameActivity[game.slug];
              const trailing = (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--color-muted)]">
                  <LiveDot tone={activity.hot ? "magenta" : "teal"} size="xs" />
                  <span className="numeric font-medium text-[var(--color-text)]">
                    {activity.online}
                  </span>
                </span>
              );
              return (
                <li key={game.slug}>
                  <div className="lg:hidden">
                    <GameNavItem
                      compact
                      label={game.label}
                      icon={<Icon className="size-4" aria-hidden />}
                      status={game.status}
                    />
                  </div>
                  <div className="hidden lg:block">
                    <GameNavItem
                      label={game.label}
                      icon={<Icon className="size-4" aria-hidden />}
                      status={game.status}
                      trailing={trailing}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="hidden flex-col gap-3 border-t border-[var(--color-border)] px-5 py-4 lg:flex">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
          Tonight
        </p>
        <dl className="grid grid-cols-2 gap-3 text-xs">
          <Stat label="On floor" value={FLOOR_HEADCOUNT.toLocaleString()} accent />
          <Stat label="24h peak" value={FLOOR_PEAK_24H.toLocaleString()} />
          <Stat label="Top win" value={FLOOR_TOP_WIN_24H.toLocaleString()} suffix="cr" magenta />
          <Stat label="Real $" value="None" muted />
        </dl>
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="hidden items-center gap-2 px-3 pb-2 lg:flex">
      <span className="h-px flex-1 bg-[var(--color-border)]" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">
        {children}
      </span>
      <span className="h-px w-4 bg-[var(--color-accent)]/60" />
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  accent,
  magenta,
  muted,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent?: boolean;
  magenta?: boolean;
  muted?: boolean;
}) {
  const color = accent
    ? "var(--color-accent-hi)"
    : magenta
      ? "var(--color-win)"
      : muted
        ? "var(--color-muted)"
        : "var(--color-text)";
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">{label}</dt>
      <dd className="numeric text-sm font-semibold" style={{ color }}>
        {value}
        {suffix ? (
          <span className="ml-0.5 text-[10px] font-medium text-[var(--color-muted)]">{suffix}</span>
        ) : null}
      </dd>
    </div>
  );
}
