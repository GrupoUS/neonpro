// Database Optimization Utilities
// Story 11.4: Alertas e Relatórios de Estoque
// Database query optimization and performance monitoring

import { createClient } from '@supabase/supabase-js';
import { stockAlertCache, cacheMetrics } from './cache';

// =====================================================
// CONFIGURATION
// =====================================================

const DB_CONFIG = {
  // Connection pooling
  maxConnections: 20,
  idleTimeout: 60000, // 1 minute
  
  // Query timeouts
  queryTimeout: 30000, // 30 seconds
  transactionTimeout: 60000, // 1 minute
  
  // Batch processing
  maxBatchSize: 1000,
  defaultBatchSize: 100,
  
  // Performance monitoring
  slowQueryThreshold: 1000, // 1 second
  enableQueryLogging: process.env.NODE_ENV === 'development'
} as const;

// =====================================================
// PERFORMANCE MONITORING
// =====================================================

interface QueryMetrics {
  query: string;
  duration: number;
  rows: number;
  cached: boolean;
  timestamp: Date;
}

class QueryPerformanceMonitor {
  private metrics: QueryMetrics[] = [];
  private maxMetrics = 1000;

  logQuery(metrics: QueryMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow queries
    if (metrics.duration > DB_CONFIG.slowQueryThreshold) {
      console.warn('Slow query detected:', {
        query: metrics.query.substring(0, 100),
        duration: `${metrics.duration}ms`,
        rows: metrics.rows
      });
    }

    // Log all queries in development
    if (DB_CONFIG.enableQueryLogging) {
      console.log('Query executed:', {
        query: metrics.query.substring(0, 100),
        duration: `${metrics.duration}ms`,
        rows: metrics.rows,
        cached: metrics.cached
      });
    }
  }

  getSlowQueries(threshold?: number): QueryMetrics[] {
    const limit = threshold || DB_CONFIG.slowQueryThreshold;
    return this.metrics.filter(m => m.duration > limit);
  }

  getAverageQueryTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / this.metrics.length;
  }

  getCacheHitRate(): number {
    if (this.metrics.length === 0) return 0;
    const cached = this.metrics.filter(m => m.cached).length;
    return cached / this.metrics.length;
  }
}

const queryMonitor = new QueryPerformanceMonitor();

// =====================================================
// OPTIMIZED QUERY BUILDER
// =====================================================

export class OptimizedQueryBuilder {
  private supabase: any;
  private tableName: string;

  constructor(supabase: any, tableName: string) {
    this.supabase = supabase;
    this.tableName = tableName;
  }

