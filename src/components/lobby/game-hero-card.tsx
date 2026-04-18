import Link from "next/link";
import { GameArt } from "@/components/lobby/game-art";
import type { GameSlug } from "@/lib/nav";

export function GameHeroCard({
  game,
  label,
  tag,
  status,
  href,
  locked = false,
  lockedHref = "/signup",
}: {
  game: GameSlug;
  label: string;
  tag: string;
  status: "live" | "coming-soon";
  href: string;
  locked?: boolean;
  lockedHref?: string;
}) {
  const pending = status === "coming-soon";
  const body = (
    <article className="group relative flex aspect-[1/1.3] flex-col overflow-hidden rounded-[var(--radius-md)] border-2 border-transparent bg-[var(--color-surface)] transition-[border-color] duration-[var(--duration-fast)] ease-[var(--ease-default)] hover:border-[var(--color-accent)]">
      <div className="relative flex-1 overflow-hidden bg-[var(--color-bg-deep)]">
        <GameArt game={game} className="absolute inset-0 h-full w-full" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-deep)] via-[var(--color-bg-deep)]/20 to-transparent"
        />
        {pending ? (
          <span className="absolute top-3 left-3 rounded-[var(--radius-chip)] bg-[var(--color-bg-deep)]/85 px-2 py-0.5 text-[11px] font-semibold text-[var(--color-muted)] backdrop-blur">
            Soon
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 border-t border-[var(--color-border)] bg-[var(--color-bg-deep)] p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-2xl font-semibold leading-none tracking-[-0.02em] text-[var(--color-text)]">
            {label}
          </h3>
          {locked ? (
            <span className="text-sm font-semibold text-[var(--color-accent)]">Sign up →</span>
          ) : pending ? null : (
            <span className="text-sm font-semibold text-[var(--color-accent)]">Play →</span>
          )}
        </div>
        <p className="text-[13px] leading-snug text-[var(--color-muted)]">{tag}</p>
      </div>
    </article>
  );
  if (pending) {
    return <div className="block">{body}</div>;
  }
  const linkHref = locked ? lockedHref : href;
  return (
    <Link href={linkHref} className="block focus-visible:outline-none">
      {body}
    </Link>
  );
}
