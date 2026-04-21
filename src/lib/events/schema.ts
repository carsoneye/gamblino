import { z } from "zod";

const BigIntString = z.string().regex(/^\d+$/, "must be a non-negative decimal bigint string");

const CurrencyKindEnum = z.enum(["credit", "usd", "usdt", "usdc", "btc", "eth"]);

const GameKindEnum = z.enum(["crash", "mines", "plinko", "lottery"]);

const LimitKindEnum = z.enum(["deposit", "loss", "session_length_min", "wager"]);

const BetStatusEnum = z.enum(["won", "lost", "cashed_out", "voided"]);

export const SignupPayload = z
  .object({
    source: z.enum(["credentials", "magic_link"]),
  })
  .strict();

export const LoginPayload = z
  .object({
    method: z.enum(["credentials", "magic_link"]),
  })
  .strict();

export const LogoutPayload = z.object({}).strict();

export const DailyGrantClaimedPayload = z
  .object({
    currencyKind: CurrencyKindEnum,
    amount: BigIntString,
  })
  .strict();

export const LimitSetPayload = z
  .object({
    limitId: z.string().uuid(),
    kind: LimitKindEnum,
    currencyKind: CurrencyKindEnum,
    amount: BigIntString,
    effectiveAt: z.string().datetime(),
    delayed: z.boolean(),
  })
  .strict();

export const LimitEffectivePayload = z
  .object({
    limitId: z.string().uuid(),
    kind: LimitKindEnum,
    currencyKind: CurrencyKindEnum,
    amount: BigIntString,
  })
  .strict();

export const LimitBreachRejectedPayload = z
  .object({
    limitId: z.string().uuid(),
    kind: LimitKindEnum,
    currencyKind: CurrencyKindEnum,
    limitAmount: BigIntString,
    attemptedAmount: BigIntString,
    reason: z.enum(["signup_bonus", "daily_grant", "bet_stake", "bet_payout", "adjustment"]),
  })
  .strict();

export const BetPlacedPayload = z
  .object({
    game: GameKindEnum,
    betId: z.string().uuid(),
    currencyKind: CurrencyKindEnum,
    stake: BigIntString,
  })
  .strict();

export const BetSettledPayload = z
  .object({
    game: GameKindEnum,
    betId: z.string().uuid(),
    currencyKind: CurrencyKindEnum,
    status: BetStatusEnum,
    stake: BigIntString,
    payout: BigIntString,
  })
  .strict();

export const AccountEvent = z.discriminatedUnion("event_kind", [
  z.object({ event_kind: z.literal("signup"), payload: SignupPayload }),
  z.object({ event_kind: z.literal("login"), payload: LoginPayload }),
  z.object({ event_kind: z.literal("logout"), payload: LogoutPayload }),
  z.object({ event_kind: z.literal("daily_grant_claimed"), payload: DailyGrantClaimedPayload }),
  z.object({ event_kind: z.literal("limit_set"), payload: LimitSetPayload }),
  z.object({ event_kind: z.literal("limit_effective"), payload: LimitEffectivePayload }),
  z.object({
    event_kind: z.literal("limit_breach_rejected"),
    payload: LimitBreachRejectedPayload,
  }),
  z.object({ event_kind: z.literal("bet_placed"), payload: BetPlacedPayload }),
  z.object({ event_kind: z.literal("bet_settled"), payload: BetSettledPayload }),
]);

export type AccountEventInput = z.input<typeof AccountEvent>;
export type AccountEventParsed = z.infer<typeof AccountEvent>;
export type AccountEventKind = AccountEventParsed["event_kind"];
