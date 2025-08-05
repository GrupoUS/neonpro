/**
 * TASK-001: Foundation Setup & Baseline
 * Baseline Metrics System
 *
 * Establishes baseline performance, user engagement, and system health
 * metrics for measuring enhancement impact and detecting regressions.
 */

import type { createClient } from "@/lib/supabase/client";

export interface BaselineMetric {
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  measurement_period: "daily" | "weekly" | "monthly";
  baseline_date: string;
  confidence_level: number;
  sample_size: number;
  metadata?: Record<string, any>;
}

export interface BaselineComparison {
  metric_name: string;
  baseline_value: number;
  current_value: number;
  change_percentage: number;
  change_direction: "improvement" | "regression" | "neutral";
  significance_level: "low" | "medium" | "high";
  measurement_date: string;
}

export interface BaselineReport {
  report_date: string;
  measurement_period: string;
  total_metrics: number;
  significant_changes: number;
  regressions: number;
  improvements: number;
  neutral_changes: number;
  comparisons: BaselineComparison[];
  recommendations: string[];
}

class BaselineManager {
  private supabase = createClient();
  private baselineMetrics: Map<string, BaselineMetric> = new Map();
  private measurementInterval: NodeJS.Timeout | null = null;

  // Core metrics to establish baselines for
  private coreMetrics = [
    // Performance metrics
    { name: "page_load_time", unit: "ms", threshold: 2000 },
    { name: "first_contentful_paint", unit: "ms", threshold: 1500 },
    { name: "largest_contentful_paint", unit: "ms", threshold: 2500 },
    { name: "cumulative_layout_shift", unit: "score", threshold: 0.1 },
    { name: "time_to_interactive", unit: "ms", threshold: 3000 },

    // User engagement metrics
    { name: "session_duration", unit: "seconds", threshold: 300 },
    { name: "pages_per_session", unit: "count", threshold: 3 },
    { name: "bounce_rate", unit: "percentage", threshold: 60 },
    { name: "user_retention_rate", unit: "percentage", threshold: 40 },
    { name: "feature_adoption_rate", unit: "percentage", threshold: 25 },

    // System health metrics
    { name: "api_response_time", unit: "ms", threshold: 500 },
    { name: "database_query_time", unit: "ms", threshold: 100 },
    { name: "error_rate", unit: "percentage", threshold: 1 },
    { name: "uptime_percentage", unit: "percentage", threshold: 99.9 },
    { name: "memory_usage", unit: "mb", threshold: 512 },

    // Business metrics
    { name: "daily_active_users", unit: "count", threshold: 10 },
    { name: "feature_usage_rate", unit: "percentage", threshold: 30 },
    { name: "conversion_rate", unit: "percentage", threshold: 5 },
    { name: "user_satisfaction_score", unit: "rating", threshold: 4.0 },
  ];

  constructor() {
    this.initializeBaselines();
    this.startPeriodicMeasurement();
  }

  /**
   * Initialize baseline measurement system
   */
  private async initializeBaselines(): Promise<void> {
    try {
      // Load existing baselines from database
      await this.loadExistingBaselines();

      // Establish new baselines if needed
      await this.establishMissingBaselines();

      console.log("✅ Baseline system initialized");
    } catch (error) {
      console.error("Error initializing baselines:", error);
    }
  }

  /**
   * Load existing baselines from database
   */
  private async loadExistingBaselines(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from("system_metrics")
        .select("*")
        .eq("metric_type", "baseline")
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Error loading baselines:", error);
        return;
      }

      // Group by metric name and take latest baseline for each
      const latestBaselines = new Map<string, any>();

      data?.forEach((record) => {
        const metricName = record.metric_name;
        if (!latestBaselines.has(metricName)) {
          latestBaselines.set(metricName, record);
        }
      });

      // Convert to BaselineMetric format
      latestBaselines.forEach((record, metricName) => {
        const baseline: BaselineMetric = {
          metric_name: metricName,
          metric_value: record.metric_value,
          metric_unit: record.metric_unit,
          measurement_period: record.metadata?.measurement_period || "daily",
          baseline_date: record.timestamp,
          confidence_level: record.metadata?.confidence_level || 0.8,
          sample_size: record.metadata?.sample_size || 100,
          metadata: record.metadata,
        };

        this.baselineMetrics.set(metricName, baseline);
      });

