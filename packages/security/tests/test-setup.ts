/**
 * Test Setup for Security Logging Tests
 * Extends test setup with security-specific logging configurations
 */

import { vi } from "vitest";

// Mock console methods globally for all security tests
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
export const setupSecurityLoggingTests = () => {
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

// Security-specific test utilities
export const securityTestUtils = {
  // Check for SQL injection patterns in logs
  hasSqlInjectionPatterns: (output: string[][]) => {
    const sqlPatterns = [
      "DROP TABLE",
      "UNION SELECT",
      "OR 1=1",
      "--",
      "/*",
      "*/",
      "xp_cmdshell",
      "INSERT INTO",
      "UPDATE SET",
      "DELETE FROM",
      "SELECT * FROM",
      "WHERE",
      "ORDER BY",
      "GROUP BY",
      "HAVING",
    ];

    return output.some((log) =>
      sqlPatterns.some((pattern) =>
        JSON.stringify(log).toUpperCase().includes(pattern.toUpperCase()),
      ),
    );
  },

  // Check for XSS patterns in logs
  hasXssPatterns: (output: string[][]) => {
    const xssPatterns = [
      "<script>",
      "</script>",
      "javascript:",
      "onerror=",
      "onload=",
      "<img",
      "<iframe",
      "<svg",
      "alert(",
      "document.cookie",
      "window.location",
      "eval(",
      "expression(",
      "<style",
      "onclick=",
      "onmouseover=",
    ];

    return output.some((log) =>
      xssPatterns.some((pattern) =>
        JSON.stringify(log).toLowerCase().includes(pattern.toLowerCase()),
      ),
    );
  },

  // Check for CSRF token exposure
  hasCsrfTokenExposure: (output: string[][]) => {
    const csrfPatterns = [
      "csrf_token",
      "csrf-token",
      "csrfToken",
      "cross-site",
      "forgery",
      "token",
      "secret",
      "session_token",
      "authenticity_token",
    ];

    return output.some((log) =>
      csrfPatterns.some((pattern) =>
        JSON.stringify(log).toLowerCase().includes(pattern.toLowerCase()),
      ),
    );
  },

  // Check for file system path exposure
  hasFileSystemPaths: (output: string[][]) => {
    const pathPatterns = [
      "/var/www",
      "/home/",
      "/tmp/",
      "/etc/",
      "/usr/",
      "C:\\",
      "D:\\",
      "\\windows\\",
      "\\program files\\",
      "../../",
      "../",
      "wp-content",
      "uploads",
      "downloads",
    ];

    return output.some((log) =>
      pathPatterns.some((pattern) =>
        JSON.stringify(log).toLowerCase().includes(pattern.toLowerCase()),
      ),
    );
  },

  // Check for database connection details
  hasDatabaseCredentials: (output: string[][]) => {
    const dbPatterns = [
      "localhost",
      "127.0.0.1",
      "3306",
      "5432",
      "postgresql://",
      "mysql://",
      "mongodb://",
      "redis://",
      "password=",
      "user=",
      "host=",
      "port=",
      "database=",
      "schema=",
    ];

    return output.some((log) =>
      dbPatterns.some((pattern) =>
        JSON.stringify(log).toLowerCase().includes(pattern.toLowerCase()),
      ),
    );
  },

  // Check for IP address exposure
  hasIpAddressExposure: (output: string[][]) => {
    const ipPatterns = [
      "\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b", // IPv4
      "([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}", // IPv6
      "192\\.168\\.",
      "10\\.",
      "172\\.1[6-9]\\.",
      "172\\.2[0-9]\\.",
      "172\\.3[01]\\.",
      "127\\.0\\.0\\.1",
    ];

    return output.some((log) => {
      const logStr = JSON.stringify(log);
      return ipPatterns.some((pattern) => {
        const regex = new RegExp(pattern);
        return regex.test(logStr);
      });
    });
  },

  // Check for encryption key exposure
  hasEncryptionKeyExposure: (output: string[][]) => {
    const encryptionPatterns = [
      "private_key",
      "public_key",
      "secret_key",
      "encryption_key",
      "aes",
      "rsa",
      "sha256",
      "sha512",
      "bcrypt",
      "scrypt",
      "pbkdf2",
      "certificate",
      "ssl",
      "tls",
      "pem",
      "crt",
      "key",
    ];

    return output.some((log) =>
      encryptionPatterns.some((pattern) =>
        JSON.stringify(log).toLowerCase().includes(pattern.toLowerCase()),
      ),
    );
  },

  // Check for rate limiting configuration exposure
  hasRateLimitConfigExposure: (output: string[][]) => {
    const rateLimitPatterns = [
      "rate_limit",
      "max_requests",
      "window",
      "ban_duration",
      "redis",
      "cache",
      "throttle",
      "limit",
      "quota",
      "capacity",
      "burst",
    ];

    return output.some((log) =>
      rateLimitPatterns.some((pattern) =>
        JSON.stringify(log).toLowerCase().includes(pattern.toLowerCase()),
      ),
    );
  },

  // Check for security breach details
  hasBreachDetails: (output: string[][]) => {
    const breachPatterns = [
      "breach",
      "hack",
      "attack",
      "vulnerability",
      "exploit",
      "compromise",
      "unauthorized",
      "intrusion",
      "malware",
      "virus",
      "trojan",
      "ransomware",
      "phishing",
      "data_leak",
      "security_incident",
    ];

    return output.some((log) =>
      breachPatterns.some((pattern) =>
        JSON.stringify(log).toLowerCase().includes(pattern.toLowerCase()),
      ),
    );
  },

  // Check for structured security logging
  hasStructuredSecurityLogging: (output: string[][]) => {
    const requiredFields = [
      "eventType",
      "severity",
      "timestamp",
      "sourceIp",
      "userAgent",
      "resource",
      "action",
      "outcome",
      "metadata",
    ];

    return output.some((call) => {
      const logStr = JSON.stringify(call);
      return requiredFields.some((field) => logStr.includes(field));
    });
  },

  // Check for firewall/network configuration
  hasNetworkConfigExposure: (output: string[][]) => {
    const networkPatterns = [
      "firewall",
      "security_group",
      "vpc",
      "subnet",
      "gateway",
      "router",
      "switch",
      "load_balancer",
      "cdn",
      "dns",
      "proxy",
      "nat",
      "vpn",
      "ssl termination",
    ];

    return output.some((log) =>
      networkPatterns.some((pattern) =>
        JSON.stringify(log).toLowerCase().includes(pattern.toLowerCase()),
      ),
    );
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
