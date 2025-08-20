/**
 * NeonPro Simplified Playwright Configuration
 *
 * FOCUS: Essential User Journeys + Patient Management E2E
 * REMOVED: Over-engineered compliance/accessibility/multi-tenant testing
 * PROJECTS: 2 essential projects vs 8 complex projects
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory - simplified structure
  testDir: './e2e/tests',

  // Essential test patterns only - E2E TESTS ONLY
  testMatch: [
    '**/e2e/**/*.spec.ts',
    '**/e2e/**/*.e2e.ts',
    '**/tests/**/*.spec.ts',
    // Specific E2E patterns
    '**/*e2e*.spec.ts',
    '**/*.playwright.ts',
  ],

  // EXCLUDE UNIT TESTS TO AVOID CONFLICTS
  testIgnore: [
    '**/*.test.ts',
    '**/*.test.tsx', 
    '**/tests/**/*.test.{ts,tsx}',
    '**/packages/**/*.test.{ts,tsx}',
    '**/src/**/*.test.{ts,tsx}',
    '**/lib/**/*.test.{ts,tsx}',
    // Ignore vitest files
    '**/vitest/**',
    '**/__tests__/**',
  ],

  // Optimized for development efficiency
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,

  // Simple HTML reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'e2e/reports/results.xml' }],
  ],

  // Core configuration
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // Essential settings
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Brazilian locale (healthcare requirement)
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',

    // Reasonable timeouts
    actionTimeout: 10_000, // Reduced from 15s
    navigationTimeout: 15_000, // Reduced from 30s

    // Test identification
    extraHTTPHeaders: {
      'X-E2E-Testing': 'true',
    },
  },

  // Essential projects only
  projects: [
    // 1. Desktop Testing (Chrome) - Primary user journey
    {
      name: 'desktop-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: [
        '**/patient-management/**/*.spec.ts',
        '**/auth/**/*.spec.ts',
        '**/dashboard/**/*.spec.ts',
      ],
    },

    // 2. Mobile Testing (Safari) - Responsive validation
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 14 Pro'],
      },
      testMatch: [
        '**/mobile/**/*.spec.ts',
        '**/patient-management/mobile-*.spec.ts',
      ],
    },
  ],

  // Development server configuration (disabled for basic testing)
  // webServer: {
  //   command: 'pnpm dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 60_000,
  //   env: {
  //     NODE_ENV: 'test',
  //   },
  // },

  // Reasonable expectations
  expect: {
    timeout: 5000, // Reduced from 10s
    toHaveScreenshot: {
      threshold: 0.3,
      mode: 'strict',
    },
  },

  // Output directory
  outputDir: 'test-results',
});

/**
 * Simplified E2E Testing Strategy:
 *
 * FOCUS AREAS:
 * 1. Patient Management workflows (create, edit, list, detail)
 * 2. Authentication flow (login/logout)
 * 3. Core dashboard navigation
 * 4. Mobile responsiveness validation
 *
 * REMOVED (Premature for MVP):
 * - Compliance testing (LGPD, ANVISA, CFM)
 * - Accessibility testing (manual validation sufficient)
 * - Multi-tenant testing (single tenant MVP)
 * - Security penetration testing (premature)
 * - Cross-browser matrix (Chrome + Safari sufficient)
 * - Role-based testing (single role MVP)
 *
 * EFFICIENCY GAINS:
 * - 2 projects vs 8 (75% reduction in complexity)
 * - Focus on implemented Patient Management
 * - Faster test execution (60s vs 120s setup)
 * - Simpler maintenance
 * - Clear test boundaries
 *
 * NEXT STEPS:
 * 1. Create essential test files in e2e/tests/
 * 2. Focus on happy path scenarios
 * 3. Add edge cases only after core functionality works
 * 4. Expand testing as features are implemented
 */
