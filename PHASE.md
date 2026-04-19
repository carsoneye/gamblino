# Phase State

Single source of truth for where the project is in the 16-phase build plan. Committed to `main` so every fresh Claude Code session reads it on `SessionStart`.

**Plan:** `/Users/carsonidsinga/.claude/plans/greedy-honking-fairy.md`

---

## Current

- **Phase:** 7 — Cmd+K (command palette)
- **Branch:** `phase/07-cmdk`
- **Status:** not started
- **Kickoff:** `/feature-dev phase 7 — cmd+k (cmdk fuzzy search over games + nav + quick actions)`
- **Verification:** `⌘K` opens overlay; `mines<Enter>` navigates to `/casino/mines`; game-flag-off entries appear with disabled styling; mobile hamburger still works; Playwright e2e for open/close/select

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

## Upcoming

| # | Phase | Depends on |
|---|---|---|
| 8 | Game primitives | 5 |
| 9 | Provably-fair | 8 |
| 10 | Mines | 9 |
| 11 | Plinko | 10 |
| 12 | WS server | 11 |
| 13 | Crash | 12 |
| 14 | Meta pages (profile/leaderboard/tx list) | 13 |
| 15 | Polish + regression | 14 |

---

## Rules

- One phase = one branch = one PR = one squash-merge. Never bundle phases.
- Branch format: `phase/NN-slug` (zero-padded).
- Update the **Current** block at the start of the session; move the row to **Done** only after the PR merges AND verification passes.
- Verification is a command, not a claim. Paste the passing output into the PR body.
- If a phase is blocked, note it in **Current** with `Status: blocked — <reason>` rather than silently skipping.
