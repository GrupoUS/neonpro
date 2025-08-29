/**
 * Unit tests for AuditService.
 *
 * Testing Library/Framework: This project uses Jest (TypeScript) conventions with describe/it/expect.
 * If your repo uses Vitest instead, these tests are compatible with minimal edits (e.g., import from 'vitest').
 *
 * These tests focus on the behaviors present in the provided AuditService implementation,
 * emphasizing edge cases, error handling, and pure helper methods.
 */

import type { Mock } from 'jest-mock';

// Mock @supabase/supabase-js to control DB interactions
jest.mock('@supabase/supabase-js', () => {
  const chain: any = {
    _calls: [] as any[],
    select: jest.fn(function (_sel?: any, _opts?: any) { chain._calls.push(['select', _sel, _opts]); return chain; }),
    single: jest.fn(function () { chain._calls.push(['single']); return chain; }),
    insert: jest.fn(function (payload: any) { chain._calls.push(['insert', payload]); return chain; }),
    order: jest.fn(function (...args: any[]) { chain._calls.push(['order', ...args]); return chain; }),
    range: jest.fn(function (...args: any[]) { chain._calls.push(['range', ...args]); return chain; }),
    gte: jest.fn(function (...args: any[]) { chain._calls.push(['gte', ...args]); return chain; }),
    lte: jest.fn(function (...args: any[]) { chain._calls.push(['lte', ...args]); return chain; }),
    eq:  jest.fn(function (...args: any[]) { chain._calls.push(['eq', ...args]); return chain; }),
    delete: jest.fn(function () { chain._calls.push(['delete']); return chain; }),
    lt: jest.fn(function (...args: any[]) { chain._calls.push(['lt', ...args]); return chain; }),

    // Promise-like thenable so `await query` works
    _resolve: { data: null, error: null, count: null },
    // biome-ignore no-then: allow then for awaitable query chain
    then: function (onFulfilled: any) {
      const res = chain._resolve;
      return Promise.resolve(onFulfilled(res));
    },
    catch: function () { return chain; },
    finally: function () { return chain; },
    _reset: function () {
      chain._calls = [];
      chain._resolve = { data: null, error: null, count: null };
      return chain;
    },
  };

  const tables: Record<string, any> = {};
  const client = {
    from: jest.fn((table: string) => {
      tables.last = table;
      return chain._reset();
    }),
  };

  return {
    createClient: jest.fn(() => client),
    // Expose internals for assertions
    __mock__: { client, chain, tables },
  };
});

// Provide a focused mock for ../types/audit so zod schemas don't constrain tests.
// We simulate parse() success by returning the input, and allow tests to override to throw.
jest.mock('../../types/audit', () => {
  const AuditSeverity = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  } as const;

  const passThrough = { parse: (x: any) => x };
  const AuditEventSchema = { ...passThrough };
  const AuditFilterSchema = { ...passThrough };

  type AuditAction = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'access';

  return {
    AuditSeverity,
    AuditEventSchema,
    AuditFilterSchema,
    CriticalAuditAlert: {} as any,
    // Types re-exported as values for test typing convenience
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
});

import { createClient, __mock__ as supaMock } from '@supabase/supabase-js';
import { AuditSeverity } from '../../types/audit';

// Import after mocks so constructor picks up mocked client
import { AuditService } from '../../services/audit.service';

