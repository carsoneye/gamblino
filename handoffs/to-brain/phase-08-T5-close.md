# Phase 08 · T5 close

```
Ticket: T5
Commit: db17dde
Files:
  - drizzle/migrations/0006_square_logan.sql (+ meta snapshot + journal)
  - src/db/schema.ts (walletLimitKind += 'wager'; accountEventKind += 'limit_breach_rejected'; account_events unique partial index on (payload->>'limitId') WHERE kind='limit_effective')
  - src/lib/events/schema.ts (LimitKindEnum += 'wager'; limitId + delayed on LimitSetPayload; limitId on LimitEffectivePayload; new LimitBreachRejectedPayload + union variant)
  - src/lib/events/schema.test.ts (test updates for new required fields + new LimitBreachRejected coverage)
  - src/lib/wallet/limits.ts (new — getActiveLimit + setWalletLimit + fireNewlyEffectiveLimit + LimitBreachError + LimitUnchangedError)
  - src/lib/wallet/limits.test.ts (new — 16 unit tests: asymmetry boundaries, active-limit read path, firing idempotence)
  - src/lib/wallet/limits.props.test.ts (new — 3 fast-check properties: active-at-T invariant, lowering-yields-later-effective-at, raising-is-immediate)
  - src/lib/wallet/transact.ts (wager enforcement on bet_stake; deposit enforcement on daily_grant; TODO stubs for loss/session)
  - src/lib/wallet/transact.test.ts (+7 integration tests: wager breach, deposit breach, limit_effective fire-once, regression for loss/session persistence)
  - src/app/(app)/casino/limits/page.tsx (new — server-rendered form, active + pending display, enforcement-coming-soon disclosures on loss/session)
  - src/app/(app)/casino/limits/actions.ts (new — setLimitAction server action, parses amount per kind, catches LimitUnchangedError quietly)
  - src/app/(app)/casino/limits/limit-form.tsx (new — client component using useActionState)
  - docs/adr/0016-wallet-limits-regulatory-asymmetry.md (new)
```

## Architectural decisions made during execution (beyond original spec)

- **Scope split — wager + deposit enforce; loss + session scaffolded only.** Mid-ticket scope clarification from Carson confirmed that loss-limit enforcement needs rolling-window aggregation (deferred to T5.5) and session-time enforcement needs auth/WS session-start wiring (deferred to T9). Schema ships all four kinds. UI lets users set all four. transact.ts enforces only wager and deposit. Loss and session rows write cleanly and fire `limit_set` events; they simply don't block wallet ops yet. Stub `TODO(T5.5)` and `TODO(T9)` comments mark the enforcement call sites in transact.ts so the future tickets know exactly where to land.
- **Asymmetry: literal spec implementation.** `setWalletLimit` compares new amount to current active limit (not to pending). `amount > active.amount` OR no active → immediate (delayed=false). `amount < active.amount` → `now() + 24h` (delayed=true). `amount == active.amount` throws `LimitUnchangedError` — no no-op rows in the append-only table. The spec read literally ("lower-delayed, raise-immediate, preventing impulse-driven self-harm") — the "self-harm" read here is panic-lowering (user impulsively locks themselves out), not compulsive-raising. Either interpretation has defensible policy grounding; matches the literal letter of the spec.
- **`limit_effective` firing — lazy + race-safe via unique partial index.** No cron. On every wallet op that touches an enforced kind (bet_stake → wager; daily_grant → deposit), call `fireNewlyEffectiveLimitWithin` which SELECTs the currently-active limit row and tries to insert a `limit_effective` event with that row's `limitId`. The unique partial index `account_events_limit_effective_once ON (payload->>'limitId') WHERE kind='limit_effective'` makes this exactly-once at the DB. The insert is wrapped in a SAVEPOINT (`tx.transaction(async (sp) => ...)`) so a unique-violation rolls back only the event insert and not the caller's outer transact tx.
- **`limit_breach_rejected` written outside the rolled-back tx.** Main transact tx throws `LimitBreachError` before the balance mutation. The outer `transact()` wrapper catches, opens a fresh `db.transaction()` to write the rejection audit event, then re-throws so the caller sees the breach. Writing the event inside the failing tx would have rolled it back along with the debit — the Phase 11 farming-detection signal would be lost. Audit-write failure is logged via Pino but not re-thrown; the original breach error always reaches the caller so rejection semantics are preserved.
- **Wallet_limits is append-only → test uses `at` parameter for time travel.** Initial test for "fires a new event when a pending lower-delayed limit becomes effective" tried to backdate a row with `UPDATE wallet_limits SET effective_at = now() - interval '1 minute'`. Blocked by ADR-0013's trigger. Fix: `fireNewlyEffectiveLimitWithin` takes an optional `at: Date` parameter defaulting to `new Date()`. Test passes `Date(now + 24h + 1min)` to simulate the delay passing. Same pattern available to `getActiveLimit` call sites if Phase 11 needs historical-as-of queries.
- **UI — `unit` distinction per kind.** Wager/deposit/loss take currency-string amounts via `parseAmount(input, "credit")` (display → micro-credits). session_length_min takes raw integer minutes. The limits/actions.ts server action branches on kind before calling `parseAmount`. UI surfaces unit suffix ("credits" vs "min") and placeholders accordingly. No client-side optimism on submit — `useActionState` pushes a SetLimitState back from the server action with `ok`/`info`/`error` and the page re-renders with fresh data via `revalidatePath("/casino/limits")`.
- **isUniqueViolation cause-walk reused.** Same shape as T7's magic-link-first-load helper — walks `err.cause` chain because Drizzle wraps PostgresError in DrizzleQueryError. Still flagging that `src/lib/auth/signup.ts` has the shallow version of this check (T7 retro flag, still open).

