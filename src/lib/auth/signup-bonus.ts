import { type DbTx, db } from "@/db";
import { MICRO_PER_CREDIT } from "@/lib/money";
import { transactWithin } from "@/lib/wallet/transact";

export const SIGNUP_BONUS_CREDITS = 10_000n;
export const SIGNUP_BONUS_MICRO = SIGNUP_BONUS_CREDITS * MICRO_PER_CREDIT;

const idemKeyFor = (userId: string) => `signup:${userId}`;

export async function grantSignupBonusWithin(tx: DbTx, userId: string): Promise<void> {
  await transactWithin(tx, {
    userId,
    delta: SIGNUP_BONUS_MICRO,
    reason: "signup_bonus",
    idempotencyKey: idemKeyFor(userId),
  });
}

export async function grantSignupBonus(userId: string): Promise<void> {
  await db.transaction((tx) => grantSignupBonusWithin(tx, userId));
}
