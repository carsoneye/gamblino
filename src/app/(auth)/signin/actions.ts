"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "@/auth";

const credsSchema = z.object({
  email: z
    .string()
    .email()
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1).max(128),
});

const magicSchema = z.object({
  email: z
    .string()
    .email()
    .transform((v) => v.trim().toLowerCase()),
});

export type SigninState = { error?: string; info?: string };

export async function signinCredentialsAction(
  _prev: SigninState | undefined,
  formData: FormData,
): Promise<SigninState> {
  const parsed = credsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid email and password" };

  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) return { error: "Invalid email or password" };
    throw err;
  }
  redirect("/casino");
}

export async function signinMagicAction(
  _prev: SigninState | undefined,
  formData: FormData,
): Promise<SigninState> {
  const parsed = magicSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "Enter a valid email" };
  try {
    await signIn("nodemailer", { email: parsed.data.email, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) return { error: "Could not send magic link" };
    throw err;
  }
  return { info: "Check your email for a sign-in link." };
}
