import { beforeAll, describe, expect, it } from "bun:test";
import { resolve } from "node:path";
import { captureGeoFrom, DEFAULT_DATACENTER_ASNS, isDatacenterAsn, openGeoReader } from "./capture";

const FIXTURE_DIR = resolve(import.meta.dir, "../../../tests/fixtures/maxmind");
const CITY_PATH = `${FIXTURE_DIR}/GeoLite2-City-Test.mmdb`;
const ASN_PATH = `${FIXTURE_DIR}/GeoLite2-ASN-Test.mmdb`;

let reader: Awaited<ReturnType<typeof openGeoReader>>;

beforeAll(async () => {
  reader = await openGeoReader({ cityDbPath: CITY_PATH, asnDbPath: ASN_PATH });
});

describe("geo/capture — shape", () => {
  it("resolves a UK residential IP to country+region+city without an ASN in the test set", () => {
    const g = reader.capture("81.2.69.142");
    expect(g.country).toBe("GB");
    expect(g.region).toBe("ENG");
    expect(g.city).toBe("London");
    expect(g.asn).toBeNull();
    expect(g.asnOrg).toBeNull();
    expect(g.vpn).toBe(false);
  });

  it("resolves a US IP to WA subdivision and picks up the test-fixture ASN 209", () => {
    const g = reader.capture("216.160.83.56");
    expect(g.country).toBe("US");
    expect(g.region).toBe("WA");
    expect(g.city).toBe("Milton");
    expect(g.asn).toBe(209);
    expect(g.vpn).toBe(false);
  });

  it("resolves a known-ASN IP with named organization", () => {
    const g = reader.capture("149.101.100.1");
    expect(g.asn).toBe(6167);
    expect(g.asnOrg).toBe("CELLCO-PART");
    expect(g.country).toBeNull();
    expect(g.vpn).toBe(false);
  });

  it("returns all-nulls (and vpn=false) for an IP not in either database", () => {
    const g = reader.capture("1.1.1.1");
    expect(g).toEqual({
      country: null,
      region: null,
      city: null,
      asn: null,
      asnOrg: null,
      vpn: false,
    });
  });
});

describe("geo/capture — VPN / datacenter ASN signal", () => {
  it("flags vpn=true when the resolved ASN is in the caller-provided datacenter set", async () => {
    const testReader = await openGeoReader({
      cityDbPath: CITY_PATH,
      asnDbPath: ASN_PATH,
      datacenterAsns: new Set([209]),
    });

    const g = testReader.capture("216.160.83.56");
    expect(g.asn).toBe(209);
    expect(g.vpn).toBe(true);
  });

  it("flags vpn=false when the resolved ASN is not in the datacenter set", () => {
    const g = reader.capture("216.160.83.56");
    expect(g.asn).toBe(209);
    expect(isDatacenterAsn(209)).toBe(false);
    expect(g.vpn).toBe(false);
  });

  it("never flags vpn=true for a null ASN, even with an empty datacenter set", () => {
    expect(isDatacenterAsn(null, new Set())).toBe(false);
    expect(isDatacenterAsn(null, new Set([209]))).toBe(false);
  });

  it("DEFAULT_DATACENTER_ASNS covers the major cloud providers", () => {
    const mustInclude = [
      16509, // AWS
      15169, // Google
      8075, // Microsoft
      14061, // DigitalOcean
      13335, // Cloudflare
    ];
    for (const asn of mustInclude) {
      expect(DEFAULT_DATACENTER_ASNS.has(asn)).toBe(true);
    }
  });
});

describe("geo/capture — captureGeoFrom (pure)", () => {
  it("matches the reader.capture() output when invoked with the same readers", async () => {
    const maxmind = await import("maxmind");
    const city = await maxmind.default.open<never>(CITY_PATH);
    const asn = await maxmind.default.open<never>(ASN_PATH);

    const a = captureGeoFrom(city, asn, "81.2.69.142");
    const b = reader.capture("81.2.69.142");
    expect(a).toEqual(b);
  });
});
