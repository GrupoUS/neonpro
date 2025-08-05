/**
 * Vision Analysis Performance Monitoring API
 * GET /api/vision/performance
 *
 * Provides performance metrics and monitoring for computer vision analysis
 * Epic 10 - Story 10.1: Automated Before/After Analysis
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
exports.POST = exports.GET = void 0;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
var monitoring_1 = require("@/lib/monitoring");
// Query parameters validation
var performanceQuerySchema = zod_1.z.object({
  timeRange: zod_1.z.enum(["1h", "24h", "7d", "30d", "90d"]).default("24h"),
  groupBy: zod_1.z.enum(["hour", "day", "week"]).default("hour"),
  includeDetails: zod_1.z.boolean().default(false),
});
// GET - Performance metrics
exports.GET = (0, monitoring_1.withErrorMonitoring)((request) =>
  __awaiter(void 0, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      searchParams,
      queryParams,
      validatedParams_1,
      now,
      timeRangeMap,
      startTime,
      _b,
      performanceData,
      perfError,
      totalAnalyses,
      avgAccuracy,
      avgProcessingTime,
      avgConfidence,
      accuracyTarget_1,
      timeTarget_1,
      accuracyCompliance,
      timeCompliance,
      timeSeriesData,
      groupedData_1,
      treatmentBreakdown_1,
      treatmentStats,
      error_1;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          _c.label = 2;
        case 2:
          _c.trys.push([2, 5, , 6]);
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          queryParams = {
            timeRange: searchParams.get("timeRange") || "24h",
            groupBy: searchParams.get("groupBy") || "hour",
            includeDetails: searchParams.get("includeDetails") === "true",
          };
          validatedParams_1 = performanceQuerySchema.parse(queryParams);
          now = new Date();
          timeRangeMap = {
            "1h": 1 * 60 * 60 * 1000,
            "24h": 24 * 60 * 60 * 1000,
            "7d": 7 * 24 * 60 * 60 * 1000,
            "30d": 30 * 24 * 60 * 60 * 1000,
            "90d": 90 * 24 * 60 * 60 * 1000,
          };
          startTime = new Date(now.getTime() - timeRangeMap[validatedParams_1.timeRange]);
          return [
            4 /*yield*/,
            supabase
              .from("analysis_performance")
              .select(
                "\n        *,\n        image_analysis!inner(\n          id,\n          treatment_type,\n          status,\n          created_at\n        )\n      ",
              )
              .gte("created_at", startTime.toISOString())
              .order("created_at", { ascending: false }),
          ];
        case 4:
          (_b = _c.sent()), (performanceData = _b.data), (perfError = _b.error);
          if (perfError) {
            throw perfError;
          }
          totalAnalyses = performanceData.length;
          avgAccuracy =
            totalAnalyses > 0
              ? performanceData.reduce((sum, item) => sum + item.accuracy_score, 0) / totalAnalyses
              : 0;
          avgProcessingTime =
            totalAnalyses > 0
              ? performanceData.reduce((sum, item) => sum + item.processing_time_ms, 0) /
                totalAnalyses
              : 0;
          avgConfidence =
            totalAnalyses > 0
              ? performanceData.reduce((sum, item) => sum + item.confidence_score, 0) /
                totalAnalyses
              : 0;
          accuracyTarget_1 = 0.95;
          timeTarget_1 = 30000;
          accuracyCompliance =
            totalAnalyses > 0
              ? performanceData.filter((item) => item.accuracy_score >= accuracyTarget_1).length /
                totalAnalyses
              : 0;
          timeCompliance =
            totalAnalyses > 0
              ? performanceData.filter((item) => item.processing_time_ms <= timeTarget_1).length /
                totalAnalyses
              : 0;
          timeSeriesData = [];
          if (validatedParams_1.includeDetails) {
            groupedData_1 = new Map();
            performanceData.forEach((item) => {
              var date = new Date(item.created_at);
              var groupKey;
              switch (validatedParams_1.groupBy) {
                case "hour":
                  groupKey = ""
                    .concat(date.getFullYear(), "-")
                    .concat(String(date.getMonth() + 1).padStart(2, "0"), "-")
                    .concat(String(date.getDate()).padStart(2, "0"), " ")
                    .concat(String(date.getHours()).padStart(2, "0"), ":00");
                  break;
                case "day":
                  groupKey = ""
                    .concat(date.getFullYear(), "-")
                    .concat(String(date.getMonth() + 1).padStart(2, "0"), "-")
                    .concat(String(date.getDate()).padStart(2, "0"));
                  break;
                case "week": {
                  var weekStart = new Date(date);
                  weekStart.setDate(date.getDate() - date.getDay());
                  groupKey = ""
                    .concat(weekStart.getFullYear(), "-W")
                    .concat(Math.ceil(weekStart.getDate() / 7));
                  break;
                }
                default:
                  groupKey = date.toISOString().split("T")[0];
              }
              if (!groupedData_1.has(groupKey)) {
                groupedData_1.set(groupKey, {
                  timestamp: groupKey,
                  count: 0,
                  totalAccuracy: 0,
                  totalProcessingTime: 0,
                  totalConfidence: 0,
                  accuracyCompliant: 0,
                  timeCompliant: 0,
                });
              }
              var group = groupedData_1.get(groupKey);
              group.count++;
              group.totalAccuracy += item.accuracy_score;
              group.totalProcessingTime += item.processing_time_ms;
              group.totalConfidence += item.confidence_score;
              if (item.accuracy_score >= accuracyTarget_1) group.accuracyCompliant++;
              if (item.processing_time_ms <= timeTarget_1) group.timeCompliant++;
            });
            timeSeriesData = Array.from(groupedData_1.values())
              .map((group) => ({
                timestamp: group.timestamp,
                count: group.count,
                avgAccuracy: group.count > 0 ? group.totalAccuracy / group.count : 0,
                avgProcessingTime: group.count > 0 ? group.totalProcessingTime / group.count : 0,
                avgConfidence: group.count > 0 ? group.totalConfidence / group.count : 0,
                accuracyCompliance: group.count > 0 ? group.accuracyCompliant / group.count : 0,
                timeCompliance: group.count > 0 ? group.timeCompliant / group.count : 0,
              }))
              .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
          }
          treatmentBreakdown_1 = new Map();
          performanceData.forEach((item) => {
            var treatmentType = item.image_analysis.treatment_type;
            if (!treatmentBreakdown_1.has(treatmentType)) {
              treatmentBreakdown_1.set(treatmentType, {
                count: 0,
                totalAccuracy: 0,
                totalProcessingTime: 0,
                accuracyCompliant: 0,
                timeCompliant: 0,
              });
            }
            var breakdown = treatmentBreakdown_1.get(treatmentType);
            breakdown.count++;
            breakdown.totalAccuracy += item.accuracy_score;
            breakdown.totalProcessingTime += item.processing_time_ms;
            if (item.accuracy_score >= accuracyTarget_1) breakdown.accuracyCompliant++;
            if (item.processing_time_ms <= timeTarget_1) breakdown.timeCompliant++;
          });
          treatmentStats = Array.from(treatmentBreakdown_1.entries()).map((_a) => {
            var type = _a[0],
              stats = _a[1];
            return {
              treatmentType: type,
              count: stats.count,
              avgAccuracy: stats.count > 0 ? stats.totalAccuracy / stats.count : 0,
              avgProcessingTime: stats.count > 0 ? stats.totalProcessingTime / stats.count : 0,
              accuracyCompliance: stats.count > 0 ? stats.accuracyCompliant / stats.count : 0,
              timeCompliance: stats.count > 0 ? stats.timeCompliant / stats.count : 0,
            };
          });
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: __assign(
                {
                  summary: {
                    totalAnalyses: totalAnalyses,
                    avgAccuracy: avgAccuracy,
                    avgProcessingTime: avgProcessingTime,
                    avgConfidence: avgConfidence,
                    accuracyCompliance: accuracyCompliance,
                    timeCompliance: timeCompliance,
                    timeRange: validatedParams_1.timeRange,
                  },
                  targets: {
                    accuracyTarget: accuracyTarget_1,
                    timeTarget: timeTarget_1,
                    accuracyTargetMet: avgAccuracy >= accuracyTarget_1,
                    timeTargetMet: avgProcessingTime <= timeTarget_1,
                  },
                  treatmentBreakdown: treatmentStats,
                },
                validatedParams_1.includeDetails && { timeSeries: timeSeriesData },
              ),
            }),
          ];
        case 5:
          error_1 = _c.sent();
          console.error("Vision performance monitoring error:", error_1);
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Parâmetros de consulta inválidos",
                  details: error_1.errors,
                },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Erro interno do servidor",
                details: error_1 instanceof Error ? error_1.message : "Erro desconhecido",
              },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  }),
);
// POST - Record performance metric
exports.POST = (0, monitoring_1.withErrorMonitoring)((request) =>
  __awaiter(void 0, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      analysisId,
      processingTimeMs,
      accuracyScore,
      confidenceScore,
      memoryUsageMb,
      errorCount,
      _b,
      data,
      error,
      error_2;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          _c.label = 2;
        case 2:
          _c.trys.push([2, 6, , 7]);
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _c.sent();
          (analysisId = body.analysisId),
            (processingTimeMs = body.processingTimeMs),
            (accuracyScore = body.accuracyScore),
            (confidenceScore = body.confidenceScore),
            (memoryUsageMb = body.memoryUsageMb),
            (errorCount = body.errorCount);
          // Validate required fields
          if (
            !analysisId ||
            typeof processingTimeMs !== "number" ||
            typeof accuracyScore !== "number"
          ) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Campos obrigatórios: analysisId, processingTimeMs, accuracyScore" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("analysis_performance")
              .insert({
                analysis_id: analysisId,
                processing_time_ms: processingTimeMs,
                accuracy_score: accuracyScore,
                confidence_score: confidenceScore || 0,
                memory_usage_mb: memoryUsageMb || 0,
                error_count: errorCount || 0,
                user_id: user.id,
                created_at: new Date().toISOString(),
              })
              .select()
              .single(),
          ];
        case 5:
          (_b = _c.sent()), (data = _b.data), (error = _b.error);
          if (error) {
            throw error;
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: data,
            }),
          ];
        case 6:
          error_2 = _c.sent();
          console.error("Performance recording error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Erro interno do servidor",
                details: error_2 instanceof Error ? error_2.message : "Erro desconhecido",
              },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  }),
);
