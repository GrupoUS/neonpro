// T048: Performance tests for chat API latency (<2s response time)
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/index';
import { testRequest } from '../helpers/test-request';

const PERFORMANCE_TARGETS = {
  MAX_RESPONSE_TIME: 2000, // 2 seconds (constitutional requirement)
  TARGET_RESPONSE_TIME: 500, // 500ms target for good UX
  CONCURRENT_REQUESTS: 10,
  THROUGHPUT_REQUESTS: 100,
} as const;

describe('Chat API Performance Tests', () => {
  beforeAll(async () => {
    // Warm up the application
    await testRequest(app).get('/api/v1/chat/health');
  });

  describe('Response Time Requirements', () => {
    it('should respond to health check within target time', async () => {
      const startTime = Date.now();

      const response = await testRequest(app)
        .get('/api/v1/chat/health')
        .expect(200);

      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(PERFORMANCE_TARGETS.TARGET_RESPONSE_TIME);
      expect(response.body).toHaveProperty('status', 'ok');
    });

    it('should complete chat query within constitutional limit (2s)', async () => {
      const startTime = Date.now();

      const response = await testRequest(app)
        .post('/api/v1/chat/query')
        .send({
          message: 'Hello, this is a test message for performance testing',
          sessionId: 'perf-test-session',
          userId: 'perf-test-user',
          consent: {
            dataProcessing: true,
            aiInteraction: true,
            timestamp: new Date().toISOString(),
          },
        })
        .expect(200);

      const responseTime = Date.now() - startTime;

      // Constitutional requirement: must respond within 2 seconds
      expect(responseTime).toBeLessThan(PERFORMANCE_TARGETS.MAX_RESPONSE_TIME);

      // Log performance metrics for monitoring
      console.log(`Chat query response time: ${responseTime}ms`);

      expect(response.body).toHaveProperty('response');
      expect(response.body).toHaveProperty('sessionId');
    });

    it('should handle session retrieval quickly', async () => {
      // First create a session
      const createResponse = await testRequest(app)
        .post('/api/v1/chat/query')
        .send({
          message: 'Test session creation',
          sessionId: 'perf-session-test',
          userId: 'perf-user',
          consent: {
            dataProcessing: true,
            aiInteraction: true,
            timestamp: new Date().toISOString(),
          },
        });

      const sessionId = createResponse.body.sessionId;

      // Measure session retrieval time
      const startTime = Date.now();

      const response = await testRequest(app)
        .get(`/api/v1/chat/session/${sessionId}`)
        .expect(200);

      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(PERFORMANCE_TARGETS.TARGET_RESPONSE_TIME);
      expect(response.body).toHaveProperty('id', sessionId);
    });

    it('should handle explanation requests efficiently', async () => {
      const startTime = Date.now();

      const response = await testRequest(app)
        .post('/api/v1/chat/explanation')
        .send({
          query: 'Explain hypertension treatment',
          context: 'patient care',
          userId: 'perf-user',
          consent: {
            dataProcessing: true,
            aiInteraction: true,
            timestamp: new Date().toISOString(),
          },
        })
        .expect(200);

      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(PERFORMANCE_TARGETS.MAX_RESPONSE_TIME);
      expect(response.body).toHaveProperty('explanation');
    });
  });

  describe('Concurrent Load Testing', () => {
    it('should handle concurrent health checks efficiently', async () => {
      const startTime = Date.now();

      const promises = Array.from(
        { length: PERFORMANCE_TARGETS.CONCURRENT_REQUESTS },
        () => testRequest(app).get('/api/v1/chat/health').expect(200),
      );

      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // All requests should complete within reasonable time
      expect(totalTime).toBeLessThan(PERFORMANCE_TARGETS.TARGET_RESPONSE_TIME * 2);

      // All responses should be successful
      responses.forEach(response => {
        expect(response.body).toHaveProperty('status', 'ok');
      });

      console.log(
        `${PERFORMANCE_TARGETS.CONCURRENT_REQUESTS} concurrent health checks completed in ${totalTime}ms`,
      );
    });

    it('should handle concurrent chat queries under load', async () => {
      const startTime = Date.now();

      const promises = Array.from(
        { length: PERFORMANCE_TARGETS.CONCURRENT_REQUESTS },
        (_, i) =>
          testRequest(app)
            .post('/api/v1/chat/query')
            .send({
              message: `Concurrent test message ${i}`,
              sessionId: `concurrent-session-${i}`,
              userId: `concurrent-user-${i}`,
              consent: {
                dataProcessing: true,
                aiInteraction: true,
                timestamp: new Date().toISOString(),
              },
            })
            .expect(200),
      );

      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const avgResponseTime = totalTime / PERFORMANCE_TARGETS.CONCURRENT_REQUESTS;

      // Average response time should be within constitutional limit
      expect(avgResponseTime).toBeLessThan(PERFORMANCE_TARGETS.MAX_RESPONSE_TIME);

      // All responses should be successful
      responses.forEach((response, i) => {
        expect(response.body).toHaveProperty('response');
        expect(response.body).toHaveProperty('sessionId', `concurrent-session-${i}`);
      });

      console.log(
        `${PERFORMANCE_TARGETS.CONCURRENT_REQUESTS} concurrent queries: avg ${
          avgResponseTime.toFixed(2)
        }ms`,
      );
    });

    it('should maintain performance under rate limiting pressure', async () => {
      const userId = 'rate-limit-perf-user';
      const requests = [];
      const responseTimes = [];

      // Make requests up to rate limit
      for (let i = 0; i < 8; i++) {
        const startTime = Date.now();

        const request = testRequest(app)
          .post('/api/v1/chat/query')
          .send({
            message: `Rate limit test ${i}`,
            sessionId: `rate-limit-session-${i}`,
            userId,
            consent: {
              dataProcessing: true,
              aiInteraction: true,
              timestamp: new Date().toISOString(),
            },
          });

        requests.push(request.then(response => {
          const responseTime = Date.now() - startTime;
          responseTimes.push(responseTime);
          return response;
        }));
      }

      const responses = await Promise.all(requests);

      // All successful requests should be within performance limits
      responses.forEach((response, i) => {
        if (response.status === 200) {
          expect(responseTimes[i]).toBeLessThan(PERFORMANCE_TARGETS.MAX_RESPONSE_TIME);
        }
      });

      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      console.log(`Rate limiting scenario avg response time: ${avgResponseTime.toFixed(2)}ms`);
    });
  });

  describe('Throughput Testing', () => {
    it('should maintain consistent performance across many requests', async () => {
      const batchSize = 10;
      const batches = PERFORMANCE_TARGETS.THROUGHPUT_REQUESTS / batchSize;
      const responseTimes: number[] = [];

      for (let batch = 0; batch < batches; batch++) {
        const batchPromises = Array.from({ length: batchSize }, (_, i) => {
          const requestIndex = batch * batchSize + i;
          const startTime = Date.now();

          return testRequest(app)
            .get('/api/v1/chat/health')
            .expect(200)
            .then(response => {
              const responseTime = Date.now() - startTime;
              responseTimes.push(responseTime);
              return response;
            });
        });

        await Promise.all(batchPromises);

        // Small delay between batches to avoid overwhelming
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Calculate performance statistics
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);
      const p95ResponseTime =
        responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)];

      console.log(`Throughput test results (${PERFORMANCE_TARGETS.THROUGHPUT_REQUESTS} requests):`);
      console.log(`  Average: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`  Min: ${minResponseTime}ms`);
      console.log(`  Max: ${maxResponseTime}ms`);
      console.log(`  95th percentile: ${p95ResponseTime}ms`);

      // Performance assertions
      expect(avgResponseTime).toBeLessThan(PERFORMANCE_TARGETS.TARGET_RESPONSE_TIME);
      expect(p95ResponseTime).toBeLessThan(PERFORMANCE_TARGETS.MAX_RESPONSE_TIME);
      expect(maxResponseTime).toBeLessThan(PERFORMANCE_TARGETS.MAX_RESPONSE_TIME * 2); // Allow some variance
    });

    it('should handle streaming responses efficiently', async () => {
      const startTime = Date.now();

      const response = await testRequest(app)
        .post('/api/v1/chat/query')
        .send({
          message: 'Stream performance test',
          sessionId: 'stream-perf-session',
          userId: 'stream-perf-user',
          streaming: true,
          consent: {
            dataProcessing: true,
            aiInteraction: true,
            timestamp: new Date().toISOString(),
          },
        })
        .expect(200);

      const responseTime = Date.now() - startTime;

      // Streaming should start quickly
      expect(responseTime).toBeLessThan(PERFORMANCE_TARGETS.TARGET_RESPONSE_TIME);

      // Should have proper streaming headers
      expect(response.headers['content-type']).toContain('text/event-stream');
      expect(response.headers['cache-control']).toBe('no-cache');
      expect(response.headers['connection']).toBe('keep-alive');

      console.log(`Streaming response initiated in ${responseTime}ms`);
    });
  });

  describe('Resource Usage and Memory', () => {
    it('should not leak memory during sustained load', async () => {
      const initialMemory = process.memoryUsage();

      // Perform many requests
      for (let i = 0; i < 50; i++) {
        await testRequest(app)
          .get('/api/v1/chat/health')
          .expect(200);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      console.log(
        `Memory usage after 50 requests: +${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`,
      );

      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
    });

    it('should handle database connections efficiently', async () => {
      const startTime = Date.now();

      // Multiple database-dependent requests
      const promises = Array.from({ length: 20 }, (_, i) =>
        testRequest(app)
          .post('/api/v1/chat/query')
          .send({
            message: `DB connection test ${i}`,
            sessionId: `db-conn-session-${i}`,
            userId: `db-conn-user-${i}`,
            consent: {
              dataProcessing: true,
              aiInteraction: true,
              timestamp: new Date().toISOString(),
            },
          })
          .expect(200));

      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(PERFORMANCE_TARGETS.MAX_RESPONSE_TIME * 2);

      // All responses should be successful
      responses.forEach(response => {
        expect(response.body).toHaveProperty('response');
      });

      console.log(`20 DB-dependent requests completed in ${totalTime}ms`);
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle validation errors quickly', async () => {
      const startTime = Date.now();

      const response = await testRequest(app)
        .post('/api/v1/chat/query')
        .send({
          message: '', // Invalid: empty message
          userId: 'error-test-user',
        })
        .expect(400);

      const responseTime = Date.now() - startTime;

      // Error responses should be fast
      expect(responseTime).toBeLessThan(100); // Very fast for validation errors
      expect(response.body).toHaveProperty('error');
    });

    it('should handle rate limit errors efficiently', async () => {
      const userId = 'rate-limit-error-user';

      // Exhaust rate limit
      const promises = Array.from({ length: 12 }, (_, i) =>
        testRequest(app)
          .post('/api/v1/chat/query')
          .send({
            message: `Rate limit exhaustion test ${i}`,
            sessionId: `rate-exhaustion-${i}`,
            userId,
            consent: {
              dataProcessing: true,
              aiInteraction: true,
              timestamp: new Date().toISOString(),
            },
          }));

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // Check that rate limited responses come back quickly
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);

      // Total time should be reasonable even with rate limiting
      expect(totalTime).toBeLessThan(PERFORMANCE_TARGETS.MAX_RESPONSE_TIME * 2);

      console.log(`Rate limit handling completed in ${totalTime}ms`);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should perform well during typical medical consultation flow', async () => {
      const userId = 'medical-consultation-user';
      const sessionId = 'medical-consultation-session';
      const steps = [
        'Olá, gostaria de agendar uma consulta',
        'Tenho sentido dores de cabeça frequentes',
        'As dores começaram há cerca de uma semana',
        'Não tenho histórico de enxaqueca na família',
        'Gostaria de marcar um horário para segunda-feira',
      ];

      const stepTimes: number[] = [];

      for (const [index, message] of steps.entries()) {
        const startTime = Date.now();

        const response = await testRequest(app)
          .post('/api/v1/chat/query')
          .send({
            message,
            sessionId,
            userId,
            consent: {
              dataProcessing: true,
              aiInteraction: true,
              timestamp: new Date().toISOString(),
            },
          })
          .expect(200);

        const stepTime = Date.now() - startTime;
        stepTimes.push(stepTime);

        expect(stepTime).toBeLessThan(PERFORMANCE_TARGETS.MAX_RESPONSE_TIME);
        expect(response.body).toHaveProperty('response');

        console.log(`Medical consultation step ${index + 1}: ${stepTime}ms`);
      }

      const avgStepTime = stepTimes.reduce((a, b) => a + b, 0) / stepTimes.length;
      console.log(`Average step time in medical consultation: ${avgStepTime.toFixed(2)}ms`);

      expect(avgStepTime).toBeLessThan(PERFORMANCE_TARGETS.TARGET_RESPONSE_TIME * 1.5);
    });

    it('should handle peak hour simulation', async () => {
      // Simulate multiple concurrent users during peak hours
      const peakUsers = 5;
      const messagesPerUser = 3;

      const allPromises = [];
      const startTime = Date.now();

      for (let user = 0; user < peakUsers; user++) {
        const userPromises = Array.from(
          { length: messagesPerUser },
          (_, msgIndex) =>
            testRequest(app)
              .post('/api/v1/chat/query')
              .send({
                message: `Peak hour message ${msgIndex} from user ${user}`,
                sessionId: `peak-session-${user}`,
                userId: `peak-user-${user}`,
                consent: {
                  dataProcessing: true,
                  aiInteraction: true,
                  timestamp: new Date().toISOString(),
                },
              })
              .expect(200),
        );

        allPromises.push(...userPromises);
      }

      const responses = await Promise.all(allPromises);
      const totalTime = Date.now() - startTime;
      const avgResponseTime = totalTime / responses.length;

      console.log(
        `Peak hour simulation: ${responses.length} requests in ${totalTime}ms (avg: ${
          avgResponseTime.toFixed(2)
        }ms)`,
      );

      expect(avgResponseTime).toBeLessThan(PERFORMANCE_TARGETS.MAX_RESPONSE_TIME);

      // All responses should be successful
      responses.forEach(response => {
        expect(response.body).toHaveProperty('response');
      });
    });
  });
});
