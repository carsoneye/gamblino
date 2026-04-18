import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GameNavItem({
  label,
  icon,
  status,
  compact = false,
}: {
  label: string;
  icon: ReactNode;
  status: "live" | "coming-soon";
  compact?: boolean;
}) {
  const pending = status === "coming-soon";
  return (
    <div
      aria-disabled={pending}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[var(--color-muted)]",
        pending && "cursor-not-allowed opacity-60",
        compact && "justify-center px-0",
      )}
    >
      {icon}
      <span className={cn("truncate", compact && "sr-only")}>{label}</span>
      {!compact && pending ? (
        <span className="ml-auto rounded-[var(--radius-chip)] border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
          Soon
        </span>
      ) : null}
    </div>
  );
}
