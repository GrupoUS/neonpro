/**
 * Server-side Performance Monitoring
 *
 * API endpoints, metrics storage, and performance analysis
 * for healthcare applications.
 */

import type {
  CustomMetric,
  ErrorEvent,
  MonitoringConfig,
  PerformanceReport,
} from '../types';

/**
 * Metrics storage interface
 */
export type MetricsStorage = {
  storeMetric(metric: CustomMetric): Promise<void>;
  storeVital(vital: any): Promise<void>;
  storeError(error: ErrorEvent): Promise<void>;
  getMetrics(filters: MetricsFilter): Promise<CustomMetric[]>;
  getReport(period: ReportPeriod): Promise<PerformanceReport>;
  cleanup(retentionDays: number): Promise<void>;
};

/**
 * Metrics filter options
 */
export type MetricsFilter = {
  startDate?: Date;
  endDate?: Date;
  metricNames?: string[];
  userId?: string;
  sessionId?: string;
  feature?: string;
  environment?: string;
  limit?: number;
  offset?: number;
};

/**
 * Report period options
 */
export type ReportPeriod = {
  start: Date;
  end: Date;
  granularity: 'hour' | 'day' | 'week' | 'month';
};

/**
 * In-memory metrics storage (for development)
 */
export class InMemoryMetricsStorage implements MetricsStorage {
  private metrics: CustomMetric[] = [];
  private vitals: any[] = [];
  private errors: ErrorEvent[] = [];

  async storeMetric(metric: CustomMetric): Promise<void> {
    this.metrics.push(metric);
    // Keep only last 10000 metrics to prevent memory issues
    if (this.metrics.length > 10_000) {
      this.metrics = this.metrics.slice(-10_000);
    }
  }

  async storeVital(vital: any): Promise<void> {
    this.vitals.push(vital);
    if (this.vitals.length > 10_000) {
      this.vitals = this.vitals.slice(-10_000);
    }
  }

  async storeError(error: ErrorEvent): Promise<void> {
    this.errors.push(error);
    if (this.errors.length > 1000) {
      this.errors = this.errors.slice(-1000);
    }
  }

