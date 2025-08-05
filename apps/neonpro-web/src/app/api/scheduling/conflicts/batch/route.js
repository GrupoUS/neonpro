"use strict";
/**
 * Optimized Batch Conflict Detection API Route - PERF-02
 * Healthcare-compliant batch processing with ≥50% API call reduction
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
exports.POST = POST;
var server_1 = require("next/server");
var ssr_1 = require("@supabase/ssr");
var zod_1 = require("zod");
// Validation schemas
var batchConflictCheckSchema = zod_1.z.object({
  requests: zod_1.z.array(
    zod_1.z.object({
      id: zod_1.z.string().uuid(),
      appointmentId: zod_1.z.string().uuid().optional(),
      patientId: zod_1.z.string().uuid().optional(),
      professionalId: zod_1.z.string().uuid().optional(),
      timeSlot: zod_1.z.string().optional(),
    }),
  ),
  timestamp: zod_1.z.string(),
  batchSize: zod_1.z.number().max(50).optional(),
});
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var startTime,
      supabase,
      _a,
      user,
      authError,
      tenantId,
      body,
      validatedData,
      requests,
      totalRequests,
      lgpdConsent,
      appointmentIds,
      patientIds,
      professionalIds,
      conflictsQuery,
      conditions,
      _b,
      conflicts_1,
      conflictsError,
      results,
      processingTime,
      apiCallsReduced,
      batchEfficiency,
      error_1,
      processingTime;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          startTime = Date.now();
          _c.label = 1;
        case 1:
          _c.trys.push([1, 6, , 7]);
          supabase = (0, ssr_1.createServerClient)(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
              cookies: {
                get: function (name) {
                  var _a;
                  return (_a = request.cookies.get(name)) === null || _a === void 0
                    ? void 0
                    : _a.value;
                },
              },
            },
          );
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  results: [],
                  performance: {
                    totalRequests: 0,
                    processingTime: 0,
                    apiCallsReduced: 0,
                    batchEfficiency: "0%",
                  },
                  error: "Unauthorized",
                },
                { status: 401 },
              ),
            ];
          }
          tenantId = request.headers.get("x-tenant-id");
          if (!tenantId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  results: [],
                  performance: {
                    totalRequests: 0,
                    processingTime: 0,
                    apiCallsReduced: 0,
                    batchEfficiency: "0%",
                  },
                  error: "Tenant ID required",
                },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _c.sent();
          validatedData = batchConflictCheckSchema.parse(body);
          requests = validatedData.requests;
          totalRequests = requests.length;
          lgpdConsent = request.headers.get("x-lgpd-consent");
          if (!lgpdConsent) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  results: [],
                  performance: {
                    totalRequests: totalRequests,
                    processingTime: 0,
                    apiCallsReduced: 0,
                    batchEfficiency: "0%",
                  },
                  error: "LGPD consent required for batch operations",
                },
                { status: 400 },
              ),
            ];
          }
          appointmentIds = requests
            .map(function (req) {
              return req.appointmentId;
            })
            .filter(Boolean);
          patientIds = requests
            .map(function (req) {
              return req.patientId;
            })
            .filter(Boolean);
          professionalIds = requests
            .map(function (req) {
              return req.professionalId;
            })
            .filter(Boolean);
          conflictsQuery = supabase
            .from("schedule_conflicts")
            .select(
              "\n        *,\n        appointments!inner(\n          id, start_time, end_time, status, patient_id, professional_id,\n          patients!inner(id, name, email, lgpd_consent),\n          professionals!inner(id, name, specialty, availability_status)\n        ),\n        conflict_resolutions(\n          id, resolution_type, description, \n          impact_description, estimated_time_minutes, \n          compliance_impact, status\n        )\n      ",
            )
            .eq("status", "active")
            .eq("tenant_id", tenantId);
          conditions = [];
          if (appointmentIds.length > 0) {
            conditions.push("appointment_id.in.(".concat(appointmentIds.join(","), ")"));
          }
          if (patientIds.length > 0) {
            conditions.push("appointments.patient_id.in.(".concat(patientIds.join(","), ")"));
          }
          if (professionalIds.length > 0) {
            conditions.push(
              "appointments.professional_id.in.(".concat(professionalIds.join(","), ")"),
            );
          }
          if (conditions.length > 0) {
            conflictsQuery = conflictsQuery.or(conditions.join(","));
          }
          return [4 /*yield*/, conflictsQuery];
        case 4:
          (_b = _c.sent()), (conflicts_1 = _b.data), (conflictsError = _b.error);
          if (conflictsError) {
            console.error("Batch conflict query error:", conflictsError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  results: [],
                  performance: {
                    totalRequests: totalRequests,
                    processingTime: Date.now() - startTime,
                    apiCallsReduced: 0,
                    batchEfficiency: "0%",
                  },
                  error: "Database query failed",
                },
                { status: 500 },
              ),
            ];
          }
          results = requests.map(function (request) {
            var matchingConflicts = conflicts_1.filter(function (conflict) {
              if (request.appointmentId && conflict.appointment_id === request.appointmentId)
                return true;
              if (request.patientId && conflict.appointments.patient_id === request.patientId)
                return true;
              if (
                request.professionalId &&
                conflict.appointments.professional_id === request.professionalId
              )
                return true;
              return false;
            });
            return {
              requestId: request.id,
              conflicts: matchingConflicts.map(function (conflict) {
                return {
                  id: conflict.id,
                  type: conflict.type,
                  severity: conflict.severity,
                  description: conflict.description,
                  conflictTime: conflict.conflict_time,
                  appointmentId: conflict.appointment_id,
                  patientInfo: {
                    id: conflict.appointments.patients.id,
                    name: conflict.appointments.patients.name,
                    lgpdConsent: conflict.appointments.patients.lgpd_consent,
                  },
                  professionalInfo: {
                    id: conflict.appointments.professionals.id,
                    name: conflict.appointments.professionals.name,
                    specialty: conflict.appointments.professionals.specialty,
                  },
                  suggestedResolutions: conflict.conflict_resolutions.map(function (res) {
                    return {
                      id: res.id,
                      type: res.resolution_type,
                      description: res.description,
                      impact: res.impact_description,
                      estimatedTime: res.estimated_time_minutes,
                      complianceImpact: res.compliance_impact,
                    };
                  }),
                  metadata: {
                    lgpdConsent: conflict.lgpd_consent || false,
                    clinicalPriority: conflict.clinical_priority || 0,
                    emergencyFlag: conflict.emergency_flag || false,
                  },
                };
              }),
            };
          });
          processingTime = Date.now() - startTime;
          apiCallsReduced = Math.max(0, totalRequests - 1);
          batchEfficiency =
            totalRequests > 1 ? ((apiCallsReduced / totalRequests) * 100).toFixed(1) + "%" : "0%";
          // Audit logging for healthcare compliance
          return [
            4 /*yield*/,
            supabase.from("audit_logs").insert({
              action: "batch_conflict_check",
              user_id: user.id,
              tenant_id: tenantId,
              metadata: {
                batchSize: totalRequests,
                processingTime: processingTime,
                apiCallsReduced: apiCallsReduced,
                conflictsFound: results.reduce(function (sum, r) {
                  return sum + r.conflicts.length;
                }, 0),
                lgpdCompliant: true,
              },
              timestamp: new Date().toISOString(),
            }),
          ];
        case 5:
          // Audit logging for healthcare compliance
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              results: results,
              performance: {
                totalRequests: totalRequests,
                processingTime: processingTime,
                apiCallsReduced: apiCallsReduced,
                batchEfficiency: batchEfficiency,
              },
            }),
          ];
        case 6:
          error_1 = _c.sent();
          console.error("Batch conflict check error:", error_1);
          processingTime = Date.now() - startTime;
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  results: [],
                  performance: {
                    totalRequests: 0,
                    processingTime: processingTime,
                    apiCallsReduced: 0,
                    batchEfficiency: "0%",
                  },
                  error: "Validation failed: ".concat(
                    error_1.errors
                      .map(function (e) {
                        return e.message;
                      })
                      .join(", "),
                  ),
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
                results: [],
                performance: {
                  totalRequests: 0,
                  processingTime: processingTime,
                  apiCallsReduced: 0,
                  batchEfficiency: "0%",
                },
                error: "Internal server error",
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
