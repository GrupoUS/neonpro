/**
 * Performance Monitoring Utilities
 *
 * Helper functions and utilities for performance monitoring.
 */

import type {
  CustomMetric,
  HealthcareMetricName,
  PerformanceThresholds,
} from '../types';

/**
 * Performance thresholds for healthcare applications
 */
export const HEALTHCARE_THRESHOLDS: PerformanceThresholds = {
  webVitals: {
    CLS: { good: 0.1, needsImprovement: 0.25 },
    FCP: { good: 1800, needsImprovement: 3000 },
    FID: { good: 100, needsImprovement: 300 },
    INP: { good: 200, needsImprovement: 500 },
    LCP: { good: 2500, needsImprovement: 4000 },
    TTFB: { good: 800, needsImprovement: 1800 },
  },
  healthcare: {
    patient_search_time: { good: 500, needsImprovement: 1000 },
    form_submission_time: { good: 1000, needsImprovement: 2000 },
    data_encryption_time: { good: 200, needsImprovement: 500 },
    database_query_time: { good: 300, needsImprovement: 800 },
    image_upload_time: { good: 3000, needsImprovement: 8000 },
    report_generation_time: { good: 2000, needsImprovement: 5000 },
    auth_verification_time: { good: 800, needsImprovement: 1500 },
    compliance_check_time: { good: 400, needsImprovement: 1000 },
  },
};

/**
 * Hash sensitive data for privacy compliance
 */
export function hashSensitiveData(data: string): string {
  // Simple hash function - in production, use crypto.subtle or similar
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Sanitize data by removing sensitive fields
 */
export function sanitizeData(data: any, excludeFields: string[]): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = { ...data };

  for (const field of excludeFields) {
    if (field in sanitized) {
      if (typeof sanitized[field] === 'string' && sanitized[field].length > 0) {
        sanitized[field] = hashSensitiveData(sanitized[field]);
      } else {
        delete sanitized[field];
      }
    }
  }

  return sanitized;
}

/**
 * Calculate performance rating based on thresholds
 */
export function calculateRating(
  metricName: HealthcareMetricName,
  value: number,
  thresholds: PerformanceThresholds = HEALTHCARE_THRESHOLDS
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = thresholds.healthcare[metricName];

  if (value <= threshold.good) {
    return 'good';
  }
  if (value <= threshold.needsImprovement) {
    return 'needs-improvement';
  }
  return 'poor';
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${Math.round(milliseconds)}ms`;
  }
  if (milliseconds < 60_000) {
    return `${(milliseconds / 1000).toFixed(1)}s`;
  }
  const minutes = Math.floor(milliseconds / 60_000);
  const seconds = ((milliseconds % 60_000) / 1000).toFixed(0);
  return `${minutes}m ${seconds}s`;
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)}${units[unitIndex]}`;
}

/**
 * Get performance insights based on metrics
 */
export function getPerformanceInsights(metrics: CustomMetric[]): {
  insights: string[];
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
} {
  const insights: string[] = [];
  const recommendations: string[] = [];
  let severity: 'low' | 'medium' | 'high' = 'low';

  // Group metrics by name
  const metricGroups: Record<string, CustomMetric[]> = {};
  metrics.forEach((metric) => {
    if (!metricGroups[metric.name]) {
      metricGroups[metric.name] = [];
    }
    metricGroups[metric.name].push(metric);
  });

  // Analyze each metric type
  Object.entries(metricGroups).forEach(([name, values]) => {
    const avgValue =
      values.reduce((sum, m) => sum + m.value, 0) / values.length;
    const poorCount = values.filter((m) => m.rating === 'poor').length;
    const poorPercentage = (poorCount / values.length) * 100;

    if (poorPercentage > 20) {
      severity = 'high';
      insights.push(
        `${name}: ${poorPercentage.toFixed(1)}% of operations are performing poorly`
      );

      switch (name) {
        case 'patient_search_time':
          recommendations.push(
            'Optimize patient search with database indexing and caching'
          );
          break;
        case 'form_submission_time':
          recommendations.push(
            'Implement client-side validation and optimize API endpoints'
          );
          break;
        case 'data_encryption_time':
          recommendations.push(
            'Consider hardware encryption or optimized encryption algorithms'
          );
          break;
        case 'database_query_time':
          recommendations.push(
            'Review database queries and add appropriate indexes'
          );
          break;
        case 'image_upload_time':
          recommendations.push(
            'Implement progressive upload and image compression'
          );
          break;
        case 'report_generation_time':
          recommendations.push(
            'Implement background processing and caching for reports'
          );
          break;
        case 'auth_verification_time':
          recommendations.push(
            'Optimize authentication flow and consider caching strategies'
          );
          break;
        case 'compliance_check_time':
          recommendations.push(
            'Cache compliance rules and implement batch processing'
          );
          break;
      }
    } else if (poorPercentage > 10) {
      if (severity === 'low') {
        severity = 'medium';
      }
      insights.push(
        `${name}: ${poorPercentage.toFixed(1)}% of operations need improvement`
      );
    }

    if (
      avgValue >
      HEALTHCARE_THRESHOLDS.healthcare[name as HealthcareMetricName]
        ?.needsImprovement
    ) {
      insights.push(
        `${name}: Average performance (${formatDuration(avgValue)}) exceeds acceptable thresholds`
      );
    }
  });

  // General recommendations based on patterns
  if (metricGroups.database_query_time && metricGroups.form_submission_time) {
    const dbSlow =
      metricGroups.database_query_time.filter((m) => m.rating === 'poor')
        .length > 0;
    const formSlow =
      metricGroups.form_submission_time.filter((m) => m.rating === 'poor')
        .length > 0;

    if (dbSlow && formSlow) {
      recommendations.push(
        'Database performance issues are affecting form submissions - prioritize database optimization'
      );
    }
  }

  if (insights.length === 0) {
    insights.push(
      'All healthcare operations are performing within acceptable thresholds'
    );
    recommendations.push(
      'Continue monitoring and consider implementing proactive performance testing'
    );
  }

  return { insights, recommendations, severity };
}

