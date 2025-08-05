"use strict";
// =====================================================================================
// CHURN PREDICTIONS API ENDPOINTS
// Epic 7.4: Patient Retention Analytics + Predictions
// API endpoints for churn prediction generation and management
// =====================================================================================
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
exports.GET = GET;
exports.POST = POST;
var server_1 = require("next/server");
var server_2 = require("@/app/utils/supabase/server");
var retention_analytics_service_1 = require("@/app/lib/services/retention-analytics-service");
var retention_analytics_1 = require("@/app/types/retention-analytics");
var zod_1 = require("zod");
// =====================================================================================
// VALIDATION SCHEMAS
// =====================================================================================
var PredictionsParamsSchema = zod_1.z.object({
  clinicId: zod_1.z.string().uuid("Invalid clinic ID format"),
});
var PredictionsQuerySchema = zod_1.z.object({
  riskLevel: zod_1.z.nativeEnum(retention_analytics_1.ChurnRiskLevel).optional(),
  limit: zod_1.z.coerce.number().min(1).max(1000).default(100),
  offset: zod_1.z.coerce.number().min(0).default(0),
  startDate: zod_1.z.string().optional(),
  endDate: zod_1.z.string().optional(),
  sortBy: zod_1.z
    .enum(["prediction_date", "churn_probability", "risk_level"])
    .default("prediction_date"),
  sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
var GeneratePredictionSchema = zod_1.z
  .object({
    patientId: zod_1.z.string().uuid("Invalid patient ID format").optional(),
    patientIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    modelType: zod_1.z
      .nativeEnum(retention_analytics_1.ChurnModelType)
      .default(retention_analytics_1.ChurnModelType.ENSEMBLE),
    forceRegenerate: zod_1.z.boolean().default(false),
  })
  .refine(
    function (data) {
      return data.patientId || (data.patientIds && data.patientIds.length > 0);
    },
    {
      message: "Either patientId or patientIds must be provided",
    },
  );
// =====================================================================================
// GET CHURN PREDICTIONS
// =====================================================================================
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var clinicValidation,
      clinicId,
      searchParams,
      queryValidation,
      _c,
      riskLevel,
      limit,
      offset,
      startDate_1,
      endDate_1,
      sortBy_1,
      sortOrder_1,
      supabase,
      _d,
      user,
      authError,
      _e,
      userProfile,
      profileError,
      retentionService,
      predictions,
      filteredPredictions,
      paginatedPredictions,
      summary,
      error_1;
    var params = _b.params;
    return __generator(this, function (_f) {
      switch (_f.label) {
        case 0:
          _f.trys.push([0, 5, , 6]);
          clinicValidation = PredictionsParamsSchema.safeParse({
            clinicId: params.clinicId,
          });
          if (!clinicValidation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid clinic ID",
                  details: clinicValidation.error.issues,
                },
                { status: 400 },
              ),
            ];
          }
          clinicId = clinicValidation.data.clinicId;
          searchParams = new URL(request.url).searchParams;
          queryValidation = PredictionsQuerySchema.safeParse({
            riskLevel: searchParams.get("riskLevel"),
            limit: searchParams.get("limit"),
            offset: searchParams.get("offset"),
            startDate: searchParams.get("startDate"),
            endDate: searchParams.get("endDate"),
            sortBy: searchParams.get("sortBy"),
            sortOrder: searchParams.get("sortOrder"),
          });
          if (!queryValidation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid query parameters",
                  details: queryValidation.error.issues,
                },
                { status: 400 },
              ),
            ];
          }
          (_c = queryValidation.data),
            (riskLevel = _c.riskLevel),
            (limit = _c.limit),
            (offset = _c.offset),
            (startDate_1 = _c.startDate),
            (endDate_1 = _c.endDate),
            (sortBy_1 = _c.sortBy),
            (sortOrder_1 = _c.sortOrder);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _f.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_d = _f.sent()), (user = _d.data.user), (authError = _d.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id, role").eq("id", user.id).single(),
          ];
        case 3:
          (_e = _f.sent()), (userProfile = _e.data), (profileError = _e.error);
          if (profileError || !userProfile) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "User profile not found" }, { status: 403 }),
            ];
          }
          if (userProfile.clinic_id !== clinicId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Access denied to clinic data" },
                { status: 403 },
              ),
            ];
          }
          retentionService = new retention_analytics_service_1.RetentionAnalyticsService();
          return [
            4 /*yield*/,
            retentionService.getChurnPredictions(clinicId, riskLevel, limit, offset),
          ];
        case 4:
          predictions = _f.sent();
          filteredPredictions = predictions;
          // Date filtering
          if (startDate_1 || endDate_1) {
            filteredPredictions = predictions.filter(function (prediction) {
              var predictionDate = new Date(prediction.prediction_date);
              if (startDate_1 && predictionDate < new Date(startDate_1)) return false;
              if (endDate_1 && predictionDate > new Date(endDate_1)) return false;
              return true;
            });
          }
          // Sorting
          filteredPredictions.sort(function (a, b) {
            var valueA, valueB;
            switch (sortBy_1) {
              case "prediction_date":
                valueA = new Date(a.prediction_date);
                valueB = new Date(b.prediction_date);
                break;
              case "churn_probability":
                valueA = a.churn_probability;
                valueB = b.churn_probability;
                break;
              case "risk_level":
                var riskOrder = { low: 1, medium: 2, high: 3, critical: 4 };
                valueA = riskOrder[a.risk_level];
                valueB = riskOrder[b.risk_level];
                break;
              default:
                valueA = a.prediction_date;
                valueB = b.prediction_date;
            }
            if (sortOrder_1 === "desc") {
              return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
            } else {
              return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            }
          });
          paginatedPredictions = filteredPredictions.slice(offset, offset + limit);
          summary = {
            total_predictions: filteredPredictions.length,
            risk_distribution: {
              low: filteredPredictions.filter(function (p) {
                return p.risk_level === retention_analytics_1.ChurnRiskLevel.LOW;
              }).length,
              medium: filteredPredictions.filter(function (p) {
                return p.risk_level === retention_analytics_1.ChurnRiskLevel.MEDIUM;
              }).length,
              high: filteredPredictions.filter(function (p) {
                return p.risk_level === retention_analytics_1.ChurnRiskLevel.HIGH;
              }).length,
              critical: filteredPredictions.filter(function (p) {
                return p.risk_level === retention_analytics_1.ChurnRiskLevel.CRITICAL;
              }).length,
            },
            average_churn_probability:
              filteredPredictions.reduce(function (sum, p) {
                return sum + p.churn_probability;
              }, 0) / filteredPredictions.length || 0,
            high_risk_patients: filteredPredictions.filter(function (p) {
              return ["high", "critical"].includes(p.risk_level);
            }).length,
            recent_predictions: filteredPredictions.filter(function (p) {
              var predictionDate = new Date(p.prediction_date);
              var dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
              return predictionDate > dayAgo;
            }).length,
          };
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                predictions: paginatedPredictions,
                summary: summary,
                pagination: {
                  limit: limit,
                  offset: offset,
                  total: filteredPredictions.length,
                  hasMore: offset + limit < filteredPredictions.length,
                },
                filters: {
                  riskLevel: riskLevel,
                  startDate: startDate_1,
                  endDate: endDate_1,
                  sortBy: sortBy_1,
                  sortOrder: sortOrder_1,
                },
              },
              timestamp: new Date().toISOString(),
            }),
          ];
        case 5:
          error_1 = _f.sent();
          console.error("Error getting churn predictions:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Internal server error",
                message: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================================================
// GENERATE CHURN PREDICTIONS
// =====================================================================================
function POST(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var clinicValidation,
      clinicId_1,
      body,
      validation,
      _c,
      patientId,
      patientIds,
      modelType_1,
      forceRegenerate,
      supabase,
      _d,
      user,
      authError,
      _e,
      userProfile,
      profileError,
      allowedRoles,
      targetPatientIds,
      _f,
      validPatients_1,
      validationError,
      invalidIds,
      retentionService_1,
      results_1,
      errors_1,
      batchSize,
      i,
      batch,
      batchPromises,
      batchResults,
      summary,
      error_2;
    var _this = this;
    var params = _b.params;
    return __generator(this, function (_g) {
      switch (_g.label) {
        case 0:
          _g.trys.push([0, 10, , 11]);
          clinicValidation = PredictionsParamsSchema.safeParse({
            clinicId: params.clinicId,
          });
          if (!clinicValidation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid clinic ID",
                  details: clinicValidation.error.issues,
                },
                { status: 400 },
              ),
            ];
          }
          clinicId_1 = clinicValidation.data.clinicId;
          return [4 /*yield*/, request.json()];
        case 1:
          body = _g.sent();
          validation = GeneratePredictionSchema.safeParse(body);
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid request data",
                  details: validation.error.issues,
                },
                { status: 400 },
              ),
            ];
          }
          (_c = validation.data),
            (patientId = _c.patientId),
            (patientIds = _c.patientIds),
            (modelType_1 = _c.modelType),
            (forceRegenerate = _c.forceRegenerate);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _g.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_d = _g.sent()), (user = _d.data.user), (authError = _d.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id, role").eq("id", user.id).single(),
          ];
        case 4:
          (_e = _g.sent()), (userProfile = _e.data), (profileError = _e.error);
          if (profileError || !userProfile) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "User profile not found" }, { status: 403 }),
            ];
          }
          if (userProfile.clinic_id !== clinicId_1) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Access denied to clinic data" },
                { status: 403 },
              ),
            ];
          }
          allowedRoles = ["admin", "manager", "analyst", "professional"];
          if (!allowedRoles.includes(userProfile.role)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Insufficient permissions to generate predictions" },
                { status: 403 },
              ),
            ];
          }
          targetPatientIds = patientId ? [patientId] : patientIds;
          return [
            4 /*yield*/,
            supabase
              .from("patients")
              .select("id, name")
              .eq("clinic_id", clinicId_1)
              .in("id", targetPatientIds),
          ];
        case 5:
          (_f = _g.sent()), (validPatients_1 = _f.data), (validationError = _f.error);
          if (validationError) {
            throw new Error("Failed to validate patients: ".concat(validationError.message));
          }
          if (validPatients_1.length !== targetPatientIds.length) {
            invalidIds = targetPatientIds.filter(function (id) {
              return !validPatients_1.some(function (p) {
                return p.id === id;
              });
            });
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Some patients do not belong to the specified clinic",
                  invalidPatientIds: invalidIds,
                },
                { status: 400 },
              ),
            ];
          }
          retentionService_1 = new retention_analytics_service_1.RetentionAnalyticsService();
          results_1 = [];
          errors_1 = [];
          batchSize = 5;
          i = 0;
          _g.label = 6;
        case 6:
          if (!(i < targetPatientIds.length)) return [3 /*break*/, 9];
          batch = targetPatientIds.slice(i, i + batchSize);
          batchPromises = batch.map(function (patientId) {
            return __awaiter(_this, void 0, void 0, function () {
              var prediction, error_3;
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [
                      4 /*yield*/,
                      retentionService_1.generateChurnPrediction(
                        patientId,
                        clinicId_1,
                        modelType_1,
                      ),
                    ];
                  case 1:
                    prediction = _a.sent();
                    return [
                      2 /*return*/,
                      { patientId: patientId, prediction: prediction, success: true },
                    ];
                  case 2:
                    error_3 = _a.sent();
                    console.error(
                      "Failed to generate prediction for patient ".concat(patientId, ":"),
                      error_3,
                    );
                    return [
                      2 /*return*/,
                      {
                        patientId: patientId,
                        error: error_3 instanceof Error ? error_3.message : "Unknown error",
                        success: false,
                      },
                    ];
                  case 3:
                    return [2 /*return*/];
                }
              });
            });
          });
          return [4 /*yield*/, Promise.allSettled(batchPromises)];
        case 7:
          batchResults = _g.sent();
          batchResults.forEach(function (result) {
            var _a;
            if (result.status === "fulfilled") {
              if (result.value.success) {
                results_1.push(result.value);
              } else {
                errors_1.push(result.value);
              }
            } else {
              errors_1.push({
                patientId: "unknown",
                error:
                  ((_a = result.reason) === null || _a === void 0 ? void 0 : _a.message) ||
                  "Promise rejected",
                success: false,
              });
            }
          });
          _g.label = 8;
        case 8:
          i += batchSize;
          return [3 /*break*/, 6];
        case 9:
          summary = {
            total_processed: targetPatientIds.length,
            successful: results_1.length,
            failed: errors_1.length,
            success_rate: results_1.length / targetPatientIds.length,
            model_type: modelType_1,
            high_risk_detected: results_1.filter(function (r) {
              return ["high", "critical"].includes(r.prediction.risk_level);
            }).length,
          };
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                predictions: results_1.map(function (r) {
                  return r.prediction;
                }),
                summary: summary,
                errors: errors_1.length > 0 ? errors_1 : undefined,
              },
              message: "Generated "
                .concat(results_1.length, " predictions successfully, ")
                .concat(errors_1.length, " failed"),
              timestamp: new Date().toISOString(),
            }),
          ];
        case 10:
          error_2 = _g.sent();
          console.error("Error generating churn predictions:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Internal server error",
                message: error_2 instanceof Error ? error_2.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 11:
          return [2 /*return*/];
      }
    });
  });
}
