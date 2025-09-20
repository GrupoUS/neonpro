/**
 * Health Monitoring and Metrics Middleware Tests (T077)
 * Comprehensive test suite for system health monitoring and metrics collection
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  healthMonitor,
  healthMonitoringMiddleware,
  HealthStatus,
  // type HealthCheckResult,
  // type MetricEntry,
} from "../health-monitoring";

// Mock crypto.randomUUID
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: () => "test-uuid-" + Math.random().toString(36).substr(2, 9),
  },
});

describe("Health Monitoring and Metrics Middleware (T077)", () => {
  let mockContext: any;
  let mockNext: any;

  beforeEach(() => {
    mockContext = {
      req: {
        header: vi.fn(),
        param: vi.fn(),
        query: vi.fn(),
        url: "https://api.example.com/test",
        method: "GET",
      },
      set: vi.fn(),
      json: vi.fn(),
      get: vi.fn(),
    };
    mockNext = vi.fn();

    // Reset health monitor state
    (healthMonitor as any).healthChecks.clear();
    (healthMonitor as any).metrics.clear();

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Health Monitor", () => {
    it("should register and execute health checks", async () => {
      const checkName = "database";
      const healthCheck = vi.fn().mockResolvedValue({
        status: HealthStatus.HEALTHY,
        message: "Database connection OK",
        responseTime: 50,
      });

      healthMonitor.registerHealthCheck(checkName, healthCheck);
      await healthMonitor.runHealthChecks();

      expect(healthCheck).toHaveBeenCalled();

      const result = healthMonitor.getHealthCheck(checkName);
      expect(result?.status).toBe(HealthStatus.HEALTHY);
      expect(result?.message).toBe("Database connection OK");
      expect(result?.responseTime).toBe(50);
    });

    it("should handle failing health checks", async () => {
      const checkName = "external-api";
      const healthCheck = vi.fn().mockResolvedValue({
        status: HealthStatus.CRITICAL,
        message: "External API unreachable",
        responseTime: 5000,
        error: "Connection timeout",
      });

      healthMonitor.registerHealthCheck(checkName, healthCheck);
      await healthMonitor.runHealthChecks();

      const result = healthMonitor.getHealthCheck(checkName);
      expect(result?.status).toBe(HealthStatus.CRITICAL);
      expect(result?.error).toBe("Connection timeout");
    });

    it("should calculate overall health status", async () => {
      // Register multiple health checks
      healthMonitor.registerHealthCheck(
        "service1",
        vi.fn().mockResolvedValue({
          status: HealthStatus.HEALTHY,
          message: "Service 1 OK",
        }),
      );

      healthMonitor.registerHealthCheck(
        "service2",
        vi.fn().mockResolvedValue({
          status: HealthStatus.WARNING,
          message: "Service 2 degraded",
        }),
      );

      healthMonitor.registerHealthCheck(
        "service3",
        vi.fn().mockResolvedValue({
          status: HealthStatus.CRITICAL,
          message: "Service 3 down",
        }),
      );

      await healthMonitor.runHealthChecks();

      const overallHealth = healthMonitor.getOverallHealth();

      // Overall status should be CRITICAL due to service3
      expect(overallHealth.status).toBe(HealthStatus.CRITICAL);
      expect(overallHealth.checks).toHaveLength(3);
      expect(overallHealth.uptime).toBeGreaterThan(0);
    });

    it("should record and retrieve metrics", () => {
      const metricName = "api_requests";
      const value = 1;
      const tags = { endpoint: "/api/patients", method: "GET" };

      healthMonitor.recordMetric(metricName, value, tags);

      const metrics = healthMonitor.getMetrics(metricName);
      expect(metrics).toHaveLength(1);
      expect(metrics[0].value).toBe(value);
      expect(metrics[0].tags).toEqual(tags);
      expect(metrics[0].timestamp).toBeInstanceOf(Date);
    });

    it("should aggregate metrics over time windows", () => {
      const metricName = "response_time";

      // Record multiple metrics
      healthMonitor.recordMetric(metricName, 100);
      healthMonitor.recordMetric(metricName, 200);
      healthMonitor.recordMetric(metricName, 150);

      const aggregated = healthMonitor.getAggregatedMetrics(metricName, 60000); // 1 minute window

      expect(aggregated.count).toBe(3);
      expect(aggregated.sum).toBe(450);
      expect(aggregated.average).toBe(150);
      expect(aggregated.min).toBe(100);
      expect(aggregated.max).toBe(200);
    });

    it("should clean old metrics", () => {
      const metricName = "old_metric";

      // Mock old timestamp
      const oldTimestamp = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      const metrics = (healthMonitor as any).metrics;

      if (!metrics.has(metricName)) {
        metrics.set(metricName, []);
      }

      metrics.get(metricName).push({
        value: 1,
        timestamp: oldTimestamp,
        tags: {},
      });

      // Add recent metric
      healthMonitor.recordMetric(metricName, 2);

      const cleanedCount = healthMonitor.cleanOldMetrics(24); // 24 hours retention

      expect(cleanedCount).toBe(1);

      const remainingMetrics = healthMonitor.getMetrics(metricName);
      expect(remainingMetrics).toHaveLength(1);
      expect(remainingMetrics[0].value).toBe(2);
    });

    it("should provide system resource metrics", () => {
      const systemMetrics = healthMonitor.getSystemMetrics();

      expect(systemMetrics).toHaveProperty("memoryUsage");
      expect(systemMetrics).toHaveProperty("cpuUsage");
      expect(systemMetrics).toHaveProperty("uptime");
      expect(systemMetrics.memoryUsage).toHaveProperty("used");
      expect(systemMetrics.memoryUsage).toHaveProperty("total");
      expect(systemMetrics.memoryUsage).toHaveProperty("percentage");
    });

    it("should track healthcare compliance metrics", () => {
      // Record LGPD compliance metrics
      healthMonitor.recordMetric("lgpd_consent_checks", 1, { result: "valid" });
      healthMonitor.recordMetric("lgpd_consent_checks", 1, {
        result: "invalid",
      });

      // Record healthcare professional validations
      healthMonitor.recordMetric("healthcare_validations", 1, {
        status: "active",
      });
      healthMonitor.recordMetric("healthcare_validations", 1, {
        status: "suspended",
      });

      const lgpdMetrics = healthMonitor.getMetrics("lgpd_consent_checks");
      const healthcareMetrics = healthMonitor.getMetrics(
        "healthcare_validations",
      );

      expect(lgpdMetrics).toHaveLength(2);
      expect(healthcareMetrics).toHaveLength(2);

      const validConsents = lgpdMetrics.filter(
        (m) => m.tags?.result === "valid",
      );
      const activeValidations = healthcareMetrics.filter(
        (m) => m.tags?.status === "active",
      );

      expect(validConsents).toHaveLength(1);
      expect(activeValidations).toHaveLength(1);
    });
  });

  describe("Health Monitoring Middleware", () => {
    it("should record request metrics", async () => {
      // const startTime = Date.now();
      mockNext.mockImplementation(async () => {
        // Simulate some processing time
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      await healthMonitoringMiddleware(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalled();

      // Check that metrics were recorded
      const requestMetrics = healthMonitor.getMetrics("http_requests");
      const responseTimeMetrics = healthMonitor.getMetrics("response_time");

      expect(requestMetrics.length).toBeGreaterThan(0);
      expect(responseTimeMetrics.length).toBeGreaterThan(0);

      const lastRequest = requestMetrics[requestMetrics.length - 1];
      expect(lastRequest.tags).toEqual({
        method: "GET",
        endpoint: "/test",
        status: "success",
      });
    });

    it("should record error metrics when requests fail", async () => {
      const testError = new Error("Test error");
      mockNext.mockImplementation(() => {
        throw testError;
      });

      try {
        await healthMonitoringMiddleware(mockContext, mockNext);
      } catch {
        // Expected to throw
      }

      const errorMetrics = healthMonitor.getMetrics("http_errors");
      expect(errorMetrics.length).toBeGreaterThan(0);

      const lastError = errorMetrics[errorMetrics.length - 1];
      expect(lastError.tags).toEqual({
        method: "GET",
        endpoint: "/test",
        error: "Test error",
      });
    });

    it("should track healthcare professional requests", async () => {
      mockContext.get.mockImplementation((key: string) => {
        if (key === "isHealthcareProfessional") return true;
        if (key === "healthcareProfessional") {
          return {
            id: "hp-123",
            crmNumber: "12345-SP",
            specialty: "Dermatologia",
          };
        }
        return undefined;
      });

      await healthMonitoringMiddleware(mockContext, mockNext);

      const healthcareMetrics = healthMonitor.getMetrics(
        "healthcare_professional_requests",
      );
      expect(healthcareMetrics.length).toBeGreaterThan(0);

      const lastMetric = healthcareMetrics[healthcareMetrics.length - 1];
      expect(lastMetric.tags).toEqual({
        crmNumber: "12345-SP",
        specialty: "Dermatologia",
        endpoint: "/test",
      });
    });

    it("should track LGPD consent metrics", async () => {
      mockContext.get.mockImplementation((key: string) => {
        if (key === "hasLGPDConsent") return true;
        if (key === "lgpdConsent") {
          return {
            purposes: ["healthcare_service", "ai_assistance"],
            dataCategories: ["personal_data", "health_data"],
          };
        }
        return undefined;
      });

      await healthMonitoringMiddleware(mockContext, mockNext);

      const lgpdMetrics = healthMonitor.getMetrics("lgpd_consent_usage");
      expect(lgpdMetrics.length).toBeGreaterThan(0);

      const lastMetric = lgpdMetrics[lgpdMetrics.length - 1];
      expect(lastMetric.tags?.purposes).toContain("healthcare_service");
      expect(lastMetric.tags?.dataCategories).toContain("health_data");
    });

    it("should provide health check endpoint data", async () => {
      // Register some health checks
      healthMonitor.registerHealthCheck(
        "database",
        vi.fn().mockResolvedValue({
          status: HealthStatus.HEALTHY,
          message: "DB OK",
        }),
      );

      healthMonitor.registerHealthCheck(
        "cache",
        vi.fn().mockResolvedValue({
          status: HealthStatus.WARNING,
          message: "Cache slow",
        }),
      );

      await healthMonitor.runHealthChecks();

      mockContext.req.url = "https://api.example.com/health";
      mockContext.req.method = "GET";

      await healthMonitoringMiddleware(mockContext, mockNext);

      expect(mockContext.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: expect.any(String),
          checks: expect.arrayContaining([
            expect.objectContaining({
              name: "database",
              status: HealthStatus.HEALTHY,
            }),
            expect.objectContaining({
              name: "cache",
              status: HealthStatus.WARNING,
            }),
          ]),
          uptime: expect.any(Number),
          timestamp: expect.any(String),
        }),
      );
    });

    it("should provide metrics endpoint data", async () => {
      // Record some metrics
      healthMonitor.recordMetric("test_metric", 42, { type: "test" });

      mockContext.req.url = "https://api.example.com/metrics";
      mockContext.req.method = "GET";

      await healthMonitoringMiddleware(mockContext, mockNext);

      expect(mockContext.json).toHaveBeenCalledWith(
        expect.objectContaining({
          metrics: expect.any(Object),
          systemMetrics: expect.objectContaining({
            memoryUsage: expect.any(Object),
            cpuUsage: expect.any(Number),
            uptime: expect.any(Number),
          }),
          timestamp: expect.any(String),
        }),
      );
    });
  });
});