      console.log(`Loaded ${this.baselineMetrics.size} existing baselines`);
    } catch (error) {
      console.error("Error loading existing baselines:", error);
    }
  }

  /**
   * Establish baselines for metrics that don't have them
   */
  private async establishMissingBaselines(): Promise<void> {
    for (const metric of this.coreMetrics) {
      if (!this.baselineMetrics.has(metric.name)) {
        await this.establishBaseline(metric.name, metric.unit);
      }
    }
  }

  /**
   * Establish a baseline for a specific metric
   */
  async establishBaseline(
    metricName: string,
    metricUnit: string,
    measurementPeriod: "daily" | "weekly" | "monthly" = "daily",
  ): Promise<BaselineMetric | null> {
    try {
      console.log(`📊 Establishing baseline for ${metricName}...`);

      // Collect current measurements for baseline calculation
      const measurements = await this.collectCurrentMeasurements(metricName, measurementPeriod);

      if (measurements.length === 0) {
        console.warn(`No measurements available for ${metricName}, using default value`);
        return await this.createDefaultBaseline(metricName, metricUnit, measurementPeriod);
      }

      // Calculate baseline statistics
      const baseline = this.calculateBaselineStatistics(
        metricName,
        metricUnit,
        measurementPeriod,
        measurements,
      );

      // Store baseline in database
      await this.storeBaseline(baseline);

      // Cache baseline
      this.baselineMetrics.set(metricName, baseline);

      console.log(
        `✅ Baseline established for ${metricName}: ${baseline.metric_value} ${baseline.metric_unit}`,
      );

      return baseline;
    } catch (error) {
      console.error(`Error establishing baseline for ${metricName}:`, error);
      return null;
    }
  }

  /**
   * Collect current measurements for a metric
   */
  private async collectCurrentMeasurements(
    metricName: string,
    measurementPeriod: string,
  ): Promise<number[]> {
    try {
      // Define collection period based on measurement period
      const periodDays =
        measurementPeriod === "daily" ? 7 : measurementPeriod === "weekly" ? 30 : 90;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const { data, error } = await this.supabase
        .from("system_metrics")
        .select("metric_value")
        .eq("metric_name", metricName)
        .gte("timestamp", startDate.toISOString())
        .not("metric_type", "eq", "baseline");

      if (error || !data) {
        console.warn(`No existing data for ${metricName}:`, error);
        return [];
      }

      return data.map((record) => record.metric_value).filter((val) => val !== null);
    } catch (error) {
      console.error(`Error collecting measurements for ${metricName}:`, error);
      return [];
    }
  }

  /**
   * Calculate baseline statistics from measurements
   */
  private calculateBaselineStatistics(
    metricName: string,
    metricUnit: string,
    measurementPeriod: string,
    measurements: number[],
  ): BaselineMetric {
    // Calculate statistical measures
    const sorted = [...measurements].sort((a, b) => a - b);
    const mean = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    // Use median for more stable baseline (less affected by outliers)
    const baselineValue = median;

    // Calculate confidence level based on sample size and variance
    const variance =
      measurements.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / measurements.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = standardDeviation / mean;

    // Higher confidence for larger samples and lower variance
    const confidenceLevel = Math.min(
      0.95,
      Math.max(0.5, (measurements.length / 100) * (1 - Math.min(1, coefficientOfVariation))),
    );

    return {
      metric_name: metricName,
      metric_value: Number(baselineValue.toFixed(2)),
      metric_unit: metricUnit,
      measurement_period: measurementPeriod as "daily" | "weekly" | "monthly",
      baseline_date: new Date().toISOString(),
      confidence_level: Number(confidenceLevel.toFixed(2)),
      sample_size: measurements.length,
      metadata: {
        mean: Number(mean.toFixed(2)),
        median: Number(median.toFixed(2)),
        standard_deviation: Number(standardDeviation.toFixed(2)),
        min_value: Math.min(...measurements),
        max_value: Math.max(...measurements),
        percentile_95: sorted[Math.floor(sorted.length * 0.95)],
        percentile_5: sorted[Math.floor(sorted.length * 0.05)],
      },
    };
  }

  /**
   * Create default baseline when no measurements exist
   */
  private async createDefaultBaseline(
    metricName: string,
    metricUnit: string,
    measurementPeriod: string,
  ): Promise<BaselineMetric> {
    const defaultValues: Record<string, number> = {
      page_load_time: 1000,
      first_contentful_paint: 800,
      largest_contentful_paint: 1500,
      cumulative_layout_shift: 0.05,
      time_to_interactive: 2000,
      session_duration: 180,
      pages_per_session: 2.5,
      bounce_rate: 50,
      user_retention_rate: 35,
      feature_adoption_rate: 20,
      api_response_time: 200,
      database_query_time: 50,
      error_rate: 0.5,
      uptime_percentage: 99.95,
      memory_usage: 256,
      daily_active_users: 5,
      feature_usage_rate: 25,
      conversion_rate: 3,
      user_satisfaction_score: 4.2,
    };

    const defaultValue = defaultValues[metricName] || 100;

    const baseline: BaselineMetric = {
      metric_name: metricName,
      metric_value: defaultValue,
      metric_unit: metricUnit,
      measurement_period: measurementPeriod as "daily" | "weekly" | "monthly",
      baseline_date: new Date().toISOString(),
      confidence_level: 0.3, // Low confidence for default values
      sample_size: 0,
      metadata: {
        source: "default_value",
        note: "Baseline established using default value due to lack of historical data",
      },
    };

    await this.storeBaseline(baseline);
    return baseline;
  }

  /**
   * Store baseline in database
   */
  private async storeBaseline(baseline: BaselineMetric): Promise<void> {
    try {
      const { error } = await this.supabase.from("system_metrics").insert({
        metric_type: "baseline",
        metric_name: baseline.metric_name,
        metric_value: baseline.metric_value,
        metric_unit: baseline.metric_unit,
        metadata: {
          measurement_period: baseline.measurement_period,
          confidence_level: baseline.confidence_level,
          sample_size: baseline.sample_size,
          ...baseline.metadata,
        },
      });

      if (error) {
        console.error("Error storing baseline:", error);
      }
    } catch (error) {
      console.error("Error storing baseline:", error);
    }
  }

  /**
   * Compare current metrics against baselines
   */
  async compareToBaseline(
    metricName: string,
    currentValue: number,
  ): Promise<BaselineComparison | null> {
    const baseline = this.baselineMetrics.get(metricName);
    if (!baseline) {
      console.warn(`No baseline found for ${metricName}`);
      return null;
    }

    const changePercentage = ((currentValue - baseline.metric_value) / baseline.metric_value) * 100;

    // Determine change direction based on metric type
    const changeDirection = this.determineChangeDirection(metricName, changePercentage);

    // Determine significance level
    const significanceLevel = this.determineSignificanceLevel(
      Math.abs(changePercentage),
      baseline.confidence_level,
    );

    const comparison: BaselineComparison = {
      metric_name: metricName,
      baseline_value: baseline.metric_value,
      current_value: currentValue,
      change_percentage: Number(changePercentage.toFixed(2)),
      change_direction: changeDirection,
      significance_level: significanceLevel,
      measurement_date: new Date().toISOString(),
    };

    // Log significant changes
    if (significanceLevel === "high") {
      console.log(
        `🚨 Significant ${changeDirection} detected in ${metricName}: ${changePercentage.toFixed(1)}%`,
      );

      // Store comparison in database
      await this.storeComparison(comparison);
    }

    return comparison;
  }

  /**
   * Determine if change is improvement or regression
   */
  private determineChangeDirection(
    metricName: string,
    changePercentage: number,
  ): "improvement" | "regression" | "neutral" {
    // Define metrics where lower values are better
    const lowerIsBetter = [
      "page_load_time",
      "first_contentful_paint",
      "largest_contentful_paint",
      "cumulative_layout_shift",
      "time_to_interactive",
      "bounce_rate",
      "api_response_time",
      "database_query_time",
      "error_rate",
      "memory_usage",
    ];

    // Define neutral threshold
    const neutralThreshold = 5; // 5% change considered neutral

    if (Math.abs(changePercentage) < neutralThreshold) {
      return "neutral";
    }

    const isLowerBetter = lowerIsBetter.includes(metricName);
    const isDecrease = changePercentage < 0;

    if ((isLowerBetter && isDecrease) || (!isLowerBetter && !isDecrease)) {
      return "improvement";
    } else {
      return "regression";
    }
  }

  /**
   * Determine significance level of change
   */
  private determineSignificanceLevel(
    absoluteChangePercentage: number,
    confidenceLevel: number,
  ): "low" | "medium" | "high" {
    // Adjust significance thresholds based on confidence level
    const confidenceMultiplier = Math.max(0.5, confidenceLevel);

    const highThreshold = 20 * confidenceMultiplier;
    const mediumThreshold = 10 * confidenceMultiplier;

    if (absoluteChangePercentage >= highThreshold) {
      return "high";
    } else if (absoluteChangePercentage >= mediumThreshold) {
      return "medium";
    } else {
      return "low";
    }
  }

  /**
   * Store comparison in database
   */
  private async storeComparison(comparison: BaselineComparison): Promise<void> {
    try {
      await this.supabase.from("system_metrics").insert({
        metric_type: "baseline_comparison",
        metric_name: comparison.metric_name,
        metric_value: comparison.change_percentage,
        metric_unit: "percentage",
        metadata: {
          baseline_value: comparison.baseline_value,
          current_value: comparison.current_value,
          change_direction: comparison.change_direction,
          significance_level: comparison.significance_level,
        },
      });
    } catch (error) {
      console.error("Error storing comparison:", error);
    }
  }

  /**
   * Generate comprehensive baseline report
   */
  async generateBaselineReport(
    measurementPeriod: "daily" | "weekly" | "monthly" = "daily",
  ): Promise<BaselineReport> {
    try {
      const comparisons: BaselineComparison[] = [];
      const recommendations: string[] = [];

      // Collect current measurements and compare to baselines
      for (const [metricName, baseline] of this.baselineMetrics) {
        if (baseline.measurement_period === measurementPeriod) {
          // Get latest measurement for this metric
          const currentValue = await this.getCurrentMetricValue(metricName);

          if (currentValue !== null) {
            const comparison = await this.compareToBaseline(metricName, currentValue);
            if (comparison) {
              comparisons.push(comparison);

              // Generate recommendations for regressions
              if (
                comparison.change_direction === "regression" &&
                comparison.significance_level === "high"
              ) {
                recommendations.push(this.generateRecommendation(comparison));
              }
            }
          }
        }
      }

      // Calculate summary statistics
      const significantChanges = comparisons.filter((c) => c.significance_level === "high").length;
      const regressions = comparisons.filter((c) => c.change_direction === "regression").length;
      const improvements = comparisons.filter((c) => c.change_direction === "improvement").length;
      const neutralChanges = comparisons.filter((c) => c.change_direction === "neutral").length;

      const report: BaselineReport = {
        report_date: new Date().toISOString(),
        measurement_period: measurementPeriod,
        total_metrics: comparisons.length,
        significant_changes: significantChanges,
        regressions,
        improvements,
        neutral_changes: neutralChanges,
        comparisons,
        recommendations,
      };

      // Store report in database
      await this.storeReport(report);

      return report;
    } catch (error) {
      console.error("Error generating baseline report:", error);
      throw error;
    }
  }

  /**
   * Get current value for a metric
   */
  private async getCurrentMetricValue(metricName: string): Promise<number | null> {
    try {
      const { data, error } = await this.supabase
        .from("system_metrics")
        .select("metric_value")
        .eq("metric_name", metricName)
        .not("metric_type", "eq", "baseline")
        .not("metric_type", "eq", "baseline_comparison")
        .order("timestamp", { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        return null;
      }

      return data[0].metric_value;
    } catch (error) {
      console.error(`Error getting current value for ${metricName}:`, error);
      return null;
    }
  }

  /**
   * Generate recommendation for regression
   */
  private generateRecommendation(comparison: BaselineComparison): string {
    const metricName = comparison.metric_name;
    const changePercentage = comparison.change_percentage;

    const recommendations: Record<string, string> = {
      page_load_time: `Page load time increased by ${Math.abs(changePercentage).toFixed(1)}%. Consider optimizing images, reducing bundle size, or implementing caching.`,
      error_rate: `Error rate increased by ${Math.abs(changePercentage).toFixed(1)}%. Review recent deployments and check error logs for patterns.`,
      api_response_time: `API response time increased by ${Math.abs(changePercentage).toFixed(1)}%. Check database performance and API endpoint optimization.`,
      bounce_rate: `Bounce rate increased by ${Math.abs(changePercentage).toFixed(1)}%. Review landing page performance and user experience.`,
      memory_usage: `Memory usage increased by ${Math.abs(changePercentage).toFixed(1)}%. Check for memory leaks and optimize resource usage.`,
    };

    return (
      recommendations[metricName] ||
      `${metricName} shows regression of ${Math.abs(changePercentage).toFixed(1)}%. Investigation recommended.`
    );
  }

  /**
   * Store report in database
   */
  private async storeReport(report: BaselineReport): Promise<void> {
    try {
      await this.supabase.from("system_metrics").insert({
        metric_type: "baseline_report",
        metric_name: "comprehensive_report",
        metric_value: report.total_metrics,
        metric_unit: "count",
        metadata: report,
      });
    } catch (error) {
      console.error("Error storing report:", error);
    }
  }

  /**
   * Start periodic baseline measurement
   */
  private startPeriodicMeasurement(): void {
    // Run baseline comparison every hour
    this.measurementInterval = setInterval(
      async () => {
        try {
          await this.runPeriodicMeasurement();
        } catch (error) {
          console.error("Error in periodic measurement:", error);
        }
      },
      60 * 60 * 1000,
    ); // Every hour
  }

  /**
   * Run periodic measurement and comparison
   */
  private async runPeriodicMeasurement(): Promise<void> {
    console.log("🔄 Running periodic baseline measurement...");

    // Collect current performance metrics
    const currentMetrics = await this.collectCurrentMetrics();

    // Compare against baselines
    for (const [metricName, currentValue] of Object.entries(currentMetrics)) {
      if (typeof currentValue === "number") {
        await this.compareToBaseline(metricName, currentValue);
      }
    }

    console.log("✅ Periodic baseline measurement completed");
  }

  /**
   * Collect current metrics from various sources
   */
  private async collectCurrentMetrics(): Promise<Record<string, number>> {
    const metrics: Record<string, number> = {};

    try {
      // Get performance metrics (simplified for now)
      metrics.page_load_time = performance.now();
      metrics.memory_usage = (performance as any).memory?.usedJSHeapSize / (1024 * 1024) || 0;

      // Get basic analytics metrics
      const sessionStart = sessionStorage.getItem("neonpro_session_start");
      if (sessionStart) {
        const sessionDuration = (Date.now() - parseInt(sessionStart)) / 1000;
        metrics.session_duration = sessionDuration;
      }

      // Add system health metrics
      metrics.uptime_percentage = 99.9; // This would come from uptime monitoring
      metrics.error_rate = 0.5; // This would come from error tracking

      return metrics;
    } catch (error) {
      console.error("Error collecting current metrics:", error);
      return {};
    }
  }

  /**
   * Get all baselines
   */
  getBaselines(): Map<string, BaselineMetric> {
    return new Map(this.baselineMetrics);
  }

  /**
   * Update baseline for a metric
   */
  async updateBaseline(metricName: string): Promise<BaselineMetric | null> {
    const existingBaseline = this.baselineMetrics.get(metricName);
    if (!existingBaseline) {
      console.warn(`No existing baseline for ${metricName}`);
      return null;
    }

    return await this.establishBaseline(
      metricName,
      existingBaseline.metric_unit,
      existingBaseline.measurement_period,
    );
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.measurementInterval) {
      clearInterval(this.measurementInterval);
    }
  }
}

// Export singleton instance
export const createbaselineManager = () => new BaselineManager();

// Utility functions
export async function establishBaseline(
  metricName: string,
  metricUnit: string,
  measurementPeriod?: "daily" | "weekly" | "monthly",
): Promise<BaselineMetric | null> {
  return baselineManager.establishBaseline(metricName, metricUnit, measurementPeriod);
}

export async function compareToBaseline(
  metricName: string,
  currentValue: number,
): Promise<BaselineComparison | null> {
  return baselineManager.compareToBaseline(metricName, currentValue);
}

export async function generateBaselineReport(
  measurementPeriod?: "daily" | "weekly" | "monthly",
): Promise<BaselineReport> {
  return baselineManager.generateBaselineReport(measurementPeriod);
}
