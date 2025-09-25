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

  webServer: {
    command: 'cd apps/web && pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  outputDir: './test-results/',
  
  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 4 : 3,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ['junit', { outputFile: 'test-results/playwright-junit.xml' }],
    ['list'],
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',

    /* Healthcare-specific settings */
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    permissions: ['geolocation', 'notifications'],
  },

  /* Configure projects for major browsers */
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

    /* Test against mobile viewports. */
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

    /* Test against branded browsers. */
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

    /* Specialized test projects */
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

  /* Run your local dev server before starting the tests */
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

  /* Global setup and teardown for healthcare compliance */
  globalSetup: require.resolve('./tools/tests/setup/global-setup.ts'),
  globalTeardown: require.resolve('./tools/tests/setup/global-teardown.ts'),
})