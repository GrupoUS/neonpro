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
  http.post('/api/ai/execute', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: {
        executed: true,
        result: {
          id: 'patient-123',
          operation: body.operation,
          status: 'completed',
        },
        metadata: {
          executionId: 'exec-123',
          timestamp: new Date().toISOString(),
          duration: 150,
        },
      },
    });
  }),
];

export default mockServerHandlers;
