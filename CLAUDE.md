# gamblino

Play-money social casino. Originals: Crash, Mines, Plinko, Lottery. No real money, no crypto, no license scope.

## Run

- `docker compose up -d` — Postgres on :5432
- `bun install`
- `bun run db:push` — sync Drizzle schema (local only)
- `bun run dev` — Next.js on :3000
- `bun run ws` — Bun WebSocket server on :3001
- `bun test` — unit · `bun run e2e` — Playwright · `bun x biome check` — lint

## Stack

Bun 2 · Next.js 16.2 · React 19.2 · Tailwind v4 (Oxide) · shadcn/ui · Drizzle + Postgres · Auth.js v5 · Zustand · Framer Motion · PixiJS · Biome 2 · Playwright · Sentry · Pino.

## Design — "Midnight Arcade"

- **Fonts:** Clash Display (display) · General Sans (body) · Geist Mono (numeric). **Never Inter / Roboto / Arial.**
- **Tokens:** `src/app/globals.css` via `@theme inline`, OKLCH. No hex literals in components.
- **Atmosphere:** conic gradient mesh + SVG grain on every surface. No flat solid backgrounds.
- **Memorable moment:** Crash cash-out viewport-invert. Protect it.
- **Research canon:** `/Users/carsonidsinga/dump/Main Projects/Brain/resources/research/design/`.

## Governance (applies to every phase, every PR)

- **Branches:** trunk-based. `main` is protected. Feature work on `phase/NN-slug` → PR → squash-merge.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `perf:`, `ci:`, `build:`, `revert:`). Enforced by commitlint in lefthook.
- **CI:** every PR runs `biome check` + `bun run typecheck` + `bun test` + `bun run build` + Playwright. Green required to merge.
- **Env:** add new vars to `.env.example` AND `src/env.ts` (Zod schema) in the same commit. Boot fails loudly on missing vars.
- **Migrations:** `bun x drizzle-kit generate` — commit the SQL in `drizzle/migrations/`. `db:push` is local-only; never in CI or prod.
- **Audit invariant:** `transactions` table is append-only. Never `UPDATE` or `DELETE` a transaction. DB user has the grant revoked — respect it.
- **Wallet:** balance mutations **only** through `src/lib/wallet/transact.ts`. Atomic Drizzle tx with `SELECT ... FOR UPDATE` on the user row. No direct writes to `users.balance` anywhere else — not in routes, not in tests.
- **Game logic purity:** `src/lib/games/*` imports no DB, WS, Next.js, or framework code. Transport adapters live in `src/app/` (routes/actions) and `src/server/ws.ts`.
- **Provably fair:** server commits seed hash BEFORE the round opens, reveals after settlement. Implementation in `src/lib/games/provably-fair.ts`. Any round reproducible from stored `(server_seed, client_seed, nonce)`.
- **Money representation:** `bigint` micro-credits (1 credit = 1,000,000 micro). No floats for money — ever. All monetary displays use `font-variant-numeric: tabular-nums`.
- **Feature flags:** env-var per game (`FLAG_CRASH=on|off`). Checked in route + nav. Kill-switch without deploy.
- **Rate limits:** every bet action throttled per user. In-memory for dev; Upstash for prod.
- **Cache Components:** `"use cache"` only on static catalogs (game grid) and leaderboards. **Never** on balance, round state, bet history, or anything a user expects to be live.
- **Observability:** every server action and WS message carries a request-id, logs via Pino (JSON in prod, pretty in dev), reports errors to Sentry.
- **Tests:** colocated `*.test.ts` next to source for unit; `tests/e2e/` for Playwright. Do not reintroduce a `tests/unit/` tree.
- **Perf budgets:** initial JS ≤ 180 KB, LCP ≤ 1.8 s, INP ≤ 200 ms, Lighthouse ≥ 95 on a11y/perf/SEO. CI fails the build if budgets regress.
- **ADRs:** significant decisions get an `docs/adr/NNNN-slug.md` (context / decision / consequences / status — ~four sentences each). Link the ADR from the PR.
- **Security:** run `/security-review` before merging any Phase 5+ PR (wallet, auth, RNG, WS).

## Style

