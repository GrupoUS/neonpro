/**
 * NeonPro Audit Logs API
 *
 * API para consulta, filtros e exportação de logs de auditoria.
 * Implementa autenticação, autorização e validação de dados.
 *
 * Endpoints:
 * - GET /api/audit/logs - Consulta logs com filtros
 * - POST /api/audit/logs - Registra novo evento
 *
 * @author APEX Master Developer
 * @version 1.0.0
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
var QueryFiltersSchema = zod_1.z.object({
  event_type: zod_1.z.nativeEnum(audit_system_1.AuditEventType).optional(),
  severity: zod_1.z.nativeEnum(audit_system_1.AuditSeverity).optional(),
  user_id: zod_1.z.string().optional(),
  ip_address: zod_1.z.string().optional(),
  resource_type: zod_1.z.string().optional(),
  resource_id: zod_1.z.string().optional(),
  start_date: zod_1.z.string().datetime().optional(),
  end_date: zod_1.z.string().datetime().optional(),
  limit: zod_1.z.number().min(1).max(1000).default(100),
  offset: zod_1.z.number().min(0).default(0),
  search: zod_1.z.string().optional(),
});
var CreateEventSchema = zod_1.z.object({
  event_type: zod_1.z.nativeEnum(audit_system_1.AuditEventType),
  severity: zod_1.z.nativeEnum(audit_system_1.AuditSeverity),
  description: zod_1.z.string().min(1).max(1000),
  resource_type: zod_1.z.string().optional(),
  resource_id: zod_1.z.string().optional(),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
  user_agent: zod_1.z.string().optional(),
});
// =====================================================
// HELPER FUNCTIONS
// =====================================================
/**
 * Extrai IP do cliente da requisição
 */
