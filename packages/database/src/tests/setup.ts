// Test setup for integration tests
import { beforeAll, afterAll } from "vitest";

// Mock environment variables for testing
process.env.SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_SERVICE_KEY = "test-service-key";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

// Global test setup
beforeAll(() => {
  // Initialize test environment
  console.log("🧪 Setting up integration test environment");
});

afterAll(() => {
  // Cleanup test environment
  console.log("🧹 Cleaning up integration test environment");
});

// Global test utilities
global.testUtils = {
  createMockPatient: () => ({
    clinicId: "test-clinic-id",
    medicalRecordNumber: `MRN-${Date.now()}`,
    givenNames: ["Test"],
    familyName: "Patient",
    fullName: "Test Patient",
    createdBy: "test-user",
    lgpdConsentGiven: true
  }),

  createMockConsentRequest: () => ({
    patientId: "test-patient-id",
    consentType: "DATA_PROCESSING" as const,
    purpose: "Healthcare treatment",
    dataTypes: ["medical_records", "personal_data"]
  }),

  createMockAppointment: () => ({
    clinicId: "test-clinic-id",
    patientId: "test-patient-id",
    professionalId: "test-professional-id",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    createdBy: "test-user"
  })
};