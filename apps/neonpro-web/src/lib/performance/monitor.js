"use strict";
/**
 * Performance Monitor - VIBECODE V1.0 Enhanced
 * Comprehensive performance monitoring for subscription middleware
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
exports.performanceMonitor = exports.PerformanceMonitor = void 0;
var PerformanceMonitor = /** @class */ (function () {
  function PerformanceMonitor() {
    this.metrics = [];
    this.benchmarks = new Map();
  }
  PerformanceMonitor.getInstance = function () {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }; /**
   * Start performance measurement for operation
   */
  PerformanceMonitor.prototype.startMeasurement = function (operation) {
    var measurementId = "".concat(operation, "-").concat(Date.now());
    performance.mark("".concat(measurementId, "-start"));
    return measurementId;
  };
  /**
   * End performance measurement and record metrics
   */
  PerformanceMonitor.prototype.endMeasurement = function (measurementId, success) {
    if (success === void 0) {
      success = true;
    }
    var endMark = "".concat(measurementId, "-end");
    performance.mark(endMark);
    var measure = performance.measure(measurementId, "".concat(measurementId, "-start"), endMark);
    var metric = {
      timestamp: Date.now(),
      operation: measurementId.split("-")[0],
      duration: measure.duration,
      memory: this.getMemoryUsage(),
      errors: success ? 0 : 1,
      success: success,
    };
    this.metrics.push(metric);
    this.cleanOldMetrics();
    return metric;
  };
  /**
   * Get current memory usage in MB
   */
  PerformanceMonitor.prototype.getMemoryUsage = function () {
    if (typeof window !== "undefined" && "memory" in performance) {
      // Browser environment
      var memory = performance.memory;
      return memory.usedJSHeapSize / (1024 * 1024);
    }
    if (typeof process !== "undefined" && process.memoryUsage) {
      // Node.js environment
      var usage = process.memoryUsage();
      return usage.heapUsed / (1024 * 1024);
    }
    return 0;
  };
  /**
   * Calculate performance benchmark for operation
   */
  PerformanceMonitor.prototype.getBenchmark = function (operation) {
    var operationMetrics = this.metrics.filter(function (m) {
      return m.operation === operation;
    });
    if (operationMetrics.length === 0) return null;
    var avgResponseTime =
      operationMetrics.reduce(function (sum, m) {
        return sum + m.duration;
      }, 0) / operationMetrics.length;
    var avgMemory =
      operationMetrics.reduce(function (sum, m) {
        return sum + m.memory;
      }, 0) / operationMetrics.length;
    var errorCount = operationMetrics.filter(function (m) {
      return !m.success;
    }).length;
    var errorRate = (errorCount / operationMetrics.length) * 100;
    var benchmark = {
      responseTime: avgResponseTime,
      throughput: operationMetrics.length,
      memoryUsage: avgMemory,
      errorRate: errorRate,
      cacheHitRate: 0, // Will be calculated by cache monitor
    };
    this.benchmarks.set(operation, benchmark);
    return benchmark;
  };
  /**
   * Get all current metrics
   */
  PerformanceMonitor.prototype.getMetrics = function () {
    return __spreadArray([], this.metrics, true);
  };
  /**
   * Clean metrics older than 1 hour
   */
  PerformanceMonitor.prototype.cleanOldMetrics = function () {
    var oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.metrics = this.metrics.filter(function (m) {
      return m.timestamp > oneHourAgo;
    });
  };
  /**
   * Generate performance report
   */
  PerformanceMonitor.prototype.generateReport = function () {
    var _this = this;
    var report = {};
    var operations = __spreadArray(
      [],
      new Set(
        this.metrics.map(function (m) {
          return m.operation;
        }),
      ),
      true,
    );
    operations.forEach(function (op) {
      var benchmark = _this.getBenchmark(op);
      if (benchmark) report[op] = benchmark;
    });
    return report;
  };
  /**
   * Reset all metrics and benchmarks
   */
  PerformanceMonitor.prototype.reset = function () {
    this.metrics = [];
    this.benchmarks.clear();
  };
  return PerformanceMonitor;
})();
exports.PerformanceMonitor = PerformanceMonitor;
exports.performanceMonitor = PerformanceMonitor.getInstance();
