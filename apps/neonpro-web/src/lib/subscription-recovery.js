"use strict";
/**
 * Advanced Recovery Strategies for Subscription System
 *
 * Comprehensive recovery system with multiple strategies:
 * - Automatic retry with exponential backoff
 * - Fallback cache strategies
 * - Graceful degradation modes
 * - Circuit breaker integration
 * - User notification and intervention
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
exports.SubscriptionRecoveryManager = void 0;
var defaultRecoveryConfig = {
  maxRetryAttempts: 3,
  baseRetryDelay: 1000, // 1 second
  maxRetryDelay: 30000, // 30 seconds
  exponentialBackoff: true,
  jitterEnabled: true,
  enableFallbackCache: true,
  enableGracefulDegradation: true,
  enableUserNotification: true,
  circuitBreakerEnabled: true,
  timeoutMs: 10000, // 10 seconds
};
// Recovery strategy implementations
var SubscriptionRecoveryManager = /** @class */ (function () {
  function SubscriptionRecoveryManager(config) {
    this.config = __assign(__assign({}, defaultRecoveryConfig), config);
  }
  /**
   * Execute operation with automatic recovery
   */
  SubscriptionRecoveryManager.prototype.executeWithRecovery = function (operation, error, context) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, strategy;
      return __generator(this, function (_a) {
        startTime = Date.now();
        strategy = error.recoveryStrategy;
        switch (strategy) {
          case "retry":
            return [2 /*return*/, this.executeRetryStrategy(operation, error, context, startTime)];
          case "fallback":
            return [
              2 /*return*/,
              this.executeFallbackStrategy(operation, error, context, startTime),
            ];
          case "graceful_degrade":
            return [
              2 /*return*/,
              this.executeGracefulDegradationStrategy(operation, error, context, startTime),
            ];
          case "circuit_break":
            return [
              2 /*return*/,
              this.executeCircuitBreakerStrategy(operation, error, context, startTime),
            ];
          default:
            return [
              2 /*return*/,
              this.executeDefaultStrategy(operation, error, context, startTime),
            ];
        }
        return [2 /*return*/];
      });
    });
  };
  SubscriptionRecoveryManager.prototype.executeRetryStrategy = function (
    operation,
    error,
    context,
    startTime,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var attempts, lastError, data, err_1, delay;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            attempts = 0;
            lastError = error;
            _a.label = 1;
          case 1:
            if (!(attempts < this.config.maxRetryAttempts)) return [3 /*break*/, 8];
            attempts++;
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 7]);
            return [4 /*yield*/, operation()];
          case 3:
            data = _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                data: data,
                strategy: "retry",
                attempts: attempts,
                duration: Date.now() - startTime,
                fallbackUsed: false,
                metadata: { retryAttempts: attempts },
              },
            ];
          case 4:
            err_1 = _a.sent();
            lastError = err_1;
            if (!(attempts < this.config.maxRetryAttempts)) return [3 /*break*/, 6];
            delay = this.calculateRetryDelay(attempts);
            return [4 /*yield*/, this.sleep(delay)];
          case 5:
            _a.sent();
            _a.label = 6;
          case 6:
            return [3 /*break*/, 7];
          case 7:
            return [3 /*break*/, 1];
          case 8:
            return [
              2 /*return*/,
              {
                success: false,
                strategy: "retry",
                attempts: attempts,
                duration: Date.now() - startTime,
                fallbackUsed: false,
                error: lastError,
                metadata: { maxAttemptsReached: true },
              },
            ];
        }
      });
    });
  };
  SubscriptionRecoveryManager.prototype.executeFallbackStrategy = function (
    operation,
    error,
    context,
    startTime,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implement fallback strategy
        return [
          2 /*return*/,
          {
            success: false,
            strategy: "fallback",
            attempts: 1,
            duration: Date.now() - startTime,
            fallbackUsed: true,
            error: error,
            metadata: {},
          },
        ];
      });
    });
  };
  SubscriptionRecoveryManager.prototype.executeGracefulDegradationStrategy = function (
    operation,
    error,
    context,
    startTime,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implement graceful degradation
        return [
          2 /*return*/,
          {
            success: false,
            strategy: "graceful_degrade",
            attempts: 1,
            duration: Date.now() - startTime,
            fallbackUsed: true,
            error: error,
            metadata: {},
          },
        ];
      });
    });
  };
  SubscriptionRecoveryManager.prototype.executeCircuitBreakerStrategy = function (
    operation,
    error,
    context,
    startTime,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implement circuit breaker strategy
        return [
          2 /*return*/,
          {
            success: false,
            strategy: "circuit_break",
            attempts: 1,
            duration: Date.now() - startTime,
            fallbackUsed: false,
            error: error,
            metadata: {},
          },
        ];
      });
    });
  };
  SubscriptionRecoveryManager.prototype.executeDefaultStrategy = function (
    operation,
    error,
    context,
    startTime,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Default strategy - simple retry
        return [2 /*return*/, this.executeRetryStrategy(operation, error, context, startTime)];
      });
    });
  };
  SubscriptionRecoveryManager.prototype.calculateRetryDelay = function (attempt) {
    if (!this.config.exponentialBackoff) {
      return this.config.baseRetryDelay;
    }
    var delay = this.config.baseRetryDelay * Math.pow(2, attempt - 1);
    delay = Math.min(delay, this.config.maxRetryDelay);
    if (this.config.jitterEnabled) {
      delay += Math.random() * 1000;
    }
    return delay;
  };
  SubscriptionRecoveryManager.prototype.sleep = function (ms) {
    return new Promise(function (resolve) {
      return setTimeout(resolve, ms);
    });
  };
  return SubscriptionRecoveryManager;
})();
exports.SubscriptionRecoveryManager = SubscriptionRecoveryManager;
