/**
 * Tests for Abuse Sliding Window Tracker (T018)
 * Tests rate limiting, sliding window behavior, and memory management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  AbuseWindowTracker,
  createAbuseWindowTracker,
  getDefaultAbuseConfig,
  type SlidingWindowConfig,
  type TrackingKey,
  type RequestEntry,
} from "./abuseWindow.js";

describe("AbuseWindowTracker", () => {
  let tracker: AbuseWindowTracker;
  let config: SlidingWindowConfig;

  beforeEach(() => {
    config = {
      window60s: 3, // Lower limits for testing
      window10m: 5,
    };
    tracker = new AbuseWindowTracker(config);
    vi.useFakeTimers();
  });

  afterEach(() => {
    tracker.destroy();
    vi.useRealTimers();
  });

  describe("Basic Rate Limiting", () => {
    it("should allow requests within limits", () => {
      const key: TrackingKey = { userId: "user1", endpoint: "/api/test" };

      // First 3 requests should be allowed (within 60s window limit)
      expect(tracker.isAllowed(key)).toBe(true);
      expect(tracker.isAllowed(key)).toBe(true);
      expect(tracker.isAllowed(key)).toBe(true);
    });

    it("should block requests exceeding 60s window", () => {
      const key: TrackingKey = { userId: "user1", endpoint: "/api/test" };

      // Use up the 60s window limit
      for (let i = 0; i < 3; i++) {
        expect(tracker.isAllowed(key)).toBe(true);
      }

      // Next request should be blocked
      expect(tracker.isAllowed(key)).toBe(false);
    });

    it("should block requests exceeding 10m window", () => {
      const key: TrackingKey = { userId: "user1", endpoint: "/api/test" };

      // Advance time to bypass 60s window but stay within 10m
      vi.advanceTimersByTime(61000); // 61 seconds

      // Use up the 10m window limit
      for (let i = 0; i < 5; i++) {
        tracker.isAllowed(key); // Don't check result, just register
        vi.advanceTimersByTime(61000); // Advance to avoid 60s limit
      }

      // Next request should be blocked by 10m window
      expect(tracker.isAllowed(key)).toBe(false);
    });
  });

  describe("Sliding Window Behavior", () => {
    it("should allow requests after time window expires", () => {
      const key: TrackingKey = { userId: "user1", endpoint: "/api/test" };

      // Use up the 60s window limit
      for (let i = 0; i < 3; i++) {
        tracker.isAllowed(key);
      }
      expect(tracker.isAllowed(key)).toBe(false);

      // Advance time past 60s window
      vi.advanceTimersByTime(61000);

      // Should allow requests again
      expect(tracker.isAllowed(key)).toBe(true);
    });

    it("should properly slide the window as time advances", () => {
      const key: TrackingKey = { userId: "user1", endpoint: "/api/test" };

      // Make first request
      tracker.isAllowed(key);
      
      // Advance time by 30 seconds and make second request
      vi.advanceTimersByTime(30000);
      tracker.isAllowed(key);
      
      // Advance time by another 30 seconds (total 60s from first request)
      vi.advanceTimersByTime(30000);
      tracker.isAllowed(key);
      
      // At this point, we've made 3 requests, should be at limit
      expect(tracker.isAllowed(key)).toBe(false);
      
      // Advance time by 1 more second (61s from first request)
      // The first request should now be outside the 60s window
      vi.advanceTimersByTime(1000);
      
      // Should allow request again
      expect(tracker.isAllowed(key)).toBe(true);
    });
  });

  describe("User and Endpoint Isolation", () => {
    it("should track different users independently", () => {
      const user1Key: TrackingKey = { userId: "user1", endpoint: "/api/test" };
      const user2Key: TrackingKey = { userId: "user2", endpoint: "/api/test" };

      // Use up user1's limit
      for (let i = 0; i < 3; i++) {
        tracker.isAllowed(user1Key);
      }
      expect(tracker.isAllowed(user1Key)).toBe(false);

      // User2 should still be allowed
      expect(tracker.isAllowed(user2Key)).toBe(true);
    });

    it("should track different endpoints independently", () => {
      const endpoint1Key: TrackingKey = { userId: "user1", endpoint: "/api/endpoint1" };
      const endpoint2Key: TrackingKey = { userId: "user1", endpoint: "/api/endpoint2" };

      // Use up endpoint1's limit
      for (let i = 0; i < 3; i++) {
        tracker.isAllowed(endpoint1Key);
      }
      expect(tracker.isAllowed(endpoint1Key)).toBe(false);

      // endpoint2 should still be allowed
      expect(tracker.isAllowed(endpoint2Key)).toBe(true);
    });
  });

  describe("Memory Management", () => {
    it("should clean up old entries automatically", () => {
      const key: TrackingKey = { userId: "user1", endpoint: "/api/test" };

      // Make some requests
      tracker.isAllowed(key);
      tracker.isAllowed(key);

      // Get initial memory usage
      const initialStats = tracker.getStats();
      expect(initialStats.activeKeys).toBeGreaterThan(0);

      // Advance time far enough that all entries should be cleaned up
      vi.advanceTimersByTime(11 * 60 * 1000); // 11 minutes

      // Make a request to trigger cleanup
      tracker.isAllowed(key);

      // Check that old entries were cleaned up
      const finalStats = tracker.getStats();
      expect(finalStats.totalRequests).toBe(1); // Only the new request should remain
    });

    it("should report accurate statistics", () => {
      const key1: TrackingKey = { userId: "user1", endpoint: "/api/test" };
      const key2: TrackingKey = { userId: "user2", endpoint: "/api/test" };

      // Make requests from different users
      tracker.isAllowed(key1);
      tracker.isAllowed(key1);
      tracker.isAllowed(key2);

      const stats = tracker.getStats();
      expect(stats.activeKeys).toBe(2);
      expect(stats.totalRequests).toBe(3);
    });
  });

  describe("Configuration", () => {
    it("should use default configuration when none provided", () => {
      const defaultTracker = createAbuseWindowTracker();
      expect(defaultTracker).toBeInstanceOf(AbuseWindowTracker);
    });

    it("should respect custom configuration", () => {
      const customConfig: SlidingWindowConfig = {
        window60s: 10,
        window10m: 20,
      };
      const customTracker = new AbuseWindowTracker(customConfig);
      const key: TrackingKey = { userId: "user1", endpoint: "/api/test" };

      // Should allow more requests with higher limits
      for (let i = 0; i < 10; i++) {
        expect(customTracker.isAllowed(key)).toBe(true);
      }
      expect(customTracker.isAllowed(key)).toBe(false);

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
    it("should handle rapid successive requests", () => {
      const key: TrackingKey = { userId: "user1", endpoint: "/api/test" };

      // Make rapid requests
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(tracker.isAllowed(key));
      }

      // First 3 should be allowed, rest blocked
      expect(results.slice(0, 3)).toEqual([true, true, true]);
      expect(results.slice(3)).toEqual([false, false]);
    });

    it("should handle empty user ID", () => {
      const key: TrackingKey = { userId: "", endpoint: "/api/test" };
      expect(tracker.isAllowed(key)).toBe(true);
    });

    it("should handle empty endpoint", () => {
      const key: TrackingKey = { userId: "user1", endpoint: "" };
      expect(tracker.isAllowed(key)).toBe(true);
    });

    it("should handle special characters in keys", () => {
      const key: TrackingKey = { 
        userId: "user@email.com", 
        endpoint: "/api/test?param=value&other=123" 
      };
      expect(tracker.isAllowed(key)).toBe(true);
    });
  });

  describe("Cleanup and Destruction", () => {
    it("should clean up resources on destroy", () => {
      const key: TrackingKey = { userId: "user1", endpoint: "/api/test" };
      tracker.isAllowed(key);

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