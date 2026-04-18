# ADR-0005 · Wallet invariant: single-path mutation + append-only ledger

**Status:** accepted · 2026-04-18

## Context

Balance correctness is the single most important invariant in a casino — even a play-money one, because the habits established here translate directly if we ever take real money. Common failure modes: concurrent bets causing double-spend, partial writes leaving balance and transaction log out of sync, "fix" UPDATEs that silently rewrite history, and ad-hoc mutations from routes that bypass the ledger.

## Decision

- **Single mutation path:** `src/lib/wallet/transact.ts` exports one function that takes `(userId, delta, reason, metadata)` and runs an atomic Drizzle transaction that (a) locks the user row with `SELECT ... FOR UPDATE`, (b) checks the new balance is non-negative, (c) updates `users.balance`, and (d) inserts a `transactions` row. No other code writes to `users.balance`.
- **Append-only ledger:** the `transactions` table has no update or delete path. Migration 0001 revokes `UPDATE, DELETE ON transactions` from the application DB user. Corrections are new compensating rows, not edits.
- **Idempotency:** `transact(..., idempotency_key)` is a required arg for any server-action-originated call. The key is unique per `(user_id, key)` and duplicate calls return the first result.
- **Rate limit:** every call is throttled per user before reaching `transact.ts` (dev: in-memory; prod: Upstash).

## Consequences

- **Positive:** one file owns the invariant; one audit target. Double-spend is structurally prevented by the row lock. Ledger integrity is enforced by the DB, not by code review. Replays are safe because of idempotency keys.
- **Negative:** every game route must import from `transact.ts` and must pass an idempotency key — slightly more ceremony than a bare `UPDATE`. Worth it.
- **Reversible:** not meaningfully. This is foundational; changing it would require rewriting every game route.
