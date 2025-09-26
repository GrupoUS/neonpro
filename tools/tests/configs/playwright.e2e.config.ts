import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 1,
  workers: process.env.CI ? 2 : 1,
  reporter: [
    ["html"],
    ["json", { outputFile: "../test-results/playwright-e2e-results.json" }],
    ["junit", { outputFile: "../test-results/playwright-e2e-junit.xml" }],
    ["list"],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "E2E Chromium",
      use: {
        ...devices["Desktop Chrome"],
        locale: "pt-BR",
        timezoneId: "America/Sao_Paulo",
      },
    },

    {
      name: "E2E Mobile",
      use: {
        ...devices["iPhone 12"],
        locale: "pt-BR",
        timezoneId: "America/Sao_Paulo",
      },
    },

    {
      name: "E2E Accessibility",
      testMatch: "**/*.a11y.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        locale: "pt-BR",
        timezoneId: "America/Sao_Paulo",
      },
    },
  ],

  webServer: {
    command: "cd ../../../apps/web && pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  outputDir: "../test-results/e2e/",
})
