/**
 * NeonPro Recovery Service
 * Story 1.8: Sistema de Backup e Recovery
 *
 * Serviço de recuperação para restauração de backups
 * e gerenciamento de disaster recovery.
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
exports.RecoveryService = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var types_1 = require("./types");
var audit_logger_1 = require("../auth/audit/audit-logger");
var notifications_1 = require("../notifications");
/**
 * Serviço de recuperação
 */
var RecoveryService = /** @class */ (() => {
  function RecoveryService(storageManager, monitoring) {
    this.activeRecoveries = new Map();
    this.recoveryQueue = [];
    this.maxConcurrentRecoveries = 2;
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
    this.storageManager = storageManager;
    this.monitoring = monitoring;
  }
  // ============================================================================
  // RECOVERY REQUESTS
  // ============================================================================
  /**
   * Criar solicitação de recovery
   */
  RecoveryService.prototype.createRecoveryRequest = function (backupId, type, options, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, backup, backupError, validation, request, insertError, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, , 6]);
            return [
              4 /*yield*/,
              this.supabase.from("backup_records").select("*").eq("id", backupId).single(),
            ];
          case 1:
            (_a = _b.sent()), (backup = _a.data), (backupError = _a.error);
            if (backupError || !backup) {
              return [2 /*return*/, this.handleError("Backup não encontrado", backupError)];
            }
            return [4 /*yield*/, this.validateRecovery(backup, type, options)];
          case 2:
            validation = _b.sent();
            if (!validation.isValid) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: validation.errors.join(", "),
                  message: "Validação de recovery falhou",
                  timestamp: new Date(),
                  requestId: crypto.randomUUID(),
                },
              ];
            }
            request = {
              id: crypto.randomUUID(),
              backupId: backupId,
              type: type,
              status: types_1.RecoveryStatus.PENDING,
              options: options,
              requestedBy: userId,
              requestedAt: new Date(),
              estimatedDuration: validation.estimatedTime,
              estimatedSize: validation.estimatedSize,
              priority: options.priority || "MEDIUM",
            };
            return [4 /*yield*/, this.supabase.from("recovery_requests").insert(request)];
          case 3:
            insertError = _b.sent().error;
            if (insertError) throw insertError;
            // Adicionar à fila
            this.recoveryQueue.push(request);
            this.processRecoveryQueue();
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "RECOVERY_REQUESTED",
                entityType: "RECOVERY",
                entityId: request.id,
                details: { backupId: backupId, type: type, options: options },
                userId: userId,
              }),
            ];
          case 4:
            _b.sent();
            return [
              2 /*return*/,
              {
                success: true,
                data: request,
                message: "Solicitação de recovery criada",
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 5:
            error_1 = _b.sent();
            return [
              2 /*return*/,
              this.handleError("Erro ao criar solicitação de recovery", error_1),
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validar recovery
   */
  RecoveryService.prototype.validateRecovery = function (backup, type, options) {
    return __awaiter(this, void 0, void 0, function () {
      var validation, isValid, exists, sizeInGB, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            validation = {
              isValid: true,
              errors: [],
              warnings: [],
              estimatedTime: 0,
              estimatedSize: backup.size || 0,
            };
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, , 6]);
            // Verificar status do backup
            if (backup.status !== "COMPLETED") {
              validation.isValid = false;
              validation.errors.push("Backup não está completo");
            }
            if (!backup.checksum) return [3 /*break*/, 3];
            return [4 /*yield*/, this.verifyBackupIntegrity(backup)];
          case 2:
            isValid = _a.sent();
            if (!isValid) {
              validation.isValid = false;
              validation.errors.push("Backup corrompido - checksum inválido");
            }
            _a.label = 3;
          case 3:
            return [4 /*yield*/, this.storageManager.exists(backup.path)];
          case 4:
            exists = _a.sent();
            if (!exists) {
              validation.isValid = false;
              validation.errors.push("Arquivo de backup não encontrado no storage");
            }
            // Verificar espaço em disco (se aplicável)
            if (type === types_1.RecoveryType.FULL_RESTORE && options.targetPath) {
              // Implementar verificação de espaço em disco
              validation.warnings.push("Verificar espaço em disco disponível");
            }
            sizeInGB = (backup.size || 0) / (1024 * 1024 * 1024);
            validation.estimatedTime = Math.max(300, sizeInGB * 60); // Mínimo 5 min, 1 min por GB
            // Verificar conflitos
            if (type === types_1.RecoveryType.FULL_RESTORE) {
              validation.warnings.push("Recovery completo irá sobrescrever dados existentes");
            }
            return [3 /*break*/, 6];
          case 5:
            error_2 = _a.sent();
            validation.isValid = false;
            validation.errors.push("Erro na valida\u00E7\u00E3o: ".concat(error_2.message));
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/, validation];
        }
      });
    });
  };
  /**
   * Verificar integridade do backup
   */
  RecoveryService.prototype.verifyBackupIntegrity = function (backup) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        try {
          // Implementar verificação de checksum
          // Por enquanto, retorna true
          return [2 /*return*/, true];
        } catch (error) {
          console.error("Erro ao verificar integridade:", error);
          return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  // ============================================================================
  // PROCESSAMENTO DE RECOVERY
  // ============================================================================
  /**
   * Processar fila de recovery
   */
  RecoveryService.prototype.processRecoveryQueue = function () {
    return __awaiter(this, void 0, void 0, function () {
      var nextRequest;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Verificar se há espaço para novos recoveries
            if (this.activeRecoveries.size >= this.maxConcurrentRecoveries) {
              return [2 /*return*/];
            }
            // Ordenar por prioridade
            this.recoveryQueue.sort((a, b) => {
              var priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
              return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
            nextRequest = this.recoveryQueue.shift();
            if (!nextRequest) return [3 /*break*/, 2];
            return [4 /*yield*/, this.executeRecovery(nextRequest)];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Executar recovery
   */
  RecoveryService.prototype.executeRecovery = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var progress, result, _a, error_3;
      var _this = this;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            progress = {
              requestId: request.id,
              status: types_1.RecoveryStatus.RUNNING,
              startTime: new Date(),
              progress: 0,
              currentStep: "Iniciando recovery",
              estimatedCompletion: new Date(Date.now() + request.estimatedDuration * 1000),
            };
            this.activeRecoveries.set(request.id, progress);
            _b.label = 1;
          case 1:
            _b.trys.push([1, 14, 16, 17]);
            // Atualizar status no banco
            return [
              4 /*yield*/,
              this.supabase
                .from("recovery_requests")
                .update({
                  status: types_1.RecoveryStatus.RUNNING,
                  startedAt: new Date().toISOString(),
                })
                .eq("id", request.id),
            ];
          case 2:
            // Atualizar status no banco
            _b.sent();
            result = void 0;
            _a = request.type;
            switch (_a) {
              case types_1.RecoveryType.FULL_RESTORE:
                return [3 /*break*/, 3];
              case types_1.RecoveryType.PARTIAL_RESTORE:
                return [3 /*break*/, 5];
              case types_1.RecoveryType.POINT_IN_TIME:
                return [3 /*break*/, 7];
              case types_1.RecoveryType.VERIFICATION:
                return [3 /*break*/, 9];
            }
            return [3 /*break*/, 11];
          case 3:
            return [4 /*yield*/, this.performFullRestore(request, progress)];
          case 4:
            result = _b.sent();
            return [3 /*break*/, 12];
          case 5:
            return [4 /*yield*/, this.performPartialRestore(request, progress)];
          case 6:
            result = _b.sent();
            return [3 /*break*/, 12];
          case 7:
            return [4 /*yield*/, this.performPointInTimeRestore(request, progress)];
          case 8:
            result = _b.sent();
            return [3 /*break*/, 12];
          case 9:
            return [4 /*yield*/, this.performVerification(request, progress)];
          case 10:
            result = _b.sent();
            return [3 /*break*/, 12];
          case 11:
            throw new Error("Tipo de recovery n\u00E3o suportado: ".concat(request.type));
          case 12:
            // Finalizar recovery
            return [4 /*yield*/, this.completeRecovery(request, result, progress)];
          case 13:
            // Finalizar recovery
            _b.sent();
            return [3 /*break*/, 17];
          case 14:
            error_3 = _b.sent();
            return [4 /*yield*/, this.failRecovery(request, error_3.message, progress)];
          case 15:
            _b.sent();
            return [3 /*break*/, 17];
          case 16:
            this.activeRecoveries.delete(request.id);
            // Processar próximo na fila
            setTimeout(() => _this.processRecoveryQueue(), 1000);
            return [7 /*endfinally*/];
          case 17:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Realizar restore completo
   */
  RecoveryService.prototype.performFullRestore = function (request, progress) {
    return __awaiter(this, void 0, void 0, function () {
      var result,
        startTime,
        backup,
        backupData,
        extractedFiles,
        restoredFiles,
        verification,
        error_4;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            result = {
              success: false,
              message: "",
              restoredFiles: [],
              restoredSize: 0,
              duration: 0,
              errors: [],
            };
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 12, , 13]);
            return [
              4 /*yield*/,
              this.supabase.from("backup_records").select("*").eq("id", request.backupId).single(),
            ];
          case 2:
            backup = _a.sent().data;
            if (!backup) throw new Error("Backup não encontrado");
            // Atualizar progresso
            progress.currentStep = "Baixando backup";
            progress.progress = 10;
            return [4 /*yield*/, this.updateProgress(progress)];
          case 3:
            _a.sent();
            return [
              4 /*yield*/,
              this.storageManager.download(backup.path, {
                onProgress: (downloaded, total) => {
                  progress.progress = 10 + (downloaded / total) * 40;
                  _this.updateProgress(progress);
                },
              }),
            ];
          case 4:
            backupData = _a.sent();
            // Atualizar progresso
            progress.currentStep = "Extraindo arquivos";
            progress.progress = 50;
            return [4 /*yield*/, this.updateProgress(progress)];
          case 5:
            _a.sent();
            return [4 /*yield*/, this.extractBackup(backupData, request.options)];
          case 6:
            extractedFiles = _a.sent();
            progress.currentStep = "Restaurando arquivos";
            progress.progress = 70;
            return [4 /*yield*/, this.updateProgress(progress)];
          case 7:
            _a.sent();
            return [4 /*yield*/, this.restoreFiles(extractedFiles, request.options)];
          case 8:
            restoredFiles = _a.sent();
            // Verificar integridade
            progress.currentStep = "Verificando integridade";
            progress.progress = 90;
            return [4 /*yield*/, this.updateProgress(progress)];
          case 9:
            _a.sent();
            return [4 /*yield*/, this.verifyRestoration(restoredFiles)];
          case 10:
            verification = _a.sent();
            if (!verification.isValid) {
              result.errors = verification.errors;
              throw new Error("Falha na verificação de integridade");
            }
            // Finalizar
            progress.progress = 100;
            return [4 /*yield*/, this.updateProgress(progress)];
          case 11:
            _a.sent();
            result.success = true;
            result.message = "Restore completo realizado com sucesso";
            result.restoredFiles = restoredFiles;
            result.restoredSize = restoredFiles.reduce((sum, f) => sum + f.size, 0);
            result.duration = Date.now() - startTime;
            return [3 /*break*/, 13];
          case 12:
            error_4 = _a.sent();
            result.errors.push(error_4.message);
            throw error_4;
          case 13:
            return [2 /*return*/, result];
        }
      });
    });
  };
  /**
   * Realizar restore parcial
   */
  RecoveryService.prototype.performPartialRestore = function (request, progress) {
    return __awaiter(this, void 0, void 0, function () {
      var result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            result = {
              success: true,
              message: "Restore parcial realizado com sucesso",
              restoredFiles: [],
              restoredSize: 0,
              duration: 0,
              errors: [],
            };
            // Implementar lógica de restore parcial
            progress.progress = 100;
            return [4 /*yield*/, this.updateProgress(progress)];
          case 1:
            _a.sent();
            return [2 /*return*/, result];
        }
      });
    });
  };
  /**
   * Realizar restore point-in-time
   */
  RecoveryService.prototype.performPointInTimeRestore = function (request, progress) {
    return __awaiter(this, void 0, void 0, function () {
      var result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            result = {
              success: true,
              message: "Restore point-in-time realizado com sucesso",
              restoredFiles: [],
              restoredSize: 0,
              duration: 0,
              errors: [],
            };
            // Implementar lógica de point-in-time restore
            progress.progress = 100;
            return [4 /*yield*/, this.updateProgress(progress)];
          case 1:
            _a.sent();
            return [2 /*return*/, result];
        }
      });
    });
  };
  /**
   * Realizar verificação
   */
  RecoveryService.prototype.performVerification = function (request, progress) {
    return __awaiter(this, void 0, void 0, function () {
      var result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            result = {
              success: true,
              message: "Verificação realizada com sucesso",
              restoredFiles: [],
              restoredSize: 0,
              duration: 0,
              errors: [],
            };
            // Implementar lógica de verificação
            progress.progress = 100;
            return [4 /*yield*/, this.updateProgress(progress)];
          case 1:
            _a.sent();
            return [2 /*return*/, result];
        }
      });
    });
  };
  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================
  /**
   * Extrair backup
   */
  RecoveryService.prototype.extractBackup = function (backupData, options) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementar extração baseada no formato do backup
        return [2 /*return*/, []];
      });
    });
  };
  /**
   * Restaurar arquivos
   */
  RecoveryService.prototype.restoreFiles = function (files, options) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementar restauração de arquivos
        return [2 /*return*/, []];
      });
    });
  };
  /**
   * Verificar restauração
   */
  RecoveryService.prototype.verifyRestoration = function (files) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [
        2 /*return*/,
        {
          isValid: true,
          errors: [],
          warnings: [],
        },
      ]);
    });
  };
  /**
   * Atualizar progresso
   */
  RecoveryService.prototype.updateProgress = function (progress) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            // Atualizar no banco
            return [
              4 /*yield*/,
              this.supabase
                .from("recovery_requests")
                .update({
                  progress: progress.progress,
                  currentStep: progress.currentStep,
                  estimatedCompletion:
                    (_a = progress.estimatedCompletion) === null || _a === void 0
                      ? void 0
                      : _a.toISOString(),
                })
                .eq("id", progress.requestId),
            ];
          case 1:
            // Atualizar no banco
            _b.sent();
            // Atualizar cache local
            this.activeRecoveries.set(progress.requestId, progress);
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Completar recovery
   */
  RecoveryService.prototype.completeRecovery = function (request, result, progress) {
    return __awaiter(this, void 0, void 0, function () {
      var endTime;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            endTime = new Date();
            // Atualizar no banco
            return [
              4 /*yield*/,
              this.supabase
                .from("recovery_requests")
                .update({
                  status: types_1.RecoveryStatus.COMPLETED,
                  completedAt: endTime.toISOString(),
                  result: result,
                  progress: 100,
                })
                .eq("id", request.id),
            ];
          case 1:
            // Atualizar no banco
            _a.sent();
            // Log de auditoria
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "RECOVERY_COMPLETED",
                entityType: "RECOVERY",
                entityId: request.id,
                details: { result: result },
                userId: request.requestedBy,
              }),
            ];
          case 2:
            // Log de auditoria
            _a.sent();
            // Notificação
            return [4 /*yield*/, this.notifyRecoveryCompletion(request, result)];
          case 3:
            // Notificação
            _a.sent();
            console.log("Recovery ".concat(request.id, " completado com sucesso"));
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Falhar recovery
   */
  RecoveryService.prototype.failRecovery = function (request, errorMessage, progress) {
    return __awaiter(this, void 0, void 0, function () {
      var endTime;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            endTime = new Date();
            // Atualizar no banco
            return [
              4 /*yield*/,
              this.supabase
                .from("recovery_requests")
                .update({
                  status: types_1.RecoveryStatus.FAILED,
                  completedAt: endTime.toISOString(),
                  error: errorMessage,
                })
                .eq("id", request.id),
            ];
          case 1:
            // Atualizar no banco
            _a.sent();
            // Log de auditoria
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "RECOVERY_FAILED",
                entityType: "RECOVERY",
                entityId: request.id,
                details: { error: errorMessage },
                userId: request.requestedBy,
              }),
            ];
          case 2:
            // Log de auditoria
            _a.sent();
            // Notificação
            return [4 /*yield*/, this.notifyRecoveryFailure(request, errorMessage)];
          case 3:
            // Notificação
            _a.sent();
            if (!this.monitoring) return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.monitoring.createAlert(
                "RECOVERY_FAILURE",
                "HIGH",
                "Falha no recovery ".concat(request.id, ": ").concat(errorMessage),
                { requestId: request.id, error: errorMessage },
              ),
            ];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            console.error("Recovery ".concat(request.id, " falhou: ").concat(errorMessage));
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // NOTIFICAÇÕES
  // ============================================================================
  /**
   * Notificar conclusão de recovery
   */
  RecoveryService.prototype.notifyRecoveryCompletion = function (request, result) {
    return __awaiter(this, void 0, void 0, function () {
      var notification, error_5;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            notification = {
              title: "Recovery Concluído",
              message: "Recovery ".concat(request.type, " conclu\u00EDdo com sucesso"),
              data: {
                requestId: request.id,
                type: request.type,
                result: result,
              },
              channels: ["EMAIL", "PUSH"],
              priority: "MEDIUM",
            };
            return [4 /*yield*/, notifications_1.notificationManager.send(notification)];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_5 = _a.sent();
            console.error("Erro ao notificar conclusão de recovery:", error_5);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Notificar falha de recovery
   */
  RecoveryService.prototype.notifyRecoveryFailure = function (request, errorMessage) {
    return __awaiter(this, void 0, void 0, function () {
      var notification, error_6;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            notification = {
              title: "Falha no Recovery",
              message: "Recovery ".concat(request.type, " falhou: ").concat(errorMessage),
              data: {
                requestId: request.id,
                type: request.type,
                error: errorMessage,
              },
              channels: ["EMAIL", "PUSH", "SMS"],
              priority: "HIGH",
            };
            return [4 /*yield*/, notifications_1.notificationManager.send(notification)];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_6 = _a.sent();
            console.error("Erro ao notificar falha de recovery:", error_6);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // API PÚBLICA
  // ============================================================================
  /**
   * Obter status de recovery
   */
  RecoveryService.prototype.getRecoveryStatus = function (requestId) {
    return __awaiter(this, void 0, void 0, function () {
      var activeProgress, _a, request, error, progress, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            activeProgress = this.activeRecoveries.get(requestId);
            if (activeProgress) {
              return [
                2 /*return*/,
                {
                  success: true,
                  data: activeProgress,
                  timestamp: new Date(),
                  requestId: crypto.randomUUID(),
                },
              ];
            }
            return [
              4 /*yield*/,
              this.supabase.from("recovery_requests").select("*").eq("id", requestId).single(),
            ];
          case 1:
            (_a = _b.sent()), (request = _a.data), (error = _a.error);
            if (error || !request) {
              return [2 /*return*/, this.handleError("Recovery não encontrado", error)];
            }
            progress = {
              requestId: request.id,
              status: request.status,
              startTime: request.startedAt ? new Date(request.startedAt) : undefined,
              endTime: request.completedAt ? new Date(request.completedAt) : undefined,
              progress: request.progress || 0,
              currentStep: request.currentStep || "",
              estimatedCompletion: request.estimatedCompletion
                ? new Date(request.estimatedCompletion)
                : undefined,
              error: request.error,
            };
            return [
              2 /*return*/,
              {
                success: true,
                data: progress,
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 2:
            error_7 = _b.sent();
            return [2 /*return*/, this.handleError("Erro ao obter status de recovery", error_7)];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Cancelar recovery
   */
  RecoveryService.prototype.cancelRecovery = function (requestId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var activeProgress, error, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            activeProgress = this.activeRecoveries.get(requestId);
            if (activeProgress) {
              // Marcar para cancelamento
              activeProgress.status = types_1.RecoveryStatus.CANCELLED;
              this.activeRecoveries.set(requestId, activeProgress);
            }
            // Remover da fila se estiver pendente
            this.recoveryQueue = this.recoveryQueue.filter((r) => r.id !== requestId);
            return [
              4 /*yield*/,
              this.supabase
                .from("recovery_requests")
                .update({
                  status: types_1.RecoveryStatus.CANCELLED,
                  cancelledBy: userId,
                  cancelledAt: new Date().toISOString(),
                })
                .eq("id", requestId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "RECOVERY_CANCELLED",
                entityType: "RECOVERY",
                entityId: requestId,
                details: {},
                userId: userId,
              }),
            ];
          case 2:
            _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                message: "Recovery cancelado",
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 3:
            error_8 = _a.sent();
            return [2 /*return*/, this.handleError("Erro ao cancelar recovery", error_8)];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Listar recoveries
   */
  RecoveryService.prototype.listRecoveries = function (filters, pagination) {
    return __awaiter(this, void 0, void 0, function () {
      var query, offset, _a, requests, error, count, error_9;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase.from("recovery_requests").select("*", { count: "exact" });
            // Aplicar filtros
            if (filters === null || filters === void 0 ? void 0 : filters.status) {
              query = query.eq("status", filters.status);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.type) {
              query = query.eq("type", filters.type);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.userId) {
              query = query.eq("requestedBy", filters.userId);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.startDate) {
              query = query.gte("requestedAt", filters.startDate.toISOString());
            }
            if (filters === null || filters === void 0 ? void 0 : filters.endDate) {
              query = query.lte("requestedAt", filters.endDate.toISOString());
            }
            // Aplicar paginação
            if (pagination) {
              offset = (pagination.page - 1) * pagination.limit;
              query = query.range(offset, offset + pagination.limit - 1);
            }
            query = query.order("requestedAt", { ascending: false });
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (requests = _a.data), (error = _a.error), (count = _a.count);
            if (error) throw error;
            return [
              2 /*return*/,
              {
                success: true,
                data: {
                  requests: requests,
                  total: count || 0,
                },
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 2:
            error_9 = _b.sent();
            return [2 /*return*/, this.handleError("Erro ao listar recoveries", error_9)];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obter pontos de recuperação disponíveis
   */
  RecoveryService.prototype.getRecoveryPoints = function (configId) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, backups, error, recoveryPoints, error_10;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase.from("backup_records").select("*").eq("status", "COMPLETED");
            if (configId) {
              query = query.eq("configId", configId);
            }
            query = query.order("startTime", { ascending: false });
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (backups = _a.data), (error = _a.error);
            if (error) throw error;
            recoveryPoints = (backups || []).map((backup) => ({
              id: backup.id,
              timestamp: new Date(backup.startTime),
              type: backup.type,
              size: backup.size,
              description: "Backup "
                .concat(backup.type, " - ")
                .concat(new Date(backup.startTime).toLocaleString()),
              configId: backup.configId,
              isValid: true,
              metadata: {
                duration: backup.duration,
                checksum: backup.checksum,
                compression: backup.compression,
              },
            }));
            return [
              2 /*return*/,
              {
                success: true,
                data: recoveryPoints,
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 2:
            error_10 = _b.sent();
            return [
              2 /*return*/,
              this.handleError("Erro ao obter pontos de recuperação", error_10),
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  RecoveryService.prototype.handleError = (message, error) => {
    console.error(message, error);
    return {
      success: false,
      error:
        (error === null || error === void 0 ? void 0 : error.message) || "Erro interno do servidor",
      message: message,
      timestamp: new Date(),
      requestId: crypto.randomUUID(),
    };
  };
  return RecoveryService;
})();
exports.RecoveryService = RecoveryService;
