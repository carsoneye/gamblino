import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/shell/app-shell";
import { db } from "@/db";
import { users } from "@/db/schema";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/casino");

  const row = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { id: true, email: true, name: true, balance: true },
  });
  if (!row) redirect("/signin");

  return (
    <AppShell user={{ balance: row.balance, email: row.email, name: row.name }}>
      {children}
    </AppShell>
  );
}
