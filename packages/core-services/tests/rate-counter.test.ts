/**
 * Tests for Rate Counter Implementation (T017)
 * Tests rate counting, time window management, and performance optimization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  RateCounter,
  createRateCounter,
  getDefaultRateConfig,
  type RateCounterConfig,
  type CounterKey,
  type RateData,
} from "./rate-counter.js";

describe("RateCounter", () => {
  let counter: RateCounter;
  let config: RateCounterConfig;

  beforeEach(() => {
    config = {
      windowMs: 60000, // 1 minute window for testing
      maxRequests: 5,
      keyGenerator: (req) => req.userId || "anonymous",
    };
    counter = new RateCounter(config);
    vi.useFakeTimers();
  });

  afterEach(() => {
    counter.destroy();
    vi.useRealTimers();
  });

  describe("Basic Rate Counting", () => {
    it("should count requests correctly", () => {
      const key = "user1";

      // Make some requests
      counter.increment(key);
      counter.increment(key);
      counter.increment(key);

      const count = counter.getCount(key);
      expect(count).toBe(3);
    });

    it("should allow requests within rate limit", () => {
      const key = "user1";

      // Make requests up to the limit
      for (let i = 0; i < 5; i++) {
        expect(counter.isAllowed(key)).toBe(true);
        counter.increment(key);
      }
    });

    it("should block requests exceeding rate limit", () => {
      const key = "user1";

      // Use up the rate limit
      for (let i = 0; i < 5; i++) {
        counter.increment(key);
      }

      // Next request should be blocked
      expect(counter.isAllowed(key)).toBe(false);
    });
  });

  describe("Time Window Management", () => {
    it("should reset counts after time window expires", () => {
      const key = "user1";

      // Use up the rate limit
      for (let i = 0; i < 5; i++) {
        counter.increment(key);
      }
      expect(counter.isAllowed(key)).toBe(false);

      // Advance time past the window
      vi.advanceTimersByTime(61000); // 61 seconds

      // Should allow requests again
      expect(counter.isAllowed(key)).toBe(true);
      expect(counter.getCount(key)).toBe(0);
    });

    it("should use sliding window correctly", () => {
      const key = "user1";

      // Make first request
      counter.increment(key);
      expect(counter.getCount(key)).toBe(1);

      // Advance time by half the window
      vi.advanceTimersByTime(30000); // 30 seconds

      // Make more requests
      counter.increment(key);
      counter.increment(key);
      expect(counter.getCount(key)).toBe(3);

      // Advance time by another half window (total 60s from first request)
      vi.advanceTimersByTime(30000);

      // First request should still be counted
      expect(counter.getCount(key)).toBe(3);

      // Advance time by 1 more second (61s from first request)
      vi.advanceTimersByTime(1000);

      // First request should now be outside the window
      expect(counter.getCount(key)).toBe(2);
    });
  });

  describe("Key Isolation", () => {
    it("should track different keys independently", () => {
      const key1 = "user1";
      const key2 = "user2";

      // Use up key1's limit
      for (let i = 0; i < 5; i++) {
        counter.increment(key1);
      }
      expect(counter.isAllowed(key1)).toBe(false);

      // Key2 should still be allowed
      expect(counter.isAllowed(key2)).toBe(true);
      expect(counter.getCount(key2)).toBe(0);
    });

    it("should handle multiple concurrent keys", () => {
      const keys = ["user1", "user2", "user3"];

      // Make requests for each key
      keys.forEach(key => {
        counter.increment(key);
        counter.increment(key);
      });

      // Each key should have 2 requests
      keys.forEach(key => {
        expect(counter.getCount(key)).toBe(2);
      });
    });
  });

  describe("Rate Data and Statistics", () => {
    it("should provide accurate rate data", () => {
      const key = "user1";

      counter.increment(key);
      counter.increment(key);
      counter.increment(key);

      const rateData = counter.getRateData(key);
      expect(rateData.count).toBe(3);
      expect(rateData.remaining).toBe(2); // 5 - 3
      expect(rateData.resetTime).toBeInstanceOf(Date);
      expect(rateData.blocked).toBe(false);
    });

    it("should indicate blocked status correctly", () => {
      const key = "user1";

      // Use up the rate limit
      for (let i = 0; i < 5; i++) {
        counter.increment(key);
      }

      const rateData = counter.getRateData(key);
      expect(rateData.count).toBe(5);
      expect(rateData.remaining).toBe(0);
      expect(rateData.blocked).toBe(true);
    });

    it("should provide global statistics", () => {
      const keys = ["user1", "user2", "user3"];

      // Make requests for different keys
      keys.forEach((key, index) => {
        for (let i = 0; i <= index; i++) {
          counter.increment(key);
        }
      });

      const stats = counter.getGlobalStats();
      expect(stats.activeKeys).toBe(3);
      expect(stats.totalRequests).toBe(6); // 1 + 2 + 3
    });
  });

  describe("Configuration", () => {
    it("should use default configuration when created with factory", () => {
      const defaultCounter = createRateCounter();
      expect(defaultCounter).toBeInstanceOf(RateCounter);
      defaultCounter.destroy();
    });

    it("should respect custom configuration", () => {
      const customConfig: RateCounterConfig = {
        windowMs: 30000, // 30 seconds
        maxRequests: 10,
        keyGenerator: (req) => req.ip || "unknown",
      };

      const customCounter = new RateCounter(customConfig);
      const key = "test-key";

      // Should allow more requests with higher limit
      for (let i = 0; i < 10; i++) {
        expect(customCounter.isAllowed(key)).toBe(true);
        customCounter.increment(key);
      }
      expect(customCounter.isAllowed(key)).toBe(false);

      customCounter.destroy();
    });

    it("should provide default configuration", () => {
      const defaultConfig = getDefaultRateConfig();
      expect(defaultConfig).toHaveProperty("windowMs");
      expect(defaultConfig).toHaveProperty("maxRequests");
      expect(typeof defaultConfig.windowMs).toBe("number");
      expect(typeof defaultConfig.maxRequests).toBe("number");
    });
  });

  describe("Memory Management", () => {
    it("should clean up expired entries automatically", () => {
      const key = "user1";

      // Make some requests
      counter.increment(key);
      counter.increment(key);

      const initialStats = counter.getGlobalStats();
      expect(initialStats.activeKeys).toBe(1);

      // Advance time past the window
      vi.advanceTimersByTime(61000);

      // Make a new request to trigger cleanup
      counter.increment(key);

      const finalStats = counter.getGlobalStats();
      expect(finalStats.totalRequests).toBe(1); // Only the new request
    });

    it("should handle memory pressure gracefully", () => {
      // Create many different keys
      for (let i = 0; i < 1000; i++) {
        counter.increment(`user${i}`);
      }

      const stats = counter.getGlobalStats();
      expect(stats.activeKeys).toBe(1000);
      expect(stats.totalRequests).toBe(1000);
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid successive increments", () => {
      const key = "user1";

      // Make rapid requests
      for (let i = 0; i < 10; i++) {
        counter.increment(key);
      }

      expect(counter.getCount(key)).toBe(10);
    });

    it("should handle empty key", () => {
      const key = "";
      counter.increment(key);
      expect(counter.getCount(key)).toBe(1);
    });

    it("should handle null/undefined key gracefully", () => {
      // Should not throw
      counter.increment(null as any);
      counter.increment(undefined as any);
    });

    it("should handle special characters in keys", () => {
      const specialKeys = [
        "user@email.com",
        "user with spaces",
        "user-with-dashes",
        "user_with_underscores",
        "用户中文",
      ];

      specialKeys.forEach(key => {
        counter.increment(key);
        expect(counter.getCount(key)).toBe(1);
      });
    });

    it("should handle time manipulation gracefully", () => {
      const key = "user1";

      counter.increment(key);
      expect(counter.getCount(key)).toBe(1);

      // Go back in time (shouldn't break anything)
      vi.advanceTimersByTime(-30000);
      counter.increment(key);
      expect(counter.getCount(key)).toBe(2);

      // Go forward in time
      vi.advanceTimersByTime(90000);
      expect(counter.getCount(key)).toBe(0);
    });
  });

  describe("Performance", () => {
    it("should handle high frequency requests efficiently", () => {
      const key = "user1";
      const startTime = process.hrtime.bigint();

      // Make many requests
      for (let i = 0; i < 10000; i++) {
        counter.increment(key);
      }

      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

      // Should complete in reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(100); // Less than 100ms
      expect(counter.getCount(key)).toBe(10000);
    });

    it("should scale with number of keys", () => {
      const numKeys = 1000;
      const startTime = process.hrtime.bigint();

      // Create many keys
      for (let i = 0; i < numKeys; i++) {
        counter.increment(`user${i}`);
      }

      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;

      expect(duration).toBeLessThan(200); // Should scale reasonably
      expect(counter.getGlobalStats().activeKeys).toBe(numKeys);
    });
  });

  describe("Cleanup and Destruction", () => {
    it("should clean up resources on destroy", () => {
      const key = "user1";
      counter.increment(key);

      const statsBeforeDestroy = counter.getGlobalStats();
      expect(statsBeforeDestroy.activeKeys).toBeGreaterThan(0);

      counter.destroy();

      // After destruction, should reset state
      const statsAfterDestroy = counter.getGlobalStats();
      expect(statsAfterDestroy.activeKeys).toBe(0);
      expect(statsAfterDestroy.totalRequests).toBe(0);
    });

    it("should handle operations after destroy gracefully", () => {
      counter.destroy();

      // These operations should not throw after destroy
      expect(() => counter.increment("user1")).not.toThrow();
      expect(() => counter.getCount("user1")).not.toThrow();
      expect(() => counter.isAllowed("user1")).not.toThrow();
    });
  });
});