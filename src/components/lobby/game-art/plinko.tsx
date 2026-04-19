import { ART_FILL, META_STYLE, SVG_PROPS, WORDMARK_STYLE } from "./tokens";

export function PlinkoArt({ className }: { className?: string }) {
  const buckets = [
    { id: "l3", m: "110×", hot: false },
    { id: "l2", m: "26×", hot: false },
    { id: "l1", m: "5×", hot: true },
    { id: "c", m: "1×", hot: false },
    { id: "r1", m: "0.5×", hot: false },
    { id: "r2", m: "1×", hot: false },
    { id: "r3", m: "26×", hot: false },
  ];
  const bucketW = 28;
  const bucketGap = 2;
  const bucketStripW = buckets.length * bucketW + (buckets.length - 1) * bucketGap;
  const bucketX = (240 - bucketStripW) / 2;
  const bucketY = 182;

  const pegRows = 5;
  const pegPitch = 16;
  const pegTopY = 86;

  const pegs: Array<{ x: number; y: number }> = [];
  for (let r = 0; r < pegRows; r++) {
    const count = r + 3;
    const rowWidth = (count - 1) * pegPitch;
    for (let c = 0; c < count; c++) {
      pegs.push({ x: 120 - rowWidth / 2 + c * pegPitch, y: pegTopY + r * pegPitch });
    }
  }

  return (
    <svg {...SVG_PROPS} role="img" aria-label="Plinko" className={className}>
      <defs>
        <linearGradient id="plinko-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.17 0.015 80)" />
          <stop offset="100%" stopColor={ART_FILL.deep} />
        </linearGradient>
        <radialGradient id="plinko-hot" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={ART_FILL.accent} stopOpacity="0.55" />
          <stop offset="100%" stopColor={ART_FILL.accent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="plinko-bucket-hot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ART_FILL.accentHi} />
          <stop offset="100%" stopColor={ART_FILL.accent} />
        </linearGradient>
        <linearGradient id="plinko-coin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={ART_FILL.accentHi} />
          <stop offset="100%" stopColor={ART_FILL.accent} />
        </linearGradient>
      </defs>

      <rect width="240" height="320" fill="url(#plinko-bg)" />

      <g opacity="0.55">
        {pegs.map((p) => (
          <circle key={`peg-${p.x}-${p.y}`} cx={p.x} cy={p.y} r="1.4" fill={ART_FILL.muted} />
        ))}
      </g>

      <g transform="translate(120 158)">
        <circle r="14" fill="url(#plinko-hot)" />
        <circle r="6" fill="url(#plinko-coin)" />
        <circle r="2.2" cx="-1.4" cy="-1.4" fill={ART_FILL.accentHi} opacity="0.7" />
      </g>

      <g transform={`translate(${bucketX} ${bucketY})`}>
        <rect
          x={2 * (bucketW + bucketGap) - 2}
          y="-6"
          width={bucketW + 4}
          height="28"
          rx="1"
          fill="url(#plinko-hot)"
        />
        {buckets.map((b, i) => (
          <g key={b.id} transform={`translate(${i * (bucketW + bucketGap)} 0)`}>
            <rect
              x="0"
              y="0"
              width={bucketW}
              height="18"
              rx="1"
              fill={b.hot ? "url(#plinko-bucket-hot)" : ART_FILL.surface}
              stroke={b.hot ? ART_FILL.accentHi : ART_FILL.border}
              strokeOpacity={b.hot ? 0.9 : 0.6}
              strokeWidth="0.6"
            />
            <text
              x={bucketW / 2}
              y="12"
              textAnchor="middle"
              fill={b.hot ? ART_FILL.deep : ART_FILL.muted}
              fontSize="8"
              fontWeight={b.hot ? "700" : "500"}
              style={META_STYLE}
            >
              {b.m}
            </text>
          </g>
        ))}
      </g>

      <text x="26" y="58" fill={ART_FILL.muted} fontSize="9" style={META_STYLE}>
        ORIGINAL · 03
      </text>
      <text x="26" y="258" fill={ART_FILL.text} fontSize="40" style={WORDMARK_STYLE}>
        Plinko
      </text>
      <text x="26" y="280" fill={ART_FILL.accent} fontSize="9" style={META_STYLE}>
        TRUST THE BOUNCE
      </text>
    </svg>
  );
}
