import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-[420px] space-y-8">
        <Link href="/" className="block font-display text-3xl font-semibold tracking-tight">
          gamblino
        </Link>
        {children}
      </div>
    </main>
  );
}
