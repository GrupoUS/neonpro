"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationManager = exports.NotificationManager = exports.NotificationPriorityEnum = exports.NotificationChannelEnum = exports.NotificationTypeEnum = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var audit_logger_1 = require("../../auth/audit/audit-logger");
var encryption_1 = require("../../compliance/encryption");
var template_engine_1 = require("../templates/template-engine");
var channel_providers_1 = require("./channel-providers");
var notification_scheduler_1 = require("./notification-scheduler");
var notification_analytics_1 = require("./notification-analytics");
var NotificationTypeEnum;
(function (NotificationTypeEnum) {
    NotificationTypeEnum["APPOINTMENT_REMINDER"] = "appointment_reminder";
    NotificationTypeEnum["APPOINTMENT_CONFIRMATION"] = "appointment_confirmation";
    NotificationTypeEnum["APPOINTMENT_CANCELLATION"] = "appointment_cancellation";
    NotificationTypeEnum["TREATMENT_UPDATE"] = "treatment_update";
    NotificationTypeEnum["PAYMENT_REMINDER"] = "payment_reminder";
    NotificationTypeEnum["PAYMENT_CONFIRMATION"] = "payment_confirmation";
    NotificationTypeEnum["SECURITY_ALERT"] = "security_alert";
    NotificationTypeEnum["SYSTEM_MAINTENANCE"] = "system_maintenance";
    NotificationTypeEnum["MARKETING_CAMPAIGN"] = "marketing_campaign";
    NotificationTypeEnum["BIRTHDAY_GREETING"] = "birthday_greeting";
    NotificationTypeEnum["FOLLOW_UP"] = "follow_up";
    NotificationTypeEnum["EMERGENCY_ALERT"] = "emergency_alert";
})(NotificationTypeEnum || (exports.NotificationTypeEnum = NotificationTypeEnum = {}));
var NotificationChannelEnum;
(function (NotificationChannelEnum) {
    NotificationChannelEnum["EMAIL"] = "email";
    NotificationChannelEnum["SMS"] = "sms";
    NotificationChannelEnum["PUSH"] = "push";
    NotificationChannelEnum["WHATSAPP"] = "whatsapp";
    NotificationChannelEnum["IN_APP"] = "in_app";
})(NotificationChannelEnum || (exports.NotificationChannelEnum = NotificationChannelEnum = {}));
var NotificationPriorityEnum;
(function (NotificationPriorityEnum) {
    NotificationPriorityEnum["LOW"] = "low";
    NotificationPriorityEnum["NORMAL"] = "normal";
    NotificationPriorityEnum["HIGH"] = "high";
    NotificationPriorityEnum["URGENT"] = "urgent";
    NotificationPriorityEnum["EMERGENCY"] = "emergency";
})(NotificationPriorityEnum || (exports.NotificationPriorityEnum = NotificationPriorityEnum = {}));
var NotificationManager = /** @class */ (function () {
    function NotificationManager() {
        this.supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        this.auditLogger = new audit_logger_1.AuditLogger();
        this.lgpdManager = new LGPDManager();
        this.encryptionService = new encryption_1.EncryptionService();
        this.templateEngine = new template_engine_1.TemplateEngine();
        this.channelProvider = new channel_providers_1.ChannelProvider();
        this.scheduler = new notification_scheduler_1.NotificationScheduler();
        this.analytics = new notification_analytics_1.NotificationAnalytics();
    }
    /**
     * Envia uma notificação
     */
    NotificationManager.prototype.sendNotification = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var hasConsent, preferences, renderedContent, encryptedData, result, notification, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 11, , 13]);
                        // Validar configuração
                        return [4 /*yield*/, this.validateNotificationConfig(config)];
                    case 1:
                        // Validar configuração
                        _a.sent();
                        return [4 /*yield*/, this.lgpdManager.checkConsentForNotification(config.recipient_id, config.channel, config.type)];
                    case 2:
                        hasConsent = _a.sent();
                        if (!hasConsent) {
                            throw new Error('Usuário não possui consentimento para este tipo de notificação');
                        }
                        return [4 /*yield*/, this.getUserPreferences(config.recipient_id)];
                    case 3:
                        preferences = _a.sent();
                        if (!this.isChannelEnabled(preferences, config.channel)) {
                            throw new Error('Canal de notificação desabilitado pelo usuário');
                        }
                        // Verificar rate limiting
                        return [4 /*yield*/, this.checkRateLimit(config.recipient_id, config.channel)];
                    case 4:
                        // Verificar rate limiting
                        _a.sent();
                        return [4 /*yield*/, this.templateEngine.render(config.template_id, config.data)];
                    case 5:
                        renderedContent = _a.sent();
                        return [4 /*yield*/, this.encryptSensitiveData(config, renderedContent)];
                    case 6:
                        encryptedData = _a.sent();
                        return [4 /*yield*/, this.channelProvider.send(__assign(__assign({}, config), { content: encryptedData.content, subject: encryptedData.subject }))];
                    case 7:
                        result = _a.sent();
                        return [4 /*yield*/, this.saveNotification(config, result)];
                    case 8:
                        notification = _a.sent();
                        // Log de auditoria
                        return [4 /*yield*/, this.auditLogger.log({
                                action: 'notification_sent',
                                resource_type: 'notification',
                                resource_id: notification.id,
                                user_id: config.recipient_id,
                                details: {
                                    type: config.type,
                                    channel: config.channel,
                                    status: result.status
                                }
                            })];
                    case 9:
                        // Log de auditoria
                        _a.sent();
                        // Atualizar analytics
                        return [4 /*yield*/, this.analytics.recordNotificationSent({
                                type: config.type,
                                channel: config.channel,
                                recipient_type: config.recipient_type,
                                status: result.status
                            })];
                    case 10:
                        // Atualizar analytics
                        _a.sent();
                        return [2 /*return*/, result];
                    case 11:
                        error_1 = _a.sent();
                        return [4 /*yield*/, this.handleNotificationError(config, error_1)];
                    case 12:
                        _a.sent();
                        throw error_1;
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Agenda uma notificação para envio futuro
     */
    NotificationManager.prototype.scheduleNotification = function (config, scheduledAt) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        // Validar data de agendamento
                        if (scheduledAt <= new Date()) {
                            throw new Error('Data de agendamento deve ser no futuro');
                        }
                        return [4 /*yield*/, this.supabase
                                .from('notifications')
                                .insert(__assign(__assign({}, config), { status: 'scheduled', scheduled_at: scheduledAt.toISOString(), created_at: new Date().toISOString() }))
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        // Agendar no scheduler
                        return [4 /*yield*/, this.scheduler.schedule(data.id, scheduledAt)];
                    case 2:
                        // Agendar no scheduler
                        _b.sent();
                        return [4 /*yield*/, this.auditLogger.log({
                                action: 'notification_scheduled',
                                resource_type: 'notification',
                                resource_id: data.id,
                                user_id: config.recipient_id,
                                details: {
                                    type: config.type,
                                    channel: config.channel,
                                    scheduled_at: scheduledAt
                                }
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, data.id];
                    case 4:
                        error_2 = _b.sent();
                        throw new Error("Erro ao agendar notifica\u00E7\u00E3o: ".concat(error_2));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Envia notificações em lote
     */
    NotificationManager.prototype.sendBulkNotifications = function (configs) {
        return __awaiter(this, void 0, void 0, function () {
            var results, batchSize, i, batch, batchPromises, batchResults;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        batchSize = 100;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < configs.length)) return [3 /*break*/, 5];
                        batch = configs.slice(i, i + batchSize);
                        batchPromises = batch.map(function (config) {
                            return _this.sendNotification(config).catch(function (error) { return ({
                                id: '',
                                status: 'failed',
                                channel: config.channel,
                                error_message: error.message,
                                retry_count: 0
                            }); });
                        });
                        return [4 /*yield*/, Promise.all(batchPromises)];
                    case 2:
                        batchResults = _a.sent();
                        results.push.apply(results, batchResults);
                        if (!(i + batchSize < configs.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i += batchSize;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Obtém preferências de notificação do usuário
     */
    NotificationManager.prototype.getUserPreferences = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('notification_preferences')
                            .select('*')
                            .eq('user_id', userId)
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116') {
                            throw new Error("Erro ao buscar prefer\u00EAncias: ".concat(error.message));
                        }
                        // Retornar preferências padrão se não existir
                        if (!data) {
                            return [2 /*return*/, {
                                    user_id: userId,
                                    email_enabled: true,
                                    sms_enabled: true,
                                    push_enabled: true,
                                    whatsapp_enabled: false,
                                    timezone: 'America/Sao_Paulo',
                                    language: 'pt-BR',
                                    frequency_limit: 10,
                                    created_at: new Date(),
                                    updated_at: new Date()
                                }];
                        }
                        return [2 /*return*/, data];
                }
            });
        });
    };
    /**
     * Atualiza preferências de notificação do usuário
     */
    NotificationManager.prototype.updateUserPreferences = function (userId, preferences) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('notification_preferences')
                                .upsert(__assign(__assign({ user_id: userId }, preferences), { updated_at: new Date().toISOString() }))];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [4 /*yield*/, this.auditLogger.log({
                                action: 'notification_preferences_updated',
                                resource_type: 'notification_preferences',
                                resource_id: userId,
                                user_id: userId,
                                details: preferences
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        throw new Error("Erro ao atualizar prefer\u00EAncias: ".concat(error_3));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cancela uma notificação agendada
     */
    NotificationManager.prototype.cancelScheduledNotification = function (notificationId) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.supabase
                                .from('notifications')
                                .update({
                                status: 'cancelled',
                                updated_at: new Date().toISOString()
                            })
                                .eq('id', notificationId)
                                .eq('status', 'scheduled')];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        // Cancelar no scheduler
                        return [4 /*yield*/, this.scheduler.cancel(notificationId)];
                    case 2:
                        // Cancelar no scheduler
                        _a.sent();
                        return [4 /*yield*/, this.auditLogger.log({
                                action: 'notification_cancelled',
                                resource_type: 'notification',
                                resource_id: notificationId,
                                details: { reason: 'user_request' }
                            })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        throw new Error("Erro ao cancelar notifica\u00E7\u00E3o: ".concat(error_4));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Obtém histórico de notificações
     */
    NotificationManager.prototype.getNotificationHistory = function (userId, filters) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('notifications')
                            .select('*')
                            .eq('recipient_id', userId)
                            .order('created_at', { ascending: false });
                        if (filters === null || filters === void 0 ? void 0 : filters.type) {
                            query = query.eq('type', filters.type);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.channel) {
                            query = query.eq('channel', filters.channel);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.status) {
                            query = query.eq('status', filters.status);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.startDate) {
                            query = query.gte('created_at', filters.startDate.toISOString());
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.endDate) {
                            query = query.lte('created_at', filters.endDate.toISOString());
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.limit) {
                            query = query.limit(filters.limit);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.offset) {
                            query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 2:
                        error_5 = _b.sent();
                        throw new Error("Erro ao buscar hist\u00F3rico: ".concat(error_5));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Marca notificação como lida
     */
    NotificationManager.prototype.markAsRead = function (notificationId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('notifications')
                                .update({
                                read_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            })
                                .eq('id', notificationId)
                                .eq('recipient_id', userId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        // Atualizar analytics
                        return [4 /*yield*/, this.analytics.recordNotificationEngagement(notificationId, 'opened')];
                    case 2:
                        // Atualizar analytics
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        throw new Error("Erro ao marcar como lida: ".concat(error_6));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Métodos privados
    NotificationManager.prototype.validateNotificationConfig = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var template;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!config.recipient_id) {
                            throw new Error('recipient_id é obrigatório');
                        }
                        if (!config.template_id) {
                            throw new Error('template_id é obrigatório');
                        }
                        if (!Object.values(NotificationTypeEnum).includes(config.type)) {
                            throw new Error('Tipo de notificação inválido');
                        }
                        if (!Object.values(NotificationChannelEnum).includes(config.channel)) {
                            throw new Error('Canal de notificação inválido');
                        }
                        return [4 /*yield*/, this.templateEngine.getTemplate(config.template_id)];
                    case 1:
                        template = _a.sent();
                        if (!template) {
                            throw new Error('Template não encontrado');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    NotificationManager.prototype.isChannelEnabled = function (preferences, channel) {
        switch (channel) {
            case NotificationChannelEnum.EMAIL:
                return preferences.email_enabled;
            case NotificationChannelEnum.SMS:
                return preferences.sms_enabled;
            case NotificationChannelEnum.PUSH:
                return preferences.push_enabled;
            case NotificationChannelEnum.WHATSAPP:
                return preferences.whatsapp_enabled;
            default:
                return true;
        }
    };
    NotificationManager.prototype.checkRateLimit = function (userId, channel) {
        return __awaiter(this, void 0, void 0, function () {
            var preferences, now, oneDayAgo, count;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUserPreferences(userId)];
                    case 1:
                        preferences = _a.sent();
                        now = new Date();
                        oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, this.supabase
                                .from('notifications')
                                .select('*', { count: 'exact', head: true })
                                .eq('recipient_id', userId)
                                .eq('channel', channel)
                                .gte('created_at', oneDayAgo.toISOString())];
                    case 2:
                        count = (_a.sent()).count;
                        if (count && count >= preferences.frequency_limit) {
                            throw new Error('Limite de frequência de notificações excedido');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    NotificationManager.prototype.encryptSensitiveData = function (config, renderedContent) {
        return __awaiter(this, void 0, void 0, function () {
            var sensitiveTypes, _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        sensitiveTypes = [
                            NotificationTypeEnum.SECURITY_ALERT,
                            NotificationTypeEnum.PAYMENT_CONFIRMATION,
                            NotificationTypeEnum.TREATMENT_UPDATE
                        ];
                        if (!sensitiveTypes.includes(config.type)) return [3 /*break*/, 5];
                        _b = {};
                        if (!renderedContent.subject) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.encryptionService.encrypt(renderedContent.subject)];
                    case 1:
                        _a = _c.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = undefined;
                        _c.label = 3;
                    case 3:
                        _b.subject = _a;
                        return [4 /*yield*/, this.encryptionService.encrypt(renderedContent.content)];
                    case 4: return [2 /*return*/, (_b.content = _c.sent(),
                            _b)];
                    case 5: return [2 /*return*/, renderedContent];
                }
            });
        });
    };
    NotificationManager.prototype.saveNotification = function (config, result) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('notifications')
                            .insert(__assign(__assign({}, config), { status: result.status, sent_at: (_b = result.sent_at) === null || _b === void 0 ? void 0 : _b.toISOString(), delivered_at: (_c = result.delivered_at) === null || _c === void 0 ? void 0 : _c.toISOString(), error_message: result.error_message, retry_count: result.retry_count, cost: result.cost, created_at: new Date().toISOString() }))
                            .select()
                            .single()];
                    case 1:
                        _a = _d.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    NotificationManager.prototype.handleNotificationError = function (config, error) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.auditLogger.log({
                            action: 'notification_error',
                            resource_type: 'notification',
                            resource_id: config.id,
                            user_id: config.recipient_id,
                            details: {
                                error: error.message,
                                type: config.type,
                                channel: config.channel
                            }
                        })];
                    case 1:
                        _a.sent();
                        if (!this.shouldRetry(error)) return [3 /*break*/, 3];
                        // Agendar retry
                        return [4 /*yield*/, this.scheduleRetry(config)];
                    case 2:
                        // Agendar retry
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    NotificationManager.prototype.shouldRetry = function (error) {
        // Implementar lógica de retry baseada no tipo de erro
        var retryableErrors = [
            'network_error',
            'timeout',
            'rate_limit',
            'temporary_failure'
        ];
        return retryableErrors.some(function (retryableError) {
            return error.message.toLowerCase().includes(retryableError);
        });
    };
    NotificationManager.prototype.scheduleRetry = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var retryDelay, retryAt;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        retryDelay = Math.min(1000 * Math.pow(2, ((_a = config.metadata) === null || _a === void 0 ? void 0 : _a.retry_count) || 0), 300000);
                        retryAt = new Date(Date.now() + retryDelay);
                        return [4 /*yield*/, this.scheduleNotification(__assign(__assign({}, config), { metadata: __assign(__assign({}, config.metadata), { retry_count: (((_b = config.metadata) === null || _b === void 0 ? void 0 : _b.retry_count) || 0) + 1, original_attempt: ((_c = config.metadata) === null || _c === void 0 ? void 0 : _c.original_attempt) || new Date() }) }), retryAt)];
                    case 1:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return NotificationManager;
}());
exports.NotificationManager = NotificationManager;
// Export factory function instead of singleton to avoid global initialization
var createNotificationManager = function () { return new NotificationManager(); };
exports.createNotificationManager = createNotificationManager;
exports.default = NotificationManager;
