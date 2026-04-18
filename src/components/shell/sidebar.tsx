import Link from "next/link";
import { GameNavItem } from "@/components/shell/game-nav-item";
import { NavLink } from "@/components/shell/nav-link";
import { games, primaryNav } from "@/lib/nav";

const PRODUCT_TABS = [
  { label: "Casino", active: true },
  { label: "Sports", active: false },
] as const;

export function Sidebar() {
  return (
    <aside
      aria-label="Primary"
      className="row-span-2 hidden flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-deep)] md:flex md:w-16 lg:w-60"
    >
      <div className="flex h-16 items-center px-3 lg:px-5">
        <Link
          href="/casino"
          className="group inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          <span
            aria-hidden
            className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-[var(--color-accent)] font-display text-sm font-bold text-[var(--color-bg-deep)]"
          >
            g
          </span>
          <span className="hidden font-display text-lg font-semibold tracking-[-0.02em] text-[var(--color-text)] lg:inline">
            gamblino
          </span>
          <span className="sr-only lg:hidden">gamblino</span>
        </Link>
      </div>

      <div className="hidden px-3 pb-3 lg:block">
        <div className="grid grid-cols-2 gap-1 rounded-[var(--radius-md)] bg-[var(--color-surface)] p-1">
          {PRODUCT_TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              disabled={!tab.active}
              aria-pressed={tab.active}
              className={
                tab.active
                  ? "rounded-[6px] bg-[var(--color-accent)] px-2 py-1.5 text-xs font-semibold text-[var(--color-bg-deep)]"
                  : "rounded-[6px] px-2 py-1.5 text-xs font-semibold text-[var(--color-muted)] disabled:cursor-not-allowed"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <nav
        aria-label="Main"
        className="flex flex-1 flex-col gap-5 overflow-y-auto px-2 py-2 lg:px-3"
      >
        <div className="flex flex-col gap-1">
          <SectionLabel>Lobby</SectionLabel>
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

        <div className="flex flex-col gap-1">
          <SectionLabel>Originals</SectionLabel>
          <ul className="space-y-0.5">
            {games.map((game) => {
              const Icon = game.icon;
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
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="hidden px-3 pb-1 lg:block">
      <span className="text-[11px] font-medium text-[var(--color-muted)]">{children}</span>
    </div>
  );
}
