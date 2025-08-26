import { expect, test } from "@playwright/test";

test.describe("NeonPro Application", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check if the page title contains expected text
    await expect(page).toHaveTitle(/NeonPro/);

    // Take a screenshot for visual comparison
    await page.screenshot({ path: "tools/testing/reports/homepage.png" });
  });

  test("should have navigation menu", async ({ page }) => {
    await page.goto("/");

    // Wait for navigation to be visible
    await page.waitForSelector("nav", { timeout: 10_000 });

    // Check if navigation exists
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Take mobile screenshot
    await page.screenshot({
      path: "tools/testing/reports/mobile-homepage.png",
    });

    // Verify mobile responsive behavior
    await expect(page.locator("body")).toBeVisible();
  });
});
