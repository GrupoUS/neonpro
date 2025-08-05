/**
 * API Endpoint: Notification Analytics
 *
 * Endpoint para métricas, relatórios e insights de notificações
 *
 * @route GET /api/notifications/analytics
 * @author APEX Architecture Team
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
var zod_1 = require("zod");
var server_2 = require("@/lib/supabase/server");
// ================================================================================
// VALIDATION SCHEMAS
// ================================================================================
var AnalyticsQuerySchema = zod_1.z.object({
  metric: zod_1.z
    .enum(["overview", "performance", "engagement", "channels", "trends"])
    .default("overview"),
  period: zod_1.z.enum(["hour", "day", "week", "month", "quarter", "year"]).default("week"),
  dateFrom: zod_1.z.string().datetime().optional(),
  dateTo: zod_1.z.string().datetime().optional(),
  groupBy: zod_1.z.enum(["type", "channel", "status", "user"]).optional(),
  filters: zod_1.z
    .object({
      type: zod_1.z.string().optional(),
      channel: zod_1.z.string().optional(),
      status: zod_1.z.string().optional(),
      userId: zod_1.z.string().uuid().optional(),
    })
    .optional(),
});
// ================================================================================
// HELPER FUNCTIONS
// ================================================================================
function validateAuth(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, session, sessionError, _b, user, userError, profile, canViewAnalytics;
    var _c;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _d.sent()), (session = _a.data.session), (sessionError = _a.error);
          if (sessionError || !session) {
            return [2 /*return*/, { error: "Não autenticado", status: 401 }];
          }
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_b = _d.sent()), (user = _b.data.user), (userError = _b.error);
          if (userError || !user) {
            return [2 /*return*/, { error: "Usuário inválido", status: 401 }];
          }
          return [
            4 /*yield*/,
            supabase
              .from("profiles")
              .select("clinic_id, role, permissions")
              .eq("id", user.id)
              .single(),
          ];
        case 4:
          profile = _d.sent().data;
          if (!profile) {
            return [2 /*return*/, { error: "Perfil não encontrado", status: 404 }];
          }
          canViewAnalytics =
            ((_c = profile.permissions) === null || _c === void 0
              ? void 0
              : _c.includes("view_analytics")) || ["admin", "manager"].includes(profile.role);
          if (!canViewAnalytics) {
            return [
              2 /*return*/,
              { error: "Sem permissão para visualizar analytics", status: 403 },
            ];
          }
          return [2 /*return*/, { user: user, profile: profile, supabase: supabase }];
      }
    });
  });
}
/**
 * Calcula período baseado em parâmetros
 */
function calculatePeriod(period, dateFrom, dateTo) {
  var now = new Date();
  var from;
  var to = dateTo ? new Date(dateTo) : now;
  if (dateFrom) {
    from = new Date(dateFrom);
  } else {
    switch (period) {
      case "hour":
        from = new Date(now.getTime() - 60 * 60 * 1000); // 1 hora
        break;
      case "day":
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 dia
        break;
      case "week":
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 semana
        break;
      case "month":
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 dias
        break;
      case "quarter":
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 dias
        break;
      case "year":
        from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // 365 dias
        break;
      default:
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }
  return { from: from, to: to };
}
// ================================================================================
// API HANDLERS
// ================================================================================
/**
 * GET /api/notifications/analytics
 * Retorna métricas e relatórios de notificações
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var authResult,
      profile,
      searchParams,
      queryParams,
      validationResult,
      query,
      _a,
      from,
      to,
      analyticsData,
      createNotificationAnalytics,
      notificationAnalytics,
      _b,
      error_1;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 15, , 16]);
          return [4 /*yield*/, validateAuth(request)];
        case 1:
          authResult = _c.sent();
          if ("error" in authResult) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: authResult.error },
                { status: authResult.status },
              ),
            ];
          }
          profile = authResult.profile;
          searchParams = new URL(request.url).searchParams;
          queryParams = {
            metric: searchParams.get("metric") || "overview",
            period: searchParams.get("period") || "week",
            dateFrom: searchParams.get("dateFrom") || undefined,
            dateTo: searchParams.get("dateTo") || undefined,
            groupBy: searchParams.get("groupBy") || undefined,
            filters: {
              type: searchParams.get("filterType") || undefined,
              channel: searchParams.get("filterChannel") || undefined,
              status: searchParams.get("filterStatus") || undefined,
              userId: searchParams.get("filterUserId") || undefined,
            },
          };
          validationResult = AnalyticsQuerySchema.safeParse(queryParams);
          if (!validationResult.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Parâmetros inválidos", details: validationResult.error.errors },
                { status: 400 },
              ),
            ];
          }
          query = validationResult.data;
          (_a = calculatePeriod(query.period, query.dateFrom, query.dateTo)),
            (from = _a.from),
            (to = _a.to);
          analyticsData = void 0;
          return [
            4 /*yield*/,
            Promise.resolve().then(() =>
              require("@/lib/notifications/analytics/notification-analytics"),
            ),
          ];
        case 2:
          createNotificationAnalytics = _c.sent().createNotificationAnalytics;
          notificationAnalytics = createNotificationAnalytics();
          _b = query.metric;
          switch (_b) {
            case "overview":
              return [3 /*break*/, 3];
            case "performance":
              return [3 /*break*/, 5];
            case "engagement":
              return [3 /*break*/, 7];
            case "channels":
              return [3 /*break*/, 9];
            case "trends":
              return [3 /*break*/, 11];
          }
          return [3 /*break*/, 13];
        case 3:
          return [
            4 /*yield*/,
            notificationAnalytics.getOverviewMetrics(profile.clinic_id, from, to),
          ];
        case 4:
          analyticsData = _c.sent();
          return [3 /*break*/, 14];
        case 5:
          return [
            4 /*yield*/,
            notificationAnalytics.getPerformanceMetrics(profile.clinic_id, from, to, query.filters),
          ];
        case 6:
          analyticsData = _c.sent();
          return [3 /*break*/, 14];
        case 7:
          return [
            4 /*yield*/,
            notificationAnalytics.getEngagementMetrics(profile.clinic_id, from, to, query.filters),
          ];
        case 8:
          analyticsData = _c.sent();
          return [3 /*break*/, 14];
        case 9:
          return [
            4 /*yield*/,
            notificationAnalytics.getChannelAnalytics(profile.clinic_id, from, to),
          ];
        case 10:
          analyticsData = _c.sent();
          return [3 /*break*/, 14];
        case 11:
          return [
            4 /*yield*/,
            notificationAnalytics.getTrendAnalysis(
              profile.clinic_id,
              from,
              to,
              query.groupBy || "type",
            ),
          ];
        case 12:
          analyticsData = _c.sent();
          return [3 /*break*/, 14];
        case 13:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Tipo de métrica não suportado" }, { status: 400 }),
          ];
        case 14:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              metric: query.metric,
              period: {
                from: from.toISOString(),
                to: to.toISOString(),
                duration: query.period,
              },
              filters: query.filters,
              data: analyticsData,
              generatedAt: new Date().toISOString(),
            }),
          ];
        case 15:
          error_1 = _c.sent();
          console.error("Erro nas analytics de notificações:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Erro interno do servidor",
                details: process.env.NODE_ENV === "development" ? error_1.message : undefined,
              },
              { status: 500 },
            ),
          ];
        case 16:
          return [2 /*return*/];
      }
    });
  });
}
