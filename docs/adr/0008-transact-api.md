# ADR-0008 · `transact.ts` public API

**Status:** accepted · 2026-04-18

## Context

ADR-0005 fixed the invariant: one mutation path, append-only ledger, idempotency per `(user_id, key)`. Phase 5 implements that path. The API shape — what callers pass, what comes back, how failures surface — needs to be frozen now because every future game route depends on it. Phase 4's `grantSignupBonus` was a purpose-built variant; the generalization has to subsume it without a behavior change.

## Decision

- **Input:** `TransactInput { userId, delta: bigint, reason: TxReason, idempotencyKey?, betId?, metadata? }`. `delta` is signed micro-credits — debits are negative, credits are positive. `reason` is the existing `tx_reason` enum (`signup_bonus | bet_stake | bet_payout | adjustment`).
- **Result:** `TransactResult { balanceAfter, transactionId, deduped }`. `deduped === true` when an `idempotencyKey` hit an existing row — callers see the prior result, not a fresh mutation.
- **Failure modes:** `UserNotFoundError` (unknown `userId`) and `InsufficientBalanceError` (debit would drive balance negative). Both carry machine-readable `code` fields (`USER_NOT_FOUND`, `INSUFFICIENT_BALANCE`) so route handlers can map to HTTP status without string-matching.
- **Ordering within the tx:** `SELECT ... FOR UPDATE` on the user row comes first — this both resolves "does the user exist" and serializes concurrent calls. Idempotency lookup runs under the held lock, eliminating the double-insert race. Then the balance update + transactions insert. A single failed check rolls the whole Drizzle transaction back via thrown error.
- **Two entry points:** `transact(input)` opens a new Drizzle tx; `transactWithin(tx, input)` composes inside a caller's tx (used by `grantSignupBonusWithin` and, later, by game routes that also touch `bets`/`rounds` atomically).

## Consequences

- **Positive:** every money mutation becomes one line at the call site. The error types make route error handling explicit. The composed form (`transactWithin`) lets game routes atomically stake a bet + insert a bet row in one tx. Phase 4's signup bonus becomes a thin wrapper.
- **Negative:** callers must remember to pass an `idempotencyKey` for any externally-triggered call (HTTP, WS). We rely on code review + the Phase 5+ security review (CLAUDE.md rule) to catch missing keys; no DB-level enforcement.
- **Reversible:** API shape is meant to be stable. Adding optional fields is fine. Removing `transactWithin` or changing `delta` sign convention would break every game route.
