/**
 * 🎭 Playwright Test Configuration with Monitoring
 *
 * Enhanced configuration with integrated performance monitoring
 */

import { test as base, expect } from '@playwright/test';
import { e2eMonitor } from './monitoring';

// Extend the test with monitoring capabilities
export const test = base.extend({
  // Monitor each test
  monitoredPage: async ({ page }, use, testInfo) => {
    const startTime = Date.now();

    // Collect network metrics
    let networkRequests = 0;
    page.on('request', () => networkRequests++);

    // Use the page
    await use(page);

    // Collect metrics after test completion
    const endTime = Date.now();
    testInfo.duration = endTime - startTime;

    // Save metrics
    await e2eMonitor.collectMetrics({
      ...testInfo,
      duration: testInfo.duration,
      networkRequests,
    });
  },
});

// Export expect from Playwright
export { expect };

// Test annotations for better categorization
export const annotations = {
  smoke: { type: 'tag', description: '@smoke' },
  regression: { type: 'tag', description: '@regression' },
  healthcare: { type: 'tag', description: '@healthcare' },
  lgpd: { type: 'tag', description: '@lgpd' },
  anvisa: { type: 'tag', description: '@anvisa' },
  performance: { type: 'tag', description: '@performance' },
};

// Healthcare-specific test helpers
export const healthcareHelpers = {
  /**
   * 🏥 Validate LGPD compliance in forms
   */
  async validateLGPDCompliance(page: any) {
    // Check for consent checkboxes
    await expect(page.locator('[data-testid="lgpd-consent"]')).toBeVisible();

    // Check for privacy policy link
    await expect(
      page.locator('[data-testid="privacy-policy-link"]')
    ).toBeVisible();

    // Check for data subject rights information
    await expect(
      page.locator('[data-testid="data-rights-info"]')
    ).toBeVisible();
  },

  /**
   * 🏥 Validate ANVISA compliance for medical forms
   */
  async validateANVISACompliance(page: any) {
    // Check for medical license validation
    await expect(page.locator('[data-testid="medical-license"]')).toBeVisible();

    // Check for regulatory warnings
    await expect(
      page.locator('[data-testid="regulatory-warning"]')
    ).toBeVisible();

    // Check for audit trail indicators
    await expect(page.locator('[data-testid="audit-trail"]')).toBeVisible();
  },

  /**
   * 🏥 Validate healthcare performance thresholds
   */
  async validatePerformanceThresholds(page: any) {
    // Measure page load time
    const navigationStart = await page.evaluate(
      () => performance.timing.navigationStart
    );
    const loadComplete = await page.evaluate(
      () => performance.timing.loadEventEnd
    );
    const loadTime = loadComplete - navigationStart;

    // Healthcare systems should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Check for accessibility compliance
    await expect(page.locator('[aria-label]')).toHaveCount({ min: 1 });
  },
};

// Performance test helpers
export const performanceHelpers = {
  /**
   * 📊 Measure Core Web Vitals
   */
  async measureWebVitals(page: any) {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals: any = {};

          entries.forEach((entry: any) => {
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime;
            }
            if (entry.entryType === 'first-input') {
              vitals.fid = entry.processingStart - entry.startTime;
            }
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              vitals.cls = (vitals.cls || 0) + entry.value;
            }
          });

          if (Object.keys(vitals).length === 3) {
            resolve(vitals);
          }
        });

        observer.observe({
          entryTypes: [
            'largest-contentful-paint',
            'first-input',
            'layout-shift',
          ],
        });

        // Fallback timeout
        setTimeout(() => resolve({}), 5000);
      });
    });
  },

  /**
   * 🚀 Measure page load performance
   */
  async measurePageLoad(page: any) {
    const metrics = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        domLoading: timing.domLoading - timing.navigationStart,
        domInteractive: timing.domInteractive - timing.navigationStart,
        domComplete: timing.domComplete - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,
      };
    });

    return metrics;
  },
};
