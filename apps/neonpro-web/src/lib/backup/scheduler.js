/**
 * NeonPro Backup Scheduler
 * Story 1.8: Sistema de Backup e Recovery
 *
 * Serviço de agendamento para backups automáticos,
 * gerenciando cronogramas e execução de tarefas.
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
exports.SchedulerService = void 0;
var node_cron_1 = require("node-cron");
var supabase_js_1 = require("@supabase/supabase-js");
var types_1 = require("./types");
var audit_logger_1 = require("../auth/audit/audit-logger");
/**
 * Serviço de agendamento de backups
 */
var SchedulerService = /** @class */ (() => {
  function SchedulerService(backupManager) {
    this.scheduledTasks = new Map();
    this.isInitialized = false;
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
    this.backupManager = backupManager;
  }
  /**
   * Inicializar o scheduler
   */
  SchedulerService.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, configs, error, _i, _b, config, error_1;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            if (this.isInitialized) return [2 /*return*/];
            _c.label = 1;
          case 1:
            _c.trys.push([1, 8, , 9]);
            return [
              4 /*yield*/,
              this.supabase.from("backup_configs").select("*").eq("enabled", true),
            ];
          case 2:
            (_a = _c.sent()), (configs = _a.data), (error = _a.error);
            if (error) throw error;
            (_i = 0), (_b = configs || []);
            _c.label = 3;
          case 3:
            if (!(_i < _b.length)) return [3 /*break*/, 6];
            config = _b[_i];
            return [4 /*yield*/, this.scheduleBackup(config)];
          case 4:
            _c.sent();
            _c.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 3];
          case 6:
            this.isInitialized = true;
            console.log("Scheduler inicializado com ".concat(this.scheduledTasks.size, " tarefas"));
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "SCHEDULER_INITIALIZED",
                entityType: "SYSTEM",
                entityId: "scheduler",
                details: { tasksCount: this.scheduledTasks.size },
                userId: "system",
              }),
            ];
          case 7:
            _c.sent();
            return [3 /*break*/, 9];
          case 8:
            error_1 = _c.sent();
            console.error("Erro ao inicializar scheduler:", error_1);
            throw error_1;
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Agendar backup
   */
  SchedulerService.prototype.scheduleBackup = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var cronExpression, task, nextRun, scheduledTask, error_2;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            // Remover agendamento existente se houver
            return [4 /*yield*/, this.unscheduleBackup(config.id)];
          case 1:
            // Remover agendamento existente se houver
            _a.sent();
            cronExpression = this.scheduleToCron(config.schedule);
            if (!node_cron_1.default.validate(cronExpression)) {
              throw new Error("Express\u00E3o cron inv\u00E1lida: ".concat(cronExpression));
            }
            task = node_cron_1.default.schedule(
              cronExpression,
              () =>
                __awaiter(_this, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        return [4 /*yield*/, this.executeScheduledBackup(config.id)];
                      case 1:
                        _a.sent();
                        return [2 /*return*/];
                    }
                  });
                }),
              {
                scheduled: true,
                timezone: config.schedule.timezone || "America/Sao_Paulo",
              },
            );
            nextRun = this.getNextRunTime(cronExpression, config.schedule.timezone);
            scheduledTask = {
              id: crypto.randomUUID(),
              configId: config.id,
              cronExpression: cronExpression,
              task: task,
              config: config,
              nextRun: nextRun,
              status: types_1.TaskStatus.SCHEDULED,
              retryCount: 0,
              maxRetries: config.schedule.maxRetries || 3,
            };
            this.scheduledTasks.set(config.id, scheduledTask);
            // Salvar no banco
            return [4 /*yield*/, this.saveScheduledTask(scheduledTask)];
          case 2:
            // Salvar no banco
            _a.sent();
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "BACKUP_SCHEDULED",
                entityType: "BACKUP_CONFIG",
                entityId: config.id,
                details: {
                  cronExpression: cronExpression,
                  nextRun: nextRun.toISOString(),
                  frequency: config.schedule.frequency,
                },
                userId: config.createdBy,
              }),
            ];
          case 3:
            _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                data: {
                  id: scheduledTask.id,
                  configId: config.id,
                  cronExpression: cronExpression,
                  nextRun: nextRun,
                  status: types_1.TaskStatus.SCHEDULED,
                  retryCount: 0,
                  maxRetries: scheduledTask.maxRetries,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
                message: "Backup agendado com sucesso",
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 4:
            error_2 = _a.sent();
            return [2 /*return*/, this.handleError("Erro ao agendar backup", error_2)];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Reagendar backup
   */
  SchedulerService.prototype.rescheduleBackup = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            if (!config.enabled) return [3 /*break*/, 2];
            return [4 /*yield*/, this.scheduleBackup(config)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            return [4 /*yield*/, this.unscheduleBackup(config.id)];
          case 3:
            _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                message: "Backup desabilitado",
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_3 = _a.sent();
            return [2 /*return*/, this.handleError("Erro ao reagendar backup", error_3)];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Desagendar backup
   */
  SchedulerService.prototype.unscheduleBackup = function (configId) {
    return __awaiter(this, void 0, void 0, function () {
      var scheduledTask;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            scheduledTask = this.scheduledTasks.get(configId);
            if (!scheduledTask) return [3 /*break*/, 3];
            // Parar tarefa cron
            scheduledTask.task.stop();
            scheduledTask.task.destroy();
            // Remover do mapa
            this.scheduledTasks.delete(configId);
            // Remover do banco
            return [
              4 /*yield*/,
              this.supabase.from("scheduled_tasks").delete().eq("configId", configId),
            ];
          case 1:
            // Remover do banco
            _a.sent();
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "BACKUP_UNSCHEDULED",
                entityType: "BACKUP_CONFIG",
                entityId: configId,
                details: { taskId: scheduledTask.id },
                userId: "system",
              }),
            ];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Executar backup agendado
   */
  SchedulerService.prototype.executeScheduledBackup = function (configId) {
    return __awaiter(this, void 0, void 0, function () {
      var scheduledTask, result, error_4;
      var _this = this;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            scheduledTask = this.scheduledTasks.get(configId);
            if (!scheduledTask) {
              console.error("Tarefa agendada n\u00E3o encontrada: ".concat(configId));
              return [2 /*return*/];
            }
            _b.label = 1;
          case 1:
            _b.trys.push([1, 7, 9, 11]);
            // Atualizar status
            scheduledTask.status = types_1.TaskStatus.RUNNING;
            scheduledTask.lastRun = new Date();
            return [4 /*yield*/, this.updateScheduledTask(scheduledTask)];
          case 2:
            _b.sent();
            return [4 /*yield*/, this.backupManager.executeBackup(configId, "scheduler")];
          case 3:
            result = _b.sent();
            if (!result.success) return [3 /*break*/, 5];
            // Sucesso
            scheduledTask.status = types_1.TaskStatus.COMPLETED;
            scheduledTask.retryCount = 0;
            // Calcular próxima execução
            scheduledTask.nextRun = this.getNextRunTime(
              scheduledTask.cronExpression,
              scheduledTask.config.schedule.timezone,
            );
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "SCHEDULED_BACKUP_SUCCESS",
                entityType: "BACKUP",
                entityId:
                  ((_a = result.data) === null || _a === void 0 ? void 0 : _a.id) || "unknown",
                details: { configId: configId, scheduledTaskId: scheduledTask.id },
                userId: "scheduler",
              }),
            ];
          case 4:
            _b.sent();
            return [3 /*break*/, 6];
          case 5:
            throw new Error(result.error || "Falha no backup");
          case 6:
            return [3 /*break*/, 11];
          case 7:
            error_4 = _b.sent();
            // Falha
            scheduledTask.status = types_1.TaskStatus.FAILED;
            scheduledTask.retryCount++;
            console.error("Erro no backup agendado ".concat(configId, ":"), error_4);
            // Verificar se deve tentar novamente
            if (scheduledTask.retryCount < scheduledTask.maxRetries) {
              // Agendar retry em 5 minutos
              setTimeout(
                () => {
                  _this.executeScheduledBackup(configId);
                },
                5 * 60 * 1000,
              );
              scheduledTask.status = types_1.TaskStatus.RETRYING;
            }
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "SCHEDULED_BACKUP_FAILED",
                entityType: "BACKUP_CONFIG",
                entityId: configId,
                details: {
                  error: error_4.message,
                  retryCount: scheduledTask.retryCount,
                  maxRetries: scheduledTask.maxRetries,
                },
                userId: "scheduler",
              }),
            ];
          case 8:
            _b.sent();
            return [3 /*break*/, 11];
          case 9:
            return [4 /*yield*/, this.updateScheduledTask(scheduledTask)];
          case 10:
            _b.sent();
            return [7 /*endfinally*/];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Converter schedule para expressão cron
   */
  SchedulerService.prototype.scheduleToCron = (schedule) => {
    var frequency = schedule.frequency,
      time = schedule.time,
      dayOfWeek = schedule.dayOfWeek,
      dayOfMonth = schedule.dayOfMonth;
    // Extrair hora e minuto do time (formato HH:MM)
    var _a = time.split(":").map(Number),
      hour = _a[0],
      minute = _a[1];
    switch (frequency) {
      case types_1.ScheduleFrequency.HOURLY:
        return "".concat(minute, " * * * *");
      case types_1.ScheduleFrequency.DAILY:
        return "".concat(minute, " ").concat(hour, " * * *");
      case types_1.ScheduleFrequency.WEEKLY: {
        var day = dayOfWeek || 0; // 0 = domingo
        return "".concat(minute, " ").concat(hour, " * * ").concat(day);
      }
      case types_1.ScheduleFrequency.MONTHLY: {
        var monthDay = dayOfMonth || 1;
        return "".concat(minute, " ").concat(hour, " ").concat(monthDay, " * *");
      }
      case types_1.ScheduleFrequency.CUSTOM:
        return schedule.cronExpression || "0 2 * * *"; // Default: 2:00 AM diário
      default:
        throw new Error("Frequ\u00EAncia n\u00E3o suportada: ".concat(frequency));
    }
  };
  /**
   * Obter próximo horário de execução
   */
  SchedulerService.prototype.getNextRunTime = (cronExpression, timezone) => {
    try {
      // Usar biblioteca cron-parser se disponível
      // const parser = require('cron-parser');
      // const interval = parser.parseExpression(cronExpression, {
      //   tz: timezone || 'America/Sao_Paulo'
      // });
      // return interval.next().toDate();
      // Fallback: calcular manualmente baseado na frequência
      var now = new Date();
      var tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(2, 0, 0, 0); // 2:00 AM
      return tomorrow;
    } catch (error) {
      console.error("Erro ao calcular próxima execução:", error);
      // Fallback: próximo dia às 2:00 AM
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(2, 0, 0, 0);
      return tomorrow;
    }
  };
  /**
   * Salvar tarefa agendada no banco
   */
  SchedulerService.prototype.saveScheduledTask = function (task) {
    return __awaiter(this, void 0, void 0, function () {
      var taskData;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            taskData = {
              id: task.id,
              configId: task.configId,
              cronExpression: task.cronExpression,
              nextRun: task.nextRun.toISOString(),
              lastRun: (_a = task.lastRun) === null || _a === void 0 ? void 0 : _a.toISOString(),
              status: task.status,
              retryCount: task.retryCount,
              maxRetries: task.maxRetries,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            return [4 /*yield*/, this.supabase.from("scheduled_tasks").upsert(taskData)];
          case 1:
            _b.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Atualizar tarefa agendada no banco
   */
  SchedulerService.prototype.updateScheduledTask = function (task) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("scheduled_tasks")
                .update({
                  nextRun: task.nextRun.toISOString(),
                  lastRun:
                    (_a = task.lastRun) === null || _a === void 0 ? void 0 : _a.toISOString(),
                  status: task.status,
                  retryCount: task.retryCount,
                  updatedAt: new Date().toISOString(),
                })
                .eq("id", task.id),
            ];
          case 1:
            _b.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Listar tarefas agendadas
   */
  SchedulerService.prototype.listScheduledTasks = function () {
    return __awaiter(this, void 0, void 0, function () {
      var tasks;
      return __generator(this, function (_a) {
        try {
          tasks = Array.from(this.scheduledTasks.values()).map((task) => ({
            id: task.id,
            configId: task.configId,
            cronExpression: task.cronExpression,
            nextRun: task.nextRun,
            lastRun: task.lastRun,
            status: task.status,
            retryCount: task.retryCount,
            maxRetries: task.maxRetries,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
          return [
            2 /*return*/,
            {
              success: true,
              data: tasks,
              timestamp: new Date(),
              requestId: crypto.randomUUID(),
            },
          ];
        } catch (error) {
          return [2 /*return*/, this.handleError("Erro ao listar tarefas agendadas", error)];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Obter status de tarefa específica
   */
  SchedulerService.prototype.getTaskStatus = function (configId) {
    var task = this.scheduledTasks.get(configId);
    if (!task) return null;
    return {
      id: task.id,
      configId: task.configId,
      cronExpression: task.cronExpression,
      nextRun: task.nextRun,
      lastRun: task.lastRun,
      status: task.status,
      retryCount: task.retryCount,
      maxRetries: task.maxRetries,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };
  /**
   * Pausar todas as tarefas
   */
  SchedulerService.prototype.pauseAllTasks = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, _b, configId, task, error_5;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 6, , 7]);
            (_i = 0), (_a = this.scheduledTasks);
            _c.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            (_b = _a[_i]), (configId = _b[0]), (task = _b[1]);
            task.task.stop();
            task.status = types_1.TaskStatus.PAUSED;
            return [4 /*yield*/, this.updateScheduledTask(task)];
          case 2:
            _c.sent();
            _c.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "SCHEDULER_PAUSED",
                entityType: "SYSTEM",
                entityId: "scheduler",
                details: { tasksCount: this.scheduledTasks.size },
                userId: "system",
              }),
            ];
          case 5:
            _c.sent();
            return [
              2 /*return*/,
              {
                success: true,
                message: "Todas as tarefas foram pausadas",
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 6:
            error_5 = _c.sent();
            return [2 /*return*/, this.handleError("Erro ao pausar tarefas", error_5)];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Retomar todas as tarefas
   */
  SchedulerService.prototype.resumeAllTasks = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, _b, configId, task, error_6;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 6, , 7]);
            (_i = 0), (_a = this.scheduledTasks);
            _c.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            (_b = _a[_i]), (configId = _b[0]), (task = _b[1]);
            task.task.start();
            task.status = types_1.TaskStatus.SCHEDULED;
            return [4 /*yield*/, this.updateScheduledTask(task)];
          case 2:
            _c.sent();
            _c.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "SCHEDULER_RESUMED",
                entityType: "SYSTEM",
                entityId: "scheduler",
                details: { tasksCount: this.scheduledTasks.size },
                userId: "system",
              }),
            ];
          case 5:
            _c.sent();
            return [
              2 /*return*/,
              {
                success: true,
                message: "Todas as tarefas foram retomadas",
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 6:
            error_6 = _c.sent();
            return [2 /*return*/, this.handleError("Erro ao retomar tarefas", error_6)];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Parar scheduler
   */
  SchedulerService.prototype.shutdown = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, _b, configId, task, error_7;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, , 3]);
            for (_i = 0, _a = this.scheduledTasks; _i < _a.length; _i++) {
              (_b = _a[_i]), (configId = _b[0]), (task = _b[1]);
              task.task.stop();
              task.task.destroy();
            }
            this.scheduledTasks.clear();
            this.isInitialized = false;
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "SCHEDULER_SHUTDOWN",
                entityType: "SYSTEM",
                entityId: "scheduler",
                details: {},
                userId: "system",
              }),
            ];
          case 1:
            _c.sent();
            console.log("Scheduler finalizado");
            return [3 /*break*/, 3];
          case 2:
            error_7 = _c.sent();
            console.error("Erro ao finalizar scheduler:", error_7);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Executar backup imediatamente (fora do agendamento)
   */
  SchedulerService.prototype.executeImmediateBackup = function (configId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var result, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.backupManager.executeBackup(configId, userId)];
          case 1:
            result = _a.sent();
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "IMMEDIATE_BACKUP_EXECUTED",
                entityType: "BACKUP_CONFIG",
                entityId: configId,
                details: { success: result.success },
                userId: userId,
              }),
            ];
          case 2:
            _a.sent();
            return [2 /*return*/, result];
          case 3:
            error_8 = _a.sent();
            return [2 /*return*/, this.handleError("Erro ao executar backup imediato", error_8)];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validar expressão cron
   */
  SchedulerService.prototype.validateCronExpression = (expression) => {
    try {
      var isValid = node_cron_1.default.validate(expression);
      return {
        success: true,
        data: isValid,
        message: isValid ? "Expressão cron válida" : "Expressão cron inválida",
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        error: error.message,
        message: "Erro ao validar expressão cron",
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
      };
    }
  };
  /**
   * Obter estatísticas do scheduler
   */
  SchedulerService.prototype.getSchedulerStats = function () {
    var tasks = Array.from(this.scheduledTasks.values());
    var stats = {
      totalTasks: tasks.length,
      activeTasks: tasks.filter((t) => t.status === types_1.TaskStatus.SCHEDULED).length,
      pausedTasks: tasks.filter((t) => t.status === types_1.TaskStatus.PAUSED).length,
      failedTasks: tasks.filter((t) => t.status === types_1.TaskStatus.FAILED).length,
      nextExecution: undefined,
    };
    // Encontrar próxima execução
    var nextRuns = tasks
      .filter((t) => t.status === types_1.TaskStatus.SCHEDULED)
      .map((t) => t.nextRun)
      .sort((a, b) => a.getTime() - b.getTime());
    if (nextRuns.length > 0) {
      stats.nextExecution = nextRuns[0];
    }
    return stats;
  };
  SchedulerService.prototype.handleError = (message, error) => {
    console.error(message, error);
    return {
      success: false,
      error: error.message || "Erro interno do servidor",
      message: message,
      timestamp: new Date(),
      requestId: crypto.randomUUID(),
    };
  };
  return SchedulerService;
})();
exports.SchedulerService = SchedulerService;
