// Integration Test Setup and Configuration
// Centralized setup for all integration tests in NeonPro Healthcare

import { QueryClient } from "@tanstack/react-query";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";

// Global test configuration
export const TEST_CONFIG = {
  database: {
    test_database_url: process.env.TEST_DATABASE_URL
      || "postgresql://test:test@localhost:5432/neonpro_test",
    connection_timeout: 10_000,
    query_timeout: 5000,
  },
  supabase: {
    test_project_url: process.env.TEST_SUPABASE_URL || "http://mock-supabase-server",
    test_anon_key: process.env.TEST_SUPABASE_ANON_KEY || "mock-anon-key",
    test_service_role_key: process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || "mock-service-key",
  },
  api: {
    test_api_base_url: process.env.TEST_API_BASE_URL || "http://mock-api-server",
    request_timeout: 10_000,
    retry_attempts: 3,
  },
  // Mock mode configuration - Always use mocks for integration tests
  mock_mode: {
    enabled: true, // Always use mock mode for integration tests
    supabase_mock: true,
    api_mock: true,
  },
  performance: {
    api_response_threshold_ms: 500,
    database_query_threshold_ms: 100,
    realtime_latency_threshold_ms: 200,
  },
  compliance: {
    audit_trail_required: true,
    lgpd_validation_enabled: true,
    emergency_access_logging: true,
  },
};

// Test data factory for consistent test data
// TODO: Convert to standalone functions
export class TestDataFactory {
  static createMockPatient(overrides: Partial<any> = {}) {
    return {
      id: `test-patient-${Date.now()}`,
      name: "João Silva Santos",
      cpf: "123.456.789-00",
      email: "joao.test@email.com",
      phone: "(11) 99999-9999",
      birth_date: "1985-03-15",
      gender: "male",
      clinic_id: "test-clinic-1",
      lgpd_consent: true,
      lgpd_consent_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    };
  }

  static createMockDoctor(overrides: Partial<any> = {}) {
    return {
      id: `test-doctor-${Date.now()}`,
      name: "Dr. Maria Silva",
      email: "dra.maria.test@clinic.com",
      crm: "CRM-SP-123456",
      specialty: "Cardiologia",
      clinic_id: "test-clinic-1",
      role: "doctor",
      emergency_qualified: true,
      ...overrides,
    };
  }

  static createMockAppointment(overrides: Partial<any> = {}) {
    return {
      id: `test-appointment-${Date.now()}`,
      patient_id: "test-patient-123",
      doctor_id: "test-doctor-456",
      scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      duration: 30,
      status: "scheduled",
      clinic_id: "test-clinic-1",
      ...overrides,
    };
  }

  static createMockEmergencyAccess(overrides: Partial<any> = {}) {
    return {
      id: `test-emergency-${Date.now()}`,
      patient_id: "test-patient-123",
      requesting_user_id: "test-nurse-789",
      emergency_type: "cardiac_arrest",
      justification: "Test emergency access for cardiac arrest simulation",
      location: "Test Emergency Room",
      priority: "critical",
      status: "approved",
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      ...overrides,
    };
  }
}

// Query Client factory for tests
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Database cleanup utilities
// TODO: Convert to standalone functions
export class TestDatabaseCleanup {
  static async cleanupTestData() {
    // In real implementation, this would:
    // 1. Delete test patients
    // 2. Delete test appointments
    // 3. Delete test audit logs
    // 4. Reset sequences
    // 5. Clear cache
  }

  static async seedTestData() {
    // In real implementation, this would:
    // 1. Create test clinics
    // 2. Create test users
    // 3. Create sample patients
    // 4. Set up test permissions
  }
} // Performance monitoring utilities
export class TestPerformanceMonitor {
  private static measurements: Map<string, number[]> = new Map();

  static startMeasurement(testName: string): () => number {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (!TestPerformanceMonitor.measurements.has(testName)) {
        TestPerformanceMonitor.measurements.set(testName, []);
      }

      TestPerformanceMonitor.measurements.get(testName)?.push(duration);
      return duration;
    };
  }

  static getAverageTime(testName: string): number {
    const times = TestPerformanceMonitor.measurements.get(testName) || [];
    return times.length > 0
      ? times.reduce((a, b) => a + b, 0) / times.length
      : 0;
  }

  static validatePerformance(testName: string, thresholdMs: number): boolean {
    const avgTime = TestPerformanceMonitor.getAverageTime(testName);
    return avgTime <= thresholdMs;
  }

  static generatePerformanceReport(): string {
    let report = "## Integration Tests Performance Report\n\n";

    for (const [testName, times] of TestPerformanceMonitor.measurements) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);

      report += `### ${testName}\n`;
      report += `- Average: ${avg.toFixed(2)}ms\n`;
      report += `- Min: ${min.toFixed(2)}ms\n`;
      report += `- Max: ${max.toFixed(2)}ms\n`;
      report += `- Executions: ${times.length}\n\n`;
    }

    return report;
  }
}

