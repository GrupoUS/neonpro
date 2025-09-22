import { Hono } from 'hono';
import { createServer } from 'http';
import { fetch } from 'undici';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Import the agent endpoint route
import { agentRouter } from '../../src/routes/ai/data-agent';

describe('Contract Tests: AI Agent Endpoint', () => {
  let server: any;
  let baseUrl: string;
  let app: Hono;

  beforeAll(async () => {
    // Create Hono app with agent route
    app = new Hono();
    app.route('/api/ai/data-agent', agentRouter);

    // Start test server
    server = createServer({
      fetch: app.fetch,
      port: 0, // Let OS choose port
    });

    await new Promise(resolve => {
      server.listen(0, () => {
        const address = server.address();
        if (address && typeof address === 'object') {
          baseUrl = `http://localhost:${address.port}`;
        }
        resolve(true);
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  describe('POST /api/ai/data-agent', () => {
    it('should return 400 for missing query parameter', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: 'test-session-123',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('BAD_REQUEST');
    });

    it('should return 400 for missing sessionId parameter', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _query: 'Quais os próximos agendamentos?',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('BAD_REQUEST');
    });

    it('should return 200 for valid client query request', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          _query: 'Me mostre os clientes cadastrados',
          sessionId: 'test-session-123',
          _context: {
            _userId: 'user-789',
          },
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      // Verify response structure
      expect(data.success).toBe(true);
      expect(data.response).toBeDefined();
      expect(data.response.id).toBeDefined();
      expect(data.response.type).toBeDefined();
      expect(data.response.content).toBeDefined();
    });

    it('should return 200 for valid appointment query request', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          _query: 'Quais os próximos agendamentos?',
          sessionId: 'test-session-123',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      // Verify response structure
      expect(data.success).toBe(true);
      expect(data.response).toBeDefined();
      expect(data.response.id).toBeDefined();
      expect(data.response.type).toBe('list');
    });

    it('should return 200 for valid financial query request', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          _query: 'Como está o faturamento?',
          sessionId: 'test-session-123',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      // Verify response structure
      expect(data.success).toBe(true);
      expect(data.response).toBeDefined();
      expect(data.response.type).toBeDefined();
    });

    it('should include actions in response when applicable', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          _query: 'Agendamentos da Maria amanhã?',
          sessionId: 'test-session-123',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      // Verify actions structure
      expect(data.actions).toBeDefined();
      expect(Array.isArray(data.actions)).toBe(true);

      if (data.actions.length > 0) {
        expect(data.actions[0]).toHaveProperty('id');
        expect(data.actions[0]).toHaveProperty('label');
        expect(data.actions[0]).toHaveProperty('type');
      }
    });

    it('should handle context parameter correctly', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          _query: 'Me mostre os clientes',
          sessionId: 'test-session-123',
          _context: {
            _userId: 'user-789',
            previousMessages: [
              {
                _role: 'user',
                content: 'Olá',
              },
              {
                _role: 'assistant',
                content: 'Olá! Como posso ajudar?',
              },
            ],
          },
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should return error response for processing failures', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          _query: 'INVALID_QUERY_THAT_SHOULD_FAIL',
          sessionId: 'test-session-123',
        }),
      });

      expect(response.status).toBe(200); // Still 200, but with error in response
      const data = await response.json();

      // Should return success: false for processing errors
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBeDefined();
      expect(data.error.message).toBeDefined();
    });
  });
});
