/**
 * Tests for Abuse Sliding Window Tracker (T018)
 * Tests rate limiting, sliding window behavior, and memory management
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  AbuseWindowTracker,
  createAbuseWindowTracker,
  getDefaultAbuseConfig,
  type SlidingWindowConfig,
  type TrackingKey,
  type RequestEntry,
} from "./abuseWindow.ts";

describe("AbuseWindowTracker", () => {
  let tracker: AbuseWindowTracker;
  let config: SlidingWindowConfig;

  beforeEach(() => {
    config = {
      window60s: 3, // Lower limits for testing
      window10m: 5,
    };
    tracker = new AbuseWindowTracker(config);
  });

  afterEach(() => {
    tracker.destroy();
  });

  describe("Basic Rate Limiting", () => {
    it("should allow requests within limits", async () => {
      const key: TrackingKey = { type: "user", value: "user1:/api/test" };
      const _request: Omit<RequestEntry, "timestamp"> = {
        _userId: "user1",
        ip: "127.0.0.1",
        endpoint: "/api/test",
        userAgent: "test-agent"
      };

      // First 3 requests should be allowed (within 60s window limit)
      expect(await tracker.checkAndTrackRequest(key, _request)).toHaveProperty("allowed", true);
      expect(await tracker.checkAndTrackRequest(key, _request)).toHaveProperty("allowed", true);
      expect(await tracker.checkAndTrackRequest(key, _request)).toHaveProperty("allowed", true);
    });

    it("should block requests exceeding 60s window", async () => {
      const key: TrackingKey = { type: "user", value: "user1:/api/test" };
      const _request: Omit<RequestEntry, "timestamp"> = {
        _userId: "user1",
        ip: "127.0.0.1",
        endpoint: "/api/test",
        userAgent: "test-agent"
      };

      // Use up the 60s window limit
      for (let i = 0; i < 3; i++) {
        expect(await tracker.checkAndTrackRequest(key, _request)).toHaveProperty("allowed", true);
      }

      // Next request should be blocked
      expect(await tracker.checkAndTrackRequest(key, _request)).toHaveProperty("allowed", false);
    });
  });

  describe("User and Endpoint Isolation", () => {
    it("should track different users independently", async () => {
      const user1Key: TrackingKey = { type: "user", value: "user1:/api/test" };
      const user2Key: TrackingKey = { type: "user", value: "user2:/api/test" };
      const _request1: Omit<RequestEntry, "timestamp"> = {
        _userId: "user1",
        ip: "127.0.0.1",
        endpoint: "/api/test",
        userAgent: "test-agent"
      };
      const _request2: Omit<RequestEntry, "timestamp"> = {
        _userId: "user2",
        ip: "127.0.0.1",
        endpoint: "/api/test",
        userAgent: "test-agent"
      };

      // Use up user1's limit
      for (let i = 0; i < 3; i++) {
        await tracker.checkAndTrackRequest(user1Key, _request1);
      }
      expect(await tracker.checkAndTrackRequest(user1Key, _request1)).toHaveProperty("allowed", false);

      // User2 should still be allowed
      expect(await tracker.checkAndTrackRequest(user2Key, _request2)).toHaveProperty("allowed", true);
    });

    it("should track different endpoints independently", async () => {
      const endpoint1Key: TrackingKey = { type: "user", value: "user1:/api/endpoint1" };
      const endpoint2Key: TrackingKey = { type: "user", value: "user1:/api/endpoint2" };
      const _request1: Omit<RequestEntry, "timestamp"> = {
        _userId: "user1",
        ip: "127.0.0.1",
        endpoint: "/api/endpoint1",
        userAgent: "test-agent"
      };
      const _request2: Omit<RequestEntry, "timestamp"> = {
        _userId: "user1",
        ip: "127.0.0.1",
        endpoint: "/api/endpoint2",
        userAgent: "test-agent"
      };

      // Use up endpoint1's limit
      for (let i = 0; i < 3; i++) {
        await tracker.checkAndTrackRequest(endpoint1Key, _request1);
      }
      expect(await tracker.checkAndTrackRequest(endpoint1Key, _request1)).toHaveProperty("allowed", false);

      // endpoint2 should still be allowed
      expect(await tracker.checkAndTrackRequest(endpoint2Key, _request2)).toHaveProperty("allowed", true);
    });
  });

  describe("Memory Management", () => {
    it("should report accurate statistics", async () => {
      const key1: TrackingKey = { type: "user", value: "user1:/api/test" };
      const key2: TrackingKey = { type: "user", value: "user2:/api/test" };
      const _request1: Omit<RequestEntry, "timestamp"> = {
        _userId: "user1",
        ip: "127.0.0.1",
        endpoint: "/api/test",
        userAgent: "test-agent"
      };
      const _request2: Omit<RequestEntry, "timestamp"> = {
        _userId: "user2",
        ip: "127.0.0.1",
        endpoint: "/api/test",
        userAgent: "test-agent"
      };

      // Make requests from different users
      await tracker.checkAndTrackRequest(key1, _request1);
      await tracker.checkAndTrackRequest(key1, _request1);
      await tracker.checkAndTrackRequest(key2, _request2);

      // Get memory stats instead of individual key stats
      const memoryStats = tracker.getMemoryStats();
      expect(memoryStats.totalKeys).toBe(2);
      expect(memoryStats.totalRequests).toBe(3);
    });
  });

  describe("Configuration", () => {
    it("should use default configuration when none provided", () => {
      const defaultTracker = createAbuseWindowTracker();
      expect(defaultTracker).toBeInstanceOf(AbuseWindowTracker);
      defaultTracker.destroy();
    });

    it("should respect custom configuration", async () => {
      const customConfig: SlidingWindowConfig = {
        window60s: 10,
        window10m: 20,
      };
      const customTracker = new AbuseWindowTracker(customConfig);
      const key: TrackingKey = { type: "user", value: "user1:/api/test" };
      const _request: Omit<RequestEntry, "timestamp"> = {
        _userId: "user1",
        ip: "127.0.0.1",
        endpoint: "/api/test",
        userAgent: "test-agent"
      };

      // Should allow more requests with higher limits
      for (let i = 0; i < 10; i++) {
        expect(await customTracker.checkAndTrackRequest(key, _request)).toHaveProperty("allowed", true);
      }
      expect(await customTracker.checkAndTrackRequest(key, _request)).toHaveProperty("allowed", false);

      customTracker.destroy();
    });

    it("should provide default configuration", () => {
      const defaultConfig = getDefaultAbuseConfig();
      expect(defaultConfig).toHaveProperty("window60s");
      expect(defaultConfig).toHaveProperty("window10m");
      expect(typeof defaultConfig.window60s).toBe("number");
      expect(typeof defaultConfig.window10m).toBe("number");
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid successive requests", async () => {
      const key: TrackingKey = { type: "user", value: "user1:/api/test" };
      const _request: Omit<RequestEntry, "timestamp"> = {
        _userId: "user1",
        ip: "127.0.0.1",
        endpoint: "/api/test",
        userAgent: "test-agent"
      };

      // Make rapid requests
      const results = [];
      for (let i = 0; i < 5; i++) {
        const result = await tracker.checkAndTrackRequest(key, _request);
        results.push(result.allowed);
      }

      // First 3 should be allowed, rest blocked
      expect(results.slice(0, 3)).toEqual([true, true, true]);
      expect(results.slice(3)).toEqual([false, false]);
    });

    it("should handle empty user ID", async () => {
      const key: TrackingKey = { type: "user", value: ":/api/test" };
      const _request: Omit<RequestEntry, "timestamp"> = {
        _userId: "",
        ip: "127.0.0.1",
        endpoint: "/api/test",
        userAgent: "test-agent"
      };
      expect(await tracker.checkAndTrackRequest(key, _request)).toHaveProperty("allowed", true);
    });

    it("should handle empty endpoint", async () => {
      const key: TrackingKey = { type: "user", value: "user1:" };
      const _request: Omit<RequestEntry, "timestamp"> = {
        _userId: "user1",
        ip: "127.0.0.1",
        endpoint: "",
        userAgent: "test-agent"
      };
      expect(await tracker.checkAndTrackRequest(key, _request)).toHaveProperty("allowed", true);
    });

    it("should handle special characters in keys", async () => {
      const key: TrackingKey = { 
        type: "user", 
        value: "user@email.com:/api/test?param=value&other=123" 
      };
      const _request: Omit<RequestEntry, "timestamp"> = {
        _userId: "user@email.com",
        ip: "127.0.0.1",
        endpoint: "/api/test?param=value&other=123",
        userAgent: "test-agent"
      };
      expect(await tracker.checkAndTrackRequest(key, _request)).toHaveProperty("allowed", true);
    });
  });

  describe("Cleanup and Destruction", () => {
    it("should clean up resources on destroy", async () => {
      const key: TrackingKey = { type: "user", value: "user1:/api/test" };
      const _request: Omit<RequestEntry, "timestamp"> = {
        _userId: "user1",
        ip: "127.0.0.1",
        endpoint: "/api/test",
        userAgent: "test-agent"
      };
      await tracker.checkAndTrackRequest(key, _request);

      const statsBeforeDestroy = tracker.getStats();
      expect(statsBeforeDestroy.activeKeys).toBeGreaterThan(0);

      tracker.destroy();

      // After destruction, stats should show no active data
      const statsAfterDestroy = tracker.getStats();
      expect(statsAfterDestroy.activeKeys).toBe(0);
      expect(statsAfterDestroy.totalRequests).toBe(0);
    });

    it("should handle multiple destroy calls gracefully", () => {
      tracker.destroy();
      tracker.destroy(); // Second call should not throw
      tracker.destroy(); // Third call should not throw
    });
  });
});