/**
 * API Performance Monitoring Tests
 * T079 - Backend API Performance Optimization
 */

import { Hono } from "hono";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  APIPerformanceMonitor,
  apiPerformanceMonitor,
  createPerformanceDashboardMiddleware,
  createPerformanceMonitoringMiddleware,
  HEALTHCARE_THRESHOLDS,
} from "../api-performance";

describe("API Performance Monitoring", () => {
  let app: Hono;
  let monitor: APIPerformanceMonitor;

  beforeEach(() => {
    app = new Hono();
    monitor = new APIPerformanceMonitor();
    vi.clearAllMocks();
  });

  afterEach(() => {
    monitor.clearMetrics();
  });

  describe("APIPerformanceMonitor", () => {
    it("should record performance metrics", () => {
      const metrics = {
        endpoint: "/api/test",
        method: "GET",
        responseTime: 150,
        statusCode: 200,
        timestamp: new Date(),
        userId: "user123",
        clinicId: "clinic456",
      };

      monitor.recordMetrics(metrics);
      const stats = monitor.getStats();

      expect(stats.totalRequests).toBe(1);
      expect(stats.averageResponseTime).toBe(150);
    });

    it("should calculate performance statistics correctly", () => {
      const baseTime = new Date();

      // Add multiple metrics
      for (let i = 0; i < 10; i++) {
        monitor.recordMetrics({
          endpoint: "/api/test",
          method: "GET",
          responseTime: 100 + i * 10, // 100, 110, 120, ..., 190
          statusCode: 200,
          timestamp: new Date(baseTime.getTime() + i * 1000),
        });
      }

      const stats = monitor.getStats();
      expect(stats.totalRequests).toBe(10);
      expect(stats.averageResponseTime).toBe(145); // Average of 100-190
      expect(stats.errorRate).toBe(0);
    });

    it("should calculate error rate correctly", () => {
      const baseTime = new Date();

      // Add successful requests
      for (let i = 0; i < 8; i++) {
        monitor.recordMetrics({
          endpoint: "/api/test",
          method: "GET",
          responseTime: 100,
          statusCode: 200,
          timestamp: new Date(baseTime.getTime() + i * 1000),
        });
      }

      // Add error requests
      for (let i = 0; i < 2; i++) {
        monitor.recordMetrics({
          endpoint: "/api/test",
          method: "GET",
          responseTime: 100,
          statusCode: 500,
          timestamp: new Date(baseTime.getTime() + (8 + i) * 1000),
        });
      }

      const stats = monitor.getStats();
      expect(stats.totalRequests).toBe(10);
      expect(stats.errorRate).toBe(20); // 2 errors out of 10 requests
    });

    it("should identify slowest endpoints", () => {
      const baseTime = new Date();

      // Add fast endpoint
      monitor.recordMetrics({
        endpoint: "/api/fast",
        method: "GET",
        responseTime: 50,
        statusCode: 200,
        timestamp: new Date(baseTime.getTime()),
      });

      // Add slow endpoint
      monitor.recordMetrics({
        endpoint: "/api/slow",
        method: "GET",
        responseTime: 500,
        statusCode: 200,
        timestamp: new Date(baseTime.getTime() + 1000),
      });

      const stats = monitor.getStats();
      expect(stats.slowestEndpoints).toHaveLength(2);
      expect(stats.slowestEndpoints[0].endpoint).toBe("GET /api/slow");
      expect(stats.slowestEndpoints[0].averageTime).toBe(500);
    });

    it("should calculate healthcare-specific metrics", () => {
      const baseTime = new Date();

      // Add patient data access
      monitor.recordMetrics({
        endpoint: "/api/patients/123",
        method: "GET",
        responseTime: 80,
        statusCode: 200,
        timestamp: new Date(baseTime.getTime()),
      });

      // Add appointment access
      monitor.recordMetrics({
        endpoint: "/api/appointments/list",
        method: "GET",
        responseTime: 120,
        statusCode: 200,
        timestamp: new Date(baseTime.getTime() + 1000),
      });

      const stats = monitor.getStats();
      expect(stats.healthcareCompliance.avgPatientDataAccess).toBe(80);
      expect(stats.healthcareCompliance.avgAppointmentResponse).toBe(120);
      expect(stats.healthcareCompliance.sensitiveDataQueries).toBe(1);
    });

    it("should trigger performance alerts", () => {
      const alertCallback = vi.fn();
      monitor.onAlert(alertCallback);

      // Add slow request that should trigger alert
      monitor.recordMetrics({
        endpoint: "/api/slow",
        method: "GET",
        responseTime: 600, // Above critical threshold
        statusCode: 200,
        timestamp: new Date(),
      });

      expect(alertCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "response_time",
          severity: "critical",
          message: expect.stringContaining("Critical response time: 600ms"),
        }),
      );
    });

    it("should trigger healthcare-specific alerts", () => {
      const alertCallback = vi.fn();
      monitor.onAlert(alertCallback);

      // Add slow patient data access
      monitor.recordMetrics({
        endpoint: "/api/patients/123",
        method: "GET",
        responseTime: 150, // Above healthcare threshold
        statusCode: 200,
        timestamp: new Date(),
      });

      expect(alertCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "healthcare_compliance",
          severity: "warning",
          message: expect.stringContaining(
            "Patient data access slower than recommended",
          ),
        }),
      );
    });

    it("should clear metrics history", () => {
      monitor.recordMetrics({
        endpoint: "/api/test",
        method: "GET",
        responseTime: 100,
        statusCode: 200,
        timestamp: new Date(),
      });

      let stats = monitor.getStats();
      expect(stats.totalRequests).toBe(1);

      monitor.clearMetrics();

      stats = monitor.getStats();
      expect(stats.totalRequests).toBe(0);
    });
  });

  describe("createPerformanceMonitoringMiddleware", () => {
    it("should add performance headers", async () => {
      const middleware = createPerformanceMonitoringMiddleware();

      app.use("*", middleware);
      app.get("/api/test", (c) => c.json({ data: "test" }));

      const res = await app.request("/api/test");

      expect(res.status).toBe(200);
      expect(res.headers.get("x-response-time")).toMatch(/\d+ms/);
      expect(res.headers.get("x-memory-usage")).toMatch(/\d+MB/);
      expect(res.headers.get("x-performance-tier")).toBeDefined();
    });

    it("should add healthcare compliance headers for patient endpoints", async () => {
      const middleware = createPerformanceMonitoringMiddleware();

      app.use("*", middleware);
      app.get("/api/patients/123", (c) => c.json({ patient: { id: 123 } }));

      const res = await app.request("/api/patients/123");

      expect(res.status).toBe(200);
      expect(res.headers.get("x-healthcare-performance")).toBe("monitored");
      expect(res.headers.get("x-lgpd-compliant")).toBe("true");
    });

    it("should record metrics for successful requests", async () => {
      const middleware = createPerformanceMonitoringMiddleware();

      app.use("*", middleware);
      app.get("/api/metrics-test", (c) => c.json({ data: "test" }));

      await app.request("/api/metrics-test");

      const stats = apiPerformanceMonitor.getStats();
      expect(stats.totalRequests).toBeGreaterThan(0);
    });

    it("should record metrics for error requests", async () => {
      const middleware = createPerformanceMonitoringMiddleware();

      app.use("*", middleware);
      app.get("/api/error-test", (_c) => {
        throw new Error("Test error");
      });

      try {
        await app.request("/api/error-test");
      } catch {
        // Expected error
      }

      const stats = apiPerformanceMonitor.getStats();
      expect(stats.totalRequests).toBeGreaterThan(0);
    });

    it("should set appropriate performance tier", async () => {
      const middleware = createPerformanceMonitoringMiddleware();

      app.use("*", middleware);
      app.get("/api/fast", (c) => c.json({ data: "fast" }));

      const res = await app.request("/api/fast");

      const performanceTier = res.headers.get("x-performance-tier");
      expect(["excellent", "good", "acceptable", "slow", "critical"]).toContain(
        performanceTier,
      );
    });
  });

  describe("createPerformanceDashboardMiddleware", () => {
    it("should provide performance statistics endpoint", async () => {
      const middleware = createPerformanceDashboardMiddleware();

      app.use("*", middleware);

      const res = await app.request("/v1/performance/stats");

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty("api");
      expect(data).toHaveProperty("database");
      expect(data).toHaveProperty("timestamp");
      expect(data).toHaveProperty("healthcareCompliance");
    });

    it("should accept time window parameter", async () => {
      const middleware = createPerformanceDashboardMiddleware();

      app.use("*", middleware);

      const res = await app.request("/v1/performance/stats?window=1800000"); // 30 minutes

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty("api");
    });

    it("should provide healthcare compliance status", async () => {
      const middleware = createPerformanceDashboardMiddleware();

      app.use("*", middleware);

      const res = await app.request("/v1/performance/stats");

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.healthcareCompliance).toHaveProperty(
        "patientDataPerformance",
      );
      expect(data.healthcareCompliance).toHaveProperty(
        "appointmentPerformance",
      );
      expect(data.healthcareCompliance).toHaveProperty("overallCompliance");
    });
  });

  describe("HEALTHCARE_THRESHOLDS", () => {
    it("should have appropriate response time thresholds", () => {
      expect(HEALTHCARE_THRESHOLDS.responseTime.warning).toBe(200);
      expect(HEALTHCARE_THRESHOLDS.responseTime.critical).toBe(500);
    });

    it("should have appropriate memory usage thresholds", () => {
      expect(HEALTHCARE_THRESHOLDS.memoryUsage.warning).toBe(512);
      expect(HEALTHCARE_THRESHOLDS.memoryUsage.critical).toBe(1024);
    });

    it("should have appropriate error rate thresholds", () => {
      expect(HEALTHCARE_THRESHOLDS.errorRate.warning).toBe(1);
      expect(HEALTHCARE_THRESHOLDS.errorRate.critical).toBe(5);
    });
  });
});
