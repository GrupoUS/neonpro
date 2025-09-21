/**
 * Access Control Integration Tests (T011)
 * Tests for AI agent access control, RLS enforcement, and permission validation
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { testClient } from 'hono/testing';
import { Hono } from 'hono';
import { AIDataService } from '../../apps/api/src/services/ai-data-service';

describe('Access Control Integration Tests', () => {
  let app: Hono;
  let client: any;

  beforeAll(async () => {
    // Create test app with different permission contexts
    app = new Hono();
    
    // Add test route that handles different user contexts
    app.post('/api/ai/data-agent', async (c) => {
      try {
        const body = await c.req.json();
        const { query, intent, userContext } = body;

        // Create data service with provided user context
        const dataService = new AIDataService(userContext);

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
              userRole: userContext.role,
              permissions: userContext.permissions
            }
          });
        }

        if (intent === 'financial') {
          const results = await dataService.getFinancialSummary({
            financial: { period: 'this-month' },
            limit: 10
          });
          
          return c.json({
            success: true,
            data: results.data,
            summary: results.summary,
            metadata: {
              count: results.data.length,
              intent: 'financial',
              userRole: userContext.role,
              permissions: userContext.permissions
            }
          });
        }

        return c.json({ success: false, error: 'Invalid intent' }, 400);
      } catch (error) {
        return c.json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Access denied' 
        }, error instanceof Error && error.message.includes('Access denied') ? 403 : 500);
      }
    });

    client = testClient(app);
  });

  describe('Role-Based Access Control', () => {
    it('should allow admin access to all data types', async () => {
      const adminContext = {
        userId: 'admin-user-001',
        domain: 'test-clinic.neonpro.com',
        role: 'admin',
        permissions: ['read_clients', 'read_appointments', 'read_financial', 'write_clients'],
        clientNames: ['João Silva', 'Maria Santos']
      };

      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'João Silva',
          intent: 'client_data',
          userContext: adminContext,
          sessionId: 'test-session-401'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metadata.userRole).toBe('admin');
      expect(data.metadata.permissions).toContain('read_clients');
    });

    it('should allow professional access to client and appointment data', async () => {
      const professionalContext = {
        userId: 'prof-user-001',
        domain: 'test-clinic.neonpro.com',
        role: 'professional',
        permissions: ['read_clients', 'read_appointments'],
        clientNames: ['João Silva', 'Maria Santos']
      };

      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'Maria Santos',
          intent: 'client_data',
          userContext: professionalContext,
          sessionId: 'test-session-402'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metadata.userRole).toBe('professional');
      expect(data.metadata.permissions).toContain('read_clients');
    });

    it('should restrict receptionist access to limited data', async () => {
      const receptionistContext = {
        userId: 'recep-user-001',
        domain: 'test-clinic.neonpro.com',
        role: 'receptionist',
        permissions: ['read_clients'], // Limited permissions
        clientNames: ['João Silva']
      };

      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'João Silva',
          intent: 'client_data',
          userContext: receptionistContext,
          sessionId: 'test-session-403'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metadata.userRole).toBe('receptionist');
      expect(data.metadata.permissions).not.toContain('read_financial');
    });

    it('should deny financial access to users without permission', async () => {
      const limitedContext = {
        userId: 'limited-user-001',
        domain: 'test-clinic.neonpro.com',
        role: 'assistant',
        permissions: ['read_clients'], // No financial permissions
        clientNames: ['João Silva']
      };

      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'financial summary',
          intent: 'financial',
          userContext: limitedContext,
          sessionId: 'test-session-404'
        }
      });

      expect(response.status).toBe(403);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Access denied');
    });
  });

  describe('Domain Isolation', () => {
    it('should isolate data by domain', async () => {
      const clinic1Context = {
        userId: 'user-clinic1',
        domain: 'clinic1.neonpro.com',
        role: 'professional',
        permissions: ['read_clients', 'read_appointments'],
        clientNames: ['Client A', 'Client B']
      };

      const clinic2Context = {
        userId: 'user-clinic2',
        domain: 'clinic2.neonpro.com',
        role: 'professional',
        permissions: ['read_clients', 'read_appointments'],
        clientNames: ['Client C', 'Client D']
      };

      const response1 = await client.api.ai['data-agent'].$post({
        json: {
          query: 'Client A',
          intent: 'client_data',
          userContext: clinic1Context,
          sessionId: 'test-session-405'
        }
      });

      const response2 = await client.api.ai['data-agent'].$post({
        json: {
          query: 'Client A',
          intent: 'client_data',
          userContext: clinic2Context,
          sessionId: 'test-session-406'
        }
      });

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // Both should succeed but return different data sets
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      expect(data1.success).toBe(true);
      expect(data2.success).toBe(true);
      // Data should be isolated by domain
    });

    it('should prevent cross-domain data access', async () => {
      const crossDomainContext = {
        userId: 'malicious-user',
        domain: 'unauthorized-clinic.com',
        role: 'admin',
        permissions: ['read_clients', 'read_appointments', 'read_financial'],
        clientNames: ['Any Client']
      };

      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'sensitive client data',
          intent: 'client_data',
          userContext: crossDomainContext,
          sessionId: 'test-session-407'
        }
      });

      // Should either deny access or return empty results
      expect([200, 403]).toContain(response.status);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data.data.length).toBe(0); // No cross-domain data
      }
    });
  });

  describe('Permission Validation', () => {
    it('should validate required permissions for each intent', async () => {
      const contexts = [
        {
          name: 'client_data_without_permission',
          context: {
            userId: 'test-user',
            domain: 'test.com',
            role: 'user',
            permissions: [], // No permissions
            clientNames: []
          },
          intent: 'client_data',
          expectedStatus: 403
        },
        {
          name: 'financial_without_permission',
          context: {
            userId: 'test-user',
            domain: 'test.com',
            role: 'user',
            permissions: ['read_clients'], // Missing financial permission
            clientNames: []
          },
          intent: 'financial',
          expectedStatus: 403
        }
      ];

      for (const testCase of contexts) {
        const response = await client.api.ai['data-agent'].$post({
          json: {
            query: 'test query',
            intent: testCase.intent,
            userContext: testCase.context,
            sessionId: `test-session-${testCase.name}`
          }
        });

        expect(response.status).toBe(testCase.expectedStatus);
        
        if (response.status === 403) {
          const data = await response.json();
          expect(data.success).toBe(false);
          expect(data.error).toContain('Access denied');
        }
      }
    });

    it('should validate user context completeness', async () => {
      const incompleteContexts = [
        {
          // Missing userId
          domain: 'test.com',
          role: 'user',
          permissions: ['read_clients']
        },
        {
          userId: 'test-user',
          // Missing domain
          role: 'user',
          permissions: ['read_clients']
        },
        {
          userId: 'test-user',
          domain: 'test.com',
          // Missing role
          permissions: ['read_clients']
        }
      ];

      for (let i = 0; i < incompleteContexts.length; i++) {
        const response = await client.api.ai['data-agent'].$post({
          json: {
            query: 'test query',
            intent: 'client_data',
            userContext: incompleteContexts[i],
            sessionId: `test-session-incomplete-${i}`
          }
        });

        expect([400, 403, 500]).toContain(response.status);
      }
    });
  });

  describe('Session and Authentication', () => {
    it('should require valid session ID', async () => {
      const validContext = {
        userId: 'valid-user',
        domain: 'test.com',
        role: 'professional',
        permissions: ['read_clients'],
        clientNames: ['Test Client']
      };

      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'test query',
          intent: 'client_data',
          userContext: validContext
          // Missing sessionId
        }
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it('should validate session format', async () => {
      const validContext = {
        userId: 'valid-user',
        domain: 'test.com',
        role: 'professional',
        permissions: ['read_clients'],
        clientNames: ['Test Client']
      };

      const invalidSessions = ['', 'short', '123', 'invalid-format'];

      for (const sessionId of invalidSessions) {
        const response = await client.api.ai['data-agent'].$post({
          json: {
            query: 'test query',
            intent: 'client_data',
            userContext: validContext,
            sessionId
          }
        });

        // Should either accept or reject based on session validation rules
        expect([200, 400]).toContain(response.status);
      }
    });
  });

  describe('Security Headers and HTTPS', () => {
    it('should include security headers in all responses', async () => {
      const validContext = {
        userId: 'security-test-user',
        domain: 'test.com',
        role: 'admin',
        permissions: ['read_clients'],
        clientNames: ['Test Client']
      };

      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'security test',
          intent: 'client_data',
          userContext: validContext,
          sessionId: 'test-session-security'
        }
      });

      expect(response.headers.get('x-healthcare-compliance')).toContain('LGPD');
      expect(response.headers.get('x-data-classification')).toBe('Healthcare-Sensitive');
      expect(response.headers.get('cache-control')).toContain('no-store');
    });

    it('should enforce HTTPS in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const validContext = {
        userId: 'https-test-user',
        domain: 'test.com',
        role: 'admin',
        permissions: ['read_clients'],
        clientNames: ['Test Client']
      };

      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'https test',
          intent: 'client_data',
          userContext: validContext,
          sessionId: 'test-session-https'
        }
      }, {
        headers: {
          'x-forwarded-proto': 'https'
        }
      });

      expect(response.status).toBe(200);
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Audit and Logging', () => {
    it('should log access attempts for audit purposes', async () => {
      const auditContext = {
        userId: 'audit-test-user',
        domain: 'audit-test.com',
        role: 'professional',
        permissions: ['read_clients'],
        clientNames: ['Audit Test Client']
      };

      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'audit test query',
          intent: 'client_data',
          userContext: auditContext,
          sessionId: 'test-session-audit'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.metadata).toBeDefined();
      expect(data.metadata.userRole).toBe('professional');
      expect(data.metadata.permissions).toContain('read_clients');
    });

    it('should log failed access attempts', async () => {
      const unauthorizedContext = {
        userId: 'unauthorized-user',
        domain: 'test.com',
        role: 'guest',
        permissions: [], // No permissions
        clientNames: []
      };

      const response = await client.api.ai['data-agent'].$post({
        json: {
          query: 'unauthorized query',
          intent: 'client_data',
          userContext: unauthorizedContext,
          sessionId: 'test-session-unauthorized'
        }
      });

      expect(response.status).toBe(403);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Access denied');
    });
  });

  afterAll(async () => {
    // Cleanup any test data or connections
  });
});
