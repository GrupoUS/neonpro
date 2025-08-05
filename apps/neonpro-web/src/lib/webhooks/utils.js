/**
 * Webhook & Event System Utilities
 * Story 7.3: Webhook & Event System Implementation
 *
 * This module provides utility functions for the webhook and event system:
 * - Event validation and transformation
 * - Webhook signature generation and validation
 * - Rate limiting utilities
 * - Retry logic helpers
 * - Payload formatting and sanitization
 * - Security and validation helpers
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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringUtils =
  exports.ValidationUtils =
  exports.RetryUtils =
  exports.RateLimitUtils =
  exports.WebhookUtils =
  exports.EventUtils =
    void 0;
var crypto_1 = require("node:crypto");
/**
 * Event Utilities
 */
var EventUtils = /** @class */ (() => {
  function EventUtils() {}
  /**
   * Validate event data structure
   */
  EventUtils.validateEvent = (event) => {
    var _a;
    var errors = [];
    // Required fields
    if (!event.type) {
      errors.push("Event type is required");
    }
    if (!event.source) {
      errors.push("Event source is required");
    }
    if (!event.data) {
      errors.push("Event data is required");
    }
    if (!((_a = event.metadata) === null || _a === void 0 ? void 0 : _a.clinicId)) {
      errors.push("Clinic ID is required in metadata");
    }
    // Validate event type
    var validEventTypes = [
      "patient.created",
      "patient.updated",
      "patient.deleted",
      "appointment.created",
      "appointment.updated",
      "appointment.cancelled",
      "appointment.completed",
      "payment.created",
      "payment.updated",
      "payment.completed",
      "payment.failed",
      "invoice.created",
      "invoice.updated",
      "invoice.sent",
      "invoice.paid",
      "invoice.overdue",
      "notification.sent",
      "notification.failed",
      "system.error",
      "system.maintenance",
    ];
    if (event.type && !validEventTypes.includes(event.type)) {
      errors.push("Invalid event type: ".concat(event.type));
    }
    // Validate priority
    var validPriorities = ["low", "normal", "high", "critical"];
    if (event.priority && !validPriorities.includes(event.priority)) {
      errors.push("Invalid event priority: ".concat(event.priority));
    }
    // Validate version format
    if (event.version && !/^\d+\.\d+\.\d+$/.test(event.version)) {
      errors.push("Event version must follow semantic versioning (e.g., 1.0.0)");
    }
    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  };
  /**
   * Sanitize event data for webhook delivery
   */
  EventUtils.sanitizeEventForWebhook = function (event, _webhook) {
    var sanitized = {
      id: event.id,
      type: event.type,
      version: event.version,
      timestamp: event.timestamp.toISOString(),
      source: event.source,
      priority: event.priority,
      data: this.sanitizeEventData(event.data),
      metadata: __assign(__assign({}, event.metadata), {
        // Remove sensitive metadata if needed
        internalId: undefined,
        debugInfo: undefined,
      }),
      context: event.context,
    };
    // Remove undefined values
    return JSON.parse(JSON.stringify(sanitized));
  };
  /**
   * Sanitize sensitive data from event payload
   */
  EventUtils.sanitizeEventData = function (data) {
    if (!data || typeof data !== "object") {
      return data;
    }
    var sensitiveFields = [
      "password",
      "token",
      "secret",
      "key",
      "apiKey",
      "creditCard",
      "ssn",
      "cpf",
      "bankAccount",
    ];
    var sanitized = __assign({}, data);
    // Remove or mask sensitive fields
    for (var _i = 0, sensitiveFields_1 = sensitiveFields; _i < sensitiveFields_1.length; _i++) {
      var field = sensitiveFields_1[_i];
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    }
    // Recursively sanitize nested objects
    for (var _a = 0, _b = Object.entries(sanitized); _a < _b.length; _a++) {
      var _c = _b[_a],
        key = _c[0],
        value = _c[1];
      if (value && typeof value === "object") {
        sanitized[key] = this.sanitizeEventData(value);
      }
    }
    return sanitized;
  };
  /**
   * Transform event for specific webhook requirements
   */
  EventUtils.transformEventForWebhook = function (event, webhook) {
    var _a;
    var basePayload = this.sanitizeEventForWebhook(event, webhook);
    // Add webhook-specific metadata
    return __assign(__assign({}, basePayload), {
      webhook: {
        id: webhook.id,
        name: webhook.name,
        deliveredAt: new Date().toISOString(),
      },
      // Add clinic context if needed
      clinic: {
        id: (_a = event.metadata) === null || _a === void 0 ? void 0 : _a.clinicId,
      },
    });
  };
  /**
   * Generate event fingerprint for deduplication
   */
  EventUtils.generateEventFingerprint = (event) => {
    var _a;
    var fingerprintData = {
      type: event.type,
      source: event.source,
      data: event.data,
      clinicId: (_a = event.metadata) === null || _a === void 0 ? void 0 : _a.clinicId,
    };
    return crypto_1.default
      .createHash("sha256")
      .update(JSON.stringify(fingerprintData))
      .digest("hex");
  };
  return EventUtils;
})();
exports.EventUtils = EventUtils;
/**
 * Webhook Utilities
 */
