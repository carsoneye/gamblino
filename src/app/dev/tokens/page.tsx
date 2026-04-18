const colors = [
  { name: "bg-deep", token: "--color-bg-deep" },
  { name: "bg", token: "--color-bg" },
  { name: "surface", token: "--color-surface" },
  { name: "elevated", token: "--color-elevated" },
  { name: "accent", token: "--color-accent" },
  { name: "accent-hi", token: "--color-accent-hi" },
  { name: "win", token: "--color-win" },
  { name: "loss", token: "--color-loss" },
  { name: "text", token: "--color-text" },
  { name: "muted", token: "--color-muted" },
] as const;

const radii = [
  { name: "chip", token: "--radius-chip" },
  { name: "sm", token: "--radius-sm" },
  { name: "md", token: "--radius-md" },
  { name: "lg", token: "--radius-lg" },
  { name: "xl", token: "--radius-xl" },
  { name: "2xl", token: "--radius-2xl" },
] as const;

export default function TokensPage() {
  return (
    <main className="flex-1 px-8 py-16 space-y-16 max-w-6xl mx-auto">
      <header className="space-y-2">
        <h1 className="text-5xl font-semibold">Design tokens</h1>
        <p className="text-[var(--color-muted)]">
          Midnight Arcade — sandbox for verifying tokens resolve.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl">Typography</h2>
        <div className="space-y-4">
          <p className="text-6xl font-display font-semibold tracking-tight">
            Clash Display — display
          </p>
          <p className="text-xl font-sans">
            General Sans — body. The quick brown fox jumps over the lazy dog.
          </p>
          <p className="numeric text-3xl">1,234,567.89 × 2.48</p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl">Color</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {colors.map((c) => (
            <div key={c.name} className="space-y-2">
              <div
                className="aspect-square rounded-lg border"
                style={{ background: `var(${c.token})` }}
              />
              <div className="text-sm">
                <div className="font-medium">{c.name}</div>
                <div className="numeric text-xs text-[var(--color-muted)]">{c.token}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl">Radius</h2>
        <div className="flex flex-wrap gap-4 items-end">
          {radii.map((r) => (
            <div key={r.name} className="space-y-2 text-center">
              <div
                className="w-24 h-24 bg-[var(--color-surface)] border"
                style={{ borderRadius: `var(${r.token})` }}
              />
              <div className="text-sm">{r.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl">Surfaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-lg bg-[var(--color-surface)] border">
            <div className="text-sm text-[var(--color-muted)]">surface</div>
            <div className="text-2xl font-semibold mt-1">Card</div>
          </div>
          <div className="p-6 rounded-lg bg-[var(--color-elevated)] border">
            <div className="text-sm text-[var(--color-muted)]">elevated</div>
            <div className="text-2xl font-semibold mt-1">Popover</div>
          </div>
          <div className="p-6 rounded-lg bg-[var(--color-accent)] text-[var(--color-bg-deep)]">
            <div className="text-sm opacity-80">accent</div>
            <div className="text-2xl font-semibold mt-1">Primary CTA</div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl">Motion</h2>
        <p className="text-[var(--color-muted)]">
          Default: <span className="numeric">180ms cubic-bezier(0.22, 1, 0.36, 1)</span>. Mesh
          rotates 180s linear. Honors <span className="numeric">prefers-reduced-motion</span>.
        </p>
      </section>
    </main>
  );
}
