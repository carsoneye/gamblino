import { createHash, createHmac } from "node:crypto";

const DIGEST_BYTES = 32;
const BYTES_PER_FLOAT = 4;
const FLOATS_PER_DIGEST = DIGEST_BYTES / BYTES_PER_FLOAT;

export function hashServerSeed(serverSeed: string): string {
  return createHash("sha256").update(serverSeed).digest("hex");
}

function hmacDigest(serverSeed: string, clientSeed: string, nonce: number, cursor: number): Buffer {
  return createHmac("sha256", serverSeed).update(`${clientSeed}:${nonce}:${cursor}`).digest();
}

export function deriveBytes(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  cursor = 0,
  count: number = DIGEST_BYTES,
): Buffer {
  const chunks: Buffer[] = [];
  let remaining = count;
  let c = cursor;
  while (remaining > 0) {
    const digest = hmacDigest(serverSeed, clientSeed, nonce, c);
    const take = digest.subarray(0, Math.min(remaining, DIGEST_BYTES));
    chunks.push(Buffer.from(take));
    remaining -= take.length;
    c += 1;
  }
  return Buffer.concat(chunks);
}

export function deriveFloats(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  count: number,
): number[] {
  if (count <= 0) return [];
  const digestsNeeded = Math.ceil(count / FLOATS_PER_DIGEST);
  const bytes = deriveBytes(serverSeed, clientSeed, nonce, 0, digestsNeeded * DIGEST_BYTES);

  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const o = i * BYTES_PER_FLOAT;
    const v =
      bytes[o] / 256 +
      bytes[o + 1] / 65_536 +
      bytes[o + 2] / 16_777_216 +
      bytes[o + 3] / 4_294_967_296;
    out.push(v);
  }
  return out;
}
