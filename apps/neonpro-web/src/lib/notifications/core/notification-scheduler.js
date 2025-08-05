"use strict";
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
exports.NotificationScheduler = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var audit_logger_1 = require("../../auth/audit/audit-logger");
var node_cron_1 = require("node-cron");
var NotificationScheduler = /** @class */ (function () {
  function NotificationScheduler() {
    this.cronJobs = new Map();
    this.isRunning = false;
    this.processingInterval = null;
    this.batchSize = 100;
    this.processingIntervalMs = 60000; // 1 minuto
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    this.auditLogger = new audit_logger_1.AuditLogger();
  }
  /**
   * Inicia o scheduler
   */
  NotificationScheduler.prototype.start = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.isRunning) {
              throw new Error("Scheduler já está em execução");
            }
            this.isRunning = true;
            // Processar notificações pendentes a cada minuto
            this.processingInterval = setInterval(function () {
              return _this.processScheduledNotifications();
            }, this.processingIntervalMs);
            // Limpar notificações expiradas diariamente
            node_cron_1.default.schedule("0 0 * * *", function () {
              _this.cleanupExpiredNotifications();
            });
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "scheduler_started",
                resource_type: "notification_scheduler",
                details: {
                  batch_size: this.batchSize,
                  processing_interval_ms: this.processingIntervalMs,
                },
              }),
            ];
          case 1:
            _a.sent();
            console.log("NotificationScheduler iniciado");
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Para o scheduler
   */
  NotificationScheduler.prototype.stop = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, _b, id, job;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            if (!this.isRunning) {
              return [2 /*return*/];
            }
            this.isRunning = false;
            // Parar interval de processamento
            if (this.processingInterval) {
              clearInterval(this.processingInterval);
              this.processingInterval = null;
            }
            // Parar todos os cron jobs
            for (_i = 0, _a = this.cronJobs; _i < _a.length; _i++) {
              (_b = _a[_i]), (id = _b[0]), (job = _b[1]);
              job.stop();
              this.cronJobs.delete(id);
            }
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "scheduler_stopped",
                resource_type: "notification_scheduler",
              }),
            ];
          case 1:
            _c.sent();
            console.log("NotificationScheduler parado");
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Agenda uma notificação
   */
  NotificationScheduler.prototype.schedule = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var scheduleId, scheduledNotification, error, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            // Validar configuração
            return [4 /*yield*/, this.validateScheduleConfig(config)];
          case 1:
            // Validar configuração
            _a.sent();
            scheduleId = this.generateScheduleId();
            scheduledNotification = {
              id: scheduleId,
              notification_id: config.notification_id,
              user_id: config.user_id,
              channel: config.channel,
              template_id: config.template_id,
              recipient: config.recipient,
              subject: config.subject,
              content: config.content,
              data: config.data,
              scheduled_at: config.scheduled_at,
              timezone: config.timezone || "America/Sao_Paulo",
              repeat_pattern: config.repeat_pattern,
              status: "pending",
              priority: config.priority || "normal",
              metadata: config.metadata,
              created_at: new Date(),
              updated_at: new Date(),
              retry_count: 0,
              max_retries: config.max_retries || 3,
            };
            return [
              4 /*yield*/,
              this.supabase.from("scheduled_notifications").insert(scheduledNotification),
            ];
          case 2:
            error = _a.sent().error;
            if (error) throw error;
            if (!(!config.repeat_pattern && this.isNearFuture(config.scheduled_at)))
              return [3 /*break*/, 4];
            return [4 /*yield*/, this.createCronJob(scheduleId, config.scheduled_at)];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "notification_scheduled",
                resource_type: "scheduled_notification",
                resource_id: scheduleId,
                details: {
                  channel: config.channel,
                  scheduled_at: config.scheduled_at,
                  recipient: config.recipient,
                  has_repeat: !!config.repeat_pattern,
                },
              }),
            ];
          case 5:
            _a.sent();
            return [2 /*return*/, scheduleId];
          case 6:
            error_1 = _a.sent();
            throw new Error("Erro ao agendar notifica\u00E7\u00E3o: ".concat(error_1));
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Cancela uma notificação agendada
   */
  NotificationScheduler.prototype.cancel = function (scheduleId) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("scheduled_notifications")
                .update({
                  status: "cancelled",
                  updated_at: new Date().toISOString(),
                })
                .eq("id", scheduleId)
                .eq("status", "pending"),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            // Remover cron job se existir
            if (this.cronJobs.has(scheduleId)) {
              this.cronJobs.get(scheduleId).stop();
              this.cronJobs.delete(scheduleId);
            }
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "notification_cancelled",
                resource_type: "scheduled_notification",
                resource_id: scheduleId,
              }),
            ];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_2 = _a.sent();
            throw new Error("Erro ao cancelar notifica\u00E7\u00E3o: ".concat(error_2));
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Reagenda uma notificação
   */
  NotificationScheduler.prototype.reschedule = function (scheduleId, newScheduledAt) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            // Validar nova data
            if (newScheduledAt <= new Date()) {
              throw new Error("Nova data deve ser no futuro");
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("scheduled_notifications")
                .update({
                  scheduled_at: newScheduledAt.toISOString(),
                  status: "pending",
                  updated_at: new Date().toISOString(),
                })
                .eq("id", scheduleId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            // Recriar cron job se necessário
            if (this.cronJobs.has(scheduleId)) {
              this.cronJobs.get(scheduleId).stop();
              this.cronJobs.delete(scheduleId);
            }
            if (!this.isNearFuture(newScheduledAt)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.createCronJob(scheduleId, newScheduledAt)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "notification_rescheduled",
                resource_type: "scheduled_notification",
                resource_id: scheduleId,
                details: {
                  new_scheduled_at: newScheduledAt,
                },
              }),
            ];
          case 4:
            _a.sent();
            return [3 /*break*/, 6];
          case 5:
            error_3 = _a.sent();
            throw new Error("Erro ao reagendar notifica\u00E7\u00E3o: ".concat(error_3));
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Lista notificações agendadas
   */
  NotificationScheduler.prototype.list = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("scheduled_notifications")
              .select("*")
              .order("scheduled_at", { ascending: true });
            if (filters === null || filters === void 0 ? void 0 : filters.user_id) {
              query = query.eq("user_id", filters.user_id);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.channel) {
              query = query.eq("channel", filters.channel);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.status) {
              query = query.eq("status", filters.status);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.start_date) {
              query = query.gte("scheduled_at", filters.start_date.toISOString());
            }
            if (filters === null || filters === void 0 ? void 0 : filters.end_date) {
              query = query.lte("scheduled_at", filters.end_date.toISOString());
            }
            if (filters === null || filters === void 0 ? void 0 : filters.limit) {
              query = query.limit(filters.limit);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.offset) {
              query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data || []];
          case 2:
            error_4 = _b.sent();
            throw new Error("Erro ao listar notifica\u00E7\u00F5es agendadas: ".concat(error_4));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém estatísticas do scheduler
   */
  NotificationScheduler.prototype.getStats = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, stats_1, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("scheduled_notifications")
                .select("status, channel, priority, scheduled_at"),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            stats_1 = {
              total_scheduled: data.length,
              pending: 0,
              sent: 0,
              failed: 0,
              cancelled: 0,
              expired: 0,
              next_execution: null,
              channels: {},
              priorities: {},
            };
            // Calcular estatísticas
            data.forEach(function (notification) {
              // Status
              stats_1[notification.status] = stats_1[notification.status] + 1;
              // Canais
              stats_1.channels[notification.channel] =
                (stats_1.channels[notification.channel] || 0) + 1;
              // Prioridades
              stats_1.priorities[notification.priority] =
                (stats_1.priorities[notification.priority] || 0) + 1;
              // Próxima execução
              if (notification.status === "pending") {
                var scheduledAt = new Date(notification.scheduled_at);
                if (!stats_1.next_execution || scheduledAt < stats_1.next_execution) {
                  stats_1.next_execution = scheduledAt;
                }
              }
            });
            return [2 /*return*/, stats_1];
          case 2:
            error_5 = _b.sent();
            throw new Error("Erro ao obter estat\u00EDsticas: ".concat(error_5));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Métodos privados
  NotificationScheduler.prototype.processScheduledNotifications = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now, _a, notifications, error, _i, notifications_1, notification, error_6, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (!this.isRunning) return [2 /*return*/];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 10, , 11]);
            now = new Date();
            return [
              4 /*yield*/,
              this.supabase
                .from("scheduled_notifications")
                .select("*")
                .eq("status", "pending")
                .lte("scheduled_at", now.toISOString())
                .limit(this.batchSize),
            ];
          case 2:
            (_a = _b.sent()), (notifications = _a.data), (error = _a.error);
            if (error) throw error;
            if (!notifications || notifications.length === 0) {
              return [2 /*return*/];
            }
            console.log(
              "Processando ".concat(notifications.length, " notifica\u00E7\u00F5es agendadas"),
            );
            (_i = 0), (notifications_1 = notifications);
            _b.label = 3;
          case 3:
            if (!(_i < notifications_1.length)) return [3 /*break*/, 9];
            notification = notifications_1[_i];
            _b.label = 4;
          case 4:
            _b.trys.push([4, 6, , 8]);
            return [4 /*yield*/, this.processNotification(notification)];
          case 5:
            _b.sent();
            return [3 /*break*/, 8];
          case 6:
            error_6 = _b.sent();
            console.error(
              "Erro ao processar notifica\u00E7\u00E3o ".concat(notification.id, ":"),
              error_6,
            );
            return [4 /*yield*/, this.handleNotificationError(notification, error_6)];
          case 7:
            _b.sent();
            return [3 /*break*/, 8];
          case 8:
            _i++;
            return [3 /*break*/, 3];
          case 9:
            return [3 /*break*/, 11];
          case 10:
            error_7 = _b.sent();
            console.error("Erro no processamento de notificações agendadas:", error_7);
            return [3 /*break*/, 11];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  NotificationScheduler.prototype.processNotification = function (notification) {
    return __awaiter(this, void 0, void 0, function () {
      var error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 7, , 8]);
            // Marcar como sendo processada
            return [
              4 /*yield*/,
              this.supabase
                .from("scheduled_notifications")
                .update({ status: "processing" })
                .eq("id", notification.id),
            ];
          case 1:
            // Marcar como sendo processada
            _a.sent();
            // Enviar notificação através do canal apropriado
            return [4 /*yield*/, this.sendNotification(notification)];
          case 2:
            // Enviar notificação através do canal apropriado
            _a.sent();
            // Marcar como enviada
            return [
              4 /*yield*/,
              this.supabase
                .from("scheduled_notifications")
                .update({
                  status: "sent",
                  sent_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", notification.id),
            ];
          case 3:
            // Marcar como enviada
            _a.sent();
            if (!notification.repeat_pattern) return [3 /*break*/, 5];
            return [4 /*yield*/, this.scheduleNextOccurrence(notification)];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "scheduled_notification_sent",
                resource_type: "scheduled_notification",
                resource_id: notification.id,
                details: {
                  channel: notification.channel,
                  recipient: notification.recipient,
                },
              }),
            ];
          case 6:
            _a.sent();
            return [3 /*break*/, 8];
          case 7:
            error_8 = _a.sent();
            throw error_8;
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  NotificationScheduler.prototype.sendNotification = function (notification) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Aqui seria feita a integração com o NotificationManager
            // Por enquanto, simular o envio
            console.log(
              "Enviando notifica\u00E7\u00E3o "
                .concat(notification.id, " via ")
                .concat(notification.channel, " para ")
                .concat(notification.recipient),
            );
            // Simular delay de envio
            return [
              4 /*yield*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, 100);
              }),
            ];
          case 1:
            // Simular delay de envio
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  NotificationScheduler.prototype.handleNotificationError = function (notification, error) {
    return __awaiter(this, void 0, void 0, function () {
      var retryCount, nextRetry;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            retryCount = notification.retry_count + 1;
            if (!(retryCount <= notification.max_retries)) return [3 /*break*/, 2];
            nextRetry = new Date(Date.now() + retryCount * 60000);
            return [
              4 /*yield*/,
              this.supabase
                .from("scheduled_notifications")
                .update({
                  status: "pending",
                  retry_count: retryCount,
                  scheduled_at: nextRetry.toISOString(),
                  error_message: error.message,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", notification.id),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 4];
          case 2:
            // Marcar como falha definitiva
            return [
              4 /*yield*/,
              this.supabase
                .from("scheduled_notifications")
                .update({
                  status: "failed",
                  error_message: error.message,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", notification.id),
            ];
          case 3:
            // Marcar como falha definitiva
            _a.sent();
            _a.label = 4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  NotificationScheduler.prototype.scheduleNextOccurrence = function (notification) {
    return __awaiter(this, void 0, void 0, function () {
      var pattern, currentDate, nextDate, newScheduleId, newNotification;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!notification.repeat_pattern) return [2 /*return*/];
            pattern = notification.repeat_pattern;
            currentDate = new Date(notification.scheduled_at);
            switch (pattern.type) {
              case "daily":
                nextDate = new Date(
                  currentDate.getTime() + (pattern.interval || 1) * 24 * 60 * 60 * 1000,
                );
                break;
              case "weekly":
                nextDate = new Date(
                  currentDate.getTime() + (pattern.interval || 1) * 7 * 24 * 60 * 60 * 1000,
                );
                break;
              case "monthly":
                nextDate = new Date(currentDate);
                nextDate.setMonth(nextDate.getMonth() + (pattern.interval || 1));
                break;
              case "yearly":
                nextDate = new Date(currentDate);
                nextDate.setFullYear(nextDate.getFullYear() + (pattern.interval || 1));
                break;
              default:
                return [2 /*return*/];
            }
            // Verificar se deve continuar repetindo
            if (pattern.end_date && nextDate > pattern.end_date) {
              return [2 /*return*/];
            }
            newScheduleId = this.generateScheduleId();
            newNotification = __assign(__assign({}, notification), {
              id: newScheduleId,
              scheduled_at: nextDate,
              status: "pending",
              retry_count: 0,
              created_at: new Date(),
              updated_at: new Date(),
              sent_at: undefined,
              error_message: undefined,
            });
            return [
              4 /*yield*/,
              this.supabase.from("scheduled_notifications").insert(newNotification),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  NotificationScheduler.prototype.cleanupExpiredNotifications = function () {
    return __awaiter(this, void 0, void 0, function () {
      var expiredDate, error, error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            expiredDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("scheduled_notifications")
                .update({ status: "expired" })
                .eq("status", "pending")
                .lt("scheduled_at", expiredDate.toISOString()),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "expired_notifications_cleaned",
                resource_type: "notification_scheduler",
                details: { expired_before: expiredDate },
              }),
            ];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_9 = _a.sent();
            console.error("Erro ao limpar notificações expiradas:", error_9);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  NotificationScheduler.prototype.createCronJob = function (scheduleId, scheduledAt) {
    return __awaiter(this, void 0, void 0, function () {
      var cronExpression, job;
      var _this = this;
      return __generator(this, function (_a) {
        cronExpression = this.dateToCronExpression(scheduledAt);
        job = node_cron_1.default.schedule(
          cronExpression,
          function () {
            return __awaiter(_this, void 0, void 0, function () {
              var notification, error_10;
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [
                      4 /*yield*/,
                      this.supabase
                        .from("scheduled_notifications")
                        .select("*")
                        .eq("id", scheduleId)
                        .eq("status", "pending")
                        .single(),
                    ];
                  case 1:
                    notification = _a.sent().data;
                    if (!notification) return [3 /*break*/, 3];
                    return [4 /*yield*/, this.processNotification(notification)];
                  case 2:
                    _a.sent();
                    _a.label = 3;
                  case 3:
                    // Remover job após execução
                    job.stop();
                    this.cronJobs.delete(scheduleId);
                    return [3 /*break*/, 5];
                  case 4:
                    error_10 = _a.sent();
                    console.error("Erro no cron job ".concat(scheduleId, ":"), error_10);
                    return [3 /*break*/, 5];
                  case 5:
                    return [2 /*return*/];
                }
              });
            });
          },
          {
            scheduled: false,
          },
        );
        this.cronJobs.set(scheduleId, job);
        job.start();
        return [2 /*return*/];
      });
    });
  };
  NotificationScheduler.prototype.dateToCronExpression = function (date) {
    var minute = date.getMinutes();
    var hour = date.getHours();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    return "".concat(minute, " ").concat(hour, " ").concat(day, " ").concat(month, " *");
  };
  NotificationScheduler.prototype.isNearFuture = function (date) {
    var now = new Date();
    var diffMs = date.getTime() - now.getTime();
    var diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 24; // Próximas 24 horas
  };
  NotificationScheduler.prototype.validateScheduleConfig = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        if (!config.notification_id) {
          throw new Error("notification_id é obrigatório");
        }
        if (!config.channel) {
          throw new Error("Canal é obrigatório");
        }
        if (!config.recipient) {
          throw new Error("Destinatário é obrigatório");
        }
        if (!config.content) {
          throw new Error("Conteúdo é obrigatório");
        }
        if (!config.scheduled_at) {
          throw new Error("Data de agendamento é obrigatória");
        }
        if (config.scheduled_at <= new Date()) {
          throw new Error("Data de agendamento deve ser no futuro");
        }
        // Validar padrão de repetição
        if (config.repeat_pattern) {
          if (
            config.repeat_pattern.end_date &&
            config.repeat_pattern.end_date <= config.scheduled_at
          ) {
            throw new Error("Data de fim deve ser posterior à data de agendamento");
          }
          if (config.repeat_pattern.max_occurrences && config.repeat_pattern.max_occurrences <= 0) {
            throw new Error("Número máximo de ocorrências deve ser positivo");
          }
        }
        return [2 /*return*/];
      });
    });
  };
  NotificationScheduler.prototype.generateScheduleId = function () {
    return "schedule_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
  };
  return NotificationScheduler;
})();
exports.NotificationScheduler = NotificationScheduler;
exports.default = NotificationScheduler;
