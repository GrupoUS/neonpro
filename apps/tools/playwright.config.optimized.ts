import { defineConfig, devices } from "@playwright/test";
import { resolve } from "path";
import { fileURLToPath } from "url";

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");

export default defineConfig({
  // Test directory and output
  testDir: "./e2e",
  outputDir: "./test-results",
  
  // Performance optimization for clinic workflows
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 4 : 3,
  maxFailures: process.env.CI ? 5 : 10,
  
  // Comprehensive reporting for clinic compliance
  reporter: [
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/results.xml" }],
    ["list"],
    ["line"],
    ["github"],
  ],
  
  // Global configuration optimized for clinic app
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:8080",
    trace: process.env.CI ? "retain-on-failure" : "on-first-retry",
    screenshot: process.env.CI ? "only-on-failure" : "on",
    video: process.env.CI ? "retain-on-failure" : "on-first-retry",

    // Performance settings optimized for clinic workflows
    launchOptions: {
      slowMo: process.env.DEBUG ? 100 : 0,
      headless: process.env.HEADLESS !== "false",
      args: [
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--enable-precise-memory-info",
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding"
      ]
    },

    // Navigation timeout optimized for clinic app performance
    navigationTimeout: 45000,
    timeout: 15000,

    // Viewport size optimized for clinic dashboard
    viewport: { width: 1920, height: 1080 },

    // Ignore HTTPS errors for local testing
    ignoreHTTPSErrors: true,

    // Geolocation for clinic location testing
    geolocation: { latitude: -23.5505, longitude: -46.6333 }, // São Paulo
    permissions: ["geolocation"],

    // User agent for realistic testing
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",

    // Extra HTTP headers for clinic app
    extraHTTPHeaders: {
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    },

    // Test isolation
    serviceWorkers: "block",
    permissions: ["camera", "microphone", "notifications"],
  },

  // Browser projects optimized for clinic testing
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        screenshot: "only-on-failure",
        viewport: { width: 1920, height: 1080 },
      },
      grep: /@desktop|@clinic/,
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        screenshot: "only-on-failure",
        viewport: { width: 1920, height: 1080 },
      },
      grep: /@firefox|@desktop/,
    },

    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        screenshot: "only-on-failure",
        viewport: { width: 1920, height: 1080 },
      },
      grep: /@safari|@desktop/,
    },

    // Mobile projects optimized for clinic on-the-go testing
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 414, height: 896 },
      },
      grep: /@mobile|@phone/,
    },

    {
      name: "Mobile Safari",
      use: {
        ...devices["iPhone 12"],
        viewport: { width: 390, height: 844 },
      },
      grep: /@mobile|@phone/,
    },

    // Tablet testing for clinic dashboard
    {
      name: "iPad",
      use: {
        ...devices["iPad Air"],
        viewport: { width: 820, height: 1180 },
      },
      grep: /@tablet|@ipad/,
    },

    // Accessibility testing for WCAG compliance
    {
      name: "accessibility",
      use: {
        ...devices["Desktop Chrome"],
        screenshot: "only-on-failure",
        viewport: { width: 1920, height: 1080 },
      },
      grep: /@a11y|@accessibility/,
    },

    // Performance testing for clinic workflows
    {
      name: "performance",
      use: {
        ...devices["Desktop Chrome"],
        screenshot: "only-on-failure",
        viewport: { width: 1920, height: 1080 },
      },
      grep: /@perf|@performance/,
    },

    // Visual regression testing for clinic UI
    {
      name: "visual",
      use: {
        ...devices["Desktop Chrome"],
        screenshot: "only-on-failure",
        viewport: { width: 1920, height: 1080 },
      },
      grep: /@visual|@screenshot/,
    },
  ],

  // Web server configuration optimized for clinic app
  webServer: [
    {
      command: process.env.CI
        ? "cd ../../apps/web && bun run build:vercel && bun run preview"
        : "cd ../../apps/web && bun run dev",
      url: process.env.BASE_URL || "http://localhost:8080",
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000, // Increased timeout for clinic app startup
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: process.env.CI
        ? "cd ../../apps/api && bun run build && bun start"
        : "cd ../../apps/api && bun run dev",
      url: process.env.API_URL || "http://localhost:3001",
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000, // Increased timeout for API startup
      stdout: "pipe",
      stderr: "pipe",
    },
  ],

  // Expect configuration for clinic app validation
  expect: {
    toMatchSnapshot: {
      threshold: 0.2,
      maxDiffPixelRatio: 0.02,
    },
    toHaveScreenshot: {
      threshold: 0.2,
      maxDiffPixelRatio: 0.02,
    },
    timeout: 5000,
  },

  // Global setup and teardown
  globalSetup: resolve(__dirname, "e2e/setup/global-setup.ts"),
  globalTeardown: resolve(__dirname, "e2e/setup/global-teardown.ts"),
  
  // Test metadata for clinic app
  metadata: {
    project: "neonpro-e2e",
    version: "1.0.0",
    type: "aesthetic-clinic",
    features: [
      "patient-management",
      "appointment-scheduling",
      "professional-dashboard",
      "treatment-planning",
      "realtime-communication",
      "whatsapp-integration",
      "anti-no-show-engine",
      "lgpd-compliance"
    ],
  },

  // Test matching optimized for clinic workflows
  testMatch: [
    "**/*.e2e.ts",
    "**/*.spec.ts",
    "**/*.test.ts",
    "**/flows/**/*.ts",
    "**/clinic-**/*.ts",
    "**/aesthetic/**/*.ts",
    "**/appointment/**/*.ts",
    "**/patient/**/*.ts",
    "**/professional/**/*.ts"
  ],
  
  // Exclude patterns
  exclude: [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.next/**",
    "**/coverage/**",
    "**/test-results/**",
  ],
  
  // Artifacts configuration
  preserveOutput: process.env.CI ? "always" : "failures-only",
  
  // Reporter filters
  reporterProcessEnv: (env) => ({
    ...env,
    PLAYWRIGHT_HTML_REPORT: "true",
    PLAYWRIGHT_BAIL_ON_CI_FAILURE: "true",
  }),

  // Test organization
  shard: process.env.SHARD ? process.env.SHARD : undefined,
  
  // Dependency management
  dependencies: ["../../apps/web"],
  
  // Configuration for different environments
  ...(process.env.CI && {
    reporter: [
      ["html", { open: "never", outputFolder: "playwright-report" }],
      ["json", { outputFile: "test-results/results.json" }],
      ["junit", { outputFile: "test-results/results.xml" }],
      ["list"],
    ],
    retries: 3,
    workers: 4,
    maxFailures: 3,
  }),
  
  // Development mode configuration
  ...(!process.env.CI && {
    reporter: [
      ["html", { open: "never", outputFolder: "playwright-report" }],
      ["list"],
      ["line"],
    ],
    retries: 1,
    workers: 3,
    maxFailures: 10,
  }),
});