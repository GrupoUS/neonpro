/**
 * MOBILE TEST: Patient dashboard responsiveness (T027)
 *
 * Tests mobile responsiveness for patient dashboard:
 * - Touch interactions and gestures
 * - Mobile layout adaptation
 * - Performance on mobile devices
 * - Accessibility on small screens
 * - Brazilian mobile usage patterns
 * - Offline functionality
 */

import { devices, expect, test } from "@playwright/test";

// Brazilian mobile device configurations
const brazilianMobileDevices = [
  {
    name: "Samsung Galaxy A14 (Popular in Brazil)",
    viewport: { width: 412, height: 915 },
    userAgent:
      "Mozilla/5.0 (Linux; Android 13; SM-A145M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    deviceScaleFactor: 2.75,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: "iPhone 13 (Popular premium device)",
    ...devices["iPhone 13"],
  },
  {
    name: "Samsung Galaxy S21 (Android flagship)",
    ...devices["Galaxy S21"],
  },
  {
    name: "Budget Android Device",
    viewport: { width: 360, height: 640 },
    userAgent:
      "Mozilla/5.0 (Linux; Android 11; SM-A125M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
];

// Test helper to simulate Brazilian healthcare professional login
async function loginAsBrazilianHealthcareProfessional(page: any) {
  await page.goto("/login");
  await page.fill('[data-testid="email-input"]', "dr.silva@clinica.com.br");
  await page.fill('[data-testid="password-input"]', "senha123");
  await page.fill('[data-testid="crm-input"]', "CRM-SP-123456");
  await page.click('[data-testid="login-button"]');
  await page.waitForURL("/dashboard");
}

brazilianMobileDevices.forEach((device) => {
  test.describe(`Patient Dashboard Mobile - ${device.name}`, () => {
    test.use(device);

    test.beforeEach(async ({ page }) => {
      await loginAsBrazilianHealthcareProfessional(page);
    });

    test("should display patient dashboard with mobile-optimized layout", async ({
      page,
    }) => {
      // Check if dashboard loads properly on mobile
      await expect(
        page.locator('[data-testid="patient-dashboard"]'),
      ).toBeVisible();

      // Verify mobile-specific navigation
      await expect(
        page.locator('[data-testid="mobile-menu-toggle"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="mobile-navigation"]'),
      ).toBeVisible();

      // Check that desktop navigation is hidden
      await expect(
        page.locator('[data-testid="desktop-sidebar"]'),
      ).toBeHidden();

      // Verify responsive patient list
      const patientList = page.locator('[data-testid="patient-list"]');
      await expect(patientList).toBeVisible();

      // Check that patient cards adapt to mobile layout
      const patientCards = page.locator('[data-testid="patient-card"]');
      const firstCard = patientCards.first();

      const boundingBox = await firstCard.boundingBox();
      const viewportSize = page.viewportSize();

      // Patient card should take most of the screen width on mobile
      expect(boundingBox!.width).toBeGreaterThan(viewportSize!.width * 0.85);
    });

    test("should support touch interactions for patient management", async ({
      page,
    }) => {
      // Test touch tap on patient card
      const firstPatientCard = page
        .locator('[data-testid="patient-card"]')
        .first();
      await firstPatientCard.tap();

      // Should navigate to patient details
      await expect(
        page.locator('[data-testid="patient-details"]'),
      ).toBeVisible();

      // Test swipe gestures for navigation (if implemented)
      const patientDetails = page.locator('[data-testid="patient-details"]');
      const boundingBox = await patientDetails.boundingBox();

      if (boundingBox) {
        // Swipe left to potentially go to next patient or close
        await page.mouse.move(
          boundingBox.x + boundingBox.width - 10,
          boundingBox.y + boundingBox.height / 2,
        );
        await page.mouse.down();
        await page.mouse.move(
          boundingBox.x + 10,
          boundingBox.y + boundingBox.height / 2,
        );
        await page.mouse.up();
      }

      // Test pull-to-refresh functionality
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });

      // Simulate pull-to-refresh gesture
      await page.touchscreen.tap(100, 100);
      await page.mouse.move(100, 100);
      await page.mouse.down();
      await page.mouse.move(100, 200);
      await page.waitForTimeout(100);
      await page.mouse.up();
    });

    test("should display patient search with mobile-optimized input", async ({
      page,
    }) => {
      // Verify search input is properly sized for mobile
      const searchInput = page.locator('[data-testid="patient-search-input"]');
      await expect(searchInput).toBeVisible();

      // Test touch interaction with search
      await searchInput.tap();
      await expect(searchInput).toBeFocused();

      // Verify virtual keyboard doesn't break layout
      await searchInput.fill("João Silva");

      // Check that search results are mobile-friendly
      const searchResults = page.locator('[data-testid="search-results"]');
      await expect(searchResults).toBeVisible();

      // Verify CPF input with Brazilian format
      await searchInput.clear();
      await searchInput.fill("123.456.789-00");

      // Check auto-formatting for Brazilian CPF
      const inputValue = await searchInput.inputValue();
      expect(inputValue).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
    });

    test("should handle Brazilian mobile data entry patterns", async ({
      page,
    }) => {
      // Navigate to patient registration
      await page.click('[data-testid="add-patient-button"]');
      await expect(
        page.locator('[data-testid="patient-registration-form"]'),
      ).toBeVisible();

      // Test Brazilian mobile number input
      const phoneInput = page.locator('[data-testid="phone-input"]');
      await phoneInput.tap();
      await phoneInput.fill("11999887766");

      // Should auto-format to Brazilian mobile format
      const phoneValue = await phoneInput.inputValue();
      expect(phoneValue).toMatch(/^\(\d{2}\) \d{5}-\d{4}$/);

      // Test CEP (postal code) input
      const cepInput = page.locator('[data-testid="cep-input"]');
      await cepInput.tap();
      await cepInput.fill("01234567");

      // Should auto-format CEP
      const cepValue = await cepInput.inputValue();
      expect(cepValue).toMatch(/^\d{5}-\d{3}$/);

      // Test form validation on mobile
      const submitButton = page.locator('[data-testid="submit-patient-form"]');
      await submitButton.tap();

      // Should show validation errors
      await expect(
        page.locator('[data-testid="validation-error"]'),
      ).toBeVisible();
    });

    test("should provide accessible mobile navigation", async ({ page }) => {
      // Test mobile menu accessibility
      const menuToggle = page.locator('[data-testid="mobile-menu-toggle"]');
      await expect(menuToggle).toBeVisible();
      await expect(menuToggle).toHaveAttribute("aria-label");

      // Open mobile menu
      await menuToggle.tap();
      const mobileMenu = page.locator('[data-testid="mobile-navigation-menu"]');
      await expect(mobileMenu).toBeVisible();

      // Test keyboard navigation on mobile menu
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");

      // Verify menu items are touchable and properly sized
      const menuItems = page.locator('[data-testid="mobile-menu-item"]');
      const menuItemCount = await menuItems.count();

      for (let i = 0; i < Math.min(menuItemCount, 3); i++) {
        const menuItem = menuItems.nth(i);
        const boundingBox = await menuItem.boundingBox();

        // Menu items should be at least 44px tall for touch targets (Apple HIG)
        expect(boundingBox!.height).toBeGreaterThanOrEqual(44);
      }
    });

    test("should optimize performance for mobile connections", async ({
      page,
    }) => {
      // Simulate slower mobile connection
      await page.route("**/*", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        await route.continue();
      });

      const startTime = Date.now();
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");
      const loadTime = Date.now() - startTime;

      // Should load within acceptable time for mobile (5 seconds)
      expect(loadTime).toBeLessThan(5000);

      // Test lazy loading of patient data
      const patientList = page.locator('[data-testid="patient-list"]');
      await expect(patientList).toBeVisible();

      // Scroll to trigger lazy loading
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      // Should load more patients
      await page.waitForTimeout(1000);
      const patientCards = page.locator('[data-testid="patient-card"]');
      const cardCount = await patientCards.count();
      expect(cardCount).toBeGreaterThan(5);
    });

    test("should handle offline scenarios gracefully", async ({ page }) => {
      // Go offline
      await page.context().setOffline(true);

      // Try to access patient data
      await page.reload();

      // Should show offline indicator
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).toBeVisible();

      // Should show cached patient data if available
      const cachedPatients = page.locator(
        '[data-testid="cached-patient-data"]',
      );
      if (await cachedPatients.isVisible()) {
        await expect(cachedPatients).toBeVisible();
      }

      // Should show offline message for new data requests
      await expect(
        page.locator('[data-testid="offline-message"]'),
      ).toBeVisible();

      // Go back online
      await page.context().setOffline(false);
      await page.reload();

      // Should sync data when back online
      await expect(
        page.locator('[data-testid="sync-indicator"]'),
      ).toBeVisible();
      await page.waitForTimeout(2000);
      await expect(page.locator('[data-testid="patient-list"]')).toBeVisible();
    });

    test("should support Brazilian healthcare workflow on mobile", async ({
      page,
    }) => {
      // Test quick patient lookup with CRM
      const quickSearch = page.locator('[data-testid="quick-crm-search"]');
      await quickSearch.tap();
      await quickSearch.fill("CRM-SP-123456");

      // Should show patients for this CRM
      await expect(page.locator('[data-testid="crm-patients"]')).toBeVisible();

      // Test emergency patient access
      const emergencyButton = page.locator('[data-testid="emergency-access"]');
      if (await emergencyButton.isVisible()) {
        await emergencyButton.tap();

        // Should provide emergency patient search
        await expect(
          page.locator('[data-testid="emergency-search"]'),
        ).toBeVisible();

        // Test emergency CPF lookup
        const emergencyCpfInput = page.locator(
          '[data-testid="emergency-cpf-input"]',
        );
        await emergencyCpfInput.fill("123.456.789-00");

        await page.click('[data-testid="emergency-search-button"]');
        await expect(
          page.locator('[data-testid="emergency-patient-info"]'),
        ).toBeVisible();
      }

      // Test mobile prescription writing
      await page.click('[data-testid="patient-card"]').first();
      await page.click('[data-testid="prescribe-medication"]');

      const prescriptionForm = page.locator(
        '[data-testid="mobile-prescription-form"]',
      );
      await expect(prescriptionForm).toBeVisible();

      // Should have mobile-optimized medication search
      const medicationSearch = page.locator(
        '[data-testid="medication-search-input"]',
      );
      await medicationSearch.tap();
      await medicationSearch.fill("Losartana");

      // Should show medication suggestions
      await expect(
        page.locator('[data-testid="medication-suggestions"]'),
      ).toBeVisible();
    });

    test("should handle mobile-specific error scenarios", async ({ page }) => {
      // Test network timeout handling
      await page.route("**/api/patients", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        await route.continue();
      });

      const loadingIndicator = page.locator(
        '[data-testid="loading-indicator"]',
      );
      await expect(loadingIndicator).toBeVisible();

      // Should show timeout error after reasonable wait
      await page.waitForTimeout(5000);
      await expect(page.locator('[data-testid="timeout-error"]')).toBeVisible();

      // Test retry functionality
      await page.click('[data-testid="retry-button"]');
      await expect(loadingIndicator).toBeVisible();

      // Test mobile-specific error messages
      await page.route("**/api/patients", (route) =>
        route.fulfill({ status: 500, body: "Server Error" }),
      );

      await page.reload();
      await expect(
        page.locator('[data-testid="mobile-error-message"]'),
      ).toBeVisible();

      // Error message should be mobile-friendly
      const errorMessage = page.locator('[data-testid="mobile-error-message"]');
      const errorText = await errorMessage.textContent();
      expect(errorText).toContain("Problema de conexão");
    });
  });
});

