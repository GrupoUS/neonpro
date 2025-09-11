import { test, expect } from '@playwright/test';

test('basic setup test', async ({ page }) => {
  // Simple test to verify Playwright is working
  await page.goto('https://example.com');
  await expect(page.locator('h1')).toContainText('Example Domain');
});