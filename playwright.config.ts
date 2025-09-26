import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tools/tests',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 3,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ['junit', { outputFile: 'test-results/playwright-junit.xml' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
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
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
      },
    },

    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
      },
    },

    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
      },
    },

    {
      name: 'Microsoft Edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
      },
    },

    {
      name: 'Google Chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
      },
    },

    {
      name: 'API Tests',
      testMatch: '**/*.api.spec.ts',
      use: {
        baseURL: 'http://localhost:3001/api',
      },
    },

    {
      name: 'Accessibility Tests',
      testMatch: '**/*.a11y.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
      },
      retries: 1,
    },

    {
      name: 'E2E Healthcare Tests',
      testMatch: '**/*.healthcare.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
      },
      retries: 2,
    },

    {
      name: 'Performance Tests',
      testMatch: '**/*.perf.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
      },
      retries: 0,
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

  /* Global setup and teardown for healthcare compliance */
  globalSetup: require.resolve('./tools/tests/setup/global-setup.ts'),
  globalTeardown: require.resolve('./tools/tests/setup/global-teardown.ts'),
})