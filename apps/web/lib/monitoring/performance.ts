/**
 * TASK-001: Foundation Setup & Baseline
 * Performance Measurement Utilities
 *
 * Provides comprehensive performance monitoring for all epic routes,
 * API endpoints, and database queries to establish baseline measurements.
 */

import { createClient } from '@/app/utils/supabase/client';

export type PerformanceMetric = {
  route_path: string;
  metric_type: 'page_load' | 'api_response' | 'db_query' | 'component_render';
  duration_ms: number;
  status_code?: number;
  error_message?: string;
  metadata?: Record<string, any>;
};

export type PerformanceBudget = {
  api_max_ms: number;
  page_max_ms: number;
  db_max_ms: number;
  component_max_ms: number;
};

// Performance budgets as defined in TASK-001
export const PERFORMANCE_BUDGETS: PerformanceBudget = {
  api_max_ms: 500,
  page_max_ms: 2000,
  db_max_ms: 100,
  component_max_ms: 50,
};

class PerformanceMonitor {
  private readonly supabase = createClient();
  private readonly measurements = new Map<string, number>();

  /**
   * Start measuring performance for a specific operation
   */
  startMeasurement(operationId: string): void {
    this.measurements.set(operationId, performance.now());
  }

  /**
   * End measurement and automatically log to database
   */
  async endMeasurement(
    operationId: string,
    metric: Omit<PerformanceMetric, 'duration_ms'>,
  ): Promise<void> {
    const startTime = this.measurements.get(operationId);
    if (!startTime) {
      return;
    }

    const duration_ms = Math.round(performance.now() - startTime);
    this.measurements.delete(operationId);

    await this.logPerformanceMetric({
      ...metric,
      duration_ms,
    });

    // Check against performance budgets
    this.checkPerformanceBudget(
      metric.metric_type,
      duration_ms,
      metric.route_path,
    );
  }

  /**
   * Log performance metric to database
   */
  async logPerformanceMetric(metric: PerformanceMetric): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('performance_metrics')
        .insert(metric);

      if (error) {
      }
    } catch (_error) {}
  }

  /**
   * Check if performance meets budget requirements
   */
  private checkPerformanceBudget(
    metricType: PerformanceMetric['metric_type'],
    duration: number,
    routePath: string,
  ): void {
    let budget: number;

    switch (metricType) {
      case 'api_response':
        budget = PERFORMANCE_BUDGETS.api_max_ms;
        break;
      case 'page_load':
        budget = PERFORMANCE_BUDGETS.page_max_ms;
        break;
      case 'db_query':
        budget = PERFORMANCE_BUDGETS.db_max_ms;
        break;
      case 'component_render':
        budget = PERFORMANCE_BUDGETS.component_max_ms;
        break;
      default:
        return;
    }

    if (duration > budget) {
      // Log budget violation as system metric
      this.logSystemMetric(
        'performance_budget_violation',
        `${metricType}_budget_exceeded`,
        duration - budget,
        'ms',
        { route_path: routePath, budget, actual: duration },
      );
    }
  }

  /**
   * Log system-level metrics
   */
  async logSystemMetric(
    metricType: string,
    metricName: string,
    value: number,
    unit: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      const { error } = await this.supabase.from('system_metrics').insert({
        metric_type: metricType,
        metric_name: metricName,
        metric_value: value,
        metric_unit: unit,
        metadata,
      });

      if (error) {
      }
    } catch (_error) {}
  }

  /**
   * Get performance baseline data for a specific route
   */
  async getPerformanceBaseline(
    routePath: string,
    metricType?: PerformanceMetric['metric_type'],
    days = 7,
  ): Promise<{
    average: number;
    median: number;
    p95: number;
    p99: number;
    count: number;
  } | null> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = this.supabase
        .from('performance_metrics')
        .select('duration_ms')
        .eq('route_path', routePath)
        .gte('timestamp', startDate.toISOString())
        .order('duration_ms');

      if (metricType) {
        query = query.eq('metric_type', metricType);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        return null;
      }

      const durations = data.map((d) => d.duration_ms).sort((a, b) => a - b);
      const count = durations.length;

      return {
        average: durations.reduce((sum, d) => sum + d, 0) / count,
        median: durations[Math.floor(count / 2)],
        p95: durations[Math.floor(count * 0.95)],
        p99: durations[Math.floor(count * 0.99)],
        count,
      };
    } catch (_error) {
      return null;
    }
  }

  /**
   * Generate performance report for all routes
   */
  async generatePerformanceReport(days = 7): Promise<Record<string, any>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.supabase
        .from('performance_metrics')
        .select('route_path, metric_type, duration_ms, timestamp')
        .gte('timestamp', startDate.toISOString());

      if (error || !data) {
        throw error;
      }

      // Group by route and metric type
      const report: Record<string, any> = {};

      data.forEach((metric) => {
        const key = `${metric.route_path}_${metric.metric_type}`;
        if (!report[key]) {
          report[key] = {
            route_path: metric.route_path,
            metric_type: metric.metric_type,
            durations: [],
          };
        }
        report[key].durations.push(metric.duration_ms);
      });

      // Calculate statistics for each route/metric combination
      Object.keys(report).forEach((key) => {
        const durations = report[key].durations.sort(
          (a: number, b: number) => a - b,
        );
        const count = durations.length;

        report[key] = {
          ...report[key],
          count,
          average:
            durations.reduce((sum: number, d: number) => sum + d, 0) / count,
          median: durations[Math.floor(count / 2)],
          p95: durations[Math.floor(count * 0.95)],
          p99: durations[Math.floor(count * 0.99)],
          min: durations[0],
          max: durations[count - 1],
        };

        report[key].durations = undefined; // Remove raw data to keep response clean
      });

      return report;
    } catch (_error) {
      return {};
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility decorators and hooks for easy integration
export function measureAsync<_T>(
  operationId: string,
  metricType: PerformanceMetric['metric_type'],
  routePath: string,
) {
  return (
    _target: any,
    _propertyName: string,
    descriptor: PropertyDescriptor,
  ) => {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      performanceMonitor.startMeasurement(operationId);

      try {
        const result = await method.apply(this, args);

        await performanceMonitor.endMeasurement(operationId, {
          route_path: routePath,
          metric_type: metricType,
          status_code: 200,
        });

        return result;
      } catch (error) {
        await performanceMonitor.endMeasurement(operationId, {
          route_path: routePath,
          metric_type: metricType,
          status_code: 500,
          error_message:
            error instanceof Error ? error.message : 'Unknown error',
        });

        throw error;
      }
    };
  };
}

// React Hook for component performance measurement
export function usePerformanceTracker(componentName: string) {
  const measureComponentRender = async (renderTime: number) => {
    await performanceMonitor.logPerformanceMetric({
      route_path: componentName,
      metric_type: 'component_render',
      duration_ms: renderTime,
    });
  };

  return { measureComponentRender };
}

// Generic performance tracking function for auth and other modules
export async function trackPerformance(options: {
  category: string;
  name: string;
  duration: number;
  success: boolean;
  metadata?: Record<string, any>;
}): Promise<void> {
  await performanceMonitor.logPerformanceMetric({
    route_path: `${options.category}/${options.name}`,
    metric_type: 'api_response',
    duration_ms: options.duration,
    status_code: options.success ? 200 : 500,
    metadata: options.metadata,
  });
}

// Missing functions for compatibility
export async function getPerformanceMetrics() {
  return performanceMonitor.generatePerformanceReport();
}

export async function recordPerformanceMetric(metric: PerformanceMetric) {
  return performanceMonitor.logPerformanceMetric(metric);
}
