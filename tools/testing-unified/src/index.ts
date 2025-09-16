/**
 * @neonpro/tools-testing - Unified Testing Infrastructure
 *
 * Consolidated testing utilities, fixtures, and configurations
 * for all NeonPro development tools with healthcare compliance support.
 */

// Export testing utilities
export * from './utils';

// Export test setup and configuration
export * from './setup';

// Export test fixtures and helpers
export * from './fixtures';

// Export performance testing utilities
export * from './performance';

// Export healthcare compliance testing
export * from './healthcare';

// Version information
export const TESTING_VERSION = '1.0.0';
export const TESTING_PACKAGE_NAME = '@neonpro/tools-testing';

// Default testing configurations
export const DEFAULT_TEST_CONFIG = {
  timeout: 30000,
  setupFiles: ['./src/setup/global.ts'],
  coverage: {
    threshold: {
      lines: 80,
      functions: 80,
      branches: 70,
      statements: 80,
    },
  },
  healthcare: {
    performanceThreshold: 100, // ms
    complianceChecks: ['LGPD', 'ANVISA', 'CFM'],
  },
};

export const HEALTHCARE_TEST_CONFIG = {
  ...DEFAULT_TEST_CONFIG,
  timeout: 60000, // Longer timeout for compliance tests
  coverage: {
    threshold: {
      lines: 90,
      functions: 90,
      branches: 85,
      statements: 90,
    },
  },
};