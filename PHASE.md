# Phase State

Single source of truth for where the project is in the 16-phase build plan. Committed to `main` so every fresh Claude Code session reads it on `SessionStart`.

**Plan:** `/Users/carsonidsinga/.claude/plans/greedy-honking-fairy.md`

---

## Current

- **Phase:** 8 — Wallet & ledger maturity (currency-typed ledger, idempotent atomic transact, welcome+daily bonus, live balance, wallet_limits, account_events, user_geo_events, /dev/wallet-harness)
- **Branch:** `phase/08-wallet-ledger`
- **Status:** not started
- **Kickoff:** `/feature-dev phase 8 — wallet & ledger maturity (currency_kind enum + wallets table + CURRENCY_UNITS/formatAmount; wallet-row-grain SELECT…FOR UPDATE + 5s statement_timeout; idempotency_key CHECK srv_/cli_ prefix; welcome 10k + manual-claim 2.5k daily UTC with next-claim ticker pill; transaction history view; minimal WS auth handshake + wallet:${userId} + events:${userId} channels; balance-pushed TopBar; wallet_limits with set_at/effective_at regulatory asymmetry; typed account_events via Zod discriminated union in src/lib/events/schema.ts; user_geo_events + MaxMind GeoLite2 on-prem + ASN-derived VPN signal; /dev/wallet-harness with live event log; fast-check invariants; ADR-0012 + ADR-0013 + ADR-0014)`
- **Verification:** fast-check invariants green (balance identity under randomized concurrent tx, idempotency dedupe srv_+cli_, limit boundaries 0/1/max bigint, currency_kind isolation); `/dev/wallet-harness` round-trip bet→settle→account_events row live via WS; idempotency_key CHECK rejects unprefixed at DB; two-tab balance push via WS (tab A bet → tab B balance updates); daily grant ticker renders `Next credits in Xh Ym`; MaxMind lookup returns country/region/asn with VPN boolean on datacenter-ASN fixture; migration applies cleanly; CI green

## Done

| # | Phase | Branch | PR | Verified |
|---|---|---|---|---|
| 0 | Pre-reqs | `main` | — (direct) | 2026-04-17 · CI skeleton green, ADRs 0001-0005 committed |
| 1 | Boot | `phase/01-boot` | [#1](https://github.com/carsoneye/gamblino/pull/1) | 2026-04-18 · CI green (lint/typecheck/test/build + playwright); `bun run dev` serves `/`; `bun x biome check` clean |
| 2 | Design tokens | `phase/02-design-tokens` | [#2](https://github.com/carsoneye/gamblino/pull/2) | 2026-04-18 · CI green; OKLCH tokens via `@theme inline`; Clash/General Sans/Geist Mono load; mesh+grain atmosphere; `/dev/tokens` sandbox |
| 3 | Infra | `phase/03-infra` | [#3](https://github.com/carsoneye/gamblino/pull/3) | 2026-04-18 · CI green; `docker compose up -d` → `bun run db:push` green; 6 tables; `bun run db:studio` reachable; append-only triggers block `UPDATE`/`DELETE` on `transactions` (ADR-0005) |
| 4 | Auth | `phase/04-auth` | [#4](https://github.com/carsoneye/gamblino/pull/4) | 2026-04-18 · CI green (biome/typecheck/unit/build/e2e); Auth.js v5 credentials + magic-link; 10k signup grant atomic via `SELECT … FOR UPDATE` + idempotency key; Playwright: signup → `/casino` with `10,000` balance; anon `/casino` → `/signin`; ADR-0007 |
| 5 | Wallet | `phase/05-wallet` | [#5](https://github.com/carsoneye/gamblino/pull/5) | 2026-04-18 · CI green (biome/typecheck/unit/build/e2e); `transact.ts` + `transactWithin` with `SELECT … FOR UPDATE`; 13 DB-backed wallet tests green (concurrent debit, overdraft, idempotency dedupe, append-only trigger blocks UPDATE/DELETE, composition rollback); `grantSignupBonus` refactored onto `transactWithin`; ADR-0008 |
| 6 | AppShell | `phase/06-appshell` | [#6](https://github.com/carsoneye/gamblino/pull/6) + [#8](https://github.com/carsoneye/gamblino/pull/8) | 2026-04-19 · CI green (biome/typecheck/unit/build/e2e); route groups `(app)`/`(auth)`/`(marketing)`; AppShell (Sidebar + TopBar + ChatRail) with mobile drawer; marketing shell with landing hero, how-it-works, FAQ, footer; truth-in-affordance game cards (locked → `/signup`, flag-off → aria-disabled); conic+grain atmosphere; grant celebration modal on `?welcome=1`; `UserMenu` replaces inline email; `/dev/tokens` rebuilt as design playground; ADR-0010 (route groups / shell separation); Playwright: landing marketing shell, anon `/casino` → `/signin`, authed shell renders, mobile hamburger opens drawer, magic-link → check-email |
| 7 | Game foundations | `phase/07-game-foundations` | [#9](https://github.com/carsoneye/gamblino/pull/9) | 2026-04-20 · CI green (biome/typecheck/unit/build/e2e); provably-fair HMAC-SHA256 module + 10k-run determinism test + 1M-float distribution sanity; BetControls/WinReveal/ProvablyFairBadge (trust-chip)/GameShell primitives; `/casino/[game]` dynamic route with feature-flag 404 + generateStaticParams filters enabled games; `requireSessionUser()` helper refactors `(app)/layout.tsx`; lottery added to `game_kind` enum via ADD VALUE migration; `/dev/primitives` + `/dev/*` production 404 gate with Playwright coverage; ADR-0011 |

## Upcoming

| # | Phase | Depends on |
|---|---|---|
| 9 | Mines | 7, 8 |
| 10 | Plinko (+ PixiJS) | 7, 8, 9 |
| 11 | Lottery (instant scratch) | 7, 8 |
| 12 | Crash (+ WS hardening on Phase 8 handshake, viewport-invert moment) | 7, 8, 9, 11 |
| 13 | Cmd+K (command palette) | 12 |
| 14 | Meta pages (profile/leaderboard/tx list) | 12 |
| 15 | Polish + regression | 14 |

**Plan:** `~/.claude/plans/dapper-puzzling-waterfall.md` (four-games arc + wallet-maturity insertion) is canonical. Supersedes `greedy-honking-fairy.md` (two reshapes behind) and the prior four-games-only ordering.

---

## Rules

- One phase = one branch = one PR = one squash-merge. Never bundle phases.
- Branch format: `phase/NN-slug` (zero-padded).
- Update the **Current** block at the start of the session; move the row to **Done** only after the PR merges AND verification passes.
- Verification is a command, not a claim. Paste the passing output into the PR body.
- If a phase is blocked, note it in **Current** with `Status: blocked — <reason>` rather than silently skipping.
