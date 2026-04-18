import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center">
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="font-display text-6xl font-semibold tracking-tight">gamblino</h1>
          <p className="text-[var(--color-muted)]">Midnight Arcade</p>
        </div>
        <div className="flex justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-[10px] bg-[var(--color-accent)] px-5 py-2.5 font-medium text-[var(--color-bg-deep)]"
          >
            Sign up
          </Link>
          <Link
            href="/signin"
            className="rounded-[10px] border border-[var(--color-border)] px-5 py-2.5 font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
