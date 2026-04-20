"use client";

import { useState } from "react";
import { BetControls, type BetPhase } from "@/components/game/bet-controls";
import { CURRENCY_UNITS } from "@/lib/wallet/currencies";

const BALANCE = 10_000n * CURRENCY_UNITS.credit;

export function BetControlsDemo({ phase }: { phase: BetPhase }) {
  const [stake, setStake] = useState<bigint>(25n * CURRENCY_UNITS.credit);

  return (
    <BetControls
      balance={BALANCE}
      stake={stake}
      onStakeChange={setStake}
      onPlaceBet={() => {}}
      onCashOut={() => {}}
      phase={phase}
    />
  );
}
