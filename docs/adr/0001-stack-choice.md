# ADR-0001 · Stack choice: Bun + Next.js 16 + Drizzle + Postgres

**Status:** accepted · 2026-04-18

## Context

Greenfield social casino (play-money). Three originals (Crash, Mines, Plinko), realtime requirements for Crash, provably-fair RNG, and a strong design system. We need a stack that is fast to iterate on in 2026, has first-class TypeScript, handles realtime well, and is well-understood by Claude Code as a coding partner.

## Decision

- **Runtime + package manager:** Bun 2 (Anthropic-owned since 2025). Replaces Node + pnpm for installs, test runner, bundler, and the WebSocket server.
- **Framework:** Next.js 16.2 (App Router, Turbopack stable, Cache Components, React 19.2).
- **Styling:** Tailwind v4.2 with the Oxide engine and CSS-first `@theme inline` config (OKLCH colors).
- **Database + ORM:** Postgres 16 + Drizzle. Code-first schema in TypeScript, committed SQL migrations.
- **Auth:** Auth.js v5 (credentials + magic-link).
- **Realtime:** Bun native `ServerWebSocket` + pub/sub — no socket.io.
- **Lint/format:** Biome 2.
- **Tests:** `bun test` (unit) + Playwright (e2e).

## Consequences

- **Positive:** single binary for runtime + PM + test + bundle cuts tooling complexity. Oxide + Turbopack give ~100× incremental rebuilds and ~5× cold builds vs 2024 baselines. Drizzle's instant types remove codegen friction. Bun's native pub/sub is a perfect fit for Crash round fan-out.
- **Negative:** Bun still has edge-case incompatibilities with some Node-only libs — we will validate per-dependency. Next.js + Bun is increasingly well-supported but not every template assumes it. Drizzle lacks MongoDB support (irrelevant here).
- **Reversible:** switching to Node + pnpm is mechanical (`package.json` scripts); switching to Prisma would be multi-day. We pick the harder-to-reverse choice (Drizzle) carefully and accept it.
