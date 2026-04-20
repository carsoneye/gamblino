import { GameArt } from "@/components/lobby/game-art";
import type { GameSlug } from "@/lib/nav";
import { BetControls } from "./bet-controls";
import { GameShell } from "./game-shell";

type Props = {
  slug: GameSlug;
  title: string;
  tag?: string;
  balance: bigint;
};

export function GamePlaceholder({ slug, title, tag, balance }: Props) {
  return (
    <GameShell
      title={title}
      tag={tag}
      status={<>· Coming soon.</>}
      stage={<PlaceholderStage slug={slug} />}
      side={<InertBetControls balance={balance} />}
    />
  );
}

function PlaceholderStage({ slug }: { slug: GameSlug }) {
  return (
    <div className="relative isolate aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] sm:aspect-[16/10]">
      <GameArt game={slug} className="absolute inset-0 h-full w-full" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-bg-deep)]/75 via-transparent to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
        <span className="font-display text-[11px] font-medium tracking-[0.32em] text-[var(--color-accent)] uppercase">
          Coming soon
        </span>
        <p className="mt-2 max-w-[44ch] text-[13px] text-[var(--color-muted)]">
          The game stage is not wired yet. The primitives and provably-fair module are in place —
          gameplay lands in a following phase.
        </p>
      </div>
    </div>
  );
}

function InertBetControls({ balance }: { balance: bigint }) {
  return (
    <BetControls
      balance={balance}
      stake={0n}
      onStakeChange={() => {}}
      onPlaceBet={() => {}}
      disabled
      placeBetLabel="Coming soon"
    />
  );
}
