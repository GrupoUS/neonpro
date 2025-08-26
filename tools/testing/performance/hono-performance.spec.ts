/**
 * Performance Testing Suite for Hono.dev API
 * NeonPro Performance Validation
 *
 * Tests for:
 * - Response time benchmarks
 * - Concurrent request handling
 * - Memory usage monitoring
 * - API endpoint performance
 * - Database query optimization
 * - Load testing scenarios
 */

import { expect, test } from "@playwright/test";

// Performance thresholds (healthcare-grade requirements)
const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE_TIME: 200, // ms - Critical for healthcare workflows
  DATABASE_QUERY_TIME: 100, // ms - Database operations must be fast
  CONCURRENT_REQUESTS: 50, // Minimum concurrent users to handle
  MEMORY_LIMIT: 512, // MB - Memory usage limit
  ERROR_RATE_THRESHOLD: 0.01, // 1% maximum error rate
  THROUGHPUT_MIN: 100, // Requests per second minimum
};

test.describe("⚡ Performance Testing Suite", () => {
  test("🏃‍♂️ API Response Time Benchmarks", async ({ page }) => {
    test.setTimeout(60_000);

    const endpoints = [
      { path: "/api/v1/health", name: "Health Check", threshold: 50 },
      { path: "/api/v1/auth/login", name: "Authentication", threshold: 150 },
      { path: "/api/v1/patients", name: "Patient List", threshold: 200 },
      { path: "/api/v1/appointments", name: "Appointments", threshold: 200 },
      { path: "/api/v1/clinics", name: "Clinic Data", threshold: 150 },
    ];

    for (const endpoint of endpoints) {
      await test.step(`Test ${endpoint.name} response time`, async () => {
        const measurements: number[] = [];

        // Run 10 measurements for statistical accuracy
        for (let i = 0; i < 10; i++) {
          const startTime = Date.now();

          const response = await page.request.get(endpoint.path);

          const endTime = Date.now();
          const responseTime = endTime - startTime;
          measurements.push(responseTime);

          // Verify response is valid
          expect(response.status()).toBeLessThan(500);
        }

        // Calculate statistics
        const avgResponseTime =
          measurements.reduce((a, b) => a + b, 0) / measurements.length;
        const maxResponseTime = Math.max(...measurements);
        const _minResponseTime = Math.min(...measurements);

        // Assert performance requirements
        expect(
          avgResponseTime,
          `${endpoint.name} average response time should be under ${endpoint.threshold}ms`,
        ).toBeLessThan(endpoint.threshold);
        expect(
          maxResponseTime,
          `${endpoint.name} max response time should be reasonable`,
        ).toBeLessThan(endpoint.threshold * 2);
      });
    }
  });

  test("🔥 Concurrent Request Handling", async ({ page }) => {
    test.setTimeout(120_000);

    await test.step("Test concurrent API requests", async () => {
      const concurrentRequests = 20;
      const endpoint = "/api/v1/health";

      const startTime = Date.now();

      // Create concurrent requests
      const requests = Array.from({ length: concurrentRequests }, () =>
        page.request.get(endpoint),
      );

      const responses = await Promise.all(requests);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Analyze results
      const successfulResponses = responses.filter((r) => r.status() < 400);
      const _failedResponses = responses.filter((r) => r.status() >= 400);

      const successRate = successfulResponses.length / responses.length;
      const throughput = responses.length / (totalTime / 1000); // requests per second

      // Assert performance requirements
      expect(successRate, "Success rate should be above 95%").toBeGreaterThan(
        0.95,
      );
      expect(
        throughput,
        "Throughput should meet minimum requirements",
      ).toBeGreaterThan(10);
    });

    await test.step("Test database query performance under load", async () => {
      const concurrentQueries = 15;
      const endpoint = "/api/v1/patients"; // Endpoint that queries database

      const startTime = Date.now();

      const requests = Array.from({ length: concurrentQueries }, () =>
        page.request.get(endpoint),
      );

      const responses = await Promise.all(requests);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successfulResponses = responses.filter((r) => r.status() < 400);
      const avgResponseTime = totalTime / responses.length;

      // Database queries should remain fast under load
      expect(
        avgResponseTime,
        "Database queries should remain fast under load",
      ).toBeLessThan(PERFORMANCE_THRESHOLDS.DATABASE_QUERY_TIME * 2);
      expect(
        successfulResponses.length,
        "All database queries should succeed",
      ).toBe(concurrentQueries);
    });
  });

  test("📊 Load Testing Scenarios", async ({ page }) => {
    test.setTimeout(180_000); // 3 minutes for comprehensive load testing

    await test.step("Simulate realistic user load", async () => {
      // Simulate realistic healthcare clinic usage patterns
      const userScenarios = [
        { action: "view_patients", endpoint: "/api/v1/patients", weight: 40 },
        {
          action: "view_appointments",
          endpoint: "/api/v1/appointments",
          weight: 30,
        },
        { action: "health_check", endpoint: "/api/v1/health", weight: 20 },
        { action: "view_clinics", endpoint: "/api/v1/clinics", weight: 10 },
      ];

      const totalRequests = 100;
      const requestPromises: Promise<any>[] = [];

      const startTime = Date.now();

      // Generate weighted random requests based on typical usage
      for (let i = 0; i < totalRequests; i++) {
        const randomWeight = Math.random() * 100;
        let cumulativeWeight = 0;

        for (const scenario of userScenarios) {
          cumulativeWeight += scenario.weight;
          if (randomWeight <= cumulativeWeight) {
            requestPromises.push(
              page.request.get(scenario.endpoint).then((response) => ({
                ...scenario,
                status: response.status(),
                time: Date.now(),
              })),
            );
            break;
          }
        }

        // Add small random delay to simulate realistic user behavior
        if (i % 10 === 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 100),
          );
        }
      }

      const results = await Promise.all(requestPromises);
      const endTime = Date.now();

      // Analyze results by scenario
      const scenarioStats = userScenarios.map((scenario) => {
        const scenarioResults = results.filter(
          (r) => r.action === scenario.action,
        );
        const successCount = scenarioResults.filter(
          (r) => r.status < 400,
        ).length;
        const successRate =
          scenarioResults.length > 0
            ? successCount / scenarioResults.length
            : 0;

        return {
          ...scenario,
          totalRequests: scenarioResults.length,
          successfulRequests: successCount,
          successRate,
        };
      });

      const totalTime = endTime - startTime;
      const overallSuccessRate =
        results.filter((r) => r.status < 400).length / results.length;
      const throughput = results.length / (totalTime / 1000);

      scenarioStats.forEach((_stat) => {});

      // Assert load testing requirements
      expect(
        overallSuccessRate,
        "Overall success rate should be high under load",
      ).toBeGreaterThan(0.95);
      expect(
        throughput,
        "System should maintain reasonable throughput under load",
      ).toBeGreaterThan(5);

      // Each scenario should maintain good performance
      scenarioStats.forEach((stat) => {
        expect(
          stat.successRate,
          `${stat.action} should maintain high success rate`,
        ).toBeGreaterThan(0.9);
      });
    });
  });

  test("⏱️ Response Time Distribution Analysis", async ({ page }) => {
    test.setTimeout(90_000);

    await test.step("Analyze response time distribution", async () => {
      const endpoint = "/api/v1/health";
      const sampleSize = 50;
      const measurements: number[] = [];

      for (let i = 0; i < sampleSize; i++) {
        const startTime = performance.now();
        const response = await page.request.get(endpoint);
        const endTime = performance.now();

        const responseTime = endTime - startTime;
        measurements.push(responseTime);

        expect(response.status()).toBeLessThan(500);

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Calculate statistical metrics
      measurements.sort((a, b) => a - b);

      const _min = measurements[0];
      const _max = measurements.at(-1);
      const _median = measurements[Math.floor(measurements.length / 2)];
      const p95 = measurements[Math.floor(measurements.length * 0.95)];
      const p99 = measurements[Math.floor(measurements.length * 0.99)];
      const average =
        measurements.reduce((a, b) => a + b, 0) / measurements.length;

      // Calculate standard deviation
      const variance =
        measurements.reduce((acc, val) => acc + (val - average) ** 2, 0) /
        measurements.length;
      const stdDev = Math.sqrt(variance);

      // Performance assertions
      expect(
        average,
        "Average response time should be acceptable",
      ).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME);
      expect(
        p95,
        "95th percentile should be within reasonable bounds",
      ).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME * 2);
      expect(p99, "99th percentile should not be excessive").toBeLessThan(
        PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME * 3,
      );
      expect(
        stdDev,
        "Response times should be consistent (low standard deviation)",
      ).toBeLessThan(average * 0.5);
    });
  });

  test("🔍 Memory and Resource Usage Analysis", async ({ page }) => {
    test.setTimeout(60_000);

    await test.step("Monitor resource usage during API calls", async () => {
      const endpoint = "/api/v1/patients";
      const iterations = 30;

      // Baseline measurement
      await page.goto("/"); // Load the application

      const performanceMetrics = [];

      for (let i = 0; i < iterations; i++) {
        // Make API request
        const startTime = performance.now();
        const response = await page.request.get(endpoint);
        const endTime = performance.now();

        // Get performance metrics from the page
        const metrics = await page.evaluate(() => {
          return {
            // Memory usage (if available)
            usedJSMemory: (performance as any).memory?.usedJSMemory || 0,
            totalJSMemory: (performance as any).memory?.totalJSMemory || 0,
            jsMemoryLimit: (performance as any).memory?.jsHeapSizeLimit || 0,

            // Timing metrics
            navigationTiming: performance.getEntriesByType("navigation")[0],
            resourceTiming: performance.getEntriesByType("resource").length,
          };
        });

        performanceMetrics.push({
          iteration: i + 1,
          responseTime: endTime - startTime,
          responseStatus: response.status(),
          ...metrics,
        });

        // Small delay
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Analyze metrics
      const avgResponseTime =
        performanceMetrics.reduce((sum, m) => sum + m.responseTime, 0) /
        performanceMetrics.length;
      const successfulRequests = performanceMetrics.filter(
        (m) => m.responseStatus < 400,
      ).length;
      const successRate = successfulRequests / performanceMetrics.length;

      // Memory analysis (if available)
      const memoryMetrics = performanceMetrics.filter(
        (m) => m.usedJSMemory > 0,
      );
      if (memoryMetrics.length > 0) {
        const avgMemoryUsage =
          memoryMetrics.reduce((sum, m) => sum + m.usedJSMemory, 0) /
          memoryMetrics.length;
        const _maxMemoryUsage = Math.max(
          ...memoryMetrics.map((m) => m.usedJSMemory),
        );

        // Memory usage assertions
        expect(
          avgMemoryUsage / 1024 / 1024,
          "Average memory usage should be reasonable",
        ).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_LIMIT);
      }

      // Performance assertions
      expect(
        avgResponseTime,
        "Average response time should be acceptable",
      ).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME);
      expect(successRate, "Success rate should be high").toBeGreaterThan(0.95);
    });
  });

  test("🏥 Healthcare-Specific Performance Tests", async ({ page }) => {
    test.setTimeout(90_000);

    await test.step("Test patient data query performance", async () => {
      // Test scenarios specific to healthcare workflows
      const healthcareEndpoints = [
        {
          path: "/api/v1/patients",
          name: "Patient List",
          expectedRecords: "multiple",
        },
        {
          path: "/api/v1/patients/1",
          name: "Patient Detail",
          expectedRecords: "single",
        },
        {
          path: "/api/v1/appointments",
          name: "Appointment List",
          expectedRecords: "multiple",
        },
        {
          path: "/api/v1/appointments/today",
          name: "Today's Appointments",
          expectedRecords: "filtered",
        },
      ];

      for (const endpoint of healthcareEndpoints) {
        const measurements: number[] = [];

        for (let i = 0; i < 5; i++) {
          const startTime = performance.now();
          const response = await page.request.get(endpoint.path);
          const endTime = performance.now();

          const responseTime = endTime - startTime;
          measurements.push(responseTime);

          // For healthcare, we expect either success or proper authorization failure
          expect(
            response.status() === 200 || response.status() === 401,
            `${endpoint.name} should return success or auth error`,
          ).toBeTruthy();
        }

        const avgTime =
          measurements.reduce((a, b) => a + b, 0) / measurements.length;

        // Healthcare data queries should be fast for good user experience
        expect(
          avgTime,
          `${endpoint.name} should respond quickly for healthcare workflows`,
        ).toBeLessThan(300);
      }
    });

    await test.step("Test appointment booking performance simulation", async () => {
      const workflowSteps = [
        {
          step: "Get available slots",
          endpoint: "/api/v1/appointments/available",
        },
        { step: "Validate patient", endpoint: "/api/v1/patients/1" },
        {
          step: "Create appointment",
          endpoint: "/api/v1/appointments",
          method: "POST",
        },
        {
          step: "Confirm booking",
          endpoint: "/api/v1/appointments/1/confirm",
          method: "PATCH",
        },
      ];

      const workflowTimes: number[] = [];

      for (let workflow = 0; workflow < 3; workflow++) {
        const workflowStart = performance.now();

        for (const step of workflowSteps) {
          const stepStart = performance.now();

          let _response;
          if (step.method === "POST") {
            _response = await page.request.post(step.endpoint, {
              data: { patient_id: 1, date: "2025-08-21", time: "14:00" },
            });
          } else if (step.method === "PATCH") {
            _response = await page.request.patch(step.endpoint);
          } else {
            _response = await page.request.get(step.endpoint);
          }

          const stepTime = performance.now() - stepStart;

          // Each step should be reasonably fast
          expect(stepTime, `${step.step} should be fast`).toBeLessThan(500);
        }

        const workflowTime = performance.now() - workflowStart;
        workflowTimes.push(workflowTime);
      }

      const avgWorkflowTime =
        workflowTimes.reduce((a, b) => a + b, 0) / workflowTimes.length;

      // Complete appointment booking should complete quickly for good UX
      expect(
        avgWorkflowTime,
        "Appointment booking workflow should be fast",
      ).toBeLessThan(2000);
    });
  });
});
