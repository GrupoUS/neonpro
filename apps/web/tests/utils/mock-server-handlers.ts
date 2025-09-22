/**
 * Mock Server Handlers
 * Shared MSW handlers for AI CRUD operations
 */

import { http, HttpResponse } from 'msw';

/**
 * Mock handlers for AI CRUD operations
 */
export const mockServerHandlers = [
  // AI Intent endpoint
  http.post('/api/ai/intent', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: {
        intent: 'crud_operation',
        action: 'create',
        entity: 'patient',
        confidence: 0.95,
        parameters: {
          name: 'Test Patient',
          cpf: '123.456.789-00',
        },
      },
    });
  }),

  // AI Confirm endpoint
  http.post('/api/ai/confirm', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: {
        confirmed: true,
        operation: body.operation,
        metadata: {
          confirmationId: 'confirm-123',
          timestamp: new Date().toISOString(),
        },
      },
    });
  }),

  // AI Execute endpoint
  http.post('/api/v1/ai/crud/execute', async ({ request }) => {
    const body = await request.json();

    // Validate request structure
    if (!body.confirmId || !body.executionToken || !body.operation) {
      return HttpResponse.json({
        success: false,
        error: 'Invalid execute request format',
        code: 'INVALID_REQUEST',
        timestamp: new Date().toISOString(),
        executionId: `exec-error-${Date.now()}`,
      }, { status: 400 });
    }

    // Sanitize input data to prevent XSS
    const sanitizedData = { ...body.operation.data };
    Object.keys(sanitizedData).forEach(key => {
      if (typeof sanitizedData[key] === 'string') {
        sanitizedData[key] = sanitizedData[key]
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/&/g, '&amp;');
      }
    });

    // Generate response based on operation type
    const result = {
      recordId: 'patient-123',
      created: body.operation.action === 'create',
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

    // Generate audit trail
    const auditTrail = {
      executionId: `exec-${Math.floor(Math.random() * 1000)}`,
      confirmId: body.confirmId,
      operation: body.operation.action,
      entity: body.operation.entity,
      timestamp: new Date().toISOString(),
      _userId: 'user-123',
      correlationId: `correlation-${Math.floor(Math.random() * 1000)}`,
      compliance: {
        lgpd: { passed: true, score: 95 },
        cfm: { passed: true, score: 92 },
        anvisa: { passed: true, score: 88 },
      },
      flowContext: {
        userJourney: 'patient_registration',
        sessionId: 'session-123',
        correlationId: `correlation-${Math.floor(Math.random() * 1000)}`,
      },
      success: true,
    };

    return HttpResponse.json({
      success: true,
      executionId: auditTrail.executionId,
      result,
      auditTrail,
      performance: {
        executionTime: 150,
        validationTime: 25,
        databaseTime: 75,
        totalTime: 250,
      },
      meta: {
        requestId: `req-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        performance: {
          executionTime: 150,
        },
      },
    });
  }),
];

export default mockServerHandlers;
