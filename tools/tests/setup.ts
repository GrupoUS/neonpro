import { beforeAll, afterAll, vi } from "vitest";
import { config } from "dotenv";

// Load test environment variables
config({ path: ".env.test" });

// Mock the structured logging service
vi.mock("@neonpro/shared/services/structured-logging", () => ({
  default: vi.fn().mockImplementation(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    getCorrelationId: vi.fn().mockReturnValue("test-correlation-id"),
    setCorrelationId: vi.fn(),
    shutdown: vi.fn().mockResolvedValue(undefined),
  })),
  SimpleStructuredLogger: vi.fn().mockImplementation(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    getCorrelationId: vi.fn().mockReturnValue("test-correlation-id"),
    setCorrelationId: vi.fn(),
    shutdown: vi.fn().mockResolvedValue(undefined),
  })),
  winstonLogger: vi.fn().mockImplementation(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    getCorrelationId: vi.fn().mockReturnValue("test-correlation-id"),
    setCorrelationId: vi.fn(),
    shutdown: vi.fn().mockResolvedValue(undefined),
  })),
}));

// Mock the database audit service
vi.mock("@neonpro/database/services/audit.service", () => ({
  default: vi.fn().mockImplementation(() => ({
    logAuditEvent: vi.fn().mockResolvedValue(undefined),
    getAuditLogs: vi.fn().mockResolvedValue([]),
    createAuditTrail: vi.fn().mockResolvedValue({ id: "test-audit-id" }),
  })),
}));

// Setup global test configuration
beforeAll(() => {
  // Ensure test environment
  process.env.NODE_ENV = "test";
  process.env.TEST_MODE = "true";

  // Mock console.log in tests to reduce noise
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});

  console.log("Test setup completed");
});

afterAll(() => {
  // Cleanup after all tests
  console.log("Test cleanup completed");
});
