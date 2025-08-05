/**
 * Advanced Cohort Analysis Engine for NeonPro
 *
 * This module provides comprehensive cohort analysis capabilities including:
 * - User cohort definition and segmentation
 * - Retention rate calculations
 * - Revenue cohort analysis
 * - Churn prediction within cohorts
 * - Statistical significance testing
 *
 * Based on Google Analytics cohort analysis patterns with
 * enhancements for SaaS subscription metrics.
 */

import type { createClient } from "@/lib/supabase/server";
import type { z } from "zod";

// Types for cohort analysis
export interface CohortDefinition {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  userCount: number;
  dimension: "subscription_start" | "trial_start" | "first_login";
}

export interface CohortMetrics {
  cohortId: string;
  period: number;
  activeUsers: number;
  totalUsers: number;
  retentionRate: number;
  revenue: number;
  averageRevenuePerUser: number;
  churnedUsers: number;
  churnRate: number;
}

export interface CohortAnalysisConfig {
  cohortType: "subscription" | "trial" | "revenue" | "custom";
  granularity: "daily" | "weekly" | "monthly";
  periods: number;
  startDate: string;
  endDate: string;
  includeRevenue: boolean;
  includeChurn: boolean;
}

// Validation schemas
const cohortConfigSchema = z.object({
  cohortType: z.enum(["subscription", "trial", "revenue", "custom"]),
  granularity: z.enum(["daily", "weekly", "monthly"]),
  periods: z.number().min(1).max(24),
  startDate: z.string(),
  endDate: z.string(),
  includeRevenue: z.boolean().default(true),
  includeChurn: z.boolean().default(true),
});

export class CohortAnalyzer {
  private supabase = createClient();

  /**
   * Generate cohort definitions based on subscription start dates
   * Similar to Google Analytics cohort specification
   */
  async generateCohorts(config: CohortAnalysisConfig): Promise<CohortDefinition[]> {
    const validConfig = cohortConfigSchema.parse(config);

    let dimension = "subscription_start";
    let tableName = "subscription_metrics";

    if (validConfig.cohortType === "trial") {
      dimension = "trial_start";
      tableName = "trial_analytics";
    }

    // Generate cohort date ranges based on granularity
    const cohortRanges = this.generateCohortRanges(
      validConfig.startDate,
      validConfig.endDate,
      validConfig.granularity,
    );

    const cohorts: CohortDefinition[] = [];

    for (const range of cohortRanges) {
      const { data: userCount } = await this.supabase.rpc("get_cohort_user_count", {
        p_start_date: range.start,
        p_end_date: range.end,
        p_dimension: dimension,
      });

      if (userCount && userCount > 0) {
        cohorts.push({
          id: `cohort_${range.start.replace(/-/g, "")}`,
          name: `Cohort ${this.formatCohortName(range.start, validConfig.granularity)}`,
          startDate: range.start,
          endDate: range.end,
          userCount: userCount,
          dimension: dimension as any,
        });
      }
    }

    return cohorts;
  }

  /**
   * Calculate retention metrics for cohorts over time periods
   * Based on Google Analytics cohortRetentionFraction pattern
   */
  async calculateCohortRetention(
    cohorts: CohortDefinition[],
    config: CohortAnalysisConfig,
  ): Promise<CohortMetrics[]> {
    const metrics: CohortMetrics[] = [];

    for (const cohort of cohorts) {
      for (let period = 0; period <= config.periods; period++) {
        const periodDate = this.calculatePeriodDate(cohort.startDate, period, config.granularity);

        // Get active users for this cohort in this period
        const { data: periodMetrics } = await this.supabase.rpc("calculate_cohort_period_metrics", {
          p_cohort_start: cohort.startDate,
          p_cohort_end: cohort.endDate,
          p_period_date: periodDate,
          p_dimension: cohort.dimension,
          p_include_revenue: config.includeRevenue,
        });

        if (periodMetrics) {
          const retentionRate =
            cohort.userCount > 0 ? (periodMetrics.active_users / cohort.userCount) * 100 : 0;

          const churnRate =
            cohort.userCount > 0 ? (periodMetrics.churned_users / cohort.userCount) * 100 : 0;

          metrics.push({
            cohortId: cohort.id,
            period,
            activeUsers: periodMetrics.active_users || 0,
            totalUsers: cohort.userCount,
            retentionRate: Math.round(retentionRate * 100) / 100,
            revenue: periodMetrics.revenue || 0,
            averageRevenuePerUser:
              periodMetrics.active_users > 0
                ? Math.round((periodMetrics.revenue / periodMetrics.active_users) * 100) / 100
                : 0,
            churnedUsers: periodMetrics.churned_users || 0,
            churnRate: Math.round(churnRate * 100) / 100,
          });
        }
      }
    }

    return metrics;
  }

