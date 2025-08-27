import { expect, test } from "@playwright/test";

test.describe("Healthcare Accessibility Compliance", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("should meet WCAG 2.1 AA standards for patient dashboard", async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press("Tab");
    const focusedElement = await page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Test color contrast for healthcare data
    const patientCards = page.locator('[data-testid="patient-card"]');
    await expect(patientCards.first()).toHaveCSS(
      "color",
      /rgb\(\d+,\s*\d+,\s*\d+\)/,
    );

    // Test ARIA labels for healthcare components
    await expect(page.locator('[aria-label*="Patient"]')).toBeVisible();
    await expect(page.locator('[aria-label*="Medical"]')).toBeVisible();
  });

  test("should provide accessible forms for LGPD consent", async ({ page }) => {
    await page.goto("/patients/new");

    // Test form labels and accessibility
    await expect(page.locator('label[for="patient-name"]')).toBeVisible();
    await expect(page.locator('label[for="lgpd-consent"]')).toBeVisible();

    // Test required field indicators
    await expect(page.locator('[aria-required="true"]')).toHaveCount({
      min: 1,
    });

    // Test error message accessibility
    await page.click('button[type="submit"]');
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test("should support screen readers for ANVISA compliance data", async ({ page }) => {
    await page.goto("/compliance/anvisa");

    // Test ARIA landmarks
    await expect(page.locator('[role="main"]')).toBeVisible();
    await expect(page.locator('[role="navigation"]')).toBeVisible();

    // Test table accessibility for device data
    await expect(page.locator('table[aria-label*="ANVISA"]')).toBeVisible();
    await expect(page.locator('th[scope="col"]')).toHaveCount({ min: 1 });
  });

  test("should provide accessible CFM professional validation interface", async ({ page }) => {
    await page.goto("/professionals");

    // Test heading hierarchy
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h2")).toHaveCount({ min: 1 });

    // Test professional data accessibility
    await expect(
      page.locator('[aria-label*="Professional License"]'),
    ).toBeVisible();
    await expect(
      page.locator('[aria-label*="CFM Registration"]'),
    ).toBeVisible();
  });

  test("should maintain accessibility during data loading states", async ({ page }) => {
    await page.goto("/analytics");

    // Test loading state accessibility
    await expect(page.locator('[aria-live="polite"]')).toBeVisible();
    await expect(page.locator('[aria-label*="Loading"]')).toBeVisible();

    // Wait for data to load and test accessibility
    await page.waitForSelector('[data-testid="analytics-chart"]');
    await expect(page.locator("svg[aria-label]")).toBeVisible();
  });
});
