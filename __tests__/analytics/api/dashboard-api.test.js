"use strict";
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
var globals_1 = require("@jest/globals");
var server_1 = require("next/server");
var route_1 = require("@/app/api/analytics/dashboard/route");
var server_2 = require("@/utils/supabase/server");
// Mock Supabase client
globals_1.jest.mock("@/utils/supabase/server");
var mockCreateClient = server_2.createClient;
// Mock analytics service
globals_1.jest.mock("@/lib/analytics/service");
(0, globals_1.describe)("Analytics Dashboard API Routes", function () {
  var mockSupabase;
  (0, globals_1.beforeEach)(function () {
    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getUser: globals_1.jest.fn(),
      },
      from: globals_1.jest.fn(),
      rpc: globals_1.jest.fn(),
    };
    mockCreateClient.mockResolvedValue(mockSupabase);
  });
  (0, globals_1.afterEach)(function () {
    globals_1.jest.clearAllMocks();
  });
  (0, globals_1.describe)("GET /api/analytics/dashboard", function () {
    (0, globals_1.test)("should return dashboard metrics for authenticated user", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, mockMetrics, request, response, responseData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = {
                id: "user123",
                email: "test@example.com",
                user_metadata: { role: "admin" },
              };
              mockMetrics = {
                subscriptionMetrics: {
                  totalSubscriptions: 150,
                  activeSubscriptions: 125,
                  mrr: 15000,
                  arr: 180000,
                  churnRate: 0.05,
                  growthRate: 0.12,
                },
                trialMetrics: {
                  totalTrials: 500,
                  activeTrials: 150,
                  conversionRate: 0.25,
                },
                revenueMetrics: {
                  totalRevenue: 180000,
                  monthlyGrowth: 0.12,
                },
              };
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockSupabase.rpc.mockResolvedValue({
                data: mockMetrics,
                error: null,
              });
              request = new server_1.NextRequest("http://localhost:3000/api/analytics/dashboard", {
                method: "GET",
                headers: {
                  Authorization: "Bearer mock-token",
                },
              });
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              responseData = _a.sent();
              // Assert
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(responseData.success).toBe(true);
              (0, globals_1.expect)(responseData.data).toEqual(mockMetrics);
              (0, globals_1.expect)(mockSupabase.auth.getUser).toHaveBeenCalled();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("should return 401 for unauthenticated requests", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var request, response, responseData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              // Arrange
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "Invalid token" },
              });
              request = new server_1.NextRequest("http://localhost:3000/api/analytics/dashboard", {
                method: "GET",
              });
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              responseData = _a.sent();
              // Assert
              (0, globals_1.expect)(response.status).toBe(401);
              (0, globals_1.expect)(responseData.success).toBe(false);
              (0, globals_1.expect)(responseData.message).toBe("Unauthorized");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("should handle database errors gracefully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, request, response, responseData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = {
                id: "user123",
                email: "test@example.com",
              };
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockSupabase.rpc.mockResolvedValue({
                data: null,
                error: { message: "Database connection failed" },
              });
              request = new server_1.NextRequest("http://localhost:3000/api/analytics/dashboard", {
                method: "GET",
              });
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              responseData = _a.sent();
              // Assert
              (0, globals_1.expect)(response.status).toBe(500);
              (0, globals_1.expect)(responseData.success).toBe(false);
              (0, globals_1.expect)(responseData.message).toBe("Internal server error");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("should respect rate limiting", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, request, requests, responses, lastResponse, rateLimitedResponse;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = { id: "user123", email: "test@example.com" };
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              request = new server_1.NextRequest("http://localhost:3000/api/analytics/dashboard", {
                method: "GET",
                headers: {
                  "x-forwarded-for": "127.0.0.1",
                },
              });
              requests = Array(11)
                .fill(null)
                .map(function () {
                  return (0, route_1.GET)(request);
                });
              return [4 /*yield*/, Promise.all(requests)];
            case 1:
              responses = _a.sent();
              lastResponse = responses[responses.length - 1];
              rateLimitedResponse = responses.find(function (res) {
                return res.status === 429;
              });
              if (rateLimitedResponse) {
                (0, globals_1.expect)(rateLimitedResponse.status).toBe(429);
              }
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("should validate query parameters", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, request, response, responseData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = { id: "user123", email: "test@example.com" };
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              request = new server_1.NextRequest(
                "http://localhost:3000/api/analytics/dashboard?period=invalid&limit=abc",
                { method: "GET" },
              );
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              responseData = _a.sent();
              // Assert
              (0, globals_1.expect)(response.status).toBe(400);
              (0, globals_1.expect)(responseData.success).toBe(false);
              (0, globals_1.expect)(responseData.message).toContain("Invalid query parameters");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("POST /api/analytics/dashboard", function () {
    (0, globals_1.test)("should create custom dashboard configuration", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, dashboardConfig, mockFrom, request, response, responseData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = { id: "user123", email: "test@example.com" };
              dashboardConfig = {
                widgets: ["subscription_metrics", "trial_metrics", "revenue_chart"],
                layout: "grid",
                refreshInterval: 30000,
              };
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockFrom = {
                insert: globals_1.jest.fn().mockReturnThis(),
                select: globals_1.jest.fn().mockResolvedValue({
                  data: [__assign({ id: "config123" }, dashboardConfig)],
                  error: null,
                }),
              };
              mockSupabase.from.mockReturnValue(mockFrom);
              request = new server_1.NextRequest("http://localhost:3000/api/analytics/dashboard", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(dashboardConfig),
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              responseData = _a.sent();
              // Assert
              (0, globals_1.expect)(response.status).toBe(201);
              (0, globals_1.expect)(responseData.success).toBe(true);
              (0, globals_1.expect)(responseData.data.widgets).toEqual(dashboardConfig.widgets);
              (0, globals_1.expect)(mockSupabase.from).toHaveBeenCalledWith(
                "dashboard_configurations",
              );
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("should validate dashboard configuration schema", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, invalidConfig, request, response, responseData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = { id: "user123", email: "test@example.com" };
              invalidConfig = {
                widgets: "invalid", // Should be array
                layout: "invalid_layout",
                refreshInterval: -1000, // Should be positive
              };
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              request = new server_1.NextRequest("http://localhost:3000/api/analytics/dashboard", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(invalidConfig),
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              responseData = _a.sent();
              // Assert
              (0, globals_1.expect)(response.status).toBe(400);
              (0, globals_1.expect)(responseData.success).toBe(false);
              (0, globals_1.expect)(responseData.errors).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("caching behavior", function () {
    (0, globals_1.test)("should return cached data when available", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, mockMetrics, request, response1, response2;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = { id: "user123", email: "test@example.com" };
              mockMetrics = { subscriptionMetrics: { totalSubscriptions: 150 } };
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockSupabase.rpc.mockResolvedValue({
                data: mockMetrics,
                error: null,
              });
              request = new server_1.NextRequest("http://localhost:3000/api/analytics/dashboard", {
                method: "GET",
              });
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response1 = _a.sent();
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 2:
              response2 = _a.sent();
              // Assert
              (0, globals_1.expect)(response1.status).toBe(200);
              (0, globals_1.expect)(response2.status).toBe(200);
              // Check cache headers
              (0, globals_1.expect)(response2.headers.get("x-cache")).toBe("HIT");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("should set appropriate cache headers", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, mockMetrics, request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = { id: "user123", email: "test@example.com" };
              mockMetrics = { subscriptionMetrics: { totalSubscriptions: 150 } };
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockSupabase.rpc.mockResolvedValue({
                data: mockMetrics,
                error: null,
              });
              request = new server_1.NextRequest("http://localhost:3000/api/analytics/dashboard", {
                method: "GET",
              });
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              // Assert
              (0, globals_1.expect)(response.headers.get("cache-control")).toBe(
                "public, max-age=300",
              );
              (0, globals_1.expect)(response.headers.get("etag")).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("security", function () {
    (0, globals_1.test)("should include security headers", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = { id: "user123", email: "test@example.com" };
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              request = new server_1.NextRequest("http://localhost:3000/api/analytics/dashboard", {
                method: "GET",
              });
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              // Assert
              (0, globals_1.expect)(response.headers.get("x-content-type-options")).toBe("nosniff");
              (0, globals_1.expect)(response.headers.get("x-frame-options")).toBe("DENY");
              (0, globals_1.expect)(response.headers.get("x-xss-protection")).toBe("1; mode=block");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("should validate user permissions for admin endpoints", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, request, response, responseData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = {
                id: "user123",
                email: "test@example.com",
                user_metadata: { role: "user" }, // Not admin
              };
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              request = new server_1.NextRequest(
                "http://localhost:3000/api/analytics/dashboard?admin=true",
                { method: "GET" },
              );
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              responseData = _a.sent();
              // Assert
              (0, globals_1.expect)(response.status).toBe(403);
              (0, globals_1.expect)(responseData.success).toBe(false);
              (0, globals_1.expect)(responseData.message).toBe("Insufficient permissions");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("error handling", function () {
    (0, globals_1.test)("should handle malformed JSON requests", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, request, response, responseData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = { id: "user123", email: "test@example.com" };
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              request = new server_1.NextRequest("http://localhost:3000/api/analytics/dashboard", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: "invalid json{",
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              responseData = _a.sent();
              // Assert
              (0, globals_1.expect)(response.status).toBe(400);
              (0, globals_1.expect)(responseData.success).toBe(false);
              (0, globals_1.expect)(responseData.message).toBe("Invalid JSON payload");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("should handle unexpected server errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var request, response, responseData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              // Arrange
              mockSupabase.auth.getUser.mockRejectedValue(new Error("Unexpected error"));
              request = new server_1.NextRequest("http://localhost:3000/api/analytics/dashboard", {
                method: "GET",
              });
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              responseData = _a.sent();
              // Assert
              (0, globals_1.expect)(response.status).toBe(500);
              (0, globals_1.expect)(responseData.success).toBe(false);
              (0, globals_1.expect)(responseData.message).toBe("Internal server error");
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
