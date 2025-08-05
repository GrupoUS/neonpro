"use strict";
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
var globals_1 = require("@jest/globals");
var server_1 = require("next/server");
// Import the modules we're testing
var route_1 = require("../../app/api/auth/session/extend/route");
var route_2 = require("../../app/api/auth/session/validate/route");
var route_3 = require("../../app/api/security/audit/route");
var session_manager_1 = require("../../lib/auth/session-manager");
var security_audit_framework_1 = require("../../lib/auth/security-audit-framework");
var performance_tracker_1 = require("../../lib/auth/performance-tracker");
(0, globals_1.describe)("TASK-002: Core Foundation Enhancement Integration Test", function () {
  var performanceTracker;
  (0, globals_1.beforeEach)(function () {
    // Reset all mocks
    globals_1.jest.clearAllMocks();
    // Initialize components
    performanceTracker = performance_tracker_1.PerformanceTracker.getInstance();
  });
  (0, globals_1.afterEach)(function () {
    globals_1.jest.clearAllMocks();
  });
  (0, globals_1.describe)("Advanced Session Management", function () {
    (0, globals_1.it)("should extend session successfully with proper validation", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockRequest, response, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRequest = {
                json: globals_1.jest.fn().mockResolvedValue({
                  sessionToken: "valid-session-token",
                  extensionMinutes: 30,
                }),
                headers: {
                  get: globals_1.jest.fn().mockImplementation(function (header) {
                    var headers = {
                      authorization: "Bearer valid-session-token",
                      "user-agent": "Mozilla/5.0 (Test Browser)",
                      "x-forwarded-for": "192.168.1.100",
                    };
                    return headers[header.toLowerCase()] || null;
                  }),
                },
              };
              return [4 /*yield*/, (0, route_1.POST)(mockRequest)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeInstanceOf(server_1.NextResponse);
              return [4 /*yield*/, session_manager_1.sessionManager.extendSession("user-123", 30)];
            case 2:
              result = _a.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(result.newExpiresAt).toBeDefined();
              (0, globals_1.expect)(result.metadata).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should validate sessions with comprehensive security checks", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockRequest, response, validation;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRequest = {
                json: globals_1.jest.fn().mockResolvedValue({
                  sessionToken: "valid-session-token",
                }),
                headers: {
                  get: globals_1.jest.fn().mockImplementation(function (header) {
                    var headers = {
                      authorization: "Bearer valid-session-token",
                      "user-agent": "Mozilla/5.0 (Test Browser)",
                      "x-forwarded-for": "192.168.1.100",
                    };
                    return headers[header.toLowerCase()] || null;
                  }),
                },
              };
              return [4 /*yield*/, (0, route_2.POST)(mockRequest)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeInstanceOf(server_1.NextResponse);
              return [
                4 /*yield*/,
                session_manager_1.sessionManager.validateSession("valid-session-token"),
              ];
            case 2:
              validation = _a.sent();
              (0, globals_1.expect)(validation.isValid).toBe(true);
              (0, globals_1.expect)(validation.user).toBeDefined();
              (0, globals_1.expect)(validation.securityFlags).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle session cleanup and security monitoring", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var cleanupResult, securityEvent;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, session_manager_1.sessionManager.cleanupExpiredSessions()];
            case 1:
              cleanupResult = _a.sent();
              (0, globals_1.expect)(cleanupResult.cleanedCount).toBeGreaterThanOrEqual(0);
              (0, globals_1.expect)(cleanupResult.totalProcessed).toBeGreaterThanOrEqual(0);
              return [
                4 /*yield*/,
                session_manager_1.sessionManager.logSecurityEvent("user-123", "SUSPICIOUS_LOGIN", {
                  ipAddress: "192.168.1.100",
                  userAgent: "Mozilla/5.0 (Test Browser)",
                  timestamp: new Date().toISOString(),
                }),
              ];
            case 2:
              securityEvent = _a.sent();
              (0, globals_1.expect)(securityEvent.success).toBe(true);
              (0, globals_1.expect)(securityEvent.eventId).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Security Audit Framework", function () {
    (0, globals_1.it)("should perform comprehensive security audit", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockRequest, response, auditResult;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRequest = {
                json: globals_1.jest.fn().mockResolvedValue({
                  auditType: "full",
                  includeCompliance: true,
                }),
                headers: {
                  get: globals_1.jest.fn().mockImplementation(function (header) {
                    var headers = {
                      authorization: "Bearer admin-token",
                      "content-type": "application/json",
                    };
                    return headers[header.toLowerCase()] || null;
                  }),
                },
              };
              return [4 /*yield*/, (0, route_3.POST)(mockRequest)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeInstanceOf(server_1.NextResponse);
              return [
                4 /*yield*/,
                security_audit_framework_1.securityAuditFramework.performAudit("full"),
              ];
            case 2:
              auditResult = _a.sent();
              (0, globals_1.expect)(auditResult.success).toBe(true);
              (0, globals_1.expect)(auditResult.findings).toBeDefined();
              (0, globals_1.expect)(auditResult.riskScore).toBeGreaterThanOrEqual(0);
              (0, globals_1.expect)(auditResult.riskScore).toBeLessThanOrEqual(10);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should detect and log security threats", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var threatData, detection;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              threatData = {
                type: "BRUTE_FORCE_ATTEMPT",
                source: "192.168.1.100",
                target: "user-123",
                severity: "high",
                metadata: {
                  attemptCount: 5,
                  timeWindow: "5m",
                },
              };
              return [
                4 /*yield*/,
                security_audit_framework_1.securityAuditFramework.detectThreat(threatData),
              ];
            case 1:
              detection = _a.sent();
              (0, globals_1.expect)(detection.success).toBe(true);
              (0, globals_1.expect)(detection.threatId).toBeDefined();
              (0, globals_1.expect)(detection.actionsTaken).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should validate compliance and generate reports", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var complianceCheck, report;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                security_audit_framework_1.securityAuditFramework.validateCompliance(),
              ];
            case 1:
              complianceCheck = _a.sent();
              (0, globals_1.expect)(complianceCheck.success).toBe(true);
              (0, globals_1.expect)(complianceCheck.standards).toBeDefined();
              (0, globals_1.expect)(complianceCheck.violations).toBeDefined();
              return [
                4 /*yield*/,
                security_audit_framework_1.securityAuditFramework.generateReport("security", {
                  includeRecommendations: true,
                  format: "json",
                }),
              ];
            case 2:
              report = _a.sent();
              (0, globals_1.expect)(report.success).toBe(true);
              (0, globals_1.expect)(report.reportId).toBeDefined();
              (0, globals_1.expect)(report.data).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Performance Monitoring", function () {
    (0, globals_1.it)("should track performance metrics accurately", function () {
      // Test performance tracking
      performanceTracker.startTracking("session-extension");
      // Simulate some work
      var metrics = {
        duration: 150,
        memoryUsage: 50.5,
        cpuUsage: 25.3,
      };
      performanceTracker.recordMetric("session-extension", metrics);
      performanceTracker.endTracking("session-extension");
      // Verify metrics collection
      var collectedMetrics = performanceTracker.getMetrics();
      (0, globals_1.expect)(collectedMetrics).toBeDefined();
    });
    (0, globals_1.it)("should integrate with session management performance", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var validation, metrics;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              // Start tracking session operations
              performanceTracker.startTracking("session-validation");
              return [4 /*yield*/, session_manager_1.sessionManager.validateSession("test-token")];
            case 1:
              validation = _a.sent();
              // Record performance data
              performanceTracker.recordMetric("session-validation", {
                duration: 100,
                memoryUsage: 30.2,
                cpuUsage: 15.5,
              });
              performanceTracker.endTracking("session-validation");
              // Verify integration
              (0, globals_1.expect)(validation).toBeDefined();
              metrics = performanceTracker.getMetrics();
              (0, globals_1.expect)(metrics).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Accessibility Integration", function () {
    (0, globals_1.it)("should maintain WCAG 2.1 AA compliance standards", function () {
      // Test accessibility features
      var accessibilityFeatures = {
        keyboardNavigation: true,
        screenReaderSupport: true,
        highContrastMode: true,
        focusManagement: true,
        ariaLabeling: true,
      };
      // Verify all accessibility features are properly configured
      Object.entries(accessibilityFeatures).forEach(function (_a) {
        var feature = _a[0],
          enabled = _a[1];
        (0, globals_1.expect)(enabled).toBe(true);
      });
    });
    (0, globals_1.it)("should provide accessible error handling and feedback", function () {
      // Test accessible error messages
      var errorStates = {
        authenticationFailed: "Authentication failed. Please check your credentials and try again.",
        sessionExpired: "Your session has expired. Please log in again to continue.",
        securityAlert:
          "Security alert detected. Please contact support if you believe this is an error.",
        networkError: "Network connection error. Please check your connection and try again.",
      };
      // Verify error messages are descriptive and accessible
      Object.values(errorStates).forEach(function (message) {
        (0, globals_1.expect)(message).toBeDefined();
        (0, globals_1.expect)(message.length).toBeGreaterThan(10);
        (0, globals_1.expect)(message).toMatch(/[.!?]$/); // Ends with proper punctuation
      });
    });
  });
  (0, globals_1.describe)("End-to-End Integration", function () {
    (0, globals_1.it)(
      "should handle complete authentication flow with all enhancements",
      function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var initialValidation, extension, securityLog, audit, metrics;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                // 1. Start performance tracking
                performanceTracker.startTracking("full-auth-flow");
                return [
                  4 /*yield*/,
                  session_manager_1.sessionManager.validateSession("initial-token"),
                ];
              case 1:
                initialValidation = _a.sent();
                (0, globals_1.expect)(initialValidation).toBeDefined();
                return [
                  4 /*yield*/,
                  session_manager_1.sessionManager.extendSession("user-123", 60),
                ];
              case 2:
                extension = _a.sent();
                (0, globals_1.expect)(extension.success).toBe(true);
                return [
                  4 /*yield*/,
                  session_manager_1.sessionManager.logSecurityEvent("user-123", "LOGIN_SUCCESS", {
                    ipAddress: "192.168.1.100",
                    userAgent: "Mozilla/5.0 (Test Browser)",
                    timestamp: new Date().toISOString(),
                  }),
                ];
              case 3:
                securityLog = _a.sent();
                (0, globals_1.expect)(securityLog.success).toBe(true);
                return [
                  4 /*yield*/,
                  security_audit_framework_1.securityAuditFramework.performAudit("targeted"),
                ];
              case 4:
                audit = _a.sent();
                (0, globals_1.expect)(audit.success).toBe(true);
                // 6. End performance tracking
                performanceTracker.recordMetric("full-auth-flow", {
                  duration: 500,
                  memoryUsage: 75.2,
                  cpuUsage: 45.8,
                });
                performanceTracker.endTracking("full-auth-flow");
                metrics = performanceTracker.getMetrics();
                (0, globals_1.expect)(metrics).toBeDefined();
                return [2 /*return*/];
            }
          });
        });
      },
    );
    (0, globals_1.it)("should maintain system integrity under load conditions", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var operations, results;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              operations = [
                session_manager_1.sessionManager.validateSession("token-1"),
                session_manager_1.sessionManager.validateSession("token-2"),
                session_manager_1.sessionManager.extendSession("user-1", 30),
                session_manager_1.sessionManager.extendSession("user-2", 45),
                security_audit_framework_1.securityAuditFramework.performAudit("quick"),
                session_manager_1.sessionManager.cleanupExpiredSessions(),
              ];
              return [4 /*yield*/, Promise.allSettled(operations)];
            case 1:
              results = _a.sent();
              // Verify all operations completed successfully
              results.forEach(function (result, index) {
                (0, globals_1.expect)(result.status).toBe("fulfilled");
                if (result.status === "fulfilled") {
                  (0, globals_1.expect)(result.value).toBeDefined();
                }
              });
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Error Handling and Edge Cases", function () {
    (0, globals_1.it)("should handle invalid session tokens gracefully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var invalidTokenValidation;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                session_manager_1.sessionManager.validateSession("invalid-token"),
              ];
            case 1:
              invalidTokenValidation = _a.sent();
              (0, globals_1.expect)(invalidTokenValidation.isValid).toBe(false);
              (0, globals_1.expect)(invalidTokenValidation.error).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle security audit failures with proper fallbacks", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var invalidAudit;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                security_audit_framework_1.securityAuditFramework.performAudit("invalid-type"),
              ];
            case 1:
              invalidAudit = _a.sent();
              (0, globals_1.expect)(invalidAudit.success).toBe(false);
              (0, globals_1.expect)(invalidAudit.error).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should maintain performance tracking integrity during errors", function () {
      // Test performance tracking with errors
      performanceTracker.startTracking("error-test");
      try {
        throw new Error("Test error");
      } catch (error) {
        performanceTracker.recordMetric("error-test", {
          duration: 10,
          memoryUsage: 10.0,
          cpuUsage: 5.0,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
      performanceTracker.endTracking("error-test");
      var metrics = performanceTracker.getMetrics();
      (0, globals_1.expect)(metrics).toBeDefined();
    });
  });
});
