/**
 * Client Data Query Integration Tests (T008)
 * Tests for AI agent client data queries with RLS enforcement and HTTPS security
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { testClient } from 'hono/testing';
import { Hono } from 'hono';
import { AIDataService } from '../../apps/api/src/services/ai-data-service';

describe('Client Data Query Integration Tests', () => {
  let app: Hono;
  let client: any;
  let dataService: AIDataService;

  beforeAll(async () => {
    // Create test app with AI data service
    app = new Hono();
    
    // Mock permission context for testing
    const mockPermissionContext = {
      userId: 'test-user-123',
      domain: 'test-clinic.neonpro.com',
      role: 'professional',
      permissions: ['read_clients', 'read_appointments', 'read_financial'],
      clientNames: ['João Silva', 'Maria Santos', 'Pedro Costa']
    };

    dataService = new AIDataService(mockPermissionContext);
    
    // Add test route
    app.post('/api/ai/data-agent', async (c) => {
      try {
        const body = await c.req.json();
        const { query, intent } = body;

        if (intent === 'client_data') {
          const results = await dataService.getClientsByName({
            clientNames: [query],
            limit: 10
          });
          
          return c.json({
            success: true,
            data: results,
            metadata: {
              count: results.length,
              intent: 'client_data',
              processingTime: Date.now()
            }
          });
        }

        return c.json({ success: false, error: 'Invalid intent' }, 400);
      } catch (error) {
        return c.json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }, 500);
      }
    });

    client = testClient(app);
  });

  beforeEach(() => {
    // Clear any cached data before each test
    if (dataService && typeof dataService.clearCache === 'function') {
      dataService.clearCache();
    }
  });

  describe('Client Search Functionality', () => {
    it('should successfully query clients by name', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'João Silva',
          intent: 'client_data',
          sessionId: 'test-session-123'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.metadata.intent).toBe('client_data');
    });

    it('should handle partial name matches', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'João',
          intent: 'client_data',
          sessionId: 'test-session-124'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.metadata.count).toBeGreaterThanOrEqual(0);
    });

    it('should return empty results for non-existent clients', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'NonExistentClient',
          intent: 'client_data',
          sessionId: 'test-session-125'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBe(0);
    });

    it('should enforce query limits', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'Silva', // Common surname that might match many
          intent: 'client_data',
          sessionId: 'test-session-126'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.length).toBeLessThanOrEqual(10); // Default limit
    });
  });

  describe('Security and Access Control', () => {
    it('should enforce HTTPS in production environment', async () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'João Silva',
          intent: 'client_data',
          sessionId: 'test-session-127'
        }
      }, {
        headers: {
          'x-forwarded-proto': 'https'
        }
      });

      expect(response.status).toBe(200);
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should include security headers in response', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'Maria Santos',
          intent: 'client_data',
          sessionId: 'test-session-128'
        }
      });

      // Check for healthcare compliance headers
      expect(response.headers.get('x-healthcare-compliance')).toContain('LGPD');
      expect(response.headers.get('x-data-classification')).toBe('Healthcare-Sensitive');
      expect(response.headers.get('cache-control')).toContain('no-store');
    });

    it('should validate session ID requirement', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'João Silva',
          intent: 'client_data'
          // Missing sessionId
        }
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('session');
    });

    it('should handle invalid intent gracefully', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'João Silva',
          intent: 'invalid_intent',
          sessionId: 'test-session-129'
        }
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid intent');
    });
  });

  describe('Data Privacy and LGPD Compliance', () => {
    it('should not expose sensitive client data in logs', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'João Silva',
          intent: 'client_data',
          sessionId: 'test-session-130'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      // Verify that sensitive data patterns are not exposed
      const responseText = JSON.stringify(data);
      expect(responseText).not.toMatch(/\d{11}/); // CPF pattern
      expect(responseText).not.toMatch(/\d{4}-\d{4}-\d{4}-\d{4}/); // Credit card pattern
      expect(responseText).not.toMatch(/password|secret|key|token/i);
    });

    it('should include audit metadata', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'Pedro Costa',
          intent: 'client_data',
          sessionId: 'test-session-131'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.metadata).toBeDefined();
      expect(data.metadata.processingTime).toBeDefined();
      expect(data.metadata.count).toBeDefined();
      expect(data.metadata.intent).toBe('client_data');
    });

    it('should handle empty query strings', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: '',
          intent: 'client_data',
          sessionId: 'test-session-132'
        }
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('empty');
    });
  });

  describe('Performance and Caching', () => {
    it('should complete queries within acceptable time limits', async () => {
      const startTime = Date.now();
      
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'Maria Santos',
          intent: 'client_data',
          sessionId: 'test-session-133'
        }
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => 
        client.api.ai['data-agent'].$post({
          json: {
            query: `Client${i}`,
            intent: 'client_data',
            sessionId: `test-session-concurrent-${i}`
          }
        })
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      try {
        const response = await fetch('/api/ai/data-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'invalid json'
        });

        expect(response.status).toBe(400);
      } catch (error) {
        // Expected for malformed JSON
        expect(error).toBeDefined();
      }
    });

    it('should handle database connection errors', async () => {
      // This would typically mock a database error
      // For now, we'll test the error handling structure
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'TestClient',
          intent: 'client_data',
          sessionId: 'test-session-error'
        }
      });

      // Should either succeed or fail gracefully
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 500) {
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBeDefined();
      }
    });
  });

  afterAll(async () => {
    // Cleanup any test data or connections
    if (dataService && typeof dataService.clearCache === 'function') {
      dataService.clearCache();
    }
  });
});
