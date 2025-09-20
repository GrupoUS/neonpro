/**
 * @neonpro/tools-frontend-tests
 * Frontend testing utilities for React, E2E, Accessibility & Healthcare UI
 */

// Re-export shared utilities for convenience
export * from "@neonpro/tools-shared";

// Version information
export const FRONTEND_TESTING_VERSION = "1.0.0";
export const FRONTEND_TESTING_PACKAGE = "@neonpro/tools-frontend-tests";

// Default configurations
export const DEFAULT_FRONTEND_CONFIG = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setup.ts"],
  testMatch: ["**/__tests__/**/*.{ts,tsx}", "**/*.{test,spec}.{ts,tsx}"],
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
