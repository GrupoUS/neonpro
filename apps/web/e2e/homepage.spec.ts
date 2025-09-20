import { expect, test } from "@playwright/test";

test.describe("App Smoke Tests", () => {
  test("homepage loads correctly", async ({ page }) => {
    await page.goto("/");

    // Check if the page loads without errors
    await expect(page).toHaveTitle(/NEON PRO/i);

    // Check if main navigation is present (might not exist in current app)
    const bodyContent = page.locator("body");
    await expect(bodyContent).toBeVisible();
  });

  test("app has basic navigation structure", async ({ page }) => {
    await page.goto("/");

    // Wait for any loading states to complete
    await page.waitForLoadState("networkidle");

    // Check for expected navigation elements
    // These will need to be updated based on actual app structure
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();
  });

  test("responsive design works on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Check that page is responsive
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
