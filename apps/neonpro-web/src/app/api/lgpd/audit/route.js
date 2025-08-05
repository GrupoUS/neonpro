"use strict";
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
var zod_1 = require("zod");
var compliance_manager_1 = require("@/lib/lgpd/compliance-manager");
// Validation schemas
var auditQuerySchema = zod_1.z.object({
  userId: zod_1.z.string().uuid().optional(),
  eventType: zod_1.z
    .enum([
      "consent_change",
      "data_access",
      "data_modification",
      "data_deletion",
      "admin_action",
      "system_access",
      "security_event",
    ])
    .optional(),
  startDate: zod_1.z.string().datetime().optional(),
  endDate: zod_1.z.string().datetime().optional(),
  search: zod_1.z.string().optional(),
  page: zod_1.z.coerce.number().min(1).default(1),
  limit: zod_1.z.coerce.number().min(1).max(100).default(20),
  sortBy: zod_1.z.enum(["created_at", "event_type", "user_id"]).default("created_at"),
  sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
var auditCreateSchema = zod_1.z.object({
  eventType: zod_1.z.enum([
    "consent_change",
    "data_access",
    "data_modification",
    "data_deletion",
    "admin_action",
    "system_access",
    "security_event",
  ]),
  description: zod_1.z.string().min(1).max(500),
  details: zod_1.z.string().optional(),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
  targetUserId: zod_1.z.string().uuid().optional(),
});
var exportSchema = zod_1.z.object({
  format: zod_1.z.enum(["json", "csv"]).default("json"),
  userId: zod_1.z.string().uuid().optional(),
  eventType: zod_1.z
    .enum([
      "consent_change",
      "data_access",
      "data_modification",
      "data_deletion",
      "admin_action",
      "system_access",
      "security_event",
    ])
    .optional(),
  startDate: zod_1.z.string().datetime().optional(),
  endDate: zod_1.z.string().datetime().optional(),
});
// GET /api/lgpd/audit - Get audit trail
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      profile,
      isAdmin,
      url,
      queryParams,
      validatedQuery,
      isExport,
      query,
      _b,
      auditEvents,
      auditError,
      countQuery,
      totalCount,
      stats,
      eventTypeStats,
      complianceManager,
      error_1;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 10, , 11]);
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
          isAdmin = (profile === null || profile === void 0 ? void 0 : profile.role) === "admin";
          if (!isAdmin) {
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
          validatedQuery = auditQuerySchema.parse(queryParams);
          isExport = url.searchParams.get("export") === "true";
          if (!isExport) return [3 /*break*/, 5];
          return [4 /*yield*/, handleAuditExport(supabase, validatedQuery, user.id)];
        case 4:
          return [2 /*return*/, _c.sent()];
        case 5:
          query = supabase
            .from("lgpd_audit_trail")
            .select(
              "\n        id,\n        event_type,\n        user_id,\n        description,\n        details,\n        metadata,\n        ip_address,\n        user_agent,\n        created_at\n      ",
            );
          // Apply filters
          if (validatedQuery.userId) {
            query = query.eq("user_id", validatedQuery.userId);
          }
          if (validatedQuery.eventType) {
            query = query.eq("event_type", validatedQuery.eventType);
          }
          if (validatedQuery.startDate) {
            query = query.gte("created_at", validatedQuery.startDate);
          }
          if (validatedQuery.endDate) {
            query = query.lte("created_at", validatedQuery.endDate);
          }
          if (validatedQuery.search) {
            query = query.or(
              "description.ilike.%"
                .concat(validatedQuery.search, "%,details.ilike.%")
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
        case 6:
          (_b = _c.sent()), (auditEvents = _b.data), (auditError = _b.error);
          if (auditError) {
            throw new Error("Failed to fetch audit events: ".concat(auditError.message));
          }
          countQuery = supabase
            .from("lgpd_audit_trail")
            .select("*", { count: "exact", head: true });
          if (validatedQuery.userId) {
            countQuery = countQuery.eq("user_id", validatedQuery.userId);
          }
          if (validatedQuery.eventType) {
            countQuery = countQuery.eq("event_type", validatedQuery.eventType);
          }
          if (validatedQuery.startDate) {
            countQuery = countQuery.gte("created_at", validatedQuery.startDate);
          }
          if (validatedQuery.endDate) {
            countQuery = countQuery.lte("created_at", validatedQuery.endDate);
          }
          return [
            4 /*yield*/,
            countQuery,
            // Get audit statistics
          ];
        case 7:
          totalCount = _c.sent().count;
          return [
            4 /*yield*/,
            supabase
              .from("lgpd_audit_trail")
              .select("event_type")
              .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          ]; // Last 30 days
        case 8:
          stats = _c.sent().data; // Last 30 days
          eventTypeStats =
            (stats === null || stats === void 0
              ? void 0
              : stats.reduce(function (acc, event) {
                  acc[event.event_type] = (acc[event.event_type] || 0) + 1;
                  return acc;
                }, {})) || {};
          complianceManager = new compliance_manager_1.LGPDComplianceManager(supabase);
          return [
            4 /*yield*/,
            complianceManager.logAuditEvent({
              eventType: "admin_action",
              userId: user.id,
              description: "Audit trail accessed",
              details: "Admin accessed LGPD audit trail",
              metadata: {
                query_params: validatedQuery,
                access_time: new Date().toISOString(),
              },
            }),
          ];
        case 9:
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                events: auditEvents,
                statistics: eventTypeStats,
                pagination: {
                  page: validatedQuery.page,
                  limit: validatedQuery.limit,
                  total: totalCount || 0,
                  totalPages: Math.ceil((totalCount || 0) / validatedQuery.limit),
                },
              },
            }),
          ];
        case 10:
          error_1 = _c.sent();
          console.error("LGPD Audit GET Error:", error_1);
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
        case 11:
          return [2 /*return*/];
      }
    });
  });
}
// POST /api/lgpd/audit - Create audit event (admin only)
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
      auditEvent,
      error_2;
    return __generator(this, function (_b) {
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
          validatedData = auditCreateSchema.parse(body);
          complianceManager = new compliance_manager_1.LGPDComplianceManager(supabase);
          return [
            4 /*yield*/,
            complianceManager.logAuditEvent({
              eventType: validatedData.eventType,
              userId: validatedData.targetUserId || user.id,
              description: validatedData.description,
              details: validatedData.details,
              metadata: validatedData.metadata,
            }),
          ];
        case 5:
          auditEvent = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                data: auditEvent,
              },
              { status: 201 },
            ),
          ];
        case 6:
          error_2 = _b.sent();
          console.error("LGPD Audit POST Error:", error_2);
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
// Helper function to handle audit export
function handleAuditExport(supabase, queryParams, adminUserId) {
  return __awaiter(this, void 0, void 0, function () {
    var exportParams,
      query,
      _a,
      auditEvents,
      auditError,
      complianceManager,
      csvHeaders,
      csvRows,
      csvContent,
      error_3;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          exportParams = exportSchema.parse(queryParams);
          query = supabase
            .from("lgpd_audit_trail")
            .select(
              "\n        id,\n        event_type,\n        user_id,\n        description,\n        details,\n        metadata,\n        ip_address,\n        user_agent,\n        created_at\n      ",
            );
          // Apply same filters as GET
          if (exportParams.userId) {
            query = query.eq("user_id", exportParams.userId);
          }
          if (exportParams.eventType) {
            query = query.eq("event_type", exportParams.eventType);
          }
          if (exportParams.startDate) {
            query = query.gte("created_at", exportParams.startDate);
          }
          if (exportParams.endDate) {
            query = query.lte("created_at", exportParams.endDate);
          }
          return [4 /*yield*/, query.order("created_at", { ascending: false }).limit(10000)]; // Reasonable limit for export
        case 1:
          (_a =
            _b.sent()), // Reasonable limit for export
            (auditEvents = _a.data),
            (auditError = _a.error);
          if (auditError) {
            throw new Error("Failed to fetch audit events for export: ".concat(auditError.message));
          }
          complianceManager = new compliance_manager_1.LGPDComplianceManager(supabase);
          return [
            4 /*yield*/,
            complianceManager.logAuditEvent({
              eventType: "admin_action",
              userId: adminUserId,
              description: "Audit trail exported",
              details: "Admin exported "
                .concat(
                  (auditEvents === null || auditEvents === void 0 ? void 0 : auditEvents.length) ||
                    0,
                  " audit events in ",
                )
                .concat(exportParams.format, " format"),
              metadata: {
                export_params: exportParams,
                export_count:
                  (auditEvents === null || auditEvents === void 0 ? void 0 : auditEvents.length) ||
                  0,
                export_time: new Date().toISOString(),
              },
            }),
          ];
        case 2:
          _b.sent();
          if (exportParams.format === "csv") {
            csvHeaders =
              "ID,Event Type,User ID,Description,Details,IP Address,User Agent,Created At\n";
            csvRows =
              (auditEvents === null || auditEvents === void 0
                ? void 0
                : auditEvents
                    .map(function (event) {
                      var details =
                        typeof event.details === "string" ? event.details.replace(/"/g, '""') : "";
                      var description = event.description.replace(/"/g, '""');
                      return '"'
                        .concat(event.id, '","')
                        .concat(event.event_type, '","')
                        .concat(event.user_id, '","')
                        .concat(description, '","')
                        .concat(details, '","')
                        .concat(event.ip_address || "", '","')
                        .concat(event.user_agent || "", '","')
                        .concat(event.created_at, '"');
                    })
                    .join("\n")) || "";
            csvContent = csvHeaders + csvRows;
            return [
              2 /*return*/,
              new server_1.NextResponse(csvContent, {
                headers: {
                  "Content-Type": "text/csv",
                  "Content-Disposition": 'attachment; filename="lgpd_audit_export_'.concat(
                    new Date().toISOString().split("T")[0],
                    '.csv"',
                  ),
                },
              }),
            ];
          }
          // Return JSON format
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                events: auditEvents,
                exportInfo: {
                  format: exportParams.format,
                  exportedAt: new Date().toISOString(),
                  totalRecords:
                    (auditEvents === null || auditEvents === void 0
                      ? void 0
                      : auditEvents.length) || 0,
                  filters: exportParams,
                },
              },
            }),
          ];
        case 3:
          error_3 = _b.sent();
          console.error("Audit Export Error:", error_3);
          throw error_3;
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