describe('AuditService', () => {
  let service: AuditService;

  const fixedNow = new Date('2025-01-15T12:34:56.000Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fixedNow);
    process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'test-key';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuditService();
    // Ensure each query chain starts clean
    supaMock.chain._reset();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  function makeLogRow(overrides: Partial<any> = {}) {
    const base = {
      id: '1',
      timestamp: new Date('2025-01-01T00:00:00.000Z').toISOString(),
      created_at: new Date('2025-01-01T00:00:01.000Z').toISOString(),
      updated_at: new Date('2025-01-01T00:00:02.000Z').toISOString(),
      user_id: 'user-1',
      action: 'login',
      resource_type: 'user',
      severity: AuditSeverity.LOW,
      status_code: 200,
      ...overrides,
    };
    return base;
  }

  describe('constructor', () => {
    it('initializes Supabase client with env vars and default config', () => {
      expect(createClient).toHaveBeenCalledWith(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      // Cannot access private config directly; smoke test instance exists
      expect(service).toBeTruthy();
    });
  });

  describe('logEvent', () => {
    const baseEvent = {
      timestamp: new Date('2025-01-01T00:00:00.000Z'),
      user_id: 'user-1',
      session_id: 'sess-1',
      action: 'login',
      resource_type: 'user',
      resource_id: 'user-1',
      resource_name: 'User One',
      ip_address: '127.0.0.1',
      user_agent: 'jest',
      method: 'POST',
      endpoint: '/api/login',
      status_code: 200,
      severity: AuditSeverity.LOW,
      details: { a: 1 },
    };

    it('returns null when zod validation fails', async () => {
      // Override parse to throw
      const types = jest.requireMock('../../types/audit');
      (types.AuditEventSchema.parse as Mock).mockImplementationOnce(() => {
        throw new Error('invalid');
      });

      const res = await service.logEvent({ ...baseEvent });
      expect(res).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('skips logging when endpoint is excluded', async () => {
      const res = await service.logEvent({ ...baseEvent, endpoint: '/metrics' });
      expect(res).toBeNull();
      expect(supaMock.client.from).not.toHaveBeenCalled();
    });

    it('truncates oversized details and inserts row; returns mapped AuditLogEntry', async () => {
      const large = 'x'.repeat(12000);
      const event = { ...baseEvent, details: { big: large } };

      // Mock successful insert select single
      supaMock.chain._resolve = {
        data: makeLogRow({
          timestamp: baseEvent.timestamp.toISOString(),
          created_at: new Date('2025-01-02T00:00:00.000Z').toISOString(),
          updated_at: new Date('2025-01-03T00:00:00.000Z').toISOString(),
          details: { big: large, _truncated: true, _original_size: expect.any(Number) },
        }),
        error: null,
        count: null,
      };

      const res = await service.logEvent(event);
      expect(supaMock.client.from).toHaveBeenCalledWith('audit_logs');

      // Ensure details were truncated before insert
      const insertCall = supaMock.chain.insert.mock.calls[0][0];
      expect(insertCall.details._truncated).toBe(true);
      expect(insertCall.details._original_size).toBeGreaterThan(10000);

      expect(res).toMatchObject({
        id: '1',
        timestamp: expect.any(Date),
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
    });

    it('handles Supabase insert error by returning null', async () => {
      supaMock.chain._resolve = { data: null, error: { message: 'db down' }, count: null };
      const res = await service.logEvent({ ...baseEvent });
      expect(res).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao inserir log de auditoria:'),
        expect.anything()
      );
    });

    it('emits critical alert path for CRITICAL severity', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      supaMock.chain._resolve = { data: makeLogRow({ severity: AuditSeverity.CRITICAL }), error: null, count: null };

      const res = await service.logEvent({ ...baseEvent, severity: AuditSeverity.CRITICAL });
      expect(res).not.toBeNull();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('EVENTO CRÍTICO DE AUDITORIA:'),
        expect.objectContaining({
          action: expect.any(String),
          user_id: expect.any(String),
          resource_type: expect.any(String),
          timestamp: expect.any(Date),
        })
      );
      warnSpy.mockRestore();
    });
  });

  describe('getLogs', () => {
    it('applies filters, maps dates, and paginates correctly', async () => {
      const sample = [
        makeLogRow({ id: '10', timestamp: new Date('2025-01-10T00:00:00.000Z').toISOString() }),
        makeLogRow({ id: '11', timestamp: new Date('2025-01-11T00:00:00.000Z').toISOString() }),
      ];

      supaMock.chain._resolve = { data: sample, error: null, count: 2 };

      const res = await service.getLogs({
        start_date: '2025-01-01',
        end_date: '2025-01-31',
        user_id: 'user-1',
        action: 'login',
        resource_type: 'user',
        resource_id: 'user-1',
        severity: AuditSeverity.LOW,
        ip_address: '127.0.0.1',
        status_code: 200,
        sort_by: 'timestamp',
        sort_order: 'desc',
        limit: 50,
        offset: 0,
      } as any);

      expect(res.success).toBe(true);
      expect(res.data).toHaveLength(2);
      expect(res.total).toBe(2);
      expect(res.page).toBe(1);
      expect(res.limit).toBe(50);
      expect(res.data[0].timestamp).toBeInstanceOf(Date);

      // Ensure filter chain methods were invoked
      const calls = supaMock.chain._calls.map((c: any[]) => c[0]);
      expect(calls).toEqual(
        expect.arrayContaining(['select','gte','lte','eq','eq','eq','eq','eq','eq','order','range'])
      );
    });

    it('returns failure response when Supabase errors', async () => {
      supaMock.chain._resolve = { data: null, error: { message: 'bad query' }, count: null };
      const res = await service.getLogs({
        sort_by: 'timestamp',
        sort_order: 'asc',
        limit: 10,
        offset: 0,
      } as any);
      expect(res.success).toBe(false);
      expect(res.data).toEqual([]);
      expect(res.message).toMatch(/Erro ao consultar logs/);
    });
  });

  describe('getStats', () => {
    it('computes aggregates, top users, recent critical, and daily activity', async () => {
      const logs = [
        makeLogRow({ id: '1', user_id: 'u1', action: 'login', resource_type: 'user', severity: AuditSeverity.LOW, timestamp: new Date('2025-01-14T10:00:00Z').toISOString() }),
        makeLogRow({ id: '2', user_id: 'u1', action: 'update', resource_type: 'record', severity: AuditSeverity.HIGH, timestamp: new Date('2025-01-15T11:00:00Z').toISOString() }),
        makeLogRow({ id: '3', user_id: 'u2', action: 'delete', resource_type: 'record', severity: AuditSeverity.CRITICAL, timestamp: new Date('2025-01-15T12:00:00Z').toISOString() }),
      ];

      supaMock.chain._resolve = { data: logs, error: null, count: null };

      const res = await service.getStats(2);
      expect(res.success).toBe(true);
      const s = res.data!;
      expect(s.total_events).toBe(3);
      expect(s.events_by_action).toMatchObject({ login: 1, update: 1, delete: 1 });
      expect(s.events_by_resource).toMatchObject({ user: 1, record: 2 });
      expect(s.events_by_severity).toMatchObject({ low: 1, high: 1, critical: 1 });
      expect(s.top_users[0]).toMatchObject({ user_id: 'u1', count: 2 });
      expect(s.recent_critical_events.length).toBe(1);
      expect(s.daily_activity.length).toBe(2);
      // Ensure dates are sorted ascending
      expect(s.daily_activity.map(d => d.date)).toEqual([...s.daily_activity.map(d => d.date)].sort());
    });

    it('returns failure response on query error', async () => {
      supaMock.chain._resolve = { data: null, error: { message: 'stats fail' }, count: null };
      const res = await service.getStats(7);
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/Erro ao gerar estatísticas/');
    });
  });

  describe('exportLogs', () => {
    it('exports JSON using getLogs results', async () => {
      // Mock getLogs on the instance to avoid re-wiring the chain
      const logs = [
        {
          id: '1',
          timestamp: new Date('2025-01-10T00:00:00.000Z'),
          created_at: new Date('2025-01-10T00:00:01.000Z'),
          updated_at: new Date('2025-01-10T00:00:02.000Z'),
          user_id: 'u1',
          action: 'login',
          resource_type: 'user',
          severity: AuditSeverity.LOW,
        } as any,
      ];
      const getLogsSpy = jest.spyOn(service, 'getLogs').mockResolvedValue({
        success: true,
        data: logs,
        total: 1,
        page: 1,
        limit: 10000,
        timestamp: new Date(),
      } as any);

      const res = await service.exportLogs({
        format: 'json',
        include_details: true,
        filters: { sort_by: 'timestamp', sort_order: 'asc', limit: 10, offset: 0 } as any,
      });

      expect(getLogsSpy).toHaveBeenCalledWith(expect.objectContaining({ limit: 10000 }));
      expect(res.success).toBe(true);
      expect(res.data.download_url).toMatch(/^\/api\/audit\/download\/audit_logs_/);
      expect(res.data.file_size).toBeGreaterThan(2);
    });

    it('exports CSV via convertToCSV helper and honors include_details flag', async () => {
      const getLogsSpy = jest.spyOn(service, 'getLogs').mockResolvedValue({
        success: true,
        data: [{ id: '1' } as any],
        total: 1,
        page: 1,
        limit: 10000,
        timestamp: new Date(),
      } as any);
      const csvSpy = jest.spyOn<any, any>(service as any, 'convertToCSV').mockReturnValue('id,timestamp\n1,2025-01-01\n');

      const res = await service.exportLogs({
        format: 'csv',
        include_details: true,
        filters: { sort_by: 'timestamp', sort_order: 'desc', limit: 10, offset: 0 } as any,
      });

      expect(getLogsSpy).toHaveBeenCalled();
      expect(csvSpy).toHaveBeenCalledWith(expect.any(Array), true);
      expect(res.success).toBe(true);
      expect(res.data.file_size).toBeGreaterThan(0);
    });

    it('fails for PDF (not implemented)', async () => {
      const getLogsSpy = jest.spyOn(service, 'getLogs').mockResolvedValue({
        success: true,
        data: [],
        total: 0,
        page: 1,
        limit: 10000,
        timestamp: new Date(),
      } as any);

      const res = await service.exportLogs({
        format: 'pdf',
        include_details: false,
        filters: { sort_by: 'timestamp', sort_order: 'asc', limit: 10, offset: 0 } as any,
      });

      expect(getLogsSpy).toHaveBeenCalled();
      expect(res.success).toBe(false);
      expect(res.data.file_size).toBe(0);
      expect(res.message).toMatch(/PDF/i);
    });

    it('fails for unsupported format', async () => {
      const res = await service.exportLogs({
        // @ts-expect-error - intentionally wrong
        format: 'xlsx',
        include_details: false,
        filters: { sort_by: 'timestamp', sort_order: 'asc', limit: 10, offset: 0 } as any,
      });
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/não suportado|suportado/i);
    });
  });

  describe('cleanupOldLogs', () => {
    it('deletes rows older than retention cutoff and returns count', async () => {
      supaMock.chain._resolve = { data: null, error: null, count: 7 };
      const count = await service.cleanupOldLogs();
      expect(count).toBe(7);

      // Ensure chain includes delete + lt on timestamp
      const ops = supaMock.chain._calls.map((c: any[]) => c[0]);
      expect(ops).toEqual(expect.arrayContaining(['delete','lt']));
    });

    it('returns 0 and logs error on failure', async () => {
      supaMock.chain._resolve = { data: null, error: { message: 'cannot delete' }, count: null };
      const count = await service.cleanupOldLogs();
      expect(count).toBe(0);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao limpar logs antigos:'),
        expect.anything()
      );
    });
  });

  describe('pure helpers (private) via any-cast', () => {
    it('convertToCSV produces headers and quotes values with commas/newlines/quotes', () => {
      const csv = (service as any).convertToCSV([
        {
          id: '1',
          timestamp: new Date('2025-01-01T00:00:00.000Z'),
          user_id: 'u1',
          action: 'create',
          resource_type: 'record',
          resource_id: 'rec,1',
          resource_name: 'Name "Quoted"',
          ip_address: '127.0.0.1',
          user_agent: 'UA',
          method: 'POST',
          endpoint: '/api/records',
          status_code: 201,
          severity: AuditSeverity.HIGH,
          error_message: '',
          duration_ms: 10,
          details: { foo: 'bar' },
          before_data: { a: 1 },
          after_data: { a: 2 },
          created_at: new Date(),
          updated_at: new Date(),
        },
      ] as any, true);

      const lines = csv.split('\n');
      expect(lines[0]).toContain('id,timestamp,user_id'); // headers
      expect(lines[1]).toContain('"rec,1"'); // comma requires quoting
      expect(lines[1]).toContain('"Name ""Quoted"""'); // quotes escaped
      expect(lines[1]).toContain('{'); // JSON fields present when includeDetails=true
    });

    it('getDailyActivity returns sorted date buckets for given window', () => {
      const logs = [
        { timestamp: new Date('2025-01-14T01:00:00Z') },
        { timestamp: new Date('2025-01-15T12:00:00Z') },
        { timestamp: new Date('2025-01-15T13:00:00Z') },
      ] as any;

      const daily = (service as any).getDailyActivity(logs, 2);
      expect(daily).toHaveLength(2);
      // Dates should be ascending and last date equals fixed "today"
      expect(daily.map((d: any) => d.date)).toEqual([...daily.map((d: any) => d.date)].sort());
      expect(daily[daily.length - 1].count).toBe(2);
    });

    it('groupByField tallies values correctly', () => {
      const logs = [
        { action: 'a' },
        { action: 'a' },
        { action: 'b' },
      ] as any;
      const grouped = (service as any).groupByField(logs, 'action');
      expect(grouped).toEqual({ a: 2, b: 1 });
    });

    it('getTopUsers sorts by frequency and limits to top 10', () => {
      const mk = (u: string) => ({ user_id: u } as any);
      const logs = [
        ...Array.from({ length: 5 }, () => mk('u1')),
        ...Array.from({ length: 3 }, () => mk('u2')),
        mk('u3'),
        { user_id: undefined },
      ];
      const top = (service as any).getTopUsers(logs);
      expect(top.slice(0, 3)).toEqual([
        { user_id: 'u1', count: 5 },
        { user_id: 'u2', count: 3 },
        { user_id: 'u3', count: 1 },
      ]);
    });
  });
});

// Silence console.error in tests except where explicitly asserted
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  (console.error as unknown as jest.SpyInstance).mockRestore();
});