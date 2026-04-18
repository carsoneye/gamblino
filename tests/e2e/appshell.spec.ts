import { expect, test } from "@playwright/test";

const uniqueEmail = () => `test+${Date.now()}-${Math.floor(Math.random() * 1e6)}@gamblino.test`;

test("landing / renders editorial hero with CTAs and no casino shell", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/play free/i);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/win nothing real/i);
  await expect(page.getByRole("link", { name: /take 10,000 credits/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /^sign in$/i }).first()).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);
});

test("authenticated /casino renders sidebar, top bar, chat rail, lobby grid", async ({ page }) => {
  const email = uniqueEmail();

  await page.goto("/signup");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("hunter2hunter2");
  await page.getByLabel("Display name (optional)").fill("Tester");
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForURL("**/casino", { timeout: 20_000 });

  await page.setViewportSize({ width: 1440, height: 900 });

  await expect(page.getByRole("complementary", { name: "Primary" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Chat" })).toBeVisible();
  await expect(page.getByTestId("top-bar")).toBeVisible();

  await expect(page.getByTestId("balance-card")).toBeVisible();
  await expect(page.getByTestId("balance")).toHaveText("10,000");
  await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();

  await expect(page.getByRole("heading", { level: 2, name: /originals/i })).toBeVisible();
});
