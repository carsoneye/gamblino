import { and, eq, sql } from "drizzle-orm";
import { type DbTx, db } from "@/db";
import { transactions, users, wallets } from "@/db/schema";
import { writeAccountEvent } from "@/lib/events/write";
import { logger } from "@/lib/logger";
import type { CurrencyKind } from "./currencies";
import { fireNewlyEffectiveLimitWithin, getActiveLimitWithin, LimitBreachError } from "./limits";

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

  // Per-operation limit enforcement. T5 scope: wager (bet_stake debits) +
  // deposit (daily_grant credits today; post-license, real-deposit reasons
  // will layer in the same place). Loss-limit enforcement needs rolling-
  // window aggregation over the ledger — deferred to T5.5. Session-time
  // limit needs a session-start timestamp wired into auth/WS — shipped with
  // T9. See ADR-0016.
  if (input.reason === "bet_stake" && input.delta < 0n) {
    await fireNewlyEffectiveLimitWithin(tx, input.userId, currency, "wager");

    const activeWager = await getActiveLimitWithin(tx, input.userId, currency, "wager");
    if (activeWager !== null) {
      const stake = -input.delta;
      if (stake > activeWager.amount) {
        throw new LimitBreachError(
          input.userId,
          currency,
          "wager",
          activeWager.id,
          activeWager.amount,
          stake,
        );
      }
    }
  }

  if (input.reason === "daily_grant" && input.delta > 0n) {
    await fireNewlyEffectiveLimitWithin(tx, input.userId, currency, "deposit");

    const activeDeposit = await getActiveLimitWithin(tx, input.userId, currency, "deposit");
    if (activeDeposit !== null) {
      if (input.delta > activeDeposit.amount) {
        throw new LimitBreachError(
          input.userId,
          currency,
          "deposit",
          activeDeposit.id,
          activeDeposit.amount,
          input.delta,
        );
      }
    }
  }

  // TODO(T5.5): loss-limit enforcement — sum net-negative movements over a
  // rolling window (24h / 7d / 30d) and reject if this op would push the
  // aggregate past the active loss limit. Needs period indexing work.

  // TODO(T9): session-time-limit enforcement — the auth/WS layer will
  // disconnect a session that exceeds the active session_length_min limit.
  // Not a transact-time concern.

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
  try {
    return await db.transaction((tx) => transactWithin(tx, input));
  } catch (err) {
    if (err instanceof LimitBreachError) {
      // Main tx rolled back with the breach throw. Persist the rejection as
      // an audit event in a separate tx so the breach signal survives for
      // Phase 11 farming detection.
      try {
        await db.transaction((wtx) =>
          writeAccountEvent(wtx, err.userId, {
            event_kind: "limit_breach_rejected",
            payload: {
              limitId: err.limitId,
              kind: err.kind,
              currencyKind: err.currencyKind,
              limitAmount: err.limitAmount.toString(),
              attemptedAmount: err.attemptedAmount.toString(),
              reason: input.reason,
            },
          }),
        );
      } catch (auditErr) {
        logger.error({ err: auditErr, userId: err.userId }, "transact.limitBreachEventFailed");
      }
    }
    throw err;
  }
}