var WebhookUtils = /** @class */ (() => {
  function WebhookUtils() {}
  /**
   * Generate webhook signature for payload verification
   */
  WebhookUtils.generateSignature = (payload, secret, algorithm) => {
    if (algorithm === void 0) {
      algorithm = "sha256";
    }
    return crypto_1.default.createHmac(algorithm, secret).update(payload).digest("hex");
  };
  /**
   * Verify webhook signature
   */
  WebhookUtils.verifySignature = function (payload, signature, secret, algorithm) {
    if (algorithm === void 0) {
      algorithm = "sha256";
    }
    try {
      var expectedSignature = this.generateSignature(payload, secret, algorithm);
      // Use timing-safe comparison to prevent timing attacks
      return crypto_1.default.timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(expectedSignature, "hex"),
      );
    } catch (_error) {
      return false;
    }
  };
  /**
   * Validate webhook URL
   */
  WebhookUtils.validateWebhookUrl = (url) => {
    var errors = [];
    try {
      var parsedUrl = new URL(url);
      // Must be HTTPS in production
      if (process.env.NODE_ENV === "production" && parsedUrl.protocol !== "https:") {
        errors.push("Webhook URL must use HTTPS in production");
      }
      // Check for localhost/private IPs in production
      if (process.env.NODE_ENV === "production") {
        var hostname = parsedUrl.hostname;
        if (
          hostname === "localhost" ||
          hostname === "127.0.0.1" ||
          hostname.startsWith("192.168.") ||
          hostname.startsWith("10.") ||
          hostname.startsWith("172.")
        ) {
          errors.push("Webhook URL cannot point to private/local addresses in production");
        }
      }
      // Check for valid port
      if (parsedUrl.port && (parseInt(parsedUrl.port) < 1 || parseInt(parsedUrl.port) > 65535)) {
        errors.push("Invalid port number");
      }
    } catch (_error) {
      errors.push("Invalid URL format");
    }
    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  };
  /**
   * Generate webhook headers
   */
  WebhookUtils.generateWebhookHeaders = function (event, webhook, payload, enableSignature) {
    if (enableSignature === void 0) {
      enableSignature = true;
    }
    var headers = __assign(
      {
        "Content-Type": "application/json",
        "User-Agent": "NeonPro-Webhook/1.0",
        "X-Event-Type": event.type,
        "X-Event-ID": event.id,
        "X-Event-Timestamp": event.timestamp.toISOString(),
        "X-Webhook-ID": webhook.id,
        "X-Webhook-Name": webhook.name,
        "X-Delivery-Attempt": "1",
      },
      webhook.headers,
    );
    // Add signature if enabled
    if (enableSignature && webhook.secret) {
      headers["X-Webhook-Signature"] = "sha256=".concat(
        this.generateSignature(payload, webhook.secret),
      );
    }
    return headers;
  };
  /**
   * Parse webhook signature header
   */
  WebhookUtils.parseSignatureHeader = (signatureHeader) => {
    try {
      var parts = signatureHeader.split("=");
      if (parts.length !== 2) {
        return null;
      }
      return {
        algorithm: parts[0],
        signature: parts[1],
      };
    } catch (_error) {
      return null;
    }
  };
  return WebhookUtils;
})();
exports.WebhookUtils = WebhookUtils;
/**
 * Rate Limiting Utilities
 */
