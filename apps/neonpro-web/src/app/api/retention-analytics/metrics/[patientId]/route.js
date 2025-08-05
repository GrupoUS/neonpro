// =====================================================================================
// PATIENT RETENTION METRICS API ENDPOINTS
// Epic 7.4: Patient Retention Analytics + Predictions
// API endpoints for patient-specific retention metrics
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
var PatientMetricsParamsSchema = zod_1.z.object({
  patientId: zod_1.z.string().uuid("Invalid patient ID format"),
  clinicId: zod_1.z.string().uuid("Invalid clinic ID format"),
});
var CalculateMetricsSchema = zod_1.z.object({
  patientId: zod_1.z.string().uuid("Invalid patient ID format"),
  clinicId: zod_1.z.string().uuid("Invalid clinic ID format"),
});
// =====================================================================================
// GET PATIENT RETENTION METRICS
// =====================================================================================
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var searchParams,
      clinicId,
      validation,
      _c,
      patientId,
      validatedClinicId,
      supabase,
      _d,
      user,
      authError,
      _e,
      userProfile,
      profileError,
      _f,
      patient,
      patientError,
      retentionService,
      metrics,
      error_1;
    var params = _b.params;
    return __generator(this, (_g) => {
      switch (_g.label) {
        case 0:
          _g.trys.push([0, 6, , 7]);
          searchParams = new URL(request.url).searchParams;
          clinicId = searchParams.get("clinicId");
          validation = PatientMetricsParamsSchema.safeParse({
            patientId: params.patientId,
            clinicId: clinicId,
          });
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid parameters",
                  details: validation.error.issues,
                },
                { status: 400 },
              ),
            ];
          }
          (_c = validation.data), (patientId = _c.patientId), (validatedClinicId = _c.clinicId);
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
          if (userProfile.clinic_id !== validatedClinicId) {
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
            supabase
              .from("patients")
              .select("id, clinic_id")
              .eq("id", patientId)
              .eq("clinic_id", validatedClinicId)
              .single(),
          ];
        case 4:
          (_f = _g.sent()), (patient = _f.data), (patientError = _f.error);
          if (patientError || !patient) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Patient not found or does not belong to clinic" },
                { status: 404 },
              ),
            ];
          }
          retentionService = new retention_analytics_service_1.RetentionAnalyticsService();
          return [
            4 /*yield*/,
            retentionService.getPatientRetentionMetrics(patientId, validatedClinicId),
          ];
        case 5:
          metrics = _g.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: metrics,
              timestamp: new Date().toISOString(),
            }),
          ];
        case 6:
          error_1 = _g.sent();
          console.error("Error getting patient retention metrics:", error_1);
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
// CALCULATE PATIENT RETENTION METRICS
// =====================================================================================
function POST(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var body,
      validation,
      _c,
      patientId,
      clinicId,
      supabase,
      _d,
      user,
      authError,
      _e,
      userProfile,
      profileError,
      _f,
      patient,
      patientError,
      allowedRoles,
      retentionService,
      metrics,
      error_2;
    var params = _b.params;
    return __generator(this, (_g) => {
      switch (_g.label) {
        case 0:
          _g.trys.push([0, 7, , 8]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _g.sent();
          validation = CalculateMetricsSchema.safeParse({
            patientId: params.patientId,
            clinicId: body.clinicId,
          });
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
          (_c = validation.data), (patientId = _c.patientId), (clinicId = _c.clinicId);
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
            supabase
              .from("patients")
              .select("id, clinic_id")
              .eq("id", patientId)
              .eq("clinic_id", clinicId)
              .single(),
          ];
        case 5:
          (_f = _g.sent()), (patient = _f.data), (patientError = _f.error);
          if (patientError || !patient) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Patient not found or does not belong to clinic" },
                { status: 404 },
              ),
            ];
          }
          allowedRoles = ["admin", "manager", "analyst"];
          if (!allowedRoles.includes(userProfile.role)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Insufficient permissions to calculate metrics" },
                { status: 403 },
              ),
            ];
          }
          retentionService = new retention_analytics_service_1.RetentionAnalyticsService();
          return [
            4 /*yield*/,
            retentionService.calculatePatientRetentionMetrics(patientId, clinicId),
          ];
        case 6:
          metrics = _g.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: metrics,
              message: "Retention metrics calculated successfully",
              timestamp: new Date().toISOString(),
            }),
          ];
        case 7:
          error_2 = _g.sent();
          console.error("Error calculating patient retention metrics:", error_2);
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
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
