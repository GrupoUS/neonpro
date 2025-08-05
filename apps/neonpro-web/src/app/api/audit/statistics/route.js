/**
 * NeonPro Audit Statistics API
 *
 * API para consulta de estatísticas e métricas do sistema de auditoria.
 * Fornece dados agregados para dashboards e análises.
 *
 * Endpoints:
 * - GET /api/audit/statistics - Estatísticas gerais
 * - GET /api/audit/statistics/trends - Tendências temporais
 * - GET /api/audit/statistics/summary - Resumo executivo
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
exports.OPTIONS = OPTIONS;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
var audit_system_1 = require("@/lib/audit/audit-system");
var rate_limiting_1 = require("@/lib/security/rate-limiting");
var security_events_1 = require("@/lib/security/security-events");
// =====================================================
// SCHEMAS DE VALIDAÇÃO
// =====================================================
var StatisticsQuerySchema = zod_1.z.object({
  period: zod_1.z.enum(["24h", "7d", "30d", "90d", "1y"]).default("30d"),
  granularity: zod_1.z.enum(["hour", "day", "week", "month"]).default("day"),
  event_types: zod_1.z.array(zod_1.z.string()).optional(),
  severity_levels: zod_1.z.array(zod_1.z.nativeEnum(audit_system_1.AuditSeverity)).optional(),
  include_trends: zod_1.z.boolean().default(false),
});
var TrendsQuerySchema = zod_1.z.object({
  period: zod_1.z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
  granularity: zod_1.z.enum(["hour", "day", "week", "month"]).default("day"),
  metric: zod_1.z.enum(["events", "users", "alerts", "errors"]).default("events"),
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
function validateStatisticsAccess(supabase, userId) {
  return __awaiter(this, void 0, void 0, function () {
    var profile, hasStatsAccess, error_1;
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
          hasStatsAccess =
            profile.role === "admin" ||
            profile.role === "security_admin" ||
            profile.role === "compliance_officer" ||
            ((_a = profile.permissions) === null || _a === void 0
              ? void 0
              : _a.includes("audit.statistics"));
          return [2 /*return*/, hasStatsAccess];
        case 2:
          error_1 = _b.sent();
          console.error("Erro ao validar acesso de estatísticas:", error_1);
          return [2 /*return*/, false];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
