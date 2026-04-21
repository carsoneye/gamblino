import path from "node:path";
import maxmind, { type AsnResponse, type CityResponse, type Reader } from "maxmind";
import { env } from "@/env";

export interface GeoCapture {
  country: string | null;
  region: string | null;
  city: string | null;
  asn: number | null;
  asnOrg: string | null;
  vpn: boolean;
}

export const DEFAULT_DATACENTER_ASNS: ReadonlySet<number> = new Set<number>([
  16509,
  14618, // Amazon AWS
  15169,
  396982, // Google Cloud
  8075,
  8074,
  8068, // Microsoft / Azure
  14061, // DigitalOcean
  13335,
  209242, // Cloudflare
  63949, // Linode (Akamai)
  16276, // OVH
  24940, // Hetzner
  31898, // Oracle Cloud
  20473, // Choopa / Vultr
  16125, // UK2 / Upcloud region
  53667, // PONYNET (FranTech)
  46475, // LIMESTONE
]);

export function isDatacenterAsn(
  asn: number | null,
  set: ReadonlySet<number> = DEFAULT_DATACENTER_ASNS,
): boolean {
  return asn !== null && set.has(asn);
}

export function captureGeoFrom(
  cityReader: Reader<CityResponse>,
  asnReader: Reader<AsnResponse>,
  ip: string,
  datacenterAsns: ReadonlySet<number> = DEFAULT_DATACENTER_ASNS,
): GeoCapture {
  const cityRow = cityReader.get(ip);
  const asnRow = asnReader.get(ip);
  const asnNum = asnRow?.autonomous_system_number ?? null;

  return {
    country: cityRow?.country?.iso_code ?? null,
    region: cityRow?.subdivisions?.[0]?.iso_code ?? null,
    city: cityRow?.city?.names?.en ?? null,
    asn: asnNum,
    asnOrg: asnRow?.autonomous_system_organization ?? null,
    vpn: isDatacenterAsn(asnNum, datacenterAsns),
  };
}

export interface GeoReader {
  capture(ip: string): GeoCapture;
}

export interface OpenGeoReaderOptions {
  cityDbPath: string;
  asnDbPath: string;
  datacenterAsns?: ReadonlySet<number>;
}

export async function openGeoReader(opts: OpenGeoReaderOptions): Promise<GeoReader> {
  const [city, asn] = await Promise.all([
    maxmind.open<CityResponse>(opts.cityDbPath),
    maxmind.open<AsnResponse>(opts.asnDbPath),
  ]);
  const datacenterAsns = opts.datacenterAsns ?? DEFAULT_DATACENTER_ASNS;
  return {
    capture: (ip: string) => captureGeoFrom(city, asn, ip, datacenterAsns),
  };
}

export const CITY_DB_FILENAME = "GeoLite2-City.mmdb";
export const ASN_DB_FILENAME = "GeoLite2-ASN.mmdb";

let envReaderPromise: Promise<GeoReader | null> | null = null;

export function getEnvGeoReader(): Promise<GeoReader | null> {
  if (envReaderPromise === null) {
    envReaderPromise = (async () => {
      if (!env.MAXMIND_DB_DIR) return null;
      return openGeoReader({
        cityDbPath: path.join(env.MAXMIND_DB_DIR, CITY_DB_FILENAME),
        asnDbPath: path.join(env.MAXMIND_DB_DIR, ASN_DB_FILENAME),
      });
    })();
  }
  return envReaderPromise;
}
