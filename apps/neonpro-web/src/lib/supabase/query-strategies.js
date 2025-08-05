/**
 * 🎯 Query Strategies for Healthcare Connection Pooling
 * Task 1.3 - CONNECTION POOLING OPTIMIZATION
 *
 * Intelligent query routing and optimization strategies for healthcare operations
 * Features:
 * - Query type classification and routing
 * - Healthcare-specific optimization patterns
 * - Multi-tenant query isolation
 * - LGPD/ANVISA/CFM compliant query execution
 * - Performance monitoring and auto-scaling
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
exports.HealthcareQueries = exports.createQueryContext = exports.getQueryStrategies = void 0;
var connection_pool_manager_1 = require("./connection-pool-manager");
var HealthcareQueryStrategies = /** @class */ (() => {
  function HealthcareQueryStrategies() {
    this.poolManager = (0, connection_pool_manager_1.getConnectionPoolManager)();
    // Predefined strategies for healthcare operations
    this.strategies = {
      patient_critical: {
        name: "Patient Critical Operations",
        poolType: "critical",
        connectionMode: "transaction",
        timeout: 5000, // 5 seconds max for emergency operations
        retryAttempts: 3,
        cacheEnabled: false, // Never cache critical patient data
        auditRequired: true,
      },
      patient_standard: {
        name: "Standard Patient Operations",
        poolType: "standard",
        connectionMode: "transaction",
        timeout: 15000, // 15 seconds for standard operations
        retryAttempts: 2,
        cacheEnabled: true,
        auditRequired: true,
      },
      clinical_workflow: {
        name: "Clinical Workflow Management",
        poolType: "standard",
        connectionMode: "session",
        timeout: 20000, // 20 seconds for complex workflows
        retryAttempts: 2,
        cacheEnabled: true,
        auditRequired: true,
      },
      financial_sensitive: {
        name: "Financial Operations",
        poolType: "critical",
        connectionMode: "transaction",
        timeout: 10000, // 10 seconds for financial operations
        retryAttempts: 3,
        cacheEnabled: false, // Never cache financial data
        auditRequired: true,
      },
      analytics_readonly: {
        name: "Analytics & Reporting",
        poolType: "analytics",
        connectionMode: "session",
        timeout: 60000, // 60 seconds for complex analytics
        retryAttempts: 1,
        cacheEnabled: true,
        auditRequired: false,
      },
      administrative: {
        name: "Administrative Operations",
        poolType: "administrative",
        connectionMode: "pooled",
        timeout: 30000, // 30 seconds for admin operations
        retryAttempts: 2,
        cacheEnabled: true,
        auditRequired: true,
      },
      compliance_audit: {
        name: "Compliance & Audit",
        poolType: "critical",
        connectionMode: "transaction",
        timeout: 30000, // 30 seconds for audit operations
        retryAttempts: 3,
        cacheEnabled: false, // Never cache audit data
        auditRequired: true,
      },
      realtime_monitoring: {
        name: "Real-time Health Monitoring",
        poolType: "critical",
        connectionMode: "session",
        timeout: 3000, // 3 seconds for real-time operations
        retryAttempts: 5,
        cacheEnabled: false, // Real-time data should not be cached
        auditRequired: false,
      },
    };
  }
  HealthcareQueryStrategies.getInstance = () => {
    if (!HealthcareQueryStrategies.instance) {
      HealthcareQueryStrategies.instance = new HealthcareQueryStrategies();
    }
    return HealthcareQueryStrategies.instance;
  };
  /**
   * Execute query with optimal strategy based on healthcare context
   */
  HealthcareQueryStrategies.prototype.executeQuery = function (queryFn, context) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        strategy,
        client,
        poolKey,
        timeoutPromise,
        queryPromise,
        data,
        executionTime,
        auditTrail,
        complianceVerified,
        error_1,
        executionTime,
        auditTrail;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            strategy = this.strategies[context.queryType];
            // Validate context for healthcare compliance
            this.validateQueryContext(context);
            client = this.getOptimalClient(context, strategy);
            poolKey = this.generatePoolKey(context.clinicId, strategy.poolType);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, , 9]);
            timeoutPromise = new Promise((_, reject) => {
              setTimeout(
                () => reject(new Error("Query timeout after ".concat(strategy.timeout, "ms"))),
                strategy.timeout,
              );
            });
            queryPromise = this.executeWithRetry(queryFn, client, strategy.retryAttempts, context);
            return [4 /*yield*/, Promise.race([queryPromise, timeoutPromise])];
          case 2:
            data = _a.sent();
            executionTime = Date.now() - startTime;
            auditTrail = void 0;
            if (!strategy.auditRequired) return [3 /*break*/, 4];
            return [4 /*yield*/, this.createAuditTrail(context, true, executionTime)];
          case 3:
            auditTrail = _a.sent();
            _a.label = 4;
          case 4:
            return [4 /*yield*/, this.verifyCompliance(context, data)];
          case 5:
            complianceVerified = _a.sent();
            return [
              2 /*return*/,
              {
                data: data,
                error: null,
                executionTime: executionTime,
                poolKey: poolKey,
                strategy: strategy,
                complianceVerified: complianceVerified,
                auditTrail: auditTrail,
              },
            ];
          case 6:
            error_1 = _a.sent();
            executionTime = Date.now() - startTime;
            auditTrail = void 0;
            if (!strategy.auditRequired) return [3 /*break*/, 8];
            return [4 /*yield*/, this.createAuditTrail(context, false, executionTime)];
          case 7:
            auditTrail = _a.sent();
            _a.label = 8;
          case 8:
            console.error("Healthcare query failed [".concat(context.queryType, "]:"), {
              error: error_1.message,
              clinicId: context.clinicId,
              userId: context.userId,
              executionTime: executionTime,
              strategy: strategy.name,
            });
            return [
              2 /*return*/,
              {
                data: null,
                error: error_1,
                executionTime: executionTime,
                poolKey: poolKey,
                strategy: strategy,
                complianceVerified: false,
                auditTrail: auditTrail,
              },
            ];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute query with retry logic
   */
  HealthcareQueryStrategies.prototype.executeWithRetry = function (
    queryFn,
    client,
    maxRetries,
    context,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var lastError, _loop_1, this_1, attempt, state_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            lastError = null;
            _loop_1 = function (attempt) {
              var _b, error_2, backoffTime_1;
              return __generator(this, (_c) => {
                switch (_c.label) {
                  case 0:
                    _c.trys.push([0, 2, , 5]);
                    _b = {};
                    return [4 /*yield*/, queryFn(client)];
                  case 1:
                    return [2 /*return*/, ((_b.value = _c.sent()), _b)];
                  case 2:
                    error_2 = _c.sent();
                    lastError = error_2;
                    console.warn(
                      "Query attempt ".concat(attempt, "/").concat(maxRetries, " failed:"),
                      {
                        error: error_2.message,
                        queryType: context.queryType,
                        clinicId: context.clinicId,
                      },
                    );
                    // Don't retry on certain errors
                    if (this_1.isNonRetryableError(error_2)) {
                      return [2 /*return*/, "break"];
                    }
                    if (!(attempt < maxRetries)) return [3 /*break*/, 4];
                    backoffTime_1 = Math.min(1000 * 2 ** (attempt - 1), 5000);
                    return [
                      4 /*yield*/,
                      new Promise((resolve) => setTimeout(resolve, backoffTime_1)),
                    ];
                  case 3:
                    _c.sent();
                    _c.label = 4;
                  case 4:
                    return [3 /*break*/, 5];
                  case 5:
                    return [2 /*return*/];
                }
              });
            };
            this_1 = this;
            attempt = 1;
            _a.label = 1;
          case 1:
            if (!(attempt <= maxRetries)) return [3 /*break*/, 4];
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
            throw lastError || new Error("Query failed after all retry attempts");
        }
      });
    });
  };
  /**
   * Check if error should not be retried
   */
  HealthcareQueryStrategies.prototype.isNonRetryableError = (error) => {
    var nonRetryablePatterns = [
      "PGRST116", // No rows found
      "PGRST301", // Invalid authentication
      "PGRST302", // Insufficient privilege
      "23505", // Unique violation
      "23503", // Foreign key violation
      "23514", // Check violation
    ];
    return nonRetryablePatterns.some(
      (pattern) => error.message.includes(pattern) || error.code === pattern,
    );
  };
  /**
   * Get optimal client based on strategy
   */
  HealthcareQueryStrategies.prototype.getOptimalClient = function (context, strategy) {
    switch (strategy.poolType) {
      case "critical":
        return this.poolManager.getHealthcareClient(context.clinicId, "critical");
      case "standard":
        return this.poolManager.getHealthcareClient(context.clinicId, "standard");
      case "analytics":
      case "administrative":
      default:
        return this.poolManager.getHealthcareClient(context.clinicId, "standard");
    }
  };
  /**
   * Generate pool key for monitoring
   */
  HealthcareQueryStrategies.prototype.generatePoolKey = (clinicId, poolType) =>
    "healthcare_".concat(clinicId, "_").concat(poolType);
  /**
   * Validate query context for healthcare compliance
   */
  HealthcareQueryStrategies.prototype.validateQueryContext = function (context) {
    // Validate clinic ID
    if (!context.clinicId || context.clinicId === "unknown") {
      throw new Error("Invalid clinic ID - multi-tenant isolation required");
    }
    // Validate user context
    if (!context.userId) {
      throw new Error("User context required for healthcare operations");
    }
    // Validate patient access permissions
    if (context.patientId && !this.hasPatientAccess(context)) {
      throw new Error("Insufficient permissions for patient data access");
    }
    // Validate LGPD sensitive operations
    if (context.lgpdSensitive && !this.isLGPDCompliant(context)) {
      throw new Error("LGPD compliance requirements not met");
    }
  };
  /**
   * Check patient access permissions
   */
  HealthcareQueryStrategies.prototype.hasPatientAccess = (context) => {
    // Implement patient access validation logic
    // For now, allow access for professionals and admins
    return (
      ["admin", "professional"].includes(context.userRole) ||
      (context.userRole === "patient" && context.userId === context.patientId)
    );
  };
  /**
   * Check LGPD compliance
   */
  HealthcareQueryStrategies.prototype.isLGPDCompliant = (context) => {
    // Implement LGPD compliance checks
    // Verify audit trail, consent, and data minimization
    return context.requiresAudit && !!context.clinicId;
  };
  /**
   * Create audit trail entry
   */
  HealthcareQueryStrategies.prototype.createAuditTrail = function (
    context,
    success,
    executionTime,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var auditEntry;
      return __generator(this, (_a) => {
        auditEntry = {
          timestamp: new Date(),
          clinicId: context.clinicId,
          userId: context.userId,
          queryType: context.queryType,
          patientId: context.patientId,
          action: "".concat(context.queryType, "_query"),
          success: success,
        };
        // Log audit entry for LGPD compliance
        console.log(
          "🔍 Healthcare audit trail:",
          __assign(__assign({}, auditEntry), {
            executionTime: executionTime,
            priority: context.priority,
          }),
        );
        return [2 /*return*/, auditEntry];
      });
    });
  };
  /**
   * Verify compliance for sensitive operations
   */
  HealthcareQueryStrategies.prototype.verifyCompliance = function (context, data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implement compliance verification logic
        // Check data encryption, access patterns, consent status
        if (context.lgpdSensitive) {
          // Verify LGPD compliance
          return [2 /*return*/, this.verifyLGPDCompliance(context, data)];
        }
        if (context.queryType === "financial_sensitive") {
          // Verify financial data compliance
          return [2 /*return*/, this.verifyFinancialCompliance(context, data)];
        }
        return [2 /*return*/, true];
      });
    });
  };
  /**
   * Verify LGPD compliance for patient data
   */
  HealthcareQueryStrategies.prototype.verifyLGPDCompliance = (context, data) => {
    // Implement LGPD verification logic
    // Check consent status, data minimization, purpose limitation
    return context.requiresAudit && !!context.patientId;
  };
  /**
   * Verify financial data compliance
   */
  HealthcareQueryStrategies.prototype.verifyFinancialCompliance = (context, data) => {
    // Implement financial compliance verification
    // Check encryption, access controls, audit requirements
    return true;
  };
  /**
   * Get query performance recommendations
   */
  HealthcareQueryStrategies.prototype.getPerformanceRecommendations = function (queryType) {
    var strategy = this.strategies[queryType];
    var recommendations = [
      "Use ".concat(strategy.connectionMode, " mode for optimal performance"),
      "Timeout set to ".concat(strategy.timeout, "ms for safety"),
      "".concat(strategy.retryAttempts, " retry attempts configured"),
      strategy.cacheEnabled
        ? "Caching enabled for performance"
        : "Caching disabled for data freshness",
      strategy.auditRequired ? "Audit trail required for compliance" : "No audit trail required",
    ];
    var optimizations = this.generateOptimizations(queryType, strategy);
    return {
      strategy: strategy,
      recommendations: recommendations,
      optimizations: optimizations,
    };
  };
  /**
   * Generate optimization suggestions
   */
  HealthcareQueryStrategies.prototype.generateOptimizations = (queryType, strategy) => {
    var optimizations = [];
    switch (queryType) {
      case "patient_critical":
        optimizations.push(
          "Use indexed queries for emergency patient lookup",
          "Minimize data fetched to essential fields only",
          "Consider real-time subscriptions for critical monitoring",
        );
        break;
      case "analytics_readonly":
        optimizations.push(
          "Use read replicas for heavy analytical queries",
          "Implement query result caching",
          "Consider materialized views for complex aggregations",
        );
        break;
      case "clinical_workflow":
        optimizations.push(
          "Batch related operations in single transaction",
          "Use optimistic locking for concurrent updates",
          "Implement efficient scheduling algorithms",
        );
        break;
      default:
        optimizations.push(
          "Review query patterns for optimization opportunities",
          "Consider connection pooling benefits",
          "Monitor query performance metrics",
        );
    }
    return optimizations;
  };
  /**
   * Get strategy for query type
   */
  HealthcareQueryStrategies.prototype.getStrategy = function (queryType) {
    return this.strategies[queryType];
  };
  /**
   * Update strategy configuration
   */
  HealthcareQueryStrategies.prototype.updateStrategy = function (queryType, updates) {
    this.strategies[queryType] = __assign(__assign({}, this.strategies[queryType]), updates);
  };
  return HealthcareQueryStrategies;
})();
// Export singleton factory
var getQueryStrategies = () => HealthcareQueryStrategies.getInstance();
exports.getQueryStrategies = getQueryStrategies;
// Helper functions for common query patterns
var createQueryContext = (clinicId, userId, queryType, options) => {
  if (options === void 0) {
    options = {};
  }
  return __assign(
    {
      clinicId: clinicId,
      userId: userId,
      queryType: queryType,
      userRole: "professional",
      priority: "normal",
      requiresAudit: true,
      lgpdSensitive: queryType.includes("patient") || queryType === "financial_sensitive",
    },
    options,
  );
};
exports.createQueryContext = createQueryContext;
// Healthcare query builder helpers
exports.HealthcareQueries = {
  patientData: (patientId) =>
    (0, exports.createQueryContext)("", "", "patient_standard", {
      patientId: patientId,
      lgpdSensitive: true,
    }),
  emergencyAccess: (patientId) =>
    (0, exports.createQueryContext)("", "", "patient_critical", {
      patientId: patientId,
      priority: "emergency",
      lgpdSensitive: true,
    }),
  clinicalWorkflow: () =>
    (0, exports.createQueryContext)("", "", "clinical_workflow", { priority: "high" }),
  analytics: () =>
    (0, exports.createQueryContext)("", "", "analytics_readonly", {
      requiresAudit: false,
      lgpdSensitive: false,
    }),
  financial: () =>
    (0, exports.createQueryContext)("", "", "financial_sensitive", {
      priority: "high",
      lgpdSensitive: true,
    }),
};