## Tests

127 passing across 12 files (was 100; +27 for T5). Breakdown:

- `src/lib/wallet/limits.test.ts` — 16 tests: asymmetry boundaries (first-set, raise, lower, unchanged-throws, negative-rejected, limit_set event payload), getActiveLimit read-path (no limit, set, future-pending hidden, time-travel reveal, per-currency isolation, per-kind isolation), fireNewlyEffectiveLimit (first-call writes, idempotent on repeat, no-op on no-limit, pending-becomes-effective via at-parameter).
- `src/lib/wallet/limits.props.test.ts` — 3 fast-check properties: active-at-time-T invariant (`numRuns=5`, randomized bigint sequences with duplicate-collapse guard against `LimitUnchangedError`), lowering-yields-later-effective-at (`numRuns=8`), raising-is-immediate (`numRuns=8`).
- `src/lib/wallet/transact.test.ts` — 7 new integration tests for limit enforcement, plus regression guard that loss/session rows persist without blocking transact ops.
- `src/lib/events/schema.test.ts` — updated for new required fields on LimitSet/LimitEffective + new LimitBreachRejected variant.

## Notes for phase retro

- **SAVEPOINT pattern is the right tool for "try-insert inside a larger tx".** First attempt used a flat try/catch inside the tx, which poisoned the transaction state on unique-violation (next statement fails with "current transaction is aborted"). The nested `tx.transaction()` creates a PG SAVEPOINT, which rolls back cleanly on error and lets the outer tx continue. Two failures caught this pattern in testing — if the same shape shows up in T8+, use the SAVEPOINT wrapper from the start.
- **Append-only trigger blocks test-side time travel.** The `wallet_limits` append-only trigger (ADR-0013) is correct in prod but forced a test-side workaround — pass `at: Date` into the read helpers rather than `UPDATE effective_at`. Worth codifying as a pattern: any time-dependent lookup should take an optional `at` parameter for historical/future-simulated queries, even if prod code always uses `new Date()`.
- **Scope split during a ticket is a real signal.** Carson's mid-ticket scope clarification (loss + session deferred) was triggered by the scope being more complex than the original spec implied. The ADR-0016 scope-split section exists to document this without it reading as a retreat — future tickets T5.5 and T9 have crisp entry points.
- **Reviewer has not yet seen T5.** Push is pending per the plan. If the review catches a real issue, the fix lands on top in a separate commit following the T7 pattern (`feat` for the feature, `fix(*)` for the review response).
- **isUniqueViolation cause-walk remains a pending chore.** Two files now use the cause-walking version (magic-link-first-load.ts, limits.ts). One file (src/lib/auth/signup.ts) still has the shallow version. Worth normalizing with a shared helper in `src/lib/db/errors.ts` or similar — but out of T5 scope.
