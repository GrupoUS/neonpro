/**
 * Analytics Engine Base - NeonPro Analytics System
 * 
 * Core analytics calculation engine for healthcare metrics,
 * patient data analysis, and clinical performance tracking.
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 */

import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

export interface AnalyticsTimeRange {
  start: Date;
  end: Date;
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface BaseMetric {
  value: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

export interface PatientMetric extends BaseMetric {
  total: number;
  active: number;
  new: number;
  inactive: number;
  retention: number;
}

export interface ClinicalMetric extends BaseMetric {
  treatments: number;
  satisfaction: number;
  effectiveness: number;
  completionRate: number;
}

export interface KPIMetric extends BaseMetric {
  ticketMedio: number;
  conversaoRate: number;
  roi: number;
  indicacoes: number;
}

/**
 * Base Analytics Engine
 * Core calculation engine for all analytics operations
 */
export class AnalyticsEngine {
  private supabase = createClient();

  /**
   * Calculate percentage change between two values
   */
  calculateChange(current: number, previous: number): { change: number; changePercent: number; trend: 'up' | 'down' | 'stable' } {
    const change = current - previous;
    const changePercent = previous === 0 ? 0 : (change / previous) * 100;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (changePercent > 1) trend = 'up';
    else if (changePercent < -1) trend = 'down';

    return { change, changePercent, trend };
  }

  /**
   * Format time range for SQL queries
   */
  formatTimeRange(timeRange: AnalyticsTimeRange): { startDate: string; endDate: string } {
    return {
      startDate: timeRange.start.toISOString(),
      endDate: timeRange.end.toISOString()
    };
  }

  /**
   * Get previous period for comparison
   */
  getPreviousPeriod(timeRange: AnalyticsTimeRange): AnalyticsTimeRange {
    const duration = timeRange.end.getTime() - timeRange.start.getTime();
    
    return {
      start: new Date(timeRange.start.getTime() - duration),
      end: new Date(timeRange.start.getTime()),
      period: timeRange.period
    };
  }

  /**
   * Execute cached query with performance optimization
   */
  async executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
    try {
      const { data, error } = await this.supabase.rpc('execute_analytics_query', {
        query_text: query,
        query_params: params
      });

      if (error) {
        console.error('Analytics Query Error:', error);
        throw new Error(`Analytics query failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Analytics Engine Error:', error);
      throw error;
    }
  }

  /**
   * Calculate aggregated metrics with comparison
   */
  async calculateAggregatedMetric(
    tableName: string,
    column: string,
    aggregation: 'count' | 'sum' | 'avg' | 'max' | 'min',
    timeRange: AnalyticsTimeRange,
    filters: Record<string, any> = {}
  ): Promise<BaseMetric> {
    const currentPeriod = this.formatTimeRange(timeRange);
    const previousPeriod = this.formatTimeRange(this.getPreviousPeriod(timeRange));

    // Build filter conditions
    const filterConditions = Object.entries(filters)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(' AND ');

    // Current period query
    const currentQuery = `
      SELECT ${aggregation}(${column}) as value
      FROM ${tableName}
      WHERE created_at >= '${currentPeriod.startDate}'
        AND created_at <= '${currentPeriod.endDate}'
        ${filterConditions ? `AND ${filterConditions}` : ''}
    `;

    // Previous period query
    const previousQuery = `
      SELECT ${aggregation}(${column}) as value
      FROM ${tableName}
      WHERE created_at >= '${previousPeriod.startDate}'
        AND created_at <= '${previousPeriod.endDate}'
        ${filterConditions ? `AND ${filterConditions}` : ''}
    `;

    const [currentResult, previousResult] = await Promise.all([
      this.executeQuery<{ value: number }>(currentQuery),
      this.executeQuery<{ value: number }>(previousQuery)
    ]);

    const currentValue = currentResult[0]?.value || 0;
    const previousValue = previousResult[0]?.value || 0;
    const changeData = this.calculateChange(currentValue, previousValue);

    return {
      value: currentValue,
      change: changeData.change,
      changePercent: changeData.changePercent,
      trend: changeData.trend,
      period: timeRange.period
    };
  }

  /**
   * Get time series data for trending
   */
  async getTimeSeries(
    tableName: string,
    column: string,
    aggregation: 'count' | 'sum' | 'avg',
    timeRange: AnalyticsTimeRange,
    groupBy: 'day' | 'week' | 'month' = 'day',
    filters: Record<string, any> = {}
  ): Promise<Array<{ date: string; value: number }>> {
    const { startDate, endDate } = this.formatTimeRange(timeRange);
    
    const filterConditions = Object.entries(filters)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(' AND ');

    const dateFormat = {
      day: 'YYYY-MM-DD',
      week: 'YYYY-"W"WW',
      month: 'YYYY-MM'
    }[groupBy];

    const dateTrunc = {
      day: 'day',
      week: 'week',
      month: 'month'
    }[groupBy];

    const query = `
      SELECT 
        TO_CHAR(DATE_TRUNC('${dateTrunc}', created_at), '${dateFormat}') as date,
        ${aggregation}(${column}) as value
      FROM ${tableName}
      WHERE created_at >= '${startDate}'
        AND created_at <= '${endDate}'
        ${filterConditions ? `AND ${filterConditions}` : ''}
      GROUP BY DATE_TRUNC('${dateTrunc}', created_at)
      ORDER BY DATE_TRUNC('${dateTrunc}', created_at)
    `;

    return this.executeQuery<{ date: string; value: number }>(query);
  }
}

/**
 * Cached analytics engine instance
 */
export const analyticsEngine = cache(() => new AnalyticsEngine());

/**
 * Helper function to create standard time ranges
 */
export function createTimeRange(
  period: 'last7days' | 'last30days' | 'last3months' | 'last6months' | 'lastyear' | 'custom',
  customStart?: Date,
  customEnd?: Date
): AnalyticsTimeRange {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'last7days':
      return {
        start: new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now,
        period: 'day'
      };
    case 'last30days':
      return {
        start: new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: now,
        period: 'day'
      };
    case 'last3months':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 3, 1),
        end: now,
        period: 'week'
      };
    case 'last6months':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 6, 1),
        end: now,
        period: 'month'
      };
    case 'lastyear':
      return {
        start: new Date(now.getFullYear() - 1, 0, 1),
        end: now,
        period: 'month'
      };
    case 'custom':
      if (!customStart || !customEnd) {
        throw new Error('Custom period requires start and end dates');
      }
      const daysDiff = Math.ceil((customEnd.getTime() - customStart.getTime()) / (1000 * 60 * 60 * 24));
      const periodType = daysDiff <= 30 ? 'day' : daysDiff <= 180 ? 'week' : 'month';
      
      return {
        start: customStart,
        end: customEnd,
        period: periodType
      };
    default:
      throw new Error(`Unsupported period: ${period}`);
  }
}