  async getMetrics(filters: MetricsFilter): Promise<CustomMetric[]> {
    let filtered = this.metrics;

    if (filters.startDate) {
      filtered = filtered.filter(
        (m) => (m.timestamp || 0) >= (filters.startDate?.getTime() || 0)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(
        (m) => (m.timestamp || 0) <= (filters.endDate?.getTime() || 0)
      );
    }

    if (filters.metricNames?.length) {
      filtered = filtered.filter((m) => filters.metricNames?.includes(m.name));
    }

    if (filters.userId) {
      filtered = filtered.filter((m) => m.context?.userId === filters.userId);
    }

    if (filters.sessionId) {
      filtered = filtered.filter(
        (m) => m.context?.sessionId === filters.sessionId
      );
    }

    if (filters.feature) {
      filtered = filtered.filter((m) => m.context?.feature === filters.feature);
    }

    if (filters.environment) {
      filtered = filtered.filter(
        (m) => m.context?.environment === filters.environment
      );
    }

    const offset = filters.offset || 0;
    const limit = filters.limit || 100;

    return filtered.slice(offset, offset + limit);
  }

  async getReport(period: ReportPeriod): Promise<PerformanceReport> {
    const metrics = await this.getMetrics({
      startDate: period.start,
      endDate: period.end,
    });

    const vitals = this.vitals.filter(
      (v) =>
        v.timestamp >= period.start.getTime() &&
        v.timestamp <= period.end.getTime()
    );

    const errors = this.errors.filter(
      (e) => e.timestamp >= period.start && e.timestamp <= period.end
    );

    return this.generateReport(metrics, vitals, errors, period);
  }

  async cleanup(retentionDays: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffTimestamp = cutoffDate.getTime();

    this.metrics = this.metrics.filter(
      (m) => (m.timestamp || 0) > cutoffTimestamp
    );
    this.vitals = this.vitals.filter((v) => v.timestamp > cutoffTimestamp);
    this.errors = this.errors.filter((e) => e.timestamp > cutoffDate);
  }

  private generateReport(
    metrics: CustomMetric[],
    vitals: any[],
    errors: ErrorEvent[],
    period: ReportPeriod
  ): PerformanceReport {
    // Calculate summary stats
    const totalSessions = new Set(
      metrics.map((m) => m.context?.sessionId).filter(Boolean)
    ).size;
    const averageLoadTime = this.calculateAverage(
      vitals.filter((v) => v.name === 'LCP').map((v) => v.value)
    );
    const errorRate = (errors.length / Math.max(totalSessions, 1)) * 100;

    // Group vitals by name
    const webVitalsData: any = {};
    ['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'].forEach((name) => {
      const values = vitals.filter((v) => v.name === name).map((v) => v.value);
      if (values.length > 0) {
        webVitalsData[name] = {
          p50: this.calculatePercentile(values, 50),
          p75: this.calculatePercentile(values, 75),
          p90: this.calculatePercentile(values, 90),
          p95: this.calculatePercentile(values, 95),
          samples: values.length,
        };
      }
    });

    // Group custom metrics by name
    const customMetricsData: any = {};
    const metricNames = [...new Set(metrics.map((m) => m.name))];
    metricNames.forEach((name) => {
      const values = metrics.filter((m) => m.name === name).map((m) => m.value);
      if (values.length > 0) {
        customMetricsData[name] = {
          average: this.calculateAverage(values),
          median: this.calculatePercentile(values, 50),
          p95: this.calculatePercentile(values, 95),
          samples: values.length,
          trend: 'stable', // Would need historical data for actual trend analysis
        };
      }
    });

    // Generate alerts based on thresholds
    const alerts = this.generateAlerts(metrics, vitals, errors);

    return {
      period,
      summary: {
        totalSessions,
        averageLoadTime,
        errorRate,
        topIssues: this.getTopIssues(errors),
      },
      webVitals: webVitalsData,
      customMetrics: customMetricsData,
      alerts,
    };
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) {
      return 0;
    }
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) {
      return 0;
    }
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  private getTopIssues(errors: ErrorEvent[]): string[] {
    const errorCounts: Record<string, number> = {};
    errors.forEach((error) => {
      errorCounts[error.fingerprint] =
        (errorCounts[error.fingerprint] || 0) + 1;
    });

    return Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([fingerprint]) => {
        const error = errors.find((e) => e.fingerprint === fingerprint);
        return error?.message || fingerprint;
      });
  }

  private generateAlerts(
    metrics: CustomMetric[],
    vitals: any[],
    errors: ErrorEvent[]
  ): any[] {
    const alerts: any[] = [];

    // High error rate alert
    if (errors.length > 10) {
      alerts.push({
        type: 'error_rate',
        severity: 'high',
        message: `High error rate detected: ${errors.length} errors in reporting period`,
        timestamp: new Date(),
        resolved: false,
      });
    }

    // Poor LCP performance alert
    const lcpValues = vitals
      .filter((v) => v.name === 'LCP')
      .map((v) => v.value);
    if (lcpValues.length > 0) {
      const p95LCP = this.calculatePercentile(lcpValues, 95);
      if (p95LCP > 4000) {
        alerts.push({
          type: 'performance',
          severity: 'medium',
          message: `Poor LCP performance: p95 ${p95LCP}ms (threshold: 4000ms)`,
          timestamp: new Date(),
          resolved: false,
        });
      }
    }

    // Slow healthcare operations alert
    const slowOperations = metrics.filter(
      (m) =>
        m.rating === 'poor' &&
        [
          'patient_search_time',
          'form_submission_time',
          'database_query_time',
        ].includes(m.name)
    );

    if (slowOperations.length > 5) {
      alerts.push({
        type: 'performance',
        severity: 'medium',
        message: `Multiple slow healthcare operations detected: ${slowOperations.length} operations`,
        timestamp: new Date(),
        resolved: false,
      });
    }

    return alerts;
  }
}

/**
 * Performance monitoring server
 */
export class PerformanceMonitoringServer {
  private readonly storage: MetricsStorage;
  private readonly config: MonitoringConfig;

  constructor(storage: MetricsStorage, config: MonitoringConfig) {
    this.storage = storage;
    this.config = config;
  }

