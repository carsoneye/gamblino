import type { DbTx } from "@/db";
import { accountEvents } from "@/db/schema";
import { AccountEvent, type AccountEventInput } from "./schema";

export interface WriteAccountEventResult {
  id: string;
}

export async function writeAccountEvent(
  tx: DbTx,
  userId: string,
  event: AccountEventInput,
): Promise<WriteAccountEventResult> {
  const parsed = AccountEvent.parse(event);

  const [row] = await tx
    .insert(accountEvents)
    .values({
      userId,
      kind: parsed.event_kind,
      payload: parsed.payload,
    })
    .returning({ id: accountEvents.id });

  return { id: row.id };
}
