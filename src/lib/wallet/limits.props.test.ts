import { beforeAll, describe, expect, it } from "bun:test";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import fc from "fast-check";
import { client, db } from "@/db";
import { users, walletLimits } from "@/db/schema";
import { getActiveLimit, LimitUnchangedError, setWalletLimit } from "./limits";

async function seedUser(): Promise<string> {
  const email = `limits-props+${Date.now()}-${randomUUID()}@gamblino.test`;
  const [row] = await db.insert(users).values({ email }).returning({ id: users.id });
  return row.id;
}

beforeAll(async () => {
  await client`select 1`;
});

describe("limits — fast-check invariants", () => {
  it("active limit at any time T is always the most recent row with effective_at <= T", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.bigInt({ min: 1n, max: 10_000n }), { minLength: 3, maxLength: 8 }),
        async (rawAmounts) => {
          const amounts: bigint[] = [];
          let last: bigint | null = null;
          for (const a of rawAmounts) {
            if (last === null || a !== last) {
              amounts.push(a);
              last = a;
            }
          }
          if (amounts.length === 0) return;

          const userId = await seedUser();

          for (const amount of amounts) {
            try {
              await setWalletLimit({
                userId,
                currencyKind: "credit",
                kind: "wager",
                amount,
              });
            } catch (err) {
              if (!(err instanceof LimitUnchangedError)) throw err;
            }
          }

          const rows = await db.select().from(walletLimits).where(eq(walletLimits.userId, userId));

          const probeTimes = [
            new Date(Date.now() - 60_000),
            new Date(),
            new Date(Date.now() + 12 * 60 * 60 * 1000),
            new Date(Date.now() + 48 * 60 * 60 * 1000),
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          ];

          for (const t of probeTimes) {
            const eligible = rows.filter((r) => r.effectiveAt.getTime() <= t.getTime());
            const expected =
              eligible.length === 0
                ? null
                : eligible.reduce((a, b) =>
                    a.effectiveAt.getTime() >= b.effectiveAt.getTime() ? a : b,
                  );

            const active = await getActiveLimit(userId, "credit", "wager", t);

            if (expected === null) {
              expect(active).toBeNull();
            } else {
              expect(active).not.toBeNull();
              expect(active?.id).toBe(expected.id);
              expect(active?.amount).toBe(expected.amount);
            }
          }
        },
      ),
      { numRuns: 5 },
    );
  });

  it("lowering always yields a later effective_at than the current active limit", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.bigInt({ min: 100n, max: 1_000_000n }),
        fc.bigInt({ min: 1n, max: 99n }),
        async (high, low) => {
          const userId = await seedUser();

          const raised = await setWalletLimit({
            userId,
            currencyKind: "credit",
            kind: "wager",
            amount: high,
          });
          const lowered = await setWalletLimit({
            userId,
            currencyKind: "credit",
            kind: "wager",
            amount: low,
          });

          expect(raised.delayed).toBe(false);
          expect(lowered.delayed).toBe(true);
          expect(lowered.effectiveAt.getTime()).toBeGreaterThan(raised.effectiveAt.getTime());
        },
      ),
      { numRuns: 8 },
    );
  });

  it("raising always yields an immediate effective_at (no delay)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.bigInt({ min: 1n, max: 100n }),
        fc.bigInt({ min: 101n, max: 1_000_000n }),
        async (low, high) => {
          const userId = await seedUser();
          const start = Date.now();

          await setWalletLimit({ userId, currencyKind: "credit", kind: "wager", amount: low });
          const raised = await setWalletLimit({
            userId,
            currencyKind: "credit",
            kind: "wager",
            amount: high,
          });

          expect(raised.delayed).toBe(false);
          expect(raised.effectiveAt.getTime() - start).toBeLessThan(5_000);
        },
      ),
      { numRuns: 8 },
    );
  });
});
