"use strict";
/**
 * NeonPro - API Gateway Monitoring System
 * Comprehensive monitoring, metrics and health checking system
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
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
exports.ApiGatewayPerformanceMonitor =
  exports.MonitoringMiddleware =
  exports.ApiGatewayHealthCheckManager =
  exports.ApiGatewayMetricsCollector =
    void 0;
/**
 * Metrics Collector
 * Collects and aggregates API Gateway metrics
 */
var ApiGatewayMetricsCollector = /** @class */ (function () {
  function ApiGatewayMetricsCollector(logger) {
    var _this = this;
    this.metrics = new Map();
    this.counters = new Map();
    this.histograms = new Map();
    this.gauges = new Map();
    this.timers = new Map();
    this.logger = logger;
    this.startTime = Date.now();
    // Initialize default metrics
    this.initializeDefaultMetrics();
    // Collect system metrics every 30 seconds
    setInterval(function () {
      return _this.collectSystemMetrics();
    }, 30000);
  }
  /**
   * Record request metrics
   */
  ApiGatewayMetricsCollector.prototype.recordRequest = function (context) {
    var _a;
    var labels = {
      method: context.method,
      path: context.path,
      clientId: context.clientId || "anonymous",
      version: context.version || "v1",
    };
    this.incrementCounter("requests_total", labels);
    this.incrementCounter("requests_by_method_".concat(context.method.toLowerCase()));
    this.incrementCounter("requests_by_client_".concat(context.clientId || "anonymous"));
    // Start request timer
    this.startTimer("request_".concat(context.requestId));
    (_a = this.logger) === null || _a === void 0
      ? void 0
      : _a.debug("Request metrics recorded", { requestId: context.requestId, labels: labels });
  };
  /**
   * Record response metrics
   */
  ApiGatewayMetricsCollector.prototype.recordResponse = function (context) {
    var _a;
    var statusCode = context.statusCode || 200;
    var statusClass = Math.floor(statusCode / 100);
    var labels = {
      method: context.method,
      path: context.path,
      statusCode: statusCode.toString(),
      statusClass: "".concat(statusClass, "xx"),
    };
    this.incrementCounter("responses_total", labels);
    this.incrementCounter("responses_".concat(statusClass, "xx"));
    this.incrementCounter("responses_status_".concat(statusCode));
    // Record response time
    var duration = this.endTimer("request_".concat(context.requestId));
    if (duration !== null) {
      this.recordHistogram("request_duration_ms", duration, labels);
      this.recordHistogram("request_duration_".concat(context.method.toLowerCase()), duration);
    }
    // Record response size if available
    if (context.responseSize) {
      this.recordHistogram("response_size_bytes", context.responseSize, labels);
    }
    (_a = this.logger) === null || _a === void 0
      ? void 0
      : _a.debug("Response metrics recorded", {
          requestId: context.requestId,
          statusCode: statusCode,
          duration: duration,
        });
  };
  /**
   * Record error metrics
   */
  ApiGatewayMetricsCollector.prototype.recordError = function (error, context) {
    var _a;
    var labels = {
      errorType: error.constructor.name,
      errorMessage: error.message,
      method: (context === null || context === void 0 ? void 0 : context.method) || "unknown",
      path: (context === null || context === void 0 ? void 0 : context.path) || "unknown",
    };
    this.incrementCounter("errors_total", labels);
    this.incrementCounter("errors_by_type_".concat(error.constructor.name));
    (_a = this.logger) === null || _a === void 0
      ? void 0
      : _a.error("Error metrics recorded", error, labels);
  };
  /**
   * Record rate limit metrics
   */
  ApiGatewayMetricsCollector.prototype.recordRateLimit = function (
    clientId,
    limit,
    remaining,
    resetTime,
  ) {
    var labels = { clientId: clientId };
    this.incrementCounter("rate_limit_checks_total", labels);
    this.setGauge("rate_limit_remaining_".concat(clientId), remaining);
    this.setGauge("rate_limit_limit_".concat(clientId), limit);
    this.setGauge("rate_limit_reset_".concat(clientId), resetTime);
    if (remaining === 0) {
      this.incrementCounter("rate_limit_exceeded_total", labels);
    }
  };
  /**
   * Record cache metrics
   */
  ApiGatewayMetricsCollector.prototype.recordCacheHit = function (key, ttl) {
    this.incrementCounter("cache_hits_total");
    this.incrementCounter("cache_operations_total", { operation: "hit" });
    if (ttl) {
      this.recordHistogram("cache_ttl_seconds", ttl / 1000);
    }
  };
  ApiGatewayMetricsCollector.prototype.recordCacheMiss = function (key) {
    this.incrementCounter("cache_misses_total");
    this.incrementCounter("cache_operations_total", { operation: "miss" });
  };
  /**
   * Get all metrics
   */
  ApiGatewayMetricsCollector.prototype.getMetrics = function () {
    var metrics = {};
    // Add counters
    for (var _i = 0, _a = this.counters.entries(); _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        value = _b[1];
      metrics[key] = value;
    }
    // Add gauges
    for (var _c = 0, _d = this.gauges.entries(); _c < _d.length; _c++) {
      var _e = _d[_c],
        key = _e[0],
        value = _e[1];
      metrics[key] = value;
    }
    // Add histogram statistics
    for (var _f = 0, _g = this.histograms.entries(); _f < _g.length; _f++) {
      var _h = _g[_f],
        key = _h[0],
        values = _h[1];
      if (values.length > 0) {
        var sorted = __spreadArray([], values, true).sort(function (a, b) {
          return a - b;
        });
        metrics["".concat(key, "_count")] = values.length;
        metrics["".concat(key, "_sum")] = values.reduce(function (a, b) {
          return a + b;
        }, 0);
        metrics["".concat(key, "_avg")] = metrics["".concat(key, "_sum")] / values.length;
        metrics["".concat(key, "_min")] = sorted[0];
        metrics["".concat(key, "_max")] = sorted[sorted.length - 1];
        metrics["".concat(key, "_p50")] = this.percentile(sorted, 0.5);
        metrics["".concat(key, "_p95")] = this.percentile(sorted, 0.95);
        metrics["".concat(key, "_p99")] = this.percentile(sorted, 0.99);
      }
    }
    // Add system metrics
    metrics.uptime_seconds = (Date.now() - this.startTime) / 1000;
    metrics.timestamp = Date.now();
    return metrics;
  };
  /**
   * Get metrics in Prometheus format
   */
  ApiGatewayMetricsCollector.prototype.getPrometheusMetrics = function () {
    var metrics = this.getMetrics();
    var lines = [];
    for (var _i = 0, _a = Object.entries(metrics); _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        value = _b[1];
      if (typeof value === "number") {
        lines.push("# TYPE ".concat(key, " gauge"));
        lines.push("".concat(key, " ").concat(value));
      }
    }
    return lines.join("\n");
  };
  /**
   * Reset all metrics
   */
  ApiGatewayMetricsCollector.prototype.reset = function () {
    var _a;
    this.counters.clear();
    this.histograms.clear();
    this.gauges.clear();
    this.timers.clear();
    this.startTime = Date.now();
    this.initializeDefaultMetrics();
    (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info("Metrics reset");
  };
  /**
   * Increment counter
   */
  ApiGatewayMetricsCollector.prototype.incrementCounter = function (name, labels) {
    var key = labels ? "".concat(name, "{").concat(this.labelsToString(labels), "}") : name;
    var current = this.counters.get(key) || 0;
    this.counters.set(key, current + 1);
  };
  /**
   * Set gauge value
   */
  ApiGatewayMetricsCollector.prototype.setGauge = function (name, value, labels) {
    var key = labels ? "".concat(name, "{").concat(this.labelsToString(labels), "}") : name;
    this.gauges.set(key, value);
  };
  /**
   * Record histogram value
   */
  ApiGatewayMetricsCollector.prototype.recordHistogram = function (name, value, labels) {
    var key = labels ? "".concat(name, "{").concat(this.labelsToString(labels), "}") : name;
    var values = this.histograms.get(key) || [];
    values.push(value);
    // Keep only last 1000 values to prevent memory issues
    if (values.length > 1000) {
      values.splice(0, values.length - 1000);
    }
    this.histograms.set(key, values);
  };
  /**
   * Start timer
   */
  ApiGatewayMetricsCollector.prototype.startTimer = function (name) {
    var timers = this.timers.get(name) || [];
    timers.push({ start: Date.now() });
    this.timers.set(name, timers);
  };
  /**
   * End timer and return duration
   */
  ApiGatewayMetricsCollector.prototype.endTimer = function (name) {
    var timers = this.timers.get(name);
    if (!timers || timers.length === 0) {
      return null;
    }
    var timer = timers[timers.length - 1];
    if (timer.end) {
      return null; // Already ended
    }
    timer.end = Date.now();
    var duration = timer.end - timer.start;
    // Clean up old timers
    if (timers.length > 100) {
      timers.splice(0, timers.length - 100);
    }
    return duration;
  };
  /**
   * Convert labels to string
   */
  ApiGatewayMetricsCollector.prototype.labelsToString = function (labels) {
    return Object.entries(labels)
      .map(function (_a) {
        var key = _a[0],
          value = _a[1];
        return "".concat(key, '="').concat(value, '"');
      })
      .join(",");
  };
  /**
   * Calculate percentile
   */
  ApiGatewayMetricsCollector.prototype.percentile = function (sortedArray, p) {
    var index = (sortedArray.length - 1) * p;
    var lower = Math.floor(index);
    var upper = Math.ceil(index);
    var weight = index % 1;
    if (upper >= sortedArray.length) {
      return sortedArray[sortedArray.length - 1];
    }
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  };
  /**
   * Initialize default metrics
   */
  ApiGatewayMetricsCollector.prototype.initializeDefaultMetrics = function () {
    this.setGauge("gateway_info", 1, {
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    });
  };
  /**
   * Collect system metrics
   */
  ApiGatewayMetricsCollector.prototype.collectSystemMetrics = function () {
    var _a;
    try {
      // Memory usage
      if (typeof process !== "undefined" && process.memoryUsage) {
        var memory = process.memoryUsage();
        this.setGauge("process_memory_rss_bytes", memory.rss);
        this.setGauge("process_memory_heap_used_bytes", memory.heapUsed);
        this.setGauge("process_memory_heap_total_bytes", memory.heapTotal);
        this.setGauge("process_memory_external_bytes", memory.external);
      }
      // CPU usage (if available)
      if (typeof process !== "undefined" && process.cpuUsage) {
        var cpu = process.cpuUsage();
        this.setGauge("process_cpu_user_seconds_total", cpu.user / 1000000);
        this.setGauge("process_cpu_system_seconds_total", cpu.system / 1000000);
      }
    } catch (error) {
      (_a = this.logger) === null || _a === void 0
        ? void 0
        : _a.error("System metrics collection error", error);
    }
  };
  return ApiGatewayMetricsCollector;
})();
exports.ApiGatewayMetricsCollector = ApiGatewayMetricsCollector;
/**
 * Health Check Manager
 * Manages health checks for API Gateway components
 */
var ApiGatewayHealthCheckManager = /** @class */ (function () {
  function ApiGatewayHealthCheckManager(checkInterval, logger) {
    if (checkInterval === void 0) {
      checkInterval = 30000;
    }
    this.checks = new Map();
    this.lastResults = new Map();
    this.checkInterval = checkInterval;
    this.logger = logger;
    // Register default health checks
    this.registerDefaultChecks();
    // Start periodic health checks
    this.startPeriodicChecks();
  }
  /**
   * Register a health check
   */
  ApiGatewayHealthCheckManager.prototype.registerCheck = function (name, check) {
    var _a;
    this.checks.set(name, check);
    (_a = this.logger) === null || _a === void 0
      ? void 0
      : _a.info("Health check registered", { name: name });
  };
  /**
   * Unregister a health check
   */
  ApiGatewayHealthCheckManager.prototype.unregisterCheck = function (name) {
    var _a;
    this.checks.delete(name);
    this.lastResults.delete(name);
    (_a = this.logger) === null || _a === void 0
      ? void 0
      : _a.info("Health check unregistered", { name: name });
  };
  /**
   * Run all health checks
   */
  ApiGatewayHealthCheckManager.prototype.runChecks = function () {
    return __awaiter(this, void 0, void 0, function () {
      var results,
        overallStatus,
        _i,
        _a,
        _b,
        name_1,
        check,
        result,
        resultWithTimestamp,
        error_1,
        errorResult,
        healthStatus;
      var _c, _d;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            results = {};
            overallStatus = "healthy";
            (_i = 0), (_a = this.checks.entries());
            _e.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 6];
            (_b = _a[_i]), (name_1 = _b[0]), (check = _b[1]);
            _e.label = 2;
          case 2:
            _e.trys.push([2, 4, , 5]);
            return [
              4 /*yield*/,
              Promise.race([
                check(),
                new Promise(function (_, reject) {
                  return setTimeout(function () {
                    return reject(new Error("Health check timeout"));
                  }, 5000);
                }),
              ]),
            ];
          case 3:
            result = _e.sent();
            resultWithTimestamp = __assign(__assign({}, result), { timestamp: Date.now() });
            results[name_1] = resultWithTimestamp;
            this.lastResults.set(name_1, resultWithTimestamp);
            if (result.status === "unhealthy") {
              overallStatus = "unhealthy";
            }
            return [3 /*break*/, 5];
          case 4:
            error_1 = _e.sent();
            errorResult = {
              status: "unhealthy",
              details: { error: error_1.message },
              timestamp: Date.now(),
            };
            results[name_1] = errorResult;
            this.lastResults.set(name_1, errorResult);
            overallStatus = "unhealthy";
            (_c = this.logger) === null || _c === void 0
              ? void 0
              : _c.error("Health check failed", error_1, { checkName: name_1 });
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            healthStatus = {
              status: overallStatus,
              checks: results,
              timestamp: Date.now(),
            };
            (_d = this.logger) === null || _d === void 0
              ? void 0
              : _d.debug("Health checks completed", {
                  status: overallStatus,
                  checkCount: Object.keys(results).length,
                });
            return [2 /*return*/, healthStatus];
        }
      });
    });
  };
  /**
   * Get last health check results
   */
  ApiGatewayHealthCheckManager.prototype.getLastResults = function () {
    var results = {};
    var overallStatus = "healthy";
    var latestTimestamp = 0;
    for (var _i = 0, _a = this.lastResults.entries(); _i < _a.length; _i++) {
      var _b = _a[_i],
        name_2 = _b[0],
        result = _b[1];
      results[name_2] = result;
      if (result.status === "unhealthy") {
        overallStatus = "unhealthy";
      }
      if (result.timestamp > latestTimestamp) {
        latestTimestamp = result.timestamp;
      }
    }
    return {
      status: overallStatus,
      checks: results,
      timestamp: latestTimestamp || Date.now(),
    };
  };
  /**
   * Start periodic health checks
   */
  ApiGatewayHealthCheckManager.prototype.startPeriodicChecks = function () {
    var _this = this;
    var _a;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(function () {
      return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 2, , 3]);
              return [4 /*yield*/, this.runChecks()];
            case 1:
              _b.sent();
              return [3 /*break*/, 3];
            case 2:
              error_2 = _b.sent();
              (_a = this.logger) === null || _a === void 0
                ? void 0
                : _a.error("Periodic health check error", error_2);
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      });
    }, this.checkInterval);
    (_a = this.logger) === null || _a === void 0
      ? void 0
      : _a.info("Periodic health checks started", { interval: this.checkInterval });
  };
  /**
   * Stop periodic health checks
   */
  ApiGatewayHealthCheckManager.prototype.stopPeriodicChecks = function () {
    var _a;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      (_a = this.logger) === null || _a === void 0
        ? void 0
        : _a.info("Periodic health checks stopped");
    }
  };
  /**
   * Register default health checks
   */
  ApiGatewayHealthCheckManager.prototype.registerDefaultChecks = function () {
    var _this = this;
    // Memory usage check
    this.registerCheck("memory", function () {
      return __awaiter(_this, void 0, void 0, function () {
        var memory, heapUsedMB, heapTotalMB, heapUsagePercent, status;
        return __generator(this, function (_a) {
          if (typeof process === "undefined" || !process.memoryUsage) {
            return [
              2 /*return*/,
              { status: "healthy", details: { message: "Memory monitoring not available" } },
            ];
          }
          memory = process.memoryUsage();
          heapUsedMB = memory.heapUsed / 1024 / 1024;
          heapTotalMB = memory.heapTotal / 1024 / 1024;
          heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;
          status = heapUsagePercent > 90 ? "unhealthy" : "healthy";
          return [
            2 /*return*/,
            {
              status: status,
              details: {
                heapUsedMB: Math.round(heapUsedMB),
                heapTotalMB: Math.round(heapTotalMB),
                heapUsagePercent: Math.round(heapUsagePercent),
                rssMB: Math.round(memory.rss / 1024 / 1024),
              },
            },
          ];
        });
      });
    });
    // Event loop lag check
    this.registerCheck("event_loop", function () {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          return [
            2 /*return*/,
            new Promise(function (resolve) {
              var start = Date.now();
              setImmediate(function () {
                var lag = Date.now() - start;
                var status = lag > 100 ? "unhealthy" : "healthy";
                resolve({
                  status: status,
                  details: {
                    lagMs: lag,
                    threshold: 100,
                  },
                });
              });
            }),
          ];
        });
      });
    });
    // Uptime check
    this.registerCheck("uptime", function () {
      return __awaiter(_this, void 0, void 0, function () {
        var uptimeSeconds;
        var _a;
        return __generator(this, function (_b) {
          uptimeSeconds =
            typeof process !== "undefined" && process.uptime
              ? process.uptime()
              : (Date.now() -
                  ((_a = this.lastResults.get("uptime")) === null || _a === void 0
                    ? void 0
                    : _a.timestamp) || Date.now()) / 1000;
          return [
            2 /*return*/,
            {
              status: "healthy",
              details: {
                uptimeSeconds: Math.round(uptimeSeconds),
                uptimeHours: Math.round((uptimeSeconds / 3600) * 100) / 100,
              },
            },
          ];
        });
      });
    });
  };
  return ApiGatewayHealthCheckManager;
})();
exports.ApiGatewayHealthCheckManager = ApiGatewayHealthCheckManager;
/**
 * Monitoring Middleware
 * Middleware for collecting request/response metrics
 */
