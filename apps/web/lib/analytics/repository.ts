// Analytics Repository Layer - STORY-SUB-002 Task 2
// Data access layer for analytics with optimized queries and caching
// Created: 2025-01-22

import { createClient } from '@/app/utils/supabase/server';
import type {
  AnalyticsQuery,
  ConversionMetric,
  MetricAggregation,
  RealTimeMetric,
  RevenueMetric,
  TrialMetric,
} from './types';

export class AnalyticsRepository {
  private readonly supabase: ReturnType<typeof createClient>;

  constructor() {
    this.supabase = createClient();
  }

  // ========================================================================
  // RAW METRICS RETRIEVAL
  // ========================================================================

  async getRevenueMetrics(query: AnalyticsQuery): Promise<RevenueMetric[]> {
    const { data, error } = await this.supabase.rpc('get_revenue_metrics', {
      p_start_date: query.startDate.toISOString(),
      p_end_date: query.endDate.toISOString(),
      p_filters: query.filters || {},
    });

    if (error) {
      throw new Error(`Revenue metrics query failed: ${error.message}`);
    }
    return data || [];
  }

  async getConversionMetrics(
    query: AnalyticsQuery
  ): Promise<ConversionMetric[]> {
    const { data, error } = await this.supabase.rpc('get_conversion_metrics', {
      p_start_date: query.startDate.toISOString(),
      p_end_date: query.endDate.toISOString(),
      p_filters: query.filters || {},
    });

    if (error) {
      throw new Error(`Conversion metrics query failed: ${error.message}`);
    }
    return data || [];
  }
  async getTrialMetrics(query: AnalyticsQuery): Promise<TrialMetric[]> {
    const { data, error } = await this.supabase.rpc('get_trial_metrics', {
      p_start_date: query.startDate.toISOString(),
      p_end_date: query.endDate.toISOString(),
      p_filters: query.filters || {},
    });

    if (error) {
      throw new Error(`Trial metrics query failed: ${error.message}`);
    }
    return data || [];
  }

  // ========================================================================
  // AGGREGATED ANALYTICS QUERIES
  // ========================================================================

  async getRevenueAggregation(
    query: AnalyticsQuery
  ): Promise<MetricAggregation> {
    const { data, error } = await this.supabase.rpc(
      'calculate_revenue_aggregation',
      {
        p_period: query.period,
        p_start_date: query.startDate.toISOString(),
        p_end_date: query.endDate.toISOString(),
        p_group_by: query.groupBy || [],
      }
    );

    if (error) {
      throw new Error(`Revenue aggregation failed: ${error.message}`);
    }
    return data?.[0] || this.createEmptyAggregation(query);
  }

  async getConversionAggregation(
    query: AnalyticsQuery
  ): Promise<MetricAggregation> {
    const { data, error } = await this.supabase.rpc(
      'calculate_conversion_aggregation',
      {
        p_period: query.period,
        p_start_date: query.startDate.toISOString(),
        p_end_date: query.endDate.toISOString(),
        p_group_by: query.groupBy || [],
      }
    );

    if (error) {
      throw new Error(`Conversion aggregation failed: ${error.message}`);
    }
    return data?.[0] || this.createEmptyAggregation(query);
  } // ========================================================================
  // REAL-TIME METRICS & STREAMING
  // ========================================================================

  async getRealTimeMetrics(): Promise<RealTimeMetric[]> {
    const { data, error } = await this.supabase.rpc('get_realtime_metrics');

    if (error) {
      throw new Error(`Real-time metrics query failed: ${error.message}`);
    }
    return data || [];
  }

  async subscribeToRealTimeMetrics(callback: (metric: RealTimeMetric) => void) {
    const channel = this.supabase
      .channel('realtime-analytics')
      .on(
        'postgres_changes',
        { event: '*', schema: 'analytics', table: 'metrics' },
        (payload) => {
          const metric: RealTimeMetric = {
            id: payload.new?.id || '',
            type: payload.new?.type || 'user',
            value: payload.new?.value || 0,
            delta: payload.new?.delta || 0,
            timestamp: new Date(payload.new?.created_at || Date.now()),
            trend: payload.new?.trend || 'stable',
          };
          callback(metric);
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private createEmptyAggregation(query: AnalyticsQuery): MetricAggregation {
    return {
      period: query.period,
      startDate: query.startDate,
      endDate: query.endDate,
      total: 0,
      average: 0,
      median: 0,
      percentile95: 0,
      growth: 0,
      periodOverPeriod: 0,
    };
  }
}
