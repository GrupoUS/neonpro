/**
 * 📊 NeonPro Performance Monitor
 *
 * Sistema inteligente de monitoramento que coleta métricas críticas
 * com zero impacto na performance da aplicação
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMonitor = exports.PerformanceMonitor = void 0;
var lru_cache_1 = require("lru-cache");
/**
 * Cache inteligente para métricas (máximo 1000 entradas, TTL 5 minutos)
 */
var metricsCache = new lru_cache_1.LRUCache({
  max: 1000,
  ttl: 5 * 60 * 1000, // 5 minutes
});
/**
 * Cache para agregações (reduz computação repetida)
 */
var aggregationCache = new lru_cache_1.LRUCache({
  max: 200,
  ttl: 30 * 1000, // 30 seconds
});
var PerformanceMonitor = /** @class */ (() => {
  function PerformanceMonitor() {
    this.metrics = [];
    this.maxMetrics = 10000; // Limit memory usage
  }
  PerformanceMonitor.getInstance = () => {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  };
  /**
   * 🚀 Record API performance (zero-overhead async)
   */
  PerformanceMonitor.prototype.recordAPIPerformance = function (data) {
    // Async recording to not block main thread
    setImmediate(() => {
      var metric = {
        name: "api.".concat(data.route, ".").concat(data.method.toLowerCase()),
        value: data.responseTime,
        unit: "ms",
        timestamp: data.timestamp,
        route: data.route,
        userId: data.userId,
        clinicId: data.clinicId,
        metadata: {
          statusCode: data.statusCode,
          requestSize: data.requestSize,
          responseSize: data.responseSize,
          userAgent: data.userAgent,
        },
      };
      this.addMetric(metric);
    });
  };
  /**
   * 📱 Record client-side performance
   */
  PerformanceMonitor.prototype.recordClientPerformance = function (name, value, metadata) {
    var metric = {
      name: "client.".concat(name),
      value: value,
      unit: "ms",
      timestamp: Date.now(),
      metadata: metadata,
    };
    this.addMetric(metric);
  };
  /**
   * 🗄️ Record database performance
   */
  PerformanceMonitor.prototype.recordDatabasePerformance = function (
    operation,
    duration,
    metadata,
  ) {
    var metric = {
      name: "db.".concat(operation),
      value: duration,
      unit: "ms",
      timestamp: Date.now(),
      metadata: metadata,
    };
    this.addMetric(metric);
  };
  /**
   * ⚡ Get real-time performance summary
   */
  PerformanceMonitor.prototype.getPerformanceSummary = function (timeWindow) {
    if (timeWindow === void 0) {
      timeWindow = 5 * 60 * 1000;
    }
    var cacheKey = "summary_".concat(timeWindow, "_").concat(Date.now() - (Date.now() % 30000));
    var cached = aggregationCache.get(cacheKey);
    if (cached) return cached;
    var now = Date.now();
    var recentMetrics = this.metrics.filter((m) => now - m.timestamp <= timeWindow);
    var apiMetrics = recentMetrics.filter((m) => m.name.startsWith("api."));
    var dbMetrics = recentMetrics.filter((m) => m.name.startsWith("db."));
    var clientMetrics = recentMetrics.filter((m) => m.name.startsWith("client."));
    var summary = {
      apiPerformance: this.aggregateMetrics(apiMetrics),
      databasePerformance: this.aggregateMetrics(dbMetrics),
      clientPerformance: this.aggregateMetrics(clientMetrics),
      alerts: this.generateAlerts(recentMetrics),
    };
    aggregationCache.set(cacheKey, summary);
    return summary;
  };
  /**
   * 🎯 Get performance for specific route/operation
   */
  PerformanceMonitor.prototype.getRoutePerformance = function (route, timeWindow) {
    if (timeWindow === void 0) {
      timeWindow = 30 * 60 * 1000;
    }
    var now = Date.now();
    var routeMetrics = this.metrics.filter(
      (m) => m.route === route && now - m.timestamp <= timeWindow,
    );
    if (routeMetrics.length === 0) {
      return { p50: 0, p90: 0, p95: 0, p99: 0, count: 0, errorRate: 0, trends: [] };
    }
    var values = routeMetrics.map((m) => m.value).sort((a, b) => a - b);
    var errors = routeMetrics.filter((m) => {
      var _a;
      return ((_a = m.metadata) === null || _a === void 0 ? void 0 : _a.statusCode) >= 400;
    }).length;
    return {
      p50: this.percentile(values, 50),
      p90: this.percentile(values, 90),
      p95: this.percentile(values, 95),
      p99: this.percentile(values, 99),
      count: routeMetrics.length,
      errorRate: (errors / routeMetrics.length) * 100,
      trends: this.generateTrends(routeMetrics),
    };
  };
  /**
   * ⚠️ Generate intelligent alerts
   */
  PerformanceMonitor.prototype.generateAlerts = (metrics) => {
    var alerts = [];
    // API performance alerts
    var apiMetrics = metrics.filter((m) => m.name.startsWith("api."));
    if (apiMetrics.length > 0) {
      var slowAPIs = apiMetrics.filter((m) => m.value > 1000); // >1s
      if (slowAPIs.length > apiMetrics.length * 0.05) {
        // >5% slow
        alerts.push(
          "High API latency detected: "
            .concat(slowAPIs.length, "/")
            .concat(apiMetrics.length, " requests >1s"),
        );
      }
      var errors = apiMetrics.filter((m) => {
        var _a;
        return ((_a = m.metadata) === null || _a === void 0 ? void 0 : _a.statusCode) >= 500;
      });
      if (errors.length > 0) {
        alerts.push("".concat(errors.length, " server errors in last period"));
      }
    }
    // Database performance alerts
    var dbMetrics = metrics.filter((m) => m.name.startsWith("db."));
    if (dbMetrics.length > 0) {
      var slowQueries = dbMetrics.filter((m) => m.value > 500); // >500ms
      if (slowQueries.length > dbMetrics.length * 0.1) {
        // >10% slow
        alerts.push(
          "Slow database queries detected: "
            .concat(slowQueries.length, "/")
            .concat(dbMetrics.length, " queries >500ms"),
        );
      }
    }
    return alerts;
  };
  /**
   * 📊 Calculate percentile
   */
  PerformanceMonitor.prototype.percentile = (values, p) => {
    if (values.length === 0) return 0;
    var index = Math.ceil((p / 100) * values.length) - 1;
    return values[Math.max(0, index)];
  };
  /**
   * 📈 Generate performance trends
   */
  PerformanceMonitor.prototype.generateTrends = (metrics, buckets) => {
    if (buckets === void 0) {
      buckets = 10;
    }
    if (metrics.length === 0) return [];
    var sorted = metrics.sort((a, b) => a.timestamp - b.timestamp);
    var bucketSize = Math.ceil(sorted.length / buckets);
    var trends = [];
    for (var i = 0; i < buckets; i++) {
      var bucketStart = i * bucketSize;
      var bucketEnd = Math.min((i + 1) * bucketSize, sorted.length);
      var bucketMetrics = sorted.slice(bucketStart, bucketEnd);
      if (bucketMetrics.length > 0) {
        var avgValue = bucketMetrics.reduce((sum, m) => sum + m.value, 0) / bucketMetrics.length;
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
  PerformanceMonitor.prototype.aggregateMetrics = function (metrics) {
    if (metrics.length === 0) {
      return { count: 0, avg: 0, p50: 0, p90: 0, p95: 0, p99: 0, min: 0, max: 0 };
    }
    var values = metrics.map((m) => m.value).sort((a, b) => a - b);
    var sum = values.reduce((a, b) => a + b, 0);
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
   * ➕ Add metric with memory management
   */
  PerformanceMonitor.prototype.addMetric = function (metric) {
    this.metrics.push(metric);
    // Clean old metrics to prevent memory leaks
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-Math.floor(this.maxMetrics * 0.8)); // Keep 80%
    }
  };
  /**
   * 🧹 Manual cleanup (for testing)
   */
  PerformanceMonitor.prototype.clearMetrics = function () {
    this.metrics = [];
    metricsCache.clear();
    aggregationCache.clear();
  };
  /**
   * 📊 Get metrics count (for monitoring memory usage)
   */
  PerformanceMonitor.prototype.getMetricsCount = function () {
    return this.metrics.length;
  };
  return PerformanceMonitor;
})();
exports.PerformanceMonitor = PerformanceMonitor;
/**
 * 🎯 Singleton instance export
 */
exports.performanceMonitor = PerformanceMonitor.getInstance();
