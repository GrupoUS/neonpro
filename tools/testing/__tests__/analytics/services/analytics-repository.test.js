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
var repository_1 = require("@/lib/analytics/repository");
var server_1 = require("@/utils/supabase/server");
// Mock Supabase client
globals_1.jest.mock("@/utils/supabase/server");
var mockCreateClient = server_1.createClient;
(0, globals_1.describe)("AnalyticsRepository", function () {
  var repository;
  var mockSupabase;
  (0, globals_1.beforeEach)(function () {
    // Create mock Supabase client with typed methods
    mockSupabase = {
      from: globals_1.jest.fn(),
      rpc: globals_1.jest.fn(),
      auth: {
        getUser: globals_1.jest.fn(),
      },
    };
    // Mock the createClient function to return our mock
    mockCreateClient.mockResolvedValue(mockSupabase);
    repository = new repository_1.AnalyticsRepository();
  });
  (0, globals_1.afterEach)(function () {
    globals_1.jest.clearAllMocks();
  });
  (0, globals_1.describe)("getSubscriptionMetrics", function () {
    (0, globals_1.test)("should fetch subscription metrics from database", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockData, mockFrom, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockData = {
                data: {
                  total_subscriptions: 150,
                  active_subscriptions: 125,
                  mrr: 15000,
                  arr: 180000,
                  churn_rate: 0.05,
                  growth_rate: 0.12,
                  conversion_rate: 0.25,
                },
                error: null,
              };
              mockFrom = {
                select: globals_1.jest.fn().mockReturnThis(),
                eq: globals_1.jest.fn().mockReturnThis(),
                single: globals_1.jest.fn().mockResolvedValue(mockData),
              };
              mockSupabase.from.mockReturnValue(mockFrom);
              return [4 /*yield*/, repository.getSubscriptionMetrics("monthly")];
            case 1:
              result = _a.sent();
              // Assert
              (0, globals_1.expect)(result).toEqual({
                totalSubscriptions: 150,
                activeSubscriptions: 125,
                mrr: 15000,
                arr: 180000,
                churnRate: 0.05,
                growthRate: 0.12,
                conversionRate: 0.25,
                period: "monthly",
                generatedAt: globals_1.expect.any(Date),
              });
              (0, globals_1.expect)(mockSupabase.from).toHaveBeenCalledWith("subscription_metrics");
              (0, globals_1.expect)(mockFrom.select).toHaveBeenCalled();
              (0, globals_1.expect)(mockFrom.eq).toHaveBeenCalledWith("period", "monthly");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("should handle database errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockError, mockFrom;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockError = { message: "Database connection failed" };
              mockFrom = {
                select: globals_1.jest.fn().mockReturnThis(),
                eq: globals_1.jest.fn().mockReturnThis(),
                single: globals_1.jest.fn().mockResolvedValue({ data: null, error: mockError }),
              };
              mockSupabase.from.mockReturnValue(mockFrom);
              // Act & Assert
              return [
                4 /*yield*/,
                (0, globals_1.expect)(repository.getSubscriptionMetrics("monthly")).rejects.toThrow(
                  "Database connection failed",
                ),
              ];
            case 1:
              // Act & Assert
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("should handle missing data gracefully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockFrom;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockFrom = {
                select: globals_1.jest.fn().mockReturnThis(),
                eq: globals_1.jest.fn().mockReturnThis(),
                single: globals_1.jest.fn().mockResolvedValue({ data: null, error: null }),
              };
              mockSupabase.from.mockReturnValue(mockFrom);
              // Act & Assert
              return [
                4 /*yield*/,
                (0, globals_1.expect)(repository.getSubscriptionMetrics("monthly")).rejects.toThrow(
                  "No subscription metrics found for period: monthly",
                ),
              ];
            case 1:
              // Act & Assert
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("getTrialMetrics", function () {
    (0, globals_1.test)("should fetch trial metrics with AI predictions", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockTrialData, mockPredictionData, mockFrom, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockTrialData = {
                data: [
                  {
                    total_trials: 500,
                    active_trials: 150,
                    converted_trials: 125,
                    expired_trials: 225,
                    conversion_rate: 0.25,
                    average_trial_duration: 14,
                  },
                ],
                error: null,
              };
              mockPredictionData = {
                data: [
                  {
                    user_id: "user1",
                    conversion_probability: 0.85,
                    conversion_factors: ["high_engagement"],
                  },
                  {
                    user_id: "user2",
                    conversion_probability: 0.6,
                    conversion_factors: ["moderate_usage"],
                  },
                ],
                error: null,
              };
              mockFrom = {
                select: globals_1.jest.fn().mockReturnThis(),
                eq: globals_1.jest.fn().mockReturnThis(),
                gte: globals_1.jest.fn().mockReturnThis(),
                lt: globals_1.jest.fn().mockReturnThis(),
                single: globals_1.jest.fn().mockResolvedValue(mockTrialData),
                limit: globals_1.jest.fn().mockResolvedValue(mockPredictionData),
              };
              mockSupabase.from.mockReturnValue(mockFrom);
              return [4 /*yield*/, repository.getTrialMetrics("monthly")];
            case 1:
              result = _a.sent();
              // Assert
              (0, globals_1.expect)(result.totalTrials).toBe(500);
              (0, globals_1.expect)(result.activeTrials).toBe(150);
              (0, globals_1.expect)(result.conversionRate).toBe(0.25);
              (0, globals_1.expect)(result.conversionPredictions).toBeDefined();
              (0, globals_1.expect)(result.conversionPredictions).toHaveLength(2);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("should handle RPC function calls for complex analytics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockRpcResult, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRpcResult = {
                data: {
                  engagement_score: 0.85,
                  conversion_factors: ["email_response", "support_interaction"],
                  predicted_conversion_date: "2024-02-15",
                },
                error: null,
              };
              mockSupabase.rpc.mockResolvedValue(mockRpcResult);
              return [4 /*yield*/, repository.calculateTrialConversionProbability("user123")];
            case 1:
              result = _a.sent();
              // Assert
              (0, globals_1.expect)(result).toEqual(mockRpcResult.data);
              (0, globals_1.expect)(mockSupabase.rpc).toHaveBeenCalledWith(
                "calculate_trial_conversion_ai",
                {
                  user_id: "user123",
                },
              );
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("getCohortAnalysis", function () {
    (0, globals_1.test)("should fetch cohort data with retention rates", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var startDate, endDate, mockCohortData, mockFrom, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              startDate = new Date("2024-01-01");
              endDate = new Date("2024-01-31");
              mockCohortData = {
                data: [
                  {
                    cohort_month: "2024-01",
                    period_number: 0,
                    customers_count: 100,
                    revenue_amount: 5000,
                    retention_rate: 1.0,
                  },
                  {
                    cohort_month: "2024-01",
                    period_number: 1,
                    customers_count: 85,
                    revenue_amount: 4250,
                    retention_rate: 0.85,
                  },
                ],
                error: null,
              };
              mockFrom = {
                select: globals_1.jest.fn().mockReturnThis(),
                gte: globals_1.jest.fn().mockReturnThis(),
                lte: globals_1.jest.fn().mockReturnThis(),
                order: globals_1.jest.fn().mockResolvedValue(mockCohortData),
              };
              mockSupabase.from.mockReturnValue(mockFrom);
              return [4 /*yield*/, repository.getCohortAnalysis(startDate, endDate)];
            case 1:
              result = _a.sent();
              // Assert
              (0, globals_1.expect)(result.cohorts).toBeDefined();
              (0, globals_1.expect)(result.totalRevenue).toBeGreaterThan(0);
              (0, globals_1.expect)(result.averageRetentionRate).toBeDefined();
              (0, globals_1.expect)(mockSupabase.from).toHaveBeenCalledWith("subscription_cohorts");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("getRevenueForecasting", function () {
    (0, globals_1.test)("should fetch revenue predictions from ML model", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var periods, mockForecastData, mockFrom, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              periods = 6;
              mockForecastData = {
                data: [
                  {
                    forecast_date: "2024-02-01",
                    forecast_type: "mrr",
                    predicted_value: 16000,
                    confidence_interval: { lower: 14500, upper: 17500 },
                    model_version: "v2.1",
                  },
                ],
                error: null,
              };
              mockFrom = {
                select: globals_1.jest.fn().mockReturnThis(),
                eq: globals_1.jest.fn().mockReturnThis(),
                gte: globals_1.jest.fn().mockReturnThis(),
                limit: globals_1.jest.fn().mockReturnThis(),
                order: globals_1.jest.fn().mockResolvedValue(mockForecastData),
              };
              mockSupabase.from.mockReturnValue(mockFrom);
              return [4 /*yield*/, repository.getRevenueForecasting(periods)];
            case 1:
              result = _a.sent();
              // Assert
              (0, globals_1.expect)(result.predictions).toBeDefined();
              (0, globals_1.expect)(result.predictions).toHaveLength(1);
              (0, globals_1.expect)(result.predictions[0].value).toBe(16000);
              (0, globals_1.expect)(result.predictions[0].confidence.lower).toBeLessThan(
                result.predictions[0].value,
              );
              (0, globals_1.expect)(result.modelVersion).toBe("v2.1");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("real-time subscriptions", function () {
    (0, globals_1.test)("should set up real-time listener for metrics updates", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockCallback, mockChannel;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockCallback = globals_1.jest.fn();
              mockChannel = {
                on: globals_1.jest.fn().mockReturnThis(),
                subscribe: globals_1.jest.fn(),
              };
              mockSupabase.channel = globals_1.jest.fn().mockReturnValue(mockChannel);
              // Act
              return [4 /*yield*/, repository.subscribeToMetricsUpdates(mockCallback)];
            case 1:
              // Act
              _a.sent();
              // Assert
              (0, globals_1.expect)(mockSupabase.channel).toHaveBeenCalledWith("analytics-updates");
              (0, globals_1.expect)(mockChannel.on).toHaveBeenCalledWith(
                "postgres_changes",
                globals_1.expect.objectContaining({
                  event: "*",
                  schema: "public",
                  table: "subscription_metrics",
                }),
                mockCallback,
              );
              (0, globals_1.expect)(mockChannel.subscribe).toHaveBeenCalled();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("data validation", function () {
    (0, globals_1.test)("should validate subscription metrics data format", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var invalidData, mockFrom;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              invalidData = {
                data: {
                  total_subscriptions: "invalid", // Should be number
                  active_subscriptions: 125,
                  mrr: -1000, // Should be positive
                },
                error: null,
              };
              mockFrom = {
                select: globals_1.jest.fn().mockReturnThis(),
                eq: globals_1.jest.fn().mockReturnThis(),
                single: globals_1.jest.fn().mockResolvedValue(invalidData),
              };
              mockSupabase.from.mockReturnValue(mockFrom);
              // Act & Assert
              return [
                4 /*yield*/,
                (0, globals_1.expect)(repository.getSubscriptionMetrics("monthly")).rejects.toThrow(
                  "Invalid subscription metrics data format",
                ),
              ];
            case 1:
              // Act & Assert
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("should validate date ranges for cohort analysis", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var startDate, endDate;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              startDate = new Date("invalid-date");
              endDate = new Date("2024-01-31");
              // Act & Assert
              return [
                4 /*yield*/,
                (0, globals_1.expect)(
                  repository.getCohortAnalysis(startDate, endDate),
                ).rejects.toThrow("Invalid date range provided"),
              ];
            case 1:
              // Act & Assert
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("performance optimization", function () {
    (0, globals_1.test)("should implement connection pooling", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockMetrics, mockFrom, promises;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockMetrics = {
                data: { total_subscriptions: 100, active_subscriptions: 80 },
                error: null,
              };
              mockFrom = {
                select: globals_1.jest.fn().mockReturnThis(),
                eq: globals_1.jest.fn().mockReturnThis(),
                single: globals_1.jest.fn().mockResolvedValue(mockMetrics),
              };
              mockSupabase.from.mockReturnValue(mockFrom);
              promises = Array(5)
                .fill(null)
                .map(function () {
                  return repository.getSubscriptionMetrics("monthly");
                });
              return [4 /*yield*/, Promise.all(promises)];
            case 1:
              _a.sent();
              // Assert - Should reuse connection
              (0, globals_1.expect)(mockCreateClient).toHaveBeenCalledTimes(1);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("should handle concurrent requests efficiently", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockData, mockFrom, startTime, promises, results, duration;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockData = {
                data: { total_subscriptions: 150 },
                error: null,
              };
              mockFrom = {
                select: globals_1.jest.fn().mockReturnThis(),
                eq: globals_1.jest.fn().mockReturnThis(),
                single: globals_1.jest.fn().mockResolvedValue(mockData),
              };
              mockSupabase.from.mockReturnValue(mockFrom);
              startTime = Date.now();
              promises = Array(10)
                .fill(null)
                .map(function () {
                  return repository.getSubscriptionMetrics("monthly");
                });
              return [4 /*yield*/, Promise.all(promises)];
            case 1:
              results = _a.sent();
              duration = Date.now() - startTime;
              // Assert
              (0, globals_1.expect)(results).toHaveLength(10);
              (0, globals_1.expect)(duration).toBeLessThan(2000); // Should handle concurrency efficiently
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
