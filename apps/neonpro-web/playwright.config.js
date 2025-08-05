/**
 * Playwright Configuration for Healthcare E2E Testing
 * LGPD-compliant testing with synthetic data
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
var test_1 = require("@playwright/test");
exports.default = (0, test_1.defineConfig)({
  testDir: "./src/__tests__/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html"],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Healthcare-specific settings
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
  },
  projects: [
    {
      name: "chromium",
      use: __assign({}, test_1.devices["Desktop Chrome"]),
    },
    {
      name: "firefox",
      use: __assign({}, test_1.devices["Desktop Firefox"]),
    },
    {
      name: "webkit",
      use: __assign({}, test_1.devices["Desktop Safari"]),
    },
    // Mobile testing for patient portal
    {
      name: "Mobile Chrome",
      use: __assign({}, test_1.devices["Pixel 5"]),
    },
    {
      name: "Mobile Safari",
      use: __assign({}, test_1.devices["iPhone 12"]),
    },
  ],
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: "test",
      NEXT_PUBLIC_SUPABASE_URL: process.env.TEST_SUPABASE_URL || "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.TEST_SUPABASE_ANON_KEY || "",
    },
  },
});
