const STEPS = [
  {
    n: "01",
    title: "Sign up",
    body: "Give an email. No card, no ID, no verification. The house hands you 10,000 credits on the way in.",
  },
  {
    n: "02",
    title: "Play",
    body: "Four originals: Crash, Mines, Plinko, Lottery. Every round seeded with a public commit you can verify after the reveal.",
  },
  {
    n: "03",
    title: "Keep nothing",
    body: "Credits never convert to money. Losing streaks top back up. The leaderboard is bragging rights and only that.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="flex flex-col gap-6 px-6 py-14 lg:px-10 lg:py-16"
    >
      <div className="flex items-end justify-between border-b border-[var(--color-border)]/60 pb-3">
        <h2
          id="how-heading"
          className="font-display text-xl font-semibold tracking-[-0.02em] text-[var(--color-text)]"
        >
          How it works
        </h2>
        <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--color-muted)]">
          Three steps · zero dollars
        </span>
      </div>
      <ol className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-border)] md:grid-cols-3">
        {STEPS.map(({ n, title, body }) => (
          <li key={n} className="flex flex-col gap-3 bg-[var(--color-bg-deep)] p-6 lg:p-7">
            <div className="flex items-baseline justify-between">
              <span className="numeric text-[11px] font-medium tracking-[0.2em] text-[var(--color-accent)]">
                {n}
              </span>
              <span className="h-px flex-1 translate-y-[-4px] bg-[var(--color-border)]/50" />
            </div>
            <h3 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[var(--color-text)]">
              {title}
            </h3>
            <p className="text-[14px] leading-relaxed text-[var(--color-muted)]">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
