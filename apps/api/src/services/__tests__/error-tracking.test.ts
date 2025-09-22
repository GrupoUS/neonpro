import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorSeveritySchema, errorTracker, HealthcareErrorTypeSchema } from '../error-tracking';

// Mock Sentry and OpenTelemetry
<<<<<<< HEAD
vi.mock('@sentry/node'), () => ({
=======
vi.mock(_'@sentry/node'), () => ({
>>>>>>> origin/main
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
})

<<<<<<< HEAD
vi.mock('@opentelemetry/api'), () => ({
=======
vi.mock(_'@opentelemetry/api'), () => ({
>>>>>>> origin/main
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
})

describe(_'HealthcareErrorTracker'), () => {
  beforeEach(() => {
    vi.clearAllMocks(

  afterEach(() => {
    // Reset metrics
    errorTracker['resetMetrics'](

<<<<<<< HEAD
  it('should redact sensitive healthcare data from error messages',async () => {
    const error = new Error('Patient CPF 123.456.789-00 access denied')
=======
  it(_'should redact sensitive healthcare data from error messages',async () => {
    const error = new Error('Patient CPF 123.456.789-00 access denied');
>>>>>>> origin/main
    const context = {
      _userId: 'test-user',
      patientId: 'test-patient',
      action: 'data_access' as const,
    };

<<<<<<< HEAD
    await errorTracker.trackError(error, _context
=======
    await errorTracker.trackError(error, _context);
>>>>>>> origin/main

    // Check that metrics were updated
    const metrics = errorTracker.getMetrics(
    expect(metrics.totalErrors).toBe(1

<<<<<<< HEAD
  it('should classify healthcare errors correctly',async () => {
    const unauthorizedError = new Error('Unauthorized access to patient data')
=======
  it(_'should classify healthcare errors correctly',async () => {
    const unauthorizedError = new Error('Unauthorized access to patient data');
>>>>>>> origin/main
    await errorTracker.trackError(unauthorizedError, {
      _userId: 'test-user',
      action: 'data_access',

    const metrics = errorTracker.getMetrics(
    expect(metrics.totalErrors).toBe(1

<<<<<<< HEAD
  it('should handle different error severities',async () => {
    const criticalError = new Error('Database connection failed')
=======
  it(_'should handle different error severities',async () => {
    const criticalError = new Error('Database connection failed');
>>>>>>> origin/main
    await errorTracker.trackError(criticalError, {
      _userId: 'test-user',
      action: 'database_query',

    const metrics = errorTracker.getMetrics(
    expect(metrics.totalErrors).toBe(1

<<<<<<< HEAD
  it('should export correct types and schemas', () => {
    expect(HealthcareErrorTypeSchema).toBeDefined(
    expect(ErrorSeveritySchema).toBeDefined(
=======
  it(_'should export correct types and schemas'), () => {
    expect(HealthcareErrorTypeSchema).toBeDefined();
    expect(ErrorSeveritySchema).toBeDefined();
>>>>>>> origin/main

    // Test enum values
    expect(HealthcareErrorTypeSchema.enum.data_access_violation).toBe(
      'data_access_violation',
    
    expect(ErrorSeveritySchema.enum.critical).toBe('critical')

<<<<<<< HEAD
  it('should provide error metrics', () => {
    const metrics = errorTracker.getMetrics(
    expect(metrics).toHaveProperty('totalErrors')
    expect(metrics).toHaveProperty('errorsByType')
    expect(metrics).toHaveProperty('errorsBySeverity')
    expect(metrics).toHaveProperty('lastError')
=======
  it(_'should provide error metrics'), () => {
    const metrics = errorTracker.getMetrics();
    expect(metrics).toHaveProperty('totalErrors');
    expect(metrics).toHaveProperty('errorsByType');
    expect(metrics).toHaveProperty('errorsBySeverity');
    expect(metrics).toHaveProperty('lastError');
  });
});
>>>>>>> origin/main
