const FAQS = [
  {
    q: "What does play-money mean, exactly?",
    a: "Every credit you spend, win, or lose stays inside the site. There is no conversion to dollars, tokens, gift cards, points programs, anything. The only thing you walk away with is a number next to your name on a leaderboard.",
  },
  {
    q: "How is provably fair actually proven?",
    a: "Before each round the server publishes a SHA-256 hash of the round seed. After the round settles, the raw seed is revealed. Combine it with the client seed and nonce from your bet receipt and the outcome is reproducible, byte for byte. Hash in, hash out, no trust required.",
  },
  {
    q: "Why four games instead of four hundred?",
    a: "Because three of them are ours end-to-end. Catalog casinos license thousands of third-party slots for the floor-space. We would rather ship four originals we can actually vouch for than pipe in a wall of RNG we do not control.",
  },
  {
    q: "Can I cash out?",
    a: "No. Not for money, not for crypto, not for prizes. If a site offers you a way to convert credits into anything valuable, that is a different business with different regulation. This one is not that.",
  },
  {
    q: "What happens when I run out of credits?",
    a: "You get topped back up. Losing streaks are free. The only resource scarcity on the site is your own patience.",
  },
] as const;

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="flex flex-col gap-6 px-6 py-14 lg:px-10 lg:py-16"
    >
      <div className="flex items-end justify-between border-b border-[var(--color-border)]/60 pb-3">
        <h2
          id="faq-heading"
          className="font-display text-xl font-semibold tracking-[-0.02em] text-[var(--color-text)]"
        >
          Questions, answered plainly
        </h2>
        <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--color-muted)]">
          No fine print
        </span>
      </div>
      <div className="flex flex-col divide-y divide-[var(--color-border)]/60 border-y border-[var(--color-border)]/60">
        {FAQS.map(({ q, a }) => (
          <details
            key={q}
            className="group flex flex-col gap-2 py-5 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-6 text-[15px] font-medium tracking-tight text-[var(--color-text)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-accent)]">
              {q}
              <span
                aria-hidden
                className="text-[var(--color-muted)] transition-transform duration-[var(--duration-fast)] group-open:rotate-45"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M7 1.5v11M1.5 7h11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </summary>
            <p className="max-w-[68ch] pt-2 text-[14px] leading-relaxed text-[var(--color-muted)]">
              {a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
