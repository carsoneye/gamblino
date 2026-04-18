import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GameNavItem({
  label,
  icon,
  status,
  trailing,
  compact = false,
}: {
  label: string;
  icon: ReactNode;
  status: "live" | "coming-soon";
  trailing?: ReactNode;
  compact?: boolean;
}) {
  const pending = status === "coming-soon";
  return (
    <div
      aria-disabled={pending}
      className={cn(
        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[var(--color-muted)]",
        pending && "cursor-not-allowed",
        compact && "justify-center px-0",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-5 items-center justify-center text-[var(--color-muted)]",
          pending && "opacity-70",
        )}
      >
        {icon}
      </span>
      <span className={cn("flex-1 truncate", compact && "sr-only", pending && "opacity-80")}>
        {label}
      </span>
      {!compact ? (
        trailing ? (
          <span className="shrink-0">{trailing}</span>
        ) : pending ? (
          <span className="rounded-[var(--radius-chip)] border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Soon
          </span>
        ) : null
      ) : null}
    </div>
  );
}
