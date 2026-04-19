import { ART_FILL, META_STYLE, SVG_PROPS, WORDMARK_STYLE } from "./tokens";

export function LotteryArt({ className }: { className?: string }) {
  const balls = [
    { n: "07", x: 48 },
    { n: "14", x: 88 },
    { n: "23", x: 128 },
    { n: "31", x: 168 },
    { n: "42", x: 208 },
  ];
  const ballY = 152;

  return (
    <svg {...SVG_PROPS} role="img" aria-label="Lottery" className={className}>
      <defs>
        <linearGradient id="lotto-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.16 0.015 60)" />
          <stop offset="100%" stopColor={ART_FILL.deep} />
        </linearGradient>
        <radialGradient id="lotto-rays" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0%" stopColor={ART_FILL.accent} stopOpacity="0.25" />
          <stop offset="100%" stopColor={ART_FILL.accent} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lotto-ball" cx="0.35" cy="0.3" r="0.7">
          <stop offset="0%" stopColor={ART_FILL.accentHi} />
          <stop offset="100%" stopColor={ART_FILL.accent} />
        </radialGradient>
        <radialGradient id="lotto-ball-hot" cx="0.35" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="oklch(0.95 0.1 90)" />
          <stop offset="100%" stopColor={ART_FILL.accentHi} />
        </radialGradient>
      </defs>

      <rect width="240" height="320" fill="url(#lotto-bg)" />
      <rect width="240" height="320" fill="url(#lotto-rays)" />

      <g opacity="0.25">
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const r1 = 22;
          const r2 = 68;
          const x1 = 120 + Math.cos(a) * r1;
          const y1 = 128 + Math.sin(a) * r1;
          const x2 = 120 + Math.cos(a) * r2;
          const y2 = 128 + Math.sin(a) * r2;
          return (
            <line
              key={`ray-${x1.toFixed(2)}-${y1.toFixed(2)}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={ART_FILL.accent}
              strokeWidth="0.6"
            />
          );
        })}
      </g>

      <g transform="translate(120 128)">
        <circle r="34" fill={ART_FILL.deep} stroke={ART_FILL.accent} strokeOpacity="0.4" />
        <circle r="22" fill="url(#lotto-ball-hot)" />
        <text
          x="0"
          y="5"
          textAnchor="middle"
          fill={ART_FILL.deep}
          fontSize="17"
          fontWeight="700"
          style={META_STYLE}
        >
          42
        </text>
      </g>

      <g>
        {balls.map((b, i) => (
          <g key={b.n} transform={`translate(${b.x} ${ballY + 48})`}>
            <circle r="11" fill="url(#lotto-ball)" opacity={i === 4 ? 1 : 0.85} />
            <text
              x="0"
              y="3"
              textAnchor="middle"
              fill={ART_FILL.deep}
              fontSize="9"
              fontWeight="700"
              style={META_STYLE}
            >
              {b.n}
            </text>
          </g>
        ))}
      </g>

      <text x="26" y="58" fill={ART_FILL.muted} fontSize="9" style={META_STYLE}>
        ORIGINAL · 04
      </text>
      <text x="26" y="258" fill={ART_FILL.text} fontSize="36" style={WORDMARK_STYLE}>
        Lottery
      </text>
      <text x="26" y="280" fill={ART_FILL.accent} fontSize="9" style={META_STYLE}>
        DRAW AT MIDNIGHT
      </text>
    </svg>
  );
}
