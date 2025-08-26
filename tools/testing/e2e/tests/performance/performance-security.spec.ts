import { expect, test } from "@playwright/test";

test.describe("⚡ Performance & Security E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Performance: Page load times under 3 seconds", async ({ page }) => {
    const startTime = Date.now();

    // Test homepage load
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const homeLoadTime = Date.now() - startTime;
    expect(homeLoadTime).toBeLessThan(3000);

    // Test dashboard load
    const dashboardStart = Date.now();
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const dashboardLoadTime = Date.now() - dashboardStart;
    expect(dashboardLoadTime).toBeLessThan(3000);

    // Test patients page load
    const patientsStart = Date.now();
    await page.goto("/patients");
    await page.waitForLoadState("networkidle");
    const patientsLoadTime = Date.now() - patientsStart;
    expect(patientsLoadTime).toBeLessThan(3000);
  });

  test("Performance: API response times under 500ms", async ({ page }) => {
    // Setup response time monitoring
    const apiResponses: number[] = [];

    page.on("response", (response) => {
      if (response.url().includes("/api/")) {
        const timing = response.timing();
        if (timing) {
          apiResponses.push(timing.responseEnd - timing.requestStart);
        }
      }
    });

    // Navigate through app to trigger API calls
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    await page.goto("/patients");
    await page.waitForLoadState("networkidle");

    await page.goto("/appointments");
    await page.waitForLoadState("networkidle");

    // Verify API response times
    expect(apiResponses.length).toBeGreaterThan(0);
    const avgResponseTime =
      apiResponses.reduce((a, b) => a + b, 0) / apiResponses.length;
    expect(avgResponseTime).toBeLessThan(500);

    // Check for any slow APIs
    const slowAPIs = apiResponses.filter((time) => time > 1000);
    expect(slowAPIs.length).toBe(0);
  });

  test("Security: XSS protection", async ({ page }) => {
    // Attempt to inject malicious script
    const maliciousScript = '<script>alert("XSS")</script>';

    await page.goto("/patients/new");

    // Try to inject in patient name field
    await page.fill('[data-testid="patient-name"]', maliciousScript);
    await page.fill('[data-testid="patient-email"]', "test@example.com");
    await page.fill('[data-testid="patient-phone"]', "(11) 99999-9999");

    await page.click('[data-testid="submit-patient"]');

    // Verify script was not executed
    const alertDialogPromise = page
      .waitForEvent("dialog", { timeout: 1000 })
      .catch(() => {});
    const dialog = await alertDialogPromise;
    expect(dialog).toBeNull();

    // Verify script was sanitized
    await page.goto("/patients");
    const patientRow = page.locator('[data-testid="patient-row"]').first();
    await expect(patientRow).not.toContainText("<script>");
  });

  test("Security: SQL injection protection", async ({ page }) => {
    // Attempt SQL injection in search
    const sqlInjection = "'; DROP TABLE patients; --";

    await page.goto("/patients");
    await page.fill('[data-testid="patient-search"]', sqlInjection);
    await page.click('[data-testid="search-button"]');

    // Verify search doesn't break the app
    await expect(page.locator('[data-testid="patients-table"]')).toBeVisible();

    // Verify no error messages indicating SQL issues
    await expect(page.locator('[data-testid="sql-error"]')).not.toBeVisible();

    // Navigate to ensure app is still functional
    await page.goto("/dashboard");
    await expect(
      page.locator('[data-testid="dashboard-content"]'),
    ).toBeVisible();
  });

  test("Security: Authentication bypass attempts", async ({ page }) => {
    // Try to access protected routes without authentication
    const protectedRoutes = [
      "/dashboard",
      "/patients",
      "/appointments",
      "/professionals",
      "/reports",
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);

      // Should redirect to login
      await page.waitForURL(/.*\/login/);
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    }
  });

  test("Security: Session management", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('[data-testid="email"]', "admin@clinic.com");
    await page.fill('[data-testid="password"]', "AdminPass123");
    await page.click('[data-testid="login-button"]');

    // Verify access to protected route
    await page.goto("/dashboard");
    await expect(
      page.locator('[data-testid="dashboard-content"]'),
    ).toBeVisible();

    // Simulate session expiry by clearing storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Try to access protected route after session clear
    await page.goto("/patients");

    // Should redirect to login
    await page.waitForURL(/.*\/login/);
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test("Performance: Large dataset handling", async ({ page }) => {
    // Login as admin
    await page.goto("/login");
    await page.fill('[data-testid="email"]', "admin@clinic.com");
    await page.fill('[data-testid="password"]', "AdminPass123");
    await page.click('[data-testid="login-button"]');

    // Navigate to patients with large dataset
    await page.goto("/patients?limit=1000");

    const startTime = Date.now();
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - startTime;

    // Should load within reasonable time even with large dataset
    expect(loadTime).toBeLessThan(5000);

    // Test pagination performance
    await page.click('[data-testid="next-page"]');
    const paginationStart = Date.now();
    await page.waitForLoadState("networkidle");
    const paginationTime = Date.now() - paginationStart;

    expect(paginationTime).toBeLessThan(2000);

    // Test search performance
    const searchStart = Date.now();
    await page.fill('[data-testid="patient-search"]', "Silva");
    await page.waitForTimeout(500); // Debounce
    await page.waitForLoadState("networkidle");
    const searchTime = Date.now() - searchStart;

    expect(searchTime).toBeLessThan(3000);
  });

  test("Accessibility: Keyboard navigation", async ({ page }) => {
    await page.goto("/");

    // Test tab navigation through main elements
    await page.keyboard.press("Tab"); // Skip to main content
    await page.keyboard.press("Tab"); // Navigation menu
    await page.keyboard.press("Tab"); // First menu item

    // Verify focus is visible
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Test Enter key activation
    await page.keyboard.press("Enter");

    // Should navigate or activate element
    await page.waitForTimeout(1000);

    // Test Escape key functionality
    await page.keyboard.press("Escape");
  });

  test("Accessibility: Screen reader compatibility", async ({ page }) => {
    await page.goto("/patients");

    // Check for proper ARIA labels
    await expect(page.locator("[aria-label]")).toHaveCount({ min: 5 });

    // Check for semantic headings
    await expect(page.locator("h1, h2, h3, h4, h5, h6")).toHaveCount({
      min: 3,
    });

    // Check for alt text on images
    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute("alt");
    }

    // Check for form labels
    const inputs = page.locator("input, select, textarea");
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute("id");
      if (id) {
        await expect(page.locator(`label[for="${id}"]`)).toHaveCount({
          min: 0,
        });
      }
    }
  });

  test("Mobile Responsiveness: Touch interactions", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "This test is only for mobile");

    await page.goto("/patients");

    // Test touch scroll
    await page.touchscreen.tap(200, 300);
    await page.mouse.wheel(0, 500);

    // Test mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

    // Test swipe gestures on cards/lists
    const patientCard = page.locator('[data-testid="patient-card"]').first();
    const box = await patientCard.boundingBox();

    if (box) {
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      await page.touchscreen.tap(
        box.x + box.width - 10,
        box.y + box.height / 2,
      );
    }
  });

  test("Error Handling: Network failures", async ({ page }) => {
    // Simulate offline condition
    await page.context().setOffline(true);

    await page.goto("/patients");

    // Should show offline message
    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();

    // Restore connection
    await page.context().setOffline(false);

    // Should recover automatically
    await page.reload();
    await expect(page.locator('[data-testid="patients-table"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="offline-message"]'),
    ).not.toBeVisible();
  });
});
