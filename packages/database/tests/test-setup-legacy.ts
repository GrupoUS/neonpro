/**
 * Legacy Test Setup for Database Logging Tests
 * @deprecated Use test-setup.ts instead
 */

import { vi } from "vitest";

// Mock console methods globally for all database tests
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
export const setupLoggingTests = () => {
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

// Export test utilities
export const testUtils = {
  getConsoleOutput: () => ({
    logs: mockConsoleLog.mock.calls,
    errors: mockConsoleError.mock.calls,
    warnings: mockConsoleWarn.mock.calls,
    info: mockConsoleInfo.mock.calls,
  }),

  hasSensitiveData: (output: string[], sensitivePatterns: string[]) => {
    return output.some((log) =>
      sensitivePatterns.some((pattern) =>
        JSON.stringify(log).includes(pattern),
      ),
    );
  },

  hasStructuredLogging: (output: string[][]) => {
    return output.some((call) => {
      const logStr = JSON.stringify(call);
      return (
        logStr.includes("correlationId") ||
        logStr.includes("timestamp") ||
        logStr.includes("level") ||
        logStr.includes("structured")
      );
    });
  },

  resetConsoleMocks: () => {
    mockConsoleLog.mockReset();
    mockConsoleError.mockReset();
    mockConsoleWarn.mockReset();
    mockConsoleInfo.mockReset();
  },
};
