import type { DbTx } from "@/db";
import { userGeoEvents } from "@/db/schema";
import { type GeoReader, getEnvGeoReader } from "./capture";

export type GeoEventSource =
  | "signup_credentials"
  | "signup_magic_link_first_load"
  | "login"
  | "logout"
  | "ws_connect";

export interface WriteUserGeoEventInput {
  userId: string;
  ip: string;
  userAgent?: string | null;
  source: GeoEventSource;
}

export interface WriteUserGeoEventResult {
  id: string;
}

export async function writeUserGeoEvent(
  tx: DbTx,
  input: WriteUserGeoEventInput,
  reader?: GeoReader | null,
): Promise<WriteUserGeoEventResult> {
  const effectiveReader = reader === undefined ? await getEnvGeoReader() : reader;
  const geo = effectiveReader ? effectiveReader.capture(input.ip) : null;

  const [row] = await tx
    .insert(userGeoEvents)
    .values({
      userId: input.userId,
      ip: input.ip,
      userAgent: input.userAgent ?? null,
      country: geo?.country ?? null,
      region: geo?.region ?? null,
      city: geo?.city ?? null,
      asn: geo?.asn ?? null,
      asnOrg: geo?.asnOrg ?? null,
      vpn: geo?.vpn ?? false,
      source: input.source,
    })
    .returning({ id: userGeoEvents.id });

  return { id: row.id };
}
