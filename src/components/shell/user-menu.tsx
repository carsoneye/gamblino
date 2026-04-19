"use client";

import { Menu } from "@base-ui/react/menu";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  initial: string;
  name: string | null;
  email: string;
  signOutAction: () => Promise<void> | void;
};

export function UserMenu({ initial, name, email, signOutAction }: Props) {
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="Account menu"
        className="group inline-flex items-center gap-2 rounded-full p-0.5 pr-2 text-[var(--color-text)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      >
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-full border border-[var(--color-border)] font-display text-sm font-medium text-[var(--color-text)]"
        >
          {initial}
        </span>
        <ChevronDown
          aria-hidden
          className="size-4 text-[var(--color-muted)] transition-transform duration-[var(--duration-fast)] group-data-[popup-open]:rotate-180"
        />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={8} align="end" className="z-50">
          <Menu.Popup
            className="flex w-60 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl outline-none data-[open]:animate-[userMenuIn_180ms_ease-out] data-[closed]:animate-[userMenuOut_120ms_ease-in]"
            style={{
              // biome-ignore lint/suspicious/noExplicitAny: CSS custom property
              ["--tw-shadow-color" as any]: "rgb(0 0 0 / 0.4)",
            }}
          >
            <div className="flex flex-col gap-0.5 border-b border-[var(--color-border)] px-4 py-3">
              {name ? (
                <span className="text-sm font-medium text-[var(--color-text)]">{name}</span>
              ) : null}
              <span className="truncate text-[12px] text-[var(--color-muted)]">{email}</span>
            </div>
            <MenuItemLink href="#" muted>
              Profile <Soon />
            </MenuItemLink>
            <MenuItemLink href="#" muted>
              Transactions <Soon />
            </MenuItemLink>
            <div className="border-t border-[var(--color-border)]/60" />
            <form action={signOutAction}>
              <Menu.Item
                render={(props) => (
                  <button
                    {...props}
                    type="submit"
                    className="flex w-full items-center px-4 py-2.5 text-left text-sm font-medium text-[var(--color-text)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-bg-deep)] focus:bg-[var(--color-bg-deep)] focus:outline-none"
                  />
                )}
              >
                Sign out
              </Menu.Item>
            </form>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
      <style>{`
        @keyframes userMenuIn { from { opacity: 0; transform: translateY(-4px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes userMenuOut { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(-4px) scale(0.98); } }
      `}</style>
    </Menu.Root>
  );
}

function MenuItemLink({
  href,
  children,
  muted,
}: {
  href: string;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <Menu.Item
      render={(props) => (
        <a
          {...props}
          href={href}
          aria-disabled={muted ? "true" : undefined}
          tabIndex={muted ? -1 : 0}
          onClick={muted ? (e) => e.preventDefault() : undefined}
          className="flex items-center justify-between px-4 py-2.5 text-sm text-[var(--color-muted)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-bg-deep)] focus:bg-[var(--color-bg-deep)] focus:outline-none aria-disabled:cursor-not-allowed"
        />
      )}
    >
      {children}
    </Menu.Item>
  );
}

function Soon() {
  return (
    <span className="rounded-[var(--radius-chip)] border border-[var(--color-border)] px-1.5 py-0.5 font-display text-[9px] font-medium tracking-wide text-[var(--color-muted)]">
      soon
    </span>
  );
}
