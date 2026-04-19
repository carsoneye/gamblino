"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { logger } from "@/lib/logger";
import { grantSignupBonusWithin } from "./signup-bonus";

const signupSchema = z.object({
  email: z
    .string()
    .email()
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(8, "At least 8 characters").max(128),
  name: z.string().trim().max(80).optional(),
});

export type SignupState = {
  error?: string;
  fieldErrors?: Partial<Record<"email" | "password" | "name", string>>;
};

const PG_UNIQUE_VIOLATION = "23505";
const isUniqueViolation = (err: unknown): boolean =>
  typeof err === "object" && err !== null && "code" in err && err.code === PG_UNIQUE_VIOLATION;

type CreateResult = { ok: true; id: string } | { ok: false; reason: "email_taken" | "insert" };

export async function signupAction(
  _prev: SignupState | undefined,
  formData: FormData,
): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name") || undefined,
  });
  if (!parsed.success) {
    const fieldErrors: SignupState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as "email" | "password" | "name" | undefined;
      if (key) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }
  const { email, password, name } = parsed.data;
  const passwordHash = await hash(password, 10);

  let created: CreateResult;
  try {
    created = await db.transaction(async (tx): Promise<CreateResult> => {
      const [row] = await tx
        .insert(users)
        .values({ email, name: name ?? null, passwordHash })
        .returning({ id: users.id });
      if (!row) return { ok: false, reason: "insert" };
      await grantSignupBonusWithin(tx, row.id);
      return { ok: true, id: row.id };
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { fieldErrors: { email: "That email is already registered" } };
    }
    logger.error({ err }, "signup.txFailed");
    return { error: "Could not create account" };
  }

  if (!created.ok) return { error: "Could not create account" };

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (err) {
    logger.error({ err, userId: created.id }, "signup.signInFailed");
    return { error: "Account created, but sign-in failed. Try signing in." };
  }

  redirect("/casino?welcome=1");
}
