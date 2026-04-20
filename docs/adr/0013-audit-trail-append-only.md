# ADR-0013 · Audit-trail tables are append-only at the DB level

**Status:** accepted · 2026-04-20

## Context

Phase 8 adds three audit tables that record things the business must be able to reconstruct long after the fact: `account_events` (user-lifecycle events — signup, login, bet_placed, limit_set, etc.), `user_geo_events` (IP/geo/ASN at signup and login), and `wallet_limits` (responsible-gaming limit declarations). ADR-0005 already treats the `transactions` ledger as append-only, enforced by `REVOKE UPDATE, DELETE` plus a `BEFORE UPDATE/DELETE` trigger. The three new tables have the same property for the same reason: an audit record that a route handler can "fix" after the fact is worth nothing — regulators, ops investigations, and post-incident forensics all need the original row. Typed writes alone (Zod on the `account_events.payload` column, see ADR-0012's sibling on discriminated unions) guarantee the row is well-formed at insert time, but not that it is immutable after insert.

## Decision

Every audit table gets two enforcement layers applied in migration 0004, matching the `transactions` pattern from migration 0001:

- **`REVOKE UPDATE, DELETE ON <table> FROM PUBLIC`.** The application DB user inherits from PUBLIC, so a stray `UPDATE` or `DELETE` issued by any route or server action fails at authorization before it reaches the trigger. This is the belt.
- **`BEFORE UPDATE` + `BEFORE DELETE` triggers** that `RAISE EXCEPTION 'table_name is append-only (see ADR-0013)'`. These catch mutations issued by a role that has the grants (e.g. the migration runner, or a future superuser debugging session) and fail with a message a reader can grep. This is the suspenders.

Corrections to an audit row are always compensating inserts — a new row that references the original. The original is never edited. This mirrors the `transactions` ledger convention and means the full audit history is recoverable by reading the table in `created_at` order.

The Zod discriminated union for `account_events.payload` (`src/lib/events/schema.ts`) and the typed `writeAccountEvent(tx, userId, event)` helper (`src/lib/events/write.ts`) enforce well-formed writes at the application boundary — together with the DB-level append-only enforcement, the invariant is: *every row in these tables was valid at insert time and has not been altered since*. The `writeAccountEvent` signature requires a `DbTx` as the first argument rather than defaulting to the top-level `db`, so an event is never written for a transaction that can subsequently roll back independently — event writes compose into the same transaction as the action they describe.

## Consequences

- **Positive:** the invariant is enforced at two layers — authorization and trigger — so any code path that tries to mutate an audit row fails loudly, even if one layer is misconfigured (e.g. a future role grant change). Regulators and investigations can trust the table's contents without a separate proof-of-immutability story. Correcting a mistake is a compensating insert, which is itself audited. The `tx` parameter on `writeAccountEvent` forecloses the partial-write class of bug where the event commits but the money action rolls back (or vice versa).
- **Negative:** migrations that legitimately need to rewrite audit rows (e.g. the idempotency-key prefix backfill in migration 0004) must `DISABLE TRIGGER` for the one statement and then re-enable. This requires the table-owner role, which only the migration user has — app connections never see the trigger disabled. The cost is one extra line per such migration and a comment explaining why it's necessary.
- **Reversible:** the triggers and REVOKEs are mechanical to add/remove. The real cost of reversal is giving up the guarantee — any code written assuming append-only audit would then need re-auditing against a mutable store.
