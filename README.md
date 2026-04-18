# gamblino

Play-money social casino. Originals: Crash, Mines, Plinko. Play-money only — no real money, no crypto, no license scope.

Brand: **Midnight Arcade** — editorial-luxury × neon-arcade on cosmic navy.

## Stack

Bun 2 · Next.js 16 · React 19.2 · Tailwind v4 (Oxide) · shadcn/ui · Drizzle + Postgres · Auth.js v5 · Zustand · Framer Motion · PixiJS · Biome 2 · Playwright.

## Quickstart

```bash
docker compose up -d        # Postgres on :5432
bun install
bun run db:push             # sync Drizzle schema (local only)
bun run dev                 # Next.js on :3000
bun run ws                  # Bun WebSocket server on :3001
```

Tests:

```bash
bun test                    # unit
bun run e2e                 # Playwright
bun x biome check           # lint + format
```

## Structure

```
src/
  app/          Next.js App Router (routes + server actions)
  components/   ui · layout · game · originals/{crash,mines,plinko}
  lib/          db · games (pure) · wallet · auth
  server/       ws.ts — Bun WebSocket server (crash engine + chat)
  store/        Zustand — balance, bet slip
drizzle/        migrations
tests/e2e/      Playwright specs
docs/adr/       architecture decision records
```

## Governance

- **Branches:** `main` protected; feature work on `phase/NN-slug`; squash-merge via PR.
- **Commits:** Conventional Commits (`feat:`, `fix:` …).
- **Migrations:** `drizzle-kit generate` — commit the SQL. `db:push` is local-only.
- **Audit invariant:** `transactions` is append-only — DB user has no UPDATE/DELETE.
- **Balance mutations:** only via `src/lib/wallet/transact.ts`.
- **Pure game logic:** `src/lib/games/*` imports no DB, WS, or framework code.
- **Design tokens:** `src/app/globals.css` `@theme inline` (OKLCH). No hex literals in components.
- **Fonts:** Clash Display (display) · General Sans (body) · Geist Mono (numeric). Never Inter.

See `/Users/carsonidsinga/.claude/plans/greedy-honking-fairy.md` for the full scaffold plan.

## License

MIT — see `LICENSE`.
