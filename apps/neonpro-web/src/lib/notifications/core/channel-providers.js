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
exports.ChannelProvider = void 0;
var notification_manager_1 = require("./notification-manager");
var email_provider_1 = require("../channels/email-provider");
var sms_provider_1 = require("../channels/sms-provider");
var push_provider_1 = require("../channels/push-provider");
var whatsapp_provider_1 = require("../channels/whatsapp-provider");
var audit_logger_1 = require("../../auth/audit/audit-logger");
var ChannelProvider = /** @class */ (function () {
  function ChannelProvider() {
    this.emailProvider = new email_provider_1.EmailProvider();
    this.smsProvider = new sms_provider_1.SMSProvider();
    this.pushProvider = new push_provider_1.PushProvider();
    this.whatsappProvider = new whatsapp_provider_1.WhatsAppProvider();
    this.auditLogger = new audit_logger_1.AuditLogger();
    this.channelConfigs = new Map();
    this.metrics = new Map();
    this.initializeChannelConfigs();
    this.initializeMetrics();
  }
  /**
   * Envia notificação através do canal especificado
   */
  ChannelProvider.prototype.send = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, channelConfig, provider, result, _a, _b, error_1, fallbackResult;
      var _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            startTime = Date.now();
            _d.label = 1;
          case 1:
            _d.trys.push([1, 7, , 10]);
            channelConfig = this.channelConfigs.get(config.channel);
            if (
              !(channelConfig === null || channelConfig === void 0 ? void 0 : channelConfig.enabled)
            ) {
              throw new Error("Canal ".concat(config.channel, " est\u00E1 desabilitado"));
            }
            // Verificar rate limiting
            return [4 /*yield*/, this.checkRateLimit(config.channel)];
          case 2:
            // Verificar rate limiting
            _d.sent();
            provider = this.getProvider(config.channel);
            _b = (_a = provider).send;
            _c = {};
            return [4 /*yield*/, this.getRecipientContact(config.recipient_id, config.channel)];
          case 3:
            return [
              4 /*yield*/,
              _b.apply(_a, [
                ((_c.to = _d.sent()),
                (_c.subject = config.data.subject),
                (_c.content = config.data.content),
                (_c.metadata = __assign(
                  { notification_id: config.id, type: config.type, priority: config.priority },
                  config.metadata,
                )),
                _c),
              ]),
            ];
          case 4:
            result = _d.sent();
            // Atualizar métricas
            return [
              4 /*yield*/,
              this.updateMetrics(config.channel, result, Date.now() - startTime),
            ];
          case 5:
            // Atualizar métricas
            _d.sent();
            // Log de auditoria
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "notification_channel_send",
                resource_type: "notification",
                resource_id: config.id,
                details: {
                  channel: config.channel,
                  status: result.status,
                  delivery_time_ms: Date.now() - startTime,
                },
              }),
            ];
          case 6:
            // Log de auditoria
            _d.sent();
            return [
              2 /*return*/,
              {
                id: result.id || config.id,
                status: result.status,
                channel: config.channel,
                sent_at: new Date(),
                delivered_at: result.delivered_at,
                error_message: result.error_message,
                retry_count: 0,
                cost: channelConfig.cost_per_message,
                engagement: result.engagement,
              },
            ];
          case 7:
            error_1 = _d.sent();
            return [4 /*yield*/, this.tryFallback(config, error_1)];
          case 8:
            fallbackResult = _d.sent();
            if (fallbackResult) {
              return [2 /*return*/, fallbackResult];
            }
            // Atualizar métricas de falha
            return [4 /*yield*/, this.updateFailureMetrics(config.channel, error_1)];
          case 9:
            // Atualizar métricas de falha
            _d.sent();
            throw error_1;
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Envia notificação com fallback automático
   */
  ChannelProvider.prototype.sendWithFallback = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var channelConfig,
        fallbackChannels,
        primaryError_1,
        _i,
        fallbackChannels_1,
        fallbackChannel,
        fallbackConfig,
        result,
        fallbackError_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            channelConfig = this.channelConfigs.get(config.channel);
            fallbackChannels =
              (channelConfig === null || channelConfig === void 0
                ? void 0
                : channelConfig.fallback_channels) || [];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 11]);
            return [4 /*yield*/, this.send(config)];
          case 2:
            return [2 /*return*/, _a.sent()];
          case 3:
            primaryError_1 = _a.sent();
            (_i = 0), (fallbackChannels_1 = fallbackChannels);
            _a.label = 4;
          case 4:
            if (!(_i < fallbackChannels_1.length)) return [3 /*break*/, 10];
            fallbackChannel = fallbackChannels_1[_i];
            _a.label = 5;
          case 5:
            _a.trys.push([5, 8, , 9]);
            fallbackConfig = __assign(__assign({}, config), { channel: fallbackChannel });
            return [4 /*yield*/, this.send(fallbackConfig)];
          case 6:
            result = _a.sent();
            // Log do uso de fallback
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "notification_fallback_used",
                resource_type: "notification",
                resource_id: config.id,
                details: {
                  original_channel: config.channel,
                  fallback_channel: fallbackChannel,
                  primary_error: primaryError_1.message,
                },
              }),
            ];
          case 7:
            // Log do uso de fallback
            _a.sent();
            return [2 /*return*/, result];
          case 8:
            fallbackError_1 = _a.sent();
            // Continuar para próximo fallback
            return [3 /*break*/, 9];
          case 9:
            _i++;
            return [3 /*break*/, 4];
          case 10:
            // Se todos os fallbacks falharam, lançar erro original
            throw primaryError_1;
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém métricas de um canal específico
   */
  ChannelProvider.prototype.getChannelMetrics = function (channel) {
    return this.metrics.get(channel);
  };
  /**
   * Obtém métricas de todos os canais
   */
  ChannelProvider.prototype.getAllChannelMetrics = function () {
    return Array.from(this.metrics.values());
  };
  /**
   * Atualiza configuração de um canal
   */
  ChannelProvider.prototype.updateChannelConfig = function (channel, config) {
    return __awaiter(this, void 0, void 0, function () {
      var currentConfig, updatedConfig;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            currentConfig = this.channelConfigs.get(channel) || this.getDefaultChannelConfig();
            updatedConfig = __assign(__assign({}, currentConfig), config);
            this.channelConfigs.set(channel, updatedConfig);
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "channel_config_updated",
                resource_type: "channel_config",
                resource_id: channel,
                details: { updated_config: config },
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém configuração de um canal
   */
  ChannelProvider.prototype.getChannelConfig = function (channel) {
    return this.channelConfigs.get(channel);
  };
  /**
   * Testa conectividade de um canal
   */
  ChannelProvider.prototype.testChannel = function (channel) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, provider, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            provider = this.getProvider(channel);
            return [4 /*yield*/, provider.test()];
          case 2:
            _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                response_time_ms: Date.now() - startTime,
              },
            ];
          case 3:
            error_2 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                response_time_ms: Date.now() - startTime,
                error_message: error_2.message,
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém status de saúde de todos os canais
   */
  ChannelProvider.prototype.getChannelsHealthStatus = function () {
    return __awaiter(this, void 0, void 0, function () {
      var healthStatus, _i, _a, channel, metrics, testResult, errorRate, status_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            healthStatus = {};
            (_i = 0), (_a = Object.values(notification_manager_1.NotificationChannelEnum));
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            channel = _a[_i];
            metrics = this.metrics.get(channel);
            return [4 /*yield*/, this.testChannel(channel)];
          case 2:
            testResult = _b.sent();
            errorRate = metrics ? (metrics.total_failed / (metrics.total_sent || 1)) * 100 : 0;
            status_1 = "healthy";
            if (!testResult.success) {
              status_1 = "down";
            } else if (errorRate > 10 || testResult.response_time_ms > 5000) {
              status_1 = "degraded";
            }
            healthStatus[channel] = {
              status: status_1,
              last_check: new Date(),
              response_time_ms: testResult.response_time_ms,
              error_rate_24h: errorRate,
              uptime_percentage: metrics
                ? (metrics.total_delivered / (metrics.total_sent || 1)) * 100
                : 100,
            };
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/, healthStatus];
        }
      });
    });
  };
  // Métodos privados
  ChannelProvider.prototype.initializeChannelConfigs = function () {
    var _a;
    // Configurações padrão para cada canal
    var defaultConfigs =
      ((_a = {}),
      (_a[notification_manager_1.NotificationChannelEnum.EMAIL] = {
        enabled: true,
        priority: 1,
        fallback_channels: [notification_manager_1.NotificationChannelEnum.SMS],
        rate_limit: {
          requests_per_minute: 100,
          requests_per_hour: 1000,
          requests_per_day: 10000,
        },
        retry_config: {
          max_retries: 3,
          retry_delay_ms: 1000,
          exponential_backoff: true,
        },
        cost_per_message: 0.01,
      }),
      (_a[notification_manager_1.NotificationChannelEnum.SMS] = {
        enabled: true,
        priority: 2,
        fallback_channels: [notification_manager_1.NotificationChannelEnum.EMAIL],
        rate_limit: {
          requests_per_minute: 50,
          requests_per_hour: 500,
          requests_per_day: 2000,
        },
        retry_config: {
          max_retries: 2,
          retry_delay_ms: 2000,
          exponential_backoff: true,
        },
        cost_per_message: 0.05,
      }),
      (_a[notification_manager_1.NotificationChannelEnum.PUSH] = {
        enabled: true,
        priority: 3,
        fallback_channels: [notification_manager_1.NotificationChannelEnum.EMAIL],
        rate_limit: {
          requests_per_minute: 200,
          requests_per_hour: 2000,
          requests_per_day: 20000,
        },
        retry_config: {
          max_retries: 3,
          retry_delay_ms: 500,
          exponential_backoff: true,
        },
        cost_per_message: 0.001,
      }),
      (_a[notification_manager_1.NotificationChannelEnum.WHATSAPP] = {
        enabled: false, // Desabilitado por padrão até configuração
        priority: 4,
        fallback_channels: [
          notification_manager_1.NotificationChannelEnum.SMS,
          notification_manager_1.NotificationChannelEnum.EMAIL,
        ],
        rate_limit: {
          requests_per_minute: 30,
          requests_per_hour: 300,
          requests_per_day: 1000,
        },
        retry_config: {
          max_retries: 2,
          retry_delay_ms: 3000,
          exponential_backoff: true,
        },
        cost_per_message: 0.03,
      }),
      (_a[notification_manager_1.NotificationChannelEnum.IN_APP] = {
        enabled: true,
        priority: 5,
        rate_limit: {
          requests_per_minute: 500,
          requests_per_hour: 5000,
          requests_per_day: 50000,
        },
        retry_config: {
          max_retries: 1,
          retry_delay_ms: 100,
          exponential_backoff: false,
        },
        cost_per_message: 0,
      }),
      _a);
    for (var _i = 0, _b = Object.entries(defaultConfigs); _i < _b.length; _i++) {
      var _c = _b[_i],
        channel = _c[0],
        config = _c[1];
      this.channelConfigs.set(channel, config);
    }
  };
  ChannelProvider.prototype.initializeMetrics = function () {
    for (
      var _i = 0, _a = Object.values(notification_manager_1.NotificationChannelEnum);
      _i < _a.length;
      _i++
    ) {
      var channel = _a[_i];
      this.metrics.set(channel, {
        channel: channel,
        total_sent: 0,
        total_delivered: 0,
        total_failed: 0,
        delivery_rate: 0,
        average_delivery_time_ms: 0,
        total_cost: 0,
        last_updated: new Date(),
      });
    }
  };
  ChannelProvider.prototype.getProvider = function (channel) {
    switch (channel) {
      case notification_manager_1.NotificationChannelEnum.EMAIL:
        return this.emailProvider;
      case notification_manager_1.NotificationChannelEnum.SMS:
        return this.smsProvider;
      case notification_manager_1.NotificationChannelEnum.PUSH:
        return this.pushProvider;
      case notification_manager_1.NotificationChannelEnum.WHATSAPP:
        return this.whatsappProvider;
      default:
        throw new Error("Provider n\u00E3o encontrado para canal: ".concat(channel));
    }
  };
  ChannelProvider.prototype.getRecipientContact = function (recipientId, channel) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar lógica para obter contato do destinatário baseado no canal
        // Por exemplo: email, telefone, device token, etc.
        // Esta é uma implementação simplificada
        // Na prática, você buscaria no banco de dados do usuário
        switch (channel) {
          case notification_manager_1.NotificationChannelEnum.EMAIL:
            return [2 /*return*/, "user-".concat(recipientId, "@example.com")];
          case notification_manager_1.NotificationChannelEnum.SMS:
          case notification_manager_1.NotificationChannelEnum.WHATSAPP:
            return [2 /*return*/, "+55119".concat(recipientId.slice(-8))];
          case notification_manager_1.NotificationChannelEnum.PUSH:
            return [2 /*return*/, "device-token-".concat(recipientId)];
          default:
            return [2 /*return*/, recipientId];
        }
        return [2 /*return*/];
      });
    });
  };
  ChannelProvider.prototype.checkRateLimit = function (channel) {
    return __awaiter(this, void 0, void 0, function () {
      var config, metrics;
      return __generator(this, function (_a) {
        config = this.channelConfigs.get(channel);
        if (!(config === null || config === void 0 ? void 0 : config.rate_limit))
          return [2 /*return*/];
        metrics = this.metrics.get(channel);
        if (!metrics) return [2 /*return*/];
        return [2 /*return*/];
      });
    });
  };
  ChannelProvider.prototype.updateMetrics = function (channel, result, deliveryTimeMs) {
    return __awaiter(this, void 0, void 0, function () {
      var metrics, channelConfig;
      return __generator(this, function (_a) {
        metrics = this.metrics.get(channel);
        if (!metrics) return [2 /*return*/];
        metrics.total_sent++;
        if (result.status === "sent" || result.status === "delivered") {
          metrics.total_delivered++;
        } else {
          metrics.total_failed++;
        }
        metrics.delivery_rate = (metrics.total_delivered / metrics.total_sent) * 100;
        // Atualizar tempo médio de entrega
        metrics.average_delivery_time_ms = (metrics.average_delivery_time_ms + deliveryTimeMs) / 2;
        channelConfig = this.channelConfigs.get(channel);
        if (
          channelConfig === null || channelConfig === void 0
            ? void 0
            : channelConfig.cost_per_message
        ) {
          metrics.total_cost += channelConfig.cost_per_message;
        }
        metrics.last_updated = new Date();
        this.metrics.set(channel, metrics);
        return [2 /*return*/];
      });
    });
  };
  ChannelProvider.prototype.updateFailureMetrics = function (channel, error) {
    return __awaiter(this, void 0, void 0, function () {
      var metrics;
      return __generator(this, function (_a) {
        metrics = this.metrics.get(channel);
        if (!metrics) return [2 /*return*/];
        metrics.total_failed++;
        metrics.delivery_rate = (metrics.total_delivered / (metrics.total_sent + 1)) * 100;
        metrics.last_updated = new Date();
        this.metrics.set(channel, metrics);
        return [2 /*return*/];
      });
    });
  };
  ChannelProvider.prototype.tryFallback = function (config, error) {
    return __awaiter(this, void 0, void 0, function () {
      var channelConfig, fallbackChannels, fallbackChannel, fallbackConfig, fallbackError_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            channelConfig = this.channelConfigs.get(config.channel);
            fallbackChannels =
              channelConfig === null || channelConfig === void 0
                ? void 0
                : channelConfig.fallback_channels;
            if (!fallbackChannels || fallbackChannels.length === 0) {
              return [2 /*return*/, null];
            }
            fallbackChannel = fallbackChannels[0];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            fallbackConfig = __assign(__assign({}, config), { channel: fallbackChannel });
            return [4 /*yield*/, this.send(fallbackConfig)];
          case 2:
            return [2 /*return*/, _a.sent()];
          case 3:
            fallbackError_2 = _a.sent();
            return [2 /*return*/, null];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  ChannelProvider.prototype.getDefaultChannelConfig = function () {
    return {
      enabled: true,
      priority: 999,
      rate_limit: {
        requests_per_minute: 10,
        requests_per_hour: 100,
        requests_per_day: 1000,
      },
      retry_config: {
        max_retries: 1,
        retry_delay_ms: 1000,
        exponential_backoff: false,
      },
      cost_per_message: 0,
    };
  };
  return ChannelProvider;
})();
exports.ChannelProvider = ChannelProvider;
exports.default = ChannelProvider;
