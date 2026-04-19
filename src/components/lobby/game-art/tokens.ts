export const SVG_PROPS = {
  viewBox: "0 0 240 320",
  fill: "none" as const,
  xmlns: "http://www.w3.org/2000/svg",
  preserveAspectRatio: "xMidYMid slice" as const,
};

export const ART_FILL = {
  accent: "var(--color-accent)",
  accentHi: "var(--color-accent-hi)",
  surface: "var(--color-surface)",
  elevated: "var(--color-elevated)",
  deep: "var(--color-bg-deep)",
  text: "var(--color-text)",
  muted: "var(--color-muted)",
  border: "var(--color-border)",
  loss: "var(--color-loss)",
} as const;

export const WORDMARK_STYLE = {
  fontFamily: "var(--font-display), sans-serif",
  fontWeight: 700,
  letterSpacing: "-0.04em",
} as const;

export const META_STYLE = {
  fontFamily: "var(--font-mono), ui-monospace, monospace",
  fontWeight: 500,
  letterSpacing: "0.14em",
} as const;
