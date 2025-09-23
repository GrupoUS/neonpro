/**
 * Database Performance Optimization Service
 * Provides query optimization, caching, and performance monitoring for healthcare workloads
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { ErrorMapper } from "@neonpro/shared/errors";

export interface QueryPerformanceMetrics {
  _query: string;
  duration: number;
  timestamp: string;
  success: boolean;
  error?: string;
  table: string;
  operation: "select" | "insert" | "update" | "delete";
}

export interface CacheEntry<T> {
  data: T;
  timestamp: string;
  ttl: number; // Time to live in milliseconds
  key: string;
}

export interface PerformanceConfig {
  enableQueryCaching: boolean;
  cacheTTL: number;
  slowQueryThreshold: number; // milliseconds
  enablePerformanceLogging: boolean;
  maxCacheSize: number;
}

/**
 * Healthcare-optimized database performance service
 * Features query caching, performance monitoring, and optimization hints
 */
export class DatabasePerformanceService {
  private cache = new Map<string, CacheEntry<any>>();
  private metrics: QueryPerformanceMetrics[] = [];
  private config: PerformanceConfig;

  constructor(
    private supabase: SupabaseClient,
    config: Partial<PerformanceConfig> = {},
  ) {
    this.config = {
      enableQueryCaching: true,
      cacheTTL: 300000, // 5 minutes default TTL
      slowQueryThreshold: 1000, // 1 second threshold
      enablePerformanceLogging: true,
      maxCacheSize: 1000,
      ...config,
    };
  }

