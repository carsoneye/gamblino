import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const flag = z.enum(["on", "off"]).default("on");
const isProd = process.env.NODE_ENV === "production";
const secret = isProd ? z.string().min(16) : z.string().min(1).default("dev-only-insecure-secret");

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: secret,
    AUTH_URL: z.string().url(),
    EMAIL_SERVER_HOST: z.string().min(1).default("localhost"),
    EMAIL_SERVER_PORT: z.coerce.number().int().positive().default(1025),
    EMAIL_SERVER_USER: z.string().optional(),
    EMAIL_SERVER_PASSWORD: z.string().optional(),
    EMAIL_FROM: z.string().min(1).default("noreply@gamblino.local"),
    SENTRY_DSN: z.string().optional(),
    SENTRY_ENVIRONMENT: z.string().default("development"),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
    FLAG_CRASH: flag,
    FLAG_MINES: flag,
    FLAG_PLINKO: flag,
    UPSTASH_REDIS_REST_URL: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    WS_PORT: z.coerce.number().int().positive().default(3001),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  client: {
    NEXT_PUBLIC_WS_URL: z.string().url(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,
    LOG_LEVEL: process.env.LOG_LEVEL,
    FLAG_CRASH: process.env.FLAG_CRASH,
    FLAG_MINES: process.env.FLAG_MINES,
    FLAG_PLINKO: process.env.FLAG_PLINKO,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    WS_PORT: process.env.WS_PORT,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
});
