import { describe, expect, it } from "bun:test";
import { randomUUID } from "node:crypto";
import {
  AccountEvent,
  BetPlacedPayload,
  BetSettledPayload,
  DailyGrantClaimedPayload,
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

  it("LimitSetPayload requires ISO8601 effectiveAt", () => {
    const ok = LimitSetPayload.parse({
      kind: "deposit",
      currencyKind: "credit",
      amount: "1000000",
      effectiveAt: "2026-04-20T00:00:00.000Z",
    });
    expect(ok.kind).toBe("deposit");

    expect(() =>
      LimitSetPayload.parse({
        kind: "deposit",
        currencyKind: "credit",
        amount: "1000000",
        effectiveAt: "not-a-date",
      }),
    ).toThrow();
  });

  it("LimitEffectivePayload has no effectiveAt — it IS effective", () => {
    expect(
      LimitEffectivePayload.parse({ kind: "loss", currencyKind: "credit", amount: "500" }),
    ).toEqual({ kind: "loss", currencyKind: "credit", amount: "500" });

    expect(() =>
      LimitEffectivePayload.parse({
        kind: "loss",
        currencyKind: "credit",
        amount: "500",
        effectiveAt: "2026-04-20T00:00:00.000Z",
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

  it("accepts all 8 kinds declared in the DB enum", () => {
    const samples = [
      { event_kind: "signup", payload: { source: "credentials" } },
      { event_kind: "login", payload: { method: "magic_link" } },
      { event_kind: "logout", payload: {} },
      { event_kind: "daily_grant_claimed", payload: { currencyKind: "credit", amount: "0" } },
      {
        event_kind: "limit_set",
        payload: {
          kind: "deposit",
          currencyKind: "credit",
          amount: "0",
          effectiveAt: "2026-04-20T00:00:00.000Z",
        },
      },
      {
        event_kind: "limit_effective",
        payload: { kind: "loss", currencyKind: "credit", amount: "0" },
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
