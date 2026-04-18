"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  label,
  icon,
  trailing,
  compact = false,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  trailing?: ReactNode;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
        "text-[var(--color-muted)] hover:text-[var(--color-text)]",
        "hover:bg-gradient-to-r hover:from-[var(--color-surface)] hover:to-transparent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
        active &&
          "text-[var(--color-text)] bg-gradient-to-r from-[var(--color-accent)]/10 to-transparent",
        compact && "justify-center px-0",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-5 items-center justify-center text-[var(--color-muted)] transition-colors",
          "group-hover:text-[var(--color-accent-hi)]",
          active && "text-[var(--color-accent-hi)]",
        )}
      >
        {icon}
      </span>
      <span className={cn("flex-1 truncate", compact && "sr-only")}>{label}</span>
      {!compact && trailing ? <span className="shrink-0">{trailing}</span> : null}
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
