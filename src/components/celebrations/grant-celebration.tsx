"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Props = { amount: number };

export function GrantCelebration({ amount }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [display, setDisplay] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setDisplay(amount);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const delay = 450;
    const duration = 1100;
    const tick = (now: number) => {
      const elapsed = now - start - delay;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(eased * amount));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [amount]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: dismiss is stable for this component's lifetime
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function dismiss() {
    if (closing) return;
    setClosing(true);
    setTimeout(() => router.replace("/casino"), 260);
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="grant-title"
      tabIndex={-1}
      data-state={closing ? "closing" : mounted ? "open" : "opening"}
      className="fixed inset-0 z-[90] flex items-center justify-center outline-none data-[state=closing]:animate-[grantFadeOut_260ms_ease-out_forwards] data-[state=open]:animate-[grantFadeIn_320ms_cubic-bezier(0.22,1,0.36,1)_forwards] data-[state=opening]:opacity-0"
    >
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        className="absolute inset-0 cursor-default bg-[var(--color-bg-deep)]/85 backdrop-blur-md focus-visible:outline-none"
      />
      <div className="relative flex flex-col items-center gap-10 px-6">
        <div className="relative" aria-hidden>
          <ChipSvg />
        </div>
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="font-display text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--color-accent)]">
            Dealt in
          </span>
          <h2
            id="grant-title"
            className="font-display font-semibold leading-none tracking-[-0.04em] text-[var(--color-text)] numeric"
            style={{ fontSize: "clamp(3.5rem, 9vw, 6.25rem)" }}
          >
            {display.toLocaleString()}
          </h2>
          <p className="max-w-md text-[15px] leading-relaxed text-[var(--color-muted)]">
            Credits are on the table. Play anything. Nothing here is real — that's the point.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex h-11 items-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-6 text-sm font-semibold text-[var(--color-bg-deep)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-accent-hi)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-deep)]"
        >
          Take a seat
        </button>
      </div>

      <style>{`
        @keyframes grantFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes grantFadeOut { from { opacity: 1 } to { opacity: 0 } }
        @media (prefers-reduced-motion: no-preference) {
          @keyframes chipSlide {
            0%   { transform: translate(240px, 180px) rotate(-220deg) scale(0.1); opacity: 0; }
            55%  { transform: translate(0, 0) rotate(10deg) scale(1.08); opacity: 1; }
            72%  { transform: translate(0, 0) rotate(-3deg) scale(0.98); opacity: 1; }
            100% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
          }
          @keyframes haloBreath {
            0%   { transform: scale(0.6); opacity: 0; }
            40%  { transform: scale(1); opacity: 0.9; }
            100% { transform: scale(1.08); opacity: 0.75; }
          }
          @keyframes burstRing {
            0%   { transform: scale(0.35); opacity: 0; stroke-width: 3; }
            30%  { opacity: 0.85; stroke-width: 2.5; }
            100% { transform: scale(2.1); opacity: 0; stroke-width: 0.4; }
          }
          @keyframes burstRingInner {
            0%   { transform: scale(0.4); opacity: 0; stroke-width: 2; }
            35%  { opacity: 0.7; stroke-width: 1.5; }
            100% { transform: scale(1.55); opacity: 0; stroke-width: 0.3; }
          }
          @keyframes sparkOut {
            0%   { transform: translate(0, 0) scale(0); opacity: 0; }
            25%  { transform: translate(calc(var(--dx) * 0.35), calc(var(--dy) * 0.35)) scale(1); opacity: 1; }
            100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
          }
          @keyframes digitsBreath {
            0%, 100% { text-shadow: 0 0 0 transparent; }
            50% { text-shadow: 0 0 28px color-mix(in oklch, var(--color-accent) 55%, transparent); }
          }
          .grant-chip { animation: chipSlide 900ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both; transform-origin: center; }
          .grant-halo { animation: haloBreath 1200ms cubic-bezier(0.22, 1, 0.36, 1) 160ms both; transform-origin: center; }
          .grant-burst-0 { animation: burstRing 1400ms cubic-bezier(0.22, 1, 0.36, 1) 650ms both; transform-origin: center; transform-box: fill-box; }
          .grant-burst-1 { animation: burstRingInner 1200ms cubic-bezier(0.22, 1, 0.36, 1) 780ms both; transform-origin: center; transform-box: fill-box; }
          .grant-spark { animation: sparkOut 1300ms cubic-bezier(0.22, 1, 0.36, 1) both; }
          #grant-title { animation: digitsBreath 2400ms ease-in-out 900ms infinite; }
        }
        @media (prefers-reduced-motion: reduce) {
          .grant-chip, .grant-halo, .grant-burst-0, .grant-burst-1, .grant-spark { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

function ChipSvg() {
  const sparks = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2 + Math.PI / 10;
    const dist = 120 + (i % 3) * 14;
    return {
      id: i,
      dx: Math.round(Math.cos(angle) * dist),
      dy: Math.round(Math.sin(angle) * dist),
      delay: 700 + i * 22,
    };
  });

  return (
    <div className="relative flex h-[280px] w-[280px] items-center justify-center">
      <div
        aria-hidden
        className="grant-halo absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--color-accent) 55%, transparent) 0%, transparent 65%)",
        }}
      />
      <svg
        viewBox="-140 -140 280 280"
        className="grant-chip absolute inset-0 h-full w-full"
        role="img"
        aria-label="Gold chip"
      >
        <title>Gold chip</title>
        <defs>
          <radialGradient id="chip-face" cx="-0.1" cy="-0.15" r="1">
            <stop offset="0%" stopColor="var(--color-accent-hi)" stopOpacity="1" />
            <stop offset="55%" stopColor="var(--color-accent)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.82" />
          </radialGradient>
          <linearGradient id="chip-rim" x1="0" y1="-1" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent-hi)" />
            <stop offset="50%" stopColor="var(--color-accent)" />
            <stop offset="100%" stopColor="var(--color-accent-hi)" />
          </linearGradient>
        </defs>

        <circle r="72" fill="url(#chip-face)" />
        <circle r="72" fill="none" stroke="url(#chip-rim)" strokeWidth="1.5" opacity="0.9" />
        <circle
          r="58"
          fill="none"
          stroke="var(--color-bg-deep)"
          strokeWidth="2"
          opacity="0.35"
          strokeDasharray="2 4"
        />
        <circle r="38" fill="none" stroke="var(--color-bg-deep)" strokeWidth="1.2" opacity="0.4" />

        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const cx = Math.cos(a) * 64;
          const cy = Math.sin(a) * 64;
          return (
            <rect
              key={`peg-${Math.round(cx)}-${Math.round(cy)}`}
              x={cx - 5}
              y={cy - 3.5}
              width="10"
              height="7"
              rx="1.5"
              fill="var(--color-bg-deep)"
              opacity="0.7"
              transform={`rotate(${(a * 180) / Math.PI} ${cx} ${cy})`}
            />
          );
        })}

        <text
          x="0"
          y="6"
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize="22"
          fontWeight="700"
          fill="var(--color-bg-deep)"
          letterSpacing="-0.02em"
          opacity="0.88"
        >
          10K
        </text>

        <circle
          className="grant-burst-0"
          r="72"
          fill="none"
          stroke="var(--color-accent-hi)"
          strokeWidth="3"
        />
        <circle
          className="grant-burst-1"
          r="72"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
        />
      </svg>

      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        {sparks.map((s) => (
          <span
            key={`spark-${s.dx}-${s.dy}`}
            className="grant-spark absolute block h-1.5 w-1.5 rounded-full"
            style={{
              background: "var(--color-accent-hi)",
              boxShadow: "0 0 8px color-mix(in oklch, var(--color-accent) 60%, transparent)",
              ["--dx" as string]: `${s.dx}px`,
              ["--dy" as string]: `${s.dy}px`,
              animationDelay: `${s.delay}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
