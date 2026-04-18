import { eq, sql } from "drizzle-orm";
import { type DbTx, db } from "@/db";
import { transactions, users } from "@/db/schema";
import { MICRO_PER_CREDIT } from "@/lib/money";

export const SIGNUP_BONUS_CREDITS = 10_000n;
export const SIGNUP_BONUS_MICRO = SIGNUP_BONUS_CREDITS * MICRO_PER_CREDIT;

const idemKeyFor = (userId: string) => `signup:${userId}`;

export async function grantSignupBonusWithin(tx: DbTx, userId: string): Promise<void> {
  const [locked] = await tx
    .select({ id: users.id, balance: users.balance })
    .from(users)
    .where(eq(users.id, userId))
    .for("update");
  if (!locked) throw new Error(`grantSignupBonus: user ${userId} not found`);

  const existing = await tx.query.transactions.findFirst({
    where: (t, { and, eq }) => and(eq(t.userId, userId), eq(t.idempotencyKey, idemKeyFor(userId))),
    columns: { id: true },
  });
  if (existing) return;

  const balanceAfter = locked.balance + SIGNUP_BONUS_MICRO;

  await tx
    .update(users)
    .set({ balance: sql`${users.balance} + ${SIGNUP_BONUS_MICRO}` })
    .where(eq(users.id, userId));

  await tx.insert(transactions).values({
    userId,
    delta: SIGNUP_BONUS_MICRO,
    balanceAfter,
    reason: "signup_bonus",
    idempotencyKey: idemKeyFor(userId),
  });
}

export async function grantSignupBonus(userId: string): Promise<void> {
  await db.transaction((tx) => grantSignupBonusWithin(tx, userId));
}
