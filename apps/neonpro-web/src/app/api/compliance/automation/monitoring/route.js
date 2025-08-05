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
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
// Schema para filtros de monitoramento
var MonitoringFiltersSchema = zod_1.z.object({
  timeRange: zod_1.z.enum(["1h", "6h", "24h", "7d", "30d"]).default("24h"),
  eventTypes: zod_1.z.array(zod_1.z.string()).optional(),
  severity: zod_1.z.enum(["low", "medium", "high", "critical"]).optional(),
  includeMetrics: zod_1.z.boolean().default(true),
  includeAlerts: zod_1.z.boolean().default(true),
});
// GET - Obter dados de monitoramento em tempo real
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session,
      authError,
      searchParams,
      filters,
      clinicId,
      now,
      timeRangeMap,
      hoursBack,
      startTime,
      monitoringData,
      consentMetrics,
      auditMetrics,
      requestMetrics,
      alertsQuery,
      alerts,
      complianceScore,
      error_1;
    var _b;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 10, undefined, 11]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _c.sent()), (session = _a.data.session), (authError = _a.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          filters = MonitoringFiltersSchema.parse({
            timeRange: searchParams.get("timeRange") || "24h",
            eventTypes:
              (_b = searchParams.get("eventTypes")) === null || _b === void 0
                ? void 0
                : _b.split(","),
            severity: searchParams.get("severity"),
            includeMetrics: searchParams.get("includeMetrics") !== "false",
            includeAlerts: searchParams.get("includeAlerts") !== "false",
          });
          clinicId = session.user.user_metadata.clinic_id;
          now = new Date();
          timeRangeMap = {
            "1h": 1,
            "6h": 6,
            "24h": 24,
            "7d": 24 * 7,
            "30d": 24 * 30,
          };
          hoursBack = timeRangeMap[filters.timeRange];
          startTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);
          monitoringData = {
            timestamp: now.toISOString(),
            timeRange: filters.timeRange,
          };
          if (!filters.includeMetrics) return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            supabase
              .from("lgpd_consent")
              .select("status, created_at")
              .eq("clinic_id", clinicId)
              .gte("created_at", startTime.toISOString()),
          ];
        case 3:
          consentMetrics = _c.sent().data;
          return [
            4 /*yield*/,
            supabase
              .from("lgpd_audit_trail")
              .select("event_type, severity, created_at")
              .eq("clinic_id", clinicId)
              .gte("created_at", startTime.toISOString()),
          ];
        case 4:
          auditMetrics = _c.sent().data;
          return [
            4 /*yield*/,
            supabase
              .from("lgpd_data_subject_requests")
              .select("request_type, status, created_at")
              .eq("clinic_id", clinicId)
              .gte("created_at", startTime.toISOString()),
          ];
        case 5:
          requestMetrics = _c.sent().data;
          monitoringData.metrics = {
            consent: {
              total:
                (consentMetrics === null || consentMetrics === void 0
                  ? void 0
                  : consentMetrics.length) || 0,
              active:
                (consentMetrics === null || consentMetrics === void 0
                  ? void 0
                  : consentMetrics.filter((c) => c.status === "granted").length) || 0,
              revoked:
                (consentMetrics === null || consentMetrics === void 0
                  ? void 0
                  : consentMetrics.filter((c) => c.status === "revoked").length) || 0,
              expired:
                (consentMetrics === null || consentMetrics === void 0
                  ? void 0
                  : consentMetrics.filter((c) => c.status === "expired").length) || 0,
            },
            audit: {
              total:
                (auditMetrics === null || auditMetrics === void 0 ? void 0 : auditMetrics.length) ||
                0,
              byType:
                (auditMetrics === null || auditMetrics === void 0
                  ? void 0
                  : auditMetrics.reduce((acc, event) => {
                      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
                      return acc;
                    }, {})) || {},
              bySeverity:
                (auditMetrics === null || auditMetrics === void 0
                  ? void 0
                  : auditMetrics.reduce((acc, event) => {
                      acc[event.severity] = (acc[event.severity] || 0) + 1;
                      return acc;
                    }, {})) || {},
            },
            dataSubjectRequests: {
              total:
                (requestMetrics === null || requestMetrics === void 0
                  ? void 0
                  : requestMetrics.length) || 0,
              byType:
                (requestMetrics === null || requestMetrics === void 0
                  ? void 0
                  : requestMetrics.reduce((acc, req) => {
                      acc[req.request_type] = (acc[req.request_type] || 0) + 1;
                      return acc;
                    }, {})) || {},
              byStatus:
                (requestMetrics === null || requestMetrics === void 0
                  ? void 0
                  : requestMetrics.reduce((acc, req) => {
                      acc[req.status] = (acc[req.status] || 0) + 1;
                      return acc;
                    }, {})) || {},
            },
          };
          _c.label = 6;
        case 6:
          if (!filters.includeAlerts) return [3 /*break*/, 8];
          alertsQuery = supabase
            .from("lgpd_compliance_alerts")
            .select("*")
            .eq("clinic_id", clinicId)
            .gte("created_at", startTime.toISOString())
            .order("created_at", { ascending: false });
          if (filters.severity) {
            alertsQuery = alertsQuery.eq("severity", filters.severity);
          }
          return [4 /*yield*/, alertsQuery.limit(50)];
        case 7:
          alerts = _c.sent().data;
          monitoringData.alerts = {
            total: (alerts === null || alerts === void 0 ? void 0 : alerts.length) || 0,
            active:
              (alerts === null || alerts === void 0
                ? void 0
                : alerts.filter((a) => a.status === "active").length) || 0,
            resolved:
              (alerts === null || alerts === void 0
                ? void 0
                : alerts.filter((a) => a.status === "resolved").length) || 0,
            bySeverity:
              (alerts === null || alerts === void 0
                ? void 0
                : alerts.reduce((acc, alert) => {
                    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
                    return acc;
                  }, {})) || {},
            recent: (alerts === null || alerts === void 0 ? void 0 : alerts.slice(0, 10)) || [],
          };
          _c.label = 8;
        case 8:
          return [4 /*yield*/, calculateComplianceScore(supabase, clinicId)];
        case 9:
          complianceScore = _c.sent();
          monitoringData.complianceScore = complianceScore;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: monitoringData,
            }),
          ];
        case 10:
          error_1 = _c.sent();
          console.error("Erro ao obter dados de monitoramento:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Erro interno do servidor",
                details: error_1 instanceof Error ? error_1.message : "Erro desconhecido",
              },
              { status: 500 },
            ),
          ];
        case 11:
          return [2 /*return*/];
      }
    });
  });
}
// Funï¿½ï¿½o auxiliar para calcular pontuaï¿½ï¿½o de conformidade
function calculateComplianceScore(supabase, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var now,
      last30Days,
      consents,
      activeConsents,
      totalConsents,
      consentScore,
      auditEvents,
      uniqueEventTypes,
      auditScore,
      criticalAlerts,
      alertPenalty,
      requests,
      processedRequests,
      totalRequests,
      requestScore,
      encryptionScore,
      finalScore,
      error_2;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 5, undefined, 6]);
          now = new Date();
          last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return [
            4 /*yield*/,
            supabase.from("lgpd_consent").select("status").eq("clinic_id", clinicId),
          ];
        case 1:
          consents = _a.sent().data;
          activeConsents =
            (consents === null || consents === void 0
              ? void 0
              : consents.filter((c) => c.status === "granted").length) || 0;
          totalConsents =
            (consents === null || consents === void 0 ? void 0 : consents.length) || 1;
          consentScore = (activeConsents / totalConsents) * 30;
          return [
            4 /*yield*/,
            supabase
              .from("lgpd_audit_trail")
              .select("event_type")
              .eq("clinic_id", clinicId)
              .gte("created_at", last30Days.toISOString()),
          ];
        case 2:
          auditEvents = _a.sent().data;
          uniqueEventTypes = new Set(
            (auditEvents === null || auditEvents === void 0
              ? void 0
              : auditEvents.map((e) => e.event_type)) || [],
          ).size;
          auditScore = Math.min((uniqueEventTypes / 6) * 25, 25);
          return [
            4 /*yield*/,
            supabase
              .from("lgpd_compliance_alerts")
              .select("id")
              .eq("clinic_id", clinicId)
              .eq("severity", "critical")
              .eq("status", "active"),
          ];
        case 3:
          criticalAlerts = _a.sent().data;
          alertPenalty =
            ((criticalAlerts === null || criticalAlerts === void 0
              ? void 0
              : criticalAlerts.length) || 0) * 5;
          return [
            4 /*yield*/,
            supabase
              .from("lgpd_data_subject_requests")
              .select("status, created_at")
              .eq("clinic_id", clinicId)
              .gte("created_at", last30Days.toISOString()),
          ];
        case 4:
          requests = _a.sent().data;
          processedRequests =
            (requests === null || requests === void 0
              ? void 0
              : requests.filter((r) => r.status === "completed").length) || 0;
          totalRequests =
            (requests === null || requests === void 0 ? void 0 : requests.length) || 1;
          requestScore = (processedRequests / totalRequests) * 20;
          encryptionScore = 25;
          finalScore = Math.max(
            0,
            Math.min(
              100,
              consentScore + auditScore + requestScore + encryptionScore - alertPenalty,
            ),
          );
          return [2 /*return*/, Math.round(finalScore * 100) / 100];
        case 5:
          error_2 = _a.sent();
          console.error("Erro ao calcular pontuaï¿½ï¿½o de conformidade:", error_2);
          return [2 /*return*/, 0];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
