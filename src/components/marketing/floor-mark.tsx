export function FloorMark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none relative mt-auto select-none overflow-hidden pb-4"
    >
      <p
        className="font-display font-semibold leading-[0.82] tracking-[-0.04em] text-[var(--color-text)]/[0.04]"
        style={{ fontSize: "clamp(6rem, 18vw, 16rem)" }}
      >
        gamblino
      </p>
      <span
        aria-hidden
        className="absolute inset-x-6 bottom-3 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/30 to-transparent lg:inset-x-10"
      />
    </div>
  );
}
