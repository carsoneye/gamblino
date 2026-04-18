# ADR-0009 · AppShell topology

**Status:** accepted · 2026-04-18

## Context

Phase 6 lands the authenticated shell — the frame every game, meta page, and chat room will render inside from Phase 8 onward. The plan pins three pieces (`Sidebar`, `TopBar`, `ChatRail`) and a spatial DNA line: "asymmetric grid, 7/5 diagonal landing, flush-left sidebar with no gutter." The public landing at `/` is also in scope and must not share the authenticated shell. The decisions frozen here shape every subsequent UI phase, so they belong in the ADR record rather than in a PR description that will scroll off.

## Decision

- **Two shells, not one.** Marketing (`/`) uses a thin header + asymmetric 7/5 hero and owns its own `<main>`. Authenticated routes (`/casino` and, later, `/casino/*`, `/profile`, `/leaderboard`, `/transactions`) wrap inside `<AppShell>`. Auth routes (`/signup`, `/signin`) keep their existing centered `(auth)/layout.tsx`. No shared shell — the goals are different and forcing one leaks authenticated chrome onto public surfaces.
- **CSS grid with `auto 1fr auto` columns and `auto 1fr` rows.** Sidebar spans both rows (col 1), TopBar sits in col 2 row 1, ChatRail spans both rows (col 3), `<main>` is col 2 row 2. No gap — honors the "flush-left, no gutter" brief. Sidebar doesn't sit below TopBar; the logo lives inside the sidebar's top strip so the sidebar reaches the top-left corner.
- **Responsive collapse, no drawer.** Below `md` (< 768px) the sidebar and chat rail are hidden entirely; main content takes the full viewport. Between `md` and `lg` the sidebar collapses to a 64px icon rail. At `lg` and above both rails are visible. No hamburger drawer this phase — a real mobile nav is Phase 15 polish.
- **`ChatRail` is a stub.** Phase 6 renders an empty-state card pointing to Phase 12 (Bun WebSocket server). No client state, no WS connection, no message list.
- **Nav catalog lives in `src/lib/nav.ts`.** Single source of truth for primary nav + game links. Game entries read `env.FLAG_CRASH/MINES/PLINKO` so the kill-switch story holds without redeploy. Games render as disabled "Soon" chips until their phase ships.
- **Server-first, one client island.** `AppShell`, `Sidebar`, `TopBar`, `ChatRail`, `GameNavItem`, and the marketing components are all React Server Components. Only `NavLink` is `"use client"` because it reads `usePathname()` for active-route highlighting. Icons are rendered to JSX on the server and passed as `ReactNode` across the boundary — lucide component references are not serializable.
- **TopBar is the only live data surface.** It receives `balance`, `email`, and `name` as props from the page's server-side `auth()` + DB read. No client fetch, no Zustand store yet. Phase 8+ can layer a store on top without touching the shell.

## Consequences

- **Positive:** adding an authenticated route is now `<AppShell ...>{content}</AppShell>` with no bespoke layout. The nav catalog + flag read mean Phase 10/11/13 only flip the flag and the game lights up in the sidebar. Server-first keeps the client bundle small and Lighthouse a11y at 0.98 / 0.96 for `/` and the redirect path.
- **Negative:** every authenticated page must `await auth()` and fetch the balance itself to feed the TopBar — we trade a client store for a single server read per navigation. When Phase 5's `transact.ts` writes in the background (e.g., a WS-driven game), the TopBar won't update without a navigation or a future real-time channel. Acceptable now; Phase 12 (WS) is the natural home for that.
- **Reversible:** converting the TopBar to read from a Zustand store is additive. The grid topology itself is cheap to change — it's five components and one CSS grid — but the decision to keep marketing and authenticated shells separate should be stable because the surfaces diverge further as the build grows.
