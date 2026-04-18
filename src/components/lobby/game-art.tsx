import type { GameKey } from "@/lib/floor-activity";

const TEAL = "oklch(0.82 0.17 180)";
const MAGENTA = "oklch(0.68 0.25 350)";
const MUTED = "oklch(0.62 0.04 260)";

export function GameArt({ game, className }: { game: GameKey; className?: string }) {
  if (game === "crash") return <CrashArt className={className} />;
  if (game === "mines") return <MinesArt className={className} />;
  return <PlinkoArt className={className} />;
}

function CrashArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Crash multiplier curve"
      className={className}
    >
      <defs>
        <linearGradient id="crash-grad" x1="0" y1="140" x2="240" y2="0">
          <stop offset="0%" stopColor={TEAL} stopOpacity="0" />
          <stop offset="40%" stopColor={TEAL} stopOpacity="0.5" />
          <stop offset="100%" stopColor={MAGENTA} />
        </linearGradient>
        <linearGradient id="crash-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={MAGENTA} stopOpacity="0.35" />
          <stop offset="100%" stopColor={MAGENTA} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g opacity="0.25">
        {[24, 42, 60, 78, 96, 114].map((y) => (
          <line
            key={`grid-${y}`}
            x1="0"
            x2="240"
            y1={y}
            y2={y}
            stroke={MUTED}
            strokeWidth="0.5"
            strokeDasharray="2 6"
          />
        ))}
      </g>
      <path
        d="M0 132 C 60 130, 110 110, 150 70 S 220 10, 240 4 L 240 140 L 0 140 Z"
        fill="url(#crash-fill)"
      />
      <path
        d="M0 132 C 60 130, 110 110, 150 70 S 220 10, 240 4"
        stroke="url(#crash-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="240" cy="4" r="4" fill={MAGENTA} />
      <circle cx="240" cy="4" r="10" fill={MAGENTA} fillOpacity="0.2" />
    </svg>
  );
}

function MinesArt({ className }: { className?: string }) {
  const cells = Array.from({ length: 25 }, (_, i) => i);
  const mineSet = new Set([6, 13, 17]);
  const revealSet = new Set([0, 1, 5, 10, 11, 12]);
  return (
    <svg
      viewBox="0 0 240 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Mines grid preview"
      className={className}
    >
      <defs>
        <radialGradient id="mines-halo" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={TEAL} stopOpacity="0.35" />
          <stop offset="100%" stopColor={TEAL} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="240" height="140" fill="url(#mines-halo)" />
      <g transform="translate(70 10)">
        {cells.map((i) => {
          const col = i % 5;
          const row = Math.floor(i / 5);
          const x = col * 24;
          const y = row * 24;
          const isMine = mineSet.has(i);
          const isRevealed = revealSet.has(i);
          return (
            <g key={`cell-${i}`} transform={`translate(${x} ${y})`}>
              <rect
                x="0"
                y="0"
                width="20"
                height="20"
                rx="3"
                fill={isRevealed ? "oklch(0.23 0.06 260)" : "oklch(0.19 0.05 260)"}
                stroke={isRevealed ? TEAL : "oklch(1 0 0 / 6%)"}
                strokeWidth="0.75"
              />
              {isMine ? <circle cx="10" cy="10" r="3" fill={MAGENTA} /> : null}
              {isRevealed && !isMine ? (
                <circle cx="10" cy="10" r="1.5" fill={TEAL} opacity="0.9" />
              ) : null}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

const PLINKO_SLOTS = [
  { slot: "L3", multi: 1.1 },
  { slot: "L2", multi: 1.4 },
  { slot: "L1", multi: 2.1 },
  { slot: "C0", multi: 5.8 },
  { slot: "R1", multi: 2.1 },
  { slot: "R2", multi: 1.4 },
  { slot: "R3", multi: 1.1 },
] as const;

function PlinkoArt({ className }: { className?: string }) {
  const rows = 7;
  return (
    <svg
      viewBox="0 0 240 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Plinko pegs and multipliers"
      className={className}
    >
      <defs>
        <linearGradient id="plinko-trail" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={TEAL} stopOpacity="0" />
          <stop offset="100%" stopColor={TEAL} />
        </linearGradient>
      </defs>
      <g fill={MUTED} opacity="0.55">
        {Array.from({ length: rows }).flatMap((_, r) => {
          const count = r + 3;
          const spacing = 220 / (count - 1);
          const y = 16 + r * 14;
          return Array.from({ length: count }).map((__, c) => {
            const cx = 10 + c * spacing;
            return <circle key={`peg-${y}-${cx}`} cx={cx} cy={y} r="1.5" />;
          });
        })}
      </g>
      <path
        d="M120 8 Q 100 28 114 44 Q 128 60 108 78 Q 92 94 110 112"
        stroke="url(#plinko-trail)"
        strokeWidth="1.75"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="110" cy="112" r="4" fill={TEAL} />
      <circle cx="110" cy="112" r="9" fill={TEAL} opacity="0.25" />
      <g transform="translate(12 118)">
        {PLINKO_SLOTS.map(({ slot, multi }, i) => (
          <rect
            key={slot}
            x={i * 32}
            y="0"
            width="28"
            height="14"
            rx="2"
            fill={multi > 3 ? MAGENTA : "oklch(0.23 0.06 260)"}
            opacity={multi > 3 ? 0.85 : 0.7}
          />
        ))}
      </g>
    </svg>
  );
}
