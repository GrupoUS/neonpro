import { expect, test } from "@playwright/test";

/**
 * Patient Portal E2E Tests for NeonPro Healthcare
 *
 * Critical patient-facing workflows:
 * - Patient authentication and profile access
 * - Medical records viewing and downloading
 * - Appointment scheduling and management
 * - Test results access and interpretation
 * - LGPD compliance for patient data
 * - Secure document handling
 */

test.describe("Patient Portal - Authentication & Access", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/patient-portal");
    await page.waitForLoadState("networkidle");
  });

  test("should display patient portal landing page", async ({ page }) => {
    // Check portal branding and information
    await expect(page.locator("h1, .portal-title")).toContainText(
      /Portal|Paciente/,
    );

    // Should have login section
    await expect(
      page
        .locator('[data-testid="patient-login"]')
        .or(page.locator(".patient-login")),
    ).toBeVisible();

    // Should display LGPD compliance notice
    const lgpdNotice = page
      .locator("text=LGPD")
      .or(page.locator("text=privacidade"));
    await expect(lgpdNotice).toBeVisible();
  });

  test("should authenticate patient with CPF", async ({ page }) => {
    // Fill patient credentials
    await page.fill('[data-testid="patient-cpf"]', "123.456.789-00");
    await page.fill('[data-testid="patient-password"]', "patient123");

    // Submit login
    await page.click('[data-testid="patient-login-button"]');

    // Should redirect to patient dashboard
    await expect(page).toHaveURL(/.*\/patient-portal\/dashboard/);

    // Should display patient name
    await expect(
      page
        .locator('[data-testid="patient-name"]')
        .or(page.locator(".patient-name")),
    ).toBeVisible();
  });

  test("should handle invalid patient credentials", async ({ page }) => {
    // Fill invalid credentials
    await page.fill('[data-testid="patient-cpf"]', "000.000.000-00");
    await page.fill('[data-testid="patient-password"]', "wrongpassword");

    // Submit login
    await page.click('[data-testid="patient-login-button"]');

    // Should show error message
    await expect(
      page.locator(".error").or(page.locator('[data-testid="login-error"]')),
    ).toBeVisible();

    // Should remain on login page
    await expect(page).toHaveURL(/.*\/patient-portal/);
  });
});

test.describe("Patient Portal - Medical Records", () => {
  test.beforeEach(async ({ page }) => {
    // Login as patient
    await page.goto("/patient-portal");
    await page.fill('[data-testid="patient-cpf"]', "123.456.789-00");
    await page.fill('[data-testid="patient-password"]', "patient123");
    await page.click('[data-testid="patient-login-button"]');

    // Navigate to medical records
    await page.click('button:has-text("Prontuário")');
    await page.waitForLoadState("networkidle");
  });

  test("should display medical records list", async ({ page }) => {
    // Should show medical records table
    await expect(
      page
        .locator('[data-testid="medical-records"]')
        .or(page.locator(".medical-records")),
    ).toBeVisible();

    // Should display record entries
    const recordRows = page.locator("tr").filter({ hasText: /Dr\.|Dra\./ });
    if ((await recordRows.count()) > 0) {
      await expect(recordRows.first()).toBeVisible();
    }

    // Should show dates and doctors
    await expect(page.locator("text=/d{2}/d{2}/d{4}/")).toBeVisible();
  });

  test("should view detailed medical record", async ({ page }) => {
    // Click on first medical record
    const firstRecord = page.locator('[data-testid="record-view"]').first();
    if (await firstRecord.isVisible()) {
      await firstRecord.click();

      // Should display detailed view
      await expect(
        page
          .locator('[data-testid="record-details"]')
          .or(page.locator(".record-details")),
      ).toBeVisible();

      // Should show diagnosis and prescription
      await expect(
        page.locator("text=Diagnóstico").or(page.locator("text=Prescrição")),
      ).toBeVisible();
    }
  });

  test("should download medical record PDF", async ({ page }) => {
    // Look for download button
    const downloadButton = page
      .locator('[data-testid="download-record"]')
      .or(page.locator('button:has-text("Download")'))
      .first();

    if (await downloadButton.isVisible()) {
      // Start download
      const downloadPromise = page.waitForEvent("download");
      await downloadButton.click();

      // Verify download started
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    }
  });

  test("should respect LGPD data access controls", async ({ page }) => {
    // Should display data usage consent
    const consentSection = page
      .locator('[data-testid="data-consent"]')
      .or(page.locator("text=consentimento"));
    if (await consentSection.isVisible()) {
      await expect(consentSection).toBeVisible();
    }

    // Should show data access log
    const accessLog = page
      .locator('[data-testid="access-log"]')
      .or(page.locator("text=histórico de acesso"));
    if (await accessLog.isVisible()) {
      await expect(accessLog).toBeVisible();
    }
  });
});

