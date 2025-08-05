"use strict";
// Stock Alerts API Integration Tests
// Story 11.4: Alertas e Relatórios de Estoque
// Integration tests for stock alerts API endpoints
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
var route_1 = require("../route");
var route_2 = require("../acknowledge/route");
// =====================================================
// TEST SETUP AND MOCKS
// =====================================================
// Mock Supabase
globals_1.jest.mock("@supabase/auth-helpers-nextjs", function () {
  return {
    createRouteHandlerClient: globals_1.jest.fn(function () {
      return {
        auth: {
          getSession: globals_1.jest.fn(),
        },
        from: globals_1.jest.fn(),
      };
    }),
  };
});
// Mock cookies
globals_1.jest.mock("next/headers", function () {
  return {
    cookies: globals_1.jest.fn(),
  };
});
// Mock console to avoid noise in tests
var originalConsoleError = console.error;
var originalConsoleLog = console.log;
(0, globals_1.beforeEach)(function () {
  console.error = globals_1.jest.fn();
  console.log = globals_1.jest.fn();
});
(0, globals_1.afterEach)(function () {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
  globals_1.jest.clearAllMocks();
});
// Test data
var mockSession = {
  user: {
    id: "123e4567-e89b-12d3-a456-426614174001",
    email: "test@example.com",
  },
};
var mockClinicId = "123e4567-e89b-12d3-a456-426614174000";
var mockProductId = "123e4567-e89b-12d3-a456-426614174002";
var mockAlertConfig = {
  id: "123e4567-e89b-12d3-a456-426614174003",
  clinic_id: mockClinicId,
  product_id: mockProductId,
  alert_type: "low_stock",
  threshold_value: 10,
  threshold_unit: "quantity",
  severity_level: "medium",
  is_active: true,
  notification_channels: ["in_app", "email"],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};
