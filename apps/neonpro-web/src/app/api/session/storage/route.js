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
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      action,
      token_type,
      encrypted_data,
      expires_at,
      _b,
      storedToken,
      storeError,
      token_type,
      _c,
      token,
      retrieveError,
      token_id,
      token_type,
      query,
      revokeError,
      error_1;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 11, , 12]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _d.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _d.sent();
          action = body.action;
          if (!(action === "store_token")) return [3 /*break*/, 5];
          (token_type = body.token_type),
            (encrypted_data = body.encrypted_data),
            (expires_at = body.expires_at);
          // Validar dados obrigatórios
          if (!token_type || !encrypted_data) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Tipo de token e dados criptografados são obrigatórios" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("secure_tokens")
              .insert({
                user_id: user.id,
                token_type: token_type,
                encrypted_data: encrypted_data,
                expires_at: expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h default
                last_accessed: new Date().toISOString(),
                is_active: true,
              })
              .select()
              .single(),
          ];
        case 4:
          (_b = _d.sent()), (storedToken = _b.data), (storeError = _b.error);
          if (storeError) {
            console.error("Erro ao armazenar token:", storeError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Erro ao armazenar token de forma segura" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              token_id: storedToken.id,
              message: "Token armazenado com segurança",
            }),
          ];
        case 5:
          if (!(action === "retrieve_token")) return [3 /*break*/, 8];
          token_type = body.token_type;
          if (!token_type) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Tipo de token é obrigatório" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("secure_tokens")
              .select("*")
              .eq("user_id", user.id)
              .eq("token_type", token_type)
              .eq("is_active", true)
              .gt("expires_at", new Date().toISOString())
              .order("created_at", { ascending: false })
              .limit(1)
              .single(),
          ];
        case 6:
          (_c = _d.sent()), (token = _c.data), (retrieveError = _c.error);
          if (retrieveError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Token não encontrado ou expirado" },
                { status: 404 },
              ),
            ];
          }
          // Atualizar último acesso
          return [
            4 /*yield*/,
            supabase
              .from("secure_tokens")
              .update({ last_accessed: new Date().toISOString() })
              .eq("id", token.id),
          ];
        case 7:
          // Atualizar último acesso
          _d.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              token: {
                id: token.id,
                token_type: token.token_type,
                encrypted_data: token.encrypted_data,
                expires_at: token.expires_at,
                last_accessed: new Date().toISOString(),
              },
            }),
          ];
        case 8:
          if (!(action === "revoke_token")) return [3 /*break*/, 10];
          (token_id = body.token_id), (token_type = body.token_type);
          query = supabase
            .from("secure_tokens")
            .update({
              is_active: false,
              revoked_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
          if (token_id) {
            query = query.eq("id", token_id);
          } else if (token_type) {
            query = query.eq("token_type", token_type);
          } else {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "ID do token ou tipo de token é obrigatório" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, query];
        case 9:
          revokeError = _d.sent().error;
          if (revokeError) {
            console.error("Erro ao revogar token:", revokeError);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Erro ao revogar token" }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Token revogado com sucesso",
            }),
          ];
        case 10:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Ação não reconhecida" }, { status: 400 }),
          ];
        case 11:
          error_1 = _d.sent();
          console.error("Erro no endpoint de armazenamento de token:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 12:
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
      searchParams,
      token_type,
      include_expired,
      query,
      _b,
      tokens,
      tokensError,
      active_tokens,
      expired_tokens,
      revoked_tokens,
      error_2;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          token_type = searchParams.get("token_type");
          include_expired = searchParams.get("include_expired") === "true";
          query = supabase
            .from("secure_tokens")
            .select("id, token_type, expires_at, last_accessed, is_active, created_at, revoked_at")
            .eq("user_id", user.id);
          if (token_type) {
            query = query.eq("token_type", token_type);
          }
          if (!include_expired) {
            query = query.gt("expires_at", new Date().toISOString());
          }
          return [4 /*yield*/, query.order("created_at", { ascending: false })];
        case 3:
          (_b = _c.sent()), (tokens = _b.data), (tokensError = _b.error);
          if (tokensError) {
            console.error("Erro ao buscar tokens:", tokensError);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Erro ao buscar tokens" }, { status: 500 }),
            ];
          }
          active_tokens =
            (tokens === null || tokens === void 0
              ? void 0
              : tokens.filter(function (t) {
                  return t.is_active && new Date(t.expires_at) > new Date();
                }).length) || 0;
          expired_tokens =
            (tokens === null || tokens === void 0
              ? void 0
              : tokens.filter(function (t) {
                  return new Date(t.expires_at) <= new Date();
                }).length) || 0;
          revoked_tokens =
            (tokens === null || tokens === void 0
              ? void 0
              : tokens.filter(function (t) {
                  return !t.is_active;
                }).length) || 0;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              tokens: tokens || [],
              statistics: {
                total: (tokens === null || tokens === void 0 ? void 0 : tokens.length) || 0,
                active: active_tokens,
                expired: expired_tokens,
                revoked: revoked_tokens,
              },
            }),
          ];
        case 4:
          error_2 = _c.sent();
          console.error("Erro no endpoint de listagem de tokens:", error_2);
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
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, user, authError, searchParams, action, revokeError, cleanupError, error_3;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 7, , 8]);
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
          searchParams = new URL(request.url).searchParams;
          action = searchParams.get("action");
          if (!(action === "revoke_all")) return [3 /*break*/, 4];
          return [
            4 /*yield*/,
            supabase
              .from("secure_tokens")
              .update({
                is_active: false,
                revoked_at: new Date().toISOString(),
              })
              .eq("user_id", user.id)
              .eq("is_active", true),
          ];
        case 3:
          revokeError = _b.sent().error;
          if (revokeError) {
            console.error("Erro ao revogar todos os tokens:", revokeError);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Erro ao revogar tokens" }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Todos os tokens foram revogados",
            }),
          ];
        case 4:
          if (!(action === "cleanup_expired")) return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            supabase
              .from("secure_tokens")
              .update({
                is_active: false,
                revoked_at: new Date().toISOString(),
              })
              .eq("user_id", user.id)
              .lt("expires_at", new Date().toISOString())
              .eq("is_active", true),
          ];
        case 5:
          cleanupError = _b.sent().error;
          if (cleanupError) {
            console.error("Erro ao limpar tokens expirados:", cleanupError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Erro ao limpar tokens expirados" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Tokens expirados foram limpos",
            }),
          ];
        case 6:
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Ação de exclusão não reconhecida" },
              { status: 400 },
            ),
          ];
        case 7:
          error_3 = _b.sent();
          console.error("Erro no endpoint de exclusão de tokens:", error_3);
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
