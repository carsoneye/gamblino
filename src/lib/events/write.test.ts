import { beforeAll, describe, expect, it } from "bun:test";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { client, db } from "@/db";
import { accountEvents, users } from "@/db/schema";
import { writeAccountEvent } from "./write";

async function seedUser(): Promise<string> {
  const email = `events+${Date.now()}-${randomUUID()}@gamblino.test`;
  const [row] = await db.insert(users).values({ email }).returning({ id: users.id });
  return row.id;
}

async function loadEvent(id: string) {
  const [row] = await db.select().from(accountEvents).where(eq(accountEvents.id, id));
  return row;
}

beforeAll(async () => {
  await client`select 1`;
});

describe("events/write — writeAccountEvent", () => {
  it("persists a signup event with matching kind column and JSONB payload", async () => {
    const userId = await seedUser();

    const { id } = await db.transaction((tx) =>
      writeAccountEvent(tx, userId, {
        event_kind: "signup",
        payload: { source: "credentials" },
      }),
    );

    const row = await loadEvent(id);
    expect(row.userId).toBe(userId);
    expect(row.kind).toBe("signup");
    expect(row.payload).toEqual({ source: "credentials" });
  });

  it("rejects a malformed payload at the Zod layer (no row written)", async () => {
    const userId = await seedUser();

    await expect(
      db.transaction((tx) =>
        writeAccountEvent(tx, userId, {
          event_kind: "signup",
          // @ts-expect-error — intentional: proving runtime validation catches type drift
          payload: { method: "credentials" },
        }),
      ),
    ).rejects.toThrow();

    const [row] = await db
      .select()
      .from(accountEvents)
      .where(and(eq(accountEvents.userId, userId)));
    expect(row).toBeUndefined();
  });

  it("rolls back when composed with a failing sibling operation in the same tx", async () => {
    const userId = await seedUser();

    await expect(
      db.transaction(async (tx) => {
        await writeAccountEvent(tx, userId, {
          event_kind: "login",
          payload: { method: "credentials" },
        });
        throw new Error("sibling failure");
      }),
    ).rejects.toThrow("sibling failure");

    const [row] = await db.select().from(accountEvents).where(eq(accountEvents.userId, userId));
    expect(row).toBeUndefined();
  });

  it("blocks UPDATE on account_events at the DB level (append-only trigger)", async () => {
    const userId = await seedUser();

    const { id } = await db.transaction((tx) =>
      writeAccountEvent(tx, userId, {
        event_kind: "logout",
        payload: {},
      }),
    );

    let caught: unknown;
    try {
      await db
        .update(accountEvents)
        .set({ payload: { tampered: true } })
        .where(eq(accountEvents.id, id));
    } catch (e) {
      caught = e;
    }
    expect(errorChain(caught)).toMatch(/append-only/);
  });

  it("blocks DELETE on account_events at the DB level (append-only trigger)", async () => {
    const userId = await seedUser();

    const { id } = await db.transaction((tx) =>
      writeAccountEvent(tx, userId, {
        event_kind: "logout",
        payload: {},
      }),
    );

    let caught: unknown;
    try {
      await db.delete(accountEvents).where(eq(accountEvents.id, id));
    } catch (e) {
      caught = e;
    }
    expect(errorChain(caught)).toMatch(/append-only/);
  });

  it("writes a bet_settled event with full payload shape", async () => {
    const userId = await seedUser();
    const betId = randomUUID();

    const { id } = await db.transaction((tx) =>
      writeAccountEvent(tx, userId, {
        event_kind: "bet_settled",
        payload: {
          game: "crash",
          betId,
          currencyKind: "credit",
          status: "cashed_out",
          stake: "1000000",
          payout: "2500000",
        },
      }),
    );

    const row = await loadEvent(id);
    expect(row.kind).toBe("bet_settled");
    expect(row.payload).toEqual({
      game: "crash",
      betId,
      currencyKind: "credit",
      status: "cashed_out",
      stake: "1000000",
      payout: "2500000",
    });
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
