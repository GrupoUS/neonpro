/**
 * API Endpoint: Notification Status
 *
 * Endpoint para consultar status, histórico e métricas de notificações
 *
 * @route GET /api/notifications/status
 * @route GET /api/notifications/status/[id]
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
var StatusQuerySchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  userId: zod_1.z.string().uuid().optional(),
  type: zod_1.z.string().optional(),
  status: zod_1.z.enum(["pending", "sent", "delivered", "failed", "cancelled"]).optional(),
  dateFrom: zod_1.z.string().datetime().optional(),
  dateTo: zod_1.z.string().datetime().optional(),
  limit: zod_1.z.number().min(1).max(1000).default(50),
  offset: zod_1.z.number().min(0).default(0),
});
// ================================================================================
// HELPER FUNCTIONS
// ================================================================================
function validateAuth(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, session, sessionError, _b, user, userError, profile;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _c.sent()), (session = _a.data.session), (sessionError = _a.error);
          if (sessionError || !session) {
            return [2 /*return*/, { error: "Não autenticado", status: 401 }];
          }
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_b = _c.sent()), (user = _b.data.user), (userError = _b.error);
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
          profile = _c.sent().data;
          if (!profile) {
            return [2 /*return*/, { error: "Perfil não encontrado", status: 404 }];
          }
          return [2 /*return*/, { user: user, profile: profile, supabase: supabase }];
      }
    });
  });
}
// ================================================================================
// API HANDLERS
// ================================================================================
/**
 * GET /api/notifications/status
 * Lista notificações com filtros
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var authResult,
      profile,
      supabase,
      searchParams,
      queryParams,
      validationResult,
      query,
      dbQuery,
      _a,
      notifications,
      error,
      count,
      totalCount,
      error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          return [4 /*yield*/, validateAuth(request)];
        case 1:
          authResult = _b.sent();
          if ("error" in authResult) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: authResult.error },
                { status: authResult.status },
              ),
            ];
          }
          (profile = authResult.profile), (supabase = authResult.supabase);
          searchParams = new URL(request.url).searchParams;
          queryParams = {
            id: searchParams.get("id") || undefined,
            userId: searchParams.get("userId") || undefined,
            type: searchParams.get("type") || undefined,
            status: searchParams.get("status") || undefined,
            dateFrom: searchParams.get("dateFrom") || undefined,
            dateTo: searchParams.get("dateTo") || undefined,
            limit: parseInt(searchParams.get("limit") || "50"),
            offset: parseInt(searchParams.get("offset") || "0"),
          };
          validationResult = StatusQuerySchema.safeParse(queryParams);
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
          dbQuery = supabase
            .from("notifications")
            .select(
              "\n        id,\n        user_id,\n        clinic_id,\n        type,\n        status,\n        title,\n        content,\n        channels,\n        scheduled_for,\n        sent_at,\n        delivered_at,\n        failed_at,\n        error_message,\n        metadata,\n        created_at,\n        updated_at\n      ",
            )
            .eq("clinic_id", profile.clinic_id)
            .order("created_at", { ascending: false });
          // Aplicar filtros
          if (query.id) {
            dbQuery = dbQuery.eq("id", query.id);
          }
          if (query.userId) {
            dbQuery = dbQuery.eq("user_id", query.userId);
          }
          if (query.type) {
            dbQuery = dbQuery.eq("type", query.type);
          }
          if (query.status) {
            dbQuery = dbQuery.eq("status", query.status);
          }
          if (query.dateFrom) {
            dbQuery = dbQuery.gte("created_at", query.dateFrom);
          }
          if (query.dateTo) {
            dbQuery = dbQuery.lte("created_at", query.dateTo);
          }
          // Aplicar paginação
          dbQuery = dbQuery.range(query.offset, query.offset + query.limit - 1);
          return [4 /*yield*/, dbQuery];
        case 2:
          (_a = _b.sent()), (notifications = _a.data), (error = _a.error), (count = _a.count);
          if (error) {
            console.error("Erro ao buscar notificações:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Erro ao buscar notificações" }, { status: 500 }),
            ];
          }
          totalCount =
            count ||
            (notifications === null || notifications === void 0 ? void 0 : notifications.length) ||
            0;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              notifications: notifications || [],
              pagination: {
                total: totalCount,
                limit: query.limit,
                offset: query.offset,
                hasNext: totalCount > query.offset + query.limit,
                hasPrevious: query.offset > 0,
              },
            }),
          ];
        case 3:
          error_1 = _b.sent();
          console.error("Erro na consulta de status:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
