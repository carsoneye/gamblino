import type { LucideIcon } from "lucide-react";
import { Bomb, Compass, Diamond, Rocket, ScrollText, Trophy, User } from "lucide-react";
import { env } from "@/env";

export type GameSlug = "crash" | "mines" | "plinko";

export type GameLink = {
  slug: GameSlug;
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
  status: "live" | "coming-soon";
};

export type NavLinkItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const primaryNav: NavLinkItem[] = [
  { label: "Lobby", href: "/casino", icon: Compass },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Transactions", href: "/transactions", icon: ScrollText },
  { label: "Profile", href: "/profile", icon: User },
];

export const games: GameLink[] = [
  {
    slug: "crash",
    label: "Crash",
    href: "/casino/crash",
    icon: Rocket,
    enabled: env.FLAG_CRASH === "on",
    status: "coming-soon",
  },
  {
    slug: "mines",
    label: "Mines",
    href: "/casino/mines",
    icon: Bomb,
    enabled: env.FLAG_MINES === "on",
    status: "coming-soon",
  },
  {
    slug: "plinko",
    label: "Plinko",
    href: "/casino/plinko",
    icon: Diamond,
    enabled: env.FLAG_PLINKO === "on",
    status: "coming-soon",
  },
];
