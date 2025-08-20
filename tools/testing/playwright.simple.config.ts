import { defineConfig, devices } from '@playwright/test';

/**
 * Simplified Playwright Configuration for NeonPro Healthcare Testing
 * ================================================================
 * 
 * This configuration avoids complex global setup files and focuses
 * on basic end-to-end testing functionality for healthcare workflows.
 */

export default defineConfig({
  // Test directory  
  testDir: './__tests__/e2e',
  
  // Basic test patterns
  testMatch: [
    '**/*.spec.ts',
    '**/*.test.ts',
  ],
  
  // Test configuration
  fullyParallel: false, // Sequential for healthcare data consistency
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 1, // Single worker for healthcare testing
  
  // Test timeout
  timeout: 30_000,
  
  // Reporting
  reporter: [
    ['html', { outputFolder: './reports/playwright-html', open: 'never' }],
    ['json', { outputFile: './reports/playwright-results.json' }],
    ['line'],
  ],
  
  // Global test options
  use: {
    // Base URL for testing
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Browser options
    headless: true,
    viewport: { width: 1280, height: 720 },
    
    // Screenshots and videos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    
    // Healthcare testing specific
    ignoreHTTPSErrors: true,
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  
  // Browser projects
  projects: [
    {
      name: 'chromium-healthcare',
      use: { 
        ...devices['Desktop Chrome'],
        // Healthcare-specific viewport
        viewport: { width: 1366, height: 768 },
      },
    },
  ],
  
  // Development server (optional)
  webServer: process.env.CI ? undefined : {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});