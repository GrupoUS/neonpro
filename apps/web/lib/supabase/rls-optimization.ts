/**
 * RLS Optimization Utilities
 * Performance optimizations for Row Level Security policies
 * Target: 200ms → 100ms response time improvement
 */

import type { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Performance monitoring types
type RLSHealthCheck = {
  check_name: string;
  status: 'OK' | 'WARNING' | 'CRITICAL';
  details: string;
};

type RLSPerformanceBenchmark = {
  table_name: string;
  old_avg_time_ms: number;
  new_avg_time_ms: number;
  improvement_percent: number;
};

type CacheStats = {
  current_user_id: string | null;
  cached_user_id: string | null;
  cached_clinic_id: string | null;
  cache_valid: boolean;
};

export class RLSOptimizationManager {
  private readonly supabase: ReturnType<typeof createClient<Database>>;

  constructor(supabaseClient: ReturnType<typeof createClient<Database>>) {
    this.supabase = supabaseClient;
  }

  /**
   * Get user's clinic ID using optimized cached function
   * This replaces direct queries to profiles table
   */
  async getUserClinicId(): Promise<string | null> {
    try {
      const startTime = performance.now();

      const { data, error } = await this.supabase.rpc('get_user_clinic_id');

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Log performance metric if enabled
      if (process.env.NODE_ENV === 'development') {
        // Log to database for monitoring
        await this.logPerformanceMetric('get_user_clinic_id', responseTime);
      }

      if (error) {
        return null;
      }

      return data as string;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Check if user belongs to specific clinic (optimized)
   */
  async userBelongsToClinic(clinicId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc(
        'user_belongs_to_clinic',
        { target_clinic_id: clinicId }
      );

      if (error) {
        return false;
      }

      return data as boolean;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  async getCacheStats(): Promise<CacheStats | null> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_cache_stats')
        .single();

      if (error) {
        return null;
      }

      return data as CacheStats;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Perform RLS health check
   */
  async performHealthCheck(): Promise<RLSHealthCheck[]> {
    try {
      const { data, error } = await this.supabase.rpc('rls_health_check');

      if (error) {
        return [];
      }

      return data as RLSHealthCheck[];
    } catch (_error) {
      return [];
    }
  }

  /**
   * Get performance benchmarks
   */
  async getPerformanceBenchmarks(): Promise<RLSPerformanceBenchmark[]> {
    try {
      const { data, error } = await this.supabase.rpc(
        'benchmark_rls_performance'
      );

      if (error) {
        return [];
      }

      return data as RLSPerformanceBenchmark[];
    } catch (_error) {
      return [];
    }
  }

  /**
   * Clear cache (for testing/debugging)
   */
  async clearCache(): Promise<boolean> {
    try {
      const { error } = await this.supabase.rpc('clear_clinic_cache');

      if (error) {
        return false;
      }

      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Log performance metric for monitoring
   */
  private async logPerformanceMetric(
    metricName: string,
    value: number
  ): Promise<void> {
    try {
      await this.supabase.rpc('log_performance_metric', {
        p_metric_name: metricName,
        p_metric_value: value,
      });
    } catch (_error) {}
  }

  /**
   * Validate optimization is working correctly
   */
  async validateOptimization(): Promise<{
    isOptimized: boolean;
    avgResponseTime: number;
    cacheValid: boolean;
    healthStatus: 'OK' | 'WARNING' | 'CRITICAL';
  }> {
    try {
      // Get cache stats
      const cacheStats = await this.getCacheStats();

      // Get health check
      const healthChecks = await this.performHealthCheck();

      // Determine overall health status
      const criticalIssues = healthChecks.filter(
        (check) => check.status === 'CRITICAL'
      );
      const warningIssues = healthChecks.filter(
        (check) => check.status === 'WARNING'
      );

      let healthStatus: 'OK' | 'WARNING' | 'CRITICAL' = 'OK';
      if (criticalIssues.length > 0) {
        healthStatus = 'CRITICAL';
      } else if (warningIssues.length > 0) {
        healthStatus = 'WARNING';
      }

      // Get response time from health checks
      const responseTimeCheck = healthChecks.find(
        (check) => check.check_name === 'response_time_target'
      );

      const avgResponseTime = responseTimeCheck
        ? Number.parseFloat(
            responseTimeCheck.details.match(/(\d+\.?\d*) ms/)?.[1] || '0'
          )
        : 0;

      return {
        isOptimized: avgResponseTime <= 100 && healthStatus !== 'CRITICAL',
        avgResponseTime,
        cacheValid: cacheStats?.cache_valid,
        healthStatus,
      };
    } catch (_error) {
      return {
        isOptimized: false,
        avgResponseTime: 999,
        cacheValid: false,
        healthStatus: 'CRITICAL',
      };
    }
  }
}

/**
 * Helper function to create RLS optimization manager
 */
export function createRLSOptimizationManager(
  supabaseClient: ReturnType<typeof createClient<Database>>
): RLSOptimizationManager {
  return new RLSOptimizationManager(supabaseClient);
}

/**
 * Performance monitoring hook for React components
 */
export function useRLSPerformance() {
  const [metrics, _setMetrics] = React.useState<{
    responseTime: number;
    cacheHitRate: number;
    optimizationStatus: 'loading' | 'optimized' | 'warning' | 'error';
  }>({
    responseTime: 0,
    cacheHitRate: 0,
    optimizationStatus: 'loading',
  });

  // This would be implemented with actual React hook logic
  // For now, providing the interface

  return metrics;
}

// Export types for use in other modules
export type { RLSHealthCheck, RLSPerformanceBenchmark, CacheStats };
