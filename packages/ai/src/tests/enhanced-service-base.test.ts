import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { EnhancedAIService } from "../services/enhanced-service-base";
import type {
  AIServiceConfig,
  CacheService,
  DatabaseService,
  LoggerService,
  MetricsService,
  ServiceMetrics,
} from "../types";

// Mock implementations
class MockCacheService implements CacheService {
  private readonly store = new Map<string, any>();

  async get<T>(key: string): Promise<T | null> {
    return this.store.get(key) || undefined;
  }

  async set<T>(key: string, value: T, _ttl?: number): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

class MockLoggerService implements LoggerService {
  logs: { level: string; message: string; meta?: any }[] = [];

  async info(message: string, meta?: Record<string, any>): Promise<void> {
    this.logs.push({ level: "info", message, meta });
  }

  async warn(message: string, meta?: Record<string, any>): Promise<void> {
    this.logs.push({ level: "warn", message, meta });
  }

  async error(message: string, meta?: Record<string, any>): Promise<void> {
    this.logs.push({ level: "error", message, meta });
  }

  async debug(message: string, meta?: Record<string, any>): Promise<void> {
    this.logs.push({ level: "debug", message, meta });
  }
}

class MockMetricsService implements MetricsService {
  metrics: ServiceMetrics[] = [];
  counters: {
    name: string;
    value: number;
    labels?: Record<string, string>;
  }[] = [];
  gauges: {
    name: string;
    value: number;
    labels?: Record<string, string>;
  }[] = [];
  histograms: {
    name: string;
    value: number;
    labels?: Record<string, string>;
  }[] = [];

  async recordMetric(metric: ServiceMetrics): Promise<void> {
    this.metrics.push(metric);
  }

  async recordCounter(
    name: string,
    value = 1,
    labels?: Record<string, string>,
  ): Promise<void> {
    this.counters.push({ name, value, labels });
  }

  async recordGauge(
    name: string,
    value: number,
    labels?: Record<string, string>,
  ): Promise<void> {
    this.gauges.push({ name, value, labels });
  }

  async recordHistogram(
    name: string,
    value: number,
    labels?: Record<string, string>,
  ): Promise<void> {
    this.histograms.push({ name, value, labels });
  }
}

class MockDatabaseService implements Partial<DatabaseService> {
  auditLogs: { create: Mock } = {
    create: vi.fn().mockResolvedValue({}),
  };

