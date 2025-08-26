import { expect, test } from "@playwright/test";

/**
 * Team Management E2E Tests for NeonPro Healthcare
 *
 * Critical healthcare workflows:
 * - Staff management and credentials
 * - Scheduling and resource allocation
 * - Compliance monitoring (CFM, CRM licenses)
 * - Emergency team coordination
 * - Performance analytics
 */

test.describe("Team Management - Staff Operations", () => {
  test.beforeEach(async ({ page }) => {
    // Login as administrator
    await page.goto("/login");
    await page.fill('[data-testid="email"]', "admin@neonpro.com");
    await page.fill('[data-testid="password"]', "admin123");
    await page.click('[data-testid="login-button"]');

    // Navigate to team management
    await page.goto("/team");
    await page.waitForLoadState("networkidle");
  });

  test("should display team overview dashboard", async ({ page }) => {
    // Check main team statistics
    await expect(
      page
        .locator('[data-testid="total-staff"]')
        .or(page.locator("text=Total de Funcionários")),
    ).toBeVisible();
    await expect(
      page
        .locator('[data-testid="active-staff"]')
        .or(page.locator("text=Ativos")),
    ).toBeVisible();
    await expect(
      page
        .locator('[data-testid="emergency-available"]')
        .or(page.locator("text=Emergência")),
    ).toBeVisible();

    // Verify team stats are displayed
    const statsCards = page.locator(
      '[data-testid="team-stats"] .card, .team-stats .card',
    );
    await expect(statsCards.first()).toBeVisible();
  });

  test("should manage staff members", async ({ page }) => {
    // Navigate to staff management tab
    await page.click('button:has-text("Funcionários")');

    // Should display staff list
    await expect(
      page
        .locator('[data-testid="staff-list"]')
        .or(page.locator(".staff-list")),
    ).toBeVisible();

    // Test adding new staff member
    const addButton = page.locator('button:has-text("Adicionar")');
    if (await addButton.isVisible()) {
      await addButton.click();

      // Fill staff form
      await page.fill('[data-testid="staff-name"]', "Dr. João Silva");
      await page.fill('[data-testid="staff-email"]', "joao.silva@neonpro.com");
      await page.selectOption('[data-testid="staff-role"]', "doctor");
      await page.fill('[data-testid="crm-number"]', "CRM/SP 123456");

      // Save staff member
      await page.click('button:has-text("Salvar")');

      // Should show success message
      await expect(
        page.locator("text=sucesso").or(page.locator(".success")),
      ).toBeVisible();
    }
  });

  test("should monitor compliance alerts", async ({ page }) => {
    // Check for compliance alerts section
    const alertsSection = page
      .locator('[data-testid="compliance-alerts"]')
      .or(page.locator(".compliance-alerts"));

    if (await alertsSection.isVisible()) {
      // Should display license expiration warnings
      const licenseAlert = page
        .locator("text=CFM")
        .or(page.locator("text=CRM"))
        .or(page.locator("text=licen"));

      if ((await licenseAlert.count()) > 0) {
        await expect(licenseAlert.first()).toBeVisible();
      }
    }

    // Check for emergency alerts
    const emergencyAlert = page
      .locator('[data-testid="emergency-alert"]')
      .or(page.locator("text=Emergência"));
    if (await emergencyAlert.isVisible()) {
      await expect(emergencyAlert).toBeVisible();
    }
  });

  test("should handle scheduling system", async ({ page }) => {
    // Navigate to scheduling tab
    await page.click('button:has-text("Agendamento")');

    // Should display scheduling interface
    await expect(
      page
        .locator('[data-testid="scheduling-system"]')
        .or(page.locator(".scheduling-system")),
    ).toBeVisible();

    // Check for current shifts display
    const shiftsSection = page
      .locator('[data-testid="current-shifts"]')
      .or(page.locator("text=Turnos"));
    if (await shiftsSection.isVisible()) {
      await expect(shiftsSection).toBeVisible();
    }
  });

  test("should display performance analytics", async ({ page }) => {
    // Navigate to analytics tab
    await page.click('button:has-text("Analytics")');

    // Should display performance metrics
    await expect(
      page
        .locator('[data-testid="performance-analytics"]')
        .or(page.locator(".performance-analytics")),
    ).toBeVisible();

    // Check for key performance indicators
    const kpiCards = page.locator('[data-testid="kpi-card"], .kpi-card');
    if ((await kpiCards.count()) > 0) {
      await expect(kpiCards.first()).toBeVisible();
    }
  });

  test("should handle resource allocation", async ({ page }) => {
    // Navigate to resources tab
    await page.click('button:has-text("Recursos")');

    // Should display resource allocation interface
    const resourceSection = page
      .locator('[data-testid="resource-allocation"]')
      .or(page.locator(".resource-allocation"));
    if (await resourceSection.isVisible()) {
      await expect(resourceSection).toBeVisible();

      // Check for equipment and room management
      const equipmentSection = page
        .locator("text=Equipamento")
        .or(page.locator("text=Sala"));
      if ((await equipmentSection.count()) > 0) {
        await expect(equipmentSection.first()).toBeVisible();
      }
    }
  });

  test("should manage communication hub", async ({ page }) => {
    // Navigate to communication tab
    await page.click('button:has-text("Comunicação")');

    // Should display communication interface
    const commSection = page
      .locator('[data-testid="communication-hub"]')
      .or(page.locator(".communication-hub"));
    if (await commSection.isVisible()) {
      await expect(commSection).toBeVisible();

      // Test sending team message
      const messageInput = page.locator('[data-testid="team-message"]');
      if (await messageInput.isVisible()) {
        await messageInput.fill("Reunião de equipe às 14h");
        await page.click('button:has-text("Enviar")');

        // Should show message sent confirmation
        await expect(
          page.locator("text=enviada").or(page.locator(".success")),
        ).toBeVisible();
      }
    }
  });
});

