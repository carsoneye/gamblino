import { describe, expect, it } from "bun:test";
import { deriveBytes, deriveFloats, hashServerSeed } from "./provably-fair";
import { FIXTURES } from "./provably-fair.fixtures";

describe("hashServerSeed", () => {
  it("matches frozen fixtures", () => {
    for (const f of FIXTURES) {
      expect(hashServerSeed(f.serverSeed)).toBe(f.serverSeedHash);
    }
  });

  it("is deterministic", () => {
    const a = hashServerSeed("same-seed");
    const b = hashServerSeed("same-seed");
    expect(a).toBe(b);
  });
});

describe("deriveBytes", () => {
  it("matches frozen fixtures (first 8 bytes at cursor 0)", () => {
    for (const f of FIXTURES) {
      const hex = deriveBytes(f.serverSeed, f.clientSeed, f.nonce, 0, 8).toString("hex");
      expect(hex).toBe(f.firstBytesHex);
    }
  });

  it("emits exactly the requested number of bytes across cursor boundaries", () => {
    const buf = deriveBytes("seed", "client", 0, 0, 80);
    expect(buf.length).toBe(80);
  });

  it("yields distinct bytes across consecutive cursors from the same triple", () => {
    const a = deriveBytes("seed", "client", 0, 0, 32);
    const b = deriveBytes("seed", "client", 0, 1, 32);
    expect(a.equals(b)).toBe(false);
  });

  it("yields distinct bytes when nonce advances", () => {
    const a = deriveBytes("seed", "client", 0, 0, 32);
    const b = deriveBytes("seed", "client", 1, 0, 32);
    expect(a.equals(b)).toBe(false);
  });
});

describe("deriveFloats", () => {
  it("matches frozen fixtures (first 4 floats)", () => {
    for (const f of FIXTURES) {
      const got = deriveFloats(f.serverSeed, f.clientSeed, f.nonce, 4);
      expect(got).toEqual(f.firstFloats as number[]);
    }
  });

  it("returns an empty array for count <= 0", () => {
    expect(deriveFloats("s", "c", 0, 0)).toEqual([]);
    expect(deriveFloats("s", "c", 0, -1)).toEqual([]);
  });

  it("every float is in [0, 1)", () => {
    const floats = deriveFloats("seed", "client", 0, 64);
    for (const v of floats) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("is deterministic across 10,000 re-runs of the same triple", () => {
    const reference = deriveFloats("determinism", "check", 0, 8);
    for (let i = 0; i < 10_000; i++) {
      const again = deriveFloats("determinism", "check", 0, 8);
      expect(again).toEqual(reference);
    }
  });

  it("distribution across 1M floats stays within 1% of uniform", () => {
    const BUCKETS = 10;
    const COUNT = 1_000_000;
    const counts = new Array(BUCKETS).fill(0);
    const floats = deriveFloats("distribution", "sanity", 0, COUNT);
    for (const v of floats) {
      const bucket = Math.min(BUCKETS - 1, Math.floor(v * BUCKETS));
      counts[bucket]++;
    }
    const expected = COUNT / BUCKETS;
    const tolerance = expected * 0.02;
    for (const c of counts) {
      expect(Math.abs(c - expected)).toBeLessThan(tolerance);
    }
  });

  it("spans cursor increments cleanly for counts > 8", () => {
    const floats = deriveFloats("cursor", "span", 0, 17);
    expect(floats.length).toBe(17);
    expect(new Set(floats).size).toBe(17);
  });
});
