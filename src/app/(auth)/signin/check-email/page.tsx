export const metadata = { title: "Check your email · gamblino" };

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = params.email;

  return (
    <section className="space-y-3">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Check your email</h1>
      <p className="text-[var(--color-muted)]">
        {email ? (
          <>
            We sent a sign-in link to <span className="text-[var(--color-text)]">{email}</span>. Tap
            it to finish signing in.
          </>
        ) : (
          <>We sent a sign-in link to your inbox. Tap it to finish signing in.</>
        )}
      </p>
      <p className="text-sm text-[var(--color-muted)]">
        Check spam if it doesn't land. The link expires in 24 hours.
      </p>
    </section>
  );
}
