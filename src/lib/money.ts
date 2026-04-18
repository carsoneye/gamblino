export const MICRO_PER_CREDIT = 1_000_000n;

export function formatCredits(micro: bigint): string {
  const whole = micro / MICRO_PER_CREDIT;
  return new Intl.NumberFormat("en-US").format(whole);
}