  /**
   * Optimized select with automatic caching
   */
  async cachedSelect<T>(
    cacheKey: string,
    selectQuery: string,
    filters: Record<string, any> = {},
    cacheTtl: number = 300
  ): Promise<{ data: T[] | null; fromCache: boolean }> {
    const startTime = Date.now();
    
    // Try cache first
    const cached = await stockAlertCache.cache.get<T[]>(cacheKey);
    if (cached) {
      await cacheMetrics.recordHit(cacheKey);
      queryMonitor.logQuery({
        query: `SELECT ${selectQuery} FROM ${this.tableName} (cached)`,
        duration: Date.now() - startTime,
        rows: cached.length,
        cached: true,
        timestamp: new Date()
      });
      return { data: cached, fromCache: true };
    }

    await cacheMetrics.recordMiss(cacheKey);

    // Build and execute query
    let query = this.supabase.from(this.tableName).select(selectQuery);
    
    // Apply filters
    for (const [key, value] of Object.entries(filters)) {
      if (Array.isArray(value)) {
        query = query.in(key, value);
      } else if (value !== null && value !== undefined) {
        query = query.eq(key, value);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Query failed: ${error.message}`);
    }

    const duration = Date.now() - startTime;
    queryMonitor.logQuery({
      query: `SELECT ${selectQuery} FROM ${this.tableName}`,
      duration,
      rows: data?.length || 0,
      cached: false,
      timestamp: new Date()
    });

    // Cache the result
    if (data) {
      await stockAlertCache.cache.set(cacheKey, data, cacheTtl);
    }

    return { data, fromCache: false };
  }

  /**
   * Batch insert with automatic batching
   */
  async batchInsert<T>(
    records: T[],
    batchSize: number = DB_CONFIG.defaultBatchSize
  ): Promise<{ data: T[]; errors: any[] }> {
    const startTime = Date.now();
    const results: T[] = [];
    const errors: any[] = [];

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      try {
        const { data, error } = await this.supabase
          .from(this.tableName)
          .insert(batch)
          .select();

        if (error) {
          errors.push({ batch: i / batchSize, error });
        } else if (data) {
          results.push(...data);
        }
      } catch (error) {
        errors.push({ batch: i / batchSize, error });
      }
    }

    queryMonitor.logQuery({
      query: `INSERT INTO ${this.tableName} (batch)`,
      duration: Date.now() - startTime,
      rows: results.length,
      cached: false,
      timestamp: new Date()
    });

    return { data: results, errors };
  }

  /**
   * Optimized aggregation query
   */
  async aggregate(
    cacheKey: string,
    aggregations: {
      count?: string;
      sum?: string[];
      avg?: string[];
      min?: string[];
      max?: string[];
    },
    filters: Record<string, any> = {},
    cacheTtl: number = 600
  ): Promise<any> {
    const startTime = Date.now();

    // Try cache first
    const cached = await stockAlertCache.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Build aggregation query using RPC or multiple queries
    const results: any = {};

    if (aggregations.count) {
      let query = this.supabase.from(this.tableName).select('*', { count: 'exact', head: true });
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
      const { count } = await query;
      results.count = count;
    }

    // For other aggregations, we'd need to use RPC functions or raw SQL
    // This is a simplified implementation

    queryMonitor.logQuery({
      query: `AGGREGATE FROM ${this.tableName}`,
      duration: Date.now() - startTime,
      rows: 1,
      cached: false,
      timestamp: new Date()
    });

    // Cache the result
    await stockAlertCache.cache.set(cacheKey, results, cacheTtl);

    return results;
  }
}

// =====================================================
// OPTIMIZED STOCK ALERT QUERIES
// =====================================================

export class StockAlertQueries {
  private supabase: any;

  constructor(supabaseClient?: any) {
    this.supabase = supabaseClient || createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Get alert configurations with optimized joins
   */
  async getAlertConfigs(clinicId: string): Promise<any[]> {
    const cacheKey = `alert-configs:${clinicId}`;
    const builder = new OptimizedQueryBuilder(this.supabase, 'stock_alert_configs');

    const { data } = await builder.cachedSelect(
      cacheKey,
      `
        *,
        product:products (
          id,
          name,
          sku,
          current_stock,
          min_stock,
          max_stock,
          expiration_date
        ),
        category:product_categories (
          id,
          name
        )
      `,
      { clinic_id: clinicId, is_active: true },
      900 // 15 minutes cache
    );

    return data || [];
  }

  /**
   * Get active alerts with optimized filtering
   */
  async getActiveAlerts(clinicId: string, limit: number = 50): Promise<any[]> {
    const cacheKey = `active-alerts:${clinicId}:${limit}`;
    
    const startTime = Date.now();
    const cached = await stockAlertCache.getActiveAlerts(clinicId);
    
    if (cached) {
      return cached.slice(0, limit);
    }

    const { data, error } = await this.supabase
      .from('stock_alerts')
      .select(`
        *,
        product:products (
          id,
          name,
          sku
        ),
        config:stock_alert_configs (
          alert_type,
          severity_level
        )
      `)
      .eq('clinic_id', clinicId)
      .eq('status', 'active')
      .order('triggered_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch active alerts: ${error.message}`);
    }

    queryMonitor.logQuery({
      query: 'SELECT active alerts with joins',
      duration: Date.now() - startTime,
      rows: data?.length || 0,
      cached: false,
      timestamp: new Date()
    });

    // Cache the result
    if (data) {
      await stockAlertCache.setActiveAlerts(clinicId, data);
    }

    return data || [];
  }

  /**
   * Get dashboard data with optimized aggregations
   */
  async getDashboardData(clinicId: string, days: number = 30): Promise<any> {
    const cacheKey = `dashboard:${clinicId}:${days}d`;
    
    const cached = await stockAlertCache.getDashboardData(clinicId, `${days}d`);
    if (cached) {
      return cached;
    }

    const startTime = Date.now();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Execute multiple optimized queries in parallel
    const [
      productsResult,
      alertsResult,
      metricsResult
    ] = await Promise.all([
      this.supabase
        .from('products')
        .select(`
          id,
          name,
          current_stock,
          min_stock,
          max_stock,
          unit_cost,
          expiration_date,
          category:product_categories (
            id,
            name
          )
        `)
        .eq('clinic_id', clinicId)
        .is('deleted_at', null),

      this.supabase
        .from('stock_alerts')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('triggered_at', startDate.toISOString())
        .order('triggered_at', { ascending: false }),

      this.supabase
        .from('stock_performance_metrics')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('metric_date', startDate.toISOString().split('T')[0])
        .order('metric_date', { ascending: false })
    ]);

    // Process and combine results
    const dashboardData = {
      products: productsResult.data || [],
      alerts: alertsResult.data || [],
      metrics: metricsResult.data || [],
      lastUpdated: new Date(),
      period: { start: startDate, end: endDate, days }
    };

    queryMonitor.logQuery({
      query: 'Dashboard data aggregation',
      duration: Date.now() - startTime,
      rows: (dashboardData.products.length + dashboardData.alerts.length + dashboardData.metrics.length),
      cached: false,
      timestamp: new Date()
    });

    // Cache the result
    await stockAlertCache.setDashboardData(clinicId, `${days}d`, dashboardData);

    return dashboardData;
  }

