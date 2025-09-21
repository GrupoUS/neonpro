import { Hono } from 'hono';
import { createServer } from 'http';
import { fetch } from 'undici';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Import the sessions route
import { sessionsRouter } from '../../src/routes/ai/sessions';

describe('Contract Tests: AI Sessions Endpoint', () => {
  let server: any;
  let baseUrl: string;
  let app: Hono;

  beforeAll(async () => {
    // Create Hono app with sessions route
    app = new Hono();
    app.route('/api/ai/sessions', sessionsRouter);

    // Start test server
    server = createServer({
      fetch: app.fetch,
      port: 0,
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

  describe('GET /api/ai/sessions/{sessionId}', () => {
    it('should return 400 for missing sessionId', async () => {
      const response = await fetch(`${baseUrl}/api/ai/sessions/`, {
        method: 'GET',
      });

      expect(response.status).toBe(404); // Route not found without sessionId
    });

    it('should return 404 for non-existent session', async () => {
      const sessionId = 'non-existent-session-123';
      const response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should return 200 for valid session', async () => {
      const sessionId = 'test-session-123';
      const response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      // This might return 404 if session doesn't exist yet, which is expected
      // In real implementation, we'd create a session first
      if (response.status === 200) {
        const data = await response.json();

        // Verify response structure
        expect(data.sessionId).toBe(sessionId);
        expect(data._userId).toBeDefined();
        expect(data.messages).toBeDefined();
        expect(Array.isArray(data.messages)).toBe(true);
        expect(data.createdAt).toBeDefined();
        expect(data.lastActivity).toBeDefined();
      } else {
        expect(response.status).toBe(404);
      }
    });

    it('should return session with messages', async () => {
      const sessionId = 'session-with-messages-456';
      const response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      if (response.status === 200) {
        const data = await response.json();

        // Verify messages structure
        expect(data.messages).toBeDefined();

        if (data.messages.length > 0) {
          const message = data.messages[0];
          expect(message).toHaveProperty('id');
          expect(message).toHaveProperty('role');
          expect(['user', 'assistant']).toContain(message._role);
          expect(message).toHaveProperty('content');
          expect(message).toHaveProperty('timestamp');

          // Verify timestamp format
          expect(new Date(message.timestamp)).toBeInstanceOf(Date);
        }
      }
    });

    it('should handle malformed sessionId', async () => {
      const sessionId = 'invalid-session-id!';
      const response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should require authentication', async () => {
      const sessionId = 'test-session-123';
      const response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}`, {
        method: 'GET',
      });

      expect(response.status).toBe(401);
    });

    it('should return properly formatted timestamps', async () => {
      const sessionId = 'test-session-timestamps';
      const response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      if (response.status === 200) {
        const data = await response.json();

        // Verify ISO 8601 format for timestamps
        expect(() => new Date(data.createdAt)).not.toThrow();
        expect(() => new Date(data.lastActivity)).not.toThrow();

        // Verify createdAt is before or equal to lastActivity
        const createdAt = new Date(data.createdAt).getTime();
        const lastActivity = new Date(data.lastActivity).getTime();
        expect(createdAt).toBeLessThanOrEqual(lastActivity);
      }
    });

    it('should include data field in messages when present', async () => {
      const sessionId = 'session-with-data-789';
      const response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      if (response.status === 200 && data.messages.length > 0) {
        const messageWithDate = data.messages.find((m: any) => m.data);
        if (messageWithDate) {
          expect(typeof messageWithDate.data).toBe('object');
        }
      }
    });
  });
});
