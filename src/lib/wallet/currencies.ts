import type { currencyKind } from "@/db/schema";

export type CurrencyKind = (typeof currencyKind.enumValues)[number];

export const CURRENCY_UNITS: Record<CurrencyKind, bigint> = {
  credit: 1_000_000n,
  usd: 100n,
  usdt: 1_000_000n,
  usdc: 1_000_000n,
  btc: 100_000_000n,
  eth: 1_000_000_000_000_000_000n,
};

export const DISPLAY_DECIMALS: Record<CurrencyKind, number> = {
  credit: 2,
  usd: 2,
  usdt: 2,
  usdc: 2,
  btc: 8,
  eth: 4,
};

export type ParseAmountErrorCode =
  | "empty"
  | "negative"
  | "scientific"
  | "non_canonical"
  | "too_many_decimals";

export class ParseAmountError extends Error {
  readonly code: ParseAmountErrorCode;
  readonly input: string;
  readonly currency: CurrencyKind;

  constructor(code: ParseAmountErrorCode, input: string, currency: CurrencyKind) {
    super(`parseAmount: ${code} (input=${JSON.stringify(input)}, currency=${currency})`);
    this.code = code;
    this.input = input;
    this.currency = currency;
    this.name = "ParseAmountError";
  }
}

function unitDecimalsOf(unit: bigint): number {
  if (unit === 1n) return 0;
  return unit.toString().length - 1;
}

export function formatAmount(amount: bigint, currency: CurrencyKind): string {
  const unit = CURRENCY_UNITS[currency];
  const decimals = DISPLAY_DECIMALS[currency];
  const negative = amount < 0n;
  const abs = negative ? -amount : amount;

  const scale = 10n ** BigInt(decimals);
  const half = unit / 2n;
  const scaled = (abs * scale + half) / unit;

  const wholePart = scaled / scale;
  const fracPart = scaled % scale;

  const wholeStr = new Intl.NumberFormat("en-US").format(wholePart);
  const fracStr = decimals > 0 ? `.${fracPart.toString().padStart(decimals, "0")}` : "";

  return `${negative ? "-" : ""}${wholeStr}${fracStr}`;
}

export function parseAmount(input: string, currency: CurrencyKind): bigint {
  if (input.length === 0) throw new ParseAmountError("empty", input, currency);
  if (input.startsWith("-")) throw new ParseAmountError("negative", input, currency);
  if (/[eE]/.test(input)) throw new ParseAmountError("scientific", input, currency);
  if (!/^\d+(\.\d+)?$/.test(input)) {
    throw new ParseAmountError("non_canonical", input, currency);
  }

  const unit = CURRENCY_UNITS[currency];
  const unitDecimals = unitDecimalsOf(unit);
  const [wholeStr, fracStr = ""] = input.split(".");
  if (fracStr.length > unitDecimals) {
    throw new ParseAmountError("too_many_decimals", input, currency);
  }

  const paddedFrac = fracStr.padEnd(unitDecimals, "0");
  return BigInt(wholeStr) * unit + BigInt(paddedFrac || "0");
}