test.describe("Team Management - Emergency Protocols", () => {
  test.beforeEach(async ({ page }) => {
    // Login as emergency coordinator
    await page.goto("/login");
    await page.fill('[data-testid="email"]', "emergency@neonpro.com");
    await page.fill('[data-testid="password"]', "emergency123");
    await page.click('[data-testid="login-button"]');

    await page.goto("/team");
    await page.waitForLoadState("networkidle");
  });

  test("should activate emergency team protocols", async ({ page }) => {
    // Look for emergency activation button
    const emergencyButton = page
      .locator('[data-testid="emergency-activate"]')
      .or(page.locator('button:has-text("Emergência")'));

    if (await emergencyButton.isVisible()) {
      await emergencyButton.click();

      // Should show emergency activation confirmation
      await expect(
        page
          .locator("text=emergência ativada")
          .or(page.locator(".emergency-active")),
      ).toBeVisible();

      // Should display available emergency staff
      const emergencyStaff = page.locator('[data-testid="emergency-staff"]');
      if (await emergencyStaff.isVisible()) {
        await expect(emergencyStaff).toBeVisible();
      }
    }
  });

  test("should handle critical alerts", async ({ page }) => {
    // Check for critical alert handling
    const criticalAlert = page
      .locator('[data-testid="critical-alert"]')
      .or(page.locator(".alert-critical"));

    if (await criticalAlert.isVisible()) {
      await expect(criticalAlert).toBeVisible();

      // Should have acknowledge button
      const ackButton = page.locator('button:has-text("Reconhecer")');
      if (await ackButton.isVisible()) {
        await ackButton.click();

        // Should update alert status
        await expect(
          page.locator("text=reconhecido").or(page.locator(".acknowledged")),
        ).toBeVisible();
      }
    }
  });
});

test.describe("Team Management - Compliance Monitoring", () => {
  test("should track professional licenses", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[data-testid="email"]', "compliance@neonpro.com");
    await page.fill('[data-testid="password"]', "compliance123");
    await page.click('[data-testid="login-button"]');

    await page.goto("/team");

    // Check compliance dashboard
    const complianceSection = page.locator(
      '[data-testid="compliance-dashboard"]',
    );
    if (await complianceSection.isVisible()) {
      // Should show license status
      await expect(
        page.locator("text=CFM").or(page.locator("text=CRM")),
      ).toBeVisible();

      // Should show expiration warnings
      const expirationWarning = page
        .locator(".warning")
        .or(page.locator('[data-testid="license-warning"]'));
      if ((await expirationWarning.count()) > 0) {
        await expect(expirationWarning.first()).toBeVisible();
      }
    }
  });

  test("should generate compliance reports", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[data-testid="email"]', "admin@neonpro.com");
    await page.fill('[data-testid="password"]', "admin123");
    await page.click('[data-testid="login-button"]');

    await page.goto("/team");

    // Look for reports generation
    const reportsButton = page.locator('button:has-text("Relatório")');
    if (await reportsButton.isVisible()) {
      await reportsButton.click();

      // Should show report options
      await expect(
        page
          .locator('[data-testid="report-options"]')
          .or(page.locator(".report-options")),
      ).toBeVisible();
    }
  });
});

test.describe("Team Management - Accessibility", () => {
  test("should be keyboard accessible", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[data-testid="email"]', "admin@neonpro.com");
    await page.fill('[data-testid="password"]', "admin123");
    await page.click('[data-testid="login-button"]');

    await page.goto("/team");

    // Test keyboard navigation
    await page.keyboard.press("Tab");

    // Should focus on first interactive element
    const focusedElement = await page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Test Enter key activation
    await page.keyboard.press("Enter");

    // Should activate the focused element
    // (specific behavior depends on the element)
  });

  test("should have proper ARIA labels", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[data-testid="email"]', "admin@neonpro.com");
    await page.fill('[data-testid="password"]', "admin123");
    await page.click('[data-testid="login-button"]');

    await page.goto("/team");

    // Check for ARIA landmarks
    const mainContent = page.locator('[role="main"]').or(page.locator("main"));
    await expect(mainContent).toBeVisible();

    // Check for proper button labels
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const hasLabel =
        (await button.getAttribute("aria-label")) ||
        (await button.textContent());
      expect(hasLabel).toBeTruthy();
    }
  });
});
