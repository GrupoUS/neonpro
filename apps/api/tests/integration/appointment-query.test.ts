/**
 * Integration Test for "Query upcoming appointments" scenario
 * TDD Test - MUST FAIL until implementation is complete
 *
 * This test validates the complete flow for querying upcoming appointments
 * from quickstart.md scenario 1
 */

import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';

describe('Query Upcoming Appointments - Integration Test', () => {
  let app: any;
  let testServer: any;

  beforeAll(async () => {
    try {
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

  beforeEach(async () => {
    // Setup test data - this will fail until implementation is complete
    // In real implementation, this would set up test appointments
  });

  describe('Portuguese Language Query Processing', () => {
    test('should handle "Quais os próximos agendamentos?" query', async () => {
      expect(app).toBeDefined();

      const query = 'Quais os próximos agendamentos?';
      const sessionId = 'test-session-appointments';

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-doctor-token',
        },
        body: JSON.stringify({
          query,
          sessionId,
          context: {
            userId: 'doctor-user-id',
          },
        }),
      });

      // Response validation
      expect(response.status).toBe(200);

      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      expect(responseData.response).toBeDefined();

      // Should return list type for appointments
      expect(responseData.response.type).toBe('list');

      // Content should have title and data
      expect(responseData.response.content).toHaveProperty('title');
      expect(responseData.response.content.title).toContain('Agendamentos');
      expect(responseData.response.content).toHaveProperty('data');
      expect(Array.isArray(responseData.response.content.data)).toBe(true);
    });

    test('should handle alternative appointment queries', async () => {
      expect(app).toBeDefined();

      const alternativeQueries = [
        'Próximos agendamentos',
        'Me mostre os agendamentos de hoje',
        'Consultas marcadas para hoje',
        'Agenda do dia',
      ];

      for (const query of alternativeQueries) {
        const response = await app.request('/api/ai/data-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-doctor-token',
          },
          body: JSON.stringify({
            query,
            sessionId: `test-session-${Math.random()}`,
            context: {
              userId: 'doctor-user-id',
            },
          }),
        });

        expect(response.status).toBe(200);

        const responseData = await response.json();
        expect(responseData.success).toBe(true);
        expect(responseData.response.type).toBe('list');
      }
    });
  });

  describe('Response Structure Validation', () => {
    test('should return properly structured appointment data', async () => {
      expect(app).toBeDefined();

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-doctor-token',
        },
        body: JSON.stringify({
          query: 'Quais os próximos agendamentos?',
          sessionId: 'test-session-structure',
          context: {
            userId: 'doctor-user-id',
          },
        }),
      });

      const responseData = await response.json();

      if (responseData.response.content.data.length > 0) {
        const appointment = responseData.response.content.data[0];

        // Validate appointment structure according to quickstart requirements
        expect(appointment).toHaveProperty('id');
        expect(appointment).toHaveProperty('datetime');
        expect(appointment).toHaveProperty('clientName');
        expect(appointment).toHaveProperty('status');

        // Validate status is one of expected values
        expect(['scheduled', 'confirmed', 'completed', 'cancelled']).toContain(appointment.status);

        // Validate datetime format
        expect(new Date(appointment.datetime)).toBeInstanceOf(Date);
      }
    });

    test('should include interactive action buttons', async () => {
      expect(app).toBeDefined();

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-doctor-token',
        },
        body: JSON.stringify({
          query: 'Próximos agendamentos',
          sessionId: 'test-session-actions',
          context: {
            userId: 'doctor-user-id',
          },
        }),
      });

      const responseData = await response.json();

      // Should include interactive actions
      expect(responseData.actions).toBeDefined();
      expect(Array.isArray(responseData.actions)).toBe(true);

      if (responseData.actions.length > 0) {
        const action = responseData.actions[0];
        expect(action).toHaveProperty('id');
        expect(action).toHaveProperty('label');
        expect(action).toHaveProperty('type');
        expect(action.label).toContain('detalhes');
      }
    });
  });

  describe('Permission and Security Validation', () => {
    test('should respect domain-based data access', async () => {
      expect(app).toBeDefined();

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-clinic-a-token',
        },
        body: JSON.stringify({
          query: 'Quais os próximos agendamentos?',
          sessionId: 'test-session-domain',
          context: {
            userId: 'clinic-a-user',
            domain: 'clinic-a',
          },
        }),
      });

      const responseData = await response.json();

      if (responseData.success && responseData.response.content.data.length > 0) {
        // All appointments should belong to the user's domain
        const appointments = responseData.response.content.data;
        appointments.forEach(appointment => {
          // This validation will be implemented with actual domain checking
          expect(appointment).toBeDefined();
        });
      }
    });

    test('should enforce role-based access control', async () => {
      expect(app).toBeDefined();

      // Test different roles
      const roles = [
        { token: 'valid-doctor-token', role: 'doctor', shouldSeeAll: true },
        { token: 'valid-nurse-token', role: 'nurse', shouldSeeAll: true },
        { token: 'valid-receptionist-token', role: 'receptionist', shouldSeeAll: false },
      ];

      for (const { token, role, shouldSeeAll } of roles) {
        const response = await app.request('/api/ai/data-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: 'Próximos agendamentos',
            sessionId: `test-session-${role}`,
            context: {
              userId: `${role}-user-id`,
              role: role,
            },
          }),
        });

        expect(response.status).toBe(200);

        const responseData = await response.json();
        expect(responseData.success).toBe(true);

        // Role-specific validation would be implemented here
        if (!shouldSeeAll) {
          // Receptionist might see limited information
          expect(responseData.response).toBeDefined();
        }
      }
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
          query: 'Quais os próximos agendamentos?',
          sessionId: 'test-session-performance',
          context: {
            userId: 'doctor-user-id',
          },
        }),
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(2000); // <2s requirement
      expect(response.status).toBe(200);
    });

    test('should include processing time metadata', async () => {
      expect(app).toBeDefined();

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-doctor-token',
        },
        body: JSON.stringify({
          query: 'Próximos agendamentos',
          sessionId: 'test-session-metadata',
          context: {
            userId: 'doctor-user-id',
          },
        }),
      });

      const responseData = await response.json();

      expect(responseData.metadata).toBeDefined();
      expect(responseData.metadata.processingTime).toBeDefined();
      expect(typeof responseData.metadata.processingTime).toBe('number');
      expect(responseData.metadata.processingTime).toBeLessThan(2000);
    });
  });

  describe('Data Formatting and Display', () => {
    test('should format appointment dates in Portuguese locale', async () => {
      expect(app).toBeDefined();

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-doctor-token',
        },
        body: JSON.stringify({
          query: 'Agendamentos de hoje',
          sessionId: 'test-session-locale',
          context: {
            userId: 'doctor-user-id',
          },
        }),
      });

      const responseData = await response.json();

      if (responseData.response.content.data.length > 0) {
        const appointment = responseData.response.content.data[0];

        // Should include proper date formatting
        expect(appointment.datetime).toBeDefined();

        // Response should be in Portuguese
        expect(responseData.response.content.title).toMatch(/[Aa]gendamentos?/);
      }
    });

    test('should handle empty results gracefully', async () => {
      expect(app).toBeDefined();

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-empty-schedule-token',
        },
        body: JSON.stringify({
          query: 'Agendamentos para amanhã',
          sessionId: 'test-session-empty',
          context: {
            userId: 'empty-schedule-user',
          },
        }),
      });

      const responseData = await response.json();

      expect(responseData.success).toBe(true);
      expect(responseData.response.type).toBe('text');
      expect(responseData.response.content.text).toContain('Não há agendamentos');
    });
  });
});
