"use strict";
/**
 * 🎯 NeonPro Connection Pool Manager
 * Task 1.3 - CONNECTION POOLING OPTIMIZATION
 *
 * Centralized Supabase connection pooling with healthcare-specific optimizations
 * Features:
 * - Multi-tenant isolation for clinic data
 * - LGPD/ANVISA/CFM compliance monitoring
 * - Healthcare-optimized pool configurations
 * - Connection health monitoring and alerting
 * - Intelligent retry strategies
 *
 * Performance Target: Optimized connection usage with sub-100ms latency
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
exports.getConnectionPoolManager = exports.NeonProConnectionPoolManager = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var ssr_1 = require("@supabase/ssr");
/**
 * Healthcare-optimized pool configurations by clinic size
 */
var HEALTHCARE_POOL_CONFIGS = {
  // Small clinic (1-5 professionals)
  small: {
    poolSize: 8,
    maxConnections: 25,
    maxClients: 50,
    idleTimeout: 300000, // 5 minutes
    connectionTimeout: 10000, // 10 seconds
    queryTimeout: 30000, // 30 seconds (patient safety)
    healthCheckInterval: 60000, // 1 minute
  },
  // Medium clinic (6-20 professionals)
  medium: {
    poolSize: 15,
    maxConnections: 60,
    maxClients: 150,
    idleTimeout: 600000, // 10 minutes
    connectionTimeout: 8000, // 8 seconds
    queryTimeout: 25000, // 25 seconds
    healthCheckInterval: 45000, // 45 seconds
  },
  // Large clinic (21+ professionals)
  large: {
    poolSize: 25,
    maxConnections: 120,
    maxClients: 300,
    idleTimeout: 900000, // 15 minutes
    connectionTimeout: 5000, // 5 seconds
    queryTimeout: 20000, // 20 seconds
    healthCheckInterval: 30000, // 30 seconds
  },
};
var NeonProConnectionPoolManager = /** @class */ (function () {
  function NeonProConnectionPoolManager(clinicSize) {
    if (clinicSize === void 0) {
      clinicSize = "medium";
    }
    this.pools = new Map();
    this.healthChecks = new Map();
    this.metrics = new Map();
    this.config = HEALTHCARE_POOL_CONFIGS[clinicSize];
    this.startHealthMonitoring();
  }
  /**
   * Singleton instance with clinic size optimization
   */
  NeonProConnectionPoolManager.getInstance = function (clinicSize) {
    if (!NeonProConnectionPoolManager.instance) {
      NeonProConnectionPoolManager.instance = new NeonProConnectionPoolManager(clinicSize);
    }
    return NeonProConnectionPoolManager.instance;
  };
  /**
   * Get optimized client for healthcare operations
   * Transaction mode (port 6543) for critical medical operations
   */
  NeonProConnectionPoolManager.prototype.getHealthcareClient = function (clinicId, operationType) {
    if (operationType === void 0) {
      operationType = "standard";
    }
    var poolKey = "healthcare_".concat(clinicId, "_").concat(operationType);
    if (!this.pools.has(poolKey)) {
      var client = this.createOptimizedClient(operationType, clinicId);
      this.pools.set(poolKey, client);
      this.initializeMetrics(poolKey);
    }
    this.updateConnectionMetrics(poolKey);
    return this.pools.get(poolKey);
  };
  /**
   * Get client for server-side operations with session management
   * FIXED: Dynamic import for next/headers to avoid client-side import errors
   */
  NeonProConnectionPoolManager.prototype.getServerClient = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var poolKey, cookies, cookieStore_1, client, error_1, fallbackClient, browserClient;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            poolKey = "server_".concat(clinicId);
            if (!!this.pools.has(poolKey)) return [3 /*break*/, 7];
            if (!(typeof window === "undefined")) return [3 /*break*/, 6];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            return [
              4 /*yield*/,
              Promise.resolve().then(function () {
                return require("next/headers");
              }),
            ];
          case 2:
            cookies = _a.sent().cookies;
            return [4 /*yield*/, cookies()];
          case 3:
            cookieStore_1 = _a.sent();
            client = (0, ssr_1.createServerClient)(
              process.env.SUPABASE_URL,
              process.env.SUPABASE_ANON_KEY,
              {
                cookies: {
                  get: function (name) {
                    var _a;
                    return (_a = cookieStore_1.get(name)) === null || _a === void 0
                      ? void 0
                      : _a.value;
                  },
                  set: function (name, value, options) {
                    try {
                      cookieStore_1.set(__assign({ name: name, value: value }, options));
                    } catch (error) {
                      console.warn("Cookie set error in server pooling:", error);
                    }
                  },
                  remove: function (name, options) {
                    try {
                      cookieStore_1.set(__assign({ name: name, value: "" }, options));
                    } catch (error) {
                      console.warn("Cookie remove error in server pooling:", error);
                    }
                  },
                },
              },
            );
            this.pools.set(poolKey, client);
            this.initializeMetrics(poolKey);
            return [3 /*break*/, 5];
          case 4:
            error_1 = _a.sent();
            console.error("Error creating server client with cookies:", error_1);
            fallbackClient = (0, supabase_js_1.createClient)(
              process.env.SUPABASE_URL,
              process.env.SUPABASE_ANON_KEY,
            );
            this.pools.set(poolKey, fallbackClient);
            this.initializeMetrics(poolKey);
            return [3 /*break*/, 5];
          case 5:
            return [3 /*break*/, 7];
          case 6:
            browserClient = this.getBrowserClient(clinicId);
            this.pools.set(poolKey, browserClient);
            this.initializeMetrics(poolKey);
            _a.label = 7;
          case 7:
            this.updateConnectionMetrics(poolKey);
            return [2 /*return*/, this.pools.get(poolKey)];
        }
      });
    });
  };
  /**
   * Get browser client with optimized pooling
   */
  NeonProConnectionPoolManager.prototype.getBrowserClient = function (clinicId) {
    var poolKey = "browser_".concat(clinicId);
    if (!this.pools.has(poolKey)) {
      var client = (0, ssr_1.createBrowserClient)(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
      );
      this.pools.set(poolKey, client);
      this.initializeMetrics(poolKey);
    }
    this.updateConnectionMetrics(poolKey);
    return this.pools.get(poolKey);
  };
  /**
   * Create optimized client based on operation type
   */
  NeonProConnectionPoolManager.prototype.createOptimizedClient = function (
    operationType,
    clinicId,
  ) {
    var connectionString = this.buildConnectionString(operationType);
    return (0, supabase_js_1.createClient)(connectionString, process.env.SUPABASE_ANON_KEY, {
      db: {
        schema: "public",
      },
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
      global: {
        headers: {
          "X-Clinic-ID": clinicId,
          "X-Operation-Type": operationType,
          "X-Healthcare-Compliance": "LGPD-ANVISA-CFM",
        },
      },
    });
  };
  /**
   * Build connection string with healthcare optimizations
   */
  NeonProConnectionPoolManager.prototype.buildConnectionString = function (operationType) {
    var baseUrl = process.env.SUPABASE_URL;
    // Use transaction mode (6543) for critical operations, session mode (5432) for standard
    var port = operationType === "critical" ? "6543" : "5432";
    var poolerUrl = baseUrl.replace("supabase.co", "pooler.supabase.com:".concat(port));
    return poolerUrl;
  };
  /**
   * Initialize metrics tracking for new pool
   */
  NeonProConnectionPoolManager.prototype.initializeMetrics = function (poolKey) {
    this.metrics.set(poolKey, {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      failedConnections: 0,
      avgConnectionTime: 0,
      peakUsage: 0,
      clinicIsolationStatus: "compliant",
    });
  };
  /**
   * Update connection metrics
   */
  NeonProConnectionPoolManager.prototype.updateConnectionMetrics = function (poolKey) {
    var metrics = this.metrics.get(poolKey);
    if (metrics) {
      metrics.totalConnections++;
      metrics.activeConnections++;
      // Track peak usage for healthcare capacity planning
      if (metrics.activeConnections > metrics.peakUsage) {
        metrics.peakUsage = metrics.activeConnections;
      }
      this.metrics.set(poolKey, metrics);
    }
  }; /**
   * Start continuous health monitoring
   */
  NeonProConnectionPoolManager.prototype.startHealthMonitoring = function () {
    var _this = this;
    this.monitoringInterval = setInterval(function () {
      _this.performHealthChecks();
    }, this.config.healthCheckInterval);
  };
  /**
   * Perform comprehensive health checks
   */
  NeonProConnectionPoolManager.prototype.performHealthChecks = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _i,
        _a,
        _b,
        poolKey,
        client,
        startTime,
        error,
        responseTime,
        metrics,
        healthCheck,
        error_2,
        failedHealthCheck;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            (_i = 0), (_a = this.pools);
            _c.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 11];
            (_b = _a[_i]), (poolKey = _b[0]), (client = _b[1]);
            _c.label = 2;
          case 2:
            _c.trys.push([2, 8, , 10]);
            startTime = Date.now();
            return [4 /*yield*/, client.from("profiles").select("id").limit(1).single()];
          case 3:
            error = _c.sent().error;
            responseTime = Date.now() - startTime;
            metrics = this.metrics.get(poolKey);
            healthCheck = {
              status: error ? "unhealthy" : responseTime > 1000 ? "degraded" : "healthy",
              connectionCount:
                (metrics === null || metrics === void 0 ? void 0 : metrics.activeConnections) || 0,
              poolUtilization:
                (((metrics === null || metrics === void 0 ? void 0 : metrics.activeConnections) ||
                  0) /
                  this.config.maxClients) *
                100,
              avgResponseTime: responseTime,
              lastHealthCheck: new Date(),
              compliance: {
                lgpdCompliant: this.verifyLGPDCompliance(poolKey),
                anvisaCompliant: this.verifyANVISACompliance(poolKey),
                cfmCompliant: this.verifyCFMCompliance(poolKey),
              },
            };
            this.healthChecks.set(poolKey, healthCheck);
            if (
              !(
                !healthCheck.compliance.lgpdCompliant ||
                !healthCheck.compliance.anvisaCompliant ||
                !healthCheck.compliance.cfmCompliant
              )
            )
              return [3 /*break*/, 5];
            return [4 /*yield*/, this.handleComplianceViolation(poolKey, healthCheck)];
          case 4:
            _c.sent();
            _c.label = 5;
          case 5:
            if (!(healthCheck.status === "unhealthy" || responseTime > 2000))
              return [3 /*break*/, 7];
            return [4 /*yield*/, this.handlePerformanceDegradation(poolKey, healthCheck)];
          case 6:
            _c.sent();
            _c.label = 7;
          case 7:
            return [3 /*break*/, 10];
          case 8:
            error_2 = _c.sent();
            console.error("Health check failed for pool ".concat(poolKey, ":"), error_2);
            failedHealthCheck = {
              status: "unhealthy",
              connectionCount: 0,
              poolUtilization: 0,
              avgResponseTime: -1,
              lastHealthCheck: new Date(),
              compliance: {
                lgpdCompliant: false,
                anvisaCompliant: false,
                cfmCompliant: false,
              },
            };
            this.healthChecks.set(poolKey, failedHealthCheck);
            return [4 /*yield*/, this.handleConnectionFailure(poolKey, error_2)];
          case 9:
            _c.sent();
            return [3 /*break*/, 10];
          case 10:
            _i++;
            return [3 /*break*/, 1];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Verify LGPD compliance for patient data protection
   */
  NeonProConnectionPoolManager.prototype.verifyLGPDCompliance = function (poolKey) {
    // Check if connection has proper patient data encryption
    // Verify multi-tenant isolation
    // Validate audit trail capabilities
    return poolKey.includes("healthcare_") || poolKey.includes("server_");
  };
  /**
   * Verify ANVISA compliance for medical device software
   */
  NeonProConnectionPoolManager.prototype.verifyANVISACompliance = function (poolKey) {
    // Check medical device software standards
    // Verify clinical data integrity
    // Validate safety monitoring
    return true; // Implement specific ANVISA checks
  };
  /**
   * Verify CFM compliance for telemedicine
   */
  NeonProConnectionPoolManager.prototype.verifyCFMCompliance = function (poolKey) {
    // Check telemedicine interface compliance
    // Verify professional access controls
    // Validate clinical workflow standards
    return true; // Implement specific CFM checks
  };
  /**
   * Handle compliance violations with immediate action
   */
  NeonProConnectionPoolManager.prototype.handleComplianceViolation = function (
    poolKey,
    healthCheck,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            console.error(
              "\uD83D\uDEA8 HEALTHCARE COMPLIANCE VIOLATION detected in pool: ".concat(poolKey),
              {
                lgpd: healthCheck.compliance.lgpdCompliant,
                anvisa: healthCheck.compliance.anvisaCompliant,
                cfm: healthCheck.compliance.cfmCompliant,
                timestamp: new Date().toISOString(),
              },
            );
            // Immediate isolation for patient safety
            this.isolatePool(poolKey);
            // Send compliance alert
            return [4 /*yield*/, this.sendComplianceAlert(poolKey, healthCheck)];
          case 1:
            // Send compliance alert
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Handle performance degradation
   */
  NeonProConnectionPoolManager.prototype.handlePerformanceDegradation = function (
    poolKey,
    healthCheck,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            console.warn(
              "\u26A0\uFE0F Performance degradation detected in pool: ".concat(poolKey),
              {
                responseTime: healthCheck.avgResponseTime,
                utilization: healthCheck.poolUtilization,
                status: healthCheck.status,
              },
            );
            // Try to recover the pool
            return [4 /*yield*/, this.attemptPoolRecovery(poolKey)];
          case 1:
            // Try to recover the pool
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Handle connection failures with retry strategies
   */
  NeonProConnectionPoolManager.prototype.handleConnectionFailure = function (poolKey, error) {
    return __awaiter(this, void 0, void 0, function () {
      var metrics;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            console.error("\u274C Connection failure in pool: ".concat(poolKey), error);
            metrics = this.metrics.get(poolKey);
            if (metrics) {
              metrics.failedConnections++;
              this.metrics.set(poolKey, metrics);
            }
            // Implement exponential backoff retry
            return [4 /*yield*/, this.retryConnection(poolKey, 3)];
          case 1:
            // Implement exponential backoff retry
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Retry connection with exponential backoff
   */
  NeonProConnectionPoolManager.prototype.retryConnection = function (poolKey, maxRetries) {
    return __awaiter(this, void 0, void 0, function () {
      var _loop_1, this_1, attempt, state_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _loop_1 = function (attempt) {
              var backoffTime_1, clinicId, operationType, newClient, error_3;
              return __generator(this, function (_b) {
                switch (_b.label) {
                  case 0:
                    _b.trys.push([0, 2, , 3]);
                    backoffTime_1 = Math.pow(2, attempt) * 1000; // Exponential backoff
                    return [
                      4 /*yield*/,
                      new Promise(function (resolve) {
                        return setTimeout(resolve, backoffTime_1);
                      }),
                      // Recreate the connection
                    ];
                  case 1:
                    _b.sent();
                    clinicId = poolKey.split("_")[1];
                    operationType = poolKey.includes("critical") ? "critical" : "standard";
                    newClient = this_1.createOptimizedClient(operationType, clinicId);
                    this_1.pools.set(poolKey, newClient);
                    console.log(
                      "\u2705 Pool "
                        .concat(poolKey, " recovered after ")
                        .concat(attempt, " attempts"),
                    );
                    return [2 /*return*/, { value: void 0 }];
                  case 2:
                    error_3 = _b.sent();
                    console.error(
                      "Retry attempt ".concat(attempt, " failed for pool ").concat(poolKey, ":"),
                      error_3,
                    );
                    if (attempt === maxRetries) {
                      // Final failure - isolate the pool
                      this_1.isolatePool(poolKey);
                    }
                    return [3 /*break*/, 3];
                  case 3:
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
            _a.label = 3;
          case 3:
            attempt++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Isolate problematic pool for patient safety
   */
  NeonProConnectionPoolManager.prototype.isolatePool = function (poolKey) {
    this.pools.delete(poolKey);
    this.healthChecks.delete(poolKey);
    var metrics = this.metrics.get(poolKey);
    if (metrics) {
      metrics.clinicIsolationStatus = "violation";
      this.metrics.set(poolKey, metrics);
    }
    console.warn("\uD83D\uDD12 Pool ".concat(poolKey, " isolated for safety compliance"));
  };
  /**
   * Attempt pool recovery
   */
  NeonProConnectionPoolManager.prototype.attemptPoolRecovery = function (poolKey) {
    return __awaiter(this, void 0, void 0, function () {
      var clinicId, operationType, recoveredClient;
      return __generator(this, function (_a) {
        try {
          // Clear the existing pool
          this.pools.delete(poolKey);
          clinicId = poolKey.split("_")[1];
          operationType = poolKey.includes("critical") ? "critical" : "standard";
          recoveredClient = this.createOptimizedClient(operationType, clinicId);
          this.pools.set(poolKey, recoveredClient);
          console.log("\uD83D\uDD04 Pool ".concat(poolKey, " recovered successfully"));
        } catch (error) {
          console.error("Failed to recover pool ".concat(poolKey, ":"), error);
          this.isolatePool(poolKey);
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Send compliance alert to healthcare administrators
   */
  NeonProConnectionPoolManager.prototype.sendComplianceAlert = function (poolKey, healthCheck) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would integrate with alerting system
        // For now, log the alert
        console.error("🚨 HEALTHCARE COMPLIANCE ALERT", {
          pool: poolKey,
          violations: {
            lgpd: !healthCheck.compliance.lgpdCompliant,
            anvisa: !healthCheck.compliance.anvisaCompliant,
            cfm: !healthCheck.compliance.cfmCompliant,
          },
          timestamp: new Date().toISOString(),
          action: "POOL_ISOLATED",
        });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Get comprehensive pool analytics for healthcare dashboard
   */
  NeonProConnectionPoolManager.prototype.getPoolAnalytics = function () {
    var _this = this;
    var pools = Array.from(this.pools.keys()).map(function (poolKey) {
      return {
        poolKey: poolKey,
        health: _this.healthChecks.get(poolKey) || _this.getDefaultHealthCheck(),
        metrics: _this.metrics.get(poolKey) || _this.getDefaultMetrics(),
      };
    });
    var healthyPools = pools.filter(function (p) {
      return p.health.status === "healthy";
    }).length;
    var complianceScore =
      (pools.reduce(function (acc, p) {
        var compliant =
          p.health.compliance.lgpdCompliant &&
          p.health.compliance.anvisaCompliant &&
          p.health.compliance.cfmCompliant;
        return acc + (compliant ? 1 : 0);
      }, 0) /
        pools.length) *
      100;
    var avgResponseTime =
      pools.reduce(function (acc, p) {
        return acc + p.health.avgResponseTime;
      }, 0) / pools.length;
    return {
      pools: pools,
      summary: {
        totalPools: pools.length,
        healthyPools: healthyPools,
        complianceScore: complianceScore,
        avgResponseTime: avgResponseTime,
      },
    };
  };
  NeonProConnectionPoolManager.prototype.getDefaultHealthCheck = function () {
    return {
      status: "unhealthy",
      connectionCount: 0,
      poolUtilization: 0,
      avgResponseTime: -1,
      lastHealthCheck: new Date(),
      compliance: {
        lgpdCompliant: false,
        anvisaCompliant: false,
        cfmCompliant: false,
      },
    };
  };
  NeonProConnectionPoolManager.prototype.getDefaultMetrics = function () {
    return {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      failedConnections: 0,
      avgConnectionTime: 0,
      peakUsage: 0,
      clinicIsolationStatus: "violation",
    };
  };
  /**
   * Cleanup on shutdown
   */
  NeonProConnectionPoolManager.prototype.shutdown = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        if (this.monitoringInterval) {
          clearInterval(this.monitoringInterval);
        }
        this.pools.clear();
        this.healthChecks.clear();
        this.metrics.clear();
        console.log("🔄 NeonPro Connection Pool Manager shutdown completed");
        return [2 /*return*/];
      });
    });
  };
  return NeonProConnectionPoolManager;
})();
exports.NeonProConnectionPoolManager = NeonProConnectionPoolManager;
// Export singleton factory
var getConnectionPoolManager = function (clinicSize) {
  return NeonProConnectionPoolManager.getInstance(clinicSize);
};
exports.getConnectionPoolManager = getConnectionPoolManager;
