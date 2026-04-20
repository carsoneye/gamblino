import { describe, expect, it } from "bun:test";
import { CURRENCY_UNITS } from "@/lib/wallet/currencies";
import { SIGNUP_BONUS_CREDITS, SIGNUP_BONUS_MICRO } from "./signup-bonus";

describe("signup bonus constants", () => {
  it("grants 10,000 credits in micro-credits", () => {
    expect(SIGNUP_BONUS_CREDITS).toBe(10_000n);
    expect(SIGNUP_BONUS_MICRO).toBe(10_000n * CURRENCY_UNITS.credit);
    expect(SIGNUP_BONUS_MICRO).toBe(10_000_000_000n);
  });

  it("credit unit is 1_000_000 micro", () => {
    expect(CURRENCY_UNITS.credit).toBe(1_000_000n);
  });
});