function getClientIP(request) {
  var forwarded = request.headers.get("x-forwarded-for");
  var realIP = request.headers.get("x-real-ip");
  var remoteAddr = request.headers.get("x-vercel-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return realIP || remoteAddr || "unknown";
}
/**
 * Valida permissões de acesso aos logs
 */
function validateAuditAccess(supabase, userId) {
  return __awaiter(this, void 0, void 0, function () {
    var profile, hasAuditPermission, error_1;
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
          if (!profile)
            return [
              2 /*return*/,
              false,
              // Verifica se tem permissão de auditoria
            ];
          hasAuditPermission =
            profile.role === "admin" ||
            profile.role === "security_admin" ||
            ((_a = profile.permissions) === null || _a === void 0
              ? void 0
              : _a.includes("audit.read"));
          return [2 /*return*/, hasAuditPermission];
        case 2:
          error_1 = _b.sent();
          console.error("Erro ao validar acesso de auditoria:", error_1);
          return [2 /*return*/, false];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Converte filtros de query string para objeto
 */
function parseQueryFilters(searchParams) {
  var filters = {};
  if (searchParams.get("event_type")) {
    filters.event_type = searchParams.get("event_type");
  }
  if (searchParams.get("severity")) {
    filters.severity = searchParams.get("severity");
  }
  if (searchParams.get("user_id")) {
    filters.user_id = searchParams.get("user_id");
  }
  if (searchParams.get("ip_address")) {
    filters.ip_address = searchParams.get("ip_address");
  }
  if (searchParams.get("resource_type")) {
    filters.resource_type = searchParams.get("resource_type");
  }
  if (searchParams.get("resource_id")) {
    filters.resource_id = searchParams.get("resource_id");
  }
  if (searchParams.get("start_date")) {
    filters.start_date = new Date(searchParams.get("start_date"));
  }
  if (searchParams.get("end_date")) {
    filters.end_date = new Date(searchParams.get("end_date"));
  }
  if (searchParams.get("limit")) {
    filters.limit = parseInt(searchParams.get("limit"));
  }
  if (searchParams.get("offset")) {
    filters.offset = parseInt(searchParams.get("offset"));
  }
  if (searchParams.get("search")) {
    filters.search = searchParams.get("search");
  }
  return filters;
}
// =====================================================
// GET: CONSULTAR LOGS
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
      events,
      error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 11, undefined, 12]);
          clientIP = getClientIP(request);
          return [
            4 /*yield*/,
            (0, rate_limiting_1.rateLimit)({
              key: "audit-logs-".concat(clientIP),
              limit: 100,
              window: 60000, // 1 minuto
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
          if (!(authError || !user)) return [3 /*break*/, 5];
          return [
            4 /*yield*/,
            (0, security_events_1.logSecurityEvent)({
              type: "unauthorized_audit_access",
              severity: "medium",
              description: "Tentativa de acesso não autorizado aos logs de auditoria",
              ip_address: clientIP,
              user_agent: request.headers.get("user-agent") || undefined,
            }),
          ];
        case 4:
          _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
          ];
        case 5:
          return [4 /*yield*/, validateAuditAccess(supabase, user.id)];
        case 6:
          hasAccess = _b.sent();
          if (hasAccess) return [3 /*break*/, 8];
          return [
            4 /*yield*/,
            (0, security_events_1.logSecurityEvent)({
              type: "insufficient_permissions",
              severity: "medium",
              description: "Usuário sem permissões suficientes para acessar logs de auditoria",
              user_id: user.id,
              ip_address: clientIP,
              user_agent: request.headers.get("user-agent") || undefined,
            }),
          ];
        case 7:
          _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
          ];
        case 8:
          searchParams = new URL(request.url).searchParams;
          rawFilters = parseQueryFilters(searchParams);
          validationResult = QueryFiltersSchema.safeParse(rawFilters);
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
          return [
            4 /*yield*/,
            createauditSystem().queryEvents(
              __assign(__assign({}, filters), {
                start_date: filters.start_date ? new Date(filters.start_date) : undefined,
                end_date: filters.end_date ? new Date(filters.end_date) : undefined,
              }),
            ),
            // Log da consulta
          ];
        case 9:
          events = _b.sent();
          // Log da consulta
          return [
            4 /*yield*/,
            (0, audit_system_1.logAuditEvent)({
              event_type: audit_system_1.AuditEventType.AUDIT_LOG_ACCESS,
              severity: audit_system_1.AuditSeverity.LOW,
              description: "Consulta de logs de auditoria realizada",
              user_id: user.id,
              ip_address: clientIP,
              user_agent: request.headers.get("user-agent") || undefined,
              metadata: {
                filters_applied: filters,
                results_count: events.length,
              },
            }),
          ];
        case 10:
          // Log da consulta
          _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: events,
              pagination: {
                limit: filters.limit,
                offset: filters.offset,
                total: events.length,
              },
            }),
          ];
        case 11:
          error_2 = _b.sent();
          console.error("Erro na consulta de logs de auditoria:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 12:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================
// POST: REGISTRAR EVENTO
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
      eventData,
      event_1,
      error_3;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 10, undefined, 11]);
          clientIP = getClientIP(request);
          return [
            4 /*yield*/,
            (0, rate_limiting_1.rateLimit)({
              key: "audit-create-".concat(clientIP),
              limit: 50,
              window: 60000, // 1 minuto
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
              description: "Falha na validação CSRF para criação de evento de auditoria",
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
          return [4 /*yield*/, validateAuditAccess(supabase, user.id)];
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
          validationResult = CreateEventSchema.safeParse(body);
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
          eventData = validationResult.data;
          return [
            4 /*yield*/,
            (0, audit_system_1.logAuditEvent)(
              __assign(__assign({}, eventData), {
                user_id: user.id,
                ip_address: clientIP,
                user_agent: eventData.user_agent || request.headers.get("user-agent") || undefined,
              }),
            ),
          ];
        case 9:
          event_1 = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                data: event_1,
              },
              { status: 201 },
            ),
          ];
        case 10:
          error_3 = _b.sent();
          console.error("Erro na criação de evento de auditoria:", error_3);
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