  complianceEvents: { create: Mock } = {
    create: vi.fn().mockResolvedValue({}),
  };
}

// Test implementation of EnhancedAIService
class TestAIService extends EnhancedAIService<
  { input: string },
  { output: string }
> {
  protected serviceId = "test-service";
  protected version = "1.0.0";
  protected description = "Test AI service";

  async execute(input: { input: string }): Promise<{ output: string }> {
    if (input.input === "error") {
      throw new Error("Test error");
    }

    if (input.input === "slow") {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return { output: input.input.toUpperCase() };
  }
}

describe("enhancedAIService", () => {
  let service: TestAIService;
  let mockCache: MockCacheService;
  let mockLogger: MockLoggerService;
  let mockMetrics: MockMetricsService;
  let mockDatabase: MockDatabaseService;

  beforeEach(() => {
    mockCache = new MockCacheService();
    mockLogger = new MockLoggerService();
    mockMetrics = new MockMetricsService();
    mockDatabase = new MockDatabaseService();

    const config: AIServiceConfig = {
      enableCaching: true,
      cacheTTL: 300,
      enableRetry: true,
      maxRetries: 2,
      enableMetrics: true,
      enableCompliance: true,
      complianceLevel: "healthcare",
    };

    service = new TestAIService(config);
    // Inject mocks via protected methods (in real implementation, these would be injected)
    (service as any).cache = mockCache;
    (service as any).logger = mockLogger;
    (service as any).metrics = mockMetrics;
    (service as any).database = mockDatabase;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("basic functionality", () => {
    it("should execute successfully with valid input", async () => {
      const result = await service.executeWithMetrics({ input: "hello" });

      expect(result).toStrictEqual({ output: "HELLO" });
    });

    it("should handle errors gracefully", async () => {
      await expect(
        service.executeWithMetrics({ input: "error" }),
      ).rejects.toThrow("Test error");
    });

    it("should record metrics for successful execution", async () => {
      await service.executeWithMetrics({ input: "hello" });

      expect(mockMetrics.metrics).toHaveLength(1);
      const metric = mockMetrics.metrics[0];
      expect(metric.operation).toBe("service_execution");
      expect(metric.success).toBeTruthy();
      expect(metric.duration).toBeGreaterThan(0);
    });

    it("should record metrics for failed execution", async () => {
      try {
        await service.executeWithMetrics({ input: "error" });
      } catch {
        // Expected to throw
      }

      expect(mockMetrics.metrics).toHaveLength(1);
      const metric = mockMetrics.metrics[0];
      expect(metric.operation).toBe("service_execution");
      expect(metric.success).toBeFalsy();
      expect(metric.errorType).toBe("Error");
    });
  });

  describe("caching functionality", () => {
    it("should cache successful results", async () => {
      // First execution
      const result1 = await service.executeWithMetrics({ input: "cached" });
      expect(result1).toStrictEqual({ output: "CACHED" });

      // Second execution should use cache
      const result2 = await service.executeWithMetrics({ input: "cached" });
      expect(result2).toStrictEqual({ output: "CACHED" });

      // Verify cache was used by checking if value exists
      const cacheKey = (service as any).generateCacheKey({ input: "cached" });
      const cached = await mockCache.get(cacheKey);
      expect(cached).toBeDefined();
    });

    it("should not cache failed results", async () => {
      try {
        await service.executeWithMetrics({ input: "error" });
      } catch {
        // Expected to throw
      }

      const cacheKey = (service as any).generateCacheKey({ input: "error" });
      const cached = await mockCache.get(cacheKey);
      expect(cached).toBeNull();
    });
  });

  describe("retry functionality", () => {
    it("should retry failed operations", async () => {
      const executespy = vi.spyOn(service, "execute");

      try {
        await service.executeWithMetrics({ input: "error" });
      } catch {
        // Expected to throw after retries
      }

      // Should be called 3 times: initial + 2 retries
      expect(executespy).toHaveBeenCalledTimes(3);
    });

    it("should not retry successful operations", async () => {
      const executeSpy = vi.spyOn(service, "execute");

      await service.executeWithMetrics({ input: "hello" });

      expect(executeSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("logging functionality", () => {
    it("should log service execution start and end", async () => {
      await service.executeWithMetrics({ input: "hello" });

      const infoLogs = mockLogger.logs.filter((log) => log.level === "info");
      expect(infoLogs.length).toBeGreaterThan(0);

      const hasExecutionLog = infoLogs.some(
        (log) =>
          log.message.includes("Service execution") ||
          log.message.includes("completed"),
      );
      expect(hasExecutionLog).toBeTruthy();
    });

    it("should log errors", async () => {
      try {
        await service.executeWithMetrics({ input: "error" });
      } catch {
        // Expected to throw
      }

      const errorLogs = mockLogger.logs.filter((log) => log.level === "error");
      expect(errorLogs.length).toBeGreaterThan(0);
    });
  });

  describe("compliance functionality", () => {
    it("should log compliance events", async () => {
      const context = { userId: "user123", clinicId: "clinic456" };
      await service.executeWithMetrics({ input: "hello" }, context);

      expect(mockDatabase.auditLogs.create).toHaveBeenCalled();

      const auditCall = mockDatabase.auditLogs.create.mock.calls[0][0];
      expect(auditCall.data).toMatchObject({
        service: "test-service",
        operation: "service_execution",
        userId: "user123",
        clinicId: "clinic456",
      });
    });

    it("should handle sensitive data detection", async () => {
      // Test with potentially sensitive input
      const sensitiveInput = { input: "CPF: 123.456.789-00" };

      await service.executeWithMetrics(sensitiveInput);

      // Should log compliance event for sensitive data
      expect(mockDatabase.complianceEvents.create).toHaveBeenCalled();
    });
  });

  describe("rate limiting", () => {
    it("should enforce rate limits when configured", async () => {
      const rateLimitConfig = {
        enableCaching: true,
        cacheTTL: 300,
        enableRetry: true,
        maxRetries: 2,
        enableMetrics: true,
        enableCompliance: true,
        complianceLevel: "healthcare" as const,
        rateLimitConfig: {
          maxRequests: 2,
          windowMs: 1000,
        },
      };

      const rateLimitedService = new TestAIService(rateLimitConfig);
      (rateLimitedService as any).cache = mockCache;
      (rateLimitedService as any).logger = mockLogger;
      (rateLimitedService as any).metrics = mockMetrics;
      (rateLimitedService as any).database = mockDatabase;

      // First two requests should succeed
      await rateLimitedService.executeWithMetrics({ input: "test1" });
      await rateLimitedService.executeWithMetrics({ input: "test2" });

      // Third request should be rate limited
      await expect(
        rateLimitedService.executeWithMetrics({ input: "test3" }),
      ).rejects.toThrow(/rate limit/i);
    });
  });

  describe("performance monitoring", () => {
    it("should measure execution time accurately", async () => {
      await service.executeWithMetrics({ input: "slow" });

      const metrics = mockMetrics.metrics;
      expect(metrics).toHaveLength(1);
      expect(metrics[0].duration).toBeGreaterThan(90); // Should be at least 100ms minus some tolerance
    });

    it("should track performance metrics over time", async () => {
      // Execute multiple times
      await service.executeWithMetrics({ input: "fast1" });
      await service.executeWithMetrics({ input: "fast2" });
      await service.executeWithMetrics({ input: "slow" });

      expect(mockMetrics.metrics).toHaveLength(3);

      const durations = mockMetrics.metrics.map((m) => m.duration);
      expect(durations[2]).toBeGreaterThan(durations[0]); // Slow operation should take longer
    });
  });

  describe("health checks", () => {
    it("should report service health status", async () => {
      const health = await (service as any).checkHealth();

      expect(health).toMatchObject({
        status: "healthy",
        service: "test-service",
        version: "1.0.0",
      });
    });

    it("should detect unhealthy service state", async () => {
      // Simulate unhealthy state by making cache unavailable
      jest
        .spyOn(mockCache, "get")
        .mockImplementation()
        .mockRejectedValue(new Error("Cache unavailable"));

      const health = await (service as any).checkHealth();

      expect(health.status).toBe("degraded");
      expect(health.issues).toContainEqual(
        expect.objectContaining({ type: "cache_error" }),
      );
    });
  });

  describe("integration scenarios", () => {
    it("should handle complex workflow with all features enabled", async () => {
      const context = {
        userId: "user123",
        clinicId: "clinic456",
        requestId: "req789",
      };

      // Execute with all features
      const result = await service.executeWithMetrics(
        { input: "complex" },
        context,
      );

      // Verify result
      expect(result).toStrictEqual({ output: "COMPLEX" });

      // Verify metrics were recorded
      expect(mockMetrics.metrics).toHaveLength(1);
      expect(mockMetrics.metrics[0].userId).toBe("user123");
      expect(mockMetrics.metrics[0].clinicId).toBe("clinic456");

      // Verify audit logging
      expect(mockDatabase.auditLogs.create).toHaveBeenCalled();

      // Verify caching
      const cacheKey = (service as any).generateCacheKey({ input: "complex" });
      const cached = await mockCache.get(cacheKey);
      expect(cached).toBeDefined();
    });

    it("should handle concurrent executions safely", async () => {
      // Execute multiple requests concurrently
      const promises = [
        service.executeWithMetrics({ input: "concurrent1" }),
        service.executeWithMetrics({ input: "concurrent2" }),
        service.executeWithMetrics({ input: "concurrent3" }),
      ];

      const results = await Promise.all(promises);

      expect(results).toStrictEqual([
        { output: "CONCURRENT1" },
        { output: "CONCURRENT2" },
        {
          output: "CONCURRENT3",
        },
      ]);

      expect(mockMetrics.metrics).toHaveLength(3);
    });
  });

  describe("configuration validation", () => {
    it("should validate configuration on initialization", () => {
      expect(() => {
        new TestAIService({
          enableCaching: true,
          cacheTTL: -1, // Invalid TTL
          enableRetry: true,
          maxRetries: 2,
          enableMetrics: true,
          enableCompliance: true,
          complianceLevel: "healthcare",
        });
      }).toThrow(/invalid.*ttl/i);
    });

    it("should use default configuration when not provided", () => {
      const defaultService = new TestAIService();

      expect((defaultService as any).config.enableCaching).toBeTruthy();
      expect((defaultService as any).config.enableMetrics).toBeTruthy();
      expect((defaultService as any).config.enableCompliance).toBeTruthy();
    });
  });
});

// Helper function tests
describe("enhancedAIService utilities", () => {
  describe("cache key generation", () => {
    it("should generate consistent cache keys for same input", () => {
      const service = new TestAIService();
      const input = { input: "test" };

      const key1 = (service as any).generateCacheKey(input);
      const key2 = (service as any).generateCacheKey(input);

      expect(key1).toBe(key2);
    });

    it("should generate different cache keys for different inputs", () => {
      const service = new TestAIService();

      const key1 = (service as any).generateCacheKey({ input: "test1" });
      const key2 = (service as any).generateCacheKey({ input: "test2" });

      expect(key1).not.toBe(key2);
    });
  });

  describe("error classification", () => {
    it("should classify different error types correctly", () => {
      const service = new TestAIService();

      const errorTypes = [
        { error: new Error("Generic error"), expected: "Error" },
        { error: new TypeError("Type error"), expected: "TypeError" },
        { error: new RangeError("Range error"), expected: "RangeError" },
      ];

      errorTypes.forEach(({ error, expected }) => {
        const classified = (service as any).classifyError(error);
        expect(classified).toBe(expected);
      });
    });
  });

  describe("input validation", () => {
    it("should validate input structure", async () => {
      const service = new TestAIService();

      // Valid input
      expect(() =>
        (service as any).validateInput({ input: "valid" }),
      ).not.toThrow();

      // Invalid input
      expect(() => (service as any).validateInput()).toThrow(/invalid input/i);
      expect(() => (service as any).validateInput({})).toThrow(
        /missing required/i,
      );
    });
  });
});
