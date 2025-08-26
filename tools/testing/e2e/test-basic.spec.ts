import { expect, test } from '@playwright/test';

/**
 * Basic Playwright Test for NeonPro Healthcare System
 * =================================================
 *
 * Simple test to verify Playwright is working correctly
 * without complex dependencies or global setup requirements.
 */

test.describe('NeonPro Healthcare - Basic Tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    // Navigate to root page
    await page.goto('/');

    // Verify page loads
    await expect(page).toHaveTitle(/NeonPro/i);

    // Check for basic elements
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have working login page', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Check for login form elements
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('/non-existent-page');

    // Should handle gracefully (either 404 page or redirect)
    const isNotFound = await page
      .locator('text=404')
      .isVisible()
      .catch(() => false);
    const isRedirected = page.url().includes('login') || page.url().includes('dashboard');

    expect(isNotFound || isRedirected).toBe(true);
  });
});