  /**
   * Optimized product stock lookup
   */
  async getProductStock(productIds: string[]): Promise<Map<string, any>> {
    const result = new Map<string, any>();
    const uncachedIds: string[] = [];

    // Check cache for each product
    for (const productId of productIds) {
      const cached = await stockAlertCache.getProductStock(productId);
      if (cached) {
        result.set(productId, cached);
      } else {
        uncachedIds.push(productId);
      }
    }

    // Fetch uncached products in batch
    if (uncachedIds.length > 0) {
      const { data } = await this.supabase
        .from('products')
        .select('id, current_stock, min_stock, max_stock, expiration_date')
        .in('id', uncachedIds);

      if (data) {
        for (const product of data) {
          result.set(product.id, product);
          // Cache individual products
          await stockAlertCache.setProductStock(product.id, product);
        }
      }
    }

    return result;
  }

  /**
   * Bulk alert evaluation with optimization
   */
  async bulkEvaluateAlerts(clinicId: string, batchSize: number = 100): Promise<any[]> {
    const startTime = Date.now();
    
    // Get all active configurations
    const configs = await this.getAlertConfigs(clinicId);
    
    if (configs.length === 0) {
      return [];
    }

    const results: any[] = [];
    
    // Process in batches to avoid memory issues
    for (let i = 0; i < configs.length; i += batchSize) {
      const batch = configs.slice(i, i + batchSize);
      const batchResults = await this.evaluateConfigBatch(batch);
      results.push(...batchResults);
    }

    queryMonitor.logQuery({
      query: `Bulk alert evaluation (${configs.length} configs)`,
      duration: Date.now() - startTime,
      rows: results.length,
      cached: false,
      timestamp: new Date()
    });

    return results;
  }

  private async evaluateConfigBatch(configs: any[]): Promise<any[]> {
    const alerts: any[] = [];

    for (const config of configs) {
      try {
        const alert = await this.evaluateConfig(config);
        if (alert) {
          alerts.push(alert);
        }
      } catch (error) {
        console.error(`Failed to evaluate config ${config.id}:`, error);
      }
    }

    return alerts;
  }

  private async evaluateConfig(config: any): Promise<any | null> {
    const product = config.product;
    if (!product) return null;

    // Evaluation logic (same as in background job)
    let shouldAlert = false;
    let currentValue = 0;
    let message = '';

    switch (config.alert_type) {
      case 'low_stock':
        currentValue = product.current_stock || 0;
        shouldAlert = currentValue <= config.threshold_value;
        message = `Estoque baixo para ${product.name}: ${currentValue} unidades`;
        break;

      case 'expiring':
        if (product.expiration_date) {
          const daysUntilExpiration = Math.ceil(
            (new Date(product.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          currentValue = daysUntilExpiration;
          shouldAlert = daysUntilExpiration <= config.threshold_value && daysUntilExpiration > 0;
          message = `Produto ${product.name} vence em ${daysUntilExpiration} dias`;
        }
        break;

      default:
        return null;
    }

    if (!shouldAlert) return null;

    // Check for existing alert
    const { data: existingAlert } = await this.supabase
      .from('stock_alerts')
      .select('id')
      .eq('alert_config_id', config.id)
      .eq('product_id', product.id)
      .is('acknowledged_at', null)
      .single();

    if (existingAlert) return null;

    return {
      clinic_id: config.clinic_id,
      alert_config_id: config.id,
      product_id: product.id,
      alert_type: config.alert_type,
      severity_level: config.severity_level,
      current_value: currentValue,
      threshold_value: config.threshold_value,
      message,
      status: 'active',
      metadata: {
        productName: product.name,
        evaluatedAt: new Date().toISOString()
      }
    };
  }
}

// =====================================================
// DATABASE HEALTH MONITORING
// =====================================================

export class DatabaseHealthMonitor {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async checkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: {
      connectionTime: number;
      queryTime: number;
      cacheHitRate: number;
      averageQueryTime: number;
    };
  }> {
    const startTime = Date.now();

    try {
      // Test basic connectivity
      const connectionStart = Date.now();
      await this.supabase.from('health_check').select('1').limit(1);
      const connectionTime = Date.now() - connectionStart;

      // Test query performance
      const queryStart = Date.now();
      await this.supabase
        .from('stock_alert_configs')
        .select('id')
        .limit(10);
      const queryTime = Date.now() - queryStart;

      const metrics = {
        connectionTime,
        queryTime,
        cacheHitRate: queryMonitor.getCacheHitRate(),
        averageQueryTime: queryMonitor.getAverageQueryTime()
      };

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

      if (connectionTime > 1000 || queryTime > 2000) {
        status = 'degraded';
      }

      if (connectionTime > 5000 || queryTime > 10000) {
        status = 'unhealthy';
      }

      return { status, metrics };

    } catch (error) {
      return {
        status: 'unhealthy',
        metrics: {
          connectionTime: Date.now() - startTime,
          queryTime: 0,
          cacheHitRate: 0,
          averageQueryTime: 0
        }
      };
    }
  }
}

// =====================================================
// EXPORTS
// =====================================================

export const optimizedQueries = new StockAlertQueries();
export const dbHealthMonitor = new DatabaseHealthMonitor();
export { queryMonitor, DB_CONFIG };