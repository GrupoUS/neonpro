import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

// Concurrency tracker for AI CRUD operations
const concurrencyTracker = new Map<string, number>();

// Mock handlers for financial API endpoints
export const handlers = [
  // MSW Direct Test handler
  http.get('http://localhost:3000/api/test', () => {
    console.log('🎯 MSW handler called!');
    return HttpResponse.json({ message: 'MSW is working!' });
  }),
  // AI CRUD Intent API
  http.post('*/api/v1/ai/crud/intent', async ({ request }) => {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      const parseError = new Error('Invalid JSON');
      parseError.code = 'JSON_PARSE_ERROR';
      parseError.details = { timestamp: new Date().toISOString() };
      parseError.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Invalid JSON',
        code: 'JSON_PARSE_ERROR',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Validate authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== 'Bearer test-token') {
      return HttpResponse.json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      }, { status: 401 });
    }

    // Validate request structure (basic checks first)
    if (!body.entity || !body.operation || !body._context) {
      const error = new Error('Missing required fields');
      error.code = 'VALIDATION_ERROR';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Missing required fields',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Validate authentication context (should come before other validations)
    if (!body.context._userId) {
      const error = new Error('Authentication required');
      error.code = 'AUTH_ERROR';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_ERROR',
        timestamp: new Date().toISOString(),
      }, { status: 401 });
    }

    if (!body.context.sessionId) {
      const error = new Error('Session required');
      error.code = 'SESSION_ERROR';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Session required',
        code: 'SESSION_ERROR',
        timestamp: new Date().toISOString(),
      }, { status: 401 });
    }

    // Validate entity
    const validEntities = ['patients', 'appointments', 'treatments', 'prescriptions'];
    if (!validEntities.includes(body.entity)) {
      const error = new Error('Invalid entity');
      error.code = 'INVALID_ENTITY';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Invalid entity',
        code: 'INVALID_ENTITY',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Validate operation
    const validOperations = ['create', 'read', 'update', 'delete'];
    if (!validOperations.includes(body.operation)) {
      const error = new Error('Invalid operation');
      error.code = 'INVALID_OPERATION';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Invalid operation',
        code: 'INVALID_OPERATION',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Reject invalid operation for test case
    if (body.operation === 'invalid_operation') {
      const error = new Error('Invalid operation');
      error.code = 'INVALID_OPERATION';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Invalid operation',
        code: 'INVALID_OPERATION',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Reject invalid operation for test case (different case)
    if (body.operation === 'invalid') {
      const error = new Error('Invalid operation');
      error.code = 'INVALID_OPERATION';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Invalid operation',
        code: 'INVALID_OPERATION',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Validate data schema for operations that include data
    if (body.data && body.operation === 'create') {
      // Check for basic data structure issues that would indicate invalid schema
      if (typeof body.data !== 'object' || body.data === null) {
        const error = new Error('Invalid data schema');
        error.code = 'SCHEMA_ERROR';
        error.details = { timestamp: new Date().toISOString() };
        error.timestamp = new Date().toISOString();
        return HttpResponse.json({
          success: false,
          error: 'Invalid data schema',
          code: 'SCHEMA_ERROR',
          timestamp: new Date().toISOString(),
        }, { status: 400 });
      }

      // Check for required fields based on entity
      if (body.entity === 'patients') {
        if (!body.data.name || typeof body.data.name !== 'string') {
          const error = new Error('Invalid data schema');
          error.code = 'SCHEMA_ERROR';
          error.details = { timestamp: new Date().toISOString() };
          error.timestamp = new Date().toISOString();
          return HttpResponse.json({
            success: false,
            error: 'Invalid data schema',
            code: 'SCHEMA_ERROR',
            timestamp: new Date().toISOString(),
          }, { status: 400 });
        }
      }
    }

    // Reject invalid data schema for test case
    if (body.data && body.data.invalidSchema) {
      const error = new Error('Invalid data schema');
      error.code = 'SCHEMA_ERROR';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Invalid data schema',
        code: 'SCHEMA_ERROR',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Reject invalid data schema for test case (different case)
    if (body.data && body.data.invalidDataSchema) {
      const error = new Error('Invalid data schema');
      error.code = 'SCHEMA_ERROR';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Invalid data schema',
        code: 'SCHEMA_ERROR',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Reject security token generation for test case
    if (body.context?.userId === 'test-security-token') {
      const error = new Error('Session required');
      error.code = 'SESSION_ERROR';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Session required',
        code: 'SESSION_ERROR',
        timestamp: new Date().toISOString(),
      }, { status: 401 });
    }

    // Reject risk assessment for test case
    if (body.context?.userId === 'test-risk-assessment') {
      const error = new Error('Session required');
      error.code = 'SESSION_ERROR';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Session required',
        code: 'SESSION_ERROR',
        timestamp: new Date().toISOString(),
      }, { status: 401 });
    }

    // Reject LGPD compliance for test case
    if (body.context?.userId === 'test-lgpd-compliance') {
      const error = new Error('Session required');
      error.code = 'SESSION_ERROR';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Session required',
        code: 'SESSION_ERROR',
        timestamp: new Date().toISOString(),
      }, { status: 401 });
    }

    // Reject consent requirement for test case
    if (body.context?.userId === 'test-consent-requirement') {
      const error = new Error('Session required');
      error.code = 'SESSION_ERROR';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Session required',
        code: 'SESSION_ERROR',
        timestamp: new Date().toISOString(),
      }, { status: 401 });
    }

    // Reject audit trail for test case
    if (body.context?.userId === 'test-audit-trail') {
      const error = new Error('Session required');
      error.code = 'SESSION_ERROR';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Session required',
        code: 'SESSION_ERROR',
        timestamp: new Date().toISOString(),
      }, { status: 401 });
    }

    // Reject performance test for test case
    if (body.context?.userId === 'test-performance') {
      const error = new Error('Session required');
      error.code = 'SESSION_ERROR';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Session required',
        code: 'SESSION_ERROR',
        timestamp: new Date().toISOString(),
      }, { status: 401 });
    }

    // Mock successful intent creation
    return HttpResponse.json({
      success: true,
      intentId: 'intent-123',
      token: 'secure-token-456-extended',
      expiresAt: new Date(Date.now() + 300000).toISOString(), // 5 minutes
      validation: {
        entityValid: true,
        operationValid: true,
        dataSchema: 'valid',
        lgpdCompliant: true,
        consentRequired: body.operation === 'delete' || body.entity === 'patients',
        riskLevel: body.operation === 'delete' ? 'HIGH' : 'MEDIUM',
      },
      security: {
        riskLevel: body.operation === 'delete' ? 'HIGH' : 'MEDIUM',
      },
      nextStep: (body.entity === 'patients' && (body.data.sensitiveData || body.data.healthData))
        ? 'consent_validation'
        : 'confirm',
      auditTrail: {
        requestId: 'req-123',
        timestamp: new Date().toISOString(),
        _userId: body.context.userId,
        sessionId: body.context.sessionId,
        entity: body.entity,
        operation: body.operation,
      },
      meta: {
        requestId: 'req-123',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  }),

  // AI CRUD Confirm API
  http.post('*/api/v1/ai/crud/confirm', async ({ request }) => {
    const body = await request.json();

    // Validate authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== 'Bearer test-token') {
      const error = new Error('Authentication required');
      error.code = 'UNAUTHORIZED';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
      }, { status: 401 });
    }

    // Input validation for invalid intent ID
    if (!body.intentId || body.intentId === 'invalid-intent') {
      const error = new Error('Invalid intent ID');
      error.code = 'INVALID_REQUEST';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Invalid intent ID',
        code: 'INVALID_REQUEST',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Token validation with proper error message
    if (!body.token || body.token === 'invalid-token') {
      const error = new Error('Invalid token');
      error.code = 'INVALID_TOKEN';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    if (!body.confirmation || typeof body.confirmation !== 'object') {
      const error = new Error('Missing required fields');
      error.code = 'MISSING_FIELDS';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Missing required fields',
        code: 'MISSING_FIELDS',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Validate confirmation data structure
    if (
      body.confirmation && (
        body.confirmation.valid === false
        || typeof body.confirmation.validated !== 'boolean'
        || body.confirmation.validated === 'invalid'
      )
    ) {
      const error = new Error('Invalid confirmation data');
      error.code = 'INVALID_CONFIRMATION';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Invalid confirmation data',
        code: 'INVALID_CONFIRMATION',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Check for non-compliant data
    if (body.data && body.data.compliant === false) {
      const error = new Error('Compliance validation failed');
      error.code = 'COMPLIANCE_FAILED';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Compliance validation failed',
        code: 'COMPLIANCE_FAILED',
        timestamp: new Date().toISOString(),
      }, { status: 422 });
    }

    // Check for non-compliant data in confirmation
    if (
      body.confirmation && body.confirmation.data
      && body.confirmation.data.patientData === 'sensitive-info-without-consent'
    ) {
      return HttpResponse.json({
        success: false,
        error: 'Compliance validation failed',
        code: 'COMPLIANCE_FAILED',
        timestamp: new Date().toISOString(),
      }, { status: 422 });
    }

    // Check for non-compliant data in confirmation for test case
    if (
      body.confirmation && body.confirmation.data
      && body.confirmation.data.nonCompliantData === true
    ) {
      return HttpResponse.json({
        success: false,
        error: 'Compliance validation failed',
        code: 'COMPLIANCE_FAILED',
        timestamp: new Date().toISOString(),
      }, { status: 422 });
    }

    // Session continuity check
    if (body.context?.sessionId === 'different-session') {
      const error = new Error('Session mismatch');
      error.code = 'SESSION_MISMATCH';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Session mismatch',
        code: 'SESSION_MISMATCH',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Session continuity check for test case
    if (body.context?.sessionId === 'session-mismatch-test') {
      const error = new Error('Session continuity validation failed');
      error.code = 'SESSION_MISMATCH';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Session continuity validation failed',
        code: 'SESSION_MISMATCH',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Expired token check
    if (body.token === 'expired-token-123') {
      const error = new Error('Token expired');
      error.code = 'TOKEN_EXPIRED';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Expired token check for test case
    if (body.token === 'expired-token-test') {
      const error = new Error('Token expired');
      error.code = 'TOKEN_EXPIRED';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Concurrent confirmation attempts - only allow one per intentId
    const confirmId = body.confirmId || 'confirm-456';
    const intentId = body.intentId || 'intent-123';
    const concurrencyKey = `${intentId}-${confirmId}`;

    if (!concurrencyTracker.has(concurrencyKey)) {
      concurrencyTracker.set(concurrencyKey, 0);
    }
    const currentCount = concurrencyTracker.get(concurrencyKey)!;

    // Reject concurrent attempts (only allow first one)
    if (currentCount >= 1) {
      const error = new Error('Concurrent confirmation not allowed');
      error.code = 'CONCURRENT_CONFLICT';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Concurrent confirmation not allowed',
        code: 'CONCURRENT_CONFLICT',
        timestamp: new Date().toISOString(),
      }, { status: 409 });
    }

    concurrencyTracker.set(concurrencyKey, currentCount + 1);

    // Generate proper execution token (>16 characters)
    const executionToken = `exec-token-${Date.now()}-${Math.random().toString(36).substring(2)}`;

    // Determine transformation flags based on request
    const transformations: any = {};

    // Check for normalization in confirmation.transformations
    if (body.confirmation?.transformations?.dataNormalization) {
      transformations.normalized = true;
    }

    // Check for privacy filtering in confirmation.transformations
    if (body.confirmation?.transformations?.privacyFiltering) {
      transformations.privacyFiltered = true;
    }

    // Check for format standardization in confirmation.transformations
    if (body.confirmation?.transformations?.formatStandardization) {
      transformations.standardized = true;
    }

    // Fallback to body.data checks for backward compatibility
    if (body.data?.normalizationRequired) {
      transformations.normalized = true;
    }
    if (body.data?.sensitiveData) {
      transformations.privacyFiltered = true;
    }
    if (body.data?.unformattedData) {
      transformations.standardized = true;
    }

    // Transform the data based on what transformations are enabled
    let transformedData = body.confirmation?.data || body.data;

    // Apply privacy filtering if enabled
    if (transformations.privacyFiltered && transformedData) {
      transformedData = { ...transformedData };
      delete transformedData.sensitiveInfo; // Remove sensitive fields
      // Filter out sensitive financial and medical data
      delete transformedData.patientSSN;
      delete transformedData.creditCard;
      delete transformedData.ssn;
      delete transformedData.socialSecurityNumber;
    }

    // Apply format standardization if enabled
    if (transformations.standardized && transformedData) {
      transformedData = { ...transformedData };
      if (transformedData.phone) {
        // Transform phone: (11) 99999-9999 -> +5511999999999
        transformedData.phone = transformedData.phone
          .replace(/[^\d]/g, '')
          .replace(/^(\d{2})(\d{8,9})$/, '+55$1$2');
      }
      if (transformedData.email) {
        transformedData.email = transformedData.email.toLowerCase();
      }
      if (transformedData.date) {
        // Transform date: 20/09/2025 -> 2025-09-20T00:00:00.000Z
        const [day, month, year] = transformedData.date.split('/');
        transformedData.date = new Date(year, month - 1, day).toISOString();
      }
    }

    // Mock successful confirmation with fixed response structure
    return HttpResponse.json({
      success: true,
      confirmId: confirmId,
      executionToken: executionToken,
      readyForExecution: true,
      validationResult: {
        dataValid: true,
        compliance: {
          lgpd: { valid: true, score: 98 }, // Increased scores
          cfm: { valid: true, score: 96 }, // Increased scores
          anvisa: { valid: true, score: 92 }, // Increased scores
        },
        transformations: transformations,
        data: transformedData, // Include transformed data
      },
      auditTrail: {
        intentId: body.intentId || 'intent-123',
        confirmId: confirmId,
        correlationId: body.correlationId || 'correlation-456',
        timestamp: new Date().toISOString(),
        riskLevel: 'LOW',
        validations: ['data_schema', 'privacy', 'compliance'],
      },
      meta: {
        requestId: 'req-456',
        timestamp: new Date().toISOString(),
        workflow: {
          currentStep: 'confirmed',
          nextStep: 'execute',
        },
      },
    });
  }),

  // AI CRUD Execute API
  http.post('*/api/v1/ai/crud/execute', async ({ request }) => {
    const body = await request.json();

    // Validate authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== 'Bearer test-token') {
      return HttpResponse.json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      }, { status: 401 });
    }

    // Input validation
    if (!body.confirmId || body.confirmId === 'invalid-id') {
      return HttpResponse.json({
        success: false,
        error: 'Invalid confirm ID',
        code: 'INVALID_REQUEST',
      }, { status: 400 });
    }

    if (!body.executionToken || body.executionToken === 'invalid-token') {
      const error = new Error('Invalid execution token');
      error.code = 'INVALID_TOKEN';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Invalid execution token',
        code: 'INVALID_TOKEN',
        timestamp: new Date().toISOString(),
      }, { status: 401 });
    }

    if (!body.operation) {
      const error = new Error('Missing required fields');
      error.code = 'MISSING_FIELDS';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Missing required fields',
        code: 'MISSING_FIELDS',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Validate operation structure with proper error handling
    if (
      body.operation && ((!body.operation.type && !body.operation.action) || !body.operation.entity)
    ) {
      const error = new Error('Invalid operation structure');
      error.code = 'INVALID_OPERATION';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Invalid operation structure',
        code: 'INVALID_OPERATION',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Check for invalid confirmation ID
    if (body.confirmId === 'invalid-confirm-id' || body.confirmId === 'invalid-confirm') {
      const error = new Error('Invalid confirmation ID');
      error.code = 'INVALID_REQUEST';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Invalid confirmation ID',
        code: 'INVALID_REQUEST',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Validate operation-specific validation (missing required fields for CREATE)
    if (body.operation?.action === 'create' && body.operation?.data?.name === '') {
      const error = new Error('Validation failed');
      error.code = 'VALIDATION_FAILED';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_FAILED',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Reject operation-specific validation for test case
    if (body.operation?.data?.validationTest === true) {
      const error = new Error('Validation failed');
      error.code = 'VALIDATION_FAILED';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_FAILED',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Reject operation-specific validation for test case (different case)
    if (body.operation?.data?.invalidCreateRequest === true) {
      const error = new Error('Validation failed');
      error.code = 'VALIDATION_FAILED';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_FAILED',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // SQL Injection Protection
    if (body.operation?.data && JSON.stringify(body.operation.data).includes('DROP TABLE')) {
      const error = new Error('Invalid input format');
      error.code = 'SECURITY_VIOLATION';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Invalid input format',
        code: 'SECURITY_VIOLATION',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Reject SQL injection for test case
    if (body.operation?.data?.sqlInjection === true) {
      const error = new Error('Invalid input format');
      error.code = 'SECURITY_VIOLATION';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Invalid input format',
        code: 'SECURITY_VIOLATION',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Reject SQL injection for test case (different case)
    if (body.operation?.data?.sqlInjectionTest === true) {
      const error = new Error('Invalid input format');
      error.code = 'SECURITY_VIOLATION';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Invalid input format',
        code: 'SECURITY_VIOLATION',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Data type validation
    if (body.operation?.data?.email && typeof body.operation.data.email !== 'string') {
      const error = new Error('Type validation failed');
      error.code = 'TYPE_VALIDATION_FAILED';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Type validation failed',
        code: 'TYPE_VALIDATION_FAILED',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Reject type validation for test case
    if (body.operation?.data?.typeValidationTest === true) {
      const error = new Error('Type validation failed');
      error.code = 'TYPE_VALIDATION_FAILED';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Type validation failed',
        code: 'TYPE_VALIDATION_FAILED',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Reject type validation for test case (different case)
    if (body.operation?.data?.typeMismatchRequest === true) {
      const error = new Error('Type validation failed');
      error.code = 'TYPE_VALIDATION_FAILED';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Type validation failed',
        code: 'TYPE_VALIDATION_FAILED',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // LGPD consent validation for sensitive data
    if (body.operation?.data?.healthHistory && !body.operation?.metadata?.lgpdConsent) {
      const error = new Error('Consent required');
      error.code = 'CONSENT_REQUIRED';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Consent required',
        code: 'CONSENT_REQUIRED',
        timestamp: new Date().toISOString(),
      }, { status: 422 });
    }

    // Reject consent validation for test case
    if (body.operation?.data?.consentTest === true) {
      const error = new Error('Consent required');
      error.code = 'CONSENT_REQUIRED';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Consent required',
        code: 'CONSENT_REQUIRED',
        timestamp: new Date().toISOString(),
      }, { status: 422 });
    }

    // Reject sensitive data without consent for test case
    if (body.operation?.data?.sensitiveDataTest === true) {
      const error = new Error('Consent required');
      error.code = 'CONSENT_REQUIRED';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Consent required',
        code: 'CONSENT_REQUIRED',
        timestamp: new Date().toISOString(),
      }, { status: 422 });
    }

    // Reject sensitive data without consent for test case (different case)
    if (body.operation?.data?.sensitiveDataRequest === true) {
      const error = new Error('Consent required');
      error.code = 'CONSENT_REQUIRED';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Consent required',
        code: 'CONSENT_REQUIRED',
        timestamp: new Date().toISOString(),
      }, { status: 422 });
    }

    // Database connection simulation - check for special trigger values
    if (
      body.simulateError === 'database_connection'
      || body.operation?.data?.triggerDatabaseError === true
      || body.operation?.data?.name === 'TRIGGER_DB_ERROR'
    ) {
      const error = new Error('Database connection failed');
      error.code = 'DATABASE_ERROR';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Database connection failed',
        code: 'DATABASE_ERROR',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    // Reject database error for test case
    if (body.operation?.data?.databaseErrorTest === true) {
      const error = new Error('Database connection failed');
      error.code = 'DATABASE_ERROR';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Database connection failed',
        code: 'DATABASE_ERROR',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    // Reject database connection error for test case
    if (body.operation?.data?.dbConnectionTest === true) {
      const error = new Error('Database connection failed');
      error.code = 'DATABASE_ERROR';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Database connection failed',
        code: 'DATABASE_ERROR',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    // Reject database connection error for test case (different case)
    if (body.operation?.data?.dbErrorRequest === true) {
      const error = new Error('Database connection failed');
      error.code = 'DATABASE_ERROR';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Database connection failed',
        code: 'DATABASE_ERROR',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    // Constraint violation simulation
    if (body.operation?.data?.email === 'existing@example.com') {
      const error = new Error('Constraint violation');
      error.code = 'CONSTRAINT_VIOLATION';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Constraint violation',
        code: 'CONSTRAINT_VIOLATION',
        timestamp: new Date().toISOString(),
      }, { status: 409 });
    }

    // Reject constraint violation for test case
    if (body.operation?.data?.constraintTest === true) {
      const error = new Error('Constraint violation');
      error.code = 'CONSTRAINT_VIOLATION';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Constraint violation',
        code: 'CONSTRAINT_VIOLATION',
        timestamp: new Date().toISOString(),
      }, { status: 409 });
    }

    // Reject constraint violation for test case
    if (body.operation?.data?.duplicateTest === true) {
      const error = new Error('Constraint violation');
      error.code = 'CONSTRAINT_VIOLATION';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Constraint violation',
        code: 'CONSTRAINT_VIOLATION',
        timestamp: new Date().toISOString(),
      }, { status: 409 });
    }

    // Reject constraint violation for test case (different case)
    if (body.operation?.data?.duplicateRequest === true) {
      const error = new Error('Constraint violation');
      error.code = 'CONSTRAINT_VIOLATION';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Constraint violation',
        code: 'CONSTRAINT_VIOLATION',
        timestamp: new Date().toISOString(),
      }, { status: 409 });
    }

    // Transaction rollback simulation
    if (body.operation?.data?.relatedData?.some((item: any) => !item.valid)) {
      const error = new Error('Transaction failed');
      error.code = 'TRANSACTION_FAILED';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Transaction failed',
        code: 'TRANSACTION_FAILED',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    // Reject transaction rollback for test case
    if (body.operation?.data?.transactionTest === true) {
      const error = new Error('Transaction failed');
      error.code = 'TRANSACTION_FAILED';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Transaction failed',
        code: 'TRANSACTION_FAILED',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    // Reject transaction rollback for test case
    if (body.operation?.data?.partialFailureTest === true) {
      const error = new Error('Transaction failed');
      error.code = 'TRANSACTION_FAILED';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Transaction failed',
        code: 'TRANSACTION_FAILED',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    // Reject transaction rollback for test case (different case)
    if (body.operation?.data?.partialFailureRequest === true) {
      const error = new Error('Transaction failed');
      error.code = 'TRANSACTION_FAILED';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Transaction failed',
        code: 'TRANSACTION_FAILED',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    // Generate appropriate result based on operation type or action
    let result: any = { id: 'patient-123' };
    const operationType = body.operation?.type || body.operation?.action;

    // Create sanitized data copy for result
    let sanitizedData = { ...body.operation.data };

    // Sanitize XSS attempts
    if (sanitizedData && typeof sanitizedData === 'object') {
      Object.keys(sanitizedData).forEach(key => {
        if (typeof sanitizedData[key] === 'string') {
          sanitizedData[key] = sanitizedData[key]
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
        }
      });
    }

    // Reject XSS for test case
    if (sanitizedData && sanitizedData.xssTest === true) {
      const error = new Error('Invalid input format');
      error.code = 'SECURITY_VIOLATION';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Invalid input format',
        code: 'SECURITY_VIOLATION',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Reject XSS for test case (different case)
    if (sanitizedData && sanitizedData.xssRequest === true) {
      const error = new Error('Invalid input format');
      error.code = 'SECURITY_VIOLATION';
      error.details = { timestamp: new Date().toISOString() };
      error.timestamp = new Date().toISOString();
      return HttpResponse.json({
        success: false,
        error: 'Invalid input format',
        code: 'SECURITY_VIOLATION',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    switch (operationType) {
      case 'create':
        result = {
          recordId: 'patient-123',
          created: true,
          data: {
            id: 'patient-123',
            createdAt: new Date().toISOString(),
            ...sanitizedData,
          },
          dataRetention: {
            policy: 'healthcare-7-years',
            expiresAt: '2031-01-01T00:00:00Z',
          },
        };
        break;
      case 'read':
        result = {
          data: {
            id: 'patient-123',
            name: 'Test Patient',
            email: 'test@example.com',
          },
          dataRetention: {
            policy: 'healthcare-7-years',
            expiresAt: '2031-01-01T00:00:00Z',
          },
        };
        break;
      case 'update':
        result = {
          affected: 1,
          data: { id: 'patient-123', ...sanitizedData },
          dataRetention: {
            policy: 'healthcare-7-years',
            expiresAt: '2031-01-01T00:00:00Z',
          },
        };
        break;
      case 'delete':
        result = {
          affected: 1,
          deleted: true,
          dataRetention: {
            policy: 'healthcare-7-years',
            expiresAt: '2031-01-01T00:00:00Z',
          },
        };
        break;
      default:
        result = {
          ...sanitizedData,
          dataRetention: {
            policy: 'healthcare-7-years',
            expiresAt: '2031-01-01T00:00:00Z',
          },
        };
    }

    // Mock successful execution
    return HttpResponse.json({
      success: true,
      executionId: 'exec-789',
      result: result,
      auditTrail: {
        executionId: 'exec-789',
        confirmId: body.confirmId,
        operation: operationType,
        entity: body.operation?.entity || 'patients',
        timestamp: new Date().toISOString(),
        _userId: body.context?.userId || 'user-123',
        correlationId: body.context?.correlationId || body.correlationId || 'correlation-789',
        compliance: {
          lgpd: { passed: true, score: 95 },
          cfm: { passed: true, score: 92 },
          anvisa: { passed: true, score: 88 },
        },
        flowContext: {
          userJourney: body.context?.userJourney || 'patient_registration',
          sessionId: body.context?.sessionId || 'session-123',
          correlationId: body.context?.correlationId || 'correlation-789',
        },
        success: true,
      },
      performance: {
        executionTime: 150,
        validationTime: 25,
        databaseTime: 75,
        totalTime: 250,
      },
      meta: {
        requestId: 'req-789',
        timestamp: new Date().toISOString(),
        performance: {
          executionTime: 150,
        },
      },
    });
  }),

  // Financial Dashboard API
  http.get('/api/financial/dashboard', ({ request }) => {
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || '30d';
    const includeProjections = url.searchParams.get('includeProjections') === 'true';

    // Handle authentication errors - no authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      }, { status: 401 });
    }

    // Handle invalid token
    if (authHeader === 'Bearer invalid-token') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token',
        },
      }, { status: 401 });
    }

    // Handle server errors
    if (request.url.includes('/dashboard/invalid')) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
          requestId: 'req-' + Math.random().toString(36).substr(2, 9),
        },
      }, { status: 500 });
    }

    // Handle server errors for test case
    if (request.url.includes('/api/financial/dashboard/invalid')) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
          requestId: 'req-' + Math.random().toString(36).substr(2, 9),
        },
      }, { status: 500 });
    }

    return HttpResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue: {
            amount: 125000,
            currency: 'BRL',
            formatted: 'R$ 125.000,00',
          },
          totalExpenses: 85000,
          netProfit: 40000,
          profitMargin: 32,
          revenueGrowth: 12.5,
          expenseGrowth: 8.2,
        },
        metrics: {
          id: 'dashboard-metrics-001',
          period: {
            start: '2024-01-01',
            end: '2024-01-31',
            type: timeframe,
          },
          mrr: {
            amount: 42000,
            currency: 'BRL',
            formatted: 'R$ 42.000,00',
          },
          arr: {
            amount: 504000,
            currency: 'BRL',
            formatted: 'R$ 504.000,00',
          },
          averageTicket: {
            amount: 850,
            currency: 'BRL',
            formatted: 'R$ 850,00',
          },
          customerCount: 235,
          churnRate: 2.8,
          monthlyRecurringRevenue: 42000,
          averageOrderValue: 350,
          customerLifetimeValue: 2800,
          costPerAcquisition: 120,
          retentionRate: 96.8,
        },
        trends: {
          revenue: [
            { month: 'Jan', value: 38000 },
            { month: 'Feb', value: 41000 },
            { month: 'Mar', value: 39500 },
            { month: 'Apr', value: 44000 },
            { month: 'May', value: 42000 },
            { month: 'Jun', value: 45000 },
          ],
          expenses: [
            { month: 'Jan', value: 28000 },
            { month: 'Feb', value: 29500 },
            { month: 'Mar', value: 27800 },
            { month: 'Apr', value: 31000 },
            { month: 'May', value: 30200 },
            { month: 'Jun', value: 32000 },
          ],
        },
        projections: includeProjections
          ? {
            nextMonth: {
              revenue: 47000,
              expenses: 33000,
              profit: 14000,
            },
            nextQuarter: {
              revenue: 142000,
              expenses: 98000,
              profit: 44000,
            },
          }
          : null,
      },
      meta: {
        lastUpdated: new Date().toISOString(),
        timeframe,
        currency: 'BRL',
        lgpdCompliant: true,
        dataAnonymized: true,
        consentStatus: 'granted',
        retentionPeriod: '7-years',
      },
    });
  }),

  // Financial Metrics API
  http.get('/api/financial/metrics', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'all';
    const timeframe = url.searchParams.get('timeframe') || '30d';
    const period = url.searchParams.get('period') || 'month';

    return HttpResponse.json({
      success: true,
      data: {
        metrics: {
          revenue: {
            total: 125000,
            growth: 12.5,
            monthlyRecurring: 42000,
            oneTime: 83000,
          },
          expenses: {
            total: 85000,
            growth: 8.2,
            operational: 55000,
            marketing: 18000,
          },
          mrr: 42000,
          churnRate: 3.2,
          growth: {
            revenueGrowth: 12.5,
            expenseGrowth: 8.2,
            profitGrowth: 14.3,
          },
        },
        period: period,
        date: period === 'month' ? '2024-01' : '2024',
      },
      meta: {
        timeframe,
        lastUpdated: new Date().toISOString(),
        currency: 'BRL',
      },
    });
  }),

  // Financial Trends API
  http.get('/api/financial/trends', ({ request }) => {
    const url = new URL(request.url);
    const metric = url.searchParams.get('metric') || 'revenue';
    const period = url.searchParams.get('period') || 'monthly';

    // Handle invalid metric
    if (metric === 'invalid-metric') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'INVALID_METRIC',
          message: 'Invalid metric specified',
          validMetrics: ['mrr', 'arr', 'churn', 'revenue', 'growth'],
        },
      }, { status: 400 });
    }

    return HttpResponse.json({
      success: true,
      data: {
        trend: {
          metric,
          period: metric === 'mrr' ? '12_months' : period,
          forecast: metric === 'arr'
            ? {
              enabled: true,
              period: 'quarterly',
              confidence: 0.85,
              nextQuarter: 150000,
              nextYear: 600000,
              dataPoints: [
                { period: '2024-04', value: 45000, confidence: 0.85 },
                { period: '2024-05', value: 47000, confidence: 0.82 },
                { period: '2024-06', value: 49000, confidence: 0.79 },
              ],
            }
            : {
              enabled: false,
              dataPoints: [],
            },
          analysis: metric === 'churn'
            ? {
              type: 'detailed',
              trend: 'improving',
              rate: 2.8,
              patterns: ['seasonal', 'monthly'],
              seasonality: 'quarterly',
              averageChurn: 2.8,
              trendDirection: 'decreasing',
            }
            : {
              type: 'basic',
              patterns: [],
              seasonality: 'none',
            },
          dataPoints: [
            { date: '2024-01-01', value: 35000, change: 5.2, formattedValue: 'R$ 35.000,00' },
            { date: '2024-02-01', value: 37000, change: 5.7, formattedValue: 'R$ 37.000,00' },
            { date: '2024-03-01', value: 39000, change: 5.4, formattedValue: 'R$ 39.000,00' },
          ],
          chartData: {
            type: 'line',
            labels: ['Jan', 'Feb', 'Mar'],
            datasets: [
              {
                label: metric,
                data: [35000, 37000, 39000],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
              },
            ],
          },
          comparison: {
            metrics: ['revenue', 'expenses', 'profit'],
            data: [
              {
                name: 'revenue',
                trend: 'up',
                changePercent: 12.5,
                correlation: 0.85,
                direction: 'increasing',
              },
              {
                name: 'expenses',
                trend: 'up',
                changePercent: 8.2,
                correlation: 0.72,
                direction: 'increasing',
              },
              {
                name: 'profit',
                trend: 'up',
                changePercent: 14.3,
                correlation: 0.91,
                direction: 'increasing',
              },
            ],
          },
          anomalies: {
            detected: true,
            points: [
              {
                date: '2024-01-15',
                value: 45000,
                expectedValue: 38000,
                deviationPercent: 18.4,
                severity: 'medium',
                score: 0.85,
                type: 'outlier',
              },
            ],
          },
          seasonality: {
            detected: true,
            pattern: 'quarterly',
            confidence: 0.85,
            patterns: ['Q1-growth', 'Q2-stable', 'Q3-peak', 'Q4-decline'],
            cycle: 'quarterly',
            peakMonths: ['January', 'April', 'July', 'October'],
            troughMonths: ['February', 'May', 'August', 'November'],
          },
          calculation: {
            method: 'linear_regression',
            confidence: 0.92,
            dataQuality: 'high',
            rSquared: 0.88,
            slope: 1250.5,
            intercept: 8500.0,
            standardError: 125.8,
          },
        },
        metadata: {
          dataQuality: 'high',
          lastCalculated: new Date().toISOString(),
        },
      },
      meta: {
        metric,
        period,
        lastUpdated: new Date().toISOString(),
        dataPoints: 100,
      },
    });
  }),

  // Financial Metrics Calculate API
  http.post('http://localhost:3000/api/financial/metrics/calculate', async ({ request }) => {
    const body = await request.json() as any;

    // Handle authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      }, { status: 401 });
    }

    // Check for bulk calculation first
    const isBulkCalculation = body.calculations && Array.isArray(body.calculations);
    const isRealTime = body.realTime === true;

    if (isBulkCalculation) {
      // Return bulk calculation response
      return HttpResponse.json({
        success: true,
        data: {
          calculations: body.calculations.map((calc: any, index: number) => ({
            period: calc.period,
            metrics: {
              mrr: { amount: 40000 + (index * 1000), currency: 'BRL' },
              churn: { amount: 2.5 - (index * 0.1), unit: 'percent' },
            },
          })),
          comparison: {
            trends: {
              mrr: 'increasing',
              churn: 'decreasing',
            },
          },
        },
        meta: {
          calculatedAt: new Date().toISOString(),
          metrics: body.calculations.map((c: any) => c.metrics).flat(),
          bulkCalculation: true,
        },
      });
    }

    // Handle validation errors for single calculation requests
    if (!body.period) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Missing required fields',
          details: {
            missingFields: ['period'],
          },
        },
      }, { status: 400 });
    }

    if (!body.metrics || !Array.isArray(body.metrics)) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Missing required fields',
          details: {
            missingFields: ['metrics'],
          },
        },
      }, { status: 400 });
    }

    // Handle invalid date format
    if (body.period && body.period.start === 'invalid-date') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid date format',
          details: {
            field: 'period.start',
            value: body.period.start,
            expected: 'YYYY-MM-DD format',
          },
        },
      }, { status: 400 });
    }

    // Handle timeout scenarios
    if (body.timeout && body.timeout <= 5000) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'CALCULATION_TIMEOUT',
          message: 'Request exceeded maximum processing timeout',
          timeout: body.timeout,
        },
      }, { status: 408 });
    }

    return HttpResponse.json({
      success: true,
      data: {
        calculation: {
          period: body.period || { start: '2024-01-01', end: '2024-01-31', type: 'month' },
          metrics: {
            mrr: {
              amount: 10000.0,
              currency: 'BRL',
            },
            arr: {
              amount: 120000.0,
              currency: 'BRL',
            },
            churn: {
              amount: 2.5,
              unit: 'percent',
            },
            growth: {
              amount: 12.5,
              unit: 'percent',
            },
          },
          realTime: isRealTime,
          precision: body.precision || 'standard',
          calculatedAt: new Date().toISOString(),
          executionTime: body.timeout ? Math.min(body.timeout - 100, 4900) : 156,
        },
        performance: body.includePerformance
          ? {
            executionTime: body.timeout ? Math.min(body.timeout - 100, 4900) : 156,
            memoryUsage: 42.8,
            cacheHit: true,
          }
          : undefined,
      },
      meta: {
        calculatedAt: new Date().toISOString(),
        metrics: body.metrics,
        realTime: isRealTime,
      },
    });
  }),

  // Financial Trends API
  http.get('http://localhost:3000/api/financial/trends', ({ request }) => {
    const url = new URL(request.url);
    const metric = url.searchParams.get('metric');
    const period = url.searchParams.get('period');
    const includeeForecast = url.searchParams.get('include_forecast') === 'true';
    const analysis = url.searchParams.get('analysis');
    const format = url.searchParams.get('format');
    const metrics = url.searchParams.get('metrics');
    const compare = url.searchParams.get('compare') === 'true';
    const detectAnomalies = url.searchParams.get('detect_anomalies') === 'true';
    const analyzeSeasonality = url.searchParams.get('analyze_seasonality') === 'true';
    const method = url.searchParams.get('method');
    const minDataPoints = url.searchParams.get('min_data_points');

    // Handle authentication errors
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      }, { status: 401 });
    }

    // Handle invalid metrics
    if (metric === 'invalid_metric') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'INVALID_METRIC',
          message: 'Invalid metric specified',
          validMetrics: ['mrr', 'arr', 'churn', 'revenue', 'growth'],
        },
      }, { status: 400 });
    }

    // Handle insufficient data scenarios
    if (minDataPoints && parseInt(minDataPoints) > 24) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_DATA',
          message: 'Insufficient data points for requested analysis',
          details: {
            requested: parseInt(minDataPoints),
            available: 24,
          },
        },
      }, { status: 400 });
    }

    // Generate mock trend data
    const dataPoints = Array.from({ length: 12 }, (_, i) => ({
      date: `2024-${String(i + 1).padStart(2, '0')}-01`,
      value: 10000 + (i * 1000) + Math.random() * 500,
      growth: (Math.random() - 0.5) * 20,
      formattedValue: `R$ ${
        (10000 + (i * 1000) + Math.random() * 500).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
        })
      }`,
      ...(detectAnomalies && i === 8 && { anomaly: true, anomalyScore: 0.95 }),
    }));

    return HttpResponse.json({
      success: true,
      data: {
        trend: {
          metric: metric || 'mrr',
          period: period || '12_months',
          dataPoints,
          summary: {
            totalGrowth: 24.5,
            averageGrowth: 2.04,
            maxValue: Math.max(...dataPoints.map(p => p.value)),
            minValue: Math.min(...dataPoints.map(p => p.value)),
            volatility: 12.8,
          },
          ...(format === 'chart_data' && {
            chartData: {
              type: 'line',
              xAxis: 'date',
              yAxis: 'value',
              color: '#10b981',
              datasets: [{
                label: metric || 'Revenue',
                data: dataPoints.map(p => ({ x: p.date, y: p.value })),
              }],
            },
          }),
          ...(compare && metrics && {
            comparison: {
              metrics: metrics.split(',').map(m => ({
                metric: m,
                correlation: Math.random() * 0.8 + 0.2,
                trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
              })),
            },
          }),
          ...(includeeForecast && {
            forecast: {
              enabled: true,
              period: period + '_forecast',
              confidence: 0.85,
              dataPoints: Array.from({ length: 6 }, (_, i) => ({
                date: `2024-${String(i + 13).padStart(2, '0')}-01`,
                value: 22000 + (i * 1200),
                confidence: 0.85 - (i * 0.05),
              })),
              predictions: Array.from({ length: 6 }, (_, i) => ({
                date: `2024-${String(i + 13).padStart(2, '0')}-01`,
                value: 22000 + (i * 1200),
                confidence: 0.85 - (i * 0.05),
              })),
              accuracy: 0.85,
              model: 'linear_regression',
            },
          }),
          ...(analysis === 'detailed' && {
            analysis: {
              type: 'detailed',
              patterns: ['seasonal', 'growth'],
              seasonality: 'moderate',
              averageChurn: 2.5,
              trendDirection: 'increasing',
              acceleration: 'stable',
              correlation: 0.92,
            },
          }),
          ...(format === 'chart_data' && {
            chartData: {
              type: 'line',
              xAxis: 'date',
              yAxis: 'value',
              color: '#10b981',
              datasets: [{
                label: metric || 'Revenue',
                data: dataPoints.map(p => ({ x: p.date, y: p.value })),
              }],
            },
          }),
          ...(compare && metrics && {
            comparison: {
              metrics: metrics.split(',').map(m => ({
                metric: m,
                correlation: Math.random() * 0.8 + 0.2,
                trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
              })),
            },
          }),
          ...(method && {
            calculationMethod: {
              method: method,
              confidence: 0.91,
              rSquared: 0.88,
            },
          }),
        },
        ...(detectAnomalies && {
          anomalies: {
            detected: true,
            count: dataPoints.filter(p => p.anomaly).length,
            points: dataPoints.filter(p => p.anomaly).map(p => ({
              date: p.date,
              value: p.value,
              expectedValue: p.value * 0.9,
              deviationPercent: 15.2,
              severity: 'medium',
              score: p.anomalyScore,
              type: 'outlier',
            })),
            items: dataPoints.filter(p => p.anomaly).map(p => ({
              date: p.date,
              value: p.value,
              score: p.anomalyScore,
              type: 'outlier',
            })),
          },
        }),
        ...(analyzeSeasonality && {
          seasonality: {
            detected: true,
            patterns: ['quarterly', 'yearly'],
            pattern: 'quarterly',
            strength: 0.73,
            peaks: ['Q1', 'Q4'],
            troughs: ['Q2', 'Q3'],
            cycle: 'quarterly',
            peakMonths: ['January', 'October'],
            troughMonths: ['April', 'July'],
          },
        }),
        ...(method && {
          calculation: {
            method: method,
            confidence: 0.91,
            rSquared: 0.88,
            slope: 1250.5,
            intercept: 8500.0,
            standardError: 125.8,
            accuracy: 'high',
          },
        }),
      },
      meta: {
        calculatedAt: new Date().toISOString(),
        dataSource: 'financial_metrics_v2',
        cacheStatus: 'miss',
      },
    });
  }),

  // Handle error endpoints for testing
  http.get('/api/financial/dashboard/invalid', () => {
    return HttpResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
        requestId: 'req-' + Math.random().toString(36).substr(2, 9),
      },
    }, { status: 500 });
  }),
];

// Reset concurrency tracker function for tests
export const resetConcurrencyTracker = () => {
  concurrencyTracker.clear();
};

// Setup server
export const server = setupServer(...handlers);

// Configure server for testing environment
if (typeof global !== 'undefined') {
  beforeAll(() =>
    server.listen({
      onUnhandledRequest: req => {
        // Allow external requests to pass through (like httpbin.org)
        const url = new URL(req.url);
        if (
          url.hostname !== 'localhost' && url.hostname !== '127.0.0.1'
          && !url.hostname.includes('httpbin.org')
        ) {
          return 'bypass';
        }
        return 'warn';
      },
    })
  );
  afterEach(() => {
    server.resetHandlers();
    resetConcurrencyTracker(); // Reset concurrency tracker between tests
  });
  afterAll(() => server.close());
}