var RateLimitUtils = /** @class */ (() => {
  function RateLimitUtils() {}
  /**
   * Check if request is within rate limit (Token Bucket algorithm)
   */
  RateLimitUtils.checkRateLimit = function (identifier, maxRequests, windowMs, burstLimit) {
    var now = Date.now();
    var limiter = this.rateLimiters.get(identifier);
    if (!limiter || now > limiter.resetTime) {
      // Initialize or reset rate limiter
      var newLimiter = {
        requests: 1,
        resetTime: now + windowMs,
        tokens: (burstLimit || maxRequests) - 1,
        lastRefill: now,
      };
      this.rateLimiters.set(identifier, newLimiter);
      return {
        allowed: true,
        remaining: newLimiter.tokens,
        resetTime: newLimiter.resetTime,
      };
    }
    // Refill tokens based on time passed
    var timePassed = now - limiter.lastRefill;
    var tokensToAdd = Math.floor((timePassed / windowMs) * maxRequests);
    if (tokensToAdd > 0) {
      limiter.tokens = Math.min(burstLimit || maxRequests, limiter.tokens + tokensToAdd);
      limiter.lastRefill = now;
    }
    // Check if request is allowed
    if (limiter.tokens > 0) {
      limiter.tokens--;
      limiter.requests++;
      return {
        allowed: true,
        remaining: limiter.tokens,
        resetTime: limiter.resetTime,
      };
    }
    return {
      allowed: false,
      remaining: 0,
      resetTime: limiter.resetTime,
    };
  };
  /**
   * Reset rate limiter for identifier
   */
  RateLimitUtils.resetRateLimit = function (identifier) {
    this.rateLimiters.delete(identifier);
  };
  /**
   * Get current rate limit status
   */
  RateLimitUtils.getRateLimitStatus = function (identifier) {
    var limiter = this.rateLimiters.get(identifier);
    if (!limiter) {
      return null;
    }
    return {
      requests: limiter.requests,
      remaining: limiter.tokens,
      resetTime: limiter.resetTime,
    };
  };
  RateLimitUtils.rateLimiters = new Map();
  return RateLimitUtils;
})();
exports.RateLimitUtils = RateLimitUtils;
/**
 * Retry Utilities
 */
var RetryUtils = /** @class */ (() => {
  function RetryUtils() {}
  /**
   * Calculate next retry delay based on strategy
   */
  RetryUtils.calculateRetryDelay = (attempt, strategy, baseDelayMs) => {
    if (baseDelayMs === void 0) {
      baseDelayMs = 1000;
    }
    var maxDelay = 300000; // 5 minutes max
    var delay;
    switch (strategy.strategy) {
      case "exponential":
        delay = Math.min(strategy.delayMs * 2 ** (attempt - 1), maxDelay);
        break;
      case "linear":
        delay = Math.min(strategy.delayMs * attempt, maxDelay);
        break;
      default:
        delay = strategy.delayMs;
        break;
    }
    // Add jitter to prevent thundering herd
    var jitter = Math.random() * 0.1 * delay;
    return Math.floor(delay + jitter);
  };
  /**
   * Determine if error is retryable
   */
  RetryUtils.isRetryableError = (error, httpStatus) => {
    var _a;
    // Network errors are retryable
    if (error.code === "ECONNRESET" || error.code === "ENOTFOUND" || error.code === "ETIMEDOUT") {
      return true;
    }
    // HTTP status codes that are retryable
    if (httpStatus) {
      var retryableStatuses = [408, 429, 500, 502, 503, 504];
      return retryableStatuses.includes(httpStatus);
    }
    // Timeout errors are retryable
    if (
      error.name === "AbortError" ||
      ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes("timeout"))
    ) {
      return true;
    }
    return false;
  };
  /**
   * Execute function with retry logic
   */
  RetryUtils.executeWithRetry = function (fn, maxAttempts, strategy, onRetry) {
    return __awaiter(this, void 0, void 0, function () {
      var lastError, _loop_1, this_1, attempt, state_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _loop_1 = function (attempt) {
              var _b, error_1, delay_1;
              return __generator(this, (_c) => {
                switch (_c.label) {
                  case 0:
                    _c.trys.push([0, 2, undefined, 4]);
                    _b = {};
                    return [4 /*yield*/, fn()];
                  case 1:
                    return [2 /*return*/, ((_b.value = _c.sent()), _b)];
                  case 2:
                    error_1 = _c.sent();
                    lastError = error_1;
                    // Don't retry on last attempt
                    if (attempt === maxAttempts) {
                      return [2 /*return*/, "break"];
                    }
                    // Check if error is retryable
                    if (!this_1.isRetryableError(error_1)) {
                      return [2 /*return*/, "break"];
                    }
                    delay_1 = this_1.calculateRetryDelay(attempt, strategy);
                    if (onRetry) {
                      onRetry(attempt, error_1);
                    }
                    return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, delay_1))];
                  case 3:
                    _c.sent();
                    return [3 /*break*/, 4];
                  case 4:
                    return [2 /*return*/];
                }
              });
            };
            this_1 = this;
            attempt = 1;
            _a.label = 1;
          case 1:
            if (!(attempt <= maxAttempts)) return [3 /*break*/, 4];
            return [5 /*yield**/, _loop_1(attempt)];
          case 2:
            state_1 = _a.sent();
            if (typeof state_1 === "object") return [2 /*return*/, state_1.value];
            if (state_1 === "break") return [3 /*break*/, 4];
            _a.label = 3;
          case 3:
            attempt++;
            return [3 /*break*/, 1];
          case 4:
            throw lastError;
        }
      });
    });
  };
  return RetryUtils;
})();
exports.RetryUtils = RetryUtils;
/**
 * Validation Utilities
 */
