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
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
var compliance_manager_1 = require("@/lib/lgpd/compliance-manager");
// Validation schemas
var breachCreateSchema = zod_1.z.object({
  title: zod_1.z.string().min(1).max(255),
  description: zod_1.z.string().min(10).max(2000),
  severity: zod_1.z.enum(["low", "medium", "high", "critical"]),
  breachType: zod_1.z.enum([
    "unauthorized_access",
    "data_loss",
    "system_compromise",
    "human_error",
    "malicious_attack",
    "other",
  ]),
  affectedDataTypes: zod_1.z.array(zod_1.z.string()).min(1),
  estimatedAffectedUsers: zod_1.z.number().min(0),
  discoveredAt: zod_1.z.string().datetime(),
  containedAt: zod_1.z.string().datetime().optional(),
  rootCause: zod_1.z.string().optional(),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
var breachUpdateSchema = zod_1.z.object({
  status: zod_1.z.enum(["reported", "investigating", "contained", "resolved"]).optional(),
  severity: zod_1.z.enum(["low", "medium", "high", "critical"]).optional(),
  containedAt: zod_1.z.string().datetime().optional(),
  resolvedAt: zod_1.z.string().datetime().optional(),
  rootCause: zod_1.z.string().optional(),
  mitigationSteps: zod_1.z.array(zod_1.z.string()).optional(),
  lessonsLearned: zod_1.z.string().optional(),
  authorityNotified: zod_1.z.boolean().optional(),
  usersNotified: zod_1.z.boolean().optional(),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
var breachQuerySchema = zod_1.z.object({
  status: zod_1.z.enum(["reported", "investigating", "contained", "resolved"]).optional(),
  severity: zod_1.z.enum(["low", "medium", "high", "critical"]).optional(),
  breachType: zod_1.z
    .enum([
      "unauthorized_access",
      "data_loss",
      "system_compromise",
      "human_error",
      "malicious_attack",
      "other",
    ])
    .optional(),
  startDate: zod_1.z.string().datetime().optional(),
  endDate: zod_1.z.string().datetime().optional(),
  search: zod_1.z.string().optional(),
  page: zod_1.z.coerce.number().min(1).default(1),
  limit: zod_1.z.coerce.number().min(1).max(100).default(20),
  sortBy: zod_1.z
    .enum(["discovered_at", "severity", "status", "estimated_affected_users"])
    .default("discovered_at"),
  sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
var notificationSchema = zod_1.z.object({
  notifyAuthority: zod_1.z.boolean().default(false),
  notifyUsers: zod_1.z.boolean().default(false),
  customMessage: zod_1.z.string().optional(),
});
// GET /api/lgpd/breach - Get breach incidents (admin only)
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      profile,
      url,
      queryParams,
      validatedQuery,
      query,
      _b,
      breaches,
      breachError,
      countQuery,
      totalCount,
      stats,
      severityStats,
      statusStats,
      complianceManager,
      error_1;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 8, , 9]);
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
          return [4 /*yield*/, supabase.from("profiles").select("role").eq("id", user.id).single()];
        case 3:
          profile = _c.sent().data;
          if ((profile === null || profile === void 0 ? void 0 : profile.role) !== "admin") {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 },
              ),
            ];
          }
          url = new URL(request.url);
          queryParams = Object.fromEntries(url.searchParams.entries());
          validatedQuery = breachQuerySchema.parse(queryParams);
          query = supabase
            .from("lgpd_breach_incidents")
            .select(
              "\n        id,\n        title,\n        description,\n        status,\n        severity,\n        breach_type,\n        affected_data_types,\n        estimated_affected_users,\n        discovered_at,\n        contained_at,\n        resolved_at,\n        root_cause,\n        mitigation_steps,\n        lessons_learned,\n        authority_notified,\n        authority_notification_date,\n        users_notified,\n        user_notification_date,\n        reported_by,\n        created_at,\n        updated_at\n      ",
            );
          // Apply filters
          if (validatedQuery.status) {
            query = query.eq("status", validatedQuery.status);
          }
          if (validatedQuery.severity) {
            query = query.eq("severity", validatedQuery.severity);
          }
          if (validatedQuery.breachType) {
            query = query.eq("breach_type", validatedQuery.breachType);
          }
          if (validatedQuery.startDate) {
            query = query.gte("discovered_at", validatedQuery.startDate);
          }
          if (validatedQuery.endDate) {
            query = query.lte("discovered_at", validatedQuery.endDate);
          }
          if (validatedQuery.search) {
            query = query.or(
              "title.ilike.%"
                .concat(validatedQuery.search, "%,description.ilike.%")
                .concat(validatedQuery.search, "%"),
            );
          }
          return [
            4 /*yield*/,
            query
              .order(validatedQuery.sortBy, { ascending: validatedQuery.sortOrder === "asc" })
              .range(
                (validatedQuery.page - 1) * validatedQuery.limit,
                validatedQuery.page * validatedQuery.limit - 1,
              ),
          ];
        case 4:
          (_b = _c.sent()), (breaches = _b.data), (breachError = _b.error);
          if (breachError) {
            throw new Error("Failed to fetch breach incidents: ".concat(breachError.message));
          }
          countQuery = supabase
            .from("lgpd_breach_incidents")
            .select("*", { count: "exact", head: true });
          if (validatedQuery.status) {
            countQuery = countQuery.eq("status", validatedQuery.status);
          }
          if (validatedQuery.severity) {
            countQuery = countQuery.eq("severity", validatedQuery.severity);
          }
          if (validatedQuery.breachType) {
            countQuery = countQuery.eq("breach_type", validatedQuery.breachType);
          }
          return [
            4 /*yield*/,
            countQuery,
            // Get breach statistics
          ];
        case 5:
          totalCount = _c.sent().count;
          return [
            4 /*yield*/,
            supabase
              .from("lgpd_breach_incidents")
              .select("severity, status")
              .gte("discovered_at", new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()),
          ]; // Last year
        case 6:
          stats = _c.sent().data; // Last year
          severityStats =
            (stats === null || stats === void 0
              ? void 0
              : stats.reduce((acc, breach) => {
                  acc[breach.severity] = (acc[breach.severity] || 0) + 1;
                  return acc;
                }, {})) || {};
          statusStats =
            (stats === null || stats === void 0
              ? void 0
              : stats.reduce((acc, breach) => {
                  acc[breach.status] = (acc[breach.status] || 0) + 1;
                  return acc;
                }, {})) || {};
          complianceManager = new compliance_manager_1.LGPDComplianceManager(supabase);
          return [
            4 /*yield*/,
            complianceManager.logAuditEvent({
              eventType: "admin_action",
              userId: user.id,
              description: "Breach incidents accessed",
              details: "Admin accessed LGPD breach management dashboard",
              metadata: {
                query_params: validatedQuery,
                access_time: new Date().toISOString(),
              },
            }),
          ];
        case 7:
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                breaches: breaches,
                statistics: {
                  severity: severityStats,
                  status: statusStats,
                },
                pagination: {
                  page: validatedQuery.page,
                  limit: validatedQuery.limit,
                  total: totalCount || 0,
                  totalPages: Math.ceil((totalCount || 0) / validatedQuery.limit),
                },
              },
            }),
          ];
        case 8:
          error_1 = _c.sent();
          console.error("LGPD Breach GET Error:", error_1);
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid query parameters", details: error_1.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 9:
          return [2 /*return*/];
      }
    });
  });
}
// POST /api/lgpd/breach - Report new breach incident
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      profile,
      body,
      validatedData,
      complianceManager,
      breach,
      error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 6, , 7]);
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
          return [4 /*yield*/, supabase.from("profiles").select("role").eq("id", user.id).single()];
        case 3:
          profile = _b.sent().data;
          if ((profile === null || profile === void 0 ? void 0 : profile.role) !== "admin") {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _b.sent();
          validatedData = breachCreateSchema.parse(body);
          complianceManager = new compliance_manager_1.LGPDComplianceManager(supabase);
          return [
            4 /*yield*/,
            complianceManager.reportBreachIncident({
              title: validatedData.title,
              description: validatedData.description,
              severity: validatedData.severity,
              breachType: validatedData.breachType,
              affectedDataTypes: validatedData.affectedDataTypes,
              estimatedAffectedUsers: validatedData.estimatedAffectedUsers,
              discoveredAt: new Date(validatedData.discoveredAt),
              containedAt: validatedData.containedAt
                ? new Date(validatedData.containedAt)
                : undefined,
              rootCause: validatedData.rootCause,
              reportedBy: user.id,
              metadata: validatedData.metadata,
            }),
          ];
        case 5:
          breach = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                data: breach,
              },
              { status: 201 },
            ),
          ];
        case 6:
          error_2 = _b.sent();
          console.error("LGPD Breach POST Error:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid request data", details: error_2.errors },
                { status: 400 },
              ),
            ];
          }
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
// PUT /api/lgpd/breach - Update breach incident
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      profile,
      body,
      validatedData,
      url,
      breachId,
      existingBreach,
      updateData,
      _b,
      updatedBreach,
      updateError,
      complianceManager,
      error_3;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 8, , 9]);
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
          return [4 /*yield*/, supabase.from("profiles").select("role").eq("id", user.id).single()];
        case 3:
          profile = _c.sent().data;
          if ((profile === null || profile === void 0 ? void 0 : profile.role) !== "admin") {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _c.sent();
          validatedData = breachUpdateSchema.parse(body);
          url = new URL(request.url);
          breachId = url.searchParams.get("id");
          if (!breachId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Breach ID is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("lgpd_breach_incidents").select("*").eq("id", breachId).single(),
          ];
        case 5:
          existingBreach = _c.sent().data;
          if (!existingBreach) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Breach incident not found" }, { status: 404 }),
            ];
          }
          updateData = {
            updated_at: new Date().toISOString(),
          };
          if (validatedData.status) {
            updateData.status = validatedData.status;
            if (validatedData.status === "resolved" && validatedData.resolvedAt) {
              updateData.resolved_at = validatedData.resolvedAt;
            }
          }
          if (validatedData.severity) {
            updateData.severity = validatedData.severity;
          }
          if (validatedData.containedAt) {
            updateData.contained_at = validatedData.containedAt;
          }
          if (validatedData.rootCause) {
            updateData.root_cause = validatedData.rootCause;
          }
          if (validatedData.mitigationSteps) {
            updateData.mitigation_steps = validatedData.mitigationSteps;
          }
          if (validatedData.lessonsLearned) {
            updateData.lessons_learned = validatedData.lessonsLearned;
          }
          if (validatedData.authorityNotified !== undefined) {
            updateData.authority_notified = validatedData.authorityNotified;
            if (validatedData.authorityNotified) {
              updateData.authority_notification_date = new Date().toISOString();
            }
          }
          if (validatedData.usersNotified !== undefined) {
            updateData.users_notified = validatedData.usersNotified;
            if (validatedData.usersNotified) {
              updateData.user_notification_date = new Date().toISOString();
            }
          }
          if (validatedData.metadata) {
            updateData.metadata = validatedData.metadata;
          }
          return [
            4 /*yield*/,
            supabase
              .from("lgpd_breach_incidents")
              .update(updateData)
              .eq("id", breachId)
              .select()
              .single(),
          ];
        case 6:
          (_b = _c.sent()), (updatedBreach = _b.data), (updateError = _b.error);
          if (updateError) {
            throw new Error("Failed to update breach incident: ".concat(updateError.message));
          }
          complianceManager = new compliance_manager_1.LGPDComplianceManager(supabase);
          return [
            4 /*yield*/,
            complianceManager.logAuditEvent({
              eventType: "admin_action",
              userId: user.id,
              description: "Breach incident updated",
              details: "Breach incident ".concat(breachId, " updated by admin"),
              metadata: {
                breach_id: breachId,
                old_status: existingBreach.status,
                new_status: validatedData.status,
                changes: validatedData,
              },
            }),
          ];
        case 7:
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: updatedBreach,
            }),
          ];
        case 8:
          error_3 = _c.sent();
          console.error("LGPD Breach PUT Error:", error_3);
          if (error_3 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid request data", details: error_3.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 9:
          return [2 /*return*/];
      }
    });
  });
}
