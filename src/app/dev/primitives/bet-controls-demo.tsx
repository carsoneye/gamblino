"use client";

import { useState } from "react";
import { BetControls, type BetPhase } from "@/components/game/bet-controls";
import { MICRO_PER_CREDIT } from "@/lib/money";

const BALANCE = 10_000n * MICRO_PER_CREDIT;

export function BetControlsDemo({ phase }: { phase: BetPhase }) {
  const [stake, setStake] = useState<bigint>(25n * MICRO_PER_CREDIT);

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
