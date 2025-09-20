import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for NeonPro Testing Toolkit
 *
 * Unified E2E testing configuration following healthcare compliance requirements
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [
    ["html", { outputFolder: "coverage/playwright-report" }],
    ["json", { outputFile: "coverage/playwright-results.json" }],
    ["junit", { outputFile: "coverage/playwright-results.xml" }],
  ],

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    // Healthcare compliance: ensure accessibility testing
    extraHTTPHeaders: {
      "X-Test-Environment": "e2e",
      "X-Healthcare-Compliance": "true",
    },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    // Mobile testing for healthcare accessibility
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Global setup for healthcare compliance testing
  globalSetup: require.resolve("./tests/e2e/global-setup.ts"),
  globalTeardown: require.resolve("./tests/e2e/global-teardown.ts"),

  // Test timeout configuration
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
  },

  // Output directories
  outputDir: "coverage/playwright-artifacts",
});
