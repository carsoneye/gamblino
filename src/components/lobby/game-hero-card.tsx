import Link from "next/link";
import { GameArt } from "@/components/lobby/game-art";
import type { GameSlug } from "@/lib/nav";
import { cn } from "@/lib/utils";

type Props = {
  game: GameSlug;
  label: string;
  tag: string;
  status: "live" | "coming-soon";
  href: string;
  locked?: boolean;
  lockedHref?: string;
};

export function GameHeroCard(props: Props) {
  const { game, status, href, locked = false, lockedHref = "/signup", label } = props;
  const pending = status === "coming-soon" && !locked;
  const interactive = !pending;
  const dest = locked ? lockedHref : href;

  const shell = cn(
    "group/card relative isolate block aspect-[3/4] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] transition-[border-color,box-shadow,transform] duration-[var(--duration-default)] ease-[var(--ease-default)]",
    interactive &&
      "hover:border-[var(--color-accent)]/60 hover:shadow-[0_18px_40px_-22px_color-mix(in_oklch,var(--color-accent)_45%,transparent)]",
  );

  const content = (
    <>
      <GameArt
        game={game}
        className="absolute inset-0 h-full w-full transition-[filter] duration-[400ms] ease-[var(--ease-default)] group-hover/card:brightness-110"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-bg-deep)]/70 via-transparent to-transparent"
      />
      {pending ? (
        <span className="absolute top-2 right-2 rounded-[var(--radius-chip)] border border-[var(--color-border)]/80 bg-[var(--color-bg-deep)]/85 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--color-muted)] backdrop-blur">
          Soon
        </span>
      ) : null}
    </>
  );

  if (pending) {
    return (
      <div aria-disabled="true" className={cn(shell, "cursor-not-allowed")}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={dest}
      aria-label={label}
      className={cn(
        shell,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-deep)]",
      )}
    >
      {content}
    </Link>
  );
}
