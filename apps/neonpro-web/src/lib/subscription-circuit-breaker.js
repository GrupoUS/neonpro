"use strict";
/**
 * Subscription Circuit Breaker System
 *
 * Advanced circuit breaker implementation for subscription services:
 * - Multiple circuit breaker states (Closed, Open, Half-Open)
 * - Configurable failure thresholds and recovery timeouts
 * - Health monitoring and automatic recovery
 * - Integration with performance monitoring
 * - Graceful degradation strategies
 *
 * @author NeonPro Development Team
 * @version 2.0.0 - Error Handling Enhanced
 */
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.circuitBreakerRegistry =
  exports.SubscriptionExternalAPICircuitBreaker =
  exports.SubscriptionCacheCircuitBreaker =
  exports.SubscriptionDatabaseCircuitBreaker =
  exports.SubscriptionCircuitBreaker =
  exports.CircuitBreakerState =
    void 0;
var subscription_errors_1 = require("../types/subscription-errors");
// Circuit breaker states
var CircuitBreakerState;
(function (CircuitBreakerState) {
  CircuitBreakerState["CLOSED"] = "closed";
  CircuitBreakerState["OPEN"] = "open";
  CircuitBreakerState["HALF_OPEN"] = "half_open"; // Testing if service has recovered
})(CircuitBreakerState || (exports.CircuitBreakerState = CircuitBreakerState = {}));
var defaultConfig = {
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 60000, // 1 minute
  timeWindow: 60000, // 1 minute
  halfOpenMaxConcurrentRequests: 3,
  healthCheck: {
    enabled: true,
    interval: 30000, // 30 seconds
    timeout: 5000, // 5 seconds
  },
  monitoring: {
    enabled: true,
    logStateChanges: true,
    logFailures: true,
    alertOnOpen: true,
  },
};
var SubscriptionCircuitBreaker = /** @class */ (function () {
  function SubscriptionCircuitBreaker(serviceName, config) {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.stateChangedAt = new Date();
    this.totalRequests = 0;
    this.failedRequests = 0;
    this.successfulRequests = 0;
    this.rejectedRequests = 0;
    this.responseTimeSum = 0;
    this.halfOpenRequestsInProgress = 0;
    this.serviceName = serviceName;
    this.config = __assign(__assign({}, defaultConfig), config);
    // Start health check if enabled
    if (this.config.healthCheck.enabled) {
      this.startHealthCheck();
    }
    // Log initial state
    if (this.config.monitoring.enabled) {
      this.logStateChange(CircuitBreakerState.CLOSED, "Circuit breaker initialized");
    }
  }
  /**
   * Execute a function with circuit breaker protection
   */
  SubscriptionCircuitBreaker.prototype.execute = function (operation, context) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, error, error, result, executionTime, error_1, executionTime, subscriptionError;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            this.totalRequests++;
            // Check if circuit is open
            if (this.state === CircuitBreakerState.OPEN) {
              if (this.shouldAttemptReset()) {
                this.state = CircuitBreakerState.HALF_OPEN;
                this.stateChangedAt = new Date();
                this.logStateChange(CircuitBreakerState.HALF_OPEN, "Attempting reset");
              } else {
                // Circuit is open, reject request immediately
                this.rejectedRequests++;
                error = subscription_errors_1.SubscriptionErrorFactory.createError(
                  "external_service",
                  "Circuit breaker is OPEN for ".concat(this.serviceName),
                  context,
                );
                return [
                  2 /*return*/,
                  {
                    success: false,
                    error: error,
                    fromCircuitBreaker: true,
                    state: this.state,
                    executionTime: Date.now() - startTime,
                  },
                ];
              }
            }
            // Check half-open concurrent request limit
            if (this.state === CircuitBreakerState.HALF_OPEN) {
              if (this.halfOpenRequestsInProgress >= this.config.halfOpenMaxConcurrentRequests) {
                this.rejectedRequests++;
                error = subscription_errors_1.SubscriptionErrorFactory.createError(
                  "rate_limit",
                  "Circuit breaker is HALF_OPEN with maximum concurrent requests for ".concat(
                    this.serviceName,
                  ),
                  context,
                );
                return [
                  2 /*return*/,
                  {
                    success: false,
                    error: error,
                    fromCircuitBreaker: true,
                    state: this.state,
                    executionTime: Date.now() - startTime,
                  },
                ];
              }
              this.halfOpenRequestsInProgress++;
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, operation()];
          case 2:
            result = _a.sent();
            executionTime = Date.now() - startTime;
            // Record success
            this.onSuccess(executionTime);
            return [
              2 /*return*/,
              {
                success: true,
                data: result,
                fromCircuitBreaker: false,
                state: this.state,
                executionTime: executionTime,
              },
            ];
          case 3:
            error_1 = _a.sent();
            executionTime = Date.now() - startTime;
            subscriptionError =
              error_1 instanceof Error && "code" in error_1
                ? error_1
                : subscription_errors_1.SubscriptionErrorFactory.createError(
                    "external_service",
                    error_1 instanceof Error ? error_1.message : "Unknown error",
                    context,
                  );
            // Record failure
            this.onFailure(subscriptionError);
            return [
              2 /*return*/,
              {
                success: false,
                error: subscriptionError,
                fromCircuitBreaker: false,
                state: this.state,
                executionTime: executionTime,
              },
            ];
          case 4:
            if (this.state === CircuitBreakerState.HALF_OPEN) {
              this.halfOpenRequestsInProgress--;
            }
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Handle successful operation
   */
  SubscriptionCircuitBreaker.prototype.onSuccess = function (responseTime) {
    this.successfulRequests++;
    this.successCount++;
    this.lastSuccessTime = new Date();
    this.responseTimeSum += responseTime;
    // Log success in monitoring
    if (this.config.monitoring.enabled) {
      console.log(
        "Circuit breaker success: ".concat(this.serviceName, " - ").concat(responseTime, "ms"),
      );
    }
    // Reset failure count on success in half-open state
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.failureCount = 0;
      // Check if we should close the circuit
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitBreakerState.CLOSED;
        this.successCount = 0;
        this.stateChangedAt = new Date();
        this.logStateChange(CircuitBreakerState.CLOSED, "Circuit recovered");
      }
    } else if (this.state === CircuitBreakerState.CLOSED) {
      // Reset failure count on successful closed state operation
      this.failureCount = 0;
    }
  };
  /**
   * Handle failed operation
   */
  SubscriptionCircuitBreaker.prototype.onFailure = function (error) {
    this.failedRequests++;
    this.failureCount++;
    this.lastFailureTime = new Date();
    // Log failure in monitoring
    if (this.config.monitoring.enabled) {
      console.error("Circuit breaker failure: ".concat(this.serviceName), error);
      if (this.config.monitoring.logFailures) {
        console.error("Circuit breaker failure for ".concat(this.serviceName, ":"), error);
      }
    }
    // Check if we should open the circuit
    if (
      this.state === CircuitBreakerState.CLOSED &&
      this.failureCount >= this.config.failureThreshold
    ) {
      this.state = CircuitBreakerState.OPEN;
      this.stateChangedAt = new Date();
      this.logStateChange(CircuitBreakerState.OPEN, "Circuit opened due to failures");
      // Alert if configured
      if (this.config.monitoring.alertOnOpen) {
        this.sendAlert(
          "Circuit breaker opened for "
            .concat(this.serviceName, " after ")
            .concat(this.failureCount, " failures"),
        );
      }
    } else if (this.state === CircuitBreakerState.HALF_OPEN) {
      // Return to open state on any failure in half-open
      this.state = CircuitBreakerState.OPEN;
      this.successCount = 0;
      this.stateChangedAt = new Date();
      this.logStateChange(CircuitBreakerState.OPEN, "Circuit opened from half-open due to failure");
    }
  };
  /**
   * Check if we should attempt to reset from open to half-open
   */
  SubscriptionCircuitBreaker.prototype.shouldAttemptReset = function () {
    if (this.state !== CircuitBreakerState.OPEN) return false;
    var timeSinceOpened = Date.now() - this.stateChangedAt.getTime();
    return timeSinceOpened >= this.config.timeout;
  };
  /**
   * Get current circuit breaker statistics
   */
  SubscriptionCircuitBreaker.prototype.getStats = function () {
    var averageResponseTime =
      this.successfulRequests > 0 ? this.responseTimeSum / this.successfulRequests : 0;
    var uptime =
      this.totalRequests > 0 ? (this.successfulRequests / this.totalRequests) * 100 : 100;
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      stateChangedAt: this.stateChangedAt,
      totalRequests: this.totalRequests,
      failedRequests: this.failedRequests,
      successfulRequests: this.successfulRequests,
      rejectedRequests: this.rejectedRequests,
      averageResponseTime: averageResponseTime,
      uptime: uptime,
    };
  };
  /**
   * Manually reset the circuit breaker
   */
  SubscriptionCircuitBreaker.prototype.reset = function () {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.stateChangedAt = new Date();
    this.halfOpenRequestsInProgress = 0;
    this.logStateChange(CircuitBreakerState.CLOSED, "Circuit manually reset");
  };
  /**
   * Force open the circuit breaker
   */
  SubscriptionCircuitBreaker.prototype.forceOpen = function () {
    this.state = CircuitBreakerState.OPEN;
    this.stateChangedAt = new Date();
    this.logStateChange(CircuitBreakerState.OPEN, "Circuit manually opened");
  };
  /**
   * Start health check timer
   */
  SubscriptionCircuitBreaker.prototype.startHealthCheck = function () {
    var _this = this;
    this.healthCheckTimer = setInterval(function () {
      return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!(this.state === CircuitBreakerState.OPEN)) return [3 /*break*/, 4];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              // Perform a lightweight health check
              return [
                4 /*yield*/,
                this.performHealthCheck(),
                // If health check passes and timeout has elapsed, try half-open
              ];
            case 2:
              // Perform a lightweight health check
              _a.sent();
              // If health check passes and timeout has elapsed, try half-open
              if (this.shouldAttemptReset()) {
                this.state = CircuitBreakerState.HALF_OPEN;
                this.stateChangedAt = new Date();
                this.logStateChange(
                  CircuitBreakerState.HALF_OPEN,
                  "Health check passed, attempting reset",
                );
              }
              return [3 /*break*/, 4];
            case 3:
              error_2 = _a.sent();
              // Health check failed, stay in open state
              if (this.config.monitoring.logFailures) {
                console.warn("Health check failed for ".concat(this.serviceName, ":"), error_2);
              }
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    }, this.config.healthCheck.interval);
  };
  /**
   * Perform health check (override this method for custom health checks)
   */
  SubscriptionCircuitBreaker.prototype.performHealthCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Default implementation - just a promise that resolves
        // Override this method in subclasses for specific health checks
        return [2 /*return*/, Promise.resolve()];
      });
    });
  };
  /**
   * Log state changes
   */
  SubscriptionCircuitBreaker.prototype.logStateChange = function (newState, reason) {
    if (this.config.monitoring.enabled && this.config.monitoring.logStateChanges) {
      console.log(
        "Circuit breaker "
          .concat(this.serviceName, " changed to ")
          .concat(newState, ": ")
          .concat(reason),
      );
    }
  };
  /**
   * Send alert (override this method for custom alerting)
   */
  SubscriptionCircuitBreaker.prototype.sendAlert = function (message) {
    // Default implementation - just log
    console.error("ALERT: ".concat(message));
  };
  /**
   * Clean up resources
   */
  SubscriptionCircuitBreaker.prototype.destroy = function () {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  };
  return SubscriptionCircuitBreaker;
})();
exports.SubscriptionCircuitBreaker = SubscriptionCircuitBreaker;
// Specialized circuit breakers for different services
var SubscriptionDatabaseCircuitBreaker = /** @class */ (function (_super) {
  __extends(SubscriptionDatabaseCircuitBreaker, _super);
  function SubscriptionDatabaseCircuitBreaker(config) {
    return (
      _super.call(
        this,
        "subscription_database",
        __assign({ failureThreshold: 3, timeout: 30000 }, config),
      ) || this
    );
  }
  SubscriptionDatabaseCircuitBreaker.prototype.performHealthCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, timeout;
      return __generator(this, function (_a) {
        startTime = Date.now();
        timeout = this.config.healthCheck.timeout;
        return [
          2 /*return*/,
          Promise.race([
            // Simulate database health check
            new Promise(function (resolve) {
              setTimeout(function () {
                return resolve();
              }, 100);
            }),
            new Promise(function (_, reject) {
              setTimeout(function () {
                return reject(new Error("Health check timeout"));
              }, timeout);
            }),
          ]),
        ];
      });
    });
  };
  return SubscriptionDatabaseCircuitBreaker;
})(SubscriptionCircuitBreaker);
exports.SubscriptionDatabaseCircuitBreaker = SubscriptionDatabaseCircuitBreaker;
var SubscriptionCacheCircuitBreaker = /** @class */ (function (_super) {
  __extends(SubscriptionCacheCircuitBreaker, _super);
  function SubscriptionCacheCircuitBreaker(config) {
    return (
      _super.call(
        this,
        "subscription_cache",
        __assign({ failureThreshold: 5, timeout: 10000 }, config),
      ) || this
    );
  }
  SubscriptionCacheCircuitBreaker.prototype.performHealthCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, timeout;
      return __generator(this, function (_a) {
        startTime = Date.now();
        timeout = this.config.healthCheck.timeout;
        return [
          2 /*return*/,
          Promise.race([
            // Simulate cache health check
            new Promise(function (resolve) {
              setTimeout(function () {
                return resolve();
              }, 50);
            }),
            new Promise(function (_, reject) {
              setTimeout(function () {
                return reject(new Error("Cache health check timeout"));
              }, timeout);
            }),
          ]),
        ];
      });
    });
  };
  return SubscriptionCacheCircuitBreaker;
})(SubscriptionCircuitBreaker);
exports.SubscriptionCacheCircuitBreaker = SubscriptionCacheCircuitBreaker;
var SubscriptionExternalAPICircuitBreaker = /** @class */ (function (_super) {
  __extends(SubscriptionExternalAPICircuitBreaker, _super);
  function SubscriptionExternalAPICircuitBreaker(apiName, config) {
    return (
      _super.call(
        this,
        "subscription_external_api_".concat(apiName),
        __assign({ failureThreshold: 3, timeout: 60000 }, config),
      ) || this
    );
  }
  SubscriptionExternalAPICircuitBreaker.prototype.performHealthCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, timeout;
      return __generator(this, function (_a) {
        startTime = Date.now();
        timeout = this.config.healthCheck.timeout;
        return [
          2 /*return*/,
          Promise.race([
            // Simulate API health check
            new Promise(function (resolve) {
              setTimeout(function () {
                return resolve();
              }, 200);
            }),
            new Promise(function (_, reject) {
              setTimeout(function () {
                return reject(new Error("API health check timeout"));
              }, timeout);
            }),
          ]),
        ];
      });
    });
  };
  return SubscriptionExternalAPICircuitBreaker;
})(SubscriptionCircuitBreaker);
exports.SubscriptionExternalAPICircuitBreaker = SubscriptionExternalAPICircuitBreaker;
// Global circuit breaker registry
var CircuitBreakerRegistry = /** @class */ (function () {
  function CircuitBreakerRegistry() {
    this.breakers = new Map();
  }
  CircuitBreakerRegistry.prototype.register = function (name, breaker) {
    this.breakers.set(name, breaker);
  };
  CircuitBreakerRegistry.prototype.get = function (name) {
    return this.breakers.get(name);
  };
  CircuitBreakerRegistry.prototype.getAll = function () {
    return new Map(this.breakers);
  };
  CircuitBreakerRegistry.prototype.getStats = function () {
    var stats = {};
    for (var _i = 0, _a = this.breakers; _i < _a.length; _i++) {
      var _b = _a[_i],
        name_1 = _b[0],
        breaker = _b[1];
      stats[name_1] = breaker.getStats();
    }
    return stats;
  };
  CircuitBreakerRegistry.prototype.resetAll = function () {
    for (var _i = 0, _a = this.breakers.values(); _i < _a.length; _i++) {
      var breaker = _a[_i];
      breaker.reset();
    }
  };
  CircuitBreakerRegistry.prototype.destroy = function () {
    for (var _i = 0, _a = this.breakers.values(); _i < _a.length; _i++) {
      var breaker = _a[_i];
      breaker.destroy();
    }
    this.breakers.clear();
  };
  return CircuitBreakerRegistry;
})();
// Global registry instance with default circuit breakers
exports.circuitBreakerRegistry = new CircuitBreakerRegistry();
// Initialize default circuit breakers
var databaseBreaker = new SubscriptionDatabaseCircuitBreaker();
var cacheBreaker = new SubscriptionCacheCircuitBreaker();
exports.circuitBreakerRegistry.register("database", databaseBreaker);
exports.circuitBreakerRegistry.register("cache", cacheBreaker);
