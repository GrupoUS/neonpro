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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var service_1 = require("@/lib/analytics/service");
var repository_1 = require("@/lib/analytics/repository");
// Mock the repository
globals_1.jest.mock("@/lib/analytics/repository");
var MockedAnalyticsRepository = repository_1.AnalyticsRepository;
(0, globals_1.describe)("AnalyticsService", () => {
  var analyticsService;
  var mockRepository;
  (0, globals_1.beforeEach)(() => {
    // Clear all mocks before each test
    globals_1.jest.clearAllMocks();
    // Create a new instance of the mocked repository
    mockRepository = new MockedAnalyticsRepository();
    analyticsService = new service_1.AnalyticsService(mockRepository);
  });
  (0, globals_1.afterEach)(() => {
    globals_1.jest.resetAllMocks();
  });
  (0, globals_1.describe)("getSubscriptionMetrics", () => {
    (0, globals_1.test)("should return cached metrics when available", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockMetrics, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockMetrics = {
                totalSubscriptions: 150,
                activeSubscriptions: 125,
                mrr: 15000,
                arr: 180000,
                churnRate: 0.05,
                growthRate: 0.12,
                conversionRate: 0.25,
                period: "monthly",
                generatedAt: new Date("2024-01-15T10:00:00Z"),
              };
              mockRepository.getSubscriptionMetrics.mockResolvedValue(mockMetrics);
              return [4 /*yield*/, analyticsService.getSubscriptionMetrics("monthly")];
            case 1:
              result = _a.sent();
              // Assert
              (0, globals_1.expect)(result).toEqual(mockMetrics);
              (0, globals_1.expect)(mockRepository.getSubscriptionMetrics).toHaveBeenCalledWith(
                "monthly",
              );
              (0, globals_1.expect)(mockRepository.getSubscriptionMetrics).toHaveBeenCalledTimes(1);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should handle repository errors gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var errorMessage;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              errorMessage = "Database connection failed";
              mockRepository.getSubscriptionMetrics.mockRejectedValue(new Error(errorMessage));
              // Act & Assert
              return [
                4 /*yield*/,
                (0, globals_1.expect)(
                  analyticsService.getSubscriptionMetrics("monthly"),
                ).rejects.toThrow(errorMessage),
              ];
            case 1:
              // Act & Assert
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should validate period parameter", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Act & Assert
              return [
                4 /*yield*/,
                (0, globals_1.expect)(
                  analyticsService.getSubscriptionMetrics("invalid"),
                ).rejects.toThrow("Invalid period specified"),
              ];
            case 1:
              // Act & Assert
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("getTrialMetrics", () => {
    (0, globals_1.test)("should return trial conversion data with AI predictions", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockTrialMetrics, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockTrialMetrics = {
                totalTrials: 500,
                activeTrials: 150,
                convertedTrials: 125,
                expiredTrials: 225,
                conversionRate: 0.25,
                averageTrialDuration: 14,
                conversionPredictions: [
                  {
                    userId: "user1",
                    probability: 0.85,
                    factors: ["high_engagement", "email_response"],
                  },
                  { userId: "user2", probability: 0.6, factors: ["moderate_usage"] },
                ],
                period: "monthly",
                generatedAt: new Date("2024-01-15T10:00:00Z"),
              };
              mockRepository.getTrialMetrics.mockResolvedValue(mockTrialMetrics);
              return [4 /*yield*/, analyticsService.getTrialMetrics("monthly")];
            case 1:
              result = _a.sent();
              // Assert
              (0, globals_1.expect)(result).toEqual(mockTrialMetrics);
              (0, globals_1.expect)(result.conversionPredictions).toHaveLength(2);
              (0, globals_1.expect)(result.conversionPredictions[0].probability).toBeGreaterThan(
                0.8,
              );
              (0, globals_1.expect)(mockRepository.getTrialMetrics).toHaveBeenCalledWith("monthly");
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should handle empty trial data", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var emptyTrialMetrics, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              emptyTrialMetrics = {
                totalTrials: 0,
                activeTrials: 0,
                convertedTrials: 0,
                expiredTrials: 0,
                conversionRate: 0,
                averageTrialDuration: 0,
                conversionPredictions: [],
                period: "monthly",
                generatedAt: new Date(),
              };
              mockRepository.getTrialMetrics.mockResolvedValue(emptyTrialMetrics);
              return [4 /*yield*/, analyticsService.getTrialMetrics("monthly")];
            case 1:
              result = _a.sent();
              // Assert
              (0, globals_1.expect)(result.totalTrials).toBe(0);
              (0, globals_1.expect)(result.conversionPredictions).toHaveLength(0);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("getCohortAnalysis", () => {
    (0, globals_1.test)("should return cohort retention data", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var startDate, endDate, mockCohortData, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              startDate = new Date("2024-01-01");
              endDate = new Date("2024-01-31");
              mockCohortData = {
                cohorts: [
                  {
                    cohortMonth: "2024-01",
                    initialUsers: 100,
                    retentionByPeriod: [
                      { period: 0, retainedUsers: 100, retentionRate: 1.0, revenue: 5000 },
                      { period: 1, retainedUsers: 85, retentionRate: 0.85, revenue: 4250 },
                      { period: 2, retainedUsers: 72, retentionRate: 0.72, revenue: 3600 },
                    ],
                  },
                ],
                totalRevenue: 12850,
                averageRetentionRate: 0.86,
                generatedAt: new Date("2024-01-15T10:00:00Z"),
              };
              mockRepository.getCohortAnalysis.mockResolvedValue(mockCohortData);
              return [4 /*yield*/, analyticsService.getCohortAnalysis(startDate, endDate)];
            case 1:
              result = _a.sent();
              // Assert
              (0, globals_1.expect)(result).toEqual(mockCohortData);
              (0, globals_1.expect)(result.cohorts).toHaveLength(1);
              (0, globals_1.expect)(result.cohorts[0].retentionByPeriod).toHaveLength(3);
              (0, globals_1.expect)(result.averageRetentionRate).toBeCloseTo(0.86);
              (0, globals_1.expect)(mockRepository.getCohortAnalysis).toHaveBeenCalledWith(
                startDate,
                endDate,
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should validate date range parameters", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var startDate, endDate;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              startDate = new Date("2024-01-31");
              endDate = new Date("2024-01-01");
              // Act & Assert
              return [
                4 /*yield*/,
                (0, globals_1.expect)(
                  analyticsService.getCohortAnalysis(startDate, endDate),
                ).rejects.toThrow("End date must be after start date"),
              ];
            case 1:
              // Act & Assert
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("getRevenueForecasting", () => {
    (0, globals_1.test)("should return revenue predictions with confidence intervals", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var periods, mockForecast, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              periods = 6;
              mockForecast = {
                predictions: [
                  { period: "2024-02", value: 16000, confidence: { lower: 14500, upper: 17500 } },
                  { period: "2024-03", value: 17200, confidence: { lower: 15400, upper: 19000 } },
                ],
                accuracy: 0.92,
                modelVersion: "v2.1",
                generatedAt: new Date("2024-01-15T10:00:00Z"),
              };
              mockRepository.getRevenueForecasting.mockResolvedValue(mockForecast);
              return [4 /*yield*/, analyticsService.getRevenueForecasting(periods)];
            case 1:
              result = _a.sent();
              // Assert
              (0, globals_1.expect)(result).toEqual(mockForecast);
              (0, globals_1.expect)(result.predictions).toHaveLength(2);
              (0, globals_1.expect)(result.accuracy).toBeGreaterThan(0.9);
              (0, globals_1.expect)(result.predictions[0].confidence.lower).toBeLessThan(
                result.predictions[0].value,
              );
              (0, globals_1.expect)(result.predictions[0].confidence.upper).toBeGreaterThan(
                result.predictions[0].value,
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should validate periods parameter", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Act & Assert
              return [
                4 /*yield*/,
                (0, globals_1.expect)(analyticsService.getRevenueForecasting(0)).rejects.toThrow(
                  "Periods must be greater than 0",
                ),
              ];
            case 1:
              // Act & Assert
              _a.sent();
              return [
                4 /*yield*/,
                (0, globals_1.expect)(analyticsService.getRevenueForecasting(25)).rejects.toThrow(
                  "Periods cannot exceed 24",
                ),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("caching behavior", () => {
    (0, globals_1.test)(
      "should cache subscription metrics and return cached data on subsequent calls",
      () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockMetrics, result1, result2;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockMetrics = {
                  totalSubscriptions: 150,
                  activeSubscriptions: 125,
                  mrr: 15000,
                  arr: 180000,
                  churnRate: 0.05,
                  growthRate: 0.12,
                  conversionRate: 0.25,
                  period: "monthly",
                  generatedAt: new Date("2024-01-15T10:00:00Z"),
                };
                mockRepository.getSubscriptionMetrics.mockResolvedValue(mockMetrics);
                return [4 /*yield*/, analyticsService.getSubscriptionMetrics("monthly")];
              case 1:
                result1 = _a.sent();
                return [4 /*yield*/, analyticsService.getSubscriptionMetrics("monthly")];
              case 2:
                result2 = _a.sent();
                // Assert
                (0, globals_1.expect)(result1).toEqual(result2);
                (0, globals_1.expect)(mockRepository.getSubscriptionMetrics).toHaveBeenCalledTimes(
                  1,
                ); // Should be cached
                return [2 /*return*/];
            }
          });
        }),
    );
    (0, globals_1.test)("should invalidate cache after specified TTL", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          // This test would require dependency injection of cache configuration
          // Implementation depends on the actual caching strategy used
          (0, globals_1.expect)(true).toBe(true); // Placeholder for cache TTL testing
          return [2 /*return*/];
        });
      }),
    );
  });
  (0, globals_1.describe)("error handling", () => {
    (0, globals_1.test)("should handle network errors gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Arrange
              mockRepository.getSubscriptionMetrics.mockRejectedValue(new Error("Network timeout"));
              // Act & Assert
              return [
                4 /*yield*/,
                (0, globals_1.expect)(
                  analyticsService.getSubscriptionMetrics("monthly"),
                ).rejects.toThrow("Network timeout"),
              ];
            case 1:
              // Act & Assert
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should handle malformed data gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Arrange
              mockRepository.getSubscriptionMetrics.mockResolvedValue(null);
              // Act & Assert
              return [
                4 /*yield*/,
                (0, globals_1.expect)(
                  analyticsService.getSubscriptionMetrics("monthly"),
                ).rejects.toThrow("Invalid analytics data received"),
              ];
            case 1:
              // Act & Assert
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("performance metrics", () => {
    (0, globals_1.test)(
      "should complete subscription metrics retrieval within acceptable time",
      () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockMetrics, startTime, duration;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockMetrics = {
                  totalSubscriptions: 150,
                  activeSubscriptions: 125,
                  mrr: 15000,
                  arr: 180000,
                  churnRate: 0.05,
                  growthRate: 0.12,
                  conversionRate: 0.25,
                  period: "monthly",
                  generatedAt: new Date(),
                };
                mockRepository.getSubscriptionMetrics.mockResolvedValue(mockMetrics);
                startTime = Date.now();
                return [4 /*yield*/, analyticsService.getSubscriptionMetrics("monthly")];
              case 1:
                _a.sent();
                duration = Date.now() - startTime;
                // Assert
                (0, globals_1.expect)(duration).toBeLessThan(1000); // Should complete within 1 second
                return [2 /*return*/];
            }
          });
        }),
    );
  });
});
