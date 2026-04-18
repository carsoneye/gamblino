import * as Sentry from "@sentry/nextjs";
import { env } from "@/env";

Sentry.init({
  dsn: env.SENTRY_DSN || undefined,
  environment: env.SENTRY_ENVIRONMENT,
  tracesSampleRate: 1.0,
  enabled: !!env.SENTRY_DSN,
});
