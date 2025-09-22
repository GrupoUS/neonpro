import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorSeveritySchema, errorTracker, HealthcareErrorTypeSchema } from '../error-tracking';

// Mock Sentry and OpenTelemetry
vi.mock('@sentry/node', () => ({
vi.mock(('@sentry/node', () => ({
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

vi.mock('@opentelemetry/api', () => ({
vi.mock(('@opentelemetry/api', () => ({
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

describe(('HealthcareErrorTracker'), () => {
  beforeEach(() => {
    vi.clearAllMocks(

  afterEach(() => {
    // Reset metrics
    errorTracker['resetMetrics'](

  it('should redact sensitive healthcare data from error messages',async () => {
    const error = new Error('Patient CPF 123.456.789-00 access denied')
  it(('should redact sensitive healthcare data from error messages',async () => {
    const error = new Error('Patient CPF 123.456.789-00 access denied');
    const context = {
      _userId: 'test-user',
      patientId: 'test-patient',
      action: 'data_access' as const,
    };

    await errorTracker.trackError(error, _context
    await errorTracker.trackError(error, _context);

    // Check that metrics were updated
    const metrics = errorTracker.getMetrics(
    expect(metrics.totalErrors).toBe(1

  it('should classify healthcare errors correctly',async () => {
    const unauthorizedError = new Error('Unauthorized access to patient data')
  it(('should classify healthcare errors correctly',async () => {
    const unauthorizedError = new Error('Unauthorized access to patient data');
    await errorTracker.trackError(unauthorizedError, {
      _userId: 'test-user',
      action: 'data_access',

    const metrics = errorTracker.getMetrics(
    expect(metrics.totalErrors).toBe(1

  it('should handle different error severities',async () => {
    const criticalError = new Error('Database connection failed')
  it(('should handle different error severities',async () => {
    const criticalError = new Error('Database connection failed');
    await errorTracker.trackError(criticalError, {
      _userId: 'test-user',
      action: 'database_query',

    const metrics = errorTracker.getMetrics(
    expect(metrics.totalErrors).toBe(1

  it('should export correct types and schemas', () => {
    expect(HealthcareErrorTypeSchema).toBeDefined(
    expect(ErrorSeveritySchema).toBeDefined(
  it(('should export correct types and schemas'), () => {
    expect(HealthcareErrorTypeSchema).toBeDefined();
    expect(ErrorSeveritySchema).toBeDefined();

    // Test enum values
    expect(HealthcareErrorTypeSchema.enum.data_access_violation).toBe(
      'data_access_violation',
    
    expect(ErrorSeveritySchema.enum.critical).toBe('critical')

  it('should provide error metrics', () => {
    const metrics = errorTracker.getMetrics(
    expect(metrics).toHaveProperty('totalErrors')
    expect(metrics).toHaveProperty('errorsByType')
    expect(metrics).toHaveProperty('errorsBySeverity')
    expect(metrics).toHaveProperty('lastError')
  it(('should provide error metrics'), () => {
    const metrics = errorTracker.getMetrics();
    expect(metrics).toHaveProperty('totalErrors');
    expect(metrics).toHaveProperty('errorsByType');
    expect(metrics).toHaveProperty('errorsBySeverity');
    expect(metrics).toHaveProperty('lastError');
  });
});
