import { ART_FILL, META_STYLE, SVG_PROPS, WORDMARK_STYLE } from "./tokens";

export function CrashArt({ className }: { className?: string }) {
  return (
    <svg {...SVG_PROPS} role="img" aria-label="Crash" className={className}>
      <defs>
        <linearGradient id="crash-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.17 0.02 60)" />
          <stop offset="100%" stopColor={ART_FILL.deep} />
        </linearGradient>
        <radialGradient id="crash-burn" cx="0.75" cy="0.2" r="0.7">
          <stop offset="0%" stopColor={ART_FILL.accentHi} stopOpacity="0.32" />
          <stop offset="100%" stopColor={ART_FILL.accent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="crash-flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={ART_FILL.accent} stopOpacity="0" />
          <stop offset="50%" stopColor={ART_FILL.accent} stopOpacity="0.65" />
          <stop offset="100%" stopColor={ART_FILL.accentHi} />
        </linearGradient>
        <linearGradient id="crash-rocket" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={ART_FILL.accentHi} />
          <stop offset="100%" stopColor={ART_FILL.accent} />
        </linearGradient>
      </defs>

      <rect width="240" height="320" fill="url(#crash-bg)" />
      <rect width="240" height="320" fill="url(#crash-burn)" />

      <g transform="translate(168 88) rotate(38)">
        <path d="M -4 60 L 0 160 L 4 60 Z" fill="url(#crash-flame)" opacity="0.85" />
        <path d="M -10 -28 L 0 -54 L 10 -28 L 10 30 L -10 30 Z" fill="url(#crash-rocket)" />
        <rect x="-10" y="30" width="20" height="8" rx="1" fill={ART_FILL.deep} opacity="0.5" />
        <path d="M -10 10 L -20 30 L -10 30 Z" fill="url(#crash-rocket)" opacity="0.8" />
        <path d="M 10 10 L 20 30 L 10 30 Z" fill="url(#crash-rocket)" opacity="0.8" />
        <circle cx="0" cy="-10" r="4" fill={ART_FILL.deep} opacity="0.55" />
      </g>

      <g transform="translate(18 98)">
        <rect
          x="0"
          y="0"
          width="86"
          height="26"
          rx="2"
          fill={ART_FILL.deep}
          stroke={ART_FILL.accent}
          strokeOpacity="0.4"
          strokeWidth="0.8"
        />
        <text
          x="8"
          y="17"
          fill={ART_FILL.accentHi}
          fontSize="14"
          fontWeight="600"
          style={META_STYLE}
        >
          ×14.82
        </text>
      </g>

      <text x="26" y="58" fill={ART_FILL.muted} fontSize="9" style={META_STYLE}>
        ORIGINAL · 01
      </text>
      <text x="26" y="258" fill={ART_FILL.text} fontSize="40" style={WORDMARK_STYLE}>
        Crash
      </text>
      <text x="26" y="280" fill={ART_FILL.accent} fontSize="9" style={META_STYLE}>
        BANK BEFORE IT BLOWS
      </text>
    </svg>
  );
}
