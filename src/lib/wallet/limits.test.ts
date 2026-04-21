import { beforeAll, describe, expect, it } from "bun:test";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { client, db } from "@/db";
import { type accountEventKind, accountEvents, users, walletLimits } from "@/db/schema";
import {
  fireNewlyEffectiveLimitWithin,
  getActiveLimit,
  LIMIT_LOWER_DELAY_HOURS,
  LimitUnchangedError,
  setWalletLimit,
} from "./limits";

type AccountEventKind = (typeof accountEventKind.enumValues)[number];

async function seedUser(): Promise<string> {
  const email = `limits+${Date.now()}-${randomUUID()}@gamblino.test`;
  const [row] = await db.insert(users).values({ email }).returning({ id: users.id });
  return row.id;
}

async function accountEventsFor(userId: string, kind: AccountEventKind) {
  return db
    .select()
    .from(accountEvents)
    .where(and(eq(accountEvents.userId, userId), eq(accountEvents.kind, kind)));
}

async function walletLimitsFor(userId: string) {
  return db.select().from(walletLimits).where(eq(walletLimits.userId, userId));
}

beforeAll(async () => {
  await client`select 1`;
});

describe("limits — setWalletLimit write path", () => {
  it("first-ever set is immediate (delayed=false, effectiveAt ≈ now)", async () => {
    const userId = await seedUser();
    const start = Date.now();

    const res = await setWalletLimit({
      userId,
      currencyKind: "credit",
      kind: "wager",
      amount: 1_000_000n,
    });

    expect(res.delayed).toBe(false);
    expect(res.amount).toBe(1_000_000n);
    expect(res.effectiveAt.getTime()).toBeGreaterThanOrEqual(start);
    expect(res.effectiveAt.getTime() - start).toBeLessThan(5_000);
  });

  it("raising (new > active) is immediate", async () => {
    const userId = await seedUser();
    await setWalletLimit({ userId, currencyKind: "credit", kind: "wager", amount: 500n });

    const res = await setWalletLimit({
      userId,
      currencyKind: "credit",
      kind: "wager",
      amount: 1_000n,
    });

    expect(res.delayed).toBe(false);
    expect(res.amount).toBe(1_000n);
  });

  it("lowering (new < active) is delayed by LIMIT_LOWER_DELAY_HOURS", async () => {
    const userId = await seedUser();
    await setWalletLimit({ userId, currencyKind: "credit", kind: "wager", amount: 1_000n });
    const now = Date.now();

    const res = await setWalletLimit({
      userId,
      currencyKind: "credit",
      kind: "wager",
      amount: 500n,
    });

    expect(res.delayed).toBe(true);
    const expectedDelayMs = LIMIT_LOWER_DELAY_HOURS * 60 * 60 * 1000;
    const observedDelayMs = res.effectiveAt.getTime() - now;
    expect(observedDelayMs).toBeGreaterThanOrEqual(expectedDelayMs - 2_000);
    expect(observedDelayMs).toBeLessThan(expectedDelayMs + 2_000);
  });

  it("setting the same amount throws LimitUnchangedError (no no-op rows)", async () => {
    const userId = await seedUser();
    await setWalletLimit({ userId, currencyKind: "credit", kind: "wager", amount: 500n });

    await expect(
      setWalletLimit({ userId, currencyKind: "credit", kind: "wager", amount: 500n }),
    ).rejects.toBeInstanceOf(LimitUnchangedError);

    const rows = await walletLimitsFor(userId);
    expect(rows).toHaveLength(1);
  });

  it("negative amount is rejected", async () => {
    const userId = await seedUser();

    await expect(
      setWalletLimit({ userId, currencyKind: "credit", kind: "wager", amount: -1n }),
    ).rejects.toThrow(/non-negative/);
  });

  it("writes a limit_set account event with correct payload fields", async () => {
    const userId = await seedUser();
    const res = await setWalletLimit({
      userId,
      currencyKind: "credit",
      kind: "wager",
      amount: 2_500n,
    });

    const events = await accountEventsFor(userId, "limit_set");
    expect(events).toHaveLength(1);
    expect(events[0].payload).toEqual({
      limitId: res.id,
      kind: "wager",
      currencyKind: "credit",
      amount: "2500",
      effectiveAt: res.effectiveAt.toISOString(),
      delayed: false,
    });
  });
});

