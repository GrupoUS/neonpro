/**
 * Test suite for DatabasePerformanceService
 * Tests query optimization, caching, and performance monitoring functionality
 */

import { DatabasePerformanceService } from '../database-performance.service.js';
import { createSupabaseClient } from '../../client.js';

// Mock Supabase client for testing
const createMockSupabaseClient = () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  onConflict: jest.fn().mockReturnThis(),
});

describe('DatabasePerformanceService_, () => {
  let performanceService: DatabasePerformanceService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    performanceService = new DatabasePerformanceService(mockSupabase, {
      enableQueryCaching: true,
      cacheTTL: 60000, // 1 minute for tests
      slowQueryThreshold: 100,
      enablePerformanceLogging: true,
      maxCacheSize: 100,
    });
    
    // Clear cache before each test
    performanceService['cache'].clear();
    performanceService['metrics'] = [];
  });

  describe('optimizedQuery_, () => {
    it('should execute query and cache results for SELECT operations_,_async () => {
      const mockData = { id: '1', name: 'Test' };
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      });

      const result = await performanceService.optimizedQuery('test_table','select_,_async (client) => {
          const response = await client.from('test_table').select('*_);
          return response;
        },
        { cacheKey: 'test-query' }
      );

      expect(result).toEqual(mockData);
      
      // Verify cache was populated
      const cachedResult = performanceService['getFromCache']('test_table:select:test-query_);
      expect(cachedResult).toEqual(mockData);
    });

    it('should use cached results for subsequent calls_,_async () => {
      const mockData = { id: '1', name: 'Test' };
      
      // Populate cache directly
      performanceService['setToCache']('test_table:select:test-query_, mockData, 60000);

      const querySpy = jest.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await performanceService.optimizedQuery(
        'test_table_,
        'select',
        querySpy,
        { cacheKey: 'test-query' }
      );

      expect(result).toEqual(mockData);
      expect(querySpy).not.toHaveBeenCalled(); // Should not be called due to cache
    });

    it('should not cache INSERT operations_,_async () => {
      const mockData = { id: '1' };
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      });

      await performanceService.optimizedQuery('test_table','insert_,_async (client) => {
          const response = await client.from('test_table').insert({ name: 'Test_ });
          return response;
        }
      );

      // Verify cache was not populated
      const cacheSize = performanceService['cache'].size;
      expect(cacheSize).toBe(0);
    });

    it('should log performance metrics_,_async () => {
      const mockData = { id: '1', name: 'Test' };
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      });

      await performanceService.optimizedQuery('test_table','select_,_async (client) => {
          const response = await client.from('test_table').select('*_);
          return response;
        }
      );

      const metrics = performanceService.getPerformanceMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        table: 'test_table_,
        operation: 'select',
        success: true,
      });
    });

    it('should handle errors gracefully_,_async () => {
      const mockError = { message: 'Database error' };
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      await expect(_performanceService.optimizedQuery(
          'test_table','select_,_async (client) => {
            const response = await client.from('test_table').select('*_);
            return response;
          }
        )
      ).rejects.toThrow();

      const metrics = performanceService.getPerformanceMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].success).toBe(false);
    });
  });

  describe('batchInsert_, () => {
    it('should split large batches into smaller chunks_,_async () => {
      const data = Array.from({ length: 250 },(, i) => ({ id: i + 1, name: `Item ${i + 1}` }));
      
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      const result = await performanceService.batchInsert('test_table_, data, {
        batchSize: 100,
      });

      expect(result.success).toBe(250);
      expect(result.errors).toHaveLength(0);
      expect(mockSupabase.from).toHaveBeenCalledTimes(3); // 250 / 100 = 3 batches
    });

    it('should handle batch errors gracefully_,_async () => {
      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ];

      mockSupabase.from.mockReturnValue({
        insert: jest.fn()
          .mockResolvedValueOnce({ error: null }) // First batch succeeds
          .mockResolvedValueOnce({ error: { message: 'Constraint violation' } }), // Second batch fails
      });

      const result = await performanceService.batchInsert('test_table_, data, {
        batchSize: 1,
      });

      expect(result.success).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        batch: 1,
        error: 'Constraint violation',
      });
    });
  });

  describe('optimizeExpirationCheck_, () => {
    it('should perform single-operation expiration check_,_async () => {
      const mockExpiredData = [
        { id: '1' },
        { id: '2' },
        { id: '3' },
      ];

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: mockExpiredData,
          error: null,
        }),
      });

      const result = await performanceService.optimizeExpirationCheck(
        'test_table_,
        'expires_at_,
        'status',
        'ACTIVE',
        'EXPIRED'
      );

      expect(result.updatedCount).toBe(3);
      expect(result.expiredIds).toEqual(['1', '2', '3']);
    });
  });

  describe('getPerformanceStats_, () => {
    it('should calculate performance statistics correctly_,_async () => {
      // Add some test metrics
      performanceService['metrics'] = [
        { _query: 'test1', duration: 50, timestamp: new Date().toISOString(), success: true, table: 'test', operation: 'select_ },
        { _query: 'test2', duration: 150, timestamp: new Date().toISOString(), success: true, table: 'test', operation: 'select_ },
        { _query: 'test3', duration: 200, timestamp: new Date().toISOString(), success: false, table: 'test', operation: 'select_ },
      ];

      const stats = performanceService.getPerformanceStats();

      expect(stats.totalQueries).toBe(3);
      expect(stats.averageDuration).toBe(133.33333333333334); // (50 + 150 + 200) / 3
      expect(stats.slowQueries).toBe(2); // 150ms and 200ms exceed 100ms threshold
      expect(stats.errorRate).toBe(33.33333333333333); // 1 error out of 3 queries
    });

    it('should handle empty metrics_, () => {
      const stats = performanceService.getPerformanceStats();

      expect(stats.totalQueries).toBe(0);
      expect(stats.averageDuration).toBe(0);
      expect(stats.slowQueries).toBe(0);
      expect(stats.errorRate).toBe(0);
    });
  });

  describe('cache management_, () => {
    it('should clear cache entries_, () => {
      // Populate cache
      performanceService['setToCache']('key1', 'value1', 60000);
      performanceService['setToCache']('key2', 'value2', 60000);
      expect(performanceService['cache'].size).toBe(2);

      performanceService.clearCache();
      expect(performanceService['cache'].size).toBe(0);
    });

    it('should clear cache entries matching pattern_, () => {
      // Populate cache
      performanceService['setToCache']('user:1:data', 'value1', 60000);
      performanceService['setToCache']('user:2:data', 'value2', 60000);
      performanceService['setToCache']('other:key', 'value3', 60000);
      expect(performanceService['cache'].size).toBe(3);

      performanceService.clearCache('user:*');
      expect(performanceService['cache'].size).toBe(1);
      expect(performanceService['cache'].has('other:key')).toBe(true);
    });

    it('should clean up expired entries_, () => {
      // Add expired entry
      const expiredTimestamp = new Date(Date.now() - 120000).toISOString(); // 2 minutes ago
      performanceService['cache'].set('expired', {
        data: 'expired_value_,
        timestamp: expiredTimestamp,
        ttl: 60000,
        key: 'expired',
      });

      // Add valid entry
      performanceService['setToCache']('valid', 'valid_value_, 60000);
      expect(performanceService['cache'].size).toBe(2);

      performanceService.cleanup();
      expect(performanceService['cache'].size).toBe(1);
      expect(performanceService['cache'].has('valid')).toBe(true);
    });
  });

  describe('cache size management_, () => {
    it('should respect max cache size_, () => {
      const service = new DatabasePerformanceService(mockSupabase, {
        enableQueryCaching: true,
        cacheTTL: 60000,
        slowQueryThreshold: 100,
        enablePerformanceLogging: true,
        maxCacheSize: 2, // Very small cache for testing
      });

      // Add 3 items (should evict the oldest)
      service['setToCache']('key1', 'value1', 60000);
      service['setToCache']('key2', 'value2', 60000);
      service['setToCache']('key3', 'value3', 60000);

      expect(service['cache'].size).toBe(2);
      expect(service['cache'].has('key1')).toBe(false); // Should be evicted
      expect(service['cache'].has('key2')).toBe(true);
      expect(service['cache'].has('key3')).toBe(true);
    });
  });
});