import { expect, test } from "@playwright/test";

/**
 * Simple Healthcare Test
 * Basic test to ensure Playwright is working in healthcare context
 */

test.describe("Healthcare Platform Basic Tests", () => {
  test("should load homepage", async ({ page }) => {
    // For now, test with a simple external site
    await page.goto("https://example.com");
    await expect(page).toHaveTitle(/Example/);
  });

  test("should have working form elements", async ({ page }) => {
    await page.goto("https://httpbin.org/forms/post");

    // Fill form without using faker for now
    await page.fill('input[name="custname"]', "John Doe");
    await page.fill('input[name="custtel"]', "123-456-7890");
    await page.fill('input[name="custemail"]', "john@example.com");

    await expect(page.locator('input[name="custname"]')).toHaveValue(
      "John Doe",
    );
    await expect(page.locator('input[name="custtel"]')).toHaveValue(
      "123-456-7890",
    );
    await expect(page.locator('input[name="custemail"]')).toHaveValue(
      "john@example.com",
    );
  });
});
