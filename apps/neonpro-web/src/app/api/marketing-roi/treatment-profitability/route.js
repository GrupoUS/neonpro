"use strict";
/**
 * Treatment Profitability Analysis API Routes
 * /api/marketing-roi/treatment-profitability
 */
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
var server_2 = require("@/lib/supabase/server");
var marketing_roi_service_1 = require("@/app/lib/services/marketing-roi-service");
var marketing_roi_1 = require("@/app/types/marketing-roi");
var zod_1 = require("zod");
// Utility functions
function validateUserAndClinic(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, user, userError, clinicId, _b, userClinic, clinicError;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (userError = _a.error);
          if (userError || !user) {
            return [
              2 /*return*/,
              { error: server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }) },
            ];
          }
          clinicId = request.nextUrl.searchParams.get("clinic_id");
          if (!clinicId) {
            return [
              2 /*return*/,
              {
                error: server_1.NextResponse.json(
                  { error: "clinic_id is required" },
                  { status: 400 },
                ),
              },
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("user_clinics")
              .select("role")
              .eq("user_id", user.id)
              .eq("clinic_id", clinicId)
              .single(),
          ];
        case 3:
          (_b = _c.sent()), (userClinic = _b.data), (clinicError = _b.error);
          if (clinicError || !userClinic) {
            return [
              2 /*return*/,
              {
                error: server_1.NextResponse.json(
                  { error: "Access denied to clinic" },
                  { status: 403 },
                ),
              },
            ];
          }
          return [2 /*return*/, { user: user, clinicId: clinicId, userRole: userClinic.role }];
      }
    });
  });
}
function getDateRangeParams(request) {
  var startDate = request.nextUrl.searchParams.get("start_date");
  var endDate = request.nextUrl.searchParams.get("end_date");
  return {
    start_date: startDate ? new Date(startDate) : undefined,
    end_date: endDate ? new Date(endDate) : undefined,
  };
}
/**
 * GET /api/marketing-roi/treatment-profitability
 * Get treatment profitability analysis
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var validation,
      clinicId,
      _a,
      start_date,
      end_date,
      treatmentIds,
      minROI,
      minProcedures,
      sortBy,
      sortOrder,
      filters,
      validatedFilters,
      profitabilityAnalysis,
      error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          return [4 /*yield*/, validateUserAndClinic(request)];
        case 1:
          validation = _b.sent();
          if (validation.error) return [2 /*return*/, validation.error];
          clinicId = validation.clinicId;
          (_a = getDateRangeParams(request)),
            (start_date = _a.start_date),
            (end_date = _a.end_date);
          treatmentIds = request.nextUrl.searchParams.getAll("treatment_ids");
          minROI = request.nextUrl.searchParams.get("min_roi")
            ? parseFloat(request.nextUrl.searchParams.get("min_roi"))
            : undefined;
          minProcedures = request.nextUrl.searchParams.get("min_procedures")
            ? parseInt(request.nextUrl.searchParams.get("min_procedures"))
            : undefined;
          sortBy = request.nextUrl.searchParams.get("sort_by");
          sortOrder = request.nextUrl.searchParams.get("sort_order");
          filters = {
            treatment_ids: treatmentIds.length > 0 ? treatmentIds : undefined,
            min_roi: minROI,
            min_procedures: minProcedures,
            date_range: start_date && end_date ? { start: start_date, end: end_date } : undefined,
            sort_by: sortBy,
            sort_order: sortOrder,
          };
          validatedFilters = marketing_roi_1.TreatmentROIFiltersSchema.parse(filters);
          return [
            4 /*yield*/,
            (0,
            marketing_roi_service_1.createmarketingROIService)().getTreatmentProfitabilityAnalysis(
              clinicId,
              validatedFilters,
            ),
          ];
        case 2:
          profitabilityAnalysis = _b.sent();
          return [2 /*return*/, server_1.NextResponse.json(profitabilityAnalysis)];
        case 3:
          error_1 = _b.sent();
          console.error("[Marketing ROI API] GET treatment profitability:", error_1);
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Validation error", details: error_1.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Internal server error", message: error_1.message },
              { status: 500 },
            ),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * POST /api/marketing-roi/treatment-profitability/calculate
 * Calculate treatment ROI for specific treatment and period
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var validation, clinicId, body, treatment_id, period_start, period_end, treatmentROI, error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 5]);
          return [4 /*yield*/, validateUserAndClinic(request)];
        case 1:
          validation = _a.sent();
          if (validation.error) return [2 /*return*/, validation.error];
          clinicId = validation.clinicId;
          return [4 /*yield*/, request.json()];
        case 2:
          body = _a.sent();
          (treatment_id = body.treatment_id),
            (period_start = body.period_start),
            (period_end = body.period_end);
          if (!treatment_id || !period_start || !period_end) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "treatment_id, period_start, and period_end are required" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            (0, marketing_roi_service_1.createmarketingROIService)().calculateTreatmentROI(
              clinicId,
              treatment_id,
              new Date(period_start),
              new Date(period_end),
            ),
          ];
        case 3:
          treatmentROI = _a.sent();
          return [2 /*return*/, server_1.NextResponse.json(treatmentROI)];
        case 4:
          error_2 = _a.sent();
          console.error("[Marketing ROI API] POST calculate treatment ROI:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Internal server error", message: error_2.message },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
