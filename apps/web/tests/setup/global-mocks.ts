/**
 * Global Mock Setup for Integration Tests
 * Defines all global mocks used across integration tests
 */

import { vi } from "vitest";
import type { MockedFunction } from "vitest";

// CPF Validator Mock
const mockCpfValidator: {
  isValid: MockedFunction<unknown>;
  format: MockedFunction<unknown>;
  clean: MockedFunction<unknown>;
} = {
  isValid: vi.fn().mockReturnValue(true),
  format: vi.fn().mockImplementation((cpf: string) => cpf),
  clean: vi.fn().mockImplementation((cpf: string) => cpf.replace(/\D/g, "")),
};

// Simplified and Working Supabase Client Mock
const createSupabaseMockResponse = (data: unknown, error: unknown = null) => {
  return Promise.resolve({ data, error });
};

// Track inserted data to simulate database state
const insertedRecords = new Map<string, Record<string, unknown>[]>();

// Helper functions to control mock behavior
const setMockError = (_error: unknown) => {
  // Not used in simplified version
};

const clearMockError = () => {
  // Not used in simplified version
};

const resetMockData = () => {
  insertedRecords.clear();
};

const createMockQueryBuilder = () => {
  let insertedData: Record<string, unknown>[] | null = null;
  let hasSelectAfterInsert = false;
  let shouldError = false;

  const mockBuilder = {
    select: vi.fn().mockImplementation(() => {
      hasSelectAfterInsert = true;

      // If this is a select-only operation (no insert), return stored data
      if (!insertedData) {
        const tableName = (mockBuilder as unknown).currentTable || "default";
        const storedRecords = insertedRecords.get(tableName) || [];
        insertedData = storedRecords.slice(0, 10); // Return up to 10 records for queries
      }

      return mockBuilder;
    }),
    upsert: vi.fn().mockImplementation((data) => {
      const tableName = (mockBuilder as unknown).currentTable || "default";
      const existing = insertedRecords.get(tableName) || [];
      const incoming = Array.isArray(data) ? data : [data];
      const merged: Record<string, unknown>[] = [...existing];
      for (const item of incoming) {
        const keyName: "id" | "name" = (item as unknown).id != null ? "id" : "name";
        const keyValue = (item as unknown)[keyName];
        const idx = merged.findIndex((r) => (r as unknown)[keyName] === keyValue);
        if (idx >= 0) {
          merged[idx] = { ...merged[idx], ...item };
        } else {
          merged.push(item as unknown);
        }
      }
      insertedRecords.set(tableName, merged);
      insertedData = incoming as unknown;
      return mockBuilder;
    }),
    insert: vi.fn().mockImplementation((data) => {
      insertedData = Array.isArray(data) ? data : [data];

      // Add IDs to inserted data if missing and add timestamps
      insertedData = insertedData.map((item: Record<string, unknown>) => ({
        ...item,
        id: item.id || `test-id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
        expires_at: item.expires_at || new Date(Date.now() + 3_600_000).toISOString(), // 1 hour from now
      }));

      // Check for duplicate key scenario by checking existing records
      const tableName = (mockBuilder as unknown).currentTable || "default";
      const existingRecords = insertedRecords.get(tableName) || [];
      const hasDuplicate = insertedData.some((newItem: Record<string, unknown>) =>
        existingRecords.some((existing: Record<string, unknown>) =>
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
    delete: vi.fn().mockImplementation(() => {
      (mockBuilder as unknown)._deleteMode = true;
      return mockBuilder;
    }),
    // Allow chained filters after delete or select (e.g., .delete().in("id", ids) or .select().in(...))
    in: vi.fn().mockImplementation((col: string, values: unknown[]) => {
      (mockBuilder as unknown)._in = { col, values };
      return mockBuilder;
    }),
    inList: vi.fn().mockImplementation((col: string, values: unknown[]) => {
      (mockBuilder as unknown)._in = { col, values };
      return mockBuilder;
    }),
    eq: vi.fn().mockImplementation((col: string, val: unknown) => {
      // Track eq filters for later evaluation and basic RLS simulation
      (mockBuilder as unknown)._eqs = [...((mockBuilder as unknown)._eqs ?? []), { col, val }];
      // Simulate RLS denial when accessing different user/tenant in tests
      if (col === "user_id" && String(val).includes("different-user")) {
        (mockBuilder as unknown)._rlsDenied = true;
      }
      if (col === "clinic_id" && /other|tenant[-_]b/i.test(String(val))) {
        (mockBuilder as unknown)._rlsDenied = true;
      }
      return mockBuilder;
    }),
    neq: vi.fn().mockImplementation(() => mockBuilder),
    gt: vi.fn().mockImplementation(() => mockBuilder),
    gte: vi.fn().mockImplementation(() => mockBuilder),
    lt: vi.fn().mockImplementation(() => mockBuilder),
    lte: vi.fn().mockImplementation(() => mockBuilder),
    like: vi.fn().mockImplementation((col: string, pattern: string) => {
      (mockBuilder as unknown)._like = { col, pattern };
      return mockBuilder;
    }),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    // NOTE: duplicate in removed; single definition lives above
    // in: vi.fn().mockImplementation((col: string, values: unknown[]) => {
    //   (mockBuilder as unknown)._in = { col, values };
    //   return mockBuilder;
    // }),
    contains: vi.fn().mockImplementation((col: string, arr: unknown[]) => {
      (mockBuilder as unknown)._contains = { col, arr };
      return mockBuilder;
    }),
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
    and: vi.fn().mockReturnThis(),
    abortSignal: vi.fn().mockReturnThis(),
    // Allow repeated eq chaining: return self
    eqAgain: vi.fn().mockImplementation((col: string, val: unknown) => mockBuilder.eq(col, val)),
    maybeSingle: vi.fn().mockImplementation(() => {
      (mockBuilder as unknown)._maybeSingle = true;
      return mockBuilder;
    }),
    single: vi.fn().mockImplementation(() => {
      if (shouldError || (mockBuilder as unknown)._rlsDenied) {
        return createSupabaseMockResponse(null, {
          message: (mockBuilder as unknown)._rlsDenied
            ? "permission denied"
            : "duplicate key value violates unique constraint",
          code: (mockBuilder as unknown)._rlsDenied ? "42501" : "23505",
        });
      }

      const tableName = (mockBuilder as unknown as unknown).currentTable || "default";
      const store = insertedRecords.get(tableName) || [];
      const data = insertedData && insertedData.length > 0
        ? insertedData[0]
        : (store[0] ?? { id: "test-id" });
      return createSupabaseMockResponse(data, null);
    }),
    // handled above to toggle _maybeSingle; the thenable will return null or first row accordingly
    // maybeSingle: vi.fn().mockImplementation(() => createSupabaseMockResponse(null, null)),
    csv: vi.fn().mockImplementation(() => createSupabaseMockResponse("", null)),
    geojson: vi.fn().mockImplementation(() => createSupabaseMockResponse(null, null)),
    explain: vi.fn().mockImplementation(() => createSupabaseMockResponse(null, null)),
    rollback: vi.fn().mockImplementation(() => createSupabaseMockResponse(null, null)),
    returns: vi.fn().mockReturnThis(),
  };

  // Add promise-like behavior for direct awaiting
  /* eslint-disable unicorn/no-thenable */
  (mockBuilder as Record<string, unknown>).then = function(
    onResolve: (value: unknown) => unknown,
    onReject?: (reason: unknown) => unknown,
  ) {
    if (shouldError) {
      const result = {
        data: null,
        error: { message: "duplicate key value violates unique constraint", code: "23505" },
      };
      return Promise.resolve(result).then(onResolve, onReject);
    }

    // Return appropriate data based on the last operation and filters
    const tableName = (mockBuilder as unknown as unknown).currentTable || "default";
    const store = insertedRecords.get(tableName) || [];

    const isDelete = Boolean((mockBuilder as unknown)._deleteMode);
    const like = (mockBuilder as unknown)._like as { col: string; pattern: string; } | undefined;
    const inFilter = (mockBuilder as unknown)._in as
      | { col: string; values: unknown[]; }
      | undefined;
    const contains = (mockBuilder as unknown)._contains as
      | { col: string; arr: unknown[]; }
      | undefined;
    const eqs = ((mockBuilder as unknown)._eqs as { col: string; val: unknown; }[] | undefined)
      ?? [];

    if (isDelete) {
      let kept = store;
      if (like) {
        const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const escaped = escapeRegex(String(like.pattern));
        const regex = new RegExp("^" + escaped.replace(/%/g, ".*") + "$");
        kept = kept.filter((r) => !regex.test(String((r as unknown)[like.col] ?? "")));
      }
      if (inFilter) {
        kept = kept.filter((r) => !inFilter.values.includes((r as unknown)[inFilter.col]));
      }
      // apply eq filters for delete as well
      for (const { col, val } of eqs) {
        kept = kept.filter((r) => (r as unknown)[col] !== val);
      }
      insertedRecords.set(tableName, kept);
      (mockBuilder as unknown)._deleteMode = false;
      (mockBuilder as unknown)._like = undefined;
      (mockBuilder as unknown)._in = undefined;
      (mockBuilder as unknown)._contains = undefined;
      (mockBuilder as unknown)._eqs = undefined;
      const result = { data: kept, error: null };
      return Promise.resolve(result).then(onResolve, onReject);
    }

    // RLS denial
    if ((mockBuilder as unknown)._rlsDenied) {
      const res = { data: null, error: { message: "permission denied", code: "42501" } };
      return Promise.resolve(res).then(onResolve, onReject);
    }

    let resultData = insertedData;

    if (hasSelectAfterInsert) {
      // Start with store when only selecting
      let rows = insertedData
        ? (Array.isArray(insertedData) ? insertedData : [insertedData])
        : store;
      if (like) {
        const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const escaped = escapeRegex(String(like.pattern));
        const regex = new RegExp("^" + escaped.replace(/%/g, ".*") + "$");
        rows = rows.filter((r) => regex.test(String((r as unknown)[like.col] ?? "")));
      }
      if (inFilter) {
        rows = rows.filter((r) => inFilter.values.includes((r as unknown)[inFilter.col]));
      }
      if (contains) {
        rows = rows.filter((r) => {
          const arr = (r as unknown)[contains.col] as unknown[];
          if (!Array.isArray(arr)) return false;
          return contains.arr.every((v) => arr.includes(v));
        });
      }
      // apply eq filters
      for (const { col, val } of eqs) {
        rows = rows.filter((r) => (r as unknown)[col] === val);
      }
      resultData = rows;
    } else if (!insertedData) {
      resultData = [];
    }
    // maybeSingle support: if flagged and result is array, return first element
    if ((mockBuilder as unknown)._maybeSingle) {
      resultData = Array.isArray(resultData) ? (resultData[0] ?? null) : (resultData ?? null);
    }

    // Reset one-shot flags
    (mockBuilder as unknown)._like = undefined;
    (mockBuilder as unknown)._in = undefined;
    (mockBuilder as unknown)._contains = undefined;
    (mockBuilder as unknown)._eqs = undefined;

    const result = { data: resultData, error: null };
    return Promise.resolve(result).then(onResolve, onReject);
  };
  /* eslint-enable unicorn/no-thenable */

  return mockBuilder;
};

const mockSupabaseClient: {
  from: MockedFunction<unknown>;
  auth: {
    getUser: MockedFunction<unknown>;
    signInWithPassword: MockedFunction<unknown>;
    signOut: MockedFunction<unknown>;
  };
  channel: MockedFunction<unknown>;
  rpc: MockedFunction<unknown>;
  storage: {
    from: MockedFunction<unknown>;
  };
} = {
  from: vi.fn().mockImplementation((tableName: string) => {
    const builder = createMockQueryBuilder();
    // Set the current table for the builder
    (builder as unknown).currentTable = tableName;
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
  validateConsent: MockedFunction<unknown>;
  logDataAccess: MockedFunction<unknown>;
  checkDataRetention: MockedFunction<unknown>;
  anonymizeData: MockedFunction<unknown>;
  generateConsentReport: MockedFunction<unknown>;
} = {
  validateConsent: vi.fn().mockReturnValue(true),
  logDataAccess: vi.fn().mockResolvedValue(true),
  checkDataRetention: vi.fn().mockReturnValue(true),
  anonymizeData: vi.fn().mockResolvedValue({}),
  generateConsentReport: vi.fn().mockResolvedValue({}),
};

// Notification Service Mock
const mockNotificationService: {
  sendEmergencyAlert: MockedFunction<unknown>;
  notifyCompliance: MockedFunction<unknown>;
  logNotification: MockedFunction<unknown>;
  notifyMedicalStaff: MockedFunction<unknown>;
  logEmergencyNotification: MockedFunction<unknown>;
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
  validateCompliance: MockedFunction<unknown>;
  logComplianceEvent: MockedFunction<unknown>;
  checkRequirements: MockedFunction<unknown>;
  generateReport: MockedFunction<unknown>;
} = {
  validateCompliance: vi.fn().mockReturnValue(true),
  logComplianceEvent: vi.fn().mockResolvedValue({}),
  checkRequirements: vi.fn().mockReturnValue([]),
  generateReport: vi.fn().mockResolvedValue({}),
};

// Seed metrics for ecosystem tests and service metrics table used by ecosystem
if (!insertedRecords.has("ai_metrics")) {
  insertedRecords.set("ai_metrics", [
    {
      service: "feature-flags",
      metric_name: "latency_ms",
      metric_value: 120,
      timestamp: new Date().toISOString(),
    },
    {
      service: "cache-management",
      metric_name: "hit_rate",
      metric_value: 0.88,
      timestamp: new Date().toISOString(),
    },
    {
      service: "monitoring",
      metric_name: "requests",
      metric_value: 5,
      timestamp: new Date().toISOString(),
    },
  ]);
}
if (!insertedRecords.has("ai_service_metrics")) {
  insertedRecords.set("ai_service_metrics", [
    {
      service: "feature-flags",
      metric_name: "message_processed",
      metric_value: 1,
      timestamp: new Date().toISOString(),
    },
  ]);
}

// Provide realtime hook default
(globalThis as any).mockRealtimeHook = (globalThis as any).mockRealtimeHook
  ?? { isConnected: true, error: null };
if (typeof (globalThis as any).mockRealtimeHook.error === "undefined") {
  (globalThis as unknown).mockRealtimeHook.error = null;
}

// Patients hook surface expected by tests
(globalThis as any).mockPatientsHook = (globalThis as any).mockPatientsHook ?? {
  exportPatientData: vi.fn(async () => ({ success: true, url: "https://example.com/export.zip" })),
  importPatientData: vi.fn(async () => ({ success: true })),
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
