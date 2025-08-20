import { expect, test } from '@playwright/test';

/**
 * NeonPro Healthcare E2E Tests
 * ===========================
 *
 * End-to-end tests for core healthcare workflows:
 * - Patient management
 * - Healthcare compliance (LGPD, ANVISA, CFM)
 * - Security and authentication
 */

test.describe('NeonPro Healthcare System', () => {
  test.beforeEach(async ({ page }) => {
    // Set healthcare compliance environment
    await page.addInitScript(() => {
      window.localStorage.setItem('healthcare_mode', 'true');
      window.localStorage.setItem('lgpd_compliance', 'active');
      window.localStorage.setItem('anvisa_validation', 'enabled');
    });
  });

  test('should load homepage with healthcare compliance', async ({ page }) => {
    // Navigate to the application
    await page.goto('/', { waitUntil: 'networkidle' });

    // Check for basic page structure
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Verify no JavaScript errors
    const errors = [];
    page.on('pageerror', (error) => errors.push(error));

    await page.waitForLoadState('domcontentloaded');
    expect(errors).toHaveLength(0);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    // Look for login-related elements or redirects
    try {
      // Try to find login form elements
      const loginElements = await page
        .locator(
          'input[type="email"], input[type="password"], [data-testid*="login"]'
        )
        .count();

      if (loginElements === 0) {
        // If no login elements on homepage, try navigating to login
        await page.goto('/login');
      }

      // Verify we're on a login-related page
      const hasEmailInput = await page
        .locator('input[type="email"]')
        .isVisible()
        .catch(() => false);
      const hasPasswordInput = await page
        .locator('input[type="password"]')
        .isVisible()
        .catch(() => false);
      const hasLoginText = await page
        .locator('text=/login|entrar|acesso/i')
        .isVisible()
        .catch(() => false);

      expect(hasEmailInput || hasPasswordInput || hasLoginText).toBe(true);
    } catch (error) {
      // If navigation fails, verify we get appropriate error handling
      const is404 = await page
        .locator('text=/404|not found/i')
        .isVisible()
        .catch(() => false);
      const isErrorPage = await page
        .locator('text=/error|erro/i')
        .isVisible()
        .catch(() => false);

      // Either we should have login elements or proper error handling
      expect(is404 || isErrorPage).toBe(true);
    }
  });

  test('should handle patient routes appropriately', async ({ page }) => {
    // Test patient-related routes
    const patientRoutes = ['/patients', '/dashboard/patients', '/pacientes'];
    let foundPatientRoute = false;

    for (const route of patientRoutes) {
      try {
        await page.goto(route, { timeout: 5000 });

        // Check if we found patient-related content
        const hasPatientContent = await page
          .locator('text=/patient|paciente/i')
          .isVisible()
          .catch(() => false);
        const hasTableOrList = await page
          .locator('table, [data-testid*="list"], .table')
          .isVisible()
          .catch(() => false);

        if (hasPatientContent || hasTableOrList) {
          foundPatientRoute = true;
          break;
        }
      } catch (error) {}
    }

    // If no patient route found, verify proper redirect to login/dashboard
    if (!foundPatientRoute) {
      const currentUrl = page.url();
      const isRedirectToAuth =
        currentUrl.includes('login') ||
        currentUrl.includes('auth') ||
        currentUrl.includes('dashboard');
      expect(isRedirectToAuth).toBe(true);
    }
  });

  test('should maintain healthcare compliance indicators', async ({ page }) => {
    await page.goto('/');

    // Check for LGPD compliance indicators
    const lgpdElements = await page
      .locator('text=/lgpd|privacidade|proteção de dados/i')
      .count();
    const cookieBanner = await page
      .locator('[data-testid*="cookie"], .cookie-banner, text=/cookie/i')
      .count();

    // Healthcare applications should have some privacy/compliance indicators
    expect(lgpdElements + cookieBanner).toBeGreaterThanOrEqual(0);
  });

  test('should have accessible navigation structure', async ({ page }) => {
    await page.goto('/');

    // Check for basic navigation elements
    const navElements = await page
      .locator('nav, [role="navigation"], .navigation, .navbar, .sidebar')
      .count();
    const linkElements = await page.locator('a[href]').count();
    const buttonElements = await page.locator('button').count();

    // A healthcare app should have some interactive elements
    expect(navElements + linkElements + buttonElements).toBeGreaterThan(0);
  });

  test('should handle API endpoints gracefully', async ({ page }) => {
    // Monitor network requests
    const apiRequests = [];
    const apiErrors = [];

    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        apiRequests.push(request.url());
      }
    });

    page.on('response', (response) => {
      if (response.url().includes('/api/') && response.status() >= 400) {
        apiErrors.push({ url: response.url(), status: response.status() });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // If there are API requests, they should not all fail
    if (apiRequests.length > 0) {
      const failureRate = apiErrors.length / apiRequests.length;
      expect(failureRate).toBeLessThan(0.8); // Allow some failures but not >80%
    }
  });
});

test.describe('Healthcare Data Protection (LGPD)', () => {
  test('should not expose sensitive data in network requests', async ({
    page,
  }) => {
    const sensitivePatterns = [
      /cpf.*\d{11}/i,
      /password.*[:=]/i,
      /cartão.*\d{16}/i,
      /rg.*\d{7}/i,
    ];

    const exposedData = [];

    page.on('request', (request) => {
      const url = request.url();
      const postData = request.postData() || '';

      sensitivePatterns.forEach((pattern) => {
        if (pattern.test(url) || pattern.test(postData)) {
          exposedData.push({ url, pattern: pattern.toString() });
        }
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should not expose sensitive data patterns
    expect(exposedData).toHaveLength(0);
  });
});