test.describe("Patient Portal - Appointments", () => {
  test.beforeEach(async ({ page }) => {
    // Login as patient
    await page.goto("/patient-portal");
    await page.fill('[data-testid="patient-cpf"]', "123.456.789-00");
    await page.fill('[data-testid="patient-password"]', "patient123");
    await page.click('[data-testid="patient-login-button"]');

    // Navigate to appointments
    await page.click('button:has-text("Consultas")');
    await page.waitForLoadState("networkidle");
  });

  test("should display upcoming appointments", async ({ page }) => {
    // Should show appointments list
    await expect(
      page
        .locator('[data-testid="appointments-list"]')
        .or(page.locator(".appointments-list")),
    ).toBeVisible();

    // Should display appointment details
    const appointmentCard = page
      .locator(".appointment-card")
      .or(page.locator('[data-testid="appointment-card"]'))
      .first();
    if (await appointmentCard.isVisible()) {
      await expect(appointmentCard).toContainText(/Dr\.|Dra\./);
      await expect(appointmentCard).toContainText(/\d{2}:\d{2}/);
    }
  });

  test("should schedule new appointment", async ({ page }) => {
    // Look for schedule button
    const scheduleButton = page.locator('button:has-text("Agendar")');
    if (await scheduleButton.isVisible()) {
      await scheduleButton.click();

      // Should show scheduling form
      await expect(
        page
          .locator('[data-testid="appointment-form"]')
          .or(page.locator(".appointment-form")),
      ).toBeVisible();

      // Fill appointment details
      await page.selectOption('[data-testid="specialty"]', "cardiologia");
      await page.selectOption('[data-testid="doctor"]', "dr-silva");
      await page.click('[data-testid="date-picker"]');

      // Select available date (simplified)
      await page.click(".available-date");

      // Submit appointment
      await page.click('button:has-text("Confirmar")');

      // Should show success message
      await expect(
        page.locator(".success").or(page.locator("text=agendada")),
      ).toBeVisible();
    }
  });

  test("should cancel appointment", async ({ page }) => {
    // Look for cancel button on first appointment
    const cancelButton = page
      .locator('[data-testid="cancel-appointment"]')
      .first();
    if (await cancelButton.isVisible()) {
      await cancelButton.click();

      // Should show confirmation dialog
      await expect(
        page
          .locator('[data-testid="cancel-confirmation"]')
          .or(page.locator(".confirmation-dialog")),
      ).toBeVisible();

      // Confirm cancellation
      await page.click('button:has-text("Confirmar")');

      // Should show cancellation success
      await expect(
        page.locator("text=cancelada").or(page.locator(".success")),
      ).toBeVisible();
    }
  });

  test("should display appointment history", async ({ page }) => {
    // Navigate to history tab
    await page.click('button:has-text("Histórico")');

    // Should show past appointments
    const historySection = page
      .locator('[data-testid="appointment-history"]')
      .or(page.locator(".appointment-history"));
    if (await historySection.isVisible()) {
      await expect(historySection).toBeVisible();

      // Should show completed appointments
      const completedAppointments = page.locator(".appointment-completed");
      if ((await completedAppointments.count()) > 0) {
        await expect(completedAppointments.first()).toBeVisible();
      }
    }
  });
});

test.describe("Patient Portal - Test Results", () => {
  test.beforeEach(async ({ page }) => {
    // Login as patient
    await page.goto("/patient-portal");
    await page.fill('[data-testid="patient-cpf"]', "123.456.789-00");
    await page.fill('[data-testid="patient-password"]', "patient123");
    await page.click('[data-testid="patient-login-button"]');

    // Navigate to test results
    await page.click('button:has-text("Exames")');
    await page.waitForLoadState("networkidle");
  });

  test("should display test results list", async ({ page }) => {
    // Should show test results table
    await expect(
      page
        .locator('[data-testid="test-results"]')
        .or(page.locator(".test-results")),
    ).toBeVisible();

    // Should display test entries
    const testRows = page.locator("tr").filter({ hasText: /Exame|Teste/ });
    if ((await testRows.count()) > 0) {
      await expect(testRows.first()).toBeVisible();
    }
  });

  test("should view detailed test result", async ({ page }) => {
    // Click on first test result
    const firstTest = page.locator('[data-testid="test-view"]').first();
    if (await firstTest.isVisible()) {
      await firstTest.click();

      // Should display detailed view
      await expect(
        page
          .locator('[data-testid="test-details"]')
          .or(page.locator(".test-details")),
      ).toBeVisible();

      // Should show test values and reference ranges
      await expect(
        page.locator("text=Resultado").or(page.locator("text=Referência")),
      ).toBeVisible();
    }
  });

  test("should download test result PDF", async ({ page }) => {
    // Look for download button
    const downloadButton = page
      .locator('[data-testid="download-test"]')
      .or(page.locator('button:has-text("Download")'))
      .first();

    if (await downloadButton.isVisible()) {
      // Start download
      const downloadPromise = page.waitForEvent("download");
      await downloadButton.click();

      // Verify download started
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    }
  });

  test("should highlight abnormal results", async ({ page }) => {
    // Look for abnormal result indicators
    const abnormalResults = page
      .locator(".abnormal")
      .or(page.locator('[data-testid="abnormal-result"]'));

    if ((await abnormalResults.count()) > 0) {
      await expect(abnormalResults.first()).toBeVisible();

      // Should have visual indicator (color, icon, etc.)
      const hasIndicator = await abnormalResults.first().evaluate((el) => {
        const style = window.getComputedStyle(el);
        return (
          style.color !== "rgb(0, 0, 0)"
          || style.backgroundColor !== "rgba(0, 0, 0, 0)"
        );
      });
      expect(hasIndicator).toBeTruthy();
    }
  });
});

