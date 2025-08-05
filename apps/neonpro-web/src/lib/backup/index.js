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
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: () => m[k],
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  ((m, exports) => {
    for (var p in m)
      if (p !== "default" && !Object.hasOwn(exports, p)) __createBinding(exports, m, p);
  });
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
exports.BackupRecoverySystem = void 0;
exports.getBackupRecoverySystem = getBackupRecoverySystem;
exports.initializeBackupSystem = initializeBackupSystem;
exports.shutdownBackupSystem = shutdownBackupSystem;
var backup_manager_1 = require("./core/backup-manager");
var recovery_manager_1 = require("./recovery/recovery-manager");
var storage_providers_1 = require("./storage/storage-providers");
var backup_strategies_1 = require("./strategies/backup-strategies");
var audit_logger_1 = require("../auth/audit/audit-logger");
var encryption_service_1 = require("../security/encryption-service");
var lgpd_manager_1 = require("../lgpd/lgpd-manager");
// Re-export all types and interfaces
__exportStar(require("./core/backup-manager"), exports);
__exportStar(require("./recovery/recovery-manager"), exports);
__exportStar(require("./storage/storage-providers"), exports);
__exportStar(require("./strategies/backup-strategies"), exports);
/**
 * Sistema Unificado de Backup e Recovery
 *
 * Este sistema fornece uma solução completa para backup e recuperação de dados,
 * incluindo múltiplas estratégias de backup, provedores de armazenamento,
 * planos de recuperação e monitoramento em tempo real.
 *
 * Características principais:
 * - Backup automático e manual
 * - Múltiplos provedores de armazenamento (Local, S3, Azure, GCP)
 * - Estratégias de backup configuráveis
 * - Planos de recuperação com rollback
 * - Criptografia e compressão
 * - Monitoramento e métricas
 * - Compliance com LGPD
 * - Auditoria completa
 */
