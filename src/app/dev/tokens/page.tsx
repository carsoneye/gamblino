import { Bomb, Compass, Diamond, Rocket, ScrollText, Ticket, Trophy, User } from "lucide-react";
import type { ReactNode } from "react";
import { GameHeroCard } from "@/components/lobby/game-hero-card";
import { LiveDot } from "@/components/shell/live-dot";
import { Button } from "@/components/ui/button";

const RAW_TOKENS = [
  { name: "bg-deep", token: "--bg-deep", note: "page floor" },
  { name: "bg", token: "--bg", note: "body" },
  { name: "surface", token: "--surface", note: "cards" },
  { name: "elevated", token: "--elevated", note: "popovers / inputs" },
  { name: "accent", token: "--accent", note: "warm gold · primary" },
  { name: "accent-hi", token: "--accent-hi", note: "hover / highlight" },
  { name: "accent-2", token: "--accent-2", note: "plum · secondary" },
  { name: "accent-2-hi", token: "--accent-2-hi", note: "plum hi" },
  { name: "live", token: "--live", note: "cyan · aliveness" },
  { name: "live-hi", token: "--live-hi", note: "cyan hi" },
  { name: "win", token: "--win", note: "wins (same gold)" },
  { name: "loss", token: "--loss", note: "destructive" },
  { name: "text", token: "--text", note: "primary text" },
  { name: "muted", token: "--muted", note: "secondary text" },
] as const;

const RADII = [
  { name: "chip", token: "--radius-chip", value: "2px" },
  { name: "sm", token: "--radius-sm", value: "3px" },
  { name: "md", token: "--radius-md", value: "4px" },
  { name: "lg", token: "--radius-lg", value: "8px" },
  { name: "xl", token: "--radius-xl", value: "12px" },
  { name: "2xl", token: "--radius-2xl", value: "20px" },
] as const;

const DURATIONS = [
  { name: "fast", token: "--duration-fast", value: "120ms", note: "hovers, color swaps" },
  { name: "default", token: "--duration-default", value: "200ms", note: "buttons, borders" },
  { name: "slow", token: "--duration-slow", value: "320ms", note: "modals, layout" },
] as const;

const NAV_ICONS = [
  { Icon: Compass, label: "Lobby" },
  { Icon: Trophy, label: "Leaderboard" },
  { Icon: ScrollText, label: "Transactions" },
  { Icon: User, label: "Profile" },
  { Icon: Rocket, label: "Crash" },
  { Icon: Bomb, label: "Mines" },
  { Icon: Diamond, label: "Plinko" },
  { Icon: Ticket, label: "Lottery" },
] as const;

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-6 border-t border-[var(--color-border)]/60 pt-10">
      <header className="space-y-1">
        <span className="font-display text-[11px] font-medium tracking-[0.32em] text-[var(--color-accent)] uppercase">
          {eyebrow}
        </span>
        <h2 className="font-display text-2xl tracking-[-0.02em]">{title}</h2>
      </header>
      {children}
    </section>
  );
}

