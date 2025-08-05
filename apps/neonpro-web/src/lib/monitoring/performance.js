/**
 * TASK-001: Foundation Setup & Baseline
 * Performance Measurement Utilities
 *
 * Provides comprehensive performance monitoring for all epic routes,
 * API endpoints, and database queries to establish baseline measurements.
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
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
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
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
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
      return (v) => step([n, v]);
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
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.createperformanceMonitor = exports.PERFORMANCE_BUDGETS = void 0;
exports.measureAsync = measureAsync;
exports.usePerformanceTracker = usePerformanceTracker;
exports.trackPerformance = trackPerformance;
exports.getPerformanceMetrics = getPerformanceMetrics;
exports.recordPerformanceMetric = recordPerformanceMetric;
var client_1 = require("@/lib/supabase/client");
// Performance budgets as defined in TASK-001
exports.PERFORMANCE_BUDGETS = {
  api_max_ms: 500,
  page_max_ms: 2000,
  db_max_ms: 100,
  component_max_ms: 50,
};
var PerformanceMonitor = /** @class */ (() => {
  function PerformanceMonitor() {
    this.supabase = (0, client_1.createClient)();
    this.measurements = new Map();
  }
  /**
   * Start measuring performance for a specific operation
   */
  PerformanceMonitor.prototype.startMeasurement = function (operationId) {
    this.measurements.set(operationId, performance.now());
  };
  /**
   * End measurement and automatically log to database
   */
  PerformanceMonitor.prototype.endMeasurement = function (operationId, metric) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, duration_ms;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = this.measurements.get(operationId);
            if (!startTime) {
              console.warn("No start measurement found for operation: ".concat(operationId));
              return [2 /*return*/];
            }
            duration_ms = Math.round(performance.now() - startTime);
            this.measurements.delete(operationId);
            return [
              4 /*yield*/,
              this.logPerformanceMetric(
                __assign(__assign({}, metric), { duration_ms: duration_ms }),
              ),
            ];
          case 1:
            _a.sent();
            // Check against performance budgets
            this.checkPerformanceBudget(metric.metric_type, duration_ms, metric.route_path);
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Log performance metric to database
   */
  PerformanceMonitor.prototype.logPerformanceMetric = function (metric) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.from("performance_metrics").insert(metric)];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Failed to log performance metric:", error);
            }
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error("Error logging performance metric:", error_1);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check if performance meets budget requirements
   */
  PerformanceMonitor.prototype.checkPerformanceBudget = function (metricType, duration, routePath) {
    var budget;
    switch (metricType) {
      case "api_response":
        budget = exports.PERFORMANCE_BUDGETS.api_max_ms;
        break;
      case "page_load":
        budget = exports.PERFORMANCE_BUDGETS.page_max_ms;
        break;
      case "db_query":
        budget = exports.PERFORMANCE_BUDGETS.db_max_ms;
        break;
      case "component_render":
        budget = exports.PERFORMANCE_BUDGETS.component_max_ms;
        break;
      default:
        return;
    }
    if (duration > budget) {
      console.warn(
        "Performance budget exceeded for "
          .concat(metricType, " on ")
          .concat(routePath, ": ")
          .concat(duration, "ms > ")
          .concat(budget, "ms"),
      );
      // Log budget violation as system metric
      this.logSystemMetric(
        "performance_budget_violation",
        "".concat(metricType, "_budget_exceeded"),
        duration - budget,
        "ms",
        { route_path: routePath, budget: budget, actual: duration },
      );
    }
  };
  /**
   * Log system-level metrics
   */
  PerformanceMonitor.prototype.logSystemMetric = function (
    metricType,
    metricName,
    value,
    unit,
    metadata,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("system_metrics").insert({
                metric_type: metricType,
                metric_name: metricName,
                metric_value: value,
                metric_unit: unit,
                metadata: metadata,
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Failed to log system metric:", error);
            }
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Error logging system metric:", error_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get performance baseline data for a specific route
   */
  PerformanceMonitor.prototype.getPerformanceBaseline = function (routePath_1, metricType_1) {
    return __awaiter(this, arguments, void 0, function (routePath, metricType, days) {
      var startDate, query, _a, data, error, durations, count, error_3;
      if (days === void 0) {
        days = 7;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            query = this.supabase
              .from("performance_metrics")
              .select("duration_ms")
              .eq("route_path", routePath)
              .gte("timestamp", startDate.toISOString())
              .order("duration_ms");
            if (metricType) {
              query = query.eq("metric_type", metricType);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data || data.length === 0) {
              return [2 /*return*/, null];
            }
            durations = data.map((d) => d.duration_ms).sort((a, b) => a - b);
            count = durations.length;
            return [
              2 /*return*/,
              {
                average: durations.reduce((sum, d) => sum + d, 0) / count,
                median: durations[Math.floor(count / 2)],
                p95: durations[Math.floor(count * 0.95)],
                p99: durations[Math.floor(count * 0.99)],
                count: count,
              },
            ];
          case 2:
            error_3 = _b.sent();
            console.error("Error getting performance baseline:", error_3);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate performance report for all routes
   */
  PerformanceMonitor.prototype.generatePerformanceReport = function () {
    return __awaiter(this, arguments, void 0, function (days) {
      var startDate, _a, data, error, report_1, error_4;
      if (days === void 0) {
        days = 7;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            return [
              4 /*yield*/,
              this.supabase
                .from("performance_metrics")
                .select("route_path, metric_type, duration_ms, timestamp")
                .gte("timestamp", startDate.toISOString()),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              throw error;
            }
            report_1 = {};
            data.forEach((metric) => {
              var key = "".concat(metric.route_path, "_").concat(metric.metric_type);
              if (!report_1[key]) {
                report_1[key] = {
                  route_path: metric.route_path,
                  metric_type: metric.metric_type,
                  durations: [],
                };
              }
              report_1[key].durations.push(metric.duration_ms);
            });
            // Calculate statistics for each route/metric combination
            Object.keys(report_1).forEach((key) => {
              var durations = report_1[key].durations.sort((a, b) => a - b);
              var count = durations.length;
              report_1[key] = __assign(__assign({}, report_1[key]), {
                count: count,
                average: durations.reduce((sum, d) => sum + d, 0) / count,
                median: durations[Math.floor(count / 2)],
                p95: durations[Math.floor(count * 0.95)],
                p99: durations[Math.floor(count * 0.99)],
                min: durations[0],
                max: durations[count - 1],
              });
              delete report_1[key].durations; // Remove raw data to keep response clean
            });
            return [2 /*return*/, report_1];
          case 2:
            error_4 = _b.sent();
            console.error("Error generating performance report:", error_4);
            return [2 /*return*/, {}];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return PerformanceMonitor;
})();
// Export singleton instance
var createperformanceMonitor = () => new PerformanceMonitor();
exports.createperformanceMonitor = createperformanceMonitor;
// Utility decorators and hooks for easy integration
function measureAsync(operationId, metricType, routePath) {
  return (target, propertyName, descriptor) => {
    var method = descriptor.value;
    descriptor.value = function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return __awaiter(this, void 0, void 0, function () {
        var result, error_5;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              performanceMonitor.startMeasurement(operationId);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, , 6]);
              return [4 /*yield*/, method.apply(this, args)];
            case 2:
              result = _a.sent();
              return [
                4 /*yield*/,
                performanceMonitor.endMeasurement(operationId, {
                  route_path: routePath,
                  metric_type: metricType,
                  status_code: 200,
                }),
              ];
            case 3:
              _a.sent();
              return [2 /*return*/, result];
            case 4:
              error_5 = _a.sent();
              return [
                4 /*yield*/,
                performanceMonitor.endMeasurement(operationId, {
                  route_path: routePath,
                  metric_type: metricType,
                  status_code: 500,
                  error_message: error_5 instanceof Error ? error_5.message : "Unknown error",
                }),
              ];
            case 5:
              _a.sent();
              throw error_5;
            case 6:
              return [2 /*return*/];
          }
        });
      });
    };
  };
}
// React Hook for component performance measurement
function usePerformanceTracker(componentName) {
  var measureComponentRender = (renderTime) =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              performanceMonitor.logPerformanceMetric({
                route_path: componentName,
                metric_type: "component_render",
                duration_ms: renderTime,
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  return { measureComponentRender: measureComponentRender };
}
// Generic performance tracking function for auth and other modules
function trackPerformance(options) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          return [
            4 /*yield*/,
            performanceMonitor.logPerformanceMetric({
              route_path: "".concat(options.category, "/").concat(options.name),
              metric_type: "api_response",
              duration_ms: options.duration,
              status_code: options.success ? 200 : 500,
              metadata: options.metadata,
            }),
          ];
        case 1:
          _a.sent();
          return [2 /*return*/];
      }
    });
  });
}
// Missing functions for compatibility
function getPerformanceMetrics() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => [
      2 /*return*/,
      performanceMonitor.generatePerformanceReport(),
    ]);
  });
}
function recordPerformanceMetric(metric) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => [
      2 /*return*/,
      performanceMonitor.logPerformanceMetric(metric),
    ]);
  });
}
