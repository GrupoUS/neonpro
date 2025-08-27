import { test, expect } from "@playwright/test";

/**
 * Healthcare Authentication & LGPD Consent Flow E2E Tests
 * Tests patient registration, LGPD compliance, and authentication workflows
 */

test.describe("Healthcare Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should complete patient registration with LGPD consent", async ({
    page,
  }) => {
    // Navigate to registration
    await page.click('[data-testid="register-button"]');
    await expect(page).toHaveURL(/.*\/register/);

    // Fill patient registration form
    await page.fill('[data-testid="patient-name"]', "João Silva");
    await page.fill('[data-testid="patient-cpf"]', "12345678901");
    await page.fill('[data-testid="patient-email"]', "joao.silva@example.com");
    await page.fill('[data-testid="patient-phone"]', "+5511999999999");
    await page.fill('[data-testid="patient-birthdate"]', "1990-01-01");

    // LGPD Consent flow
    await page.check('[data-testid="lgpd-data-processing-consent"]');
    await page.check('[data-testid="lgpd-marketing-consent"]');
    await page.check('[data-testid="lgpd-medical-research-consent"]');

    // Verify LGPD privacy notice is displayed
    await expect(
      page.locator('[data-testid="lgpd-privacy-notice"]'),
    ).toBeVisible();

    // Complete registration
    await page.click('[data-testid="complete-registration"]');

    // Verify success and compliance
    await expect(
      page.locator('[data-testid="registration-success"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="lgpd-compliance-confirmed"]'),
    ).toBeVisible();
  });

  test("should handle patient authentication with healthcare validation", async ({
    page,
  }) => {
    // Login flow
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="login-email"]', "patient@test.com");
    await page.fill('[data-testid="login-password"]', "SecurePassword123!");
    await page.click('[data-testid="submit-login"]');

    // Verify healthcare-specific dashboard access
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(
      page.locator('[data-testid="patient-dashboard"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="medical-records-access"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="appointment-scheduling"]'),
    ).toBeVisible();
  });

  test("should enforce LGPD data subject rights", async ({ page }) => {
    // Login as patient
    await page.goto("/login");
    await page.fill('[data-testid="login-email"]', "patient@test.com");
    await page.fill('[data-testid="login-password"]', "SecurePassword123!");
    await page.click('[data-testid="submit-login"]');

    // Navigate to privacy settings
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="privacy-settings"]');

    // Test data portability (download data)
    await page.click('[data-testid="download-my-data"]');
    await expect(
      page.locator('[data-testid="data-export-initiated"]'),
    ).toBeVisible();

    // Test consent management
    await page.click('[data-testid="manage-consent"]');
    await page.uncheck('[data-testid="marketing-consent"]');
    await page.click('[data-testid="save-consent-preferences"]');
    await expect(page.locator('[data-testid="consent-updated"]')).toBeVisible();

    // Test right to be forgotten
    await page.click('[data-testid="delete-account"]');
    await page.fill('[data-testid="deletion-confirmation"]', "DELETE");
    await page.click('[data-testid="confirm-deletion"]');
    await expect(
      page.locator('[data-testid="deletion-scheduled"]'),
    ).toBeVisible();
  });

  test("should handle healthcare professional authentication", async ({
    page,
  }) => {
    // Professional login
    await page.goto("/professional/login");
    await page.fill('[data-testid="professional-crm"]', "CRM12345SP");
    await page.fill(
      '[data-testid="professional-password"]',
      "MedicalPassword123!",
    );
    await page.click('[data-testid="submit-professional-login"]');

    // Verify professional dashboard
    await expect(page).toHaveURL(/.*\/professional\/dashboard/);
    await expect(
      page.locator('[data-testid="professional-dashboard"]'),
    ).toBeVisible();
    await expect(page.locator('[data-testid="patient-list"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="cfm-compliance-status"]'),
    ).toBeVisible();
  });
});
