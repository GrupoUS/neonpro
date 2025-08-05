"use strict";
/**
 * Sistema de Agendamento Inteligente de Notificações - NeonPro
 *
 * Componente responsável por agendar e otimizar o timing de envio de notificações,
 * utilizando ML para personalização e análise de padrões comportamentais.
 *
 * Features:
 * - Agendamento flexível (recorrente, único, condicional)
 * - Otimização por timezone e fuso horário
 * - Machine Learning para timing personalizado
 * - Rate limiting inteligente
 * - Fallback automático
 *
 * @author APEX Architecture Team
 * @version 1.0.0
 * @compliance LGPD, ANVISA, CFM
 */
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
exports.createnotificationScheduler = exports.NotificationScheduler = void 0;
var zod_1 = require("zod");
var server_1 = require("@/lib/supabase/server");
var types_1 = require("../types");
var notification_manager_1 = require("../core/notification-manager");
// ================================================================================
// SCHEMAS & TYPES
// ================================================================================
var ScheduleConfigSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().max(500).optional(),
    clinicId: zod_1.z.string().uuid(),
    createdBy: zod_1.z.string().uuid(),
    isActive: zod_1.z.boolean().default(true),
    // Configuração da notificação
    template: zod_1.z.object({
        templateId: zod_1.z.string().uuid().optional(),
        content: zod_1.z.string().min(1),
        subject: zod_1.z.string().optional(),
        variables: zod_1.z.record(zod_1.z.string()).optional(),
    }),
    // Configuração de envio
    channels: zod_1.z.array(zod_1.z.nativeEnum(types_1.NotificationChannel)),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    // Configuração de agendamento
    schedule: zod_1.z.object({
        type: zod_1.z.enum(['immediate', 'delayed', 'recurring', 'conditional']),
        timezone: zod_1.z.string().default('America/Sao_Paulo'),
        // Para agendamento atrasado
        delayMinutes: zod_1.z.number().optional(),
        scheduledAt: zod_1.z.string().datetime().optional(),
        // Para agendamento recorrente
        cron: zod_1.z.string().optional(),
        recurrence: zod_1.z.object({
            frequency: zod_1.z.enum(['daily', 'weekly', 'monthly', 'yearly']),
            interval: zod_1.z.number().min(1).default(1),
            daysOfWeek: zod_1.z.array(zod_1.z.number().min(0).max(6)).optional(),
            dayOfMonth: zod_1.z.number().min(1).max(31).optional(),
            endDate: zod_1.z.string().datetime().optional(),
            maxOccurrences: zod_1.z.number().optional(),
        }).optional(),
        // Para agendamento condicional
        conditions: zod_1.z.array(zod_1.z.object({
            field: zod_1.z.string(),
            operator: zod_1.z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains']),
            value: zod_1.z.any(),
        })).optional(),
    }),
    // Configuração de audiência
    audience: zod_1.z.object({
        type: zod_1.z.enum(['all', 'users', 'patients', 'staff', 'custom']),
        userIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
        filters: zod_1.z.array(zod_1.z.object({
            field: zod_1.z.string(),
            operator: zod_1.z.string(),
            value: zod_1.z.any(),
        })).optional(),
        segmentId: zod_1.z.string().uuid().optional(),
    }),
    // Configurações avançadas
    options: zod_1.z.object({
        enablePersonalization: zod_1.z.boolean().default(true),
        optimizeDeliveryTime: zod_1.z.boolean().default(true),
        respectQuietHours: zod_1.z.boolean().default(true),
        quietHours: zod_1.z.object({
            start: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
            end: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
        }).optional(),
        maxRetriesPerChannel: zod_1.z.number().min(0).max(5).default(3),
        enableFallback: zod_1.z.boolean().default(true),
        batchSize: zod_1.z.number().min(1).max(1000).default(100),
    }).optional(),
});
// ================================================================================
// NOTIFICATION SCHEDULER
// ================================================================================
var NotificationScheduler = /** @class */ (function () {
    function NotificationScheduler() {
        this.isProcessing = false;
        this.processingInterval = null;
        this.supabase = (0, server_1.createClient)();
        this.startScheduleProcessor();
    }
    // ================================================================================
    // SCHEDULE MANAGEMENT
    // ================================================================================
    /**
     * Cria um novo agendamento de notificação
     */
    NotificationScheduler.prototype.createSchedule = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var validatedConfig, _a, schedule, scheduleError, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        validatedConfig = ScheduleConfigSchema.parse(__assign({ id: crypto.randomUUID() }, config));
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, this.supabase
                                .from('notification_schedules')
                                .insert({
                                id: validatedConfig.id,
                                name: validatedConfig.name,
                                description: validatedConfig.description,
                                clinic_id: validatedConfig.clinicId,
                                created_by: validatedConfig.createdBy,
                                is_active: validatedConfig.isActive,
                                template_config: validatedConfig.template,
                                channels: validatedConfig.channels,
                                priority: validatedConfig.priority,
                                schedule_config: validatedConfig.schedule,
                                audience_config: validatedConfig.audience,
                                options: validatedConfig.options,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            })
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), schedule = _a.data, scheduleError = _a.error;
                        if (scheduleError) {
                            throw new Error("Erro ao criar agendamento: ".concat(scheduleError.message));
                        }
                        if (!(validatedConfig.schedule.type === 'immediate')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.processSchedule(validatedConfig.id)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 4: 
                    // Gerar próximas execuções
                    return [4 /*yield*/, this.generateUpcomingExecutions(validatedConfig.id)];
                    case 5:
                        // Gerar próximas execuções
                        _b.sent();
                        _b.label = 6;
                    case 6:
                        console.log("\uD83D\uDCC5 Agendamento criado: ".concat(validatedConfig.id, " - ").concat(validatedConfig.name));
                        return [2 /*return*/, validatedConfig.id];
                    case 7:
                        error_1 = _b.sent();
                        console.error('Erro ao criar agendamento:', error_1);
                        throw error_1;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Atualiza uma configuração de agendamento existente
     */
    NotificationScheduler.prototype.updateSchedule = function (scheduleId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.supabase
                                .from('notification_schedules')
                                .update(__assign(__assign({}, updates), { updated_at: new Date().toISOString() }))
                                .eq('id', scheduleId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            throw new Error("Erro ao atualizar agendamento: ".concat(error.message));
                        }
                        if (!updates.schedule) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.generateUpcomingExecutions(scheduleId)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        console.log("\uD83D\uDCC5 Agendamento atualizado: ".concat(scheduleId));
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.error('Erro ao atualizar agendamento:', error_2);
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cancela um agendamento
     */
    NotificationScheduler.prototype.cancelSchedule = function (scheduleId) {
        return __awaiter(this, void 0, void 0, function () {
            var scheduleError, notificationsError, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('notification_schedules')
                                .update({
                                is_active: false,
                                updated_at: new Date().toISOString(),
                            })
                                .eq('id', scheduleId)];
                    case 1:
                        scheduleError = (_a.sent()).error;
                        if (scheduleError) {
                            throw new Error("Erro ao cancelar agendamento: ".concat(scheduleError.message));
                        }
                        return [4 /*yield*/, this.supabase
                                .from('scheduled_notifications')
                                .update({
                                status: 'cancelled',
                                updated_at: new Date().toISOString(),
                            })
                                .eq('schedule_id', scheduleId)
                                .eq('status', 'pending')];
                    case 2:
                        notificationsError = (_a.sent()).error;
                        if (notificationsError) {
                            console.error('Erro ao cancelar notificações pendentes:', notificationsError);
                        }
                        console.log("\uD83D\uDCC5 Agendamento cancelado: ".concat(scheduleId));
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Erro ao cancelar agendamento:', error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ================================================================================
    // SCHEDULE PROCESSING
    // ================================================================================
    /**
     * Inicia o processador de agendamentos
     */
    NotificationScheduler.prototype.startScheduleProcessor = function () {
        var _this = this;
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
        }
        // Processar a cada minuto
        this.processingInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.isProcessing) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.processScheduledNotifications()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); }, 60 * 1000);
        console.log('📅 Processador de agendamentos iniciado');
    };
    /**
     * Para o processador de agendamentos
     */
    NotificationScheduler.prototype.stopScheduleProcessor = function () {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
        console.log('📅 Processador de agendamentos parado');
    };
    /**
     * Processa notificações agendadas que estão prontas para envio
     */
    NotificationScheduler.prototype.processScheduledNotifications = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, _a, notifications, error, groupedBySchedule_1, results, error_4;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.isProcessing)
                            return [2 /*return*/];
                        this.isProcessing = true;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, 5, 6]);
                        now = new Date();
                        return [4 /*yield*/, this.supabase
                                .from('scheduled_notifications')
                                .select("\n          *,\n          notification_schedules!inner(*)\n        ")
                                .eq('status', 'pending')
                                .lte('scheduled_for', now.toISOString())
                                .limit(100)];
                    case 2:
                        _a = _b.sent(), notifications = _a.data, error = _a.error;
                        if (error) {
                            console.error('Erro ao buscar notificações agendadas:', error);
                            return [2 /*return*/];
                        }
                        if (!notifications || notifications.length === 0) {
                            return [2 /*return*/];
                        }
                        console.log("\uD83D\uDCC5 Processando ".concat(notifications.length, " notifica\u00E7\u00F5es agendadas"));
                        groupedBySchedule_1 = new Map();
                        notifications.forEach(function (notification) {
                            var scheduleId = notification.schedule_id;
                            if (!groupedBySchedule_1.has(scheduleId)) {
                                groupedBySchedule_1.set(scheduleId, []);
                            }
                            groupedBySchedule_1.get(scheduleId).push(notification);
                        });
                        return [4 /*yield*/, Promise.allSettled(Array.from(groupedBySchedule_1.entries()).map(function (_a) {
                                var scheduleId = _a[0], notifications = _a[1];
                                return _this.processBatch(scheduleId, notifications);
                            }))];
                    case 3:
                        results = _b.sent();
                        // Log resultados
                        results.forEach(function (result, index) {
                            if (result.status === 'rejected') {
                                console.error("Erro ao processar lote ".concat(index, ":"), result.reason);
                            }
                        });
                        return [3 /*break*/, 6];
                    case 4:
                        error_4 = _b.sent();
                        console.error('Erro no processamento de agendamentos:', error_4);
                        return [3 /*break*/, 6];
                    case 5:
                        this.isProcessing = false;
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Processa um lote de notificações de um agendamento específico
     */
    NotificationScheduler.prototype.processBatch = function (scheduleId, notifications) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, totalQueued, totalFailed, errors, _i, notifications_1, notification, finalTime, optimization, nextAvailable, error_5, errorMessage, maxRetries, retryDelay, retryTime, error_6;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        startTime = Date.now();
                        totalQueued = 0;
                        totalFailed = 0;
                        errors = [];
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 17, , 18]);
                        _i = 0, notifications_1 = notifications;
                        _e.label = 2;
                    case 2:
                        if (!(_i < notifications_1.length)) return [3 /*break*/, 16];
                        notification = notifications_1[_i];
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 11, , 15]);
                        // Marcar como processando
                        return [4 /*yield*/, this.supabase
                                .from('scheduled_notifications')
                                .update({
                                status: 'processing',
                                updated_at: new Date().toISOString(),
                            })
                                .eq('id', notification.id)];
                    case 4:
                        // Marcar como processando
                        _e.sent();
                        finalTime = new Date(notification.scheduled_for);
                        if (!((_a = notification.notification_schedules.options) === null || _a === void 0 ? void 0 : _a.optimizeDeliveryTime)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.optimizeDeliveryTime(notification.user_id, notification.channel, finalTime)];
                    case 5:
                        optimization = _e.sent();
                        finalTime = optimization.optimizedTime;
                        _e.label = 6;
                    case 6:
                        if (!this.isInQuietHours(finalTime, (_b = notification.notification_schedules.options) === null || _b === void 0 ? void 0 : _b.quietHours)) return [3 /*break*/, 8];
                        nextAvailable = this.findNextAvailableTime(finalTime, (_c = notification.notification_schedules.options) === null || _c === void 0 ? void 0 : _c.quietHours);
                        return [4 /*yield*/, this.supabase
                                .from('scheduled_notifications')
                                .update({
                                scheduled_for: nextAvailable.toISOString(),
                                status: 'pending',
                                updated_at: new Date().toISOString(),
                            })
                                .eq('id', notification.id)];
                    case 7:
                        _e.sent();
                        return [3 /*break*/, 15];
                    case 8: 
                    // Enviar notificação
                    return [4 /*yield*/, notification_manager_1.notificationManager.sendNotification({
                            userId: notification.user_id,
                            channel: notification.channel,
                            type: types_1.NotificationType.CUSTOM,
                            content: notification.content,
                            metadata: __assign({ scheduleId: scheduleId, scheduledNotificationId: notification.id }, notification.metadata),
                        })];
                    case 9:
                        // Enviar notificação
                        _e.sent();
                        // Marcar como enviada
                        return [4 /*yield*/, this.supabase
                                .from('scheduled_notifications')
                                .update({
                                status: 'sent',
                                actual_sent_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            })
                                .eq('id', notification.id)];
                    case 10:
                        // Marcar como enviada
                        _e.sent();
                        totalQueued++;
                        return [3 /*break*/, 15];
                    case 11:
                        error_5 = _e.sent();
                        errorMessage = error_5 instanceof Error ? error_5.message : 'Erro desconhecido';
                        errors.push("Notification ".concat(notification.id, ": ").concat(errorMessage));
                        totalFailed++;
                        // Marcar como falha e incrementar tentativa
                        return [4 /*yield*/, this.supabase
                                .from('scheduled_notifications')
                                .update({
                                status: 'failed',
                                last_error: errorMessage,
                                attempt: notification.attempt + 1,
                                updated_at: new Date().toISOString(),
                            })
                                .eq('id', notification.id)];
                    case 12:
                        // Marcar como falha e incrementar tentativa
                        _e.sent();
                        maxRetries = ((_d = notification.notification_schedules.options) === null || _d === void 0 ? void 0 : _d.maxRetriesPerChannel) || 3;
                        if (!(notification.attempt < maxRetries)) return [3 /*break*/, 14];
                        retryDelay = Math.pow(2, notification.attempt) * 5;
                        retryTime = new Date(Date.now() + retryDelay * 60 * 1000);
                        return [4 /*yield*/, this.supabase
                                .from('scheduled_notifications')
                                .update({
                                status: 'pending',
                                scheduled_for: retryTime.toISOString(),
                            })
                                .eq('id', notification.id)];
                    case 13:
                        _e.sent();
                        _e.label = 14;
                    case 14: return [3 /*break*/, 15];
                    case 15:
                        _i++;
                        return [3 /*break*/, 2];
                    case 16: return [2 /*return*/, {
                            scheduleId: scheduleId,
                            totalTargeted: notifications.length,
                            totalQueued: totalQueued,
                            totalFailed: totalFailed,
                            errors: errors,
                            executionTime: Date.now() - startTime,
                        }];
                    case 17:
                        error_6 = _e.sent();
                        console.error("Erro ao processar lote do agendamento ".concat(scheduleId, ":"), error_6);
                        throw error_6;
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    // ================================================================================
    // TIMING OPTIMIZATION
    // ================================================================================
    /**
     * Otimiza o horário de entrega baseado no perfil do usuário
     */
    NotificationScheduler.prototype.optimizeDeliveryTime = function (userId, channel, scheduledTime) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, history_1, error, hourlyEngagement_1, bestHour_1, bestScore_1, factors, optimizedTime, confidence, hourlyData, error_7;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('notifications')
                                .select('sent_at, opened_at, clicked_at, channel')
                                .eq('user_id', userId)
                                .eq('channel', channel)
                                .not('opened_at', 'is', null)
                                .order('sent_at', { ascending: false })
                                .limit(50)];
                    case 1:
                        _a = _c.sent(), history_1 = _a.data, error = _a.error;
                        if (error || !history_1 || history_1.length < 5) {
                            // Dados insuficientes, usar horário original
                            return [2 /*return*/, {
                                    originalTime: scheduledTime,
                                    optimizedTime: scheduledTime,
                                    confidence: 0.1,
                                    reason: 'Dados insuficientes para otimização',
                                    factors: [],
                                }];
                        }
                        hourlyEngagement_1 = new Map();
                        history_1.forEach(function (notification) {
                            var sentHour = new Date(notification.sent_at).getHours();
                            var openedAt = notification.opened_at ? new Date(notification.opened_at) : null;
                            var sentAt = new Date(notification.sent_at);
                            if (openedAt) {
                                var responseTime = (openedAt.getTime() - sentAt.getTime()) / (1000 * 60); // minutos
                                var current = hourlyEngagement_1.get(sentHour) || { count: 0, avgResponseTime: 0 };
                                current.count++;
                                current.avgResponseTime = (current.avgResponseTime * (current.count - 1) + responseTime) / current.count;
                                hourlyEngagement_1.set(sentHour, current);
                            }
                        });
                        bestHour_1 = scheduledTime.getHours();
                        bestScore_1 = 0;
                        factors = [];
                        hourlyEngagement_1.forEach(function (_a, hour) {
                            var count = _a.count, avgResponseTime = _a.avgResponseTime;
                            if (count < 2)
                                return; // Dados insuficientes para essa hora
                            // Score baseado em frequência de engajamento e tempo de resposta
                            var engagementScore = count / history_1.length;
                            var responseScore = Math.max(0, (240 - avgResponseTime) / 240); // 240 min = 4h normalizado
                            var combinedScore = engagementScore * 0.6 + responseScore * 0.4;
                            if (combinedScore > bestScore_1) {
                                bestScore_1 = combinedScore;
                                bestHour_1 = hour;
                            }
                        });
                        optimizedTime = new Date(scheduledTime);
                        optimizedTime.setHours(bestHour_1, 0, 0, 0);
                        // Se o horário otimizado é no passado, mover para o próximo dia
                        if (optimizedTime < new Date()) {
                            optimizedTime.setDate(optimizedTime.getDate() + 1);
                        }
                        confidence = Math.min(bestScore_1, 0.9);
                        hourlyData = hourlyEngagement_1.get(bestHour_1);
                        factors.push({
                            factor: 'Histórico de engajamento',
                            weight: 0.6,
                            impact: "".concat((((hourlyData === null || hourlyData === void 0 ? void 0 : hourlyData.count) || 0) / history_1.length * 100).toFixed(1), "% das intera\u00E7\u00F5es")
                        }, {
                            factor: 'Tempo de resposta',
                            weight: 0.4,
                            impact: "M\u00E9dia de ".concat(((_b = hourlyData === null || hourlyData === void 0 ? void 0 : hourlyData.avgResponseTime) === null || _b === void 0 ? void 0 : _b.toFixed(0)) || 0, " minutos")
                        });
                        return [2 /*return*/, {
                                originalTime: scheduledTime,
                                optimizedTime: optimizedTime,
                                confidence: confidence,
                                reason: "Hor\u00E1rio otimizado baseado em ".concat(history_1.length, " intera\u00E7\u00F5es hist\u00F3ricas"),
                                factors: factors,
                            }];
                    case 2:
                        error_7 = _c.sent();
                        console.error('Erro na otimização de timing:', error_7);
                        return [2 /*return*/, {
                                originalTime: scheduledTime,
                                optimizedTime: scheduledTime,
                                confidence: 0,
                                reason: 'Erro na otimização - usando horário original',
                                factors: [],
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ================================================================================
    // UTILITY METHODS
    // ================================================================================
    /**
     * Verifica se o horário está dentro do quiet hour
     */
    NotificationScheduler.prototype.isInQuietHours = function (time, quietHours) {
        if (!quietHours)
            return false;
        var hour = time.getHours();
        var minute = time.getMinutes();
        var timeInMinutes = hour * 60 + minute;
        var _a = quietHours.start.split(':').map(Number), startHour = _a[0], startMinute = _a[1];
        var _b = quietHours.end.split(':').map(Number), endHour = _b[0], endMinute = _b[1];
        var startInMinutes = startHour * 60 + startMinute;
        var endInMinutes = endHour * 60 + endMinute;
        if (startInMinutes <= endInMinutes) {
            // Mesmo dia (ex: 22:00 - 08:00 do dia seguinte)
            return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
        }
        else {
            // Cruza meia-noite (ex: 22:00 - 08:00 do dia seguinte)
            return timeInMinutes >= startInMinutes || timeInMinutes <= endInMinutes;
        }
    };
    /**
     * Encontra o próximo horário disponível fora do quiet hour
     */
    NotificationScheduler.prototype.findNextAvailableTime = function (time, quietHours) {
        if (!quietHours)
            return time;
        var result = new Date(time);
        var _a = quietHours.end.split(':').map(Number), endHour = _a[0], endMinute = _a[1];
        // Se está em quiet hour, mover para o fim do quiet hour
        if (this.isInQuietHours(result, quietHours)) {
            result.setHours(endHour, endMinute, 0, 0);
            // Se o fim do quiet hour é no dia seguinte
            if (endHour < result.getHours()) {
                result.setDate(result.getDate() + 1);
            }
        }
        return result;
    };
    /**
     * Gera execuções futuras para agendamentos recorrentes
     */
    NotificationScheduler.prototype.generateUpcomingExecutions = function (scheduleId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, schedule_1, error, config, executions, audience_1, notifications, insertError, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.supabase
                                .from('notification_schedules')
                                .select('*')
                                .eq('id', scheduleId)
                                .single()];
                    case 1:
                        _a = _b.sent(), schedule_1 = _a.data, error = _a.error;
                        if (error || !schedule_1) {
                            throw new Error("Agendamento n\u00E3o encontrado: ".concat(scheduleId));
                        }
                        config = schedule_1.schedule_config;
                        if (config.type !== 'recurring' || !config.recurrence) {
                            return [2 /*return*/];
                        }
                        executions = this.calculateNextExecutions(config, 10);
                        return [4 /*yield*/, this.resolveAudience(schedule_1.audience_config, schedule_1.clinic_id)];
                    case 2:
                        audience_1 = _b.sent();
                        notifications = executions.flatMap(function (executionTime) {
                            return audience_1.map(function (userId) { return ({
                                id: crypto.randomUUID(),
                                schedule_id: scheduleId,
                                user_id: userId,
                                channel: schedule_1.channels[0], // Para múltiplos canais, criar uma entrada por canal
                                status: 'pending',
                                scheduled_for: executionTime.toISOString(),
                                attempt: 0,
                                content: schedule_1.template_config.content,
                                metadata: {
                                    templateId: schedule_1.template_config.templateId,
                                    variables: schedule_1.template_config.variables,
                                },
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            }); });
                        });
                        if (!(notifications.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.supabase
                                .from('scheduled_notifications')
                                .insert(notifications)];
                    case 3:
                        insertError = (_b.sent()).error;
                        if (insertError) {
                            console.error('Erro ao inserir notificações agendadas:', insertError);
                        }
                        else {
                            console.log("\uD83D\uDCC5 Geradas ".concat(notifications.length, " execu\u00E7\u00F5es para agendamento ").concat(scheduleId));
                        }
                        _b.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_8 = _b.sent();
                        console.error('Erro ao gerar execuções futuras:', error_8);
                        throw error_8;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calcula próximas execuções baseadas na configuração de recorrência
     */
    NotificationScheduler.prototype.calculateNextExecutions = function (config, limit) {
        var executions = [];
        var now = new Date();
        var recurrence = config.recurrence;
        var current = new Date(now);
        current.setSeconds(0, 0); // Zerar segundos e milissegundos
        var _loop_1 = function (i) {
            var next = void 0;
            switch (recurrence.frequency) {
                case 'daily':
                    next = new Date(current);
                    next.setDate(current.getDate() + recurrence.interval);
                    break;
                case 'weekly':
                    next = new Date(current);
                    next.setDate(current.getDate() + (7 * recurrence.interval));
                    // Ajustar para dias da semana específicos se configurado
                    if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
                        var dayOfWeek_1 = next.getDay();
                        if (!recurrence.daysOfWeek.includes(dayOfWeek_1)) {
                            // Encontrar próximo dia da semana válido
                            var nextValidDay = recurrence.daysOfWeek
                                .map(function (day) {
                                var diff = (day - dayOfWeek_1 + 7) % 7;
                                return diff === 0 ? 7 : diff;
                            })
                                .sort(function (a, b) { return a - b; })[0];
                            next.setDate(next.getDate() + nextValidDay);
                        }
                    }
                    break;
                case 'monthly':
                    next = new Date(current);
                    next.setMonth(current.getMonth() + recurrence.interval);
                    // Ajustar dia do mês se configurado
                    if (recurrence.dayOfMonth) {
                        next.setDate(recurrence.dayOfMonth);
                    }
                    break;
                case 'yearly':
                    next = new Date(current);
                    next.setFullYear(current.getFullYear() + recurrence.interval);
                    break;
                default:
                    throw new Error("Frequ\u00EAncia de recorr\u00EAncia n\u00E3o suportada: ".concat(recurrence.frequency));
            }
            // Verificar se passou da data limite
            if (recurrence.endDate && next > new Date(recurrence.endDate)) {
                return "break";
            }
            // Verificar número máximo de ocorrências
            if (recurrence.maxOccurrences && executions.length >= recurrence.maxOccurrences) {
                return "break";
            }
            executions.push(next);
            current = next;
        };
        for (var i = 0; i < limit && executions.length < limit; i++) {
            var state_1 = _loop_1(i);
            if (state_1 === "break")
                break;
        }
        return executions;
    };
    /**
     * Resolve a audiência baseada na configuração
     */
    NotificationScheduler.prototype.resolveAudience = function (audienceConfig, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, allUsers, patients, staff, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 12, , 13]);
                        _a = audienceConfig.type;
                        switch (_a) {
                            case 'all': return [3 /*break*/, 1];
                            case 'users': return [3 /*break*/, 3];
                            case 'patients': return [3 /*break*/, 4];
                            case 'staff': return [3 /*break*/, 6];
                            case 'custom': return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 10];
                    case 1: return [4 /*yield*/, this.supabase
                            .from('profiles')
                            .select('id')
                            .eq('clinic_id', clinicId)];
                    case 2:
                        allUsers = (_b.sent()).data;
                        return [2 /*return*/, (allUsers === null || allUsers === void 0 ? void 0 : allUsers.map(function (u) { return u.id; })) || []];
                    case 3: return [2 /*return*/, audienceConfig.userIds || []];
                    case 4: return [4 /*yield*/, this.supabase
                            .from('profiles')
                            .select('id')
                            .eq('clinic_id', clinicId)
                            .eq('role', 'patient')];
                    case 5:
                        patients = (_b.sent()).data;
                        return [2 /*return*/, (patients === null || patients === void 0 ? void 0 : patients.map(function (p) { return p.id; })) || []];
                    case 6: return [4 /*yield*/, this.supabase
                            .from('profiles')
                            .select('id')
                            .eq('clinic_id', clinicId)
                            .in('role', ['staff', 'manager', 'owner'])];
                    case 7:
                        staff = (_b.sent()).data;
                        return [2 /*return*/, (staff === null || staff === void 0 ? void 0 : staff.map(function (s) { return s.id; })) || []];
                    case 8: return [4 /*yield*/, this.resolveCustomAudience(audienceConfig.filters, clinicId)];
                    case 9: 
                    // Implementar filtros customizados baseados em audienceConfig.filters
                    return [2 /*return*/, _b.sent()];
                    case 10: return [2 /*return*/, []];
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        error_9 = _b.sent();
                        console.error('Erro ao resolver audiência:', error_9);
                        return [2 /*return*/, []];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Resolve audiência customizada baseada em filtros
     */
    NotificationScheduler.prototype.resolveCustomAudience = function (filters, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var query_1, data, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!filters || filters.length === 0)
                            return [2 /*return*/, []];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        query_1 = this.supabase
                            .from('profiles')
                            .select('id')
                            .eq('clinic_id', clinicId);
                        // Aplicar filtros
                        filters.forEach(function (filter) {
                            switch (filter.operator) {
                                case 'equals':
                                    query_1 = query_1.eq(filter.field, filter.value);
                                    break;
                                case 'not_equals':
                                    query_1 = query_1.neq(filter.field, filter.value);
                                    break;
                                case 'greater_than':
                                    query_1 = query_1.gt(filter.field, filter.value);
                                    break;
                                case 'less_than':
                                    query_1 = query_1.lt(filter.field, filter.value);
                                    break;
                                case 'contains':
                                    query_1 = query_1.ilike(filter.field, "%".concat(filter.value, "%"));
                                    break;
                            }
                        });
                        return [4 /*yield*/, query_1];
                    case 2:
                        data = (_a.sent()).data;
                        return [2 /*return*/, (data === null || data === void 0 ? void 0 : data.map(function (u) { return u.id; })) || []];
                    case 3:
                        error_10 = _a.sent();
                        console.error('Erro ao resolver audiência customizada:', error_10);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Processa um agendamento específico manualmente
     */
    NotificationScheduler.prototype.processSchedule = function (scheduleId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, schedule_2, error, audience, notifications, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.supabase
                                .from('notification_schedules')
                                .select('*')
                                .eq('id', scheduleId)
                                .single()];
                    case 1:
                        _a = _b.sent(), schedule_2 = _a.data, error = _a.error;
                        if (error || !schedule_2) {
                            throw new Error("Agendamento n\u00E3o encontrado: ".concat(scheduleId));
                        }
                        return [4 /*yield*/, this.resolveAudience(schedule_2.audience_config, schedule_2.clinic_id)];
                    case 2:
                        audience = _b.sent();
                        notifications = audience.flatMap(function (userId) {
                            return schedule_2.channels.map(function (channel) { return ({
                                id: crypto.randomUUID(),
                                schedule_id: scheduleId,
                                user_id: userId,
                                channel: channel,
                                status: 'pending',
                                scheduled_for: new Date().toISOString(),
                                attempt: 0,
                                content: schedule_2.template_config.content,
                                metadata: {
                                    templateId: schedule_2.template_config.templateId,
                                    variables: schedule_2.template_config.variables,
                                },
                            }); });
                        });
                        return [4 /*yield*/, this.processBatch(scheduleId, notifications)];
                    case 3: 
                    // Processar em lote
                    return [2 /*return*/, _b.sent()];
                    case 4:
                        error_11 = _b.sent();
                        console.error("Erro ao processar agendamento ".concat(scheduleId, ":"), error_11);
                        throw error_11;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return NotificationScheduler;
}());
exports.NotificationScheduler = NotificationScheduler;
// ================================================================================
// EXPORT
// ================================================================================
var createnotificationScheduler = function () { return new NotificationScheduler(); };
exports.createnotificationScheduler = createnotificationScheduler;
