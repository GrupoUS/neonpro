"use strict";
/**
 * LGPD Compliance Reports API
 * API para geração e gerenciamento de relatórios de compliance LGPD
 *
 * @author APEX Master Developer
 * @version 1.0.0
 * @compliance LGPD Art. 37, 38, 39 (Relatórios e Documentação)
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
var server_1 = require("next/server");
var zod_1 = require("zod");
var supabase_js_1 = require("@supabase/supabase-js");
var csrf_1 = require("@/lib/security/csrf");
var rate_limit_1 = require("@/lib/security/rate-limit");
var middleware_1 = require("@/lib/auth/middleware");
var permissions_1 = require("@/lib/rbac/permissions");
var audit_trail_1 = require("@/lib/compliance/audit-trail");
var lgpd_core_1 = require("@/lib/compliance/lgpd-core");
// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================
var ReportRequestSchema = zod_1.z.object({
  type: zod_1.z.enum(["compliance", "audit", "consent", "data_subject", "security"]),
  period: zod_1.z.object({
    start: zod_1.z.string().datetime(),
    end: zod_1.z.string().datetime(),
  }),
  format: zod_1.z.enum(["json", "pdf", "csv", "xlsx"]).default("json"),
  filters: zod_1.z
    .object({
      userId: zod_1.z.string().uuid().optional(),
      eventType: zod_1.z.nativeEnum(audit_trail_1.AuditEventType).optional(),
      severity: zod_1.z.enum(["low", "medium", "high", "critical"]).optional(),
      status: zod_1.z.enum(["success", "failure", "warning", "error"]).optional(),
      resourceType: zod_1.z.string().optional(),
    })
    .optional(),
  includeDetails: zod_1.z.boolean().default(true),
  includeRecommendations: zod_1.z.boolean().default(true),
});
var ReportListQuerySchema = zod_1.z.object({
  page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).default("1"),
  limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(100)).default("20"),
  type: zod_1.z.enum(["compliance", "audit", "consent", "data_subject", "security"]).optional(),
  sortBy: zod_1.z.enum(["createdAt", "type", "period"]).default("createdAt"),
  sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function initializeServices() {
  var supabase = (0, supabase_js_1.createClient)(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  var auditTrail = new audit_trail_1.LGPDAuditTrail(supabase);
  var lgpdCore = new lgpd_core_1.LGPDCore(supabase);
  return { supabase: supabase, auditTrail: auditTrail, lgpdCore: lgpdCore };
}
function generateComplianceReport(clinicId, request, userId) {
  return __awaiter(this, void 0, void 0, function () {
    var _a,
      supabase,
      auditTrail,
      lgpdCore,
      period,
      baseReport,
      reportData,
      _b,
      formattedReport,
      error_1;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          (_a = initializeServices()),
            (supabase = _a.supabase),
            (auditTrail = _a.auditTrail),
            (lgpdCore = _a.lgpdCore);
          _c.label = 1;
        case 1:
          _c.trys.push([1, 14, , 15]);
          period = {
            start: new Date(request.period.start),
            end: new Date(request.period.end),
          };
          return [4 /*yield*/, auditTrail.generateComplianceReport(clinicId, period, userId)];
        case 2:
          baseReport = _c.sent();
          reportData = __assign({}, baseReport);
          _b = request.type;
          switch (_b) {
            case "audit":
              return [3 /*break*/, 3];
            case "consent":
              return [3 /*break*/, 5];
            case "data_subject":
              return [3 /*break*/, 7];
            case "security":
              return [3 /*break*/, 9];
          }
          return [3 /*break*/, 11];
        case 3:
          return [4 /*yield*/, generateAuditReport(auditTrail, clinicId, period, request.filters)];
        case 4:
          reportData = _c.sent();
          return [3 /*break*/, 12];
        case 5:
          return [4 /*yield*/, generateConsentReport(lgpdCore, clinicId, period)];
        case 6:
          reportData = _c.sent();
          return [3 /*break*/, 12];
        case 7:
          return [4 /*yield*/, generateDataSubjectReport(lgpdCore, clinicId, period)];
        case 8:
          reportData = _c.sent();
          return [3 /*break*/, 12];
        case 9:
          return [4 /*yield*/, generateSecurityReport(auditTrail, clinicId, period)];
        case 10:
          reportData = _c.sent();
          return [3 /*break*/, 12];
        case 11:
          // Use base compliance report
          return [3 /*break*/, 12];
        case 12:
          return [4 /*yield*/, formatReport(reportData, request.format)];
        case 13:
          formattedReport = _c.sent();
          return [2 /*return*/, formattedReport];
        case 14:
          error_1 = _c.sent();
          console.error("Failed to generate compliance report:", error_1);
          throw new Error("Falha ao gerar relatório de compliance");
        case 15:
          return [2 /*return*/];
      }
    });
  });
}
function generateAuditReport(auditTrail, clinicId, period, filters) {
  return __awaiter(this, void 0, void 0, function () {
    var query, events;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          query = __assign(
            { clinicId: clinicId, startDate: period.start, endDate: period.end, limit: 10000 },
            filters,
          );
          return [4 /*yield*/, auditTrail.queryEvents(query)];
        case 1:
          events = _a.sent().events;
          return [
            2 /*return*/,
            {
              id: crypto.randomUUID(),
              type: "audit",
              period: period,
              summary: {
                totalEvents: events.length,
                eventsByType: events.reduce(function (acc, event) {
                  acc[event.eventType] = (acc[event.eventType] || 0) + 1;
                  return acc;
                }, {}),
                eventsBySeverity: events.reduce(function (acc, event) {
                  acc[event.severity] = (acc[event.severity] || 0) + 1;
                  return acc;
                }, {}),
                uniqueUsers: new Set(
                  events.map(function (e) {
                    return e.userId;
                  }),
                ).size,
                timeRange: {
                  start: period.start,
                  end: period.end,
                },
              },
              events: events.slice(0, 1000), // Limit for performance
              generatedAt: new Date(),
            },
          ];
      }
    });
  });
}
function generateConsentReport(lgpdCore, clinicId, period) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      // This would integrate with the consent management system
      return [
        2 /*return*/,
        {
          id: crypto.randomUUID(),
          type: "consent",
          period: period,
          summary: {
            totalConsents: 0,
            activeConsents: 0,
            withdrawnConsents: 0,
            expiredConsents: 0,
            consentsByPurpose: {},
            complianceRate: 100,
          },
          details: [],
          generatedAt: new Date(),
        },
      ];
    });
  });
}
function generateDataSubjectReport(lgpdCore, clinicId, period) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      // This would integrate with data subject rights system
      return [
        2 /*return*/,
        {
          id: crypto.randomUUID(),
          type: "data_subject",
          period: period,
          summary: {
            totalRequests: 0,
            pendingRequests: 0,
            completedRequests: 0,
            requestsByType: {},
            averageResponseTime: 0,
            complianceRate: 100,
          },
          requests: [],
          generatedAt: new Date(),
        },
      ];
    });
  });
}
function generateSecurityReport(auditTrail, clinicId, period) {
  return __awaiter(this, void 0, void 0, function () {
    var securityEvents, breachEvents;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [
            4 /*yield*/,
            auditTrail.queryEvents({
              clinicId: clinicId,
              startDate: period.start,
              endDate: period.end,
              eventType: audit_trail_1.AuditEventType.UNAUTHORIZED_ACCESS,
              limit: 1000,
            }),
          ];
        case 1:
          securityEvents = _a.sent();
          return [
            4 /*yield*/,
            auditTrail.queryEvents({
              clinicId: clinicId,
              startDate: period.start,
              endDate: period.end,
              eventType: audit_trail_1.AuditEventType.DATA_BREACH,
              limit: 1000,
            }),
          ];
        case 2:
          breachEvents = _a.sent();
          return [
            2 /*return*/,
            {
              id: crypto.randomUUID(),
              type: "security",
              period: period,
              summary: {
                totalSecurityEvents: securityEvents.events.length + breachEvents.events.length,
                unauthorizedAccess: securityEvents.events.length,
                dataBreaches: breachEvents.events.length,
                criticalEvents: __spreadArray(
                  __spreadArray([], securityEvents.events, true),
                  breachEvents.events,
                  true,
                ).filter(function (e) {
                  return e.severity === "critical";
                }).length,
                riskLevel:
                  breachEvents.events.length > 0
                    ? "high"
                    : securityEvents.events.length > 10
                      ? "medium"
                      : "low",
              },
              events: __spreadArray(
                __spreadArray([], securityEvents.events, true),
                breachEvents.events,
                true,
              ),
              generatedAt: new Date(),
            },
          ];
      }
    });
  });
}
function formatReport(reportData, format) {
  return __awaiter(this, void 0, void 0, function () {
    var csvData;
    return __generator(this, function (_a) {
      switch (format) {
        case "json":
          return [
            2 /*return*/,
            {
              data: reportData,
              contentType: "application/json",
            },
          ];
        case "csv":
          csvData = convertToCSV(reportData);
          return [
            2 /*return*/,
            {
              data: csvData,
              contentType: "text/csv",
              filename: "compliance-report-".concat(Date.now(), ".csv"),
            },
          ];
        case "pdf":
          // Generate PDF (would use a PDF library)
          return [
            2 /*return*/,
            {
              data: reportData, // Placeholder - would generate actual PDF
              contentType: "application/pdf",
              filename: "compliance-report-".concat(Date.now(), ".pdf"),
            },
          ];
        case "xlsx":
          // Generate Excel file (would use an Excel library)
          return [
            2 /*return*/,
            {
              data: reportData, // Placeholder - would generate actual Excel
              contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              filename: "compliance-report-".concat(Date.now(), ".xlsx"),
            },
          ];
        default:
          return [
            2 /*return*/,
            {
              data: reportData,
              contentType: "application/json",
            },
          ];
      }
      return [2 /*return*/];
    });
  });
}
function convertToCSV(data) {
  // Simple CSV conversion - would be more sophisticated in production
  if (data.events && Array.isArray(data.events)) {
    var headers_1 = Object.keys(data.events[0] || {});
    var csvRows = __spreadArray(
      [headers_1.join(",")],
      data.events.map(function (event) {
        return headers_1
          .map(function (header) {
            return JSON.stringify(event[header] || "");
          })
          .join(",");
      }),
      true,
    );
    return csvRows.join("\n");
  }
  return JSON.stringify(data, null, 2);
}
// ============================================================================
// API HANDLERS
// ============================================================================
/**
 * GET /api/compliance/reports
 * List compliance reports
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var rateLimitResult,
      authResult,
      user,
      hasAccess,
      url,
      queryParams,
      query,
      supabase,
      offset,
      dbQuery,
      _a,
      reports,
      error,
      count,
      error_2;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, , 6]);
          return [
            4 /*yield*/,
            (0, rate_limit_1.rateLimit)(request, {
              maxRequests: 100,
              windowMs: 15 * 60 * 1000, // 15 minutes
            }),
          ];
        case 1:
          rateLimitResult = _b.sent();
          if (!rateLimitResult.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 }),
            ];
          }
          return [4 /*yield*/, (0, middleware_1.requireAuth)(request)];
        case 2:
          authResult = _b.sent();
          if (!authResult.success || !authResult.user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          user = authResult.user;
          return [
            4 /*yield*/,
            (0, permissions_1.hasPermission)(user.id, user.clinicId, "compliance.reports.read"),
          ];
        case 3:
          hasAccess = _b.sent();
          if (!hasAccess) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
            ];
          }
          url = new URL(request.url);
          queryParams = Object.fromEntries(url.searchParams.entries());
          query = ReportListQuerySchema.parse(queryParams);
          supabase = initializeServices().supabase;
          offset = (query.page - 1) * query.limit;
          dbQuery = supabase
            .from("lgpd_compliance_reports")
            .select("*", { count: "exact" })
            .eq("clinicId", user.clinicId)
            .order(query.sortBy, { ascending: query.sortOrder === "asc" })
            .range(offset, offset + query.limit - 1);
          if (query.type) {
            dbQuery = dbQuery.eq("type", query.type);
          }
          return [4 /*yield*/, dbQuery];
        case 4:
          (_a = _b.sent()), (reports = _a.data), (error = _a.error), (count = _a.count);
          if (error) {
            throw new Error("Database query failed: ".concat(error.message));
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              reports: reports || [],
              pagination: {
                page: query.page,
                limit: query.limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / query.limit),
              },
            }),
          ];
        case 5:
          error_2 = _b.sent();
          console.error("GET /api/compliance/reports error:", error_2);
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
/**
 * POST /api/compliance/reports
 * Generate new compliance report
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var rateLimitResult,
      csrfValid,
      authResult,
      user,
      hasAccess,
      body,
      reportRequest,
      _a,
      supabase,
      auditTrail,
      reportId,
      reportRecord,
      insertError,
      reportData,
      generateError_1,
      error_3;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 14, , 15]);
          return [
            4 /*yield*/,
            (0, rate_limit_1.rateLimit)(request, {
              maxRequests: 10,
              windowMs: 15 * 60 * 1000, // 15 minutes
            }),
          ];
        case 1:
          rateLimitResult = _b.sent();
          if (!rateLimitResult.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 }),
            ];
          }
          return [4 /*yield*/, (0, csrf_1.validateCSRF)(request)];
        case 2:
          csrfValid = _b.sent();
          if (!csrfValid) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "CSRF validation failed" }, { status: 403 }),
            ];
          }
          return [4 /*yield*/, (0, middleware_1.requireAuth)(request)];
        case 3:
          authResult = _b.sent();
          if (!authResult.success || !authResult.user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          user = authResult.user;
          return [
            4 /*yield*/,
            (0, permissions_1.hasPermission)(user.id, user.clinicId, "compliance.reports.create"),
          ];
        case 4:
          hasAccess = _b.sent();
          if (!hasAccess) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 5:
          body = _b.sent();
          reportRequest = ReportRequestSchema.parse(body);
          (_a = initializeServices()), (supabase = _a.supabase), (auditTrail = _a.auditTrail);
          reportId = crypto.randomUUID();
          reportRecord = {
            id: reportId,
            clinicId: user.clinicId,
            type: reportRequest.type,
            period: reportRequest.period,
            format: reportRequest.format,
            status: "generating",
            createdAt: new Date().toISOString(),
            generatedBy: user.id,
            filters: reportRequest.filters || {},
          };
          return [4 /*yield*/, supabase.from("lgpd_compliance_reports").insert(reportRecord)];
        case 6:
          insertError = _b.sent().error;
          if (insertError) {
            throw new Error("Failed to create report record: ".concat(insertError.message));
          }
          // Log audit event
          return [
            4 /*yield*/,
            auditTrail.logEvent({
              eventType: audit_trail_1.AuditEventType.DATA_EXPORT,
              severity: "medium",
              status: "success",
              userId: user.id,
              clinicId: user.clinicId,
              action: "generate_compliance_report",
              description: "Generated ".concat(reportRequest.type, " compliance report"),
              details: {
                reportId: reportId,
                reportType: reportRequest.type,
                period: reportRequest.period,
                format: reportRequest.format,
              },
              ipAddress: request.headers.get("x-forwarded-for") || "unknown",
              userAgent: request.headers.get("user-agent") || "unknown",
            }),
          ];
        case 7:
          // Log audit event
          _b.sent();
          _b.label = 8;
        case 8:
          _b.trys.push([8, 11, , 13]);
          return [4 /*yield*/, generateComplianceReport(user.clinicId, reportRequest, user.id)];
        case 9:
          reportData = _b.sent();
          // Update report with generated data
          return [
            4 /*yield*/,
            supabase
              .from("lgpd_compliance_reports")
              .update({
                status: "completed",
                completedAt: new Date().toISOString(),
                summary: reportData.data.summary || {},
                downloadUrl: reportData.filename
                  ? "/api/compliance/reports/".concat(reportId, "/download")
                  : null,
              })
              .eq("id", reportId),
          ];
        case 10:
          // Update report with generated data
          _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              reportId: reportId,
              status: "completed",
              data: reportData.data,
              downloadUrl: reportData.filename
                ? "/api/compliance/reports/".concat(reportId, "/download")
                : null,
            }),
          ];
        case 11:
          generateError_1 = _b.sent();
          // Update report status to failed
          return [
            4 /*yield*/,
            supabase
              .from("lgpd_compliance_reports")
              .update({
                status: "failed",
                completedAt: new Date().toISOString(),
                error: generateError_1 instanceof Error ? generateError_1.message : "Unknown error",
              })
              .eq("id", reportId),
          ];
        case 12:
          // Update report status to failed
          _b.sent();
          throw generateError_1;
        case 13:
          return [3 /*break*/, 15];
        case 14:
          error_3 = _b.sent();
          console.error("POST /api/compliance/reports error:", error_3);
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
        case 15:
          return [2 /*return*/];
      }
    });
  });
}