  /**
   * Execute optimized query with performance monitoring and caching
   */
  async optimizedQuery<T>(
    table: string,
    operation: "select" | "insert" | "update" | "delete",
    queryBuilder: (client: SupabaseClient) => Promise<any>,
    options: {
      cacheKey?: string;
      columns?: string;
      forceRefresh?: boolean;
    } = {},
  ): Promise<T> {
    const startTime = performance.now();
    const cacheKey = options.cacheKey
      ? `${table}:${operation}:${options.cacheKey}`
      : null;

    // Check cache first for SELECT operations
    if (
      operation === "select" &&
      cacheKey &&
      this.config.enableQueryCaching &&
      !options.forceRefresh
    ) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        this.logPerformance({
          _query: cacheKey,
          duration: performance.now() - startTime,
          timestamp: new Date().toISOString(),
          success: true,
          table,
          operation,
        });
        return cached;
      }
    }

    try {
      // Execute query with specific column selection for better performance
      let result;
      if (options.columns && operation === "select") {
        // Modify query to use specific columns
        result = await this.executeQueryWithColumns(
          table,
          queryBuilder,
          options.columns,
        );
      } else {
        result = await queryBuilder(this.supabase);
      }

      const duration = performance.now() - startTime;

      // Cache SELECT results
      if (
        operation === "select" &&
        cacheKey &&
        this.config.enableQueryCaching
      ) {
        this.setToCache(cacheKey, result.data || result, this.config.cacheTTL);
      }

      // Log performance metrics
      this.logPerformance({
        _query: cacheKey || `${table}:${operation}`,
        duration,
        timestamp: new Date().toISOString(),
        success: true,
        table,
        operation,
      });

      // Slow query detection and alerting
      if (duration > this.config.slowQueryThreshold) {
        this.warnSlowQuery({
          _query: cacheKey || `${table}:${operation}`,
          duration,
          table,
          operation,
        });
      }

      return result.data || result;
    } catch (error) {
      const duration = performance.now() - startTime;

      // Log failed query
      this.logPerformance({
        _query: cacheKey || `${table}:${operation}`,
        duration,
        timestamp: new Date().toISOString(),
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        table,
        operation,
      });

      // Use ErrorMapper for consistent error handling
      const mappedError = ErrorMapper.mapError(error, {
        action: `database_query:${operation}`,
        timestamp: new Date().toISOString(),
      });

      throw mappedError;
    }
  }

  /**
   * Execute batch operations for improved performance
   */
  async batchInsert<T>(
    table: string,
    data: T[],
    options: {
      batchSize?: number;
      conflictTarget?: string;
      onUpdate?: string;
    } = {},
  ): Promise<{ success: number; errors: any[] }> {
    const batchSize = options.batchSize || 100;
    const results = { success: 0, errors: [] as any[] };

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      try {
        let query;
        if (options.conflictTarget) {
          query = this.supabase.from(table).upsert(batch, {
            onConflict: options.conflictTarget,
          });
        } else {
          query = this.supabase.from(table).insert(batch);
        }

        const { error } = await query;

        if (error) {
          results.errors.push({ batch: i / batchSize, error: error.message });
        } else {
          results.success += batch.length;
        }
      } catch (error) {
        results.errors.push({
          batch: i / batchSize,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  }

  /**
   * Optimized expiration check - single database operation instead of SELECT + UPDATE
   */
  async optimizeExpirationCheck(
    table: string,
    dateColumn: string = "expires_at",
    statusColumn: string = "status",
    activeStatus: string = "ACTIVE",
    expiredStatus: string = "EXPIRED",
  ): Promise<{ updatedCount: number; expiredIds: string[] }> {
    const startTime = performance.now();

    try {
      const now = new Date().toISOString();

      // Single operation: find and update expired records in one query
      const { data, error } = await this.supabase
        .from(table)
        .update({ [statusColumn]: expiredStatus })
        .lte(dateColumn, now)
        .eq(statusColumn, activeStatus)
        .select("id");

      const duration = performance.now() - startTime;

      if (error) {
        throw new Error(
          `Failed to optimize expiration check: ${error.message}`,
        );
      }

      this.logPerformance({
        query: "optimize_expiration_check",
        duration,
        timestamp: new Date().toISOString(),
        success: true,
        table,
        operation: "update",
      });

      return {
        updatedCount: data?.length || 0,
        expiredIds: data?.map((item: any) => item.id) || [],
      };
    } catch (error) {
      const duration = performance.now() - startTime;

      this.logPerformance({
        query: "optimize_expiration_check",
        duration,
        timestamp: new Date().toISOString(),
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        table,
        operation: "update",
      });

      throw error;
    }
  }

  /**
   * Get performance metrics for monitoring
   */
  getPerformanceMetrics(timeRange?: {
    start: string;
    end: string;
  }): QueryPerformanceMetrics[] {
    if (!timeRange) {
      return [...this.metrics];
    }

    const start = new Date(timeRange.start).getTime();
    const end = new Date(timeRange.end).getTime();

    return this.metrics.filter((metric) => {
      const metricTime = new Date(metric.timestamp).getTime();
      return metricTime >= start && metricTime <= end;
    });
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    const relevantMetrics = this.getPerformanceMetrics();

    if (relevantMetrics.length === 0) {
      return {
        totalQueries: 0,
        averageDuration: 0,
        slowQueries: 0,
        errorRate: 0,
        cacheHitRate: 0,
      };
    }

    const totalDuration = relevantMetrics.reduce(
      (sum, _metric) => sum + metric.duration,
      0,
    );
    const slowQueries = relevantMetrics.filter(
      (metric) => metric.duration > this.config.slowQueryThreshold,
    );
    const errors = relevantMetrics.filter((metric) => !metric.success);

    return {
      totalQueries: relevantMetrics.length,
      averageDuration: totalDuration / relevantMetrics.length,
      slowQueries: slowQueries.length,
      errorRate: (errors.length / relevantMetrics.length) * 100,
      cacheHitRate: this.calculateCacheHitRate(),
    };
  }

  /**
   * Clear cache entries
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clean up expired cache entries
   */
  cleanup(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache) {
      if (now - new Date(entry.timestamp).getTime() > entry.ttl) {
        this.cache.delete(key);
      }
    }

    // Keep only recent metrics (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    this.metrics = this.metrics.filter(
      (metric) => metric.timestamp > oneDayAgo,
    );
  }

  /**
   * Get cache entry with TTL validation
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - new Date(entry.timestamp).getTime() > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cache entry with automatic size management
   */
  private setToCache<T>(key: string, data: T, ttl: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: new Date().toISOString(),
      ttl,
      key,
    });
  }

  /**
   * Execute query with specific column selection
   */
  private async executeQueryWithColumns(
    _table: string,
    queryBuilder: (client: SupabaseClient) => Promise<any>,
    _columns: string,
  ): Promise<any> {
    // This is a simplified implementation - in practice, you'd need to
    // modify the query builder to use specific columns
    return queryBuilder(this.supabase);
  }

  /**
   * Log performance metrics
   */
  private logPerformance(metric: QueryPerformanceMetrics): void {
    if (!this.config.enablePerformanceLogging) return;

    this.metrics.push(metric);

    // Keep metrics array manageable
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-5000);
    }
  }

  /**
   * Log slow query warnings
   */
  private warnSlowQuery(queryInfo: {
    _query: string;
    duration: number;
    table: string;
    operation: string;
  }): void {
    console.warn(
      `[SLOW QUERY] ${queryInfo.table}:${queryInfo.operation} took ${queryInfo.duration.toFixed(2)}ms`,
      {
        _query: queryInfo.query,
        duration: queryInfo.duration,
        threshold: this.config.slowQueryThreshold,
      },
    );
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    // This would need to be implemented with hit/miss tracking
    // For now, return a placeholder
    return 0;
  }
}

// Factory function for creating performance service instances
export const createDatabasePerformanceService = (
  supabase: SupabaseClient,
  config?: Partial<PerformanceConfig>,
) => {
  return new DatabasePerformanceService(supabase, config);
};

export default DatabasePerformanceService;
