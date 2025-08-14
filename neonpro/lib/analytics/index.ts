/**
 * Analytics Index
 * Epic 10 - Story 10.5: Vision Analytics Dashboard (Real-time Insights)
 * 
 * Central export file for all analytics engines and utilities
 * Provides unified access to vision analytics, performance monitoring, and predictive analytics
 * 
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
 */

// Core Analytics Engines
export {
  VisionAnalyticsEngine,
  visionAnalyticsEngine,
  type VisionMetric,
  type PerformanceMetrics,
  type PatientOutcome,
  type AnalyticsDashboard,
  type DashboardWidget,
  type AnalyticsInsight,
  type TrendAnalysis,
  type CorrelationAnalysis,
  type AnomalyDetection,
  type PerformanceBenchmark,
  type DashboardData,
  type TreatmentEffectivenessAnalysis,
  type PredictiveInsights,
  type ClinicAnalytics,
  VisionMetricSchema
} from './vision-analytics';

export {
  PerformanceMonitoringEngine,
  performanceMonitoringEngine,
  type SystemMetrics,
  type CPUMetrics,
  type MemoryMetrics,
  type StorageMetrics,
  type NetworkMetrics,
  type DatabaseMetrics,
  type ApplicationMetrics,
  type FeatureMetrics,
  type PerformanceAlert,
  type PerformanceThreshold,
  type OptimizationSuggestion,
  type PerformanceReport,
  type PerformanceSummary,
  type ResourceOptimization,
  type RealtimePerformanceData,
  type AIModelPerformance,
  type ModelMetrics,
  type HistoricalMetrics,
  SystemMetricsSchema
} from './performance-monitoring';

export {
  PredictiveAnalyticsEngine,
  predictiveAnalyticsEngine,
  type PredictiveModel,
  type ModelFeature,
  type PredictionRequest,
  type PredictionResult,
  type ForecastRequest,
  type ForecastResult,
  type ModelTrainingRequest,
  type ModelTrainingResult,
  type RiskAssessment,
  type RiskFactor,
  type PredictionExplanation,
  type Recommendation,
  type Evidence,
  type TrendAnalysis as PredictiveTrendAnalysis,
  type SeasonalityAnalysis,
  type ForecastPoint,
  type ModelPerformance,
  type PredictionInsights as PredictivePredictionInsights,
  PredictionRequestSchema,
  ForecastRequestSchema
} from './predictive-analytics';

// Type aliases for common analytics types
export type AnalyticsTimeframe = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type MetricType = 'accuracy' | 'performance' | 'outcome' | 'efficiency' | 'compliance' | 'financial';
export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';
export type PredictionType = 'outcome' | 'complication' | 'satisfaction' | 'recovery' | 'cost' | 'efficiency';
export type PerformanceCategory = 'system' | 'application' | 'database' | 'network' | 'user_experience' | 'ai_models';
export type ModelConfidence = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
export type RiskLevel = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';

