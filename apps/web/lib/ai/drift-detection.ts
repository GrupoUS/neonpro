/**
 * Drift Detection System - Automated Model Performance Monitoring
 *
 * Monitors ML models for data drift, concept drift, and performance degradation
 * with automated alerting within <24h of detection.
 *
 * Part of Advanced ML Pipeline with $1,045,950/ano ROI target
 */

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

type ModelDriftMonitoring = Database["public"]["Tables"]["model_drift_monitoring"]["Row"];
type AIModel = Database["public"]["Tables"]["ai_models"]["Row"];

export interface DriftMetrics {
  dataShiftScore: number; // 0-1 indicating how much input data has shifted
  performanceDriftScore: number; // 0-1 indicating performance degradation
  featureDriftScores: Record<string, number>; // Per-feature drift scores
  predictionDistributionDrift: number; // Changes in prediction distribution
  temporalDriftScore: number; // Time-based pattern changes
  overallDriftScore: number; // Combined drift score
}

export interface DriftAlert {
  modelId: string;
  modelName: string;
  driftType: "data_drift" | "concept_drift" | "performance_drift";
  severity: "low" | "medium" | "high" | "critical";
  driftScore: number;
  threshold: number;
  affectedFeatures: string[];
  detectionTimestamp: Date;
  recommendedActions: string[];
  estimatedImpact: {
    accuracyDrop: number;
    revenueAtRisk: number;
    timeToAction: number; // hours
  };
}

export class DriftDetectionSystem {
  private supabase = createClient();
  private readonly DRIFT_THRESHOLDS = {
    low: 0.03, // 3% drift
    medium: 0.05, // 5% drift
    high: 0.08, // 8% drift
    critical: 0.12, // 12% drift
  };

  /**
   * Main drift detection engine - runs automated checks
   */
  async runDriftDetection(): Promise<DriftAlert[]> {
    const alerts: DriftAlert[] = [];

    try {
      // Get all active models with drift monitoring enabled
      const { data: models, error } = await this.supabase
        .from("ai_models")
        .select("*")
        .eq("is_active", true)
        .not("drift_detection_config", "is", undefined);

      if (error || !models) {
        // console.error("Failed to fetch models for drift detection:", error);
        return alerts;
      }

      for (const model of models) {
        const driftMetrics = await this.analyzeModelDrift(model);

        if (driftMetrics.overallDriftScore > this.DRIFT_THRESHOLDS.low) {
          const alert = await this.createDriftAlert(model, driftMetrics);
          alerts.push(alert);

          // Record in database
          await this.recordDriftDetection(model.id, driftMetrics);

          // Send immediate alert if critical
          if (alert.severity === "critical" || alert.severity === "high") {
            await this.sendImmediateAlert(alert);
          }
        }
      }

      return alerts;
    } catch (error) {
      // console.error("Drift detection system error:", error);
      return alerts;
    }
  }

  /**
   * Analyze drift for a specific model
   */
  private async analyzeModelDrift(model: AIModel): Promise<DriftMetrics> {
    // Get recent predictions and performance data
    const recentWindow = await this.getRecentPredictions(model.id, 7); // Last 7 days
    const referenceWindow = await this.getReferencePredictions(model.id, 30); // Previous 30 days

    // Calculate various drift metrics
    const dataShiftScore = await this.calculateDataShift(
      recentWindow,
      referenceWindow,
    );
    const performanceDriftScore = await this.calculatePerformanceDrift(
      model.id,
    );
    const featureDriftScores = await this.calculateFeatureDrift(
      recentWindow,
      referenceWindow,
    );
    const predictionDistributionDrift = this.calculatePredictionDistributionDrift(
      recentWindow,
      referenceWindow,
    );
    const temporalDriftScore = this.calculateTemporalDrift(recentWindow);

    // Combine scores with weighted average
    const overallDriftScore = this.calculateOverallDrift({
      dataShift: dataShiftScore,
      performance: performanceDriftScore,
      prediction: predictionDistributionDrift,
      temporal: temporalDriftScore,
    });

    return {
      dataShiftScore,
      performanceDriftScore,
      featureDriftScores,
      predictionDistributionDrift,
      temporalDriftScore,
      overallDriftScore,
    };
  }

  /**
   * Get recent predictions for analysis
   */
  private async getRecentPredictions(modelId: string, days: number) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // For no-show model, get predictions from ai_no_show_predictions
    if (modelId.includes("no-show")) {
      const { data, error } = await this.supabase
        .from("ai_no_show_predictions")
        .select("*")
        .gte("created_at", cutoffDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        // console.error("Failed to fetch recent predictions:", error);
        return [];
      }

      return data || [];
    }

