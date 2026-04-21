import { headers } from "next/headers";

export interface RequestContext {
  ip: string;
  userAgent: string | null;
}

const FALLBACK_IP = "0.0.0.0";

/**
 * Resolve the client IP from request headers.
 *
 * Trust model: prefer `x-real-ip` — it is single-valued and set by the
 * trusted ingress (Vercel, Railway, nginx with `real_ip_header`), not
 * forwardable by the client in a correctly configured deployment. Fall
 * back to the first hop of `x-forwarded-for` when `x-real-ip` is absent,
 * accepting the spoof risk on deployments without a trusted proxy — the
 * audit trail is advisory, not load-bearing for access decisions.
 *
 * Self-hosted deployments must configure the ingress to strip/overwrite
 * `x-real-ip` and `x-forwarded-for` from client requests. Documented as
 * a Phase 18 deploy concern.
 */
export async function getRequestContext(): Promise<RequestContext> {
  const h = await headers();

  const realIp = h.get("x-real-ip");
  const forwarded = h.get("x-forwarded-for");
  const firstForwarded = forwarded?.split(",")[0]?.trim();
  const ip = realIp || firstForwarded || FALLBACK_IP;

  return {
    ip,
    userAgent: h.get("user-agent"),
  };
}
