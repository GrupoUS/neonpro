"use strict";
/**
 * NeonPro Notification System - Core Manager
 * Story 1.7: Sistema de Notificações
 *
 * Gerenciador central do sistema de notificações
 * Coordena envio, templates, canais e automação
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
exports.NotificationManager = void 0;
exports.getNotificationManager = getNotificationManager;
exports.initializeNotificationSystem = initializeNotificationSystem;
var supabase_js_1 = require("@supabase/supabase-js");
var types_1 = require("./types");
var template_engine_1 = require("./template-engine");
var channel_orchestrator_1 = require("./channels/channel-orchestrator");
// import type { RuleEngine } from "./rule-engine";
// import type { MetricsCollector } from "./metrics-collector";
var audit_logger_1 = require("../auth/audit/audit-logger");
// ============================================================================
// NOTIFICATION MANAGER CLASS
// ============================================================================
/**
 * Gerenciador central do sistema de notificações
 */
var NotificationManager = /** @class */ (function () {
  function NotificationManager(supabaseUrl, supabaseKey) {
    this.isInitialized = false;
    this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    this.templateEngine = new template_engine_1.TemplateEngine();
    this.channelManager = new channel_orchestrator_1.ChannelOrchestrator();
    // this.ruleEngine = new RuleEngine();
    // this.metricsCollector = new MetricsCollector();
  }
  // ============================================================================
  // INICIALIZAÇÃO
  // ============================================================================
  /**
   * Inicializa o sistema de notificações
   */
  NotificationManager.prototype.initialize = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 8]);
            this.config = config;
            // Inicializar componentes
            return [4 /*yield*/, this.templateEngine.initialize()];
          case 1:
            // Inicializar componentes
            _a.sent();
            return [4 /*yield*/, this.channelManager.initialize(config.channels)];
          case 2:
            _a.sent();
            // await this.ruleEngine.initialize();
            // await this.metricsCollector.initialize();
            // Carregar templates e regras do banco
            return [4 /*yield*/, this.loadTemplates()];
          case 3:
            // await this.ruleEngine.initialize();
            // await this.metricsCollector.initialize();
            // Carregar templates e regras do banco
            _a.sent();
            return [4 /*yield*/, this.loadRules()];
          case 4:
            _a.sent();
            this.isInitialized = true;
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "notification_system_initialized",
                category: "system",
                severity: "info",
                details: {
                  channelsEnabled: config.channels.filter(function (c) {
                    return c.isEnabled;
                  }).length,
                  analyticsEnabled: config.analytics.enabled,
                  lgpdCompliance: config.compliance.lgpd.enabled,
                },
              }),
            ];
          case 5:
            _a.sent();
            return [3 /*break*/, 8];
          case 6:
            error_1 = _a.sent();
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "notification_system_init_failed",
                category: "system",
                severity: "error",
                details: { error: error_1.message },
              }),
            ];
          case 7:
            _a.sent();
            throw error_1;
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Verifica se o sistema está inicializado
   */
  NotificationManager.prototype.ensureInitialized = function () {
    if (!this.isInitialized) {
      throw new Error("NotificationManager não foi inicializado. Chame initialize() primeiro.");
    }
  };
  // ============================================================================
  // ENVIO DE NOTIFICAÇÕES
  // ============================================================================
  /**
   * Envia uma notificação
   */
  NotificationManager.prototype.sendNotification = function (type, recipient, data, options) {
    return __awaiter(this, void 0, void 0, function () {
      var notification_1, channels, deliveryNotifications, results, error_2;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.ensureInitialized();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 7, , 9]);
            return [
              4 /*yield*/,
              this.createNotification(
                type,
                data,
                options === null || options === void 0 ? void 0 : options.priority,
              ),
            ];
          case 2:
            notification_1 = _a.sent();
            channels = this.determineChannels(
              recipient,
              type,
              options === null || options === void 0 ? void 0 : options.channels,
            );
            // Verificar rate limiting
            return [4 /*yield*/, this.checkRateLimit(recipient, channels)];
          case 3:
            // Verificar rate limiting
            _a.sent();
            return [
              4 /*yield*/,
              Promise.all(
                channels.map(function (channel) {
                  return _this.createDeliveryNotification(
                    notification_1,
                    recipient,
                    channel,
                    options,
                  );
                }),
              ),
            ];
          case 4:
            deliveryNotifications = _a.sent();
            return [
              4 /*yield*/,
              Promise.all(
                deliveryNotifications.map(function (dn) {
                  return _this.deliverNotification(dn);
                }),
              ),
            ];
          case 5:
            results = _a.sent();
            // Registrar métricas
            // await this.metricsCollector.recordDelivery(deliveryNotifications, results);
            // Log de auditoria
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "notification_sent",
                category: "notification",
                severity: "info",
                details: {
                  type: type,
                  recipientId: recipient.id,
                  channels: channels.length,
                  success: results.filter(function (r) {
                    return r.success;
                  }).length,
                },
              }),
            ];
          case 6:
            // Registrar métricas
            // await this.metricsCollector.recordDelivery(deliveryNotifications, results);
            // Log de auditoria
            _a.sent();
            return [2 /*return*/, results];
          case 7:
            error_2 = _a.sent();
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "notification_send_failed",
                category: "notification",
                severity: "error",
                details: {
                  type: type,
                  recipientId: recipient.id,
                  error: error_2.message,
                },
              }),
            ];
          case 8:
            _a.sent();
            throw error_2;
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Envia notificação em lote
   */
  NotificationManager.prototype.sendBulkNotification = function (type, recipients, data, options) {
    return __awaiter(this, void 0, void 0, function () {
      var batchSize, results, i, batch, batchResults;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.ensureInitialized();
            batchSize =
              (options === null || options === void 0 ? void 0 : options.batchSize) || 100;
            results = [];
            i = 0;
            _a.label = 1;
          case 1:
            if (!(i < recipients.length)) return [3 /*break*/, 5];
            batch = recipients.slice(i, i + batchSize);
            return [
              4 /*yield*/,
              Promise.all(
                batch.map(function (recipient) {
                  return _this.sendNotification(type, recipient, data, options);
                }),
              ),
            ];
          case 2:
            batchResults = _a.sent();
            results.push.apply(results, batchResults);
            if (!(i + batchSize < recipients.length)) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, 1000);
              }),
            ];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            i += batchSize;
            return [3 /*break*/, 1];
          case 5:
            return [2 /*return*/, results];
        }
      });
    });
  };
  // ============================================================================
  // CRIAÇÃO DE NOTIFICAÇÕES
  // ============================================================================
  /**
   * Cria uma notificação base
   */
  NotificationManager.prototype.createNotification = function (type_1, data_1) {
    return __awaiter(this, arguments, void 0, function (type, data, priority) {
      var category, notification, error;
      if (priority === void 0) {
        priority = types_1.NotificationPriority.NORMAL;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            category = this.getNotificationCategory(type);
            notification = {
              id: crypto.randomUUID(),
              type: type,
              category: category,
              priority: priority,
              title: data.title || this.getDefaultTitle(type),
              message: data.message || "",
              data: data,
              metadata: {
                source: "notification-manager",
                version: "1.0.0",
                correlationId: data.correlationId || crypto.randomUUID(),
              },
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            return [4 /*yield*/, this.supabase.from("notifications").insert(notification)];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new Error("Erro ao salvar notifica\u00E7\u00E3o: ".concat(error.message));
            }
            return [2 /*return*/, notification];
        }
      });
    });
  };
  /**
   * Cria uma notificação de entrega
   */
  NotificationManager.prototype.createDeliveryNotification = function (
    notification,
    recipient,
    channel,
    options,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var template, context, renderedContent, deliveryNotification, error;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.getTemplate(
                notification.type,
                channel,
                options === null || options === void 0 ? void 0 : options.template,
              ),
            ];
          case 1:
            template = _b.sent();
            _a = {
              recipient: recipient,
            };
            return [4 /*yield*/, this.getClinicInfo(recipient.id)];
          case 2:
            context =
              ((_a.clinic = _b.sent()),
              (_a.data = notification.data || {}),
              (_a.timestamp = new Date()),
              (_a.locale = recipient.language || "pt-BR"),
              _a);
            return [4 /*yield*/, this.templateEngine.render(template, context)];
          case 3:
            renderedContent = _b.sent();
            deliveryNotification = __assign(__assign({}, notification), {
              title: renderedContent.title,
              message: renderedContent.body,
              recipient: recipient,
              channel: channel,
              template: template,
              scheduledFor: options === null || options === void 0 ? void 0 : options.scheduledFor,
              attempts: [],
              status: types_1.NotificationStatus.PENDING,
            });
            return [
              4 /*yield*/,
              this.supabase.from("notification_deliveries").insert({
                id: crypto.randomUUID(),
                notification_id: notification.id,
                recipient_id: recipient.id,
                channel: channel,
                template_id: template === null || template === void 0 ? void 0 : template.id,
                scheduled_for:
                  options === null || options === void 0 ? void 0 : options.scheduledFor,
                status: types_1.NotificationStatus.PENDING,
                created_at: new Date(),
              }),
            ];
          case 4:
            error = _b.sent().error;
            if (error) {
              throw new Error("Erro ao salvar delivery: ".concat(error.message));
            }
            return [2 /*return*/, deliveryNotification];
        }
      });
    });
  };
  // ============================================================================
  // ENTREGA DE NOTIFICAÇÕES
  // ============================================================================
  /**
   * Entrega uma notificação
   */
  NotificationManager.prototype.deliverNotification = function (notification) {
    return __awaiter(this, void 0, void 0, function () {
      var result, error_3, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 9]);
            if (!(notification.scheduledFor && notification.scheduledFor > new Date()))
              return [3 /*break*/, 2];
            return [4 /*yield*/, this.scheduleNotification(notification)];
          case 1:
            _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                status: types_1.NotificationStatus.PENDING,
                messageId: "scheduled_".concat(notification.id),
              },
            ];
          case 2:
            return [4 /*yield*/, this.channelManager.deliver(notification)];
          case 3:
            result = _a.sent();
            // Atualizar status
            return [4 /*yield*/, this.updateDeliveryStatus(notification.id, result)];
          case 4:
            // Atualizar status
            _a.sent();
            // Registrar evento
            return [
              4 /*yield*/,
              this.recordNotificationEvent(notification.id, "sent", {
                channel: notification.channel,
                messageId: result.messageId,
              }),
            ];
          case 5:
            // Registrar evento
            _a.sent();
            return [2 /*return*/, result];
          case 6:
            error_3 = _a.sent();
            result = {
              success: false,
              status: types_1.NotificationStatus.FAILED,
              error: error_3.message,
            };
            return [4 /*yield*/, this.updateDeliveryStatus(notification.id, result)];
          case 7:
            _a.sent();
            return [
              4 /*yield*/,
              this.recordNotificationEvent(notification.id, "failed", {
                error: error_3.message,
              }),
            ];
          case 8:
            _a.sent();
            return [2 /*return*/, result];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // TEMPLATES
  // ============================================================================
  /**
   * Busca template para notificação
   */
  NotificationManager.prototype.getTemplate = function (type, channel, templateId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!templateId) return [3 /*break*/, 2];
            return [4 /*yield*/, this.templateEngine.getTemplate(templateId)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            return [4 /*yield*/, this.templateEngine.getTemplateByType(type, channel)];
          case 3:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  /**
   * Carrega templates do banco
   */
  NotificationManager.prototype.loadTemplates = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, templates, error, _i, _b, template;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("notification_templates").select("*").eq("is_active", true),
            ];
          case 1:
            (_a = _c.sent()), (templates = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Erro ao carregar templates: ".concat(error.message));
            }
            (_i = 0), (_b = templates || []);
            _c.label = 2;
          case 2:
            if (!(_i < _b.length)) return [3 /*break*/, 5];
            template = _b[_i];
            return [4 /*yield*/, this.templateEngine.addTemplate(template)];
          case 3:
            _c.sent();
            _c.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================
  /**
   * Determina canais de entrega baseado nas preferências
   */
  NotificationManager.prototype.determineChannels = function (recipient, type, requestedChannels) {
    var _a;
    var category = this.getNotificationCategory(type);
    var preferences = recipient.preferences;
    if (requestedChannels) {
      // Filtrar apenas canais habilitados nas preferências
      return requestedChannels.filter(function (channel) {
        var _a;
        return (
          preferences.channels[channel] &&
          ((_a = preferences.categories[category]) === null || _a === void 0
            ? void 0
            : _a.channels.includes(channel))
        );
      });
    }
    // Usar preferências do usuário
    return (
      ((_a = preferences.categories[category]) === null || _a === void 0
        ? void 0
        : _a.channels) || [this.config.defaultChannel]
    );
  };
  /**
   * Obtém categoria da notificação
   */
  NotificationManager.prototype.getNotificationCategory = function (type) {
    var categoryMap = {
      appointment_: types_1.NotificationCategory.APPOINTMENT,
      patient_: types_1.NotificationCategory.PATIENT,
      system_: types_1.NotificationCategory.SYSTEM,
      security_: types_1.NotificationCategory.SECURITY,
      payment_: types_1.NotificationCategory.PAYMENT,
      promotional_: types_1.NotificationCategory.MARKETING,
      newsletter: types_1.NotificationCategory.MARKETING,
      campaign_: types_1.NotificationCategory.MARKETING,
      staff_: types_1.NotificationCategory.STAFF,
    };
    for (var _i = 0, _a = Object.entries(categoryMap); _i < _a.length; _i++) {
      var _b = _a[_i],
        prefix = _b[0],
        category = _b[1];
      if (type.startsWith(prefix)) {
        return category;
      }
    }
    return types_1.NotificationCategory.SYSTEM;
  };
  /**
   * Obtém título padrão para tipo de notificação
   */
  NotificationManager.prototype.getDefaultTitle = function (type) {
    var _a;
    var titles =
      ((_a = {}),
      (_a[types_1.NotificationType.APPOINTMENT_CREATED] = "Agendamento Criado"),
      (_a[types_1.NotificationType.APPOINTMENT_UPDATED] = "Agendamento Atualizado"),
      (_a[types_1.NotificationType.APPOINTMENT_CANCELLED] = "Agendamento Cancelado"),
      (_a[types_1.NotificationType.APPOINTMENT_REMINDER] = "Lembrete de Consulta"),
      (_a[types_1.NotificationType.APPOINTMENT_CONFIRMATION] = "Confirmação de Consulta"),
      (_a[types_1.NotificationType.PATIENT_REGISTERED] = "Cadastro Realizado"),
      (_a[types_1.NotificationType.PATIENT_UPDATED] = "Dados Atualizados"),
      (_a[types_1.NotificationType.PATIENT_BIRTHDAY] = "Feliz Aniversário!"),
      (_a[types_1.NotificationType.PATIENT_FOLLOW_UP] = "Acompanhamento"),
      (_a[types_1.NotificationType.SYSTEM_MAINTENANCE] = "Manutenção do Sistema"),
      (_a[types_1.NotificationType.SYSTEM_UPDATE] = "Atualização do Sistema"),
      (_a[types_1.NotificationType.SYSTEM_ALERT] = "Alerta do Sistema"),
      (_a[types_1.NotificationType.SECURITY_ALERT] = "Alerta de Segurança"),
      (_a[types_1.NotificationType.PAYMENT_RECEIVED] = "Pagamento Recebido"),
      (_a[types_1.NotificationType.PAYMENT_FAILED] = "Falha no Pagamento"),
      (_a[types_1.NotificationType.PAYMENT_REMINDER] = "Lembrete de Pagamento"),
      (_a[types_1.NotificationType.INVOICE_GENERATED] = "Fatura Gerada"),
      (_a[types_1.NotificationType.PROMOTIONAL_OFFER] = "Oferta Especial"),
      (_a[types_1.NotificationType.NEWSLETTER] = "Newsletter"),
      (_a[types_1.NotificationType.CAMPAIGN_MESSAGE] = "Mensagem da Campanha"),
      (_a[types_1.NotificationType.STAFF_SCHEDULE_CHANGE] = "Mudança de Horário"),
      (_a[types_1.NotificationType.STAFF_TASK_ASSIGNED] = "Nova Tarefa"),
      (_a[types_1.NotificationType.STAFF_PERFORMANCE_REPORT] = "Relatório de Performance"),
      _a);
    return titles[type] || "Notificação";
  };
  /**
   * Obtém informações da clínica
   */
  NotificationManager.prototype.getClinicInfo = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("clinics").select("*").eq("owner_id", userId).single(),
            ];
          case 1:
            data = _a.sent().data;
            return [
              2 /*return*/,
              data || {
                id: "default",
                name: "NeonPro Clinic",
                contact: {
                  phone: "(11) 99999-9999",
                  email: "contato@neonpro.com",
                  address: "São Paulo, SP",
                },
              },
            ];
        }
      });
    });
  };
  /**
   * Verifica rate limiting
   */
  NotificationManager.prototype.checkRateLimit = function (recipient, channels) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.config.rateLimiting.enabled) return [2 /*return*/];
            // Implementar verificação de rate limiting
            // Por simplicidade, apenas log por enquanto
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "rate_limit_check",
                category: "notification",
                severity: "info",
                details: {
                  recipientId: recipient.id,
                  channels: channels.length,
                },
              }),
            ];
          case 1:
            // Implementar verificação de rate limiting
            // Por simplicidade, apenas log por enquanto
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Agenda notificação
   */
  NotificationManager.prototype.scheduleNotification = function (notification) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Implementar agendamento (pode usar cron jobs, queue, etc.)
            return [
              4 /*yield*/,
              audit_logger_1.auditLogger.log({
                action: "notification_scheduled",
                category: "notification",
                severity: "info",
                details: {
                  notificationId: notification.id,
                  scheduledFor: notification.scheduledFor,
                },
              }),
            ];
          case 1:
            // Implementar agendamento (pode usar cron jobs, queue, etc.)
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Atualiza status de entrega
   */
  NotificationManager.prototype.updateDeliveryStatus = function (notificationId, result) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("notification_deliveries")
                .update({
                  status: result.status,
                  message_id: result.messageId,
                  error_message: result.error,
                  delivered_at: result.success ? new Date() : null,
                  updated_at: new Date(),
                })
                .eq("id", notificationId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Erro ao atualizar status:", error);
            }
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Registra evento de notificação
   */
  NotificationManager.prototype.recordNotificationEvent = function (notificationId, event, data) {
    return __awaiter(this, void 0, void 0, function () {
      var notificationEvent, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            notificationEvent = {
              id: crypto.randomUUID(),
              notificationId: notificationId,
              event: event,
              timestamp: new Date(),
              data: data,
            };
            return [
              4 /*yield*/,
              this.supabase.from("notification_events").insert(notificationEvent),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Erro ao registrar evento:", error);
            }
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Carrega regras de automação
   */
  NotificationManager.prototype.loadRules = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, rules, error, _i, _b, rule;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("notification_rules").select("*").eq("is_active", true),
            ];
          case 1:
            (_a = _c.sent()), (rules = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Erro ao carregar regras: ".concat(error.message));
            }
            for (_i = 0, _b = rules || []; _i < _b.length; _i++) {
              rule = _b[_i];
              // await this.ruleEngine.addRule(rule);
            }
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // MÉTODOS PÚBLICOS DE CONSULTA
  // ============================================================================
  /**
   * Busca notificações com filtros
   */
  NotificationManager.prototype.getNotifications = function (filters, pagination) {
    return __awaiter(this, void 0, void 0, function () {
      var query, offset, _a, data, error, count;
      var _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            this.ensureInitialized();
            query = this.supabase
              .from("notification_deliveries")
              .select(
                "\n        *,\n        notification:notifications(*),\n        recipient:recipients(*)\n      ",
              );
            // Aplicar filtros
            if ((_b = filters.types) === null || _b === void 0 ? void 0 : _b.length) {
              query = query.in("notification.type", filters.types);
            }
            if ((_c = filters.statuses) === null || _c === void 0 ? void 0 : _c.length) {
              query = query.in("status", filters.statuses);
            }
            if (filters.recipientId) {
              query = query.eq("recipient_id", filters.recipientId);
            }
            if (filters.dateRange) {
              query = query
                .gte("created_at", filters.dateRange.start.toISOString())
                .lte("created_at", filters.dateRange.end.toISOString());
            }
            offset = (pagination.page - 1) * pagination.limit;
            query = query
              .range(offset, offset + pagination.limit - 1)
              .order(pagination.sortBy || "created_at", {
                ascending: pagination.sortOrder === "asc",
              });
            return [4 /*yield*/, query];
          case 1:
            (_a = _d.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
            if (error) {
              throw new Error("Erro ao buscar notifica\u00E7\u00F5es: ".concat(error.message));
            }
            return [
              2 /*return*/,
              {
                data: data || [],
                pagination: {
                  page: pagination.page,
                  limit: pagination.limit,
                  total: count || 0,
                  totalPages: Math.ceil((count || 0) / pagination.limit),
                  hasNext: offset + pagination.limit < (count || 0),
                  hasPrev: pagination.page > 1,
                },
              },
            ];
        }
      });
    });
  };
  /**
   * Obtém métricas de notificação
   */
  NotificationManager.prototype.getMetrics = function (startDate, endDate, filters) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        this.ensureInitialized();
        // return await this.metricsCollector.getMetrics(startDate, endDate, filters);
        return [
          2 /*return*/,
          {
            totalSent: 0,
            totalDelivered: 0,
            totalFailed: 0,
            deliveryRate: 0,
            channels: {},
            trends: [],
          },
        ];
      });
    });
  };
  /**
   * Marca notificação como lida
   */
  NotificationManager.prototype.markAsRead = function (notificationId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.ensureInitialized();
            return [
              4 /*yield*/,
              this.supabase
                .from("notification_deliveries")
                .update({
                  status: types_1.NotificationStatus.READ,
                  read_at: new Date(),
                  updated_at: new Date(),
                })
                .eq("id", notificationId)
                .eq("recipient_id", userId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new Error("Erro ao marcar como lida: ".concat(error.message));
            }
            return [
              4 /*yield*/,
              this.recordNotificationEvent(notificationId, "read", { userId: userId }),
            ];
          case 2:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  return NotificationManager;
})();
exports.NotificationManager = NotificationManager;
// ============================================================================
// INSTÂNCIA SINGLETON
// ============================================================================
var notificationManager = null;
/**
 * Obtém instância singleton do NotificationManager
 */
function getNotificationManager() {
  if (!notificationManager) {
    var supabaseUrl = process.env.SUPABASE_URL;
    var supabaseKey = process.env.SUPABASE_ANON_KEY;
    notificationManager = new NotificationManager(supabaseUrl, supabaseKey);
  }
  return notificationManager;
}
/**
 * Inicializa o sistema de notificações
 */
function initializeNotificationSystem(config) {
  return __awaiter(this, void 0, void 0, function () {
    var manager;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          manager = getNotificationManager();
          return [4 /*yield*/, manager.initialize(config)];
        case 1:
          _a.sent();
          return [2 /*return*/, manager];
      }
    });
  });
}