var mockAlert = {
  id: "123e4567-e89b-12d3-a456-426614174004",
  clinic_id: mockClinicId,
  alert_config_id: mockAlertConfig.id,
  product_id: mockProductId,
  alert_type: "low_stock",
  severity_level: "medium",
  current_value: 5,
  threshold_value: 10,
  message: "Low stock detected",
  status: "active",
  metadata: {},
  triggered_at: "2024-01-01T12:00:00Z",
  acknowledged_at: null,
  created_at: "2024-01-01T12:00:00Z",
};
// Helper function to create mock request
function createMockRequest(url, options) {
  if (options === void 0) {
    options = {};
  }
  return new server_1.NextRequest(url, options);
}
// Helper function to create mock Supabase client
function createMockSupabaseClient(mockData) {
  if (mockData === void 0) {
    mockData = {};
  }
  var mockQuery = {
    select: globals_1.jest.fn().mockReturnThis(),
    insert: globals_1.jest.fn().mockReturnThis(),
    update: globals_1.jest.fn().mockReturnThis(),
    delete: globals_1.jest.fn().mockReturnThis(),
    eq: globals_1.jest.fn().mockReturnThis(),
    in: globals_1.jest.fn().mockReturnThis(),
    gte: globals_1.jest.fn().mockReturnThis(),
    lte: globals_1.jest.fn().mockReturnThis(),
    order: globals_1.jest.fn().mockReturnThis(),
    range: globals_1.jest.fn().mockReturnThis(),
    single: globals_1.jest.fn(),
    count: globals_1.jest.fn(),
  };
  var mockSupabase = {
    auth: {
      getSession: globals_1.jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null,
      }),
    },
    from: globals_1.jest.fn().mockReturnValue(mockQuery),
  };
  // Configure mock responses
  if (mockData.configs) {
    mockQuery.single.mockResolvedValue({ data: mockData.configs, error: null });
  }
  if (mockData.alert) {
    mockQuery.single.mockResolvedValue({ data: mockData.alert, error: null });
  }
  if (mockData.userClinic) {
    mockQuery.single.mockResolvedValue({ data: mockData.userClinic, error: null });
  }
  return { mockSupabase: mockSupabase, mockQuery: mockQuery };
}
// =====================================================
// GET ENDPOINT TESTS
// =====================================================
(0, globals_1.describe)("GET /api/stock/alerts", function () {
  (0, globals_1.it)("should return paginated alert configurations", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var _a, mockSupabase, mockQuery, createRouteHandlerClient, request, response, data;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            (_a = createMockSupabaseClient()),
              (mockSupabase = _a.mockSupabase),
              (mockQuery = _a.mockQuery);
            createRouteHandlerClient =
              require("@supabase/auth-helpers-nextjs").createRouteHandlerClient;
            createRouteHandlerClient.mockReturnValue(mockSupabase);
            // Mock user clinic
            mockSupabase.from.mockReturnValueOnce(
              __assign(__assign({}, mockQuery), {
                single: globals_1.jest.fn().mockResolvedValue({
                  data: { clinic_id: mockClinicId },
                  error: null,
                }),
              }),
            );
            // Mock alert configs
            mockSupabase.from.mockReturnValueOnce(
              __assign(__assign({}, mockQuery), {
                count: globals_1.jest.fn().mockResolvedValue({
                  data: [mockAlertConfig],
                  error: null,
                  count: 1,
                }),
              }),
            );
            request = createMockRequest("http://localhost:3000/api/stock/alerts?page=1&limit=10");
            return [4 /*yield*/, (0, route_1.GET)(request)];
          case 1:
            response = _b.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _b.sent();
            // Assert
            (0, globals_1.expect)(response.status).toBe(200);
            (0, globals_1.expect)(data.success).toBe(true);
            (0, globals_1.expect)(data.data.configs).toHaveLength(1);
            (0, globals_1.expect)(data.data.configs[0]).toMatchObject({
              id: mockAlertConfig.id,
              alertType: mockAlertConfig.alert_type,
              severityLevel: mockAlertConfig.severity_level,
            });
            (0, globals_1.expect)(data.data.pagination).toMatchObject({
              page: 1,
              limit: 10,
              total: 1,
            });
            return [2 /*return*/];
        }
      });
    });
  });
  (0, globals_1.it)("should handle authentication errors", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var createRouteHandlerClient, request, response, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            createRouteHandlerClient =
              require("@supabase/auth-helpers-nextjs").createRouteHandlerClient;
            createRouteHandlerClient.mockReturnValue({
              auth: {
                getSession: globals_1.jest.fn().mockResolvedValue({
                  data: { session: null },
                  error: new Error("Auth error"),
                }),
              },
              from: globals_1.jest.fn(),
            });
            request = createMockRequest("http://localhost:3000/api/stock/alerts");
            return [4 /*yield*/, (0, route_1.GET)(request)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            // Assert
            (0, globals_1.expect)(response.status).toBe(401);
            (0, globals_1.expect)(data.success).toBe(false);
            (0, globals_1.expect)(data.error.code).toBe("UNAUTHORIZED");
            return [2 /*return*/];
        }
      });
    });
  });
  (0, globals_1.it)("should handle query parameter validation", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var mockSupabase, createRouteHandlerClient, request, response, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            mockSupabase = createMockSupabaseClient().mockSupabase;
            createRouteHandlerClient =
              require("@supabase/auth-helpers-nextjs").createRouteHandlerClient;
            createRouteHandlerClient.mockReturnValue(mockSupabase);
            request = createMockRequest(
              "http://localhost:3000/api/stock/alerts?page=invalid&limit=999",
            );
            return [4 /*yield*/, (0, route_1.GET)(request)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            // Assert
            (0, globals_1.expect)(response.status).toBe(400);
            (0, globals_1.expect)(data.success).toBe(false);
            (0, globals_1.expect)(data.error.code).toBe("VALIDATION_ERROR");
            return [2 /*return*/];
        }
      });
    });
  });
});
// =====================================================
// POST ENDPOINT TESTS
// =====================================================
(0, globals_1.describe)("POST /api/stock/alerts", function () {
  (0, globals_1.it)("should create new alert configuration", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var _a,
        mockSupabase,
        mockQuery,
        createRouteHandlerClient,
        requestBody,
        request,
        response,
        data;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            (_a = createMockSupabaseClient()),
              (mockSupabase = _a.mockSupabase),
              (mockQuery = _a.mockQuery);
            createRouteHandlerClient =
              require("@supabase/auth-helpers-nextjs").createRouteHandlerClient;
            createRouteHandlerClient.mockReturnValue(mockSupabase);
            // Mock user clinic
            mockSupabase.from.mockReturnValueOnce(
              __assign(__assign({}, mockQuery), {
                single: globals_1.jest.fn().mockResolvedValue({
                  data: { clinic_id: mockClinicId },
                  error: null,
                }),
              }),
            );
            // Mock config creation
            mockSupabase.from.mockReturnValueOnce(
              __assign(__assign({}, mockQuery), {
                single: globals_1.jest.fn().mockResolvedValue({
                  data: mockAlertConfig,
                  error: null,
                }),
              }),
            );
            requestBody = {
              alertType: "low_stock",
              thresholdValue: 10,
              thresholdUnit: "quantity",
              severityLevel: "medium",
              isActive: true,
              notificationChannels: ["in_app", "email"],
              productId: mockProductId,
            };
            request = createMockRequest("http://localhost:3000/api/stock/alerts", {
              method: "POST",
              body: JSON.stringify(requestBody),
              headers: { "Content-Type": "application/json" },
            });
            return [4 /*yield*/, (0, route_1.POST)(request)];
          case 1:
            response = _b.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _b.sent();
            // Assert
            (0, globals_1.expect)(response.status).toBe(201);
            (0, globals_1.expect)(data.success).toBe(true);
            (0, globals_1.expect)(data.data.config).toMatchObject({
              id: mockAlertConfig.id,
              alertType: "low_stock",
              severityLevel: "medium",
            });
            return [2 /*return*/];
        }
      });
    });
  });
  (0, globals_1.it)("should validate request body", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var mockSupabase, createRouteHandlerClient, invalidRequestBody, request, response, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            mockSupabase = createMockSupabaseClient().mockSupabase;
            createRouteHandlerClient =
              require("@supabase/auth-helpers-nextjs").createRouteHandlerClient;
            createRouteHandlerClient.mockReturnValue(mockSupabase);
            invalidRequestBody = {
              alertType: "invalid_type",
              thresholdValue: -5, // Invalid negative value
              severityLevel: "invalid_severity",
            };
            request = createMockRequest("http://localhost:3000/api/stock/alerts", {
              method: "POST",
              body: JSON.stringify(invalidRequestBody),
              headers: { "Content-Type": "application/json" },
            });
            return [4 /*yield*/, (0, route_1.POST)(request)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            // Assert
            (0, globals_1.expect)(response.status).toBe(400);
            (0, globals_1.expect)(data.success).toBe(false);
            (0, globals_1.expect)(data.error.code).toBe("VALIDATION_ERROR");
            return [2 /*return*/];
        }
      });
    });
  });
  (0, globals_1.it)("should handle database errors", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var _a,
        mockSupabase,
        mockQuery,
        createRouteHandlerClient,
        requestBody,
        request,
        response,
        data;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            (_a = createMockSupabaseClient()),
              (mockSupabase = _a.mockSupabase),
              (mockQuery = _a.mockQuery);
            createRouteHandlerClient =
              require("@supabase/auth-helpers-nextjs").createRouteHandlerClient;
            createRouteHandlerClient.mockReturnValue(mockSupabase);
            // Mock user clinic
            mockSupabase.from.mockReturnValueOnce(
              __assign(__assign({}, mockQuery), {
                single: globals_1.jest.fn().mockResolvedValue({
                  data: { clinic_id: mockClinicId },
                  error: null,
                }),
              }),
            );
            // Mock database error
            mockSupabase.from.mockReturnValueOnce(
              __assign(__assign({}, mockQuery), {
                single: globals_1.jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: "Database error", code: "23505" },
                }),
              }),
            );
            requestBody = {
              alertType: "low_stock",
              thresholdValue: 10,
              thresholdUnit: "quantity",
              severityLevel: "medium",
              isActive: true,
              notificationChannels: ["in_app"],
            };
            request = createMockRequest("http://localhost:3000/api/stock/alerts", {
              method: "POST",
              body: JSON.stringify(requestBody),
              headers: { "Content-Type": "application/json" },
            });
            return [4 /*yield*/, (0, route_1.POST)(request)];
          case 1:
            response = _b.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _b.sent();
            // Assert
            (0, globals_1.expect)(response.status).toBe(400);
            (0, globals_1.expect)(data.success).toBe(false);
            (0, globals_1.expect)(data.error.code).toBe("CREATE_FAILED");
            return [2 /*return*/];
        }
      });
    });
  });
});
// =====================================================
// PUT ENDPOINT TESTS
// =====================================================
(0, globals_1.describe)("PUT /api/stock/alerts/[id]", function () {
  (0, globals_1.it)("should update alert configuration", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var _a,
        mockSupabase,
        mockQuery,
        createRouteHandlerClient,
        updatedConfig,
        requestBody,
        request,
        response,
        data;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            (_a = createMockSupabaseClient()),
              (mockSupabase = _a.mockSupabase),
              (mockQuery = _a.mockQuery);
            createRouteHandlerClient =
              require("@supabase/auth-helpers-nextjs").createRouteHandlerClient;
            createRouteHandlerClient.mockReturnValue(mockSupabase);
            // Mock user clinic
            mockSupabase.from.mockReturnValueOnce(
              __assign(__assign({}, mockQuery), {
                single: globals_1.jest.fn().mockResolvedValue({
                  data: { clinic_id: mockClinicId },
                  error: null,
                }),
              }),
            );
            updatedConfig = __assign(__assign({}, mockAlertConfig), { is_active: false });
            mockSupabase.from.mockReturnValueOnce(
              __assign(__assign({}, mockQuery), {
                single: globals_1.jest.fn().mockResolvedValue({
                  data: updatedConfig,
                  error: null,
                }),
              }),
            );
            requestBody = {
              isActive: false,
            };
            request = createMockRequest(
              "http://localhost:3000/api/stock/alerts/".concat(mockAlertConfig.id),
              {
                method: "PUT",
                body: JSON.stringify(requestBody),
                headers: { "Content-Type": "application/json" },
              },
            );
            return [4 /*yield*/, (0, route_1.PUT)(request)];
          case 1:
            response = _b.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _b.sent();
            // Assert
            (0, globals_1.expect)(response.status).toBe(200);
            (0, globals_1.expect)(data.success).toBe(true);
            (0, globals_1.expect)(data.data.config.isActive).toBe(false);
            return [2 /*return*/];
        }
      });
    });
  });
});
// =====================================================
// DELETE ENDPOINT TESTS
// =====================================================
(0, globals_1.describe)("DELETE /api/stock/alerts/[id]", function () {
  (0, globals_1.it)("should delete alert configuration", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var _a, mockSupabase, mockQuery, createRouteHandlerClient, request, response, data;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            (_a = createMockSupabaseClient()),
              (mockSupabase = _a.mockSupabase),
              (mockQuery = _a.mockQuery);
            createRouteHandlerClient =
              require("@supabase/auth-helpers-nextjs").createRouteHandlerClient;
            createRouteHandlerClient.mockReturnValue(mockSupabase);
            // Mock user clinic
            mockSupabase.from.mockReturnValueOnce(
              __assign(__assign({}, mockQuery), {
                single: globals_1.jest.fn().mockResolvedValue({
                  data: { clinic_id: mockClinicId },
                  error: null,
                }),
              }),
            );
            // Mock config deletion
            mockSupabase.from.mockReturnValueOnce(
              __assign(__assign({}, mockQuery), {
                single: globals_1.jest.fn().mockResolvedValue({
                  data: { id: mockAlertConfig.id },
                  error: null,
                }),
              }),
            );
            request = createMockRequest(
              "http://localhost:3000/api/stock/alerts/".concat(mockAlertConfig.id),
              {
                method: "DELETE",
              },
            );
            return [4 /*yield*/, (0, route_1.DELETE)(request)];
          case 1:
            response = _b.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _b.sent();
            // Assert
            (0, globals_1.expect)(response.status).toBe(200);
            (0, globals_1.expect)(data.success).toBe(true);
            (0, globals_1.expect)(data.message).toContain("deleted successfully");
            return [2 /*return*/];
        }
      });
    });
  });
});
// =====================================================
// ACKNOWLEDGE ENDPOINT TESTS
// =====================================================
(0, globals_1.describe)("POST /api/stock/alerts/acknowledge", function () {
  (0, globals_1.it)("should acknowledge alert successfully", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var _a,
        mockSupabase,
        mockQuery,
        createRouteHandlerClient,
        acknowledgedAlert,
        requestBody,
        request,
        response,
        data;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            (_a = createMockSupabaseClient()),
              (mockSupabase = _a.mockSupabase),
              (mockQuery = _a.mockQuery);
            createRouteHandlerClient =
              require("@supabase/auth-helpers-nextjs").createRouteHandlerClient;
            createRouteHandlerClient.mockReturnValue(mockSupabase);
            // Mock user clinic
            mockSupabase.from.mockReturnValueOnce(
              __assign(__assign({}, mockQuery), {
                single: globals_1.jest.fn().mockResolvedValue({
                  data: { clinic_id: mockClinicId },
                  error: null,
                }),
              }),
            );
            acknowledgedAlert = __assign(__assign({}, mockAlert), {
              status: "acknowledged",
              acknowledged_at: "2024-01-01T13:00:00Z",
            });
            mockSupabase.from.mockReturnValueOnce(
              __assign(__assign({}, mockQuery), {
                single: globals_1.jest.fn().mockResolvedValue({
                  data: acknowledgedAlert,
                  error: null,
                }),
              }),
            );
            requestBody = {
              alertId: mockAlert.id,
              notes: "Issue resolved",
            };
            request = createMockRequest("http://localhost:3000/api/stock/alerts/acknowledge", {
              method: "POST",
              body: JSON.stringify(requestBody),
              headers: { "Content-Type": "application/json" },
            });
            return [4 /*yield*/, (0, route_2.POST)(request)];
          case 1:
            response = _b.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _b.sent();
            // Assert
            (0, globals_1.expect)(response.status).toBe(200);
            (0, globals_1.expect)(data.success).toBe(true);
            (0, globals_1.expect)(data.data.alert.status).toBe("acknowledged");
            (0, globals_1.expect)(data.data.alert.acknowledgedAt).toBeTruthy();
            return [2 /*return*/];
        }
      });
    });
  });
  (0, globals_1.it)("should validate acknowledgment request", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var invalidRequestBody, request, response, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            invalidRequestBody = {
              // Missing required alertId
              notes: "Some notes",
            };
            request = createMockRequest("http://localhost:3000/api/stock/alerts/acknowledge", {
              method: "POST",
              body: JSON.stringify(invalidRequestBody),
              headers: { "Content-Type": "application/json" },
            });
            return [4 /*yield*/, (0, route_2.POST)(request)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            // Assert
            (0, globals_1.expect)(response.status).toBe(400);
            (0, globals_1.expect)(data.success).toBe(false);
            (0, globals_1.expect)(data.error.code).toBe("VALIDATION_ERROR");
            return [2 /*return*/];
        }
      });
    });
  });
});
// =====================================================
// END-TO-END WORKFLOW TESTS
// =====================================================
(0, globals_1.describe)("End-to-End Alert Workflow", function () {
  (0, globals_1.it)("should complete full alert lifecycle", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var _a,
        mockSupabase,
        mockQuery,
        createRouteHandlerClient,
        createRequest,
        createResponse,
        createData,
        acknowledgedAlert,
        ackRequest,
        ackResponse,
        ackData;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            (_a = createMockSupabaseClient()),
              (mockSupabase = _a.mockSupabase),
              (mockQuery = _a.mockQuery);
            createRouteHandlerClient =
              require("@supabase/auth-helpers-nextjs").createRouteHandlerClient;
            createRouteHandlerClient.mockReturnValue(mockSupabase);
            // Step 1: Create configuration
            mockSupabase.from.mockReturnValueOnce(
              __assign(__assign({}, mockQuery), {
                single: globals_1.jest.fn().mockResolvedValue({
                  data: { clinic_id: mockClinicId },
                  error: null,
                }),
              }),
            );
            mockSupabase.from.mockReturnValueOnce(
              __assign(__assign({}, mockQuery), {
                single: globals_1.jest.fn().mockResolvedValue({
                  data: mockAlertConfig,
                  error: null,
                }),
              }),
            );
            createRequest = createMockRequest("http://localhost:3000/api/stock/alerts", {
              method: "POST",
              body: JSON.stringify({
                alertType: "low_stock",
                thresholdValue: 10,
                thresholdUnit: "quantity",
                severityLevel: "medium",
                isActive: true,
                notificationChannels: ["in_app"],
              }),
              headers: { "Content-Type": "application/json" },
            });
            return [4 /*yield*/, (0, route_1.POST)(createRequest)];
          case 1:
            createResponse = _b.sent();
            return [4 /*yield*/, createResponse.json()];
          case 2:
            createData = _b.sent();
            (0, globals_1.expect)(createResponse.status).toBe(201);
            (0, globals_1.expect)(createData.success).toBe(true);
            // Step 2: Acknowledge alert (simulating that an alert was generated)
            mockSupabase.from.mockReturnValueOnce(
              __assign(__assign({}, mockQuery), {
                single: globals_1.jest.fn().mockResolvedValue({
                  data: { clinic_id: mockClinicId },
                  error: null,
                }),
              }),
            );
            acknowledgedAlert = __assign(__assign({}, mockAlert), { status: "acknowledged" });
            mockSupabase.from.mockReturnValueOnce(
              __assign(__assign({}, mockQuery), {
                single: globals_1.jest.fn().mockResolvedValue({
                  data: acknowledgedAlert,
                  error: null,
                }),
              }),
            );
            ackRequest = createMockRequest("http://localhost:3000/api/stock/alerts/acknowledge", {
              method: "POST",
              body: JSON.stringify({
                alertId: mockAlert.id,
              }),
              headers: { "Content-Type": "application/json" },
            });
            return [4 /*yield*/, (0, route_2.POST)(ackRequest)];
          case 3:
            ackResponse = _b.sent();
            return [4 /*yield*/, ackResponse.json()];
          case 4:
            ackData = _b.sent();
            (0, globals_1.expect)(ackResponse.status).toBe(200);
            (0, globals_1.expect)(ackData.success).toBe(true);
            (0, globals_1.expect)(ackData.data.alert.status).toBe("acknowledged");
            return [2 /*return*/];
        }
      });
    });
  });
});
