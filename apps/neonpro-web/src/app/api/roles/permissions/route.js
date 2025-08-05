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
exports.POST = POST;
exports.checkPermission = checkPermission;
exports.canManageTargetRole = canManageTargetRole;
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
// Definição da hierarquia de roles
var ROLE_HIERARCHY = {
  admin: {
    level: 5,
    permissions: [
      "read_all",
      "write_all",
      "delete_all",
      "manage_users",
      "manage_roles",
      "manage_system",
      "view_analytics",
      "manage_billing",
      "manage_subscriptions",
    ],
    can_manage: ["admin", "doctor", "nurse", "staff", "professional"],
  },
  doctor: {
    level: 4,
    permissions: [
      "read_patients",
      "write_patients",
      "read_appointments",
      "write_appointments",
      "read_medical_records",
      "write_medical_records",
      "manage_prescriptions",
      "view_reports",
      "manage_treatments",
    ],
    can_manage: ["nurse", "staff"],
  },
  nurse: {
    level: 3,
    permissions: [
      "read_patients",
      "write_patients",
      "read_appointments",
      "write_appointments",
      "read_medical_records",
      "assist_treatments",
      "manage_schedules",
    ],
    can_manage: ["staff"],
  },
  staff: {
    level: 2,
    permissions: [
      "read_patients",
      "read_appointments",
      "write_appointments",
      "manage_schedules",
      "basic_reports",
    ],
    can_manage: [],
  },
  professional: {
    level: 1,
    permissions: [
      "read_own_profile",
      "write_own_profile",
      "read_own_appointments",
      "view_own_schedule",
    ],
    can_manage: [],
  },
};
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      searchParams,
      role,
      action,
      targetRole,
      permission,
      hasPermission,
      canManageRole,
      roleInfo,
      error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          role = searchParams.get("role");
          action = searchParams.get("action");
          // Se for para verificar uma permissão específica
          if (action === "check") {
            targetRole = searchParams.get("target_role");
            permission = searchParams.get("permission");
            if (!role || !permission) {
              return [
                2 /*return*/,
                server_2.NextResponse.json(
                  { error: "Role e permissão são obrigatórias para verificação" },
                  { status: 400 },
                ),
              ];
            }
            hasPermission = checkPermission(role, permission);
            canManageRole = targetRole ? canManageTargetRole(role, targetRole) : null;
            return [
              2 /*return*/,
              server_2.NextResponse.json({
                success: true,
                role: role,
                permission: permission,
                target_role: targetRole,
                has_permission: hasPermission,
                can_manage_role: canManageRole,
              }),
            ];
          }
          // Retornar informações completas da hierarquia
          if (role) {
            roleInfo = ROLE_HIERARCHY[role];
            if (!roleInfo) {
              return [
                2 /*return*/,
                server_2.NextResponse.json({ error: "Role não encontrada" }, { status: 404 }),
              ];
            }
            return [
              2 /*return*/,
              server_2.NextResponse.json({
                success: true,
                role: role,
                level: roleInfo.level,
                permissions: roleInfo.permissions,
                can_manage: roleInfo.can_manage,
              }),
            ];
          }
          // Retornar hierarquia completa
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              hierarchy: ROLE_HIERARCHY,
              role_levels: Object.entries(ROLE_HIERARCHY)
                .sort((_a, _b) => {
                  var a = _a[1];
                  var b = _b[1];
                  return b.level - a.level;
                })
                .map((_a) => {
                  var role = _a[0],
                    info = _a[1];
                  return {
                    role: role,
                    level: info.level,
                    permissions_count: info.permissions.length,
                    can_manage_count: info.can_manage.length,
                  };
                }),
            }),
          ];
        case 3:
          error_1 = _b.sent();
          console.error("Erro no endpoint de permissões:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 4:
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
      _b,
      profile,
      profileError,
      body,
      action,
      target_user_id,
      permissions,
      reason,
      user_role,
      required_permission,
      target_resource,
      hasAccess,
      logError,
      error_2;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 7, , 8]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, supabase.from("profiles").select("role").eq("id", user.id).single()];
        case 3:
          (_b = _c.sent()), (profile = _b.data), (profileError = _b.error);
          if (
            profileError ||
            (profile === null || profile === void 0 ? void 0 : profile.role) !== "admin"
          ) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Acesso negado. Apenas administradores podem gerenciar permissões." },
                { status: 403 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _c.sent();
          (action = body.action),
            (target_user_id = body.target_user_id),
            (permissions = body.permissions),
            (reason = body.reason);
          if (!(action === "validate_access")) return [3 /*break*/, 6];
          (user_role = body.user_role),
            (required_permission = body.required_permission),
            (target_resource = body.target_resource);
          if (!user_role || !required_permission) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Role do usuário e permissão requerida são obrigatórias" },
                { status: 400 },
              ),
            ];
          }
          hasAccess = checkPermission(user_role, required_permission);
          return [
            4 /*yield*/,
            supabase.from("role_audit_log").insert({
              user_id: user.id,
              action_type: "access_validation",
              target_resource: target_resource || "unknown",
              metadata: {
                user_role: user_role,
                required_permission: required_permission,
                access_granted: hasAccess,
                validated_at: new Date().toISOString(),
              },
            }),
          ];
        case 5:
          logError = _c.sent().error;
          if (logError) {
            console.error("Erro ao registrar log de validação:", logError);
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              access_granted: hasAccess,
              user_role: user_role,
              required_permission: required_permission,
              validated_at: new Date().toISOString(),
            }),
          ];
        case 6:
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Ação não reconhecida" }, { status: 400 }),
          ];
        case 7:
          error_2 = _c.sent();
          console.error("Erro no endpoint de validação de permissões:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
// Função para verificar se uma role tem determinada permissão
function checkPermission(userRole, permission) {
  var roleInfo = ROLE_HIERARCHY[userRole];
  if (!roleInfo) return false;
  return roleInfo.permissions.includes(permission);
}
// Função para verificar se uma role pode gerenciar outra role
function canManageTargetRole(userRole, targetRole) {
  var userRoleInfo = ROLE_HIERARCHY[userRole];
  if (!userRoleInfo) return false;
  return userRoleInfo.can_manage.includes(targetRole);
}
// Função para verificar se uma role tem nível hierárquico superior
function hasHigherLevel(userRole, targetRole) {
  var userRoleInfo = ROLE_HIERARCHY[userRole];
  var targetRoleInfo = ROLE_HIERARCHY[targetRole];
  if (!userRoleInfo || !targetRoleInfo) return false;
  return userRoleInfo.level > targetRoleInfo.level;
}
