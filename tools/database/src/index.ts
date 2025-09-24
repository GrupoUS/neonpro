/**
 * @neonpro/tools-database-tests
 * Database testing utilities for RLS, Security, Compliance & Migrations
 */

// Re-export shared utilities for convenience
export * from '@neonpro/tools-shared';

// Version information
export const DATABASE_TESTING_VERSION = '1.0.0';
export const DATABASE_TESTING_PACKAGE = '@neonpro/tools-database-tests';

// Default configurations
export const DEFAULT_DATABASE_CONFIG = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/setup.ts'],
  testMatch: ['**/__tests__/**/*.{ts,js}', '**/*.{test,spec}.{ts,js}'],
  collectCoverageFrom: ['src/**/*.{ts,js}', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  testTimeout: 30000, // Longer timeout for database operations
};
