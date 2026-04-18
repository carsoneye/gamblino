import Link from "next/link";
import { GameArt } from "@/components/lobby/game-art";
import { LiveDot } from "@/components/shell/live-dot";
import type { GameKey } from "@/lib/floor-activity";

export function GameTile({
  game,
  label,
  tag,
  online,
  hot,
  status,
  href,
}: {
  game: GameKey;
  label: string;
  tag: string;
  online: number;
  hot: boolean;
  status: "live" | "coming-soon";
  href: string;
}) {
  const pending = status === "coming-soon";
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    pending ? (
      <div aria-disabled className="pointer-events-none">
        {children}
      </div>
    ) : (
      <Link href={href} className="block">
        {children}
      </Link>
    );

  return (
    <Wrapper>
      <article className="group relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] transition-transform duration-[var(--duration-default)] ease-[var(--ease-default)] motion-safe:hover:-translate-y-2">
        <div className="relative h-32 overflow-hidden bg-[var(--color-bg-deep)]">
          <GameArt game={game} className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            {hot ? (
              <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-[var(--color-win)]/40 bg-[var(--color-win)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-win)]">
                <LiveDot tone="magenta" size="xs" />
                Hot
              </span>
            ) : (
              <span />
            )}
            {pending ? (
              <span className="rounded-[var(--radius-chip)] border border-[var(--color-border)] bg-[var(--color-bg-deep)]/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Soon
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 p-5">
          <div className="flex flex-col gap-1">
            <h3 className="font-display text-2xl font-semibold leading-none tracking-tight">
              {label}
            </h3>
            <p className="text-xs text-[var(--color-muted)]">{tag}</p>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
              <LiveDot tone="teal" size="xs" />
              <span className="numeric font-medium text-[var(--color-text)]">{online}</span>
              <span>playing</span>
            </span>
            <span className="numeric text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Provably fair
            </span>
          </div>
        </div>

        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/60 to-transparent opacity-0 transition-opacity duration-[var(--duration-default)] group-hover:opacity-100"
        />
      </article>
    </Wrapper>
  );
}
