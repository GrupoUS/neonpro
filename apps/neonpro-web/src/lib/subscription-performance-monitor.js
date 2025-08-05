/**
 * Subscription Performance Monitor
 *
 * Advanced performance monitoring system for subscription operations.
 * Tracks metrics, identifies bottlenecks, and provides optimization recommendations.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionPerformanceMonitor = exports.SubscriptionPerformanceMonitor = void 0;
var SubscriptionPerformanceMonitor = /** @class */ (() => {
  function SubscriptionPerformanceMonitor() {
    this.alerts = [];
    this.recommendations = [];
    this.timers = new Map();
    this.responseTimeHistory = [];
    this.maxHistorySize = 1000;
    // Performance thresholds
    this.thresholds = {
      responseTime: {
        warning: 200,
        critical: 500,
      },
      cacheHitRate: {
        warning: 0.85,
        critical: 0.7,
      },
      dbQueryTime: {
        warning: 100,
        critical: 300,
      },
      realtimeLatency: {
        warning: 1000,
        critical: 3000,
      },
    };
    this.metrics = {
      subscriptionChecks: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
      },
      caching: {
        hitRate: 0,
        missRate: 0,
        averageRetrievalTime: 0,
        totalCacheSize: 0,
        evictionCount: 0,
      },
      database: {
        queryCount: 0,
        averageQueryTime: 0,
        slowQueries: 0,
        connectionPoolUsage: 0,
      },
      realtime: {
        activeConnections: 0,
        messagesPerSecond: 0,
        averageLatency: 0,
        reconnectRate: 0,
      },
    };
    // Start background monitoring
    this.startMonitoring();
  }
  /**
   * Start timing a subscription operation
   */
  SubscriptionPerformanceMonitor.prototype.startTimer = function (operation) {
    var timerId = "".concat(operation, "_").concat(Date.now(), "_").concat(Math.random());
    this.timers.set(timerId, performance.now());
    return timerId;
  };
  /**
   * End timing and record metrics
   */
  SubscriptionPerformanceMonitor.prototype.endTimer = function (timerId, success) {
    if (success === void 0) {
      success = true;
    }
    var startTime = this.timers.get(timerId);
    if (!startTime) {
      console.warn("Timer ".concat(timerId, " not found"));
      return 0;
    }
    var duration = performance.now() - startTime;
    this.timers.delete(timerId);
    // Record metrics
    this.recordSubscriptionCheck(duration, success);
    return duration;
  };
  /**
   * Record subscription check metrics
   */
  SubscriptionPerformanceMonitor.prototype.recordSubscriptionCheck = function (duration, success) {
    this.metrics.subscriptionChecks.total++;
    if (success) {
      this.metrics.subscriptionChecks.successful++;
    } else {
      this.metrics.subscriptionChecks.failed++;
    }
    // Update response time history
    this.responseTimeHistory.push(duration);
    if (this.responseTimeHistory.length > this.maxHistorySize) {
      this.responseTimeHistory.shift();
    }
    // Calculate percentiles
    this.updateResponseTimeMetrics();
    // Check for performance alerts
    this.checkPerformanceAlerts("responseTime", duration);
  };
  /**
   * Record cache operation metrics
   */
  SubscriptionPerformanceMonitor.prototype.recordCacheOperation = function (hit, retrievalTime) {
    if (hit) {
      this.metrics.caching.hitRate = this.calculateHitRate(true);
    } else {
      this.metrics.caching.missRate = this.calculateHitRate(false);
    }
    this.metrics.caching.averageRetrievalTime = this.updateAverage(
      this.metrics.caching.averageRetrievalTime,
      retrievalTime,
      this.metrics.subscriptionChecks.total,
    );
    // Check cache performance
    this.checkPerformanceAlerts("cacheHitRate", this.metrics.caching.hitRate);
  };
  /**
   * Record database operation metrics
   */
  SubscriptionPerformanceMonitor.prototype.recordDatabaseOperation = function (queryTime) {
    this.metrics.database.queryCount++;
    this.metrics.database.averageQueryTime = this.updateAverage(
      this.metrics.database.averageQueryTime,
      queryTime,
      this.metrics.database.queryCount,
    );
    if (queryTime > this.thresholds.dbQueryTime.critical) {
      this.metrics.database.slowQueries++;
    }
    this.checkPerformanceAlerts("dbQueryTime", queryTime);
  };
  /**
   * Record realtime operation metrics
   */
  SubscriptionPerformanceMonitor.prototype.recordRealtimeOperation = function (
    latency,
    connectionsCount,
  ) {
    this.metrics.realtime.averageLatency = this.updateAverage(
      this.metrics.realtime.averageLatency,
      latency,
      connectionsCount,
    );
    this.metrics.realtime.activeConnections = connectionsCount;
    this.checkPerformanceAlerts("realtimeLatency", latency);
  };
  /**
   * Update response time percentiles
   */
  SubscriptionPerformanceMonitor.prototype.updateResponseTimeMetrics = function () {
    if (this.responseTimeHistory.length === 0) return;
    var sorted = __spreadArray([], this.responseTimeHistory, true).sort((a, b) => a - b);
    var p95Index = Math.floor(sorted.length * 0.95);
    var p99Index = Math.floor(sorted.length * 0.99);
    this.metrics.subscriptionChecks.averageResponseTime =
      this.responseTimeHistory.reduce((a, b) => a + b, 0) / this.responseTimeHistory.length;
    this.metrics.subscriptionChecks.p95ResponseTime = sorted[p95Index] || 0;
    this.metrics.subscriptionChecks.p99ResponseTime = sorted[p99Index] || 0;
  };
  /**
   * Calculate hit rate
   */
  SubscriptionPerformanceMonitor.prototype.calculateHitRate = (hit) => {
    // This would integrate with actual cache stats
    return hit ? 0.95 : 0.05; // Placeholder
  };
  /**
   * Update running average
   */
  SubscriptionPerformanceMonitor.prototype.updateAverage = (currentAverage, newValue, count) =>
    (currentAverage * (count - 1) + newValue) / count;
  /**
   * Check for performance alerts
   */
  SubscriptionPerformanceMonitor.prototype.checkPerformanceAlerts = function (metric, value) {
    var thresholdConfig = this.getThresholdConfig(metric);
    if (!thresholdConfig) return;
    if (value >= thresholdConfig.critical) {
      this.createAlert("critical", metric, value, thresholdConfig.critical);
    } else if (value >= thresholdConfig.warning) {
      this.createAlert("warning", metric, value, thresholdConfig.warning);
    }
  };
  /**
   * Get threshold configuration for metric
   */
  SubscriptionPerformanceMonitor.prototype.getThresholdConfig = function (metric) {
    switch (metric) {
      case "responseTime":
        return this.thresholds.responseTime;
      case "cacheHitRate":
        return {
          warning: this.thresholds.cacheHitRate.warning,
          critical: this.thresholds.cacheHitRate.critical,
        };
      case "dbQueryTime":
        return this.thresholds.dbQueryTime;
      case "realtimeLatency":
        return this.thresholds.realtimeLatency;
      default:
        return null;
    }
  };
  /**
   * Create performance alert
   */
  SubscriptionPerformanceMonitor.prototype.createAlert = function (type, metric, value, threshold) {
    var alert = {
      id: "alert_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
      type: type,
      component: this.getComponentForMetric(metric),
      message: this.getAlertMessage(metric, value, threshold),
      metric: metric,
      value: value,
      threshold: threshold,
      timestamp: new Date(),
      resolved: false,
    };
    this.alerts.push(alert);
    // Keep only recent alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
    // Generate recommendations
    this.generateRecommendations(metric, value, threshold);
  };
  /**
   * Get component name for metric
   */
  SubscriptionPerformanceMonitor.prototype.getComponentForMetric = (metric) => {
    if (metric.includes("cache")) return "cache";
    if (metric.includes("db") || metric.includes("Query")) return "database";
    if (metric.includes("realtime") || metric.includes("Latency")) return "realtime";
    return "subscription";
  };
  /**
   * Generate alert message
   */
  SubscriptionPerformanceMonitor.prototype.getAlertMessage = (metric, value, threshold) => {
    var messages = {
      responseTime: "Subscription response time ("
        .concat(value.toFixed(2), "ms) exceeds threshold (")
        .concat(threshold, "ms)"),
      cacheHitRate: "Cache hit rate ("
        .concat((value * 100).toFixed(2), "%) below threshold (")
        .concat((threshold * 100).toFixed(2), "%)"),
      dbQueryTime: "Database query time ("
        .concat(value.toFixed(2), "ms) exceeds threshold (")
        .concat(threshold, "ms)"),
      realtimeLatency: "Realtime latency ("
        .concat(value.toFixed(2), "ms) exceeds threshold (")
        .concat(threshold, "ms)"),
    };
    return messages[metric] || "".concat(metric, " performance issue detected");
  };
  /**
   * Generate optimization recommendations
   */
  SubscriptionPerformanceMonitor.prototype.generateRecommendations = function (
    metric,
    value,
    threshold,
  ) {
    var recommendations = {
      responseTime: {
        id: "rec_".concat(Date.now(), "_response_time"),
        priority: "high",
        component: "Subscription Middleware",
        issue: "High response times for subscription checks",
        recommendation: "Implement Redis caching layer and optimize database queries",
        estimatedImpact: "60-80% reduction in response time",
        implementationEffort: "medium",
      },
      cacheHitRate: {
        id: "rec_".concat(Date.now(), "_cache_hit"),
        priority: "medium",
        component: "Cache System",
        issue: "Low cache hit rate affecting performance",
        recommendation: "Increase cache TTL and implement cache warming strategies",
        estimatedImpact: "20-40% improvement in response time",
        implementationEffort: "low",
      },
      dbQueryTime: {
        id: "rec_".concat(Date.now(), "_db_query"),
        priority: "high",
        component: "Database",
        issue: "Slow database queries",
        recommendation: "Add database indexes and optimize query patterns",
        estimatedImpact: "50-70% reduction in query time",
        implementationEffort: "medium",
      },
    };
    var recommendation = recommendations[metric];
    if (
      recommendation &&
      !this.recommendations.find((r) => r.component === recommendation.component)
    ) {
      this.recommendations.push(recommendation);
    }
  };
  /**
   * Start background monitoring
   */
  SubscriptionPerformanceMonitor.prototype.startMonitoring = function () {
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000); // Every 30 seconds
  };
  /**
   * Collect system metrics
   */
  SubscriptionPerformanceMonitor.prototype.collectSystemMetrics = function () {
    // Collect memory usage
    if (typeof process !== "undefined" && process.memoryUsage) {
      var memUsage = process.memoryUsage();
      // Update cache size estimate
      this.metrics.caching.totalCacheSize = memUsage.heapUsed;
    }
  };
  /**
   * Get current metrics
   */
  SubscriptionPerformanceMonitor.prototype.getMetrics = function () {
    return __assign({}, this.metrics);
  };
  /**
   * Get active alerts
   */
  SubscriptionPerformanceMonitor.prototype.getAlerts = function () {
    return this.alerts.filter((alert) => !alert.resolved);
  };
  /**
   * Get optimization recommendations
   */
  SubscriptionPerformanceMonitor.prototype.getRecommendations = function () {
    return __spreadArray([], this.recommendations, true);
  };
  /**
   * Resolve alert
   */
  SubscriptionPerformanceMonitor.prototype.resolveAlert = function (alertId) {
    var alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  };
  /**
   * Get performance report
   */
  SubscriptionPerformanceMonitor.prototype.getPerformanceReport = function () {
    var activeAlerts = this.getAlerts();
    var criticalAlerts = activeAlerts.filter((a) => a.type === "critical");
    var warningAlerts = activeAlerts.filter((a) => a.type === "warning");
    var overallHealth = "excellent";
    if (criticalAlerts.length > 0) {
      overallHealth = "critical";
    } else if (warningAlerts.length > 2) {
      overallHealth = "warning";
    } else if (warningAlerts.length > 0) {
      overallHealth = "good";
    }
    var primaryIssues = activeAlerts.slice(0, 3).map((alert) => alert.message);
    var topRecommendations = this.recommendations
      .filter((r) => r.priority === "high")
      .slice(0, 3)
      .map((r) => r.recommendation);
    return {
      metrics: this.getMetrics(),
      alerts: activeAlerts,
      recommendations: this.getRecommendations(),
      summary: {
        overallHealth: overallHealth,
        primaryIssues: primaryIssues,
        topRecommendations: topRecommendations,
      },
    };
  };
  return SubscriptionPerformanceMonitor;
})();
exports.SubscriptionPerformanceMonitor = SubscriptionPerformanceMonitor;
// Global performance monitor instance
exports.subscriptionPerformanceMonitor = new SubscriptionPerformanceMonitor();
