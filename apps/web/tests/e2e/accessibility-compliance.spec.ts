import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility Compliance E2E Tests
 * Tests WCAG 2.1 AA+ compliance for healthcare accessibility requirements
 */

test.describe("Accessibility Compliance", () => {
  test("should meet WCAG 2.1 AA standards on main dashboard", async ({
    page,
  }) => {
    await page.goto("/professional/dashboard");

    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should support keyboard navigation throughout healthcare workflows", async ({
    page,
  }) => {
    await page.goto("/professional/dashboard");

    // Test keyboard navigation
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();

    // Navigate to patient list
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    // Verify patient list accessibility
    await expect(page.locator('[data-testid="patient-list"]')).toBeVisible();

    // Continue keyboard navigation
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowDown");
    await expect(
      page.locator('[role="option"][aria-selected="true"]'),
    ).toBeVisible();
  });

  test("should provide proper ARIA labels for medical forms", async ({
    page,
  }) => {
    await page.goto("/professional/patient/new");

    // Check form accessibility
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    // Verify specific healthcare form elements
    await expect(page.locator('[aria-label="Patient Name"]')).toBeVisible();
    await expect(page.locator('[aria-label="CPF Number"]')).toBeVisible();
    await expect(page.locator('[aria-label="Medical History"]')).toBeVisible();
    await expect(
      page.locator('[aria-describedby*="medical-history-help"]'),
    ).toBeVisible();
  });

  test("should support high contrast mode for visual impairments", async ({
    page,
    context,
  }) => {
    // Emulate high contrast mode
    await context.addInitScript(() => {
      Object.defineProperty(window, "matchMedia", {
        value: (query: string) => ({
          matches: query.includes("prefers-contrast: high"),
          addEventListener: () => {},
          removeEventListener: () => {},
        }),
      });
    });

    await page.goto("/dashboard");

    // Verify high contrast styles are applied
    const dashboardElement = page.locator(
      '[data-testid="healthcare-dashboard"]',
    );
    await expect(dashboardElement).toHaveCSS(
      "color",
      /rgb\(255, 255, 255\)|rgb\(0, 0, 0\)/,
    );

    // Run accessibility scan with high contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should support screen reader navigation with medical content", async ({
    page,
  }) => {
    await page.goto("/professional/patient/12345");

    // Verify screen reader landmarks
    await expect(page.locator('[role="main"]')).toBeVisible();
    await expect(page.locator('[role="navigation"]')).toBeVisible();
    await expect(
      page.locator('[role="region"][aria-label="Patient Medical Records"]'),
    ).toBeVisible();

    // Verify medical data is properly labeled
    await expect(
      page.locator('[aria-label*="Blood Pressure Reading"]'),
    ).toBeVisible();
    await expect(
      page.locator('[aria-label*="Allergy Information"]'),
    ).toBeVisible();
    await expect(
      page.locator('[aria-label*="Current Medications"]'),
    ).toBeVisible();
  });

  test("should provide proper focus management in AI chat interface", async ({
    page,
  }) => {
    await page.goto("/professional/dashboard");
    await page.click('[data-testid="ai-chat-assistant"]');

    // Verify focus is properly managed
    await expect(page.locator('[data-testid="chat-input"]')).toBeFocused();

    // Test focus trap in modal
    await page.keyboard.press("Tab");
    await expect(page.locator('[data-testid="send-message"]')).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator('[data-testid="close-chat"]')).toBeFocused();

    // Tab should cycle back to chat input
    await page.keyboard.press("Tab");
    await expect(page.locator('[data-testid="chat-input"]')).toBeFocused();
  });
});
