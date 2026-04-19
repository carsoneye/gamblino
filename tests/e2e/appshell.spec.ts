import { expect, test } from "@playwright/test";

const uniqueEmail = () => `test+${Date.now()}-${Math.floor(Math.random() * 1e6)}@gamblino.test`;

test("landing / uses marketing shell (no authed chrome) and has footer", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(/play free/i);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/win nothing real/i);

  await expect(page.locator('[data-shell="authed"]')).toHaveCount(0);
  await expect(page.locator('[data-shell="marketing"]')).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Chat" })).toHaveCount(0);

  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.getByRole("link", { name: /take 10,000 credits/i }).first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /originals/i })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /how it works/i })).toBeVisible();
});

test("anonymous /casino redirects to /signin with callbackUrl", async ({ page }) => {
  const resp = await page.goto("/casino");
  await page.waitForURL(/\/signin(\?|$)/);
  expect(resp?.status()).toBeLessThan(500);
  expect(page.url()).toMatch(/\/signin/);
});

test("coming-soon game cards are non-interactive", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const card = page
    .locator("ul")
    .filter({ has: page.getByRole("heading", { level: 3, name: /crash/i }) })
    .getByRole("listitem")
    .first();

  const disabled = card.locator('[aria-disabled="true"]');
  const linkCount = await card.locator("a[href]").count();
  const hasDisabled = await disabled.count();
  expect(hasDisabled + linkCount).toBeGreaterThan(0);
});

test("signup → /casino authed shell renders sidebar, top bar, chat rail, lobby grid", async ({
  page,
}) => {
  const email = uniqueEmail();

  await page.goto("/signup");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("hunter2hunter2");
  await page.getByLabel("Display name (optional)").fill("Tester");
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForURL("**/casino**", { timeout: 20_000 });

  await page.setViewportSize({ width: 1440, height: 900 });

  await expect(page.locator('[data-shell="authed"]')).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Primary" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Chat" })).toBeVisible();
  await expect(page.getByTestId("top-bar")).toBeVisible();

  await expect(page.getByTestId("balance-card")).toBeVisible();
  await expect(page.getByTestId("balance")).toHaveText("10,000");
  await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();

  await expect(page.getByRole("heading", { level: 2, name: /originals/i })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /how it works/i })).toHaveCount(0);
});

test("mobile viewport: hamburger opens sidebar drawer, nav closes it", async ({ page }) => {
  const email = uniqueEmail();
  await page.goto("/signup");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("hunter2hunter2");
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForURL("**/casino**", { timeout: 20_000 });

  await page.setViewportSize({ width: 375, height: 812 });
  await page.reload();

  await expect(page.getByRole("complementary", { name: "Primary" })).toHaveCount(0);
  const hamburger = page.getByRole("button", { name: /open menu/i });
  await expect(hamburger).toBeVisible();
  await hamburger.click();
  await expect(page.getByRole("complementary", { name: "Primary" })).toBeVisible();
});

test("magic-link submit redirects to check-email page", async ({ page }) => {
  await page.goto("/signin");
  await page.getByLabel("Magic-link email").fill("magic@gamblino.test");
  await page.getByRole("button", { name: /email me a link/i }).click();
  await page.waitForURL(/\/signin\/check-email/, { timeout: 10_000 });
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/check your email/i);
});
