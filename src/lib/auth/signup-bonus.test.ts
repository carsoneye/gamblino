import { describe, expect, it } from "bun:test";
import { MICRO_PER_CREDIT } from "@/lib/money";
import { SIGNUP_BONUS_CREDITS, SIGNUP_BONUS_MICRO } from "./signup-bonus";

describe("signup bonus constants", () => {
  it("grants 10,000 credits in micro-credits", () => {
    expect(SIGNUP_BONUS_CREDITS).toBe(10_000n);
    expect(SIGNUP_BONUS_MICRO).toBe(10_000n * MICRO_PER_CREDIT);
    expect(SIGNUP_BONUS_MICRO).toBe(10_000_000_000n);
  });

  it("micro-per-credit is 1_000_000", () => {
    expect(MICRO_PER_CREDIT).toBe(1_000_000n);
  });
});
