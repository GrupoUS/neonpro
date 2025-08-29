/**
 * Global Mock Setup for Integration Tests
 * Defines all global mocks used across integration tests
 */

import { vi } from "vitest";

// CPF Validator Mock
const mockCpfValidator = {
  isValid: vi.fn().mockReturnValue(true),
  format: vi.fn().mockImplementation((cpf: string) => cpf),
  clean: vi.fn().mockImplementation((cpf: string) => cpf.replace(/\D/g, "")),
};

// Supabase Client Mock
const mockSupabaseClient = {
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
const mockLgpdService = {
  validateConsent: vi.fn().mockReturnValue(true),
  logDataAccess: vi.fn().mockResolvedValue(true),
  checkDataRetention: vi.fn().mockReturnValue(true),
  anonymizeData: vi.fn().mockResolvedValue({}),
  generateConsentReport: vi.fn().mockResolvedValue({}),
};

// Notification Service Mock
const mockNotificationService = {
  sendEmergencyAlert: vi.fn().mockResolvedValue(true),
  notifyCompliance: vi.fn().mockResolvedValue(true),
  logNotification: vi.fn().mockResolvedValue({}),
};

// Compliance Service Mock
const mockComplianceService = {
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
  mockComplianceService,
  mockCpfValidator,
  mockLgpdService,
  mockNotificationService,
  mockSupabaseClient,
};
