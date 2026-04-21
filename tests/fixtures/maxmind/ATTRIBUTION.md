# MaxMind test fixtures — attribution

The `.mmdb` files in this directory are verbatim copies of MaxMind's public
test data, taken from:

<https://github.com/maxmind/MaxMind-DB/tree/main/test-data>

- `GeoLite2-City-Test.mmdb`
- `GeoLite2-ASN-Test.mmdb`

## License

The `MaxMind-DB` repository is licensed under **Apache License 2.0** — see
<https://github.com/maxmind/MaxMind-DB/blob/main/LICENSE>. Apache 2.0 permits
redistribution in derivative works with attribution, which is satisfied by
this file.

This license is **distinct** from the GeoLite2 End-User License Agreement
that governs MaxMind's production GeoLite2 databases. Those EULA-bound files
are **not** checked in — they are downloaded by engineers locally (see
`README.md` → "Geo setup") and baked into the container image at deploy time.

## Purpose

These fixtures back the unit tests in `src/lib/geo/capture.test.ts`. They
contain synthetic test entries designed by MaxMind to exercise reader
implementations and are not suitable for production geo lookup.

## Updating

Only refresh these if the upstream test data changes and our tests need
updated expectations. Pull from the `main` branch of `maxmind/MaxMind-DB`
and preserve the `-Test` suffix on filenames so nothing in the code mistakes
them for production databases.