var MonitoringMiddleware = /** @class */ (function () {
  function MonitoringMiddleware() {}
  MonitoringMiddleware.create = function (config) {
    var _this = this;
    return {
      name: "monitoring",
      order: 1, // Run early to capture all requests
      enabled: true,
      config: config,
      handler: function (context, next) {
        return __awaiter(_this, void 0, void 0, function () {
          var startTime, responseContext, error_3;
          var _a;
          return __generator(this, function (_b) {
            switch (_b.label) {
              case 0:
                startTime = Date.now();
                if (
                  !((_a = config.excludePaths) === null || _a === void 0
                    ? void 0
                    : _a.includes(context.path))
                )
                  return [3 /*break*/, 2];
                return [4 /*yield*/, next()];
              case 1:
                _b.sent();
                return [2 /*return*/];
              case 2:
                // Record request metrics
                config.metrics.recordRequest(context);
                _b.label = 3;
              case 3:
                _b.trys.push([3, 5, , 6]);
                // Execute request
                return [4 /*yield*/, next()];
              case 4:
                // Execute request
                _b.sent();
                responseContext = __assign(__assign({}, context), {
                  statusCode: context.statusCode || 200,
                  responseSize: context.responseSize || 0,
                });
                config.metrics.recordResponse(responseContext);
                return [3 /*break*/, 6];
              case 5:
                error_3 = _b.sent();
                // Record error metrics
                config.metrics.recordError(error_3, context);
                throw error_3;
              case 6:
                return [2 /*return*/];
            }
          });
        });
      },
    };
  };
  return MonitoringMiddleware;
})();
exports.MonitoringMiddleware = MonitoringMiddleware;
/**
 * Performance Monitor
 * Monitors API Gateway performance and alerts on issues
 */
