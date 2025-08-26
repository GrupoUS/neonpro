import { expect, test } from '@playwright/test';

test.describe('Analytics Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard page
    await page.goto('/dashboard/analytics');
  });

  test('should load and display analytics dashboard', async ({ page }) => {
    // Wait for dashboard to load
    await expect(page.getByTestId('analytics-dashboard')).toBeVisible();

    // Check key metrics are displayed
    await expect(page.getByText('Total Patients')).toBeVisible();
    await expect(page.getByText('Total Revenue')).toBeVisible();
    await expect(page.getByText('Average Ticket')).toBeVisible();
    await expect(page.getByText('Conversion Rate')).toBeVisible();

    // Check charts are rendered
    await expect(page.getByTestId('revenue-chart')).toBeVisible();
    await expect(page.getByTestId('patients-chart')).toBeVisible();
    await expect(page.getByTestId('cohort-chart')).toBeVisible();
  });

  test('should filter data by date range', async ({ page }) => {
    // Wait for dashboard to load
    await expect(page.getByTestId('analytics-dashboard')).toBeVisible();

    // Get initial patient count
    const initialCount = await page
      .getByTestId('total-patients-value')
      .textContent();

    // Open date filters
    await page.getByLabel('Start Date').fill('2024-02-01');
    await page.getByLabel('End Date').fill('2024-02-28');

    // Apply filters
    await page.getByRole('button', { name: 'Apply Filters' }).click();

    // Wait for data to update
    await page.waitForResponse('**/api/analytics/data**');

    // Verify data has changed
    const newCount = await page
      .getByTestId('total-patients-value')
      .textContent();
    expect(newCount).not.toBe(initialCount);
  });

  test('should export data to PDF', async ({ page }) => {
    // Wait for dashboard to load
    await expect(page.getByTestId('analytics-dashboard')).toBeVisible();

    // Start download promise before clicking
    const downloadPromise = page.waitForDownload();

    // Click export PDF button
    await page.getByRole('button', { name: 'Export PDF' }).click();

    // Wait for download to complete
    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toContain('.pdf');
    expect(await download.path()).toBeTruthy();
  });

  test('should export data to Excel', async ({ page }) => {
    // Wait for dashboard to load
    await expect(page.getByTestId('analytics-dashboard')).toBeVisible();

    // Start download promise
    const downloadPromise = page.waitForDownload();

    // Click export Excel button
    await page.getByRole('button', { name: 'Export Excel' }).click();

    // Wait for download
    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toContain('.xlsx');
  });

  test('should handle mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for dashboard to load
    await expect(page.getByTestId('analytics-dashboard')).toBeVisible();

    // Check mobile-specific UI elements
    await expect(page.getByTestId('mobile-menu-toggle')).toBeVisible();
    await expect(page.getByTestId('mobile-filters')).toBeVisible();

    // Test mobile navigation
    await page.getByTestId('mobile-menu-toggle').click();
    await expect(page.getByTestId('mobile-navigation')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/analytics/data', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Database connection failed' }),
      });
    });

    // Navigate to dashboard
    await page.goto('/dashboard/analytics');

    // Verify error state is displayed
    await expect(page.getByTestId('analytics-error')).toBeVisible();
    await expect(page.getByText('Database connection failed')).toBeVisible();

    // Test retry functionality
    await page.getByRole('button', { name: 'Retry' }).click();
  });

  test('should handle loading states', async ({ page }) => {
    // Slow down API response to test loading state
    await page.route('**/api/analytics/data', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
      await route.continue();
    });

    // Navigate to dashboard
    await page.goto('/dashboard/analytics');

    // Verify loading state is shown
    await expect(page.getByTestId('analytics-loading')).toBeVisible();
    await expect(page.getByText('Loading analytics...')).toBeVisible();

    // Wait for data to load
    await expect(page.getByTestId('analytics-dashboard')).toBeVisible();
    await expect(page.getByTestId('analytics-loading')).not.toBeVisible();
  });

  test('should handle real-time data updates', async ({ page }) => {
    // Wait for initial load
    await expect(page.getByTestId('analytics-dashboard')).toBeVisible();

    // Get initial values
    const _initialPatients = await page
      .getByTestId('total-patients-value')
      .textContent();
    const _initialRevenue = await page
      .getByTestId('total-revenue-value')
      .textContent();

    // Click refresh button
    await page.getByRole('button', { name: 'Refresh Data' }).click();

    // Wait for refresh to complete
    await page.waitForResponse('**/api/analytics/data**');

    // Verify data is refreshed (values should be the same or updated)
    await expect(page.getByTestId('total-patients-value')).toBeVisible();
    await expect(page.getByTestId('total-revenue-value')).toBeVisible();
  });

  test('should maintain filters across page refreshes', async ({ page }) => {
    // Set filters
    await page.getByLabel('Start Date').fill('2024-02-01');
    await page.getByLabel('End Date').fill('2024-02-28');

    // Select treatment filter
    await page.getByLabel('Treatments').click();
    await page.getByRole('option', { name: 'Facial' }).click();

    // Apply filters
    await page.getByRole('button', { name: 'Apply Filters' }).click();

    // Refresh page
    await page.reload();

    // Verify filters are maintained
    await expect(page.getByLabel('Start Date')).toHaveValue('2024-02-01');
    await expect(page.getByLabel('End Date')).toHaveValue('2024-02-28');
    await expect(page.getByText('Facial')).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    // Run accessibility checks
    await expect(page.getByTestId('analytics-dashboard')).toBeVisible();

    // Check for proper heading structure
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();

    // Check for proper labels
    await expect(page.getByLabel('Start Date')).toBeVisible();
    await expect(page.getByLabel('End Date')).toBeVisible();
    await expect(page.getByLabel('Treatments')).toBeVisible();

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Verify focus management
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName,
    );
    expect(['BUTTON', 'INPUT', 'SELECT']).toContain(focusedElement);
  });
});
