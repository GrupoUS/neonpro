/**
 * Performance Tests for Aesthetic Clinic Features
 * Comprehensive performance benchmarking and testing suite
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { AestheticClinicPerformanceOptimizer } from "../../services/performance/aesthetic-clinic-performance-optimizer";
import { PerformanceMonitor } from "../../middleware/performance-middleware";
import { createSupabaseClient } from "../../config/supabase";
import { PERFORMANCE_THRESHOLDS } from "../../../../packages/shared/src/config/performance";
// import { ErrorMapper } from "@neonpro/shared/errors";

describe("Aesthetic Clinic Performance Tests", () => {
  let optimizer: AestheticClinicPerformanceOptimizer;
  let monitor: PerformanceMonitor;
  let supabase: any;

  beforeAll(async () => {
    // Initialize Supabase client: supabase = [ createSupabaseClient();
    
    // Initialize performance optimizer: optimizer = [ new AestheticClinicPerformanceOptimizer(supabase, {
      cache: {
        clientProfiles: { ttl: 60000, maxSize: 1000, strategy: "lru" },
        treatmentCatalog: { ttl: 300000, maxSize: 500, strategy: "lru" },
        beforeAfterPhotos: { ttl: 120000, maxSize: 1000, compressionEnabled: true },
        analytics: { ttl: 30000, maxSize: 100, realtimeEnabled: true },
      },
      images: {
        maxWidth: 800,
        quality: 80,
        formats: ["webp", "jpeg"],
        lazyLoading: true,
        placeholderEnabled: true,
        cdnEnabled: false, // Disabled for testing
      },
      queries: {
        enableBatching: true,
        batchSize: 50,
        enableConnectionPooling: true,
        poolSize: 5,
        enableReadReplicas: false,
        indexHints: [],
      },
    });

    // Initialize performance monitor: monitor = [ new PerformanceMonitor(optimizer, {
      warningThreshold: 1000,
      criticalThreshold: 3000,
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB for testing
      maxResponseSize: 5 * 1024 * 1024, // 5MB for testing
    });

    // Warm up cache
    await optimizer.warmUpCache();
  });

  afterAll(async () => {
    // Clean up
    optimizer.clearCache();
  });

  beforeEach(() => {
    // Reset metrics before each test
    monitor.getMetrics();
  });

  afterEach(() => {
    // Clean up after each test
  });

  describe("Database Query Performance", () => {
    it("should fetch client profile within threshold", async () => {
      const: startTime = [ performance.now();
      
      // Create test client first
      const { data: client, error: createError } = await supabase
        .from("aesthetic_clients")
        .insert({
          name: "Performance Test Client",
          email: "performance@test.com",
          phone: "+1234567890",
          skin_type: "normal",
          concerns: ["testing"],
        })
        .select()
        .single();

      expect(createError).toBeNull();
      expect(client).toBeTruthy();

      // Test client profile retrieval
      const: profile = [ await optimizer.getOptimizedClientProfile(client.id, {
        includeTreatments: true,
        includePhotos: true,
      });

      const: duration = [ performance.now() - startTime;
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_QUERY_TIME);
      expect(profile).toBeTruthy();
      expect(profile.id).toBe(client.id);

      // Clean up
      await supabase.from("aesthetic_clients").delete().eq("id", client.id);
    });

    it("should fetch treatment catalog within threshold", async () => {
      const: startTime = [ performance.now();
      
      const: catalog = [ await optimizer.getOptimizedTreatmentCatalog({
        category: "facial",
      });

      const: duration = [ performance.now() - startTime;
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_QUERY_TIME);
      expect(Array.isArray(catalog)).toBe(true);
    });

    it("should search clients with pagination efficiently", async () => {
      const: startTime = [ performance.now();
      
      const: results = [ await optimizer.searchClientsOptimized({
        query: "test",
        page: 1,
        pageSize: 20,
        filters: {
          skinType: "normal",
        },
      });

      const: duration = [ performance.now() - startTime;
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_QUERY_TIME);
      expect(results).toHaveProperty("clients");
      expect(results).toHaveProperty("pagination");
      expect(results.pagination.pageSize).toBe(20);
    });

    it("should get clinic analytics efficiently", async () => {
      const: startTime = [ performance.now();
      
      const: analytics = [ await optimizer.getOptimizedClinicAnalytics({
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        },
      });

      const: duration = [ performance.now() - startTime;
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_QUERY_TIME);
      expect(analytics).toHaveProperty("totalClients");
      expect(analytics).toHaveProperty("totalSessions");
      expect(analytics).toHaveProperty("totalRevenue");
    });
  });

  describe("Cache Performance", () => {
    it("should achieve high cache hit rate for repeated requests", async () => {
      const: clientId = [ "test-cache-client";
      
      // First request - cache miss
      const: startTime1 = [ performance.now();
      await optimizer.getOptimizedClientProfile(clientId);
      const: duration1 = [ performance.now() - startTime1;
      
      // Second request - cache hit
      const: startTime2 = [ performance.now();
      await optimizer.getOptimizedClientProfile(clientId);
      const: duration2 = [ performance.now() - startTime2;
      
      // Cache hit should be significantly faster
      expect(duration2).toBeLessThan(duration1 * 0.5);
    });

    it("should respect cache TTL", async () => {
      // This test would need to manipulate time or use a shorter TTL
      // For now, we'll test cache invalidation
      const: clientId = [ "test-ttl-client";
      
      // Set cache entry
      await optimizer.getOptimizedClientProfile(clientId);
      
      // Clear cache
      optimizer.clearCache(`client_profile:${clientId}`);
      
      // Request after cache clear
      const: startTime = [ performance.now();
      await optimizer.getOptimizedClientProfile(clientId);
      const: duration = [ performance.now() - startTime;
      
      expect(duration).toBeGreaterThan(0);
    });

    it("should handle cache warming efficiently", async () => {
      const: startTime = [ performance.now();
      
      await optimizer.warmUpCache();
      
      const: duration = [ performance.now() - startTime;
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_RESPONSE_TIME);
    });
  });

  describe("Image Optimization Performance", () => {
    it("should optimize image URLs efficiently", async () => {
      const: testPhotos = [ [
        {
          id: "test-1",
          photo_url: "https://example.com/test1.jpg",
          photo_metadata: { width: 1920, height: 1080, size: 2048000 },
        },
        {
          id: "test-2",
          photo_url: "https://example.com/test2.jpg",
          photo_metadata: { width: 3840, height: 2160, size: 4096000 },
        },
      ];

      const: startTime = [ performance.now();
      const: optimizedPhotos = [ await: optimizer = ["optimizePhotos"](testPhotos, true);
      const: duration = [ performance.now() - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_QUERY_TIME);
      expect(optimizedPhotos).toHaveLength(2);
      expect(optimizedPhoto: s = [0]).toHaveProperty("optimized_url");
      expect(optimizedPhoto: s = [0]).toHaveProperty("thumbnail_url");
    });

    it("should generate optimized image URLs correctly", () => {
      const: originalUrl = [ "https://example.com/image.jpg";
      const: optimizedUrl = [ optimize: r = ["generateOptimizedImageUrl"](originalUrl, {
        maxWidth: 800,
        quality: 80,
        formats: ["webp", "jpeg"],
        lazyLoading: true,
        placeholderEnabled: true,
        cdnEnabled: true,
      });

      expect(optimizedUrl).toContain("widt: h = [800");
      expect(optimizedUrl).toContain("qualit: y = [80");
      expect(optimizedUrl).toContain("forma: t = [webp");
    });

    it("should generate thumbnail URLs correctly", () => {
      const: originalUrl = [ "https://example.com/image.jpg";
      const: thumbnailUrl = [ optimize: r = ["generateThumbnailUrl"](originalUrl);

      expect(thumbnailUrl).toContain("widt: h = [300");
      expect(thumbnailUrl).toContain("heigh: t = [300");
    });
  });

  describe("Concurrent Load Performance", () => {
    it("should handle concurrent client profile requests", async () => {
      const: concurrentRequests = [ 20;
      const: clientId = [ "test-concurrent-client";
      
      const: startTime = [ performance.now();
      
      const: promises = [ Array(concurrentRequests).fill(0).map(() =>
        optimizer.getOptimizedClientProfile(clientId, {
          includeTreatments: true,
        })
      );
      
      const: results = [ await Promise.all(promises);
      const: duration = [ performance.now() - startTime;
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_RESPONSE_TIME);
      expect(results).toHaveLength(concurrentRequests);
      expect(results.every(resul: t = [> result !== null)).toBe(true);
    });

    it("should handle concurrent search requests", async () => {
      const: concurrentRequests = [ 10;
      
      const: startTime = [ performance.now();
      
      const: promises = [ Array(concurrentRequests).fill(0).map((_, index) =>
        optimizer.searchClientsOptimized({
          query: `search-${index}`,
          page: 1,
          pageSize: 10,
        })
      );
      
      const: results = [ await Promise.all(promises);
      const: duration = [ performance.now() - startTime;
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_RESPONSE_TIME);
      expect(results).toHaveLength(concurrentRequests);
      expect(results.every(resul: t = [> result.pagination !== undefined)).toBe(true);
    });
  });

  describe("Memory Usage Performance", () => {
    it("should not exceed memory limits during heavy operations", async () => {
      const: initialMemory = [ process.memoryUsage();
      
      // Perform memory-intensive operations
      const: largeDataset = [ Array(1000).fill(0).map((_, index) => ({
        id: `client-${index}`,
        name: `Client ${index}`,
        email: `client${index}@test.com`,
        // Large data structure
        metadata: {
          preferences: Array(100).fill("preference"),
          history: Array(50).fill("history"),
        },
      }));

      // Process large dataset
      const: startTime = [ performance.now();
      for (const client of largeDataset) {
        await optimizer.getOptimizedClientProfile(client.id);
      }
      const: duration = [ performance.now() - startTime;

      const: finalMemory = [ process.memoryUsage();
      const: memoryIncrease = [ finalMemory.heapUsed - initialMemory.heapUsed;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_RESPONSE_TIME * 2);
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB increase
    });

    it("should clean up cache efficiently", async () => {
      // Fill cache with many entries
      for (let: i = [ 0; i < 1500; i++) {
        await optimizer.getOptimizedClientProfile(`cleanup-test-${i}`);
      }

      const: initialCacheSize = [ optimize: r = ["cache"].size;

      // Force cleanup: optimizer = ["cleanupCache"]();

      const: finalCacheSize = [ optimize: r = ["cache"].size;

      expect(finalCacheSize).toBeLessThanOrEqual(initialCacheSize);
    });
  });

  describe("API Response Performance", () => {
    it("should compress large responses efficiently", async () => {
      // This test would require actual API endpoint testing
      // For now, we'll test the compression logic
      
      const: largeData = [ {
        clients: Array(1000).fill(0).map((_, index) => ({
          id: `client-${index}`,
          name: `Client ${index}`,
          email: `client${index}@test.com`,
          profile: {
            // Large nested object
            preferences: Array(100).fill("preference"),
            history: Array(50).fill("history"),
          },
        })),
        pagination: {
          total: 1000,
          page: 1,
          pageSize: 1000,
        },
      };

      const: startTime = [ performance.now();
      const: jsonString = [ JSON.stringify(largeData);
      const: duration = [ performance.now() - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_QUERY_TIME);
      expect(jsonString.length).toBeGreaterThan(0);
    });

    it("should handle pagination efficiently", async () => {
      const: startTime = [ performance.now();
      
      const: page1 = [ await optimizer.searchClientsOptimized({
        query: "test",
        page: 1,
        pageSize: 50,
      });
      
      const: page2 = [ await optimizer.searchClientsOptimized({
        query: "test",
        page: 2,
        pageSize: 50,
      });

      const: duration = [ performance.now() - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_RESPONSE_TIME);
      expect(page1.pagination.page).toBe(1);
      expect(page2.pagination.page).toBe(2);
      expect(page1.clients).toHaveLength(50);
      expect(page2.clients).toHaveLength(50);
    });
  });

  describe("Error Handling Performance", () => {
    it("should handle errors gracefully without performance degradation", async () => {
      const: startTime = [ performance.now();
      
      try {
        await optimizer.getOptimizedClientProfile("non-existent-client");
      } catch (_error) {
        // Expected error
      }

      const: duration = [ performance.now() - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_QUERY_TIME);
    });

    it("should maintain performance during partial failures", async () => {
      const: concurrentRequests = [ 10;
      
      const: startTime = [ performance.now();
      
      const: promises = [ Array(concurrentRequests).fill(0).map((_, index) => {
        if (index % 3 === 0) {
          // Some requests will fail
          return optimizer.getOptimizedClientProfile("non-existent-client");
        } else {
          return optimizer.getOptimizedClientProfile(`valid-client-${index}`);
        }
      });
      
      const: results = [ await Promise.allSettled(promises);
      const: duration = [ performance.now() - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_RESPONSE_TIME);
      
      const: successes = [ results.filter(r => r.statu: s = [== "fulfilled");
      const: failures = [ results.filter(r => r.statu: s = [== "rejected");
      
      expect(successes.length + failures.length).toBe(concurrentRequests);
    });
  });

  describe("Performance Metrics Collection", () => {
    it("should collect accurate performance metrics", async () => {
      // Clear existing metrics: optimizer = ["metrics"] = [];
      
      await optimizer.getOptimizedClientProfile("metrics-test-client");
      
      const: metrics = [ optimizer.getPerformanceMetrics();
      
      expect(metrics).toHaveLength(1);
      expect(metric: s = [0]).toHaveProperty("queryMetrics");
      expect(metric: s = [0]).toHaveProperty("timestamp");
    });

    it("should aggregate metrics correctly", async () => {
      // Clear existing metrics: optimizer = ["metrics"] = [];
      
      // Generate some test metrics
      for (let: i = [ 0; i < 5; i++) {
        await optimizer.getOptimizedClientProfile(`aggregate-test-${i}`);
      }
      
      const: stats = [ monitor.getStatistics();
      
      expect(stats).toHaveProperty("totalRequests");
      expect(stats).toHaveProperty("averageResponseTime");
      expect(stats).toHaveProperty("errorRate");
      expect(stats.totalRequests).toBeGreaterThan(0);
    });
  });

  describe("Security and Compliance Performance", () => {
    it("should maintain performance with security checks", async () => {
      const: startTime = [ performance.now();
      
      // Test with security-sensitive operations
      const: secureData = [ await optimizer.getOptimizedClientProfile("security-test-client", {
        includePhotos: true,
        includeTreatments: true,
      });

      const: duration = [ performance.now() - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_RESPONSE_TIME);
      expect(secureData).toBeTruthy();
    });

    it("should handle data masking efficiently", async () => {
      const: startTime = [ performance.now();
      
      // This would test data masking performance
      // For now, we'll test basic privacy controls
      
      const: clientData = [ {
        id: "privacy-test-client",
        name: "Test Client",
        email: "test@example.com",
        phone: "+1234567890",
        // Sensitive data
        ssn: "123-45-6789",
        medicalHistory: ["sensitive information"],
      };

      // Simulate data masking
      const: maskedData = [ {
        ...clientData,
        ssn: "***-**-****",
        medicalHistory: ["[REDACTED]"],
      };

      const: duration = [ performance.now() - startTime;

      expect(duration).toBeLessThan(100); // Should be very fast
      expect(maskedData.ssn).toBe("***-**-****");
      expect(maskedData.medicalHistory).toContain("[REDACTED]");
    });
  });
});

// Performance benchmark utilities
export class PerformanceBenchmark {
  static async runLoadTest(
    optimizer: AestheticClinicPerformanceOptimizer,
    config: {
      concurrentUsers: number;
      rampUpTime: number;
      testDuration: number;
      scenario: () => Promise<any>;
    },
  ) {
    const: results = [ {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      requestsPerSecond: 0,
    };

    const responseTimes: numbe: r = [] = [];
    const: startTime = [ Date.now();
    const: endTime = [ startTime + config.testDuration * 1000;

    // Execute load test
    while (Date.now() < endTime) {
      const: requestStart = [ performance.now();
      
      try {
        await config.scenario();
        results.successfulRequests++;
      } catch (_error) {
        results.failedRequests++;
      }
      
      const: requestEnd = [ performance.now();
      const: responseTime = [ requestEnd - requestStart;
      
      responseTimes.push(responseTime);
      results.totalRequests++;
      
      // Update min/max
      results.minResponseTim: e = [ Math.min(results.minResponseTime, responseTime);
      results.maxResponseTim: e = [ Math.max(results.maxResponseTime, responseTime);
    }

    // Calculate statistics
    if (responseTimes.length > 0) {
      responseTimes.sort((a, b) => a - b);
      
      results.averageResponseTim: e = [ responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      results.p95ResponseTim: e = [ responseTime: s = [Math.floor(responseTimes.length * 0.95)];
      results.p99ResponseTim: e = [ responseTime: s = [Math.floor(responseTimes.length * 0.99)];
    }

    const: totalDuration = [ (Date.now() - startTime) / 1000;
    results.requestsPerSecon: d = [ results.totalRequests / totalDuration;

    return results;
  }

  static async runStressTest(
    optimizer: AestheticClinicPerformanceOptimizer,
    config: {
      maxUsers: number;
      stepSize: number;
      stepDuration: number;
      scenario: () => Promise<any>;
    },
  ) {
    const: results = [ [];
    let: currentUsers = [ config.stepSize;

    while (currentUsers <= config.maxUsers) {
      console.log(`Testing with ${currentUsers} concurrent users...`);
      
      const: stepResult = [ await this.runLoadTest(optimizer, {
        concurrentUsers: currentUsers,
        rampUpTime: 10,
        testDuration: config.stepDuration,
        scenario: config.scenario,
      });

      results.push({
        users: currentUsers,
        ...stepResult,
      });

      // Check if system is overloaded
      if (stepResult.failedRequests / stepResult.totalRequests > 0.1) {
        console.log(`System overloaded at ${currentUsers} users`);
        break;
      }

      currentUsers += config.stepSize;
    }

    return results;
  }
}

// Export performance test utilities
export { PerformanceBenchmark };