/**
 * Create performance alert message
 */
export function createAlertMessage(
  metricName: HealthcareMetricName,
  value: number,
  threshold: number,
  context?: Record<string, any>
): string {
  const formattedValue = formatDuration(value);
  const formattedThreshold = formatDuration(threshold);

  let baseMessage = `${metricName} performance alert: ${formattedValue} (threshold: ${formattedThreshold})`;

  if (context?.feature) {
    baseMessage += ` in ${context.feature}`;
  }

  if (context?.userRole) {
    baseMessage += ` for ${context.userRole}`;
  }

  return baseMessage;
}

/**
 * Calculate percentile from array of values
 */
export function calculatePercentile(
  values: number[],
  percentile: number
): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;

  return sorted[Math.max(0, index)] ?? 0;
}

/**
 * Calculate standard deviation
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => (val - mean) ** 2);
  const avgSquaredDiff =
    squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

  return Math.sqrt(avgSquaredDiff);
}

/**
 * Detect performance anomalies using statistical analysis
 */
export function detectAnomalies(
  metrics: CustomMetric[],
  threshold = 2 // standard deviations
): CustomMetric[] {
  const metricGroups: Record<string, number[]> = {};

  // Group values by metric name
  metrics.forEach((metric) => {
    if (!metricGroups[metric.name]) {
      metricGroups[metric.name] = [];
    }
    metricGroups[metric.name].push(metric.value);
  });

  const anomalies: CustomMetric[] = [];

  // Check each metric for anomalies
  metrics.forEach((metric) => {
    const values = metricGroups[metric.name];
    if (!values || values.length < 10) {
      return; // Need sufficient data
    }

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = calculateStandardDeviation(values);

    // Check if this metric is an anomaly
    const zScore = Math.abs(metric.value - mean) / stdDev;
    if (zScore > threshold) {
      anomalies.push(metric);
    }
  });

  return anomalies;
}

/**
 * Generate performance score (0-100)
 */
export function calculatePerformanceScore(metrics: CustomMetric[]): number {
  if (metrics.length === 0) {
    return 100;
  }

  const scores = metrics.map((metric) => {
    const rating = metric.rating;
    switch (rating) {
      case 'good':
        return 100;
      case 'needs-improvement':
        return 75;
      case 'poor':
        return 25;
      default:
        return 50;
    }
  });

  return Math.round(
    scores.reduce((sum, score) => sum + score, 0) / scores.length
  );
}

/**
 * Format metric for display
 */
export function formatMetricForDisplay(metric: CustomMetric): {
  name: string;
  value: string;
  rating: string;
  context: string;
} {
  const displayName = metric.name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
  const formattedValue = formatDuration(metric.value);
  const ratingColor =
    metric.rating === 'good'
      ? 'green'
      : metric.rating === 'needs-improvement'
        ? 'yellow'
        : 'red';

  let context = '';
  if (metric.context?.feature) {
    context += `Feature: ${metric.context.feature}`;
  }
  if (metric.context?.userRole) {
    context += context
      ? `, Role: ${metric.context.userRole}`
      : `Role: ${metric.context.userRole}`;
  }

  return {
    name: displayName,
    value: formattedValue,
    rating: `${metric.rating} (${ratingColor})`,
    context,
  };
}

/**
 * Export utilities for browser environment
 */
export const BrowserUtils = {
  hashSensitiveData,
  sanitizeData,
  calculateRating,
  formatDuration,
  formatFileSize,
  calculatePercentile,
  calculatePerformanceScore,
  formatMetricForDisplay,
};

/**
 * Export utilities for server environment
 */
export const ServerUtils = {
  ...BrowserUtils,
  getPerformanceInsights,
  createAlertMessage,
  calculateStandardDeviation,
  detectAnomalies,
  HEALTHCARE_THRESHOLDS,
};
