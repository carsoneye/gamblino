"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  label,
  icon,
  compact = false,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
        active && "bg-[var(--color-surface)] text-[var(--color-text)]",
        compact && "justify-center px-0",
      )}
    >
      {icon}
      <span className={cn("truncate", compact && "sr-only")}>{label}</span>
      {active ? (
        <span
          aria-hidden
          className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-[var(--color-accent)]"
        />
      ) : null}
    </Link>
  );
}
