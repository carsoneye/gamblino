# gamblino

Play-money social casino. Originals: Crash, Mines, Plinko, Lottery. Play-money only — no real money, no crypto, no license scope.

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

## Geo setup (MaxMind GeoLite2)

`src/lib/geo/capture.ts` reads two MaxMind `.mmdb` files from a directory pointed
to by `MAXMIND_DB_PATH`: `GeoLite2-City.mmdb` (country/region/city) and
`GeoLite2-ASN.mmdb` (ASN → datacenter/VPN inference). The files are not checked
in — they are large and licensed by MaxMind.

**Local dev:** create a free MaxMind account at
<https://www.maxmind.com/en/geolite2/signup>, download the GeoLite2 City and
ASN databases, extract the `.mmdb` files into a local directory (e.g.
`~/maxmind/`), and point `MAXMIND_DB_PATH` at it. If `MAXMIND_DB_PATH` is unset
in development, `getEnvGeoReader()` returns `null` and geo capture is skipped.

**Tests / CI:** a small, committed fixture pair under `tests/fixtures/maxmind/`
(`GeoLite2-City-Test.mmdb` + `GeoLite2-ASN-Test.mmdb`, sourced from MaxMind's
public test-data repo) is used by `src/lib/geo/capture.test.ts` via explicit
paths — no env var required. Tests don't silently skip; the fixture path is
load-bearing.

**Prod:** the `.mmdb` files are baked into the container image (or fetched by
`geoipupdate` at deploy time) and `MAXMIND_DB_PATH` is required in production —
`src/env.ts` rejects boot if it is unset.

## Structure

```
src/
  app/          Next.js App Router (routes + server actions)
  components/   ui · layout · game · originals/{crash,mines,plinko,lottery}
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
