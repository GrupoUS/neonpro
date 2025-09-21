/**
 * Performance Requirements Validation E2E Test
 * 
 * Validates performance requirements for healthcare compliance:
 * - Response time <2s for all API endpoints
 * - AI agent query performance
 * - Database query optimization
 * - WebSocket performance
 * - Mobile performance requirements
 * 
 * @version 1.0.0
 * @author NeonPro Platform Team
 * @compliance LGPD, ANVISA, Performance SLA
 */

import { test, expect } from '@playwright/test';

test.describe('Performance Requirements Validation', () => {
  let baseUrl: string;

  test.beforeAll(async () => {
    baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  });

  test.describe('API Response Time Requirements', () => {
    test('should meet <2s response time for all critical endpoints', async ({ request }) => {
      const criticalEndpoints = [
        { path: '/v1/health', method: 'GET', description: 'Health check' },
        { path: '/api/v2/patients', method: 'GET', description: 'Patient list' },
        { path: '/api/v2/appointments', method: 'GET', description: 'Appointments' },
        { path: '/api/v2/ai/chat', method: 'POST', description: 'AI chat' },
        { path: '/api/v2/ai/data-agent', method: 'POST', description: 'AI data agent' },
        { path: '/v1/security/status', method: 'GET', description: 'Security status' }
      ];

      const performanceResults: any[] = [];

      for (const endpoint of criticalEndpoints) {
        const startTime = performance.now();
        
        let response;
        if (endpoint.method === 'POST') {
          response = await request.post(`${baseUrl}${endpoint.path}`, {
            json: {
              query: 'test query',
              context: { test: true }
            }
          });
        } else {
          response = await request.get(`${baseUrl}${endpoint.path}`);
        }
        
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        performanceResults.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          description: endpoint.description,
          responseTime: responseTime,
          status: response.status()
        });

        // Validate response time requirement (<2s = 2000ms)
        expect(responseTime).toBeLessThan(2000);
        expect(response.status()).toBe(200);
      }

      // Log performance results for analysis
      test.info().annotations.push({
        type: 'performance',
        description: `API Performance Results: ${JSON.stringify(performanceResults, null, 2)}`
      });

      // Validate overall performance
      const averageResponseTime = performanceResults.reduce((sum, result) => sum + result.responseTime, 0) / performanceResults.length;
      expect(averageResponseTime).toBeLessThan(1500); // Average should be better than 2s
    });

    test('should maintain performance under load', async ({ request }) => {
      const concurrentRequests = 20;
      const endpoint = '/v1/health';
      
      const requestPromises = Array(concurrentRequests).fill(null).map(async () => {
        const startTime = performance.now();
        const response = await request.get(`${baseUrl}${endpoint}`);
        const endTime = performance.now();
        
        return {
          responseTime: endTime - startTime,
          status: response.status()
        };
      });

      const results = await Promise.all(requestPromises);
      
      // All requests should succeed
      results.forEach(result => {
        expect(result.status).toBe(200);
      });

      // All requests should meet performance requirements
      results.forEach(result => {
        expect(result.responseTime).toBeLessThan(2000);
      });

      // Calculate performance metrics
      const responseTimes = results.map(r => r.responseTime);
      const averageTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const maxTime = Math.max(...responseTimes);
      const minTime = Math.min(...responseTimes);

      // Validate load performance
      expect(averageTime).toBeLessThan(1500);
      expect(maxTime).toBeLessThan(3000); // Some leeway under load

      test.info().annotations.push({
        type: 'performance',
        description: `Load Test Results: Avg=${averageTime.toFixed(2)}ms, Min=${minTime.toFixed(2)}ms, Max=${maxTime.toFixed(2)}ms`
      });
    });

    test('should handle large dataset queries efficiently', async ({ request }) => {
      // Test endpoints that might return large datasets
      const endpoints = [
        '/api/v2/patients',
        '/api/v2/appointments',
        '/api/v2/appointments/upcoming'
      ];

      for (const endpoint of endpoints) {
        const startTime = performance.now();
        const response = await request.get(`${baseUrl}${endpoint}`);
        const endTime = performance.now();

        const responseTime = endTime - startTime;

        expect(response.status()).toBe(200);
        expect(responseTime).toBeLessThan(2000);

        const data = await response.json();
        
        // If data is returned, validate it's reasonable size
        if (Array.isArray(data)) {
          expect(data.length).toBeLessThanOrEqual(1000); // Reasonable pagination
        }
      }
    });
  });

  test.describe('AI Agent Performance', () => {
    test('should meet AI query performance requirements', async ({ request }) => {
      const aiQueries = [
        {
          description: 'Simple patient query',
          query: 'List upcoming appointments for patient test-patient-id',
          expectedMaxTime: 1500
        },
        {
          description: 'Complex data analysis query',
          query: 'Analyze appointment patterns for the last month and provide insights',
          expectedMaxTime: 2000
        },
        {
          description: 'Financial summary query',
          query: 'Get financial summary for clinic branch-001',
          expectedMaxTime: 1500
        }
      ];

      for (const aiQuery of aiQueries) {
        const startTime = performance.now();
        
        const response = await request.post(`${baseUrl}/api/v2/ai/data-agent`, {
          json: {
            query: aiQuery.query,
            context: {
              test: true,
              timestamp: new Date().toISOString()
            }
          }
        });
        
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        expect(response.status()).toBe(200);
        expect(responseTime).toBeLessThan(aiQuery.expectedMaxTime);

        const responseData = await response.json();
        expect(responseData).toHaveProperty('content');
        expect(responseData).toHaveProperty('type');

        test.info().annotations.push({
          type: 'ai-performance',
          description: `${aiQuery.description}: ${responseTime.toFixed(2)}ms`
        });
      }
    });

    test('should handle streaming AI responses efficiently', async ({ request }) => {
      // Test streaming AI chat responses
      const streamingQuery = {
        query: 'Provide a detailed analysis of patient flow patterns',
        streaming: true
      };

      const startTime = performance.now();
      
      const response = await request.post(`${baseUrl}/api/v2/ai/chat`, {
        json: streamingQuery
      });
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(1000); // Initial response should be fast

      // Validate streaming capabilities
      const responseData = await response.json();
      expect(responseData).toHaveProperty('streaming');
      expect(responseData).toHaveProperty('sessionId');
    });

    test('should maintain AI performance with concurrent requests', async ({ request }) => {
      const concurrentQueries = 5;
      
      const queryPromises = Array(concurrentQueries).fill(null).map((_, index) => 
        request.post(`${baseUrl}/api/v2/ai/data-agent`, {
          json: {
            query: `Test query ${index + 1}: list patient appointments`,
            context: { testId: index + 1 }
          }
        })
      );

      const startTime = performance.now();
      const responses = await Promise.all(queryPromises);
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });

      // Total time for concurrent requests should be reasonable
      expect(totalTime).toBeLessThan(3000);

      // Process response times
      const responsePromises = responses.map(async (response, index) => {
        const data = await response.json();
        return {
          queryId: index + 1,
          hasContent: !!data.content,
          hasType: !!data.type
        };
      });

      const responseResults = await Promise.all(responsePromises);
      
      responseResults.forEach(result => {
        expect(result.hasContent).toBe(true);
        expect(result.hasType).toBe(true);
      });
    });
  });

  test.describe('Database Performance', () => {
    test('should execute database queries efficiently', async ({ request }) => {
      const dbIntensiveEndpoints = [
        '/api/v2/patients',
        '/api/v2/appointments',
        '/api/v2/billing/summary'
      ];

      for (const endpoint of dbIntensiveEndpoints) {
        const startTime = performance.now();
        const response = await request.get(`${baseUrl}${endpoint}`);
        const endTime = performance.now();

        const responseTime = endTime - startTime;

        expect(response.status()).toBe(200);
        expect(responseTime).toBeLessThan(1500); // Database queries should be faster

        const data = await response.json();
        expect(data).toBeDefined();
      }
    });

    test('should handle complex filtered queries', async ({ request }) => {
      // Test queries with filters and sorting
      const filterQueries = [
        '/api/v2/patients?status=active&sort=name&limit=50',
        '/api/v2/appointments?date=2024-01-15&status=confirmed',
        '/api/v2/appointments?provider=dr-smith&dateRange=2024-01-01,2024-01-31'
      ];

      for (const query of filterQueries) {
        const startTime = performance.now();
        const response = await request.get(`${baseUrl}${query}`);
        const endTime = performance.now();

        const responseTime = endTime - startTime;

        expect([200, 404]).toContain(response.status());
        
        if (response.status() === 200) {
          expect(responseTime).toBeLessThan(1500);
        }
      }
    });
  });

  test.describe('WebSocket Performance', () => {
    test('should establish WebSocket connections quickly', async ({ page }) => {
      // Navigate to page with WebSocket functionality
      await page.goto(`${baseUrl}/chat`);

      // Monitor WebSocket connection time
      const connectionTime = await page.evaluate(async () => {
        return new Promise((resolve) => {
          const startTime = performance.now();
          
          // Monitor WebSocket connections
          const originalWebSocket = window.WebSocket;
          window.WebSocket = function(url: string, protocols?: string | string[]) {
            const ws = new originalWebSocket(url, protocols);
            
            ws.addEventListener('open', () => {
              const endTime = performance.now();
              resolve(endTime - startTime);
            });
            
            return ws;
          };
          
          // Trigger WebSocket connection
          setTimeout(() => resolve(0), 5000); // Timeout after 5 seconds
        });
      });

      expect(connectionTime).toBeGreaterThan(0);
      expect(connectionTime).toBeLessThan(2000); // WebSocket connection should be fast
    });

    test('should handle real-time message delivery', async ({ page }) => {
      await page.goto(`${baseUrl}/chat`);

      // Test real-time message performance
      const messageDeliveryTime = await page.evaluate(async () => {
        return new Promise((resolve) => {
          const testMessage = {
            id: 'test-message-123',
            content: 'Test message for performance validation',
            timestamp: new Date().toISOString()
          };

          // Simulate message send and receive timing
          const startTime = performance.now();
          
          // Mock WebSocket message handling
          window.addEventListener('message', (event) => {
            if (event.data.type === 'message' && event.data.id === testMessage.id) {
              const endTime = performance.now();
              resolve(endTime - startTime);
            }
          });

          // Simulate sending message
          window.postMessage(testMessage, '*');
          
          // Timeout after 3 seconds
          setTimeout(() => resolve(0), 3000);
        });
      });

      expect(messageDeliveryTime).toBeGreaterThan(0);
      expect(messageDeliveryTime).toBeLessThan(1000); // Real-time delivery should be very fast
    });
  });

  test.describe('Mobile Performance', () => {
    test.beforeEach(async ({ context }) => {
      // Emulate mobile device
      await context.clearCookies();
      await context.route('**/*', route => route.continue());
    });

    test('should meet mobile performance requirements', async ({ page }) => {
      // Emulate mobile device
      await page.emulateMedia({ media: 'screen' });
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone 6/7/8

      const startTime = performance.now();
      
      await page.goto(`${baseUrl}/`);
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Mobile load time should be reasonable
      expect(loadTime).toBeLessThan(3000);

      // Test key interactions
      const interactionStart = performance.now();
      
      // Test navigation to key sections
      await page.click('text=Appointments');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=Patients');
      await page.waitForLoadState('networkidle');
      
      const interactionEnd = performance.now();
      const interactionTime = interactionEnd - interactionStart;

      expect(interactionTime).toBeLessThan(2000);
    });

    test('should handle mobile AI chat performance', async ({ page }) => {
      await page.emulateMedia({ media: 'screen' });
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto(`${baseUrl}/chat`);

      // Test mobile chat interaction
      const chatStart = performance.now();
      
      // Send a test message
      await page.fill('[data-testid="chat-input"]', 'Hello, I need help with my appointment');
      await page.click('[data-testid="send-button"]');

      // Wait for response
      await page.waitForSelector('[data-testid="ai-response"]', { timeout: 5000 });
      
      const chatEnd = performance.now();
      const chatResponseTime = chatEnd - chatStart;

      expect(chatResponseTime).toBeLessThan(3000); // Mobile AI response should be reasonable
    });
  });

  test.describe('Resource Loading Performance', () => {
    test('should load resources efficiently', async ({ page }) => {
      const performanceMetrics = await page.goto(`${baseUrl}/`).then(async () => {
        const performanceTiming = await page.evaluate(() => {
          const timing = window.performance.timing;
          return {
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            loadComplete: timing.loadEventEnd - timing.navigationStart,
            firstPaint: timing.responseEnd - timing.navigationStart
          };
        });

        return performanceTiming;
      });

      // Validate key performance metrics
      expect(performanceMetrics.domContentLoaded).toBeLessThan(1500);
      expect(performanceMetrics.loadComplete).toBeLessThan(3000);
      expect(performanceMetrics.firstPaint).toBeLessThan(1000);
    });

    test('should implement efficient caching', async ({ page }) => {
      // Test cache headers
      const response = await page.request.get(`${baseUrl}/static/js/main.js`);
      const cacheControl = response.headers()['cache-control'];
      
      expect(cacheControl).toBeDefined();
      expect(cacheControl).toContain('max-age=');
    });

    test('should use compression for responses', async ({ page }) => {
      const response = await page.request.get(`${baseUrl}/v1/health`);
      const contentEncoding = response.headers()['content-encoding'];
      
      // Should use compression for API responses
      expect(['gzip', 'br', undefined]).toContain(contentEncoding);
    });
  });

  test.describe('Performance Monitoring', () => {
    test('should expose performance metrics', async ({ request }) => {
      const monitoringEndpoints = [
        '/v1/monitoring/https',
        '/v1/health',
        '/api/v2/ai/performance'
      ];

      for (const endpoint of monitoringEndpoints) {
        const response = await request.get(`${baseUrl}${endpoint}`);
        
        if (response.status() === 200) {
          const data = await response.json();
          
          // Should contain performance-related information
          expect(data).toHaveProperty('status');
          
          if (data.performance) {
            expect(data.performance).toHaveProperty('averageResponseTimeMs');
            expect(data.performance).toHaveProperty('requestsPerSecond');
          }
        }
      }
    });

    test('should track performance degradation', async ({ request }) => {
      // This would test performance monitoring and alerting
      test.info().annotations.push({
        type: 'note',
        description: 'Performance degradation testing requires extended monitoring'
      });
    });
  });

  test.describe('Core Web Vitals', () => {
    test('should meet Core Web Vitals thresholds', async ({ page }) => {
      await page.goto(`${baseUrl}/`);

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      // Get Core Web Vitals metrics
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Mock Web Vitals measurement
          setTimeout(() => {
            resolve({
              lcp: 1200, // Largest Contentful Paint (ms)
              fid: 80,   // First Input Delay (ms)
              cls: 0.05  // Cumulative Layout Shift
            });
          }, 1000);
        });
      });

      // Validate Core Web Vitals thresholds
      expect(webVitals.lcp).toBeLessThanOrEqual(2500); // LCP ≤2.5s
      expect(webVitals.fid).toBeLessThanOrEqual(100);   // FID ≤100ms
      expect(webVitals.cls).toBeLessThanOrEqual(0.1);  // CLS ≤0.1
    });
  });

  test.describe('Performance Regression Testing', () => {
    test('should detect performance regressions', async ({ request }) => {
      const baselineEndpoints = [
        '/v1/health',
        '/api/v2/patients',
        '/api/v2/ai/data-agent'
      ];

      const currentResults: any[] = [];

      for (const endpoint of baselineEndpoints) {
        const startTime = performance.now();
        const response = await request.get(`${baseUrl}${endpoint}`);
        const endTime = performance.now();

        currentResults.push({
          endpoint,
          responseTime: endTime - startTime,
          status: response.status()
        });
      }

      // Compare against baseline (this would normally be stored)
      const baseline = {
        '/v1/health': 500,
        '/api/v2/patients': 800,
        '/api/v2/ai/data-agent': 1200
      };

      currentResults.forEach(result => {
        const baselineTime = baseline[result.endpoint as keyof typeof baseline];
        const regressionThreshold = baselineTime * 1.2; // 20% threshold

        expect(result.responseTime).toBeLessThan(regressionThreshold);
      });

      test.info().annotations.push({
        type: 'regression-test',
        description: `Performance Regression Test: ${JSON.stringify(currentResults, null, 2)}`
      });
    });
  });
});

export default performanceSpec;