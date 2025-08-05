/**
 * 📊 NeonPro Performance Monitor
 *
 * Sistema inteligente de monitoramento que coleta métricas críticas
 * com zero impacto na performance da aplicação
 */

import type { LRUCache } from "lru-cache";

interface PerformanceMetric {
  name: string;
  value: number;
  unit: "ms" | "count" | "bytes" | "percent";
  timestamp: number;
  route?: string;
  userId?: string;
  clinicId?: string;
  metadata?: Record<string, any>;
}

interface APIPerformanceData {
  route: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestSize?: number;
  responseSize?: number;
  userId?: string;
  clinicId?: string;
  userAgent?: string;
  timestamp: number;
}

/**
 * Cache inteligente para métricas (máximo 1000 entradas, TTL 5 minutos)
 */
const metricsCache = new LRUCache<string, PerformanceMetric[]>({
  max: 1000,
  ttl: 5 * 60 * 1000, // 5 minutes
});

/**
 * Cache para agregações (reduz computação repetida)
 */
const aggregationCache = new LRUCache<string, any>({
  max: 200,
  ttl: 30 * 1000, // 30 seconds
});

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 10000; // Limit memory usage

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 🚀 Record API performance (zero-overhead async)
   */
  recordAPIPerformance(data: APIPerformanceData): void {
    // Async recording to not block main thread
    setImmediate(() => {
      const metric: PerformanceMetric = {
        name: `api.${data.route}.${data.method.toLowerCase()}`,
        value: data.responseTime,
        unit: "ms",
        timestamp: data.timestamp,
        route: data.route,
        userId: data.userId,
        clinicId: data.clinicId,
        metadata: {
          statusCode: data.statusCode,
          requestSize: data.requestSize,
          responseSize: data.responseSize,
          userAgent: data.userAgent,
        },
      };

      this.addMetric(metric);
    });
  }

  /**
   * 📱 Record client-side performance
   */
  recordClientPerformance(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name: `client.${name}`,
      value,
      unit: "ms",
      timestamp: Date.now(),
      metadata,
    };

    this.addMetric(metric);
  }

  /**
   * 🗄️ Record database performance
   */
  recordDatabasePerformance(
    operation: string,
    duration: number,
    metadata?: Record<string, any>,
  ): void {
    const metric: PerformanceMetric = {
      name: `db.${operation}`,
      value: duration,
      unit: "ms",
      timestamp: Date.now(),
      metadata,
    };

    this.addMetric(metric);
  }

  /**
   * ⚡ Get real-time performance summary
   */
  getPerformanceSummary(timeWindow: number = 5 * 60 * 1000): {
    apiPerformance: any;
    databasePerformance: any;
    clientPerformance: any;
    alerts: string[];
  } {
    const cacheKey = `summary_${timeWindow}_${Date.now() - (Date.now() % 30000)}`;
    const cached = aggregationCache.get(cacheKey);
    if (cached) return cached;

    const now = Date.now();
    const recentMetrics = this.metrics.filter((m) => now - m.timestamp <= timeWindow);

    const apiMetrics = recentMetrics.filter((m) => m.name.startsWith("api."));
    const dbMetrics = recentMetrics.filter((m) => m.name.startsWith("db."));
    const clientMetrics = recentMetrics.filter((m) => m.name.startsWith("client."));

    const summary = {
      apiPerformance: this.aggregateMetrics(apiMetrics),
      databasePerformance: this.aggregateMetrics(dbMetrics),
      clientPerformance: this.aggregateMetrics(clientMetrics),
      alerts: this.generateAlerts(recentMetrics),
    };

    aggregationCache.set(cacheKey, summary);
    return summary;
  }

  /**
   * 🎯 Get performance for specific route/operation
   */
  getRoutePerformance(
    route: string,
    timeWindow: number = 30 * 60 * 1000,
  ): {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
    count: number;
    errorRate: number;
    trends: any[];
  } {
    const now = Date.now();
    const routeMetrics = this.metrics.filter(
      (m) => m.route === route && now - m.timestamp <= timeWindow,
    );

    if (routeMetrics.length === 0) {
      return { p50: 0, p90: 0, p95: 0, p99: 0, count: 0, errorRate: 0, trends: [] };
    }

    const values = routeMetrics.map((m) => m.value).sort((a, b) => a - b);
    const errors = routeMetrics.filter((m) => m.metadata?.statusCode >= 400).length;

    return {
      p50: this.percentile(values, 50),
      p90: this.percentile(values, 90),
      p95: this.percentile(values, 95),
      p99: this.percentile(values, 99),
      count: routeMetrics.length,
      errorRate: (errors / routeMetrics.length) * 100,
      trends: this.generateTrends(routeMetrics),
    };
  }

  /**
   * ⚠️ Generate intelligent alerts
   */
  private generateAlerts(metrics: PerformanceMetric[]): string[] {
    const alerts: string[] = [];

    // API performance alerts
    const apiMetrics = metrics.filter((m) => m.name.startsWith("api."));
    if (apiMetrics.length > 0) {
      const slowAPIs = apiMetrics.filter((m) => m.value > 1000); // >1s
      if (slowAPIs.length > apiMetrics.length * 0.05) {
        // >5% slow
        alerts.push(
          `High API latency detected: ${slowAPIs.length}/${apiMetrics.length} requests >1s`,
        );
      }

      const errors = apiMetrics.filter((m) => m.metadata?.statusCode >= 500);
      if (errors.length > 0) {
        alerts.push(`${errors.length} server errors in last period`);
      }
    }

    // Database performance alerts
    const dbMetrics = metrics.filter((m) => m.name.startsWith("db."));
    if (dbMetrics.length > 0) {
      const slowQueries = dbMetrics.filter((m) => m.value > 500); // >500ms
      if (slowQueries.length > dbMetrics.length * 0.1) {
        // >10% slow
        alerts.push(
          `Slow database queries detected: ${slowQueries.length}/${dbMetrics.length} queries >500ms`,
        );
      }
    }

    return alerts;
  }

  /**
   * 📊 Calculate percentile
   */
  private percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;
    const index = Math.ceil((p / 100) * values.length) - 1;
    return values[Math.max(0, index)];
  }

  /**
   * 📈 Generate performance trends
   */
  private generateTrends(metrics: PerformanceMetric[], buckets: number = 10): any[] {
    if (metrics.length === 0) return [];

    const sorted = metrics.sort((a, b) => a.timestamp - b.timestamp);
    const bucketSize = Math.ceil(sorted.length / buckets);
    const trends = [];

    for (let i = 0; i < buckets; i++) {
      const bucketStart = i * bucketSize;
      const bucketEnd = Math.min((i + 1) * bucketSize, sorted.length);
      const bucketMetrics = sorted.slice(bucketStart, bucketEnd);

      if (bucketMetrics.length > 0) {
        const avgValue = bucketMetrics.reduce((sum, m) => sum + m.value, 0) / bucketMetrics.length;
        const timestamp = bucketMetrics[Math.floor(bucketMetrics.length / 2)].timestamp;

        trends.push({
          timestamp,
          value: Math.round(avgValue),
          count: bucketMetrics.length,
        });
      }
    }

    return trends;
  }

  /**
   * 🔢 Aggregate metrics with statistical functions
   */
  private aggregateMetrics(metrics: PerformanceMetric[]) {
    if (metrics.length === 0) {
      return { count: 0, avg: 0, p50: 0, p90: 0, p95: 0, p99: 0, min: 0, max: 0 };
    }

    const values = metrics.map((m) => m.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: metrics.length,
      avg: Math.round(sum / metrics.length),
      p50: this.percentile(values, 50),
      p90: this.percentile(values, 90),
      p95: this.percentile(values, 95),
      p99: this.percentile(values, 99),
      min: values[0],
      max: values[values.length - 1],
    };
  }

  /**
   * ➕ Add metric with memory management
   */
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Clean old metrics to prevent memory leaks
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-Math.floor(this.maxMetrics * 0.8)); // Keep 80%
    }
  }

  /**
   * 🧹 Manual cleanup (for testing)
   */
  clearMetrics(): void {
    this.metrics = [];
    metricsCache.clear();
    aggregationCache.clear();
  }

  /**
   * 📊 Get metrics count (for monitoring memory usage)
   */
  getMetricsCount(): number {
    return this.metrics.length;
  }
}

/**
 * 🎯 Singleton instance export
 */
export const performanceMonitor = PerformanceMonitor.getInstance();
