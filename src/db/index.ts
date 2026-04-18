import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  __pg?: ReturnType<typeof postgres>;
};

export const client =
  globalForDb.__pg ??
  postgres(env.DATABASE_URL, {
    max: env.NODE_ENV === "production" ? 10 : 5,
    prepare: false,
  });

if (env.NODE_ENV !== "production") globalForDb.__pg = client;

export const db = drizzle(client, { schema, casing: "snake_case" });
export type Db = typeof db;
export { schema };
