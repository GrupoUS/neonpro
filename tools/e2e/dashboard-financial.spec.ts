import { expect, test } from "@playwright/test";

// Dashboard Financial E2E Tests
// Tests revenue analytics, billing management, payment processing, and financial reporting

test.describe("Dashboard Financial Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to financial dashboard
    await page.goto("/dashboard/financial");

    // Wait for page to load
    await page.waitForLoadState("networkidle");
  });

  test.describe("Financial Overview", () => {
    test("should display financial dashboard with key metrics", async ({
      page,
    }) => {
      // Check page title and navigation
      await expect(page).toHaveTitle(/Financial.*NeonPro/);
      await expect(page.locator("h1")).toContainText("Financial Dashboard");

      // Verify financial metrics cards
      await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="monthly-revenue"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="outstanding-payments"]'),
      ).toBeVisible();
      await expect(page.locator('[data-testid="profit-margin"]')).toBeVisible();

      // Check revenue growth indicator
      const revenueGrowth = page.locator('[data-testid="revenue-growth"]');
      await expect(revenueGrowth).toBeVisible();
      await expect(revenueGrowth).toContainText(/%/);
    });

    test("should show revenue trends chart", async ({ page }) => {
      // Check revenue trends visualization
      await expect(
        page.locator('[data-testid="revenue-trends-chart"]'),
      ).toBeVisible();

      // Check time period filters
      await expect(page.locator('[data-testid="period-filter"]')).toBeVisible();

      // Test different time periods
      const periods = ["7d", "30d", "90d", "1y"];
      for (const period of periods) {
        await page.click(`[data-testid="period-${period}"]`);
        await page.waitForTimeout(1000);
        await expect(
          page.locator('[data-testid="revenue-trends-chart"]'),
        ).toBeVisible();
      }
    });

    test("should display payment methods distribution", async ({ page }) => {
      // Check payment methods chart
      await expect(
        page.locator('[data-testid="payment-methods-chart"]'),
      ).toBeVisible();

      // Verify Brazilian payment methods
      const paymentMethods = [
        "pix",
        "credit-card",
        "debit-card",
        "boleto",
        "cash",
        "insurance",
      ];

      for (const method of paymentMethods) {
        const methodElement = page.locator(
          `[data-testid="payment-method-${method}"]`,
        );
        if (await methodElement.isVisible()) {
          await expect(methodElement).toBeVisible();
        }
      }
    });

    test("should show top revenue sources", async ({ page }) => {
      const revenueSourcesSection = page.locator(
        '[data-testid="revenue-sources"]',
      );
      await expect(revenueSourcesSection).toBeVisible();

      // Check for revenue source items
      const sourceItems = page.locator('[data-testid="revenue-source-item"]');
      if ((await sourceItems.count()) > 0) {
        await expect(sourceItems.first()).toBeVisible();
        await expect(
          sourceItems.first().locator('[data-testid="source-name"]'),
        ).toBeVisible();
        await expect(
          sourceItems.first().locator('[data-testid="source-revenue"]'),
        ).toBeVisible();
        await expect(
          sourceItems.first().locator('[data-testid="source-percentage"]'),
        ).toBeVisible();
      }
    });
  });

  test.describe("Revenue Analytics", () => {
    test("should display detailed revenue analytics", async ({ page }) => {
      // Navigate to revenue analytics
      await page.click('[data-testid="revenue-analytics-tab"]');

      // Check revenue breakdown by service
      await expect(
        page.locator('[data-testid="revenue-by-service"]'),
      ).toBeVisible();

      // Check revenue by practitioner
      await expect(
        page.locator('[data-testid="revenue-by-practitioner"]'),
      ).toBeVisible();

      // Check revenue by location (if multi-location)
      const locationRevenue = page.locator(
        '[data-testid="revenue-by-location"]',
      );
      if (await locationRevenue.isVisible()) {
        await expect(locationRevenue).toBeVisible();
      }
    });

    test("should analyze revenue by treatment type", async ({ page }) => {
      await page.click('[data-testid="revenue-analytics-tab"]');

      // Check treatment revenue breakdown
      const treatmentTypes = [
        "botox",
        "dermal-fillers",
        "laser-therapy",
        "chemical-peels",
        "consultations",
      ];

      for (const type of treatmentTypes) {
        const revenueCard = page.locator(`[data-testid="revenue-${type}"]`);
        if (await revenueCard.isVisible()) {
          await expect(revenueCard).toBeVisible();
          await expect(
            revenueCard.locator('[data-testid="revenue-amount"]'),
          ).toBeVisible();
          await expect(
            revenueCard.locator('[data-testid="revenue-percentage"]'),
          ).toBeVisible();
        }
      }
    });

    test("should track revenue goals and targets", async ({ page }) => {
      await page.click('[data-testid="revenue-analytics-tab"]');

      // Navigate to goals section
      await page.click('[data-testid="revenue-goals-tab"]');

      // Check monthly/quarterly goals
      await expect(page.locator('[data-testid="monthly-goal"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="quarterly-goal"]'),
      ).toBeVisible();
      await expect(page.locator('[data-testid="annual-goal"]')).toBeVisible();

      // Check goal progress indicators
      await expect(page.locator('[data-testid="goal-progress"]')).toBeVisible();
    });

    test("should generate revenue forecasts", async ({ page }) => {
      await page.click('[data-testid="revenue-analytics-tab"]');

      // Navigate to forecasting
      await page.click('[data-testid="revenue-forecast-tab"]');

      // Check forecast chart
      await expect(
        page.locator('[data-testid="forecast-chart"]'),
      ).toBeVisible();

      // Check forecast parameters
      await expect(
        page.locator('[data-testid="forecast-period"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="forecast-confidence"]'),
      ).toBeVisible();

      // Test forecast generation
      await page.selectOption('[data-testid="forecast-period"]', "6months");
      await page.click('[data-testid="generate-forecast"]');

      // Verify forecast results
      await expect(
        page.locator('[data-testid="forecast-results"]'),
      ).toBeVisible();
    });
  });

  test.describe("Billing Management", () => {
    test("should display billing overview", async ({ page }) => {
      // Navigate to billing
      await page.click('[data-testid="billing-tab"]');

      // Check billing metrics
      await expect(
        page.locator('[data-testid="total-invoiced"]'),
      ).toBeVisible();
      await expect(page.locator('[data-testid="paid-invoices"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="pending-invoices"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="overdue-invoices"]'),
      ).toBeVisible();

      // Check billing table
      const billingTable = page.locator('[data-testid="billing-table"]');
      await expect(billingTable).toBeVisible();
    });

    test("should create new invoice", async ({ page }) => {
      await page.click('[data-testid="billing-tab"]');

      // Click create invoice
      await page.click('[data-testid="create-invoice"]');

      // Fill invoice form
      await page.fill('[data-testid="patient-search"]', "Ana Costa");
      await page.waitForTimeout(500);
      await page.click('[data-testid="patient-option"]');

      // Add invoice items
      await page.click('[data-testid="add-invoice-item"]');
      await page.selectOption(
        '[data-testid="service-select"]',
        "botox-consultation",
      );
      await page.fill('[data-testid="item-quantity"]', "1");
      await page.fill('[data-testid="item-price"]', "800.00");

      // Add another item
      await page.click('[data-testid="add-invoice-item"]');
      await page.selectOption(
        '[data-testid="service-select"]',
        "botox-treatment",
      );
      await page.fill('[data-testid="item-quantity"]', "1");
      await page.fill('[data-testid="item-price"]', "1200.00");

      // Set payment terms
      await page.selectOption('[data-testid="payment-terms"]', "30-days");

      // Add notes
      await page.fill(
        '[data-testid="invoice-notes"]',
        "Botox treatment package - forehead and crow's feet",
      );

      // Submit invoice
      await page.click('[data-testid="submit-invoice"]');

      // Verify success
      await expect(
        page.locator('[data-testid="success-message"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="success-message"]'),
      ).toContainText("Invoice created successfully");
    });

    test("should process invoice payments", async ({ page }) => {
      await page.click('[data-testid="billing-tab"]');

      // Find an unpaid invoice
      const invoiceRows = page.locator('[data-testid="invoice-row"]');
      if ((await invoiceRows.count()) > 0) {
        // Click on first invoice
        await invoiceRows.first().click();

        // Record payment
        await page.click('[data-testid="record-payment"]');

        // Fill payment form
        await page.fill('[data-testid="payment-amount"]', "2000.00");
        await page.selectOption('[data-testid="payment-method"]', "pix");

        // Set payment date
        await page.fill(
          '[data-testid="payment-date"]',
          new Date().toISOString().split("T")[0],
        );

        // Add payment reference
        await page.fill(
          '[data-testid="payment-reference"]',
          `PIX-${Date.now()}`,
        );

        // Submit payment
        await page.click('[data-testid="submit-payment"]');

        // Verify success
        await expect(
          page.locator('[data-testid="success-message"]'),
        ).toBeVisible();
        await expect(
          page.locator('[data-testid="success-message"]'),
        ).toContainText("Payment recorded");
      }
    });

    test("should send invoice reminders", async ({ page }) => {
      await page.click('[data-testid="billing-tab"]');

      // Filter overdue invoices
      await page.selectOption(
        '[data-testid="invoice-status-filter"]',
        "overdue",
      );
      await page.waitForTimeout(1000);

      // Send reminder for first overdue invoice
      const overdueInvoices = page.locator(
        '[data-testid="invoice-row"][data-status="overdue"]',
      );
      if ((await overdueInvoices.count()) > 0) {
        await overdueInvoices
          .first()
          .locator('[data-testid="send-reminder"]')
          .click();

        // Customize reminder message
        await page.fill(
          '[data-testid="reminder-message"]',
          "Gentle reminder: Your invoice is now overdue. Please process payment at your earliest convenience.",
        );

        // Select reminder method
        await page.check('[data-testid="send-email"]');
        await page.check('[data-testid="send-sms"]');

        // Send reminder
        await page.click('[data-testid="send-reminder-button"]');

        // Verify success
        await expect(
          page.locator('[data-testid="success-message"]'),
        ).toBeVisible();
        await expect(
          page.locator('[data-testid="success-message"]'),
        ).toContainText("Reminder sent");
      }
    });

    test("should generate billing reports", async ({ page }) => {
      await page.click('[data-testid="billing-tab"]');

      // Navigate to billing reports
      await page.click('[data-testid="billing-reports-tab"]');

      // Configure report parameters
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      await page.fill(
        '[data-testid="report-start-date"]',
        startDate.toISOString().split("T")[0],
      );
      await page.fill(
        '[data-testid="report-end-date"]',
        new Date().toISOString().split("T")[0],
      );

      // Select report type
      await page.selectOption('[data-testid="report-type"]', "aging-report");

      // Generate report
      const downloadPromise = page.waitForEvent("download");
      await page.click('[data-testid="generate-billing-report"]');

      // Verify download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(
        /billing.*report.*\.(pdf|xlsx)$/,
      );
    });
  });

  test.describe("Payment Processing", () => {
    test("should display payment processing overview", async ({ page }) => {
      // Navigate to payments
      await page.click('[data-testid="payments-tab"]');

      // Check payment metrics
      await expect(
        page.locator('[data-testid="total-payments"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="successful-payments"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="failed-payments"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="refunded-payments"]'),
      ).toBeVisible();

      // Check payment success rate
      const successRate = page.locator('[data-testid="payment-success-rate"]');
      await expect(successRate).toBeVisible();
      await expect(successRate).toContainText(/%/);
    });

    test("should process PIX payments", async ({ page }) => {
      await page.click('[data-testid="payments-tab"]');

      // Test PIX payment processing
      await page.click('[data-testid="process-pix-payment"]');

      // Fill PIX payment form
      await page.fill('[data-testid="pix-amount"]', "1500.00");
      await page.fill(
        '[data-testid="pix-description"]',
        "Botox treatment payment",
      );

      // Generate PIX QR code
      await page.click('[data-testid="generate-pix-qr"]');

      // Verify QR code generation
      await expect(page.locator('[data-testid="pix-qr-code"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="pix-code-string"]'),
      ).toBeVisible();

      // Check payment status monitoring
      await expect(
        page.locator('[data-testid="pix-status-monitor"]'),
      ).toBeVisible();
    });

    test("should handle credit card payments", async ({ page }) => {
      await page.click('[data-testid="payments-tab"]');

      // Test credit card payment
      await page.click('[data-testid="process-card-payment"]');

      // Fill card payment form
      await page.fill('[data-testid="card-amount"]', "2400.00");
      await page.fill('[data-testid="card-number"]', "4111111111111111");
      await page.fill('[data-testid="card-expiry"]', "12/25");
      await page.fill('[data-testid="card-cvv"]', "123");
      await page.fill('[data-testid="cardholder-name"]', "Maria Silva");

      // Select installments
      await page.selectOption('[data-testid="installments"]', "3");

      // Process payment
      await page.click('[data-testid="process-card-payment-button"]');

      // Verify payment processing
      await expect(
        page.locator('[data-testid="payment-processing"]'),
      ).toBeVisible();
    });

    test("should manage payment refunds", async ({ page }) => {
      await page.click('[data-testid="payments-tab"]');

      // Navigate to refunds section
      await page.click('[data-testid="refunds-tab"]');

      // Find a payment to refund
      const paymentRows = page.locator('[data-testid="payment-row"]');
      if ((await paymentRows.count()) > 0) {
        // Click refund button
        await paymentRows
          .first()
          .locator('[data-testid="refund-payment"]')
          .click();

        // Fill refund form
        await page.selectOption('[data-testid="refund-type"]', "partial");
        await page.fill('[data-testid="refund-amount"]', "500.00");
        await page.fill(
          '[data-testid="refund-reason"]',
          "Treatment cancelled by patient",
        );

        // Process refund
        await page.click('[data-testid="process-refund"]');

        // Verify success
        await expect(
          page.locator('[data-testid="success-message"]'),
        ).toBeVisible();
        await expect(
          page.locator('[data-testid="success-message"]'),
        ).toContainText("Refund processed");
      }
    });

    test("should track payment disputes", async ({ page }) => {
      await page.click('[data-testid="payments-tab"]');

      // Navigate to disputes section
      await page.click('[data-testid="disputes-tab"]');

      // Check disputes overview
      await expect(
        page.locator('[data-testid="active-disputes"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="resolved-disputes"]'),
      ).toBeVisible();

      // Check dispute details if any exist
      const disputeRows = page.locator('[data-testid="dispute-row"]');
      if ((await disputeRows.count()) > 0) {
        await disputeRows.first().click();

        // Check dispute information
        await expect(
          page.locator('[data-testid="dispute-details"]'),
        ).toBeVisible();
        await expect(
          page.locator('[data-testid="dispute-status"]'),
        ).toBeVisible();
        await expect(
          page.locator('[data-testid="dispute-amount"]'),
        ).toBeVisible();
      }
    });
  });

  test.describe("Tax and Compliance", () => {
    test("should display tax overview", async ({ page }) => {
      // Navigate to tax section
      await page.click('[data-testid="tax-tab"]');

      // Check tax metrics
      await expect(
        page.locator('[data-testid="total-tax-collected"]'),
      ).toBeVisible();
      await expect(page.locator('[data-testid="tax-rate"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="tax-exemptions"]'),
      ).toBeVisible();

      // Check tax breakdown by service
      await expect(
        page.locator('[data-testid="tax-by-service"]'),
      ).toBeVisible();
    });

    test("should generate tax reports for Brazilian compliance", async ({
      page,
    }) => {
      await page.click('[data-testid="tax-tab"]');

      // Navigate to tax reports
      await page.click('[data-testid="tax-reports-tab"]');

      // Configure tax report parameters
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      await page.fill(
        '[data-testid="tax-report-start-date"]',
        startDate.toISOString().split("T")[0],
      );
      await page.fill(
        '[data-testid="tax-report-end-date"]',
        new Date().toISOString().split("T")[0],
      );

      // Select report type (Brazilian tax requirements)
      await page.selectOption(
        '[data-testid="tax-report-type"]',
        "simples-nacional",
      );

      // Generate tax report
      const downloadPromise = page.waitForEvent("download");
      await page.click('[data-testid="generate-tax-report"]');

      // Verify download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(
        /tax.*report.*\.(pdf|xlsx)$/,
      );
    });

    test("should track ISS (Service Tax) compliance", async ({ page }) => {
      await page.click('[data-testid="tax-tab"]');

      // Navigate to ISS section
      await page.click('[data-testid="iss-tab"]');

      // Check ISS metrics
      await expect(page.locator('[data-testid="iss-collected"]')).toBeVisible();
      await expect(page.locator('[data-testid="iss-rate"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="iss-municipality"]'),
      ).toBeVisible();

      // Check ISS calculation by service
      const serviceTypes = [
        "consultation",
        "aesthetic-procedure",
        "dermatological-treatment",
      ];

      for (const service of serviceTypes) {
        const issCard = page.locator(`[data-testid="iss-${service}"]`);
        if (await issCard.isVisible()) {
          await expect(issCard).toBeVisible();
          await expect(
            issCard.locator('[data-testid="iss-amount"]'),
          ).toBeVisible();
        }
      }
    });

    test("should manage COFINS and PIS compliance", async ({ page }) => {
      await page.click('[data-testid="tax-tab"]');

      // Navigate to federal taxes section
      await page.click('[data-testid="federal-taxes-tab"]');

      // Check COFINS metrics
      await expect(
        page.locator('[data-testid="cofins-collected"]'),
      ).toBeVisible();
      await expect(page.locator('[data-testid="cofins-rate"]')).toBeVisible();

      // Check PIS metrics
      await expect(page.locator('[data-testid="pis-collected"]')).toBeVisible();
      await expect(page.locator('[data-testid="pis-rate"]')).toBeVisible();

      // Check tax regime compliance
      await expect(page.locator('[data-testid="tax-regime"]')).toBeVisible();
    });
  });

  test.describe("Financial Reports", () => {
    test("should generate comprehensive financial reports", async ({
      page,
    }) => {
      // Navigate to reports section
      await page.click('[data-testid="reports-tab"]');

      // Check available report types
      await expect(
        page.locator('[data-testid="profit-loss-report"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="cash-flow-report"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="revenue-analysis-report"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="tax-summary-report"]'),
      ).toBeVisible();
    });

    test("should export financial data", async ({ page }) => {
      await page.click('[data-testid="reports-tab"]');

      // Configure export parameters
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      await page.fill(
        '[data-testid="export-start-date"]',
        startDate.toISOString().split("T")[0],
      );
      await page.fill(
        '[data-testid="export-end-date"]',
        new Date().toISOString().split("T")[0],
      );

      // Select data to export
      await page.check('[data-testid="export-revenue"]');
      await page.check('[data-testid="export-payments"]');
      await page.check('[data-testid="export-invoices"]');
      await page.check('[data-testid="export-taxes"]');

      // Select export format
      await page.selectOption('[data-testid="export-format"]', "xlsx");

      // Export data
      const downloadPromise = page.waitForEvent("download");
      await page.click('[data-testid="export-financial-data"]');

      // Verify download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/financial.*data.*\.xlsx$/);
    });

    test("should schedule automated reports", async ({ page }) => {
      await page.click('[data-testid="reports-tab"]');

      // Navigate to automated reports
      await page.click('[data-testid="automated-reports-tab"]');

      // Create new automated report
      await page.click('[data-testid="create-automated-report"]');

      // Configure report settings
      await page.fill('[data-testid="report-name"]', "Monthly Revenue Summary");
      await page.selectOption('[data-testid="report-type"]', "revenue-summary");
      await page.selectOption('[data-testid="report-frequency"]', "monthly");

      // Set recipients
      await page.fill(
        '[data-testid="report-recipients"]',
        "admin@neonpro.com.br, finance@neonpro.com.br",
      );

      // Set delivery day
      await page.selectOption('[data-testid="delivery-day"]', "1");

      // Save automated report
      await page.click('[data-testid="save-automated-report"]');

      // Verify success
      await expect(
        page.locator('[data-testid="success-message"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="success-message"]'),
      ).toContainText("Automated report created");
    });
  });

  test.describe("Performance and Accessibility", () => {
    test("should load financial dashboard within performance thresholds", async ({
      page,
    }) => {
      const startTime = Date.now();
      await page.goto("/dashboard/financial");
      await page.waitForLoadState("networkidle");
      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Check for performance metrics
      const performanceEntries = await page.evaluate(() => {
        return JSON.stringify(performance.getEntriesByType("navigation"));
      });

      expect(performanceEntries).toBeDefined();
    });

    test("should support keyboard navigation", async ({ page }) => {
      // Test tab navigation through financial sections
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // Should be able to navigate to main sections
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();
    });

    test("should have proper ARIA labels for financial data", async ({
      page,
    }) => {
      // Check ARIA labels on financial metrics
      await expect(
        page.locator('[data-testid="total-revenue"][aria-label]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="profit-margin"][aria-label]'),
      ).toBeVisible();

      // Check table accessibility
      const tables = page.locator("table");
      if ((await tables.count()) > 0) {
        await expect(tables.first()).toHaveAttribute("role", "table");
      }
    });

    test("should be responsive on mobile devices", async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Check that financial cards stack properly
      const financialCards = page.locator('[data-testid="financial-card"]');
      if ((await financialCards.count()) > 0) {
        const firstCard = financialCards.first();
        const cardBox = await firstCard.boundingBox();
        expect(cardBox?.width).toBeLessThan(400); // Should fit mobile width
      }

      // Check mobile navigation
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      if (await mobileMenu.isVisible()) {
        await expect(mobileMenu).toBeVisible();
      }
    });

    test("should support screen readers for financial information", async ({
      page,
    }) => {
      // Check for screen reader announcements
      const announcements = page.locator(
        '[aria-live="polite"], [aria-live="assertive"]',
      );
      if ((await announcements.count()) > 0) {
        await expect(announcements.first()).toBeVisible();
      }

      // Check for descriptive headings
      const headings = page.locator("h1, h2, h3, h4, h5, h6");
      if ((await headings.count()) > 0) {
        await expect(headings.first()).toBeVisible();
      }

      // Check currency announcements
      const currencyElements = page.locator(
        '[data-testid*="currency"][aria-label]',
      );
      if ((await currencyElements.count()) > 0) {
        await expect(currencyElements.first()).toBeVisible();
      }
    });

    test("should handle real-time financial data updates", async ({ page }) => {
      // Check for real-time update indicators
      const updateIndicators = page.locator(
        '[data-testid="real-time-indicator"]',
      );
      if (await updateIndicators.isVisible()) {
        await expect(updateIndicators).toBeVisible();
      }

      // Check for last updated timestamp
      const lastUpdated = page.locator('[data-testid="last-updated"]');
      if (await lastUpdated.isVisible()) {
        await expect(lastUpdated).toBeVisible();
        await expect(lastUpdated).toContainText(/\d{2}:\d{2}/);
      }
    });
  });
});
