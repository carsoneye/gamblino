import { headers } from "next/headers";

export interface RequestContext {
  ip: string;
  userAgent: string | null;
}

const FALLBACK_IP = "0.0.0.0";

export async function getRequestContext(): Promise<RequestContext> {
  const h = await headers();

  const forwarded = h.get("x-forwarded-for");
  const firstForwarded = forwarded?.split(",")[0]?.trim();
  const ip = firstForwarded || h.get("x-real-ip") || FALLBACK_IP;

  return {
    ip,
    userAgent: h.get("user-agent"),
  };
}
