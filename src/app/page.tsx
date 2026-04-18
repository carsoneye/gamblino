import { Hero } from "@/components/marketing/hero";
import { MarketingHeader } from "@/components/marketing/marketing-header";

export const metadata = { title: "gamblino — play free, win nothing real" };

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <MarketingHeader />
      <main className="flex flex-1 flex-col">
        <Hero />
      </main>
    </div>
  );
}
