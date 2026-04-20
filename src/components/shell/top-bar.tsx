import Link from "next/link";
import { signOut } from "@/auth";
import { Sidebar } from "@/components/shell/sidebar";
import { SidebarDrawer } from "@/components/shell/sidebar-drawer";
import { UserMenu } from "@/components/shell/user-menu";
import { formatAmount } from "@/lib/wallet/currencies";

type User = { balance: bigint; email: string; name: string | null };

export function TopBar({ user }: { user?: User }) {
  return (
    <div
      data-testid="top-bar"
      className="col-start-2 flex h-16 items-center gap-3 border-b border-[var(--color-border)]/60 bg-[var(--color-bg-deep)] px-4 sm:px-6 lg:px-8"
    >
      <div className="md:hidden">
        <SidebarDrawer>
          <Sidebar variant="drawer" />
        </SidebarDrawer>
      </div>

      {user ? <Authed user={user} /> : <GuestCta />}
    </div>
  );
}

function Authed({ user }: { user: User }) {
  const { balance, email, name } = user;
  const initial = (name ?? email)[0]?.toUpperCase() ?? "G";
  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }
  return (
    <div className="ml-auto flex items-center gap-5">
      <div data-testid="balance-card" className="flex items-baseline gap-2 leading-none">
        <span className="text-[11px] font-medium text-[var(--color-muted)]">credits</span>
        <span
          data-testid="balance"
          className="numeric text-xl font-semibold tracking-tight text-[var(--color-text)]"
        >
          {formatAmount(balance, "credit")}
        </span>
      </div>

      <div className="hidden h-6 w-px bg-[var(--color-border)] sm:block" />

      <UserMenu initial={initial} name={name} email={email} signOutAction={handleSignOut} />
    </div>
  );
}

function GuestCta() {
  return (
    <div className="ml-auto flex items-center gap-1 text-sm">
      <Link
        href="/signin"
        className="rounded-[var(--radius-sm)] px-4 py-2 font-medium text-[var(--color-muted)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      >
        Sign in
      </Link>
      <Link
        href="/signup"
        className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-bg-deep)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-accent-hi)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-deep)]"
      >
        Take 10,000 credits
      </Link>
    </div>
  );
}
