"use strict";
/**
 * Notification API Tests
 *
 * Suíte de testes para API de notificações
 * incluindo envio, status, analytics e compliance.
 *
 * @author APEX QA Team
 * @version 1.0.0
 */
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
var route_1 = require("@/app/api/notifications/send/route");
var route_2 = require("@/app/api/notifications/status/route");
var route_3 = require("@/app/api/notifications/analytics/route");
// Mock NextRequest for testing
var MockNextRequest = /** @class */ (function () {
  function MockNextRequest(url, init) {
    this.url = url;
    this.method = (init === null || init === void 0 ? void 0 : init.method) || "GET";
    this.headers = new Headers(init === null || init === void 0 ? void 0 : init.headers);
    this.body = init === null || init === void 0 ? void 0 : init.body;
    this.nextUrl = new URL(url);
  }
  MockNextRequest.prototype.json = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.body ? JSON.parse(this.body) : {}];
      });
    });
  };
  MockNextRequest.prototype.text = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.body || ""];
      });
    });
  };
  MockNextRequest.prototype.clone = function () {
    return new MockNextRequest(this.url, {
      method: this.method,
      headers: this.headers,
      body: this.body,
    });
  };
  return MockNextRequest;
})();
var NextRequest = MockNextRequest;
// ================================================================================
// MOCKS
// ================================================================================
// Mock Supabase
globals_1.jest.mock("@/app/utils/supabase/server", function () {
  return {
    createClient: globals_1.jest.fn(function () {
      return {
        auth: {
          getSession: globals_1.jest.fn().mockResolvedValue({
            data: { session: { user: { id: "test-user-id" } } },
            error: null,
          }),
          getUser: globals_1.jest.fn().mockResolvedValue({
            data: { user: { id: "test-user-id", email: "test@test.com" } },
            error: null,
          }),
        },
        from: globals_1.jest.fn(function () {
          return {
            select: globals_1.jest.fn().mockReturnThis(),
            eq: globals_1.jest.fn().mockReturnThis(),
            single: globals_1.jest.fn().mockResolvedValue({
              data: {
                id: "test-user-id",
                clinic_id: "test-clinic-id",
                role: "admin",
                permissions: ["send_notifications", "view_analytics"],
              },
            }),
            order: globals_1.jest.fn().mockReturnThis(),
            range: globals_1.jest.fn().mockResolvedValue({
              data: [],
              error: null,
              count: 0,
            }),
          };
        }),
      };
    }),
  };
});
// Mock Notification Manager
globals_1.jest.mock("@/lib/notifications/core/notification-manager", function () {
  return {
    notificationManager: {
      sendNotification: globals_1.jest.fn().mockResolvedValue({
        id: "test-notification-id",
        status: "sent",
      }),
    },
  };
});
// Mock ML Engine
globals_1.jest.mock("@/lib/notifications/ml/optimization-engine", function () {
  return {
    notificationMLEngine: {
      optimizeForUser: globals_1.jest.fn().mockResolvedValue({
        optimizations: {
          channel: { recommended: "email", confidence: 0.9 },
          timing: { recommended: new Date(), confidence: 0.8 },
          content: { personalizedContent: "Optimized content", confidence: 0.85 },
        },
        modelVersions: { channel: "1.0", timing: "1.1", content: "1.2" },
      }),
    },
  };
});
// Mock Compliance Engine
globals_1.jest.mock("@/lib/notifications/compliance/compliance-engine", function () {
  return {
    notificationComplianceEngine: {
      validateLGPDCompliance: globals_1.jest.fn().mockResolvedValue({
        violations: [],
        recommendations: [],
      }),
      validateMedicalCompliance: globals_1.jest.fn().mockResolvedValue({
        violations: [],
        recommendations: [],
      }),
    },
  };
});
// Mock Analytics
globals_1.jest.mock("@/lib/notifications/analytics/notification-analytics", function () {
  return {
    notificationAnalytics: {
      getOverviewMetrics: globals_1.jest.fn().mockResolvedValue({
        total: 100,
        sent: 95,
        delivered: 90,
        failed: 5,
        pending: 5,
        deliveryRate: 94.7,
        engagementRate: 78.5,
      }),
      getPerformanceMetrics: globals_1.jest.fn().mockResolvedValue({
        averageDeliveryTime: 120,
        successRate: 94.7,
        channelPerformance: {},
      }),
      getEngagementMetrics: globals_1.jest.fn().mockResolvedValue({
        openRate: 45.2,
        clickRate: 12.8,
        unsubscribeRate: 0.5,
      }),
      getChannelAnalytics: globals_1.jest.fn().mockResolvedValue({
        email: { sent: 50, delivered: 48, rate: 96 },
        sms: { sent: 30, delivered: 29, rate: 96.7 },
      }),
      getTrendAnalysis: globals_1.jest.fn().mockResolvedValue({
        daily: [],
        weekly: [],
        trends: {},
      }),
    },
  };
});
// ================================================================================
// TEST UTILITIES
// ================================================================================
function createMockRequest(method, body, searchParams) {
  var url = searchParams
    ? "http://localhost:3000/api/notifications/send?".concat(new URLSearchParams(searchParams))
    : "http://localhost:3000/api/notifications/send";
  return new NextRequest(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}
// ================================================================================
// SEND ENDPOINT TESTS
// ================================================================================
describe("/api/notifications/send", function () {
  beforeEach(function () {
    globals_1.jest.clearAllMocks();
  });
  describe("POST - Single Notification", function () {
    it("should send notification successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var validPayload, request, response, data;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              validPayload = {
                userId: "test-user-id",
                clinicId: "test-clinic-id",
                type: "appointment_reminder",
                title: "Test Notification",
                content: "This is a test notification",
                channels: ["email"],
                priority: "normal",
                enableMLOptimization: true,
              };
              request = createMockRequest("POST", validPayload);
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(200);
              expect(data.success).toBe(true);
              expect(data.notificationId).toBe("test-notification-id");
              expect(data.optimizations).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
    it("should validate required fields", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var invalidPayload, request, response, data;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              invalidPayload = {
                userId: "test-user-id",
                // Missing required fields
              };
              request = createMockRequest("POST", invalidPayload);
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(400);
              expect(data.error).toBe("Dados inválidos");
              expect(data.details).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
    it("should enforce clinic authorization", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var unauthorizedPayload, request, response, data;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              unauthorizedPayload = {
                userId: "test-user-id",
                clinicId: "unauthorized-clinic-id",
                type: "appointment_reminder",
                title: "Test",
                content: "Test",
                channels: ["email"],
              };
              request = createMockRequest("POST", unauthorizedPayload);
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(403);
              expect(data.error).toBe("Usuário não autorizado para esta clínica");
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle compliance violations", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var notificationComplianceEngine, payload, request, response, data;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              notificationComplianceEngine =
                require("@/lib/notifications/compliance/compliance-engine").notificationComplianceEngine;
              notificationComplianceEngine.validateLGPDCompliance.mockResolvedValueOnce({
                violations: [{ severity: "critical", message: "No consent" }],
                recommendations: [],
              });
              payload = {
                userId: "test-user-id",
                clinicId: "test-clinic-id",
                type: "promotional",
                title: "Test",
                content: "Test",
                channels: ["email"],
              };
              request = createMockRequest("POST", payload);
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(422);
              expect(data.error).toContain("compliance");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("PUT - Bulk Notifications", function () {
    it("should process bulk notifications successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var bulkPayload, request, response, data;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              bulkPayload = {
                clinicId: "test-clinic-id",
                notifications: [
                  {
                    userId: "user-1",
                    clinicId: "test-clinic-id",
                    type: "promotional",
                    title: "Bulk Test 1",
                    content: "Content 1",
                    channels: ["email"],
                  },
                  {
                    userId: "user-2",
                    clinicId: "test-clinic-id",
                    type: "promotional",
                    title: "Bulk Test 2",
                    content: "Content 2",
                    channels: ["sms"],
                  },
                ],
                batchOptions: {
                  delay: 100,
                  stopOnError: false,
                },
              };
              request = createMockRequest("PUT", bulkPayload);
              return [4 /*yield*/, (0, route_1.PUT)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(200);
              expect(data.success).toBe(true);
              expect(data.summary.total).toBe(2);
              expect(data.results).toHaveLength(2);
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle bulk validation errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var invalidBulkPayload, request, response, data;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              invalidBulkPayload = {
                clinicId: "test-clinic-id",
                notifications: [], // Empty array
              };
              request = createMockRequest("PUT", invalidBulkPayload);
              return [4 /*yield*/, (0, route_1.PUT)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(400);
              expect(data.error).toBe("Dados inválidos para envio em lote");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("GET - Configuration Info", function () {
    it("should return configuration information", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var request, response, data;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              request = createMockRequest("GET");
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(200);
              expect(data.limits).toBeDefined();
              expect(data.features).toBeDefined();
              expect(data.clinic).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
// ================================================================================
// STATUS ENDPOINT TESTS
// ================================================================================
describe("/api/notifications/status", function () {
  beforeEach(function () {
    globals_1.jest.clearAllMocks();
  });
  it("should return notification status list", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var request, response, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            request = createMockRequest("GET", null, { limit: "10", offset: "0" });
            return [4 /*yield*/, (0, route_2.GET)(request)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            expect(response.status).toBe(200);
            expect(data.notifications).toBeDefined();
            expect(data.pagination).toBeDefined();
            return [2 /*return*/];
        }
      });
    });
  });
  it("should validate query parameters", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var request, response, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            request = createMockRequest("GET", null, { limit: "2000" });
            return [4 /*yield*/, (0, route_2.GET)(request)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            expect(response.status).toBe(400);
            expect(data.error).toBe("Parâmetros inválidos");
            return [2 /*return*/];
        }
      });
    });
  });
  it("should filter by notification ID", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var testId, request, response, mockSupabase;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            testId = "test-notification-id";
            request = createMockRequest("GET", null, { id: testId });
            return [4 /*yield*/, (0, route_2.GET)(request)];
          case 1:
            response = _a.sent();
            expect(response.status).toBe(200);
            mockSupabase = require("@/app/utils/supabase/server").createClient();
            expect(mockSupabase.from().eq).toHaveBeenCalledWith("id", testId);
            return [2 /*return*/];
        }
      });
    });
  });
});
// ================================================================================
// ANALYTICS ENDPOINT TESTS
// ================================================================================
describe("/api/notifications/analytics", function () {
  beforeEach(function () {
    globals_1.jest.clearAllMocks();
  });
  it("should return overview analytics", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var request, response, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            request = createMockRequest("GET", null, {
              metric: "overview",
              period: "week",
            });
            return [4 /*yield*/, (0, route_3.GET)(request)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.metric).toBe("overview");
            expect(data.data.total).toBe(100);
            return [2 /*return*/];
        }
      });
    });
  });
  it("should return performance analytics", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var request, response, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            request = createMockRequest("GET", null, {
              metric: "performance",
              period: "month",
            });
            return [4 /*yield*/, (0, route_3.GET)(request)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            expect(response.status).toBe(200);
            expect(data.data.averageDeliveryTime).toBeDefined();
            return [2 /*return*/];
        }
      });
    });
  });
  it("should return engagement analytics", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var request, response, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            request = createMockRequest("GET", null, {
              metric: "engagement",
              period: "week",
            });
            return [4 /*yield*/, (0, route_3.GET)(request)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            expect(response.status).toBe(200);
            expect(data.data.openRate).toBeDefined();
            expect(data.data.clickRate).toBeDefined();
            return [2 /*return*/];
        }
      });
    });
  });
  it("should validate metric parameter", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var request, response, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            request = createMockRequest("GET", null, {
              metric: "invalid_metric",
            });
            return [4 /*yield*/, (0, route_3.GET)(request)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            expect(response.status).toBe(400);
            expect(data.error).toBe("Parâmetros inválidos");
            return [2 /*return*/];
        }
      });
    });
  });
  it("should handle date range parameters", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var dateFrom, dateTo, request, response, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            dateFrom = "2024-01-01T00:00:00Z";
            dateTo = "2024-01-07T23:59:59Z";
            request = createMockRequest("GET", null, {
              metric: "trends",
              dateFrom: dateFrom,
              dateTo: dateTo,
            });
            return [4 /*yield*/, (0, route_3.GET)(request)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            expect(response.status).toBe(200);
            expect(data.period.from).toBe(dateFrom);
            expect(data.period.to).toBe(dateTo);
            return [2 /*return*/];
        }
      });
    });
  });
});
// ================================================================================
// INTEGRATION TESTS
// ================================================================================
describe("Integration Tests", function () {
  it("should handle complete notification workflow", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var sendPayload,
        sendRequest,
        sendResponse,
        sendData,
        statusRequest,
        statusResponse,
        analyticsRequest,
        analyticsResponse;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            sendPayload = {
              userId: "test-user-id",
              clinicId: "test-clinic-id",
              type: "appointment_reminder",
              title: "Integration Test",
              content: "Testing complete workflow",
              channels: ["email"],
              priority: "normal",
            };
            sendRequest = createMockRequest("POST", sendPayload);
            return [4 /*yield*/, (0, route_1.POST)(sendRequest)];
          case 1:
            sendResponse = _a.sent();
            return [4 /*yield*/, sendResponse.json()];
          case 2:
            sendData = _a.sent();
            expect(sendResponse.status).toBe(200);
            expect(sendData.notificationId).toBeDefined();
            statusRequest = createMockRequest("GET", null, {
              id: sendData.notificationId,
            });
            return [4 /*yield*/, (0, route_2.GET)(statusRequest)];
          case 3:
            statusResponse = _a.sent();
            expect(statusResponse.status).toBe(200);
            analyticsRequest = createMockRequest("GET", null, {
              metric: "overview",
            });
            return [4 /*yield*/, (0, route_3.GET)(analyticsRequest)];
          case 4:
            analyticsResponse = _a.sent();
            expect(analyticsResponse.status).toBe(200);
            return [2 /*return*/];
        }
      });
    });
  });
});
// ================================================================================
// PERFORMANCE TESTS
// ================================================================================
describe("Performance Tests", function () {
  it("should handle bulk notifications within time limit", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var startTime, bulkPayload, request, response, endTime, duration;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            bulkPayload = {
              clinicId: "test-clinic-id",
              notifications: Array.from({ length: 100 }, function (_, i) {
                return {
                  userId: "user-".concat(i),
                  clinicId: "test-clinic-id",
                  type: "promotional",
                  title: "Bulk Test ".concat(i),
                  content: "Content ".concat(i),
                  channels: ["email"],
                };
              }),
            };
            request = createMockRequest("PUT", bulkPayload);
            return [4 /*yield*/, (0, route_1.PUT)(request)];
          case 1:
            response = _a.sent();
            endTime = Date.now();
            duration = endTime - startTime;
            expect(response.status).toBe(200);
            expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
            return [2 /*return*/];
        }
      });
    });
  });
  it("should handle analytics queries efficiently", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var startTime, request, response, endTime, duration;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            request = createMockRequest("GET", null, {
              metric: "overview",
              period: "year", // Large dataset
            });
            return [4 /*yield*/, (0, route_3.GET)(request)];
          case 1:
            response = _a.sent();
            endTime = Date.now();
            duration = endTime - startTime;
            expect(response.status).toBe(200);
            expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
            return [2 /*return*/];
        }
      });
    });
  });
});
// ================================================================================
// ERROR HANDLING TESTS
// ================================================================================
describe("Error Handling", function () {
  it("should handle database connection errors gracefully", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var mockSupabase, request, response;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            mockSupabase = require("@/app/utils/supabase/server").createClient();
            mockSupabase.auth.getSession.mockRejectedValueOnce(
              new Error("Database connection failed"),
            );
            request = createMockRequest("POST", {
              userId: "test-user-id",
              clinicId: "test-clinic-id",
              type: "system",
              title: "Test",
              content: "Test",
              channels: ["email"],
            });
            return [4 /*yield*/, (0, route_1.POST)(request)];
          case 1:
            response = _a.sent();
            expect(response.status).toBe(500);
            return [2 /*return*/];
        }
      });
    });
  });
  it("should handle ML engine failures gracefully", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var notificationMLEngine, request, response, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            notificationMLEngine =
              require("@/lib/notifications/ml/optimization-engine").notificationMLEngine;
            notificationMLEngine.optimizeForUser.mockRejectedValueOnce(
              new Error("ML service unavailable"),
            );
            request = createMockRequest("POST", {
              userId: "test-user-id",
              clinicId: "test-clinic-id",
              type: "informational",
              title: "Test",
              content: "Test",
              channels: ["email"],
              enableMLOptimization: true,
            });
            return [4 /*yield*/, (0, route_1.POST)(request)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            // Should still succeed without ML optimization
            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            return [2 /*return*/];
        }
      });
    });
  });
  it("should handle compliance engine failures", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var notificationComplianceEngine, request, response;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            notificationComplianceEngine =
              require("@/lib/notifications/compliance/compliance-engine").notificationComplianceEngine;
            notificationComplianceEngine.validateLGPDCompliance.mockRejectedValueOnce(
              new Error("Compliance service error"),
            );
            request = createMockRequest("POST", {
              userId: "test-user-id",
              clinicId: "test-clinic-id",
              type: "promotional",
              title: "Test",
              content: "Test",
              channels: ["email"],
              skipComplianceCheck: false,
            });
            return [4 /*yield*/, (0, route_1.POST)(request)];
          case 1:
            response = _a.sent();
            expect(response.status).toBe(500);
            return [2 /*return*/];
        }
      });
    });
  });
});
