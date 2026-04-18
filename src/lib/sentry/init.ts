import * as Sentry from "@sentry/nextjs";
import { env } from "@/env";

export function initServerSentry() {
  const dsn = env.SENTRY_DSN;
  Sentry.init({
    dsn,
    environment: env.SENTRY_ENVIRONMENT,
    tracesSampleRate: 1.0,
    enabled: !!dsn,
  });
}
