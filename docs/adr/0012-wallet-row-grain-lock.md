# ADR-0012 · Wallet-row-grain lock + bounded transaction timeout

**Status:** accepted · 2026-04-20

## Context

ADR-0005 and ADR-0008 fixed the wallet invariant on a per-user row lock: `SELECT ... FOR UPDATE` on `users` serialized every balance mutation for a user. That was correct when a user had exactly one balance. Phase 8 introduces the `wallets` table keyed by `(user_id, currency_kind)` — post-real-money, one user will have up to six wallets (credit, usd, usdt, usdc, btc, eth). A per-user lock would serialize a credit-game bet settlement behind an unrelated BTC deposit settlement on the same user, which is both wrong (no shared invariant) and a latency cliff under load. Separately, a pessimistic lock on a contended row can wait indefinitely before any per-statement timeout starts, so an unbounded `SELECT FOR UPDATE` can hang a request queue for as long as the contending transaction holds the row.

## Decision

- **Lock grain moves to the wallet row.** `transactWithin` now issues `SELECT balance FROM wallets WHERE user_id = $1 AND currency_kind = $2 FOR UPDATE`. Concurrent transacts on different currencies of the same user run in parallel; concurrent transacts on the same `(user_id, currency_kind)` pair serialize. Balance reads and updates both target `wallets.balance`; `users.balance` is no longer written — a follow-up migration drops the column once every reader is gone.
- **Transactions are bounded by `statement_timeout = 5s`, set as the first statement inside the Drizzle transaction.** `SET LOCAL statement_timeout = '5s'` runs before any `SELECT`, so the lock-acquisition call itself is bounded — a stuck contender fails fast with a statement-timeout rather than wedging the request. `SET LOCAL` scopes the change to the transaction and auto-resets at COMMIT/ROLLBACK, so there is no connection-level state leak.
- **Wallet rows are provisioned on demand.** If the `SELECT FOR UPDATE` returns no rows, we verify the user exists (throwing `UserNotFoundError` if not), insert a zero-balance wallet row with `ON CONFLICT DO NOTHING`, then re-issue the lock. First-use for a new currency never fails with a missing-row error.
- **Idempotency scope stays per-user.** The `transactions.idempotency_key` unique index is `(user_id, idempotency_key)`, not `(user_id, currency_kind, idempotency_key)`. Keys from clients (`cli_`) and server-originated replays (`srv_`) are collision-free at the user scope; cross-currency reuse of the same key is a caller bug.

## Consequences

- **Positive:** concurrent bets across currencies for one user no longer serialize. A hot wallet (credit-game play) cannot head-of-line-block an unrelated currency's settlement. Lock waits are bounded, so a pathological contender (slow game route holding a wallet row) surfaces as a per-request failure instead of a cluster-wide hang. Ledger semantics are unchanged — the append-only transactions log and the non-negative-balance CHECK still hold.
- **Negative:** every `transactWithin` call now runs one extra round-trip in the wallet-missing path (verify user + insert + re-lock). This is a one-time cost per `(user, currency)` pair and does not affect the common path. `statement_timeout = 5s` is a hardcoded value; if game logic grows a transaction that legitimately needs longer than 5s inside `transact`, we raise it or split the work — the cap is a forcing function, not a limit to work around.
- **Reversible:** the lock grain is an implementation detail behind `transactWithin`. Reverting to a user-row lock is mechanical. The `5s` bound is a one-character change. Neither affects the public API shape frozen in ADR-0008.
