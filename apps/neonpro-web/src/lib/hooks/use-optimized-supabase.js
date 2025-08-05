"use strict";
/**
 * 🎯 Optimized Supabase Hooks
 * Task 1.3 - CONNECTION POOLING OPTIMIZATION
 *
 * React hooks with integrated connection pooling for healthcare operations
 * Features:
 * - Automatic pool selection based on operation criticality
 * - Healthcare compliance monitoring
 * - Performance optimization for clinical workflows
 * - Multi-tenant isolation support
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOptimizedSupabase = useOptimizedSupabase;
exports.useOptimizedServerSupabase = useOptimizedServerSupabase;
exports.useOptimizedBrowserSupabase = useOptimizedBrowserSupabase;
exports.useHealthcareCompliantSupabase = useHealthcareCompliantSupabase;
exports.usePoolAnalytics = usePoolAnalytics;
exports.useCriticalHealthcareSupabase = useCriticalHealthcareSupabase;
var connection_pool_manager_1 = require("@/lib/supabase/connection-pool-manager");
var react_1 = require("react");
/**
 * Main hook for optimized Supabase connections
 */
function useOptimizedSupabase(options) {
  var _this = this;
  var clinicId = options.clinicId,
    _a = options.operationType,
    operationType = _a === void 0 ? "standard" : _a,
    _b = options.autoRetry,
    autoRetry = _b === void 0 ? true : _b,
    _c = options.healthMonitoring,
    healthMonitoring = _c === void 0 ? true : _c;
  var _d = (0, react_1.useState)(false),
    isConnected = _d[0],
    setIsConnected = _d[1];
  var _e = (0, react_1.useState)(true),
    isLoading = _e[0],
    setIsLoading = _e[1];
  var _f = (0, react_1.useState)(null),
    error = _f[0],
    setError = _f[1];
  var _g = (0, react_1.useState)(null),
    healthStatus = _g[0],
    setHealthStatus = _g[1];
  var _h = (0, react_1.useState)(null),
    metrics = _h[0],
    setMetrics = _h[1];
  var poolManager = (0, react_1.useMemo)(function () {
    return (0, connection_pool_manager_1.getConnectionPoolManager)();
  }, []);
  var retryTimeoutRef = (0, react_1.useRef)();
  var healthCheckIntervalRef = (0, react_1.useRef)();
  // Get optimized client based on operation type
  var client = (0, react_1.useMemo)(
    function () {
      try {
        var clientType = operationType === "critical" ? "critical" : "standard";
        return poolManager.getHealthcareClient(clinicId, clientType);
      } catch (err) {
        setError(err);
        setIsLoading(false);
        return null;
      }
    },
    [poolManager, clinicId, operationType],
  );
  // Connection health check
  var checkConnection = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var testError, err_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!client) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, 4, 5]);
              setIsLoading(true);
              setError(null);
              return [4 /*yield*/, client.from("profiles").select("id").limit(1).single()];
            case 2:
              testError = _a.sent().error;
              if (testError && testError.code !== "PGRST116") {
                // Ignore "no rows" error
                throw new Error("Connection test failed: ".concat(testError.message));
              }
              setIsConnected(true);
              setError(null);
              return [3 /*break*/, 5];
            case 3:
              err_1 = _a.sent();
              setIsConnected(false);
              setError(err_1);
              if (autoRetry) {
                scheduleRetry();
              }
              return [3 /*break*/, 5];
            case 4:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    },
    [client, autoRetry],
  );
  // Schedule retry with exponential backoff
  var scheduleRetry = (0, react_1.useCallback)(
    function () {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      retryTimeoutRef.current = setTimeout(function () {
        checkConnection();
      }, 2000); // 2 second retry delay
    },
    [checkConnection],
  );
  // Manual retry function
  var retry = (0, react_1.useCallback)(
    function () {
      checkConnection();
    },
    [checkConnection],
  );
  // Update health monitoring
  var updateHealthMetrics = (0, react_1.useCallback)(
    function () {
      if (!healthMonitoring) return;
      var analytics = poolManager.getPoolAnalytics();
      var poolKey = "healthcare_".concat(clinicId, "_").concat(operationType);
      var poolData = analytics.pools.find(function (p) {
        return p.poolKey === poolKey;
      });
      if (poolData) {
        setHealthStatus(poolData.health);
        setMetrics(poolData.metrics);
      }
    },
    [poolManager, clinicId, operationType, healthMonitoring],
  );
  // Initialize connection and monitoring
  (0, react_1.useEffect)(
    function () {
      checkConnection();
      if (healthMonitoring) {
        updateHealthMetrics();
        // Set up health monitoring interval
        healthCheckIntervalRef.current = setInterval(function () {
          updateHealthMetrics();
        }, 30000); // Check every 30 seconds
      }
      return function () {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        if (healthCheckIntervalRef.current) {
          clearInterval(healthCheckIntervalRef.current);
        }
      };
    },
    [checkConnection, updateHealthMetrics, healthMonitoring],
  );
  return {
    client: client,
    isConnected: isConnected,
    isLoading: isLoading,
    error: error,
    healthStatus: healthStatus,
    metrics: metrics,
    retry: retry,
  };
}
/**
 * Hook for server-side operations with session management
 */
