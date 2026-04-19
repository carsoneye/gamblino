import type { GameSlug } from "@/lib/nav";
import { CrashArt } from "./crash";
import { LotteryArt } from "./lottery";
import { MinesArt } from "./mines";
import { PlinkoArt } from "./plinko";

export function GameArt({ game, className }: { game: GameSlug; className?: string }) {
  if (game === "crash") return <CrashArt className={className} />;
  if (game === "mines") return <MinesArt className={className} />;
  if (game === "lottery") return <LotteryArt className={className} />;
  return <PlinkoArt className={className} />;
}
