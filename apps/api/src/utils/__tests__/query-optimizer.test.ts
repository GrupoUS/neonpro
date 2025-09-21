/**
 * Query Optimizer Tests
 * T079 - Backend API Performance Optimization
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HEALTHCARE_POOL_CONFIG, QueryPerformanceMonitor } from '../query-optimizer';

describe(_'Query Optimizer',_() => {
  let monitor: QueryPerformanceMonitor;

  beforeEach(_() => {
    monitor = new QueryPerformanceMonitor();
    vi.clearAllMocks();
  });

  afterEach(_() => {
    monitor.clearMetrics();
  });

  describe(_'QueryPerformanceMonitor',_() => {
    it(_'should record query metrics',_() => {
      const metrics = {
        _query: 'SELECT * FROM patients WHERE id = $1',
        duration: 45,
        rowsAffected: 1,
        timestamp: new Date(),
        endpoint: '/api/patients/123',
        _userId: 'user123',
        clinicId: 'clinic456',
      };

      monitor.recordQuery(metrics);
      const stats = monitor.getStats();

      expect(stats.totalQueries).toBe(1);
      expect(stats.averageDuration).toBe(45);
      expect(stats.slowQueries).toBe(0);
    });

    it(_'should identify slow queries',_() => {
      const slowQuery = {
        _query: 'SELECT * FROM appointments WHERE date > $1',
        duration: 1500, // Above slow query threshold (1000ms)
        rowsAffected: 100,
        timestamp: new Date(),
        endpoint: '/api/appointments',
        _userId: 'user123',
        clinicId: 'clinic456',
      };

      monitor.recordQuery(slowQuery);
      const stats = monitor.getStats();

      expect(stats.totalQueries).toBe(1);
      expect(stats.slowQueries).toBe(1);
      expect(stats.slowQueryRate).toBe(100);
    });

    it(_'should track query frequency',_() => {
      // Add multiple queries
      monitor.recordQuery({
        _query: 'SELECT * FROM services',
        duration: 10,
        rowsAffected: 5,
        timestamp: new Date(),
        endpoint: '/api/services',
      });

      monitor.recordQuery({
        _query: 'SELECT * FROM patients WHERE id = $1',
        duration: 45,
        rowsAffected: 1,
        timestamp: new Date(),
        endpoint: '/api/patients/123',
      });

      const stats = monitor.getStats();
      expect(stats.totalQueries).toBe(2);
      expect(stats.queryFrequency).toBeDefined();
      expect(Object.keys(stats.queryFrequency).length).toBeGreaterThan(0);
    });

    it(_'should calculate average duration correctly',_() => {
      const baseTime = new Date();

      // Add multiple metrics with different durations
      for (let i = 0; i < 5; i++) {
        monitor.recordQuery({
          _query: `SELECT * FROM test_table_${i}`,
          duration: 100 + i * 20, // 100, 120, 140, 160, 180
          rowsAffected: 1,
          timestamp: new Date(baseTime.getTime() + i * 1000),
          endpoint: `/api/test/${i}`,
        });
      }

      const stats = monitor.getStats();
      expect(stats.totalQueries).toBe(5);
      expect(stats.averageDuration).toBe(140); // Average of 100, 120, 140, 160, 180
    });

    it(_'should identify top slow queries',_() => {
      const baseTime = new Date();

      // Add queries with different durations
      const durations = [100, 2000, 500, 1500, 300];
      durations.forEach(_(duration,_i) => {
        monitor.recordQuery({
          _query: `SELECT * FROM table_${i}`,
          duration,
          rowsAffected: 1,
          timestamp: new Date(baseTime.getTime() + i * 1000),
          endpoint: `/api/test/${i}`,
        });
      });

      const stats = monitor.getStats();
      expect(stats.totalQueries).toBe(5);
      expect(stats.topSlowQueries).toBeDefined();
      expect(stats.topSlowQueries.length).toBeGreaterThan(0);

      // Should be sorted by duration (slowest first)
      if (stats.topSlowQueries.length > 1) {
        expect(stats.topSlowQueries[0].duration).toBeGreaterThanOrEqual(
          stats.topSlowQueries[1].duration,
        );
      }
    });

    it(_'should clear metrics history',_() => {
      monitor.recordQuery({
        _query: 'SELECT 1',
        duration: 10,
        rowsAffected: 1,
        timestamp: new Date(),
        endpoint: '/api/test',
      });

      let stats = monitor.getStats();
      expect(stats.totalQueries).toBe(1);

      monitor.clearMetrics();

      stats = monitor.getStats();
      expect(stats.totalQueries).toBe(0);
    });

    it(_'should limit metrics history to prevent memory issues',_() => {
      // Add more than the max history limit (1000)
      for (let i = 0; i < 1100; i++) {
        monitor.recordQuery({
          _query: `SELECT * FROM table WHERE id = ${i}`,
          duration: 50,
          rowsAffected: 1,
          timestamp: new Date(),
          endpoint: `/api/test/${i}`,
        });
      }

      const stats = monitor.getStats();
      // Should be limited to maxMetricsHistory (1000)
      expect(stats.totalQueries).toBeLessThanOrEqual(1000);
    });
  });

  describe(_'HEALTHCARE_POOL_CONFIG',_() => {
    it(_'should have appropriate pool configuration for healthcare workloads',_() => {
      expect(HEALTHCARE_POOL_CONFIG.min).toBe(2);
      expect(HEALTHCARE_POOL_CONFIG.max).toBe(20);
      expect(HEALTHCARE_POOL_CONFIG.acquireTimeoutMillis).toBe(30000);
      expect(HEALTHCARE_POOL_CONFIG.idleTimeoutMillis).toBe(300000);
    });

    it(_'should have healthcare-appropriate timeout settings',_() => {
      // Healthcare systems need reliable connections
      expect(HEALTHCARE_POOL_CONFIG.createTimeoutMillis).toBe(30000);
      expect(HEALTHCARE_POOL_CONFIG.destroyTimeoutMillis).toBe(5000);
      expect(HEALTHCARE_POOL_CONFIG.reapIntervalMillis).toBe(1000);
      expect(HEALTHCARE_POOL_CONFIG.createRetryIntervalMillis).toBe(200);
    });
  });
});
