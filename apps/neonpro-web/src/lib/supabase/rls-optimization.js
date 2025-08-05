"use strict";
/**
 * RLS Optimization Utilities
 * Performance optimizations for Row Level Security policies
 * Target: 200ms → 100ms response time improvement
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RLSOptimizationManager = void 0;
exports.createRLSOptimizationManager = createRLSOptimizationManager;
exports.useRLSPerformance = useRLSPerformance;
var RLSOptimizationManager = /** @class */ (function () {
  function RLSOptimizationManager(supabaseClient) {
    this.supabase = supabaseClient;
  }
  /**
   * Get user's clinic ID using optimized cached function
   * This replaces direct queries to profiles table
   */
  RLSOptimizationManager.prototype.getUserClinicId = function () {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, _a, data, error, endTime, responseTime, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            startTime = performance.now();
            return [4 /*yield*/, this.supabase.rpc("get_user_clinic_id")];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            endTime = performance.now();
            responseTime = endTime - startTime;
            if (!(process.env.NODE_ENV === "development")) return [3 /*break*/, 3];
            console.log("\uD83D\uDE80 RLS getUserClinicId: ".concat(responseTime.toFixed(2), "ms"));
            // Log to database for monitoring
            return [4 /*yield*/, this.logPerformanceMetric("get_user_clinic_id", responseTime)];
          case 2:
            // Log to database for monitoring
            _b.sent();
            _b.label = 3;
          case 3:
            if (error) {
              console.error("RLS getUserClinicId error:", error);
              return [2 /*return*/, null];
            }
            return [2 /*return*/, data];
          case 4:
            error_1 = _b.sent();
            console.error("RLS optimization error:", error_1);
            return [2 /*return*/, null];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check if user belongs to specific clinic (optimized)
   */
  RLSOptimizationManager.prototype.userBelongsToClinic = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.rpc("user_belongs_to_clinic", { target_clinic_id: clinicId }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("userBelongsToClinic error:", error);
              return [2 /*return*/, false];
            }
            return [2 /*return*/, data];
          case 2:
            error_2 = _b.sent();
            console.error("RLS userBelongsToClinic error:", error_2);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get cache statistics for monitoring
   */
  RLSOptimizationManager.prototype.getCacheStats = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.rpc("get_cache_stats").single()];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("getCacheStats error:", error);
              return [2 /*return*/, null];
            }
            return [2 /*return*/, data];
          case 2:
            error_3 = _b.sent();
            console.error("RLS getCacheStats error:", error_3);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Perform RLS health check
   */
  RLSOptimizationManager.prototype.performHealthCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.rpc("rls_health_check")];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("RLS health check error:", error);
              return [2 /*return*/, []];
            }
            return [2 /*return*/, data];
          case 2:
            error_4 = _b.sent();
            console.error("RLS health check error:", error_4);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get performance benchmarks
   */
  RLSOptimizationManager.prototype.getPerformanceBenchmarks = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.rpc("benchmark_rls_performance")];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Performance benchmark error:", error);
              return [2 /*return*/, []];
            }
            return [2 /*return*/, data];
          case 2:
            error_5 = _b.sent();
            console.error("RLS benchmark error:", error_5);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Clear cache (for testing/debugging)
   */
  RLSOptimizationManager.prototype.clearCache = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.rpc("clear_clinic_cache")];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Clear cache error:", error);
              return [2 /*return*/, false];
            }
            return [2 /*return*/, true];
          case 2:
            error_6 = _a.sent();
            console.error("RLS clear cache error:", error_6);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Log performance metric for monitoring
   */
  RLSOptimizationManager.prototype.logPerformanceMetric = function (metricName, value) {
    return __awaiter(this, void 0, void 0, function () {
      var error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.rpc("log_performance_metric", {
                p_metric_name: metricName,
                p_metric_value: value,
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_7 = _a.sent();
            // Silent fail for performance logging
            console.debug("Performance logging error:", error_7);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate optimization is working correctly
   */
  RLSOptimizationManager.prototype.validateOptimization = function () {
    return __awaiter(this, void 0, void 0, function () {
      var cacheStats,
        healthChecks,
        criticalIssues,
        warningIssues,
        healthStatus,
        responseTimeCheck,
        avgResponseTime,
        error_8;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.getCacheStats(),
              // Get health check
            ];
          case 1:
            cacheStats = _b.sent();
            return [
              4 /*yield*/,
              this.performHealthCheck(),
              // Determine overall health status
            ];
          case 2:
            healthChecks = _b.sent();
            criticalIssues = healthChecks.filter(function (check) {
              return check.status === "CRITICAL";
            });
            warningIssues = healthChecks.filter(function (check) {
              return check.status === "WARNING";
            });
            healthStatus = "OK";
            if (criticalIssues.length > 0) {
              healthStatus = "CRITICAL";
            } else if (warningIssues.length > 0) {
              healthStatus = "WARNING";
            }
            responseTimeCheck = healthChecks.find(function (check) {
              return check.check_name === "response_time_target";
            });
            avgResponseTime = responseTimeCheck
              ? parseFloat(
                  ((_a = responseTimeCheck.details.match(/(\d+\.?\d*) ms/)) === null ||
                  _a === void 0
                    ? void 0
                    : _a[1]) || "0",
                )
              : 0;
            return [
              2 /*return*/,
              {
                isOptimized: avgResponseTime <= 100 && healthStatus !== "CRITICAL",
                avgResponseTime: avgResponseTime,
                cacheValid:
                  (cacheStats === null || cacheStats === void 0
                    ? void 0
                    : cacheStats.cache_valid) || false,
                healthStatus: healthStatus,
              },
            ];
          case 3:
            error_8 = _b.sent();
            console.error("Validation error:", error_8);
            return [
              2 /*return*/,
              {
                isOptimized: false,
                avgResponseTime: 999,
                cacheValid: false,
                healthStatus: "CRITICAL",
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  return RLSOptimizationManager;
})();
exports.RLSOptimizationManager = RLSOptimizationManager;
/**
 * Helper function to create RLS optimization manager
 */
function createRLSOptimizationManager(supabaseClient) {
  return new RLSOptimizationManager(supabaseClient);
}
/**
 * Performance monitoring hook for React components
 */
function useRLSPerformance() {
  var _a = React.useState({
      responseTime: 0,
      cacheHitRate: 0,
      optimizationStatus: "loading",
    }),
    metrics = _a[0],
    setMetrics = _a[1];
  // This would be implemented with actual React hook logic
  // For now, providing the interface
  return metrics;
}
