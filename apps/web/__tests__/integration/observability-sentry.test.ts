import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockScope, mockTransaction, mockSentry } = vi.hoisted(() => {
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
  };

  return { mockScope, mockTransaction, mockSentry };
}

vi.mock('@sentry/react', () => mockSentry
vi.mock('@sentry/tracing', () => ({
  BrowserTracing: vi.fn(() => ({})),
})

// Import after mocks so the module under test picks them up
import {
  initializeHealthcareErrorTracking,
  trackHealthcareError,
  trackHealthcarePerformance,
} from '../../src/lib/sentry';

describe('healthcare Sentry integration', () => {
  beforeEach(() => {
    vi.resetAllMocks(
    process.env.SENTRY_DSN = 'https://examplePublicKey@sentry.io/123';
    process.env.NODE_ENV = 'test';
    process.env.VERCEL_GIT_COMMIT_SHA = 'test-sha';
    process.env.VITE_ENABLE_SENTRY = 'true';
  }

  afterEach(() => {
    delete process.env.SENTRY_DSN;
    delete process.env.NODE_ENV;
    delete process.env.VERCEL_GIT_COMMIT_SHA;
    delete process.env.VITE_ENABLE_SENTRY;
  }

  it('initializes Sentry with LGPD-compliant configuration', () => {
    initializeHealthcareErrorTracking({ environment: 'test' }

    expect(mockSentry.init).toHaveBeenCalledTimes(1
    const config = mockSentry.init.mock.calls[0][0];

    expect(config.dsn).toBe('https://examplePublicKey@sentry.io/123')
    expect(config.environment).toBe('test')
    expect(config.tracesSampleRate).toBeGreaterThan(0
    expect(typeof config.beforeSend).toBe('function')
    expect(typeof config.beforeBreadcrumb).toBe('function')
    expect(Array.isArray(config.integrations)).toBe(true);
    expect(mockScope.addEventProcessor).toHaveBeenCalled(
  }
  it('captures healthcare errors with sanitized context', () => {
    const error = new Error('Patient João reported downtime')

    trackHealthcareError(error, {
      medicalContext: 'consultation',
      securityLevel: 'restricted',
      patientId: '123',
      workflowStep: 'triage',
      complianceRequirements: ['lgpd'],
      userRole: 'doctor',
    }

    expect(mockSentry.withScope).toHaveBeenCalledTimes(1
    expect(mockScope.setTag).toHaveBeenCalledWith(
      'healthcare.error.category',
      expect.any(String),
    
    expect(mockSentry.captureException).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        tags: expect.any(Object),
        extra: expect.any(Object),
      }),
    
  }

  it('tracks healthcare performance operations, finishing the transaction even on errors', async () => {
    const operation = vi.fn(async () => {
      throw new Error('Timeout contacting AI model')
    }

    await expect(
      trackHealthcarePerformance('ai-analysis', operation, {
        medicalContext: 'ai',
        securityLevel: 'restricted',
      }),
    ).rejects.toThrow('Timeout contacting AI model')

    expect(mockSentry.startTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'ai-analysis',
        op: 'healthcare_operation',
      }),
    
    expect(mockTransaction.finish).toHaveBeenCalled(
  }
}
