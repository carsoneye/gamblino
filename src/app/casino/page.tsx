import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { formatCredits } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Casino · gamblino" };

export default async function CasinoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const row = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { id: true, email: true, name: true, balance: true },
  });
  if (!row) redirect("/signin");

  return (
    <main className="flex flex-1 flex-col gap-10 px-8 py-16">
      <header className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wider text-[var(--color-muted)]">Casino</p>
          <h1 className="font-display text-5xl font-semibold tracking-tight">
            Welcome{row.name ? `, ${row.name}` : ""}
          </h1>
          <p className="text-[var(--color-muted)]">Signed in as {row.email}</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="rounded-[10px] border border-[var(--color-border)] px-4 py-2 text-sm"
          >
            Sign out
          </button>
        </form>
      </header>

      <section
        data-testid="balance-card"
        className="rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8"
      >
        <p className="text-sm uppercase tracking-wider text-[var(--color-muted)]">Balance</p>
        <p
          data-testid="balance"
          className="font-mono text-6xl font-semibold tabular-nums text-[var(--color-accent-hi)]"
        >
          {formatCredits(row.balance)}
        </p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">credits</p>
      </section>
    </main>
  );
}
