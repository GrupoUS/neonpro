/**
 * Playwright Configuration for NeonPro Healthcare E2E Testing
 *
 * Healthcare User Journeys + Brazilian Compliance + Multi-tenant Testing
 * Patient Registration → Appointment Booking → Medical Records
 * Quality Standards: ≥9.9/10 Healthcare Validation
 */

import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Healthcare E2E Test Configuration
 */
export default defineConfig({
  // Test directory
  testDir: './tools/testing/e2e/tests',

  // Healthcare test patterns
  testMatch: [
    '**/healthcare/**/*.spec.ts',
    '**/patient-journey/**/*.spec.ts',
    '**/compliance/**/*.spec.ts',
    '**/medical-workflows/**/*.spec.ts',
  ],

  // Global test configuration
  fullyParallel: false, // Sequential for healthcare data consistency
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 1, // Limited workers for healthcare testing

  // Healthcare test reporter
  reporter: [
    [
      'html',
      {
        outputFolder: 'tools/testing/reports/e2e-report',
        open: 'never',
      },
    ],
    [
      'junit',
      {
        outputFile: 'tools/testing/reports/healthcare-e2e-results.xml',
      },
    ],
    [
      'json',
      {
        outputFile: 'tools/testing/reports/healthcare-e2e-results.json',
      },
    ],
    // Custom healthcare reporter
    ['./tools/testing/utils/healthcare-e2e-reporter.ts'],
  ],

  // Healthcare test configuration
  use: {
    // Base URL for healthcare application
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // Healthcare test tracing
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Healthcare user agent
    userAgent: 'NeonPro-E2E-Tests/1.0 (Healthcare Testing)',

    // Brazilian locale for healthcare testing
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',

    // Healthcare accessibility standards
    colorScheme: 'light',
    reducedMotion: 'reduce', // For anxiety reduction

    // Extended timeouts for healthcare operations
    actionTimeout: 15_000,
    navigationTimeout: 30_000,

    // Ignore HTTPS errors in test environment
    ignoreHTTPSErrors: true,

    // Healthcare test context
    extraHTTPHeaders: {
      'X-Healthcare-Testing': 'true',
      'X-LGPD-Compliance': 'true',
      'X-Anvisa-Validation': 'true',
      'X-CFM-Standards': 'true',
    },
  },

  // Healthcare test projects (different user roles)
  projects: [
    // Patient User Journey Testing
    {
      name: 'patient-chrome',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './tools/testing/setup/auth/patient-auth.json',
        contextOptions: {
          permissions: ['geolocation', 'camera'], // For healthcare features
        },
      },
      testMatch: '**/patient-journey/**/*.spec.ts',
    },

    // Healthcare Professional Testing
    {
      name: 'healthcare-professional-chrome',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './tools/testing/setup/auth/professional-auth.json',
        contextOptions: {
          permissions: ['geolocation', 'camera', 'microphone'], // For telemedicine
        },
      },
      testMatch: '**/professional-workflows/**/*.spec.ts',
    },

    // Clinic Administrator Testing
    {
      name: 'admin-chrome',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './tools/testing/setup/auth/admin-auth.json',
        contextOptions: {
          permissions: ['geolocation'],
        },
      },
      testMatch: '**/admin-workflows/**/*.spec.ts',
    },

    // Mobile Healthcare Testing (Patient App)
    {
      name: 'patient-mobile-safari',
      use: {
        ...devices['iPhone 14 Pro'],
        storageState: './tools/testing/setup/auth/patient-auth.json',
      },
      testMatch: '**/mobile-patient/**/*.spec.ts',
    },

    // Accessibility Testing
    {
      name: 'accessibility-testing',
      use: {
        ...devices['Desktop Chrome'],
        // High contrast for accessibility testing
        colorScheme: 'dark',
        reducedMotion: 'reduce',
        // Screen reader simulation
        extraHTTPHeaders: {
          'X-Accessibility-Testing': 'true',
          'X-Screen-Reader-Simulation': 'true',
        },
      },
      testMatch: '**/accessibility/**/*.spec.ts',
    },

    // LGPD Compliance Testing
    {
      name: 'lgpd-compliance',
      use: {
        ...devices['Desktop Chrome'],
        extraHTTPHeaders: {
          'X-LGPD-Audit-Mode': 'true',
          'X-Data-Subject-Rights-Testing': 'true',
        },
      },
      testMatch: '**/compliance/lgpd/**/*.spec.ts',
    },

    // Multi-tenant Isolation Testing
    {
      name: 'multi-tenant-testing',
      use: {
        ...devices['Desktop Chrome'],
        extraHTTPHeaders: {
          'X-Multi-Tenant-Testing': 'true',
          'X-Tenant-Isolation-Validation': 'true',
        },
      },
      testMatch: '**/multi-tenant/**/*.spec.ts',
    },

    // Cross-browser Healthcare Testing
    {
      name: 'healthcare-firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: './tools/testing/setup/auth/patient-auth.json',
      },
      testMatch: '**/cross-browser/**/*.spec.ts',
    },

    {
      name: 'healthcare-safari',
      use: {
        ...devices['Desktop Safari'],
        storageState: './tools/testing/setup/auth/patient-auth.json',
      },
      testMatch: '**/cross-browser/**/*.spec.ts',
    },
  ],

  // Global setup and teardown for healthcare testing
  globalSetup: require.resolve('./tools/testing/setup/global-setup.ts'),
  globalTeardown: require.resolve('./tools/testing/setup/global-teardown.ts'),

  // Test output directory
  outputDir: 'tools/testing/reports/',

  // Web server configuration for testing
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000, // 2 minutes for healthcare app startup

    // Environment variables for testing
    env: {
      NODE_ENV: 'test',
      HEALTHCARE_MODE: 'true',
      LGPD_COMPLIANCE: 'true',
      ANVISA_VALIDATION: 'true',
      CFM_STANDARDS: 'true',
      // Test database configuration
      NEXT_PUBLIC_SUPABASE_URL: process.env.TEST_SUPABASE_URL || 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.TEST_SUPABASE_ANON_KEY || 'test_anon_key',
      SUPABASE_SERVICE_ROLE_KEY:
        process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || 'test_service_role_key',
    },
  },

  // Healthcare test expectations
  expect: {
    // Extended timeout for healthcare operations
    timeout: 10_000,

    // Custom healthcare matchers
    toHaveScreenshot: {
      // Healthcare UI consistency
      threshold: 0.3,
      mode: 'strict',
      animations: 'disabled', // For anxiety reduction
    },
  },

  // Test metadata
  metadata: {
    healthcare_compliance: 'LGPD + ANVISA + CFM',
    quality_standard: '≥9.9/10',
    accessibility_level: 'WCAG 2.1 AA+',
    locale: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    test_environment: 'healthcare_specialized',
  },
});

// Healthcare test utilities export
export const healthcareE2EConfig = {
  // Test data seeding
  seedTestData: async () => {
    // Implementation in global setup
  },

  // Healthcare user authentication
  authenticateHealthcareUser: async (role: 'patient' | 'professional' | 'admin') => {
    // Implementation in test utilities
  },

  // LGPD compliance validation
  validateLGPDCompliance: async (page: any) => {
    // Implementation in healthcare utilities
  },

  // Multi-tenant isolation validation
  validateTenantIsolation: async (page: any, expectedTenantId: string) => {
    // Implementation in healthcare utilities
  },

  // Healthcare accessibility validation
  validateHealthcareAccessibility: async (page: any) => {
    // Implementation in accessibility utilities
  },
};