// Tablet-specific tests
test.describe("Patient Dashboard Tablet", () => {
  test.use({ ...devices["iPad Pro"] });

  test.beforeEach(async ({ page }) => {
    await loginAsBrazilianHealthcareProfessional(page);
  });

  test("should adapt layout for tablet screen size", async ({ page }) => {
    // Should show hybrid mobile/desktop layout
    await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible();

    // Should have larger touch targets than mobile
    const menuItems = page.locator('[data-testid="menu-item"]');
    const firstMenuItem = menuItems.first();
    const boundingBox = await firstMenuItem.boundingBox();

    // Tablet touch targets should be larger
    expect(boundingBox!.height).toBeGreaterThanOrEqual(48);

    // Should show more content than mobile
    const patientCards = page.locator('[data-testid="patient-card"]');
    const cardCount = await patientCards.count();
    expect(cardCount).toBeGreaterThan(3);

    // Should support both landscape and portrait
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(
      page.locator('[data-testid="landscape-layout"]'),
    ).toBeVisible();
  });

  test("should optimize for Brazilian healthcare tablet usage", async ({
    page,
  }) => {
    // Test split-screen patient view for tablets
    const patientList = page.locator('[data-testid="tablet-patient-list"]');
    const patientDetails = page.locator(
      '[data-testid="tablet-patient-details"]',
    );

    await page.click('[data-testid="patient-card"]').first();

    // Both list and details should be visible on tablet
    await expect(patientList).toBeVisible();
    await expect(patientDetails).toBeVisible();

    // Test tablet-optimized form inputs
    await page.click('[data-testid="edit-patient-tablet"]');
    const tabletForm = page.locator('[data-testid="tablet-patient-form"]');
    await expect(tabletForm).toBeVisible();

    // Form should use tablet-optimized layout
    const formFields = page.locator('[data-testid="form-field"]');
    const formFieldCount = await formFields.count();

    // Should show more fields per row on tablet
    for (let i = 0; i < Math.min(formFieldCount, 2); i++) {
      const field = formFields.nth(i);
      const fieldBox = await field.boundingBox();
      expect(fieldBox!.width).toBeLessThan(500); // Should not be full width
    }
  });
});
