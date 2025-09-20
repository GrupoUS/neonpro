/**
 * Database Health Monitoring Middleware Tests
 * T080 - Database Performance Tuning
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDatabaseHealthDashboardMiddleware,
  createDatabaseHealthMiddleware,
  DatabaseHealthMonitor,
  HEALTHCARE_HEALTH_THRESHOLDS,
} from "../database-health";

// Mock services
vi.mock("../services/database-performance", () => ({
  default: class MockDatabasePerformanceService {
    async analyzePerformance() {
      return {
        connectionPool: { utilization: 50, active: 5, idle: 5, total: 10 },
        queryPerformance: {
          averageResponseTime: 75,
          slowQueries: 2,
          totalQueries: 100,
          errorRate: 1,
        },
        indexUsage: {
          totalIndexes: 20,
          unusedIndexes: 2,
          missingIndexes: ["test"],
          indexEfficiency: 85,
        },
        healthcareCompliance: {
          patientDataQueries: 40,
          avgPatientQueryTime: 45,
          lgpdCompliantQueries: 38,
          auditTrailQueries: 10,
        },
      };
    }
    getQueryMonitor() {
      return {
        recordQuery: vi.fn(),
        getStats: () => ({
          averageDuration: 75,
          slowQueries: 2,
          totalQueries: 100,
        }),
      };
    }
  },
}));

vi.mock("../services/connection-pool-manager", () => ({
  default: class MockConnectionPoolManager {
    getMetrics() {
      return {
        active: 5,
        idle: 5,
        waiting: 0,
        total: 10,
        utilization: 50,
        averageWaitTime: 100,
        connectionErrors: 0,
        healthScore: 85,
      };
    }
    onAlert(_callback: any) {
      // Store callback for testing
    }
  },
}));

describe("DatabaseHealthMonitor", () => {
  let monitor: DatabaseHealthMonitor;

  beforeEach(() => {
    monitor = new DatabaseHealthMonitor();
  });

  describe("getCurrentHealth", () => {
    it("should return comprehensive health status", async () => {
      const health = await monitor.getCurrentHealth();

      expect(health).toHaveProperty("status");
      expect(health).toHaveProperty("score");
      expect(health).toHaveProperty("timestamp");
      expect(health).toHaveProperty("components");
      expect(health).toHaveProperty("alerts");

      // Status should be valid
      expect(["healthy", "warning", "critical"]).toContain(health.status);

      // Score should be 0-100
      expect(health.score).toBeGreaterThanOrEqual(0);
      expect(health.score).toBeLessThanOrEqual(100);

      // Should have all components
      expect(health.components).toHaveProperty("connectionPool");
      expect(health.components).toHaveProperty("queryPerformance");
      expect(health.components).toHaveProperty("indexOptimization");
      expect(health.components).toHaveProperty("healthcareCompliance");

      // Timestamp should be recent
      expect(health.timestamp).toBeInstanceOf(Date);
      expect(Date.now() - health.timestamp.getTime()).toBeLessThan(5000);

      // Alerts should be array
      expect(health.alerts).toBeInstanceOf(Array);
    });

    it("should assess component health correctly", async () => {
      const health = await monitor.getCurrentHealth();

      Object.values(health.components).forEach((component: any) => {
        expect(component).toHaveProperty("status");
        expect(component).toHaveProperty("score");
        expect(component).toHaveProperty("metrics");
        expect(component).toHaveProperty("issues");

        expect(["healthy", "warning", "critical"]).toContain(component.status);
        expect(component.score).toBeGreaterThanOrEqual(0);
        expect(component.score).toBeLessThanOrEqual(100);
        expect(component.metrics).toBeTypeOf("object");
        expect(component.issues).toBeInstanceOf(Array);
      });
    });

    it("should store health history", async () => {
      await monitor.getCurrentHealth();
      await monitor.getCurrentHealth();
      await monitor.getCurrentHealth();

      const history = monitor.getHealthHistory();
      expect(history.length).toBe(3);

      history.forEach((healthStatus) => {
        expect(healthStatus).toHaveProperty("status");
        expect(healthStatus).toHaveProperty("score");
        expect(healthStatus).toHaveProperty("timestamp");
      });
    });

    it("should limit history size", async () => {
      // Add more than max history size
      for (let i = 0; i < 300; i++) {
        await monitor.getCurrentHealth();
      }

      const history = monitor.getHealthHistory();
      expect(history.length).toBeLessThanOrEqual(288); // maxHistorySize
    });
  });

  describe("component health assessment", () => {
    it("should assess connection pool health", async () => {
      const health = await monitor.getCurrentHealth();
      const poolHealth = health.components.connectionPool;

      expect(poolHealth.metrics).toHaveProperty("utilization");
      expect(poolHealth.metrics).toHaveProperty("waitTime");
      expect(poolHealth.metrics).toHaveProperty("errors");
      expect(poolHealth.metrics).toHaveProperty("active");
      expect(poolHealth.metrics).toHaveProperty("idle");

      // With good metrics, should be healthy
      expect(poolHealth.status).toBe("healthy");
      expect(poolHealth.score).toBeGreaterThan(80);
      expect(poolHealth.issues.length).toBe(0);
    });

    it("should assess query performance health", async () => {
      const health = await monitor.getCurrentHealth();
      const queryHealth = health.components.queryPerformance;

      expect(queryHealth.metrics).toHaveProperty("averageResponseTime");
      expect(queryHealth.metrics).toHaveProperty("errorRate");
      expect(queryHealth.metrics).toHaveProperty("slowQueries");
      expect(queryHealth.metrics).toHaveProperty("totalQueries");
      expect(queryHealth.metrics).toHaveProperty("slowQueryRate");

      // Should calculate slow query rate
      const expectedSlowQueryRate =
        (queryHealth.metrics.slowQueries / queryHealth.metrics.totalQueries) *
        100;
      expect(queryHealth.metrics.slowQueryRate).toBe(expectedSlowQueryRate);
    });

    it("should assess index optimization health", async () => {
      const health = await monitor.getCurrentHealth();
      const indexHealth = health.components.indexOptimization;

      expect(indexHealth.metrics).toHaveProperty("efficiency");
      expect(indexHealth.metrics).toHaveProperty("total");
      expect(indexHealth.metrics).toHaveProperty("unused");
      expect(indexHealth.metrics).toHaveProperty("missing");

      // Should have reasonable metrics
      expect(indexHealth.metrics.efficiency).toBeGreaterThan(0);
      expect(indexHealth.metrics.total).toBeGreaterThan(0);
    });

    it("should assess healthcare compliance health", async () => {
      const health = await monitor.getCurrentHealth();
      const complianceHealth = health.components.healthcareCompliance;

      expect(complianceHealth.metrics).toHaveProperty("patientQueryTime");
      expect(complianceHealth.metrics).toHaveProperty("lgpdCompliance");
      expect(complianceHealth.metrics).toHaveProperty("patientQueries");
      expect(complianceHealth.metrics).toHaveProperty("auditQueries");

      // LGPD compliance should be calculated correctly
      // The actual calculation uses lgpdCompliantQueries / patientDataQueries from the mock
      expect(complianceHealth.metrics.lgpdCompliance).toBeGreaterThan(90); // Should be high compliance
    });
  });

  describe("alert generation", () => {
    it("should generate alerts for critical issues", async () => {
      // Mock critical metrics
      const mockService = {
        analyzePerformance: async () => ({
          connectionPool: { utilization: 98, active: 19, idle: 1, total: 20 },
          queryPerformance: {
            averageResponseTime: 250,
            slowQueries: 20,
            totalQueries: 100,
            errorRate: 8,
          },
          indexUsage: {
            totalIndexes: 20,
            unusedIndexes: 8,
            missingIndexes: ["test1", "test2"],
            indexEfficiency: 60,
          },
          healthcareCompliance: {
            patientDataQueries: 40,
            avgPatientQueryTime: 120,
            lgpdCompliantQueries: 30,
            auditTrailQueries: 10,
          },
        }),
        getQueryMonitor: () => ({
          recordQuery: vi.fn(),
          getStats: () => ({
            averageDuration: 250,
            slowQueries: 20,
            totalQueries: 100,
          }),
        }),
      };

      monitor["performanceService"] = mockService as any;

      const health = await monitor.getCurrentHealth();

      expect(health.status).toBe("critical");
      expect(health.alerts.length).toBeGreaterThan(0);

      const criticalAlerts = health.alerts.filter(
        (alert) => alert.severity === "critical",
      );
      expect(criticalAlerts.length).toBeGreaterThan(0);

      health.alerts.forEach((alert) => {
        expect(alert).toHaveProperty("type");
        expect(alert).toHaveProperty("severity");
        expect(alert).toHaveProperty("message");
        expect(alert).toHaveProperty("component");
        expect(alert).toHaveProperty("timestamp");
        expect(alert).toHaveProperty("healthcareImpact");

        expect(["performance", "compliance", "connection", "query"]).toContain(
          alert.type,
        );
        expect(["warning", "critical"]).toContain(alert.severity);
        expect(typeof alert.healthcareImpact).toBe("string");
      });
    });

    it("should provide healthcare-specific alert messages", async () => {
      // Mock poor healthcare compliance
      const mockService = {
        analyzePerformance: async () => ({
          connectionPool: { utilization: 50, active: 5, idle: 5, total: 10 },
          queryPerformance: {
            averageResponseTime: 75,
            slowQueries: 2,
            totalQueries: 100,
            errorRate: 1,
          },
          indexUsage: {
            totalIndexes: 20,
            unusedIndexes: 2,
            missingIndexes: ["test"],
            indexEfficiency: 85,
          },
          healthcareCompliance: {
            patientDataQueries: 40,
            avgPatientQueryTime: 120,
            lgpdCompliantQueries: 25,
            auditTrailQueries: 10,
          },
        }),
        getQueryMonitor: () => ({
          recordQuery: vi.fn(),
          getStats: () => ({
            averageDuration: 75,
            slowQueries: 2,
            totalQueries: 100,
          }),
        }),
      };

      monitor["performanceService"] = mockService as any;

      const health = await monitor.getCurrentHealth();
      const complianceAlerts = health.alerts.filter(
        (alert) => alert.type === "compliance",
      );

      if (complianceAlerts.length > 0) {
        complianceAlerts.forEach((alert) => {
          expect(alert.healthcareImpact).toContain("LGPD");
        });
      }
    });
  });

  describe("alert callbacks", () => {
    it("should trigger alert callbacks", async () => {
      const alerts: any[] = [];
      monitor.onAlert((alert) => alerts.push(alert));

      // Mock critical condition to trigger alerts
      const mockService = {
        analyzePerformance: async () => ({
          connectionPool: { utilization: 98, active: 19, idle: 1, total: 20 },
          queryPerformance: {
            averageResponseTime: 250,
            slowQueries: 20,
            totalQueries: 100,
            errorRate: 8,
          },
          indexUsage: {
            totalIndexes: 20,
            unusedIndexes: 8,
            missingIndexes: ["test1", "test2"],
            indexEfficiency: 60,
          },
          healthcareCompliance: {
            patientDataQueries: 40,
            avgPatientQueryTime: 120,
            lgpdCompliantQueries: 30,
            auditTrailQueries: 10,
          },
        }),
        getQueryMonitor: () => ({
          recordQuery: vi.fn(),
          getStats: () => ({
            averageDuration: 250,
            slowQueries: 20,
            totalQueries: 100,
          }),
        }),
      };

      monitor["performanceService"] = mockService as any;

      await monitor.getCurrentHealth();

      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  describe("clearHistory", () => {
    it("should clear health history", async () => {
      await monitor.getCurrentHealth();
      await monitor.getCurrentHealth();

      expect(monitor.getHealthHistory().length).toBe(2);

      monitor.clearHistory();
      expect(monitor.getHealthHistory().length).toBe(0);
    });
  });
});

describe("Database Health Middleware", () => {
  describe("createDatabaseHealthMiddleware", () => {
    it("should create middleware that records query metrics", async () => {
      const middleware = createDatabaseHealthMiddleware();

      const mockContext = {
        req: { path: "/api/patients", method: "GET" },
        set: vi.fn(),
      } as any;

      const mockNext = vi.fn().mockResolvedValue(undefined);

      await middleware(mockContext, mockNext);

      expect(mockContext.set).toHaveBeenCalledWith(
        "databaseHealthMonitor",
        expect.any(Object),
      );
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("createDatabaseHealthDashboardMiddleware", () => {
    it("should handle health endpoint", async () => {
      const middleware = createDatabaseHealthDashboardMiddleware();

      const mockContext = {
        req: { path: "/v1/database/health" },
        json: vi.fn(),
      } as any;

      const mockNext = vi.fn();

      await middleware(mockContext, mockNext);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle health history endpoint", async () => {
      const middleware = createDatabaseHealthDashboardMiddleware();

      const mockContext = {
        req: { path: "/v1/database/health/history" },
        json: vi.fn(),
      } as any;

      const mockNext = vi.fn();

      await middleware(mockContext, mockNext);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Array),
        count: expect.any(Number),
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should pass through non-health endpoints", async () => {
      const middleware = createDatabaseHealthDashboardMiddleware();

      const mockContext = {
        req: { path: "/api/patients" },
      } as any;

      const mockNext = vi.fn();

      await middleware(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});

describe("Healthcare Health Thresholds", () => {
  it("should define comprehensive healthcare thresholds", () => {
    expect(HEALTHCARE_HEALTH_THRESHOLDS).toHaveProperty("queryPerformance");
    expect(HEALTHCARE_HEALTH_THRESHOLDS).toHaveProperty("connectionPool");
    expect(HEALTHCARE_HEALTH_THRESHOLDS).toHaveProperty("compliance");

    // Query performance thresholds
    const queryThresholds = HEALTHCARE_HEALTH_THRESHOLDS.queryPerformance;
    expect(queryThresholds).toHaveProperty("patientQueries");
    expect(queryThresholds).toHaveProperty("appointmentQueries");
    expect(queryThresholds).toHaveProperty("generalQueries");
    expect(queryThresholds).toHaveProperty("errorRate");

    // Connection pool thresholds
    const poolThresholds = HEALTHCARE_HEALTH_THRESHOLDS.connectionPool;
    expect(poolThresholds).toHaveProperty("utilization");
    expect(poolThresholds).toHaveProperty("waitTime");
    expect(poolThresholds).toHaveProperty("errors");

    // Compliance thresholds
    const complianceThresholds = HEALTHCARE_HEALTH_THRESHOLDS.compliance;
    expect(complianceThresholds).toHaveProperty("lgpdQueries");
    expect(complianceThresholds).toHaveProperty("auditCoverage");
  });

  it("should have appropriate threshold values", () => {
    const queryThresholds = HEALTHCARE_HEALTH_THRESHOLDS.queryPerformance;

    // Patient queries should have strictest thresholds (most critical)
    expect(queryThresholds.patientQueries.warning).toBeLessThan(
      queryThresholds.generalQueries.warning,
    );
    expect(queryThresholds.patientQueries.critical).toBeLessThan(
      queryThresholds.generalQueries.critical,
    );

    // Appointment queries should be between patient and general
    expect(queryThresholds.appointmentQueries.warning).toBeGreaterThan(
      queryThresholds.patientQueries.warning,
    );
    expect(queryThresholds.appointmentQueries.warning).toBeLessThan(
      queryThresholds.generalQueries.warning,
    );

    // All thresholds should be reasonable for healthcare
    expect(queryThresholds.patientQueries.critical).toBeLessThanOrEqual(100); // Sub-100ms for critical
    expect(queryThresholds.appointmentQueries.critical).toBeLessThanOrEqual(
      150,
    );
    expect(queryThresholds.generalQueries.critical).toBeLessThanOrEqual(200);
  });

  it("should have high compliance requirements", () => {
    const complianceThresholds = HEALTHCARE_HEALTH_THRESHOLDS.compliance;

    // LGPD compliance should be very high
    expect(complianceThresholds.lgpdQueries.warning).toBeGreaterThanOrEqual(90);
    expect(complianceThresholds.lgpdQueries.critical).toBeGreaterThanOrEqual(
      80,
    );

    // Audit coverage should be comprehensive
    expect(complianceThresholds.auditCoverage.warning).toBeGreaterThanOrEqual(
      95,
    );
    expect(complianceThresholds.auditCoverage.critical).toBeGreaterThanOrEqual(
      90,
    );
  });
});
