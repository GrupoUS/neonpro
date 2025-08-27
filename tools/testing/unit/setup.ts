// Main Healthcare Testing Setup for NeonPro
// Consolidated setup for all healthcare compliance testing

import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { setupSupabaseMock } from "./setup/supabase-mock";
import { setupHealthcareEnvironment, teardownHealthcareEnvironment } from "./setup/test-env";

// Global test setup - runs once before all tests
beforeAll(async () => {
  // Setup healthcare test environment
  await setupHealthcareEnvironment();

  // Setup Supabase mocks with healthcare data
  await setupSupabaseMock();
});

// Global test teardown - runs once after all tests
afterAll(async () => {
  // Teardown healthcare test environment
  await teardownHealthcareEnvironment();
});

// Test setup - runs before each test
beforeEach(() => {});

// Test teardown - runs after each test
afterEach(() => {});

// Healthcare-specific test utilities
export const healthcareTestUtils = {
  // LGPD compliance test helpers
  lgpd: {
    createTestPatient: () => ({
      id: "test-patient-id",
      name: "Test Patient",
      cpf: "000.000.000-00",
      consent_given: true,
      data_processing_consent: new Date().toISOString(),
    }),
    validateDataProtection: (data: unknown) => {
      // Validate LGPD compliance in test data
      return data.consent_given === true;
    },
  },

  // ANVISA compliance test helpers
  anvisa: {
    createTestDevice: () => ({
      id: "test-device-id",
      name: "Test Medical Device",
      anvisa_registration: "TEST-REG-001",
      status: "approved",
      validation_date: new Date().toISOString(),
    }),
    validateDeviceCompliance: (device: unknown) => {
      // Validate ANVISA device compliance
      return device.anvisa_registration && device.status === "approved";
    },
  },

  // CFM compliance test helpers
  cfm: {
    createTestProfessional: () => ({
      id: "test-prof-id",
      name: "Dr. Test Professional",
      cfm_license: "CRM-TEST-001",
      specialty: "Test Specialty",
      status: "active",
      validation_date: new Date().toISOString(),
    }),
    validateProfessionalCompliance: (professional: unknown) => {
      // Validate CFM professional compliance
      return professional.cfm_license && professional.status === "active";
    },
  },
};

// Export test configuration
export const testConfig = {
  timeout: 10_000, // 10 seconds default timeout
  retries: 2, // Retry flaky tests twice
  bail: false, // Don't stop on first failure
  coverage: {
    threshold: {
      global: {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90,
      },
      // Higher threshold for healthcare-critical modules
      "packages/compliance/**": {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95,
      },
      "packages/security/**": {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95,
      },
    },
  },
};
