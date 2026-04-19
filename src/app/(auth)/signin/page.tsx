import Link from "next/link";
import { SigninForms } from "./signin-forms";

export const metadata = { title: "Sign in · gamblino" };

export default async function SigninPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl =
    params.callbackUrl?.startsWith("/") && !params.callbackUrl.startsWith("//")
      ? params.callbackUrl
      : undefined;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-[var(--color-muted)]">Credentials or magic link — your call.</p>
      </header>
      <SigninForms callbackUrl={callbackUrl} />
      <p className="text-sm text-[var(--color-muted)]">
        No account yet?{" "}
        <Link href="/signup" className="text-[var(--color-accent)] hover:underline">
          Sign up
        </Link>
      </p>
    </section>
  );
}
