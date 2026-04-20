import { notFound } from "next/navigation";
import { GamePlaceholder } from "@/components/game/game-placeholder";
import { requireSessionUser } from "@/lib/auth/session";
import { resolveGames } from "@/lib/nav";

type PageProps = {
  params: Promise<{ game: string }>;
};

export async function generateStaticParams() {
  return resolveGames()
    .filter((g) => g.enabled)
    .map((g) => ({ game: g.slug }));
}

export default async function GamePage({ params }: PageProps) {
  const { game } = await params;
  const entry = resolveGames().find((g) => g.slug === game);
  if (!entry?.enabled) notFound();

  const user = await requireSessionUser({
    redirectTo: `/signin?callbackUrl=/casino/${entry.slug}`,
  });

  return (
    <GamePlaceholder slug={entry.slug} title={entry.label} tag={entry.tag} balance={user.balance} />
  );
}
