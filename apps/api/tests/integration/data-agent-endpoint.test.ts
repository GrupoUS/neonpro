/**
 * Contract Test for POST /api/ai/data-agent endpoint
 * TDD Test - MUST FAIL until implementation is complete
 *
 * This test validates the AI data agent endpoint according to the OpenAPI contract
 */

import type { Context } from 'hono';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

// Test setup and configuration
describe('POST /api/ai/data-agent - Contract Test', () => {
  let app: any;
  let testServer: any;

  beforeAll(async () => {
    // This will fail until the endpoint is implemented
    try {
      // Import app (this should fail initially)
      app = (await import('../../src/app')).default;
    } catch (error) {
      console.log('Expected failure: App not available during TDD phase');
    }
  });

  afterAll(async () => {
    if (testServer) {
      testServer.close();
    }
  });

  describe('Contract Validation', () => {
    test('should accept valid AgentQueryRequest and return AgentQueryResponse', async () => {
      // This test MUST FAIL until implementation is complete
      expect(app).toBeDefined();

      const validRequest = {
        query: 'Quais os próximos agendamentos?',
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        context: {
          userId: 'user_789',
        },
      };

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-jwt-token',
        },
        body: JSON.stringify(validRequest),
      });

      // Contract assertions - these will fail initially
      expect(response.status).toBe(200);

      const responseData = await response.json();

      // Validate response structure according to OpenAPI contract
      expect(responseData).toHaveProperty('success', true);
      expect(responseData).toHaveProperty('response');
      expect(responseData.response).toHaveProperty('id');
      expect(responseData.response).toHaveProperty('type');
      expect(responseData.response).toHaveProperty('content');

      // Validate response type is one of the allowed values
      expect(['text', 'list', 'table', 'chart', 'error']).toContain(responseData.response.type);

      // Validate metadata
      if (responseData.metadata) {
        expect(responseData.metadata).toHaveProperty('processingTime');
        expect(typeof responseData.metadata.processingTime).toBe('number');
        expect(responseData.metadata.processingTime).toBeLessThan(2000); // <2s requirement
      }
    });

    test('should require authentication', async () => {
      expect(app).toBeDefined();

      const validRequest = {
        query: 'Test query',
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // No Authorization header
        },
        body: JSON.stringify(validRequest),
      });

      expect(response.status).toBe(401);
    });

    test('should validate request body schema', async () => {
      expect(app).toBeDefined();

      // Missing required fields
      const invalidRequest = {
        query: '', // Empty query should be invalid
        // Missing sessionId
      };

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-jwt-token',
        },
        body: JSON.stringify(invalidRequest),
      });

      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData.error).toHaveProperty('code');
      expect(errorData.error).toHaveProperty('message');
    });

    test('should return proper error for forbidden access', async () => {
      expect(app).toBeDefined();

      const validRequest = {
        query: 'Show me all financial data',
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        context: {
          userId: 'unauthorized_user',
        },
      };

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer limited-access-token',
        },
        body: JSON.stringify(validRequest),
      });

      expect(response.status).toBe(403);
    });
  });

  describe('Security Headers Validation', () => {
    test('should include all required security headers', async () => {
      expect(app).toBeDefined();

      const validRequest = {
        query: 'Test query',
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-jwt-token',
        },
        body: JSON.stringify(validRequest),
      });

      // Validate security headers according to contract
      expect(response.headers.get('Strict-Transport-Security')).toBeDefined();
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(response.headers.get('Content-Security-Policy')).toBeDefined();
      expect(response.headers.get('Referrer-Policy')).toBeDefined();

      // Validate HSTS header format
      const hstsHeader = response.headers.get('Strict-Transport-Security');
      expect(hstsHeader).toContain('max-age=31536000');
      expect(hstsHeader).toContain('includeSubDomains');
      expect(hstsHeader).toContain('preload');
    });
  });

  describe('Performance Requirements', () => {
    test('should respond within 2 seconds for simple queries', async () => {
      expect(app).toBeDefined();

      const validRequest = {
        query: 'Próximos agendamentos',
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const startTime = Date.now();

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-jwt-token',
        },
        body: JSON.stringify(validRequest),
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(2000); // <2s requirement
      expect(response.status).toBe(200);
    });
  });
});