// Utility functions for analytics
export const AnalyticsUtils = {
  /**
   * Calculate health score from multiple metrics
   */
  calculateHealthScore: (metrics: Record<string, number>, weights?: Record<string, number>): number => {
    const totalWeight = Object.values(weights || {}).reduce((sum, w) => sum + w, 0) || Object.keys(metrics).length;
    
    return Object.entries(metrics).reduce((score, [key, value]) => {
      const weight = weights?.[key] || 1;
      return score + (value * weight);
    }, 0) / totalWeight;
  },

  /**
   * Determine status from health score
   */
  getStatusFromScore: (score: number): 'optimal' | 'good' | 'degraded' | 'critical' | 'failed' => {
    if (score >= 90) return 'optimal';
    if (score >= 75) return 'good';
    if (score >= 50) return 'degraded';
    if (score >= 25) return 'critical';
    return 'failed';
  },

  /**
   * Format metric value with appropriate units
   */
  formatMetric: (value: number, unit: string, decimals: number = 2): string => {
    const formatted = value.toFixed(decimals);
    
    switch (unit) {
      case '%': return `${formatted}%`;
      case 'ms': return `${formatted}ms`;
      case 'MB': return `${formatted}MB`;
      case 'GB': return `${(value / 1024).toFixed(decimals)}GB`;
      case 'TB': return `${(value / (1024 * 1024)).toFixed(decimals)}TB`;
      case 'bytes': 
        if (value > 1024 * 1024 * 1024) return `${(value / (1024 * 1024 * 1024)).toFixed(decimals)}GB`;
        if (value > 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(decimals)}MB`;
        if (value > 1024) return `${(value / 1024).toFixed(decimals)}KB`;
        return `${formatted} bytes`;
      default: return `${formatted} ${unit}`;
    }
  },

  /**
   * Calculate percentage change between two values
   */
  calculatePercentageChange: (oldValue: number, newValue: number): number => {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  },

  /**
   * Calculate trend direction from data points
   */
  calculateTrendDirection: (values: number[]): 'up' | 'down' | 'stable' | 'volatile' => {
    if (values.length < 2) return 'stable';
    
    const changes = [];
    for (let i = 1; i < values.length; i++) {
      changes.push(values[i] - values[i - 1]);
    }
    
    const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
    const variance = changes.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / changes.length;
    const stdDev = Math.sqrt(variance);
    
    // High variance indicates volatility
    if (stdDev > Math.abs(avgChange) * 2) return 'volatile';
    
    // Determine trend based on average change
    if (avgChange > 0.1) return 'up';
    if (avgChange < -0.1) return 'down';
    return 'stable';
  },

  /**
   * Generate time range dates
   */
  getTimeRangeStart: (timeframe: AnalyticsTimeframe): string => {
    const now = new Date();
    const ranges: Record<AnalyticsTimeframe, number> = {
      realtime: 5 * 60 * 1000,     // 5 minutes
      hourly: 60 * 60 * 1000,      // 1 hour
      daily: 24 * 60 * 60 * 1000,  // 1 day
      weekly: 7 * 24 * 60 * 60 * 1000,    // 1 week
      monthly: 30 * 24 * 60 * 60 * 1000,  // 30 days
      quarterly: 90 * 24 * 60 * 60 * 1000, // 90 days
      yearly: 365 * 24 * 60 * 60 * 1000    // 365 days
    };

    return new Date(now.getTime() - ranges[timeframe]).toISOString();
  },

  /**
   * Validate metric thresholds
   */
  checkThreshold: (value: number, thresholds: { warning: number; critical: number; emergency: number }, operator: 'gt' | 'gte' | 'lt' | 'lte' = 'gte'): AlertSeverity => {
    const checkValue = (threshold: number): boolean => {
      switch (operator) {
        case 'gt': return value > threshold;
        case 'gte': return value >= threshold;
        case 'lt': return value < threshold;
        case 'lte': return value <= threshold;
        default: return false;
      }
    };

    if (checkValue(thresholds.emergency)) return 'emergency';
    if (checkValue(thresholds.critical)) return 'critical';
    if (checkValue(thresholds.warning)) return 'warning';
    return 'info';
  },

  /**
   * Calculate confidence interval
   */
  calculateConfidenceInterval: (values: number[], confidence: number = 0.95): { lower: number; upper: number } => {
    if (values.length === 0) return { lower: 0, upper: 0 };
    
    const sorted = [...values].sort((a, b) => a - b);
    const alpha = 1 - confidence;
    const lowerIndex = Math.floor(alpha / 2 * sorted.length);
    const upperIndex = Math.ceil((1 - alpha / 2) * sorted.length) - 1;
    
    return {
      lower: sorted[lowerIndex] || sorted[0],
      upper: sorted[upperIndex] || sorted[sorted.length - 1]
    };
  },

  /**
   * Calculate moving average
   */
  calculateMovingAverage: (values: number[], window: number): number[] => {
    if (values.length < window) return values;
    
    const result: number[] = [];
    for (let i = window - 1; i < values.length; i++) {
      const windowValues = values.slice(i - window + 1, i + 1);
      const average = windowValues.reduce((sum, val) => sum + val, 0) / window;
      result.push(average);
    }
    
    return result;
  },

  /**
   * Detect anomalies using statistical methods
   */
  detectAnomalies: (values: number[], threshold: number = 2): { indices: number[]; values: number[] } => {
    if (values.length < 3) return { indices: [], values: [] };
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    const anomalies = { indices: [] as number[], values: [] as number[] };
    
    values.forEach((value, index) => {
      const zScore = Math.abs((value - mean) / stdDev);
      if (zScore > threshold) {
        anomalies.indices.push(index);
        anomalies.values.push(value);
      }
    });
    
    return anomalies;
  },

  /**
   * Calculate correlation coefficient between two arrays
   */
  calculateCorrelation: (x: number[], y: number[]): number => {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denominatorX = 0;
    let denominatorY = 0;
    
    for (let i = 0; i < n; i++) {
      const deltaX = x[i] - meanX;
      const deltaY = y[i] - meanY;
      
      numerator += deltaX * deltaY;
      denominatorX += deltaX * deltaX;
      denominatorY += deltaY * deltaY;
    }
    
    const denominator = Math.sqrt(denominatorX * denominatorY);
    return denominator === 0 ? 0 : numerator / denominator;
  },

  /**
   * Generate insights from trend analysis
   */
  generateTrendInsights: (trend: { direction: string; magnitude: number; confidence: number }): string[] => {
    const insights: string[] = [];
    
    if (trend.confidence < 0.5) {
      insights.push('Trend analysis has low confidence due to data variability');
    }
    
    if (trend.direction === 'up' && trend.magnitude > 20) {
      insights.push(`Strong upward trend detected (${trend.magnitude.toFixed(1)}% increase)`);
    } else if (trend.direction === 'down' && trend.magnitude > 20) {
      insights.push(`Strong downward trend detected (${trend.magnitude.toFixed(1)}% decrease)`);
    } else if (trend.direction === 'volatile') {
      insights.push('High volatility detected - consider investigating root causes');
    } else if (trend.direction === 'stable') {
      insights.push('Metrics remain stable within expected ranges');
    }
    
    return insights;
  },

  /**
   * Calculate efficiency score
   */
  calculateEfficiencyScore: (actualValue: number, optimalValue: number, maxValue: number): number => {
    if (maxValue === 0) return 0;
    
    // For metrics where lower is better (like response time)
    if (optimalValue < maxValue) {
      return Math.max(0, Math.min(100, ((maxValue - actualValue) / (maxValue - optimalValue)) * 100));
    }
    
    // For metrics where higher is better (like accuracy)
    return Math.max(0, Math.min(100, (actualValue / optimalValue) * 100));
  },

  /**
   * Generate performance recommendations
   */
  generatePerformanceRecommendations: (
    metrics: Record<string, number>,
    thresholds: Record<string, { optimal: number; warning: number; critical: number }>
  ): Array<{ metric: string; recommendation: string; priority: 'low' | 'medium' | 'high' }> => {
    const recommendations: Array<{ metric: string; recommendation: string; priority: 'low' | 'medium' | 'high' }> = [];
    
    Object.entries(metrics).forEach(([metric, value]) => {
      const threshold = thresholds[metric];
      if (!threshold) return;
      
      if (value >= threshold.critical) {
        recommendations.push({
          metric,
          recommendation: `Critical performance issue detected for ${metric}. Immediate action required.`,
          priority: 'high'
        });
      } else if (value >= threshold.warning) {
        recommendations.push({
          metric,
          recommendation: `Performance degradation detected for ${metric}. Consider optimization.`,
          priority: 'medium'
        });
      } else if (value < threshold.optimal * 0.8) {
        recommendations.push({
          metric,
          recommendation: `${metric} is performing below optimal levels. Monitor for trends.`,
          priority: 'low'
        });
      }
    });
    
    return recommendations;
  }
};

// Constants for common analytics configurations
export const AnalyticsConstants = {
  // Default refresh intervals (milliseconds)
  REFRESH_INTERVALS: {
    REALTIME: 5000,      // 5 seconds
    DASHBOARD: 30000,    // 30 seconds
    REPORTS: 300000,     // 5 minutes
    PREDICTIONS: 3600000 // 1 hour
  },

  // Default thresholds for various metrics
  DEFAULT_THRESHOLDS: {
    CPU_USAGE: { warning: 70, critical: 85, emergency: 95 },
    MEMORY_USAGE: { warning: 75, critical: 90, emergency: 98 },
    RESPONSE_TIME: { warning: 2000, critical: 5000, emergency: 10000 },
    ERROR_RATE: { warning: 1, critical: 5, emergency: 10 },
    ACCURACY: { warning: 90, critical: 85, emergency: 80 }
  },

  // Color schemes for analytics visualizations
  COLOR_SCHEMES: {
    PERFORMANCE: {
      optimal: '#22c55e',    // green-500
      good: '#84cc16',       // lime-500
      degraded: '#f59e0b',   // amber-500
      critical: '#ef4444',   // red-500
      failed: '#dc2626'      // red-600
    },
    RISK: {
      very_low: '#22c55e',   // green-500
      low: '#84cc16',        // lime-500
      moderate: '#f59e0b',   // amber-500
      high: '#ef4444',       // red-500
      very_high: '#dc2626'   // red-600
    },
    TREND: {
      up: '#22c55e',         // green-500
      down: '#ef4444',       // red-500
      stable: '#6b7280',     // gray-500
      volatile: '#f59e0b'    // amber-500
    }
  },

  // Cache TTL values (milliseconds)
  CACHE_TTL: {
    PREDICTIONS: 300000,    // 5 minutes
    METRICS: 60000,         // 1 minute
    REPORTS: 900000,        // 15 minutes
    MODELS: 3600000         // 1 hour
  },

  // Model performance benchmarks
  MODEL_BENCHMARKS: {
    ACCURACY: { excellent: 0.95, good: 0.9, acceptable: 0.85, poor: 0.8 },
    PRECISION: { excellent: 0.95, good: 0.9, acceptable: 0.85, poor: 0.8 },
    RECALL: { excellent: 0.95, good: 0.9, acceptable: 0.85, poor: 0.8 },
    F1_SCORE: { excellent: 0.95, good: 0.9, acceptable: 0.85, poor: 0.8 },
    AUC: { excellent: 0.95, good: 0.9, acceptable: 0.85, poor: 0.8 }
  }
};

// Healthcare-specific analytics configurations
export const HealthcareAnalyticsConfig = {
  // LGPD compliance metrics
  COMPLIANCE_METRICS: {
    DATA_RETENTION: 'data_retention_compliance',
    CONSENT_MANAGEMENT: 'consent_management_score',
    ACCESS_RIGHTS: 'access_rights_fulfillment',
    BREACH_RESPONSE: 'breach_response_time',
    AUDIT_COMPLETENESS: 'audit_trail_completeness'
  },

  // Clinical outcome metrics
  CLINICAL_METRICS: {
    PATIENT_SATISFACTION: 'patient_satisfaction_score',
    TREATMENT_SUCCESS: 'treatment_success_rate',
    COMPLICATION_RATE: 'complication_occurrence_rate',
    RECOVERY_TIME: 'average_recovery_time',
    FOLLOW_UP_COMPLIANCE: 'follow_up_attendance_rate'
  },

  // Aesthetic clinic KPIs
  AESTHETIC_KPIS: {
    AESTHETIC_IMPROVEMENT: 'aesthetic_improvement_score',
    PATIENT_RETENTION: 'patient_retention_rate',
    PROCEDURE_EFFICIENCY: 'procedure_time_efficiency',
    REVENUE_PER_PATIENT: 'average_revenue_per_patient',
    REFERRAL_RATE: 'patient_referral_rate'
  },

  // AI model performance for healthcare
  AI_PERFORMANCE: {
    FACE_DETECTION_ACCURACY: 'face_detection_accuracy',
    AESTHETIC_ANALYSIS_PRECISION: 'aesthetic_analysis_precision',
    COMPLICATION_PREDICTION_RECALL: 'complication_prediction_recall',
    COMPLIANCE_MONITORING_F1: 'compliance_monitoring_f1_score'
  }
};

// Export everything as a comprehensive analytics module
export default {
  // Engines
  visionAnalyticsEngine,
  performanceMonitoringEngine,
  predictiveAnalyticsEngine,
  
  // Utilities
  AnalyticsUtils,
  AnalyticsConstants,
  HealthcareAnalyticsConfig
};