function useOptimizedServerSupabase(clinicId) {
  var _this = this;
  var _a = (0, react_1.useState)(null),
    client = _a[0],
    setClient = _a[1];
  var _b = (0, react_1.useState)(true),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var poolManager = (0, react_1.useMemo)(function () {
    return (0, connection_pool_manager_1.getConnectionPoolManager)();
  }, []);
  (0, react_1.useEffect)(
    function () {
      var initializeServerClient = function () {
        return __awaiter(_this, void 0, void 0, function () {
          var serverClient, err_2;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 2, 3, 4]);
                setIsLoading(true);
                return [4 /*yield*/, poolManager.getServerClient(clinicId)];
              case 1:
                serverClient = _a.sent();
                setClient(serverClient);
                setError(null);
                return [3 /*break*/, 4];
              case 2:
                err_2 = _a.sent();
                setError(err_2);
                return [3 /*break*/, 4];
              case 3:
                setIsLoading(false);
                return [7 /*endfinally*/];
              case 4:
                return [2 /*return*/];
            }
          });
        });
      };
      initializeServerClient();
    },
    [poolManager, clinicId],
  );
  return { client: client, isLoading: isLoading, error: error };
}
/**
 * Hook for browser-side operations
 */
function useOptimizedBrowserSupabase(clinicId) {
  var poolManager = (0, react_1.useMemo)(function () {
    return (0, connection_pool_manager_1.getConnectionPoolManager)();
  }, []);
  var client = (0, react_1.useMemo)(
    function () {
      return poolManager.getBrowserClient(clinicId);
    },
    [poolManager, clinicId],
  );
  return { client: client };
}
/**
 * Hook for healthcare-specific operations with compliance monitoring
 */
