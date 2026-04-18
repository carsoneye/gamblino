# ADR-0002 · No slot / live-dealer aggregation in v1

**Status:** accepted · 2026-04-18

## Context

Every major crypto casino (Stake, Rainbet, Roobet, etc.) serves a near-identical catalog of slots and live-dealer tables because they all integrate the same third-party providers (Pragmatic Play, Hacksaw Gaming, Push Gaming, Evolution, etc.). That catalog is commodity — it cannot be a source of differentiation. Meanwhile, provider integrations require B2B contracts, KYC on the operator side, revenue splits, and a real-money processing pipeline we are explicitly out of scope for as a play-money social casino.

## Decision

Ship zero third-party provider integrations in v1. The casino's catalog consists only of our three originals: Crash, Mines, Plinko. `/casino` renders placeholder cards for future slot/live categories but those categories are non-functional until post-v1.

## Consequences

- **Positive:** differentiation forced onto (a) original game feel and (b) the design system — the two things we actually control. No B2B contracts, no KYC, no revenue-share accounting. Smaller attack surface and smaller legal surface.
- **Negative:** catalog appears thin to anyone evaluating against Stake et al. Mitigated by a strong landing/originals experience and by making the thinness feel intentional (editorial, not under-built).
- **Reversible:** slot aggregation can be added later behind a `FLAG_SLOTS` flag and a provider-adapter interface; the decision does not paint us into a corner.
