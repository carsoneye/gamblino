import { expect, test } from "@playwright/test";

const uniqueEmail = () => `test+${Date.now()}-${Math.floor(Math.random() * 1e6)}@gamblino.test`;

test("sign up → redirected to /casino, balance row shows 10,000", async ({ page }) => {
  const email = uniqueEmail();

  await page.goto("/signup");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("hunter2hunter2");
  await page.getByLabel("Display name (optional)").fill("Tester");
  await page.getByRole("button", { name: /create account/i }).click();

  await page.waitForURL(/\/casino(\?|$)/, { timeout: 20_000 });
  await expect(page.getByTestId("balance-card")).toBeVisible();
  await expect(page.getByTestId("balance")).toHaveText("10,000");
  await expect(page.getByRole("button", { name: "Account menu" })).toBeVisible();
});

test("protected /casino redirects anonymous users to /signin", async ({ page }) => {
  await page.goto("/casino");
  await page.waitForURL(/\/signin/, { timeout: 10_000 });
  await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
});
