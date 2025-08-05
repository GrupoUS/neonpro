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
      body,
      conflictType,
      localProfile,
      googleProfile,
      resolution,
      resolvedProfile,
      _b,
      updatedProfile,
      updateError,
      logError,
      error_1;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 6, , 7]);
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
          return [4 /*yield*/, request.json()];
        case 3:
          body = _c.sent();
          (conflictType = body.conflictType),
            (localProfile = body.localProfile),
            (googleProfile = body.googleProfile),
            (resolution = body.resolution);
          // Validar dados obrigatórios
          if (!conflictType || !localProfile || !googleProfile || !resolution) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Dados obrigatórios ausentes" }, { status: 400 }),
            ];
          }
          resolvedProfile = {};
          // Resolver conflito baseado na estratégia escolhida
          switch (resolution) {
            case "keep_local":
              resolvedProfile = __assign({}, localProfile);
              break;
            case "use_google":
              resolvedProfile = __assign(__assign({}, localProfile), {
                full_name: googleProfile.name || localProfile.full_name,
                avatar_url: googleProfile.picture || localProfile.avatar_url,
                updated_at: new Date().toISOString(),
              });
              break;
            case "merge_smart":
              resolvedProfile = __assign(__assign({}, localProfile), {
                // Usar nome do Google se o local estiver vazio ou for genérico
                full_name:
                  !localProfile.full_name ||
                  localProfile.full_name === "Usuário" ||
                  localProfile.full_name.length < 3
                    ? googleProfile.name || localProfile.full_name
                    : localProfile.full_name,
                // Usar avatar do Google se o local não existir
                avatar_url: !localProfile.avatar_url
                  ? googleProfile.picture
                  : localProfile.avatar_url,
                updated_at: new Date().toISOString(),
              });
              break;
            case "custom":
              // Para resolução customizada, usar os dados fornecidos
              resolvedProfile = __assign(__assign(__assign({}, localProfile), body.customData), {
                updated_at: new Date().toISOString(),
              });
              break;
            default:
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Estratégia de resolução inválida" },
                  { status: 400 },
                ),
              ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").update(resolvedProfile).eq("id", user.id).select().single(),
          ];
        case 4:
          (_b = _c.sent()), (updatedProfile = _b.data), (updateError = _b.error);
          if (updateError) {
            console.error("Erro ao atualizar perfil:", updateError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Erro ao resolver conflito de perfil" },
                { status: 500 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profile_audit_log").insert({
              profile_id: user.id,
              action_type: "conflict_resolution",
              old_data: localProfile,
              new_data: updatedProfile,
              metadata: {
                conflict_type: conflictType,
                resolution_strategy: resolution,
                google_data: googleProfile,
                resolved_at: new Date().toISOString(),
              },
            }),
          ];
        case 5:
          logError = _c.sent().error;
          if (logError) {
            console.error("Erro ao registrar log de auditoria:", logError);
            // Não falhar a operação por erro de log
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              profile: updatedProfile,
              conflictResolution: {
                type: conflictType,
                strategy: resolution,
                resolvedAt: new Date().toISOString(),
              },
            }),
          ];
        case 6:
          error_1 = _c.sent();
          console.error("Erro no endpoint de resolução de conflitos:", error_1);
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
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, user, authError, _b, profile, profileError, googleProfile, conflicts, error_2;
    var _c, _d, _e, _f;
    return __generator(this, (_g) => {
      switch (_g.label) {
        case 0:
          _g.trys.push([0, 4, , 5]);
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
          return [4 /*yield*/, supabase.from("profiles").select("*").eq("id", user.id).single()];
        case 3:
          (_b = _g.sent()), (profile = _b.data), (profileError = _b.error);
          if (profileError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Erro ao buscar perfil" }, { status: 500 }),
            ];
          }
          googleProfile = {
            name:
              ((_c = user.user_metadata) === null || _c === void 0 ? void 0 : _c.full_name) ||
              ((_d = user.user_metadata) === null || _d === void 0 ? void 0 : _d.name),
            email: user.email,
            picture:
              ((_e = user.user_metadata) === null || _e === void 0 ? void 0 : _e.avatar_url) ||
              ((_f = user.user_metadata) === null || _f === void 0 ? void 0 : _f.picture),
            verified_email: user.email_confirmed_at ? true : false,
          };
          conflicts = [];
          // Conflito de nome
          if (profile.full_name !== googleProfile.name && googleProfile.name) {
            conflicts.push({
              type: "name_mismatch",
              field: "full_name",
              local_value: profile.full_name,
              google_value: googleProfile.name,
              severity: "medium",
            });
          }
          // Conflito de avatar
          if (profile.avatar_url !== googleProfile.picture && googleProfile.picture) {
            conflicts.push({
              type: "avatar_mismatch",
              field: "avatar_url",
              local_value: profile.avatar_url,
              google_value: googleProfile.picture,
              severity: "low",
            });
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              hasConflicts: conflicts.length > 0,
              conflicts: conflicts,
              profiles: {
                local: profile,
                google: googleProfile,
              },
              resolutionStrategies: [
                {
                  id: "keep_local",
                  name: "Manter dados locais",
                  description: "Preservar todas as informações atuais do perfil",
                },
                {
                  id: "use_google",
                  name: "Usar dados do Google",
                  description: "Atualizar perfil com informações do Google",
                },
                {
                  id: "merge_smart",
                  name: "Mesclagem inteligente",
                  description: "Combinar dados usando regras inteligentes",
                },
                {
                  id: "custom",
                  name: "Resolução personalizada",
                  description: "Escolher manualmente quais dados usar",
                },
              ],
            }),
          ];
        case 4:
          error_2 = _g.sent();
          console.error("Erro no endpoint de detecção de conflitos:", error_2);
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
