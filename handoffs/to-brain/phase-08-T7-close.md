# Phase 08 · T7 close

```
Ticket: T7
Commits:
  - cad182a feat(events): phase 8 T7 — account_event + geo writers on signup/signin/logout
  - f609b97 fix(http): prefer x-real-ip over x-forwarded-for in getRequestContext
Files:
  - drizzle/migrations/0005_yellow_maestro.sql (+ meta snapshot + journal)
  - src/db/schema.ts (geo_event_source += 'logout'; account_events_signup_once unique partial index)
  - src/lib/geo/write.ts (new — writeUserGeoEvent)
  - src/lib/http/request-context.ts (new — getRequestContext with x-real-ip-first trust order)
  - src/lib/auth/magic-link-first-load.ts (new — ensureMagicLinkSignupRecorded with cause-walking unique-violation check)
  - src/lib/auth/magic-link-first-load.test.ts (new — 4 tests incl. fast-check N=10 concurrent stress)
  - src/lib/auth/signup.ts (wired — writeAccountEvent + writeUserGeoEvent inside existing signup tx)
  - src/app/(auth)/signin/actions.ts (wired — login event + geo after signIn success, audit-failure-tolerant)
  - src/components/shell/top-bar.tsx (wired — logout event + geo BEFORE signOut)
  - src/app/(app)/layout.tsx (wired — ensureMagicLinkSignupRecorded on every /casino GET)
```

## Architectural decisions made during execution (beyond original spec)

- **Unique partial index as the race-safe dedup primitive.** `account_events_signup_once ON account_events(user_id) WHERE kind='signup'` enforces "at most one signup event per user forever" at the DB layer. Cleaner than advisory locks or user-row SELECT-FOR-UPDATE because the invariant is exactly what a unique index expresses. Concurrent first loads both attempt the INSERT; one commits, the rest catch 23505 and return quiet. Ties into the T4-Issue-1 pattern (unreachable-under-semantics errors become evidence-over-code pushback when the reviewer flags them).
- **Added `'logout'` to `geo_event_source` enum.** Original enum had signup_credentials, signup_magic_link_first_load, login, ws_connect — no logout. Chose enum expansion over reusing "login" (misleading semantic) or skipping geo on logout (loses audit coverage). One-value enum additions via `ALTER TYPE ADD VALUE` are cheap.
- **`isUniqueViolation` walks the `err.cause` chain.** Drizzle wraps PostgresError in DrizzleQueryError, so `err.code === '23505'` lives on `.cause`, not the top-level error. The existing check in `src/lib/auth/signup.ts` (pre-T7) does NOT walk the chain — flagged as latent-buggy for a follow-up chore, not touched in T7 to keep the diff focused.
- **Three-state `reader` param on `writeUserGeoEvent`.** `undefined` → use `getEnvGeoReader()`; explicit `null` → skip lookup entirely; explicit reader → use it. Mirrors T6's injectable-factory pattern and keeps the helper testable without env coupling.
- **Null-geo-reader path writes the row anyway.** In dev without MAXMIND_DB_DIR, `getEnvGeoReader()` returns null and `writeUserGeoEvent` writes the row with null geo fields. Chose this over "skip row entirely" because audit-log gaps are worse than sparse rows — backfill can populate nulls later if we ever need it.
- **Audit-failure-tolerant auth boundaries.** signin, logout, and magic-link first-load wrap their audit writes in try/catch with `logger.error` fallback. Audit failure never blocks the user action. Credentials signup is the one exception — audit is inside the signup tx, so a failure rolls back user creation, which is correct for a new-user flow.
- **Magic-link returning-user login events intentionally NOT captured.** The layout.tsx dedup is keyed on "any signup event exists", which means returning magic-link users see no login event written. Clean hook would be NextAuth `events.signIn`, but that callback has no request context — geo capture from there requires plumbing a request store through NextAuth internals. Documented as a Phase 8b / Phase 11 gap, not a T7 bug.
- **IP-spoofing fix (T7 review response).** Original `getRequestContext` preferred `x-forwarded-for` first-hop over `x-real-ip`. On misconfigured self-host deployments, a client can send `X-Forwarded-For: fake.ip` and have it recorded verbatim. Fix: prefer `x-real-ip` (single-valued, platform-set, not client-forwardable in correctly configured ingress), fall back to XFF first-hop only if x-real-ip is absent. Docstring pins the trust model; full deploy-ingress hardening is a Phase 18 concern. Did not implement rightmost-non-private XFF traversal (needs `TRUSTED_PROXY_HOPS` env var or private-range CIDR parse — deployment complexity deferred).

## Tests

100 passing across 10 files (was 96 before T7). Four new tests in `src/lib/auth/magic-link-first-load.test.ts`:

1. First call writes signup account_event + matching geo event
2. Idempotent on repeat calls (fast-path SELECT short-circuits)
3. Does not re-fire for a user with a pre-existing credentials signup event
4. Fast-check stress: N=10 concurrent first loads commit exactly one signup+geo pair (numRuns=4 over random IP + userAgent)

## Notes for phase retro

- **Fast-check stress pattern from T4-Issue-1 ported verbatim as predicted.** `fc.asyncProperty` over randomized input → `Promise.all(N)` → assert exactly-one-commit invariant. The shape generalizes: the same skeleton will apply to T10 (WS auth handshake race), T9 (daily-grant claim race), and anywhere else a dedup-under-concurrency guard ships.
- **Cause-walking error checks are a codebase-wide footgun.** Every existing `isUniqueViolation` that inspects Drizzle-wrapped errors and stops at the top level is potentially broken. Candidate fix list: `src/lib/auth/signup.ts` (confirmed latent-bug). Worth a single chore ticket to audit-and-normalize across the repo.
- **MAXMIND_DB_DIR unset in test env** → `getEnvGeoReader()` returns null → geo fields land as null in test DB rows. The stress test asserts source + ip correctness but not country/region/city, which is correct — those fields are downstream of an env-var tests shouldn't depend on. Parallel to the T6 "fixture not skipIf" principle.
- **Reviewer exchange on T7 produced one actionable fix and one evidence-only pushback.** IP-spoofing (confidence 85) → fix (f609b97). Non-unique-error swallowing in magic-link-first-load (confidence 95 initially, dropped after analysis) → evidence that retry-on-next-GET is correct behavior, no code change. Same shape as T4's exchange: one real bug, one phantom, documented in both directions.
- **Topology change landed between T7 close and this summary.** T7 commits predate the `handoffs/` convention; this file is the first use of the new pattern. All subsequent ticket closes (T8 onward) will follow this shape natively.
