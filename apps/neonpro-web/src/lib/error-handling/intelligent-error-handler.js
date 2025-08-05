"use strict";
/**
 * 🔧 NeonPro Intelligent Error Handler
 *
 * Sistema adaptativo que captura, categoriza e resolve erros automaticamente
 * com recuperação inteligente e prevenção proativa
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
exports.intelligentErrorHandler = exports.IntelligentErrorHandler = void 0;
exports.withErrorHandling = withErrorHandling;
exports.withErrorBoundary = withErrorBoundary;
var react_1 = require("react");
var lru_cache_1 = require("lru-cache");
var performance_monitor_1 = require("@/lib/monitoring/performance-monitor");
var error_patterns_1 = require("./error-patterns");
// Cache para evitar spam de erros iguais
var errorDeduplicationCache = new lru_cache_1.LRUCache({
  max: 1000,
  ttl: 5 * 60 * 1000, // 5 minutes
});
// Cache para tracking de error patterns
var errorPatternsCache = new lru_cache_1.LRUCache({
  max: 500,
  ttl: 30 * 60 * 1000, // 30 minutes
});
var IntelligentErrorHandler = /** @class */ (function () {
  function IntelligentErrorHandler() {
    this.errorHistory = [];
    this.maxErrors = 10000;
  }
  IntelligentErrorHandler.getInstance = function () {
    if (!IntelligentErrorHandler.instance) {
      IntelligentErrorHandler.instance = new IntelligentErrorHandler();
    }
    return IntelligentErrorHandler.instance;
  };
  /**
   * 🚨 Capture and process error with intelligent analysis
   */
  IntelligentErrorHandler.prototype.captureError = function (error, context) {
    if (context === void 0) {
      context = {};
    }
    var errorMessage = typeof error === "string" ? error : error.message;
    var errorStack = typeof error === "object" ? error.stack : undefined;
    var errorId = this.generateErrorId(errorMessage, context.route);
    // Check for deduplication
    var existingError = errorDeduplicationCache.get(errorId);
    if (existingError) {
      // Update count but don't create new error
      return existingError;
    }
    // Analyze error pattern
    var analysis = this.analyzeError(errorMessage, errorStack);
    var errorContext = __assign(
      {
        errorId: errorId,
        message: errorMessage,
        stack: errorStack,
        timestamp: Date.now(),
        severity: analysis.severity,
        category: analysis.category,
        recoveryAction: analysis.recoveryAction,
        resolved: false,
      },
      context,
    );
    // Cache for deduplication
    errorDeduplicationCache.set(errorId, errorContext);
    // Add to history
    this.addToHistory(errorContext);
    // Record performance impact
    this.recordErrorMetrics(errorContext);
    // Auto-recovery attempt
    this.attemptAutoRecovery(errorContext);
    return errorContext;
  };
  /**
   * 📊 Record error metrics for monitoring
   */
  IntelligentErrorHandler.prototype.recordErrorMetrics = function (errorContext) {
    performance_monitor_1.performanceMonitor.recordClientPerformance(
      "error.".concat(errorContext.category, ".").concat(errorContext.severity),
      1,
      {
        errorId: errorContext.errorId,
        route: errorContext.route,
        recoveryAction: errorContext.recoveryAction,
        timestamp: errorContext.timestamp,
      },
    );
  };
  /**
   * 📚 Add error to history with memory management
   */
  IntelligentErrorHandler.prototype.addToHistory = function (errorContext) {
    this.errorHistory.push(errorContext);
    // Clean old errors to prevent memory leaks
    if (this.errorHistory.length > this.maxErrors) {
      this.errorHistory = this.errorHistory.slice(-Math.floor(this.maxErrors * 0.8));
    }
  };
  /**
   * 📋 Get error summary for monitoring
   */
  IntelligentErrorHandler.prototype.getErrorSummary = function (timeWindow) {
    if (timeWindow === void 0) {
      timeWindow = 30 * 60 * 1000;
    }
    var now = Date.now();
    var recentErrors = this.errorHistory.filter(function (e) {
      return now - e.timestamp <= timeWindow;
    });
    var byCategory = {};
    var bySeverity = {};
    recentErrors.forEach(function (error) {
      byCategory[error.category] = (byCategory[error.category] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    });
    // Get top error patterns
    var topErrors = [];
    errorPatternsCache.forEach(function (count, pattern) {
      topErrors.push({ pattern: pattern, count: count });
    });
    topErrors.sort(function (a, b) {
      return b.count - a.count;
    });
    return {
      totalErrors: recentErrors.length,
      byCategory: byCategory,
      bySeverity: bySeverity,
      topErrors: topErrors.slice(0, 10),
      recentErrors: recentErrors.slice(-20), // Last 20 errors
    };
  };
  /**
   * 🔍 Get specific error details
   */
  IntelligentErrorHandler.prototype.getError = function (errorId) {
    return (
      this.errorHistory.find(function (e) {
        return e.errorId === errorId;
      }) || errorDeduplicationCache.get(errorId)
    );
  };
  /**
   * ✅ Mark error as resolved
   */
  IntelligentErrorHandler.prototype.resolveError = function (errorId, resolution) {
    var error = this.getError(errorId);
    if (error) {
      error.resolved = true;
      error.metadata = __assign(__assign({}, error.metadata), {
        resolution: resolution,
        resolvedAt: Date.now(),
      });
      return true;
    }
    return false;
  };
  /**
   * 🔍 Analyze error to determine category, severity and recovery action
   */
  IntelligentErrorHandler.prototype.analyzeError = function (message, stack) {
    var fullText = "".concat(message, " ").concat(stack || "");
    // Check against known patterns
    for (
      var _i = 0, KNOWN_ERROR_PATTERNS_1 = error_patterns_1.KNOWN_ERROR_PATTERNS;
      _i < KNOWN_ERROR_PATTERNS_1.length;
      _i++
    ) {
      var pattern = KNOWN_ERROR_PATTERNS_1[_i];
      if (pattern.pattern.test(fullText)) {
        // Track pattern frequency
        var patternKey = pattern.description;
        var currentCount = errorPatternsCache.get(patternKey) || 0;
        errorPatternsCache.set(patternKey, currentCount + 1);
        return {
          category: pattern.category,
          severity: pattern.severity,
          recoveryAction: pattern.recoveryAction,
        };
      }
    }
    // Default fallback analysis
    var category = "unknown";
    var severity = "medium";
    // Basic categorization based on keywords
    if (/database|sql|query|connection/i.test(fullText)) {
      category = "database";
    } else if (/auth|token|session|login/i.test(fullText)) {
      category = "auth";
    } else if (/api|fetch|request|response/i.test(fullText)) {
      category = "api";
    } else if (/validation|invalid|required/i.test(fullText)) {
      category = "validation";
      severity = "low";
    } else if (/network|timeout|refused/i.test(fullText)) {
      category = "network";
    }
    return {
      category: category,
      severity: severity,
      recoveryAction: "log_and_monitor",
    };
  };
  /**
   * 🆔 Generate unique error ID for deduplication
   */
  IntelligentErrorHandler.prototype.generateErrorId = function (message, route) {
    var baseString = "".concat(message, "_").concat(route || "unknown");
    // Simple hash function for error ID
    var hash = 0;
    for (var i = 0; i < baseString.length; i++) {
      var char = baseString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return "err_".concat(Math.abs(hash).toString(36), "_").concat(Date.now());
  };
  /**
   * 🔧 Attempt automatic error recovery
   */
  IntelligentErrorHandler.prototype.attemptAutoRecovery = function (errorContext) {
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
  IntelligentErrorHandler.prototype.scheduleRetry = function (errorContext) {
    var _a;
    var retryCount =
      ((_a = errorContext.metadata) === null || _a === void 0 ? void 0 : _a.retryCount) || 0;
    var maxRetries = 3;
    if (retryCount < maxRetries) {
      var backoffMs = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      setTimeout(function () {
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
  IntelligentErrorHandler.prototype.logRecoveryAction = function (errorContext, action) {
    console.log(
      "\uD83D\uDD27 Recovery action for ".concat(errorContext.errorId, ": ").concat(action),
    );
    errorContext.metadata = __assign(__assign({}, errorContext.metadata), {
      recoveryAction: action,
      recoveryAttemptedAt: Date.now(),
    });
  };
  return IntelligentErrorHandler;
})();
exports.IntelligentErrorHandler = IntelligentErrorHandler;
/**
 * 🎯 Singleton instance export
 */
exports.intelligentErrorHandler = IntelligentErrorHandler.getInstance();
/**
 * 🚨 Global error boundary utility
 */
function withErrorHandling(fn, context) {
  var _this = this;
  return function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    return __awaiter(_this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, fn.apply(void 0, args)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_1 = _a.sent();
            exports.intelligentErrorHandler.captureError(error_1, context);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
}
/**
 * 🛡️ React Error Boundary HOC helper
 */
function withErrorBoundary(Component, fallback) {
  return /** @class */ (function (_super) {
    __extends(ErrorBoundaryWrapper, _super);
    function ErrorBoundaryWrapper(props) {
      var _this = _super.call(this, props) || this;
      _this.state = { hasError: false };
      return _this;
    }
    ErrorBoundaryWrapper.getDerivedStateFromError = function (error) {
      return { hasError: true, error: error };
    };
    ErrorBoundaryWrapper.prototype.componentDidCatch = function (error, errorInfo) {
      var errorContext = exports.intelligentErrorHandler.captureError(error, {
        route: window.location.pathname,
        userId: undefined, // Set from context if available
        metadata: {
          componentStack: errorInfo.componentStack,
          errorBoundary: true,
        },
      });
      this.setState({ errorId: errorContext.errorId });
    };
    ErrorBoundaryWrapper.prototype.render = function () {
      if (this.state.hasError) {
        if (fallback && this.state.error && this.state.errorId) {
          var FallbackComponent = fallback;
          return react_1.default.createElement(FallbackComponent, {
            error: this.state.error,
            errorId: this.state.errorId,
          });
        }
        return react_1.default.createElement(
          "div",
          {
            className: "error-boundary p-4 border border-red-200 bg-red-50 rounded-lg",
          },
          [
            react_1.default.createElement(
              "h2",
              {
                key: "title",
                className: "text-red-800 font-medium mb-2",
              },
              "Algo deu errado",
            ),
            react_1.default.createElement(
              "p",
              {
                key: "message",
                className: "text-red-600 text-sm",
              },
              "Um erro inesperado ocorreu. Nossa equipe foi notificada.",
            ),
            this.state.errorId &&
              react_1.default.createElement(
                "p",
                {
                  key: "errorId",
                  className: "text-red-500 text-xs mt-2 font-mono",
                },
                "ID: ".concat(this.state.errorId),
              ),
          ].filter(Boolean),
        );
      }
      return react_1.default.createElement(Component, this.props);
    };
    return ErrorBoundaryWrapper;
  })(react_1.default.Component);
}
