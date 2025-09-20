/**
 * Test Fixtures and Mocks
 *
 * Consolidated test fixtures and mocks for the entire NeonPro project.
 * Provides realistic test data while ensuring healthcare compliance.
 */

export * from "./api-handlers";
export * from "./healthcare-data";
export * from "./mock-services";
export * from "./user-data";

// Common test data patterns
export const TEST_IDS = {
  USER: "test-user-123",
  CLINIC: "test-clinic-456",
  PATIENT: "test-patient-789",
  PROFESSIONAL: "test-professional-101",
} as const;

export const TEST_DATES = {
  PAST: new Date("2023-01-01"),
  PRESENT: new Date(),
  FUTURE: new Date("2025-12-31"),
} as const;

// Mock environment variables for testing
export const TEST_ENV = {
  SUPABASE_URL: "http://localhost:54321",
  SUPABASE_ANON_KEY: "test-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-key",
  NODE_ENV: "test",
  LGPD_COMPLIANCE_KEY: "test-compliance-key",
} as const;
