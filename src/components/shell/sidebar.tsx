import Link from "next/link";
import { GameNavItem } from "@/components/shell/game-nav-item";
import { NavLink } from "@/components/shell/nav-link";
import { games, primaryNav } from "@/lib/nav";

export function Sidebar() {
  const enabledGames = games.filter((g) => g.enabled);
  return (
    <aside
      aria-label="Primary"
      className="row-span-2 hidden flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-deep)]/60 backdrop-blur md:flex md:w-16 lg:w-64"
    >
      <div className="flex h-14 items-center border-b border-[var(--color-border)] px-4 lg:px-5">
        <Link
          href="/casino"
          className="font-display text-xl font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          <span className="hidden lg:inline">gamblino</span>
          <span aria-hidden className="lg:hidden">
            g.
          </span>
          <span className="sr-only lg:hidden">gamblino</span>
        </Link>
      </div>

      <nav
        aria-label="Main"
        className="flex flex-1 flex-col gap-6 overflow-y-auto px-2 py-4 lg:px-3"
      >
        <ul className="space-y-1">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <div className="lg:hidden">
                  <NavLink
                    compact
                    href={item.href}
                    label={item.label}
                    icon={<Icon aria-hidden className="size-4 shrink-0" />}
                  />
                </div>
                <div className="hidden lg:block">
                  <NavLink
                    href={item.href}
                    label={item.label}
                    icon={<Icon aria-hidden className="size-4 shrink-0" />}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <div className="space-y-2">
          <p className="hidden px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] lg:block">
            Games
          </p>
          <ul className="space-y-1">
            {enabledGames.map((game) => {
              const Icon = game.icon;
              return (
                <li key={game.slug}>
                  <div className="lg:hidden">
                    <GameNavItem
                      compact
                      label={game.label}
                      icon={<Icon aria-hidden className="size-4 shrink-0" />}
                      status={game.status}
                    />
                  </div>
                  <div className="hidden lg:block">
                    <GameNavItem
                      label={game.label}
                      icon={<Icon aria-hidden className="size-4 shrink-0" />}
                      status={game.status}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="hidden border-t border-[var(--color-border)] p-4 lg:block">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Play-money only
        </p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          No real money. No crypto. Credits are for fun.
        </p>
      </div>
    </aside>
  );
}