var ValidationUtils = /** @class */ (() => {
  function ValidationUtils() {}
  /**
   * Validate JSON payload
   */
  ValidationUtils.validateJsonPayload = (payload) => {
    try {
      var data = JSON.parse(payload);
      return { isValid: true, data: data };
    } catch (error) {
      return {
        isValid: false,
        error: "Invalid JSON: ".concat(error.message),
      };
    }
  };
  /**
   * Validate webhook configuration
   */
  ValidationUtils.validateWebhookConfig = (config) => {
    var _a, _b, _c;
    var errors = [];
    // Validate required fields
    if (!((_a = config.name) === null || _a === void 0 ? void 0 : _a.trim())) {
      errors.push("Webhook name is required");
    }
    if (!((_b = config.url) === null || _b === void 0 ? void 0 : _b.trim())) {
      errors.push("Webhook URL is required");
    } else {
      var urlValidation = WebhookUtils.validateWebhookUrl(config.url);
      if (!urlValidation.isValid) {
        errors.push.apply(errors, urlValidation.errors);
      }
    }
    if (!((_c = config.clinicId) === null || _c === void 0 ? void 0 : _c.trim())) {
      errors.push("Clinic ID is required");
    }
    if (!config.eventTypes || config.eventTypes.length === 0) {
      errors.push("At least one event type must be specified");
    }
    // Validate timeout
    if (config.timeoutMs !== undefined) {
      if (config.timeoutMs < 1000 || config.timeoutMs > 30000) {
        errors.push("Timeout must be between 1000ms and 30000ms");
      }
    }
    // Validate retry strategy
    if (config.retryStrategy) {
      if (config.retryStrategy.maxAttempts < 1 || config.retryStrategy.maxAttempts > 10) {
        errors.push("Max retry attempts must be between 1 and 10");
      }
      if (config.retryStrategy.delayMs < 1000 || config.retryStrategy.delayMs > 300000) {
        errors.push("Retry delay must be between 1000ms and 300000ms");
      }
    }
    // Validate rate limit
    if (config.rateLimit) {
      if (config.rateLimit.requestsPerMinute < 1 || config.rateLimit.requestsPerMinute > 1000) {
        errors.push("Rate limit must be between 1 and 1000 requests per minute");
      }
    }
    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  };
  /**
   * Sanitize webhook name
   */
  ValidationUtils.sanitizeWebhookName = (name) => {
    return name
      .trim()
      .replace(/[^a-zA-Z0-9\s\-_]/g, "") // Remove special characters
      .replace(/\s+/g, " ") // Normalize whitespace
      .substring(0, 100); // Limit length
  };
  return ValidationUtils;
})();
exports.ValidationUtils = ValidationUtils;
/**
 * Monitoring Utilities
 */
var MonitoringUtils = /** @class */ (() => {
  function MonitoringUtils() {}
  /**
   * Calculate delivery success rate
   */
  MonitoringUtils.calculateSuccessRate = (successful, total) => {
    if (total === 0) return 0;
    return Math.round((successful / total) * 100 * 100) / 100; // Round to 2 decimal places
  };
  /**
   * Calculate average response time
   */
  MonitoringUtils.calculateAverageResponseTime = (responseTimes) => {
    if (responseTimes.length === 0) return 0;
    var sum = responseTimes.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / responseTimes.length);
  };
  /**
   * Calculate percentile response time
   */
  MonitoringUtils.calculatePercentileResponseTime = (responseTimes, percentile) => {
    if (responseTimes.length === 0) return 0;
    var sorted = __spreadArray([], responseTimes, true).sort((a, b) => a - b);
    var index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  };
  /**
   * Generate performance metrics
   */
  MonitoringUtils.generatePerformanceMetrics = function (deliveries) {
    var total = deliveries.length;
    var successful = deliveries.filter((d) => d.status === "delivered").length;
    var failed = deliveries.filter((d) => d.status === "failed").length;
    var responseTimes = deliveries
      .filter((d) => d.responseTimeMs !== undefined)
      .map((d) => d.responseTimeMs);
    return {
      totalDeliveries: total,
      successfulDeliveries: successful,
      failedDeliveries: failed,
      successRate: this.calculateSuccessRate(successful, total),
      averageResponseTime: this.calculateAverageResponseTime(responseTimes),
      p95ResponseTime: this.calculatePercentileResponseTime(responseTimes, 95),
      p99ResponseTime: this.calculatePercentileResponseTime(responseTimes, 99),
    };
  };
  return MonitoringUtils;
})();
exports.MonitoringUtils = MonitoringUtils;
// Default export with all utilities
exports.default = {
  EventUtils: EventUtils,
  WebhookUtils: WebhookUtils,
  RateLimitUtils: RateLimitUtils,
  RetryUtils: RetryUtils,
  ValidationUtils: ValidationUtils,
  MonitoringUtils: MonitoringUtils,
};
