import { beforeAll, describe, expect, it } from "bun:test";
import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import fc from "fast-check";
import { client, db } from "@/db";
import { transactions, users, wallets } from "@/db/schema";
import { CURRENCY_UNITS, type CurrencyKind } from "./currencies";
import { InsufficientBalanceError, transact } from "./transact";

const c = (n: bigint) => n * CURRENCY_UNITS.credit;

async function seedUser(balance = 0n, currency: CurrencyKind = "credit"): Promise<string> {
  const email = `props+${Date.now()}-${randomUUID()}@gamblino.test`;
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

async function balance(userId: string, currency: CurrencyKind = "credit"): Promise<bigint> {
  const [row] = await db
    .select({ b: wallets.balance })
    .from(wallets)
    .where(and(eq(wallets.userId, userId), eq(wallets.currencyKind, currency)));
  return row?.b ?? 0n;
}

async function txCount(userId: string, currency: CurrencyKind = "credit"): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.currencyKind, currency)));
  return row.n;
}

async function ledgerSum(userId: string, currency: CurrencyKind = "credit"): Promise<bigint> {
  const [row] = await db
    .select({ sum: sql<string>`COALESCE(SUM(${transactions.delta}), 0)::text` })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.currencyKind, currency)));
  return BigInt(row.sum);
}

beforeAll(async () => {
  await client`select 1`;
});

describe("transact — fast-check invariants", () => {
  it("balance identity under concurrent randomized transactions", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.bigInt({ min: -c(50n), max: c(50n) }), { minLength: 3, maxLength: 10 }),
        async (deltas) => {
          const starting = c(500n);
          const userId = await seedUser(starting);

          await Promise.allSettled(
            deltas.map((d) => transact({ userId, delta: d, reason: "adjustment" })),
          );

          const finalBalance = await balance(userId);
          const sum = await ledgerSum(userId);
          expect(finalBalance).toBe(starting + sum);
          expect(finalBalance >= 0n).toBe(true);
        },
      ),
      { numRuns: 6 },
    );
  });

  it("sequential idempotency dedupe for srv_ and cli_ keys", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<"cli_" | "srv_">("cli_", "srv_"),
        fc.bigInt({ min: 1n, max: c(100n) }),
        async (prefix, amount) => {
          const userId = await seedUser(0n);
          const key = `${prefix}${randomUUID()}`;

          const first = await transact({
            userId,
            delta: amount,
            reason: "adjustment",
            idempotencyKey: key,
          });
          const second = await transact({
            userId,
            delta: amount,
            reason: "adjustment",
            idempotencyKey: key,
          });

          expect(first.deduped).toBe(false);
          expect(second.deduped).toBe(true);
          expect(second.transactionId).toBe(first.transactionId);
          expect(second.balanceAfter).toBe(first.balanceAfter);
          expect(await balance(userId)).toBe(amount);
          expect(await txCount(userId)).toBe(1);
        },
      ),
      { numRuns: 6 },
    );
  });

  it("race-safe idempotency: N=10 concurrent calls with identical cli_ key — exactly one commits", async () => {
    await fc.assert(
      fc.asyncProperty(fc.bigInt({ min: 1n, max: c(100n) }), async (amount) => {
        const userId = await seedUser(0n);
        const key = `cli_race_${randomUUID()}`;
        const N = 10;

        const results = await Promise.allSettled(
          Array.from({ length: N }, () =>
            transact({ userId, delta: amount, reason: "adjustment", idempotencyKey: key }),
          ),
        );

        const fulfilled = results
          .filter(
            (r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof transact>>> =>
              r.status === "fulfilled",
          )
          .map((r) => r.value);

        expect(fulfilled).toHaveLength(N);

        const committed = fulfilled.filter((r) => !r.deduped);
        const deduped = fulfilled.filter((r) => r.deduped);

        expect(committed).toHaveLength(1);
        expect(deduped).toHaveLength(N - 1);

        const winner = committed[0];
        for (const d of deduped) {
          expect(d.transactionId).toBe(winner.transactionId);
          expect(d.balanceAfter).toBe(winner.balanceAfter);
        }

        expect(await balance(userId)).toBe(amount);
        expect(await txCount(userId)).toBe(1);
      }),
      { numRuns: 4 },
    );
  });

  it("limit boundaries: handles 0n, 1n, and 2^63 - 1 deltas", async () => {
    const MAX_I64 = 2n ** 63n - 1n;

    for (const amount of [0n, 1n, MAX_I64]) {
      const userId = await seedUser(0n);

      const res = await transact({ userId, delta: amount, reason: "adjustment" });
      expect(res.balanceAfter).toBe(amount);
      expect(await balance(userId)).toBe(amount);

      if (amount > 0n) {
        await expect(
          transact({ userId, delta: -(amount + 1n), reason: "bet_stake" }),
        ).rejects.toBeInstanceOf(InsufficientBalanceError);

        const back = await transact({ userId, delta: -amount, reason: "bet_stake" });
        expect(back.balanceAfter).toBe(0n);
        expect(await balance(userId)).toBe(0n);
      }
    }
  });

  it("cross-currency isolation: a transact on one currency never touches another", async () => {
    const currencies: CurrencyKind[] = ["credit", "usd", "usdt", "usdc", "btc", "eth"];

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...currencies),
        fc.constantFrom(...currencies),
        fc.bigInt({ min: 1n, max: 1_000_000n }),
        async (ca, cb, delta) => {
          fc.pre(ca !== cb);

          const userId = await seedUser(2_000_000n, ca);
          await db
            .insert(wallets)
            .values({ userId, currencyKind: cb, balance: 2_000_000n })
            .onConflictDoNothing();

          const before = await balance(userId, cb);
          await transact({ userId, delta: -delta, reason: "bet_stake", currencyKind: ca });
          const after = await balance(userId, cb);

          expect(after).toBe(before);
          expect(await balance(userId, ca)).toBe(2_000_000n - delta);
        },
      ),
      { numRuns: 10 },
    );
  });
});
