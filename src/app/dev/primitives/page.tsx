import type { ReactNode } from "react";
import { GameShell } from "@/components/game/game-shell";
import { ProvablyFairBadge } from "@/components/game/provably-fair-badge";
import { WinReveal } from "@/components/game/win-reveal";
import { FIXTURES } from "@/lib/games/provably-fair.fixtures";
import { MICRO_PER_CREDIT } from "@/lib/money";
import { BetControlsDemo } from "./bet-controls-demo";

const FIXTURE = FIXTURES[0];

function Section({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-6 border-t border-[var(--color-border)]/60 pt-10">
      <header className="space-y-1">
        <span className="font-display text-[11px] font-medium tracking-[0.32em] text-[var(--color-accent)] uppercase">
          {eyebrow}
        </span>
        <h2 className="font-display text-2xl tracking-[-0.02em]">{title}</h2>
        {description ? (
          <p className="max-w-[68ch] text-[13px] text-[var(--color-muted)]">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function StateLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-display text-[10px] font-medium tracking-[0.24em] text-[var(--color-muted)] uppercase">
      {children}
    </span>
  );
}

export default function PrimitivesPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-14 px-8 py-16">
      <header className="space-y-3 pb-4">
        <span className="font-display text-[11px] font-medium tracking-[0.32em] text-[var(--color-accent)] uppercase">
          Internal · game primitives
        </span>
        <h1 className="font-display text-5xl leading-[0.9] font-semibold tracking-[-0.04em]">
          Primitives<span className="text-[var(--color-accent)]">.</span>
        </h1>
        <p className="max-w-[68ch] text-[var(--color-muted)]">
          Shared building blocks every original composes. Edit{" "}
          <code className="numeric text-xs">src/components/game/</code> to change a primitive; edit{" "}
          <code className="numeric text-xs">src/app/dev/primitives/page.tsx</code> to add states.
        </p>
      </header>

      <Section
        eyebrow="Components · 06"
        title="BetControls"
        description="Input, quick-stake chips (½ · 2× · Max), balance row, primary action. Phase drives copy and lock state."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-3">
            <StateLabel>phase · idle</StateLabel>
            <BetControlsDemo phase="idle" />
          </div>
          <div className="space-y-3">
            <StateLabel>phase · open (cash out)</StateLabel>
            <BetControlsDemo phase="open" />
          </div>
          <div className="space-y-3">
            <StateLabel>phase · settling</StateLabel>
            <BetControlsDemo phase="settling" />
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Components · 07"
        title="WinReveal"
        description="Post-round banner. Color tone keyed to outcome; motion-safe fade + zoom entrance."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <StateLabel>outcome · win</StateLabel>
            <WinReveal outcome="win" delta={2_500n * MICRO_PER_CREDIT} multiplier={2.5} />
          </div>
          <div className="space-y-2">
            <StateLabel>outcome · cashed-out</StateLabel>
            <WinReveal outcome="cashed-out" delta={1_200n * MICRO_PER_CREDIT} multiplier={1.2} />
          </div>
          <div className="space-y-2">
            <StateLabel>outcome · loss</StateLabel>
            <WinReveal outcome="loss" delta={500n * MICRO_PER_CREDIT} />
          </div>
          <div className="space-y-2">
            <StateLabel>outcome · null (renders nothing)</StateLabel>
            <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/40 px-4 py-3 text-[11px] text-[var(--color-muted)]">
              No banner — pre-round.
            </div>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Components · 08"
        title="ProvablyFairBadge"
        description="Commit/reveal receipt. Truncated hash on the card; full seeds + verify formula in the dialog."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <StateLabel>state · committed (pre-settle)</StateLabel>
            <ProvablyFairBadge serverSeedHash={FIXTURE.serverSeedHash} />
          </div>
          <div className="space-y-3">
            <StateLabel>state · revealed (post-settle)</StateLabel>
            <ProvablyFairBadge
              serverSeedHash={FIXTURE.serverSeedHash}
              revealed={{
                serverSeed: FIXTURE.serverSeed,
                clientSeed: FIXTURE.clientSeed,
                nonce: FIXTURE.nonce,
              }}
            />
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Components · 09"
        title="GameShell"
        description="Page chrome every original inherits: breadcrumb, H1, tag/status, two-column stage + side."
      >
        <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
          <GameShell
            title="Primitive demo"
            tag="Shell only"
            status={<>· placeholder stage</>}
            stage={
              <div className="flex aspect-[16/10] items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] text-[11px] tracking-[0.24em] text-[var(--color-muted)] uppercase">
                stage slot
              </div>
            }
            side={
              <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-[11px] tracking-[0.24em] text-[var(--color-muted)] uppercase">
                side slot
              </div>
            }
          />
        </div>
      </Section>

      <footer className="border-t border-[var(--color-border)]/60 pt-8 pb-4 text-center">
        <p className="text-[var(--color-muted)] text-sm">
          Source: <code className="numeric text-xs">src/components/game/</code> · per-game
          composition under <code className="numeric text-xs">src/components/originals/</code>
        </p>
      </footer>
    </main>
  );
}
