# Phase State

Single source of truth for where the project is in the 16-phase build plan. Committed to `main` so every fresh Claude Code session reads it on `SessionStart`.

**Plan:** `/Users/carsonidsinga/.claude/plans/greedy-honking-fairy.md`

---

## Current

- **Phase:** 4 — Auth (Auth.js v5 credentials + magic-link)
- **Branch:** `phase/04-auth`
- **Status:** not started
- **Kickoff:** `/feature-dev phase 4 — auth (Auth.js v5 credentials + magic-link; sign-up grants 10,000 credits)`
- **Verification:** Playwright: sign up → redirected to `/casino`, balance row exists

## Done

| # | Phase | Branch | PR | Verified |
|---|---|---|---|---|
| 0 | Pre-reqs | `main` | — (direct) | 2026-04-17 · CI skeleton green, ADRs 0001-0005 committed |
| 1 | Boot | `phase/01-boot` | [#1](https://github.com/carsoneye/gamblino/pull/1) | 2026-04-18 · CI green (lint/typecheck/test/build + playwright); `bun run dev` serves `/`; `bun x biome check` clean |
| 2 | Design tokens | `phase/02-design-tokens` | [#2](https://github.com/carsoneye/gamblino/pull/2) | 2026-04-18 · CI green; OKLCH tokens via `@theme inline`; Clash/General Sans/Geist Mono load; mesh+grain atmosphere; `/dev/tokens` sandbox |
| 3 | Infra | `phase/03-infra` | [#3](https://github.com/carsoneye/gamblino/pull/3) | 2026-04-18 · CI green; `docker compose up -d` → `bun run db:push` green; 6 tables; `bun run db:studio` reachable; append-only triggers block `UPDATE`/`DELETE` on `transactions` (ADR-0005) |

## Upcoming

| # | Phase | Depends on |
|---|---|---|
| 5 | Wallet (`transact.ts`) | 4 |
| 6 | AppShell (Sidebar/TopBar/ChatRail) | 4 |
| 7 | Cmd+K | 6 |
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
