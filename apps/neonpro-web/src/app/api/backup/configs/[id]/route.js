"use strict";
/**
 * API Endpoints para Configuração específica de Backup
 * Story 1.8: Sistema de Backup e Recovery
 */
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
exports.GET = GET;
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
// Initialize BackupManager only if Supabase is configured
var backupManager = null;
// TODO: Re-enable after environment is properly configured
// try {
//   if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
//     backupManager = new BackupManager();
//   }
// } catch (error) {
//   console.warn('BackupManager initialization failed:', error);
// }
// Schema para atualização de configuração
var updateConfigSchema = zod_1.z.object({
  name: zod_1.z.string().min(1).optional(),
  description: zod_1.z.string().optional(),
  enabled: zod_1.z.boolean().optional(),
  schedule_frequency: zod_1.z.enum(["HOURLY", "DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]).optional(),
  schedule_time: zod_1.z.string().optional(),
  schedule_cron: zod_1.z.string().optional(),
  retention_daily: zod_1.z.number().min(1).max(365).optional(),
  retention_weekly: zod_1.z.number().min(1).max(52).optional(),
  retention_monthly: zod_1.z.number().min(1).max(24).optional(),
  encryption_enabled: zod_1.z.boolean().optional(),
  compression_enabled: zod_1.z.boolean().optional(),
  priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  notification_email: zod_1.z.string().email().optional(),
  notification_webhook: zod_1.z.string().url().optional(),
});
/**
 * GET /api/backup/configs/[id]
 * Busca configuração específica de backup
 */
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase, user, result, error_1;
    var params = _b.params;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 4, , 5]);
          if (!backupManager) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Backup service not configured" },
                { status: 503 },
              ),
            ];
          }
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _c.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, backupManager.getBackupConfig(params.id)];
        case 3:
          result = _c.sent();
          if (!result.success) {
            return [2 /*return*/, server_1.NextResponse.json(result, { status: 404 })];
          }
          return [2 /*return*/, server_1.NextResponse.json(result)];
        case 4:
          error_1 = _c.sent();
          console.error("Erro ao buscar configuração de backup:", error_1);
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
/**
 * PUT /api/backup/configs/[id]
 * Atualiza configuração de backup
 */ function PUT(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase, user, body, validatedData, result, error_2;
    var params = _b.params;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 5, , 6]);
          if (!backupManager) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Backup service not configured" },
                { status: 503 },
              ),
            ];
          }
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _c.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _c.sent();
          validatedData = updateConfigSchema.parse(body);
          return [
            4 /*yield*/,
            backupManager.updateBackupConfig(
              params.id,
              __assign(__assign({}, validatedData), { updatedBy: user.id }),
            ),
          ];
        case 4:
          result = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(result, {
              status: result.success ? 200 : 400,
            }),
          ];
        case 5:
          error_2 = _c.sent();
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Dados inválidos",
                  details: error_2.errors,
                },
                { status: 400 },
              ),
            ];
          }
          console.error("Erro ao atualizar configuração de backup:", error_2);
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
/**
 * DELETE /api/backup/configs/[id]
 * Remove configuração de backup
 */
function DELETE(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase, user, result, error_3;
    var params = _b.params;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 4, , 5]);
          if (!backupManager) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Backup service not configured" },
                { status: 503 },
              ),
            ];
          }
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _c.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, backupManager.deleteBackupConfig(params.id)];
        case 3:
          result = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(result, {
              status: result.success ? 200 : 400,
            }),
          ];
        case 4:
          error_3 = _c.sent();
          console.error("Erro ao remover configuração de backup:", error_3);
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
