import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'path';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 4,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: process.env.CI ? 'npm run build:vercel && npm run preview' : 'npm run dev',
    url: process.env.BASE_URL || 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  expect: {
    toMatchSnapshot: {
      threshold: 0.2,
    },
    toHaveScreenshot: {
      threshold: 0.2,
    },
  },

  // Global setup and teardown
  globalSetup: resolve(__dirname, 'e2e/setup/global-setup.ts'),
  globalTeardown: resolve(__dirname, 'e2e/setup/global-teardown.ts'),
});