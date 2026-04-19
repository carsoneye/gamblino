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
  callbackUrl: z.string().optional(),
});

const magicSchema = z.object({
  email: z
    .string()
    .email()
    .transform((v) => v.trim().toLowerCase()),
  callbackUrl: z.string().optional(),
});

export type SigninState = { error?: string };

function safeCallback(raw: string | undefined): string {
  if (!raw) return "/casino";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/casino";
  return raw;
}

export async function signinCredentialsAction(
  _prev: SigninState | undefined,
  formData: FormData,
): Promise<SigninState> {
  const parsed = credsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    callbackUrl: formData.get("callbackUrl") || undefined,
  });
  if (!parsed.success) return { error: "Enter a valid email and password" };

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) return { error: "Invalid email or password" };
    throw err;
  }
  redirect(safeCallback(parsed.data.callbackUrl));
}

export async function signinMagicAction(
  _prev: SigninState | undefined,
  formData: FormData,
): Promise<SigninState> {
  const parsed = magicSchema.safeParse({
    email: formData.get("email"),
    callbackUrl: formData.get("callbackUrl") || undefined,
  });
  if (!parsed.success) return { error: "Enter a valid email" };

  try {
    await signIn("nodemailer", { email: parsed.data.email, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) return { error: "Could not send magic link" };
    throw err;
  }

  const qs = new URLSearchParams({ email: parsed.data.email });
  const cb = safeCallback(parsed.data.callbackUrl);
  if (cb !== "/casino") qs.set("callbackUrl", cb);
  redirect(`/signin/check-email?${qs.toString()}`);
}
