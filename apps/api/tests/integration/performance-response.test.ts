/**
 * Performance Test for <2s Response Time Requirement
 * TDD Test - MUST FAIL until implementation is complete
 *
 * This test validates that all AI agent responses complete within 2 seconds
 * as specified in the performance requirements
 */

import { afterAll, beforeAll, describe, expect, test } from 'vitest';

describe('Response Time Performance - Integration Test', () => {
  let app: any;

  beforeAll(async () => {
    try {
      app = (await import('../../src/app')).default;
    } catch (error) {
      console.log('Expected failure: App not available during TDD phase');
    }
  });

  describe('Simple Query Response Times', () => {
    test('should respond to appointment queries within 2 seconds', async () => {
      expect(app).toBeDefined();

      const queries = [
        'Próximos agendamentos',
        'Agendamentos de hoje',
        'Consultas marcadas',
      ];

      for (const query of queries) {
        const startTime = Date.now();

        const response = await app.request('/api/ai/data-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-doctor-token',
          },
          body: JSON.stringify({
            query,
            sessionId: `test-session-performance-${Math.random()}`,
            _context: {
              _userId: 'doctor-user-id',
            },
          }),
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(responseTime).toBeLessThan(2000); // <2s requirement
        expect(response.status).toBe(200);

        console.log(`Query "${query}" took ${responseTime}ms`);
      }
    });

    test('should respond to client queries within 2 seconds', async () => {
      expect(app).toBeDefined();

      const queries = [
        'Clientes cadastrados',
        'Lista de pacientes',
        'Pacientes ativos',
      ];

      for (const query of queries) {
        const startTime = Date.now();

        const response = await app.request('/api/ai/data-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-nurse-token',
          },
          body: JSON.stringify({
            query,
            sessionId: `test-session-client-perf-${Math.random()}`,
            _context: {
              _userId: 'nurse-user-id',
            },
          }),
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(responseTime).toBeLessThan(2000);
        expect(response.status).toBe(200);
      }
    });

    test('should respond to financial queries within 2 seconds', async () => {
      expect(app).toBeDefined();

      const queries = [
        'Como está o faturamento?',
        'Receita do mês',
        'Resumo financeiro',
      ];

      for (const query of queries) {
        const startTime = Date.now();

        const response = await app.request('/api/ai/data-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-admin-token',
          },
          body: JSON.stringify({
            query,
            sessionId: `test-session-financial-perf-${Math.random()}`,
            _context: {
              _userId: 'admin-user-id',
            },
          }),
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(responseTime).toBeLessThan(2000);
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Complex Query Response Times', () => {
    test('should handle complex appointment queries within 2 seconds', async () => {
      expect(app).toBeDefined();

      const complexQueries = [
        'Agendamentos da semana com status confirmado',
        'Consultas canceladas do mês passado',
        'Pacientes com agendamentos recorrentes',
      ];

      for (const query of complexQueries) {
        const startTime = Date.now();

        const response = await app.request('/api/ai/data-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-doctor-token',
          },
          body: JSON.stringify({
            query,
            sessionId: `test-session-complex-${Math.random()}`,
            _context: {
              _userId: 'doctor-user-id',
            },
          }),
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(responseTime).toBeLessThan(2000);
        expect(response.status).toBe(200);
      }
    });

    test('should handle data aggregation queries within 2 seconds', async () => {
      expect(app).toBeDefined();

      const aggregationQueries = [
        'Total de pacientes atendidos este mês',
        'Média de consultas por dia',
        'Pacientes por faixa etária',
      ];

      for (const query of aggregationQueries) {
        const startTime = Date.now();

        const response = await app.request('/api/ai/data-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-admin-token',
          },
          body: JSON.stringify({
            query,
            sessionId: `test-session-aggregation-${Math.random()}`,
            _context: {
              _userId: 'admin-user-id',
            },
          }),
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(responseTime).toBeLessThan(2000);
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Concurrent Request Performance', () => {
    test('should handle multiple concurrent requests within time limits', async () => {
      expect(app).toBeDefined();

      const concurrentQueries = [
        'Próximos agendamentos',
        'Clientes cadastrados',
        'Resumo financeiro',
        'Consultas de hoje',
        'Pacientes ativos',
      ];

      // Execute all queries concurrently
      const promises = concurrentQueries.map((query, index) => {
        const startTime = Date.now();

        return app.request('/api/ai/data-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-doctor-token',
          },
          body: JSON.stringify({
            query,
            sessionId: `test-session-concurrent-${index}`,
            _context: {
              _userId: 'doctor-user-id',
            },
          }),
        }).then(response => {
          const endTime = Date.now();
          return {
            query,
            responseTime: endTime - startTime,
            status: response.status,
          };
        });
      });

      const results = await Promise.all(promises);

      // All requests should complete within 2 seconds
      results.forEach(result => {
        expect(result.responseTime).toBeLessThan(2000);
        expect(result.status).toBe(200);
        console.log(`Concurrent query "${result.query}" took ${result.responseTime}ms`);
      });
    });

    test('should maintain performance under load', async () => {
      expect(app).toBeDefined();

      const loadTestPromises = [];
      const numberOfRequests = 10;

      for (let i = 0; i < numberOfRequests; i++) {
        const startTime = Date.now();

        const promise = app.request('/api/ai/data-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-doctor-token',
          },
          body: JSON.stringify({
            _query: 'Agendamentos de hoje',
            sessionId: `test-session-load-${i}`,
            _context: {
              _userId: 'doctor-user-id',
            },
          }),
        }).then(response => {
          const endTime = Date.now();
          return {
            requestId: i,
            responseTime: endTime - startTime,
            status: response.status,
          };
        });

        loadTestPromises.push(promise);
      }

      const loadResults = await Promise.all(loadTestPromises);

      // All requests should complete within time limits
      loadResults.forEach(result => {
        expect(result.responseTime).toBeLessThan(2000);
        expect(result.status).toBe(200);
      });

      // Calculate average response time
      const avgResponseTime = loadResults.reduce((sum, result) => sum + result.responseTime, 0)
        / loadResults.length;
      console.log(`Average response time under load: ${avgResponseTime}ms`);

      // Average should still be well under 2 seconds
      expect(avgResponseTime).toBeLessThan(1500); // 1.5s average
    });
  });

  describe('Edge Case Performance', () => {
    test('should handle empty results quickly', async () => {
      expect(app).toBeDefined();

      const startTime = Date.now();

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-doctor-token',
        },
        body: JSON.stringify({
          _query: 'Agendamentos para o ano 3000',
          sessionId: 'test-session-empty-results',
          _context: {
            _userId: 'doctor-user-id',
          },
        }),
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(2000);
      expect(response.status).toBe(200);
    });

    test('should handle malformed queries efficiently', async () => {
      expect(app).toBeDefined();

      const malformedQueries = [
        '???',
        'asdfghjkl',
        '123456789',
        '',
      ];

      for (const query of malformedQueries) {
        const startTime = Date.now();

        const response = await app.request('/api/ai/data-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-doctor-token',
          },
          body: JSON.stringify({
            query,
            sessionId: `test-session-malformed-${Math.random()}`,
            _context: {
              _userId: 'doctor-user-id',
            },
          }),
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(responseTime).toBeLessThan(2000);
        // Status may vary for malformed queries, but should respond quickly
      }
    });

    test('should handle access denied scenarios quickly', async () => {
      expect(app).toBeDefined();

      const startTime = Date.now();

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-receptionist-token',
        },
        body: JSON.stringify({
          _query: 'Dados financeiros completos',
          sessionId: 'test-session-denied-performance',
          _context: {
            _userId: 'receptionist-user-id',
            _role: 'receptionist',
          },
        }),
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(2000);
      expect(response.status).toBe(200); // Should return access denied message, not HTTP error
    });
  });

  describe('Response Time Metadata Validation', () => {
    test('should include accurate processing time in response metadata', async () => {
      expect(app).toBeDefined();

      const startTime = Date.now();

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-doctor-token',
        },
        body: JSON.stringify({
          _query: 'Próximos agendamentos',
          sessionId: 'test-session-metadata',
          _context: {
            _userId: 'doctor-user-id',
          },
        }),
      });

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(response.status).toBe(200);

      const responseData = await response.json();
      expect(responseData.metadata).toBeDefined();
      expect(responseData.metadata.processingTime).toBeDefined();
      expect(typeof responseData.metadata.processingTime).toBe('number');

      // Processing time should be less than total time and under 2s
      expect(responseData.metadata.processingTime).toBeLessThan(totalTime);
      expect(responseData.metadata.processingTime).toBeLessThan(2000);
    });
  });
});
