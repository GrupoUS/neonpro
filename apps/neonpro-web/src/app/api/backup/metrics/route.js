/**
 * API Endpoints para Métricas de Backup
 * Story 1.8: Sistema de Backup e Recovery
 */
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
var server_1 = require("next/server");
var backup_manager_1 = require("@/lib/backup/backup-manager");
var server_2 = require("@/lib/supabase/server");
var backupManager = new backup_manager_1.BackupManager();
/**
 * GET /api/backup/metrics
 * Retorna métricas detalhadas do sistema de backup
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      user,
      searchParams,
      period,
      includeStorage,
      includePerformance,
      includeCompliance,
      metricsData,
      _a,
      _b,
      _c,
      _d,
      error_1;
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 10, undefined, 11]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _e.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _e.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          period = searchParams.get("period") || "7d";
          includeStorage = searchParams.get("storage") === "true";
          includePerformance = searchParams.get("performance") === "true";
          includeCompliance = searchParams.get("compliance") === "true";
          metricsData = {
            timestamp: new Date(),
            period: period,
          };
          // Métricas básicas sempre incluídas
          _a = metricsData;
          return [4 /*yield*/, backupManager.getBasicMetrics(period)];
        case 3:
          // Métricas básicas sempre incluídas
          _a.basic = _e.sent();
          if (!includeStorage) return [3 /*break*/, 5];
          _b = metricsData;
          return [4 /*yield*/, backupManager.getStorageMetrics(period)];
        case 4:
          _b.storage = _e.sent();
          _e.label = 5;
        case 5:
          if (!includePerformance) return [3 /*break*/, 7];
          _c = metricsData;
          return [4 /*yield*/, backupManager.getPerformanceMetrics(period)];
        case 6:
          _c.performance = _e.sent();
          _e.label = 7;
        case 7:
          if (!includeCompliance) return [3 /*break*/, 9];
          _d = metricsData;
          return [4 /*yield*/, backupManager.getComplianceMetrics(period)];
        case 8:
          _d.compliance = _e.sent();
          _e.label = 9;
        case 9:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: metricsData,
              message: "Métricas obtidas com sucesso",
              timestamp: new Date(),
            }),
          ];
        case 10:
          error_1 = _e.sent();
          console.error("Erro ao obter métricas:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 11:
          return [2 /*return*/];
      }
    });
  });
}
