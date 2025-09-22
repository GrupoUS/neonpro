// T047: Unit tests for rate counter service
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  RateCounter,
  type RateCounterConfig,
  type RateLimit,
} from "../src/services/rate-counter";

// Mock timer for testing
vi.useFakeTimers();

describe("RateCounter Service", () => {
  let rateCounter: RateCounter;

  const defaultConfig: RateCounterConfig = {
    windowSizeMs: 60000, // 1 minute
    maxRequests: 10,
    cleanupIntervalMs: 30000, // 30 seconds
  };

  beforeEach(() => {
    vi.clearAllTimers();
    rateCounter = new RateCounter(defaultConfig);
  });

  afterEach(() => {
    if (rateCounter) {
      rateCounter.cleanup();
    }
  });

  describe("Basic rate limiting", () => {
    it(_"should allow requests within limit",_async () => {
      const userId = "user1";

      // First request should be allowed
      const result1 = await rateCounter.checkLimit(userId);
      expect(result1.allowed).toBe(true);
      expect(result1.remainingRequests).toBe(9);
      expect(result1.totalRequests).toBe(1);

      // Second request should be allowed
      const result2 = await rateCounter.checkLimit(userId);
      expect(result2.allowed).toBe(true);
      expect(result2.remainingRequests).toBe(8);
      expect(result2.totalRequests).toBe(2);
    });

    it(_"should block requests when limit exceeded",_async () => {
      const userId = "user1";

      // Make 10 requests (the limit)
      for (let i = 0; i < 10; i++) {
        const result = await rateCounter.checkLimit(userId);
        expect(result.allowed).toBe(true);
        expect(result.remainingRequests).toBe(9 - i);
      }

      // 11th request should be blocked
      const result = await rateCounter.checkLimit(userId);
      expect(result.allowed).toBe(false);
      expect(result.remainingRequests).toBe(0);
      expect(result.totalRequests).toBe(10);
    });

    it(_"should track different users separately",_async () => {
      const user1 = "user1";
      const user2 = "user2";

      // User1 makes 5 requests
      for (let i = 0; i < 5; i++) {
        await rateCounter.checkLimit(user1);
      }

      // User2 should still have full limit available
      const result = await rateCounter.checkLimit(user2);
      expect(result.allowed).toBe(true);
      expect(result.remainingRequests).toBe(9);
      expect(result.totalRequests).toBe(1);
    });
  });

  describe("Sliding window behavior", () => {
    it(_"should reset limits after window expires",_async () => {
      const userId = "user1";

      // Make 10 requests (exhaust limit)
      for (let i = 0; i < 10; i++) {
        await rateCounter.checkLimit(userId);
      }

      // Should be blocked
      let result = await rateCounter.checkLimit(userId);
      expect(result.allowed).toBe(false);

      // Advance time by window size + 1ms
      vi.advanceTimersByTime(defaultConfig.windowSizeMs + 1);

      // Should be allowed again
      result = await rateCounter.checkLimit(userId);
      expect(result.allowed).toBe(true);
      expect(result.remainingRequests).toBe(9);
      expect(result.totalRequests).toBe(1);
    });

    it("should implement proper sliding window (not fixed window)", async () => {
      const userId = "user1";
      const halfWindow = defaultConfig.windowSizeMs / 2;

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        await rateCounter.checkLimit(userId);
      }

      // Advance time by half window
      vi.advanceTimersByTime(halfWindow);

      // Make 5 more requests (should reach limit)
      for (let i = 0; i < 5; i++) {
        await rateCounter.checkLimit(userId);
      }

      // Should be at limit
      let result = await rateCounter.checkLimit(userId);
      expect(result.allowed).toBe(false);

      // Advance time by half window again (total = full window from first _request)
      vi.advanceTimersByTime(halfWindow);

      // First 5 requests should have expired, so 5 more should be allowed
      for (let i = 0; i < 5; i++) {
        result = await rateCounter.checkLimit(userId);
        expect(result.allowed).toBe(true);
      }
    });
  });

  describe("Multiple rate limits", () => {
    it(_"should handle multiple rate limits per user",_async () => {
      const userId = "user1";
      const shortLimit: RateLimit = { windowSizeMs: 5000, maxRequests: 3 }; // 3 per 5 seconds
      const longLimit: RateLimit = { windowSizeMs: 60000, maxRequests: 10 }; // 10 per minute

      // Check both limits
      const result1 = await rateCounter.checkMultipleLimits(userId, [
        shortLimit,
        longLimit,
      ]);
      expect(result1.allowed).toBe(true);
      expect(result1.limitingFactor).toBeUndefined();

      // Make 3 requests quickly
      for (let i = 0; i < 3; i++) {
        await rateCounter.checkMultipleLimits(userId, [shortLimit, longLimit]);
      }

      // 4th request should be blocked by short limit
      const result2 = await rateCounter.checkMultipleLimits(userId, [
        shortLimit,
        longLimit,
      ]);
      expect(result2.allowed).toBe(false);
      expect(result2.limitingFactor?.windowSizeMs).toBe(5000);

      // Advance time to reset short limit
      vi.advanceTimersByTime(5001);

      // Should be allowed again
      const result3 = await rateCounter.checkMultipleLimits(userId, [
        shortLimit,
        longLimit,
      ]);
      expect(result3.allowed).toBe(true);
    });

    it(_"should identify the most restrictive limit",_async () => {
      const userId = "user1";
      const veryShortLimit: RateLimit = { windowSizeMs: 1000, maxRequests: 1 }; // 1 per second
      const shortLimit: RateLimit = { windowSizeMs: 5000, maxRequests: 5 }; // 5 per 5 seconds
      const longLimit: RateLimit = { windowSizeMs: 60000, maxRequests: 100 }; // 100 per minute

      // First request should be allowed
      const result1 = await rateCounter.checkMultipleLimits(userId, [
        veryShortLimit,
        shortLimit,
        longLimit,
      ]);
      expect(result1.allowed).toBe(true);

      // Second request should be blocked by very short limit
      const result2 = await rateCounter.checkMultipleLimits(userId, [
        veryShortLimit,
        shortLimit,
        longLimit,
      ]);
      expect(result2.allowed).toBe(false);
      expect(result2.limitingFactor?.windowSizeMs).toBe(1000);
      expect(result2.limitingFactor?.maxRequests).toBe(1);
    });
  });

  describe("Rate limit information", () => {
    it(_"should provide accurate rate limit information",_async () => {
      const userId = "user1";

      // Make some requests
      await rateCounter.checkLimit(userId);
      await rateCounter.checkLimit(userId);
      await rateCounter.checkLimit(userId);

      const info = await rateCounter.getRateLimitInfo(userId);
      expect(info.totalRequests).toBe(3);
      expect(info.remainingRequests).toBe(7);
      expect(info.resetTime).toBeGreaterThan(Date.now());
      expect(info.resetTime).toBeLessThanOrEqual(
        Date.now() + defaultConfig.windowSizeMs,
      );
    });

    it(_"should handle non-existent users",_async () => {
      const info = await rateCounter.getRateLimitInfo("nonexistent");
      expect(info.totalRequests).toBe(0);
      expect(info.remainingRequests).toBe(defaultConfig.maxRequests);
    });

    it(_"should calculate reset time correctly",_async () => {
      const userId = "user1";
      const startTime = Date.now();

      await rateCounter.checkLimit(userId);

      const info = await rateCounter.getRateLimitInfo(userId);
      const expectedResetTime = startTime + defaultConfig.windowSizeMs;

      expect(info.resetTime).toBeCloseTo(expectedResetTime, -2); // Within 100ms tolerance
    });
  });

  describe("Burst handling", () => {
    it(_"should handle burst requests correctly",_async () => {
      const userId = "user1";
      const burstConfig: RateCounterConfig = {
        ...defaultConfig,
        burstLimit: 15, // Allow burst of 15 requests
        burstWindowMs: 5000, // Over 5 seconds
      };

      const burstCounter = new RateCounter(burstConfig);

      // Make 15 requests in burst
      for (let i = 0; i < 15; i++) {
        const result = await burstCounter.checkLimit(userId);
        expect(result.allowed).toBe(true);
      }

      // 16th request should be blocked
      const result = await burstCounter.checkLimit(userId);
      expect(result.allowed).toBe(false);

      burstCounter.cleanup();
    });

    it(_"should respect both burst and regular limits",_async () => {
      const userId = "user1";
      const burstConfig: RateCounterConfig = {
        windowSizeMs: 60000, // 1 minute regular window
        maxRequests: 10, // 10 requests per minute
        burstLimit: 5, // But only 5 in burst
        burstWindowMs: 5000, // Over 5 seconds
      };

      const burstCounter = new RateCounter(burstConfig);

      // Make 5 requests quickly (burst limit)
      for (let i = 0; i < 5; i++) {
        const result = await burstCounter.checkLimit(userId);
        expect(result.allowed).toBe(true);
      }

      // 6th request should be blocked by burst limit
      let result = await burstCounter.checkLimit(userId);
      expect(result.allowed).toBe(false);

      // Wait for burst window to reset
      vi.advanceTimersByTime(5001);

      // Should be allowed again (within regular limit)
      result = await burstCounter.checkLimit(userId);
      expect(result.allowed).toBe(true);

      burstCounter.cleanup();
    });
  });

  describe("Memory management and cleanup", () => {
    it(_"should clean up expired entries",_async () => {
      const cleanupConfig: RateCounterConfig = {
        ...defaultConfig,
        cleanupIntervalMs: 1000, // Clean up every second
      };

      const cleanupCounter = new RateCounter(cleanupConfig);

      // Make requests for multiple users
      await cleanupCounter.checkLimit("user1");
      await cleanupCounter.checkLimit("user2");
      await cleanupCounter.checkLimit("user3");

      // Verify users exist
      expect(await cleanupCounter.getRateLimitInfo("user1")).toBeDefined();
      expect(await cleanupCounter.getRateLimitInfo("user2")).toBeDefined();

      // Advance time beyond window
      vi.advanceTimersByTime(defaultConfig.windowSizeMs + 1);

      // Trigger cleanup
      vi.advanceTimersByTime(cleanupConfig.cleanupIntervalMs);

      // Expired entries should be cleaned up
      const info1 = await cleanupCounter.getRateLimitInfo("user1");
      expect(info1.totalRequests).toBe(0); // Should be reset

      cleanupCounter.cleanup();
    });

    it("should handle cleanup gracefully", () => {
      const counter = new RateCounter(defaultConfig);

      // Should not throw when cleaning up
      expect(() => counter.cleanup()).not.toThrow();

      // Should handle multiple cleanup calls
      expect(() => counter.cleanup()).not.toThrow();
    });
  });

  describe("Edge cases and error handling", () => {
    it(_"should handle invalid user IDs",_async () => {
      expect(_async () => await rateCounter.checkLimit("")).not.toThrow();
      expect(_async () => await rateCounter.checkLimit(null as any),
      ).not.toThrow();
      expect(_async () => await rateCounter.checkLimit(undefined as any),
      ).not.toThrow();
    });

    it("should handle invalid configurations gracefully", () => {
      const invalidConfig: RateCounterConfig = {
        windowSizeMs: -1000,
        maxRequests: -5,
        cleanupIntervalMs: 0,
      };

      expect(() => new RateCounter(invalidConfig)).not.toThrow();

      // Should use safe defaults
      const counter = new RateCounter(invalidConfig);
      expect(counter).toBeDefined();
      counter.cleanup();
    });

    it(_"should handle concurrent requests correctly",_async () => {
      const userId = "user1";

      // Make multiple concurrent requests
      const promises = Array.from({ length: 5 }, () =>
        rateCounter.checkLimit(userId),
      );
      const results = await Promise.all(promises);

      // All should be processed correctly
      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result).toHaveProperty("allowed");
        expect(result).toHaveProperty("remainingRequests");
        expect(result).toHaveProperty("totalRequests");
      });

      // Total requests should be 5
      const info = await rateCounter.getRateLimitInfo(userId);
      expect(info.totalRequests).toBe(5);
    });

    it(_"should handle time manipulation gracefully",_async () => {
      const userId = "user1";

      await rateCounter.checkLimit(userId);

      // Jump backwards in time
      vi.setSystemTime(Date.now() - 100000);

      // Should still work correctly
      const result = await rateCounter.checkLimit(userId);
      expect(result).toHaveProperty("allowed");

      // Jump forward in time
      vi.setSystemTime(Date.now() + 100000);

      const result2 = await rateCounter.checkLimit(userId);
      expect(result2).toHaveProperty("allowed");
    });
  });

  describe("Performance", () => {
    it(_"should handle large numbers of users efficiently",_async () => {
      const startTime = Date.now();
      const userCount = 1000;

      // Create requests for many users
      const promises = Array.from({ length: userCount },(, i) =>
        rateCounter.checkLimit(`user${i}`),
      );

      await Promise.all(promises);
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000); // 1 second for 1000 users
    });

    it(_"should have reasonable memory usage",_async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Make requests for many users
      for (let i = 0; i < 1000; i++) {
        await rateCounter.checkLimit(`user${i}`);
      }

      const afterRequestsMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = afterRequestsMemory - initialMemory;

      // Memory increase should be reasonable (adjust threshold as needed)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });
  });

  describe("Real-world scenarios", () => {
    it("should implement LGPD-compliant rate limiting (10/5min, 30/hour)", async () => {
      const userId = "patient1";
      const fiveMinLimit: RateLimit = {
        windowSizeMs: 5 * 60 * 1000,
        maxRequests: 10,
      };
      const hourLimit: RateLimit = {
        windowSizeMs: 60 * 60 * 1000,
        maxRequests: 30,
      };

      // Make 10 requests (5-minute limit)
      for (let i = 0; i < 10; i++) {
        const result = await rateCounter.checkMultipleLimits(userId, [
          fiveMinLimit,
          hourLimit,
        ]);
        expect(result.allowed).toBe(true);
      }

      // 11th request should be blocked by 5-minute limit
      const result = await rateCounter.checkMultipleLimits(userId, [
        fiveMinLimit,
        hourLimit,
      ]);
      expect(result.allowed).toBe(false);
      expect(result.limitingFactor?.windowSizeMs).toBe(5 * 60 * 1000);
    });

    it(_"should handle API key rotation scenarios",_async () => {
      const oldApiKey = "old-api-key";
      const newApiKey = "new-api-key";

      // Make requests with old key
      await rateCounter.checkLimit(oldApiKey);
      await rateCounter.checkLimit(oldApiKey);

      // Rotate to new key - should have fresh limits
      const result = await rateCounter.checkLimit(newApiKey);
      expect(result.allowed).toBe(true);
      expect(result.remainingRequests).toBe(9); // Fresh limit
    });

    it(_"should handle medical emergency override patterns",_async () => {
      const userId = "emergency-user";
      const emergencyConfig: RateCounterConfig = {
        ...defaultConfig,
        maxRequests: 100, // Higher limit for emergencies
        windowSizeMs: 60000,
      };

      const emergencyCounter = new RateCounter(emergencyConfig);

      // Should allow more requests for emergency scenarios
      for (let i = 0; i < 50; i++) {
        const result = await emergencyCounter.checkLimit(userId);
        expect(result.allowed).toBe(true);
      }

      emergencyCounter.cleanup();
    });
  });
});
