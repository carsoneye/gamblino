import { and, eq, sql } from "drizzle-orm";
import { type DbTx, db } from "@/db";
import { transactions, users, wallets } from "@/db/schema";
import type { CurrencyKind } from "./currencies";

export type TxReason = "signup_bonus" | "daily_grant" | "bet_stake" | "bet_payout" | "adjustment";

export interface TransactInput {
  userId: string;
  delta: bigint;
  reason: TxReason;
  currencyKind?: CurrencyKind;
  idempotencyKey?: string;
  betId?: string;
  metadata?: Record<string, unknown>;
}

export interface TransactResult {
  balanceAfter: bigint;
  transactionId: string;
  deduped: boolean;
  currencyKind: CurrencyKind;
}

export class InsufficientBalanceError extends Error {
  readonly code = "INSUFFICIENT_BALANCE";
  constructor(
    readonly userId: string,
    readonly currencyKind: CurrencyKind,
    readonly balance: bigint,
    readonly delta: bigint,
  ) {
    super(`wallet: user ${userId} ${currencyKind} balance ${balance} cannot absorb delta ${delta}`);
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
  await tx.execute(sql`SET LOCAL statement_timeout = '5s'`);

  const currency: CurrencyKind = input.currencyKind ?? "credit";

  const lockWallet = async () =>
    tx
      .select({ balance: wallets.balance })
      .from(wallets)
      .where(and(eq(wallets.userId, input.userId), eq(wallets.currencyKind, currency)))
      .for("update");

  let [wallet] = await lockWallet();

  if (!wallet) {
    const [user] = await tx.select({ id: users.id }).from(users).where(eq(users.id, input.userId));
    if (!user) throw new UserNotFoundError(input.userId);

    await tx
      .insert(wallets)
      .values({ userId: input.userId, currencyKind: currency, balance: 0n })
      .onConflictDoNothing();

    [wallet] = await lockWallet();
    if (!wallet) {
      throw new Error(
        `wallet: provision race for ${input.userId}/${currency} — row missing after insert (see ADR-0012)`,
      );
    }
  }

  if (input.idempotencyKey) {
    const key = input.idempotencyKey;
    const existing = await tx.query.transactions.findFirst({
      where: (t, { and: a, eq: e }) => a(e(t.userId, input.userId), e(t.idempotencyKey, key)),
      columns: { id: true, balanceAfter: true, currencyKind: true },
    });
    if (existing) {
      return {
        balanceAfter: existing.balanceAfter,
        transactionId: existing.id,
        deduped: true,
        currencyKind: existing.currencyKind,
      };
    }
  }

  const balanceAfter = wallet.balance + input.delta;
  if (balanceAfter < 0n) {
    throw new InsufficientBalanceError(input.userId, currency, wallet.balance, input.delta);
  }

  await tx
    .update(wallets)
    .set({ balance: sql`${wallets.balance} + ${input.delta}`, updatedAt: sql`now()` })
    .where(and(eq(wallets.userId, input.userId), eq(wallets.currencyKind, currency)));

  const [row] = await tx
    .insert(transactions)
    .values({
      userId: input.userId,
      currencyKind: currency,
      delta: input.delta,
      balanceAfter,
      reason: input.reason,
      betId: input.betId,
      idempotencyKey: input.idempotencyKey,
      metadata: input.metadata,
    })
    .returning({ id: transactions.id });

  return { balanceAfter, transactionId: row.id, deduped: false, currencyKind: currency };
}

export async function transact(input: TransactInput): Promise<TransactResult> {
  return db.transaction((tx) => transactWithin(tx, input));
}
