"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.GET = GET;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      _b,
      adminProfile,
      profileError,
      body,
      target_user_id,
      new_role,
      reason,
      validRoles,
      _c,
      targetProfile,
      targetError,
      old_role,
      _d,
      updatedProfile,
      updateError,
      logError,
      notificationError_1,
      error_1;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 12, , 13]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _e.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _e.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, supabase.from("profiles").select("role").eq("id", user.id).single()];
        case 3:
          (_b = _e.sent()), (adminProfile = _b.data), (profileError = _b.error);
          if (
            profileError ||
            (adminProfile === null || adminProfile === void 0 ? void 0 : adminProfile.role) !==
              "admin"
          ) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Acesso negado. Apenas administradores podem atribuir roles." },
                { status: 403 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _e.sent();
          (target_user_id = body.target_user_id),
            (new_role = body.new_role),
            (reason = body.reason);
          // Validar dados obrigatórios
          if (!target_user_id || !new_role) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "ID do usuário e nova role são obrigatórios" },
                { status: 400 },
              ),
            ];
          }
          validRoles = ["admin", "doctor", "nurse", "staff", "professional"];
          if (!validRoles.includes(new_role)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Role inválida. Valores permitidos: " + validRoles.join(", ") },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("*").eq("id", target_user_id).single(),
          ];
        case 5:
          (_c = _e.sent()), (targetProfile = _c.data), (targetError = _c.error);
          if (targetError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 }),
            ];
          }
          // Verificar se a role está sendo alterada
          if (targetProfile.role === new_role) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "O usuário já possui esta role" },
                { status: 400 },
              ),
            ];
          }
          old_role = targetProfile.role;
          return [
            4 /*yield*/,
            supabase
              .from("profiles")
              .update({
                role: new_role,
                updated_at: new Date().toISOString(),
              })
              .eq("id", target_user_id)
              .select()
              .single(),
          ];
        case 6:
          (_d = _e.sent()), (updatedProfile = _d.data), (updateError = _d.error);
          if (updateError) {
            console.error("Erro ao atualizar role:", updateError);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Erro ao atribuir nova role" }, { status: 500 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("role_audit_log").insert({
              user_id: user.id,
              action_type: "manual_role_assignment",
              target_user_id: target_user_id,
              old_role: old_role,
              new_role: new_role,
              reason: reason || "Atribuição manual pelo administrador",
              metadata: {
                admin_user_id: user.id,
                target_email: targetProfile.email,
                assignment_date: new Date().toISOString(),
              },
            }),
          ];
        case 7:
          logError = _e.sent().error;
          if (logError) {
            console.error("Erro ao registrar log de auditoria:", logError);
            // Não falhar a operação por erro de log
          }
          _e.label = 8;
        case 8:
          _e.trys.push([8, 10, , 11]);
          return [
            4 /*yield*/,
            supabase.from("notifications").insert({
              user_id: target_user_id,
              title: "Role Atualizada",
              message: 'Sua role foi alterada de "'
                .concat(old_role, '" para "')
                .concat(new_role, '" por um administrador.'),
              type: "role_change",
              is_read: false,
              created_at: new Date().toISOString(),
            }),
          ];
        case 9:
          _e.sent();
          return [3 /*break*/, 11];
        case 10:
          notificationError_1 = _e.sent();
          console.error("Erro ao enviar notificação:", notificationError_1);
          return [3 /*break*/, 11];
        case 11:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              profile: updatedProfile,
              roleChange: {
                from: old_role,
                to: new_role,
                assignedBy: user.id,
                assignedAt: new Date().toISOString(),
                reason: reason || "Atribuição manual pelo administrador",
              },
              message: 'Role alterada de "'
                .concat(old_role, '" para "')
                .concat(new_role, '" com sucesso'),
            }),
          ];
        case 12:
          error_1 = _e.sent();
          console.error("Erro no endpoint de atribuição de role:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 13:
          return [2 /*return*/];
      }
    });
  });
}
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      _b,
      profile,
      profileError,
      searchParams,
      page,
      limit,
      role_filter,
      search,
      offset,
      query,
      _c,
      profiles,
      profilesError,
      count,
      _d,
      roleStats,
      statsError,
      stats,
      error_2;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _e.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _e.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, supabase.from("profiles").select("role").eq("id", user.id).single()];
        case 3:
          (_b = _e.sent()), (profile = _b.data), (profileError = _b.error);
          if (
            profileError ||
            (profile === null || profile === void 0 ? void 0 : profile.role) !== "admin"
          ) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Acesso negado. Apenas administradores podem visualizar esta informação.",
                },
                { status: 403 },
              ),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          page = parseInt(searchParams.get("page") || "1");
          limit = parseInt(searchParams.get("limit") || "50");
          role_filter = searchParams.get("role");
          search = searchParams.get("search");
          offset = (page - 1) * limit;
          query = supabase
            .from("profiles")
            .select("id, email, full_name, role, created_at, updated_at", { count: "exact" });
          // Aplicar filtros
          if (role_filter && role_filter !== "all") {
            query = query.eq("role", role_filter);
          }
          if (search) {
            query = query.or(
              "email.ilike.%".concat(search, "%,full_name.ilike.%").concat(search, "%"),
            );
          }
          return [
            4 /*yield*/,
            query.order("created_at", { ascending: false }).range(offset, offset + limit - 1),
          ];
        case 4:
          (_c = _e.sent()), (profiles = _c.data), (profilesError = _c.error), (count = _c.count);
          if (profilesError) {
            console.error("Erro ao buscar perfis:", profilesError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Erro ao buscar perfis de usuários" },
                { status: 500 },
              ),
            ];
          }
          return [4 /*yield*/, supabase.from("profiles").select("role").not("role", "is", null)];
        case 5:
          (_d = _e.sent()), (roleStats = _d.data), (statsError = _d.error);
          stats =
            (roleStats === null || roleStats === void 0
              ? void 0
              : roleStats.reduce(function (acc, profile) {
                  acc[profile.role] = (acc[profile.role] || 0) + 1;
                  return acc;
                }, {})) || {};
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              profiles: profiles || [],
              pagination: {
                current_page: page,
                total_pages: Math.ceil((count || 0) / limit),
                total_items: count || 0,
                items_per_page: limit,
              },
              statistics: {
                total_users: count || 0,
                roles_distribution: stats,
              },
            }),
          ];
        case 6:
          error_2 = _e.sent();
          console.error("Erro no endpoint de listagem de roles:", error_2);
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
