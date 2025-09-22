/**
 * Query Optimization Service for AI Agent Performance
 * Implements intelligent query optimization, connection pooling, and performance monitoring
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { performance } from 'perf_hooks';
import { Pool, PoolConfig } from 'pg';

export interface QueryOptimizerConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  maxConnections?: number;
  queryTimeout?: number;
  slowQueryThreshold?: number;
  enableQueryAnalysis?: boolean;
  enableConnectionPool?: boolean;
  enableQueryCache?: boolean;
}

export interface QueryMetrics {
  queryId: string;
  _query: string;
  executionTimeMs: number;
  rowsAffected: number;
  cacheHit: boolean;
  indexesUsed: string[];
  timestamp: string;
  success: boolean;
  error?: string;
}

export interface ConnectionPoolMetrics {
  totalConnections: number;
  idleConnections: number;
  activeConnections: number;
  waitingConnections: number;
  maxConnections: number;
  averageWaitTimeMs: number;
  totalQueries: number;
  failedQueries: number;
}

export interface QueryPlan {
  _query: string;
  plan: any;
  estimatedCost: number;
  estimatedRows: number;
  actualExecutionTimeMs?: number;
  actualRows?: number;
  indexesUsed: string[];
  recommendations: string[];
}

export class QueryOptimizerService {
  private config: QueryOptimizerConfig;
  private supabase: SupabaseClient;
  private pool?: Pool;
  private queryMetrics: QueryMetrics[] = [];
  private connectionMetrics: ConnectionPoolMetrics;
  private slowQueryThreshold: number;
  private queryAnalysisEnabled: boolean;

  constructor(config: QueryOptimizerConfig) {
    this.config = {
      maxConnections: 20,
      queryTimeout: 2000, // 2 seconds for healthcare compliance
      slowQueryThreshold: 1000, // 1 second
      enableQueryAnalysis: true,
      enableConnectionPool: true,
      enableQueryCache: true,
      ...config,
    };

    this.supabase = createClient(
      this.config.supabaseUrl,
      this.config.supabaseServiceKey,
    );

    this.slowQueryThreshold = this.config.slowQueryThreshold!;
    this.queryAnalysisEnabled = this.config.enableQueryAnalysis!;

    this.connectionMetrics = {
      totalConnections: 0,
      idleConnections: 0,
      activeConnections: 0,
      waitingConnections: 0,
      maxConnections: this.config.maxConnections!,
      averageWaitTimeMs: 0,
      totalQueries: 0,
      failedQueries: 0,
    };

    if (this.config.enableConnectionPool) {
      this.initializeConnectionPool();
    }
  }

  /**
   * Initialize PostgreSQL connection pool
   */
  private initializeConnectionPool(): void {
    const poolConfig: PoolConfig = {
      host: new URL(this.config.supabaseUrl).hostname,
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: this.config.supabaseServiceKey,
      max: this.config.maxConnections,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      query_timeout: this.config.queryTimeout,
      ssl: { rejectUnauthorized: false },
    };

    this.pool = new Pool(poolConfig);

    // Set up pool event handlers for monitoring
    this.pool.on('connect', () => {
      this.connectionMetrics.totalConnections++;
    });

    this.pool.on('acquire', client => {
      this.connectionMetrics.activeConnections++;
      this.connectionMetrics.idleConnections--;
    });

    this.pool.on('release', client => {
      this.connectionMetrics.activeConnections--;
      this.connectionMetrics.idleConnections++;
    });

    this.pool.on('remove', client => {
      this.connectionMetrics.totalConnections--;
    });

    this.pool.on('error', (err, _client) => {
      console.error('[QueryOptimizer] Pool error:', err);
      this.connectionMetrics.failedQueries++;
    });
  }

  /**
   * Execute optimized query with connection pooling
   */
  async executeQuery<T = any>(
    _query: string,
    params: any[] = [],
    options: {
      timeout?: number;
      useCache?: boolean;
      analyze?: boolean;
    } = {},
  ): Promise<{ data: T[] | null; metrics: QueryMetrics }> {
    const queryId = this.generateQueryId();
    const startTime = performance.now();
    let cacheHit = false;
    let result: T[] | null = null;

    try {
      // Check cache if enabled
      if (options.useCache !== false && this.config.enableQueryCache) {
        const cachedResult = await this.getFromCache(query, params);
        if (cachedResult) {
          cacheHit = true;
          result = cachedResult;
        }
      }

      // Execute query if not cached
      if (!result) {
        if (this.pool) {
          result = await this.executeQueryWithPool(query, params, options);
        } else {
          result = await this.executeQueryWithSupabase(query, params, options);
        }

        // Cache result if caching enabled
        if (options.useCache !== false && this.config.enableQueryCache) {
          await this.cacheResult(query, params, result);
        }
      }

      const executionTime = performance.now() - startTime;

      // Get query plan if analysis is enabled
      let indexesUsed: string[] = [];
      if (options.analyze && this.queryAnalysisEnabled) {
        const plan = await this.getQueryPlan(query, params);
        indexesUsed = plan.indexesUsed;
      }

      const metrics: QueryMetrics = {
        queryId,
        _query: this.sanitizeQuery(query),
        executionTimeMs: executionTime,
        rowsAffected: result?.length || 0,
        cacheHit,
        indexesUsed,
        timestamp: new Date().toISOString(),
        success: true,
      };

      // Log slow queries
      if (executionTime > this.slowQueryThreshold) {
        console.warn(
          `[QueryOptimizer] Slow query detected: ${executionTime}ms > ${this.slowQueryThreshold}ms`,
          {
            queryId,
            _query: metrics.query,
            executionTimeMs: executionTime,
            rowsAffected: metrics.rowsAffected,
            indexesUsed,
          },
        );

        // Provide optimization recommendations
        if (this.queryAnalysisEnabled) {
          await this.provideOptimizationRecommendations(query, executionTime);
        }
      }

      this.recordQueryMetrics(metrics);
      this.connectionMetrics.totalQueries++;

      return { data: result, metrics };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      const metrics: QueryMetrics = {
        queryId,
        _query: this.sanitizeQuery(query),
        executionTimeMs: executionTime,
        rowsAffected: 0,
        cacheHit: false,
        indexesUsed: [],
        timestamp: new Date().toISOString(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      this.recordQueryMetrics(metrics);
      this.connectionMetrics.failedQueries++;

      console.error('[QueryOptimizer] Query execution failed:', error);
      throw error;
    }
  }

  /**
   * Execute query with connection pool
   */
  private async executeQueryWithPool<T>(
    _query: string,
    params: any[],
    options: { timeout?: number },
  ): Promise<T[]> {
    if (!this.pool) {
      throw new Error('Connection pool not available');
    }

    const timeout = options.timeout || this.config.queryTimeout!;
    const startTime = performance.now();

    return new Promise((resolve, _reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Query timeout after ${timeout}ms`));
      }, timeout);

      this.pool!.query(query, params)
        .then(result => {
          clearTimeout(timer);
          resolve(result.rows as T[]);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Execute query with Supabase client
   */
  private async executeQueryWithSupabase<T>(
    _query: string,
    params: any[],
  ): Promise<T[]> {
    // For Supabase, we need to use RPC for custom queries
    // This is a simplified implementation
    const { data, error } = await this.supabase.rpc('execute_query', {
      query_text: query,
      query_params: params,
    });

    if (error) {
      throw error;
    }

    return data as T[];
  }

  /**
   * Get query execution plan
   */
  async getQueryPlan(_query: string, params: any[] = []): Promise<QueryPlan> {
    const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`;

    try {
      const { data } = await this.executeQuery<any[]>(explainQuery, params, {
        useCache: false,
        analyze: false,
      });

      const planData = data[0]?.['QUERY PLAN']?.[0];
      if (!planData) {
        throw new Error('Unable to parse query plan');
      }

      const indexesUsed = this.extractIndexesFromPlan(planData.Plan);
      const recommendations = this.generateRecommendations(planData);

      return {
        query,
        plan: planData,
        estimatedCost: planData.Plan?.['Total Cost'] || 0,
        estimatedRows: planData.Plan?.['Plan Rows'] || 0,
        actualExecutionTimeMs: planData['Execution Time'],
        actualRows: planData.Plan?.['Actual Rows'] || 0,
        indexesUsed,
        recommendations,
      };
    } catch (error) {
      console.error('[QueryOptimizer] Failed to get query plan:', error);
      return {
        query,
        plan: null,
        estimatedCost: 0,
        estimatedRows: 0,
        indexesUsed: [],
        recommendations: ['Unable to analyze query plan'],
      };
    }
  }

  /**
   * Extract indexes used from query plan
   */
  private extractIndexesFromPlan(plan: any): string[] {
    const indexes: string[] = [];

    const traverse = (node: any) => {
      if (!node) return;

      if (node['Index Name']) {
        indexes.push(node['Index Name']);
      }

      if (node['Index Cond']) {
        const indexMatch = String(node['Index Cond']).match(/idx_[\w_]+/g);
        if (indexMatch) {
          indexes.push(...indexMatch);
        }
      }

      if (node.Plans) {
        node.Plans.forEach((subPlan: any) => traverse(subPlan));
      }
    };

    traverse(plan);
    return [...new Set(indexes)];
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(plan: any): string[] {
    const recommendations: string[] = [];

    if (!plan) return recommendations;

    // Check for sequential scans
    if (plan['Node Type'] === 'Seq Scan' && plan.Plan?.Rows > 1000) {
      recommendations.push('Consider adding an index for this table to avoid sequential scan');
    }

    // Check for high cost queries
    if (plan['Total Cost'] > 10000) {
      recommendations.push('Query has high estimated cost, consider optimization');
    }

    // Check for missing indexes
    if (!plan.Plan?.['Index Name'] && plan.Plan?.['Plan Rows'] > 100) {
      recommendations.push('Consider adding appropriate indexes for better performance');
    }

    // Check for slow execution
    if (plan['Actual Time'] > 1000) {
      recommendations.push('Query execution time is high, consider query optimization');
    }

    return recommendations;
  }

  /**
   * Provide optimization recommendations for slow queries
   */
  private async provideOptimizationRecommendations(
    _query: string,
    executionTime: number,
  ): Promise<void> {
    try {
      const plan = await this.getQueryPlan(query);

      console.log('[QueryOptimizer] Optimization recommendations:', {
        _query: this.sanitizeQuery(query),
        executionTimeMs: executionTime,
        estimatedCost: plan.estimatedCost,
        estimatedRows: plan.estimatedRows,
        recommendations: plan.recommendations,
      });

      // Log recommendations to audit log
      await this.logOptimizationEvent({
        type: 'query_optimization',
        _query: this.sanitizeQuery(query),
        executionTimeMs: executionTime,
        recommendations: plan.recommendations,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[QueryOptimizer] Failed to provide optimization recommendations:', error);
    }
  }

  /**
   * Get connection pool metrics
   */
  getConnectionPoolMetrics(): ConnectionPoolMetrics {
    if (this.pool) {
      const pool = this.pool as any;
      this.connectionMetrics = {
        ...this.connectionMetrics,
        totalConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        activeConnections: pool.totalCount - pool.idleCount,
        waitingConnections: pool.waitingCount,
        maxConnections: pool.options.max,
        averageWaitTimeMs: this.connectionMetrics.averageWaitTimeMs,
      };
    }

    return { ...this.connectionMetrics };
  }

  /**
   * Get query performance statistics
   */
  getQueryPerformanceStats() {
    const stats = {
      totalQueries: this.queryMetrics.length,
      cacheHitRate: this.calculateCacheHitRate(),
      averageExecutionTimeMs: this.calculateAverageExecutionTime(),
      slowQueries:
        this.queryMetrics.filter(m => m.executionTimeMs > this.slowQueryThreshold).length,
      failedQueries: this.queryMetrics.filter(m => !m.success).length,
      topSlowQueries: this.getTopSlowQueries(5),
      mostUsedIndexes: this.getMostUsedIndexes(5),
      executionTimeDistribution: this.getExecutionTimeDistribution(),
    };

    return stats;
  }

  /**
   * Optimize query for better performance
   */
  optimizeQuery(_query: string): string {
    let optimizedQuery = query;

    // Remove unnecessary ORDER BY clauses for large datasets
    if (optimizedQuery.includes('ORDER BY') && !optimizedQuery.includes('LIMIT')) {
      const limitMatch = optimizedQuery.match(/LIMIT\s+(\d+)/);
      if (!limitMatch || parseInt(limitMatch[1]) > 1000) {
        optimizedQuery = optimizedQuery.replace(/ORDER BY\s+[\w\s,.]+(?=\s*(?:LIMIT|$))/gi, '');
      }
    }

    // Add LIMIT to prevent large result sets
    if (!optimizedQuery.includes('LIMIT') && !optimizedQuery.match(/INSERT|UPDATE|DELETE/)) {
      optimizedQuery += ' LIMIT 1000';
    }

    // Optimize JOIN operations
    optimizedQuery = optimizedQuery.replace(/SELECT\s+\*/gi, 'SELECT specific_columns');

    return optimizedQuery.trim();
  }

  /**
   * Record query metrics
   */
  private recordQueryMetrics(metrics: QueryMetrics): void {
    this.queryMetrics.push(metrics);

    // Keep only last 1000 metrics
    if (this.queryMetrics.length > 1000) {
      this.queryMetrics = this.queryMetrics.slice(-1000);
    }
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    const relevantQueries = this.queryMetrics.filter(m => m.success);
    if (relevantQueries.length === 0) return 0;

    const cacheHits = relevantQueries.filter(m => m.cacheHit).length;
    return (cacheHits / relevantQueries.length) * 100;
  }

  /**
   * Calculate average execution time
   */
  private calculateAverageExecutionTime(): number {
    const successfulQueries = this.queryMetrics.filter(m => m.success);
    if (successfulQueries.length === 0) return 0;

    const totalTime = successfulQueries.reduce((sum, _m) => sum + m.executionTimeMs, 0);
    return totalTime / successfulQueries.length;
  }

  /**
   * Get top slow queries
   */
  private getTopSlowQueries(limit: number) {
    return this.queryMetrics
      .filter(m => m.success)
      .sort((a, _b) => b.executionTimeMs - a.executionTimeMs)
      .slice(0, limit);
  }

  /**
   * Get most used indexes
   */
  private getMostUsedIndexes(limit: number) {
    const indexCounts: Record<string, number> = {};

    this.queryMetrics.forEach(m => {
      m.indexesUsed.forEach(index => {
        indexCounts[index] = (indexCounts[index] || 0) + 1;
      });
    });

    return Object.entries(indexCounts)
      .sort((a, _b) => b[1] - a[1])
      .slice(0, limit);
  }

  /**
   * Get execution time distribution
   */
  private getExecutionTimeDistribution() {
    const ranges = {
      '<100ms': 0,
      '100-500ms': 0,
      '500-1000ms': 0,
      '1-2s': 0,
      '>2s': 0,
    };

    this.queryMetrics.filter(m => m.success).forEach(m => {
      if (m.executionTimeMs < 100) ranges['<100ms']++;
      else if (m.executionTimeMs < 500) ranges['100-500ms']++;
      else if (m.executionTimeMs < 1000) ranges['500-1000ms']++;
      else if (m.executionTimeMs < 2000) ranges['1-2s']++;
      else ranges['>2s']++;
    });

    return ranges;
  }

  /**
   * Generate query ID
   */
  private generateQueryId(): string {
    return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sanitize query for logging
   */
  private sanitizeQuery(_query: string): string {
    // Remove sensitive data from query logging
    return query.replace(/'[^']*'/g, '?').replace(/\d+/g, '?');
  }

  /**
   * Get result from cache
   */
  private async getFromCache<T>(_query: string, params: any[]): Promise<T | null> {
    // Simple cache implementation - in production, use Redis
    const cacheKey = this.generateCacheKey(query, params);
    // Cache implementation would go here
    return null;
  }

  /**
   * Cache result
   */
  private async cacheResult<T>(_query: string, params: any[], _result: T): Promise<void> {
    // Simple cache implementation - in production, use Redis
    const cacheKey = this.generateCacheKey(query, params);
    // Cache implementation would go here
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(_query: string, params: any[]): string {
    const queryHash = this.hashString(query);
    const paramsHash = this.hashString(JSON.stringify(params));
    return `_query:${queryHash}:${paramsHash}`;
  }

  /**
   * Hash string for cache key
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Log optimization event
   */
  private async logOptimizationEvent(event: any): Promise<void> {
    // Log to audit trail for compliance
    try {
      await this.supabase
        .from('agent_audit_log')
        .insert({
          user_id: 'system',
          session_id: 'optimization',
          event_type: 'performance_metric',
          severity: 'info',
          details: event,
          timestamp: new Date().toISOString(),
        });
    } catch (error) {
      console.error('[QueryOptimizer] Failed to log optimization event:', error);
    }
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

/**
 * Healthcare-specific query optimizer configuration
 */
export function createHealthcareQueryOptimizer(): QueryOptimizerConfig {
  return {
    supabaseUrl: process.env.SUPABASE_URL!,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY!,
    maxConnections: 15, // Conservative for healthcare data
    queryTimeout: 2000, // 2 seconds max for healthcare compliance
    slowQueryThreshold: 1000, // 1 second threshold
    enableQueryAnalysis: true,
    enableConnectionPool: true,
    enableQueryCache: true,
  };
}
