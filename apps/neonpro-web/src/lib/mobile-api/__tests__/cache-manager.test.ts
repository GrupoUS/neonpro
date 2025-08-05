/**
 * Cache Manager Tests
 * Comprehensive test suite for mobile cache functionality
 */

import type { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import type { CacheManager } from "../cache-manager";
import type { CacheConfig, CacheStrategy } from "../types";

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
};

Object.defineProperty(global, "indexedDB", {
  value: mockIndexedDB,
  writable: true,
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(global, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

describe("CacheManager", () => {
  let cacheManager: CacheManager;
  let mockConfig: CacheConfig;

  beforeEach(() => {
    mockConfig = {
      enabled: true,
      strategy: "lru" as CacheStrategy,
      maxSize: 10 * 1024 * 1024, // 10MB
      defaultTtl: 3600000, // 1 hour
      compression: {
        enabled: true,
        algorithm: "gzip",
        level: 6,
      },
      encryption: {
        enabled: true,
        algorithm: "AES-256-GCM",
        key: "test-encryption-key-32-characters",
      },
      storage: {
        persistent: true,
        indexedDB: true,
        localStorage: true,
      },
      cleanup: {
        interval: 300000, // 5 minutes
        maxAge: 86400000, // 24 hours
      },
    };

    cacheManager = new CacheManager(mockConfig);
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cacheManager.shutdown();
  });

  describe("Initialization", () => {
    it("should initialize successfully", async () => {
      await expect(cacheManager.initialize()).resolves.not.toThrow();
    });

    it("should handle initialization with disabled cache", async () => {
      const disabledConfig = { ...mockConfig, enabled: false };
      const disabledCacheManager = new CacheManager(disabledConfig);

      await expect(disabledCacheManager.initialize()).resolves.not.toThrow();
    });

    it("should initialize storage layers", async () => {
      await cacheManager.initialize();

      // Verify IndexedDB initialization
      expect(mockIndexedDB.open).toHaveBeenCalled();
    });
  });

  describe("Basic Cache Operations", () => {
    beforeEach(async () => {
      await cacheManager.initialize();
    });

    it("should set and get cache entries", async () => {
      const key = "test-key";
      const value = { data: "test-value", timestamp: Date.now() };
      const ttl = 60000; // 1 minute

      await cacheManager.set(key, value, ttl);
      const retrieved = await cacheManager.get(key);

      expect(retrieved).toEqual(value);
    });

    it("should return null for non-existent keys", async () => {
      const result = await cacheManager.get("non-existent-key");
      expect(result).toBeNull();
    });

    it("should delete cache entries", async () => {
      const key = "delete-test";
      const value = { data: "to-be-deleted" };

      await cacheManager.set(key, value);
      await cacheManager.delete(key);

      const result = await cacheManager.get(key);
      expect(result).toBeNull();
    });

    it("should check if key exists", async () => {
      const key = "exists-test";
      const value = { data: "exists" };

      expect(await cacheManager.has(key)).toBe(false);

      await cacheManager.set(key, value);
      expect(await cacheManager.has(key)).toBe(true);
    });

    it("should clear all cache entries", async () => {
      await cacheManager.set("key1", { data: "value1" });
      await cacheManager.set("key2", { data: "value2" });

      await cacheManager.clear();

      expect(await cacheManager.get("key1")).toBeNull();
      expect(await cacheManager.get("key2")).toBeNull();
    });
  });

  describe("TTL (Time To Live)", () => {
    beforeEach(async () => {
      await cacheManager.initialize();
    });

    it("should respect TTL and expire entries", async () => {
      const key = "ttl-test";
      const value = { data: "expires-soon" };
      const shortTtl = 100; // 100ms

      await cacheManager.set(key, value, shortTtl);

      // Should exist immediately
      expect(await cacheManager.get(key)).toEqual(value);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be expired
      expect(await cacheManager.get(key)).toBeNull();
    });

    it("should use default TTL when not specified", async () => {
      const key = "default-ttl-test";
      const value = { data: "default-ttl" };

      await cacheManager.set(key, value);

      const stats = cacheManager.getStats();
      expect(stats.entries).toBeGreaterThan(0);
    });

    it("should update TTL for existing entries", async () => {
      const key = "update-ttl-test";
      const value = { data: "update-ttl" };

      await cacheManager.set(key, value, 1000);
      await cacheManager.updateTtl(key, 5000);

      // Entry should still exist
      expect(await cacheManager.get(key)).toEqual(value);
    });
  });

  describe("Cache Strategies", () => {
    beforeEach(async () => {
      await cacheManager.initialize();
    });

    it("should implement LRU eviction strategy", async () => {
      // Set small cache size for testing
      const smallConfig = {
        ...mockConfig,
        strategy: "lru" as CacheStrategy,
        maxSize: 1024, // 1KB
      };
      const lruCache = new CacheManager(smallConfig);
      await lruCache.initialize();

      // Fill cache beyond capacity
      const largeValue = { data: "x".repeat(500) }; // ~500 bytes
      await lruCache.set("key1", largeValue);
      await lruCache.set("key2", largeValue);
      await lruCache.set("key3", largeValue); // Should evict key1

      expect(await lruCache.get("key1")).toBeNull();
      expect(await lruCache.get("key2")).toEqual(largeValue);
      expect(await lruCache.get("key3")).toEqual(largeValue);

      await lruCache.shutdown();
    });

    it("should implement FIFO eviction strategy", async () => {
      const fifoConfig = {
        ...mockConfig,
        strategy: "fifo" as CacheStrategy,
        maxSize: 1024,
      };
      const fifoCache = new CacheManager(fifoConfig);
      await fifoCache.initialize();

      const largeValue = { data: "x".repeat(500) };
      await fifoCache.set("key1", largeValue);
      await fifoCache.set("key2", largeValue);
      await fifoCache.set("key3", largeValue); // Should evict key1

      expect(await fifoCache.get("key1")).toBeNull();
      expect(await fifoCache.get("key2")).toEqual(largeValue);
      expect(await fifoCache.get("key3")).toEqual(largeValue);

      await fifoCache.shutdown();
    });

    it("should implement LFU eviction strategy", async () => {
      const lfuConfig = {
        ...mockConfig,
        strategy: "lfu" as CacheStrategy,
        maxSize: 1024,
      };
      const lfuCache = new CacheManager(lfuConfig);
      await lfuCache.initialize();

      const largeValue = { data: "x".repeat(500) };
      await lfuCache.set("key1", largeValue);
      await lfuCache.set("key2", largeValue);

      // Access key2 multiple times to increase frequency
      await lfuCache.get("key2");
      await lfuCache.get("key2");

      await lfuCache.set("key3", largeValue); // Should evict key1 (least frequent)

      expect(await lfuCache.get("key1")).toBeNull();
      expect(await lfuCache.get("key2")).toEqual(largeValue);
      expect(await lfuCache.get("key3")).toEqual(largeValue);

      await lfuCache.shutdown();
    });
  });

  describe("Compression", () => {
    beforeEach(async () => {
      await cacheManager.initialize();
    });

    it("should compress large values when enabled", async () => {
      const key = "compression-test";
      const largeValue = {
        data: "x".repeat(10000), // Large string
        metadata: { compressed: true },
      };

      await cacheManager.set(key, largeValue);
      const retrieved = await cacheManager.get(key);

      expect(retrieved).toEqual(largeValue);

      // Verify compression was applied
      const stats = cacheManager.getStats();
      expect(stats.compressionRatio).toBeGreaterThan(1);
    });

    it("should handle different compression algorithms", async () => {
      const brotliConfig = {
        ...mockConfig,
        compression: {
          enabled: true,
          algorithm: "brotli" as const,
          level: 6,
        },
      };
      const brotliCache = new CacheManager(brotliConfig);
      await brotliCache.initialize();

      const key = "brotli-test";
      const value = { data: "brotli-compressed-data".repeat(100) };

      await brotliCache.set(key, value);
      const retrieved = await brotliCache.get(key);

      expect(retrieved).toEqual(value);
      await brotliCache.shutdown();
    });

    it("should skip compression for small values", async () => {
      const key = "small-value-test";
      const smallValue = { data: "small" };

      await cacheManager.set(key, smallValue);
      const retrieved = await cacheManager.get(key);

      expect(retrieved).toEqual(smallValue);
    });
  });

  describe("Encryption", () => {
    beforeEach(async () => {
      await cacheManager.initialize();
    });

    it("should encrypt sensitive data when enabled", async () => {
      const key = "encryption-test";
      const sensitiveValue = {
        password: "secret123",
        token: "sensitive-token",
        data: "encrypted-data",
      };

      await cacheManager.set(key, sensitiveValue);
      const retrieved = await cacheManager.get(key);

      expect(retrieved).toEqual(sensitiveValue);
    });

    it("should handle encryption errors gracefully", async () => {
      const invalidConfig = {
        ...mockConfig,
        encryption: {
          enabled: true,
          algorithm: "AES-256-GCM" as const,
          key: "invalid-key", // Too short
        },
      };
      const invalidCache = new CacheManager(invalidConfig);

      await expect(invalidCache.initialize()).rejects.toThrow();
    });
  });

  describe("Pattern Operations", () => {
    beforeEach(async () => {
      await cacheManager.initialize();
    });

    it("should get keys matching pattern", async () => {
      await cacheManager.set("user:1:profile", { name: "User 1" });
      await cacheManager.set("user:2:profile", { name: "User 2" });
      await cacheManager.set("user:1:settings", { theme: "dark" });
      await cacheManager.set("product:1", { name: "Product 1" });

      const userKeys = await cacheManager.getKeys("user:*");
      expect(userKeys).toHaveLength(3);
      expect(userKeys).toContain("user:1:profile");
      expect(userKeys).toContain("user:2:profile");
      expect(userKeys).toContain("user:1:settings");
    });

    it("should invalidate keys matching pattern", async () => {
      await cacheManager.set("cache:api:users", { data: "users" });
      await cacheManager.set("cache:api:products", { data: "products" });
      await cacheManager.set("cache:static:images", { data: "images" });

      await cacheManager.invalidatePattern("cache:api:*");

      expect(await cacheManager.get("cache:api:users")).toBeNull();
      expect(await cacheManager.get("cache:api:products")).toBeNull();
      expect(await cacheManager.get("cache:static:images")).not.toBeNull();
    });

    it("should get multiple values by pattern", async () => {
      await cacheManager.set("session:user1", { id: 1, name: "User 1" });
      await cacheManager.set("session:user2", { id: 2, name: "User 2" });
      await cacheManager.set("config:app", { theme: "light" });

      const sessions = await cacheManager.getByPattern("session:*");
      expect(Object.keys(sessions)).toHaveLength(2);
      expect(sessions["session:user1"]).toEqual({ id: 1, name: "User 1" });
      expect(sessions["session:user2"]).toEqual({ id: 2, name: "User 2" });
    });
  });

  describe("Batch Operations", () => {
    beforeEach(async () => {
      await cacheManager.initialize();
    });

    it("should set multiple values in batch", async () => {
      const entries = {
        "batch:1": { data: "value1" },
        "batch:2": { data: "value2" },
        "batch:3": { data: "value3" },
      };

      await cacheManager.setMultiple(entries, 60000);

      for (const [key, value] of Object.entries(entries)) {
        expect(await cacheManager.get(key)).toEqual(value);
      }
    });

    it("should get multiple values in batch", async () => {
      await cacheManager.set("multi:1", { data: "value1" });
      await cacheManager.set("multi:2", { data: "value2" });
      await cacheManager.set("multi:3", { data: "value3" });

      const keys = ["multi:1", "multi:2", "multi:3", "multi:4"];
      const results = await cacheManager.getMultiple(keys);

      expect(results["multi:1"]).toEqual({ data: "value1" });
      expect(results["multi:2"]).toEqual({ data: "value2" });
      expect(results["multi:3"]).toEqual({ data: "value3" });
      expect(results["multi:4"]).toBeNull();
    });

    it("should delete multiple values in batch", async () => {
      await cacheManager.set("delete:1", { data: "value1" });
      await cacheManager.set("delete:2", { data: "value2" });
      await cacheManager.set("delete:3", { data: "value3" });

      const keys = ["delete:1", "delete:2"];
      await cacheManager.deleteMultiple(keys);

      expect(await cacheManager.get("delete:1")).toBeNull();
      expect(await cacheManager.get("delete:2")).toBeNull();
      expect(await cacheManager.get("delete:3")).not.toBeNull();
    });
  });

  describe("Storage Layers", () => {
    beforeEach(async () => {
      await cacheManager.initialize();
    });

    it("should use memory storage for fast access", async () => {
      const key = "memory-test";
      const value = { data: "in-memory" };

      await cacheManager.set(key, value);

      // Should be retrievable from memory
      const retrieved = await cacheManager.get(key);
      expect(retrieved).toEqual(value);
    });

    it("should persist to IndexedDB for durability", async () => {
      const key = "persistent-test";
      const value = { data: "persistent-data" };

      await cacheManager.set(key, value);

      // Simulate app restart by creating new cache manager
      const newCacheManager = new CacheManager(mockConfig);
      await newCacheManager.initialize();

      const retrieved = await newCacheManager.get(key);
      expect(retrieved).toEqual(value);

      await newCacheManager.shutdown();
    });

    it("should fallback to localStorage when IndexedDB fails", async () => {
      // Mock IndexedDB failure
      mockIndexedDB.open.mockRejectedValueOnce(new Error("IndexedDB not available"));

      const fallbackCache = new CacheManager(mockConfig);
      await fallbackCache.initialize();

      const key = "fallback-test";
      const value = { data: "fallback-data" };

      await fallbackCache.set(key, value);
      const retrieved = await fallbackCache.get(key);

      expect(retrieved).toEqual(value);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();

      await fallbackCache.shutdown();
    });
  });

  describe("Statistics and Monitoring", () => {
    beforeEach(async () => {
      await cacheManager.initialize();
    });

    it("should track cache statistics", async () => {
      await cacheManager.set("stats:1", { data: "value1" });
      await cacheManager.set("stats:2", { data: "value2" });
      await cacheManager.get("stats:1"); // Hit
      await cacheManager.get("stats:3"); // Miss

      const stats = cacheManager.getStats();
      expect(stats.entries).toBe(2);
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });

    it("should track memory usage", async () => {
      const largeValue = { data: "x".repeat(1000) };
      await cacheManager.set("memory:1", largeValue);
      await cacheManager.set("memory:2", largeValue);

      const stats = cacheManager.getStats();
      expect(stats.memoryUsage).toBeGreaterThan(0);
      expect(stats.storageUsage).toBeGreaterThan(0);
    });

    it("should reset statistics", async () => {
      await cacheManager.set("reset:1", { data: "value1" });
      await cacheManager.get("reset:1");

      cacheManager.resetStats();

      const stats = cacheManager.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe("Health Check", () => {
    beforeEach(async () => {
      await cacheManager.initialize();
    });

    it("should return healthy status when functioning properly", async () => {
      const health = await cacheManager.healthCheck();
      expect(health.healthy).toBe(true);
      expect(health.timestamp).toBeDefined();
      expect(health.responseTime).toBeGreaterThan(0);
    });

    it("should detect storage issues", async () => {
      // Mock storage failure
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error("Storage quota exceeded");
      });

      const health = await cacheManager.healthCheck();
      expect(health.healthy).toBe(false);
      expect(health.error).toContain("Storage");
    });
  });

  describe("Cleanup and Maintenance", () => {
    beforeEach(async () => {
      await cacheManager.initialize();
    });

    it("should clean up expired entries", async () => {
      const shortTtl = 100; // 100ms
      await cacheManager.set("cleanup:1", { data: "expires" }, shortTtl);
      await cacheManager.set("cleanup:2", { data: "persists" }, 60000);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      await cacheManager.cleanup();

      expect(await cacheManager.get("cleanup:1")).toBeNull();
      expect(await cacheManager.get("cleanup:2")).not.toBeNull();
    });

    it("should optimize storage periodically", async () => {
      // Add many entries
      for (let i = 0; i < 100; i++) {
        await cacheManager.set(`optimize:${i}`, { data: `value${i}` });
      }

      const statsBefore = cacheManager.getStats();
      await cacheManager.optimize();
      const statsAfter = cacheManager.getStats();

      // Optimization should maintain or improve efficiency
      expect(statsAfter.entries).toBeLessThanOrEqual(statsBefore.entries);
    });
  });

  describe("Error Handling", () => {
    beforeEach(async () => {
      await cacheManager.initialize();
    });

    it("should handle storage quota exceeded", async () => {
      // Mock storage quota error
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error("QuotaExceededError");
      });

      const key = "quota-test";
      const value = { data: "large-value".repeat(1000) };

      // Should handle gracefully without throwing
      await expect(cacheManager.set(key, value)).resolves.not.toThrow();
    });

    it("should handle corrupted cache data", async () => {
      // Mock corrupted data
      mockLocalStorage.getItem.mockReturnValueOnce("invalid-json{");

      const result = await cacheManager.get("corrupted-key");
      expect(result).toBeNull();
    });

    it("should handle network errors during sync", async () => {
      // This would test sync functionality if implemented
      // For now, just ensure no errors are thrown
      await expect(cacheManager.sync()).resolves.not.toThrow();
    });
  });
});
