import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockScope = {
  setTag: vi.fn(),
  setContext: vi.fn(),
  setLevel: vi.fn(),
  addEventProcessor: vi.fn(),
};

const mockTransaction = {
  setTag: vi.fn(),
  setContext: vi.fn(),
  finish: vi.fn(),
};

const mockSentry = {
  init: vi.fn(),
  configureScope: vi.fn((cb: any) => cb(mockScope)),
  withScope: vi.fn((cb: any) => cb(mockScope)),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  startTransaction: vi.fn(() => mockTransaction),
  reactRouterV6Instrumentation: vi.fn(() => vi.fn()),
};

vi.mock('@sentry/react', () => mockSentry);
vi.mock('@sentry/tracing', () => ({
  BrowserTracing: vi.fn(() => ({})),
}));

// Import after mocks so the module under test picks them up
import {
  initializeHealthcareErrorTracking,
  trackHealthcareError,
  trackHealthcarePerformance,
} from '../../src/lib/observability/sentry';

describe('healthcare Sentry integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.SENTRY_DSN = 'https://examplePublicKey@sentry.io/123';
    process.env.NODE_ENV = 'test';
    process.env.VERCEL_GIT_COMMIT_SHA = 'test-sha';
  });

  afterEach(() => {
    delete process.env.SENTRY_DSN;
    delete process.env.NODE_ENV;
    delete process.env.VERCEL_GIT_COMMIT_SHA;
  });

  it('initializes Sentry with LGPD-compliant configuration', () => {
    initializeHealthcareErrorTracking();

    expect(mockSentry.init).toHaveBeenCalledTimes(1);
    const config = mockSentry.init.mock.calls[0][0];

    expect(config.dsn).toBe('https://examplePublicKey@sentry.io/123');
    expect(config.environment).toBe('test');
    expect(config.tracesSampleRate).toBeGreaterThan(0);
    expect(typeof config.beforeSend).toBe('function');
    expect(typeof config.beforeBreadcrumb).toBe('function');
    expect(Array.isArray(config.integrations)).toBe(true);
    expect(mockScope.addEventProcessor).toHaveBeenCalled();
  });  it('captures healthcare errors with sanitized context', () => {
    const error = new Error('Patient João reported downtime');

    trackHealthcareError(error, {
      medical_context: 'consultation',
      security_level: 'restricted',
      patient_id: '123',
      workflow_step: 'triage',
      compliance_requirements: ['lgpd'],
      user_role: 'doctor',
    });

    expect(mockSentry.withScope).toHaveBeenCalledTimes(1);
    expect(mockScope.setTag).toHaveBeenCalledWith('healthcare.error.category', expect.any(String));
    expect(mockSentry.captureException).toHaveBeenCalledWith(error, expect.objectContaining({
      tags: expect.any(Object),
      extra: expect.any(Object),
    }));
  });

  it('tracks healthcare performance operations, finishing the transaction even on errors', async () => {
    const operation = vi.fn(async () => {
      throw new Error('Timeout contacting AI model');
    });

    await expect(
      trackHealthcarePerformance('ai-analysis', operation, {
        medical_context: 'ai',
        security_level: 'restricted',
      })
    ).rejects.toThrow('Timeout contacting AI model');

    expect(mockSentry.startTransaction).toHaveBeenCalledWith(expect.objectContaining({
      name: 'ai-analysis',
      op: 'healthcare_operation',
    }));
    expect(mockTransaction.finish).toHaveBeenCalled();
  });
});