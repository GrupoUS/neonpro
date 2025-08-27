import { defineConfig, devices } from "@playwright/test";

// Configuration constants to avoid magic numbers
const DEV_SERVER_PORT = 3000;
const TIMEOUT_SECONDS = 120;

/**
 * Visual Regression Testing Configuration
 *
 * Optimized for healthcare UI consistency validation
 * with Brazilian accessibility and compliance requirements.
 */
export default defineConfig({
  testDir: "./src",
  outputDir: "./test-results",

  // Visual-specific timeout settings
  timeout: 30 * 1000,

  // Test execution settings
  fullyParallel: false, // Sequential for consistent visual capture
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for visual consistency

  // Reporting configuration
  reporter: [
    ["html", { outputFolder: "./visual-report" }],
    ["json", { outputFile: "./test-results/visual-results.json" }],
  ],

  // Global test configuration
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",

    // Visual testing specific settings
    headless: true,
    viewport: { width: 1920, height: 1080 }, // Consistent viewport

    // Network and timing
    actionTimeout: 10 * 1000,
    navigationTimeout: 20 * 1000,

    // Screenshots and videos
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",

    // Brazilian locale
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",

    // Extra HTTP headers
    extraHTTPHeaders: {
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    },
  },

  // Visual regression projects
  projects: [
    // Desktop - Primary visual baseline
    {
      name: "desktop-chrome",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Tablet - Healthcare professionals on-the-go
    {
      name: "tablet-ipad",
      use: {
        ...devices["iPad Pro"],
        viewport: { width: 1024, height: 1366 },
      },
    },

    // Mobile - Patient access
    {
      name: "mobile-android",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 393, height: 851 },
      },
    },

    // High contrast mode for accessibility
    {
      name: "desktop-high-contrast",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
        colorScheme: "dark",
        forcedColors: "active",
      },
    },

    // Large text mode for accessibility
    {
      name: "desktop-large-text",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
        extraHTTPHeaders: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 HighDPI",
        },
      },
    },
  ],

  // Global setup and teardown
  globalSetup: require.resolve("./src/global-setup"),
  globalTeardown: require.resolve("./src/global-teardown"),

  // Web server for local testing
  webServer: process.env.CI
    ? undefined
    : {
      command: "pnpm dev",
      port: DEV_SERVER_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: TIMEOUT_SECONDS * 1000,
    },

  // Expect configuration for visual testing
  expect: {
    // Visual comparison settings
    toHaveScreenshot: {
      threshold: 0.2, // 20% difference threshold
      mode: "local",
      animations: "disabled", // Disable animations for consistent capture
    },

    // Timeout for visual comparisons
    timeout: 15 * 1000,
  },

  // Metadata
  metadata: {
    testSuite: "NeonPro Visual Regression Tests",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "test",
    compliance: ["WCAG 2.1 AA", "Brazilian Accessibility Standards"],
  },
});