var ApiGatewayPerformanceMonitor = /** @class */ (function () {
  function ApiGatewayPerformanceMonitor(metrics, healthCheck, monitorInterval, logger) {
    if (monitorInterval === void 0) {
      monitorInterval = 60000;
    }
    this.alerts = new Map();
    this.metrics = metrics;
    this.healthCheck = healthCheck;
    this.monitorInterval = monitorInterval;
    this.logger = logger;
    // Register default alerts
    this.registerDefaultAlerts();
    // Start monitoring
    this.startMonitoring();
  }
  /**
   * Register performance alert
   */
  ApiGatewayPerformanceMonitor.prototype.registerAlert = function (name, threshold, callback) {
    var _a;
    this.alerts.set(name, { threshold: threshold, callback: callback });
    (_a = this.logger) === null || _a === void 0
      ? void 0
      : _a.info("Performance alert registered", { name: name, threshold: threshold });
  };
  /**
   * Start performance monitoring
   */
  ApiGatewayPerformanceMonitor.prototype.startMonitoring = function () {
    var _this = this;
    var _a;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(function () {
      _this.checkPerformance();
    }, this.monitorInterval);
    (_a = this.logger) === null || _a === void 0
      ? void 0
      : _a.info("Performance monitoring started", { interval: this.monitorInterval });
  };
  /**
   * Stop performance monitoring
   */
  ApiGatewayPerformanceMonitor.prototype.stopMonitoring = function () {
    var _a;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      (_a = this.logger) === null || _a === void 0
        ? void 0
        : _a.info("Performance monitoring stopped");
    }
  };
  /**
   * Check performance metrics and trigger alerts
   */
  ApiGatewayPerformanceMonitor.prototype.checkPerformance = function () {
    var _a, _b, _c;
    try {
      var metrics = this.metrics.getMetrics();
      // Check each alert
      for (var _i = 0, _d = this.alerts.entries(); _i < _d.length; _i++) {
        var _e = _d[_i],
          name_3 = _e[0],
          alert_1 = _e[1];
        var value = metrics[name_3];
        if (typeof value === "number" && value > alert_1.threshold) {
          (_a = this.logger) === null || _a === void 0
            ? void 0
            : _a.warn("Performance alert triggered", {
                alert: name_3,
                value: value,
                threshold: alert_1.threshold,
              });
          try {
            alert_1.callback(value);
          } catch (error) {
            (_b = this.logger) === null || _b === void 0
              ? void 0
              : _b.error("Performance alert callback error", error, { alert: name_3 });
          }
        }
      }
    } catch (error) {
      (_c = this.logger) === null || _c === void 0
        ? void 0
        : _c.error("Performance monitoring error", error);
    }
  };
  /**
   * Register default performance alerts
   */
  ApiGatewayPerformanceMonitor.prototype.registerDefaultAlerts = function () {
    var _this = this;
    // High response time alert
    this.registerAlert("request_duration_ms_p95", 1000, function (value) {
      var _a;
      (_a = _this.logger) === null || _a === void 0
        ? void 0
        : _a.warn("High response time detected", { p95ResponseTime: value });
    });
    // High error rate alert
    this.registerAlert("errors_total", 100, function (value) {
      var _a;
      (_a = _this.logger) === null || _a === void 0
        ? void 0
        : _a.warn("High error rate detected", { totalErrors: value });
    });
    // Memory usage alert
    this.registerAlert("process_memory_heap_used_bytes", 500 * 1024 * 1024, function (value) {
      var _a;
      (_a = _this.logger) === null || _a === void 0
        ? void 0
        : _a.warn("High memory usage detected", { heapUsedMB: Math.round(value / 1024 / 1024) });
    });
  };
  return ApiGatewayPerformanceMonitor;
})();
exports.ApiGatewayPerformanceMonitor = ApiGatewayPerformanceMonitor;
