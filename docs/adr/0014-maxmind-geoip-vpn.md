# ADR-0014 · MaxMind GeoLite2 on-prem + ASN-derived VPN signal

**Status:** accepted · 2026-04-20

## Context

Phase 8 adds `user_geo_events` — an audit trail that records the IP/geo/ASN context of every signup and login. The data serves three downstream use cases: responsible-gaming reporting (country/region counts), fraud/abuse investigation (unexpected jurisdiction or datacenter-origin logins), and the Phase 11 farming-detection heuristics (same account logging in from many countries, or any login from a hosting provider). Two implementation questions needed answers before writing any code:

- **Where does geo data come from?** The alternatives were a hosted lookup API (MaxMind Web Service, ipinfo.io, ipgeolocation.io) or a local `.mmdb` file read on-prem. Hosted APIs leak every login IP to a third party and add a network hop on the signup/login critical path; that hop is both latency and an availability dependency.
- **How do we flag VPN / hosting-provider connections?** Commercial VPN-detection feeds exist but are expensive and opaque. MaxMind also sells a specific `GeoIP2 Anonymous IP` database with a `vpn`/`hosting` boolean, under a paid license.

## Decision

- **MaxMind GeoLite2 on-prem.** `src/lib/geo/capture.ts` reads two free GeoLite2 `.mmdb` files via the `maxmind@5` npm package: `GeoLite2-City.mmdb` for country/region/city, and `GeoLite2-ASN.mmdb` for ASN + organization. Both files live in a directory configured via `MAXMIND_DB_PATH`. `openGeoReader({ cityDbPath, asnDbPath })` takes explicit paths so tests and prod use identical code with different fixtures. `getEnvGeoReader()` is the env-backed singleton entry for production callers. No IP is sent to any third party — the lookup is a local B-tree read.
- **VPN signal is derived from ASN, not bought as a separate feed.** `DEFAULT_DATACENTER_ASNS` is a curated set of major hosting-provider ASNs (AWS `16509`, Google `15169`, Microsoft `8075`, DigitalOcean `14061`, Cloudflare `13335`, OVH `16276`, Hetzner `24940`, Oracle `31898`, Vultr `20473`, etc.). `captureGeoFrom(city, asn, ip)` sets `vpn: true` iff the resolved ASN is in the set. This catches the 80% case — residential users do not sit behind `AS16509`. It does **not** catch consumer VPN providers (NordVPN, ExpressVPN) that use their own ASNs, and it does not catch Tor. Those are Phase 11 concerns and will layer on top, not replace.
- **Datacenter set is injectable.** `captureGeoFrom(..., datacenterAsns?)` and `openGeoReader({ ..., datacenterAsns? })` both accept an override. Tests use a synthetic set to exercise `vpn=true` against the public GeoLite2 test fixture (where no real datacenter ASN exists). Production uses the default curated set. Updating the curated list over time does not require touching callers.
- **CI fixture, not skipIf.** `tests/fixtures/maxmind/GeoLite2-{City,ASN}-Test.mmdb` are committed copies of MaxMind's public test-data files (license permits derivative fixtures for testing). Geo tests reference them by explicit path, no env var. The alternative — `.skipIf(!env.MAXMIND_DB_PATH)` — silently drops coverage on every CI run that forgets to configure the env, which defeats the point.

## Consequences

- **Positive:** zero egress for IP data, deterministic latency, no API-availability coupling on the signup/login critical path. Free tier is sufficient (GeoLite2 updates weekly via `geoipupdate`). The VPN signal is cheap, explainable ("we flagged this because the IP resolved to ASN 16509 = AWS"), and tunable without a vendor change. Tests are real-data-backed without pulling from the network during CI.
- **Negative:** the datacenter-ASN set needs periodic maintenance — hosting providers add ASNs as they expand, and our list will drift if left untouched. A quarterly refresh from a trusted public list is on the Phase 11 TODO. The VPN signal will not flag consumer VPNs; anyone expecting "vpn=true = any VPN" will be surprised. The ADR text + field docstring make the semantics explicit: `vpn` = "connection originates from a known datacenter/hosting ASN", not "user is hiding their IP."
- **Reversible:** switching to a hosted API or a paid Anonymous IP feed is behind the `GeoReader` interface. `openGeoReader` is the only factory; replacing it with `openHostedGeoReader` does not touch callers. The committed ADR-0013 append-only invariant on `user_geo_events` means prior rows stay valid under any reader swap.
