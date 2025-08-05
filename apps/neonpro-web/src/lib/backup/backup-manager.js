/**
 * NeonPro Backup Manager
 * Story 1.8: Sistema de Backup e Recovery
 *
 * Gerenciador principal do sistema de backup automático,
 * coordenando backups, recovery e monitoramento.
 */
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
exports.backupManager = exports.BackupManager = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var types_1 = require("./types");
var storage_1 = require("./storage");
var scheduler_1 = require("./scheduler");
var monitoring_1 = require("./monitoring");
// import type { SecurityService } from "./security";
var audit_logger_1 = require("../auth/audit/audit-logger");
/**
 * Gerenciador principal do sistema de backup
 */
var BackupManager = /** @class */ (() => {
  function BackupManager() {
    // private security: SecurityService;
    this.activeBackups = new Map();
    this.activeRecoveries = new Map();
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
    this.storageProvider = new storage_1.StorageProvider();
    this.scheduler = new scheduler_1.SchedulerService(this);
    this.monitoring = new monitoring_1.MonitoringService(this);
    // this.security = new SecurityService();
  }
  // ============================================================================
  // CONFIGURAÇÃO DE BACKUP
  // ============================================================================
  /**
   * Criar nova configuração de backup
   */
  BackupManager.prototype.createBackupConfig = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var newConfig, _a, data, error, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            // Validar configuração
            return [4 /*yield*/, this.validateBackupConfig(config)];
          case 1:
            // Validar configuração
            _b.sent();
            newConfig = __assign(__assign({}, config), {
              id: crypto.randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            return [
              4 /*yield*/,
              this.supabase.from("backup_configs").insert(newConfig).select().single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            if (!newConfig.enabled) return [3 /*break*/, 4];
            return [4 /*yield*/, this.scheduler.scheduleBackup(newConfig)];
          case 3:
            _b.sent();
            _b.label = 4;
          case 4:
            // Log de auditoria
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "BACKUP_CONFIG_CREATED",
                entityType: "BACKUP_CONFIG",
                entityId: newConfig.id,
                details: { name: newConfig.name, type: newConfig.type },
                userId: newConfig.createdBy,
              }),
            ];
          case 5:
            // Log de auditoria
            _b.sent();
            return [
              2 /*return*/,
              {
                success: true,
                data: data,
                message: "Configuração de backup criada com sucesso",
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 6:
            error_1 = _b.sent();
            return [
              2 /*return*/,
              this.handleError("Erro ao criar configuração de backup", error_1),
            ];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Atualizar configuração de backup
   */
  BackupManager.prototype.updateBackupConfig = function (id, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var updatedConfig, _a, data, error, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, , 6]);
            updatedConfig = __assign(__assign({}, updates), { id: id, updatedAt: new Date() });
            return [
              4 /*yield*/,
              this.supabase
                .from("backup_configs")
                .update(updatedConfig)
                .eq("id", id)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            if (!(updates.schedule || updates.enabled !== undefined)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.scheduler.rescheduleBackup(data)];
          case 2:
            _b.sent();
            _b.label = 3;
          case 3:
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "BACKUP_CONFIG_UPDATED",
                entityType: "BACKUP_CONFIG",
                entityId: id,
                details: updates,
                userId: updates.createdBy || "system",
              }),
            ];
          case 4:
            _b.sent();
            return [
              2 /*return*/,
              {
                success: true,
                data: data,
                message: "Configuração atualizada com sucesso",
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 5:
            error_2 = _b.sent();
            return [2 /*return*/, this.handleError("Erro ao atualizar configuração", error_2)];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Listar configurações de backup
   */
  BackupManager.prototype.listBackupConfigs = function (options) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        _b,
        page,
        _c,
        limit,
        _d,
        sortBy,
        _e,
        sortOrder,
        offset,
        _f,
        data,
        error,
        count,
        totalPages,
        error_3;
      return __generator(this, function (_g) {
        switch (_g.label) {
          case 0:
            _g.trys.push([0, 2, , 3]);
            (_a = options || {}),
              (_b = _a.page),
              (page = _b === void 0 ? 1 : _b),
              (_c = _a.limit),
              (limit = _c === void 0 ? 20 : _c),
              (_d = _a.sortBy),
              (sortBy = _d === void 0 ? "createdAt" : _d),
              (_e = _a.sortOrder),
              (sortOrder = _e === void 0 ? "DESC" : _e);
            offset = (page - 1) * limit;
            return [
              4 /*yield*/,
              this.supabase
                .from("backup_configs")
                .select("*", { count: "exact" })
                .order(sortBy, { ascending: sortOrder === "ASC" })
                .range(offset, offset + limit - 1),
            ];
          case 1:
            (_f = _g.sent()), (data = _f.data), (error = _f.error), (count = _f.count);
            if (error) throw error;
            totalPages = Math.ceil((count || 0) / limit);
            return [
              2 /*return*/,
              {
                success: true,
                data: {
                  data: data,
                  total: count || 0,
                  page: page,
                  limit: limit,
                  totalPages: totalPages,
                  hasNext: page < totalPages,
                  hasPrev: page > 1,
                },
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 2:
            error_3 = _g.sent();
            return [2 /*return*/, this.handleError("Erro ao listar configurações", error_3)];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // EXECUÇÃO DE BACKUP
  // ============================================================================
  /**
   * Executar backup manualmente
   */
  BackupManager.prototype.executeBackup = function (configId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var config, backupRecord, _a, record, error, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase.from("backup_configs").select("*").eq("id", configId).single(),
            ];
          case 1:
            config = _b.sent().data;
            if (!config) {
              throw new Error("Configuração de backup não encontrada");
            }
            // Verificar se já existe backup em execução
            if (this.activeBackups.has(configId)) {
              throw new Error("Backup já está em execução para esta configuração");
            }
            backupRecord = {
              configId: configId,
              type: config.type,
              status: types_1.BackupStatus.PENDING,
              startTime: new Date(),
              size: 0,
              filesCount: 0,
              checksum: "",
              path: "",
              metadata: {
                version: "1.0",
                source: "manual",
                dataTypes: config.dataTypes,
                environment: process.env.NODE_ENV || "development",
                hostname: process.env.HOSTNAME || "localhost",
                userId: userId,
                clientVersion: "1.0.0",
                dependencies: [],
              },
              warnings: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            return [
              4 /*yield*/,
              this.supabase.from("backup_records").insert(backupRecord).select().single(),
            ];
          case 2:
            (_a = _b.sent()), (record = _a.data), (error = _a.error);
            if (error) throw error;
            // Iniciar backup em background
            this.performBackup(record, config);
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "BACKUP_STARTED",
                entityType: "BACKUP",
                entityId: record.id,
                details: { configId: configId, type: config.type },
                userId: userId,
              }),
            ];
          case 3:
            _b.sent();
            return [
              2 /*return*/,
              {
                success: true,
                data: record,
                message: "Backup iniciado com sucesso",
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 4:
            error_4 = _b.sent();
            return [2 /*return*/, this.handleError("Erro ao executar backup", error_4)];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Realizar backup (processo interno)
   */
  BackupManager.prototype.performBackup = function (record, config) {
    return __awaiter(this, void 0, void 0, function () {
      var progress, backupResult, checksum, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            progress = {
              backupId: record.id,
              status: types_1.BackupStatus.RUNNING,
              percentage: 0,
              filesProcessed: 0,
              totalFiles: 0,
              bytesProcessed: 0,
              totalBytes: 0,
              speed: 0,
              eta: 0,
              startTime: new Date(),
              lastUpdate: new Date(),
            };
            this.activeBackups.set(record.configId, progress);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 11, 15, 16]);
            // Atualizar status para RUNNING
            return [4 /*yield*/, this.updateBackupStatus(record.id, types_1.BackupStatus.RUNNING)];
          case 2:
            // Atualizar status para RUNNING
            _a.sent();
            return [4 /*yield*/, this.executeBackupByType(config, progress)];
          case 3:
            backupResult = _a.sent();
            return [4 /*yield*/, this.calculateChecksum(backupResult.path)];
          case 4:
            checksum = _a.sent();
            // Atualizar registro com sucesso
            return [
              4 /*yield*/,
              this.supabase
                .from("backup_records")
                .update({
                  status: types_1.BackupStatus.COMPLETED,
                  endTime: new Date(),
                  duration: Math.floor((Date.now() - record.startTime.getTime()) / 1000),
                  size: backupResult.size,
                  compressedSize: backupResult.compressedSize,
                  filesCount: backupResult.filesCount,
                  checksum: checksum,
                  path: backupResult.path,
                  updatedAt: new Date(),
                })
                .eq("id", record.id),
            ];
          case 5:
            // Atualizar registro com sucesso
            _a.sent();
            if (!(config.storage.type !== types_1.StorageType.LOCAL)) return [3 /*break*/, 7];
            return [4 /*yield*/, this.storageProvider.upload(backupResult.path, config.storage)];
          case 6:
            _a.sent();
            _a.label = 7;
          case 7:
            // Aplicar política de retenção
            return [4 /*yield*/, this.applyRetentionPolicy(config)];
          case 8:
            // Aplicar política de retenção
            _a.sent();
            // Notificar sucesso
            return [4 /*yield*/, this.monitoring.notifyBackupSuccess(record.id, config)];
          case 9:
            // Notificar sucesso
            _a.sent();
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "BACKUP_COMPLETED",
                entityType: "BACKUP",
                entityId: record.id,
                details: {
                  size: backupResult.size,
                  duration: Math.floor((Date.now() - record.startTime.getTime()) / 1000),
                  filesCount: backupResult.filesCount,
                },
                userId: record.metadata.userId,
              }),
            ];
          case 10:
            _a.sent();
            return [3 /*break*/, 16];
          case 11:
            error_5 = _a.sent();
            // Atualizar status para FAILED
            return [
              4 /*yield*/,
              this.updateBackupStatus(record.id, types_1.BackupStatus.FAILED, error_5.message),
            ];
          case 12:
            // Atualizar status para FAILED
            _a.sent();
            // Notificar falha
            return [
              4 /*yield*/,
              this.monitoring.notifyBackupFailure(record.id, config, error_5.message),
            ];
          case 13:
            // Notificar falha
            _a.sent();
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "BACKUP_FAILED",
                entityType: "BACKUP",
                entityId: record.id,
                details: { error: error_5.message },
                userId: record.metadata.userId,
              }),
            ];
          case 14:
            _a.sent();
            return [3 /*break*/, 16];
          case 15:
            this.activeBackups.delete(record.configId);
            return [7 /*endfinally*/];
          case 16:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Executar backup por tipo de dados
   */
  BackupManager.prototype.executeBackupByType = function (config, progress) {
    return __awaiter(this, void 0, void 0, function () {
      var results,
        _i,
        _a,
        dataType,
        _b,
        dbResult,
        filesResult,
        logsResult,
        configResult,
        mediaResult,
        docsResult,
        compressedResult,
        encryptedResult;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            results = {
              path: "",
              size: 0,
              compressedSize: 0,
              filesCount: 0,
            };
            (_i = 0), (_a = config.dataTypes);
            _c.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 15];
            dataType = _a[_i];
            _b = dataType;
            switch (_b) {
              case types_1.DataType.DATABASE:
                return [3 /*break*/, 2];
              case types_1.DataType.FILES:
                return [3 /*break*/, 4];
              case types_1.DataType.LOGS:
                return [3 /*break*/, 6];
              case types_1.DataType.CONFIG:
                return [3 /*break*/, 8];
              case types_1.DataType.MEDIA:
                return [3 /*break*/, 10];
              case types_1.DataType.DOCUMENTS:
                return [3 /*break*/, 12];
            }
            return [3 /*break*/, 14];
          case 2:
            return [4 /*yield*/, this.backupDatabase(config, progress)];
          case 3:
            dbResult = _c.sent();
            results.size += dbResult.size;
            results.filesCount += dbResult.filesCount;
            return [3 /*break*/, 14];
          case 4:
            return [4 /*yield*/, this.backupFiles(config, progress)];
          case 5:
            filesResult = _c.sent();
            results.size += filesResult.size;
            results.filesCount += filesResult.filesCount;
            return [3 /*break*/, 14];
          case 6:
            return [4 /*yield*/, this.backupLogs(config, progress)];
          case 7:
            logsResult = _c.sent();
            results.size += logsResult.size;
            results.filesCount += logsResult.filesCount;
            return [3 /*break*/, 14];
          case 8:
            return [4 /*yield*/, this.backupConfig(config, progress)];
          case 9:
            configResult = _c.sent();
            results.size += configResult.size;
            results.filesCount += configResult.filesCount;
            return [3 /*break*/, 14];
          case 10:
            return [4 /*yield*/, this.backupMedia(config, progress)];
          case 11:
            mediaResult = _c.sent();
            results.size += mediaResult.size;
            results.filesCount += mediaResult.filesCount;
            return [3 /*break*/, 14];
          case 12:
            return [4 /*yield*/, this.backupDocuments(config, progress)];
          case 13:
            docsResult = _c.sent();
            results.size += docsResult.size;
            results.filesCount += docsResult.filesCount;
            return [3 /*break*/, 14];
          case 14:
            _i++;
            return [3 /*break*/, 1];
          case 15:
            if (!config.compression.enabled) return [3 /*break*/, 17];
            return [4 /*yield*/, this.compressBackup(results.path, config.compression)];
          case 16:
            compressedResult = _c.sent();
            results.compressedSize = compressedResult.size;
            results.path = compressedResult.path;
            _c.label = 17;
          case 17:
            if (!config.encryption.enabled) return [3 /*break*/, 19];
            return [4 /*yield*/, this.encryptBackup(results.path, config.encryption)];
          case 18:
            encryptedResult = _c.sent();
            results.path = encryptedResult.path;
            _c.label = 19;
          case 19:
            return [2 /*return*/, results];
        }
      });
    });
  };
  // ============================================================================
  // MÉTODOS DE BACKUP POR TIPO
  // ============================================================================
  BackupManager.prototype.backupDatabase = function (config, progress) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementar backup do banco de dados
        // Usar pg_dump para PostgreSQL/Supabase
        return [2 /*return*/, { size: 0, filesCount: 0 }];
      });
    });
  };
  BackupManager.prototype.backupFiles = function (config, progress) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementar backup de arquivos
        return [2 /*return*/, { size: 0, filesCount: 0 }];
      });
    });
  };
  BackupManager.prototype.backupLogs = function (config, progress) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementar backup de logs
        return [2 /*return*/, { size: 0, filesCount: 0 }];
      });
    });
  };
  BackupManager.prototype.backupConfig = function (config, progress) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementar backup de configurações
        return [2 /*return*/, { size: 0, filesCount: 0 }];
      });
    });
  };
  BackupManager.prototype.backupMedia = function (config, progress) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementar backup de mídia
        return [2 /*return*/, { size: 0, filesCount: 0 }];
      });
    });
  };
  BackupManager.prototype.backupDocuments = function (config, progress) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementar backup de documentos
        return [2 /*return*/, { size: 0, filesCount: 0 }];
      });
    });
  };
  // ============================================================================
  // RECOVERY
  // ============================================================================
  /**
   * Solicitar recuperação
   */
  BackupManager.prototype.requestRecovery = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var recoveryRequest, _a, data, error, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            recoveryRequest = __assign(__assign({}, request), {
              id: crypto.randomUUID(),
              requestedAt: new Date(),
              status: "NOT_STARTED",
            });
            return [
              4 /*yield*/,
              this.supabase.from("recovery_requests").insert(recoveryRequest).select().single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "RECOVERY_REQUESTED",
                entityType: "RECOVERY",
                entityId: recoveryRequest.id,
                details: { backupId: request.backupId, type: request.type },
                userId: request.requestedBy,
              }),
            ];
          case 2:
            _b.sent();
            return [
              2 /*return*/,
              {
                success: true,
                data: data,
                message: "Solicitação de recuperação criada",
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 3:
            error_6 = _b.sent();
            return [2 /*return*/, this.handleError("Erro ao solicitar recuperação", error_6)];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // MONITORAMENTO
  // ============================================================================
  /**
   * Obter métricas de backup
   */
  BackupManager.prototype.getBackupMetrics = function (startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
      var metrics, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.monitoring.calculateMetrics(startDate, endDate)];
          case 1:
            metrics = _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                data: metrics,
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 2:
            error_7 = _a.sent();
            return [2 /*return*/, this.handleError("Erro ao obter métricas", error_7)];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Listar backups com filtros
   */
  BackupManager.prototype.listBackups = function (filter, options) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        _b,
        page,
        _c,
        limit,
        _d,
        sortBy,
        _e,
        sortOrder,
        offset,
        query,
        _f,
        data,
        error,
        count,
        totalPages,
        error_8;
      return __generator(this, function (_g) {
        switch (_g.label) {
          case 0:
            _g.trys.push([0, 2, , 3]);
            (_a = options || {}),
              (_b = _a.page),
              (page = _b === void 0 ? 1 : _b),
              (_c = _a.limit),
              (limit = _c === void 0 ? 20 : _c),
              (_d = _a.sortBy),
              (sortBy = _d === void 0 ? "startTime" : _d),
              (_e = _a.sortOrder),
              (sortOrder = _e === void 0 ? "DESC" : _e);
            offset = (page - 1) * limit;
            query = this.supabase.from("backup_records").select("*", { count: "exact" });
            // Aplicar filtros
            if (filter === null || filter === void 0 ? void 0 : filter.configId)
              query = query.eq("configId", filter.configId);
            if (filter === null || filter === void 0 ? void 0 : filter.type)
              query = query.eq("type", filter.type);
            if (filter === null || filter === void 0 ? void 0 : filter.status)
              query = query.eq("status", filter.status);
            if (filter === null || filter === void 0 ? void 0 : filter.startDate)
              query = query.gte("startTime", filter.startDate.toISOString());
            if (filter === null || filter === void 0 ? void 0 : filter.endDate)
              query = query.lte("startTime", filter.endDate.toISOString());
            if (filter === null || filter === void 0 ? void 0 : filter.minSize)
              query = query.gte("size", filter.minSize);
            if (filter === null || filter === void 0 ? void 0 : filter.maxSize)
              query = query.lte("size", filter.maxSize);
            return [
              4 /*yield*/,
              query
                .order(sortBy, { ascending: sortOrder === "ASC" })
                .range(offset, offset + limit - 1),
            ];
          case 1:
            (_f = _g.sent()), (data = _f.data), (error = _f.error), (count = _f.count);
            if (error) throw error;
            totalPages = Math.ceil((count || 0) / limit);
            return [
              2 /*return*/,
              {
                success: true,
                data: {
                  data: data,
                  total: count || 0,
                  page: page,
                  limit: limit,
                  totalPages: totalPages,
                  hasNext: page < totalPages,
                  hasPrev: page > 1,
                },
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 2:
            error_8 = _g.sent();
            return [2 /*return*/, this.handleError("Erro ao listar backups", error_8)];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================
  BackupManager.prototype.validateBackupConfig = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        if (!config.name || config.name.trim().length === 0) {
          throw new Error("Nome da configuração é obrigatório");
        }
        if (!config.dataTypes || config.dataTypes.length === 0) {
          throw new Error("Pelo menos um tipo de dados deve ser selecionado");
        }
        if (!config.schedule) {
          throw new Error("Agendamento é obrigatório");
        }
        if (!config.storage) {
          throw new Error("Configuração de storage é obrigatória");
        }
        return [2 /*return*/];
      });
    });
  };
  BackupManager.prototype.updateBackupStatus = function (backupId, status, error) {
    return __awaiter(this, void 0, void 0, function () {
      var updates;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            updates = {
              status: status,
              updatedAt: new Date(),
            };
            if (error) {
              updates.error = error;
            }
            if (
              status === types_1.BackupStatus.COMPLETED ||
              status === types_1.BackupStatus.FAILED
            ) {
              updates.endTime = new Date();
            }
            return [
              4 /*yield*/,
              this.supabase.from("backup_records").update(updates).eq("id", backupId),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  BackupManager.prototype.calculateChecksum = function (filePath) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementar cálculo de checksum
        return [2 /*return*/, "sha256-checksum"];
      });
    });
  };
  BackupManager.prototype.compressBackup = function (path, config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementar compressão
        return [2 /*return*/, { path: path + ".gz", size: 0 }];
      });
    });
  };
  BackupManager.prototype.encryptBackup = function (path, config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementar criptografia
        return [2 /*return*/, { path: path + ".enc" }];
      });
    });
  };
  BackupManager.prototype.applyRetentionPolicy = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var oldBackups, retention, now, cutoffDate, toDelete, _i, toDelete_1, backup;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("backup_records")
                .select("*")
                .eq("configId", config.id)
                .eq("status", types_1.BackupStatus.COMPLETED)
                .order("startTime", { ascending: true }),
            ];
          case 1:
            oldBackups = _a.sent().data;
            if (!oldBackups) return [2 /*return*/];
            retention = config.retention;
            now = new Date();
            cutoffDate = new Date(now.getTime() - retention.maxAge * 24 * 60 * 60 * 1000);
            toDelete = oldBackups.filter((backup) => new Date(backup.startTime) < cutoffDate);
            (_i = 0), (toDelete_1 = toDelete);
            _a.label = 2;
          case 2:
            if (!(_i < toDelete_1.length)) return [3 /*break*/, 5];
            backup = toDelete_1[_i];
            return [4 /*yield*/, this.deleteBackup(backup.id)];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  BackupManager.prototype.deleteBackup = function (backupId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Implementar exclusão de backup
            return [
              4 /*yield*/,
              this.supabase
                .from("backup_records")
                .update({ status: types_1.BackupStatus.EXPIRED })
                .eq("id", backupId),
            ];
          case 1:
            // Implementar exclusão de backup
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  BackupManager.prototype.handleError = (message, error) => {
    console.error(message, error);
    return {
      success: false,
      error: error.message || "Erro interno do servidor",
      message: message,
      timestamp: new Date(),
      requestId: crypto.randomUUID(),
    };
  };
  /**
   * Obter progresso de backup ativo
   */
  BackupManager.prototype.getBackupProgress = function (configId) {
    return this.activeBackups.get(configId) || null;
  };
  /**
   * Cancelar backup em execução
   */
  BackupManager.prototype.cancelBackup = function (configId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var progress, error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            progress = this.activeBackups.get(configId);
            if (!progress) {
              throw new Error("Nenhum backup ativo encontrado para esta configuração");
            }
            // Atualizar status para CANCELLED
            return [
              4 /*yield*/,
              this.updateBackupStatus(progress.backupId, types_1.BackupStatus.CANCELLED),
            ];
          case 1:
            // Atualizar status para CANCELLED
            _a.sent();
            // Remover da lista de ativos
            this.activeBackups.delete(configId);
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "BACKUP_CANCELLED",
                entityType: "BACKUP",
                entityId: progress.backupId,
                details: { configId: configId },
                userId: userId,
              }),
            ];
          case 2:
            _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                message: "Backup cancelado com sucesso",
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 3:
            error_9 = _a.sent();
            return [2 /*return*/, this.handleError("Erro ao cancelar backup", error_9)];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  return BackupManager;
})();
exports.BackupManager = BackupManager;
// Instância singleton
exports.backupManager = new BackupManager();
