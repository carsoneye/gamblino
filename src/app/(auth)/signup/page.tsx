import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata = { title: "Sign up · gamblino" };

export default function SignupPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Create account</h1>
        <p className="text-[var(--color-muted)]">
          10,000 credits on the house. No money, no crypto — just play.
        </p>
      </header>
      <SignupForm />
      <p className="text-sm text-[var(--color-muted)]">
        Already have an account?{" "}
        <Link href="/signin" className="text-[var(--color-accent)] hover:underline">
          Sign in
        </Link>
      </p>
    </section>
  );
}
