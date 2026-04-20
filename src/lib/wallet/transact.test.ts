import { beforeAll, describe, expect, it } from "bun:test";
import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { client, db } from "@/db";
import { transactions, users, wallets } from "@/db/schema";
import { CURRENCY_UNITS, type CurrencyKind } from "./currencies";
import { InsufficientBalanceError, transact, transactWithin, UserNotFoundError } from "./transact";

const c = (n: bigint) => n * CURRENCY_UNITS.credit;

async function seedUser(balance = 0n, currency: CurrencyKind = "credit"): Promise<string> {
  const email = `wallet+${Date.now()}-${randomUUID()}@gamblino.test`;
  const [row] = await db.insert(users).values({ email }).returning({ id: users.id });
  await db
    .insert(wallets)
    .values({ userId: row.id, currencyKind: currency, balance })
    .onConflictDoUpdate({
      target: [wallets.userId, wallets.currencyKind],
      set: { balance },
    });
  return row.id;
}

async function txCount(userId: string, currency: CurrencyKind = "credit"): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.currencyKind, currency)));
  return row.n;
}

async function balance(userId: string, currency: CurrencyKind = "credit"): Promise<bigint> {
  const [row] = await db
    .select({ b: wallets.balance })
    .from(wallets)
    .where(and(eq(wallets.userId, userId), eq(wallets.currencyKind, currency)));
  return row?.b ?? 0n;
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
    expect(res.currencyKind).toBe("credit");
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
    expect(row.currencyKind).toBe("credit");
  });

  it("defaults currencyKind to 'credit' when omitted", async () => {
    const userId = await seedUser(0n);
    const res = await transact({ userId, delta: c(1n), reason: "adjustment" });
    const [row] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, res.transactionId));
    expect(row.currencyKind).toBe("credit");
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

  it("auto-provisions a wallet row for a new currency on first tx", async () => {
    const userId = await seedUser(c(10n), "credit");

    const res = await transact({
      userId,
      delta: 500n,
      reason: "adjustment",
      currencyKind: "usd",
    });

    expect(res.balanceAfter).toBe(500n);
    expect(res.currencyKind).toBe("usd");
    expect(await balance(userId, "usd")).toBe(500n);
    expect(await balance(userId, "credit")).toBe(c(10n));
  });
});

describe("transact — idempotency", () => {
  it("returns the first result on duplicate cli_ key without double-mutating", async () => {
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

  it("dedupes srv_ keys the same as cli_ keys", async () => {
    const userId = await seedUser(0n);
    const key = `srv_test_${randomUUID()}`;

    const first = await transact({
      userId,
      delta: c(10n),
      reason: "signup_bonus",
      idempotencyKey: key,
    });
    const second = await transact({
      userId,
      delta: c(10n),
      reason: "signup_bonus",
      idempotencyKey: key,
    });

    expect(first.deduped).toBe(false);
    expect(second.deduped).toBe(true);
    expect(await balance(userId)).toBe(c(10n));
    expect(await txCount(userId)).toBe(1);
  });

  it("rejects unprefixed idempotency keys at the DB CHECK", async () => {
    const userId = await seedUser(0n);
    const bad = `nobadprefix_${randomUUID()}`;

    let caught: unknown;
    try {
      await transact({ userId, delta: c(1n), reason: "adjustment", idempotencyKey: bad });
    } catch (e) {
      caught = e;
    }
    expect(errorChain(caught)).toMatch(/tx_idem_prefix|check constraint/i);

    expect(await txCount(userId)).toBe(0);
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
  it("serializes concurrent debits via wallet-row lock; exactly the fitting ones succeed", async () => {
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

describe("transact — concurrent first-use auto-provision", () => {
  it("does not surface spurious UserNotFoundError when many concurrent transacts hit a wallet-less user", async () => {
    const email = `race+${Date.now()}-${randomUUID()}@gamblino.test`;
    const [row] = await db.insert(users).values({ email }).returning({ id: users.id });
    const userId = row.id;

    const N = 20;
    const ops = [
      ...Array.from({ length: N / 2 }, () =>
        transact({ userId, delta: c(10n), reason: "adjustment" }),
      ),
      ...Array.from({ length: N / 2 }, () =>
        transact({ userId, delta: -c(1_000n), reason: "bet_stake" }),
      ),
    ];

    const results = await Promise.allSettled(ops);

    const rejected = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
    for (const r of rejected) {
      expect(r.reason).not.toBeInstanceOf(UserNotFoundError);
      expect(r.reason).toBeInstanceOf(InsufficientBalanceError);
    }

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    expect(fulfilled).toHaveLength(N / 2);
    expect(rejected).toHaveLength(N / 2);

    expect(await balance(userId)).toBe(c(BigInt(N / 2) * 10n));
    expect(await txCount(userId)).toBe(N / 2);
  });
});

describe("transact — cross-currency isolation", () => {
  it("debiting the credit wallet does not touch the usd wallet of the same user", async () => {
    const userId = await seedUser(c(100n), "credit");
    await db.insert(wallets).values({ userId, currencyKind: "usd", balance: 500n });

    await transact({ userId, delta: -c(30n), reason: "bet_stake" });

    expect(await balance(userId, "credit")).toBe(c(70n));
    expect(await balance(userId, "usd")).toBe(500n);
  });

  it("parallel transacts on different currencies of the same user do not serialize through one lock", async () => {
    const userId = await seedUser(c(50n), "credit");
    await db.insert(wallets).values({ userId, currencyKind: "usd", balance: 1_000n });

    const [creditRes, usdRes] = await Promise.all([
      transact({ userId, delta: c(1n), reason: "adjustment", currencyKind: "credit" }),
      transact({ userId, delta: 250n, reason: "adjustment", currencyKind: "usd" }),
    ]);

    expect(creditRes.balanceAfter).toBe(c(51n));
    expect(usdRes.balanceAfter).toBe(1_250n);
    expect(await balance(userId, "credit")).toBe(c(51n));
    expect(await balance(userId, "usd")).toBe(1_250n);
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
    const { transactionId } = await transact({ userId, delta: c(1n), reason: "adjustment" });

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
    const { transactionId } = await transact({ userId, delta: c(1n), reason: "adjustment" });

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
    expect(await txCount(userId)).toBe(0);
  });
});
