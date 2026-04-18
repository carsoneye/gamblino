import { FloorMark } from "@/components/marketing/floor-mark";
import { Hero } from "@/components/marketing/hero";
import { MarketingHeader } from "@/components/marketing/marketing-header";

export const metadata = { title: "gamblino — Midnight Arcade" };

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <MarketingHeader />
      <main className="flex flex-1 flex-col">
        <Hero />
        <FloorMark />
      </main>
    </div>
  );
}