  /**
   * Generate revenue cohort analysis
   * Analyzes lifetime value progression for customer cohorts
   */
  async calculateRevenueCohorts(
    cohorts: CohortDefinition[],
    config: CohortAnalysisConfig,
  ): Promise<any[]> {
    const revenueCohorts = [];

    for (const cohort of cohorts) {
      const { data: revenueData } = await this.supabase.rpc(
        "calculate_cohort_revenue_progression",
        {
          p_cohort_start: cohort.startDate,
          p_cohort_end: cohort.endDate,
          p_periods: config.periods,
          p_granularity: config.granularity,
        },
      );

      if (revenueData) {
        revenueCohorts.push({
          cohortId: cohort.id,
          cohortName: cohort.name,
          userCount: cohort.userCount,
          revenueProgression: revenueData,
          cumulativeRevenue: this.calculateCumulativeRevenue(revenueData),
          lifetimeValue: this.calculateLifetimeValue(revenueData, cohort.userCount),
        });
      }
    }

    return revenueCohorts;
  }

  /**
   * Statistical analysis of cohort performance
   * Includes significance testing and trend analysis
   */
  async analyzeCohortStatistics(metrics: CohortMetrics[]): Promise<any> {
    // Group metrics by period for cross-cohort comparison
    const periodGroups = this.groupMetricsByPeriod(metrics);

    const statistics = {
      retentionTrends: this.calculateRetentionTrends(periodGroups),
      cohortComparison: this.compareCohortPerformance(metrics),
      seasonalityAnalysis: this.analyzeSeasonality(metrics),
      significanceTests: this.performSignificanceTests(periodGroups),
      predictiveInsights: this.generatePredictiveInsights(metrics),
    };

    return statistics;
  }

  // Private helper methods
  private generateCohortRanges(startDate: string, endDate: string, granularity: string) {
    const ranges = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    let current = new Date(start);

    while (current <= end) {
      const rangeEnd = new Date(current);

      if (granularity === "daily") {
        rangeEnd.setDate(rangeEnd.getDate() + 1);
      } else if (granularity === "weekly") {
        rangeEnd.setDate(rangeEnd.getDate() + 7);
      } else if (granularity === "monthly") {
        rangeEnd.setMonth(rangeEnd.getMonth() + 1);
      }

      ranges.push({
        start: current.toISOString().split("T")[0],
        end: rangeEnd.toISOString().split("T")[0],
      });

      current = new Date(rangeEnd);
    }

    return ranges;
  }

