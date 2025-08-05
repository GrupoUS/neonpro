"use strict";
/**
 * Centralized Subscription Error Handler
 *
 * Advanced error management system for subscription operations:
 * - Intelligent error classification and routing
 * - Automatic recovery strategies
 * - Comprehensive logging and monitoring
 * - User-friendly error messaging
 * - Integration with circuit breakers and performance monitoring
 *
 * @author NeonPro Development Team
 * @version 2.0.0 - Error Handling Enhanced
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionErrorHandler = exports.SubscriptionErrorHandler = void 0;
exports.withErrorHandling = withErrorHandling;
var subscription_errors_1 = require("../types/subscription-errors");
var subscription_cache_enhanced_1 = require("./subscription-cache-enhanced");
var subscription_circuit_breaker_1 = require("./subscription-circuit-breaker");
var defaultConfig = {
  enableAutoRecovery: true,
  maxRetryAttempts: 3,
  retryDelayMs: 1000,
  exponentialBackoff: true,
  enableCircuitBreaker: true,
  enableFallbackCache: true,
  logErrors: true,
  alertOnCritical: true,
  userNotificationThreshold: subscription_errors_1.ErrorSeverity.MEDIUM,
  gracefulDegradationEnabled: true,
};
var SubscriptionErrorHandler = /** @class */ (function () {
  function SubscriptionErrorHandler(config) {
    this.errorHistory = [];
    this.maxHistorySize = 100;
    this.config = __assign(__assign({}, defaultConfig), config);
    this.recoveryStrategies = this.initializeRecoveryStrategies();
  }
  /**
   * Main error handling entry point
   */
  SubscriptionErrorHandler.prototype.handleError = function (error, operation, context) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, subscriptionError, fallbackResult;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            // Convert to SubscriptionError if needed
            if (error instanceof Error && !("code" in error)) {
              subscriptionError = this.classifyError(error, context);
            } else {
              subscriptionError = error;
            }
            // Enrich error with context
            if (context) {
              subscriptionError = subscription_errors_1.SubscriptionErrorFactory.enrichError(
                subscriptionError,
                context,
              );
            }
            // Log error if enabled
            if (this.config.logErrors) {
              this.logError(subscriptionError, context);
            }
            // Add to error history
            this.addToHistory(subscriptionError);
            // Check for circuit breaker
            if (
              this.config.enableCircuitBreaker &&
              this.shouldUseCircuitBreaker(subscriptionError)
            ) {
              return [
                2 /*return*/,
                this.handleWithCircuitBreaker(operation, subscriptionError, context, startTime),
              ];
            }
            // Attempt recovery if enabled
            if (this.config.enableAutoRecovery && subscriptionError.retryable) {
              return [
                2 /*return*/,
                this.attemptRecovery(operation, subscriptionError, context, startTime),
              ];
            }
            return [4 /*yield*/, this.applyFallbackStrategies(subscriptionError, context)];
          case 1:
            fallbackResult = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: subscriptionError,
                recoveryAttempted: false,
                fallbackUsed: fallbackResult.fallbackUsed,
                retryAttempts: 0,
                totalExecutionTime: Date.now() - startTime,
                userMessage: this.getUserFriendlyMessage(subscriptionError),
                data: fallbackResult.data,
              },
            ];
        }
      });
    });
  };
  /**
   * Classify generic errors into subscription-specific errors
   */
  SubscriptionErrorHandler.prototype.classifyError = function (error, context) {
    var message = error.message.toLowerCase();
    // Authentication errors
    if (message.includes("auth") || message.includes("unauthorized") || message.includes("token")) {
      return subscription_errors_1.SubscriptionErrorFactory.createError(
        "auth",
        error.message,
        context,
      );
    }
    // Network errors
    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("connection")
    ) {
      return subscription_errors_1.SubscriptionErrorFactory.createError(
        "network",
        error.message,
        context,
      );
    }
    // Timeout errors
    if (message.includes("timeout") || message.includes("aborted")) {
      return subscription_errors_1.SubscriptionErrorFactory.createError(
        "timeout",
        error.message,
        context,
      );
    }
    // Database errors
    if (message.includes("database") || message.includes("sql") || message.includes("query")) {
      return subscription_errors_1.SubscriptionErrorFactory.createError(
        "database",
        error.message,
        context,
      );
    }
    // Rate limit errors
    if (message.includes("rate") || message.includes("limit") || message.includes("throttle")) {
      return subscription_errors_1.SubscriptionErrorFactory.createError(
        "rate_limit",
        error.message,
        context,
      );
    }
    // Default to validation error
    return subscription_errors_1.SubscriptionErrorFactory.createError(
      "validation",
      error.message,
      context,
    );
  };
  /**
   * Initialize recovery strategy implementations
   */
  SubscriptionErrorHandler.prototype.initializeRecoveryStrategies = function () {
    var _this = this;
    var strategies = new Map();
    // Retry strategy
    strategies.set(subscription_errors_1.RecoveryStrategy.RETRY, {
      canHandle: function (error) {
        return (
          error.retryable && error.category !== subscription_errors_1.ErrorCategory.AUTHENTICATION
        );
      },
      execute: function (operation, error, context, attempt) {
        return __awaiter(_this, void 0, void 0, function () {
          var delay;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                delay = this.calculateRetryDelay(attempt);
                return [4 /*yield*/, this.sleep(delay)];
              case 1:
                _a.sent();
                return [2 /*return*/, operation()];
            }
          });
        });
      },
      maxAttempts: this.config.maxRetryAttempts,
      delayMs: this.config.retryDelayMs,
    });
    // Fallback strategy
    strategies.set(subscription_errors_1.RecoveryStrategy.FALLBACK, {
      canHandle: function (error) {
        return (
          error.category === subscription_errors_1.ErrorCategory.CACHE ||
          error.category === subscription_errors_1.ErrorCategory.EXTERNAL_SERVICE
        );
      },
      execute: function (operation, error, context, attempt) {
        return __awaiter(_this, void 0, void 0, function () {
          var cachedResult;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                if (
                  !(
                    this.config.enableFallbackCache &&
                    (context === null || context === void 0 ? void 0 : context.userId)
                  )
                )
                  return [3 /*break*/, 2];
                return [4 /*yield*/, this.tryFallbackCache(context.userId)];
              case 1:
                cachedResult = _a.sent();
                if (cachedResult) {
                  return [2 /*return*/, cachedResult];
                }
                _a.label = 2;
              case 2:
                throw error; // Re-throw if no fallback available
            }
          });
        });
      },
      maxAttempts: 1,
      delayMs: 0,
    });
    // Graceful degradation strategy
    strategies.set(subscription_errors_1.RecoveryStrategy.GRACEFUL_DEGRADE, {
      canHandle: function (error) {
        return _this.config.gracefulDegradationEnabled;
      },
      execute: function (operation, error, context, attempt) {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            // Return a degraded version of the service
            return [2 /*return*/, this.getDegradedService(context)];
          });
        });
      },
      maxAttempts: 1,
      delayMs: 0,
    });
    return strategies;
  };
  /**
   * Attempt recovery using configured strategies
   */
  SubscriptionErrorHandler.prototype.attemptRecovery = function (
    operation,
    error,
    context,
    startTime,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var strategy, lastError, attempts, maxAttempts, result, retryError_1, fallbackResult;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            strategy = this.recoveryStrategies.get(error.recoveryStrategy);
            if (!strategy || !strategy.canHandle(error)) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: error,
                  recoveryAttempted: false,
                  fallbackUsed: false,
                  retryAttempts: 0,
                  totalExecutionTime: Date.now() - startTime,
                  userMessage: this.getUserFriendlyMessage(error),
                },
              ];
            }
            lastError = error;
            attempts = 0;
            maxAttempts = Math.min(strategy.maxAttempts, this.config.maxRetryAttempts);
            _a.label = 1;
          case 1:
            if (!(attempts < maxAttempts)) return [3 /*break*/, 6];
            attempts++;
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 5]);
            return [4 /*yield*/, strategy.execute(operation, lastError, context || {}, attempts)];
          case 3:
            result = _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                data: result,
                recoveryAttempted: true,
                recoveryStrategy: error.recoveryStrategy,
                fallbackUsed: false,
                retryAttempts: attempts,
                totalExecutionTime: Date.now() - startTime,
              },
            ];
          case 4:
            retryError_1 = _a.sent();
            lastError =
              retryError_1 instanceof Error && "code" in retryError_1
                ? retryError_1
                : this.classifyError(retryError_1, context);
            // Log retry attempt
            if (this.config.logErrors) {
              console.warn(
                "Recovery attempt ".concat(attempts, "/").concat(maxAttempts, " failed:"),
                lastError.message,
              );
            }
            // Check if we should stop retrying
            if (
              !lastError.retryable ||
              lastError.severity === subscription_errors_1.ErrorSeverity.CRITICAL
            ) {
              return [3 /*break*/, 6];
            }
            return [3 /*break*/, 5];
          case 5:
            return [3 /*break*/, 1];
          case 6:
            return [4 /*yield*/, this.applyFallbackStrategies(lastError, context)];
          case 7:
            fallbackResult = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: lastError,
                recoveryAttempted: true,
                recoveryStrategy: error.recoveryStrategy,
                fallbackUsed: fallbackResult.fallbackUsed,
                retryAttempts: attempts,
                totalExecutionTime: Date.now() - startTime,
                userMessage: this.getUserFriendlyMessage(lastError),
                data: fallbackResult.data,
              },
            ];
        }
      });
    });
  };
  /**
   * Handle errors with circuit breaker
   */
  SubscriptionErrorHandler.prototype.handleWithCircuitBreaker = function (
    operation,
    error,
    context,
    startTime,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var breakerName, breaker, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            breakerName = this.getCircuitBreakerName(error);
            breaker = subscription_circuit_breaker_1.circuitBreakerRegistry.get(breakerName);
            if (!breaker) {
              // No circuit breaker available, handle normally
              return [2 /*return*/, this.attemptRecovery(operation, error, context, startTime)];
            }
            return [4 /*yield*/, breaker.execute(operation, context)];
          case 1:
            result = _a.sent();
            return [
              2 /*return*/,
              {
                success: result.success,
                data: result.data,
                error: result.error,
                recoveryAttempted: !result.fromCircuitBreaker,
                fallbackUsed: result.fromCircuitBreaker,
                retryAttempts: 0,
                totalExecutionTime: Date.now() - startTime,
                userMessage: result.error ? this.getUserFriendlyMessage(result.error) : undefined,
              },
            ];
        }
      });
    });
  };
  /**
   * Apply fallback strategies
   */
  SubscriptionErrorHandler.prototype.applyFallbackStrategies = function (error, context) {
    return __awaiter(this, void 0, void 0, function () {
      var cachedData, degradedData;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (
              !(
                this.config.enableFallbackCache &&
                (context === null || context === void 0 ? void 0 : context.userId)
              )
            )
              return [3 /*break*/, 2];
            return [4 /*yield*/, this.tryFallbackCache(context.userId)];
          case 1:
            cachedData = _a.sent();
            if (cachedData) {
              return [2 /*return*/, { fallbackUsed: true, data: cachedData }];
            }
            _a.label = 2;
          case 2:
            if (!this.config.gracefulDegradationEnabled) return [3 /*break*/, 4];
            return [4 /*yield*/, this.getDegradedService(context)];
          case 3:
            degradedData = _a.sent();
            if (degradedData) {
              return [2 /*return*/, { fallbackUsed: true, data: degradedData }];
            }
            _a.label = 4;
          case 4:
            return [2 /*return*/, { fallbackUsed: false }];
        }
      });
    });
  };
  /**
   * Try to get fallback data from cache
   */
  SubscriptionErrorHandler.prototype.tryFallbackCache = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var cacheKey, cachedData, cacheError_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            cacheKey = "subscription:fallback:".concat(userId);
            return [
              4 /*yield*/,
              subscription_cache_enhanced_1.enhancedSubscriptionCache.get(cacheKey),
            ];
          case 1:
            cachedData = _a.sent();
            if (cachedData && typeof cachedData === "object" && "hasAccess" in cachedData) {
              return [2 /*return*/, cachedData];
            }
            return [3 /*break*/, 3];
          case 2:
            cacheError_1 = _a.sent();
            console.warn("Failed to retrieve fallback cache data:", cacheError_1);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/, null];
        }
      });
    });
  };
  /**
   * Get degraded service response
   */
  SubscriptionErrorHandler.prototype.getDegradedService = function (context) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Return a basic valid response with limited features
        return [
          2 /*return*/,
          {
            hasAccess: false,
            status: null,
            subscription: null,
            message: "Service is temporarily limited. Some features may not be available.",
            redirectTo: undefined,
            gracePeriod: false,
            performance: {
              validationTime: 0,
              cacheHit: false,
              source: "error",
            },
          },
        ];
      });
    });
  };
  /**
   * Calculate retry delay with exponential backoff
   */
  SubscriptionErrorHandler.prototype.calculateRetryDelay = function (attempt) {
    if (!this.config.exponentialBackoff) {
      return this.config.retryDelayMs;
    }
    // Exponential backoff with jitter
    var baseDelay = this.config.retryDelayMs * Math.pow(2, attempt - 1);
    var jitter = Math.random() * 0.1 * baseDelay;
    return Math.min(baseDelay + jitter, 30000); // Max 30 seconds
  };
  /**
   * Sleep utility
   */
  SubscriptionErrorHandler.prototype.sleep = function (ms) {
    return new Promise(function (resolve) {
      return setTimeout(resolve, ms);
    });
  };
  /**
   * Determine which circuit breaker to use
   */
  SubscriptionErrorHandler.prototype.getCircuitBreakerName = function (error) {
    switch (error.category) {
      case subscription_errors_1.ErrorCategory.DATABASE:
        return "database";
      case subscription_errors_1.ErrorCategory.CACHE:
        return "cache";
      case subscription_errors_1.ErrorCategory.EXTERNAL_SERVICE:
        return "external_api";
      default:
        return "database"; // Default fallback
    }
  };
  /**
   * Check if circuit breaker should be used
   */
  SubscriptionErrorHandler.prototype.shouldUseCircuitBreaker = function (error) {
    return (
      error.severity === subscription_errors_1.ErrorSeverity.HIGH ||
      error.severity === subscription_errors_1.ErrorSeverity.CRITICAL ||
      error.category === subscription_errors_1.ErrorCategory.DATABASE ||
      error.category === subscription_errors_1.ErrorCategory.EXTERNAL_SERVICE
    );
  };
  /**
   * Get user-friendly error message
   */
  SubscriptionErrorHandler.prototype.getUserFriendlyMessage = function (error) {
    if (error.severity <= this.config.userNotificationThreshold) {
      return error.userMessage;
    }
    // Don't show technical errors to users for low-severity issues
    return "A temporary issue occurred. Please try again.";
  };
  /**
   * Log error with appropriate level
   */
  SubscriptionErrorHandler.prototype.logError = function (error, context) {
    var logData = {
      error: {
        code: error.code,
        message: error.message,
        severity: error.severity,
        category: error.category,
        timestamp: error.timestamp,
      },
      context: context,
      retryable: error.retryable,
    };
    switch (error.severity) {
      case subscription_errors_1.ErrorSeverity.CRITICAL:
        console.error("CRITICAL Subscription Error:", logData);
        if (this.config.alertOnCritical) {
          this.sendAlert("Critical subscription error: ".concat(error.message));
        }
        break;
      case subscription_errors_1.ErrorSeverity.HIGH:
        console.error("HIGH Subscription Error:", logData);
        break;
      case subscription_errors_1.ErrorSeverity.MEDIUM:
        console.warn("MEDIUM Subscription Error:", logData);
        break;
      case subscription_errors_1.ErrorSeverity.LOW:
      default:
        console.info("LOW Subscription Error:", logData);
        break;
    }
  };
  /**
   * Send alert for critical errors
   */
  SubscriptionErrorHandler.prototype.sendAlert = function (message) {
    // Implement your alerting mechanism here
    console.error("ALERT: ".concat(message));
    // Could integrate with external alerting services
  };
  /**
   * Add error to history for analysis
   */
  SubscriptionErrorHandler.prototype.addToHistory = function (error) {
    this.errorHistory.push(error);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }
  };
  /**
   * Get error statistics
   */
  SubscriptionErrorHandler.prototype.getErrorStats = function () {
    var stats = {
      totalErrors: this.errorHistory.length,
      bySeverity: {},
      byCategory: {},
      recentErrors: this.errorHistory.slice(-10),
    };
    // Initialize counters
    Object.values(subscription_errors_1.ErrorSeverity).forEach(function (severity) {
      stats.bySeverity[severity] = 0;
    });
    Object.values(subscription_errors_1.ErrorCategory).forEach(function (category) {
      stats.byCategory[category] = 0;
    });
    // Count errors
    this.errorHistory.forEach(function (error) {
      stats.bySeverity[error.severity]++;
      stats.byCategory[error.category]++;
    });
    return stats;
  };
  /**
   * Reset error history
   */
  SubscriptionErrorHandler.prototype.resetStats = function () {
    this.errorHistory = [];
  };
  /**
   * Update configuration
   */
  SubscriptionErrorHandler.prototype.updateConfig = function (newConfig) {
    this.config = __assign(__assign({}, this.config), newConfig);
  };
  return SubscriptionErrorHandler;
})();
exports.SubscriptionErrorHandler = SubscriptionErrorHandler;
// Global error handler instance
exports.subscriptionErrorHandler = new SubscriptionErrorHandler();
// Utility function for easy error handling
function withErrorHandling(operation, context) {
  return __awaiter(this, void 0, void 0, function () {
    var result, error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [4 /*yield*/, operation()];
        case 1:
          result = _a.sent();
          return [
            2 /*return*/,
            {
              success: true,
              data: result,
              recoveryAttempted: false,
              fallbackUsed: false,
              retryAttempts: 0,
              totalExecutionTime: 0,
            },
          ];
        case 2:
          error_1 = _a.sent();
          return [
            2 /*return*/,
            exports.subscriptionErrorHandler.handleError(error_1, operation, context),
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
