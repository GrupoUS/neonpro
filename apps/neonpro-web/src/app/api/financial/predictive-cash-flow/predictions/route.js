/**
 * =====================================================================================
 * PREDICTIVE CASH FLOW API - PREDICTIONS ENDPOINT
 * =====================================================================================
 *
 * Comprehensive API for predictive cash flow operations.
 * Handles prediction generation, retrieval, and validation.
 *
 * Epic: 5 - Advanced Financial Intelligence
 * Story: 5.2 - Predictive Cash Flow Analysis
 * Author: VoidBeast V4.0 BMad Method Integration
 * Created: 2025-01-27
 *
 * Features:
 * - Generate AI-powered cash flow predictions
 * - Retrieve historical predictions with filtering
 * - Validate predictions against actual data
 * - Scenario-based prediction generation
 * - Model accuracy tracking
 * - Real-time prediction updates
 * =====================================================================================
 */
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
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var headers_1 = require("next/headers");
var zod_1 = require("zod");
var predictive_analytics_engine_1 = require("@/lib/financial/predictive-analytics-engine");
var predictive_cash_flow_1 = require("@/lib/validations/predictive-cash-flow");
// =====================================================================================
// REQUEST VALIDATION SCHEMAS
// =====================================================================================
var generatePredictionSchema = zod_1.z.object({
  clinicId: zod_1.z.string().uuid(),
  modelId: zod_1.z.string().uuid().optional(),
  periodType: predictive_cash_flow_1.predictionPeriodTypeSchema,
  startDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scenarioId: zod_1.z.string().uuid().optional(),
});
var validatePredictionSchema = zod_1.z.object({
  predictionId: zod_1.z.string().uuid(),
  actualInflow: zod_1.z.number().int().min(0),
  actualOutflow: zod_1.z.number().int().min(0),
  actualNet: zod_1.z.number().int(),
});
var getPredictionsSchema = zod_1.z.object({
  clinicId: zod_1.z.string().uuid(),
  periodType: predictive_cash_flow_1.predictionPeriodTypeSchema.optional(),
  startDate: zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  scenarioId: zod_1.z.string().uuid().optional(),
  limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
  offset: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
});
// =====================================================================================
// GET - RETRIEVE PREDICTIONS
// =====================================================================================
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      searchParams,
      validation,
      _a,
      clinicId,
      periodType,
      startDate,
      endDate,
      scenarioId,
      _b,
      limit,
      _c,
      offset,
      query,
      _d,
      predictions,
      error,
      countQuery,
      count,
      error_1;
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 3, , 4]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          searchParams = new URL(request.url).searchParams;
          validation = getPredictionsSchema.safeParse({
            clinicId: searchParams.get("clinicId"),
            periodType: searchParams.get("periodType"),
            startDate: searchParams.get("startDate"),
            endDate: searchParams.get("endDate"),
            scenarioId: searchParams.get("scenarioId"),
            limit: searchParams.get("limit"),
            offset: searchParams.get("offset"),
          });
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid query parameters", details: validation.error.errors },
                { status: 400 },
              ),
            ];
          }
          (_a = validation.data),
            (clinicId = _a.clinicId),
            (periodType = _a.periodType),
            (startDate = _a.startDate),
            (endDate = _a.endDate),
            (scenarioId = _a.scenarioId),
            (_b = _a.limit),
            (limit = _b === void 0 ? 50 : _b),
            (_c = _a.offset),
            (offset = _c === void 0 ? 0 : _c);
          query = supabase
            .from("cash_flow_predictions")
            .select(
              "\n        *,\n        prediction_models!inner(name, model_type, algorithm_type, accuracy_rate),\n        forecasting_scenarios(name, description)\n      ",
            )
            .eq("clinic_id", clinicId)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);
          // Apply filters
          if (periodType) {
            query = query.eq("period_type", periodType);
          }
          if (startDate) {
            query = query.gte("start_date", startDate);
          }
          if (endDate) {
            query = query.lte("end_date", endDate);
          }
          if (scenarioId) {
            query = query.eq("scenario_id", scenarioId);
          }
          return [4 /*yield*/, query];
        case 1:
          (_d = _e.sent()), (predictions = _d.data), (error = _d.error);
          if (error) {
            console.error("Error fetching predictions:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 }),
            ];
          }
          countQuery = supabase
            .from("cash_flow_predictions")
            .select("id", { count: "exact", head: true })
            .eq("clinic_id", clinicId);
          if (periodType) countQuery = countQuery.eq("period_type", periodType);
          if (startDate) countQuery = countQuery.gte("start_date", startDate);
          if (endDate) countQuery = countQuery.lte("end_date", endDate);
          if (scenarioId) countQuery = countQuery.eq("scenario_id", scenarioId);
          return [4 /*yield*/, countQuery];
        case 2:
          count = _e.sent().count;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              predictions: predictions || [],
              pagination: {
                total: count || 0,
                limit: limit,
                offset: offset,
                hasMore: (count || 0) > offset + limit,
              },
            }),
          ];
        case 3:
          error_1 = _e.sent();
          console.error("Error in GET /api/financial/predictive-cash-flow/predictions:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================================================
// POST - GENERATE PREDICTION
// =====================================================================================
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      body,
      validation,
      _a,
      clinicId,
      modelId,
      periodType,
      startDate,
      endDate,
      scenarioId,
      user,
      _b,
      clinic,
      clinicError,
      start,
      end,
      engine,
      _c,
      prediction,
      predictionError,
      _d,
      completePrediction,
      fetchError,
      error_2;
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 7, , 8]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          return [4 /*yield*/, request.json()];
        case 1:
          body = _e.sent();
          validation = generatePredictionSchema.safeParse(body);
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid request body", details: validation.error.errors },
                { status: 400 },
              ),
            ];
          }
          (_a = validation.data),
            (clinicId = _a.clinicId),
            (modelId = _a.modelId),
            (periodType = _a.periodType),
            (startDate = _a.startDate),
            (endDate = _a.endDate),
            (scenarioId = _a.scenarioId);
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _e.sent().data;
          if (!user.user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, supabase.from("clinics").select("id").eq("id", clinicId).single()];
        case 3:
          (_b = _e.sent()), (clinic = _b.data), (clinicError = _b.error);
          if (clinicError || !clinic) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Clinic not found or access denied" },
                { status: 404 },
              ),
            ];
          }
          start = new Date(startDate);
          end = new Date(endDate);
          if (start >= end) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Start date must be before end date" },
                { status: 400 },
              ),
            ];
          }
          if (end.getTime() - start.getTime() > 365 * 24 * 60 * 60 * 1000) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Date range cannot exceed 1 year" },
                { status: 400 },
              ),
            ];
          }
          engine = new predictive_analytics_engine_1.default(supabase);
          return [
            4 /*yield*/,
            engine.generatePrediction(clinicId, periodType, startDate, endDate, scenarioId),
          ];
        case 4:
          (_c = _e.sent()), (prediction = _c.data), (predictionError = _c.error);
          if (predictionError || !prediction) {
            console.error("Error generating prediction:", predictionError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: predictionError || "Failed to generate prediction" },
                { status: 500 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("cash_flow_predictions")
              .select(
                "\n        *,\n        prediction_models!inner(name, model_type, algorithm_type, accuracy_rate),\n        forecasting_scenarios(name, description)\n      ",
              )
              .eq("id", prediction.id)
              .single(),
          ];
        case 5:
          (_d = _e.sent()), (completePrediction = _d.data), (fetchError = _d.error);
          if (fetchError) {
            console.error("Error fetching complete prediction:", fetchError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { prediction: prediction }, // Return basic prediction if fetch fails
                { status: 201 },
              ),
            ];
          }
          // Log prediction generation for analytics
          return [
            4 /*yield*/,
            supabase.from("analytics_events").insert({
              event_type: "prediction_generated",
              clinic_id: clinicId,
              user_id: user.user.id,
              metadata: {
                prediction_id: prediction.id,
                period_type: periodType,
                model_id: modelId,
                confidence_score: prediction.confidence_score,
                date_range: { startDate: startDate, endDate: endDate },
              },
            }),
          ];
        case 6:
          // Log prediction generation for analytics
          _e.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                message: "Prediction generated successfully",
                prediction: completePrediction || prediction,
              },
              { status: 201 },
            ),
          ];
        case 7:
          error_2 = _e.sent();
          console.error("Error in POST /api/financial/predictive-cash-flow/predictions:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================================================
// PUT - VALIDATE PREDICTION
// =====================================================================================
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      body,
      validation,
      _a,
      predictionId,
      actualInflow,
      actualOutflow,
      actualNet,
      user,
      _b,
      prediction,
      predictionError,
      _c,
      clinic,
      clinicError,
      engine,
      _d,
      accuracy,
      validationError,
      error_3;
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 7, , 8]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          return [4 /*yield*/, request.json()];
        case 1:
          body = _e.sent();
          validation = validatePredictionSchema.safeParse(body);
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid request body", details: validation.error.errors },
                { status: 400 },
              ),
            ];
          }
          (_a = validation.data),
            (predictionId = _a.predictionId),
            (actualInflow = _a.actualInflow),
            (actualOutflow = _a.actualOutflow),
            (actualNet = _a.actualNet);
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _e.sent().data;
          if (!user.user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("cash_flow_predictions")
              .select("\n        *,\n        prediction_models!inner(name)\n      ")
              .eq("id", predictionId)
              .single(),
          ];
        case 3:
          (_b = _e.sent()), (prediction = _b.data), (predictionError = _b.error);
          if (predictionError || !prediction) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Prediction not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("clinics").select("id").eq("id", prediction.clinic_id).single(),
          ];
        case 4:
          (_c = _e.sent()), (clinic = _c.data), (clinicError = _c.error);
          if (clinicError || !clinic) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Access denied" }, { status: 403 }),
            ];
          }
          engine = new predictive_analytics_engine_1.default(supabase);
          return [
            4 /*yield*/,
            engine.validatePrediction(predictionId, actualInflow, actualOutflow, actualNet),
          ];
        case 5:
          (_d = _e.sent()), (accuracy = _d.accuracy), (validationError = _d.error);
          if (validationError) {
            console.error("Error validating prediction:", validationError);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: validationError }, { status: 500 }),
            ];
          }
          // Log validation event
          return [
            4 /*yield*/,
            supabase.from("analytics_events").insert({
              event_type: "prediction_validated",
              clinic_id: prediction.clinic_id,
              user_id: user.user.id,
              metadata: {
                prediction_id: predictionId,
                accuracy_percentage: accuracy,
                actual_values: {
                  actualInflow: actualInflow,
                  actualOutflow: actualOutflow,
                  actualNet: actualNet,
                },
                predicted_values: {
                  inflow: prediction.predicted_inflow_amount,
                  outflow: prediction.predicted_outflow_amount,
                  net: prediction.predicted_net_amount,
                },
              },
            }),
          ];
        case 6:
          // Log validation event
          _e.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              message: "Prediction validated successfully",
              accuracy: accuracy,
              validation: {
                predicted: {
                  inflow: prediction.predicted_inflow_amount,
                  outflow: prediction.predicted_outflow_amount,
                  net: prediction.predicted_net_amount,
                },
                actual: {
                  inflow: actualInflow,
                  outflow: actualOutflow,
                  net: actualNet,
                },
                confidence: prediction.confidence_score,
              },
            }),
          ];
        case 7:
          error_3 = _e.sent();
          console.error("Error in PUT /api/financial/predictive-cash-flow/predictions:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================================================
// DELETE - REMOVE PREDICTION
// =====================================================================================
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      searchParams,
      predictionId,
      user,
      _a,
      prediction,
      predictionError,
      _b,
      clinic,
      clinicError,
      deleteError,
      error_4;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 6, , 7]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          searchParams = new URL(request.url).searchParams;
          predictionId = searchParams.get("id");
          if (!predictionId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Prediction ID is required" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          user = _c.sent().data;
          if (!user.user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("cash_flow_predictions")
              .select("clinic_id")
              .eq("id", predictionId)
              .single(),
          ];
        case 2:
          (_a = _c.sent()), (prediction = _a.data), (predictionError = _a.error);
          if (predictionError || !prediction) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Prediction not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("clinics").select("id").eq("id", prediction.clinic_id).single(),
          ];
        case 3:
          (_b = _c.sent()), (clinic = _b.data), (clinicError = _b.error);
          if (clinicError || !clinic) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Access denied" }, { status: 403 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("cash_flow_predictions").delete().eq("id", predictionId),
          ];
        case 4:
          deleteError = _c.sent().error;
          if (deleteError) {
            console.error("Error deleting prediction:", deleteError);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to delete prediction" }, { status: 500 }),
            ];
          }
          // Log deletion event
          return [
            4 /*yield*/,
            supabase.from("analytics_events").insert({
              event_type: "prediction_deleted",
              clinic_id: prediction.clinic_id,
              user_id: user.user.id,
              metadata: {
                prediction_id: predictionId,
              },
            }),
          ];
        case 5:
          // Log deletion event
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              message: "Prediction deleted successfully",
            }),
          ];
        case 6:
          error_4 = _c.sent();
          console.error(
            "Error in DELETE /api/financial/predictive-cash-flow/predictions:",
            error_4,
          );
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
