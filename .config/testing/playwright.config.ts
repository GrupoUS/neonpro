import { defineConfig, devices } from '@playwright/test'

// Basic Playwright configuration for NeonPro
// - Points tests to tools/e2e/tests
// - Uses global setup/teardown from tools/e2e
// - Stores reports under tools/e2e/reports
// - Allows selecting baseURL via env BASE_URL (default http://localhost:3000)

const BASE_URL = process.env['BASE_URL'] || 'http://localhost:3000'

export default defineConfig({
  testDir: '../../tools/frontend/src/e2e',
  timeout: 30 * 1000,
  expect: { timeout: 10 * 1000 },
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 2 : 1,
  reporter: [
    ['html', { outputFolder: '../../tools/frontend/reports/e2e/html' }],
    ['list'],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // ESM-safe resolution for global setup/teardown modules
  globalSetup: new URL(
    '../../tools/frontend/src/e2e/global-setup.ts',
    import.meta.url,
  ).pathname,
  globalTeardown: new URL(
    '../../tools/frontend/src/e2e/global-teardown.ts',
    import.meta.url,
  ).pathname,
  projects: [
    {
      name: 'Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'WebKit',
      use: { ...devices['Desktop Safari'] },
    },
    // Example mobile profile (uncomment if needed)
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],
})
