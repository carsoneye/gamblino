import Link from "next/link";
import { GameNavItem } from "@/components/shell/game-nav-item";
import { NavLink } from "@/components/shell/nav-link";
import { resolveGames, userMeta } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar({ variant = "static" }: { variant?: "static" | "drawer" }) {
  const games = resolveGames();
  const isDrawer = variant === "drawer";
  const compact = !isDrawer;

  return (
    <aside
      aria-label="Primary"
      className={cn(
        "flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-deep)]",
        isDrawer ? "flex h-full w-full" : "row-span-2 hidden md:flex md:w-16 lg:w-60",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-[var(--color-border)]/60",
          isDrawer ? "px-5" : "px-3 lg:px-5",
        )}
      >
        <Link
          href="/casino"
          className="inline-flex items-baseline rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          <span
            className={cn(
              "font-display text-lg font-semibold tracking-[-0.04em] text-[var(--color-text)]",
              isDrawer ? "" : "hidden lg:inline",
            )}
          >
            gamblino
          </span>
          <span
            aria-hidden
            className={cn(
              "font-display text-lg font-semibold text-[var(--color-accent)]",
              isDrawer ? "" : "hidden lg:inline",
            )}
          >
            .
          </span>
          {!isDrawer ? (
            <>
              <span
                aria-hidden
                className="font-display text-xl font-semibold text-[var(--color-accent)] lg:hidden"
              >
                g.
              </span>
              <span className="sr-only lg:hidden">gamblino</span>
            </>
          ) : null}
        </Link>
      </div>

      <nav
        aria-label="Main"
        className={cn(
          "flex flex-1 flex-col gap-5 overflow-y-auto py-2",
          isDrawer ? "px-3" : "px-2 lg:px-3",
        )}
      >
        <div className="flex flex-col gap-1">
          <SectionLabel hideWhenCompact={compact}>Lobby</SectionLabel>
          <ul className="space-y-0.5">
            {userMeta.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    label={item.label}
                    enabled={item.enabled}
                    compact={compact}
                    icon={<Icon className="size-4" aria-hidden />}
                    showLabel={isDrawer ? true : undefined}
                  />
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-1">
          <SectionLabel hideWhenCompact={compact}>Originals</SectionLabel>
          <ul className="space-y-0.5">
            {games.map((game) => {
              const Icon = game.icon;
              return (
                <li key={game.slug}>
                  <GameNavItem
                    label={game.label}
                    href={game.enabled ? game.href : undefined}
                    status={game.status}
                    compact={compact && !isDrawer}
                    icon={<Icon className="size-4" aria-hidden />}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

function SectionLabel({
  children,
  hideWhenCompact,
}: {
  children: React.ReactNode;
  hideWhenCompact: boolean;
}) {
  return (
    <div className={cn("px-3 pb-1", hideWhenCompact && "hidden lg:block")}>
      <span className="text-[11px] font-medium text-[var(--color-muted)]">{children}</span>
    </div>
  );
}
