import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('main page loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads without errors
    await expect(page).toHaveTitle(/NEON PRO/i);
    
    // Check for basic page structure
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
  
  test('app structure is present', async ({ page }) => {
    await page.goto('/');
    
    // Wait for any loading states to complete
    await page.waitForLoadState('networkidle');
    
    // Check for main content area
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Check for root element
    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });
});