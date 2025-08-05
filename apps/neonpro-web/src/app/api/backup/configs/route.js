"use strict";
/**
 * API Endpoints para Configurações de Backup
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
exports.POST = POST;
var server_1 = require("next/server");
var backup_manager_1 = require("@/lib/backup/backup-manager");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
// Schema de validação para configuração de backup
var backupConfigSchema = zod_1.z.object({
  name: zod_1.z.string().min(1, "Nome é obrigatório"),
  description: zod_1.z.string().optional(),
  enabled: zod_1.z.boolean().default(true),
  type: zod_1.z.enum(["FULL", "INCREMENTAL", "DIFFERENTIAL", "DATABASE", "FILES"]),
  schedule_frequency: zod_1.z.enum(["HOURLY", "DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]),
  schedule_time: zod_1.z.string().optional(),
  schedule_cron: zod_1.z.string().optional(),
  storage_provider: zod_1.z.enum(["LOCAL", "S3", "GCS", "AZURE"]),
  storage_config: zod_1.z.record(zod_1.z.any()).optional(),
  retention_daily: zod_1.z.number().min(1).max(365).default(30),
  retention_weekly: zod_1.z.number().min(1).max(52).default(12),
  retention_monthly: zod_1.z.number().min(1).max(24).default(6),
  encryption_enabled: zod_1.z.boolean().default(true),
  compression_enabled: zod_1.z.boolean().default(true),
  priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  data_types: zod_1.z.array(zod_1.z.string()).optional(),
  exclude_patterns: zod_1.z.array(zod_1.z.string()).optional(),
  notification_email: zod_1.z.string().email().optional(),
  notification_webhook: zod_1.z.string().url().optional(),
});
var backupManager = new backup_manager_1.BackupManager();
/**
 * GET /api/backup/configs
 * Lista todas as configurações de backup
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      user,
      searchParams,
      page,
      limit,
      enabled,
      type,
      provider,
      filters,
      result,
      error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _a.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          page = parseInt(searchParams.get("page") || "1");
          limit = parseInt(searchParams.get("limit") || "20");
          enabled = searchParams.get("enabled");
          type = searchParams.get("type");
          provider = searchParams.get("provider");
          filters = __assign(
            __assign(
              __assign({}, enabled !== null && { enabled: enabled === "true" }),
              type && { type: type },
            ),
            provider && { storage_provider: provider },
          );
          return [
            4 /*yield*/,
            backupManager.getBackupConfigs({
              pagination: { page: page, limit: limit },
              filters: filters,
            }),
          ];
        case 3:
          result = _a.sent();
          return [2 /*return*/, server_1.NextResponse.json(result)];
        case 4:
          error_1 = _a.sent();
          console.error("Erro ao buscar configurações de backup:", error_1);
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
 * POST /api/backup/configs
 * Cria nova configuração de backup
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, body, validatedData, result, error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _a.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _a.sent();
          validatedData = backupConfigSchema.parse(body);
          return [
            4 /*yield*/,
            backupManager.createBackupConfig(
              __assign(__assign({}, validatedData), { createdBy: user.id }),
            ),
          ];
        case 4:
          result = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(result, {
              status: result.success ? 201 : 400,
            }),
          ];
        case 5:
          error_2 = _a.sent();
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
          console.error("Erro ao criar configuração de backup:", error_2);
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