describe("limits — getActiveLimit read path", () => {
  it("returns null when no limits have been set for (user, currency, kind)", async () => {
    const userId = await seedUser();
    const active = await getActiveLimit(userId, "credit", "wager");
    expect(active).toBeNull();
  });

  it("returns the only row once set, when effective_at has passed", async () => {
    const userId = await seedUser();
    const res = await setWalletLimit({
      userId,
      currencyKind: "credit",
      kind: "wager",
      amount: 1_000n,
    });

    const active = await getActiveLimit(userId, "credit", "wager");
    expect(active).not.toBeNull();
    expect(active?.id).toBe(res.id);
    expect(active?.amount).toBe(1_000n);
  });

  it("ignores rows whose effective_at is in the future (pending lowering)", async () => {
    const userId = await seedUser();
    const raised = await setWalletLimit({
      userId,
      currencyKind: "credit",
      kind: "wager",
      amount: 1_000n,
    });
    const lowered = await setWalletLimit({
      userId,
      currencyKind: "credit",
      kind: "wager",
      amount: 500n,
    });
    expect(lowered.delayed).toBe(true);

    const active = await getActiveLimit(userId, "credit", "wager");
    expect(active?.id).toBe(raised.id);
    expect(active?.amount).toBe(1_000n);
  });

  it("picks the pending row once its effective_at has passed (historical lookup)", async () => {
    const userId = await seedUser();
    await setWalletLimit({ userId, currencyKind: "credit", kind: "wager", amount: 1_000n });
    const lowered = await setWalletLimit({
      userId,
      currencyKind: "credit",
      kind: "wager",
      amount: 500n,
    });

    // Look up "in the future" — simulates the 24h delay passing.
    const future = new Date(Date.now() + (LIMIT_LOWER_DELAY_HOURS + 1) * 60 * 60 * 1000);
    const active = await getActiveLimit(userId, "credit", "wager", future);
    expect(active?.id).toBe(lowered.id);
    expect(active?.amount).toBe(500n);
  });

  it("isolates active limits per currency", async () => {
    const userId = await seedUser();
    await setWalletLimit({ userId, currencyKind: "credit", kind: "wager", amount: 1_000n });
    await setWalletLimit({ userId, currencyKind: "usd", kind: "wager", amount: 50n });

    expect((await getActiveLimit(userId, "credit", "wager"))?.amount).toBe(1_000n);
    expect((await getActiveLimit(userId, "usd", "wager"))?.amount).toBe(50n);
  });

  it("isolates active limits per kind", async () => {
    const userId = await seedUser();
    await setWalletLimit({ userId, currencyKind: "credit", kind: "wager", amount: 1_000n });
    await setWalletLimit({ userId, currencyKind: "credit", kind: "deposit", amount: 50_000n });

    expect((await getActiveLimit(userId, "credit", "wager"))?.amount).toBe(1_000n);
    expect((await getActiveLimit(userId, "credit", "deposit"))?.amount).toBe(50_000n);
  });
});

describe("limits — fireNewlyEffectiveLimit", () => {
  it("writes a limit_effective event for the active limit on first call", async () => {
    const userId = await seedUser();
    const res = await setWalletLimit({
      userId,
      currencyKind: "credit",
      kind: "wager",
      amount: 1_000n,
    });

    await db.transaction((tx) => fireNewlyEffectiveLimitWithin(tx, userId, "credit", "wager"));

    const events = await accountEventsFor(userId, "limit_effective");
    expect(events).toHaveLength(1);
    expect(events[0].payload).toEqual({
      limitId: res.id,
      kind: "wager",
      currencyKind: "credit",
      amount: "1000",
    });
  });

  it("is idempotent on repeat calls (unique partial index dedups)", async () => {
    const userId = await seedUser();
    await setWalletLimit({ userId, currencyKind: "credit", kind: "wager", amount: 1_000n });

    for (let i = 0; i < 5; i++) {
      await db.transaction((tx) => fireNewlyEffectiveLimitWithin(tx, userId, "credit", "wager"));
    }

    const events = await accountEventsFor(userId, "limit_effective");
    expect(events).toHaveLength(1);
  });

  it("no-ops when there is no active limit for the (user, currency, kind)", async () => {
    const userId = await seedUser();

    await db.transaction((tx) => fireNewlyEffectiveLimitWithin(tx, userId, "credit", "wager"));

    const events = await accountEventsFor(userId, "limit_effective");
    expect(events).toHaveLength(0);
  });

  it("fires a new event when a pending lower-delayed limit becomes effective", async () => {
    const userId = await seedUser();
    const raised = await setWalletLimit({
      userId,
      currencyKind: "credit",
      kind: "wager",
      amount: 1_000n,
    });
    await db.transaction((tx) => fireNewlyEffectiveLimitWithin(tx, userId, "credit", "wager"));

    const lowered = await setWalletLimit({
      userId,
      currencyKind: "credit",
      kind: "wager",
      amount: 500n,
    });
    expect(lowered.delayed).toBe(true);

    // Simulate the 24h delay elapsing via the `at` parameter — wallet_limits
    // is append-only (ADR-0013 trigger), so we can't backdate the row.
    const future = new Date(Date.now() + (LIMIT_LOWER_DELAY_HOURS + 1) * 60 * 60 * 1000);
    await db.transaction((tx) =>
      fireNewlyEffectiveLimitWithin(tx, userId, "credit", "wager", future),
    );

    const events = await accountEventsFor(userId, "limit_effective");
    expect(events).toHaveLength(2);
    const limitIds = events.map((e) => (e.payload as { limitId: string }).limitId).sort();
    expect(limitIds).toEqual([raised.id, lowered.id].sort());
  });
});
