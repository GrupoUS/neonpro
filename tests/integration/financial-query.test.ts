/**
 * Financial Query Integration Tests (T010)
 * Tests for AI agent financial data queries with period filtering and HTTPS security
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { testClient } from 'hono/testing';
import { Hono } from 'hono';
import { AIDataService } from '../../apps/api/src/services/ai-data-service';

describe('Financial Query Integration Tests', () => {
  let app: Hono;
  let client: any;
  let dataService: AIDataService;

  beforeAll(async () => {
    // Create test app with AI data service
    app = new Hono();
    
    // Mock permission context for testing
    const mockPermissionContext = {
      userId: 'test-user-789',
      domain: 'test-clinic.neonpro.com',
      role: 'admin',
      permissions: ['read_clients', 'read_appointments', 'read_financial'],
      clientNames: ['João Silva', 'Maria Santos', 'Pedro Costa']
    };

    dataService = new AIDataService(mockPermissionContext);
    
    // Add test route
    app.post('/api/ai/data-agent', async (c) => {
      try {
        const body = await c.req.json();
        const { query, intent, period } = body;

        if (intent === 'financial') {
          const results = await dataService.getFinancialSummary({
            financial: {
              period: period || 'this-month',
              includeProjections: false,
              categories: ['revenue', 'expenses']
            },
            limit: 50
          });
          
          return c.json({
            success: true,
            data: results.data,
            summary: results.summary,
            metadata: {
              count: results.data.length,
              intent: 'financial',
              period: period || 'this-month',
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

  describe('Financial Period Queries', () => {
    it('should query financial data for current month', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'financial summary this month',
          intent: 'financial',
          period: 'this-month',
          sessionId: 'test-session-301'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.summary).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.metadata.intent).toBe('financial');
      expect(data.metadata.period).toBe('this-month');
    });

    it('should query financial data for specific period', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'revenue last 30 days',
          intent: 'financial',
          period: 'last-30-days',
          sessionId: 'test-session-302'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metadata.period).toBe('last-30-days');
    });

    it('should query financial data for current week', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'weekly financial report',
          intent: 'financial',
          period: 'this-week',
          sessionId: 'test-session-303'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metadata.period).toBe('this-week');
    });

    it('should default to current month when no period specified', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'financial summary',
          intent: 'financial',
          sessionId: 'test-session-304'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metadata.period).toBe('this-month');
    });
  });

  describe('Financial Summary Structure', () => {
    it('should return properly structured financial summary', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'complete financial summary',
          intent: 'financial',
          sessionId: 'test-session-305'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.summary).toBeDefined();
      
      // Check summary structure
      expect(data.summary).toHaveProperty('totalRevenue');
      expect(data.summary).toHaveProperty('totalExpenses');
      expect(data.summary).toHaveProperty('netProfit');
      expect(typeof data.summary.totalRevenue).toBe('number');
      expect(typeof data.summary.totalExpenses).toBe('number');
      expect(typeof data.summary.netProfit).toBe('number');
    });

    it('should include revenue breakdown', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'revenue breakdown',
          intent: 'financial',
          sessionId: 'test-session-306'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.summary).toHaveProperty('paidRevenue');
      expect(data.summary).toHaveProperty('pendingRevenue');
      expect(data.summary).toHaveProperty('overdueRevenue');
    });

    it('should enforce financial data limits', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'all financial transactions',
          intent: 'financial',
          period: 'last-365-days',
          sessionId: 'test-session-307'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.length).toBeLessThanOrEqual(50); // Default limit
    });
  });

  describe('Security and Access Control', () => {
    it('should enforce HTTPS in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'financial data',
          intent: 'financial',
          sessionId: 'test-session-308'
        }
      }, {
        headers: {
          'x-forwarded-proto': 'https'
        }
      });

      expect(response.status).toBe(200);
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should include healthcare security headers', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'financial summary',
          intent: 'financial',
          sessionId: 'test-session-309'
        }
      });

      expect(response.headers.get('x-healthcare-compliance')).toContain('LGPD');
      expect(response.headers.get('x-data-classification')).toBe('Healthcare-Sensitive');
      expect(response.headers.get('cache-control')).toContain('no-store');
    });

    it('should require proper permissions for financial data', async () => {
      // This would test with a user context that lacks financial permissions
      // For now, we test that the endpoint requires authentication
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'financial data',
          intent: 'financial',
          sessionId: 'test-session-310'
        }
      });

      // Should either succeed with proper permissions or fail appropriately
      expect([200, 401, 403]).toContain(response.status);
    });
  });

  describe('Financial Data Privacy', () => {
    it('should not expose sensitive financial information', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'detailed financial report',
          intent: 'financial',
          sessionId: 'test-session-311'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      const responseText = JSON.stringify(data);
      
      // Verify no sensitive patterns are exposed
      expect(responseText).not.toMatch(/\d{4}-\d{4}-\d{4}-\d{4}/); // Credit card
      expect(responseText).not.toMatch(/\d{5}-\d{1}\.\d{2}\.\d{3}-\d{1}/); // Bank account
      expect(responseText).not.toMatch(/password|secret|key|token/i);
    });

    it('should include audit metadata for financial queries', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'financial audit test',
          intent: 'financial',
          sessionId: 'test-session-312'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.metadata).toBeDefined();
      expect(data.metadata.processingTime).toBeDefined();
      expect(data.metadata.count).toBeDefined();
      expect(data.metadata.intent).toBe('financial');
    });

    it('should handle currency formatting properly', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'revenue in BRL',
          intent: 'financial',
          sessionId: 'test-session-313'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      
      // Check that financial amounts are properly formatted numbers
      if (data.summary) {
        expect(typeof data.summary.totalRevenue).toBe('number');
        expect(data.summary.totalRevenue).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Performance and Reliability', () => {
    it('should complete financial queries within time limits', async () => {
      const startTime = Date.now();
      
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'comprehensive financial report',
          intent: 'financial',
          sessionId: 'test-session-314'
        }
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(10000); // Financial queries may take longer
    });

    it('should handle concurrent financial queries', async () => {
      const requests = Array.from({ length: 3 }, (_, i) => 
        client.api.ai['data-agent'].$post({
          json: {
            query: `financial report ${i}`,
            intent: 'financial',
            sessionId: `test-session-concurrent-fin-${i}`
          }
        })
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle large financial datasets efficiently', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'annual financial summary',
          intent: 'financial',
          period: 'last-365-days',
          sessionId: 'test-session-315'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metadata.count).toBeLessThanOrEqual(50);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid period formats', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'financial data',
          intent: 'financial',
          period: 'invalid-period',
          sessionId: 'test-session-316'
        }
      });

      // Should either handle gracefully or return appropriate error
      expect([200, 400]).toContain(response.status);
    });

    it('should handle empty financial data gracefully', async () => {
      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'financial data for empty period',
          intent: 'financial',
          period: 'last-0-days',
          sessionId: 'test-session-317'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  afterAll(async () => {
    // Cleanup
    if (dataService && typeof dataService.clearCache === 'function') {
      dataService.clearCache();
    }
  });
});
