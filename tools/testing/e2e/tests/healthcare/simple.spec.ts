import { expect, test } from "@playwright/test";

test("Simple health test", async ({ page }) => {
  await page.goto("https://example.com");
  await expect(page).toHaveTitle(/Example/);
});
