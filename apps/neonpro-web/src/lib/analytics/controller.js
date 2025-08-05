// Analytics Controller Layer - STORY-SUB-002 Task 2
// API route handlers for analytics endpoints
// Created: 2025-01-22
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = exports.AnalyticsController = void 0;
var server_1 = require("next/server");
var service_1 = require("./service");
var types_1 = require("./types");
var zod_1 = require("zod");
var AnalyticsController = /** @class */ (() => {
  function AnalyticsController() {
    this.service = new service_1.AnalyticsService();
  }
  // ========================================================================
  // REVENUE ANALYTICS ENDPOINT
  // ========================================================================
  AnalyticsController.prototype.handleRevenueAnalytics = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var searchParams, queryParams, period, startDate, endDate, filters, analytics, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            searchParams = new URL(request.url).searchParams;
            queryParams = {
              period: searchParams.get("period") || "month",
              startDate: searchParams.get("startDate"),
              endDate: searchParams.get("endDate"),
              tier: searchParams.get("tier"),
              currency: searchParams.get("currency") || "USD",
            };
            period = types_1.MetricPeriodSchema.parse(queryParams.period);
            startDate = queryParams.startDate
              ? new Date(queryParams.startDate)
              : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
            endDate = queryParams.endDate ? new Date(queryParams.endDate) : new Date();
            filters = { currency: queryParams.currency };
            if (queryParams.tier) filters.tier = queryParams.tier;
            return [
              4 /*yield*/,
              this.service.getRevenueAnalytics(period, startDate, endDate, filters),
            ];
          case 1:
            analytics = _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json(analytics, {
                status: 200,
                headers: {
                  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
                  "Content-Type": "application/json",
                },
              }),
            ];
          case 2:
            error_1 = _a.sent();
            return [2 /*return*/, this.handleError(error_1)];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  }; // ========================================================================
  // CONVERSION ANALYTICS ENDPOINT
  // ========================================================================
  AnalyticsController.prototype.handleConversionAnalytics = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var searchParams, queryParams, period, startDate, endDate, filters, analytics, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            searchParams = new URL(request.url).searchParams;
            queryParams = {
              period: searchParams.get("period") || "month",
              startDate: searchParams.get("startDate"),
              endDate: searchParams.get("endDate"),
              source: searchParams.get("source"),
              stage: searchParams.get("stage"),
            };
            period = types_1.MetricPeriodSchema.parse(queryParams.period);
            startDate = queryParams.startDate
              ? new Date(queryParams.startDate)
              : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            endDate = queryParams.endDate ? new Date(queryParams.endDate) : new Date();
            filters = {};
            if (queryParams.source) filters.source = queryParams.source;
            if (queryParams.stage) filters.stage = queryParams.stage;
            return [
              4 /*yield*/,
              this.service.getConversionAnalytics(period, startDate, endDate, filters),
            ];
          case 1:
            analytics = _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json(analytics, {
                status: 200,
                headers: {
                  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
                },
              }),
            ];
          case 2:
            error_2 = _a.sent();
            return [2 /*return*/, this.handleError(error_2)];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ========================================================================
  // REAL-TIME METRICS ENDPOINT
  // ========================================================================
  AnalyticsController.prototype.handleRealTimeMetrics = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var metrics, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.service.getRealTimeMetrics()];
          case 1:
            metrics = _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  data: metrics,
                  timestamp: new Date().toISOString(),
                },
                {
                  status: 200,
                  headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Content-Type": "application/json",
                  },
                },
              ),
            ];
          case 2:
            error_3 = _a.sent();
            return [2 /*return*/, this.handleError(error_3)];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  }; // ========================================================================
  // TRIAL PREDICTION ENDPOINT
  // ========================================================================
  AnalyticsController.prototype.handleTrialPrediction = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var searchParams, userId, trialId, prediction, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            searchParams = new URL(request.url).searchParams;
            userId = searchParams.get("userId");
            trialId = searchParams.get("trialId");
            if (!userId || !trialId) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "userId and trialId are required" },
                  { status: 400 },
                ),
              ];
            }
            return [4 /*yield*/, this.service.predictTrialConversion(userId, trialId)];
          case 1:
            prediction = _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  data: prediction,
                  metadata: {
                    generatedAt: new Date().toISOString(),
                    model: "engagement-based-v1",
                    version: "1.0.0",
                  },
                },
                {
                  status: 200,
                  headers: {
                    "Cache-Control": "private, max-age=3600", // 1 hour cache for predictions
                  },
                },
              ),
            ];
          case 2:
            error_4 = _a.sent();
            return [2 /*return*/, this.handleError(error_4)];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ========================================================================
  // BULK ANALYTICS ENDPOINT (POST)
  // ========================================================================
  AnalyticsController.prototype.handleBulkAnalytics = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var body, queries, results, error_5;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, request.json()];
          case 1:
            body = _a.sent();
            queries = zod_1.z.array(types_1.AnalyticsQuerySchema).parse(body.queries);
            return [
              4 /*yield*/,
              Promise.all(
                queries.map((query) =>
                  __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          if (!query.metrics.includes("revenue")) return [3 /*break*/, 2];
                          return [
                            4 /*yield*/,
                            this.service.getRevenueAnalytics(
                              query.period,
                              query.startDate,
                              query.endDate,
                              query.filters,
                            ),
                          ];
                        case 1:
                          return [2 /*return*/, _a.sent()];
                        case 2:
                          if (!query.metrics.includes("conversion")) return [3 /*break*/, 4];
                          return [
                            4 /*yield*/,
                            this.service.getConversionAnalytics(
                              query.period,
                              query.startDate,
                              query.endDate,
                              query.filters,
                            ),
                          ];
                        case 3:
                          return [2 /*return*/, _a.sent()];
                        case 4:
                          throw new Error("Unsupported metrics: ".concat(query.metrics.join(", ")));
                      }
                    });
                  }),
                ),
              ),
            ];
          case 2:
            results = _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                data: results,
                metadata: {
                  totalQueries: queries.length,
                  executedAt: new Date().toISOString(),
                },
              }),
            ];
          case 3:
            error_5 = _a.sent();
            return [2 /*return*/, this.handleError(error_5)];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  }; // ========================================================================
  // ERROR HANDLING & UTILITIES
  // ========================================================================
  AnalyticsController.prototype.handleError = (error) => {
    console.error("Analytics API Error:", error);
    if (error instanceof zod_1.z.ZodError) {
      return server_1.NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 },
      );
    }
    if (error instanceof Error) {
      return server_1.NextResponse.json({ error: error.message }, { status: 500 });
    }
    return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
  };
  // Health check endpoint
  AnalyticsController.prototype.handleHealthCheck = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var metrics, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.service.getRealTimeMetrics()];
          case 1:
            metrics = _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                status: "healthy",
                timestamp: new Date().toISOString(),
                version: "1.0.0",
                metrics: {
                  available: metrics.length > 0,
                  count: metrics.length,
                },
              }),
            ];
          case 2:
            error_6 = _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  status: "unhealthy",
                  timestamp: new Date().toISOString(),
                  error: error_6 instanceof Error ? error_6.message : "Unknown error",
                },
                { status: 503 },
              ),
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return AnalyticsController;
})();
exports.AnalyticsController = AnalyticsController;
// Export singleton instance
exports.analyticsController = new AnalyticsController();