    // For other models, get from ai_performance_metrics
    const { data, error } = await this.supabase
      .from("ai_performance_metrics")
      .select("*")
      .eq("model_name", modelId)
      .gte("created_at", cutoffDate.toISOString())
      .order("created_at", { ascending: false });

    return data || [];
  }

  /**
   * Get reference window predictions for comparison
   */
  private async getReferencePredictions(modelId: string, days: number) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 7); // Start from a week ago

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    if (modelId.includes("no-show")) {
      const { data, error } = await this.supabase
        .from("ai_no_show_predictions")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

      return data || [];
    }

    const { data, error } = await this.supabase
      .from("ai_performance_metrics")
      .select("*")
      .eq("model_name", modelId)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: false });

    return data || [];
  }

  /**
   * Calculate data shift between time periods
   */
  private async calculateDataShift(
    recent: unknown[],
    reference: unknown[],
  ): Promise<number> {
    if (recent.length === 0 || reference.length === 0) {
      return 0;
    }

    // For no-show predictions, analyze key features
    if (recent[0]?.risk_score !== undefined) {
      const recentAvgRisk = recent.reduce((sum, p) => sum + p.risk_score, 0) / recent.length;
      const referenceAvgRisk = reference.reduce((sum, p) => sum + p.risk_score, 0)
        / reference.length;

      const riskShift = Math.abs(recentAvgRisk - referenceAvgRisk);

      // Analyze confidence distribution
      const recentAvgConfidence = recent.reduce((sum, p) => sum + p.confidence, 0) / recent.length;
      const referenceAvgConfidence = reference.reduce((sum, p) => sum + p.confidence, 0)
        / reference.length;

      const confidenceShift = Math.abs(
        recentAvgConfidence - referenceAvgConfidence,
      );

      return Math.max(riskShift, confidenceShift);
    }

    // For general metrics, use response time and accuracy shifts
    const recentAvgResponse = recent.reduce((sum, p) => sum + (p.response_time || 0), 0)
      / recent.length;
    const referenceAvgResponse = reference.reduce((sum, p) => sum + (p.response_time || 0), 0)
      / reference.length;

    return (
      Math.abs(recentAvgResponse - referenceAvgResponse)
      / Math.max(referenceAvgResponse, 1)
    );
  }

  /**
   * Calculate performance drift for model
   */
  private async calculatePerformanceDrift(modelId: string): Promise<number> {
    // Get recent performance metrics
    const { data: recentPerformance, error } = await this.supabase
      .from("ai_models")
      .select("performance_metrics")
      .eq("id", modelId)
      .single();

    if (error || !recentPerformance?.performance_metrics) {
      return 0;
    }

    const metrics = recentPerformance.performance_metrics as unknown;

    // For no-show model, target is 95% accuracy
    if (modelId.includes("no-show")) {
      const { 95: targetAccuracy } = 0;
      const currentAccuracy = metrics.accuracy || 0.78;
      return Math.max(0, targetAccuracy - currentAccuracy);
    }

    // General performance drift based on error rate increase
    const { 05: baselineErrorRate } = 0; // 5% baseline
    const currentErrorRate = metrics.errorRate || baselineErrorRate;

    return Math.max(
      0,
      (currentErrorRate - baselineErrorRate) / baselineErrorRate,
    );
  }

  /**
   * Calculate feature-specific drift
   */
  private async calculateFeatureDrift(
    recent: unknown[],
    reference: unknown[],
  ): Promise<Record<string, number>> {
    const featureDrift: Record<string, number> = {};

    if (recent.length === 0 || reference.length === 0) {
      return featureDrift;
    }

    // For no-show predictions, analyze factors
    if (recent[0]?.factors) {
      const recentFactors = this.aggregateFactors(recent);
      const referenceFactors = this.aggregateFactors(reference);

      for (const factor in recentFactors) {
        if (referenceFactors[factor]) {
          const drift = Math.abs(
            recentFactors[factor] - referenceFactors[factor],
          );
          featureDrift[factor] = drift;
        }
      }
    }

    return featureDrift;
  }

  /**
   * Calculate prediction distribution drift
   */
  private calculatePredictionDistributionDrift(
    recent: unknown[],
    reference: unknown[],
  ): number {
    if (recent.length === 0 || reference.length === 0) {
      return 0;
    }

    // For no-show: analyze risk level distribution
    if (recent[0]?.risk_level) {
      const recentDist = this.getRiskDistribution(recent);
      const referenceDist = this.getRiskDistribution(reference);

      // Calculate KL divergence between distributions
      let divergence = 0;
      for (const level in recentDist) {
        if (referenceDist[level] > 0) {
          divergence += recentDist[level]
            * Math.log(recentDist[level] / referenceDist[level]);
        }
      }

      return Math.min(1, divergence); // Cap at 1
    }

    return 0;
  }

  /**
   * Calculate temporal drift (time-based patterns)
   */
  private calculateTemporalDrift(recent: unknown[]): number {
    if (recent.length < 10) {
      return 0;
    } // Need minimum samples

    // Analyze prediction patterns over time
    const timeSlots = this.groupByTimeSlots(recent);

    // Calculate variance in predictions across time slots
    const variances = Object.values(timeSlots).map((slot) => this.calculateVariance(slot as unknown[]));
    const avgVariance = variances.reduce((sum, v) => sum + v, 0) / variances.length;

    return Math.min(1, avgVariance); // Normalize to 0-1
  }

  /**
   * Calculate overall drift score from components
   */
  private calculateOverallDrift(components: {
    dataShift: number;
    performance: number;
    prediction: number;
    temporal: number;
  }): number {
    // Weighted combination - performance drift is most critical
    const weights = {
      dataShift: 0.25,
      performance: 0.4,
      prediction: 0.25,
      temporal: 0.1,
    };

    return (
      components.dataShift * weights.dataShift
      + components.performance * weights.performance
      + components.prediction * weights.prediction
      + components.temporal * weights.temporal
    );
  }

  /**
   * Create drift alert from metrics
   */
  private async createDriftAlert(
    model: AIModel,
    metrics: DriftMetrics,
  ): Promise<DriftAlert> {
    const severity = this.getDriftSeverity(metrics.overallDriftScore);
    const driftType = this.getDriftType(metrics);
    const affectedFeatures = Object.keys(metrics.featureDriftScores)
      .filter((feature) => metrics.featureDriftScores[feature] > 0.05)
      .slice(0, 5);

    return {
      modelId: model.id,
      modelName: model.name,
      driftType,
      severity,
      driftScore: metrics.overallDriftScore,
      threshold: this.DRIFT_THRESHOLDS.low,
      affectedFeatures,
      detectionTimestamp: new Date(),
      recommendedActions: this.getRecommendedActions(severity, driftType),
      estimatedImpact: this.estimateImpact(model, metrics.overallDriftScore),
    };
  }

  private getDriftSeverity(
    score: number,
  ): "low" | "medium" | "high" | "critical" {
    if (score >= this.DRIFT_THRESHOLDS.critical) {
      return "critical";
    }
    if (score >= this.DRIFT_THRESHOLDS.high) {
      return "high";
    }
    if (score >= this.DRIFT_THRESHOLDS.medium) {
      return "medium";
    }
    return "low";
  }

  private getDriftType(
    metrics: DriftMetrics,
  ): "data_drift" | "concept_drift" | "performance_drift" {
    if (metrics.performanceDriftScore > 0.1) {
      return "performance_drift";
    }
    if (metrics.predictionDistributionDrift > 0.1) {
      return "concept_drift";
    }
    return "data_drift";
  }

  private getRecommendedActions(severity: string, type: string): string[] {
    const actions = [];

    if (severity === "critical" || severity === "high") {
      actions.push("Immediate model retraining required");
      actions.push("Consider fallback to previous model version");
      actions.push("Alert ML engineering team");
    }

    if (type === "performance_drift") {
      actions.push("Review recent prediction accuracy");
      actions.push("Analyze failed predictions");
    }

    if (type === "data_drift") {
      actions.push("Investigate data pipeline changes");
      actions.push("Validate feature engineering");
    }

    actions.push("Monitor system closely for next 24 hours");

    return actions;
  }

  private estimateImpact(model: AIModel, driftScore: number) {
    // For no-show model with specific ROI calculations
    if (model.name === "no-show-predictor") {
      const accuracyDrop = driftScore * 0.15; // Estimated accuracy drop
      const monthlyRevenue = 468_750 / 12; // Monthly portion of annual ROI
      const revenueAtRisk = monthlyRevenue * (driftScore / 0.1); // Scale with drift

      return {
        accuracyDrop: Math.round(accuracyDrop * 100), // As percentage
        revenueAtRisk: Math.round(revenueAtRisk),
        timeToAction: driftScore > 0.1 ? 2 : 24, // Hours
      };
    }

    return {
      accuracyDrop: Math.round(driftScore * 10 * 100), // Generic estimation
      revenueAtRisk: Math.round(driftScore * 10_000),
      timeToAction: driftScore > 0.1 ? 4 : 24,
    };
  }

  /**
   * Record drift detection in database
   */
  private async recordDriftDetection(
    modelId: string,
    metrics: DriftMetrics,
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("model_drift_monitoring")
        .insert({
          model_id: modelId,
          drift_score: metrics.overallDriftScore,
          drift_type: this.getDriftType(metrics),
          threshold_breached: metrics.overallDriftScore > this.DRIFT_THRESHOLDS.medium,
          detection_period: `[${new Date().toISOString()}, ${new Date().toISOString()}]`,
          features_affected: Object.keys(metrics.featureDriftScores),
          alert_sent: metrics.overallDriftScore > this.DRIFT_THRESHOLDS.high,
          created_at: new Date().toISOString(),
          metadata: {
            dataShiftScore: metrics.dataShiftScore,
            performanceDriftScore: metrics.performanceDriftScore,
            predictionDistributionDrift: metrics.predictionDistributionDrift,
            temporalDriftScore: metrics.temporalDriftScore,
            featureDriftScores: metrics.featureDriftScores,
          },
        });

      if (error) {
        // console.error("Failed to record drift detection:", error);
      }
    } catch (error) {
      // console.error("Error recording drift detection:", error);
    }
  }

  /**
   * Send immediate alert for critical drift
   */
  private async sendImmediateAlert(alert: DriftAlert): Promise<void> {
    // In production, this would integrate with notification systems
    // console.warn(`🚨 CRITICAL MODEL DRIFT ALERT 🚨`);
    // console.warn(`Model: ${alert.modelName} (${alert.modelId})`);
    // console.warn(`Drift Score: ${(alert.driftScore * 100).toFixed(2)}%`);
    // console.warn(`Severity: ${alert.severity.toUpperCase()}`);
    // console.warn(
      `Revenue at Risk: $${alert.estimatedImpact.revenueAtRisk.toLocaleString()}`,
    );
    // console.warn(`Recommended Actions:`, alert.recommendedActions);

    // Log to audit system
    await this.supabase.from("audit_events").insert({
      event_type: "model_drift_alert",
      table_name: "ai_models",
      record_id: alert.modelId,
      old_values: undefined,
      new_values: {
        alert: alert,
        timestamp: new Date().toISOString(),
      },
      user_id: undefined, // System event
      created_at: new Date().toISOString(),
    });
  }

  // Helper methods
  private aggregateFactors(predictions: unknown[]): Record<string, number> {
    const factorSums: Record<string, number> = {};
    const factorCounts: Record<string, number> = {};

    predictions.forEach((pred) => {
      if (pred.factors && Array.isArray(pred.factors)) {
        pred.factors.forEach((factor: unknown) => {
          if (!factorSums[factor.factor]) {
            factorSums[factor.factor] = 0;
            factorCounts[factor.factor] = 0;
          }
          factorSums[factor.factor] += factor.impact;
          factorCounts[factor.factor]++;
        });
      }
    });

    const averages: Record<string, number> = {};
    for (const factor in factorSums) {
      averages[factor] = factorSums[factor] / factorCounts[factor];
    }

    return averages;
  }

  private getRiskDistribution(predictions: unknown[]): Record<string, number> {
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 };
    const { length: total } = predictions;

    predictions.forEach((pred) => {
      if (pred.risk_level && Object.hasOwn(distribution, pred.risk_level)) {
        distribution[pred.risk_level as keyof typeof distribution]++;
      }
    });

    // Convert to probabilities
    for (const level in distribution) {
      distribution[level as keyof typeof distribution] /= total;
    }

    return distribution;
  }

  private groupByTimeSlots(predictions: unknown[]): Record<string, any[]> {
    const slots: Record<string, any[]> = {};

    predictions.forEach((pred) => {
      const hour = new Date(pred.created_at).getHours();
      const timeSlot = `${Math.floor(hour / 4) * 4}-${Math.floor(hour / 4) * 4 + 3}h`;

      if (!slots[timeSlot]) {
        slots[timeSlot] = [];
      }
      slots[timeSlot].push(pred);
    });

    return slots;
  }

  private calculateVariance(values: unknown[]): number {
    if (values.length < 2) {
      return 0;
    }

    const risks = values.map((v) => v.risk_score || 0);
    const mean = risks.reduce((sum, r) => sum + r, 0) / risks.length;
    const variance = risks.reduce((sum, r) => sum + (r - mean) ** 2, 0) / risks.length;

    return variance;
  }

  /**
   * Schedule automated drift detection (called by cron job)
   */
  async scheduleAutomatedCheck(): Promise<void> {
    // console.log("🔍 Starting automated drift detection...");

    const alerts = await this.runDriftDetection();

    // console.log(`✅ Drift detection complete. Found ${alerts.length} alerts.`);

    if (alerts.length > 0) {
      const criticalAlerts = alerts.filter((a) => a.severity === "critical");
      const highAlerts = alerts.filter((a) => a.severity === "high");

      // console.log(
        `🚨 Critical: ${criticalAlerts.length}, High: ${highAlerts.length}`,
      );
    }
  }
}

// Singleton instance
export const driftDetector = new DriftDetectionSystem();

export type { DriftAlert, DriftMetrics };
