/**
 * Global Mock Setup for Integration Tests
 * Defines all global mocks used across integration tests
 */

import { vi } from "vitest";
import type { MockedFunction } from "vitest";

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

// Simplified and Working Supabase Client Mock
const createSupabaseMockResponse = (data: any, error: any = null) => {
  return Promise.resolve({ data, error });
};

// Track inserted data to simulate database state
const insertedRecords = new Map<string, any[]>();

// Helper functions to control mock behavior
const setMockError = (error: any) => {
  // Not used in simplified version
};

const clearMockError = () => {
  // Not used in simplified version
};

const resetMockData = () => {
  insertedRecords.clear();
};

const createMockQueryBuilder = () => {
  let insertedData: any = null;
  let hasSelectAfterInsert = false;
  let shouldError = false;

  const mockBuilder = {
    select: vi.fn().mockImplementation(() => {
      hasSelectAfterInsert = true;

      // If this is a select-only operation (no insert), return stored data
      if (!insertedData) {
        const tableName = (mockBuilder as any).currentTable || "default";
        const storedRecords = insertedRecords.get(tableName) || [];
        insertedData = storedRecords.slice(0, 10); // Return up to 10 records for queries
      }

      return mockBuilder;
    }),
    insert: vi.fn().mockImplementation((data) => {
      insertedData = Array.isArray(data) ? data : [data];

      // Add IDs to inserted data if missing and add timestamps
      insertedData = insertedData.map((item: any) => ({
        ...item,
        id: item.id || `test-id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
        expires_at: item.expires_at || new Date(Date.now() + 3_600_000).toISOString(), // 1 hour from now
      }));

      // Check for duplicate key scenario by checking existing records
      const tableName = (mockBuilder as any).currentTable || "default";
      const existingRecords = insertedRecords.get(tableName) || [];
      const hasDuplicate = insertedData.some((newItem: any) =>
        existingRecords.some((existing: any) =>
          existing.name && newItem.name && existing.name === newItem.name
        )
      );

      if (hasDuplicate) {
        shouldError = true;
      } else {
        // Store the records for future duplicate checking
        const updatedRecords = [...existingRecords, ...insertedData];
        insertedRecords.set(tableName, updatedRecords);
      }

      return mockBuilder;
    }),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    rangeGt: vi.fn().mockReturnThis(),
    rangeGte: vi.fn().mockReturnThis(),
    rangeLt: vi.fn().mockReturnThis(),
    rangeLte: vi.fn().mockReturnThis(),
    rangeAdjacent: vi.fn().mockReturnThis(),
    overlaps: vi.fn().mockReturnThis(),
    textSearch: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    abortSignal: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => {
      if (shouldError) {
        return createSupabaseMockResponse(null, {
          message: "duplicate key value violates unique constraint",
          code: "23505",
        });
      }

      const data = insertedData && insertedData.length > 0 ? insertedData[0] : { id: "test-id" };
      return createSupabaseMockResponse(data, null);
    }),
    maybeSingle: vi.fn().mockImplementation(() => createSupabaseMockResponse(null, null)),
    csv: vi.fn().mockImplementation(() => createSupabaseMockResponse("", null)),
    geojson: vi.fn().mockImplementation(() => createSupabaseMockResponse(null, null)),
    explain: vi.fn().mockImplementation(() => createSupabaseMockResponse(null, null)),
    rollback: vi.fn().mockImplementation(() => createSupabaseMockResponse(null, null)),
    returns: vi.fn().mockReturnThis(),
  };

  // Add promise-like behavior for direct awaiting
  (mockBuilder as any).then = function(onResolve: any, onReject?: any) {
    if (shouldError) {
      const result = {
        data: null,
        error: { message: "duplicate key value violates unique constraint", code: "23505" },
      };
      return Promise.resolve(result).then(onResolve, onReject);
    }

    // Return appropriate data based on the last operation
    let resultData = insertedData;

    // For select operations after insert, return the inserted data as array
    if (hasSelectAfterInsert && insertedData) {
      resultData = Array.isArray(insertedData) ? insertedData : [insertedData];
    } // For select operations without insert, return empty array
    else if (hasSelectAfterInsert && !insertedData) {
      resultData = [];
    }

    const result = { data: resultData, error: null };
    return Promise.resolve(result).then(onResolve, onReject);
  };

  return mockBuilder;
};

const mockSupabaseClient: {
  from: MockedFunction<any>;
  auth: {
    getUser: MockedFunction<any>;
    signInWithPassword: MockedFunction<any>;
    signOut: MockedFunction<any>;
  };
  channel: MockedFunction<any>;
  rpc: MockedFunction<any>;
  storage: {
    from: MockedFunction<any>;
  };
} = {
  from: vi.fn().mockImplementation((tableName: string) => {
    const builder = createMockQueryBuilder();
    // Set the current table for the builder
    (builder as any).currentTable = tableName;
    return builder;
  }),
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
  rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: null, error: null }),
      download: vi.fn().mockResolvedValue({ data: null, error: null }),
      remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      list: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  },
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
  clearMockError,
  mockComplianceService,
  mockCpfValidator,
  mockLgpdService,
  mockNotificationService,
  mockSupabaseClient,
  resetMockData,
  setMockError,
};