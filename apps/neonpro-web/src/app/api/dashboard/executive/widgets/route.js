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
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
var widget_service_1 = require("@/lib/dashboard/executive/widget-service");
// Schema for widget creation/update
var CreateWidgetSchema = zod_1.z.object({
  layoutId: zod_1.z.string().uuid().optional(),
  title: zod_1.z.string().min(1, "TÃ­tulo Ã© obrigatÃ³rio"),
  description: zod_1.z.string().optional(),
  type: zod_1.z.enum([
    "kpi_card",
    "line_chart",
    "bar_chart",
    "pie_chart",
    "area_chart",
    "table",
    "metric",
    "gauge",
    "heatmap",
  ]),
  category: zod_1.z.enum(["financial", "operational", "patients", "staff", "general"]),
  dataSource: zod_1.z.object({
    type: zod_1.z.enum(["kpi", "query", "api", "static"]),
    config: zod_1.z.record(zod_1.z.any()),
  }),
  configuration: zod_1.z.record(zod_1.z.any()).default({}),
  position: zod_1.z.object({
    x: zod_1.z.number(),
    y: zod_1.z.number(),
    w: zod_1.z.number(),
    h: zod_1.z.number(),
  }),
  refreshInterval: zod_1.z.number().min(30).default(300), // minimum 30 seconds
  cacheDuration: zod_1.z.number().min(10).default(60), // minimum 10 seconds
});
var _UpdateWidgetSchema = CreateWidgetSchema.partial();
// GET /api/dashboard/executive/widgets
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      clinicUser,
      searchParams,
      layoutId,
      category,
      type,
      active,
      withData,
      widgetService_1,
      filters,
      widgets,
      widgetsWithData,
      error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 7, undefined, 8]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("clinic_users").select("clinic_id").eq("user_id", user.id).single(),
          ];
        case 3:
          clinicUser = _b.sent().data;
          if (!clinicUser) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "UsuÃ¡rio nÃ£o associado a uma clÃ­nica" },
                { status: 403 },
              ),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          layoutId = searchParams.get("layoutId");
          category = searchParams.get("category");
          type = searchParams.get("type");
          active = searchParams.get("active");
          withData = searchParams.get("withData") === "true";
          widgetService_1 = new widget_service_1.WidgetService(supabase, clinicUser.clinic_id);
          filters = {};
          if (layoutId) filters.layoutId = layoutId;
          if (category) filters.category = category;
          if (type) filters.type = type;
          if (active !== null) filters.isActive = active === "true";
          return [4 /*yield*/, widgetService_1.getWidgets(filters)];
        case 4:
          widgets = _b.sent();
          if (!withData) return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            Promise.all(
              widgets.map((widget) =>
                __awaiter(this, void 0, void 0, function () {
                  var data, error_2;
                  return __generator(this, (_a) => {
                    switch (_a.label) {
                      case 0:
                        _a.trys.push([0, 2, undefined, 3]);
                        return [4 /*yield*/, widgetService_1.getWidgetData(widget.id)];
                      case 1:
                        data = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, widget), { data: data })];
                      case 2:
                        error_2 = _a.sent();
                        console.error(
                          "Error fetching data for widget ".concat(widget.id, ":"),
                          error_2,
                        );
                        return [
                          2 /*return*/,
                          __assign(__assign({}, widget), {
                            data: null,
                            error: "Erro ao carregar dados",
                          }),
                        ];
                      case 3:
                        return [2 /*return*/];
                    }
                  });
                }),
              ),
            ),
          ];
        case 5:
          widgetsWithData = _b.sent();
          return [2 /*return*/, server_1.NextResponse.json({ widgets: widgetsWithData })];
        case 6:
          return [2 /*return*/, server_1.NextResponse.json({ widgets: widgets })];
        case 7:
          error_1 = _b.sent();
          console.error("Error fetching widgets:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
// POST /api/dashboard/executive/widgets
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      clinicUser,
      body,
      validatedData,
      widgetService,
      widget,
      error_3;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 6, undefined, 7]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("clinic_users").select("clinic_id").eq("user_id", user.id).single(),
          ];
        case 3:
          clinicUser = _b.sent().data;
          if (!clinicUser) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "UsuÃ¡rio nÃ£o associado a uma clÃ­nica" },
                { status: 403 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _b.sent();
          validatedData = CreateWidgetSchema.parse(body);
          widgetService = new widget_service_1.WidgetService(supabase, clinicUser.clinic_id);
          return [4 /*yield*/, widgetService.createWidget(validatedData)];
        case 5:
          widget = _b.sent();
          return [2 /*return*/, server_1.NextResponse.json({ widget: widget }, { status: 201 })];
        case 6:
          error_3 = _b.sent();
          if (error_3 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Dados invÃ¡lidos", details: error_3.errors },
                { status: 400 },
              ),
            ];
          }
          console.error("Error creating widget:", error_3);
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
