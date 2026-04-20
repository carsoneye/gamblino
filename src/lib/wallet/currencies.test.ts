import { describe, expect, it } from "bun:test";
import {
  CURRENCY_UNITS,
  DISPLAY_DECIMALS,
  formatAmount,
  ParseAmountError,
  parseAmount,
} from "./currencies";

describe("CURRENCY_UNITS", () => {
  it("matches the locked spec (smallest-unit per whole)", () => {
    expect(CURRENCY_UNITS.credit).toBe(1_000_000n);
    expect(CURRENCY_UNITS.usd).toBe(100n);
    expect(CURRENCY_UNITS.usdt).toBe(1_000_000n);
    expect(CURRENCY_UNITS.usdc).toBe(1_000_000n);
    expect(CURRENCY_UNITS.btc).toBe(100_000_000n);
    expect(CURRENCY_UNITS.eth).toBe(1_000_000_000_000_000_000n);
  });
});

describe("DISPLAY_DECIMALS", () => {
  it("matches the locked display policy", () => {
    expect(DISPLAY_DECIMALS.credit).toBe(2);
    expect(DISPLAY_DECIMALS.usd).toBe(2);
    expect(DISPLAY_DECIMALS.usdt).toBe(2);
    expect(DISPLAY_DECIMALS.usdc).toBe(2);
    expect(DISPLAY_DECIMALS.btc).toBe(8);
    expect(DISPLAY_DECIMALS.eth).toBe(4);
  });
});

describe("formatAmount", () => {
  it("credits: whole and fractional", () => {
    expect(formatAmount(0n, "credit")).toBe("0.00");
    expect(formatAmount(1_000_000n, "credit")).toBe("1.00");
    expect(formatAmount(10_500_000n, "credit")).toBe("10.50");
    expect(formatAmount(10_000_000_000n, "credit")).toBe("10,000.00");
  });

  it("credits: rounds half-up at 2-decimal boundary", () => {
    expect(formatAmount(4_999n, "credit")).toBe("0.00");
    expect(formatAmount(5_000n, "credit")).toBe("0.01");
    expect(formatAmount(994_999n, "credit")).toBe("0.99");
    expect(formatAmount(995_000n, "credit")).toBe("1.00");
  });

  it("usd: 2-decimal native precision", () => {
    expect(formatAmount(0n, "usd")).toBe("0.00");
    expect(formatAmount(105n, "usd")).toBe("1.05");
    expect(formatAmount(100_000n, "usd")).toBe("1,000.00");
  });

  it("btc: full 8-decimal satoshi resolution", () => {
    expect(formatAmount(0n, "btc")).toBe("0.00000000");
    expect(formatAmount(1n, "btc")).toBe("0.00000001");
    expect(formatAmount(123_456_789n, "btc")).toBe("1.23456789");
    expect(formatAmount(100_000_000n, "btc")).toBe("1.00000000");
  });

  it("eth: truncates 18-dec wei to 4-decimal display with half-up rounding", () => {
    expect(formatAmount(0n, "eth")).toBe("0.0000");
    expect(formatAmount(1_000_000_000_000_000_000n, "eth")).toBe("1.0000");
    expect(formatAmount(1_234_567_890_123_456_789n, "eth")).toBe("1.2346");
    expect(formatAmount(999_950_000_000_000_000n, "eth")).toBe("1.0000");
    expect(formatAmount(999_949_999_999_999_999n, "eth")).toBe("0.9999");
  });

  it("handles negative amounts with sign prefix", () => {
    expect(formatAmount(-10_500_000n, "credit")).toBe("-10.50");
    expect(formatAmount(-105n, "usd")).toBe("-1.05");
    expect(formatAmount(-1n, "btc")).toBe("-0.00000001");
  });
});

describe("parseAmount — accepts canonical forms", () => {
  it("credits: integer + fractional", () => {
    expect(parseAmount("0", "credit")).toBe(0n);
    expect(parseAmount("1", "credit")).toBe(1_000_000n);
    expect(parseAmount("10.5", "credit")).toBe(10_500_000n);
    expect(parseAmount("10.500000", "credit")).toBe(10_500_000n);
    expect(parseAmount("0.000001", "credit")).toBe(1n);
  });

  it("usd: 2 fractional digits max", () => {
    expect(parseAmount("1.05", "usd")).toBe(105n);
    expect(parseAmount("1.00", "usd")).toBe(100n);
    expect(parseAmount("1.0", "usd")).toBe(100n);
    expect(parseAmount("1", "usd")).toBe(100n);
  });

  it("btc: up to 8 fractional digits", () => {
    expect(parseAmount("0.00000001", "btc")).toBe(1n);
    expect(parseAmount("1.23456789", "btc")).toBe(123_456_789n);
  });

  it("eth: up to 18 fractional digits", () => {
    expect(parseAmount("1", "eth")).toBe(1_000_000_000_000_000_000n);
    expect(parseAmount("0.000000000000000001", "eth")).toBe(1n);
  });
});

describe("parseAmount — rejects with typed errors", () => {
  const rejects = (
    input: string,
    currency: Parameters<typeof parseAmount>[1],
    code: ParseAmountError["code"],
  ) => {
    try {
      parseAmount(input, currency);
      throw new Error(`expected ParseAmountError code=${code} but parse succeeded`);
    } catch (e) {
      expect(e).toBeInstanceOf(ParseAmountError);
      expect((e as ParseAmountError).code).toBe(code);
      expect((e as ParseAmountError).input).toBe(input);
      expect((e as ParseAmountError).currency).toBe(currency);
    }
  };

  it("empty string", () => rejects("", "credit", "empty"));
  it("negative", () => rejects("-1", "credit", "negative"));
  it("negative with decimals", () => rejects("-0.5", "usd", "negative"));
  it("scientific notation lowercase", () => rejects("1e5", "credit", "scientific"));
  it("scientific notation uppercase", () => rejects("1.5E10", "eth", "scientific"));
  it("locale-formatted with thousands comma", () => rejects("1,000", "usd", "non_canonical"));
  it("trailing dot", () => rejects("1.", "credit", "non_canonical"));
  it("leading dot", () => rejects(".5", "credit", "non_canonical"));
  it("multiple dots", () => rejects("1.2.3", "credit", "non_canonical"));
  it("whitespace", () => rejects(" 1", "credit", "non_canonical"));
  it("trailing whitespace", () => rejects("1 ", "credit", "non_canonical"));
  it("alphabetic", () => rejects("abc", "credit", "non_canonical"));
  it("too many decimals: usd 3", () => rejects("1.005", "usd", "too_many_decimals"));
  it("too many decimals: btc 9", () => rejects("0.000000001", "btc", "too_many_decimals"));
  it("too many decimals: credit 7", () => rejects("0.0000001", "credit", "too_many_decimals"));
});

describe("parseAmount ∘ formatAmount round-trip", () => {
  it("canonical-form amounts survive format→parse without loss when precision aligns", () => {
    const cases: Array<[bigint, Parameters<typeof parseAmount>[1]]> = [
      [0n, "credit"],
      [1_000_000n, "credit"],
      [105n, "usd"],
      [123_456_789n, "btc"],
    ];
    for (const [amount, currency] of cases) {
      const formatted = formatAmount(amount, currency);
      const parsed = parseAmount(formatted.replace(/,/g, ""), currency);
      expect(parsed).toBe(amount);
    }
  });
});
