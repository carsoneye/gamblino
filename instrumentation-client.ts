import * as Sentry from "@sentry/nextjs";
import { env } from "@/env";

const dsn = env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.0,
  enabled: !!dsn,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
