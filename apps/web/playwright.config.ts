import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for NeonPro Healthcare E2E Testing
 * Comprehensive testing setup covering all healthcare workflows
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/results.xml" }],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    // Desktop Chrome - Primary browser for healthcare workflows
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Firefox for cross-browser compatibility
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // WebKit/Safari for cross-browser compatibility
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Mobile Chrome for healthcare mobile workflows
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },

    // Tablet for healthcare tablet workflows
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },

    // High contrast mode for accessibility testing
    {
      name: "chromium-accessibility",
      use: {
        ...devices["Desktop Chrome"],
        colorScheme: "dark",
        forcedColors: "active",
      },
    },
  ],

  // Development server configuration
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Global test configuration
  timeout: 60000,
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      mode: "only-on-failure",
      animations: "disabled",
      caret: "hide",
    },
  },

  // Output directories
  outputDir: "test-results/",
});
