import { expect, test } from "bun:test";

test("env schema loads with defaults under SKIP_ENV_VALIDATION", async () => {
  process.env.SKIP_ENV_VALIDATION = "1";
  const { env } = await import("./env");
  expect(env).toBeDefined();
});
