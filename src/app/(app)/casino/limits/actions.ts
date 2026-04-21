"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSessionUser } from "@/lib/auth/session";
import { logger } from "@/lib/logger";
import { parseAmount } from "@/lib/wallet/currencies";
import { LimitUnchangedError, setWalletLimit } from "@/lib/wallet/limits";

const inputSchema = z.object({
  kind: z.enum(["wager", "deposit", "loss", "session_length_min"]),
  amount: z.string().min(1).max(32),
});

export type SetLimitState = {
  ok?: boolean;
  error?: string;
  info?: string;
};

export async function setLimitAction(
  _prev: SetLimitState | undefined,
  formData: FormData,
): Promise<SetLimitState> {
  const user = await requireSessionUser();

  const parsed = inputSchema.safeParse({
    kind: formData.get("kind"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  let amountBig: bigint;
  try {
    amountBig =
      parsed.data.kind === "session_length_min"
        ? BigInt(parsed.data.amount.trim())
        : parseAmount(parsed.data.amount.trim(), "credit");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not parse amount" };
  }

  if (amountBig < 0n) {
    return { error: "Amount must be non-negative" };
  }

  try {
    const res = await setWalletLimit({
      userId: user.id,
      currencyKind: "credit",
      kind: parsed.data.kind,
      amount: amountBig,
    });
    revalidatePath("/casino/limits");
    return {
      ok: true,
      info: res.delayed
        ? `Lowering queued. Effective ${res.effectiveAt.toLocaleString()}.`
        : "Limit updated.",
    };
  } catch (err) {
    if (err instanceof LimitUnchangedError) {
      return { info: "Limit already at that amount — nothing to change." };
    }
    logger.error({ err, userId: user.id, kind: parsed.data.kind }, "limits.setFailed");
    return { error: "Could not update limit" };
  }
}
