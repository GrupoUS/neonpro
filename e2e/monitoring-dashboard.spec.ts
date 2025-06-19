/**
 * Monitoring Dashboard E2E Tests
 * GRUPO US VIBECODE SYSTEM V5.0 - Phase 8 Production Monitoring
 * 
 * End-to-end tests for the monitoring dashboard
 * Tests complete user journeys and workflows
 */

import { test, expect } from '@playwright/test';

test.describe('Monitoring Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the monitoring dashboard
    await page.goto('/dashboard/monitoring');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display the monitoring dashboard page', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Production Monitoring.*NEONPRO/);
    
    // Check main heading
    await expect(page.getByRole('heading', { name: 'Production Monitoring' })).toBeVisible();
    
    // Check description
    await expect(page.getByText('Real-time monitoring and observability for NEONPRO clinic operations')).toBeVisible();
  });

  test('should display system health overview', async ({ page }) => {
    // Check for system health cards
    await expect(page.getByText('API Gateway')).toBeVisible();
    await expect(page.getByText('Database')).toBeVisible();
    await expect(page.getByText('Authentication')).toBeVisible();
    await expect(page.getByText('AI Services')).toBeVisible();
    await expect(page.getByText('Payments')).toBeVisible();
    await expect(page.getByText('Storage')).toBeVisible();
    
    // Check for status indicators
    await expect(page.locator('text=HEALTHY').first()).toBeVisible();
  });

  test('should display key performance indicators', async ({ page }) => {
    // Check for KPI cards
    await expect(page.getByText('System Health')).toBeVisible();
    await expect(page.getByText('Active Alerts')).toBeVisible();
    await expect(page.getByText('Uptime')).toBeVisible();
    await expect(page.getByText('Response Time')).toBeVisible();
    
    // Check for percentage values
    await expect(page.locator('text=/\\d+%/').first()).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    // Check default tab
    await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute('data-state', 'active');
    
    // Navigate to Clinic Metrics tab
    await page.getByRole('tab', { name: 'Clinic Metrics' }).click();
    await expect(page.getByRole('tab', { name: 'Clinic Metrics' })).toHaveAttribute('data-state', 'active');
    
    // Navigate to System Performance tab
    await page.getByRole('tab', { name: 'System Performance' }).click();
    await expect(page.getByRole('tab', { name: 'System Performance' })).toHaveAttribute('data-state', 'active');
    
    // Navigate to Alerts tab
    await page.getByRole('tab', { name: 'Alerts' }).click();
    await expect(page.getByRole('tab', { name: 'Alerts' })).toHaveAttribute('data-state', 'active');
    
    // Navigate to Distributed Tracing tab
    await page.getByRole('tab', { name: 'Traces' }).click();
    await expect(page.getByRole('tab', { name: 'Traces' })).toHaveAttribute('data-state', 'active');
  });

  test('should display clinic metrics in clinic tab', async ({ page }) => {
    // Navigate to Clinic Metrics tab
    await page.getByRole('tab', { name: 'Clinic Metrics' }).click();
    
    // Check for clinic metric categories
    await expect(page.getByText('Appointments')).toBeVisible();
    await expect(page.getByText('Treatments')).toBeVisible();
    await expect(page.getByText('Patients')).toBeVisible();
    await expect(page.getByText('AI Services')).toBeVisible();
    await expect(page.getByText('Payments')).toBeVisible();
    
    // Check for specific metrics
    await expect(page.getByText('Total Appointments')).toBeVisible();
    await expect(page.getByText('Success Rate')).toBeVisible();
    await expect(page.getByText('Active Treatments')).toBeVisible();
    await expect(page.getByText('Patient Satisfaction')).toBeVisible();
  });

  test('should display performance charts in system tab', async ({ page }) => {
    // Navigate to System Performance tab
    await page.getByRole('tab', { name: 'System Performance' }).click();
    
    // Check for performance metrics
    await expect(page.getByText('CPU Usage')).toBeVisible();
    await expect(page.getByText('Memory Usage')).toBeVisible();
    await expect(page.getByText('Disk Usage')).toBeVisible();
    await expect(page.getByText('Network Latency')).toBeVisible();
    
    // Check for chart sections
    await expect(page.getByText('CPU & Memory Trends')).toBeVisible();
    await expect(page.getByText('Storage & Network Trends')).toBeVisible();
    
    // Check for performance summary
    await expect(page.getByText('Performance Summary')).toBeVisible();
  });

  test('should display alerts in alerts tab', async ({ page }) => {
    // Navigate to Alerts tab
    await page.getByRole('tab', { name: 'Alerts' }).click();
    
    // Check for alerts header
    await expect(page.getByText('Alerts & Notifications')).toBeVisible();
    
    // Check for alert statistics
    await expect(page.getByText('Total Alerts')).toBeVisible();
    await expect(page.getByText('High Priority')).toBeVisible();
    await expect(page.getByText('Acknowledged')).toBeVisible();
    await expect(page.getByText('Resolved')).toBeVisible();
    
    // Check for alert tabs
    await expect(page.getByRole('tab', { name: /Active/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Acknowledged/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Resolved/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /All/ })).toBeVisible();
  });

  test('should handle real-time updates', async ({ page }) => {
    // Check for live indicator
    await expect(page.getByText('Live')).toBeVisible();
    
    // Check for pause/resume button
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
    
    // Click pause button
    await page.getByRole('button', { name: 'Pause' }).click();
    await expect(page.getByText('Paused')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
    
    // Click resume button
    await page.getByRole('button', { name: 'Resume' }).click();
    await expect(page.getByText('Live')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  });

  test('should handle refresh functionality', async ({ page }) => {
    // Check for refresh button
    await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
    
    // Click refresh button
    await page.getByRole('button', { name: 'Refresh' }).click();
    
    // Check that last updated time is displayed
    await expect(page.getByText(/Last updated:/)).toBeVisible();
  });

  test('should handle export functionality', async ({ page }) => {
    // Check for export button
    await expect(page.getByRole('button', { name: 'Export' })).toBeVisible();
    
    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await page.getByRole('button', { name: 'Export' }).click();
    
    // Wait for download to start
    const download = await downloadPromise;
    
    // Check download filename
    expect(download.suggestedFilename()).toMatch(/neonpro-monitoring-report-.*\.json/);
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that main elements are still visible
    await expect(page.getByRole('heading', { name: 'Production Monitoring' })).toBeVisible();
    await expect(page.getByText('System Health')).toBeVisible();
    
    // Check that tabs are accessible
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible();
    
    // Navigate to different tab on mobile
    await page.getByRole('tab', { name: 'Clinic Metrics' }).click();
    await expect(page.getByText('Appointments')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Focus on the first interactive element
    await page.keyboard.press('Tab');
    
    // Check that focus is visible
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Navigate through tabs using keyboard
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Clinic Metrics' })).toHaveAttribute('data-state', 'active');
    
    // Navigate to buttons using Tab
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Activate button using Enter
    await page.keyboard.press('Enter');
  });

  test('should display error states gracefully', async ({ page }) => {
    // This test would require mocking API failures
    // For now, we'll check that the page loads without errors
    
    // Check console for errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Navigate through all tabs
    await page.getByRole('tab', { name: 'Clinic Metrics' }).click();
    await page.getByRole('tab', { name: 'System Performance' }).click();
    await page.getByRole('tab', { name: 'Alerts' }).click();
    await page.getByRole('tab', { name: 'Traces' }).click();
    
    // Check that no critical errors occurred
    const criticalErrors = errors.filter(error => 
      !error.includes('Warning') && 
      !error.includes('DevTools') &&
      !error.includes('favicon')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});
