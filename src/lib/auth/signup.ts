"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { logger } from "@/lib/logger";
import { grantSignupBonus } from "./signup-bonus";

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

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  });
  if (existing) return { fieldErrors: { email: "That email is already registered" } };

  const passwordHash = await hash(password, 10);
  const [row] = await db
    .insert(users)
    .values({ email, name: name ?? null, passwordHash })
    .returning({ id: users.id });
  if (!row) return { error: "Could not create account" };

  try {
    await grantSignupBonus(row.id);
  } catch (err) {
    logger.error({ err, userId: row.id }, "signup.grantBonusFailed");
    return { error: "Could not allocate signup credits" };
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (err) {
    logger.error({ err, userId: row.id }, "signup.signInFailed");
    return { error: "Account created, but sign-in failed. Try signing in." };
  }

  redirect("/casino");
}
