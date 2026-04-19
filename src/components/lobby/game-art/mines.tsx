import { ART_FILL, META_STYLE, SVG_PROPS, WORDMARK_STYLE } from "./tokens";

export function MinesArt({ className }: { className?: string }) {
  const pitch = 26;
  const cols = 5;
  const rows = 4;
  const gridX = (240 - (cols - 1) * pitch) / 2 - 8;
  const gridY = 76;
  const path = new Set([6, 7, 12, 13, 18]);
  const bomb = 14;

  return (
    <svg {...SVG_PROPS} role="img" aria-label="Mines" className={className}>
      <defs>
        <linearGradient id="mines-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.16 0.01 60)" />
          <stop offset="100%" stopColor={ART_FILL.deep} />
        </linearGradient>
        <radialGradient id="mines-halo" cx="0.5" cy="0.35" r="0.6">
          <stop offset="0%" stopColor={ART_FILL.accent} stopOpacity="0.22" />
          <stop offset="100%" stopColor={ART_FILL.accent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mines-gem" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={ART_FILL.accentHi} />
          <stop offset="100%" stopColor={ART_FILL.accent} />
        </linearGradient>
        <radialGradient id="mines-bomb-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={ART_FILL.loss} stopOpacity="0.6" />
          <stop offset="100%" stopColor={ART_FILL.loss} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="240" height="320" fill="url(#mines-bg)" />
      <rect width="240" height="320" fill="url(#mines-halo)" />

      <g transform={`translate(${gridX} ${gridY})`}>
        {Array.from({ length: cols * rows }, (_, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = col * pitch;
          const y = row * pitch;
          const revealed = path.has(i);
          const isBomb = i === bomb;
          return (
            <g key={`tile-${col}-${row}`} transform={`translate(${x} ${y})`}>
              <rect
                width="18"
                height="18"
                rx="2"
                fill={revealed || isBomb ? ART_FILL.deep : ART_FILL.surface}
                stroke={revealed ? ART_FILL.accent : isBomb ? ART_FILL.loss : ART_FILL.border}
                strokeOpacity={revealed ? 0.8 : isBomb ? 0.7 : 0.6}
                strokeWidth="0.8"
              />
              {revealed ? (
                <g transform="translate(9 9) rotate(45)">
                  <rect x="-4" y="-4" width="8" height="8" rx="1" fill="url(#mines-gem)" />
                </g>
              ) : null}
              {isBomb ? (
                <g transform="translate(9 9)">
                  <circle r="8" fill="url(#mines-bomb-glow)" />
                  <circle r="3.2" fill={ART_FILL.loss} />
                  <circle r="1.1" fill={ART_FILL.accentHi} opacity="0.8" />
                </g>
              ) : null}
            </g>
          );
        })}
      </g>

      <text x="26" y="58" fill={ART_FILL.muted} fontSize="9" style={META_STYLE}>
        ORIGINAL · 02
      </text>
      <text x="26" y="258" fill={ART_FILL.text} fontSize="40" style={WORDMARK_STYLE}>
        Mines
      </text>
      <text x="26" y="280" fill={ART_FILL.accent} fontSize="9" style={META_STYLE}>
        WALK THE FIELD
      </text>
    </svg>
  );
}
