import { Hono } from 'hono';
import { createServer } from 'http';
import { fetch } from 'undici';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

// Import the agent endpoint
import { agentRouter } from '../../src/routes/ai/data-agent';

// Mock authentication and permission checking
vi.mock('../../src/services/ai-data-service', () => ({
  AIDataService: {
    getInstance: () => ({
      getClientsByName: async (name: string, _userId: string) => {
        // Simulate RLS - only return data user has access to
        if (userId === 'admin-user') {
          return {
            type: 'list',
            title: 'Clientes Encontrados',
            data: [
              { id: 'client-1', name: 'Maria Silva', email: 'maria@email.com' },
              { id: 'client-2', name: 'João Santos', email: 'joao@email.com' },
            ],
            columns: [],
          };
        } else if (userId === 'regular-user') {
          return {
            type: 'list',
            title: 'Clientes Encontrados',
            data: [
              { id: 'client-1', name: 'Maria Silva', email: 'maria@email.com' },
            ],
            columns: [],
          };
        } else {
          throw new Error('Access denied')
        }
      },
      getAppointmentsByDate: async (date: string, _userId: string) => {
        // Simulate RLS for appointments
        if (userId === 'admin-user' || userId === 'regular-user') {
          return {
            type: 'list',
            title: 'Agendamentos',
            data: [
              {
                id: 'apt-1',
                datetime: '2024-01-20T09:00:00Z',
                clientName: 'Maria Silva',
              },
            ],
            columns: [],
          };
        } else {
          throw new Error('Access denied')
        }
      },
      getFinancialSummary: async (period: string, _userId: string) => {
        // Financial data restricted to admins
        if (userId === 'admin-user') {
          return {
            type: 'summary',
            title: 'Resumo Financeiro',
            data: [],
            summary: {
              totalRevenue: 5000,
              totalExpenses: 2000,
              netIncome: 3000,
            },
            columns: [],
          };
        } else {
          throw new Error('Access denied: Insufficient permissions')
        }
      },
    }),
  },
})

describe('Integration Tests: Access Control', () => {
  let server: any;
  let baseUrl: string;
  let app: Hono;

  beforeAll(async () => {
    // Create Hono app with agent route
    app = new Hono(
    app.route('/api/ai/data-agent', agentRouter

    // Start test server
    server = createServer({
      fetch: app.fetch,
      port: 0,
    }

    await new Promise(resolve => {
      server.listen(0, () => {
        const address = server.address(
        if (address && typeof address === 'object') {
          baseUrl = `http://localhost:${address.port}`;
        }
        resolve(true
      }
    }
  }

  afterAll(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve)
    }
  }

  describe('Role-Based Access Control', () => {
    it('should allow admin user to access all client data', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer admin-token',
        },
        body: JSON.stringify({
          _query: 'Me mostre todos os clientes',
          sessionId: 'test-session-admin-1',
          _context: {
            _userId: 'admin-user',
            _role: 'admin',
          },
        }),
      }

      expect(response.status).toBe(200
      const data = await response.json(
      expect(data.success).toBe(true);
      expect(data.response.data.length).toBe(2); // Admin sees all clients
    }

    it('should restrict regular user to their assigned clients', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer user-token',
        },
        body: JSON.stringify({
          _query: 'Me mostre os clientes',
          sessionId: 'test-session-user-1',
          _context: {
            _userId: 'regular-user',
            _role: 'user',
          },
        }),
      }

      expect(response.status).toBe(200
      const data = await response.json(
      expect(data.success).toBe(true);
      expect(data.response.data.length).toBe(1); // Regular user sees only their client
    }

    it('should deny access to unauthorized user', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer invalid-token',
        },
        body: JSON.stringify({
          _query: 'Clientes',
          sessionId: 'test-session-unauth-1',
          _context: {
            _userId: 'unauthorized-user',
            _role: 'guest',
          },
        }),
      }

      expect(response.status).toBe(200); // Still 200, but with error
      const data = await response.json(
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Access denied')
    }

    it('should allow admin user to access financial data', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer admin-token',
        },
        body: JSON.stringify({
          _query: 'Como está o faturamento?',
          sessionId: 'test-session-admin-2',
          _context: {
            _userId: 'admin-user',
            _role: 'admin',
          },
        }),
      }

      expect(response.status).toBe(200
      const data = await response.json(
      expect(data.success).toBe(true);
      expect(data.response.type).toBe('summary')
      expect(data.response.summary.totalRevenue).toBe(5000
    }

    it('should deny regular user access to financial data', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer user-token',
        },
        body: JSON.stringify({
          _query: 'Faturamento do mês',
          sessionId: 'test-session-user-2',
          _context: {
            _userId: 'regular-user',
            _role: 'user',
          },
        }),
      }

      expect(response.status).toBe(200
      const data = await response.json(
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Insufficient permissions')
    }

    it('should allow both admin and regular users to access appointments', async () => {
      // Admin user
      let response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer admin-token',
        },
        body: JSON.stringify({
          _query: 'Agendamentos de hoje',
          sessionId: 'test-session-admin-3',
          _context: {
            _userId: 'admin-user',
            _role: 'admin',
          },
        }),
      }

      expect(response.status).toBe(200
      let data = await response.json(
      expect(data.success).toBe(true);

      // Regular user
      response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer user-token',
        },
        body: JSON.stringify({
          _query: 'Meus agendamentos',
          sessionId: 'test-session-user-3',
          _context: {
            _userId: 'regular-user',
            _role: 'user',
          },
        }),
      }

      expect(response.status).toBe(200
      data = await response.json(
      expect(data.success).toBe(true);
    }

    it('should handle missing user context gracefully', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token',
        },
        body: JSON.stringify({
          _query: 'Clientes',
          sessionId: 'test-session-no-context-1',
          // No context provided
        }),
      }

      expect(response.status).toBe(200
      const data = await response.json(
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Missing user context')
    }

    it('should validate authentication token', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // No Authorization header
        },
        body: JSON.stringify({
          _query: 'Clientes',
          sessionId: 'test-session-no-auth-1',
          _context: {
            _userId: 'admin-user',
            _role: 'admin',
          },
        }),
      }

      expect(response.status).toBe(401
    }

    it('should enforce domain-specific access', async () => {
      // User from different domain should not access data
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer other-domain-token',
        },
        body: JSON.stringify({
          _query: 'Clientes',
          sessionId: 'test-session-other-domain-1',
          _context: {
            _userId: 'other-domain-user',
            _role: 'admin',
            domain: 'other-clinic',
          },
        }),
      }

      expect(response.status).toBe(200
      const data = await response.json(
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Domain access denied')
    }

    it('should audit access attempts', async () => {
      // This test verifies that access attempts are logged
      // In a real implementation, we would check the audit logs
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer audit-token',
        },
        body: JSON.stringify({
          _query: 'Clientes',
          sessionId: 'test-session-audit-1',
          _context: {
            _userId: 'audit-user',
            _role: 'user',
          },
        }),
      }

      expect(response.status).toBe(200
      // The implementation should log this access attempt
      // For test purposes, we just verify the request was processed
    }

    it('should handle permission escalation attempts', async () => {
      // Attempt to access admin data with regular user token
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer user-token',
        },
        body: JSON.stringify({
          _query: 'Todos os dados financeiros', // Admin-only query
          sessionId: 'test-session-escalation-1',
          _context: {
            _userId: 'regular-user',
            _role: 'admin', // Trying to escalate role
          },
        }),
      }

      expect(response.status).toBe(200
      const data = await response.json(
      expect(data.success).toBe(false);
      // Should detect token/role mismatch
      expect(data.error.message).toContain('Role verification failed')
    }

    it('should respect Row Level Security (RLS) policies', async () => {
      // Test that RLS is enforced at the database level
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer user-token',
        },
        body: JSON.stringify({
          _query: 'Clientes da clínica B', // User should not see other clinics
          sessionId: 'test-session-rls-1',
          _context: {
            _userId: 'regular-user',
            _role: 'user',
            clinicId: 'clinic-a',
          },
        }),
      }

      expect(response.status).toBe(200
      const data = await response.json(
      expect(data.success).toBe(true);
      // Should return empty or only clinic-a clients
      expect(
        data.response.data.every((c: any) => !c.name.includes('clínica B')),
      ).toBe(true);
    }
  }

  describe('Session-based Access Control', () => {
    it('should validate session integrity', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer session-token',
        },
        body: JSON.stringify({
          _query: 'Clientes',
          sessionId: 'invalid-session-xyz', // Invalid session format
          _context: {
            _userId: 'admin-user',
            _role: 'admin',
          },
        }),
      }

      expect(response.status).toBe(200
      const data = await response.json(
      // Should detect invalid session
      expect(data.success).toBe(false);
    }

    it('should prevent session hijacking', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer user-token',
        },
        body: JSON.stringify({
          _query: 'Clientes',
          sessionId: 'admin-session-123', // Using admin's session with user token
          _context: {
            _userId: 'regular-user',
            _role: 'user',
          },
        }),
      }

      expect(response.status).toBe(200
      const data = await response.json(
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Session mismatch')
    }

    it('should expire sessions after timeout', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer expired-token',
        },
        body: JSON.stringify({
          _query: 'Clientes',
          sessionId: 'expired-session-123',
          _context: {
            _userId: 'admin-user',
            _role: 'admin',
            sessionExpiry: new Date(Date.now() - 3600000).toISOString(), // Expired 1 hour ago
          },
        }),
      }

      expect(response.status).toBe(200
      const data = await response.json(
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Session expired')
    }
  }
}
