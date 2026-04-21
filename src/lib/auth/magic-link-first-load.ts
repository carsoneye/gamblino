import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { accountEvents } from "@/db/schema";
import { writeAccountEvent } from "@/lib/events/write";
import { writeUserGeoEvent } from "@/lib/geo/write";
import { logger } from "@/lib/logger";

const PG_UNIQUE_VIOLATION = "23505";

function isUniqueViolation(err: unknown): boolean {
  let cur: unknown = err;
  while (cur !== null && typeof cur === "object") {
    if ("code" in cur && (cur as { code: unknown }).code === PG_UNIQUE_VIOLATION) return true;
    cur = (cur as { cause?: unknown }).cause;
  }
  return false;
}

export interface FirstLoadContext {
  ip: string;
  userAgent: string | null;
}

/**
 * Fires at most once per user. On the first call that finds no signup event
 * for `userId`, writes a `signup` account event (source=magic_link) plus the
 * matching `signup_magic_link_first_load` geo event in a single transaction.
 *
 * Race-safety is guaranteed by the `account_events_signup_once` unique partial
 * index — concurrent first loads across tabs/devices will have exactly one
 * caller commit; the rest catch the unique-violation and return quietly.
 *
 * Credentials-signup users already have a signup event written inside their
 * signup action, so the fast-path select returns early for them.
 */
export async function ensureMagicLinkSignupRecorded(
  userId: string,
  ctx: FirstLoadContext,
): Promise<void> {
  const existing = await db
    .select({ id: accountEvents.id })
    .from(accountEvents)
    .where(and(eq(accountEvents.userId, userId), eq(accountEvents.kind, "signup")))
    .limit(1);
  if (existing.length > 0) return;

  try {
    await db.transaction(async (tx) => {
      await writeAccountEvent(tx, userId, {
        event_kind: "signup",
        payload: { source: "magic_link" },
      });
      await writeUserGeoEvent(tx, {
        userId,
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        source: "signup_magic_link_first_load",
      });
    });
  } catch (err) {
    if (isUniqueViolation(err)) return;
    logger.error({ err, userId }, "magicLinkFirstLoad.writeFailed");
  }
}
