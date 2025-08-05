/**
 * Advanced Subscription Error Types
 *
 * Comprehensive error type system for subscription middleware with:
 * - Structured error classification
 * - Recovery strategy hints
 * - Monitoring metadata
 * - User-friendly messaging
 *
 * @author NeonPro Development Team
 * @version 2.0.0 - Error Handling Enhanced
 */
var __extends =
  (this && this.__extends) ||
  (() => {
    var extendStatics = (d, b) => {
      extendStatics =
        Object.setPrototypeOf ||
        (Array.isArray({ __proto__: [] }) &&
          ((d, b) => {
            d.__proto__ = b;
          })) ||
        ((d, b) => {
          for (var p in b) if (Object.hasOwn(b, p)) d[p] = b[p];
        });
      return extendStatics(d, b);
    };
    return (d, b) => {
      if (typeof b !== "function" && b !== null)
        throw new TypeError(`Class extends value ${String(b)} is not a constructor or null`);
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
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionErrorFactory =
  exports.SubscriptionExternalServiceError =
  exports.SubscriptionTimeoutError =
  exports.SubscriptionRateLimitError =
  exports.SubscriptionCacheError =
  exports.SubscriptionDatabaseError =
  exports.SubscriptionNetworkError =
  exports.SubscriptionValidationError =
  exports.SubscriptionAuthError =
  exports.RecoveryStrategy =
  exports.ErrorCategory =
  exports.ErrorSeverity =
    void 0;
// Base error severity levels
var ErrorSeverity;
((ErrorSeverity) => {
  ErrorSeverity.LOW = "low";
  ErrorSeverity.MEDIUM = "medium";
  ErrorSeverity.HIGH = "high";
  ErrorSeverity.CRITICAL = "critical"; // System-breaking issues
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
// Error categories for better classification
var ErrorCategory;
((ErrorCategory) => {
  ErrorCategory.AUTHENTICATION = "authentication";
  ErrorCategory.AUTHORIZATION = "authorization";
  ErrorCategory.NETWORK = "network";
  ErrorCategory.DATABASE = "database";
  ErrorCategory.CACHE = "cache";
  ErrorCategory.VALIDATION = "validation";
  ErrorCategory.EXTERNAL_SERVICE = "external_service";
  ErrorCategory.RATE_LIMIT = "rate_limit";
  ErrorCategory.TIMEOUT = "timeout";
  ErrorCategory.UNKNOWN = "unknown";
})(ErrorCategory || (exports.ErrorCategory = ErrorCategory = {}));
// Recovery strategies
var RecoveryStrategy;
((RecoveryStrategy) => {
  RecoveryStrategy.RETRY = "retry";
  RecoveryStrategy.FALLBACK = "fallback";
  RecoveryStrategy.CIRCUIT_BREAK = "circuit_break";
  RecoveryStrategy.GRACEFUL_DEGRADE = "graceful_degrade";
  RecoveryStrategy.USER_INTERVENTION = "user_intervention";
  RecoveryStrategy.SYSTEM_RESTART = "system_restart";
})(RecoveryStrategy || (exports.RecoveryStrategy = RecoveryStrategy = {}));
// Specific error types
var SubscriptionAuthError = /** @class */ ((_super) => {
  __extends(SubscriptionAuthError, _super);
  function SubscriptionAuthError(technicalMessage, metadata) {
    var _this = _super.call(this, technicalMessage) || this;
    _this.code = "SUB_AUTH_ERROR";
    _this.severity = ErrorSeverity.HIGH;
    _this.category = ErrorCategory.AUTHENTICATION;
    _this.recoveryStrategy = RecoveryStrategy.USER_INTERVENTION;
    _this.metadata = {};
    _this.timestamp = new Date();
    _this.userMessage = "Authentication required. Please log in to continue.";
    _this.retryable = false;
    _this.shouldLog = true;
    _this.shouldAlert = false;
    _this.name = "SubscriptionAuthError";
    _this.technicalMessage = technicalMessage;
    _this.metadata = metadata || {};
    return _this;
  }
  return SubscriptionAuthError;
})(Error);
exports.SubscriptionAuthError = SubscriptionAuthError;
var SubscriptionValidationError = /** @class */ ((_super) => {
  __extends(SubscriptionValidationError, _super);
  function SubscriptionValidationError(technicalMessage, metadata) {
    var _this = _super.call(this, technicalMessage) || this;
    _this.code = "SUB_VALIDATION_ERROR";
    _this.severity = ErrorSeverity.MEDIUM;
    _this.category = ErrorCategory.VALIDATION;
    _this.recoveryStrategy = RecoveryStrategy.FALLBACK;
    _this.metadata = {};
    _this.timestamp = new Date();
    _this.userMessage = "Unable to verify subscription status. Using cached data.";
    _this.retryable = true;
    _this.shouldLog = true;
    _this.shouldAlert = false;
    _this.name = "SubscriptionValidationError";
    _this.technicalMessage = technicalMessage;
    _this.metadata = metadata || {};
    return _this;
  }
  return SubscriptionValidationError;
})(Error);
exports.SubscriptionValidationError = SubscriptionValidationError;
var SubscriptionNetworkError = /** @class */ ((_super) => {
  __extends(SubscriptionNetworkError, _super);
  function SubscriptionNetworkError(technicalMessage, metadata) {
    var _this = _super.call(this, technicalMessage) || this;
    _this.code = "SUB_NETWORK_ERROR";
    _this.severity = ErrorSeverity.MEDIUM;
    _this.category = ErrorCategory.NETWORK;
    _this.recoveryStrategy = RecoveryStrategy.RETRY;
    _this.metadata = {};
    _this.timestamp = new Date();
    _this.userMessage = "Connection issue detected. Retrying...";
    _this.retryable = true;
    _this.shouldLog = true;
    _this.shouldAlert = false;
    _this.name = "SubscriptionNetworkError";
    _this.technicalMessage = technicalMessage;
    _this.metadata = metadata || {};
    return _this;
  }
  return SubscriptionNetworkError;
})(Error);
exports.SubscriptionNetworkError = SubscriptionNetworkError;
var SubscriptionDatabaseError = /** @class */ ((_super) => {
  __extends(SubscriptionDatabaseError, _super);
  function SubscriptionDatabaseError(technicalMessage, metadata) {
    var _this = _super.call(this, technicalMessage) || this;
    _this.code = "SUB_DATABASE_ERROR";
    _this.severity = ErrorSeverity.HIGH;
    _this.category = ErrorCategory.DATABASE;
    _this.recoveryStrategy = RecoveryStrategy.CIRCUIT_BREAK;
    _this.metadata = {};
    _this.timestamp = new Date();
    _this.userMessage = "System temporarily unavailable. Please try again shortly.";
    _this.retryable = true;
    _this.shouldLog = true;
    _this.shouldAlert = true;
    _this.name = "SubscriptionDatabaseError";
    _this.technicalMessage = technicalMessage;
    _this.metadata = metadata || {};
    return _this;
  }
  return SubscriptionDatabaseError;
})(Error);
exports.SubscriptionDatabaseError = SubscriptionDatabaseError;
var SubscriptionCacheError = /** @class */ ((_super) => {
  __extends(SubscriptionCacheError, _super);
  function SubscriptionCacheError(technicalMessage, metadata) {
    var _this = _super.call(this, technicalMessage) || this;
    _this.code = "SUB_CACHE_ERROR";
    _this.severity = ErrorSeverity.LOW;
    _this.category = ErrorCategory.CACHE;
    _this.recoveryStrategy = RecoveryStrategy.FALLBACK;
    _this.metadata = {};
    _this.timestamp = new Date();
    _this.userMessage = "Performance may be affected. System is working normally.";
    _this.retryable = true;
    _this.shouldLog = true;
    _this.shouldAlert = false;
    _this.name = "SubscriptionCacheError";
    _this.technicalMessage = technicalMessage;
    _this.metadata = metadata || {};
    return _this;
  }
  return SubscriptionCacheError;
})(Error);
exports.SubscriptionCacheError = SubscriptionCacheError;
var SubscriptionRateLimitError = /** @class */ ((_super) => {
  __extends(SubscriptionRateLimitError, _super);
  function SubscriptionRateLimitError(technicalMessage, metadata) {
    var _this = _super.call(this, technicalMessage) || this;
    _this.code = "SUB_RATE_LIMIT_ERROR";
    _this.severity = ErrorSeverity.MEDIUM;
    _this.category = ErrorCategory.RATE_LIMIT;
    _this.recoveryStrategy = RecoveryStrategy.RETRY;
    _this.metadata = {};
    _this.timestamp = new Date();
    _this.userMessage = "Too many requests. Please wait a moment.";
    _this.retryable = true;
    _this.shouldLog = true;
    _this.shouldAlert = false;
    _this.name = "SubscriptionRateLimitError";
    _this.technicalMessage = technicalMessage;
    _this.metadata = metadata || {};
    return _this;
  }
  return SubscriptionRateLimitError;
})(Error);
exports.SubscriptionRateLimitError = SubscriptionRateLimitError;
var SubscriptionTimeoutError = /** @class */ ((_super) => {
  __extends(SubscriptionTimeoutError, _super);
  function SubscriptionTimeoutError(technicalMessage, metadata) {
    var _this = _super.call(this, technicalMessage) || this;
    _this.code = "SUB_TIMEOUT_ERROR";
    _this.severity = ErrorSeverity.MEDIUM;
    _this.category = ErrorCategory.TIMEOUT;
    _this.recoveryStrategy = RecoveryStrategy.RETRY;
    _this.metadata = {};
    _this.timestamp = new Date();
    _this.userMessage = "Request timeout. Retrying...";
    _this.retryable = true;
    _this.shouldLog = true;
    _this.shouldAlert = false;
    _this.name = "SubscriptionTimeoutError";
    _this.technicalMessage = technicalMessage;
    _this.metadata = metadata || {};
    return _this;
  }
  return SubscriptionTimeoutError;
})(Error);
exports.SubscriptionTimeoutError = SubscriptionTimeoutError;
var SubscriptionExternalServiceError = /** @class */ ((_super) => {
  __extends(SubscriptionExternalServiceError, _super);
  function SubscriptionExternalServiceError(technicalMessage, metadata) {
    var _this = _super.call(this, technicalMessage) || this;
    _this.code = "SUB_EXTERNAL_SERVICE_ERROR";
    _this.severity = ErrorSeverity.HIGH;
    _this.category = ErrorCategory.EXTERNAL_SERVICE;
    _this.recoveryStrategy = RecoveryStrategy.FALLBACK;
    _this.metadata = {};
    _this.timestamp = new Date();
    _this.userMessage = "External service unavailable. Using backup method.";
    _this.retryable = true;
    _this.shouldLog = true;
    _this.shouldAlert = true;
    _this.name = "SubscriptionExternalServiceError";
    _this.technicalMessage = technicalMessage;
    _this.metadata = metadata || {};
    return _this;
  }
  return SubscriptionExternalServiceError;
})(Error);
exports.SubscriptionExternalServiceError = SubscriptionExternalServiceError;
// Error factory for creating typed errors
var SubscriptionErrorFactory = /** @class */ (() => {
  function SubscriptionErrorFactory() {}
  SubscriptionErrorFactory.createError = (type, technicalMessage, context) => {
    var metadata = context ? __assign({}, context) : {};
    switch (type) {
      case "auth":
        return new SubscriptionAuthError(technicalMessage, metadata);
      case "validation":
        return new SubscriptionValidationError(technicalMessage, metadata);
      case "network":
        return new SubscriptionNetworkError(technicalMessage, metadata);
      case "database":
        return new SubscriptionDatabaseError(technicalMessage, metadata);
      case "cache":
        return new SubscriptionCacheError(technicalMessage, metadata);
      case "rate_limit":
        return new SubscriptionRateLimitError(technicalMessage, metadata);
      case "timeout":
        return new SubscriptionTimeoutError(technicalMessage, metadata);
      case "external_service":
        return new SubscriptionExternalServiceError(technicalMessage, metadata);
      default:
        // Default to validation error for unknown types
        return new SubscriptionValidationError(technicalMessage, metadata);
    }
  };
  SubscriptionErrorFactory.enrichError = (error, context) => {
    error.userId = context.userId;
    error.requestId = context.requestId;
    error.metadata = __assign(__assign({}, error.metadata), context);
    return error;
  };
  return SubscriptionErrorFactory;
})();
exports.SubscriptionErrorFactory = SubscriptionErrorFactory;
// All types and classes exported above
