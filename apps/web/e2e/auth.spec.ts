import { expect, test } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("main page loads correctly", async ({ page }) => {
    await page.goto("/");

    // Check if the page loads without errors
    await expect(page).toHaveTitle(/NEON PRO/i);

    // Check for basic page structure
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("app structure is present", async ({ page }) => {
    await page.goto("/");

    // Wait for any loading states to complete
    await page.waitForLoadState("networkidle");

    // Check for main content area
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // Check for root element
    const root = page.locator("#root");
    await expect(root).toBeVisible();
  });
});
// Forgot Password toast should appear via Sonner
import { expect as e2, test as t2 } from "@playwright/test";

t2("forgot password shows success toast", async ({ page }) => {
  await page.goto("/");

  // Switch to "Recuperar" tab
  await page.getByRole("tab", { name: /recuperar/i }).click();

  // Fill email and submit
  await page.getByLabel(/e-mail/i).fill("user@example.com");
  await page.getByRole("button", { name: /enviar link/i }).click();

  // Expect a toast to appear with success message
  // Sonner renders an element with role="status" by default for screen readers
  const toast = page.getByRole("status");
  await e2(toast).toContainText(/enviamos um link de recuperação/i);
});
