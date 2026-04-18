# ADR-0006 · Postgres 16 + Drizzle as data layer

**Status:** accepted · 2026-04-18

## Context

Phase 3 sets up the persistence layer that every later phase — auth, wallet, games, leaderboards — sits on top of. We need (a) an OLTP store with strong transactional guarantees (the wallet relies on `SELECT … FOR UPDATE`), (b) a schema-migration workflow that keeps the SQL under version control, (c) a dev setup a contributor can bring up with one command, and (d) a TypeScript-first ORM that preserves SQL legibility for the audit-sensitive wallet code.

## Decision

- **Postgres 16** via `docker-compose.yml` for local dev. Single `gamblino` role, named volume, health-checked. Production will be a managed instance (Neon/Supabase/RDS — chosen in the deploy phase).
- **Drizzle ORM** (`drizzle-orm` + `drizzle-kit`) over `postgres.js` driver. `postgres.js` is lighter than `pg`, ships prepared-statement support, and plays well with Bun.
- **Migration workflow:** `drizzle-kit generate` produces versioned SQL in `drizzle/migrations/` — committed to the repo. `drizzle-kit push` is local-only (never CI, never prod); `drizzle-kit migrate` runs the committed SQL in CI/prod.
- **Schema source of truth:** `src/db/schema.ts`. `snake_case` at the DB boundary, `camelCase` in TS via `casing: "snake_case"` in both the drizzle-kit and runtime configs.
- **Append-only ledger:** migration `0001_append_only_transactions.sql` installs `BEFORE UPDATE`/`BEFORE DELETE` triggers on `transactions` that raise an exception. A plain `REVOKE` would be bypassed by the owner role, so the trigger enforces the invariant at the row level regardless of who connects.
- **Money representation:** `bigint` micro-credits in the DB (1 credit = 1,000,000 micro). CHECK constraints keep `users.balance` and `transactions.balance_after` non-negative; no float columns anywhere.
- **Connection pool:** singleton on `globalThis` in dev to survive Next.js HMR; pool size 5 dev / 10 prod.

## Consequences

- **Positive:** SQL stays first-class (Drizzle is thin), migrations are diffable in PR review, the append-only invariant is enforced by the DB and can't be bypassed by buggy application code, and a fresh contributor runs `docker compose up -d && bun run db:push` to get a full environment.
- **Negative:** Drizzle's bigint-mode defaults require `sql\`0\`` rather than `0n` literals (drizzle-kit can't JSON-serialize native BigInt in snapshots). Minor ergonomic wart, not a correctness risk.
- **Reversible:** the schema and migrations are portable SQL; swapping Drizzle for another query layer is a rewrite but not a data migration.
