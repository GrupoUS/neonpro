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
    it(_"should allow requests within limits",_async () => {
      const key: TrackingKey = { type: "ip", value: "192.168.1.1" };
      const request = {
        ip: "192.168.1.1",
        endpoint: "/api/test",
        userAgent: "test-agent",
      };

      // First request should be allowed
      const result1 = await tracker.checkAndTrackRequest(key, _request);
      expect(result1.allowed).toBe(true);
      expect(result1.remainingRequests).toBe(2); // 3 - 1
      expect(result1.currentRequests).toBe(1);

      // Second request should be allowed
      const result2 = await tracker.checkAndTrackRequest(key, _request);
      expect(result2.allowed).toBe(true);
      expect(result2.remainingRequests).toBe(1); // 3 - 2
      expect(result2.currentRequests).toBe(2);
    });

    it(_"should block requests when 60s limit exceeded",_async () => {
      const key: TrackingKey = { type: "ip", value: "192.168.1.1" };
      const request = {
        ip: "192.168.1.1",
        endpoint: "/api/test",
      };

      // Make 3 requests (at the limit)
      for (let i = 0; i < 3; i++) {
        const result = await tracker.checkAndTrackRequest(key, _request);
        expect(result.allowed).toBe(true);
      }

      // 4th request should be blocked
      const result = await tracker.checkAndTrackRequest(key, _request);
      expect(result.allowed).toBe(false);
      expect(result.windowType).toBe("60s");
      expect(result.limit).toBe(3);
      expect(result.currentRequests).toBe(3);
    });

    it(_"should block requests when 10m limit exceeded",_async () => {
      const key: TrackingKey = { type: "user", value: "user123" };
      const request = {
        ip: "192.168.1.1",
        endpoint: "/api/test",
        _userId: "user123",
      };

      // Make 5 requests over time (within 60s limit but at 10m limit)
      for (let i = 0; i < 5; i++) {
        vi.advanceTimersByTime(70 * 1000); // 70 seconds between requests
        const result = await tracker.checkAndTrackRequest(key, _request);
        expect(result.allowed).toBe(true);
      }

      // 6th request should be blocked by 10m window
      vi.advanceTimersByTime(70 * 1000);
      const result = await tracker.checkAndTrackRequest(key, _request);
      expect(result.allowed).toBe(false);
      expect(result.windowType).toBe("10m");
      expect(result.limit).toBe(5);
    });
  });

  describe("Sliding Window Behavior", () => {
    it(_"should allow requests after 60s window slides",_async () => {
      const key: TrackingKey = { type: "ip", value: "192.168.1.1" };
      const request = {
        ip: "192.168.1.1",
        endpoint: "/api/test",
      };

      // Fill up the 60s window
      for (let i = 0; i < 3; i++) {
        const result = await tracker.checkAndTrackRequest(key, _request);
        expect(result.allowed).toBe(true);
      }

      // Should be blocked
      const blockedResult = await tracker.checkAndTrackRequest(key, _request);
      expect(blockedResult.allowed).toBe(false);

      // Advance time by 61 seconds
      vi.advanceTimersByTime(61 * 1000);

      // Should be allowed again
      const allowedResult = await tracker.checkAndTrackRequest(key, _request);
      expect(allowedResult.allowed).toBe(true);
    });

    it(_"should handle partial window sliding correctly",_async () => {
      const key: TrackingKey = { type: "ip", value: "192.168.1.1" };
      const request = {
        ip: "192.168.1.1",
        endpoint: "/api/test",
      };

      // Make 2 requests
      await tracker.checkAndTrackRequest(key, _request);
      await tracker.checkAndTrackRequest(key, _request);

      // Wait 30 seconds
      vi.advanceTimersByTime(30 * 1000);

      // Make 1 more request (total: 3, should be allowed)
      const result1 = await tracker.checkAndTrackRequest(key, _request);
      expect(result1.allowed).toBe(true);

      // 4th request should be blocked
      const result2 = await tracker.checkAndTrackRequest(key, _request);
      expect(result2.allowed).toBe(false);

      // Wait another 31 seconds (61 total)
      vi.advanceTimersByTime(31 * 1000);

      // First 2 requests should be out of window, should be allowed
      const result3 = await tracker.checkAndTrackRequest(key, _request);
      expect(result3.allowed).toBe(true);
    });
  });

  describe("Key Isolation", () => {
    it(_"should track different IPs separately",_async () => {
      const key1: TrackingKey = { type: "ip", value: "192.168.1.1" };
      const key2: TrackingKey = { type: "ip", value: "192.168.1.2" };
      const request1 = { ip: "192.168.1.1", endpoint: "/api/test" };
      const request2 = { ip: "192.168.1.2", endpoint: "/api/test" };

      // Fill up limit for first IP
      for (let i = 0; i < 3; i++) {
        const result = await tracker.checkAndTrackRequest(key1, request1);
        expect(result.allowed).toBe(true);
      }

      // First IP should be blocked
      const blocked = await tracker.checkAndTrackRequest(key1, request1);
      expect(blocked.allowed).toBe(false);

      // Second IP should still be allowed
      const allowed = await tracker.checkAndTrackRequest(key2, request2);
      expect(allowed.allowed).toBe(true);
    });

    it(_"should track users and IPs separately",_async () => {
      const ipKey: TrackingKey = { type: "ip", value: "192.168.1.1" };
      const userKey: TrackingKey = { type: "user", value: "user123" };
      const ipRequest = { ip: "192.168.1.1", endpoint: "/api/test" };
      const userRequest = {
        ip: "192.168.1.1",
        endpoint: "/api/test",
        _userId: "user123",
      };

      // Fill up IP limit
      for (let i = 0; i < 3; i++) {
        await tracker.checkAndTrackRequest(ipKey, ipRequest);
      }

      // IP should be blocked
      const ipBlocked = await tracker.checkAndTrackRequest(ipKey, ipRequest);
      expect(ipBlocked.allowed).toBe(false);

      // User should still be allowed (different tracking key)
      const userAllowed = await tracker.checkAndTrackRequest(
        userKey,
        userRequest,
      );
      expect(userAllowed.allowed).toBe(true);
    });
  });

  describe("Statistics and Monitoring", () => {
    it(_"should provide accurate statistics",_async () => {
      const key: TrackingKey = { type: "ip", value: "192.168.1.1" };
      const request = { ip: "192.168.1.1", endpoint: "/api/test" };

      // Make some requests
      await tracker.checkAndTrackRequest(key, _request);
      vi.advanceTimersByTime(30 * 1000);
      await tracker.checkAndTrackRequest(key, _request);
      vi.advanceTimersByTime(70 * 1000); // Now at 100s
      await tracker.checkAndTrackRequest(key, _request);

      const stats = tracker.getStats(key);
      expect(stats.requests60s).toBe(1); // Only the last request in 60s window
      expect(stats.requests10m).toBe(3); // All requests in 10m window
      expect(stats.totalRequests).toBe(3);
      expect(stats.oldestRequest).toBeDefined();
      expect(stats.newestRequest).toBeDefined();
    });

    it(_"should provide memory usage statistics",_async () => {
      const key1: TrackingKey = { type: "ip", value: "192.168.1.1" };
      const key2: TrackingKey = { type: "ip", value: "192.168.1.2" };
      const request = { ip: "192.168.1.1", endpoint: "/api/test" };

      await tracker.checkAndTrackRequest(key1, _request);
      await tracker.checkAndTrackRequest(key2, _request);

      const memStats = tracker.getMemoryStats();
      expect(memStats.totalKeys).toBe(2);
      expect(memStats.totalRequests).toBe(2);
      expect(memStats.averageRequestsPerKey).toBe(1);
      expect(memStats.memoryEstimateKB).toBeGreaterThan(0);
    });
  });

  describe("Read-only Operations", () => {
    it(_"should check without tracking",_async () => {
      const key: TrackingKey = { type: "ip", value: "192.168.1.1" };
      const request = { ip: "192.168.1.1", endpoint: "/api/test" };

      // Check without tracking - should be allowed
      const result1 = await tracker.checkRequest(key);
      expect(result1.allowed).toBe(true);
      expect(result1.currentRequests).toBe(0);

      // Track one request
      await tracker.checkAndTrackRequest(key, _request);

      // Check without tracking - should show current state
      const result2 = await tracker.checkRequest(key);
      expect(result2.allowed).toBe(true);
      expect(result2.currentRequests).toBe(1);
    });
  });

  describe("Configuration Management", () => {
    it("should update configuration dynamically", () => {
      const newConfig = { window60s: 10, window10m: 20 };
      tracker.updateConfig(newConfig);

      const updatedConfig = tracker.getConfig();
      expect(updatedConfig.window60s).toBe(10);
      expect(updatedConfig.window10m).toBe(20);
    });

    it("should get default configuration", () => {
      const defaultConfig = getDefaultAbuseConfig();
      expect(defaultConfig.window60s).toBe(12);
      expect(defaultConfig.window10m).toBe(5);
    });
  });

  describe("Reset Operations", () => {
    it(_"should reset specific key",_async () => {
      const key: TrackingKey = { type: "ip", value: "192.168.1.1" };
      const request = { ip: "192.168.1.1", endpoint: "/api/test" };

      // Make requests to hit limit
      for (let i = 0; i < 3; i++) {
        await tracker.checkAndTrackRequest(key, _request);
      }

      // Should be blocked
      const blocked = await tracker.checkAndTrackRequest(key, _request);
      expect(blocked.allowed).toBe(false);

      // Reset the key
      tracker.resetKey(key);

      // Should be allowed again
      const allowed = await tracker.checkAndTrackRequest(key, _request);
      expect(allowed.allowed).toBe(true);
    });

    it(_"should reset all tracking data",_async () => {
      const key1: TrackingKey = { type: "ip", value: "192.168.1.1" };
      const key2: TrackingKey = { type: "ip", value: "192.168.1.2" };
      const request = { ip: "192.168.1.1", endpoint: "/api/test" };

      await tracker.checkAndTrackRequest(key1, _request);
      await tracker.checkAndTrackRequest(key2, _request);

      const statsBefore = tracker.getMemoryStats();
      expect(statsBefore.totalKeys).toBe(2);

      tracker.resetAll();

      const statsAfter = tracker.getMemoryStats();
      expect(statsAfter.totalKeys).toBe(0);
      expect(statsAfter.totalRequests).toBe(0);
    });
  });

  describe("Factory Functions", () => {
    it("should create tracker with factory function", () => {
      const customConfig = { window60s: 20, window10m: 50 };
      const factoryTracker = createAbuseWindowTracker(customConfig);

      expect(factoryTracker).toBeInstanceOf(AbuseWindowTracker);
      expect(factoryTracker.getConfig()).toEqual(customConfig);

      factoryTracker.destroy();
    });
  });
});
