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
var server_1 = require("next/server");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var headers_1 = require("next/headers");
var zod_1 = require("zod");
var dashboardParamsSchema = zod_1.z.object({
  clinicId: zod_1.z.string().uuid(),
  period: zod_1.z.enum(["7d", "30d", "90d", "1y", "custom"]).default("30d"),
  startDate: zod_1.z.string().datetime().optional(),
  endDate: zod_1.z.string().datetime().optional(),
});
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session,
      authError,
      searchParams,
      params,
      startDate_1,
      endDate_1,
      days,
      _b,
      clinic,
      clinicError,
      _c,
      alertsData,
      alertsError,
      _d,
      historicalAlertsData,
      historicalError,
      alertsByType_1,
      alertTypes,
      previousPeriodStart,
      previousPeriodEnd,
      currentPeriodCounts_1,
      previousPeriodCounts_1,
      previousPeriodData,
      alertsSummary,
      totalActiveAlerts,
      criticalAlerts,
      highAlerts,
      error_1;
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 6, , 7]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          return [4 /*yield*/, supabase.auth.getSession()];
        case 1:
          (_a = _e.sent()), (session = _a.data.session), (authError = _a.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          params = dashboardParamsSchema.parse({
            clinicId: searchParams.get("clinicId"),
            period: searchParams.get("period") || "30d",
            startDate: searchParams.get("startDate"),
            endDate: searchParams.get("endDate"),
          });
          endDate_1 = new Date();
          if (params.period === "custom" && params.startDate && params.endDate) {
            startDate_1 = new Date(params.startDate);
            endDate_1 = new Date(params.endDate);
          } else {
            days =
              {
                "7d": 7,
                "30d": 30,
                "90d": 90,
                "1y": 365,
              }[params.period] || 30;
            startDate_1 = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
          }
          return [
            4 /*yield*/,
            supabase.from("clinics").select("id").eq("id", params.clinicId).single(),
          ];
        case 2:
          (_b = _e.sent()), (clinic = _b.data), (clinicError = _b.error);
          if (clinicError || !clinic) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Clínica não encontrada" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("stock_alerts")
              .select("alert_type, severity_level, status, created_at")
              .eq("clinic_id", params.clinicId)
              .eq("status", "active"),
          ];
        case 3:
          (_c = _e.sent()), (alertsData = _c.data), (alertsError = _c.error);
          if (alertsError) {
            console.error("Alerts Error:", alertsError);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Erro ao buscar alertas" }, { status: 500 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("stock_alerts")
              .select("alert_type, severity_level, created_at")
              .eq("clinic_id", params.clinicId)
              .gte("created_at", startDate_1.toISOString())
              .lte("created_at", endDate_1.toISOString()),
          ];
        case 4:
          (_d = _e.sent()), (historicalAlertsData = _d.data), (historicalError = _d.error);
          if (historicalError) {
            console.error("Historical Alerts Error:", historicalError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Erro ao buscar histórico de alertas" },
                { status: 500 },
              ),
            ];
          }
          alertsByType_1 = new Map();
          alertTypes = ["low_stock", "expiring", "expired", "overstock"];
          // Initialize with zeros
          alertTypes.forEach((type) => {
            alertsByType_1.set(type, {
              type: type,
              count: 0,
              severity: "low",
              trend: "stable",
              criticalCount: 0,
              highCount: 0,
              mediumCount: 0,
              lowCount: 0,
            });
          });
          // Count current alerts
          alertsData === null || alertsData === void 0
            ? void 0
            : alertsData.forEach((alert) => {
                if (alertsByType_1.has(alert.alert_type)) {
                  var typeData = alertsByType_1.get(alert.alert_type);
                  typeData.count++;
                  // Count by severity
                  switch (alert.severity_level) {
                    case "critical":
                      typeData.criticalCount++;
                      break;
                    case "high":
                      typeData.highCount++;
                      break;
                    case "medium":
                      typeData.mediumCount++;
                      break;
                    case "low":
                      typeData.lowCount++;
                      break;
                  }
                  // Determine overall severity for this type
                  if (typeData.criticalCount > 0) {
                    typeData.severity = "critical";
                  } else if (typeData.highCount > 0) {
                    typeData.severity = "high";
                  } else if (typeData.mediumCount > 0) {
                    typeData.severity = "medium";
                  } else {
                    typeData.severity = "low";
                  }
                }
              });
          previousPeriodStart = new Date(
            startDate_1.getTime() - (endDate_1.getTime() - startDate_1.getTime()),
          );
          previousPeriodEnd = startDate_1;
          currentPeriodCounts_1 = new Map();
          previousPeriodCounts_1 = new Map();
          alertTypes.forEach((type) => {
            currentPeriodCounts_1.set(type, 0);
            previousPeriodCounts_1.set(type, 0);
          });
          // Count alerts in current period
          historicalAlertsData === null || historicalAlertsData === void 0
            ? void 0
            : historicalAlertsData.forEach((alert) => {
                var alertDate = new Date(alert.created_at);
                if (alertDate >= startDate_1 && alertDate <= endDate_1) {
                  var current = currentPeriodCounts_1.get(alert.alert_type) || 0;
                  currentPeriodCounts_1.set(alert.alert_type, current + 1);
                }
              });
          return [
            4 /*yield*/,
            supabase
              .from("stock_alerts")
              .select("alert_type, created_at")
              .eq("clinic_id", params.clinicId)
              .gte("created_at", previousPeriodStart.toISOString())
              .lt("created_at", previousPeriodEnd.toISOString()),
          ];
        case 5:
          previousPeriodData = _e.sent().data;
          previousPeriodData === null || previousPeriodData === void 0
            ? void 0
            : previousPeriodData.forEach((alert) => {
                var previous = previousPeriodCounts_1.get(alert.alert_type) || 0;
                previousPeriodCounts_1.set(alert.alert_type, previous + 1);
              });
          // Calculate trends
          alertsByType_1.forEach((typeData, type) => {
            var currentCount = currentPeriodCounts_1.get(type) || 0;
            var previousCount = previousPeriodCounts_1.get(type) || 0;
            if (previousCount === 0) {
              typeData.trend = currentCount > 0 ? "up" : "stable";
            } else {
              var change = ((currentCount - previousCount) / previousCount) * 100;
              if (change > 10) {
                typeData.trend = "up";
              } else if (change < -10) {
                typeData.trend = "down";
              } else {
                typeData.trend = "stable";
              }
            }
          });
          alertsSummary = Array.from(alertsByType_1.values());
          totalActiveAlerts =
            (alertsData === null || alertsData === void 0 ? void 0 : alertsData.length) || 0;
          criticalAlerts =
            (alertsData === null || alertsData === void 0
              ? void 0
              : alertsData.filter((alert) => alert.severity_level === "critical").length) || 0;
          highAlerts =
            (alertsData === null || alertsData === void 0
              ? void 0
              : alertsData.filter((alert) => alert.severity_level === "high").length) || 0;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: alertsSummary,
              metadata: {
                period: params.period,
                startDate: startDate_1.toISOString(),
                endDate: endDate_1.toISOString(),
                clinicId: params.clinicId,
                totalActiveAlerts: totalActiveAlerts,
                criticalAlerts: criticalAlerts,
                highAlerts: highAlerts,
                totalHistoricalAlerts:
                  (historicalAlertsData === null || historicalAlertsData === void 0
                    ? void 0
                    : historicalAlertsData.length) || 0,
              },
            }),
          ];
        case 6:
          error_1 = _e.sent();
          console.error("Dashboard Alerts Summary API Error:", error_1);
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Parâmetros inválidos", details: error_1.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
