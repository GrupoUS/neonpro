"use strict";
/**
 * NeonPro Revenue Optimization API
 *
 * API endpoints for revenue optimization engine:
 * - Dynamic pricing optimization
 * - Service mix optimization
 * - Customer lifetime value enhancement
 * - Automated revenue recommendations
 * - Competitive analysis and benchmarking
 * - ROI tracking and performance monitoring
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
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var revenue_optimization_engine_1 = require("@/lib/financial/revenue-optimization-engine");
var zod_1 = require("zod");
// 🔥 Request Schemas
var PricingOptimizationRequestSchema = zod_1.z.object({
  clinicId: zod_1.z.string().uuid(),
  serviceId: zod_1.z.string().uuid().optional(),
});
var ServiceMixRequestSchema = zod_1.z.object({
  clinicId: zod_1.z.string().uuid(),
});
var CLVRequestSchema = zod_1.z.object({
  clinicId: zod_1.z.string().uuid(),
  patientId: zod_1.z.string().uuid().optional(),
});
var AutomatedRecommendationsRequestSchema = zod_1.z.object({
  clinicId: zod_1.z.string().uuid(),
});
var CompetitiveAnalysisRequestSchema = zod_1.z.object({
  clinicId: zod_1.z.string().uuid(),
});
var ROITrackingRequestSchema = zod_1.z.object({
  clinicId: zod_1.z.string().uuid(),
  optimizationId: zod_1.z.string().uuid().optional(),
});
// 🎯 GET: Comprehensive Revenue Optimization Overview
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      searchParams,
      clinicId,
      professional,
      _b,
      pricingOptimization,
      serviceMixOptimization,
      clvEnhancement,
      automatedRecommendations,
      competitiveAnalysis,
      roiTracking,
      optimizations,
      overview,
      error_1;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          clinicId = searchParams.get("clinicId");
          if (!clinicId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Clinic ID is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("professionals")
              .select("clinic_id")
              .eq("user_id", user.id)
              .eq("clinic_id", clinicId)
              .eq("is_active", true)
              .single(),
          ];
        case 3:
          professional = _c.sent().data;
          if (!professional) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Access denied" }, { status: 403 }),
            ];
          }
          return [
            4 /*yield*/,
            Promise.all([
              (0, revenue_optimization_engine_1.createrevenueOptimizationEngine)().optimizePricing(
                clinicId,
              ),
              (0,
              revenue_optimization_engine_1.createrevenueOptimizationEngine)().optimizeServiceMix(
                clinicId,
              ),
              (0, revenue_optimization_engine_1.createrevenueOptimizationEngine)().enhanceCLV(
                clinicId,
              ),
              (0,
              revenue_optimization_engine_1.createrevenueOptimizationEngine)().generateAutomatedRecommendations(
                clinicId,
              ),
              (0,
              revenue_optimization_engine_1.createrevenueOptimizationEngine)().getCompetitiveAnalysis(
                clinicId,
              ),
              (0, revenue_optimization_engine_1.createrevenueOptimizationEngine)().trackROI(
                clinicId,
              ),
            ]),
          ];
        case 4:
          (_b = _c.sent()),
            (pricingOptimization = _b[0]),
            (serviceMixOptimization = _b[1]),
            (clvEnhancement = _b[2]),
            (automatedRecommendations = _b[3]),
            (competitiveAnalysis = _b[4]),
            (roiTracking = _b[5]);
          return [
            4 /*yield*/,
            supabase
              .from("revenue_optimizations")
              .select("*")
              .eq("clinic_id", clinicId)
              .order("created_at", { ascending: false }),
          ];
        case 5:
          optimizations = _c.sent().data;
          overview = {
            summary: {
              totalOptimizations:
                (optimizations === null || optimizations === void 0
                  ? void 0
                  : optimizations.length) || 0,
              activeOptimizations:
                (optimizations === null || optimizations === void 0
                  ? void 0
                  : optimizations.filter(function (o) {
                      return o.status === "active";
                    }).length) || 0,
              completedOptimizations:
                (optimizations === null || optimizations === void 0
                  ? void 0
                  : optimizations.filter(function (o) {
                      return o.status === "completed";
                    }).length) || 0,
              totalProjectedIncrease: automatedRecommendations.totalProjectedIncrease,
              averageROI: roiTracking.performanceIndicators.overallROI,
              successRate: roiTracking.performanceIndicators.successRate,
            },
            pricing: {
              currentStrategy: pricingOptimization.currentStrategy,
              recommendations: pricingOptimization.recommendations,
              projectedIncrease: pricingOptimization.projectedIncrease,
            },
            serviceMix: {
              profitabilityGain: serviceMixOptimization.profitabilityGain,
              recommendations: serviceMixOptimization.recommendations,
            },
            clv: {
              projectedIncrease: clvEnhancement.projectedIncrease,
              enhancementStrategies: clvEnhancement.enhancementStrategies,
            },
            automated: {
              recommendations: automatedRecommendations.recommendations,
              implementationPlan: automatedRecommendations.implementationPlan,
            },
            competitive: {
              marketPosition: competitiveAnalysis.marketPosition,
              opportunityAreas: competitiveAnalysis.opportunityAreas,
            },
            performance: {
              roiMetrics: roiTracking.roiMetrics,
              trendAnalysis: roiTracking.trendAnalysis,
              recommendations: roiTracking.recommendations,
            },
          };
          return [2 /*return*/, server_1.NextResponse.json(overview)];
        case 6:
          error_1 = _c.sent();
          console.error("Error getting revenue optimization overview:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to get revenue optimization overview" },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
} // 🎯 POST: Create New Revenue Optimization
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      optimizationType,
      clinicId,
      optimizationData,
      professional,
      result,
      _b,
      pricingRequest,
      serviceMixRequest,
      clvRequest,
      automatedRequest,
      competitiveRequest,
      roiRequest,
      optimizationRecord,
      _c,
      optimization,
      error,
      error_2;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 20, , 21]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _d.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _d.sent();
          (optimizationType = body.optimizationType),
            (clinicId = body.clinicId),
            (optimizationData = __rest(body, ["optimizationType", "clinicId"]));
          if (!optimizationType || !clinicId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Optimization type and clinic ID are required" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("professionals")
              .select("clinic_id")
              .eq("user_id", user.id)
              .eq("clinic_id", clinicId)
              .eq("is_active", true)
              .single(),
          ];
        case 4:
          professional = _d.sent().data;
          if (!professional) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Access denied" }, { status: 403 }),
            ];
          }
          result = void 0;
          _b = optimizationType;
          switch (_b) {
            case "pricing":
              return [3 /*break*/, 5];
            case "service_mix":
              return [3 /*break*/, 7];
            case "clv":
              return [3 /*break*/, 9];
            case "automated":
              return [3 /*break*/, 11];
            case "competitive":
              return [3 /*break*/, 13];
            case "roi_tracking":
              return [3 /*break*/, 15];
          }
          return [3 /*break*/, 17];
        case 5:
          pricingRequest = PricingOptimizationRequestSchema.parse(
            __assign({ clinicId: clinicId }, optimizationData),
          );
          return [
            4 /*yield*/,
            (0, revenue_optimization_engine_1.createrevenueOptimizationEngine)().optimizePricing(
              pricingRequest.clinicId,
              pricingRequest.serviceId,
            ),
          ];
        case 6:
          result = _d.sent();
          return [3 /*break*/, 18];
        case 7:
          serviceMixRequest = ServiceMixRequestSchema.parse({ clinicId: clinicId });
          return [
            4 /*yield*/,
            (0, revenue_optimization_engine_1.createrevenueOptimizationEngine)().optimizeServiceMix(
              serviceMixRequest.clinicId,
            ),
          ];
        case 8:
          result = _d.sent();
          return [3 /*break*/, 18];
        case 9:
          clvRequest = CLVRequestSchema.parse(__assign({ clinicId: clinicId }, optimizationData));
          return [
            4 /*yield*/,
            (0, revenue_optimization_engine_1.createrevenueOptimizationEngine)().enhanceCLV(
              clvRequest.clinicId,
              clvRequest.patientId,
            ),
          ];
        case 10:
          result = _d.sent();
          return [3 /*break*/, 18];
        case 11:
          automatedRequest = AutomatedRecommendationsRequestSchema.parse({ clinicId: clinicId });
          return [
            4 /*yield*/,
            (0,
            revenue_optimization_engine_1.createrevenueOptimizationEngine)().generateAutomatedRecommendations(
              automatedRequest.clinicId,
            ),
          ];
        case 12:
          result = _d.sent();
          return [3 /*break*/, 18];
        case 13:
          competitiveRequest = CompetitiveAnalysisRequestSchema.parse({ clinicId: clinicId });
          return [
            4 /*yield*/,
            (0,
            revenue_optimization_engine_1.createrevenueOptimizationEngine)().getCompetitiveAnalysis(
              competitiveRequest.clinicId,
            ),
          ];
        case 14:
          result = _d.sent();
          return [3 /*break*/, 18];
        case 15:
          roiRequest = ROITrackingRequestSchema.parse(
            __assign({ clinicId: clinicId }, optimizationData),
          );
          return [
            4 /*yield*/,
            (0, revenue_optimization_engine_1.createrevenueOptimizationEngine)().trackROI(
              roiRequest.clinicId,
              roiRequest.optimizationId,
            ),
          ];
        case 16:
          result = _d.sent();
          return [3 /*break*/, 18];
        case 17:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Invalid optimization type" }, { status: 400 }),
          ];
        case 18:
          optimizationRecord = {
            clinic_id: clinicId,
            optimization_type: optimizationType,
            title: body.title || "".concat(optimizationType, " Optimization"),
            description: body.description || "Automated ".concat(optimizationType, " optimization"),
            target_metric: body.targetMetric || "revenue",
            baseline_value: body.baselineValue || 0,
            target_value: body.targetValue || 0,
            improvement_percentage: result.projectedIncrease || result.profitabilityGain || 0,
            status: "active",
            priority: body.priority || "medium",
            recommendations: result.recommendations || [],
            implementation_steps: result.implementationPlan || [],
            expected_roi: body.expectedROI || 15,
            start_date: new Date().toISOString(),
            target_date:
              body.targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          };
          return [
            4 /*yield*/,
            supabase.from("revenue_optimizations").insert(optimizationRecord).select().single(),
          ];
        case 19:
          (_c = _d.sent()), (optimization = _c.data), (error = _c.error);
          if (error) {
            console.error("Error creating optimization:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to create optimization record" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              optimization: optimization,
              result: result,
              message: "Revenue optimization created successfully",
            }),
          ];
        case 20:
          error_2 = _d.sent();
          console.error("Error creating revenue optimization:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to create revenue optimization" },
              { status: 500 },
            ),
          ];
        case 21:
          return [2 /*return*/];
      }
    });
  });
}
// 🎯 PUT: Update Revenue Optimization
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      id,
      clinicId,
      updateData,
      professional,
      _b,
      optimization,
      error,
      error_3;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _c.sent();
          (id = body.id),
            (clinicId = body.clinicId),
            (updateData = __rest(body, ["id", "clinicId"]));
          if (!id || !clinicId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Optimization ID and clinic ID are required" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("professionals")
              .select("clinic_id")
              .eq("user_id", user.id)
              .eq("clinic_id", clinicId)
              .eq("is_active", true)
              .single(),
          ];
        case 4:
          professional = _c.sent().data;
          if (!professional) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Access denied" }, { status: 403 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("revenue_optimizations")
              .update(__assign(__assign({}, updateData), { updated_at: new Date().toISOString() }))
              .eq("id", id)
              .eq("clinic_id", clinicId)
              .select()
              .single(),
          ];
        case 5:
          (_b = _c.sent()), (optimization = _b.data), (error = _b.error);
          if (error) {
            console.error("Error updating optimization:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to update optimization" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              optimization: optimization,
              message: "Revenue optimization updated successfully",
            }),
          ];
        case 6:
          error_3 = _c.sent();
          console.error("Error updating revenue optimization:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to update revenue optimization" },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
// 🎯 DELETE: Delete Revenue Optimization
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, user, authError, searchParams, id, clinicId, professional, error, error_4;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          id = searchParams.get("id");
          clinicId = searchParams.get("clinicId");
          if (!id || !clinicId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Optimization ID and clinic ID are required" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("professionals")
              .select("clinic_id")
              .eq("user_id", user.id)
              .eq("clinic_id", clinicId)
              .eq("is_active", true)
              .single(),
          ];
        case 3:
          professional = _b.sent().data;
          if (!professional) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Access denied" }, { status: 403 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("revenue_optimizations").delete().eq("id", id).eq("clinic_id", clinicId),
          ];
        case 4:
          error = _b.sent().error;
          if (error) {
            console.error("Error deleting optimization:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to delete optimization" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              message: "Revenue optimization deleted successfully",
            }),
          ];
        case 5:
          error_4 = _b.sent();
          console.error("Error deleting revenue optimization:", error_4);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to delete revenue optimization" },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
