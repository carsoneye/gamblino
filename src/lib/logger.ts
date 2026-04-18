import pino from "pino";
import { env } from "@/env";

declare const EdgeRuntime: string | undefined;
const isEdge = typeof EdgeRuntime !== "undefined";
const isDev = env.NODE_ENV !== "production";
const usePretty = isDev && !isEdge;

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: "gamblino" },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(usePretty && {
    transport: {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "SYS:HH:MM:ss.l", ignore: "pid,hostname" },
    },
  }),
});

export type Logger = typeof logger;
