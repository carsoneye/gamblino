import { cn } from "@/lib/utils";

export function LiveDot({
  tone = "teal",
  size = "sm",
  className,
}: {
  tone?: "teal" | "magenta" | "amber" | "muted";
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const sizeClass = size === "xs" ? "size-1.5" : size === "md" ? "size-2.5" : "size-2";
  const color =
    tone === "teal"
      ? "var(--color-live)"
      : tone === "magenta"
        ? "var(--color-accent-2)"
        : tone === "amber"
          ? "var(--color-loss)"
          : "var(--color-muted)";
  return (
    <span
      aria-hidden
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
    >
      <span
        className={cn(
          "absolute inline-flex rounded-full opacity-60 motion-safe:animate-ping",
          sizeClass,
        )}
        style={{ background: color }}
      />
      <span
        className={cn("relative inline-flex rounded-full", sizeClass)}
        style={{ background: color, boxShadow: `0 0 12px ${color}` }}
      />
    </span>
  );
}
