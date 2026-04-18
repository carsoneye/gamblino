# ADR-0003 · Realtime via Bun `ServerWebSocket` + pub/sub (no socket.io)

**Status:** accepted · 2026-04-18

## Context

Crash requires a shared round broadcast at ~10 Hz to all subscribers, with strict ordering and sub-50ms fan-out latency to avoid late-cashout exploits. Chat piggybacks on the same transport. We already run Bun as our runtime. socket.io is the historical default but adds a protocol layer, polyfills, and a dependency that Bun's native `ServerWebSocket` replaces.

## Decision

Use Bun's native `Bun.serve({ websocket })` with the built-in pub/sub API (`ws.subscribe(topic)` / `server.publish(topic, data)`) for the Crash round broadcast and chat. One topic per Crash round (`round:<id>`), one topic per chat room. Server-authoritative state lives in `src/server/ws.ts`; pure game logic in `src/lib/games/crash/engine.ts` remains independent of transport.

## Consequences

- **Positive:** ~7× throughput versus Node + `ws` in published benchmarks; zero dependencies; topic-based broadcasting is built-in and allocation-free; fewer moving parts to reason about under load.
- **Negative:** we lose socket.io's graceful long-polling fallback — clients must speak raw WebSocket. Acceptable in 2026 (WebSocket is universally available); we will still surface clean disconnect/reconnect UX.
- **Reversible:** the `useRoom(topic)` client hook abstracts the transport. Swapping to socket.io or Ably behind the same interface is a one-file change if we ever need it.
