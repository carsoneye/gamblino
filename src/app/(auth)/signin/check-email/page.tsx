export const metadata = { title: "Check your email · gamblino" };

export default function CheckEmailPage() {
  return (
    <section className="space-y-3">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Check your email</h1>
      <p className="text-[var(--color-muted)]">
        We sent a sign-in link to your inbox. Tap it to finish signing in.
      </p>
    </section>
  );
}
