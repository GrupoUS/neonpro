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
var route_1 = require("@/app/api/export/route");
var server_2 = require("@/utils/supabase/server");
// Mock Supabase client
globals_1.jest.mock("@/utils/supabase/server");
var mockCreateClient = server_2.createClient;
// Mock file system operations
globals_1.jest.mock("fs/promises");
globals_1.jest.mock("path");
// Mock jsPDF and xlsx
globals_1.jest.mock("jspdf", function () {
  return {
    __esModule: true,
    default: globals_1.jest.fn().mockImplementation(function () {
      return {
        text: globals_1.jest.fn(),
        addPage: globals_1.jest.fn(),
        save: globals_1.jest.fn(),
        output: globals_1.jest.fn().mockReturnValue("mock-pdf-data"),
      };
    }),
  };
});
globals_1.jest.mock("xlsx", function () {
  return {
    utils: {
      json_to_sheet: globals_1.jest.fn().mockReturnValue({}),
      book_new: globals_1.jest.fn().mockReturnValue({}),
      book_append_sheet: globals_1.jest.fn(),
      sheet_to_csv: globals_1.jest.fn().mockReturnValue("mock,csv,data"),
    },
    write: globals_1.jest.fn().mockReturnValue("mock-xlsx-data"),
  };
});
(0, globals_1.describe)("Export API Routes", function () {
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
  (0, globals_1.describe)("GET /api/export", function () {
    (0, globals_1.test)("should export subscription data as CSV", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, mockSubscriptions, mockFrom, request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = {
                id: "user123",
                email: "test@example.com",
                user_metadata: { role: "admin" },
              };
              mockSubscriptions = [
                {
                  id: "sub_123",
                  user_id: "user_456",
                  plan_id: "plan_basic",
                  status: "active",
                  created_at: "2024-01-01T00:00:00Z",
                  current_period_start: "2024-01-01T00:00:00Z",
                  current_period_end: "2024-02-01T00:00:00Z",
                  amount: 2900,
                  currency: "usd",
                },
              ];
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockFrom = {
                select: globals_1.jest.fn().mockReturnThis(),
                eq: globals_1.jest.fn().mockReturnThis(),
                gte: globals_1.jest.fn().mockReturnThis(),
                lte: globals_1.jest.fn().mockReturnThis(),
                order: globals_1.jest.fn().mockResolvedValue({
                  data: mockSubscriptions,
                  error: null,
                }),
              };
              mockSupabase.from.mockReturnValue(mockFrom);
              request = new server_1.NextRequest(
                "http://localhost:3000/api/export?type=subscriptions&format=csv",
                { method: "GET" },
              );
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              // Assert
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(response.headers.get("content-type")).toBe("text/csv");
              (0, globals_1.expect)(response.headers.get("content-disposition")).toContain(
                "attachment",
              );
              (0, globals_1.expect)(mockSupabase.from).toHaveBeenCalledWith("subscriptions");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("should export analytics data as PDF", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, mockAnalytics, request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = {
                id: "user123",
                email: "test@example.com",
                user_metadata: { role: "admin" },
              };
              mockAnalytics = {
                subscriptionMetrics: {
                  totalSubscriptions: 150,
                  activeSubscriptions: 125,
                  mrr: 15000,
                },
                trialMetrics: {
                  totalTrials: 500,
                  conversionRate: 0.25,
                },
              };
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockSupabase.rpc.mockResolvedValue({
                data: mockAnalytics,
                error: null,
              });
              request = new server_1.NextRequest(
                "http://localhost:3000/api/export?type=analytics&format=pdf",
                { method: "GET" },
              );
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              // Assert
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(response.headers.get("content-type")).toBe("application/pdf");
              (0, globals_1.expect)(response.headers.get("content-disposition")).toContain(
                "attachment",
              );
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("should export trial data as Excel", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, mockTrials, mockFrom, request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = {
                id: "user123",
                email: "test@example.com",
                user_metadata: { role: "admin" },
              };
              mockTrials = [
                {
                  id: "trial_123",
                  user_id: "user_456",
                  plan_id: "plan_premium",
                  status: "active",
                  started_at: "2024-01-01T00:00:00Z",
                  expires_at: "2024-01-15T00:00:00Z",
                  converted: false,
                },
              ];
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockFrom = {
                select: globals_1.jest.fn().mockReturnThis(),
                eq: globals_1.jest.fn().mockReturnThis(),
                gte: globals_1.jest.fn().mockReturnThis(),
                lte: globals_1.jest.fn().mockReturnThis(),
                order: globals_1.jest.fn().mockResolvedValue({
                  data: mockTrials,
                  error: null,
                }),
              };
              mockSupabase.from.mockReturnValue(mockFrom);
              request = new server_1.NextRequest(
                "http://localhost:3000/api/export?type=trials&format=xlsx",
                { method: "GET" },
              );
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              // Assert
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(response.headers.get("content-type")).toBe(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              );
              (0, globals_1.expect)(response.headers.get("content-disposition")).toContain(
                "attachment",
              );
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
              request = new server_1.NextRequest(
                "http://localhost:3000/api/export?type=subscriptions&format=csv",
                { method: "GET" },
              );
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
    (0, globals_1.test)("should return 403 for non-admin users", function () {
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
                "http://localhost:3000/api/export?type=subscriptions&format=csv",
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
    (0, globals_1.test)("should validate query parameters", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, request, response, responseData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = {
                id: "user123",
                email: "test@example.com",
                user_metadata: { role: "admin" },
              };
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              request = new server_1.NextRequest(
                "http://localhost:3000/api/export?type=invalid&format=unknown",
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
              (0, globals_1.expect)(responseData.message).toContain(
                "Invalid export type or format",
              );
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("should handle date range filters", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, mockFrom, request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = {
                id: "user123",
                email: "test@example.com",
                user_metadata: { role: "admin" },
              };
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockFrom = {
                select: globals_1.jest.fn().mockReturnThis(),
                gte: globals_1.jest.fn().mockReturnThis(),
                lte: globals_1.jest.fn().mockReturnThis(),
                order: globals_1.jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              };
              mockSupabase.from.mockReturnValue(mockFrom);
              request = new server_1.NextRequest(
                "http://localhost:3000/api/export?type=subscriptions&format=csv&start_date=2024-01-01&end_date=2024-01-31",
                { method: "GET" },
              );
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              // Assert
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(mockFrom.gte).toHaveBeenCalledWith("created_at", "2024-01-01");
              (0, globals_1.expect)(mockFrom.lte).toHaveBeenCalledWith("created_at", "2024-01-31");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("should handle database errors gracefully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, mockFrom, request, response, responseData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = {
                id: "user123",
                email: "test@example.com",
                user_metadata: { role: "admin" },
              };
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockFrom = {
                select: globals_1.jest.fn().mockReturnThis(),
                order: globals_1.jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: "Database connection failed" },
                }),
              };
              mockSupabase.from.mockReturnValue(mockFrom);
              request = new server_1.NextRequest(
                "http://localhost:3000/api/export?type=subscriptions&format=csv",
                { method: "GET" },
              );
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              responseData = _a.sent();
              // Assert
              (0, globals_1.expect)(response.status).toBe(500);
              (0, globals_1.expect)(responseData.success).toBe(false);
              (0, globals_1.expect)(responseData.message).toBe("Export failed");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("POST /api/export", function () {
    (0, globals_1.test)("should schedule bulk export job", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, exportRequest, mockFrom, request, response, responseData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = {
                id: "user123",
                email: "test@example.com",
                user_metadata: { role: "admin" },
              };
              exportRequest = {
                types: ["subscriptions", "trials", "analytics"],
                format: "csv",
                dateRange: {
                  start: "2024-01-01",
                  end: "2024-01-31",
                },
                email: "admin@example.com",
              };
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockFrom = {
                insert: globals_1.jest.fn().mockReturnThis(),
                select: globals_1.jest.fn().mockResolvedValue({
                  data: [{ id: "job_123", status: "queued" }],
                  error: null,
                }),
              };
              mockSupabase.from.mockReturnValue(mockFrom);
              request = new server_1.NextRequest("http://localhost:3000/api/export", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(exportRequest),
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              responseData = _a.sent();
              // Assert
              (0, globals_1.expect)(response.status).toBe(202);
              (0, globals_1.expect)(responseData.success).toBe(true);
              (0, globals_1.expect)(responseData.data.jobId).toBe("job_123");
              (0, globals_1.expect)(responseData.data.status).toBe("queued");
              (0, globals_1.expect)(mockSupabase.from).toHaveBeenCalledWith("export_jobs");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("should validate bulk export request", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, invalidRequest, request, response, responseData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = {
                id: "user123",
                email: "test@example.com",
                user_metadata: { role: "admin" },
              };
              invalidRequest = {
                types: [], // Empty array
                format: "invalid",
                email: "invalid-email",
              };
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              request = new server_1.NextRequest("http://localhost:3000/api/export", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(invalidRequest),
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
  (0, globals_1.describe)("performance and limits", function () {
    (0, globals_1.test)("should respect export size limits", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, largeDataset, mockFrom, request, response, responseData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = {
                id: "user123",
                email: "test@example.com",
                user_metadata: { role: "admin" },
              };
              largeDataset = Array(100000)
                .fill(null)
                .map(function (_, i) {
                  return {
                    id: "sub_".concat(i),
                    user_id: "user_".concat(i),
                    status: "active",
                  };
                });
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockFrom = {
                select: globals_1.jest.fn().mockReturnThis(),
                order: globals_1.jest.fn().mockResolvedValue({
                  data: largeDataset,
                  error: null,
                }),
              };
              mockSupabase.from.mockReturnValue(mockFrom);
              request = new server_1.NextRequest(
                "http://localhost:3000/api/export?type=subscriptions&format=csv",
                { method: "GET" },
              );
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              responseData = _a.sent();
              // Assert
              (0, globals_1.expect)(response.status).toBe(413);
              (0, globals_1.expect)(responseData.success).toBe(false);
              (0, globals_1.expect)(responseData.message).toBe("Export size exceeds limit");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("should handle concurrent export requests", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, mockFrom, requests, responses;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = {
                id: "user123",
                email: "test@example.com",
                user_metadata: { role: "admin" },
              };
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockFrom = {
                select: globals_1.jest.fn().mockReturnThis(),
                order: globals_1.jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              };
              mockSupabase.from.mockReturnValue(mockFrom);
              requests = Array(5)
                .fill(null)
                .map(function () {
                  return new server_1.NextRequest(
                    "http://localhost:3000/api/export?type=subscriptions&format=csv",
                    { method: "GET" },
                  );
                });
              return [
                4 /*yield*/,
                Promise.all(
                  requests.map(function (request) {
                    return (0, route_1.GET)(request);
                  }),
                ),
              ];
            case 1:
              responses = _a.sent();
              // Assert
              responses.forEach(function (response) {
                (0, globals_1.expect)([200, 429]).toContain(response.status);
              });
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("should compress large exports", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockUser, moderateDataset, mockFrom, request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUser = {
                id: "user123",
                email: "test@example.com",
                user_metadata: { role: "admin" },
              };
              moderateDataset = Array(5000)
                .fill(null)
                .map(function (_, i) {
                  return {
                    id: "sub_".concat(i),
                    user_id: "user_".concat(i),
                    status: "active",
                  };
                });
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockFrom = {
                select: globals_1.jest.fn().mockReturnThis(),
                order: globals_1.jest.fn().mockResolvedValue({
                  data: moderateDataset,
                  error: null,
                }),
              };
              mockSupabase.from.mockReturnValue(mockFrom);
              request = new server_1.NextRequest(
                "http://localhost:3000/api/export?type=subscriptions&format=csv",
                { method: "GET" },
              );
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              // Assert
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(response.headers.get("content-encoding")).toBe("gzip");
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
