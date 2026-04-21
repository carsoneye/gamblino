# ADR-0016 · Wallet limits — regulatory asymmetry, lazy effective events, and scope split

**Status:** accepted · 2026-04-20

## Context

`wallet_limits` shipped as schema in Phase 8's T1 migration, but the semantics around *when* a limit change takes effect, *how* "effective" is observed, and *which* kinds are enforced in transact vs. elsewhere were left to this ticket. Three design pressures collided:

- **Regulatory asymmetry.** A user in a moment of impulse — frustration, compulsion, panic — can swing the slider in either direction. Patterns that let a user raise their wager cap instantly but force a cool-off on lowering favor the casino; patterns that do the opposite also exist, motivated by "don't let someone accidentally lock themselves out of their own account." The business chose the latter.
- **Lazy vs. scheduled effectiveness.** Once a delayed change's `effective_at` passes, the audit log needs a `limit_effective` event to mark the transition — otherwise Phase 11 farming-detection queries can't distinguish "user has a limit" from "user has an active limit". Scheduling that event requires a cron/worker; we don't have one yet.
- **Enforcement heterogeneity.** The four limit kinds (`wager`, `deposit`, `loss`, `session_length_min`) look symmetric in the schema but require very different enforcement paths. Wager is per-operation; loss is a rolling-window aggregate; session is a time-based disconnect. Treating them uniformly in T5 would either overscope the ticket or ship broken enforcement.

## Decision

- **Asymmetric `effective_at`.** `setWalletLimit(input)` compares the new amount to the current active limit for the same `(userId, currencyKind, kind)`. If there is no active limit, or `amount > active.amount`, the new row gets `effective_at = now()` and `delayed = false` ("raising"). If `amount < active.amount`, the new row gets `effective_at = now() + 24h` and `delayed = true` ("lowering"). Equal amounts throw `LimitUnchangedError` — no no-op rows in the append-only table. This follows the spec literal: lower-delayed, raise-immediate, justified by "preventing impulse-driven self-harm" in the sense of panic-lowering.
- **Lazy `limit_effective` firing, race-safe at the DB.** Instead of a cron that wakes at every pending `effective_at`, `fireNewlyEffectiveLimitWithin(tx, userId, currencyKind, kind, at?)` runs on the wallet-op hot path (the kinds we enforce — see below). It reads the current active limit row and attempts to insert a `limit_effective` event carrying that row's `limitId`. A unique partial index — `account_events_limit_effective_once ON account_events((payload->>'limitId')) WHERE kind='limit_effective'` — deduplicates at the database layer. The insert runs inside a SAVEPOINT so a unique-violation on a concurrent write rolls back only the event insert, not the caller's outer transaction.
- **Scope split: enforce wager + deposit in T5; stub loss + session.**
  - **Wager** is per-operation — enforce on `bet_stake` debits. Reject with `LimitBreachError` before the balance mutation, write a typed `limit_breach_rejected` event in a separate transaction after the main one rolls back (so the audit signal survives the rejection), re-throw.
  - **Deposit** is also per-operation in the current model — enforce on `daily_grant` credits, same shape as wager. When real-money deposits ship post-license they layer in at the same call site.
  - **Loss** needs a rolling-window sum of net-negative movements over 24h/7d/30d. Different query path. Deferred to **T5.5** (tracked as a follow-up ticket before Phase 9).
  - **Session-time** needs a session-start timestamp on the auth/WS layer plus a disconnect path when exceeded. Shipping with **T9** (WS auth + channels).

  Loss and session-time limits are still settable today — the row writes, `limit_set` event fires, the audit trail captures the user's intent. They just aren't enforced on wallet ops yet. The UI surfaces this with an explicit "enforcement ships with T5.5 / T9" disclosure beside the form so the contract to the user is truthful.

- **Audit integrity around rejection.** `limit_breach_rejected` is written in a separate `db.transaction()` *after* the main transact tx rolls back with the throw. The alternative — writing inside the failed tx — would roll back the audit row with the rejection, losing the Phase 11 farming signal entirely. If the audit write itself fails, it is logged via Pino but not re-thrown — the original `LimitBreachError` always reaches the caller so the wallet op's rejection semantics are preserved.

## Consequences

- **Positive:** The 24-hour cool-off on lowering is enforced structurally at the row level, not trusted to UI code. `limit_effective` events are exactly-once per limit row thanks to the unique partial index, so the audit log shape is predictable for Phase 11 queries. The scope split means T5 ships working enforcement for the two kinds that are structurally ready without faking it for the two that aren't — loss and session have clean TODOs pointing at their real-work tickets, rather than silent no-ops that a future engineer would have to untangle.
- **Negative:** The wager + deposit checks add one SELECT per applicable wallet op for the active limit, plus one savepoint-wrapped INSERT for the lazy `limit_effective` firing. Indexed and cheap, but non-zero. The lazy firing model means a `limit_effective` event can be delayed arbitrarily if the user doesn't hit a wallet op — acceptable for audit purposes, potentially surprising for a Phase 11 query that joins on "is this limit active" and gets a row back but no transition event. Phase 11 should compute "active" from `wallet_limits.effective_at <= now()`, not from the presence of `limit_effective`; the event is a transition marker, not a state marker.
- **Reversible:** Switching the asymmetry direction is a single comparison flip in `setWalletLimitWithin`. Introducing a scheduled worker for `limit_effective` firing is additive — remove the lazy call sites, add a cron that runs `fireNewlyEffectiveLimitWithin` per pending row. Extending enforcement to loss/session is a T5.5/T9 concern and does not touch this ADR's invariants.
