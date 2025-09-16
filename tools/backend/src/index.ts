/**
 * @neonpro/tools-backend-tests
 * Backend testing utilities for API, Integration, Monorepo & Middleware
 */

// Export API testing utilities
export * from './api';

// Export integration testing utilities
export * from './integration';

// Export middleware testing utilities
export * from './middleware';

// Export monorepo testing utilities
export * from './monorepo';

// Re-export shared utilities for convenience
export * from '@neonpro/tools-shared';

// Version information
export const BACKEND_TESTING_VERSION = '1.0.0';
export const BACKEND_TESTING_PACKAGE = '@neonpro/tools-backend-tests';

// Default configurations
export const DEFAULT_BACKEND_CONFIG = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/setup.ts'],
  testMatch: [
    '**/__tests__/**/*.{ts,js}',
    '**/*.{test,spec}.{ts,js}'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};