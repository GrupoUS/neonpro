import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './apps/web/src/__tests__/e2e',
  timeout: 20000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 3 : 2,
  reporter: [['html'], ['json', { outputFile: 'test-results/playwright-results.json' }], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
      },
    },

    {
      name: 'mobile',
      use: {
        ...devices['Pixel 5'],
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
      },
    },

    {
      name: 'api',
      testDir: './apps/api/src/__tests__/e2e',
      testMatch: '**/*.api.spec.ts',
      use: {
        baseURL: 'http://localhost:3001/api',
      },
    },

    {
      name: 'accessibility',
      testDir: './apps/web/src/__tests__/accessibility',
      testMatch: '**/*.a11y.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
      },
    },
  ],

  webServer: [
    {
      command: 'cd apps/web && pnpm dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'cd apps/api && pnpm dev',
      url: 'http://localhost:3001/api',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],

  outputDir: './test-results/',
})
