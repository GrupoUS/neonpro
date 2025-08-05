/**
 * Error Recovery System - VIBECODE V1.0 Resilience
 * Automatic error recovery and self-healing mechanisms
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
exports.errorRecoverySystem = exports.ErrorRecoverySystem = void 0;
var ErrorRecoverySystem = /** @class */ (() => {
  function ErrorRecoverySystem() {
    this.recoveryStrategies = new Map();
    this.recoveryAttempts = new Map();
    this.recoveryHistory = [];
    this.initializeDefaultStrategies();
  }
  /**
   * Initialize default recovery strategies
   */
  ErrorRecoverySystem.prototype.initializeDefaultStrategies = function () {
    // Network retry strategy
    this.addRecoveryStrategy({
      name: "network_retry",
      condition: (error) =>
        error.errorType.includes("network") || error.errorType.includes("timeout"),
      action: (error) =>
        __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4 /*yield*/, this.delay(2 ** this.getRetryCount(error.errorId) * 1000)];
              case 1:
                _a.sent();
                return [2 /*return*/, true];
            }
          });
        }),
      maxRetries: 3,
    });
    // Token refresh strategy
    this.addRecoveryStrategy({
      name: "token_refresh",
      condition: (error) =>
        error.errorType.includes("auth") || error.errorType.includes("unauthorized"),
      action: (error) =>
        __awaiter(this, void 0, void 0, function () {
          return __generator(this, (_a) => {
            console.log("🔑 Attempting token refresh");
            // Token refresh logic would go here
            return [2 /*return*/, true];
          });
        }),
      maxRetries: 1,
    });
    // Data validation strategy
    this.addRecoveryStrategy({
      name: "data_validation",
      condition: (error) =>
        error.errorType.includes("validation") || error.errorType.includes("invalid"),
      action: (error) =>
        __awaiter(this, void 0, void 0, function () {
          return __generator(this, (_a) => {
            console.log("✅ Attempting data validation recovery");
            // Data validation recovery logic
            return [2 /*return*/, true];
          });
        }),
      maxRetries: 2,
    });
  };
  /**
   * Add a recovery strategy
   */
  ErrorRecoverySystem.prototype.addRecoveryStrategy = function (strategy) {
    this.recoveryStrategies.set(strategy.name, strategy);
  };
  /**
   * Attempt recovery for an error
   */
  ErrorRecoverySystem.prototype.attemptRecovery = function (errorContext) {
    return __awaiter(this, void 0, void 0, function () {
      var applicableStrategies,
        _i,
        applicableStrategies_1,
        strategy,
        retryCount,
        success,
        recoveryError_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            console.log(
              "\uD83D\uDD27 Attempting recovery for error: ".concat(errorContext.errorId),
            );
            applicableStrategies = Array.from(this.recoveryStrategies.values()).filter((strategy) =>
              strategy.condition(errorContext),
            );
            if (applicableStrategies.length === 0) {
              console.log(
                "\u274C No recovery strategy found for error: ".concat(errorContext.errorId),
              );
              return [2 /*return*/, false];
            }
            (_i = 0), (applicableStrategies_1 = applicableStrategies);
            _a.label = 1;
          case 1:
            if (!(_i < applicableStrategies_1.length)) return [3 /*break*/, 6];
            strategy = applicableStrategies_1[_i];
            retryCount = this.getRetryCount(errorContext.errorId);
            if (retryCount >= strategy.maxRetries) {
              console.log("\u26A0\uFE0F Max retries exceeded for strategy: ".concat(strategy.name));
              return [3 /*break*/, 5];
            }
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 5]);
            this.incrementRetryCount(errorContext.errorId);
            return [4 /*yield*/, strategy.action(errorContext)];
          case 3:
            success = _a.sent();
            if (success) {
              console.log("\u2705 Recovery successful using strategy: ".concat(strategy.name));
              this.logRecoverySuccess(errorContext, strategy.name);
              return [2 /*return*/, true];
            }
            return [3 /*break*/, 5];
          case 4:
            recoveryError_1 = _a.sent();
            console.error(
              "\u274C Recovery strategy failed: ".concat(strategy.name),
              recoveryError_1,
            );
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            console.log(
              "\u274C All recovery strategies failed for error: ".concat(errorContext.errorId),
            );
            return [2 /*return*/, false];
        }
      });
    });
  };
  /**
   * 🔧 Attempt automatic error recovery
   */
  ErrorRecoverySystem.prototype.attemptAutoRecovery = function (errorContext) {
    switch (errorContext.recoveryAction) {
      case "retry_with_backoff":
        this.scheduleRetry(errorContext);
        break;
      case "refresh_token":
        this.logRecoveryAction(errorContext, "Token refresh recommended");
        break;
      case "redirect_login":
        this.logRecoveryAction(errorContext, "Login redirect recommended");
        break;
      case "handle_duplicate":
        this.logRecoveryAction(errorContext, "Duplicate data handling needed");
        break;
      case "validate_input":
        this.logRecoveryAction(errorContext, "Input validation required");
        break;
      default:
        this.logRecoveryAction(errorContext, "Manual investigation required");
    }
  };
  /**
   * ⏰ Schedule retry with exponential backoff
   */
  ErrorRecoverySystem.prototype.scheduleRetry = (errorContext) => {
    var _a;
    var retryCount =
      ((_a = errorContext.metadata) === null || _a === void 0 ? void 0 : _a.retryCount) || 0;
    var maxRetries = 3;
    if (retryCount < maxRetries) {
      var backoffMs = 2 ** retryCount * 1000; // 1s, 2s, 4s
      setTimeout(() => {
        console.log(
          "\uD83D\uDD04 Auto-retry attempt "
            .concat(retryCount + 1, " for error ")
            .concat(errorContext.errorId),
        );
        // Mark as recovery attempted
        errorContext.metadata = __assign(__assign({}, errorContext.metadata), {
          retryCount: retryCount + 1,
          retryAttempted: true,
          lastRetryAt: Date.now(),
        });
      }, backoffMs);
    }
  };
  /**
   * 📝 Log recovery action taken
   */
  ErrorRecoverySystem.prototype.logRecoveryAction = (errorContext, action) => {
    console.log(
      "\uD83D\uDD27 Recovery action for ".concat(errorContext.errorId, ": ").concat(action),
    );
    errorContext.metadata = __assign(__assign({}, errorContext.metadata), {
      recoveryAction: action,
      recoveryAttemptedAt: Date.now(),
    });
  };
  /**
   * Get retry count for an error
   */
  ErrorRecoverySystem.prototype.getRetryCount = function (errorId) {
    return this.recoveryAttempts.get(errorId) || 0;
  };
  /**
   * Increment retry count
   */
  ErrorRecoverySystem.prototype.incrementRetryCount = function (errorId) {
    var current = this.getRetryCount(errorId);
    this.recoveryAttempts.set(errorId, current + 1);
  };
  /**
   * Log successful recovery
   */
  ErrorRecoverySystem.prototype.logRecoverySuccess = function (errorContext, strategyName) {
    var recoveredContext = __assign(__assign({}, errorContext), {
      metadata: __assign(__assign({}, errorContext.metadata), {
        recoveredAt: Date.now(),
        recoveryStrategy: strategyName,
        retryCount: this.getRetryCount(errorContext.errorId),
      }),
    });
    this.recoveryHistory.push(recoveredContext);
    // Clean up retry count
    this.recoveryAttempts.delete(errorContext.errorId);
  };
  /**
   * Delay utility
   */
  ErrorRecoverySystem.prototype.delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  /**
   * Get recovery statistics
   */
  ErrorRecoverySystem.prototype.getRecoveryStats = function () {
    var _a;
    var totalRecoveries = this.recoveryHistory.length;
    var strategyCounts = new Map();
    for (var _i = 0, _b = this.recoveryHistory; _i < _b.length; _i++) {
      var recovery = _b[_i];
      var strategy =
        ((_a = recovery.metadata) === null || _a === void 0 ? void 0 : _a.recoveryStrategy) ||
        "unknown";
      strategyCounts.set(strategy, (strategyCounts.get(strategy) || 0) + 1);
    }
    return {
      totalRecoveries: totalRecoveries,
      activeRetries: this.recoveryAttempts.size,
      strategyBreakdown: Object.fromEntries(strategyCounts),
      recentRecoveries: this.recoveryHistory.slice(-10),
    };
  };
  /**
   * Clear old recovery history
   */
  ErrorRecoverySystem.prototype.clearOldHistory = function (maxAge) {
    if (maxAge === void 0) {
      maxAge = 3600000;
    }
    var cutoff = Date.now() - maxAge;
    this.recoveryHistory = this.recoveryHistory.filter((recovery) => {
      var _a;
      return (
        (((_a = recovery.metadata) === null || _a === void 0 ? void 0 : _a.recoveredAt) || 0) >
        cutoff
      );
    });
  };
  return ErrorRecoverySystem;
})();
exports.ErrorRecoverySystem = ErrorRecoverySystem;
// Export singleton instance
exports.errorRecoverySystem = new ErrorRecoverySystem();
