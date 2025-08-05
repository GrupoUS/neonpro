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
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var headers_1 = require("next/headers");
var zod_1 = require("zod");
var dashboard_layout_engine_1 = require("@/lib/dashboard/executive/dashboard-layout-engine");
// Schema for layout update
var UpdateLayoutSchema = zod_1.z.object({
  name: zod_1.z.string().min(1, "Nome é obrigatório").optional(),
  description: zod_1.z.string().optional(),
  isDefault: zod_1.z.boolean().optional(),
  layoutConfig: zod_1.z
    .object({
      widgets: zod_1.z.array(
        zod_1.z.object({
          id: zod_1.z.string(),
          position: zod_1.z.object({
            x: zod_1.z.number(),
            y: zod_1.z.number(),
            w: zod_1.z.number(),
            h: zod_1.z.number(),
          }),
          config: zod_1.z.record(zod_1.z.any()),
        }),
      ),
    })
    .optional(),
});
// GET /api/dashboard/executive/layouts/[id]
function GET(_request_1, _a) {
  return __awaiter(this, arguments, void 0, function (_request, _b) {
    var supabase, _c, user, authError, clinicUser, layoutEngine, layout, error_1;
    var params = _b.params;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 4, undefined, 5]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          (_c = _d.sent()), (user = _c.data.user), (authError = _c.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("clinic_users").select("clinic_id").eq("user_id", user.id).single(),
          ];
        case 2:
          clinicUser = _d.sent().data;
          if (!clinicUser) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Usuário não associado a uma clínica" },
                { status: 403 },
              ),
            ];
          }
          layoutEngine = new dashboard_layout_engine_1.DashboardLayoutEngine(
            supabase,
            clinicUser.clinic_id,
          );
          return [4 /*yield*/, layoutEngine.getLayout(params.id)];
        case 3:
          layout = _d.sent();
          if (!layout) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Layout não encontrado" }, { status: 404 }),
            ];
          }
          return [2 /*return*/, server_1.NextResponse.json({ layout: layout })];
        case 4:
          error_1 = _d.sent();
          console.error("Error fetching layout:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
// PUT /api/dashboard/executive/layouts/[id]
function PUT(_request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      _c,
      user,
      authError,
      clinicUser,
      body,
      validatedData,
      layoutEngine,
      existingLayout,
      layout,
      error_2;
    var params = _b.params;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 6, undefined, 7]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          (_c = _d.sent()), (user = _c.data.user), (authError = _c.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("clinic_users").select("clinic_id").eq("user_id", user.id).single(),
          ];
        case 2:
          clinicUser = _d.sent().data;
          if (!clinicUser) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Usuário não associado a uma clínica" },
                { status: 403 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _d.sent();
          validatedData = UpdateLayoutSchema.parse(body);
          layoutEngine = new dashboard_layout_engine_1.DashboardLayoutEngine(
            supabase,
            clinicUser.clinic_id,
          );
          return [4 /*yield*/, layoutEngine.getLayout(params.id)];
        case 4:
          existingLayout = _d.sent();
          if (!existingLayout) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Layout não encontrado" }, { status: 404 }),
            ];
          }
          return [4 /*yield*/, layoutEngine.updateLayout(params.id, validatedData)];
        case 5:
          layout = _d.sent();
          return [2 /*return*/, server_1.NextResponse.json({ layout: layout })];
        case 6:
          error_2 = _d.sent();
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Dados inválidos", details: error_2.errors },
                { status: 400 },
              ),
            ];
          }
          console.error("Error updating layout:", error_2);
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
// DELETE /api/dashboard/executive/layouts/[id]
function DELETE(_request_1, _a) {
  return __awaiter(this, arguments, void 0, function (_request, _b) {
    var supabase, _c, user, authError, clinicUser, layoutEngine, existingLayout, error_3;
    var params = _b.params;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 5, undefined, 6]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          (_c = _d.sent()), (user = _c.data.user), (authError = _c.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("clinic_users").select("clinic_id").eq("user_id", user.id).single(),
          ];
        case 2:
          clinicUser = _d.sent().data;
          if (!clinicUser) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Usuário não associado a uma clínica" },
                { status: 403 },
              ),
            ];
          }
          layoutEngine = new dashboard_layout_engine_1.DashboardLayoutEngine(
            supabase,
            clinicUser.clinic_id,
          );
          return [4 /*yield*/, layoutEngine.getLayout(params.id)];
        case 3:
          existingLayout = _d.sent();
          if (!existingLayout) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Layout não encontrado" }, { status: 404 }),
            ];
          }
          // Prevent deletion of default layout
          if (existingLayout.isDefault) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Não é possível deletar o layout padrão" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, layoutEngine.deleteLayout(params.id)];
        case 4:
          _d.sent();
          return [2 /*return*/, server_1.NextResponse.json({ success: true })];
        case 5:
          error_3 = _d.sent();
          console.error("Error deleting layout:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
