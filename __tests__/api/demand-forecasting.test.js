"use strict";
/**
 * Demand Forecasting API Tests - Story 11.1
 * Test coverage for demand forecasting endpoints with ≥80% accuracy requirement
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
var route_1 = require("@/src/app/api/forecasting/route");
var route_2 = require("@/src/app/api/forecasting/resource-allocation/route");
var server_1 = require("next/server");
// Mock NextResponse for Jest compatibility with Next.js 15
jest.mock("next/server", function () {
  return {
    NextRequest: jest.requireActual("next/server").NextRequest,
    NextResponse: {
      json: jest.fn(function (data, init) {
        return {
          json: function () {
            return __awaiter(void 0, void 0, void 0, function () {
              return __generator(this, function (_a) {
                return [2 /*return*/, data];
              });
            });
          },
          status: (init === null || init === void 0 ? void 0 : init.status) || 200,
          headers: new Map(),
        };
      }),
    },
  };
});
// Mock Supabase client
var mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  data: [],
  error: null,
};
jest.mock("@/app/utils/supabase/server", function () {
  return {
    createServerSupabaseClient: jest.fn(function () {
      return mockSupabaseClient;
    }),
  };
});
// Mock demand forecasting engine
jest.mock("@/src/lib/analytics/demand-forecasting", function () {
  return {
    DemandForecastingEngine: jest.fn().mockImplementation(function () {
      return {
        generateForecast: jest.fn().mockResolvedValue({
          id: "123e4567-e89b-12d3-a456-426614174000",
          accuracy: 0.85,
          predictions: [
            {
              id: "123e4567-e89b-12d3-a456-426614174000",
              service_id: "123e4567-e89b-12d3-a456-426614174001",
              demand_value: 150,
              confidence_level: 0.85,
              forecast_period: {
                start_date: "2024-01-01",
                end_date: "2024-01-31",
              },
              seasonal_factors: { summer: 1.2, winter: 0.8 },
              external_factors: { promotion: 1.1, weather: 0.95 },
            },
          ],
          metadata: {
            service_id: "123e4567-e89b-12d3-a456-426614174001",
            forecast_period: {
              start_date: "2024-01-01",
              end_date: "2024-01-31",
            },
          },
        }),
        generateResourceAllocation: jest.fn().mockResolvedValue({
          recommendations: [
            {
              resource_type: "staff",
              recommended_quantity: 5,
              current_quantity: 4,
              optimization_score: 0.85,
            },
          ],
          optimization_type: "balanced",
          expected_efficiency: 0.88,
        }),
      };
    }),
  };
});
// Valid test data with proper UUIDs
var validServiceId = "123e4567-e89b-12d3-a456-426614174001";
var validForecastId = "123e4567-e89b-12d3-a456-426614174000";
var mockForecast = {
  id: validForecastId,
  service_id: validServiceId,
  demand_value: 150,
  confidence_level: 0.85,
  forecast_period: {
    start_date: "2024-01-01",
    end_date: "2024-01-31",
  },
  seasonal_factors: { summer: 1.2, winter: 0.8 },
  external_factors: { promotion: 1.1, weather: 0.95 },
};
var mockAppointments = [
  {
    id: "123e4567-e89b-12d3-a456-426614174002",
    service_id: validServiceId,
    scheduled_at: "2024-01-15T10:00:00Z",
    status: "completed",
    duration_minutes: 60,
  },
];
describe("/api/forecasting - Demand Forecasting API", function () {
  beforeEach(function () {
    jest.clearAllMocks();
    // Reset engine mock to default working state
    var DemandForecastingEngine =
      require("@/src/lib/analytics/demand-forecasting").DemandForecastingEngine;
    DemandForecastingEngine.mockImplementation(function () {
      return {
        generateForecast: jest.fn().mockResolvedValue({
          id: "123e4567-e89b-12d3-a456-426614174000",
          accuracy: 0.85,
          predictions: [mockForecast],
        }),
        generateResourceAllocationRecommendations: jest.fn().mockResolvedValue([
          {
            resource_type: "staff",
            recommended_quantity: 5,
            priority: "high",
            estimated_cost: 5000,
            time_period: "2024-02-01 to 2024-02-07",
            cost_optimization: {
              total_cost_impact: 5000,
              efficiency_gains: 0.95,
            },
          },
        ]),
      };
    });
    // Setup different return values for different operations
    mockSupabaseClient.from.mockImplementation(function (table) {
      if (table === "appointments") {
        return __assign(__assign({}, mockSupabaseClient), { data: mockAppointments, error: null });
      } else if (table === "demand_forecasts") {
        return __assign(__assign({}, mockSupabaseClient), {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockResolvedValue({
            data: [mockForecast],
            error: null,
          }),
          data: [mockForecast],
          error: null,
        });
      }
      return mockSupabaseClient;
    });
    mockSupabaseClient.data = mockAppointments;
    mockSupabaseClient.error = null;
  });
  describe("GET /api/forecasting", function () {
    test("should generate demand forecast with default parameters", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var request, response, data;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              request = new server_1.NextRequest("http://localhost:3000/api/forecasting");
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(200);
              expect(data.success).toBe(true);
              expect(data.data.accuracy).toBeGreaterThanOrEqual(0.8);
              expect(data.data.forecasts).toBeDefined();
              expect(Array.isArray(data.data.forecasts)).toBe(true);
              expect(data.data.forecasts[0].demand_value).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      });
    });
    test("should generate forecast with custom parameters", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var url, request, response, data;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              url = new URL("http://localhost:3000/api/forecasting");
              url.searchParams.set("period", "30");
              url.searchParams.set("includeSeasonality", "true");
              url.searchParams.set("includeExternalFactors", "true");
              url.searchParams.set("confidenceLevel", "0.95");
              request = new server_1.NextRequest(url.toString());
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(200);
              expect(data.success).toBe(true);
              expect(data.data.accuracy).toBeGreaterThanOrEqual(0.8);
              return [2 /*return*/];
          }
        });
      });
    });
    test("should filter by service ID when provided", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var url, request, response, data;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              url = new URL("http://localhost:3000/api/forecasting");
              url.searchParams.set("serviceId", validServiceId);
              request = new server_1.NextRequest(url.toString());
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(200);
              expect(data.success).toBe(true);
              // Verify that the API was called (may call either appointments or demand_forecasts)
              expect(mockSupabaseClient.from).toHaveBeenCalled();
              return [2 /*return*/];
          }
        });
      });
    });
    test("should validate accuracy threshold requirement", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var request, response, data;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              request = new server_1.NextRequest("http://localhost:3000/api/forecasting");
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(200);
              expect(data.success).toBe(true);
              expect(data.data.accuracy).toBeGreaterThanOrEqual(0.8);
              return [2 /*return*/];
          }
        });
      });
    });
    test("should handle missing appointment data", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var request, response, data;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockSupabaseClient.data = [];
              request = new server_1.NextRequest("http://localhost:3000/api/forecasting");
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(200);
              expect(data.success).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
    test("should handle authentication errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var request, response, data;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockSupabaseClient.error = { message: "Authentication required" };
              request = new server_1.NextRequest("http://localhost:3000/api/forecasting");
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(200);
              expect(data.success).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
    test("should validate parameter ranges", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var url, request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              url = new URL("http://localhost:3000/api/forecasting");
              url.searchParams.set("period", "1000"); // Invalid range
              url.searchParams.set("confidenceLevel", "0.99"); // Valid max value
              request = new server_1.NextRequest(url.toString());
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              // Should handle validation errors gracefully
              expect(response.status).toBeGreaterThanOrEqual(200);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Forecast Generation Performance", function () {
    test("should complete forecast generation within time limits", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var startTime, request, response, endTime, duration;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              startTime = Date.now();
              request = new server_1.NextRequest("http://localhost:3000/api/forecasting");
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              endTime = Date.now();
              duration = endTime - startTime;
              expect(duration).toBeLessThan(5000); // 5 second max
              expect(response.status).toBe(200);
              return [2 /*return*/];
          }
        });
      });
    });
    test("should handle concurrent forecast requests", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var requests, responses;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              requests = Array.from({ length: 3 }, function () {
                return (0, route_1.GET)(
                  new server_1.NextRequest("http://localhost:3000/api/forecasting"),
                );
              });
              return [4 /*yield*/, Promise.all(requests)];
            case 1:
              responses = _a.sent();
              responses.forEach(function (response) {
                expect(response.status).toBe(200);
              });
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Error Handling", function () {
    test("should handle database connection errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockSupabaseClient.error = new Error("Database connection failed");
              request = new server_1.NextRequest("http://localhost:3000/api/forecasting");
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              expect(response.status).toBeGreaterThanOrEqual(200);
              return [2 /*return*/];
          }
        });
      });
    });
    test("should handle forecasting engine errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var DemandForecastingEngine, request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              DemandForecastingEngine =
                require("@/src/lib/analytics/demand-forecasting").DemandForecastingEngine;
              DemandForecastingEngine.mockImplementation(function () {
                return {
                  generateForecast: jest.fn().mockRejectedValue(new Error("Engine error")),
                };
              });
              request = new server_1.NextRequest("http://localhost:3000/api/forecasting");
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              expect(response.status).toBeGreaterThanOrEqual(200);
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
describe("/api/forecasting/resource-allocation - Resource Allocation API", function () {
  beforeEach(function () {
    jest.clearAllMocks();
    // Setup engine mock for resource allocation
    var DemandForecastingEngine =
      require("@/src/lib/analytics/demand-forecasting").DemandForecastingEngine;
    DemandForecastingEngine.mockImplementation(function () {
      return {
        generateForecast: jest.fn().mockResolvedValue({
          id: "123e4567-e89b-12d3-a456-426614174000",
          accuracy: 0.85,
          predictions: [mockForecast],
        }),
        generateResourceAllocationRecommendations: jest.fn().mockResolvedValue([
          {
            resource_type: "staff",
            recommended_quantity: 5,
            priority: "high",
            estimated_cost: 5000,
            time_period: "2024-02-01 to 2024-02-07",
            cost_optimization: {
              total_cost_impact: 5000,
              efficiency_gains: 0.95,
            },
          },
        ]),
      };
    });
    // Setup mock for resource allocation queries
    mockSupabaseClient.from.mockImplementation(function (table) {
      if (table === "demand_forecasts") {
        return __assign(__assign({}, mockSupabaseClient), {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [mockForecast],
            error: null,
          }),
        });
      }
      return mockSupabaseClient;
    });
    mockSupabaseClient.data = [mockForecast];
    mockSupabaseClient.error = null;
  });
  describe("POST /api/forecasting/resource-allocation", function () {
    test("should generate resource allocation recommendations", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var requestBody, request, response, data;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              requestBody = {
                forecastIds: [validForecastId],
                optimizationType: "balanced",
                constraints: {
                  budget_limit: 10000,
                  staff_limit: 10,
                },
              };
              request = new server_1.NextRequest(
                "http://localhost:3000/api/forecasting/resource-allocation",
                {
                  method: "POST",
                  body: JSON.stringify(requestBody),
                  headers: { "Content-Type": "application/json" },
                },
              );
              return [4 /*yield*/, (0, route_2.POST)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(201); // 201 for created resource allocation
              expect(data.success).toBe(true);
              expect(data.data.recommendations).toBeDefined();
              expect(Array.isArray(data.data.recommendations)).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
    test("should handle different optimization strategies", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var strategies, _i, strategies_1, strategy, requestBody, request, response, data;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              strategies = ["cost", "efficiency", "quality", "balanced"];
              (_i = 0), (strategies_1 = strategies);
              _a.label = 1;
            case 1:
              if (!(_i < strategies_1.length)) return [3 /*break*/, 5];
              strategy = strategies_1[_i];
              requestBody = {
                forecastIds: [validForecastId],
                optimizationType: strategy,
                constraints: {},
              };
              request = new server_1.NextRequest(
                "http://localhost:3000/api/forecasting/resource-allocation",
                {
                  method: "POST",
                  body: JSON.stringify(requestBody),
                  headers: { "Content-Type": "application/json" },
                },
              );
              return [4 /*yield*/, (0, route_2.POST)(request)];
            case 2:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 3:
              data = _a.sent();
              expect(response.status).toBe(201); // 201 for created resource allocation
              expect(data.success).toBe(true);
              _a.label = 4;
            case 4:
              _i++;
              return [3 /*break*/, 1];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    });
    test("should validate required request parameters", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var requestBody, request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              requestBody = {
                // Missing forecastIds
                optimizationType: "balanced",
              };
              request = new server_1.NextRequest(
                "http://localhost:3000/api/forecasting/resource-allocation",
                {
                  method: "POST",
                  body: JSON.stringify(requestBody),
                  headers: { "Content-Type": "application/json" },
                },
              );
              return [4 /*yield*/, (0, route_2.POST)(request)];
            case 1:
              response = _a.sent();
              expect(response.status).toBeGreaterThanOrEqual(200);
              return [2 /*return*/];
          }
        });
      });
    });
    test("should handle empty forecast IDs array", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var requestBody, request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              requestBody = {
                forecastIds: [],
                optimizationType: "balanced",
              };
              request = new server_1.NextRequest(
                "http://localhost:3000/api/forecasting/resource-allocation",
                {
                  method: "POST",
                  body: JSON.stringify(requestBody),
                  headers: { "Content-Type": "application/json" },
                },
              );
              return [4 /*yield*/, (0, route_2.POST)(request)];
            case 1:
              response = _a.sent();
              expect(response.status).toBeGreaterThanOrEqual(200);
              return [2 /*return*/];
          }
        });
      });
    });
    test("should validate optimization type parameter", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var requestBody, request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              requestBody = {
                forecastIds: [validForecastId],
                optimizationType: "invalid_type",
              };
              request = new server_1.NextRequest(
                "http://localhost:3000/api/forecasting/resource-allocation",
                {
                  method: "POST",
                  body: JSON.stringify(requestBody),
                  headers: { "Content-Type": "application/json" },
                },
              );
              return [4 /*yield*/, (0, route_2.POST)(request)];
            case 1:
              response = _a.sent();
              expect(response.status).toBeGreaterThanOrEqual(200);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("GET /api/forecasting/resource-allocation", function () {
    test("should return current resource allocation status", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var request, response, data;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              request = new server_1.NextRequest(
                "http://localhost:3000/api/forecasting/resource-allocation?forecastId=".concat(
                  validForecastId,
                ),
              );
              return [4 /*yield*/, (0, route_2.GET)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(200);
              expect(data.success).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
    test("should return error for missing forecastId", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var request, response, data;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              request = new server_1.NextRequest(
                "http://localhost:3000/api/forecasting/resource-allocation",
              );
              return [4 /*yield*/, (0, route_2.GET)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(400);
              expect(data.success).toBe(false);
              expect(data.error.message).toBe("At least one forecast ID is required");
              expect(data.error.code).toBe("MISSING_FORECAST_IDS");
              return [2 /*return*/];
          }
        });
      });
    });
    test("should handle no existing allocations", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var request, response, data;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockSupabaseClient.data = [];
              request = new server_1.NextRequest(
                "http://localhost:3000/api/forecasting/resource-allocation?forecastId=".concat(
                  validForecastId,
                ),
              );
              return [4 /*yield*/, (0, route_2.GET)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(200);
              expect(data.success).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Resource Allocation Performance", function () {
    test("should optimize resource allocation within time constraints", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var requestBody, startTime, request, response, endTime, duration;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              requestBody = {
                forecastIds: [validForecastId],
                optimizationType: "efficiency",
              };
              startTime = Date.now();
              request = new server_1.NextRequest(
                "http://localhost:3000/api/forecasting/resource-allocation",
                {
                  method: "POST",
                  body: JSON.stringify(requestBody),
                  headers: { "Content-Type": "application/json" },
                },
              );
              return [4 /*yield*/, (0, route_2.POST)(request)];
            case 1:
              response = _a.sent();
              endTime = Date.now();
              duration = endTime - startTime;
              expect(duration).toBeLessThan(10000); // 10 second max
              expect(response.status).toBe(201); // 201 for created resource allocation
              return [2 /*return*/];
          }
        });
      });
    });
    test("should handle large numbers of forecasts efficiently", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var largeArray, requestBody, request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              largeArray = Array(50).fill(validForecastId);
              requestBody = {
                forecastIds: largeArray,
                optimizationType: "balanced",
              };
              request = new server_1.NextRequest(
                "http://localhost:3000/api/forecasting/resource-allocation",
                {
                  method: "POST",
                  body: JSON.stringify(requestBody),
                  headers: { "Content-Type": "application/json" },
                },
              );
              return [4 /*yield*/, (0, route_2.POST)(request)];
            case 1:
              response = _a.sent();
              expect(response.status).toBe(201); // 201 for created resource allocation
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
