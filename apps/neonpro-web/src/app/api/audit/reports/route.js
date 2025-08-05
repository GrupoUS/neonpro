/**
 * NeonPro Audit Reports API
 *
 * API para geração e gestão de relatórios de auditoria.
 * Permite criar, consultar e exportar relatórios personalizados.
 *
 * Endpoints:
 * - GET /api/audit/reports - Lista relatórios
 * - POST /api/audit/reports - Gera novo relatório
 * - GET /api/audit/reports/[id] - Baixa relatório específico
 *
 * @author APEX Master Developer
 * @version 1.0.0
 */
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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
exports.OPTIONS = OPTIONS;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
var audit_system_1 = require("@/lib/audit/audit-system");
var rate_limiting_1 = require("@/lib/security/rate-limiting");
var csrf_protection_1 = require("@/lib/security/csrf-protection");
var security_events_1 = require("@/lib/security/security-events");
// =====================================================
// SCHEMAS DE VALIDAÇÃO
// =====================================================
var ReportQuerySchema = zod_1.z.object({
  status: zod_1.z.enum(["pending", "generating", "completed", "failed"]).optional(),
  type: zod_1.z.enum(["security", "compliance", "activity", "performance"]).optional(),
  created_by: zod_1.z.string().optional(),
  limit: zod_1.z.number().min(1).max(50).default(20),
  offset: zod_1.z.number().min(0).default(0),
});
var CreateReportSchema = zod_1.z.object({
  name: zod_1.z.string().min(1).max(255),
  description: zod_1.z.string().optional(),
  type: zod_1.z.enum(["security", "compliance", "activity", "performance"]),
  filters: zod_1.z.object({
    start_date: zod_1.z.string().datetime(),
    end_date: zod_1.z.string().datetime(),
    event_types: zod_1.z.array(zod_1.z.string()).optional(),
    severity_levels: zod_1.z.array(zod_1.z.nativeEnum(audit_system_1.AuditSeverity)).optional(),
    user_ids: zod_1.z.array(zod_1.z.string()).optional(),
    resource_types: zod_1.z.array(zod_1.z.string()).optional(),
  }),
  format: zod_1.z.enum(["pdf", "csv", "json", "xlsx"]).default("pdf"),
  include_charts: zod_1.z.boolean().default(true),
  include_summary: zod_1.z.boolean().default(true),
});
// =====================================================
// HELPER FUNCTIONS
// =====================================================
function getClientIP(request) {
  var forwarded = request.headers.get("x-forwarded-for");
  var realIP = request.headers.get("x-real-ip");
  var remoteAddr = request.headers.get("x-vercel-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return realIP || remoteAddr || "unknown";
}
function validateReportAccess(supabase, userId) {
  return __awaiter(this, void 0, void 0, function () {
    var profile, hasReportAccess, error_1;
    var _a;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 2, undefined, 3]);
          return [
            4 /*yield*/,
            supabase
              .from("user_profiles")
              .select("role, permissions")
              .eq("user_id", userId)
              .single(),
          ];
        case 1:
          profile = _b.sent().data;
          if (!profile) return [2 /*return*/, false];
          hasReportAccess =
            profile.role === "admin" ||
            profile.role === "security_admin" ||
            profile.role === "compliance_officer" ||
            ((_a = profile.permissions) === null || _a === void 0
              ? void 0
              : _a.includes("audit.reports"));
          return [2 /*return*/, hasReportAccess];
        case 2:
          error_1 = _b.sent();
          console.error("Erro ao validar acesso de relatórios:", error_1);
          return [2 /*return*/, false];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
function parseReportFilters(searchParams) {
  var filters = {};
  if (searchParams.get("status")) {
    filters.status = searchParams.get("status");
  }
  if (searchParams.get("type")) {
    filters.type = searchParams.get("type");
  }
  if (searchParams.get("created_by")) {
    filters.created_by = searchParams.get("created_by");
  }
  if (searchParams.get("limit")) {
    filters.limit = parseInt(searchParams.get("limit"));
  }
  if (searchParams.get("offset")) {
    filters.offset = parseInt(searchParams.get("offset"));
  }
  return filters;
}
function generateReportData(supabase, filters) {
  return __awaiter(this, void 0, void 0, function () {
    var query, _a, logs, error, error_2;
    var _b, _c, _d, _e;
    return __generator(this, (_f) => {
      switch (_f.label) {
        case 0:
          _f.trys.push([0, 2, undefined, 3]);
          query = supabase
            .from("audit_logs")
            .select("*")
            .gte("created_at", filters.start_date)
            .lte("created_at", filters.end_date)
            .order("created_at", { ascending: false });
          // Aplicar filtros opcionais
          if (((_b = filters.event_types) === null || _b === void 0 ? void 0 : _b.length) > 0) {
            query = query.in("event_type", filters.event_types);
          }
          if (((_c = filters.severity_levels) === null || _c === void 0 ? void 0 : _c.length) > 0) {
            query = query.in("severity", filters.severity_levels);
          }
          if (((_d = filters.user_ids) === null || _d === void 0 ? void 0 : _d.length) > 0) {
            query = query.in("user_id", filters.user_ids);
          }
          if (((_e = filters.resource_types) === null || _e === void 0 ? void 0 : _e.length) > 0) {
            query = query.in("resource_type", filters.resource_types);
          }
          return [4 /*yield*/, query];
        case 1:
          (_a = _f.sent()), (logs = _a.data), (error = _a.error);
          if (error) {
            throw error;
          }
          return [2 /*return*/, logs || []];
        case 2:
          error_2 = _f.sent();
          console.error("Erro ao gerar dados do relatório:", error_2);
          throw error_2;
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
function createReportRecord(supabase, reportData, userId) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, report, error;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("audit_reports")
              .insert({
                name: reportData.name,
                description: reportData.description,
                type: reportData.type,
                filters: reportData.filters,
                format: reportData.format,
                status: "generating",
                created_by: userId,
                created_at: new Date().toISOString(),
              })
              .select()
              .single(),
          ];
        case 1:
          (_a = _b.sent()), (report = _a.data), (error = _a.error);
          if (error) {
            throw error;
          }
          return [2 /*return*/, report];
      }
    });
  });
}
// =====================================================
// GET: LISTAR RELATÓRIOS
// =====================================================
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var clientIP,
      rateLimitResult,
      supabase,
      _a,
      user,
      authError,
      hasAccess,
      searchParams,
      rawFilters,
      validationResult,
      filters,
      query,
      _b,
      reports,
      queryError,
      countQuery,
      count,
      error_3;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 10, undefined, 11]);
          clientIP = getClientIP(request);
          return [
            4 /*yield*/,
            (0, rate_limiting_1.rateLimit)({
              key: "audit-reports-".concat(clientIP),
              limit: 60,
              window: 60000,
            }),
          ];
        case 1:
          rateLimitResult = _c.sent();
          if (!rateLimitResult.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 }),
            ];
          }
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, validateReportAccess(supabase, user.id)];
        case 4:
          hasAccess = _c.sent();
          if (hasAccess) return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            (0, security_events_1.logSecurityEvent)({
              type: "insufficient_permissions",
              severity: "medium",
              description: "Usuário sem permissões para acessar relatórios de auditoria",
              user_id: user.id,
              ip_address: clientIP,
              user_agent: request.headers.get("user-agent") || undefined,
            }),
          ];
        case 5:
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
          ];
        case 6:
          searchParams = new URL(request.url).searchParams;
          rawFilters = parseReportFilters(searchParams);
          validationResult = ReportQuerySchema.safeParse(rawFilters);
          if (!validationResult.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid query parameters",
                  details: validationResult.error.errors,
                },
                { status: 400 },
              ),
            ];
          }
          filters = validationResult.data;
          query = supabase
            .from("audit_reports")
            .select("*")
            .order("created_at", { ascending: false })
            .range(filters.offset, filters.offset + filters.limit - 1);
          if (filters.status) {
            query = query.eq("status", filters.status);
          }
          if (filters.type) {
            query = query.eq("type", filters.type);
          }
          if (filters.created_by) {
            query = query.eq("created_by", filters.created_by);
          }
          return [4 /*yield*/, query];
        case 7:
          (_b = _c.sent()), (reports = _b.data), (queryError = _b.error);
          if (queryError) {
            throw queryError;
          }
          countQuery = supabase.from("audit_reports").select("*", { count: "exact", head: true });
          if (filters.status) {
            countQuery = countQuery.eq("status", filters.status);
          }
          if (filters.type) {
            countQuery = countQuery.eq("type", filters.type);
          }
          if (filters.created_by) {
            countQuery = countQuery.eq("created_by", filters.created_by);
          }
          return [
            4 /*yield*/,
            countQuery,
            // Log da consulta
          ];
        case 8:
          count = _c.sent().count;
          // Log da consulta
          return [
            4 /*yield*/,
            (0, audit_system_1.logAuditEvent)({
              event_type: audit_system_1.AuditEventType.REPORT_ACCESS,
              severity: audit_system_1.AuditSeverity.LOW,
              description: "Consulta de relatórios de auditoria realizada",
              user_id: user.id,
              ip_address: clientIP,
              user_agent: request.headers.get("user-agent") || undefined,
              metadata: {
                filters_applied: filters,
                results_count:
                  (reports === null || reports === void 0 ? void 0 : reports.length) || 0,
              },
            }),
          ];
        case 9:
          // Log da consulta
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: reports || [],
              pagination: {
                limit: filters.limit,
                offset: filters.offset,
                total: count || 0,
              },
            }),
          ];
        case 10:
          error_3 = _c.sent();
          console.error("Erro na consulta de relatórios:", error_3);
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
// =====================================================
// POST: GERAR NOVO RELATÓRIO
// =====================================================
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var clientIP,
      rateLimitResult,
      supabase,
      _a,
      user,
      authError,
      csrfValid,
      hasAccess,
      body,
      validationResult,
      reportData,
      startDate,
      endDate,
      maxPeriod,
      report,
      reportLogs,
      generateError_1,
      error_4;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 17, undefined, 18]);
          clientIP = getClientIP(request);
          return [
            4 /*yield*/,
            (0, rate_limiting_1.rateLimit)({
              key: "create-report-".concat(clientIP),
              limit: 10,
              window: 60000,
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
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, (0, csrf_protection_1.validateCSRF)(request)];
        case 4:
          csrfValid = _b.sent();
          if (csrfValid) return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            (0, security_events_1.logSecurityEvent)({
              type: "csrf_validation_failed",
              severity: "high",
              description: "Falha na validação CSRF para criação de relatório",
              user_id: user.id,
              ip_address: clientIP,
              user_agent: request.headers.get("user-agent") || undefined,
            }),
          ];
        case 5:
          _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "CSRF validation failed" }, { status: 403 }),
          ];
        case 6:
          return [4 /*yield*/, validateReportAccess(supabase, user.id)];
        case 7:
          hasAccess = _b.sent();
          if (!hasAccess) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 8:
          body = _b.sent();
          validationResult = CreateReportSchema.safeParse(body);
          if (!validationResult.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid request body",
                  details: validationResult.error.errors,
                },
                { status: 400 },
              ),
            ];
          }
          reportData = validationResult.data;
          startDate = new Date(reportData.filters.start_date);
          endDate = new Date(reportData.filters.end_date);
          if (startDate >= endDate) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Start date must be before end date" },
                { status: 400 },
              ),
            ];
          }
          maxPeriod = 365 * 24 * 60 * 60 * 1000; // 1 ano em ms
          if (endDate.getTime() - startDate.getTime() > maxPeriod) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Report period cannot exceed 1 year" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            createReportRecord(supabase, reportData, user.id),
            // Iniciar geração assíncrona do relatório
            // Em produção, isso seria feito em uma fila de background
          ];
        case 9:
          report = _b.sent();
          _b.label = 10;
        case 10:
          _b.trys.push([10, 13, undefined, 15]);
          return [
            4 /*yield*/,
            generateReportData(supabase, reportData.filters),
            // Atualizar status para completed
          ];
        case 11:
          reportLogs = _b.sent();
          // Atualizar status para completed
          return [
            4 /*yield*/,
            supabase
              .from("audit_reports")
              .update({
                status: "completed",
                data: reportLogs,
                completed_at: new Date().toISOString(),
                file_size: JSON.stringify(reportLogs).length,
              })
              .eq("id", report.id),
          ];
        case 12:
          // Atualizar status para completed
          _b.sent();
          return [3 /*break*/, 15];
        case 13:
          generateError_1 = _b.sent();
          console.error("Erro na geração do relatório:", generateError_1);
          // Atualizar status para failed
          return [
            4 /*yield*/,
            supabase
              .from("audit_reports")
              .update({
                status: "failed",
                error_message: generateError_1.message,
              })
              .eq("id", report.id),
          ];
        case 14:
          // Atualizar status para failed
          _b.sent();
          return [3 /*break*/, 15];
        case 15:
          // Log da criação
          return [
            4 /*yield*/,
            (0, audit_system_1.logAuditEvent)({
              event_type: audit_system_1.AuditEventType.REPORT_GENERATION,
              severity: audit_system_1.AuditSeverity.MEDIUM,
              description: "Relat\u00F3rio de auditoria criado: ".concat(reportData.name),
              user_id: user.id,
              ip_address: clientIP,
              user_agent: request.headers.get("user-agent") || undefined,
              resource_type: "audit_report",
              resource_id: report.id,
              metadata: {
                report_type: reportData.type,
                format: reportData.format,
                filters: reportData.filters,
              },
            }),
          ];
        case 16:
          // Log da criação
          _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: report,
            }),
          ];
        case 17:
          error_4 = _b.sent();
          console.error("Erro na criação de relatório:", error_4);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 18:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================
// OPTIONS: CORS
// =====================================================
function OPTIONS(_request) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => [
      2 /*return*/,
      new server_1.NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
        },
      }),
    ]);
  });
}
