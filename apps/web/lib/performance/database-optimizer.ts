/**
 * Database Optimizer - VIBECODE V1.0 Query Performance
 * Advanced database optimization for subscription queries
 */

export interface QueryMetrics {
  query: string;
  executionTime: number;
  rowsAffected: number;
  cached: boolean;
  timestamp: number;
}

export interface QueryOptimizationSuggestion {
  type: 'index' | 'query_rewrite' | 'caching' | 'partitioning';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  estimatedImprovement: number; // percentage
  implementation: string;
}

export interface DatabasePerformanceReport {
  slowQueries: QueryMetrics[];
  averageResponseTime: number;
  cacheHitRate: number;
  indexUtilization: number;
  optimizationSuggestions: QueryOptimizationSuggestion[];
  performanceScore: number; // 0-100
}

export class DatabaseOptimizer {
  private queryMetrics: QueryMetrics[] = [];
  private slowQueryThreshold = 100; // ms

  constructor(slowQueryThreshold = 100) {
    this.slowQueryThreshold = slowQueryThreshold;
  } /**
   * Monitor query execution
   */
  recordQuery(
    query: string,
    executionTime: number,
    rowsAffected = 0,
    cached = false
  ): void {
    const metric: QueryMetrics = {
      query,
      executionTime,
      rowsAffected,
      cached,
      timestamp: Date.now(),
    };

    this.queryMetrics.push(metric);

    // Log slow queries
    if (executionTime > this.slowQueryThreshold) {
      console.warn(
        `🐌 Slow query detected: ${executionTime}ms - ${query.substring(0, 100)}...`
      );
    }

    // Clean old metrics
    this.cleanOldMetrics();
  }

  /**
   * Get optimized query suggestions
   */
  getOptimizationSuggestions(): QueryOptimizationSuggestion[] {
    const suggestions: QueryOptimizationSuggestion[] = [];

    // Find slow queries
    const slowQueries = this.queryMetrics.filter(
      (m) => m.executionTime > this.slowQueryThreshold
    );

    slowQueries.forEach((query) => {
      if (query.query.includes('SELECT') && !query.query.includes('WHERE')) {
        suggestions.push({
          type: 'query_rewrite',
          priority: 'high',
          description: `Add WHERE clause to: ${query.query.substring(0, 50)}...`,
          estimatedImprovement: 60,
          implementation:
            'Add appropriate WHERE conditions to limit result set',
        });
      }

      if (query.query.includes('ORDER BY') && !query.query.includes('LIMIT')) {
        suggestions.push({
          type: 'index',
          priority: 'medium',
          description: `Add index for ORDER BY: ${query.query.substring(0, 50)}...`,
          estimatedImprovement: 40,
          implementation: 'CREATE INDEX ON table (order_column)',
        });
      }
    });

    return suggestions;
  }

  /**
   * Generate performance report
   */
  generateReport(): DatabasePerformanceReport {
    const slowQueries = this.queryMetrics.filter(
      (m) => m.executionTime > this.slowQueryThreshold
    );
    const totalQueries = this.queryMetrics.length;
    const cachedQueries = this.queryMetrics.filter((m) => m.cached).length;

    const averageResponseTime =
      totalQueries > 0
        ? this.queryMetrics.reduce((sum, m) => sum + m.executionTime, 0) /
          totalQueries
        : 0;

    const cacheHitRate =
      totalQueries > 0 ? (cachedQueries / totalQueries) * 100 : 0;

    return {
      slowQueries,
      averageResponseTime,
      cacheHitRate,
      indexUtilization: this.calculateIndexUtilization(),
      optimizationSuggestions: this.getOptimizationSuggestions(),
      performanceScore: this.calculatePerformanceScore(),
    };
  }

  /**
   * Clean old metrics (keep last 1000)
   */
  private cleanOldMetrics(): void {
    if (this.queryMetrics.length > 1000) {
      this.queryMetrics = this.queryMetrics.slice(-1000);
    }
  }

  /**
   * Calculate index utilization
   */
  private calculateIndexUtilization(): number {
    // Simplified calculation - in real implementation would analyze query plans
    const indexedQueries = this.queryMetrics.filter(
      (m) => m.query.includes('WHERE') || m.query.includes('ORDER BY')
    ).length;

    return this.queryMetrics.length > 0
      ? (indexedQueries / this.queryMetrics.length) * 100
      : 0;
  }

  /**
   * Calculate overall performance score
   */
  private calculatePerformanceScore(): number {
    const slowQueryRatio =
      this.queryMetrics.length > 0
        ? this.queryMetrics.filter(
            (m) => m.executionTime > this.slowQueryThreshold
          ).length / this.queryMetrics.length
        : 0;

    const cacheHitRate =
      this.queryMetrics.length > 0
        ? this.queryMetrics.filter((m) => m.cached).length /
          this.queryMetrics.length
        : 0;

    // Score based on slow query ratio and cache hit rate
    const score = Math.max(0, 100 - slowQueryRatio * 50 + cacheHitRate * 20);
    return Math.min(100, score);
  }
}