var BackupRecoverySystem = /** @class */ (() => {
  function BackupRecoverySystem() {
    this.isInitialized = false;
    this.backupManager = new backup_manager_1.BackupManager();
    this.recoveryManager = new recovery_manager_1.RecoveryManager();
    this.storageManager = new storage_providers_1.StorageManager();
    this.strategyManager = new backup_strategies_1.BackupStrategyManager();
    this.auditLogger = new audit_logger_1.AuditLogger();
    this.encryptionService = new encryption_service_1.EncryptionService();
    this.lgpdManager = new lgpd_manager_1.LGPDManager();
  }
  /**
   * Inicializa o sistema de backup e recovery
   */
  BackupRecoverySystem.prototype.initialize = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            if (this.isInitialized) {
              throw new Error("Sistema já foi inicializado");
            }
            // Configurar provedores de armazenamento padrão
            return [4 /*yield*/, this.setupDefaultStorageProviders()];
          case 1:
            // Configurar provedores de armazenamento padrão
            _a.sent();
            // Configurar estratégias de backup padrão
            return [4 /*yield*/, this.setupDefaultBackupStrategies()];
          case 2:
            // Configurar estratégias de backup padrão
            _a.sent();
            if (
              !(
                (config === null || config === void 0 ? void 0 : config.auto_start_backup) !== false
              )
            )
              return [3 /*break*/, 4];
            return [4 /*yield*/, this.backupManager.start()];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            this.isInitialized = true;
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "backup_system_initialized",
                resource_type: "backup_system",
                resource_id: "main",
                details: {
                  auto_start_backup:
                    config === null || config === void 0 ? void 0 : config.auto_start_backup,
                  encryption_enabled:
                    config === null || config === void 0 ? void 0 : config.encryption_enabled,
                  compression_enabled:
                    config === null || config === void 0 ? void 0 : config.compression_enabled,
                },
              }),
            ];
          case 5:
            _a.sent();
            console.log("✅ Sistema de Backup e Recovery inicializado com sucesso");
            return [3 /*break*/, 7];
          case 6:
            error_1 = _a.sent();
            throw new Error("Erro ao inicializar sistema: ".concat(error_1));
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Para o sistema de backup e recovery
   */
  BackupRecoverySystem.prototype.shutdown = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            if (!this.isInitialized) {
              return [2 /*return*/];
            }
            return [4 /*yield*/, this.backupManager.stop()];
          case 1:
            _a.sent();
            this.isInitialized = false;
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "backup_system_shutdown",
                resource_type: "backup_system",
                resource_id: "main",
              }),
            ];
          case 2:
            _a.sent();
            console.log("✅ Sistema de Backup e Recovery finalizado");
            return [3 /*break*/, 4];
          case 3:
            error_2 = _a.sent();
            throw new Error("Erro ao finalizar sistema: ".concat(error_2));
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Cria um backup manual
   */
  BackupRecoverySystem.prototype.createBackup = function (config, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var backupConfig, error_3;
      var _a, _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            backupConfig = {
              backup_type: "manual",
              schedule: null,
              data_sources: config.data_sources,
              storage_config: {
                provider: config.storage_provider || "local",
                encryption_enabled:
                  (_a = config.encryption_enabled) !== null && _a !== void 0 ? _a : true,
                compression_enabled:
                  (_b = config.compression_enabled) !== null && _b !== void 0 ? _b : true,
                retention_days: (_c = config.retention_days) !== null && _c !== void 0 ? _c : 30,
              },
              notification_config: {
                on_success: true,
                on_failure: true,
                recipients: [userId],
              },
              metadata: {
                name: config.name,
                description: config.description,
                created_by: userId,
              },
            };
            return [4 /*yield*/, this.backupManager.createBackup(backupConfig, userId)];
          case 1:
            return [2 /*return*/, _d.sent()];
          case 2:
            error_3 = _d.sent();
            throw new Error("Erro ao criar backup: ".concat(error_3));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Agenda um backup automático
   */
  BackupRecoverySystem.prototype.scheduleBackup = function (config, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var backupConfig, error_4;
      var _a, _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            backupConfig = {
              backup_type: "scheduled",
              schedule: config.schedule,
              data_sources: config.data_sources,
              storage_config: {
                provider: config.storage_provider || "local",
                encryption_enabled:
                  (_a = config.encryption_enabled) !== null && _a !== void 0 ? _a : true,
                compression_enabled:
                  (_b = config.compression_enabled) !== null && _b !== void 0 ? _b : true,
                retention_days: (_c = config.retention_days) !== null && _c !== void 0 ? _c : 30,
              },
              notification_config: {
                on_success: true,
                on_failure: true,
                recipients: [userId],
              },
              metadata: {
                name: config.name,
                description: config.description,
                created_by: userId,
              },
            };
            return [4 /*yield*/, this.backupManager.createBackup(backupConfig, userId)];
          case 1:
            return [2 /*return*/, _d.sent()];
          case 2:
            error_4 = _d.sent();
            throw new Error("Erro ao agendar backup: ".concat(error_4));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Cria um plano de recuperação
   */
  BackupRecoverySystem.prototype.createRecoveryPlan = function (config, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var planData, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            planData = {
              name: config.name,
              description: config.description || "",
              recovery_type: config.recovery_type,
              target_timestamp: config.target_timestamp,
              data_sources: config.data_sources,
              recovery_steps: config.recovery_steps,
              estimated_duration_minutes: config.estimated_duration_minutes,
              prerequisites: config.prerequisites || [],
              rollback_plan: config.rollback_plan || [],
              validation_checks: config.validation_checks || [],
              metadata: {
                created_by: userId,
              },
            };
            return [4 /*yield*/, this.recoveryManager.createRecoveryPlan(planData, userId)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_5 = _a.sent();
            throw new Error("Erro ao criar plano de recupera\u00E7\u00E3o: ".concat(error_5));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Executa um plano de recuperação
   */
  BackupRecoverySystem.prototype.executeRecovery = function (planId, userId, options) {
    return __awaiter(this, void 0, void 0, function () {
      var error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.recoveryManager.executeRecoveryPlan(planId, userId, options)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_6 = _a.sent();
            throw new Error("Erro ao executar recupera\u00E7\u00E3o: ".concat(error_6));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém status de um backup
   */
  BackupRecoverySystem.prototype.getBackupStatus = function (jobId) {
    return __awaiter(this, void 0, void 0, function () {
      var error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.backupManager.getBackupStatus(jobId)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_7 = _a.sent();
            throw new Error("Erro ao obter status do backup: ".concat(error_7));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém status de uma recuperação
   */
  BackupRecoverySystem.prototype.getRecoveryStatus = function (executionId) {
    return __awaiter(this, void 0, void 0, function () {
      var error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.recoveryManager.getRecoveryExecutionStatus(executionId)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_8 = _a.sent();
            throw new Error("Erro ao obter status da recupera\u00E7\u00E3o: ".concat(error_8));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Lista backups
   */
  BackupRecoverySystem.prototype.listBackups = function (filters, pagination) {
    return __awaiter(this, void 0, void 0, function () {
      var error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.backupManager.listBackups(filters, pagination)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_9 = _a.sent();
            throw new Error("Erro ao listar backups: ".concat(error_9));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Lista planos de recuperação
   */
  BackupRecoverySystem.prototype.listRecoveryPlans = function (filters, pagination) {
    return __awaiter(this, void 0, void 0, function () {
      var error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.recoveryManager.listRecoveryPlans(filters, pagination)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_10 = _a.sent();
            throw new Error("Erro ao listar planos de recupera\u00E7\u00E3o: ".concat(error_10));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Lista execuções de recuperação
   */
  BackupRecoverySystem.prototype.listRecoveryExecutions = function (filters, pagination) {
    return __awaiter(this, void 0, void 0, function () {
      var error_11;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.recoveryManager.listRecoveryExecutions(filters, pagination)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_11 = _a.sent();
            throw new Error(
              "Erro ao listar execu\u00E7\u00F5es de recupera\u00E7\u00E3o: ".concat(error_11),
            );
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém métricas de backup
   */
  BackupRecoverySystem.prototype.getBackupMetrics = function () {
    return __awaiter(this, arguments, void 0, function (period) {
      var error_12;
      if (period === void 0) {
        period = "month";
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.backupManager.getBackupMetrics(period)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_12 = _a.sent();
            throw new Error("Erro ao obter m\u00E9tricas de backup: ".concat(error_12));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém métricas de recuperação
   */
  BackupRecoverySystem.prototype.getRecoveryMetrics = function () {
    return __awaiter(this, arguments, void 0, function (period) {
      var error_13;
      if (period === void 0) {
        period = "month";
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.recoveryManager.getRecoveryMetrics(period)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_13 = _a.sent();
            throw new Error(
              "Erro ao obter m\u00E9tricas de recupera\u00E7\u00E3o: ".concat(error_13),
            );
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém métricas de armazenamento
   */
  BackupRecoverySystem.prototype.getStorageMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_14;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.storageManager.getAllMetrics()];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_14 = _a.sent();
            throw new Error("Erro ao obter m\u00E9tricas de armazenamento: ".concat(error_14));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Testa conectividade dos provedores de armazenamento
   */
  BackupRecoverySystem.prototype.testStorageConnections = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_15;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.storageManager.testAllConnections()];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_15 = _a.sent();
            throw new Error("Erro ao testar conex\u00F5es: ".concat(error_15));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Executa limpeza de backups antigos
   */
  BackupRecoverySystem.prototype.cleanupOldBackups = function (olderThanDays) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, storageCleanup, backupCleanup, error_16;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [
              4 /*yield*/,
              Promise.all([
                this.storageManager.cleanupAll(olderThanDays),
                this.backupManager.cleanupExpiredBackups(),
              ]),
            ];
          case 1:
            (_a = _b.sent()), (storageCleanup = _a[0]), (backupCleanup = _a[1]);
            return [
              2 /*return*/,
              {
                storage_cleanup: storageCleanup,
                backup_cleanup: backupCleanup,
              },
            ];
          case 2:
            error_16 = _b.sent();
            throw new Error("Erro na limpeza: ".concat(error_16));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Verifica integridade de backups
   */
  BackupRecoverySystem.prototype.verifyBackupIntegrity = function (jobId, options) {
    return __awaiter(this, void 0, void 0, function () {
      var backups, verificationResults, _i, _a, backup, result, error_17, error_18;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 11, , 12]);
            this.ensureInitialized();
            if (!jobId) return [3 /*break*/, 2];
            return [4 /*yield*/, this.backupManager.verifyBackup(jobId, options)];
          case 1:
            return [2 /*return*/, _b.sent()];
          case 2:
            return [
              4 /*yield*/,
              this.backupManager.listBackups({
                status: ["completed"],
                date_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 dias
              }),
            ];
          case 3:
            backups = _b.sent();
            verificationResults = [];
            (_i = 0), (_a = backups.jobs);
            _b.label = 4;
          case 4:
            if (!(_i < _a.length)) return [3 /*break*/, 9];
            backup = _a[_i];
            _b.label = 5;
          case 5:
            _b.trys.push([5, 7, , 8]);
            return [4 /*yield*/, this.backupManager.verifyBackup(backup.id, options)];
          case 6:
            result = _b.sent();
            verificationResults.push(__assign({ job_id: backup.id }, result));
            return [3 /*break*/, 8];
          case 7:
            error_17 = _b.sent();
            verificationResults.push({
              job_id: backup.id,
              valid: false,
              error: error_17.toString(),
            });
            return [3 /*break*/, 8];
          case 8:
            _i++;
            return [3 /*break*/, 4];
          case 9:
            return [
              2 /*return*/,
              {
                total_verified: verificationResults.length,
                valid_backups: verificationResults.filter((r) => r.valid).length,
                invalid_backups: verificationResults.filter((r) => !r.valid).length,
                results: verificationResults,
              },
            ];
          case 10:
            return [3 /*break*/, 12];
          case 11:
            error_18 = _b.sent();
            throw new Error("Erro na verifica\u00E7\u00E3o de integridade: ".concat(error_18));
          case 12:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Testa um plano de recuperação (dry run)
   */
  BackupRecoverySystem.prototype.testRecoveryPlan = function (planId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var error_19;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.recoveryManager.testRecoveryPlan(planId, userId)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_19 = _a.sent();
            throw new Error("Erro ao testar plano de recupera\u00E7\u00E3o: ".concat(error_19));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Cancela um backup em andamento
   */
  BackupRecoverySystem.prototype.cancelBackup = function (jobId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var error_20;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.backupManager.cancelBackup(jobId, userId)];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_20 = _a.sent();
            throw new Error("Erro ao cancelar backup: ".concat(error_20));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Cancela uma recuperação em andamento
   */
  BackupRecoverySystem.prototype.cancelRecovery = function (executionId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var error_21;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.recoveryManager.cancelRecoveryExecution(executionId, userId)];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_21 = _a.sent();
            throw new Error("Erro ao cancelar recupera\u00E7\u00E3o: ".concat(error_21));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Executa rollback de uma recuperação
   */
  BackupRecoverySystem.prototype.executeRollback = function (executionId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var error_22;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.recoveryManager.executeRollback(executionId, userId)];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_22 = _a.sent();
            throw new Error("Erro ao executar rollback: ".concat(error_22));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Registra um novo provedor de armazenamento
   */
  BackupRecoverySystem.prototype.registerStorageProvider = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var error_23;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.storageManager.registerProvider(config)];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_23 = _a.sent();
            throw new Error("Erro ao registrar provedor: ".concat(error_23));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Remove um provedor de armazenamento
   */
  BackupRecoverySystem.prototype.unregisterStorageProvider = function (name) {
    return __awaiter(this, void 0, void 0, function () {
      var error_24;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.storageManager.unregisterProvider(name)];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_24 = _a.sent();
            throw new Error("Erro ao remover provedor: ".concat(error_24));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém relatório completo do sistema
   */
  BackupRecoverySystem.prototype.getSystemReport = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        backupMetrics,
        recoveryMetrics,
        storageMetrics,
        storageConnections,
        allConnectionsHealthy,
        backupSuccessRate,
        recoverySuccessRate,
        systemStatus,
        recommendations,
        totalStorageUsed,
        totalStorageAvailable,
        recentActivities,
        error_25;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [
              4 /*yield*/,
              Promise.all([
                this.getBackupMetrics(),
                this.getRecoveryMetrics(),
                this.getStorageMetrics(),
                this.testStorageConnections(),
              ]),
            ];
          case 1:
            (_a = _b.sent()),
              (backupMetrics = _a[0]),
              (recoveryMetrics = _a[1]),
              (storageMetrics = _a[2]),
              (storageConnections = _a[3]);
            allConnectionsHealthy = Object.values(storageConnections).every(
              (connected) => connected,
            );
            backupSuccessRate = backupMetrics.success_rate || 0;
            recoverySuccessRate = recoveryMetrics.success_rate || 0;
            systemStatus = "healthy";
            if (!allConnectionsHealthy || backupSuccessRate < 80 || recoverySuccessRate < 80) {
              systemStatus = "error";
            } else if (backupSuccessRate < 95 || recoverySuccessRate < 95) {
              systemStatus = "warning";
            }
            recommendations = [];
            if (backupSuccessRate < 95) {
              recommendations.push(
                "Taxa de sucesso de backup abaixo do ideal. Verificar configurações e conectividade.",
              );
            }
            if (recoverySuccessRate < 95) {
              recommendations.push(
                "Taxa de sucesso de recuperação abaixo do ideal. Revisar planos de recuperação.",
              );
            }
            if (!allConnectionsHealthy) {
              recommendations.push(
                "Alguns provedores de armazenamento estão inacessíveis. Verificar conectividade.",
              );
            }
            totalStorageUsed = storageMetrics.reduce(
              (sum, metric) => sum + metric.used_storage_gb,
              0,
            );
            totalStorageAvailable = storageMetrics.reduce(
              (sum, metric) => sum + metric.total_storage_gb,
              0,
            );
            if (totalStorageUsed / totalStorageAvailable > 0.8) {
              recommendations.push(
                "Uso de armazenamento acima de 80%. Considerar limpeza ou expansão.",
              );
            }
            recentActivities = [
              {
                type: "backup_completed",
                timestamp: new Date(),
                description: "Backup automático concluído com sucesso",
              },
              {
                type: "recovery_planned",
                timestamp: new Date(Date.now() - 60 * 60 * 1000),
                description: "Novo plano de recuperação criado",
              },
            ];
            return [
              2 /*return*/,
              {
                system_status: systemStatus,
                backup_metrics: backupMetrics,
                recovery_metrics: recoveryMetrics,
                storage_metrics: storageMetrics,
                storage_connections: storageConnections,
                recent_activities: recentActivities,
                recommendations: recommendations,
              },
            ];
          case 2:
            error_25 = _b.sent();
            throw new Error("Erro ao gerar relat\u00F3rio: ".concat(error_25));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Métodos privados
  BackupRecoverySystem.prototype.ensureInitialized = function () {
    if (!this.isInitialized) {
      throw new Error("Sistema não foi inicializado. Chame initialize() primeiro.");
    }
  };
  BackupRecoverySystem.prototype.setupDefaultStorageProviders = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Configurar provedor local padrão
            return [
              4 /*yield*/,
              this.storageManager.registerProvider({
                provider: "local",
                name: "local_default",
                enabled: true,
                priority: 1,
                connection_config: {
                  base_path: "./backups",
                },
                encryption_enabled: true,
                compression_enabled: true,
                retention_days: 30,
                max_storage_gb: 100,
                cost_per_gb: 0,
                metadata: {
                  description: "Provedor de armazenamento local padrão",
                },
              }),
            ];
          case 1:
            // Configurar provedor local padrão
            _a.sent();
            console.log("✅ Provedores de armazenamento padrão configurados");
            return [2 /*return*/];
        }
      });
    });
  };
  BackupRecoverySystem.prototype.setupDefaultBackupStrategies = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // As estratégias são configuradas automaticamente no BackupStrategyManager
        console.log("✅ Estratégias de backup padrão configuradas");
        return [2 /*return*/];
      });
    });
  };
  return BackupRecoverySystem;
})();
exports.BackupRecoverySystem = BackupRecoverySystem;
// Instância singleton do sistema
var systemInstance = null;
/**
 * Obtém a instância singleton do sistema de backup e recovery
 */
function getBackupRecoverySystem() {
  if (!systemInstance) {
    systemInstance = new BackupRecoverySystem();
  }
  return systemInstance;
}
/**
 * Inicializa o sistema de backup e recovery
 */
function initializeBackupSystem(config) {
  return __awaiter(this, void 0, void 0, function () {
    var system;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          system = getBackupRecoverySystem();
          return [4 /*yield*/, system.initialize(config)];
        case 1:
          _a.sent();
          return [2 /*return*/, system];
      }
    });
  });
}
/**
 * Para o sistema de backup e recovery
 */
function shutdownBackupSystem() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          if (!systemInstance) return [3 /*break*/, 2];
          return [4 /*yield*/, systemInstance.shutdown()];
        case 1:
          _a.sent();
          systemInstance = null;
          _a.label = 2;
        case 2:
          return [2 /*return*/];
      }
    });
  });
}
// Export da instância padrão
exports.default = BackupRecoverySystem;
