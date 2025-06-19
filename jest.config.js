/**
 * Jest Configuration for NEONPRO Testing Suite
 * GRUPO US VIBECODE SYSTEM V5.0 - Phase 8 Production Monitoring
 *
 * Comprehensive testing configuration for monitoring components
 * Supports unit tests, integration tests, and coverage reporting
 */

const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Test environment
  testEnvironment: "jsdom",

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],

  // Module name mapping for path aliases
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/components/(.*)$": "<rootDir>/src/components/$1",
    "^@/lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@/app/(.*)$": "<rootDir>/src/app/$1",
  },

  // Test file patterns
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
  ],

  // Files to ignore
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/e2e/",
  ],

  // Transform configuration
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Coverage configuration
  collectCoverageFrom: [
    "src/components/**/*.{ts,tsx}",
    "src/lib/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
    "!src/**/*.config.{ts,tsx}",
    "!src/**/index.{ts,tsx}",
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    "./src/components/auth/": {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    "./src/components/monitoring/": {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },

  // Coverage reporters
  coverageReporters: ["text", "lcov", "html", "json-summary"],

  // Coverage directory
  coverageDirectory: "coverage",

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Test timeout
  testTimeout: 10000,

  // Global setup and teardown
  globalSetup: undefined,
  globalTeardown: undefined,

  // Mock configuration
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // Mock static assets
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/src/test/__mocks__/fileMock.js",
  },

  // Environment variables for testing
  setupFiles: ["<rootDir>/src/test/env.setup.js"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
