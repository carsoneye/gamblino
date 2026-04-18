export type GameKey = "crash" | "mines" | "plinko";

export type FloorWin = {
  id: string;
  handle: string;
  game: GameKey;
  multiplier: number;
  payout: number;
  ago: string;
};

export type FloorMessage = {
  id: string;
  handle: string;
  tint: "teal" | "magenta" | "amber" | "muted";
  body: string;
  ago: string;
};

export type GameActivity = Record<GameKey, { online: number; hot: boolean }>;

export const FLOOR_HEADCOUNT = 247;
export const FLOOR_PEAK_24H = 1_842;
export const FLOOR_TOP_WIN_24H = 48_230;

export const gameActivity: GameActivity = {
  crash: { online: 124, hot: true },
  mines: { online: 81, hot: false },
  plinko: { online: 42, hot: false },
};

export const recentWins: FloorWin[] = [
  { id: "w1", handle: "nova_88", game: "crash", multiplier: 24.1, payout: 4820, ago: "12s" },
  { id: "w2", handle: "ORCA", game: "mines", multiplier: 8.3, payout: 1660, ago: "34s" },
  { id: "w3", handle: "silverfox", game: "plinko", multiplier: 3.2, payout: 640, ago: "48s" },
  { id: "w4", handle: "kori.dev", game: "crash", multiplier: 1.8, payout: 360, ago: "1m" },
  { id: "w5", handle: "mxlt", game: "crash", multiplier: 67.4, payout: 13_480, ago: "2m" },
  { id: "w6", handle: "quiet_0", game: "mines", multiplier: 5.0, payout: 1000, ago: "3m" },
  { id: "w7", handle: "dusk_runner", game: "plinko", multiplier: 11.8, payout: 2360, ago: "4m" },
  { id: "w8", handle: "neon_saint", game: "crash", multiplier: 2.4, payout: 480, ago: "5m" },
];

export const seededMessages: FloorMessage[] = [
  { id: "m1", handle: "mxlt", tint: "magenta", body: "67× on crash lets gooo", ago: "1m" },
  { id: "m2", handle: "ORCA", tint: "teal", body: "mines on a 3-reveal streak tonight", ago: "2m" },
  { id: "m3", handle: "kori.dev", tint: "muted", body: "plinko pegs feel heavy today", ago: "3m" },
  {
    id: "m4",
    handle: "nova_88",
    tint: "amber",
    body: "who's riding the 10× next round",
    ago: "4m",
  },
  { id: "m5", handle: "silverfox", tint: "teal", body: "gn all, up 2100 for the night", ago: "6m" },
  {
    id: "m6",
    handle: "dusk_runner",
    tint: "magenta",
    body: "that cash-out animation is sick",
    ago: "7m",
  },
  {
    id: "m7",
    handle: "quiet_0",
    tint: "muted",
    body: "new here — what's the max multiplier on mines?",
    ago: "8m",
  },
  { id: "m8", handle: "neon_saint", tint: "teal", body: "floor is cooking tonight", ago: "10m" },
];

export const sessionDelta = { amount: 1_250, direction: "up" as const };
