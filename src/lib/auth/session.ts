import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  balance: bigint;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const row = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, email: true, name: true, balance: true },
  });
  return row ?? null;
}

export async function requireSessionUser(opts: { redirectTo?: string } = {}): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(opts.redirectTo ?? "/signin?callbackUrl=/casino");
  return user;
}