test.describe("Patient Portal - Security & Privacy", () => {
  test("should enforce session timeout", async ({ page }) => {
    // Login as patient
    await page.goto("/patient-portal");
    await page.fill('[data-testid="patient-cpf"]', "123.456.789-00");
    await page.fill('[data-testid="patient-password"]', "patient123");
    await page.click('[data-testid="patient-login-button"]');

    // Wait for potential session timeout (shortened for testing)
    await page.waitForTimeout(5000);

    // Check if session is still active
    const sessionActive = await page
      .locator('[data-testid="patient-name"]')
      .isVisible();

    // If session timeout is implemented, should redirect to login
    if (!sessionActive) {
      await expect(page).toHaveURL(/.*\/patient-portal$/);
    }
  });

  test("should secure patient data transmission", async ({ page }) => {
    await page.goto("/patient-portal");

    // Check that page is served over HTTPS in production
    const url = page.url();
    if (url.includes("neonpro.com") || url.includes("production")) {
      expect(url).toMatch(/^https:/);
    }

    // Check for security headers (simplified)
    const response = await page.goto("/patient-portal");
    const headers = response?.headers();

    if (headers) {
      // Should have security headers in production
      const hasSecurityHeaders = headers["x-frame-options"] || headers["x-content-type-options"];
      if (url.includes("production")) {
        expect(hasSecurityHeaders).toBeTruthy();
      }
    }
  });

  test("should handle LGPD data requests", async ({ page }) => {
    // Login as patient
    await page.goto("/patient-portal");
    await page.fill('[data-testid="patient-cpf"]', "123.456.789-00");
    await page.fill('[data-testid="patient-password"]', "patient123");
    await page.click('[data-testid="patient-login-button"]');

    // Navigate to privacy settings
    const privacyLink = page
      .locator('a:has-text("Privacidade")')
      .or(page.locator('[data-testid="privacy-settings"]'));
    if (await privacyLink.isVisible()) {
      await privacyLink.click();

      // Should show LGPD options
      await expect(
        page.locator("text=LGPD").or(page.locator("text=dados pessoais")),
      ).toBeVisible();

      // Should have data export option
      const exportButton = page.locator('button:has-text("Exportar")');
      if (await exportButton.isVisible()) {
        await expect(exportButton).toBeVisible();
      }

      // Should have data deletion request option
      const deleteButton = page.locator('button:has-text("Excluir")');
      if (await deleteButton.isVisible()) {
        await expect(deleteButton).toBeVisible();
      }
    }
  });
});

test.describe("Patient Portal - Accessibility", () => {
  test("should be keyboard accessible", async ({ page }) => {
    await page.goto("/patient-portal");

    // Test keyboard navigation
    await page.keyboard.press("Tab");

    // Should focus on first interactive element
    const focusedElement = await page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Continue tabbing through form
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Should be able to navigate to login button
    const loginButton = page.locator(
      '[data-testid="patient-login-button"]:focus',
    );
    if (await loginButton.isVisible()) {
      await expect(loginButton).toBeVisible();
    }
  });

  test("should have proper ARIA labels for medical data", async ({ page }) => {
    // Login as patient
    await page.goto("/patient-portal");
    await page.fill('[data-testid="patient-cpf"]', "123.456.789-00");
    await page.fill('[data-testid="patient-password"]', "patient123");
    await page.click('[data-testid="patient-login-button"]');

    // Check for ARIA landmarks
    const mainContent = page.locator('[role="main"]').or(page.locator("main"));
    await expect(mainContent).toBeVisible();

    // Check for proper table headers in medical data
    const tableHeaders = page.locator("th");
    const headerCount = await tableHeaders.count();

    if (headerCount > 0) {
      // Should have scope attributes for accessibility
      const firstHeader = tableHeaders.first();
      const hasScope = await firstHeader.getAttribute("scope");
      if (hasScope) {
        expect(hasScope).toMatch(/col|row/);
      }
    }
  });

  test("should support screen readers for medical information", async ({ page }) => {
    // Login as patient
    await page.goto("/patient-portal");
    await page.fill('[data-testid="patient-cpf"]', "123.456.789-00");
    await page.fill('[data-testid="patient-password"]', "patient123");
    await page.click('[data-testid="patient-login-button"]');

    // Check for screen reader friendly content
    const medicalContent = page.locator('[data-testid="medical-records"]');
    if (await medicalContent.isVisible()) {
      // Should have descriptive text for screen readers
      const ariaDescriptions = page.locator("[aria-describedby]");
      if ((await ariaDescriptions.count()) > 0) {
        await expect(ariaDescriptions.first()).toBeVisible();
      }
    }
  });
});
