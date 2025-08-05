"use strict";
// lib/middleware/role-validation.ts
// VIBECODE V1.0 - Role-Based Access Control Middleware
// Story 1.4 - OAuth Google Integration Enhancement
// Created: 2025-07-22
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
exports.validateRole = validateRole;
exports.withRoleValidation = withRoleValidation;
exports.canManageUser = canManageUser;
exports.logRoleAction = logRoleAction;
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
var route_1 = require("@/app/api/roles/permissions/route");
/**
 * Middleware para validação de roles e permissões
 */
function validateRole(request_1) {
  return __awaiter(this, arguments, void 0, function (request, options) {
    var supabase,
      _a,
      user,
      authError,
      _b,
      profile_1,
      profileError,
      hasAllPermissions,
      body,
      url,
      resourceOwnerId,
      error_1;
    if (options === void 0) {
      options = {};
    }
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              {
                success: false,
                user: null,
                profile: null,
                error: "Não autorizado - usuário não autenticado",
                statusCode: 401,
              },
            ];
          }
          return [4 /*yield*/, supabase.from("profiles").select("*").eq("id", user.id).single()];
        case 3:
          (_b = _c.sent()), (profile_1 = _b.data), (profileError = _b.error);
          if (profileError || !profile_1) {
            return [
              2 /*return*/,
              {
                success: false,
                user: user,
                profile: null,
                error: "Perfil do usuário não encontrado",
                statusCode: 404,
              },
            ];
          }
          // Verificar role específica se fornecida
          if (options.requiredRole && options.requiredRole.length > 0) {
            if (!options.requiredRole.includes(profile_1.role)) {
              return [
                2 /*return*/,
                {
                  success: false,
                  user: user,
                  profile: profile_1,
                  error: "Acesso negado. Roles permitidas: ".concat(
                    options.requiredRole.join(", "),
                  ),
                  statusCode: 403,
                },
              ];
            }
          }
          // Verificar permissões específicas se fornecidas
          if (options.requiredPermission && options.requiredPermission.length > 0) {
            hasAllPermissions = options.requiredPermission.every(function (permission) {
              return (0, route_1.checkPermission)(profile_1.role, permission);
            });
            if (!hasAllPermissions) {
              return [
                2 /*return*/,
                {
                  success: false,
                  user: user,
                  profile: profile_1,
                  error: "Permiss\u00F5es insuficientes. Requeridas: ".concat(
                    options.requiredPermission.join(", "),
                  ),
                  statusCode: 403,
                },
              ];
            }
          }
          if (!(options.allowSelfAccess && options.resourceOwnerField)) return [3 /*break*/, 5];
          return [
            4 /*yield*/,
            request.json().catch(function () {
              return {};
            }),
          ];
        case 4:
          body = _c.sent();
          url = new URL(request.url);
          resourceOwnerId =
            body[options.resourceOwnerField] || url.searchParams.get(options.resourceOwnerField);
          if (resourceOwnerId && resourceOwnerId === user.id) {
            // Usuário está acessando seus próprios dados
            return [
              2 /*return*/,
              {
                success: true,
                user: user,
                profile: profile_1,
              },
            ];
          }
          _c.label = 5;
        case 5:
          return [
            2 /*return*/,
            {
              success: true,
              user: user,
              profile: profile_1,
            },
          ];
        case 6:
          error_1 = _c.sent();
          console.error("Erro na validação de role:", error_1);
          return [
            2 /*return*/,
            {
              success: false,
              user: null,
              profile: null,
              error: "Erro interno na validação de permissões",
              statusCode: 500,
            },
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Wrapper para middleware de validação de role
 */
function withRoleValidation(handler, options) {
  var _this = this;
  if (options === void 0) {
    options = {};
  }
  return function (request) {
    return __awaiter(_this, void 0, void 0, function () {
      var validation;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, validateRole(request, options)];
          case 1:
            validation = _a.sent();
            if (!validation.success) {
              return [
                2 /*return*/,
                server_2.NextResponse.json(
                  { error: validation.error },
                  { status: validation.statusCode || 403 },
                ),
              ];
            }
            return [2 /*return*/, handler(request, validation)];
        }
      });
    });
  };
}
/**
 * Validar se o usuário pode gerenciar outro usuário
 */
function canManageUser(managerUserId, targetUserId) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, profiles, error, managerProfile, targetProfile, canManage, error_2;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _b.sent();
          return [
            4 /*yield*/,
            supabase.from("profiles").select("id, role").in("id", [managerUserId, targetUserId]),
          ];
        case 2:
          (_a = _b.sent()), (profiles = _a.data), (error = _a.error);
          if (error || !profiles || profiles.length !== 2) {
            return [
              2 /*return*/,
              { canManage: false, reason: "Erro ao buscar informações dos usuários" },
            ];
          }
          managerProfile = profiles.find(function (p) {
            return p.id === managerUserId;
          });
          targetProfile = profiles.find(function (p) {
            return p.id === targetUserId;
          });
          if (!managerProfile || !targetProfile) {
            return [2 /*return*/, { canManage: false, reason: "Perfil de usuário não encontrado" }];
          }
          canManage = (0, route_1.canManageTargetRole)(managerProfile.role, targetProfile.role);
          return [
            2 /*return*/,
            {
              canManage: canManage,
              reason: canManage
                ? undefined
                : "Role "
                    .concat(managerProfile.role, " n\u00E3o pode gerenciar role ")
                    .concat(targetProfile.role),
            },
          ];
        case 3:
          error_2 = _b.sent();
          console.error("Erro na verificação de gerenciamento de usuário:", error_2);
          return [2 /*return*/, { canManage: false, reason: "Erro interno na verificação" }];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Log de auditoria para ações relacionadas a roles
 */
function logRoleAction(userId_1, actionType_1) {
  return __awaiter(this, arguments, void 0, function (userId, actionType, metadata) {
    var supabase, error_3;
    if (metadata === void 0) {
      metadata = {};
    }
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _a.sent();
          return [
            4 /*yield*/,
            supabase.from("role_audit_log").insert({
              user_id: userId,
              action_type: actionType,
              metadata: __assign(__assign({}, metadata), {
                timestamp: new Date().toISOString(),
                user_agent: metadata.user_agent || "unknown",
              }),
            }),
          ];
        case 2:
          _a.sent();
          return [3 /*break*/, 4];
        case 3:
          error_3 = _a.sent();
          console.error("Erro ao registrar log de auditoria de role:", error_3);
          return [3 /*break*/, 4];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
