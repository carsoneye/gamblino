import { GrantCelebration } from "@/components/celebrations/grant-celebration";
import { OriginalsRow } from "@/components/lobby/originals-row";

export const dynamic = "force-dynamic";
export const metadata = { title: "Casino · gamblino" };

export default async function CasinoPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const params = await searchParams;
  const isWelcome = params.welcome === "1";

  return (
    <>
      <section
        aria-labelledby="lobby-heading"
        className="flex flex-col gap-2 px-6 pt-8 pb-4 lg:px-10 lg:pt-10 lg:pb-5"
      >
        <h1
          id="lobby-heading"
          className="font-display font-semibold leading-[0.95] tracking-[-0.03em] text-[var(--color-text)]"
          style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)" }}
        >
          Pick a table.
        </h1>
        <p className="max-w-xl text-[14px] leading-relaxed text-[var(--color-muted)]">
          Four originals. Every round seeded with a public commit, revealed after the draw.
        </p>
      </section>
      <OriginalsRow />
      {isWelcome ? <GrantCelebration amount={10000} /> : null}
    </>
  );
}