function useHealthcareCompliantSupabase(clinicId, operationType) {
  var _this = this;
  if (operationType === void 0) {
    operationType = "standard";
  }
  var baseHook = useOptimizedSupabase({
    clinicId: clinicId,
    operationType: operationType,
    autoRetry: true,
    healthMonitoring: true,
  });
  // Enhanced compliance monitoring
  var complianceStatus = (0, react_1.useMemo)(
    function () {
      if (!baseHook.healthStatus) return null;
      return {
        lgpdCompliant: baseHook.healthStatus.compliance.lgpdCompliant,
        anvisaCompliant: baseHook.healthStatus.compliance.anvisaCompliant,
        cfmCompliant: baseHook.healthStatus.compliance.cfmCompliant,
        overallCompliant:
          baseHook.healthStatus.compliance.lgpdCompliant &&
          baseHook.healthStatus.compliance.anvisaCompliant &&
          baseHook.healthStatus.compliance.cfmCompliant,
      };
    },
    [baseHook.healthStatus],
  );
  // Healthcare-specific query wrapper with audit trail
  var executeHealthcareQuery = (0, react_1.useCallback)(
    function (queryFn, auditInfo) {
      return __awaiter(_this, void 0, void 0, function () {
        var auditHeaders, result, error_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (
                !baseHook.client ||
                !(complianceStatus === null || complianceStatus === void 0
                  ? void 0
                  : complianceStatus.overallCompliant)
              ) {
                throw new Error("Healthcare compliance requirements not met");
              }
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              auditHeaders = {
                "X-Audit-Action": auditInfo.action,
                "X-Audit-Professional": auditInfo.professionalId,
                "X-Audit-Timestamp": new Date().toISOString(),
                "X-Clinic-ID": clinicId,
              };
              if (auditInfo.patientId) {
                auditHeaders["X-Audit-Patient"] = auditInfo.patientId;
              }
              return [
                4 /*yield*/,
                queryFn(baseHook.client),
                // Log healthcare operation for LGPD compliance
              ];
            case 2:
              result = _a.sent();
              // Log healthcare operation for LGPD compliance
              console.log("Healthcare operation executed:", {
                clinicId: clinicId,
                action: auditInfo.action,
                professionalId: auditInfo.professionalId,
                patientId: auditInfo.patientId,
                timestamp: new Date().toISOString(),
                compliance: complianceStatus,
              });
              return [2 /*return*/, result];
            case 3:
              error_1 = _a.sent();
              // Log healthcare operation error
              console.error("Healthcare operation failed:", {
                clinicId: clinicId,
                action: auditInfo.action,
                error: error_1.message,
                timestamp: new Date().toISOString(),
              });
              throw error_1;
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [baseHook.client, complianceStatus, clinicId],
  );
  return __assign(__assign({}, baseHook), {
    complianceStatus: complianceStatus,
    executeHealthcareQuery: executeHealthcareQuery,
  });
}
/**
 * Hook for pool analytics and monitoring
 */
function usePoolAnalytics() {
  var _a = (0, react_1.useState)(null),
    analytics = _a[0],
    setAnalytics = _a[1];
  var _b = (0, react_1.useState)(true),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var poolManager = (0, react_1.useMemo)(function () {
    return (0, connection_pool_manager_1.getConnectionPoolManager)();
  }, []);
  var refreshAnalytics = (0, react_1.useCallback)(
    function () {
      try {
        setIsLoading(true);
        var data = poolManager.getPoolAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch pool analytics:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [poolManager],
  );
  (0, react_1.useEffect)(
    function () {
      refreshAnalytics();
      // Update analytics every 30 seconds
      var interval = setInterval(refreshAnalytics, 30000);
      return function () {
        return clearInterval(interval);
      };
    },
    [refreshAnalytics],
  );
  return {
    analytics: analytics,
    isLoading: isLoading,
    refresh: refreshAnalytics,
  };
}
/**
 * Hook for critical healthcare operations with enhanced monitoring
 */
function useCriticalHealthcareSupabase(clinicId) {
  var _this = this;
  var baseHook = useHealthcareCompliantSupabase(clinicId, "critical");
  // Additional monitoring for critical operations
  var _a = (0, react_1.useState)([]),
    operationHistory = _a[0],
    setOperationHistory = _a[1];
  var executeCriticalOperation = (0, react_1.useCallback)(
    function (queryFn, auditInfo) {
      return __awaiter(_this, void 0, void 0, function () {
        var startTime, success, result, responseTime_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              startTime = Date.now();
              success = false;
              _a.label = 1;
            case 1:
              _a.trys.push([1, , 3, 4]);
              return [4 /*yield*/, baseHook.executeHealthcareQuery(queryFn, auditInfo)];
            case 2:
              result = _a.sent();
              success = true;
              return [2 /*return*/, result];
            case 3:
              responseTime_1 = Date.now() - startTime;
              // Track critical operation
              setOperationHistory(function (prev) {
                return __spreadArray(
                  __spreadArray([], prev, true),
                  [
                    {
                      timestamp: new Date(),
                      action: auditInfo.action,
                      success: success,
                      responseTime: responseTime_1,
                    },
                  ],
                  false,
                ).slice(-100);
              }); // Keep last 100 operations
              return [7 /*endfinally*/];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [baseHook],
  );
  return __assign(__assign({}, baseHook), {
    executeCriticalOperation: executeCriticalOperation,
    operationHistory: operationHistory,
  });
}
