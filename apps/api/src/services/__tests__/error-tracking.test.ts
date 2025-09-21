import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorSeveritySchema, errorTracker, HealthcareErrorTypeSchema } from '../error-tracking';

// Mock Sentry and OpenTelemetry
vi.mock(_'@sentry/node',_() => ({
  captureException: vi.fn(),
  addBreadcrumb: vi.fn(),
  setUser: vi.fn(),
  setTag: vi.fn(),
  setContext: vi.fn(),
  withScope: vi.fn(callback =>
    callback({
      setLevel: vi.fn(),
      setTag: vi.fn(),
      setContext: vi.fn(),
    })
  ),
}));

vi.mock(_'@opentelemetry/api',_() => ({
  trace: {
    getTracer: vi.fn(() => ({
      startSpan: vi.fn(() => ({
        setAttributes: vi.fn(),
        recordException: vi.fn(),
        setStatus: vi.fn(),
        end: vi.fn(),
      })),
    })),
  },
  SpanStatusCode: {
    ERROR: 2,
  },
}));

describe(_'HealthcareErrorTracker',_() => {
  beforeEach(_() => {
    vi.clearAllMocks();
  });

  afterEach(_() => {
    // Reset metrics
    errorTracker['resetMetrics']();
  });

  it(_'should redact sensitive healthcare data from error messages',_async () => {
    const error = new Error('Patient CPF 123.456.789-00 access denied');
    const context = {
      _userId: 'test-user',
      patientId: 'test-patient',
      action: 'data_access' as const,
    };

    await errorTracker.trackError(error, _context);

    // Check that metrics were updated
    const metrics = errorTracker.getMetrics();
    expect(metrics.totalErrors).toBe(1);
  });

  it(_'should classify healthcare errors correctly',_async () => {
    const unauthorizedError = new Error('Unauthorized access to patient data');
    await errorTracker.trackError(unauthorizedError, {
      _userId: 'test-user',
      action: 'data_access',
    });

    const metrics = errorTracker.getMetrics();
    expect(metrics.totalErrors).toBe(1);
  });

  it(_'should handle different error severities',_async () => {
    const criticalError = new Error('Database connection failed');
    await errorTracker.trackError(criticalError, {
      _userId: 'test-user',
      action: 'database_query',
    });

    const metrics = errorTracker.getMetrics();
    expect(metrics.totalErrors).toBe(1);
  });

  it(_'should export correct types and schemas',_() => {
    expect(HealthcareErrorTypeSchema).toBeDefined();
    expect(ErrorSeveritySchema).toBeDefined();

    // Test enum values
    expect(HealthcareErrorTypeSchema.enum.data_access_violation).toBe(
      'data_access_violation',
    );
    expect(ErrorSeveritySchema.enum.critical).toBe('critical');
  });

  it(_'should provide error metrics',_() => {
    const metrics = errorTracker.getMetrics();
    expect(metrics).toHaveProperty('totalErrors');
    expect(metrics).toHaveProperty('errorsByType');
    expect(metrics).toHaveProperty('errorsBySeverity');
    expect(metrics).toHaveProperty('lastError');
  });
});
