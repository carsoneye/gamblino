# ADR-0007 · Auth.js v5 with credentials + magic-link, 10,000-credit signup grant

**Status:** accepted · 2026-04-18

## Context

Phase 4 introduces user identity. We need an auth layer that (a) works with our existing Drizzle/Postgres schema, (b) supports a quick-try credentials flow (play-money social casino, low friction beats high security), (c) supports magic-link for users who don't want to invent yet another password, (d) is edge-safe enough to gate `/casino` in `proxy.ts` without dragging bcrypt into the edge bundle, and (e) cleanly seeds the signup bonus required by the rest of the economy.

## Decision

- **Auth.js v5** (`next-auth@5.0.0-beta.31`) with the Drizzle Postgres adapter. Two providers: `Credentials` (email + bcrypt-hashed password) and `Nodemailer` (magic link). Credentials forces JWT sessions, so we use `session.strategy = "jwt"` globally and keep the DB `sessions` table for future adapter strategies.
- **Split config:** `src/auth/config.ts` is edge-safe (no adapter, no bcrypt, no Nodemailer) and is what `proxy.ts` imports. `src/auth/index.ts` layers the adapter + providers + events and is imported by routes and server actions.
- **Schema additions:** `accounts` (Auth.js OAuth/magic-link link records, compound PK on `(provider, provider_account_id)`), `verification_tokens` (magic-link tokens, compound PK on `(identifier, token)`), and `users.password_hash text NULL` for credentials users. Users who only ever use magic-link have `password_hash IS NULL`.
- **Signup bonus:** `src/lib/auth/signup-bonus.ts` credits 10,000 credits (10 billion micro-credits) inside a Drizzle transaction that `SELECT … FOR UPDATE`s the user row, inserts an append-only `transactions` row with `idempotencyKey = 'signup:<userId>'`, and updates `users.balance`. Called in two places: the credentials signup action (which creates the user via `db.insert`, bypassing the adapter) and the Auth.js `events.createUser` hook (which fires when the adapter creates a user via magic-link). The idempotency key makes double-calls safe.
- **Route gating:** `proxy.ts` uses `NextAuth(authConfig).auth` as default export with a matcher of `['/casino/:path*', '/profile/:path*']`. The `authorized` callback also fires in server components via `auth()`; protected page components redirect to `/signin` when `session.user.id` is missing.
- **Password rules:** minimum 8 chars enforced in the Zod schema at the signup boundary. bcrypt cost 10 (~100ms on the target host; safe for synchronous hashing in a server action).

## Consequences

- **Positive:** Two working sign-in paths, safe edge gating, a tested bonus-grant primitive that Phase 5's `transact.ts` can subsume, and a schema that any OAuth provider can plug into later without migration.
- **Negative:** JWT-only sessions mean we cannot revoke a session server-side without rotating `AUTH_SECRET`. Acceptable for a play-money app; revisit if we ever add real money (we won't). The bonus helper duplicates a small amount of the wallet-transaction pattern that Phase 5 will generalize — we'll refactor it then rather than predict the final shape now.
- **Reversible:** switching to database sessions later is a session-strategy flip plus dropping the credentials provider; OAuth providers are additive.
