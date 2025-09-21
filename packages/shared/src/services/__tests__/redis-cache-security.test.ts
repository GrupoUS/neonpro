/**
 * Security tests for Redis Cache Backend
 * Tests for JSON parsing vulnerabilities and input validation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RedisCacheBackend } from '../redis-cache-backend';
import { CacheEntry, CacheConfig, CacheDataSensitivity, CacheTier } from '../cache-management';

// Mock Redis - need to define it inline for vi.mock hoisting
vi.mock('ioredis', () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    keys: vi.fn(),
    dbsize: vi.fn(),
    info: vi.fn(),
    ping: vi.fn(),
    quit: vi.fn(),
    connect: vi.fn(),
    on: vi.fn(),
  })),
}));

describe('Redis Cache Security Tests', () => {
  let redisBackend: RedisCacheBackend;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Create cache config
    const config: CacheConfig = {
      maxSize: 1000,
      defaultTTL: 3600,
      maxTTL: 86400,
      evictionStrategy: 'lru' as any,
      maxMemoryUsage: 100 * 1024 * 1024,
      healthcareRetentionPolicy: {
        [CacheDataSensitivity.PUBLIC]: 86400,
        [CacheDataSensitivity.INTERNAL]: 3600,
        [CacheDataSensitivity.CONFIDENTIAL]: 1800,
        [CacheDataSensitivity.RESTRICTED]: 900,
      },
      complianceLevel: 'strict',
      enableAuditLogging: true,
      enableMetrics: true,
      enableHealthChecks: true,
      enableEncryption: true,
      enableCompression: true,
      enableDistributedCache: true,
      enableStaleWhileRevalidate: true,
    };

    // Create Redis backend
    redisBackend = new RedisCacheBackend(config, {
      url: 'redis://localhost:6379',
      keyPrefix: 'test:',
    });

    // Simulate successful connection
    (redisBackend as any).isConnected = true;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('JSON Parsing Security', () => {
    it('should handle malformed JSON safely', async () => {
      // Setup mock to return malformed JSON
      mockRedis.get.mockResolvedValue('{ invalid json }');

      // This should not throw an error, but should handle gracefully
      const result = await redisBackend.get('test-key');
      
      expect(result).toBeNull();
    });

    it('should handle prototype pollution attempts', async () => {
      // Simulate prototype pollution payload
      const maliciousPayload = JSON.stringify({
        key: 'test',
        createdAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        accessCount: 1,
        sensitivity: CacheDataSensitivity.INTERNAL,
        value: 'test',
        __proto__: { polluted: true },
        constructor: { prototype: { polluted: true } }
      });

      mockRedis.get.mockResolvedValue(maliciousPayload);

      const result = await redisBackend.get('test-key');
      
      // Should return null due to validation failure
      expect(result).toBeNull();
      
      // Should not pollute Object.prototype
      expect(({} as any).polluted).toBeUndefined();
    });

    it('should reject cache entries with missing required fields', async () => {
      // Missing required fields
      const incompleteEntry = JSON.stringify({
        key: 'test',
        // Missing createdAt, lastAccessedAt, accessCount, sensitivity
        value: 'test'
      });

      mockRedis.get.mockResolvedValue(incompleteEntry);

      const result = await redisBackend.get('test-key');
      
      expect(result).toBeNull();
    });

    it('should validate data types strictly', async () => {
      // Invalid data types
      const invalidTypesEntry = JSON.stringify({
        key: 'test',
        createdAt: 'not-a-date',
        lastAccessedAt: 'not-a-date',
        accessCount: 'not-a-number',
        sensitivity: 'invalid-sensitivity',
        value: 'test'
      });

      mockRedis.get.mockResolvedValue(invalidTypesEntry);

      const result = await redisBackend.get('test-key');
      
      expect(result).toBeNull();
    });

    it('should handle JSON parsing errors gracefully', async () => {
      // Setup mock to throw JSON parsing error
      mockRedis.get.mockResolvedValue('unclosed json string {');

      const result = await redisBackend.get('test-key');
      
      expect(result).toBeNull();
    });

    it('should validate nested objects in healthcare context', async () => {
      // Invalid healthcare context
      const invalidHealthcareEntry = JSON.stringify({
        key: 'test',
        createdAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        accessCount: 1,
        sensitivity: CacheDataSensitivity.RESTRICTED,
        value: 'test',
        healthcareContext: {
          patientId: 123, // Should be string
          dataClassification: 'invalid-classification'
        }
      });

      mockRedis.get.mockResolvedValue(invalidHealthcareEntry);

      const result = await redisBackend.get('test-key');
      
      expect(result).toBeNull();
    });

    it('should validate enum values strictly', async () => {
      // Invalid enum values
      const invalidEnumEntry = JSON.stringify({
        key: 'test',
        createdAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        accessCount: 1,
        sensitivity: 'INVALID_SENSITIVITY', // Invalid enum value
        tier: 'INVALID_TIER', // Invalid enum value
        value: 'test'
      });

      mockRedis.get.mockResolvedValue(invalidEnumEntry);

      const result = await redisBackend.get('test-key');
      
      expect(result).toBeNull();
    });
  });

  describe('Input Validation Security', () => {
    it('should validate cache keys against injection', async () => {
      // Potential Redis command injection
      const maliciousKey = 'test*; FLUSHALL; test';
      
      await expect(redisBackend.get(maliciousKey)).resolves.not.toThrow();
      
      // Should sanitize the key properly
      expect(mockRedis.get).toHaveBeenCalledWith(
        expect.stringMatching(/^[a-f0-9:]+$/) // Only hex and colon characters
      );
    });

    it('should handle special characters in keys', async () => {
      const specialCharKey = 'test/key@user#id';
      
      await redisBackend.get(specialCharKey);
      
      // Should hash special characters properly
      expect(mockRedis.get).toHaveBeenCalledWith(
        expect.stringMatching(/^[a-f0-9:]+$/)
      );
    });

    it('should validate TTL values', async () => {
      const entry: CacheEntry = {
        key: 'test',
        value: 'test',
        createdAt: new Date(),
        lastAccessedAt: new Date(),
        accessCount: 1,
        sensitivity: CacheDataSensitivity.INTERNAL,
        ttl: -1, // Invalid negative TTL
      };

      await expect(redisBackend.set('test', entry)).resolves.not.toThrow();
      
      // Should normalize invalid TTL to default
      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Number), // Should be positive
        expect.any(String)
      );
    });
  });

  describe('Memory Safety', () => {
    it('should handle circular references gracefully', async () => {
      // Create object with circular reference
      const circularObj: any = { key: 'test' };
      circularObj.self = circularObj;

      const entry: CacheEntry = {
        key: 'test',
        value: circularObj,
        createdAt: new Date(),
        lastAccessedAt: new Date(),
        accessCount: 1,
        sensitivity: CacheDataSensitivity.INTERNAL,
      };

      // Should handle circular reference without infinite recursion
      await expect(redisBackend.set('test', entry)).resolves.not.toThrow();
    });

    it('should prevent memory leaks from large objects', async () => {
      // Create a very large object
      const largeObject = {
        key: 'test',
        value: Array(10000).fill('large-data'),
        createdAt: new Date(),
        lastAccessedAt: new Date(),
        accessCount: 1,
        sensitivity: CacheDataSensitivity.INTERNAL,
      };

      // Should handle large object without memory issues
      await expect(redisBackend.set('test', largeObject as any)).resolves.not.toThrow();
    });
  });
});