# gamblino

Play-money social casino. Originals: Crash, Mines, Plinko. No real money, no crypto, no license scope.

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