  /**
   * Handle metrics endpoint
   */
  async handleMetrics(request: any): Promise<Response> {
    try {
      const metric = await request.json();
      await this.storage.storeMetric(metric);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (_error) {
      return new Response(JSON.stringify({ error: 'Invalid metric data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  /**
   * Handle vitals endpoint
   */
  async handleVitals(request: any): Promise<Response> {
    try {
      const vital = await request.json();
      await this.storage.storeVital(vital);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (_error) {
      return new Response(JSON.stringify({ error: 'Invalid vital data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  /**
   * Handle errors endpoint
   */
  async handleErrors(request: any): Promise<Response> {
    try {
      const error = await request.json();
      await this.storage.storeError(error);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (_error) {
      return new Response(JSON.stringify({ error: 'Invalid error data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  /**
   * Handle dashboard data endpoint
   */
  async handleDashboard(request: any): Promise<Response> {
    try {
      const url = new URL(request.url);
      const period = this.parsePeriod(url.searchParams);
      const report = await this.storage.getReport(period);

      return new Response(JSON.stringify(report), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (_error) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate report' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  /**
   * Handle metrics query endpoint
   */
  async handleQuery(request: any): Promise<Response> {
    try {
      const url = new URL(request.url);
      const filters = this.parseFilters(url.searchParams);
      const metrics = await this.storage.getMetrics(filters);

      return new Response(JSON.stringify({ metrics }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (_error) {
      return new Response(
        JSON.stringify({ error: 'Failed to query metrics' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  /**
   * Run cleanup job
   */
  async runCleanup(): Promise<void> {
    await this.storage.cleanup(this.config.privacy.retentionDays);
  }

  private parsePeriod(params: URLSearchParams): ReportPeriod {
    const start = params.get('start')
      ? new Date(params.get('start')!)
      : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const end = params.get('end') ? new Date(params.get('end')!) : new Date();
    const granularity = (params.get('granularity') as any) || 'hour';

    return { start, end, granularity };
  }

  private parseFilters(params: URLSearchParams): MetricsFilter {
    const filters: MetricsFilter = {};

    if (params.get('start')) {
      filters.startDate = new Date(params.get('start')!);
    }
    if (params.get('end')) {
      filters.endDate = new Date(params.get('end')!);
    }
    if (params.get('metrics')) {
      filters.metricNames = params.get('metrics')?.split(',');
    }
    if (params.get('userId')) {
      filters.userId = params.get('userId')!;
    }
    if (params.get('sessionId')) {
      filters.sessionId = params.get('sessionId')!;
    }
    if (params.get('feature')) {
      filters.feature = params.get('feature')!;
    }
    if (params.get('environment')) {
      filters.environment = params.get('environment')!;
    }
    if (params.get('limit')) {
      const limit = Number.parseInt(params.get('limit')!, 10);
      if (!Number.isNaN(limit)) {
        filters.limit = limit;
      }
    }
    if (params.get('offset')) {
      const offset = Number.parseInt(params.get('offset')!, 10);
      if (!Number.isNaN(offset)) {
        filters.offset = offset;
      }
    }

    return filters;
  }
}

/**
 * Next.js API route helpers
 */
export function createMonitoringAPI(
  storage: MetricsStorage,
  config: MonitoringConfig
) {
  const server = new PerformanceMonitoringServer(storage, config);

  return {
    // POST /api/monitoring/metrics
    metrics: (req: Request) => server.handleMetrics(req),

    // POST /api/monitoring/vitals
    vitals: (req: Request) => server.handleVitals(req),

    // POST /api/monitoring/errors
    errors: (req: Request) => server.handleErrors(req),

    // GET /api/monitoring/dashboard
    dashboard: (req: Request) => server.handleDashboard(req),

    // GET /api/monitoring/query
    query: (req: Request) => server.handleQuery(req),

    // Cleanup job
    cleanup: () => server.runCleanup(),
  };
}

/**
 * Database metrics storage (Supabase/PostgreSQL)
 */
export class DatabaseMetricsStorage implements MetricsStorage {
  private connectionString: string;

  constructor(connectionString: string) {
    this.connectionString = connectionString;
  }

  async storeMetric(_metric: CustomMetric): Promise<void> {}

  async storeVital(_vital: any): Promise<void> {}

  async storeError(_error: ErrorEvent): Promise<void> {}

  async getMetrics(_filters: MetricsFilter): Promise<CustomMetric[]> {
    // Database query implementation
    return [];
  }

  async getReport(_period: ReportPeriod): Promise<PerformanceReport> {
    // Complex aggregation queries for report generation
    return {} as PerformanceReport;
  }

  async cleanup(_retentionDays: number): Promise<void> {}
}
