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
exports.GET = GET;
exports.POST = POST;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
// Configurações de timeout padrão (em minutos)
var TIMEOUT_CONFIGS = {
  admin: 60, // 1 hora
  doctor: 45, // 45 minutos
  nurse: 30, // 30 minutos
  staff: 20, // 20 minutos
  professional: 15, // 15 minutos
};
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      _b,
      profile,
      profileError,
      _c,
      userTimeout,
      timeoutError,
      timeoutMinutes,
      session,
      sessionExpiresAt,
      now,
      expiresAt,
      timeRemaining,
      error_1;
    var _d;
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
          if (profileError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Erro ao buscar perfil do usuário" },
                { status: 500 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("user_session_settings")
              .select("timeout_minutes, auto_extend_enabled")
              .eq("user_id", user.id)
              .single(),
          ];
        case 4:
          (_c = _e.sent()), (userTimeout = _c.data), (timeoutError = _c.error);
          timeoutMinutes =
            (userTimeout === null || userTimeout === void 0
              ? void 0
              : userTimeout.timeout_minutes) ||
            TIMEOUT_CONFIGS[profile.role] ||
            15;
          return [4 /*yield*/, supabase.auth.getSession()];
        case 5:
          session = _e.sent();
          sessionExpiresAt =
            (_d = session.data.session) === null || _d === void 0 ? void 0 : _d.expires_at;
          now = Math.floor(Date.now() / 1000);
          expiresAt = sessionExpiresAt || now + timeoutMinutes * 60;
          timeRemaining = Math.max(0, expiresAt - now);
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              timeout_config: {
                timeout_minutes: timeoutMinutes,
                auto_extend_enabled:
                  (userTimeout === null || userTimeout === void 0
                    ? void 0
                    : userTimeout.auto_extend_enabled) || false,
                role_based_timeout: TIMEOUT_CONFIGS[profile.role],
                custom_timeout:
                  (userTimeout === null || userTimeout === void 0
                    ? void 0
                    : userTimeout.timeout_minutes) || null,
              },
              session_info: {
                expires_at: expiresAt,
                time_remaining_seconds: timeRemaining,
                time_remaining_minutes: Math.floor(timeRemaining / 60),
                is_expired: timeRemaining <= 0,
                warning_threshold: 5 * 60, // Avisar 5 minutos antes
                should_warn: timeRemaining <= 5 * 60 && timeRemaining > 0,
              },
            }),
          ];
        case 6:
          error_1 = _e.sent();
          console.error("Erro no endpoint de timeout de sessão:", error_1);
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
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      action,
      _b,
      refreshData,
      refreshError,
      refreshError_1,
      timeout_minutes,
      auto_extend_enabled,
      _c,
      updatedConfig,
      updateError,
      error_2;
    var _d, _e, _f;
    return __generator(this, function (_g) {
      switch (_g.label) {
        case 0:
          _g.trys.push([0, 13, , 14]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _g.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _g.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _g.sent();
          action = body.action;
          if (!(action === "extend_session")) return [3 /*break*/, 8];
          _g.label = 4;
        case 4:
          _g.trys.push([4, 7, , 8]);
          return [4 /*yield*/, supabase.auth.refreshSession()];
        case 5:
          (_b = _g.sent()), (refreshData = _b.data), (refreshError = _b.error);
          if (refreshError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Não foi possível estender a sessão" },
                { status: 401 },
              ),
            ];
          }
          // Registrar extensão da sessão
          return [
            4 /*yield*/,
            supabase.from("session_activity_log").insert({
              user_id: user.id,
              activity_type: "session_extended",
              metadata: {
                extended_at: new Date().toISOString(),
                new_expires_at:
                  (_d = refreshData.session) === null || _d === void 0 ? void 0 : _d.expires_at,
              },
            }),
          ];
        case 6:
          // Registrar extensão da sessão
          _g.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Sessão estendida com sucesso",
              new_expires_at:
                (_e = refreshData.session) === null || _e === void 0 ? void 0 : _e.expires_at,
              access_token:
                (_f = refreshData.session) === null || _f === void 0 ? void 0 : _f.access_token,
            }),
          ];
        case 7:
          refreshError_1 = _g.sent();
          console.error("Erro ao renovar sessão:", refreshError_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro ao estender sessão" }, { status: 500 }),
          ];
        case 8:
          if (!(action === "update_timeout_config")) return [3 /*break*/, 10];
          (timeout_minutes = body.timeout_minutes),
            (auto_extend_enabled = body.auto_extend_enabled);
          // Validar timeout (mínimo 5 minutos, máximo 120 minutos)
          if (timeout_minutes && (timeout_minutes < 5 || timeout_minutes > 120)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Timeout deve estar entre 5 e 120 minutos" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("user_session_settings")
              .upsert({
                user_id: user.id,
                timeout_minutes: timeout_minutes,
                auto_extend_enabled:
                  auto_extend_enabled !== undefined ? auto_extend_enabled : false,
                updated_at: new Date().toISOString(),
              })
              .select()
              .single(),
          ];
        case 9:
          (_c = _g.sent()), (updatedConfig = _c.data), (updateError = _c.error);
          if (updateError) {
            console.error("Erro ao atualizar configurações de timeout:", updateError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Erro ao salvar configurações de timeout" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Configurações de timeout atualizadas",
              config: updatedConfig,
            }),
          ];
        case 10:
          if (!(action === "check_activity")) return [3 /*break*/, 12];
          // Registrar atividade do usuário para resetar timeout
          return [
            4 /*yield*/,
            supabase.from("session_activity_log").insert({
              user_id: user.id,
              activity_type: "user_activity",
              metadata: {
                activity_at: new Date().toISOString(),
                user_agent: request.headers.get("user-agent") || "unknown",
              },
            }),
          ];
        case 11:
          // Registrar atividade do usuário para resetar timeout
          _g.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Atividade registrada",
              activity_recorded_at: new Date().toISOString(),
            }),
          ];
        case 12:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Ação não reconhecida" }, { status: 400 }),
          ];
        case 13:
          error_2 = _g.sent();
          console.error("Erro no endpoint de controle de timeout:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 14:
          return [2 /*return*/];
      }
    });
  });
}
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, user, authError, signOutError_1, error_3;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 8, , 9]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          _b.label = 3;
        case 3:
          _b.trys.push([3, 6, , 7]);
          return [4 /*yield*/, supabase.auth.signOut()];
        case 4:
          _b.sent();
          // Registrar logout forçado
          return [
            4 /*yield*/,
            supabase.from("session_activity_log").insert({
              user_id: user.id,
              activity_type: "forced_logout",
              metadata: {
                logged_out_at: new Date().toISOString(),
                reason: "timeout_exceeded",
              },
            }),
          ];
        case 5:
          // Registrar logout forçado
          _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Sessão encerrada por timeout",
            }),
          ];
        case 6:
          signOutError_1 = _b.sent();
          console.error("Erro ao encerrar sessão:", signOutError_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro ao encerrar sessão" }, { status: 500 }),
          ];
        case 7:
          return [3 /*break*/, 9];
        case 8:
          error_3 = _b.sent();
          console.error("Erro no endpoint de encerramento de sessão:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 9:
          return [2 /*return*/];
      }
    });
  });
}
