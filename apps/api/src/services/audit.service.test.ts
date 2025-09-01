/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from "@jest/globals";

jest.useFakeTimers();

//
// Mocks
//
const mockCreateClient = jest.fn();
jest.unstable_mockModule("@supabase/supabase-js", () => ({
  createClient: mockCreateClient,
}));

// Mock the audit types module to provide runtime values and pass-through schemas
// Adjust the relative path if your repo structure differs.
const mockAuditEventSchema = { parse: (e: unknown) => e };
const mockAuditFilterSchema = { parse: (f: unknown) => f };
enum MockAuditSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}
jest.unstable_mockModule("../types/audit", () => ({
  AuditEventSchema: mockAuditEventSchema,
  AuditFilterSchema: mockAuditFilterSchema,
  AuditSeverity: MockAuditSeverity,
}));

// Import the module under test AFTER mocks
const { AuditService } = await import("./audit.service");
const { AuditSeverity } = await import("../types/audit");

type ThenableResult<T> = T & { then: (resolve: (v: unknown) => any, reject?: (e: unknown) => any) => any; };

function thenable<T extends object>(payload: T): ThenableResult<T> {
  return Promise.resolve(payload) as unknown;
}

function makeSelectQueryBuilder(result: unknown) {
  const qb: unknown = {};
  qb.gte = jest.fn(() => qb);
  qb.lte = jest.fn(() => qb);
  qb.eq = jest.fn(() => qb);
  qb.order = jest.fn(() => qb);
  qb.range = jest.fn(() => thenable(result));
  const select = jest.fn((_sel?: unknown, _opts?: unknown) => qb);
  return { qb, select };
}

function makeInsertChain(result: { data: unknown; error: unknown; }, capture?: (payload: unknown) => void) {
  const single = jest.fn(() => Promise.resolve(result));
  const select = jest.fn(() => ({ single }));
  const insert = jest.fn((payload: unknown) => {
    capture && capture(payload);
    return { select };
  });
  return { insert, select, single };
}

function makeDeleteChain(result: { count?: number | null; error?: unknown; }) {
  const lt = jest.fn((_col: string, _val: string) => Promise.resolve(result));
  const del = jest.fn(() => ({ lt }));
  return { del, lt };
}

function newSupabaseMock(options: {
  insertResult?: { data: unknown; error: unknown; };
  onInsertPayload?: (p: unknown) => void;
  selectResult?: { data: unknown[]; error: unknown; count?: number | null; };
  statsResult?: { data: unknown[]; error: unknown; };
  deleteResult?: { count?: number | null; error?: unknown; };
}) {
  const { insert, select, single } = makeInsertChain(
    options.insertResult ?? { data: null, error: null },
    options.onInsertPayload,
  );
  const { qb, select: selectFn } = makeSelectQueryBuilder(
    options.selectResult ?? { data: [], error: null, count: 0 },
  );
  const { del, lt } = makeDeleteChain(options.deleteResult ?? { count: 0, error: null });

  const selectStats = jest.fn(() => {
    const qb2: unknown = {};
    qb2.gte = jest.fn(() => thenable(options.statsResult ?? { data: [], error: null }));
    return qb2;
  });

  const from = jest.fn((_table: string) => ({
    insert,
    select: (sel?: unknown, opts?: unknown) => {
      // Route selects: when called in getStats it has only '*' argument and no count option
      if (opts && opts.count) {return selectFn(sel, opts);}
      return selectStats(sel);
    },
    delete: del,
  }));

  const client = { from };
  return { client, insert, select, single, qb, selectFn, del, lt, selectStats };
}

function sampleEvent(overrides: Partial<unknown> = {}) {
  return {
    user_id: "u1",
    session_id: "s1",
    action: "LOGIN",
    resource_type: "user",
    resource_id: "r1",
    resource_name: "John",
    ip_address: "127.0.0.1",
    user_agent: "agent",
    method: "POST",
    endpoint: "/api/login",
    status_code: 200,
    severity: AuditSeverity.LOW,
    error_message: null,
    duration_ms: 12,
    details: { foo: "bar" },
    timestamp: new Date("2025-08-01T12:00:00.000Z"),
    ...overrides,
  };
}