  private formatCohortName(dateStr: string, granularity: string): string {
    const date = new Date(dateStr);

    if (granularity === "daily") {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } else if (granularity === "weekly") {
      return `Week of ${date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
  }

  private calculatePeriodDate(startDate: string, period: number, granularity: string): string {
    const date = new Date(startDate);

    if (granularity === "daily") {
      date.setDate(date.getDate() + period);
    } else if (granularity === "weekly") {
      date.setDate(date.getDate() + period * 7);
    } else if (granularity === "monthly") {
      date.setMonth(date.getMonth() + period);
    }

    return date.toISOString().split("T")[0];
  }

  private calculateCumulativeRevenue(revenueData: any[]): number {
    return revenueData.reduce((sum, period) => sum + (period.revenue || 0), 0);
  }

  private calculateLifetimeValue(revenueData: any[], userCount: number): number {
    const totalRevenue = this.calculateCumulativeRevenue(revenueData);
    return userCount > 0 ? Math.round((totalRevenue / userCount) * 100) / 100 : 0;
  }

  private groupMetricsByPeriod(metrics: CohortMetrics[]) {
    return metrics.reduce(
      (groups, metric) => {
        if (!groups[metric.period]) {
          groups[metric.period] = [];
        }
        groups[metric.period].push(metric);
        return groups;
      },
      {} as Record<number, CohortMetrics[]>,
    );
  }

  private calculateRetentionTrends(periodGroups: Record<number, CohortMetrics[]>) {
    const trends = [];

    for (const [period, metrics] of Object.entries(periodGroups)) {
      const avgRetention = metrics.reduce((sum, m) => sum + m.retentionRate, 0) / metrics.length;
      const avgRevenue =
        metrics.reduce((sum, m) => sum + m.averageRevenuePerUser, 0) / metrics.length;

      trends.push({
        period: parseInt(period),
        averageRetention: Math.round(avgRetention * 100) / 100,
        averageRevenuePerUser: Math.round(avgRevenue * 100) / 100,
        cohortCount: metrics.length,
      });
    }

    return trends.sort((a, b) => a.period - b.period);
  }

  private compareCohortPerformance(metrics: CohortMetrics[]) {
    const cohortGroups = metrics.reduce(
      (groups, metric) => {
        if (!groups[metric.cohortId]) {
          groups[metric.cohortId] = [];
        }
        groups[metric.cohortId].push(metric);
        return groups;
      },
      {} as Record<string, CohortMetrics[]>,
    );

    const comparison = [];

    for (const [cohortId, cohortMetrics] of Object.entries(cohortGroups)) {
      const avgRetention =
        cohortMetrics.reduce((sum, m) => sum + m.retentionRate, 0) / cohortMetrics.length;
      const totalRevenue = cohortMetrics.reduce((sum, m) => sum + m.revenue, 0);
      const lifetimeValue =
        cohortMetrics.length > 0 ? totalRevenue / cohortMetrics[0].totalUsers : 0;

      comparison.push({
        cohortId,
        averageRetention: Math.round(avgRetention * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        lifetimeValue: Math.round(lifetimeValue * 100) / 100,
        performanceScore: this.calculatePerformanceScore(avgRetention, lifetimeValue),
      });
    }

    return comparison.sort((a, b) => b.performanceScore - a.performanceScore);
  }

  private analyzeSeasonality(metrics: CohortMetrics[]) {
    // Basic seasonality analysis - can be enhanced with more sophisticated algorithms
    const monthlyPerformance = {} as Record<string, { retention: number[]; revenue: number[] }>;

    metrics.forEach((metric) => {
      // This would need cohort creation month data
      // Simplified implementation for demonstration
      const month = new Date().getMonth(); // Placeholder
      const monthKey = month.toString();

      if (!monthlyPerformance[monthKey]) {
        monthlyPerformance[monthKey] = { retention: [], revenue: [] };
      }

      monthlyPerformance[monthKey].retention.push(metric.retentionRate);
      monthlyPerformance[monthKey].revenue.push(metric.averageRevenuePerUser);
    });

    return monthlyPerformance;
  }

  private performSignificanceTests(periodGroups: Record<number, CohortMetrics[]>) {
    // Simplified statistical significance testing
    // In production, would use proper statistical tests
    const tests = [];

    const periods = Object.keys(periodGroups)
      .map(Number)
      .sort((a, b) => a - b);

    for (let i = 0; i < periods.length - 1; i++) {
      const currentPeriod = periodGroups[periods[i]];
      const nextPeriod = periodGroups[periods[i + 1]];

      const currentAvgRetention =
        currentPeriod.reduce((sum, m) => sum + m.retentionRate, 0) / currentPeriod.length;
      const nextAvgRetention =
        nextPeriod.reduce((sum, m) => sum + m.retentionRate, 0) / nextPeriod.length;

      const retentionChange = nextAvgRetention - currentAvgRetention;
      const isSignificant = Math.abs(retentionChange) > 5; // 5% threshold

      tests.push({
        fromPeriod: periods[i],
        toPeriod: periods[i + 1],
        retentionChange: Math.round(retentionChange * 100) / 100,
        isSignificant,
        significance: isSignificant ? (retentionChange > 0 ? "improvement" : "decline") : "stable",
      });
    }

    return tests;
  }

  private generatePredictiveInsights(metrics: CohortMetrics[]) {
    // Generate predictive insights based on cohort trends
    const insights = [];

    // Analyze retention trends
    const retentionTrend = this.calculateTrendDirection(
      metrics.map((m) => ({ period: m.period, value: m.retentionRate })),
    );

    if (retentionTrend.direction === "increasing") {
      insights.push({
        type: "positive",
        category: "retention",
        message: `Retention rates are improving with a ${retentionTrend.rate}% increase trend`,
        confidence: retentionTrend.confidence,
      });
    } else if (retentionTrend.direction === "decreasing") {
      insights.push({
        type: "warning",
        category: "retention",
        message: `Retention rates are declining with a ${Math.abs(retentionTrend.rate)}% decrease trend`,
        confidence: retentionTrend.confidence,
      });
    }

    // Analyze revenue trends
    const revenueTrend = this.calculateTrendDirection(
      metrics.map((m) => ({ period: m.period, value: m.averageRevenuePerUser })),
    );

    if (revenueTrend.direction === "increasing") {
      insights.push({
        type: "positive",
        category: "revenue",
        message: `Revenue per user is growing with a ${revenueTrend.rate}% increase trend`,
        confidence: revenueTrend.confidence,
      });
    }

    return insights;
  }

  private calculatePerformanceScore(retention: number, lifetimeValue: number): number {
    // Weighted performance score (retention: 60%, LTV: 40%)
    return Math.round((retention * 0.6 + (lifetimeValue / 100) * 0.4) * 100) / 100;
  }

  private calculateTrendDirection(data: { period: number; value: number }[]) {
    if (data.length < 2) return { direction: "stable", rate: 0, confidence: 0 };

    const sortedData = data.sort((a, b) => a.period - b.period);
    const firstValue = sortedData[0].value;
    const lastValue = sortedData[sortedData.length - 1].value;

    const changeRate = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
    const confidence = Math.min(Math.abs(changeRate) * 10, 100); // Simplified confidence calculation

    return {
      direction: changeRate > 1 ? "increasing" : changeRate < -1 ? "decreasing" : "stable",
      rate: Math.round(Math.abs(changeRate) * 100) / 100,
      confidence: Math.round(confidence),
    };
  }
}

// Factory function for creating cohort analyzer instances
export function createCohortAnalyzer(): CohortAnalyzer {
  return new CohortAnalyzer();
}

// Utility functions for cohort analysis
export const cohortUtils = {
  /**
   * Format cohort data for visualization components
   */
  formatForHeatmap: (metrics: CohortMetrics[]) => {
    const heatmapData = [];
    const cohorts = [...new Set(metrics.map((m) => m.cohortId))];
    const periods = [...new Set(metrics.map((m) => m.period))].sort((a, b) => a - b);

    for (const cohort of cohorts) {
      const cohortData = { cohort };
      for (const period of periods) {
        const metric = metrics.find((m) => m.cohortId === cohort && m.period === period);
        cohortData[`period_${period}`] = metric ? metric.retentionRate : 0;
      }
      heatmapData.push(cohortData);
    }

    return heatmapData;
  },

  /**
   * Calculate cohort size distribution
   */
  calculateCohortSizes: (cohorts: CohortDefinition[]) => {
    const sizes = cohorts.map((c) => c.userCount);
    return {
      total: sizes.reduce((sum, size) => sum + size, 0),
      average: Math.round(sizes.reduce((sum, size) => sum + size, 0) / sizes.length),
      median: sizes.sort((a, b) => a - b)[Math.floor(sizes.length / 2)],
      largest: Math.max(...sizes),
      smallest: Math.min(...sizes),
    };
  },

  /**
   * Generate cohort comparison data
   */
  generateComparisonData: (metrics: CohortMetrics[]) => {
    const comparison = [];
    const cohorts = [...new Set(metrics.map((m) => m.cohortId))];

    for (const cohort of cohorts) {
      const cohortMetrics = metrics.filter((m) => m.cohortId === cohort);
      const avgRetention =
        cohortMetrics.reduce((sum, m) => sum + m.retentionRate, 0) / cohortMetrics.length;
      const totalRevenue = cohortMetrics.reduce((sum, m) => sum + m.revenue, 0);

      comparison.push({
        cohort,
        averageRetention: Math.round(avgRetention * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        periods: cohortMetrics.length,
      });
    }

    return comparison.sort((a, b) => b.averageRetention - a.averageRetention);
  },
};