export default function PlaygroundPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-14 px-8 py-16">
      <header className="space-y-3 pb-4">
        <span className="font-display text-[11px] font-medium tracking-[0.32em] text-[var(--color-accent)] uppercase">
          Internal · design playground
        </span>
        <h1 className="font-display text-5xl leading-[0.9] font-semibold tracking-[-0.04em]">
          Midnight Arcade<span className="text-[var(--color-accent)]">.</span>
        </h1>
        <p className="max-w-[68ch] text-[var(--color-muted)]">
          Live inventory of the design system shipped with gamblino. Tokens, type, surfaces,
          components. Edit <code className="numeric text-xs">src/app/dev/tokens/page.tsx</code> to
          add more.
        </p>
      </header>

      <Section eyebrow="Foundations · 01" title="Color">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {RAW_TOKENS.map((c) => (
            <div key={c.name} className="space-y-2">
              <div
                className="aspect-square rounded-[var(--radius-md)] border border-[var(--color-border)]"
                style={{ background: `var(${c.token})` }}
              />
              <div className="space-y-0.5 text-sm">
                <div className="font-medium">{c.name}</div>
                <div className="text-[11px] text-[var(--color-muted)]">{c.note}</div>
                <div className="numeric text-[10px] text-[var(--color-muted)]/80">{c.token}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Foundations · 02" title="Type scale">
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="font-display text-[11px] font-medium tracking-[0.24em] text-[var(--color-muted)] uppercase">
              h1 · Clash Display 600
            </span>
            <p className="font-display text-6xl leading-[0.9] font-semibold tracking-[-0.04em]">
              Play free<span className="text-[var(--color-accent)]">.</span>
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-display text-[11px] font-medium tracking-[0.24em] text-[var(--color-muted)] uppercase">
              h2 · Clash Display 600
            </span>
            <p className="font-display text-2xl tracking-[-0.02em]">Win nothing real.</p>
          </div>
          <div className="space-y-1">
            <span className="font-display text-[11px] font-medium tracking-[0.24em] text-[var(--color-muted)] uppercase">
              body · General Sans 400
            </span>
            <p className="max-w-[68ch] text-[0.95rem] leading-[1.55]">
              The house hands you 10,000 credits. Losing streaks are free. Credits never convert to
              money. Every round is seeded with a public commit you can verify after the reveal.
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-display text-[11px] font-medium tracking-[0.24em] text-[var(--color-muted)] uppercase">
              numeric · Geist Mono · tabular-nums
            </span>
            <p className="numeric text-3xl">1,234,567.89 · ×2.48 · 00:14:22</p>
          </div>
          <div className="space-y-2 pt-2">
            <span className="font-display text-[11px] font-medium tracking-[0.32em] text-[var(--color-accent)] uppercase">
              Eyebrow · accent
            </span>
            <br />
            <span className="font-display text-[11px] font-medium tracking-[0.24em] text-[var(--color-muted)] uppercase">
              Section label · muted
            </span>
          </div>
        </div>
      </Section>

      <Section eyebrow="Foundations · 03" title="Radii">
        <div className="flex flex-wrap items-end gap-6">
          {RADII.map((r) => (
            <div key={r.name} className="space-y-2 text-center">
              <div
                className="h-20 w-20 border border-[var(--color-border)] bg-[var(--color-surface)]"
                style={{ borderRadius: `var(${r.token})` }}
              />
              <div className="space-y-0.5 text-sm">
                <div className="font-medium">{r.name}</div>
                <div className="numeric text-[10px] text-[var(--color-muted)]">{r.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Foundations · 04" title="Shadows">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div
            className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
            style={{
              boxShadow:
                "0 20px 48px -24px color-mix(in oklch, var(--color-accent) 35%, transparent)",
            }}
          >
            <div className="text-[var(--color-muted)] text-sm">glow</div>
            <div className="font-medium">Hover halo under cards</div>
          </div>
          <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl">
            <div className="text-[var(--color-muted)] text-sm">popover</div>
            <div className="font-medium">Modal / menu</div>
          </div>
          <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="text-[var(--color-muted)] text-sm">rest</div>
            <div className="font-medium">No shadow on idle cards</div>
          </div>
        </div>
      </Section>

      <Section eyebrow="Foundations · 05" title="Motion">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {DURATIONS.map((d) => (
            <div
              key={d.name}
              className="space-y-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-medium">{d.name}</span>
                <span className="numeric text-xs text-[var(--color-muted)]">{d.value}</span>
              </div>
              <div className="text-[var(--color-muted)] text-sm">{d.note}</div>
              <div className="numeric pt-1 text-[10px] text-[var(--color-muted)]/80">{d.token}</div>
            </div>
          ))}
        </div>
        <p className="pt-2 text-[var(--color-muted)] text-sm">
          Ease: <span className="numeric">cubic-bezier(0.22, 1, 0.36, 1)</span>. Respects{" "}
          <span className="numeric">prefers-reduced-motion</span>.
        </p>
      </Section>

      <Section eyebrow="Components · 01" title="Buttons">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="default">Take 10,000 credits</Button>
            <Button variant="outline">How it works</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Cancel round</Button>
            <Button variant="link">Learn more</Button>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <Button size="xs">xs</Button>
            <Button size="sm">sm</Button>
            <Button size="default">default</Button>
            <Button size="lg">lg</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Disabled</Button>
            <Button variant="outline" disabled>
              Disabled outline
            </Button>
          </div>
        </div>
      </Section>

      <Section eyebrow="Components · 02" title="Live dots">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-2">
            <LiveDot tone="teal" size="md" />
            <span className="text-sm">teal · active</span>
          </div>
          <div className="flex items-center gap-2">
            <LiveDot tone="magenta" size="md" />
            <span className="text-sm">magenta · win</span>
          </div>
          <div className="flex items-center gap-2">
            <LiveDot tone="amber" size="md" />
            <span className="text-sm">amber · loss</span>
          </div>
          <div className="flex items-center gap-2">
            <LiveDot tone="muted" size="md" />
            <span className="text-sm">muted · idle</span>
          </div>
        </div>
      </Section>

      <Section eyebrow="Components · 03" title="Icons · lucide, 1.5px">
        <div className="flex flex-wrap gap-5">
          {NAV_ICONS.map(({ Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            >
              <Icon className="size-4 text-[var(--color-muted)]" />
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Components · 04" title="Game hero cards">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <GameHeroCard
            game="crash"
            label="Crash"
            tag="Ride the curve"
            status="live"
            href="/games/crash"
          />
          <GameHeroCard
            game="mines"
            label="Mines"
            tag="Avoid the bombs"
            status="coming-soon"
            href="/games/mines"
          />
          <GameHeroCard
            game="plinko"
            label="Plinko"
            tag="Trust the bounce"
            status="coming-soon"
            href="/games/plinko"
          />
          <GameHeroCard
            game="lottery"
            label="Lottery"
            tag="Draw at midnight"
            status="coming-soon"
            href="/games/lottery"
          />
        </div>
        <p className="text-[var(--color-muted)] text-sm">
          Live state is a <code className="numeric text-xs">&lt;Link&gt;</code>. Coming-soon is a
          non-interactive <code className="numeric text-xs">&lt;div&gt;</code> with{" "}
          <code className="numeric text-xs">aria-disabled</code> — truth-in-affordance.
        </p>
      </Section>

      <Section eyebrow="Components · 05" title="Surfaces">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="text-[var(--color-muted)] text-sm">--surface · 0.15</div>
            <div className="mt-1 font-medium">Card</div>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-6">
            <div className="text-[var(--color-muted)] text-sm">--elevated · 0.19</div>
            <div className="mt-1 font-medium">Popover / input</div>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--color-accent)] p-6 text-[var(--color-bg-deep)]">
            <div className="text-sm opacity-80">--accent · 0.78 0.13 82</div>
            <div className="mt-1 font-medium">Primary surface</div>
          </div>
        </div>
      </Section>

      <Section eyebrow="Voice · 01" title="Copy rules">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <div className="font-medium">The room is dark.</div>
            <div className="text-[var(--color-muted)] text-sm">
              Empty state. Editorial, flat, no exclamation.
            </div>
          </div>
          <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <div className="font-medium">Three steps · zero dollars</div>
            <div className="text-[var(--color-muted)] text-sm">
              Middle dot for pairings. Imperatives over hype words.
            </div>
          </div>
          <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <div className="font-medium">Take 10,000 credits</div>
            <div className="text-[var(--color-muted)] text-sm">
              CTAs are imperatives. Sentence case. Never "Sign up".
            </div>
          </div>
          <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <div className="font-medium">Credits never convert to money.</div>
            <div className="text-[var(--color-muted)] text-sm">
              Own the absurdity. Honest negatives framed as features.
            </div>
          </div>
        </div>
      </Section>

      <footer className="border-t border-[var(--color-border)]/60 pt-8 pb-4 text-center">
        <p className="text-[var(--color-muted)] text-sm">
          Source of truth: <code className="numeric text-xs">src/app/globals.css</code> · kit at{" "}
          <code className="numeric text-xs">~/Downloads/Gamblino Design System</code>
        </p>
      </footer>
    </main>
  );
}