describe("AuditService", () => {
  let service: unknown;
  let supabaseMocks: ReturnType<typeof newSupabaseMock>;
  const originalWarn = console.warn;
  const originalError = console.error;

  beforeEach(() => {
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.warn = originalWarn;
    console.error = originalError;
    jest.clearAllTimers();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("logEvent: inserts valid event and returns mapped AuditLogEntry; triggers critical alert", async () => {
    const inserted = {
      id: "1",
      ...sampleEvent({ severity: AuditSeverity.CRITICAL }),
      timestamp: "2025-08-01T12:00:00.000Z",
      created_at: "2025-08-01T12:00:01.000Z",
      updated_at: "2025-08-01T12:00:02.000Z",
    };

    supabaseMocks = newSupabaseMock({
      insertResult: { data: inserted, error: null },
    });

    mockCreateClient.mockReturnValue(supabaseMocks.client);
    service = new UnifiedAuditService();

    const result = await service.logEvent(
      sampleEvent({ severity: AuditSeverity.CRITICAL }),
    );

    expect(result).toBeTruthy();
    expect(result.id).toBe("1");
    expect(result.timestamp).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Critical path should log a warning via handleCriticalEvent
    expect(console.warn).toHaveBeenCalledWith(
      "EVENTO CRÍTICO DE AUDITORIA:",
      expect.objectContaining({
        id: "1",
        action: "LOGIN",
        resource_type: "user",
        user_id: "u1",
        timestamp: expect.any(Date),
      }),
    );
  });

  test("logEvent: returns null when DB insert returns error", async () => {
    supabaseMocks = newSupabaseMock({
      insertResult: { data: null, error: { message: "db error" } },
    });
    mockCreateClient.mockReturnValue(supabaseMocks.client);
    service = new UnifiedAuditService();

    const res = await service.logEvent(sampleEvent());
    expect(res).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      "Erro ao inserir log de auditoria:",
      { message: "db error" },
    );
  });

  test("logEvent: skips event when endpoint is excluded", async () => {
    supabaseMocks = newSupabaseMock({
      insertResult: { data: null, error: null },
    });
    mockCreateClient.mockReturnValue(supabaseMocks.client);
    service = new UnifiedAuditService();

    const res = await service.logEvent(
      sampleEvent({ endpoint: "/healthcheck" }),
    ); // contains "/health"
    expect(res).toBeNull();
    expect(supabaseMocks.insert).not.toHaveBeenCalled();
  });

  test("logEvent: truncates oversize details and annotates metadata before insert", async () => {
    let captured: unknown;
    supabaseMocks = newSupabaseMock({
      insertResult: {
        data: {
          id: "2",
          ...sampleEvent(),
          timestamp: "2025-08-01T12:00:00.000Z",
          created_at: "2025-08-01T12:00:01.000Z",
          updated_at: "2025-08-01T12:00:02.000Z",
        },
        error: null,
      },
      onInsertPayload: (p) => (captured = p),
    });
    mockCreateClient.mockReturnValue(supabaseMocks.client);
    service = new UnifiedAuditService();

    const big = "x".repeat(10_100);
    const evt = sampleEvent({
      details: { big },
      timestamp: new Date("2025-08-01T12:00:00.000Z"),
    });
    const res = await service.logEvent(evt);

    expect(res).toBeTruthy();
    expect(captured).toBeDefined();
    expect(captured.details).toBeDefined();
    expect(captured.details._truncated).toBe(true);
    expect(typeof captured.details._original_size).toBe("number");
  });

  test("getLogs: applies filters, ordering, pagination and maps dates", async () => {
    const data = [
      {
        id: "a",
        ...sampleEvent(),
        timestamp: "2025-08-28T10:00:00.000Z",
        created_at: "2025-08-28T10:00:01.000Z",
        updated_at: "2025-08-28T10:00:02.000Z",
      },
      {
        id: "b",
        ...sampleEvent({ user_id: "u2" }),
        timestamp: "2025-08-28T11:00:00.000Z",
        created_at: "2025-08-28T11:00:01.000Z",
        updated_at: "2025-08-28T11:00:02.000Z",
      },
    ];

    const selectResult = { data, error: null, count: 2 };
    supabaseMocks = newSupabaseMock({ selectResult });
    mockCreateClient.mockReturnValue(supabaseMocks.client);
    service = new UnifiedAuditService();

    const filters = {
      start_date: "2025-08-27T00:00:00.000Z",
      end_date: "2025-08-29T00:00:00.000Z",
      user_id: "u1",
      action: "LOGIN",
      resource_type: "user",
      resource_id: "r1",
      severity: AuditSeverity.LOW,
      ip_address: "127.0.0.1",
      status_code: 200,
      sort_by: "timestamp",
      sort_order: "desc" as const,
      offset: 0,
      limit: 50,
    };

    const res = await service.getLogs(filters as unknown);
    expect(res.success).toBe(true);
    expect(res.data).toHaveLength(2);
    expect(res.total).toBe(2);
    expect(res.limit).toBe(50);
    expect(res.page).toBe(1);
    expect(res.data[0].timestamp).toBeInstanceOf(Date);

    // Ensure filters were applied
    expect(supabaseMocks.qb.gte).toHaveBeenCalledWith(
      "timestamp",
      filters.start_date,
    );
    expect(supabaseMocks.qb.lte).toHaveBeenCalledWith(
      "timestamp",
      filters.end_date,
    );
    expect(supabaseMocks.qb.eq).toHaveBeenCalledWith("user_id", "u1");
    expect(supabaseMocks.qb.order).toHaveBeenCalledWith("timestamp", {
      ascending: false,
    });
    expect(supabaseMocks.qb.range).toHaveBeenCalledWith(0, 49);
  });

  test("getLogs: returns failure response when query throws error", async () => {
    const selectResult = {
      data: null,
      error: { message: "boom" },
      count: null,
    };
    // Return an error only after await
    const qb: unknown = {};
    qb.gte = jest.fn(() => qb);
    qb.order = jest.fn(() => qb);
    qb.range = jest.fn(() => Promise.resolve(selectResult));
    const from = jest.fn(() => ({ select: jest.fn(() => qb) }));
    mockCreateClient.mockReturnValue({ from });

    service = new UnifiedAuditService();
    const res = await service.getLogs(
      { sort_by: "timestamp", sort_order: "asc", offset: 0, limit: 10 } as unknown,
    );
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/Erro ao consultar logs/);
  });

  test("getStats: computes totals, groupings, recent criticals, top users, and daily activity", async () => {
    const now = new Date("2025-08-29T12:00:00.000Z");
    jest.useFakeTimers().setSystemTime(now);

    const logs = [
      {
        id: "1",
        ...sampleEvent({
          user_id: "u1",
          action: "LOGIN",
          severity: AuditSeverity.LOW,
        }),
        timestamp: now.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      },
      {
        id: "2",
        ...sampleEvent({
          user_id: "u1",
          action: "UPDATE",
          severity: AuditSeverity.CRITICAL,
        }),
        timestamp: new Date(now.getTime() - 3_600_000).toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      },
      {
        id: "3",
        ...sampleEvent({
          user_id: "u2",
          action: "LOGIN",
          severity: AuditSeverity.MEDIUM,
        }),
        timestamp: new Date(now.getTime() - 2 * 24 * 3_600_000).toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      },
    ];

    const statsResult = { data: logs, error: null };
    supabaseMocks = newSupabaseMock({ statsResult });
    mockCreateClient.mockReturnValue(supabaseMocks.client);
    service = new UnifiedAuditService();

    const res = await service.getStats(3);
    expect(res.success).toBe(true);
    const s = res.data!;
    expect(s.total_events).toBe(3);
    expect(s.events_by_action.LOGIN).toBe(2);
    expect(s.events_by_severity[AuditSeverity.CRITICAL]).toBe(1);
    expect(s.top_users[0]).toStrictEqual({ user_id: "u1", count: 2 });
    expect(s.recent_critical_events).toHaveLength(1);
    // daily_activity covers 3 days and is sorted ascending by date
    expect(s.daily_activity).toHaveLength(3);
    const dates = s.daily_activity.map((d) => d.date);
    expect([...dates].sort()).toStrictEqual(dates);
    // Sum of counts should equal number of events that fell within the 3-day window (all 3)
    const totalDaily = s.daily_activity.reduce((acc, d) => acc + d.count, 0);
    expect(totalDaily).toBe(3);
  });

  test("exportLogs: returns JSON export metadata", async () => {
    // Spy on getLogs to avoid DB
    const svc = new UnifiedAuditService();
    const spy = jest
      .spyOn(svc as unknown, "getLogs")
      .mockResolvedValue({
        success: true,
        data: [{ id: "1", timestamp: new Date("2025-08-01T12:00:00.000Z") }],
        total: 1,
        page: 1,
        limit: 10_000,
        timestamp: new Date(),
      });

    const res = await (svc as unknown).exportLogs({
      format: "json",
      include_details: false,
      filters: { sort_by: "timestamp", sort_order: "desc", offset: 0, limit: 10_000 },
    });

    expect(res.success).toBe(true);
    expect(res.data.download_url).toMatch(
      /^\/api\/audit\/download\/audit_logs_\d+\.json$/,
    );
    expect(res.data.file_size).toBeGreaterThan(0);
    expect(spy).toHaveBeenCalled();
  });

  test("exportLogs: CSV size increases when include_details = true", async () => {
    const logs = [
      {
        id: "1",
        timestamp: new Date("2025-08-01T12:00:00.000Z"),
        user_id: "u1",
        session_id: "s1",
        action: "LOGIN",
        resource_type: "user",
        resource_id: "r1",
        resource_name: "John",
        ip_address: "127.0.0.1",
        user_agent: "ua",
        method: "POST",
        endpoint: "/api/login",
        status_code: 200,
        severity: AuditSeverity.LOW,
        error_message: null,
        duration_ms: 10,
        details: { a: 1 },
        before_data: { b: 2 },
        after_data: { c: 3 },
        created_at: new Date("2025-08-01T12:00:01.000Z"),
        updated_at: new Date("2025-08-01T12:00:02.000Z"),
      },
    ];

    const svc = new UnifiedAuditService();
    jest.spyOn(svc as unknown, "getLogs").mockResolvedValue({
      success: true,
      data: logs,
      total: 1,
      page: 1,
      limit: 10_000,
      timestamp: new Date(),
    });

    const resNo = await (svc as unknown).exportLogs({
      format: "csv",
      include_details: false,
      filters: { sort_by: "timestamp", sort_order: "desc", offset: 0, limit: 10_000 },
    });
    const resYes = await (svc as unknown).exportLogs({
      format: "csv",
      include_details: true,
      filters: { sort_by: "timestamp", sort_order: "desc", offset: 0, limit: 10_000 },
    });

    expect(resNo.success).toBe(true);
    expect(resYes.success).toBe(true);
    expect(resYes.data.file_size).toBeGreaterThan(resNo.data.file_size);
    expect(resYes.data.download_url).toMatch(/\.csv$/);
  });

  test("exportLogs: returns error for unsupported formats and unimplemented PDF", async () => {
    const svc = new UnifiedAuditService();
    jest.spyOn(svc as unknown, "getLogs").mockResolvedValue({
      success: true,
      data: [],
      total: 0,
      page: 1,
      limit: 10_000,
      timestamp: new Date(),
    });

    const pdf = await (svc as unknown).exportLogs({
      format: "pdf",
      include_details: false,
      filters: { sort_by: "timestamp", sort_order: "desc", offset: 0, limit: 10_000 },
    });
    expect(pdf.success).toBe(false);
    expect(pdf.message).toMatch(
      /PDF.*não implementada|PDF.*não implementado|PDF/i,
    );

    const other = await (svc as unknown).exportLogs({
      format: "xml" as unknown,
      include_details: false,
      filters: { sort_by: "timestamp", sort_order: "desc", offset: 0, limit: 10_000 },
    });
    expect(other.success).toBe(false);
    expect(other.message).toMatch(/Formato de exportação não suportado/);
  });

  test("cleanupOldLogs: deletes logs older than retention and returns count; handles error -> 0", async () => {
    // Success path
    supabaseMocks = newSupabaseMock({
      deleteResult: { count: 42, error: null },
    });
    mockCreateClient.mockReturnValue(supabaseMocks.client);
    const svc1 = new UnifiedAuditService();
    const n = await (svc1 as unknown).cleanupOldLogs();
    expect(n).toBe(42);
    expect(supabaseMocks.del).toHaveBeenCalled();
    expect(supabaseMocks.lt).toHaveBeenCalledWith(
      "timestamp",
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    );

    // Error path
    supabaseMocks = newSupabaseMock({
      deleteResult: { count: null, error: { message: "oops" } },
    });
    mockCreateClient.mockReturnValue(supabaseMocks.client);
    const svc2 = new UnifiedAuditService();
    const m = await (svc2 as unknown).cleanupOldLogs();
    expect(m).toBe(0);
    expect(console.error).toHaveBeenCalledWith(
      "Erro ao limpar logs antigos:",
      { message: "oops" },
    );
  });
});
