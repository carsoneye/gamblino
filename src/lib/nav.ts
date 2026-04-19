import type { LucideIcon } from "lucide-react";
import { Bomb, Compass, Diamond, Rocket, ScrollText, Ticket, Trophy, User } from "lucide-react";
import { env } from "@/env";

export type GameSlug = "crash" | "mines" | "plinko" | "lottery";
export type GameStatus = "live" | "coming-soon";

type FlagKey = "FLAG_CRASH" | "FLAG_MINES" | "FLAG_PLINKO" | "FLAG_LOTTERY";

export type NavLinkItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type UserMetaItem = NavLinkItem & { enabled: boolean };

export type GameEntry = {
  slug: GameSlug;
  label: string;
  href: string;
  icon: LucideIcon;
  flag: FlagKey;
  tag: string;
};

export type ResolvedGame = GameEntry & {
  enabled: boolean;
  status: GameStatus;
};

export const marketingUtility: NavLinkItem[] = [
  { label: "Lobby", href: "#originals", icon: Compass },
  { label: "How it works", href: "#how-it-works", icon: ScrollText },
];

export const userMeta: UserMetaItem[] = [
  { label: "Lobby", href: "/casino", icon: Compass, enabled: true },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy, enabled: false },
  { label: "Transactions", href: "/transactions", icon: ScrollText, enabled: false },
  { label: "Profile", href: "/profile", icon: User, enabled: false },
];

export const gameTaxonomy: readonly GameEntry[] = [
  {
    slug: "crash",
    label: "Crash",
    href: "/casino/crash",
    icon: Rocket,
    flag: "FLAG_CRASH",
    tag: "Ride the curve. Cash out before it bursts.",
  },
  {
    slug: "mines",
    label: "Mines",
    href: "/casino/mines",
    icon: Bomb,
    flag: "FLAG_MINES",
    tag: "Reveal tiles. Avoid the bombs.",
  },
  {
    slug: "plinko",
    label: "Plinko",
    href: "/casino/plinko",
    icon: Diamond,
    flag: "FLAG_PLINKO",
    tag: "Drop the ball. Let the pegs decide.",
  },
  {
    slug: "lottery",
    label: "Lottery",
    href: "/casino/lottery",
    icon: Ticket,
    flag: "FLAG_LOTTERY",
    tag: "Pick five. Draw at midnight.",
  },
] as const;

export function resolveGames(): ResolvedGame[] {
  return gameTaxonomy.map((g) => {
    const enabled = env[g.flag] === "on";
    return { ...g, enabled, status: enabled ? "live" : "coming-soon" };
  });
}
