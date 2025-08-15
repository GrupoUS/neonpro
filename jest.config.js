/**
 * Jest Configuration for NeonPro Healthcare System
 * Standalone configuration without Next.js dependency
 */

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  displayName: 'NeonPro Healthcare Tests',
  testEnvironment: 'jsdom',

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)',
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/setup.ts',
    '<rootDir>/__tests__/setup/',
    '<rootDir>/tools/testing/',
  ],

  // Setup files (loaded in order - Supabase mock MUST be first)
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/setup/supabase-mock.ts',
    '<rootDir>/__tests__/setup/test-env.ts',
    '<rootDir>/__tests__/setup.ts',
    '<rootDir>/__tests__/setup/api-setup.ts',
  ],

  // Module handling
  moduleNameMapper: {
    // Path mapping from tsconfig.json
    ...pathsToModuleNameMapper(compilerOptions.paths || {}, {
      prefix: '<rootDir>/',
    }),
    // Manual path mappings for monorepo structure
    '^@/(.*)$': '<rootDir>/apps/web/$1',
    '^@/lib/(.*)$': '<rootDir>/apps/web/lib/$1',
    '^@/components/(.*)$': '<rootDir>/apps/web/components/$1',
    '^@/app/(.*)$': '<rootDir>/apps/web/app/$1',
    '^@/types/(.*)$': '<rootDir>/apps/web/types/$1',
    '^@/utils/(.*)$': '<rootDir>/apps/web/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/apps/web/hooks/$1',
    '^@/stores/(.*)$': '<rootDir>/apps/web/stores/$1',

    // CSS modules
    '\\.(css|less|sass|scss|styl)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__tests__/__mocks__/fileMock.js',
  },

  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        useESM: false,
      },
    ],
  },

  // Transform ignore patterns - ensure Supabase modules are transformed
  transformIgnorePatterns: [
    'node_modules/(?!(isows|@supabase|ws|jose|@supabase/auth-helpers-.*|@supabase/auth-js|@supabase/supabase-js|@supabase/gotrue-js|uuid)/)',
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Collect coverage from
  collectCoverageFrom: [
    'apps/web/**/*.{js,jsx,ts,tsx}',
    '!apps/web/**/*.d.ts',
    '!apps/web/.next/**',
    '!apps/web/node_modules/**',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/coverage/**',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },

  // Global timeout
  testTimeout: 30_000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,
};
