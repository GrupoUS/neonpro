// =====================================================================================
// CLINIC RETENTION METRICS API ENDPOINTS
// Epic 7.4: Patient Retention Analytics + Predictions
// API endpoints for clinic-wide retention metrics and analytics
// =====================================================================================
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
var server_2 = require("@/app/utils/supabase/server");
var retention_analytics_service_1 = require("@/app/lib/services/retention-analytics-service");
var zod_1 = require("zod");
// =====================================================================================
// VALIDATION SCHEMAS
// =====================================================================================
var ClinicMetricsParamsSchema = zod_1.z.object({
  clinicId: zod_1.z.string().uuid("Invalid clinic ID format"),
});
var ClinicMetricsQuerySchema = zod_1.z.object({
  limit: zod_1.z.coerce.number().min(1).max(1000).default(100),
  offset: zod_1.z.coerce.number().min(0).default(0),
  startDate: zod_1.z.string().optional(),
  endDate: zod_1.z.string().optional(),
  riskLevel: zod_1.z.enum(["low", "medium", "high", "critical"]).optional(),
});
// =====================================================================================
// GET CLINIC RETENTION METRICS
// =====================================================================================
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var clinicValidation,
      clinicId,
      searchParams,
      queryValidation,
      _c,
      limit,
      offset,
      startDate_1,
      endDate_1,
      riskLevel_1,
      supabase,
      _d,
      user,
      authError,
      _e,
      userProfile,
      profileError,
      _f,
      clinic,
      clinicError,
      retentionService,
      metrics,
      filteredMetrics,
      summary,
      error_1;
    var params = _b.params;
    return __generator(this, (_g) => {
      switch (_g.label) {
        case 0:
          _g.trys.push([0, 6, , 7]);
          clinicValidation = ClinicMetricsParamsSchema.safeParse({
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
          queryValidation = ClinicMetricsQuerySchema.safeParse({
            limit: searchParams.get("limit"),
            offset: searchParams.get("offset"),
            startDate: searchParams.get("startDate"),
            endDate: searchParams.get("endDate"),
            riskLevel: searchParams.get("riskLevel"),
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
            (limit = _c.limit),
            (offset = _c.offset),
            (startDate_1 = _c.startDate),
            (endDate_1 = _c.endDate),
            (riskLevel_1 = _c.riskLevel);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _g.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
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
        case 3:
          (_e = _g.sent()), (userProfile = _e.data), (profileError = _e.error);
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
          return [
            4 /*yield*/,
            supabase.from("clinics").select("id, name").eq("id", clinicId).single(),
          ];
        case 4:
          (_f = _g.sent()), (clinic = _f.data), (clinicError = _f.error);
          if (clinicError || !clinic) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Clinic not found" }, { status: 404 }),
            ];
          }
          retentionService = new retention_analytics_service_1.RetentionAnalyticsService();
          return [4 /*yield*/, retentionService.getClinicRetentionMetrics(clinicId, limit, offset)];
        case 5:
          metrics = _g.sent();
          filteredMetrics = metrics;
          if (startDate_1 || endDate_1 || riskLevel_1) {
            filteredMetrics = metrics.filter((metric) => {
              // Filter by date range
              if (startDate_1 && new Date(metric.last_appointment_date) < new Date(startDate_1)) {
                return false;
              }
              if (endDate_1 && new Date(metric.last_appointment_date) > new Date(endDate_1)) {
                return false;
              }
              // Filter by risk level
              if (riskLevel_1 && metric.churn_risk_level !== riskLevel_1) {
                return false;
              }
              return true;
            });
          }
          summary = {
            total_patients: filteredMetrics.length,
            average_retention_rate:
              filteredMetrics.reduce((sum, m) => sum + m.retention_rate, 0) /
                filteredMetrics.length || 0,
            average_churn_risk:
              filteredMetrics.reduce((sum, m) => sum + m.churn_risk_score, 0) /
                filteredMetrics.length || 0,
            risk_distribution: {
              low: filteredMetrics.filter((m) => m.churn_risk_level === "low").length,
              medium: filteredMetrics.filter((m) => m.churn_risk_level === "medium").length,
              high: filteredMetrics.filter((m) => m.churn_risk_level === "high").length,
              critical: filteredMetrics.filter((m) => m.churn_risk_level === "critical").length,
            },
            total_lifetime_value: filteredMetrics.reduce((sum, m) => sum + m.lifetime_value, 0),
            patients_at_risk: filteredMetrics.filter((m) =>
              ["high", "critical"].includes(m.churn_risk_level),
            ).length,
          };
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                metrics: filteredMetrics,
                summary: summary,
                pagination: {
                  limit: limit,
                  offset: offset,
                  total: filteredMetrics.length,
                  hasMore: offset + limit < filteredMetrics.length,
                },
                filters: {
                  startDate: startDate_1,
                  endDate: endDate_1,
                  riskLevel: riskLevel_1,
                },
              },
              timestamp: new Date().toISOString(),
            }),
          ];
        case 6:
          error_1 = _g.sent();
          console.error("Error getting clinic retention metrics:", error_1);
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
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================================================
// BULK CALCULATE CLINIC RETENTION METRICS
// =====================================================================================
function POST(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var clinicValidation,
      clinicId_1,
      body,
      patientIds,
      _c,
      forceRecalculate,
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
      patients,
      patientsError,
      _g,
      validPatients,
      validationError,
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
    var params = _b.params;
    return __generator(this, (_h) => {
      switch (_h.label) {
        case 0:
          _h.trys.push([0, 12, , 13]);
          clinicValidation = ClinicMetricsParamsSchema.safeParse({
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
          body = _h.sent();
          (patientIds = body.patientIds),
            (_c = body.forceRecalculate),
            (forceRecalculate = _c === void 0 ? false : _c);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _h.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_d = _h.sent()), (user = _d.data.user), (authError = _d.error);
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
          (_e = _h.sent()), (userProfile = _e.data), (profileError = _e.error);
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
          allowedRoles = ["admin", "manager", "analyst"];
          if (!allowedRoles.includes(userProfile.role)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Insufficient permissions for bulk calculations" },
                { status: 403 },
              ),
            ];
          }
          targetPatientIds = patientIds;
          if (!(!targetPatientIds || targetPatientIds.length === 0)) return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            supabase.from("patients").select("id").eq("clinic_id", clinicId_1).eq("active", true),
          ];
        case 5:
          (_f = _h.sent()), (patients = _f.data), (patientsError = _f.error);
          if (patientsError) {
            throw new Error("Failed to get patients: ".concat(patientsError.message));
          }
          targetPatientIds = patients.map((p) => p.id);
          _h.label = 6;
        case 6:
          return [
            4 /*yield*/,
            supabase
              .from("patients")
              .select("id")
              .eq("clinic_id", clinicId_1)
              .in("id", targetPatientIds),
          ];
        case 7:
          (_g = _h.sent()), (validPatients = _g.data), (validationError = _g.error);
          if (validationError || validPatients.length !== targetPatientIds.length) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Some patients do not belong to the specified clinic" },
                { status: 400 },
              ),
            ];
          }
          retentionService_1 = new retention_analytics_service_1.RetentionAnalyticsService();
          results_1 = [];
          errors_1 = [];
          batchSize = 10;
          i = 0;
          _h.label = 8;
        case 8:
          if (!(i < targetPatientIds.length)) return [3 /*break*/, 11];
          batch = targetPatientIds.slice(i, i + batchSize);
          batchPromises = batch.map((patientId) =>
            __awaiter(this, void 0, void 0, function () {
              var metrics, error_3;
              return __generator(this, (_a) => {
                switch (_a.label) {
                  case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [
                      4 /*yield*/,
                      retentionService_1.calculatePatientRetentionMetrics(patientId, clinicId_1),
                    ];
                  case 1:
                    metrics = _a.sent();
                    return [
                      2 /*return*/,
                      { patientId: patientId, metrics: metrics, success: true },
                    ];
                  case 2:
                    error_3 = _a.sent();
                    console.error(
                      "Failed to calculate metrics for patient ".concat(patientId, ":"),
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
            }),
          );
          return [4 /*yield*/, Promise.allSettled(batchPromises)];
        case 9:
          batchResults = _h.sent();
          batchResults.forEach((result) => {
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
          _h.label = 10;
        case 10:
          i += batchSize;
          return [3 /*break*/, 8];
        case 11:
          summary = {
            total_processed: targetPatientIds.length,
            successful: results_1.length,
            failed: errors_1.length,
            success_rate: results_1.length / targetPatientIds.length,
          };
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                results: results_1.map((r) => r.metrics),
                summary: summary,
                errors: errors_1.length > 0 ? errors_1 : undefined,
              },
              message: "Processed "
                .concat(results_1.length, " patients successfully, ")
                .concat(errors_1.length, " failed"),
              timestamp: new Date().toISOString(),
            }),
          ];
        case 12:
          error_2 = _h.sent();
          console.error("Error in bulk clinic retention metrics calculation:", error_2);
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
        case 13:
          return [2 /*return*/];
      }
    });
  });
}
