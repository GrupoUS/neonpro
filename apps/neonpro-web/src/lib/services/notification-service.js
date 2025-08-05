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
exports.createnotificationService = exports.NotificationService = void 0;
var server_1 = require("@/lib/supabase/server");
var NotificationService = /** @class */ (function () {
    function NotificationService() {
        // Usar createClient de forma assíncrona quando necessário
    }
    NotificationService.prototype.getSupabaseClient = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.supabase) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        _a.supabase = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.supabase];
                }
            });
        });
    };
    // Configuração de Notificações
    NotificationService.prototype.getNotificationConfigs = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Mock implementation - substituir por query real quando tabela for criada
                return [2 /*return*/, [
                        {
                            id: '1',
                            clinic_id: clinicId,
                            notification_type: 'due_date_reminder',
                            days_before_due: 3,
                            enabled: true,
                            email_enabled: true,
                            sms_enabled: false,
                            dashboard_enabled: true,
                            recipients: ['admin@clinic.com'],
                        },
                        {
                            id: '2',
                            clinic_id: clinicId,
                            notification_type: 'overdue_payment',
                            days_after_due: 1,
                            enabled: true,
                            email_enabled: true,
                            sms_enabled: false,
                            dashboard_enabled: true,
                            escalation_level: 1,
                            recipients: ['manager@clinic.com'],
                        },
                    ]];
            });
        });
    };
    NotificationService.prototype.createNotificationConfig = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var newConfig;
            return __generator(this, function (_a) {
                newConfig = __assign(__assign({}, config), { id: "config_".concat(Date.now()), created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
                return [2 /*return*/, newConfig];
            });
        });
    };
    NotificationService.prototype.updateNotificationConfig = function (id, config) {
        return __awaiter(this, void 0, void 0, function () {
            var existingConfig, configToUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getNotificationConfigs(config.clinic_id || '')];
                    case 1:
                        existingConfig = _a.sent();
                        configToUpdate = existingConfig.find(function (c) { return c.id === id; });
                        if (!configToUpdate) {
                            throw new Error('Configuration not found');
                        }
                        return [2 /*return*/, __assign(__assign(__assign({}, configToUpdate), config), { updated_at: new Date().toISOString() })];
                }
            });
        });
    };
    // Monitoramento de Vencimentos
    NotificationService.prototype.getDuePayments = function (clinicId_1) {
        return __awaiter(this, arguments, void 0, function (clinicId, daysAhead) {
            var supabase, _a, payables, error, reminders, today, _i, _b, payable, dueDate, timeDiff, daysDiff, alertType, priority, error_1;
            if (daysAhead === void 0) { daysAhead = 7; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSupabaseClient()];
                    case 1:
                        supabase = _c.sent();
                        return [4 /*yield*/, supabase
                                .from('accounts_payable')
                                .select("\n          *,\n          vendor:vendors(*)\n        ")
                                .eq('clinic_id', clinicId)
                                .in('status', ['pending', 'approved'])
                                .lte('due_date', new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString().split('T')[0])];
                    case 2:
                        _a = _c.sent(), payables = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching due payments:', error);
                            return [2 /*return*/, []];
                        }
                        reminders = [];
                        today = new Date();
                        today.setHours(0, 0, 0, 0);
                        for (_i = 0, _b = payables || []; _i < _b.length; _i++) {
                            payable = _b[_i];
                            dueDate = new Date(payable.due_date);
                            dueDate.setHours(0, 0, 0, 0);
                            timeDiff = dueDate.getTime() - today.getTime();
                            daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                            alertType = 'due_soon';
                            priority = 'low';
                            if (daysDiff < 0) {
                                alertType = 'overdue';
                                priority = Math.abs(daysDiff) > 7 ? 'urgent' : 'high';
                            }
                            else if (daysDiff === 0) {
                                alertType = 'due_today';
                                priority = 'high';
                            }
                            else {
                                alertType = 'due_soon';
                                priority = daysDiff <= 1 ? 'medium' : 'low';
                            }
                            reminders.push({
                                accounts_payable: payable,
                                vendor: payable.vendor,
                                days_until_due: daysDiff > 0 ? daysDiff : 0,
                                days_overdue: daysDiff < 0 ? Math.abs(daysDiff) : 0,
                                alert_type: alertType,
                                priority: priority,
                            });
                        }
                        return [2 /*return*/, reminders.sort(function (a, b) {
                                // Ordenar por prioridade (urgent > high > medium > low) e depois por data
                                var priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                                var priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                                if (priorityDiff !== 0)
                                    return priorityDiff;
                                return new Date(a.accounts_payable.due_date).getTime() - new Date(b.accounts_payable.due_date).getTime();
                            })];
                    case 3:
                        error_1 = _c.sent();
                        console.error('Error in getDuePayments:', error_1);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Alertas do Dashboard
    NotificationService.prototype.getDashboardAlerts = function (clinicId_1) {
        return __awaiter(this, arguments, void 0, function (clinicId, limit) {
            var duePayments, alerts, _i, _a, reminder, title, message;
            if (limit === void 0) { limit = 10; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getDuePayments(clinicId, 7)];
                    case 1:
                        duePayments = _b.sent();
                        alerts = [];
                        for (_i = 0, _a = duePayments.slice(0, limit); _i < _a.length; _i++) {
                            reminder = _a[_i];
                            title = '';
                            message = '';
                            if (reminder.alert_type === 'overdue') {
                                title = "Pagamento em atraso - ".concat(reminder.vendor.name);
                                message = "Conta de R$ ".concat(reminder.accounts_payable.amount, " est\u00E1 ").concat(reminder.days_overdue, " dias em atraso");
                            }
                            else if (reminder.alert_type === 'due_today') {
                                title = "Pagamento vence hoje - ".concat(reminder.vendor.name);
                                message = "Conta de R$ ".concat(reminder.accounts_payable.amount, " vence hoje");
                            }
                            else {
                                title = "Pagamento pr\u00F3ximo do vencimento - ".concat(reminder.vendor.name);
                                message = "Conta de R$ ".concat(reminder.accounts_payable.amount, " vence em ").concat(reminder.days_until_due, " dias");
                            }
                            alerts.push({
                                id: "alert_".concat(reminder.accounts_payable.id),
                                clinic_id: clinicId,
                                accounts_payable_id: reminder.accounts_payable.id,
                                alert_type: reminder.alert_type,
                                title: title,
                                message: message,
                                priority: reminder.priority,
                                is_read: false,
                                is_dismissed: false,
                                action_url: "/dashboard/accounts-payable/payables?id=".concat(reminder.accounts_payable.id),
                                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            });
                        }
                        return [2 /*return*/, alerts];
                }
            });
        });
    };
    NotificationService.prototype.markAlertAsRead = function (alertId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Mock implementation - implementar quando tabela for criada
                console.log("Alert ".concat(alertId, " marked as read"));
                return [2 /*return*/];
            });
        });
    };
    NotificationService.prototype.dismissAlert = function (alertId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Mock implementation - implementar quando tabela for criada
                console.log("Alert ".concat(alertId, " dismissed"));
                return [2 /*return*/];
            });
        });
    };
    // Fila de Notificações
    NotificationService.prototype.queueNotification = function (notification) {
        return __awaiter(this, void 0, void 0, function () {
            var queuedNotification;
            return __generator(this, function (_a) {
                queuedNotification = __assign(__assign({}, notification), { id: "queue_".concat(Date.now()), created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
                // Mock implementation - adicionar à fila quando tabela for criada
                console.log('Notification queued:', queuedNotification);
                return [2 /*return*/, queuedNotification];
            });
        });
    };
    NotificationService.prototype.processNotificationQueue = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Mock implementation - processar fila de notificações
                console.log("Processing notification queue for clinic ".concat(clinicId));
                return [2 /*return*/];
            });
        });
    };
    // Sistema de Escalação
    NotificationService.prototype.escalateOverduePayments = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var overduePayments, overdue, _i, overdue_1, payment, escalationLevel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDuePayments(clinicId, 0)];
                    case 1:
                        overduePayments = _a.sent();
                        overdue = overduePayments.filter(function (p) { return p.alert_type === 'overdue'; });
                        _i = 0, overdue_1 = overdue;
                        _a.label = 2;
                    case 2:
                        if (!(_i < overdue_1.length)) return [3 /*break*/, 5];
                        payment = overdue_1[_i];
                        escalationLevel = 1;
                        if (payment.days_overdue > 7)
                            escalationLevel = 2;
                        if (payment.days_overdue > 15)
                            escalationLevel = 3;
                        // Criar notificação de escalação
                        return [4 /*yield*/, this.queueNotification({
                                clinic_id: clinicId,
                                accounts_payable_id: payment.accounts_payable.id,
                                notification_type: 'overdue_payment',
                                scheduled_for: new Date().toISOString(),
                                status: 'pending',
                                retry_count: 0,
                            })];
                    case 3:
                        // Criar notificação de escalação
                        _a.sent();
                        console.log("Escalated payment ".concat(payment.accounts_payable.id, " to level ").concat(escalationLevel));
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Relatórios de Notificações
    NotificationService.prototype.getNotificationStats = function (clinicId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Mock implementation
                return [2 /*return*/, {
                        total_sent: 45,
                        emails_sent: 32,
                        sms_sent: 8,
                        dashboard_alerts: 15,
                        success_rate: 95.6,
                        failed_notifications: 2,
                        most_common_type: 'due_date_reminder',
                        escalations_triggered: 5,
                        avg_response_time: '2.3 hours',
                    }];
            });
        });
    };
    // Utilitários
    NotificationService.prototype.formatCurrency = function (amount) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(amount);
    };
    NotificationService.prototype.formatDate = function (date) {
        return new Date(date).toLocaleDateString('pt-BR');
    };
    NotificationService.prototype.calculateBusinessDays = function (startDate, endDate) {
        var count = 0;
        var curDate = new Date(startDate);
        while (curDate <= endDate) {
            var dayOfWeek = curDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                count++;
            }
            curDate.setDate(curDate.getDate() + 1);
        }
        return count;
    };
    return NotificationService;
}());
exports.NotificationService = NotificationService;
var createnotificationService = function () { return new NotificationService(); };
exports.createnotificationService = createnotificationService;
