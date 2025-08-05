/**
 * Database Optimizer - VIBECODE V1.0 Query Performance
 * Advanced database optimization for subscription queries
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseOptimizer = void 0;
var DatabaseOptimizer = /** @class */ (() => {
  function DatabaseOptimizer(slowQueryThreshold) {
    if (slowQueryThreshold === void 0) {
      slowQueryThreshold = 100;
    }
    this.queryMetrics = [];
    this.queryCache = new Map();
    this.slowQueryThreshold = 100; // ms
    this.slowQueryThreshold = slowQueryThreshold;
  } /**
   * Monitor query execution
   */
  DatabaseOptimizer.prototype.recordQuery = function (query, executionTime, rowsAffected, cached) {
    if (rowsAffected === void 0) {
      rowsAffected = 0;
    }
    if (cached === void 0) {
      cached = false;
    }
    var metric = {
      query: query,
      executionTime: executionTime,
      rowsAffected: rowsAffected,
      cached: cached,
      timestamp: Date.now(),
    };
    this.queryMetrics.push(metric);
    // Log slow queries
    if (executionTime > this.slowQueryThreshold) {
      console.warn(
        "\uD83D\uDC0C Slow query detected: "
          .concat(executionTime, "ms - ")
          .concat(query.substring(0, 100), "..."),
      );
    }
    // Clean old metrics
    this.cleanOldMetrics();
  };
  /**
   * Get optimized query suggestions
   */
  DatabaseOptimizer.prototype.getOptimizationSuggestions = function () {
    var suggestions = [];
    // Find slow queries
    var slowQueries = this.queryMetrics.filter((m) => m.executionTime > this.slowQueryThreshold);
    slowQueries.forEach((query) => {
      if (query.query.includes("SELECT") && !query.query.includes("WHERE")) {
        suggestions.push({
          type: "query_rewrite",
          priority: "high",
          description: "Add WHERE clause to: ".concat(query.query.substring(0, 50), "..."),
          estimatedImprovement: 60,
          implementation: "Add appropriate WHERE conditions to limit result set",
        });
      }
      if (query.query.includes("ORDER BY") && !query.query.includes("LIMIT")) {
        suggestions.push({
          type: "index",
          priority: "medium",
          description: "Add index for ORDER BY: ".concat(query.query.substring(0, 50), "..."),
          estimatedImprovement: 40,
          implementation: "CREATE INDEX ON table (order_column)",
        });
      }
    });
    return suggestions;
  };
  /**
   * Generate performance report
   */
  DatabaseOptimizer.prototype.generateReport = function () {
    var slowQueries = this.queryMetrics.filter((m) => m.executionTime > this.slowQueryThreshold);
    var totalQueries = this.queryMetrics.length;
    var cachedQueries = this.queryMetrics.filter((m) => m.cached).length;
    var averageResponseTime =
      totalQueries > 0
        ? this.queryMetrics.reduce((sum, m) => sum + m.executionTime, 0) / totalQueries
        : 0;
    var cacheHitRate = totalQueries > 0 ? (cachedQueries / totalQueries) * 100 : 0;
    return {
      slowQueries: slowQueries,
      averageResponseTime: averageResponseTime,
      cacheHitRate: cacheHitRate,
      indexUtilization: this.calculateIndexUtilization(),
      optimizationSuggestions: this.getOptimizationSuggestions(),
      performanceScore: this.calculatePerformanceScore(),
    };
  };
  /**
   * Clean old metrics (keep last 1000)
   */
  DatabaseOptimizer.prototype.cleanOldMetrics = function () {
    if (this.queryMetrics.length > 1000) {
      this.queryMetrics = this.queryMetrics.slice(-1000);
    }
  };
  /**
   * Calculate index utilization
   */
  DatabaseOptimizer.prototype.calculateIndexUtilization = function () {
    // Simplified calculation - in real implementation would analyze query plans
    var indexedQueries = this.queryMetrics.filter(
      (m) => m.query.includes("WHERE") || m.query.includes("ORDER BY"),
    ).length;
    return this.queryMetrics.length > 0 ? (indexedQueries / this.queryMetrics.length) * 100 : 0;
  };
  /**
   * Calculate overall performance score
   */
  DatabaseOptimizer.prototype.calculatePerformanceScore = function () {
    var slowQueryRatio =
      this.queryMetrics.length > 0
        ? this.queryMetrics.filter((m) => m.executionTime > this.slowQueryThreshold).length /
          this.queryMetrics.length
        : 0;
    var cacheHitRate =
      this.queryMetrics.length > 0
        ? this.queryMetrics.filter((m) => m.cached).length / this.queryMetrics.length
        : 0;
    // Score based on slow query ratio and cache hit rate
    var score = Math.max(0, 100 - slowQueryRatio * 50 + cacheHitRate * 20);
    return Math.min(100, score);
  };
  return DatabaseOptimizer;
})();
exports.DatabaseOptimizer = DatabaseOptimizer;
