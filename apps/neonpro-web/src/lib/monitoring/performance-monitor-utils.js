"use strict";
/**
 * Performance Monitor Utilities - VIBECODE V1.0 Monitoring
 * Utility functions for performance monitoring and analysis
 */
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMonitorUtils = exports.PerformanceMonitorUtils = void 0;
var PerformanceMonitorUtils = /** @class */ (function () {
  function PerformanceMonitorUtils() {
    this.thresholds = new Map();
    this.alerts = [];
    this.initializeDefaultThresholds();
  }
  /**
   * Initialize default performance thresholds
   */
  PerformanceMonitorUtils.prototype.initializeDefaultThresholds = function () {
    this.setThreshold("response_time", { metric: "response_time", warning: 1000, critical: 3000 });
    this.setThreshold("memory_usage", { metric: "memory_usage", warning: 80, critical: 95 });
    this.setThreshold("cpu_usage", { metric: "cpu_usage", warning: 70, critical: 90 });
    this.setThreshold("error_rate", { metric: "error_rate", warning: 5, critical: 10 });
  };
  /**
   * Set performance threshold
   */
  PerformanceMonitorUtils.prototype.setThreshold = function (metric, threshold) {
    this.thresholds.set(metric, threshold);
  };
  /**
   * Check if metric exceeds thresholds
   */
  PerformanceMonitorUtils.prototype.checkThresholds = function (metrics) {
    var _a;
    var newAlerts = [];
    for (var _i = 0, metrics_1 = metrics; _i < metrics_1.length; _i++) {
      var metric = metrics_1[_i];
      var threshold = this.thresholds.get(metric.name);
      if (!threshold) continue;
      if (metric.value >= threshold.critical) {
        newAlerts.push({
          metric: metric.name,
          value: metric.value,
          threshold: threshold.critical,
          severity: "critical",
          timestamp: metric.timestamp,
        });
      } else if (metric.value >= threshold.warning) {
        newAlerts.push({
          metric: metric.name,
          value: metric.value,
          threshold: threshold.warning,
          severity: "warning",
          timestamp: metric.timestamp,
        });
      }
    }
    (_a = this.alerts).push.apply(_a, newAlerts);
    return newAlerts;
  };
  /**
   * 📈 Generate performance trends
   */
  PerformanceMonitorUtils.prototype.generateTrends = function (metrics, buckets) {
    if (buckets === void 0) {
      buckets = 10;
    }
    if (metrics.length === 0) return [];
    var sorted = metrics.sort(function (a, b) {
      return a.timestamp - b.timestamp;
    });
    var bucketSize = Math.ceil(sorted.length / buckets);
    var trends = [];
    for (var i = 0; i < buckets; i++) {
      var bucketStart = i * bucketSize;
      var bucketEnd = Math.min((i + 1) * bucketSize, sorted.length);
      var bucketMetrics = sorted.slice(bucketStart, bucketEnd);
      if (bucketMetrics.length > 0) {
        var avgValue =
          bucketMetrics.reduce(function (sum, m) {
            return sum + m.value;
          }, 0) / bucketMetrics.length;
        var timestamp = bucketMetrics[Math.floor(bucketMetrics.length / 2)].timestamp;
        trends.push({
          timestamp: timestamp,
          value: Math.round(avgValue),
          count: bucketMetrics.length,
        });
      }
    }
    return trends;
  };
  /**
   * 🔢 Aggregate metrics with statistical functions
   */
  PerformanceMonitorUtils.prototype.aggregateMetrics = function (metrics) {
    if (metrics.length === 0) {
      return { count: 0, avg: 0, p50: 0, p90: 0, p95: 0, p99: 0, min: 0, max: 0 };
    }
    var values = metrics
      .map(function (m) {
        return m.value;
      })
      .sort(function (a, b) {
        return a - b;
      });
    var sum = values.reduce(function (a, b) {
      return a + b;
    }, 0);
    return {
      count: metrics.length,
      avg: Math.round(sum / metrics.length),
      p50: this.percentile(values, 50),
      p90: this.percentile(values, 90),
      p95: this.percentile(values, 95),
      p99: this.percentile(values, 99),
      min: values[0],
      max: values[values.length - 1],
    };
  };
  /**
   * Calculate percentile
   */
  PerformanceMonitorUtils.prototype.percentile = function (values, p) {
    if (values.length === 0) return 0;
    var index = (p / 100) * (values.length - 1);
    var lower = Math.floor(index);
    var upper = Math.ceil(index);
    if (lower === upper) {
      return values[lower];
    }
    var weight = index - lower;
    return Math.round(values[lower] * (1 - weight) + values[upper] * weight);
  };
  /**
   * Get all alerts
   */
  PerformanceMonitorUtils.prototype.getAlerts = function () {
    return __spreadArray([], this.alerts, true);
  };
  /**
   * Clear old alerts
   */
  PerformanceMonitorUtils.prototype.clearOldAlerts = function (maxAge) {
    if (maxAge === void 0) {
      maxAge = 3600000;
    }
    var cutoff = Date.now() - maxAge;
    this.alerts = this.alerts.filter(function (alert) {
      return alert.timestamp > cutoff;
    });
  };
  /**
   * Get performance score
   */
  PerformanceMonitorUtils.prototype.calculatePerformanceScore = function (metrics) {
    if (metrics.length === 0) return 100;
    var score = 100;
    var recentAlerts = this.alerts.filter(
      function (alert) {
        return Date.now() - alert.timestamp < 300000;
      }, // Last 5 minutes
    );
    // Deduct points for alerts
    for (var _i = 0, recentAlerts_1 = recentAlerts; _i < recentAlerts_1.length; _i++) {
      var alert_1 = recentAlerts_1[_i];
      if (alert_1.severity === "critical") {
        score -= 20;
      } else if (alert_1.severity === "warning") {
        score -= 10;
      }
    }
    return Math.max(0, score);
  };
  /**
   * Generate performance report
   */
  PerformanceMonitorUtils.prototype.generateReport = function (metrics) {
    var aggregated = this.aggregateMetrics(metrics);
    var trends = this.generateTrends(metrics);
    var recentAlerts = this.alerts.filter(
      function (alert) {
        return Date.now() - alert.timestamp < 3600000;
      }, // Last hour
    );
    var score = this.calculatePerformanceScore(metrics);
    return {
      summary: {
        totalMetrics: metrics.length,
        performanceScore: score,
        alertCount: recentAlerts.length,
      },
      aggregated: aggregated,
      trends: trends,
      alerts: recentAlerts,
      timestamp: Date.now(),
    };
  };
  return PerformanceMonitorUtils;
})();
exports.PerformanceMonitorUtils = PerformanceMonitorUtils;
// Export singleton instance
exports.performanceMonitorUtils = new PerformanceMonitorUtils();
