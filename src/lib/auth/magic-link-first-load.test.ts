import { beforeAll, describe, expect, it } from "bun:test";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import fc from "fast-check";
import { client, db } from "@/db";
import { accountEvents, userGeoEvents, users } from "@/db/schema";
import { ensureMagicLinkSignupRecorded } from "./magic-link-first-load";

async function seedUser(): Promise<string> {
  const email = `magic+${Date.now()}-${randomUUID()}@gamblino.test`;
  const [row] = await db.insert(users).values({ email }).returning({ id: users.id });
  return row.id;
}

async function signupEvents(userId: string) {
  return db
    .select()
    .from(accountEvents)
    .where(and(eq(accountEvents.userId, userId), eq(accountEvents.kind, "signup")));
}

async function geoEvents(userId: string) {
  return db.select().from(userGeoEvents).where(eq(userGeoEvents.userId, userId));
}

beforeAll(async () => {
  await client`select 1`;
});

describe("magic-link-first-load — ensureMagicLinkSignupRecorded", () => {
  it("writes a signup event and matching geo event on the first call for a user", async () => {
    const userId = await seedUser();

    await ensureMagicLinkSignupRecorded(userId, { ip: "198.51.100.7", userAgent: "test-ua" });

    const signups = await signupEvents(userId);
    expect(signups).toHaveLength(1);
    expect(signups[0].payload).toEqual({ source: "magic_link" });

    const geos = await geoEvents(userId);
    expect(geos).toHaveLength(1);
    expect(geos[0].source).toBe("signup_magic_link_first_load");
    expect(geos[0].ip).toBe("198.51.100.7");
    expect(geos[0].userAgent).toBe("test-ua");
  });

  it("is idempotent on repeat calls for the same user — fast-path select short-circuits", async () => {
    const userId = await seedUser();

    await ensureMagicLinkSignupRecorded(userId, { ip: "198.51.100.7", userAgent: "ua1" });
    await ensureMagicLinkSignupRecorded(userId, { ip: "203.0.113.42", userAgent: "ua2" });
    await ensureMagicLinkSignupRecorded(userId, { ip: "203.0.113.99", userAgent: "ua3" });

    expect(await signupEvents(userId)).toHaveLength(1);
    const geos = await geoEvents(userId);
    expect(geos).toHaveLength(1);
    expect(geos[0].ip).toBe("198.51.100.7");
  });

  it("does not re-fire for a user who already has a credentials signup event", async () => {
    const userId = await seedUser();

    // Simulate a prior credentials-signup flow that already wrote a signup event.
    await db.insert(accountEvents).values({
      userId,
      kind: "signup",
      payload: { source: "credentials" },
    });

    await ensureMagicLinkSignupRecorded(userId, { ip: "198.51.100.7", userAgent: "ua" });

    const signups = await signupEvents(userId);
    expect(signups).toHaveLength(1);
    expect(signups[0].payload).toEqual({ source: "credentials" });
    expect(await geoEvents(userId)).toHaveLength(0);
  });
});

describe("magic-link-first-load — fast-check stress", () => {
  it("N=10 concurrent first loads for the same user commit exactly one signup+geo pair", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.ipV4(),
        fc.string({ minLength: 1, maxLength: 40 }),
        async (ip, userAgent) => {
          const userId = await seedUser();
          const N = 10;

          await Promise.all(
            Array.from({ length: N }, () =>
              ensureMagicLinkSignupRecorded(userId, { ip, userAgent }),
            ),
          );

          const signups = await signupEvents(userId);
          expect(signups).toHaveLength(1);
          expect(signups[0].payload).toEqual({ source: "magic_link" });

          const geos = await geoEvents(userId);
          expect(geos).toHaveLength(1);
          expect(geos[0].source).toBe("signup_magic_link_first_load");
        },
      ),
      { numRuns: 4 },
    );
  });
});
