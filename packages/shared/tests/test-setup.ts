/**
 * Test Setup for Authentication Logging Tests
 * Extends test setup with authentication-specific logging configurations
 */

import { vi } from "vitest";

// Mock console methods globally for all authentication tests
const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
const mockConsoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
const mockConsoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});

// Store original console methods for restoration
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
};

// Test environment setup
export const setupAuthLoggingTests = () => {
  // Clear all mock calls before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Restore original console methods after all tests
  afterEach(() => {
    vi.restoreAllMocks();
  });

  return {
    mockConsoleLog,
    mockConsoleError,
    mockConsoleWarn,
    mockConsoleInfo,
    originalConsole,
  };
};

// Authentication-specific test utilities
export const authTestUtils = {
  // Check for token exposure in logs
  hasTokenExposure: (output: string[][]) => {
    const tokenPatterns = [
      "eyJ", // JWT header
      "sk-", // API keys
      "Bearer", // Bearer tokens
      "token", // Generic token references
      "secret", // Secret references
      "auth", // Auth references
      "credential", // Credential references
      "key", // Key references
      "password", // Password references
      "session", // Session references
      "csrf", // CSRF references
      "oauth", // OAuth references
      "refresh", // Refresh tokens
      "access", // Access tokens
    ];

    return output.some((log) =>
      tokenPatterns.some((pattern) =>
        JSON.stringify(log).toLowerCase().includes(pattern.toLowerCase()),
      ),
    );
  },

  // Check for PII in authentication logs
  hasAuthPii: (output: string[][]) => {
    const piiPatterns = [
      // Email patterns
      "@",
      ".com",
      ".br",
      // Phone patterns
      "+55",
      "11",
      "21",
      // CPF patterns
      "\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}",
      // RG patterns
      "\\d{2}\\.\\d{3}\\.\\d{3}-\\d{1}",
    ];

    return output.some((log) =>
      piiPatterns.some((pattern) => {
        const regex = new RegExp(pattern);
        return output.some((call) => regex.test(JSON.stringify(call)));
      }),
    );
  },

  // Check for structured authentication logging
  hasStructuredAuthLogging: (output: string[][]) => {
    const requiredFields = [
      "eventType",
      "timestamp",
      "authMethod",
      "success",
      "metadata",
    ];

    return output.some((call) => {
      const logStr = JSON.stringify(call);
      return requiredFields.some((field) => logStr.includes(field));
    });
  },

  // Check for authentication-specific metadata
  hasAuthMetadata: (output: string[][]) => {
    const metadataFields = [
      "ipAddress",
      "userAgent",
      "deviceId",
      "location",
      "mfaUsed",
      "authProvider",
    ];

    return output.some((call) => {
      const logStr = JSON.stringify(call);
      return metadataFields.some((field) => logStr.includes(field));
    });
  },

  getConsoleOutput: () => ({
    logs: mockConsoleLog.mock.calls,
    errors: mockConsoleError.mock.calls,
    warnings: mockConsoleWarn.mock.calls,
    info: mockConsoleInfo.mock.calls,
  }),

  resetConsoleMocks: () => {
    mockConsoleLog.mockReset();
    mockConsoleError.mockReset();
    mockConsoleWarn.mockReset();
    mockConsoleInfo.mockReset();
  },
};