// LGPD compliance testing utilities
// TODO: Convert to standalone functions
export class TestLGPDCompliance {
  static validateConsentRequirement(testData: unknown): boolean {
    return (
      (testData as any).lgpd_consent === true && (testData as any).lgpd_consent_date !== undefined
    );
  }

  static validateDataMinimization(
    requestedData: string[],
    actualData: unknown,
  ): boolean {
    const actualKeys = Object.keys(actualData as Record<string, unknown>);
    return requestedData.every((field) => actualKeys.includes(field));
  }

  static validateAuditTrail(_operation: string, auditEntry: unknown): boolean {
    const requiredFields = [
      "user_id",
      "timestamp",
      "action",
      "resource",
      "legal_basis",
    ];
    return requiredFields.every((field) => (auditEntry as any)[field] !== undefined);
  }

  static mockCPFValidation(cpf: string): { valid: boolean; formatted: string; } {
    // Mock CPF validation for testing
    const cleanCpf = cpf.replaceAll(/[^\d]/g, "");
    const isValid = cleanCpf.length === 11 && cleanCpf !== "00000000000";

    const formatted = cleanCpf.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1.$2.$3-$4",
    );

    return { valid: isValid, formatted };
  }
}

// Emergency access testing utilities
// TODO: Convert to standalone functions
export class TestEmergencyAccess {
  static validateEmergencyJustification(
    emergencyType: string,
    justification: string,
  ): boolean {
    const criticalTypes = ["cardiac_arrest", "trauma", "overdose"];
    const isCritical = criticalTypes.includes(emergencyType);
    const hasValidJustification = justification.length > 20; // Minimum explanation

    return isCritical || hasValidJustification;
  }

  static calculateEmergencyResponseTime(
    startTime: number,
    endTime: number,
  ): {
    responseTime: number;
    meetsRequirement: boolean;
  } {
    const responseTime = endTime - startTime;
    const meetsRequirement = responseTime <= 10_000; // 10 seconds max

    return { responseTime, meetsRequirement };
  }

  static mockEmergencyNotification(recipients: string[]): {
    sent: boolean;
    deliveryStatus: Record<string, boolean>;
  } {
    const deliveryStatus: Record<string, boolean> = {};

    recipients.forEach((recipient) => {
      deliveryStatus[recipient] = Math.random() > 0.1; // 90% delivery success rate
    });

    const allDelivered = Object.values(deliveryStatus).every(
      (delivered) => delivered,
    );

    return {
      sent: allDelivered,
      deliveryStatus,
    };
  }
}

// Healthcare-specific test utilities
// TODO: Convert to standalone functions
export class TestHealthcareUtilities {
  static mockBrazilianHealthcareData() {
    return {
      states: ["SP", "RJ", "MG", "RS", "PR", "SC", "BA", "GO"],
      specialties: [
        "Cardiologia",
        "Neurologia",
        "Ortopedia",
        "Pediatria",
        "Ginecologia",
        "Psiquiatria",
        "Dermatologia",
        "Endocrinologia",
      ],
      councils: [
        { name: "CRM", full_name: "Conselho Regional de Medicina" },
        { name: "COREN", full_name: "Conselho Regional de Enfermagem" },
        { name: "CRF", full_name: "Conselho Regional de Farmácia" },
        { name: "CREFITO", full_name: "Conselho Regional de Fisioterapia" },
      ],
      controlledMedications: [
        { name: "Rivotril", class: "B1", anvisa_code: "1234567890123" },
        { name: "Ritalina", class: "A3", anvisa_code: "2345678901234" },
        { name: "Morfina", class: "A1", anvisa_code: "3456789012345" },
      ],
    };
  }

  static generateMockCRM(state = "SP"): string {
    const number = Math.floor(Math.random() * 900_000) + 100_000;
    return `CRM-${state}-${number}`;
  }

  static validateProfessionalRegistration(crm: string): {
    valid: boolean;
    state: string;
    number: string;
  } {
    const crmPattern = /^CRM-([A-Z]{2})-(\d{6})$/;
    const match = crm.match(crmPattern);

    if (!match) {
      return { valid: false, state: "", number: "" };
    }

    return {
      valid: true,
      state: match[1],
      number: match[2],
    };
  }
}

// Global test setup and teardown
export function setupIntegrationTests() {
  beforeAll(async () => {
    await TestDatabaseCleanup.seedTestData();
  });

  afterAll(async () => {
    await TestDatabaseCleanup.cleanupTestData();

    // Generate performance report
  });

  beforeEach(() => {
    // Reset any global state if needed
  });

  afterEach(() => {
    // Clean up individual test state
  });
}

// Export all utilities for easy importing in tests
export default {
  TEST_CONFIG,
  TestDataFactory,
  TestPerformanceMonitor,
  TestLGPDCompliance,
  TestEmergencyAccess,
  TestHealthcareUtilities,
  createTestQueryClient,
  setupIntegrationTests,
};
