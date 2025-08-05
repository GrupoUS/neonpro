/**
 * NeonPro Backup Monitoring Service
 * Story 1.8: Sistema de Backup e Recovery
 *
 * Serviço de monitoramento para métricas, alertas e
 * performance do sistema de backup.
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
exports.MonitoringService = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var types_1 = require("./types");
var audit_logger_1 = require("../auth/audit/audit-logger");
var notifications_1 = require("../notifications");
/**
 * Serviço de monitoramento de backups
 */
var MonitoringService = /** @class */ (() => {
  function MonitoringService(backupManager) {
    this.alertHistory = new Map();
    this.performanceHistory = [];
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
    this.backupManager = backupManager;
    // Configuração padrão
    this.config = {
      enabled: true,
      checkInterval: 60000, // 1 minuto
      alertThresholds: {
        failureRate: 0.1, // 10%
        maxBackupTime: 3600, // 1 hora
        minFreeSpace: 1073741824, // 1GB
        maxRetries: 3,
      },
      notifications: {
        email: true,
        sms: false,
        push: true,
        webhook: false,
      },
      retention: {
        metricsRetention: 90, // 90 dias
        alertsRetention: 30, // 30 dias
      },
    };
    // Métricas iniciais
    this.realTimeMetrics = {
      activeBackups: 0,
      queuedBackups: 0,
      failedBackups: 0,
      totalStorage: 0,
      averageBackupTime: 0,
      successRate: 100,
      lastUpdate: new Date(),
    };
    this.startMonitoring();
  }
  /**
   * Iniciar monitoramento
   */
  MonitoringService.prototype.startMonitoring = function () {
    if (this.config.enabled) {
      this.monitoringInterval = setInterval(() => {
        this.performHealthCheck();
      }, this.config.checkInterval);
      console.log("Monitoramento de backup iniciado");
    }
  };
  /**
   * Parar monitoramento
   */
  MonitoringService.prototype.stopMonitoring = function () {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      console.log("Monitoramento de backup parado");
    }
  };
  // ============================================================================
  // MÉTRICAS
  // ============================================================================
  /**
   * Calcular métricas de backup
   */
  MonitoringService.prototype.calculateMetrics = function (startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
      var start,
        end,
        _a,
        backups,
        error,
        records,
        totalBackups,
        successfulBackups,
        failedBackups,
        totalSize,
        totalDuration,
        successRate,
        averageSize,
        averageDuration,
        lastBackup,
        nextScheduled,
        nextBackup,
        previousPeriod,
        previousBackups,
        previousTotal,
        previousSuccessful,
        previousSuccessRate,
        trends,
        error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            end = endDate || new Date();
            return [
              4 /*yield*/,
              this.supabase
                .from("backup_records")
                .select("*")
                .gte("startTime", start.toISOString())
                .lte("startTime", end.toISOString())
                .order("startTime", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (backups = _a.data), (error = _a.error);
            if (error) throw error;
            records = backups || [];
            totalBackups = records.length;
            successfulBackups = records.filter(
              (b) => b.status === types_1.BackupStatus.COMPLETED,
            ).length;
            failedBackups = records.filter((b) => b.status === types_1.BackupStatus.FAILED).length;
            totalSize = records.reduce((sum, b) => sum + (b.size || 0), 0);
            totalDuration = records
              .filter((b) => b.duration)
              .reduce((sum, b) => sum + b.duration, 0);
            successRate = totalBackups > 0 ? (successfulBackups / totalBackups) * 100 : 100;
            averageSize = totalBackups > 0 ? totalSize / totalBackups : 0;
            averageDuration =
              records.filter((b) => b.duration).length > 0
                ? totalDuration / records.filter((b) => b.duration).length
                : 0;
            lastBackup = records.length > 0 ? new Date(records[0].startTime) : null;
            return [
              4 /*yield*/,
              this.supabase
                .from("scheduled_tasks")
                .select("nextRun")
                .eq("status", "SCHEDULED")
                .order("nextRun", { ascending: true })
                .limit(1)
                .single(),
            ];
          case 2:
            nextScheduled = _b.sent().data;
            nextBackup = nextScheduled ? new Date(nextScheduled.nextRun) : null;
            previousPeriod = new Date(start.getTime() - (end.getTime() - start.getTime()));
            return [
              4 /*yield*/,
              this.supabase
                .from("backup_records")
                .select("*")
                .gte("startTime", previousPeriod.toISOString())
                .lt("startTime", start.toISOString()),
            ];
          case 3:
            previousBackups = _b.sent().data;
            previousTotal =
              (previousBackups === null || previousBackups === void 0
                ? void 0
                : previousBackups.length) || 0;
            previousSuccessful =
              (previousBackups === null || previousBackups === void 0
                ? void 0
                : previousBackups.filter((b) => b.status === types_1.BackupStatus.COMPLETED)
                    .length) || 0;
            previousSuccessRate =
              previousTotal > 0 ? (previousSuccessful / previousTotal) * 100 : 100;
            trends = {
              backupCount: totalBackups - previousTotal,
              successRate: successRate - previousSuccessRate,
              averageSize: 0, // Calcular se necessário
              averageDuration: 0, // Calcular se necessário
            };
            return [
              2 /*return*/,
              {
                totalBackups: totalBackups,
                successfulBackups: successfulBackups,
                failedBackups: failedBackups,
                successRate: successRate,
                totalSize: totalSize,
                averageSize: averageSize,
                averageDuration: averageDuration,
                lastBackup: lastBackup,
                nextBackup: nextBackup,
                trends: trends,
                period: {
                  start: start,
                  end: end,
                },
              },
            ];
          case 4:
            error_1 = _b.sent();
            console.error("Erro ao calcular métricas:", error_1);
            throw error_1;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obter métricas em tempo real
   */
  MonitoringService.prototype.getRealTimeMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // Atualizar métricas
            return [4 /*yield*/, this.updateRealTimeMetrics()];
          case 1:
            // Atualizar métricas
            _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                data: __assign({}, this.realTimeMetrics),
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 2:
            error_2 = _a.sent();
            return [
              2 /*return*/,
              this.handleError("Erro ao obter métricas em tempo real", error_2),
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Atualizar métricas em tempo real
   */
  MonitoringService.prototype.updateRealTimeMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      var activeBackups,
        queuedBackups,
        yesterday,
        failedBackups,
        storageData,
        totalStorage,
        recentBackups,
        recentTotal,
        recentSuccessful,
        successRate,
        completedBackups,
        averageBackupTime,
        error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 7, , 8]);
            return [
              4 /*yield*/,
              this.supabase
                .from("backup_records")
                .select("id")
                .eq("status", types_1.BackupStatus.RUNNING),
            ];
          case 1:
            activeBackups = _a.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("backup_records")
                .select("id")
                .eq("status", types_1.BackupStatus.PENDING),
            ];
          case 2:
            queuedBackups = _a.sent().data;
            yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("backup_records")
                .select("id")
                .eq("status", types_1.BackupStatus.FAILED)
                .gte("startTime", yesterday.toISOString()),
            ];
          case 3:
            failedBackups = _a.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("backup_records")
                .select("size")
                .eq("status", types_1.BackupStatus.COMPLETED),
            ];
          case 4:
            storageData = _a.sent().data;
            totalStorage =
              (storageData === null || storageData === void 0
                ? void 0
                : storageData.reduce((sum, b) => sum + (b.size || 0), 0)) || 0;
            return [
              4 /*yield*/,
              this.supabase
                .from("backup_records")
                .select("status")
                .gte("startTime", yesterday.toISOString()),
            ];
          case 5:
            recentBackups = _a.sent().data;
            recentTotal =
              (recentBackups === null || recentBackups === void 0
                ? void 0
                : recentBackups.length) || 0;
            recentSuccessful =
              (recentBackups === null || recentBackups === void 0
                ? void 0
                : recentBackups.filter((b) => b.status === types_1.BackupStatus.COMPLETED)
                    .length) || 0;
            successRate = recentTotal > 0 ? (recentSuccessful / recentTotal) * 100 : 100;
            return [
              4 /*yield*/,
              this.supabase
                .from("backup_records")
                .select("duration")
                .eq("status", types_1.BackupStatus.COMPLETED)
                .gte("startTime", yesterday.toISOString())
                .not("duration", "is", null),
            ];
          case 6:
            completedBackups = _a.sent().data;
            averageBackupTime =
              (completedBackups === null || completedBackups === void 0
                ? void 0
                : completedBackups.length) > 0
                ? completedBackups.reduce((sum, b) => sum + b.duration, 0) / completedBackups.length
                : 0;
            // Atualizar métricas
            this.realTimeMetrics = {
              activeBackups:
                (activeBackups === null || activeBackups === void 0
                  ? void 0
                  : activeBackups.length) || 0,
              queuedBackups:
                (queuedBackups === null || queuedBackups === void 0
                  ? void 0
                  : queuedBackups.length) || 0,
              failedBackups:
                (failedBackups === null || failedBackups === void 0
                  ? void 0
                  : failedBackups.length) || 0,
              totalStorage: totalStorage,
              averageBackupTime: averageBackupTime,
              successRate: successRate,
              lastUpdate: new Date(),
            };
            return [3 /*break*/, 8];
          case 7:
            error_3 = _a.sent();
            console.error("Erro ao atualizar métricas em tempo real:", error_3);
            return [3 /*break*/, 8];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // ALERTAS
  // ============================================================================
  /**
   * Criar alerta
   */
  MonitoringService.prototype.createAlert = function (type, severity, message, details, entityId) {
    return __awaiter(this, void 0, void 0, function () {
      var alert, entityAlerts;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            alert = {
              id: crypto.randomUUID(),
              type: type,
              severity: severity,
              message: message,
              details: details || {},
              entityId: entityId,
              timestamp: new Date(),
              acknowledged: false,
              resolved: false,
            };
            // Salvar no banco
            return [4 /*yield*/, this.supabase.from("backup_alerts").insert(alert)];
          case 1:
            // Salvar no banco
            _a.sent();
            entityAlerts = this.alertHistory.get(entityId || "system") || [];
            entityAlerts.push(alert);
            this.alertHistory.set(entityId || "system", entityAlerts);
            // Enviar notificação
            return [4 /*yield*/, this.sendAlertNotification(alert)];
          case 2:
            // Enviar notificação
            _a.sent();
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "ALERT_CREATED",
                entityType: "ALERT",
                entityId: alert.id,
                details: { type: type, severity: severity, message: message },
                userId: "system",
              }),
            ];
          case 3:
            _a.sent();
            return [2 /*return*/, alert];
        }
      });
    });
  };
  /**
   * Enviar notificação de alerta
   */
  MonitoringService.prototype.sendAlertNotification = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      var channels, notification, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            channels = [];
            if (this.config.notifications.email) channels.push("EMAIL");
            if (this.config.notifications.sms) channels.push("SMS");
            if (this.config.notifications.push) channels.push("PUSH");
            if (channels.length === 0) return [2 /*return*/];
            notification = {
              title: "Alerta de Backup - ".concat(alert.severity),
              message: alert.message,
              data: {
                alertId: alert.id,
                type: alert.type,
                severity: alert.severity,
                timestamp: alert.timestamp.toISOString(),
              },
              channels: channels,
              priority: alert.severity === types_1.AlertSeverity.CRITICAL ? "HIGH" : "MEDIUM",
            };
            return [4 /*yield*/, notifications_1.notificationManager.send(notification)];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            console.error("Erro ao enviar notificação de alerta:", error_4);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Verificar condições de alerta
   */
  MonitoringService.prototype.checkAlertConditions = function () {
    return __awaiter(this, void 0, void 0, function () {
      var metrics, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 7, , 8]);
            return [4 /*yield*/, this.calculateMetrics()];
          case 1:
            metrics = _a.sent();
            if (!(metrics.successRate < 100 - this.config.alertThresholds.failureRate * 100))
              return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.createAlert(
                types_1.AlertType.BACKUP_FAILURE,
                types_1.AlertSeverity.HIGH,
                "Taxa de sucesso baixa: ".concat(metrics.successRate.toFixed(1), "%"),
                {
                  successRate: metrics.successRate,
                  threshold: this.config.alertThresholds.failureRate,
                },
              ),
            ];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            if (!(metrics.averageDuration > this.config.alertThresholds.maxBackupTime))
              return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.createAlert(
                types_1.AlertType.PERFORMANCE,
                types_1.AlertSeverity.MEDIUM,
                "Tempo de backup acima do limite: ".concat(
                  Math.round(metrics.averageDuration / 60),
                  " minutos",
                ),
                {
                  averageDuration: metrics.averageDuration,
                  threshold: this.config.alertThresholds.maxBackupTime,
                },
              ),
            ];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            // Verificar espaço em disco (implementar conforme necessário)
            // await this.checkDiskSpace();
            // Verificar backups antigos
            return [4 /*yield*/, this.checkStaleBackups()];
          case 6:
            // Verificar espaço em disco (implementar conforme necessário)
            // await this.checkDiskSpace();
            // Verificar backups antigos
            _a.sent();
            return [3 /*break*/, 8];
          case 7:
            error_5 = _a.sent();
            console.error("Erro ao verificar condições de alerta:", error_5);
            return [3 /*break*/, 8];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Verificar backups antigos
   */
  MonitoringService.prototype.checkStaleBackups = function () {
    return __awaiter(this, void 0, void 0, function () {
      var configs,
        _i,
        _a,
        config,
        lastBackup,
        lastBackupTime,
        hoursSinceLastBackup,
        maxHours,
        error_6;
      var _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 7, , 8]);
            return [
              4 /*yield*/,
              this.supabase.from("backup_configs").select("*").eq("enabled", true),
            ];
          case 1:
            configs = _c.sent().data;
            (_i = 0), (_a = configs || []);
            _c.label = 2;
          case 2:
            if (!(_i < _a.length)) return [3 /*break*/, 6];
            config = _a[_i];
            return [
              4 /*yield*/,
              this.supabase
                .from("backup_records")
                .select("startTime")
                .eq("configId", config.id)
                .eq("status", types_1.BackupStatus.COMPLETED)
                .order("startTime", { ascending: false })
                .limit(1)
                .single(),
            ];
          case 3:
            lastBackup = _c.sent().data;
            if (!lastBackup) return [3 /*break*/, 5];
            lastBackupTime = new Date(lastBackup.startTime);
            hoursSinceLastBackup = (Date.now() - lastBackupTime.getTime()) / (1000 * 60 * 60);
            maxHours = 24;
            switch ((_b = config.schedule) === null || _b === void 0 ? void 0 : _b.frequency) {
              case "HOURLY":
                maxHours = 2;
                break;
              case "DAILY":
                maxHours = 26;
                break;
              case "WEEKLY":
                maxHours = 168 + 24;
                break; // 1 semana + 1 dia
              case "MONTHLY":
                maxHours = 30 * 24 + 24;
                break; // 1 mês + 1 dia
            }
            if (!(hoursSinceLastBackup > maxHours)) return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.createAlert(
                types_1.AlertType.BACKUP_OVERDUE,
                types_1.AlertSeverity.HIGH,
                'Backup atrasado para configura\u00E7\u00E3o "'
                  .concat(config.name, '": ')
                  .concat(Math.round(hoursSinceLastBackup), " horas"),
                {
                  configId: config.id,
                  configName: config.name,
                  hoursSinceLastBackup: hoursSinceLastBackup,
                  maxHours: maxHours,
                },
                config.id,
              ),
            ];
          case 4:
            _c.sent();
            _c.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 2];
          case 6:
            return [3 /*break*/, 8];
          case 7:
            error_6 = _c.sent();
            console.error("Erro ao verificar backups antigos:", error_6);
            return [3 /*break*/, 8];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // HEALTH CHECK
  // ============================================================================
  /**
   * Realizar verificação de saúde
   */
  MonitoringService.prototype.performHealthCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      var healthCheck, error_7, schedulerStats, componentStatuses, performanceMetric, error_8;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            healthCheck = {
              timestamp: new Date(),
              overall: "HEALTHY",
              components: {
                database: "HEALTHY",
                storage: "HEALTHY",
                scheduler: "HEALTHY",
                notifications: "HEALTHY",
              },
              metrics: {
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage().heapUsed,
                activeConnections: 0,
                queueSize: this.realTimeMetrics.queuedBackups,
              },
              issues: [],
            };
            _b.label = 1;
          case 1:
            _b.trys.push([1, 8, , 9]);
            _b.label = 2;
          case 2:
            _b.trys.push([2, 4, , 5]);
            return [4 /*yield*/, this.supabase.from("backup_configs").select("id").limit(1)];
          case 3:
            _b.sent();
            return [3 /*break*/, 5];
          case 4:
            error_7 = _b.sent();
            healthCheck.components.database = "UNHEALTHY";
            healthCheck.issues.push("Falha na conexão com o banco de dados");
            return [3 /*break*/, 5];
          case 5:
            schedulerStats =
              (_a = this.backupManager.scheduler) === null || _a === void 0
                ? void 0
                : _a.getSchedulerStats();
            if (!schedulerStats || schedulerStats.totalTasks === 0) {
              healthCheck.components.scheduler = "DEGRADED";
              healthCheck.issues.push("Nenhuma tarefa agendada");
            }
            // Atualizar métricas em tempo real
            return [4 /*yield*/, this.updateRealTimeMetrics()];
          case 6:
            // Atualizar métricas em tempo real
            _b.sent();
            // Verificar condições de alerta
            return [4 /*yield*/, this.checkAlertConditions()];
          case 7:
            // Verificar condições de alerta
            _b.sent();
            componentStatuses = Object.values(healthCheck.components);
            if (componentStatuses.includes("UNHEALTHY")) {
              healthCheck.overall = "UNHEALTHY";
            } else if (componentStatuses.includes("DEGRADED")) {
              healthCheck.overall = "DEGRADED";
            }
            performanceMetric = {
              timestamp: new Date(),
              backupCount: this.realTimeMetrics.activeBackups,
              averageBackupTime: this.realTimeMetrics.averageBackupTime,
              successRate: this.realTimeMetrics.successRate,
              storageUsed: this.realTimeMetrics.totalStorage,
              memoryUsage: healthCheck.metrics.memoryUsage,
              cpuUsage: 0, // Implementar se necessário
              networkLatency: 0, // Implementar se necessário
            };
            this.performanceHistory.push(performanceMetric);
            // Manter apenas últimas 1000 entradas
            if (this.performanceHistory.length > 1000) {
              this.performanceHistory = this.performanceHistory.slice(-1000);
            }
            return [3 /*break*/, 9];
          case 8:
            error_8 = _b.sent();
            console.error("Erro no health check:", error_8);
            healthCheck.overall = "UNHEALTHY";
            healthCheck.issues.push("Erro interno: ".concat(error_8.message));
            return [3 /*break*/, 9];
          case 9:
            return [2 /*return*/, healthCheck];
        }
      });
    });
  };
  // ============================================================================
  // NOTIFICAÇÕES
  // ============================================================================
  /**
   * Notificar sucesso de backup
   */
  MonitoringService.prototype.notifyBackupSuccess = function (backupId, config) {
    return __awaiter(this, void 0, void 0, function () {
      var notification, error_9;
      var _a;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            if (!((_a = config.notifications) === null || _a === void 0 ? void 0 : _a.onSuccess))
              return [3 /*break*/, 2];
            notification = {
              title: "Backup Concluído",
              message: 'Backup "'.concat(config.name, '" conclu\u00EDdo com sucesso'),
              data: {
                backupId: backupId,
                configId: config.id,
                configName: config.name,
              },
              channels: ["EMAIL", "PUSH"],
              priority: "LOW",
            };
            return [4 /*yield*/, notifications_1.notificationManager.send(notification)];
          case 1:
            _b.sent();
            _b.label = 2;
          case 2:
            return [3 /*break*/, 4];
          case 3:
            error_9 = _b.sent();
            console.error("Erro ao notificar sucesso de backup:", error_9);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Notificar falha de backup
   */
  MonitoringService.prototype.notifyBackupFailure = function (backupId, config, errorMessage) {
    return __awaiter(this, void 0, void 0, function () {
      var notification, error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            notification = {
              title: "Falha no Backup",
              message: 'Backup "'.concat(config.name, '" falhou: ').concat(errorMessage),
              data: {
                backupId: backupId,
                configId: config.id,
                configName: config.name,
                error: errorMessage,
              },
              channels: ["EMAIL", "PUSH", "SMS"],
              priority: "HIGH",
            };
            return [4 /*yield*/, notifications_1.notificationManager.send(notification)];
          case 1:
            _a.sent();
            // Criar alerta
            return [
              4 /*yield*/,
              this.createAlert(
                types_1.AlertType.BACKUP_FAILURE,
                types_1.AlertSeverity.HIGH,
                'Falha no backup "'.concat(config.name, '": ').concat(errorMessage),
                { backupId: backupId, configId: config.id, error: errorMessage },
                config.id,
              ),
            ];
          case 2:
            // Criar alerta
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_10 = _a.sent();
            console.error("Erro ao notificar falha de backup:", error_10);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================
  /**
   * Obter histórico de performance
   */
  MonitoringService.prototype.getPerformanceHistory = function (hours) {
    if (hours === void 0) {
      hours = 24;
    }
    var cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.performanceHistory.filter((m) => m.timestamp >= cutoff);
  };
  /**
   * Obter alertas ativos
   */
  MonitoringService.prototype.getActiveAlerts = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, alerts, error, error_11;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("backup_alerts")
                .select("*")
                .eq("resolved", false)
                .order("timestamp", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (alerts = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              2 /*return*/,
              {
                success: true,
                data: alerts,
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 2:
            error_11 = _b.sent();
            return [2 /*return*/, this.handleError("Erro ao obter alertas ativos", error_11)];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Reconhecer alerta
   */
  MonitoringService.prototype.acknowledgeAlert = function (alertId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_12;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("backup_alerts")
                .update({
                  acknowledged: true,
                  acknowledgedBy: userId,
                  acknowledgedAt: new Date().toISOString(),
                })
                .eq("id", alertId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "ALERT_ACKNOWLEDGED",
                entityType: "ALERT",
                entityId: alertId,
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
                message: "Alerta reconhecido",
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 3:
            error_12 = _a.sent();
            return [2 /*return*/, this.handleError("Erro ao reconhecer alerta", error_12)];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Resolver alerta
   */
  MonitoringService.prototype.resolveAlert = function (alertId, userId, resolution) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_13;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("backup_alerts")
                .update({
                  resolved: true,
                  resolvedBy: userId,
                  resolvedAt: new Date().toISOString(),
                  resolution: resolution,
                })
                .eq("id", alertId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "ALERT_RESOLVED",
                entityType: "ALERT",
                entityId: alertId,
                details: { resolution: resolution },
                userId: userId,
              }),
            ];
          case 2:
            _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                message: "Alerta resolvido",
                timestamp: new Date(),
                requestId: crypto.randomUUID(),
              },
            ];
          case 3:
            error_13 = _a.sent();
            return [2 /*return*/, this.handleError("Erro ao resolver alerta", error_13)];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  MonitoringService.prototype.handleError = (message, error) => {
    console.error(message, error);
    return {
      success: false,
      error: error.message || "Erro interno do servidor",
      message: message,
      timestamp: new Date(),
      requestId: crypto.randomUUID(),
    };
  };
  return MonitoringService;
})();
exports.MonitoringService = MonitoringService;
