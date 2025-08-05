/**
 * Performance Tests for Healthcare Connection Pooling
 * Task 1.3 - CONNECTION POOLING OPTIMIZATION
 *
 * Comprehensive performance validation and healthcare compliance testing
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
var globals_1 = require("@jest/globals");
var connection_pool_manager_1 = require("../connection-pool-manager");
var query_strategies_1 = require("../query-strategies");
var connection_retry_strategies_1 = require("../connection-retry-strategies");
var connection_pool_monitor_1 = require("../../monitoring/connection-pool-monitor");
// Mock Supabase client
var mockSupabaseClient = {
  from: globals_1.jest.fn(() => ({
    select: globals_1.jest.fn(() => ({
      eq: globals_1.jest.fn(() => ({
        single: globals_1.jest.fn(),
        limit: globals_1.jest.fn(() => ({ single: globals_1.jest.fn() })),
      })),
    })),
    insert: globals_1.jest.fn(),
    update: globals_1.jest.fn(),
    delete: globals_1.jest.fn(),
  })),
  auth: {
    getSession: globals_1.jest.fn(),
  },
  rpc: globals_1.jest.fn(),
};
// Mock environment variables
process.env.SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_ANON_KEY = "test-key";
(0, globals_1.describe)("Healthcare Connection Pool Performance", () => {
  var poolManager;
  var queryStrategies;
  var retryManager;
  var monitor;
  (0, globals_1.beforeAll)(() => {
    poolManager = (0, connection_pool_manager_1.getConnectionPoolManager)("medium");
    queryStrategies = (0, query_strategies_1.getQueryStrategies)();
    retryManager = (0, connection_retry_strategies_1.getRetryManager)();
    monitor = (0, connection_pool_monitor_1.getConnectionPoolMonitor)();
  });
  (0, globals_1.afterAll)(() =>
    __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, poolManager.shutdown()];
          case 1:
            _a.sent();
            monitor.shutdown();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, globals_1.beforeEach)(() => {
    globals_1.jest.clearAllMocks();
  });
  (0, globals_1.describe)("Connection Pool Manager Performance", () => {
    (0, globals_1.it)("should create healthcare clients within performance targets", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var startTime, clinicId, criticalClient, standardClient, elapsedTime;
        return __generator(this, (_a) => {
          startTime = Date.now();
          clinicId = "test-clinic-001";
          criticalClient = poolManager.getHealthcareClient(clinicId, "critical");
          (0, globals_1.expect)(criticalClient).toBeDefined();
          standardClient = poolManager.getHealthcareClient(clinicId, "standard");
          (0, globals_1.expect)(standardClient).toBeDefined();
          elapsedTime = Date.now() - startTime;
          // Should create clients within 100ms for healthcare performance
          (0, globals_1.expect)(elapsedTime).toBeLessThan(100);
          return [2 /*return*/];
        });
      }),
    );
    (0, globals_1.it)("should handle multiple concurrent client requests efficiently", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var clinicId, concurrentRequests, startTime, promises, clients, elapsedTime;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              clinicId = "test-clinic-002";
              concurrentRequests = 50;
              startTime = Date.now();
              promises = Array.from({ length: concurrentRequests }, (_, i) => {
                var operationType = i % 2 === 0 ? "critical" : "standard";
                return poolManager.getHealthcareClient(clinicId, operationType);
              });
              return [4 /*yield*/, Promise.all(promises.map((client) => Promise.resolve(client)))];
            case 1:
              clients = _a.sent();
              elapsedTime = Date.now() - startTime;
              (0, globals_1.expect)(clients).toHaveLength(concurrentRequests);
              (0, globals_1.expect)(clients.every((client) => client !== null)).toBe(true);
              // Should handle 50 concurrent requests within 500ms
              (0, globals_1.expect)(elapsedTime).toBeLessThan(500);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should maintain pool analytics accuracy under load", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var clinicId, i, analytics;
        return __generator(this, (_a) => {
          clinicId = "test-clinic-003";
          // Create multiple clients to populate analytics
          for (i = 0; i < 10; i++) {
            poolManager.getHealthcareClient(clinicId, i % 2 === 0 ? "critical" : "standard");
          }
          analytics = poolManager.getPoolAnalytics();
          (0, globals_1.expect)(analytics.summary.totalPools).toBeGreaterThan(0);
          (0, globals_1.expect)(analytics.summary.complianceScore).toBeGreaterThanOrEqual(0);
          (0, globals_1.expect)(analytics.summary.complianceScore).toBeLessThanOrEqual(100);
          (0, globals_1.expect)(analytics.pools.length).toBeGreaterThan(0);
          return [2 /*return*/];
        });
      }),
    );
  });
  (0, globals_1.describe)("Query Strategies Performance", () => {
    (0, globals_1.it)("should execute patient critical queries within emergency thresholds", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockQuery, context, startTime, result, executionTime;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockQuery = globals_1.jest.fn().mockResolvedValue({ id: 1, name: "Test Patient" });
              context = (0, query_strategies_1.createQueryContext)(
                "test-clinic-004",
                "test-user-001",
                "patient_critical",
                {
                  patientId: "patient-001",
                  priority: "emergency",
                  userRole: "professional",
                },
              );
              startTime = Date.now();
              return [4 /*yield*/, queryStrategies.executeQuery(mockQuery, context)];
            case 1:
              result = _a.sent();
              executionTime = Date.now() - startTime;
              (0, globals_1.expect)(result.error).toBeNull();
              (0, globals_1.expect)(result.executionTime).toBeLessThan(5000); // 5 seconds for emergency
              (0, globals_1.expect)(result.complianceVerified).toBe(true);
              (0, globals_1.expect)(executionTime).toBeLessThan(6000); // Total time including overhead
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle analytics queries with appropriate timeout", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockQuery, context, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockQuery = globals_1.jest
                .fn()
                .mockImplementation(
                  () => new Promise((resolve) => setTimeout(() => resolve({ count: 100 }), 2000)),
                );
              context = (0, query_strategies_1.createQueryContext)(
                "test-clinic-005",
                "test-user-002",
                "analytics_readonly",
                {
                  priority: "low",
                  userRole: "admin",
                },
              );
              return [4 /*yield*/, queryStrategies.executeQuery(mockQuery, context)];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.error).toBeNull();
              (0, globals_1.expect)(result.data).toEqual({ count: 100 });
              (0, globals_1.expect)(result.strategy.timeout).toBe(60000); // 60 seconds for analytics
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should fail fast on non-retryable errors", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockQuery, context, startTime, result, executionTime;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              mockQuery = globals_1.jest
                .fn()
                .mockRejectedValue(new Error("PGRST301: Authentication failed"));
              context = (0, query_strategies_1.createQueryContext)(
                "test-clinic-006",
                "test-user-003",
                "patient_standard",
                {
                  patientId: "patient-002",
                  userRole: "professional",
                },
              );
              startTime = Date.now();
              return [4 /*yield*/, queryStrategies.executeQuery(mockQuery, context)];
            case 1:
              result = _b.sent();
              executionTime = Date.now() - startTime;
              (0, globals_1.expect)(result.error).toBeDefined();
              (0, globals_1.expect)(
                (_a = result.error) === null || _a === void 0 ? void 0 : _a.message,
              ).toContain("Authentication failed");
              (0, globals_1.expect)(executionTime).toBeLessThan(1000); // Should fail fast
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Retry Manager Performance", () => {
    (0, globals_1.it)("should retry with exponential backoff within healthcare timeouts", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var attempts, mockOperation, startTime, result, totalTime;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              attempts = 0;
              mockOperation = globals_1.jest.fn().mockImplementation(() => {
                attempts++;
                if (attempts < 3) {
                  throw new Error("Connection timeout");
                }
                return Promise.resolve({ success: true });
              });
              startTime = Date.now();
              return [
                4 /*yield*/,
                retryManager.executeWithRetry(mockOperation, {
                  clinicId: "test-clinic-007",
                  operationType: "patient-data-access",
                  priority: "standard",
                  userId: "test-user-004",
                }),
              ];
            case 1:
              result = _a.sent();
              totalTime = Date.now() - startTime;
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(result.attempts).toBe(3);
              (0, globals_1.expect)(result.data).toEqual({ success: true });
              (0, globals_1.expect)(totalTime).toBeLessThan(15000); // Within standard timeout
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle circuit breaker activation correctly", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockOperation, i, startTime, result, executionTime;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockOperation = globals_1.jest
                .fn()
                .mockRejectedValue(new Error("Service unavailable"));
              i = 0;
              _a.label = 1;
            case 1:
              if (!(i < 4)) return [3 /*break*/, 4];
              return [
                4 /*yield*/,
                retryManager.executeWithRetry(mockOperation, {
                  clinicId: "test-clinic-008",
                  operationType: "test-operation",
                  priority: "standard",
                  userId: "test-user-005",
                }),
              ];
            case 2:
              _a.sent();
              _a.label = 3;
            case 3:
              i++;
              return [3 /*break*/, 1];
            case 4:
              startTime = Date.now();
              return [
                4 /*yield*/,
                retryManager.executeWithRetry(mockOperation, {
                  clinicId: "test-clinic-008",
                  operationType: "test-operation",
                  priority: "standard",
                  userId: "test-user-005",
                }),
              ];
            case 5:
              result = _a.sent();
              executionTime = Date.now() - startTime;
              (0, globals_1.expect)(result.success).toBe(false);
              (0, globals_1.expect)(result.circuitBreakerTriggered).toBe(true);
              (0, globals_1.expect)(executionTime).toBeLessThan(100); // Should fail immediately
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should prioritize emergency operations", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockEmergencyOperation, startTime, result, executionTime;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockEmergencyOperation = globals_1.jest.fn().mockResolvedValue({ emergency: true });
              startTime = Date.now();
              return [
                4 /*yield*/,
                retryManager.executeWithRetry(mockEmergencyOperation, {
                  clinicId: "test-clinic-009",
                  operationType: "emergency-patient-access",
                  priority: "emergency",
                  userId: "test-user-006",
                  patientId: "patient-003",
                }),
              ];
            case 1:
              result = _a.sent();
              executionTime = Date.now() - startTime;
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(result.patientSafetyEnsured).toBe(true);
              (0, globals_1.expect)(executionTime).toBeLessThan(2000); // Emergency should be fast
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Healthcare Compliance Performance", () => {
    (0, globals_1.it)("should validate LGPD compliance within acceptable time", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockQuery, context, startTime, result, executionTime;
        var _a, _b;
        return __generator(this, (_c) => {
          switch (_c.label) {
            case 0:
              mockQuery = globals_1.jest.fn().mockResolvedValue({ patientData: "sensitive" });
              context = (0, query_strategies_1.createQueryContext)(
                "test-clinic-010",
                "test-user-007",
                "patient_standard",
                {
                  patientId: "patient-004",
                  lgpdSensitive: true,
                  requiresAudit: true,
                  userRole: "professional",
                },
              );
              startTime = Date.now();
              return [4 /*yield*/, queryStrategies.executeQuery(mockQuery, context)];
            case 1:
              result = _c.sent();
              executionTime = Date.now() - startTime;
              (0, globals_1.expect)(result.complianceVerified).toBe(true);
              (0, globals_1.expect)(result.auditTrail).toBeDefined();
              (0, globals_1.expect)(
                (_a = result.auditTrail) === null || _a === void 0 ? void 0 : _a.clinicId,
              ).toBe("test-clinic-010");
              (0, globals_1.expect)(
                (_b = result.auditTrail) === null || _b === void 0 ? void 0 : _b.patientId,
              ).toBe("patient-004");
              (0, globals_1.expect)(executionTime).toBeLessThan(1000); // Compliance check should be fast
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should maintain multi-tenant isolation under load", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var clinic1Operations,
          clinic2Operations,
          i,
          allClients,
          _a,
          _b,
          analytics,
          clinic1Pools,
          clinic2Pools;
        return __generator(this, (_c) => {
          switch (_c.label) {
            case 0:
              clinic1Operations = [];
              clinic2Operations = [];
              // Simulate operations from different clinics
              for (i = 0; i < 25; i++) {
                clinic1Operations.push(poolManager.getHealthcareClient("clinic-001", "standard"));
                clinic2Operations.push(poolManager.getHealthcareClient("clinic-002", "standard"));
              }
              _a = [[]];
              return [4 /*yield*/, Promise.all(clinic1Operations.map((c) => Promise.resolve(c)))];
            case 1:
              _b = [__spreadArray.apply(void 0, _a.concat([_c.sent(), true]))];
              return [4 /*yield*/, Promise.all(clinic2Operations.map((c) => Promise.resolve(c)))];
            case 2:
              allClients = __spreadArray.apply(void 0, _b.concat([_c.sent(), true]));
              (0, globals_1.expect)(allClients).toHaveLength(50);
              (0, globals_1.expect)(allClients.every((client) => client !== null)).toBe(true);
              analytics = poolManager.getPoolAnalytics();
              clinic1Pools = analytics.pools.filter((p) => p.poolKey.includes("clinic-001"));
              clinic2Pools = analytics.pools.filter((p) => p.poolKey.includes("clinic-002"));
              (0, globals_1.expect)(clinic1Pools.length).toBeGreaterThan(0);
              (0, globals_1.expect)(clinic2Pools.length).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Monitoring Performance", () => {
    (0, globals_1.it)("should provide health summary within acceptable time", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var startTime, healthSummary, executionTime;
        return __generator(this, (_a) => {
          startTime = Date.now();
          healthSummary = monitor.getHealthSummary();
          executionTime = Date.now() - startTime;
          (0, globals_1.expect)(healthSummary).toBeDefined();
          (0, globals_1.expect)(healthSummary.status).toMatch(
            /healthy|degraded|critical|emergency/,
          );
          (0, globals_1.expect)(healthSummary.lastUpdate).toBeInstanceOf(Date);
          (0, globals_1.expect)(executionTime).toBeLessThan(50); // Should be very fast
          return [2 /*return*/];
        });
      }),
    );
    (0, globals_1.it)("should handle concurrent monitoring requests", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var concurrentRequests, startTime, promises, results, executionTime;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              concurrentRequests = 20;
              startTime = Date.now();
              promises = Array.from({ length: concurrentRequests }, () =>
                Promise.resolve(monitor.getHealthSummary()),
              );
              return [4 /*yield*/, Promise.all(promises)];
            case 1:
              results = _a.sent();
              executionTime = Date.now() - startTime;
              (0, globals_1.expect)(results).toHaveLength(concurrentRequests);
              (0, globals_1.expect)(results.every((result) => result !== null)).toBe(true);
              (0, globals_1.expect)(executionTime).toBeLessThan(200); // 20 concurrent requests under 200ms
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("End-to-End Performance", () => {
    (0, globals_1.it)("should handle complete healthcare workflow within SLA", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var clinicId,
          userId,
          patientId,
          startTime,
          client,
          mockQuery,
          result,
          healthSummary,
          totalTime;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              clinicId = "test-clinic-e2e";
              userId = "test-user-e2e";
              patientId = "patient-e2e";
              startTime = Date.now();
              client = poolManager.getHealthcareClient(clinicId, "critical");
              (0, globals_1.expect)(client).toBeDefined();
              mockQuery = globals_1.jest.fn().mockResolvedValue({
                patientId: patientId,
                vitals: { heartRate: 72, bloodPressure: "120/80" },
              });
              return [
                4 /*yield*/,
                retryManager.executeWithRetry(mockQuery, {
                  clinicId: clinicId,
                  operationType: "patient-vitals-access",
                  priority: "critical",
                  userId: userId,
                  patientId: patientId,
                  requiresCompliance: true,
                }),
                // Step 3: Check monitoring
              ];
            case 1:
              result = _a.sent();
              healthSummary = monitor.getHealthSummary();
              totalTime = Date.now() - startTime;
              // Validate complete workflow
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(result.patientSafetyEnsured).toBe(true);
              (0, globals_1.expect)(healthSummary.status).not.toBe("emergency");
              // Healthcare SLA: Complete patient data access under 2 seconds
              (0, globals_1.expect)(totalTime).toBeLessThan(2000);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should maintain performance under healthcare load simulation", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var loadTestDuration,
          operationsPerSecond,
          totalOperations,
          startTime,
          operations,
          _loop_1,
          i,
          results,
          totalTime,
          healthSummary;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              loadTestDuration = 5000; // 5 seconds
              operationsPerSecond = 10;
              totalOperations = (loadTestDuration / 1000) * operationsPerSecond;
              startTime = Date.now();
              operations = [];
              _loop_1 = (i) => {
                var clinicId = "clinic-".concat(i % 3); // 3 clinics
                var operationType = i % 4 === 0 ? "critical" : "standard";
                operations.push(
                  new Promise((resolve) => {
                    setTimeout(
                      () => {
                        var client = poolManager.getHealthcareClient(clinicId, operationType);
                        resolve(client);
                      },
                      (i / operationsPerSecond) * 1000,
                    );
                  }),
                );
              };
              // Simulate healthcare load
              for (i = 0; i < totalOperations; i++) {
                _loop_1(i);
              }
              return [4 /*yield*/, Promise.all(operations)];
            case 1:
              results = _a.sent();
              totalTime = Date.now() - startTime;
              (0, globals_1.expect)(results).toHaveLength(totalOperations);
              (0, globals_1.expect)(results.every((result) => result !== null)).toBe(true);
              (0, globals_1.expect)(totalTime).toBeLessThan(loadTestDuration + 1000); // Allow 1s overhead
              healthSummary = monitor.getHealthSummary();
              (0, globals_1.expect)(healthSummary.status).not.toBe("emergency");
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Resource Cleanup Performance", () => {
    (0, globals_1.it)("should cleanup resources efficiently", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var startTime, i, cleanupTime;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              startTime = Date.now();
              // Create multiple clients
              for (i = 0; i < 10; i++) {
                poolManager.getHealthcareClient("cleanup-clinic-".concat(i), "standard");
              }
              // Cleanup
              return [4 /*yield*/, poolManager.shutdown()];
            case 1:
              // Cleanup
              _a.sent();
              monitor.shutdown();
              cleanupTime = Date.now() - startTime;
              // Cleanup should be fast
              (0, globals_1.expect)(cleanupTime).toBeLessThan(1000);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
});
(0, globals_1.describe)("Performance Benchmarks", () => {
  var performanceThresholds = {
    clientCreation: 100, // ms
    queryExecution: 5000, // ms for critical
    retryOperation: 15000, // ms for standard
    healthCheck: 50, // ms
    complianceValidation: 1000, // ms
    endToEndWorkflow: 2000, // ms
  };
  (0, globals_1.it)("should meet all healthcare performance SLAs", () => {
    // This test validates that our thresholds are reasonable
    (0, globals_1.expect)(performanceThresholds.clientCreation).toBeLessThan(200);
    (0, globals_1.expect)(performanceThresholds.queryExecution).toBeLessThan(10000);
    (0, globals_1.expect)(performanceThresholds.retryOperation).toBeLessThan(30000);
    (0, globals_1.expect)(performanceThresholds.healthCheck).toBeLessThan(100);
    (0, globals_1.expect)(performanceThresholds.complianceValidation).toBeLessThan(2000);
    (0, globals_1.expect)(performanceThresholds.endToEndWorkflow).toBeLessThan(5000);
  });
});
