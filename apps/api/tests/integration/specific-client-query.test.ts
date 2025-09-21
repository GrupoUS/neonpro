/**
 * Integration Test for "Specific client query" scenario
 * TDD Test - MUST FAIL until implementation is complete
 *
 * This test validates querying specific client data by name
 * from quickstart.md scenario 4
 */

import { afterAll, beforeAll, describe, expect, test } from 'vitest';

describe('Specific Client Query - Integration Test', () => {
  let app: any;

  beforeAll(async () => {
    try {
      app = (await import('../../src/app')).default;
    } catch (error) {
      console.log('Expected failure: App not available during TDD phase');
    }
  });

  describe('Named Client Query Processing', () => {
    test('should handle "Me mostre informações da Maria Silva" query', async () => {
      expect(app).toBeDefined();

      const query = 'Me mostre informações da Maria Silva';
      const sessionId = 'test-session-specific-client';

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-doctor-token',
        },
        body: JSON.stringify({
          query,
          sessionId,
          _context: {
            _userId: 'doctor-user-id',
          },
        }),
      });

      expect(response.status).toBe(200);

      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      expect(responseData.response.type).toBe('table');
      expect(responseData.response.content.title).toContain('Maria Silva');
    });

    test('should extract client names from various query formats', async () => {
      expect(app).toBeDefined();

      const nameQueries = [
        'Dados do João Santos',
        'Informações sobre Ana Costa',
        'Histórico de Pedro Oliveira',
        'Cliente Carlos Silva',
      ];

      for (const query of nameQueries) {
        const response = await app.request('/api/ai/data-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-doctor-token',
          },
          body: JSON.stringify({
            query,
            sessionId: `test-session-${Math.random()}`,
            _context: {
              _userId: 'doctor-user-id',
            },
          }),
        });

        expect(response.status).toBe(200);
        const responseData = await response.json();
        expect(responseData.success).toBe(true);
      }
    });
  });

  describe('Client Data Structure', () => {
    test('should return comprehensive client information', async () => {
      expect(app).toBeDefined();

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-doctor-token',
        },
        body: JSON.stringify({
          _query: 'Informações completas da Maria Silva',
          sessionId: 'test-session-comprehensive',
          _context: {
            _userId: 'doctor-user-id',
          },
        }),
      });

      const responseData = await response.json();

      expect(responseData.response.content).toHaveProperty('data');
      if (responseData.response.content.data.length > 0) {
        const clientData = responseData.response.content.data[0];
        expect(clientData).toHaveProperty('name');
        expect(clientData).toHaveProperty('email');
        expect(clientData).toHaveProperty('phone');
      }
    });

    test('should include related appointments and history', async () => {
      expect(app).toBeDefined();

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-doctor-token',
        },
        body: JSON.stringify({
          _query: 'Histórico completo da Maria Silva',
          sessionId: 'test-session-history',
          _context: {
            _userId: 'doctor-user-id',
          },
        }),
      });

      const responseData = await response.json();
      expect(responseData.success).toBe(true);

      // Should include related data linking
      expect(responseData.actions).toBeDefined();
    });
  });

  describe('Privacy and Role-Based Access', () => {
    test('should respect role-based data visibility', async () => {
      expect(app).toBeDefined();

      const roles = [
        { token: 'valid-doctor-token', _role: 'doctor', fullAccess: true },
        { token: 'valid-nurse-token', _role: 'nurse', fullAccess: false },
        { token: 'valid-receptionist-token', _role: 'receptionist', fullAccess: false },
      ];

      for (const { token, role, fullAccess } of roles) {
        const response = await app.request('/api/ai/data-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            _query: 'Dados da Maria Silva',
            sessionId: `test-session-${role}`,
            _context: {
              _userId: `${role}-user-id`,
              _role: role,
            },
          }),
        });

        expect(response.status).toBe(200);
        const responseData = await response.json();
        expect(responseData.success).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent client gracefully', async () => {
      expect(app).toBeDefined();

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-doctor-token',
        },
        body: JSON.stringify({
          _query: 'Informações do Pedro Inexistente',
          sessionId: 'test-session-nonexistent',
          _context: {
            _userId: 'doctor-user-id',
          },
        }),
      });

      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      expect(responseData.response.type).toBe('text');
      expect(responseData.response.content.text).toContain('não encontrado');
    });
  });

  describe('Performance Requirements', () => {
    test('should respond within 2 seconds', async () => {
      expect(app).toBeDefined();

      const startTime = Date.now();

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-doctor-token',
        },
        body: JSON.stringify({
          _query: 'Informações da Maria Silva',
          sessionId: 'test-session-performance',
          _context: {
            _userId: 'doctor-user-id',
          },
        }),
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(2000);
      expect(response.status).toBe(200);
    });
  });
});
