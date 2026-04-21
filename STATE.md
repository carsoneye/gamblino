# Project state — last updated 2026-04-20

Machine-readable operational snapshot for agent session-start reads. Update
on every ADR ship and at end-of-phase. Not a live log — no mid-ticket
updates.

## Current phase

Phase 8 — Wallet & ledger maturity (status: in-flight)

- **Closed:** T1+T14+T2 (2bf8f69), T4+T13 (3e981c3 + f609b97 review-fix), T3 (3a9c753), T6 (978c578 + 7ad2104 rename), T7 (cad182a + f609b97 review-fix + d05a9bc handoff summary)
- **Remaining:** T5 (wallet_limits), T8 (welcome + daily grant), T9 (balance-pushed TopBar), T10 (WS auth + channels), T11 (transaction history), T12 (/dev/wallet-harness), T15 (remaining ADR coverage for currency-typed ledger)

## Last shipped phase

Phase 7 — Game foundations (merged 2026-04-19 UTC, PR #9)

## Active ADRs

- 0001-0011 in effect
- 0012 shipped with T4+T13 — wallet-row-grain lock + bounded `statement_timeout`
- 0013 shipped with T3 — audit-trail append-only (account_events, user_geo_events, wallet_limits)
- 0014 shipped with T6 — MaxMind GeoLite2 on-prem + ASN-derived VPN signal (amended by 7ad2104 for `MAXMIND_DB_DIR` rename + Apache-2.0 fixture-license citation)
- 0015 in flight — currency-typed ledger (ships with T15)

## Schema state

- Latest migration: `drizzle/migrations/0005_yellow_maestro.sql`
- Tables added in Phase 8: `wallets`, `wallet_limits`, `account_events`, `user_geo_events`
- Enums added in Phase 8: `currency_kind`; `daily_grant` appended to `tx_reason`; `logout` appended to `geo_event_source`
- Constraints added in Phase 8: `tx_idem_prefix` CHECK (`^(srv_|cli_)`); `account_events_signup_once` unique partial index (race-safe signup dedup)

## Vendor stack — live

- Sentry: free tier, wired in `instrumentation.ts`
- Cloudflare: free tier
- Postgres 16: self-hosted via `docker-compose`
- MaxMind GeoLite2: test fixtures checked in under `tests/fixtures/maxmind/` (Apache-2.0 from `maxmind/MaxMind-DB` test-data). Prod deployment deferred to Phase 18.

## Vendor stack — scaffolded only

- Claude Design: evaluated, first trial deferred to Phase 9 Mines stage

## Known drift

None.
