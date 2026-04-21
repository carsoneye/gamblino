import { describe, expect, it } from "bun:test";
import { randomUUID } from "node:crypto";
import {
  AccountEvent,
  BetPlacedPayload,
  BetSettledPayload,
  DailyGrantClaimedPayload,
  LimitBreachRejectedPayload,
  LimitEffectivePayload,
  LimitSetPayload,
  LoginPayload,
  LogoutPayload,
  SignupPayload,
} from "./schema";

describe("events/schema — individual payloads", () => {
  it("SignupPayload accepts credentials + magic_link, rejects extras", () => {
    expect(SignupPayload.parse({ source: "credentials" })).toEqual({ source: "credentials" });
    expect(SignupPayload.parse({ source: "magic_link" })).toEqual({ source: "magic_link" });
    expect(() => SignupPayload.parse({ source: "oauth" })).toThrow();
    expect(() => SignupPayload.parse({ source: "credentials", extra: 1 })).toThrow();
  });

  it("LoginPayload validates method", () => {
    expect(LoginPayload.parse({ method: "credentials" })).toEqual({ method: "credentials" });
    expect(() => LoginPayload.parse({})).toThrow();
  });

  it("LogoutPayload is empty-strict", () => {
    expect(LogoutPayload.parse({})).toEqual({});
    expect(() => LogoutPayload.parse({ reason: "session" })).toThrow();
  });

  it("DailyGrantClaimedPayload requires bigint-string amount + currencyKind", () => {
    expect(
      DailyGrantClaimedPayload.parse({ currencyKind: "credit", amount: "2500000000" }),
    ).toEqual({ currencyKind: "credit", amount: "2500000000" });

    expect(() =>
      DailyGrantClaimedPayload.parse({ currencyKind: "credit", amount: 2500000000 }),
    ).toThrow();
    expect(() =>
      DailyGrantClaimedPayload.parse({ currencyKind: "credit", amount: "2.5" }),
    ).toThrow();
    expect(() =>
      DailyGrantClaimedPayload.parse({ currencyKind: "credit", amount: "-1" }),
    ).toThrow();
  });

  it("LimitSetPayload requires ISO8601 effectiveAt + limitId + delayed flag", () => {
    const limitId = randomUUID();
    const ok = LimitSetPayload.parse({
      limitId,
      kind: "deposit",
      currencyKind: "credit",
      amount: "1000000",
      effectiveAt: "2026-04-20T00:00:00.000Z",
      delayed: false,
    });
    expect(ok.kind).toBe("deposit");
    expect(ok.limitId).toBe(limitId);
    expect(ok.delayed).toBe(false);

    expect(() =>
      LimitSetPayload.parse({
        limitId,
        kind: "deposit",
        currencyKind: "credit",
        amount: "1000000",
        effectiveAt: "not-a-date",
        delayed: true,
      }),
    ).toThrow();
  });

  it("LimitEffectivePayload requires limitId + has no effectiveAt — it IS effective", () => {
    const limitId = randomUUID();
    expect(
      LimitEffectivePayload.parse({
        limitId,
        kind: "loss",
        currencyKind: "credit",
        amount: "500",
      }),
    ).toEqual({ limitId, kind: "loss", currencyKind: "credit", amount: "500" });

    expect(() =>
      LimitEffectivePayload.parse({
        limitId,
        kind: "loss",
        currencyKind: "credit",
        amount: "500",
        effectiveAt: "2026-04-20T00:00:00.000Z",
      }),
    ).toThrow();
  });

  it("LimitBreachRejectedPayload records the attempted and allowed amounts + originating reason", () => {
    const limitId = randomUUID();
    const ok = LimitBreachRejectedPayload.parse({
      limitId,
      kind: "wager",
      currencyKind: "credit",
      limitAmount: "1000000",
      attemptedAmount: "2000000",
      reason: "bet_stake",
    });
    expect(ok.limitId).toBe(limitId);
    expect(ok.reason).toBe("bet_stake");

    expect(() =>
      LimitBreachRejectedPayload.parse({
        limitId,
        kind: "wager",
        currencyKind: "credit",
        limitAmount: "1000000",
        attemptedAmount: "2000000",
        reason: "unknown_reason",
      }),
    ).toThrow();
  });

  it("BetPlacedPayload requires uuid betId + bigint-string stake", () => {
    const betId = randomUUID();
    const ok = BetPlacedPayload.parse({
      game: "crash",
      betId,
      currencyKind: "credit",
      stake: "1000000",
    });
    expect(ok.betId).toBe(betId);

    expect(() =>
      BetPlacedPayload.parse({
        game: "crash",
        betId: "not-a-uuid",
        currencyKind: "credit",
        stake: "1000000",
      }),
    ).toThrow();
  });

  it("BetSettledPayload requires status + payout", () => {
    const betId = randomUUID();
    const ok = BetSettledPayload.parse({
      game: "mines",
      betId,
      currencyKind: "credit",
      status: "won",
      stake: "1000000",
      payout: "2500000",
    });
    expect(ok.status).toBe("won");

    expect(() =>
      BetSettledPayload.parse({
        game: "mines",
        betId,
        currencyKind: "credit",
        status: "pending",
        stake: "1000000",
        payout: "0",
      }),
    ).toThrow();
  });
});

describe("events/schema — discriminated union", () => {
  it("routes to the correct payload schema by event_kind", () => {
    const parsed = AccountEvent.parse({
      event_kind: "signup",
      payload: { source: "credentials" },
    });
    expect(parsed.event_kind).toBe("signup");
    if (parsed.event_kind === "signup") {
      expect(parsed.payload.source).toBe("credentials");
    }
  });

  it("rejects a payload that doesn't match its event_kind variant", () => {
    expect(() =>
      AccountEvent.parse({
        event_kind: "signup",
        payload: { method: "credentials" },
      }),
    ).toThrow();
  });

  it("rejects unknown event_kind values", () => {
    expect(() =>
      AccountEvent.parse({
        event_kind: "unknown",
        payload: {},
      }),
    ).toThrow();
  });

  it("accepts all 9 kinds declared in the DB enum", () => {
    const limitId = randomUUID();
    const samples = [
      { event_kind: "signup", payload: { source: "credentials" } },
      { event_kind: "login", payload: { method: "magic_link" } },
      { event_kind: "logout", payload: {} },
      { event_kind: "daily_grant_claimed", payload: { currencyKind: "credit", amount: "0" } },
      {
        event_kind: "limit_set",
        payload: {
          limitId,
          kind: "deposit",
          currencyKind: "credit",
          amount: "0",
          effectiveAt: "2026-04-20T00:00:00.000Z",
          delayed: false,
        },
      },
      {
        event_kind: "limit_effective",
        payload: { limitId, kind: "loss", currencyKind: "credit", amount: "0" },
      },
      {
        event_kind: "limit_breach_rejected",
        payload: {
          limitId,
          kind: "wager",
          currencyKind: "credit",
          limitAmount: "1000",
          attemptedAmount: "2000",
          reason: "bet_stake",
        },
      },
      {
        event_kind: "bet_placed",
        payload: {
          game: "crash",
          betId: randomUUID(),
          currencyKind: "credit",
          stake: "1",
        },
      },
      {
        event_kind: "bet_settled",
        payload: {
          game: "plinko",
          betId: randomUUID(),
          currencyKind: "credit",
          status: "lost",
          stake: "1",
          payout: "0",
        },
      },
    ];

    for (const s of samples) {
      expect(() => AccountEvent.parse(s)).not.toThrow();
    }
  });
});
