/**
 * @neonpro/tools-quality-tests
 * Quality testing utilities for Coverage, Performance, Audit & Monitoring
 */

// Export available components
export * from './orchestrator';

// Note: Other modules temporarily disabled until available
// export * from './coverage';
// export * from './audit';
// export * from './monitoring';

// Re-export performance utilities
export * from './performance/cold-start-measurement';

// Note: tools-shared import temporarily disabled
// export * from '@neonpro/tools-shared';

// Version information
export const QUALITY_TESTING_VERSION = '1.0.0';
export const QUALITY_TESTING_PACKAGE = '@neonpro/tools-quality-tests';

// Default configurations
export const DEFAULT_QUALITY_CONFIG = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/setup.ts'],
  testMatch: [
    '**/__tests__/**/*.{ts,js}',
    '**/*.{test,spec}.{ts,js}',
    '**/*.bench.{ts,js}' // Include benchmark tests
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.bench.{ts,js}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 60000, // Longer timeout for quality tests
};