function getPeriodDates(period) {
  var endDate = new Date();
  var startDate = new Date();
  switch (period) {
    case "24h":
      startDate.setHours(startDate.getHours() - 24);
      break;
    case "7d":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(startDate.getDate() - 90);
      break;
    case "1y":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }
  return { startDate: startDate, endDate: endDate };
}
function getEventStatistics(supabase, filters) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, startDate, endDate, baseQuery, _b, events, error, stats;
    var _c, _d;
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          (_a = getPeriodDates(filters.period)), (startDate = _a.startDate), (endDate = _a.endDate);
          baseQuery = supabase
            .from("audit_logs")
            .select("event_type, severity, created_at")
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString());
          if (((_c = filters.event_types) === null || _c === void 0 ? void 0 : _c.length) > 0) {
            baseQuery = baseQuery.in("event_type", filters.event_types);
          }
          if (((_d = filters.severity_levels) === null || _d === void 0 ? void 0 : _d.length) > 0) {
            baseQuery = baseQuery.in("severity", filters.severity_levels);
          }
          return [4 /*yield*/, baseQuery];
        case 1:
          (_b = _e.sent()), (events = _b.data), (error = _b.error);
          if (error) {
            throw error;
          }
          stats = {
            total_events: (events === null || events === void 0 ? void 0 : events.length) || 0,
            by_severity: {},
            by_event_type: {},
            by_hour: {},
          };
          events === null || events === void 0
            ? void 0
            : events.forEach((event) => {
                // Por severidade
                stats.by_severity[event.severity] = (stats.by_severity[event.severity] || 0) + 1;
                // Por tipo de evento
                stats.by_event_type[event.event_type] =
                  (stats.by_event_type[event.event_type] || 0) + 1;
                // Por hora (últimas 24h)
                if (filters.period === "24h") {
                  var hour = new Date(event.created_at).getHours();
                  stats.by_hour[hour] = (stats.by_hour[hour] || 0) + 1;
                }
              });
          return [2 /*return*/, stats];
      }
    });
  });
}
function getSecurityStatistics(supabase, filters) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, startDate, endDate, _b, alerts, alertsError, _c, uniqueUsers, usersError, uniqueUserIds;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          (_a = getPeriodDates(filters.period)), (startDate = _a.startDate), (endDate = _a.endDate);
          return [
            4 /*yield*/,
            supabase
              .from("security_alerts")
              .select("severity, status, created_at")
              .gte("created_at", startDate.toISOString())
              .lte("created_at", endDate.toISOString()),
          ];
        case 1:
          (_b = _d.sent()), (alerts = _b.data), (alertsError = _b.error);
          if (alertsError) {
            throw alertsError;
          }
          return [
            4 /*yield*/,
            supabase
              .from("audit_logs")
              .select("user_id")
              .gte("created_at", startDate.toISOString())
              .lte("created_at", endDate.toISOString())
              .not("user_id", "is", null),
          ];
        case 2:
          (_c = _d.sent()), (uniqueUsers = _c.data), (usersError = _c.error);
          if (usersError) {
            throw usersError;
          }
          uniqueUserIds = new Set(
            (uniqueUsers === null || uniqueUsers === void 0
              ? void 0
              : uniqueUsers.map((u) => u.user_id)) || [],
          );
          return [
            2 /*return*/,
            {
              total_alerts: (alerts === null || alerts === void 0 ? void 0 : alerts.length) || 0,
              open_alerts:
                (alerts === null || alerts === void 0
                  ? void 0
                  : alerts.filter((a) => a.status === "open").length) || 0,
              resolved_alerts:
                (alerts === null || alerts === void 0
                  ? void 0
                  : alerts.filter((a) => a.status === "resolved").length) || 0,
              unique_users: uniqueUserIds.size,
              alerts_by_severity:
                (alerts === null || alerts === void 0
                  ? void 0
                  : alerts.reduce((acc, alert) => {
                      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
                      return acc;
                    }, {})) || {},
            },
          ];
      }
    });
  });
}
function getTrendData(supabase, filters) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, startDate, endDate, dateFormat, _interval, query, _b, data, error;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          (_a = getPeriodDates(filters.period)), (startDate = _a.startDate), (endDate = _a.endDate);
          switch (filters.granularity) {
            case "hour":
              dateFormat = "YYYY-MM-DD HH24:00:00";
              _interval = "1 hour";
              break;
            case "day":
              dateFormat = "YYYY-MM-DD";
              _interval = "1 day";
              break;
            case "week":
              dateFormat = 'YYYY-"W"WW';
              _interval = "1 week";
              break;
            case "month":
              dateFormat = "YYYY-MM";
              _interval = "1 month";
              break;
            default:
              dateFormat = "YYYY-MM-DD";
              _interval = "1 day";
          }
          switch (filters.metric) {
            case "events":
              query = "\n        SELECT \n          to_char(date_trunc('"
                .concat(filters.granularity, "', created_at), '")
                .concat(
                  dateFormat,
                  "') as period,\n          count(*) as value\n        FROM audit_logs \n        WHERE created_at >= '",
                )
                .concat(startDate.toISOString(), "' \n          AND created_at <= '")
                .concat(endDate.toISOString(), "'\n        GROUP BY date_trunc('")
                .concat(filters.granularity, "', created_at)\n        ORDER BY period\n      ");
              break;
            case "users":
              query = "\n        SELECT \n          to_char(date_trunc('"
                .concat(filters.granularity, "', created_at), '")
                .concat(
                  dateFormat,
                  "') as period,\n          count(DISTINCT user_id) as value\n        FROM audit_logs \n        WHERE created_at >= '",
                )
                .concat(startDate.toISOString(), "' \n          AND created_at <= '")
                .concat(
                  endDate.toISOString(),
                  "'\n          AND user_id IS NOT NULL\n        GROUP BY date_trunc('",
                )
                .concat(filters.granularity, "', created_at)\n        ORDER BY period\n      ");
              break;
            case "alerts":
              query = "\n        SELECT \n          to_char(date_trunc('"
                .concat(filters.granularity, "', created_at), '")
                .concat(
                  dateFormat,
                  "') as period,\n          count(*) as value\n        FROM security_alerts \n        WHERE created_at >= '",
                )
                .concat(startDate.toISOString(), "' \n          AND created_at <= '")
                .concat(endDate.toISOString(), "'\n        GROUP BY date_trunc('")
                .concat(filters.granularity, "', created_at)\n        ORDER BY period\n      ");
              break;
            case "errors":
              query = "\n        SELECT \n          to_char(date_trunc('"
                .concat(filters.granularity, "', created_at), '")
                .concat(
                  dateFormat,
                  "') as period,\n          count(*) as value\n        FROM audit_logs \n        WHERE created_at >= '",
                )
                .concat(startDate.toISOString(), "' \n          AND created_at <= '")
                .concat(
                  endDate.toISOString(),
                  "'\n          AND severity IN ('high', 'critical')\n        GROUP BY date_trunc('",
                )
                .concat(filters.granularity, "', created_at)\n        ORDER BY period\n      ");
              break;
            default:
              throw new Error("Invalid metric type");
          }
          return [4 /*yield*/, supabase.rpc("execute_sql", { query: query })];
        case 1:
          (_b = _c.sent()), (data = _b.data), (error = _b.error);
          if (error) {
            throw error;
          }
          return [2 /*return*/, data || []];
      }
    });
  });
}
// =====================================================
// GET: ESTATÍSTICAS GERAIS
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
      _b,
      pathname,
      searchParams,
      _rawFilters,
      _validationResult,
      _filters,
      _trendData,
      _start30d,
      _start7d,
      _c,
      events30d,
      security30d,
      _d,
      events7d,
      security7d,
      rawFilters,
      validationResult,
      filters,
      _e,
      eventStats,
      securityStats,
      trendData,
      error_2;
    var _f, _g;
    return __generator(this, (_h) => {
      switch (_h.label) {
        case 0:
          _h.trys.push([0, 17, undefined, 18]);
          clientIP = getClientIP(request);
          return [
            4 /*yield*/,
            (0, rate_limiting_1.rateLimit)({
              key: "audit-stats-".concat(clientIP),
              limit: 120,
              window: 60000,
            }),
          ];
        case 1:
          rateLimitResult = _h.sent();
          if (!rateLimitResult.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 }),
            ];
          }
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _h.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_a = _h.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, validateStatisticsAccess(supabase, user.id)];
        case 4:
          hasAccess = _h.sent();
          if (hasAccess) return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            (0, security_events_1.logSecurityEvent)({
              type: "insufficient_permissions",
              severity: "medium",
              description: "Usuário sem permissões para acessar estatísticas de auditoria",
              user_id: user.id,
              ip_address: clientIP,
              user_agent: request.headers.get("user-agent") || undefined,
            }),
          ];
        case 5:
          _h.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
          ];
        case 6:
          (_b = new URL(request.url)), (pathname = _b.pathname), (searchParams = _b.searchParams);
          if (!pathname.endsWith("/trends")) return [3 /*break*/, 8];
          rawFilters = {
            period: searchParams.get("period") || "30d",
            granularity: searchParams.get("granularity") || "day",
            metric: searchParams.get("metric") || "events",
          };
          validationResult = TrendsQuerySchema.safeParse(rawFilters);
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
          return [4 /*yield*/, getTrendData(supabase, filters)];
        case 7:
          trendData = _h.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                metric: filters.metric,
                period: filters.period,
                granularity: filters.granularity,
                trends: trendData,
              },
            }),
          ];
        case 8:
          if (!pathname.endsWith("/summary")) return [3 /*break*/, 11];
          _start30d = getPeriodDates("30d").startDate;
          _start7d = getPeriodDates("7d").startDate;
          return [
            4 /*yield*/,
            Promise.all([
              getEventStatistics(supabase, { period: "30d" }),
              getSecurityStatistics(supabase, { period: "30d" }),
            ]),
            // Estatísticas dos últimos 7 dias para comparação
          ];
        case 9:
          (_c = _h.sent()), (events30d = _c[0]), (security30d = _c[1]);
          return [
            4 /*yield*/,
            Promise.all([
              getEventStatistics(supabase, { period: "7d" }),
              getSecurityStatistics(supabase, { period: "7d" }),
            ]),
          ];
        case 10:
          (_d = _h.sent()), (events7d = _d[0]), (security7d = _d[1]);
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                summary: {
                  total_events_30d: events30d.total_events,
                  total_events_7d: events7d.total_events,
                  total_alerts_30d: security30d.total_alerts,
                  total_alerts_7d: security7d.total_alerts,
                  unique_users_30d: security30d.unique_users,
                  open_alerts: security30d.open_alerts,
                },
                trends: {
                  events_change: events7d.total_events - events30d.total_events / 4.3, // média semanal
                  alerts_change: security7d.total_alerts - security30d.total_alerts / 4.3,
                },
              },
            }),
          ];
        case 11:
          rawFilters = {
            period: searchParams.get("period") || "30d",
            granularity: searchParams.get("granularity") || "day",
            event_types:
              (_f = searchParams.get("event_types")) === null || _f === void 0
                ? void 0
                : _f.split(","),
            severity_levels:
              (_g = searchParams.get("severity_levels")) === null || _g === void 0
                ? void 0
                : _g.split(","),
            include_trends: searchParams.get("include_trends") === "true",
          };
          validationResult = StatisticsQuerySchema.safeParse(rawFilters);
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
            Promise.all([
              getEventStatistics(supabase, filters),
              getSecurityStatistics(supabase, filters),
            ]),
          ];
        case 12:
          (_e = _h.sent()), (eventStats = _e[0]), (securityStats = _e[1]);
          trendData = null;
          if (!filters.include_trends) return [3 /*break*/, 14];
          return [
            4 /*yield*/,
            getTrendData(supabase, {
              period: filters.period,
              granularity: filters.granularity,
              metric: "events",
            }),
          ];
        case 13:
          trendData = _h.sent();
          _h.label = 14;
        case 14:
          // Log da consulta
          return [
            4 /*yield*/,
            (0, audit_system_1.logAuditEvent)({
              event_type: audit_system_1.AuditEventType.STATISTICS_ACCESS,
              severity: audit_system_1.AuditSeverity.LOW,
              description: "Consulta de estatísticas de auditoria realizada",
              user_id: user.id,
              ip_address: clientIP,
              user_agent: request.headers.get("user-agent") || undefined,
              metadata: {
                filters_applied: filters,
                period: filters.period,
              },
            }),
          ];
        case 15:
          // Log da consulta
          _h.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                period: filters.period,
                events: eventStats,
                security: securityStats,
                trends: trendData,
              },
            }),
          ];
        case 16:
          return [3 /*break*/, 18];
        case 17:
          error_2 = _h.sent();
          console.error("Erro na consulta de estatísticas:", error_2);
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
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }),
    ]);
  });
}
