"use strict";
/**
 * Optimized Batch Conflict Resolution API Route - PERF-02
 * Healthcare-compliant batch resolution with LGPD/ANVISA/CFM compliance
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
// Validation schema
var batchResolutionSchema = zod_1.z.object({
  conflictIds: zod_1.z.array(zod_1.z.string().uuid()),
  resolutionType: zod_1.z.enum(["reschedule", "reassign", "cancel", "override"]),
  metadata: zod_1.z.object({
    batchProcessed: zod_1.z.boolean(),
    lgpdCompliant: zod_1.z.boolean(),
    processingTime: zod_1.z.string(),
    emergencyFlag: zod_1.z.boolean().optional(),
    clinicalPriority: zod_1.z.number().optional(),
  }),
  timestamp: zod_1.z.string(),
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
      conflictIds,
      resolutionType,
      metadata,
      totalConflicts,
      _b,
      resolutionResult,
      resolutionError,
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
                  performance: {
                    totalConflicts: 0,
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
                  performance: {
                    totalConflicts: 0,
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
          validatedData = batchResolutionSchema.parse(body);
          (conflictIds = validatedData.conflictIds),
            (resolutionType = validatedData.resolutionType),
            (metadata = validatedData.metadata);
          totalConflicts = conflictIds.length;
          // LGPD compliance validation
          if (!metadata.lgpdCompliant) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  performance: {
                    totalConflicts: totalConflicts,
                    processingTime: 0,
                    apiCallsReduced: 0,
                    batchEfficiency: "0%",
                  },
                  error: "LGPD compliance required for batch resolution",
                },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.rpc("resolve_conflicts_batch", {
              p_conflict_ids: conflictIds,
              p_resolution_type: resolutionType,
              p_user_id: user.id,
              p_tenant_id: tenantId,
              p_metadata: metadata,
              p_batch_timestamp: new Date().toISOString(),
            }),
          ];
        case 4:
          (_b = _c.sent()), (resolutionResult = _b.data), (resolutionError = _b.error);
          if (resolutionError) {
            console.error("Batch resolution error:", resolutionError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  performance: {
                    totalConflicts: totalConflicts,
                    processingTime: Date.now() - startTime,
                    apiCallsReduced: 0,
                    batchEfficiency: "0%",
                  },
                  error: "Resolution failed: ".concat(resolutionError.message),
                },
                { status: 500 },
              ),
            ];
          }
          processingTime = Date.now() - startTime;
          apiCallsReduced = Math.max(0, totalConflicts - 1);
          batchEfficiency =
            totalConflicts > 1 ? ((apiCallsReduced / totalConflicts) * 100).toFixed(1) + "%" : "0%";
          // Audit logging for healthcare compliance
          return [
            4 /*yield*/,
            supabase.from("audit_logs").insert({
              action: "batch_conflict_resolution",
              user_id: user.id,
              tenant_id: tenantId,
              metadata: {
                conflictIds: conflictIds,
                resolutionType: resolutionType,
                batchSize: totalConflicts,
                processingTime: processingTime,
                apiCallsReduced: apiCallsReduced,
                resolvedCount:
                  (resolutionResult === null || resolutionResult === void 0
                    ? void 0
                    : resolutionResult.resolved_count) || 0,
                lgpdCompliant: true,
                complianceValidated: true,
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
              data: {
                resolvedCount:
                  (resolutionResult === null || resolutionResult === void 0
                    ? void 0
                    : resolutionResult.resolved_count) || 0,
                rescheduled:
                  (resolutionResult === null || resolutionResult === void 0
                    ? void 0
                    : resolutionResult.rescheduled_count) || 0,
                cancelled:
                  (resolutionResult === null || resolutionResult === void 0
                    ? void 0
                    : resolutionResult.cancelled_count) || 0,
                errors:
                  (resolutionResult === null || resolutionResult === void 0
                    ? void 0
                    : resolutionResult.errors) || [],
              },
              performance: {
                totalConflicts: totalConflicts,
                processingTime: processingTime,
                apiCallsReduced: apiCallsReduced,
                batchEfficiency: batchEfficiency,
              },
            }),
          ];
        case 6:
          error_1 = _c.sent();
          console.error("Batch resolution API error:", error_1);
          processingTime = Date.now() - startTime;
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  performance: {
                    totalConflicts: 0,
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
                performance: {
                  totalConflicts: 0,
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
