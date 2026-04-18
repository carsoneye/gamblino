import Link from "next/link";
import { SigninForms } from "./signin-forms";

export const metadata = { title: "Sign in · gamblino" };

export default function SigninPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-[var(--color-muted)]">Credentials or magic link — your call.</p>
      </header>
      <SigninForms />
      <p className="text-sm text-[var(--color-muted)]">
        No account yet?{" "}
        <Link href="/signup" className="text-[var(--color-accent)] hover:underline">
          Sign up
        </Link>
      </p>
    </section>
  );
}
