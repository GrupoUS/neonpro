"use strict";
// KPI Calculation and Retrieval API
// Description: API endpoints for financial KPI calculation and management
// Author: Dev Agent
// Date: 2025-01-26
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
exports.POST = POST;
exports.GET = GET;
var server_1 = require("next/server");
var kpi_engine_1 = require("@/lib/analytics/kpi-engine");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
var requestSchema = zod_1.z.object({
  kpi_ids: zod_1.z.array(zod_1.z.string()).optional(),
  categories: zod_1.z.array(zod_1.z.string()).optional(),
  time_period: zod_1.z.object({
    start_date: zod_1.z.string(),
    end_date: zod_1.z.string(),
    preset: zod_1.z.enum(["today", "week", "month", "quarter", "year", "custom"]).optional(),
  }),
  filters: zod_1.z
    .object({
      service_types: zod_1.z.array(zod_1.z.string()).optional(),
      doctor_ids: zod_1.z.array(zod_1.z.string()).optional(),
      location_ids: zod_1.z.array(zod_1.z.string()).optional(),
      payment_methods: zod_1.z.array(zod_1.z.string()).optional(),
    })
    .optional(),
  include_variance: zod_1.z.boolean().default(true),
  include_targets: zod_1.z.boolean().default(true),
  calculation_method: zod_1.z.enum(["real_time", "cached", "force_refresh"]).default("cached"),
});
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      userError,
      body,
      validatedData_1,
      kpiEngine,
      results,
      formattedResults,
      error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (userError = _a.error);
          if (userError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _b.sent();
          validatedData_1 = requestSchema.parse(body);
          kpiEngine = new kpi_engine_1.KPIEngine();
          return [
            4 /*yield*/,
            kpiEngine.calculateKPIs({
              time_period: validatedData_1.time_period,
              kpi_ids: validatedData_1.kpi_ids,
              categories: validatedData_1.categories,
              filters: validatedData_1.filters,
              calculation_method: validatedData_1.calculation_method,
            }),
          ];
        case 4:
          results = _b.sent();
          formattedResults = results.map(function (result) {
            var _a, _b, _c, _d;
            return {
              id: result.kpi_id,
              kpi_name: result.kpi_name,
              kpi_category: result.kpi_category,
              current_value: result.current_value,
              previous_value: validatedData_1.include_variance ? result.previous_value : undefined,
              target_value: validatedData_1.include_targets ? result.target_value : undefined,
              variance_percent: validatedData_1.include_variance
                ? result.variance_percent
                : undefined,
              trend_direction: validatedData_1.include_variance
                ? result.trend_direction
                : undefined,
              calculation_date: result.calculation_date,
              last_updated:
                ((_a = result.metadata) === null || _a === void 0
                  ? void 0
                  : _a.calculation_timestamp) || new Date().toISOString(),
              metadata: {
                data_points:
                  (_b = result.metadata) === null || _b === void 0 ? void 0 : _b.data_points,
                calculation_method:
                  (_c = result.metadata) === null || _c === void 0 ? void 0 : _c.calculation_method,
                confidence_score:
                  (_d = result.metadata) === null || _d === void 0 ? void 0 : _d.confidence_score,
              },
            };
          });
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: formattedResults,
              metadata: {
                total_kpis: formattedResults.length,
                calculation_timestamp: new Date().toISOString(),
                time_period: validatedData_1.time_period,
                filters_applied: validatedData_1.filters
                  ? Object.keys(validatedData_1.filters).length
                  : 0,
              },
            }),
          ];
        case 5:
          error_1 = _b.sent();
          console.error("Error calculating KPIs:", error_1);
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Invalid request data",
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
                success: false,
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
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      userError,
      searchParams,
      category,
      includeTargets_1,
      limit,
      query,
      _b,
      kpis,
      error,
      formattedKpis,
      error_2;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (userError = _a.error);
          if (userError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 },
              ),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          category = searchParams.get("category");
          includeTargets_1 = searchParams.get("include_targets") === "true";
          limit = parseInt(searchParams.get("limit") || "50");
          query = supabase
            .from("financial_kpis")
            .select(
              "\n        *,\n        kpi_targets(target_value, target_type, validity_period)\n      ",
            )
            .order("last_updated", { ascending: false })
            .limit(limit);
          if (category) {
            query = query.eq("kpi_category", category);
          }
          return [4 /*yield*/, query];
        case 3:
          (_b = _c.sent()), (kpis = _b.data), (error = _b.error);
          if (error) {
            throw new Error("Database error: ".concat(error.message));
          }
          formattedKpis =
            (kpis === null || kpis === void 0
              ? void 0
              : kpis.map(function (kpi) {
                  var _a, _b;
                  return {
                    id: kpi.id,
                    kpi_name: kpi.kpi_name,
                    kpi_category: kpi.kpi_category,
                    current_value: kpi.current_value,
                    previous_value: kpi.previous_value,
                    target_value:
                      includeTargets_1 &&
                      ((_b = (_a = kpi.kpi_targets) === null || _a === void 0 ? void 0 : _a[0]) ===
                        null || _b === void 0
                        ? void 0
                        : _b.target_value)
                        ? kpi.kpi_targets[0].target_value
                        : undefined,
                    variance_percent: kpi.variance_percent,
                    trend_direction: kpi.trend_direction,
                    calculation_date: kpi.calculation_date,
                    last_updated: kpi.last_updated,
                    metadata: kpi.metadata,
                  };
                })) || [];
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: formattedKpis,
              metadata: {
                total_kpis: formattedKpis.length,
                category_filter: category,
                include_targets: includeTargets_1,
                retrieved_at: new Date().toISOString(),
              },
            }),
          ];
        case 4:
          error_2 = _c.sent();
          console.error("Error retrieving KPIs:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Internal server error",
                message: error_2 instanceof Error ? error_2.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
