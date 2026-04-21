import { and, desc, eq, lte } from "drizzle-orm";
import { type DbTx, db } from "@/db";
import { walletLimits } from "@/db/schema";
import { writeAccountEvent } from "@/lib/events/write";
import type { CurrencyKind } from "./currencies";

export type LimitKind = "deposit" | "loss" | "session_length_min" | "wager";

export const LIMIT_LOWER_DELAY_HOURS = 24;
const LIMIT_LOWER_DELAY_MS = LIMIT_LOWER_DELAY_HOURS * 60 * 60 * 1000;

const PG_UNIQUE_VIOLATION = "23505";

function isUniqueViolation(err: unknown): boolean {
  let cur: unknown = err;
  while (cur !== null && typeof cur === "object") {
    if ("code" in cur && (cur as { code: unknown }).code === PG_UNIQUE_VIOLATION) return true;
    cur = (cur as { cause?: unknown }).cause;
  }
  return false;
}

export interface ActiveLimit {
  id: string;
  amount: bigint;
  setAt: Date;
  effectiveAt: Date;
}

export class LimitBreachError extends Error {
  readonly code = "LIMIT_BREACH";
  constructor(
    readonly userId: string,
    readonly currencyKind: CurrencyKind,
    readonly kind: LimitKind,
    readonly limitId: string,
    readonly limitAmount: bigint,
    readonly attemptedAmount: bigint,
  ) {
    super(
      `wallet: ${kind} limit ${limitAmount} breached by attempted ${attemptedAmount} for user ${userId}/${currencyKind}`,
    );
    this.name = "LimitBreachError";
  }
}

export class LimitUnchangedError extends Error {
  readonly code = "LIMIT_UNCHANGED";
  constructor(
    readonly userId: string,
    readonly currencyKind: CurrencyKind,
    readonly kind: LimitKind,
    readonly amount: bigint,
  ) {
    super(`wallet: ${kind} limit already at ${amount} for user ${userId}/${currencyKind}`);
    this.name = "LimitUnchangedError";
  }
}

export async function getActiveLimitWithin(
  tx: DbTx,
  userId: string,
  currencyKindValue: CurrencyKind,
  kind: LimitKind,
  at: Date = new Date(),
): Promise<ActiveLimit | null> {
  const [row] = await tx
    .select({
      id: walletLimits.id,
      amount: walletLimits.amount,
      setAt: walletLimits.setAt,
      effectiveAt: walletLimits.effectiveAt,
    })
    .from(walletLimits)
    .where(
      and(
        eq(walletLimits.userId, userId),
        eq(walletLimits.currencyKind, currencyKindValue),
        eq(walletLimits.kind, kind),
        lte(walletLimits.effectiveAt, at),
      ),
    )
    .orderBy(desc(walletLimits.effectiveAt))
    .limit(1);
  return row ?? null;
}

export async function getActiveLimit(
  userId: string,
  currencyKindValue: CurrencyKind,
  kind: LimitKind,
  at: Date = new Date(),
): Promise<ActiveLimit | null> {
  return db.transaction((tx) => getActiveLimitWithin(tx, userId, currencyKindValue, kind, at));
}

export interface SetWalletLimitInput {
  userId: string;
  currencyKind: CurrencyKind;
  kind: LimitKind;
  amount: bigint;
}

export interface SetWalletLimitResult {
  id: string;
  amount: bigint;
  setAt: Date;
  effectiveAt: Date;
  delayed: boolean;
}

/**
 * Insert a new wallet_limits row with regulatory asymmetry on effective_at:
 *
 * - `amount > active.amount` (or no active limit) → effective_at = now(), delayed=false ("raising")
 * - `amount < active.amount`                      → effective_at = now() + 24h, delayed=true ("lowering")
 * - `amount === active.amount`                    → throws `LimitUnchangedError` (no-op)
 *
 * Writes a typed `limit_set` account event in the same transaction so the
 * audit trail composes with the limit row. See ADR-0016 for the asymmetry
 * rationale.
 */
export async function setWalletLimitWithin(
  tx: DbTx,
  input: SetWalletLimitInput,
): Promise<SetWalletLimitResult> {
  if (input.amount < 0n) {
    throw new Error(`wallet: limit amount must be non-negative, got ${input.amount}`);
  }

  const now = new Date();
  const active = await getActiveLimitWithin(tx, input.userId, input.currencyKind, input.kind, now);

  let effectiveAt: Date;
  let delayed: boolean;
  if (active === null || input.amount > active.amount) {
    effectiveAt = now;
    delayed = false;
  } else if (input.amount < active.amount) {
    effectiveAt = new Date(now.getTime() + LIMIT_LOWER_DELAY_MS);
    delayed = true;
  } else {
    throw new LimitUnchangedError(input.userId, input.currencyKind, input.kind, input.amount);
  }

  const [row] = await tx
    .insert(walletLimits)
    .values({
      userId: input.userId,
      currencyKind: input.currencyKind,
      kind: input.kind,
      amount: input.amount,
      setAt: now,
      effectiveAt,
    })
    .returning({
      id: walletLimits.id,
      amount: walletLimits.amount,
      setAt: walletLimits.setAt,
      effectiveAt: walletLimits.effectiveAt,
    });

  await writeAccountEvent(tx, input.userId, {
    event_kind: "limit_set",
    payload: {
      limitId: row.id,
      kind: input.kind,
      currencyKind: input.currencyKind,
      amount: input.amount.toString(),
      effectiveAt: effectiveAt.toISOString(),
      delayed,
    },
  });

  return {
    id: row.id,
    amount: row.amount,
    setAt: row.setAt,
    effectiveAt: row.effectiveAt,
    delayed,
  };
}

export async function setWalletLimit(input: SetWalletLimitInput): Promise<SetWalletLimitResult> {
  return db.transaction((tx) => setWalletLimitWithin(tx, input));
}

/**
 * Fire a `limit_effective` event for the currently-active limit if one has
 * not already been fired for that limit row. Race-safe via the
 * `account_events_limit_effective_once` unique partial index: concurrent
 * callers try to insert the same event, one commits, the rest catch the
 * unique-violation and return quietly.
 *
 * The insert runs inside a nested transaction (SAVEPOINT) so a unique-
 * violation rolls back only the event write, not the caller's outer
 * transaction — the caller can keep composing wallet work after this call.
 */
export async function fireNewlyEffectiveLimitWithin(
  tx: DbTx,
  userId: string,
  currencyKindValue: CurrencyKind,
  kind: LimitKind,
  at: Date = new Date(),
): Promise<void> {
  const active = await getActiveLimitWithin(tx, userId, currencyKindValue, kind, at);
  if (!active) return;

  try {
    await tx.transaction(async (sp) => {
      await writeAccountEvent(sp, userId, {
        event_kind: "limit_effective",
        payload: {
          limitId: active.id,
          kind,
          currencyKind: currencyKindValue,
          amount: active.amount.toString(),
        },
      });
    });
  } catch (err) {
    if (isUniqueViolation(err)) return;
    throw err;
  }
}
