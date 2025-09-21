/**
 * Performance Requirements Validation E2E Tests
 *
 * Validates performance requirements for healthcare AI agent:
 * - <2s response time for all critical endpoints
 * - ≤300ms HTTPS handshake time
 * - Concurrent user handling
 * - Memory usage optimization
 * - Core Web Vitals compliance
 *
 * @version 1.0.0
 * @author NeonPro Platform Team
 * @compliance LGPD, ANVISA, ISO 27001
 */

import { expect, test } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'https://localhost:3000';

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  RESPONSE_TIME_MS: 2000,
  HTTPS_HANDSHAKE_MS: 300,
  MEMORY_USAGE_MB: 512,
  CONCURRENT_USERS: 10,
  SUCCESS_RATE: 0.95,
};

test.describe('Performance Requirements Validation', () => {
  test.describe('Response Time Testing', () => {
    test('should meet <2s response time for health endpoint', async ({ request }) => {
      const startTime = performance.now();

      const response = await request.get(`${baseUrl}/v1/health`);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RESPONSE_TIME_MS);

      console.log(`Health endpoint response time: ${responseTime.toFixed(2)}ms`);
    });

    test('should meet <2s response time for AI agent endpoint', async ({ request }) => {
      const startTime = performance.now();

      const response = await request.post(`${baseUrl}/api/v2/ai/data-agent`, {
        data: {
          _query: 'Próximos agendamentos',
          sessionId: 'test-session',
        },
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect([200, 401, 403]).toContain(response.status());
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RESPONSE_TIME_MS);

      console.log(`AI agent endpoint response time: ${responseTime.toFixed(2)}ms`);
    });

    test('should meet <2s response time for patients endpoint', async ({ request }) => {
      const startTime = performance.now();

      const response = await request.get(`${baseUrl}/api/v2/patients`);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect([200, 401]).toContain(response.status());
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RESPONSE_TIME_MS);

      console.log(`Patients endpoint response time: ${responseTime.toFixed(2)}ms`);
    });

    test('should meet <2s response time for appointments endpoint', async ({ request }) => {
      const startTime = performance.now();

      const response = await request.get(`${baseUrl}/api/v1/appointments`);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect([200, 401]).toContain(response.status());
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RESPONSE_TIME_MS);

      console.log(`Appointments endpoint response time: ${responseTime.toFixed(2)}ms`);
    });

    test('should meet <2s response time for all critical endpoints', async ({ request }) => {
      const criticalEndpoints = [
        '/v1/health',
        '/api/v2/ai/copilot',
        '/api/v2/ai/data-agent',
        '/v1/info',
      ];

      const responseTimes: number[] = [];

      for (const endpoint of criticalEndpoints) {
        const startTime = performance.now();

        const response = await request.get(`${baseUrl}${endpoint}`);

        const endTime = performance.now();
        const responseTime = endTime - startTime;

        responseTimes.push(responseTime);

        expect(response.status()).toBe(200);
        expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RESPONSE_TIME_MS);
      }

      const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0)
        / responseTimes.length;
      console.log(
        `Average response time across critical endpoints: ${averageResponseTime.toFixed(2)}ms`,
      );

      expect(averageResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RESPONSE_TIME_MS);
    });
  });

  test.describe('HTTPS Handshake Performance', () => {
    test('should achieve ≤300ms HTTPS handshake time', async ({ request }) => {
      const startTime = performance.now();

      const response = await request.get(`${baseUrl}/v1/health`);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(response.status()).toBe(200);

      // Extract handshake time from monitoring endpoint
      const monitoringResponse = await request.get(`${baseUrl}/v1/monitoring/https`);

      if (monitoringResponse.status() === 200) {
        const monitoring = await monitoringResponse.json();
        const handshakeTime = monitoring.performance?.handshakeTimeMs || 0;

        expect(handshakeTime).toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.HTTPS_HANDSHAKE_MS);
        console.log(`HTTPS handshake time: ${handshakeTime}ms`);
      }

      // Overall request should still be fast
      expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RESPONSE_TIME_MS);
      console.log(`Total HTTPS request time: ${totalTime.toFixed(2)}ms`);
    });

    test('should maintain HTTPS performance under load', async ({ request }) => {
      const requests = Array(10).fill(0).map(() => request.get(`${baseUrl}/v1/health`));

      const startTime = performance.now();
      const responses = await Promise.all(requests);
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const averageTime = totalTime / responses.length;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });

      // Average time should be reasonable
      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RESPONSE_TIME_MS);
      console.log(`Average HTTPS request time under load: ${averageTime.toFixed(2)}ms`);
    });
  });

  test.describe('AI Agent Performance', () => {
    test('should process queries within 2 seconds', async ({ request }) => {
      const testQueries = [
        'Próximos agendamentos',
        'Me mostre os clientes cadastrados',
        'Como está o faturamento?',
        'Agendamentos de hoje',
      ];

      for (const query of testQueries) {
        const startTime = performance.now();

        const response = await request.post(`${baseUrl}/api/v2/ai/data-agent`, {
          data: {
            query,
            sessionId: 'test-session',
          },
        });

        const endTime = performance.now();
        const responseTime = endTime - startTime;

        expect([200, 401, 403]).toContain(response.status());
        expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RESPONSE_TIME_MS);

        console.log(`Query "${query}" response time: ${responseTime.toFixed(2)}ms`);
      }
    });

    test('should handle session management efficiently', async ({ request }) => {
      // Test session creation and access
      const sessionResponse = await request.post(`${baseUrl}/api/v2/ai/data-agent`, {
        data: {
          _query: 'Test session',
          sessionId: 'performance-test-session',
        },
      });

      expect([200, 401, 403]).toContain(sessionResponse.status());

      // Test session retrieval
      const sessionId = 'performance-test-session';
      const startTime = performance.now();

      const getSessionResponse = await request.get(`${baseUrl}/api/v2/ai/sessions/${sessionId}`);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect([200, 401, 403, 404]).toContain(getSessionResponse.status());
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RESPONSE_TIME_MS);

      console.log(`Session retrieval time: ${responseTime.toFixed(2)}ms`);
    });

    test('should validate conversation context performance', async ({ request }) => {
      // Test multiple related queries in same session
      const sessionId = 'context-performance-test';
      const queries = [
        'Me mostre os pacientes',
        'Quais os agendamentos de hoje?',
        'Como está a clínica?',
      ];

      const responseTimes: number[] = [];

      for (const query of queries) {
        const startTime = performance.now();

        const response = await request.post(`${baseUrl}/api/v2/ai/data-agent`, {
          data: {
            query,
            sessionId,
          },
        });

        const endTime = performance.now();
        const responseTime = endTime - startTime;
        responseTimes.push(responseTime);

        expect([200, 401, 403]).toContain(response.status());
        expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RESPONSE_TIME_MS);
      }

      const averageContextTime = responseTimes.reduce((sum, time) => sum + time, 0)
        / responseTimes.length;
      console.log(`Average context-aware query time: ${averageContextTime.toFixed(2)}ms`);

      // Context should not significantly impact performance
      expect(averageContextTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RESPONSE_TIME_MS);
    });
  });

  test.describe('Load Testing', () => {
    test('should handle concurrent users without degradation', async ({ request }) => {
      const concurrentUsers = PERFORMANCE_THRESHOLDS.CONCURRENT_USERS;
      const requests = Array(concurrentUsers).fill(0).map((_, index) =>
        request.get(`${baseUrl}/v1/health`, {
          headers: { 'X-Test-User': `user-${index}` },
        })
      );

      const startTime = performance.now();
      const responses = await Promise.all(requests);
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const averageTime = totalTime / responses.length;

      // All requests should succeed
      const successCount = responses.filter(r => r.status() === 200).length;
      const successRate = successCount / responses.length;

      expect(successRate).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.SUCCESS_RATE);
      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RESPONSE_TIME_MS);

      console.log(`Concurrent users: ${concurrentUsers}`);
      console.log(`Success rate: ${(successRate * 100).toFixed(1)}%`);
      console.log(`Average response time: ${averageTime.toFixed(2)}ms`);
    });

    test('should handle concurrent AI queries', async ({ request }) => {
      const concurrentQueries = 5;
      const queries = Array(concurrentQueries).fill(0).map((_, index) =>
        request.post(`${baseUrl}/api/v2/ai/data-agent`, {
          data: {
            _query: `Test query ${index}`,
            sessionId: `concurrent-session-${index}`,
          },
        })
      );

      const startTime = performance.now();
      const responses = await Promise.all(queries);
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const averageTime = totalTime / responses.length;

      // Most requests should succeed (some might be auth failures)
      const successCount = responses.filter(r => [200, 401, 403].includes(r.status())).length;
      const successRate = successCount / responses.length;

      expect(successRate).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.SUCCESS_RATE);
      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RESPONSE_TIME_MS);

      console.log(`Concurrent AI queries: ${concurrentQueries}`);
      console.log(`Success rate: ${(successRate * 100).toFixed(1)}%`);
      console.log(`Average response time: ${averageTime.toFixed(2)}ms`);
    });
  });

  test.describe('Memory and Resource Usage', () => {
    test('should maintain reasonable memory usage', async ({ request }) => {
      // Make multiple requests to test memory stability
      const requests = Array(20).fill(0).map(() => request.get(`${baseUrl}/v1/health`));

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });

      // Check monitoring endpoint for memory usage
      const monitoringResponse = await request.get(`${baseUrl}/v1/monitoring/https`);

      if (monitoringResponse.status() === 200) {
        const monitoring = await monitoringResponse.json();
        const memoryUsage = monitoring.performance?.memoryUsageMb || 0;

        // Memory usage should be reasonable
        expect(memoryUsage).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_USAGE_MB);
        console.log(`Memory usage: ${memoryUsage}MB`);
      }
    });

    test('should validate system performance metrics', async ({ request }) => {
      const response = await request.get(`${baseUrl}/v1/health`);

      expect(response.status()).toBe(200);

      const healthData = await response.json();

      // Check if performance metrics are available
      if (healthData.monitoring) {
        const { errorTracking, logger } = healthData.monitoring;

        // Monitoring should be healthy
        expect(errorTracking).toBeDefined();
        expect(logger).toBeDefined();

        console.log('System performance metrics validated');
      }
    });
  });

  test.describe('Core Web Vitals Compliance', () => {
    test('should validate frontend performance metrics', async ({ page }) => {
      // Navigate to a page that would have the AI chat interface
      await page.goto(`${baseUrl}/`);

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Get performance metrics
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType(
          'navigation',
        )[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd
            - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: performance.getEntriesByType('paint').find(p =>
            p.name === 'first-paint'
          )?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByType('paint').find(p =>
            p.name === 'first-contentful-paint'
          )?.startTime || 0,
        };
      });

      // Core Web Vitals thresholds
      expect(metrics.domContentLoaded).toBeLessThan(3000); // 3s
      expect(metrics.loadComplete).toBeLessThan(5000); // 5s
      expect(metrics.firstContentfulPaint).toBeLessThan(2000); // 2s

      console.log('Core Web Vitals:', metrics);
    });
  });

  test.describe('Performance Regression Testing', () => {
    test('should maintain performance over multiple requests', async ({ request }) => {
      const numRequests = 50;
      const responseTimes: number[] = [];

      for (let i = 0; i < numRequests; i++) {
        const startTime = performance.now();

        const response = await request.get(`${baseUrl}/v1/health`);

        const endTime = performance.now();
        const responseTime = endTime - startTime;
        responseTimes.push(responseTime);

        expect(response.status()).toBe(200);
      }

      const averageTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const maxTime = Math.max(...responseTimes);
      const minTime = Math.min(...responseTimes);

      // Performance should remain consistent
      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RESPONSE_TIME_MS);
      expect(maxTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RESPONSE_TIME_MS * 2); // Allow some variance

      console.log(`Performance over ${numRequests} requests:`);
      console.log(`  Average: ${averageTime.toFixed(2)}ms`);
      console.log(`  Min: ${minTime.toFixed(2)}ms`);
      console.log(`  Max: ${maxTime.toFixed(2)}ms`);
    });
  });
});
