import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  tag?: string;
  status?: ReactNode;
  stage: ReactNode;
  side: ReactNode;
};

export function GameShell({ title, tag, status, stage, side }: Props) {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 pt-6 pb-10 sm:px-8 lg:px-10">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-[13px] text-[var(--color-muted)]"
      >
        <Link
          href="/casino"
          className="transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-text)]"
        >
          Lobby
        </Link>
        <span aria-hidden>›</span>
        <span className="text-[var(--color-text)]">{title}</span>
      </nav>

      <header className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-[-0.025em]">{title}</h1>
          {tag ? (
            <p className="mt-1 text-[13px] text-[var(--color-muted)]">
              {tag}
              {status ? (
                <>
                  {" "}
                  <span className="text-[var(--color-text)]">{status}</span>
                </>
              ) : null}
            </p>
          ) : null}
        </div>
      </header>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <section aria-label={`${title} stage`} className="min-w-0">
          {stage}
        </section>
        <aside aria-label={`${title} controls`} className="space-y-4">
          {side}
        </aside>
      </div>
    </div>
  );
}
