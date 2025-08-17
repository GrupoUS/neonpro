import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Healthcare Integration Tests
 *
 * Optimized for healthcare workflows, compliance testing,
 * and multi-user scenarios with proper isolation.
 */
export default defineConfig({
  // Test directory structure
  testDir: './src',

  // Output directories
  outputDir: './test-results',

  // Global test timeout
  timeout: 60 * 1000, // 60 seconds for complex healthcare workflows

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporting configuration
  reporter: [
    ['html', { outputFolder: './playwright-report' }],
    ['json', { outputFile: './test-results/results.json' }],
    ['junit', { outputFile: './test-results/junit.xml' }],
    ['github'],
  ],

  // Global test configuration
  use: {
    // Base URL for tests
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // Browser settings
    headless: true,
    viewport: { width: 1280, height: 720 },

    // Network and timing
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,

    // Screenshots and videos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // Healthcare-specific settings
    ignoreHTTPSErrors: false, // Strict HTTPS validation

    // Locale and timezone (Brazil)
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',

    // Extra HTTP headers for all requests
    extraHTTPHeaders: {
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    },
  },

  // Test projects for different scenarios
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome', // Use actual Chrome for better compatibility
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile devices (important for healthcare accessibility)
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet devices
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    },

    // Healthcare-specific test configurations
    {
      name: 'healthcare-workflows',
      testDir: './src/healthcare',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './test-data/healthcare-auth.json',
        extraHTTPHeaders: {
          'X-Test-Suite': 'healthcare-integration',
        },
      },
    },

    {
      name: 'security-tests',
      testDir: './src/security',
      use: {
        ...devices['Desktop Chrome'],
        extraHTTPHeaders: {
          'X-Test-Suite': 'security-validation',
        },
      },
    },

    {
      name: 'visual-regression',
      testDir: './src/visual',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }, // Consistent for visual tests
        screenshot: 'only-on-failure',
      },
    },

    {
      name: 'performance-tests',
      testDir: './src/performance',
      use: {
        ...devices['Desktop Chrome'],
        extraHTTPHeaders: {
          'X-Test-Suite': 'performance-validation',
        },
      },
    },
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./src/global-setup'),
  globalTeardown: require.resolve('./src/global-teardown'),

  // Web server configuration for local testing
  webServer: process.env.CI
    ? undefined
    : {
        command: 'pnpm dev',
        port: 3000,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000, // 2 minutes for healthcare app to start
        env: {
          NODE_ENV: 'test',
          DATABASE_URL:
            process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
        },
      },

  // Test matching patterns
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],

  // Files to ignore
  testIgnore: ['**/node_modules/**', '**/dist/**', '**/build/**'],

  // Expect configuration
  expect: {
    // Healthcare apps need more lenient visual comparison due to dynamic content
    toHaveScreenshot: {
      threshold: 0.3,
      mode: 'local',
    },

    // Stricter timeout for healthcare critical operations
    timeout: 10 * 1000,
  },

  // Metadata for reporting
  metadata: {
    testSuite: 'NeonPro Healthcare Integration Tests',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'test',
    compliance: ['LGPD', 'ANVISA', 'CFM', 'WCAG 2.1 AA'],
  },
});
