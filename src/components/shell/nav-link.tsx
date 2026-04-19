"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BaseProps = {
  href: string;
  label: string;
  icon: ReactNode;
  enabled?: boolean;
  compact?: boolean;
  showLabel?: boolean;
};

export function NavLink({
  href,
  label,
  icon,
  enabled = true,
  compact = false,
  showLabel,
}: BaseProps) {
  const pathname = usePathname();
  const active = enabled && (pathname === href || pathname.startsWith(`${href}/`));
  const forceLabel = showLabel === true;

  const containerBase =
    "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all text-[var(--color-muted)]";

  const iconNode = (
    <span
      aria-hidden
      className={cn(
        "flex size-5 items-center justify-center text-[var(--color-muted)] transition-colors",
        enabled && "group-hover:text-[var(--color-accent-hi)]",
        active && "text-[var(--color-accent-hi)]",
      )}
    >
      {icon}
    </span>
  );

  const labelNode = (
    <span
      className={cn(
        "flex-1 truncate",
        !forceLabel && compact && "sr-only lg:not-sr-only",
        !enabled && "opacity-70",
      )}
    >
      {label}
    </span>
  );

  if (!enabled) {
    return (
      <div
        aria-disabled="true"
        className={cn(
          containerBase,
          "cursor-not-allowed",
          !forceLabel && compact && "lg:justify-start justify-center px-0 lg:px-3",
        )}
      >
        {iconNode}
        {labelNode}
        {!compact || forceLabel ? (
          <span className="text-[11px] font-medium text-[var(--color-muted)]">Soon</span>
        ) : null}
      </div>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        containerBase,
        "hover:text-[var(--color-text)] hover:bg-gradient-to-r hover:from-[var(--color-surface)] hover:to-transparent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
        active &&
          "text-[var(--color-text)] bg-gradient-to-r from-[var(--color-accent)]/10 to-transparent",
        !forceLabel && compact && "lg:justify-start justify-center px-0 lg:px-3",
      )}
    >
      {iconNode}
      {labelNode}
      {active ? (
        <span
          aria-hidden
          className="absolute inset-y-1 left-0 w-[2px] rounded-full bg-[var(--color-accent)]"
          style={{ boxShadow: "0 0 10px var(--color-accent)" }}
        />
      ) : null}
    </Link>
  );
}
