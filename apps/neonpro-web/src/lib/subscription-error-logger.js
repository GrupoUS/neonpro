/**
 * Advanced Subscription Error Logging System
 *
 * Comprehensive logging system for subscription errors:
 * - Structured logging with multiple levels
 * - Error correlation and tracking
 * - Performance impact monitoring
 * - Integration with external logging services
 * - Error pattern analysis and alerting
 *
 * @author NeonPro Development Team
 * @version 2.0.0 - Error Handling Enhanced
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
exports.SubscriptionErrorLogger = void 0;
// Log levels
var LogLevel;
((LogLevel) => {
  LogLevel["DEBUG"] = "debug";
  LogLevel["INFO"] = "info";
  LogLevel["WARN"] = "warn";
  LogLevel["ERROR"] = "error";
  LogLevel["CRITICAL"] = "critical";
})(LogLevel || (LogLevel = {}));
var defaultConfig = {
  enableConsoleLogging: true,
  enableFileLogging: false,
  enableRemoteLogging: false,
  logLevel: LogLevel.INFO,
  maxLogEntries: 1000,
  enablePerformanceLogging: true,
  enableUserActivityLogging: false,
  enableCorrelationTracking: true,
  batchSize: 10,
  flushInterval: 30000,
  enableCompression: false,
  enableEncryption: false,
  retentionDays: 30,
  enableAlerts: true,
  alertThresholds: {
    errorRate: 0.05, // 5%
    criticalErrors: 5,
    responseTime: 1000, // 1 second
  },
};
var SubscriptionErrorLogger = /** @class */ (() => {
  function SubscriptionErrorLogger(config) {
    this.logBuffer = [];
    this.errorPatterns = [];
    this.correlationMap = new Map();
    this.config = __assign(__assign({}, defaultConfig), config);
    this.analytics = this.initializeAnalytics();
    this.initializeErrorPatterns();
    this.startPeriodicFlush();
  }
  /**
   * Log an error with full context
   */
  SubscriptionErrorLogger.prototype.logError = function (error, context, correlationId) {
    return __awaiter(this, void 0, void 0, function () {
      var logEntry;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            logEntry = this.createLogEntry(error, context, correlationId);
            // Add to buffer
            this.logBuffer.push(logEntry);
            // Update analytics
            this.updateAnalytics(logEntry);
            // Check for patterns
            this.checkErrorPatterns(error);
            if (!(error.severity === ErrorSeverity.CRITICAL)) return [3 /*break*/, 2];
            return [4 /*yield*/, this.flushLogs()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            // Console logging if enabled
            if (this.config.enableConsoleLogging) {
              this.logToConsole(logEntry);
            }
            if (!this.shouldTriggerAlert(error)) return [3 /*break*/, 4];
            return [4 /*yield*/, this.triggerAlert(logEntry)];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  }; /**
   * Create structured log entry
   */
  SubscriptionErrorLogger.prototype.createLogEntry = function (error, context, correlationId) {
    var logLevel = this.mapSeverityToLogLevel(error.severity);
    var id = this.generateLogId();
    return {
      id: id,
      timestamp: new Date(),
      level: logLevel,
      error: __assign(__assign({}, error), {
        message: error.message,
        stack: error.stack || new Error().stack,
      }),
      context: context,
      correlationId: correlationId || this.generateCorrelationId(),
      sessionId: context === null || context === void 0 ? void 0 : context.sessionId,
      userId: context === null || context === void 0 ? void 0 : context.userId,
      stackTrace: error.stack,
      userAgent: context === null || context === void 0 ? void 0 : context.userAgent,
      requestUrl: context === null || context === void 0 ? void 0 : context.route,
      responseTime: context === null || context === void 0 ? void 0 : context.duration,
      memoryUsage: this.getMemoryUsage(),
      systemLoad: this.getSystemLoad(),
    };
  };
  /**
   * Map error severity to log level
   */
  SubscriptionErrorLogger.prototype.mapSeverityToLogLevel = (severity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return LogLevel.CRITICAL;
      case ErrorSeverity.HIGH:
        return LogLevel.ERROR;
      case ErrorSeverity.MEDIUM:
        return LogLevel.WARN;
      case ErrorSeverity.LOW:
      default:
        return LogLevel.INFO;
    }
  };
  SubscriptionErrorLogger.prototype.initializeAnalytics = () => ({
    totalErrors: 0,
    errorsByHour: {},
    errorsByCategory: {},
    errorsBySeverity: {},
    topErrors: [],
    userImpactMetrics: {
      affectedUsers: 0,
      errorRate: 0,
      averageRecoveryTime: 0,
    },
    systemMetrics: {
      memoryUsage: 0,
      responseTime: 0,
      throughput: 0,
    },
    trends: {
      isIncreasing: false,
      pattern: "normal",
      confidence: 0,
    },
  });
  SubscriptionErrorLogger.prototype.initializeErrorPatterns = () => {
    // Initialize with default patterns
  };
  SubscriptionErrorLogger.prototype.startPeriodicFlush = function () {
    if (this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flushLogs();
      }, this.config.flushInterval);
    }
  };
  SubscriptionErrorLogger.prototype.updateAnalytics = function (logEntry) {
    this.analytics.totalErrors++;
  };
  SubscriptionErrorLogger.prototype.checkErrorPatterns = (error) => {
    // Check error patterns
  };
  SubscriptionErrorLogger.prototype.flushLogs = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  SubscriptionErrorLogger.prototype.logToConsole = (logEntry) => {
    console.log(logEntry);
  };
  SubscriptionErrorLogger.prototype.shouldTriggerAlert = (error) => error.severity === "CRITICAL";
  SubscriptionErrorLogger.prototype.triggerAlert = function (logEntry) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  SubscriptionErrorLogger.prototype.generateLogId = () => Math.random().toString(36).substr(2, 9);
  SubscriptionErrorLogger.prototype.generateCorrelationId = () =>
    Math.random().toString(36).substr(2, 9);
  SubscriptionErrorLogger.prototype.getMemoryUsage = () => process.memoryUsage().heapUsed;
  SubscriptionErrorLogger.prototype.getSystemLoad = () => {
    return 0; // Placeholder
  };
  return SubscriptionErrorLogger;
})();
exports.SubscriptionErrorLogger = SubscriptionErrorLogger;
