"use strict";
// RETENTION CAMPAIGN ANALYTICS TESTS
// Epic 7.4: Patient Retention Analytics + Predictions - Task 5
// Test suite for campaign analytics and A/B testing functionality
// =====================================================================================
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
var node_mocks_http_1 = require("node-mocks-http");
var route_1 = require("@/app/api/retention-analytics/campaigns/analytics/route");
// =====================================================================================
// ANALYTICS TESTS
// =====================================================================================
describe("/api/retention-analytics/campaigns/analytics", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });
  describe("GET - Campaign Analytics", function () {
    it("should return campaign analytics with performance metrics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res, responseData;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: "/api/retention-analytics/campaigns/analytics?clinic_id=22222222-2222-2222-2222-222222222222",
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.GET)(req)];
            case 1:
              _b.sent();
              expect(res._getStatusCode()).toBe(200);
              responseData = JSON.parse(res._getData());
              expect(responseData.success).toBe(true);
              expect(responseData.data.analytics).toBeDefined();
              expect(responseData.data.summary).toBeDefined();
              expect(responseData.data.summary.totalCampaigns).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      });
    });
    it("should filter analytics by campaign IDs", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var campaignIds, _a, req, res, responseData;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              campaignIds =
                "11111111-1111-1111-1111-111111111111,55555555-5555-5555-5555-555555555555";
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: "/api/retention-analytics/campaigns/analytics?clinic_id=22222222-2222-2222-2222-222222222222&campaign_ids=".concat(
                  campaignIds,
                ),
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.GET)(req)];
            case 1:
              _b.sent();
              responseData = JSON.parse(res._getData());
              expect(responseData.data.analytics).toHaveLength(2);
              expect(
                responseData.data.analytics.every(function (a) {
                  return campaignIds.includes(a.campaignId);
                }),
              ).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
    it("should group analytics by intervention type", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res, responseData;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: "/api/retention-analytics/campaigns/analytics?clinic_id=22222222-2222-2222-2222-222222222222&group_by=intervention_type",
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.GET)(req)];
            case 1:
              _b.sent();
              responseData = JSON.parse(res._getData());
              expect(responseData.data.analytics[0].groupKey).toBeDefined();
              expect(responseData.data.analytics[0].aggregated).toBeDefined();
              expect(responseData.data.analytics[0].aggregated.totalCampaigns).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      });
    });
    it("should include industry benchmarks when comparison is requested", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res, responseData;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: "/api/retention-analytics/campaigns/analytics?clinic_id=22222222-2222-2222-2222-222222222222&include_comparison=true",
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.GET)(req)];
            case 1:
              _b.sent();
              responseData = JSON.parse(res._getData());
              expect(responseData.data.comparison).toBeDefined();
              expect(responseData.data.comparison.industryBenchmarks).toBeDefined();
              expect(responseData.data.comparison.clinicAverages).toBeDefined();
              expect(responseData.data.comparison.performanceVsBenchmark).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
    it("should filter analytics by date range", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var startDate, endDate, _a, req, res, responseData;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              startDate = "2024-01-01T00:00:00Z";
              endDate = "2024-01-31T23:59:59Z";
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: "/api/retention-analytics/campaigns/analytics?clinic_id=22222222-2222-2222-2222-222222222222&start_date="
                  .concat(startDate, "&end_date=")
                  .concat(endDate),
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.GET)(req)];
            case 1:
              _b.sent();
              responseData = JSON.parse(res._getData());
              expect(responseData.data.dateRange).toBeDefined();
              expect(responseData.data.dateRange.startDate).toBe(startDate);
              expect(responseData.data.dateRange.endDate).toBe(endDate);
              return [2 /*return*/];
          }
        });
      });
    });
    it("should validate required clinic_id parameter", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res, responseData;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: "/api/retention-analytics/campaigns/analytics",
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.GET)(req)];
            case 1:
              _b.sent();
              expect(res._getStatusCode()).toBe(400);
              responseData = JSON.parse(res._getData());
              expect(responseData.error).toBe("Invalid analytics query");
              return [2 /*return*/];
          }
        });
      });
    });
    it("should calculate correct performance metrics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res, responseData, analytics;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: "/api/retention-analytics/campaigns/analytics?clinic_id=22222222-2222-2222-2222-222222222222",
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.GET)(req)];
            case 1:
              _b.sent();
              responseData = JSON.parse(res._getData());
              analytics = responseData.data.analytics[0];
              // Validate performance calculations
              expect(analytics.performance.deliveryRate).toBeCloseTo(95.0, 1); // 950/1000 * 100
              expect(analytics.performance.openRate).toBeCloseTo(40.0, 1); // 380/950 * 100
              expect(analytics.performance.clickRate).toBeCloseTo(20.0, 1); // 76/380 * 100
              expect(analytics.performance.conversionRate).toBeCloseTo(4.5, 1); // 45/1000 * 100
              expect(analytics.performance.roi).toBeCloseTo(1775.0, 1); // ((22500-1200)/1200) * 100
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("POST - A/B Test Results", function () {
    it("should generate A/B test results for enabled campaigns", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var abTestData, _a, req, res, responseData;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              abTestData = {
                campaignId: "11111111-1111-1111-1111-111111111111",
                testDurationDays: 30,
                confidenceLevel: 0.95,
              };
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "POST",
                body: abTestData,
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.POST)(req)];
            case 1:
              _b.sent();
              expect(res._getStatusCode()).toBe(200);
              responseData = JSON.parse(res._getData());
              expect(responseData.success).toBe(true);
              expect(responseData.data.results.groupA).toBeDefined();
              expect(responseData.data.results.groupB).toBeDefined();
              expect(responseData.data.results.statisticalAnalysis).toBeDefined();
              expect(responseData.data.results.conclusion).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
    it("should calculate statistical significance correctly", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var abTestData, _a, req, res, responseData, analysis;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              abTestData = {
                campaignId: "11111111-1111-1111-1111-111111111111",
                testDurationDays: 30,
                confidenceLevel: 0.95,
              };
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "POST",
                body: abTestData,
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.POST)(req)];
            case 1:
              _b.sent();
              responseData = JSON.parse(res._getData());
              analysis = responseData.data.results.statisticalAnalysis;
              expect(analysis.zScore).toBeGreaterThan(0);
              expect(analysis.criticalValue).toBe(1.96); // For 95% confidence
              expect(analysis.confidenceLevel).toBe(95);
              expect(typeof analysis.isStatisticallySignificant).toBe("boolean");
              return [2 /*return*/];
          }
        });
      });
    });
    it("should provide actionable recommendations", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var abTestData, _a, req, res, responseData, conclusion;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              abTestData = {
                campaignId: "11111111-1111-1111-1111-111111111111",
                testDurationDays: 60,
                confidenceLevel: 0.99,
              };
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "POST",
                body: abTestData,
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.POST)(req)];
            case 1:
              _b.sent();
              responseData = JSON.parse(res._getData());
              conclusion = responseData.data.results.conclusion;
              expect(conclusion.winner).toMatch(/^[AB]$/);
              expect(typeof conclusion.improvement).toBe("string");
              expect(conclusion.recommendation).toBeDefined();
              expect(conclusion.recommendation.length).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle campaigns without A/B testing enabled", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockSupabase, abTestData, _a, req, res, responseData;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              mockSupabase = require("@/app/utils/supabase/server").createClient();
              mockSupabase
                .from()
                .select()
                .eq()
                .single.mockReturnValueOnce({
                  data: __assign(__assign({}, mockCampaigns[1]), {
                    measurement_criteria: __assign(
                      __assign({}, mockCampaigns[1].measurement_criteria),
                      { abtest_enabled: false },
                    ),
                  }),
                  error: null,
                });
              abTestData = {
                campaignId: "55555555-5555-5555-5555-555555555555",
                testDurationDays: 30,
                confidenceLevel: 0.95,
              };
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "POST",
                body: abTestData,
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.POST)(req)];
            case 1:
              _b.sent();
              expect(res._getStatusCode()).toBe(400);
              responseData = JSON.parse(res._getData());
              expect(responseData.error).toBe("A/B testing is not enabled for this campaign");
              return [2 /*return*/];
          }
        });
      });
    });
    it("should validate campaign existence", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockSupabase, abTestData, _a, req, res, responseData;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              mockSupabase = require("@/app/utils/supabase/server").createClient();
              mockSupabase
                .from()
                .select()
                .eq()
                .single.mockReturnValueOnce({
                  data: null,
                  error: { message: "Campaign not found" },
                });
              abTestData = {
                campaignId: "99999999-9999-9999-9999-999999999999",
                testDurationDays: 30,
                confidenceLevel: 0.95,
              };
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "POST",
                body: abTestData,
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.POST)(req)];
            case 1:
              _b.sent();
              expect(res._getStatusCode()).toBe(404);
              responseData = JSON.parse(res._getData());
              expect(responseData.error).toBe("Campaign not found");
              return [2 /*return*/];
          }
        });
      });
    });
    it("should validate input parameters", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var invalidData, _a, req, res, responseData;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              invalidData = {
                campaignId: "invalid-uuid",
                testDurationDays: 0,
                confidenceLevel: 1.5,
              };
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "POST",
                body: invalidData,
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.POST)(req)];
            case 1:
              _b.sent();
              expect(res._getStatusCode()).toBe(400);
              responseData = JSON.parse(res._getData());
              expect(responseData.error).toBe("Invalid A/B test query");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Analytics Edge Cases", function () {
    it("should handle campaigns with zero metrics gracefully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockSupabase, _a, req, res, responseData, analytics;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              mockSupabase = require("@/app/utils/supabase/server").createClient();
              mockSupabase
                .from()
                .select()
                .eq()
                .order.mockReturnValueOnce({
                  data: [
                    __assign(__assign({}, mockCampaigns[0]), {
                      campaign_metrics: [
                        {
                          sent: 0,
                          delivered: 0,
                          opened: 0,
                          clicked: 0,
                          conversions: 0,
                          revenue: 0,
                          costs: 0,
                        },
                      ],
                      executions: [],
                    }),
                  ],
                  error: null,
                });
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: "/api/retention-analytics/campaigns/analytics?clinic_id=22222222-2222-2222-2222-222222222222",
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.GET)(req)];
            case 1:
              _b.sent();
              responseData = JSON.parse(res._getData());
              analytics = responseData.data.analytics[0];
              expect(analytics.performance.deliveryRate).toBe(0);
              expect(analytics.performance.openRate).toBe(0);
              expect(analytics.performance.clickRate).toBe(0);
              expect(analytics.performance.conversionRate).toBe(0);
              expect(analytics.performance.roi).toBe(0);
              return [2 /*return*/];
          }
        });
      });
    });
    it("should calculate aggregated metrics correctly for grouped analytics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res, responseData, groupedAnalytics;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: "/api/retention-analytics/campaigns/analytics?clinic_id=22222222-2222-2222-2222-222222222222&group_by=campaign",
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.GET)(req)];
            case 1:
              _b.sent();
              responseData = JSON.parse(res._getData());
              groupedAnalytics = responseData.data.analytics[0];
              expect(groupedAnalytics.aggregated.totalCampaigns).toBeGreaterThan(0);
              expect(groupedAnalytics.aggregated.aggregatedMetrics.sent).toBeGreaterThanOrEqual(0);
              expect(groupedAnalytics.aggregated.averagePerformance).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle missing campaign metrics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockSupabase, _a, req, res, responseData;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              mockSupabase = require("@/app/utils/supabase/server").createClient();
              mockSupabase
                .from()
                .select()
                .eq()
                .order.mockReturnValueOnce({
                  data: [
                    __assign(__assign({}, mockCampaigns[0]), {
                      campaign_metrics: [],
                      executions: [],
                    }),
                  ],
                  error: null,
                });
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: "/api/retention-analytics/campaigns/analytics?clinic_id=22222222-2222-2222-2222-222222222222",
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.GET)(req)];
            case 1:
              _b.sent();
              expect(res._getStatusCode()).toBe(200);
              responseData = JSON.parse(res._getData());
              expect(responseData.data.analytics).toHaveLength(1);
              expect(responseData.data.analytics[0].metrics.sent).toBe(0);
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
