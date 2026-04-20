import { beforeAll, describe, expect, it } from "bun:test";
import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { client, db } from "@/db";
import { transactions, users } from "@/db/schema";
import { CURRENCY_UNITS } from "./currencies";
import { InsufficientBalanceError, transact, transactWithin, UserNotFoundError } from "./transact";

const c = (n: bigint) => n * CURRENCY_UNITS.credit;

async function seedUser(balance = 0n): Promise<string> {
  const email = `wallet+${Date.now()}-${randomUUID()}@gamblino.test`;
  const [row] = await db.insert(users).values({ email, balance }).returning({ id: users.id });
  return row.id;
}

async function txCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(transactions)
    .where(eq(transactions.userId, userId));
  return row.n;
}

async function balance(userId: string): Promise<bigint> {
  const [row] = await db.select({ b: users.balance }).from(users).where(eq(users.id, userId));
  return row.b;
}

beforeAll(async () => {
  await client`select 1`;
});

describe("transact — credit", () => {
  it("appends a tx and increases balance", async () => {
    const userId = await seedUser(0n);

    const res = await transact({ userId, delta: c(50n), reason: "signup_bonus" });

    expect(res.deduped).toBe(false);
    expect(res.balanceAfter).toBe(c(50n));
    expect(await balance(userId)).toBe(c(50n));
    expect(await txCount(userId)).toBe(1);
  });

  it("supports betId and metadata", async () => {
    const userId = await seedUser(c(10n));

    const res = await transact({
      userId,
      delta: c(5n),
      reason: "bet_payout",
      metadata: { note: "hello" },
    });

    const [row] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, res.transactionId));
    expect(row.reason).toBe("bet_payout");
    expect(row.metadata).toEqual({ note: "hello" });
    expect(row.balanceAfter).toBe(c(15n));
  });
});

describe("transact — debit", () => {
  it("decreases balance when sufficient", async () => {
    const userId = await seedUser(c(100n));

    const res = await transact({ userId, delta: -c(30n), reason: "bet_stake" });

    expect(res.balanceAfter).toBe(c(70n));
    expect(await balance(userId)).toBe(c(70n));
  });

  it("throws InsufficientBalanceError when overdrawing, leaves balance untouched", async () => {
    const userId = await seedUser(c(10n));

    await expect(transact({ userId, delta: -c(20n), reason: "bet_stake" })).rejects.toBeInstanceOf(
      InsufficientBalanceError,
    );

    expect(await balance(userId)).toBe(c(10n));
    expect(await txCount(userId)).toBe(0);
  });

  it("allows debit that exactly zeroes the balance", async () => {
    const userId = await seedUser(c(7n));

    const res = await transact({ userId, delta: -c(7n), reason: "bet_stake" });

    expect(res.balanceAfter).toBe(0n);
    expect(await balance(userId)).toBe(0n);
  });
});

describe("transact — user lookup", () => {
  it("throws UserNotFoundError for unknown userId", async () => {
    const ghost = randomUUID();

    await expect(
      transact({ userId: ghost, delta: c(1n), reason: "adjustment" }),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });
});

describe("transact — idempotency", () => {
  it("returns the first result on duplicate key without double-mutating", async () => {
    const userId = await seedUser(0n);
    const key = `cli_test_${randomUUID()}`;

    const first = await transact({
      userId,
      delta: c(100n),
      reason: "signup_bonus",
      idempotencyKey: key,
    });
    const second = await transact({
      userId,
      delta: c(100n),
      reason: "signup_bonus",
      idempotencyKey: key,
    });

    expect(first.deduped).toBe(false);
    expect(second.deduped).toBe(true);
    expect(second.transactionId).toBe(first.transactionId);
    expect(second.balanceAfter).toBe(first.balanceAfter);
    expect(await balance(userId)).toBe(c(100n));
    expect(await txCount(userId)).toBe(1);
  });

  it("treats null keys as distinct (non-deduping)", async () => {
    const userId = await seedUser(0n);

    await transact({ userId, delta: c(5n), reason: "adjustment" });
    await transact({ userId, delta: c(5n), reason: "adjustment" });

    expect(await balance(userId)).toBe(c(10n));
    expect(await txCount(userId)).toBe(2);
  });
});

describe("transact — concurrency", () => {
  it("serializes concurrent debits via row lock; exactly the fitting ones succeed", async () => {
    const userId = await seedUser(c(100n));
    const attempts = 10;
    const stake = c(50n);

    const results = await Promise.allSettled(
      Array.from({ length: attempts }, () =>
        transact({ userId, delta: -stake, reason: "bet_stake" }),
      ),
    );

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled).toHaveLength(2);
    expect(rejected).toHaveLength(8);
    for (const r of rejected) {
      expect((r as PromiseRejectedResult).reason).toBeInstanceOf(InsufficientBalanceError);
    }

    expect(await balance(userId)).toBe(0n);
    expect(await txCount(userId)).toBe(2);
  });
});

function errorChain(e: unknown): string {
  const parts: string[] = [];
  let cur: unknown = e;
  while (cur instanceof Error) {
    parts.push(cur.message);
    cur = (cur as { cause?: unknown }).cause;
  }
  return parts.join(" :: ");
}

describe("transact — append-only ledger", () => {
  it("blocks UPDATE on transactions at the DB level", async () => {
    const userId = await seedUser(0n);
    const { transactionId } = await transact({
      userId,
      delta: c(1n),
      reason: "adjustment",
    });

    let caught: unknown;
    try {
      await db.update(transactions).set({ delta: 0n }).where(eq(transactions.id, transactionId));
    } catch (e) {
      caught = e;
    }
    expect(errorChain(caught)).toMatch(/append-only/);
  });

  it("blocks DELETE on transactions at the DB level", async () => {
    const userId = await seedUser(0n);
    const { transactionId } = await transact({
      userId,
      delta: c(1n),
      reason: "adjustment",
    });

    let caught: unknown;
    try {
      await db.delete(transactions).where(eq(transactions.id, transactionId));
    } catch (e) {
      caught = e;
    }
    expect(errorChain(caught)).toMatch(/append-only/);
  });
});

describe("transactWithin — composition", () => {
  it("runs inside a caller-provided transaction", async () => {
    const userId = await seedUser(c(10n));

    await db.transaction(async (tx) => {
      await transactWithin(tx, { userId, delta: -c(3n), reason: "bet_stake" });
      await transactWithin(tx, {
        userId,
        delta: c(7n),
        reason: "bet_payout",
        metadata: { multiplier: 2 },
      });
    });

    expect(await balance(userId)).toBe(c(14n));
    expect(await txCount(userId)).toBe(2);
  });

  it("rolls the entire tx back on error — nothing partial is persisted", async () => {
    const userId = await seedUser(c(10n));

    await expect(
      db.transaction(async (tx) => {
        await transactWithin(tx, { userId, delta: -c(3n), reason: "bet_stake" });
        await transactWithin(tx, { userId, delta: -c(100n), reason: "bet_stake" });
      }),
    ).rejects.toBeInstanceOf(InsufficientBalanceError);

    expect(await balance(userId)).toBe(c(10n));
    expect(
      await db
        .select({ n: sql<number>`count(*)::int` })
        .from(transactions)
        .where(and(eq(transactions.userId, userId)))
        .then((r) => r[0].n),
    ).toBe(0);
  });
});
