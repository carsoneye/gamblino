import { eq, sql } from "drizzle-orm";
import { type DbTx, db } from "@/db";
import { transactions, users } from "@/db/schema";

export type TxReason = "signup_bonus" | "bet_stake" | "bet_payout" | "adjustment";

export interface TransactInput {
  userId: string;
  delta: bigint;
  reason: TxReason;
  idempotencyKey?: string;
  betId?: string;
  metadata?: Record<string, unknown>;
}

export interface TransactResult {
  balanceAfter: bigint;
  transactionId: string;
  deduped: boolean;
}

export class InsufficientBalanceError extends Error {
  readonly code = "INSUFFICIENT_BALANCE";
  constructor(
    readonly userId: string,
    readonly balance: bigint,
    readonly delta: bigint,
  ) {
    super(`wallet: user ${userId} balance ${balance} cannot absorb delta ${delta}`);
    this.name = "InsufficientBalanceError";
  }
}

export class UserNotFoundError extends Error {
  readonly code = "USER_NOT_FOUND";
  constructor(readonly userId: string) {
    super(`wallet: user ${userId} not found`);
    this.name = "UserNotFoundError";
  }
}

export async function transactWithin(tx: DbTx, input: TransactInput): Promise<TransactResult> {
  const [locked] = await tx
    .select({ id: users.id, balance: users.balance })
    .from(users)
    .where(eq(users.id, input.userId))
    .for("update");
  if (!locked) throw new UserNotFoundError(input.userId);

  if (input.idempotencyKey) {
    const key = input.idempotencyKey;
    const existing = await tx.query.transactions.findFirst({
      where: (t, { and, eq }) => and(eq(t.userId, input.userId), eq(t.idempotencyKey, key)),
      columns: { id: true, balanceAfter: true },
    });
    if (existing) {
      return { balanceAfter: existing.balanceAfter, transactionId: existing.id, deduped: true };
    }
  }

  const balanceAfter = locked.balance + input.delta;
  if (balanceAfter < 0n) {
    throw new InsufficientBalanceError(input.userId, locked.balance, input.delta);
  }

  await tx
    .update(users)
    .set({ balance: sql`${users.balance} + ${input.delta}` })
    .where(eq(users.id, input.userId));

  const [row] = await tx
    .insert(transactions)
    .values({
      userId: input.userId,
      delta: input.delta,
      balanceAfter,
      reason: input.reason,
      betId: input.betId,
      idempotencyKey: input.idempotencyKey,
      metadata: input.metadata,
    })
    .returning({ id: transactions.id });

  return { balanceAfter, transactionId: row.id, deduped: false };
}

export async function transact(input: TransactInput): Promise<TransactResult> {
  return db.transaction((tx) => transactWithin(tx, input));
}
