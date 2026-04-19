import { Faq } from "@/components/landing/faq";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingHero } from "@/components/landing/landing-hero";
import { OriginalsRow } from "@/components/lobby/originals-row";

export const metadata = { title: "gamblino — play free, win nothing real" };

export default function Home() {
  return (
    <>
      <LandingHero />
      <OriginalsRow locked />
      <HowItWorks />
      <Faq />
    </>
  );
}
