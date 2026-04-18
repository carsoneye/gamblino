# ADR-0004 · Provably-fair scheme: HMAC-SHA256 commit-reveal with nonce

**Status:** accepted · 2026-04-18

## Context

Every original (Crash, Mines, Plinko) needs a verifiable RNG so a player can, after the round, reproduce the outcome and confirm the house did not re-roll. The standard in crypto-casino space is HMAC-SHA256 seeded by a server seed (committed as a hash before the round), a client seed (user-editable), and a monotonically increasing nonce per round. This is the scheme published by Stake and adopted by Rainbet, Roobet, and others. We are play-money but we treat the invariant as if it were money.

## Decision

- Before any round opens: server generates a random 256-bit server seed, stores it in the `seeds` table, and publishes `sha256(server_seed)` to the client as the commitment.
- Client seed: user-editable text (defaulted to a random string at sign-up). Stored with the user.
- Per round: output bytes = `HMAC_SHA256(key=server_seed, message=f"{client_seed}:{nonce}")`. The first N bytes are mapped into the game's outcome space (crash point, mine tile permutation, plinko slot).
- After settlement: the server seed is revealed. Client can verify `sha256(revealed) == commitment` and re-derive the outcome.
- Seed rotation: when the user changes their client seed, the current server seed is revealed and a new one is committed.

## Consequences

- **Positive:** every round is independently verifiable by the player. Matches industry convention so users already trust the scheme. The `/seed-reveal` skill can replay any round from storage.
- **Negative:** the server must never reveal a server seed before settlement — a single bug here breaks the invariant for every affected round. Covered by tests and by the `seeds.revealed_at` column gate.
- **Reversible:** swappable to VRFs (e.g. Chainlink) if we ever add on-chain settlement — the `provably-fair.ts` module isolates the primitive.
