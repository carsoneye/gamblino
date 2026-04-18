# Phase State

Single source of truth for where the project is in the 16-phase build plan. Committed to `main` so every fresh Claude Code session reads it on `SessionStart`.

**Plan:** `/Users/carsonidsinga/.claude/plans/greedy-honking-fairy.md`

---

## Current

- **Phase:** 1 — Boot
- **Branch:** `phase/01-boot`
- **Status:** in progress — PR open
- **Kickoff:** `/feature-dev phase 1 — next-app init, Biome, shadcn v4, Sentry, Pino, env.ts`
- **Verification:** `bun run dev` serves `/`; Sentry test event arrives; `bun x biome check` clean

## Done

| # | Phase | Branch | PR | Verified |
|---|---|---|---|---|
| 0 | Pre-reqs | `main` | — (direct) | 2026-04-17 · CI skeleton green, ADRs 0001-0005 committed |

## Upcoming

| # | Phase | Depends on |
|---|---|---|
| 2 | Design tokens | 1 |
| 3 | Infra (docker + drizzle + migrations) | 1 |
| 4 | Auth | 3 |
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
