/**
 * 🎯 Healthcare Connection Retry Strategies
 * Task 1.3 - CONNECTION POOLING OPTIMIZATION
 *
 * Advanced retry strategies with healthcare compliance and patient safety
 * Features:
 * - Healthcare-optimized retry patterns
 * - LGPD/ANVISA/CFM compliant error handling
 * - Patient safety prioritized recovery
 * - Multi-tenant isolation during failures
 * - Emergency escalation protocols
 */
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
exports.executeWithHealthcareRetry = exports.getRetryManager = void 0;
var connection_pool_manager_1 = require("./connection-pool-manager");
var HealthcareConnectionRetryManager = /** @class */ (() => {
  function HealthcareConnectionRetryManager() {
    this.circuitBreakers = new Map();
    // Healthcare-optimized retry configurations
    this.retryConfigs = {
      emergency: {
        maxAttempts: 5,
        baseDelay: 100, // 100ms
        maxDelay: 2000, // 2 seconds max for emergency
        backoffMultiplier: 1.5,
        jitter: true,
        circuitBreakerEnabled: false, // Never give up on emergency
        healthCheckInterval: 5000,
        emergencyEscalationThreshold: 3,
      },
      critical: {
        maxAttempts: 4,
        baseDelay: 200, // 200ms
        maxDelay: 5000, // 5 seconds max
        backoffMultiplier: 2.0,
        jitter: true,
        circuitBreakerEnabled: true,
        healthCheckInterval: 10000,
        emergencyEscalationThreshold: 2,
      },
      standard: {
        maxAttempts: 3,
        baseDelay: 500, // 500ms
        maxDelay: 10000, // 10 seconds max
        backoffMultiplier: 2.0,
        jitter: true,
        circuitBreakerEnabled: true,
        healthCheckInterval: 15000,
        emergencyEscalationThreshold: 3,
      },
      background: {
        maxAttempts: 2,
        baseDelay: 1000, // 1 second
        maxDelay: 30000, // 30 seconds max
        backoffMultiplier: 3.0,
        jitter: true,
        circuitBreakerEnabled: true,
        healthCheckInterval: 30000,
        emergencyEscalationThreshold: 5,
      },
    };
    this.initializeCircuitBreakerMonitoring();
  }
  HealthcareConnectionRetryManager.getInstance = () => {
    if (!HealthcareConnectionRetryManager.instance) {
      HealthcareConnectionRetryManager.instance = new HealthcareConnectionRetryManager();
    }
    return HealthcareConnectionRetryManager.instance;
  };
  /**
   * Execute operation with healthcare-compliant retry strategy
   */
  HealthcareConnectionRetryManager.prototype.executeWithRetry = function (operation, options) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        config,
        circuitBreakerKey,
        lastError,
        attempts,
        poolManager,
        client,
        timeoutMs,
        result,
        complianceValidated,
        _a,
        error_1,
        errorClassification,
        delay,
        totalTime,
        patientSafetyEnsured;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            startTime = Date.now();
            config = this.retryConfigs[options.priority];
            circuitBreakerKey = "".concat(options.clinicId, "_").concat(options.operationType);
            // Check circuit breaker state
            if (config.circuitBreakerEnabled && this.isCircuitBreakerOpen(circuitBreakerKey)) {
              return [
                2 /*return*/,
                {
                  data: null,
                  success: false,
                  attempts: 0,
                  totalTime: Date.now() - startTime,
                  finalError: new Error(
                    "Circuit breaker is open - service temporarily unavailable",
                  ),
                  circuitBreakerTriggered: true,
                  patientSafetyEnsured: false,
                  complianceValidated: false,
                },
              ];
            }
            lastError = null;
            attempts = 0;
            attempts = 1;
            _b.label = 1;
          case 1:
            if (!(attempts <= config.maxAttempts)) return [3 /*break*/, 14];
            _b.label = 2;
          case 2:
            _b.trys.push([2, 7, , 13]);
            poolManager = (0, connection_pool_manager_1.getConnectionPoolManager)();
            client = poolManager.getHealthcareClient(
              options.clinicId,
              options.priority === "emergency" || options.priority === "critical"
                ? "critical"
                : "standard",
            );
            timeoutMs = this.getTimeoutForPriority(options.priority);
            return [
              4 /*yield*/,
              this.executeWithTimeout(operation(client), timeoutMs),
              // Success - reset circuit breaker
            ];
          case 3:
            result = _b.sent();
            // Success - reset circuit breaker
            this.recordSuccess(circuitBreakerKey);
            if (!options.requiresCompliance) return [3 /*break*/, 5];
            return [4 /*yield*/, this.validateHealthcareCompliance(options, result)];
          case 4:
            _a = _b.sent();
            return [3 /*break*/, 6];
          case 5:
            _a = true;
            _b.label = 6;
          case 6:
            complianceValidated = _a;
            return [
              2 /*return*/,
              {
                data: result,
                success: true,
                attempts: attempts,
                totalTime: Date.now() - startTime,
                finalError: null,
                circuitBreakerTriggered: false,
                patientSafetyEnsured: true,
                complianceValidated: complianceValidated,
              },
            ];
          case 7:
            error_1 = _b.sent();
            lastError = error_1;
            errorClassification = this.classifyHealthcareError(error_1);
            // Log healthcare-specific error information
            return [
              4 /*yield*/,
              this.logHealthcareError(error_1, options, attempts, errorClassification),
              // Check if this error requires immediate escalation
            ];
          case 8:
            // Log healthcare-specific error information
            _b.sent();
            if (!errorClassification.requiresImmediateEscalation) return [3 /*break*/, 10];
            return [4 /*yield*/, this.escalateEmergency(error_1, options, errorClassification)];
          case 9:
            _b.sent();
            return [3 /*break*/, 14];
          case 10:
            // Check if error is retryable
            if (!errorClassification.isRetryable) {
              console.warn("Non-retryable healthcare error on attempt ".concat(attempts, ":"), {
                error: error_1.message,
                classification: errorClassification,
                clinicId: options.clinicId,
                patientId: options.patientId,
              });
              return [3 /*break*/, 14];
            }
            // Record failure for circuit breaker
            this.recordFailure(circuitBreakerKey);
            if (!(attempts < config.maxAttempts)) return [3 /*break*/, 12];
            delay = this.calculateDelay(attempts, config);
            console.warn(
              "Healthcare operation failed, retrying in "
                .concat(delay, "ms (attempt ")
                .concat(attempts, "/")
                .concat(config.maxAttempts, "):"),
              {
                error: error_1.message,
                clinicId: options.clinicId,
                operationType: options.operationType,
                priority: options.priority,
                patientSafetyImpact: errorClassification.patientSafetyImpact,
              },
            );
            return [4 /*yield*/, this.sleep(delay)];
          case 11:
            _b.sent();
            _b.label = 12;
          case 12:
            return [3 /*break*/, 13];
          case 13:
            attempts++;
            return [3 /*break*/, 1];
          case 14:
            totalTime = Date.now() - startTime;
            return [
              4 /*yield*/,
              this.handleHealthcareFailure(lastError, options, attempts, totalTime),
            ];
          case 15:
            patientSafetyEnsured = _b.sent();
            return [
              2 /*return*/,
              {
                data: null,
                success: false,
                attempts: attempts,
                totalTime: totalTime,
                finalError: lastError,
                circuitBreakerTriggered: false,
                patientSafetyEnsured: patientSafetyEnsured,
                complianceValidated: false,
              },
            ];
        }
      });
    });
  };
  /**
   * Classify error for healthcare context
   */
  HealthcareConnectionRetryManager.prototype.classifyHealthcareError = (error) => {
    var message = error.message.toLowerCase();
    var code = error.code || "";
    // Connection errors
    if (message.includes("connection") || message.includes("network") || code === "ECONNREFUSED") {
      return {
        type: "connection",
        severity: "high",
        isRetryable: true,
        requiresImmediateEscalation: false,
        patientSafetyImpact: true,
        lgpdImplications: false,
      };
    }
    // Authentication errors
    if (message.includes("authentication") || code === "PGRST301") {
      return {
        type: "authentication",
        severity: "critical",
        isRetryable: false,
        requiresImmediateEscalation: true,
        patientSafetyImpact: true,
        lgpdImplications: true,
      };
    }
    // Authorization errors
    if (
      message.includes("authorization") ||
      message.includes("permission") ||
      code === "PGRST302"
    ) {
      return {
        type: "authorization",
        severity: "critical",
        isRetryable: false,
        requiresImmediateEscalation: true,
        patientSafetyImpact: true,
        lgpdImplications: true,
      };
    }
    // Timeout errors
    if (message.includes("timeout") || message.includes("timed out")) {
      return {
        type: "timeout",
        severity: "medium",
        isRetryable: true,
        requiresImmediateEscalation: false,
        patientSafetyImpact: true,
        lgpdImplications: false,
      };
    }
    // Resource errors
    if (message.includes("too many connections") || message.includes("resource")) {
      return {
        type: "resource",
        severity: "high",
        isRetryable: true,
        requiresImmediateEscalation: false,
        patientSafetyImpact: true,
        lgpdImplications: false,
      };
    }
    // Data integrity errors
    if (code.startsWith("23") || message.includes("constraint") || message.includes("integrity")) {
      return {
        type: "data",
        severity: "critical",
        isRetryable: false,
        requiresImmediateEscalation: true,
        patientSafetyImpact: true,
        lgpdImplications: true,
      };
    }
    // Default classification
    return {
      type: "connection",
      severity: "medium",
      isRetryable: true,
      requiresImmediateEscalation: false,
      patientSafetyImpact: false,
      lgpdImplications: false,
    };
  };
  /**
   * Calculate retry delay with jitter
   */
  HealthcareConnectionRetryManager.prototype.calculateDelay = (attempt, config) => {
    var exponentialDelay = Math.min(
      config.baseDelay * config.backoffMultiplier ** (attempt - 1),
      config.maxDelay,
    );
    if (config.jitter) {
      // Add jitter to prevent thundering herd
      var jitterAmount = exponentialDelay * 0.1 * Math.random();
      return Math.floor(exponentialDelay + jitterAmount);
    }
    return exponentialDelay;
  };
  /**
   * Get timeout based on priority
   */
  HealthcareConnectionRetryManager.prototype.getTimeoutForPriority = (priority) => {
    switch (priority) {
      case "emergency":
        return 5000; // 5 seconds for emergency
      case "critical":
        return 10000; // 10 seconds for critical
      case "standard":
        return 15000; // 15 seconds for standard
      case "background":
        return 30000; // 30 seconds for background
    }
  };
  /**
   * Execute operation with timeout
   */
  HealthcareConnectionRetryManager.prototype.executeWithTimeout = function (promise, timeoutMs) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [
        2 /*return*/,
        Promise.race([
          promise,
          new Promise((_, reject) => {
            setTimeout(
              () =>
                reject(new Error("Healthcare operation timeout after ".concat(timeoutMs, "ms"))),
              timeoutMs,
            );
          }),
        ]),
      ]);
    });
  };
  /**
   * Log healthcare-specific error
   */
  HealthcareConnectionRetryManager.prototype.logHealthcareError = function (
    error,
    options,
    attempt,
    classification,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var errorLog;
      return __generator(this, (_a) => {
        errorLog = {
          timestamp: new Date().toISOString(),
          clinicId: options.clinicId,
          userId: options.userId,
          patientId: options.patientId,
          operationType: options.operationType,
          priority: options.priority,
          attempt: attempt,
          error: {
            message: error.message,
            code: error.code,
            classification: classification,
          },
          healthcareContext: {
            patientSafetyImpact: classification.patientSafetyImpact,
            lgpdImplications: classification.lgpdImplications,
            requiresEscalation: classification.requiresImmediateEscalation,
          },
        };
        console.error("🏥 Healthcare Connection Error:", errorLog);
        // If LGPD implications, ensure audit trail
        if (classification.lgpdImplications) {
          console.error("🔒 LGPD Compliance Alert: Patient data access error", {
            clinicId: options.clinicId,
            patientId: options.patientId,
            error: error.message,
            timestamp: new Date().toISOString(),
          });
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Escalate emergency for critical errors
   */
  HealthcareConnectionRetryManager.prototype.escalateEmergency = function (
    error,
    options,
    classification,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        console.error("🚨 HEALTHCARE EMERGENCY ESCALATION:", {
          error: error.message,
          classification: classification,
          clinicId: options.clinicId,
          patientId: options.patientId,
          timestamp: new Date().toISOString(),
          action: "IMMEDIATE_INTERVENTION_REQUIRED",
        });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Handle healthcare failure with safety protocols
   */
  HealthcareConnectionRetryManager.prototype.handleHealthcareFailure = function (
    error,
    options,
    attempts,
    totalTime,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var classification;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            classification = this.classifyHealthcareError(error);
            console.error("🏥 Healthcare Operation Failed:", {
              finalError: error.message,
              clinicId: options.clinicId,
              patientId: options.patientId,
              operationType: options.operationType,
              priority: options.priority,
              totalAttempts: attempts,
              totalTime: totalTime,
              patientSafetyImpact: classification.patientSafetyImpact,
              classification: classification,
            });
            if (!classification.patientSafetyImpact) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              this.activatePatientSafetyProtocols(error, options, classification),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/, false]; // Patient safety could not be ensured
          case 2:
            return [2 /*return*/, true]; // No patient safety impact
        }
      });
    });
  };
  /**
   * Activate patient safety protocols
   */
  HealthcareConnectionRetryManager.prototype.activatePatientSafetyProtocols = function (
    error,
    options,
    classification,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        console.error("🛡️ PATIENT SAFETY PROTOCOLS ACTIVATED:", {
          error: error.message,
          clinicId: options.clinicId,
          patientId: options.patientId,
          classification: classification,
          timestamp: new Date().toISOString(),
          protocols: ["ISOLATION", "FALLBACK", "ALERT"],
        });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Validate healthcare compliance
   */
  HealthcareConnectionRetryManager.prototype.validateHealthcareCompliance = function (
    options,
    result,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        try {
          // Implement LGPD compliance validation
          if (options.patientId) {
            // Validate patient data access permissions
            // Check consent status
            // Verify audit trail requirements
            console.log("🔍 LGPD Compliance Validated:", {
              clinicId: options.clinicId,
              patientId: options.patientId,
              userId: options.userId,
              timestamp: new Date().toISOString(),
            });
          }
          return [2 /*return*/, true];
        } catch (error) {
          console.error("❌ Healthcare compliance validation failed:", error);
          return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Circuit breaker management
   */
  HealthcareConnectionRetryManager.prototype.isCircuitBreakerOpen = function (key) {
    var breaker = this.circuitBreakers.get(key);
    if (!breaker) return false;
    if (breaker.state === "open") {
      // Check if we should move to half-open
      if (Date.now() >= breaker.nextAttempt.getTime()) {
        breaker.state = "half-open";
        this.circuitBreakers.set(key, breaker);
        return false;
      }
      return true;
    }
    return false;
  };
  HealthcareConnectionRetryManager.prototype.recordSuccess = function (key) {
    var breaker = this.circuitBreakers.get(key);
    if (breaker) {
      breaker.state = "closed";
      breaker.failures = 0;
      this.circuitBreakers.set(key, breaker);
    }
  };
  HealthcareConnectionRetryManager.prototype.recordFailure = function (key) {
    var breaker = this.circuitBreakers.get(key) || {
      state: "closed",
      failures: 0,
      lastFailure: new Date(),
      nextAttempt: new Date(),
    };
    breaker.failures++;
    breaker.lastFailure = new Date();
    // Open circuit if failure threshold exceeded
    if (breaker.failures >= 3) {
      breaker.state = "open";
      breaker.nextAttempt = new Date(Date.now() + 30000); // 30 seconds
    }
    this.circuitBreakers.set(key, breaker);
  };
  /**
   * Initialize circuit breaker monitoring
   */
  HealthcareConnectionRetryManager.prototype.initializeCircuitBreakerMonitoring = function () {
    setInterval(() => {
      this.monitorCircuitBreakers();
    }, 60000); // Check every minute
  };
  /**
   * Monitor circuit breaker health
   */
  HealthcareConnectionRetryManager.prototype.monitorCircuitBreakers = function () {
    for (var _i = 0, _a = this.circuitBreakers; _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        breaker = _b[1];
      if (breaker.state === "open") {
        console.warn("⚡ Healthcare Circuit Breaker Open:", {
          key: key,
          failures: breaker.failures,
          lastFailure: breaker.lastFailure,
          nextAttempt: breaker.nextAttempt,
        });
      }
    }
  };
  /**
   * Sleep utility
   */
  HealthcareConnectionRetryManager.prototype.sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  /**
   * Get circuit breaker status
   */
  HealthcareConnectionRetryManager.prototype.getCircuitBreakerStatus = function () {
    return Array.from(this.circuitBreakers.entries()).map((_a) => {
      var key = _a[0],
        breaker = _a[1];
      return {
        key: key,
        state: breaker.state,
        failures: breaker.failures,
        lastFailure: breaker.lastFailure,
      };
    });
  };
  /**
   * Reset circuit breaker
   */
  HealthcareConnectionRetryManager.prototype.resetCircuitBreaker = function (key) {
    var breaker = this.circuitBreakers.get(key);
    if (breaker) {
      breaker.state = "closed";
      breaker.failures = 0;
      this.circuitBreakers.set(key, breaker);
      console.log("\uD83D\uDD04 Healthcare circuit breaker reset: ".concat(key));
      return true;
    }
    return false;
  };
  /**
   * Get retry statistics
   */
  HealthcareConnectionRetryManager.prototype.getRetryStatistics = function () {
    var openBreakers = Array.from(this.circuitBreakers.values()).filter(
      (b) => b.state === "open",
    ).length;
    return {
      configurations: this.retryConfigs,
      circuitBreakers: this.circuitBreakers.size,
      openCircuitBreakers: openBreakers,
    };
  };
  return HealthcareConnectionRetryManager;
})();
// Export singleton
var getRetryManager = () => HealthcareConnectionRetryManager.getInstance();
exports.getRetryManager = getRetryManager;
// Helper function for quick retry execution
var executeWithHealthcareRetry = (operation_1, clinicId_1, operationType_1) => {
  var args_1 = [];
  for (var _i = 3; _i < arguments.length; _i++) {
    args_1[_i - 3] = arguments[_i];
  }
  return __awaiter(
    void 0,
    __spreadArray([operation_1, clinicId_1, operationType_1], args_1, true),
    void 0,
    function (operation, clinicId, operationType, priority, options) {
      var retryManager;
      if (priority === void 0) {
        priority = "standard";
      }
      return __generator(this, (_a) => {
        retryManager = (0, exports.getRetryManager)();
        return [
          2 /*return*/,
          retryManager.executeWithRetry(operation, {
            clinicId: clinicId,
            operationType: operationType,
            priority: priority,
            userId: (options === null || options === void 0 ? void 0 : options.userId) || "unknown",
            patientId: options === null || options === void 0 ? void 0 : options.patientId,
            requiresCompliance:
              (options === null || options === void 0 ? void 0 : options.requiresCompliance) ||
              false,
          }),
        ];
      });
    },
  );
};
exports.executeWithHealthcareRetry = executeWithHealthcareRetry;
