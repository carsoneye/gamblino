import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GameNavItem({
  label,
  icon,
  status,
  href,
  compact = false,
}: {
  label: string;
  icon: ReactNode;
  status: "live" | "coming-soon";
  href?: string;
  compact?: boolean;
}) {
  const pending = status === "coming-soon";
  const base = cn(
    "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[var(--color-muted)]",
    compact && "lg:justify-start lg:px-3 justify-center px-0",
  );

  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          "flex size-5 items-center justify-center text-[var(--color-muted)]",
          pending && "opacity-70",
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          "flex-1 truncate",
          compact && "sr-only lg:not-sr-only",
          pending && "opacity-80",
        )}
      >
        {label}
      </span>
      {pending ? (
        <span
          className={cn(
            "text-[11px] font-medium text-[var(--color-muted)]",
            compact && "sr-only lg:not-sr-only",
          )}
        >
          Soon
        </span>
      ) : null}
    </>
  );

  if (pending || !href) {
    return (
      <div aria-disabled="true" className={cn(base, "cursor-not-allowed")}>
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        base,
        "hover:text-[var(--color-text)] hover:bg-gradient-to-r hover:from-[var(--color-surface)] hover:to-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
      )}
    >
      {inner}
    </Link>
  );
}
