// Story 11.2: No-Show Prediction API Routes
// Main predictions endpoint with CRUD operations
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
exports.GET = GET;
exports.POST = POST;
var server_1 = require("next/server");
var no_show_prediction_1 = require("@/app/lib/services/no-show-prediction");
var no_show_prediction_2 = require("@/app/lib/validations/no-show-prediction");
var server_2 = require("@/app/utils/supabase/server");
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      searchParams,
      queryParams,
      parsedQuery,
      query,
      offset,
      _a,
      predictions,
      error,
      count,
      totalCount,
      error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _b.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          queryParams = Object.fromEntries(searchParams.entries());
          parsedQuery = no_show_prediction_2.GetPredictionsQuerySchema.parse(
            __assign(__assign({}, queryParams), {
              page: queryParams.page ? parseInt(queryParams.page) : 1,
              limit: queryParams.limit ? parseInt(queryParams.limit) : 20,
              risk_threshold: queryParams.risk_threshold
                ? parseFloat(queryParams.risk_threshold)
                : undefined,
              intervention_recommended: queryParams.intervention_recommended === "true",
            }),
          );
          query = supabase
            .from("no_show_predictions")
            .select(
              "\n        *,\n        appointments!inner(\n          id,\n          start_time,\n          status,\n          patients!inner(\n            id,\n            full_name,\n            email\n          ),\n          service_types!inner(\n            id,\n            name,\n            duration_minutes\n          )\n        )\n      ",
            );
          // Apply filters
          if (parsedQuery.patient_id) {
            query = query.eq("patient_id", parsedQuery.patient_id);
          }
          if (parsedQuery.appointment_id) {
            query = query.eq("appointment_id", parsedQuery.appointment_id);
          }
          if (parsedQuery.risk_threshold !== undefined) {
            query = query.gte("risk_score", parsedQuery.risk_threshold);
          }
          if (parsedQuery.date_from) {
            query = query.gte("prediction_date", parsedQuery.date_from);
          }
          if (parsedQuery.date_to) {
            query = query.lte("prediction_date", parsedQuery.date_to);
          }
          if (parsedQuery.intervention_recommended !== undefined) {
            query = query.eq("intervention_recommended", parsedQuery.intervention_recommended);
          }
          if (parsedQuery.model_version) {
            query = query.eq("model_version", parsedQuery.model_version);
          }
          // Apply sorting
          query = query.order(parsedQuery.sort_by, { ascending: parsedQuery.sort_order === "asc" });
          offset = (parsedQuery.page - 1) * parsedQuery.limit;
          query = query.range(offset, offset + parsedQuery.limit - 1);
          return [4 /*yield*/, query];
        case 3:
          (_a = _b.sent()), (predictions = _a.data), (error = _a.error), (count = _a.count);
          if (error) {
            console.error("Database error:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("no_show_predictions").select("*", { count: "exact", head: true }),
          ];
        case 4:
          totalCount = _b.sent().count;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              predictions: predictions || [],
              pagination: {
                page: parsedQuery.page,
                limit: parsedQuery.limit,
                total: totalCount || 0,
                pages: Math.ceil((totalCount || 0) / parsedQuery.limit),
              },
            }),
          ];
        case 5:
          error_1 = _b.sent();
          console.error("API error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      body,
      validatedInput,
      existingPrediction,
      prediction,
      recommendedInterventions,
      riskFactors,
      error_2;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 9, , 10]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _a.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _a.sent();
          validatedInput = no_show_prediction_2.CreatePredictionInputSchema.parse(body);
          return [
            4 /*yield*/,
            no_show_prediction_1.noShowPredictionEngine.getPredictionsByAppointment(
              validatedInput.appointment_id,
            ),
          ];
        case 4:
          existingPrediction = _a.sent();
          if (existingPrediction.length > 0) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Prediction already exists for this appointment" },
                { status: 409 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            no_show_prediction_1.noShowPredictionEngine.createPrediction(validatedInput),
          ];
        case 5:
          prediction = _a.sent();
          recommendedInterventions = [];
          if (!prediction.intervention_recommended) return [3 /*break*/, 7];
          return [
            4 /*yield*/,
            no_show_prediction_1.noShowPredictionEngine.getRecommendedInterventions(prediction.id),
          ];
        case 6:
          recommendedInterventions = _a.sent();
          _a.label = 7;
        case 7:
          return [
            4 /*yield*/,
            no_show_prediction_1.noShowPredictionEngine.getRiskFactorsByPatient(
              prediction.patient_id,
            ),
          ];
        case 8:
          riskFactors = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                prediction: prediction,
                recommended_interventions: recommendedInterventions,
                risk_factors: riskFactors,
                message: "Prediction created successfully",
              },
              { status: 201 },
            ),
          ];
        case 9:
          error_2 = _a.sent();
          console.error("API error:", error_2);
          if (error_2 instanceof Error && error_2.message.includes("validation")) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid input data", details: error_2.message },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Failed to create prediction" }, { status: 500 }),
          ];
        case 10:
          return [2 /*return*/];
      }
    });
  });
}
