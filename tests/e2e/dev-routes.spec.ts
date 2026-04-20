import { expect, test } from "@playwright/test";

const DEV_PATHS = ["/dev", "/dev/tokens", "/dev/primitives"] as const;

for (const path of DEV_PATHS) {
  test(`production build: ${path} returns 404`, async ({ page }) => {
    const resp = await page.goto(path);
    expect(resp?.status()).toBe(404);
  });
}