- Responses under 4 lines. One-word answers are best. No preamble, no postamble.
- Action over explanation — after completing work, stop. Don't summarize or recap.
- No comments in code unless asked.
- Files < 800 lines, functions < 50 lines, no nesting > 4 levels.
- Validate inputs at system boundaries only.
- Handle errors explicitly, never swallow.

## Scaffold plan

Full phased plan: `/Users/carsonidsinga/.claude/plans/greedy-honking-fairy.md`. Each phase = single session, single PR. Kick off with `/feature-dev <phase>`; invoke `/frontend-design` on UI phases.

## Phase continuity

- **`PHASE.md`** at repo root is the single source of truth for "where are we". The `SessionStart` hook prints its **Current** block into every fresh session — don't re-read the plan to orient.
- Advance state with **`/next-phase`** (only between phases, after PR merges). It verifies the prior PR merged, rotates Current → Done, creates `phase/NN-slug`, and prints the kickoff.
- During a phase: run `/feature-dev <phase>` in a fresh session against the phase branch. Do not bundle phases. Do not skip the PR.

## Cross-surface topology

Four surfaces collaborate on gamblino. Each has a narrow job; handoffs between them are on-disk artifacts, not chat paste.

- **Chat (Opus 4.7 via Claude.ai)** — orchestration, strategic research, scope review. The human-facing surface. Decides what ships, picks between alternatives, reviews execution output before ticket close. Does not write code directly.
- **Brain (Claude Code in the Obsidian vault at `/Users/carsonidsinga/dump/Main Projects/Brain/`)** — strategic memory. Owns phase decision logs, ADR drafts, vendor comparisons, open questions, phase retros. Reads execution's ticket closes; produces scoping material for the next phase.
- **Execution (Claude Code in this repo)** — ships code. Owns the repo, the tests, the ADR final text, the deployment reality. Reads brain's scoping material; produces ticket closes for brain to sweep.
- **Design (Claude Design in browser)** — visual artifact generation. Owns prototypes, pixel-accurate component exports, motion specs. Emits bundles; does not import repo state.

### `.brain/` — read-only strategic context

`.brain` is a symlink at the repo root pointing at the Obsidian vault root. User-local, gitignored. Execution reads from it; never writes. Relevant entry points:

- `.brain/04-phases/phase-NN.md` — the phase scope document. Read before scoping a ticket to pick up decisions made upstream of the repo.
- `.brain/08-decisions/open-questions.md` — unresolved strategic questions. Check before making decisions that cut across phases.

Do not ship code that depends on `.brain` existing at runtime — it exists only at dev/exec time.

### `handoffs/` — committed cross-surface artifacts

Three subdirectories, all committed to the repo. Content is markdown/assets — tooling (biome, tsc, drizzle, bun test) is configured to skip this tree.

- **`handoffs/from-design/phase-NN-<artifact>-vN/`** — inbound bundles from Claude Design. Prototypes, pixel exports, motion specs. Execution reads these when implementing UI tickets. Reference bundle paths in commit messages.
- **`handoffs/from-brain/`** — inbound drafts from the brain agent. Draft ADRs, vendor comparisons, open-question synthesis. Execution reads these during scoping; the final ADR (post-implementation) still lands at `docs/adr/NNNN-slug.md`.
- **`handoffs/to-brain/phase-NN-T#-close.md`** — outbound ticket-close summaries from execution. Written at every ticket close as the durable artifact; chat notification is secondary. Brain sweeps this folder at session start.

### Ticket-close protocol

At every ticket close (not every phase): write a summary to `handoffs/to-brain/phase-NN-T#-close.md` using the format below, commit as `chore(handoff): phase-NN T# close summary`, surface in chat as a notification.

```
Ticket: T#
Commit: <hash>
Files: <short list>
Architectural decisions made during execution (beyond original spec): <bullets or "none">
Tests: <passing count>
Notes for phase retro: <any surprises, reviewer patterns, footguns hit>
```

Two root-level continuity files:

- **`PHASE.md`** — human-readable phase timeline (narrative, updated at phase start/end).
- **`STATE.md`** — machine-readable operational snapshot for agent session-start reads (updated on every ADR ship and end-of-phase; not a live log).
