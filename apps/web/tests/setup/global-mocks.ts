/**
 * Global Mock Setup for Integration Tests
 * Defines all global mocks used across integration tests
 */

import { vi, type MockedFunction } from "vitest";

// CPF Validator Mock
const mockCpfValidator: {
  isValid: MockedFunction<any>;
  format: MockedFunction<any>;
  clean: MockedFunction<any>;
} = {
  isValid: vi.fn().mockReturnValue(true),
  format: vi.fn().mockImplementation((cpf: string) => cpf),
  clean: vi.fn().mockImplementation((cpf: string) => cpf.replace(/\D/g, "")),
};

// Supabase Client Mock
const mockSupabaseClient: {
  from: MockedFunction<any>;
  select: MockedFunction<any>;
  insert: MockedFunction<any>;
  update: MockedFunction<any>;
  delete: MockedFunction<any>;
  eq: MockedFunction<any>;
  single: MockedFunction<any>;
  auth: {
    getUser: MockedFunction<any>;
    signInWithPassword: MockedFunction<any>;
    signOut: MockedFunction<any>;
  };
  channel: MockedFunction<any>;
} = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  channel: vi.fn().mockReturnValue({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn().mockReturnThis(),
  }),
};

// LGPD Service Mock
const mockLgpdService: {
  validateConsent: MockedFunction<any>;
  logDataAccess: MockedFunction<any>;
  checkDataRetention: MockedFunction<any>;
  anonymizeData: MockedFunction<any>;
  generateConsentReport: MockedFunction<any>;
} = {
  validateConsent: vi.fn().mockReturnValue(true),
  logDataAccess: vi.fn().mockResolvedValue(true),
  checkDataRetention: vi.fn().mockReturnValue(true),
  anonymizeData: vi.fn().mockResolvedValue({}),
  generateConsentReport: vi.fn().mockResolvedValue({}),
};

// Notification Service Mock
const mockNotificationService: {
  sendEmergencyAlert: MockedFunction<any>;
  notifyCompliance: MockedFunction<any>;
  logNotification: MockedFunction<any>;
  notifyMedicalStaff: MockedFunction<any>;
  logEmergencyNotification: MockedFunction<any>;
} = {
  sendEmergencyAlert: vi.fn().mockResolvedValue({
    alert_sent: true,
    recipients: ["emergency_supervisor", "head_doctor", "security"],
    alert_id: "emergency-alert-123",
  }),
  notifyCompliance: vi.fn().mockResolvedValue(true),
  logNotification: vi.fn().mockResolvedValue({}),
  notifyMedicalStaff: vi.fn().mockResolvedValue({
    notification_sent: true,
    staff_notified: ["doctor_on_call", "head_nurse"],
    notification_id: "staff-notification-123",
  }),
  logEmergencyNotification: vi.fn().mockResolvedValue({
    log_created: true,
    log_id: "emergency-log-123",
    timestamp: new Date().toISOString(),
  }),
};

// Compliance Service Mock
const mockComplianceService: {
  validateCompliance: MockedFunction<any>;
  logComplianceEvent: MockedFunction<any>;
  checkRequirements: MockedFunction<any>;
  generateReport: MockedFunction<any>;
} = {
  validateCompliance: vi.fn().mockReturnValue(true),
  logComplianceEvent: vi.fn().mockResolvedValue({}),
  checkRequirements: vi.fn().mockReturnValue([]),
  generateReport: vi.fn().mockResolvedValue({}),
};

// Assign to globalThis for access in tests
(globalThis as any).mockCpfValidator = mockCpfValidator;
(globalThis as any).mockSupabaseClient = mockSupabaseClient;
(globalThis as any).mockLgpdService = mockLgpdService;
(globalThis as any).mockNotificationService = mockNotificationService;
(globalThis as any).mockComplianceService = mockComplianceService;

// Export for direct imports if needed
export {
  mockCpfValidator,
  mockSupabaseClient,
  mockLgpdService,
  mockNotificationService,
  mockComplianceService,
};