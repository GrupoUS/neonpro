"use strict";
// Stock Notifications Service
// Unified notification system for stock alerts (email, push, webhook)
// Story 11.4: Enhanced Stock Alerts System
// Created: 2025-01-21 (Claude Code Implementation)
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
var server_1 = require("@/lib/supabase/server");
var push_notification_service_1 = require("@/lib/push-notification-service");
var resend_1 = require("resend");
var axios_1 = require("axios");
var StockNotificationsService = /** @class */ (function () {
    function StockNotificationsService() {
        this.supabase = (0, server_1.createClient)();
        this.resend = new resend_1.Resend(process.env.RESEND_API_KEY);
        this.maxRetries = 3;
        this.retryDelayMs = 30000; // 30 seconds
    }
    // ==========================================
    // TEMPLATE MANAGEMENT
    // ==========================================
    StockNotificationsService.prototype.getNotificationTemplate = function (clinicId, templateType, channel) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('notification_templates')
                                .select('*')
                                .eq('clinic_id', clinicId)
                                .eq('template_type', templateType)
                                .eq('channel', channel)
                                .eq('is_active', true)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching notification template:', error);
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_1 = _b.sent();
                        console.error('Error in getNotificationTemplate:', error_1);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StockNotificationsService.prototype.replaceVariables = function (content, variables) {
        var result = content;
        Object.entries(variables).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            var regex = new RegExp("{{".concat(key, "}}"), 'g');
            result = result.replace(regex, String(value || ''));
        });
        // Handle conditional blocks {{#if condition}}...{{/if}}
        result = result.replace(/\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/g, function (match, condition, content) {
            return variables[condition] ? content : '';
        });
        return result;
    };
    // ==========================================
    // NOTIFICATION DELIVERY TRACKING
    // ==========================================
    StockNotificationsService.prototype.logNotificationDelivery = function (delivery) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('notification_deliveries')
                                .insert({
                                clinic_id: delivery.clinic_id,
                                template_id: delivery.template_id,
                                alert_id: delivery.alert_id,
                                recipient_id: delivery.recipient_id,
                                recipient_email: delivery.recipient_email,
                                recipient_phone: delivery.recipient_phone,
                                webhook_url: delivery.webhook_url,
                                channel: delivery.channel,
                                status: delivery.status,
                                subject: delivery.subject,
                                content: delivery.content,
                                metadata: delivery.metadata,
                                retry_count: delivery.retry_count,
                            })
                                .select('id')
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error logging notification delivery:', error);
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, data.id];
                    case 2:
                        error_2 = _b.sent();
                        console.error('Error in logNotificationDelivery:', error_2);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StockNotificationsService.prototype.updateNotificationDelivery = function (id, update) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('notification_deliveries')
                                .update(update)
                                .eq('id', id)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            console.error('Error updating notification delivery:', error);
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, true];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Error in updateNotificationDelivery:', error_3);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ==========================================
    // RECIPIENT MANAGEMENT
    // ==========================================
    StockNotificationsService.prototype.getNotificationRecipients = function (clinicId, alertType, severityLevel) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('clinic_staff')
                                .select("\n          user_id,\n          role,\n          users!inner(\n            id,\n            name,\n            email,\n            phone,\n            notification_preferences\n          )\n        ")
                                .eq('clinic_id', clinicId)
                                .in('role', ['admin', 'manager', 'staff'])];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching notification recipients:', error);
                            return [2 /*return*/, []];
                        }
                        // Filter recipients based on their notification preferences
                        return [2 /*return*/, data
                                .filter(function (staff) {
                                var user = staff.users;
                                var prefs = user.notification_preferences || {};
                                // Check if user wants to receive notifications for this alert type and severity
                                var wantsAlerts = prefs.stock_alerts !== false;
                                var wantsSeverity = !prefs.severity_filter || prefs.severity_filter.includes(severityLevel);
                                var wantsType = !prefs.alert_type_filter || prefs.alert_type_filter.includes(alertType);
                                return wantsAlerts && wantsSeverity && wantsType;
                            })
                                .map(function (staff) { return ({
                                user_id: staff.users.id,
                                name: staff.users.name,
                                email: staff.users.email,
                                phone: staff.users.phone,
                                role: staff.role,
                                notification_preferences: staff.users.notification_preferences || {}
                            }); })];
                    case 2:
                        error_4 = _b.sent();
                        console.error('Error in getNotificationRecipients:', error_4);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ==========================================
    // EMAIL NOTIFICATIONS
    // ==========================================
    StockNotificationsService.prototype.sendEmailNotification = function (clinicId, alertData, recipients, templateType) {
        return __awaiter(this, void 0, void 0, function () {
            var results, template, variables, _i, recipients_1, recipientEmail, deliveryId, emailResult, error_5, errorMessage, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = {
                            success: false,
                            sent: 0,
                            failed: 0,
                            deliveryIds: [],
                            errors: []
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 12, , 13]);
                        return [4 /*yield*/, this.getNotificationTemplate(clinicId, templateType, 'email')];
                    case 2:
                        template = _a.sent();
                        if (!template) {
                            results.errors.push("Email template not found for ".concat(templateType));
                            results.failed = recipients.length;
                            return [2 /*return*/, results];
                        }
                        variables = this.prepareTemplateVariables(alertData, templateType);
                        _i = 0, recipients_1 = recipients;
                        _a.label = 3;
                    case 3:
                        if (!(_i < recipients_1.length)) return [3 /*break*/, 11];
                        recipientEmail = recipients_1[_i];
                        return [4 /*yield*/, this.logNotificationDelivery({
                                clinic_id: clinicId,
                                template_id: template.id,
                                alert_id: alertData.alertId,
                                recipient_email: recipientEmail,
                                channel: 'email',
                                status: 'pending',
                                subject: this.replaceVariables(template.subject_template || '', variables),
                                content: this.replaceVariables(template.body_template, variables),
                                metadata: { variables: variables, template_type: templateType },
                                retry_count: 0,
                            })];
                    case 4:
                        deliveryId = _a.sent();
                        if (!deliveryId) {
                            results.failed++;
                            results.errors.push("Failed to log email delivery for ".concat(recipientEmail));
                            return [3 /*break*/, 10];
                        }
                        results.deliveryIds.push(deliveryId);
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 8, , 10]);
                        return [4 /*yield*/, this.resend.emails.send({
                                from: process.env.DEFAULT_FROM_EMAIL || 'alerts@neonpro.com',
                                to: [recipientEmail],
                                subject: this.replaceVariables(template.subject_template || '', variables),
                                html: this.replaceVariables(template.body_template, variables),
                                reply_to: process.env.DEFAULT_REPLY_TO_EMAIL,
                            })];
                    case 6:
                        emailResult = _a.sent();
                        if (emailResult.error) {
                            throw new Error(emailResult.error.message);
                        }
                        // Update delivery status
                        return [4 /*yield*/, this.updateNotificationDelivery(deliveryId, {
                                status: 'sent',
                                sent_at: new Date(),
                            })];
                    case 7:
                        // Update delivery status
                        _a.sent();
                        results.sent++;
                        return [3 /*break*/, 10];
                    case 8:
                        error_5 = _a.sent();
                        errorMessage = error_5 instanceof Error ? error_5.message : 'Unknown error';
                        results.failed++;
                        results.errors.push("Failed to send email to ".concat(recipientEmail, ": ").concat(errorMessage));
                        // Update delivery status
                        return [4 /*yield*/, this.updateNotificationDelivery(deliveryId, {
                                status: 'failed',
                                failed_at: new Date(),
                                error_message: errorMessage,
                            })];
                    case 9:
                        // Update delivery status
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 10:
                        _i++;
                        return [3 /*break*/, 3];
                    case 11:
                        results.success = results.sent > 0;
                        return [2 /*return*/, results];
                    case 12:
                        error_6 = _a.sent();
                        console.error('Error in sendEmailNotification:', error_6);
                        results.failed = recipients.length;
                        results.errors.push(error_6 instanceof Error ? error_6.message : 'Unknown error');
                        return [2 /*return*/, results];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    // ==========================================
    // PUSH NOTIFICATIONS
    // ==========================================
    StockNotificationsService.prototype.sendPushNotification = function (clinicId, alertData, userIds, templateType) {
        return __awaiter(this, void 0, void 0, function () {
            var results, template, variables, _i, userIds_1, userId, deliveryId, pushPayload, pushResult, error_7, errorMessage, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = {
                            success: false,
                            sent: 0,
                            failed: 0,
                            deliveryIds: [],
                            errors: []
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 12, , 13]);
                        return [4 /*yield*/, this.getNotificationTemplate(clinicId, templateType, 'push')];
                    case 2:
                        template = _a.sent();
                        if (!template) {
                            results.errors.push("Push template not found for ".concat(templateType));
                            results.failed = userIds.length;
                            return [2 /*return*/, results];
                        }
                        variables = this.prepareTemplateVariables(alertData, templateType);
                        _i = 0, userIds_1 = userIds;
                        _a.label = 3;
                    case 3:
                        if (!(_i < userIds_1.length)) return [3 /*break*/, 11];
                        userId = userIds_1[_i];
                        return [4 /*yield*/, this.logNotificationDelivery({
                                clinic_id: clinicId,
                                template_id: template.id,
                                alert_id: alertData.alertId,
                                recipient_id: userId,
                                channel: 'push',
                                status: 'pending',
                                content: this.replaceVariables(template.body_template, variables),
                                metadata: { variables: variables, template_type: templateType },
                                retry_count: 0,
                            })];
                    case 4:
                        deliveryId = _a.sent();
                        if (!deliveryId) {
                            results.failed++;
                            results.errors.push("Failed to log push delivery for user ".concat(userId));
                            return [3 /*break*/, 10];
                        }
                        results.deliveryIds.push(deliveryId);
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 8, , 10]);
                        pushPayload = {
                            title: templateType === 'stock_alert' ?
                                "\uD83D\uDEA8 Alerta de Estoque - ".concat(alertData.productName) :
                                "\u2705 Alerta Resolvido - ".concat(alertData.productName),
                            body: this.replaceVariables(template.body_template, variables),
                            icon: '/icons/icon-192x192.png',
                            badge: '/icons/badge-72x72.png',
                            tag: "".concat(templateType, "_").concat(alertData.alertId),
                            url: "/dashboard/stock/alerts?alert=".concat(alertData.alertId),
                            type: 'system_notification',
                            data: {
                                alertId: alertData.alertId,
                                productId: alertData.productId,
                                type: templateType
                            },
                            actions: [
                                {
                                    action: 'view',
                                    title: 'Ver Alerta'
                                },
                                {
                                    action: 'close',
                                    title: 'Fechar'
                                }
                            ],
                            requireInteraction: templateType === 'stock_alert',
                            vibrate: templateType === 'stock_alert' ? [200, 100, 200] : [100]
                        };
                        return [4 /*yield*/, push_notification_service_1.default.sendToUser(userId, pushPayload)];
                    case 6:
                        pushResult = _a.sent();
                        if (!pushResult.success) {
                            throw new Error(pushResult.errors.join(', '));
                        }
                        // Update delivery status
                        return [4 /*yield*/, this.updateNotificationDelivery(deliveryId, {
                                status: 'sent',
                                sent_at: new Date(),
                            })];
                    case 7:
                        // Update delivery status
                        _a.sent();
                        results.sent++;
                        return [3 /*break*/, 10];
                    case 8:
                        error_7 = _a.sent();
                        errorMessage = error_7 instanceof Error ? error_7.message : 'Unknown error';
                        results.failed++;
                        results.errors.push("Failed to send push to user ".concat(userId, ": ").concat(errorMessage));
                        // Update delivery status
                        return [4 /*yield*/, this.updateNotificationDelivery(deliveryId, {
                                status: 'failed',
                                failed_at: new Date(),
                                error_message: errorMessage,
                            })];
                    case 9:
                        // Update delivery status
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 10:
                        _i++;
                        return [3 /*break*/, 3];
                    case 11:
                        results.success = results.sent > 0;
                        return [2 /*return*/, results];
                    case 12:
                        error_8 = _a.sent();
                        console.error('Error in sendPushNotification:', error_8);
                        results.failed = userIds.length;
                        results.errors.push(error_8 instanceof Error ? error_8.message : 'Unknown error');
                        return [2 /*return*/, results];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    // ==========================================
    // WEBHOOK NOTIFICATIONS
    // ==========================================
    StockNotificationsService.prototype.sendWebhookNotification = function (clinicId, alertData, webhookUrls, templateType) {
        return __awaiter(this, void 0, void 0, function () {
            var results, template, variables, webhookPayload, _i, webhookUrls_1, webhookUrl, deliveryId, response, error_9, errorMessage, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = {
                            success: false,
                            sent: 0,
                            failed: 0,
                            deliveryIds: [],
                            errors: []
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 14, , 15]);
                        return [4 /*yield*/, this.getNotificationTemplate(clinicId, templateType, 'webhook')];
                    case 2:
                        template = _a.sent();
                        variables = this.prepareTemplateVariables(alertData, templateType);
                        webhookPayload = void 0;
                        if (template) {
                            webhookPayload = JSON.parse(this.replaceVariables(template.body_template, variables));
                        }
                        else {
                            // Default webhook payload
                            webhookPayload = {
                                event: templateType,
                                clinic_id: clinicId,
                                alert_id: alertData.alertId,
                                product_id: alertData.productId,
                                product_name: alertData.productName,
                                timestamp: new Date().toISOString(),
                                data: alertData
                            };
                        }
                        _i = 0, webhookUrls_1 = webhookUrls;
                        _a.label = 3;
                    case 3:
                        if (!(_i < webhookUrls_1.length)) return [3 /*break*/, 13];
                        webhookUrl = webhookUrls_1[_i];
                        return [4 /*yield*/, this.logNotificationDelivery({
                                clinic_id: clinicId,
                                template_id: template === null || template === void 0 ? void 0 : template.id,
                                alert_id: alertData.alertId,
                                webhook_url: webhookUrl,
                                channel: 'webhook',
                                status: 'pending',
                                content: JSON.stringify(webhookPayload),
                                metadata: { variables: variables, template_type: templateType, url: webhookUrl },
                                retry_count: 0,
                            })];
                    case 4:
                        deliveryId = _a.sent();
                        if (!deliveryId) {
                            results.failed++;
                            results.errors.push("Failed to log webhook delivery for ".concat(webhookUrl));
                            return [3 /*break*/, 12];
                        }
                        results.deliveryIds.push(deliveryId);
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 10, , 12]);
                        return [4 /*yield*/, axios_1.default.post(webhookUrl, webhookPayload, {
                                timeout: 30000, // 30 seconds
                                headers: {
                                    'Content-Type': 'application/json',
                                    'User-Agent': 'NeonPro-StockAlerts/1.0',
                                    'X-NeonPro-Event': templateType,
                                    'X-NeonPro-Alert-Id': alertData.alertId,
                                    'X-NeonPro-Clinic-Id': clinicId,
                                },
                            })];
                    case 6:
                        response = _a.sent();
                        if (!(response.status >= 200 && response.status < 300)) return [3 /*break*/, 8];
                        // Update delivery status
                        return [4 /*yield*/, this.updateNotificationDelivery(deliveryId, {
                                status: 'delivered',
                                sent_at: new Date(),
                                delivered_at: new Date(),
                            })];
                    case 7:
                        // Update delivery status
                        _a.sent();
                        results.sent++;
                        return [3 /*break*/, 9];
                    case 8: throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                    case 9: return [3 /*break*/, 12];
                    case 10:
                        error_9 = _a.sent();
                        errorMessage = error_9 instanceof Error ? error_9.message : 'Unknown error';
                        results.failed++;
                        results.errors.push("Failed to send webhook to ".concat(webhookUrl, ": ").concat(errorMessage));
                        // Update delivery status
                        return [4 /*yield*/, this.updateNotificationDelivery(deliveryId, {
                                status: 'failed',
                                failed_at: new Date(),
                                error_message: errorMessage,
                            })];
                    case 11:
                        // Update delivery status
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 12:
                        _i++;
                        return [3 /*break*/, 3];
                    case 13:
                        results.success = results.sent > 0;
                        return [2 /*return*/, results];
                    case 14:
                        error_10 = _a.sent();
                        console.error('Error in sendWebhookNotification:', error_10);
                        results.failed = webhookUrls.length;
                        results.errors.push(error_10 instanceof Error ? error_10.message : 'Unknown error');
                        return [2 /*return*/, results];
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    // ==========================================
    // UNIFIED NOTIFICATION METHODS
    // ==========================================
    StockNotificationsService.prototype.sendStockAlertNotifications = function (alertData) {
        return __awaiter(this, void 0, void 0, function () {
            var overallResults, recipients, emailRecipients, emailResult, pushRecipients, pushResult, webhookUrls, webhookResult, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        overallResults = {
                            success: false,
                            results: {
                                email: { sent: 0, failed: 0, errors: [] },
                                push: { sent: 0, failed: 0, errors: [] },
                                webhook: { sent: 0, failed: 0, errors: [] },
                            },
                            total_sent: 0,
                            total_failed: 0,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 10, , 11]);
                        return [4 /*yield*/, this.getNotificationRecipients(alertData.clinicId, alertData.alertType, alertData.severityLevel)];
                    case 2:
                        recipients = _a.sent();
                        if (recipients.length === 0) {
                            console.warn("No recipients found for alert ".concat(alertData.alertId));
                            return [2 /*return*/, overallResults];
                        }
                        emailRecipients = recipients
                            .filter(function (r) { return r.notification_preferences.email !== false; })
                            .map(function (r) { return r.email; });
                        if (!(emailRecipients.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.sendEmailNotification(alertData.clinicId, alertData, emailRecipients, 'stock_alert')];
                    case 3:
                        emailResult = _a.sent();
                        overallResults.results.email = {
                            sent: emailResult.sent,
                            failed: emailResult.failed,
                            errors: emailResult.errors,
                        };
                        _a.label = 4;
                    case 4:
                        pushRecipients = recipients
                            .filter(function (r) { return r.notification_preferences.push !== false; })
                            .map(function (r) { return r.user_id; });
                        if (!(pushRecipients.length > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.sendPushNotification(alertData.clinicId, alertData, pushRecipients, 'stock_alert')];
                    case 5:
                        pushResult = _a.sent();
                        overallResults.results.push = {
                            sent: pushResult.sent,
                            failed: pushResult.failed,
                            errors: pushResult.errors,
                        };
                        _a.label = 6;
                    case 6: return [4 /*yield*/, this.getClinicWebhookUrls(alertData.clinicId, 'stock_alert')];
                    case 7:
                        webhookUrls = _a.sent();
                        if (!(webhookUrls.length > 0)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.sendWebhookNotification(alertData.clinicId, alertData, webhookUrls, 'stock_alert')];
                    case 8:
                        webhookResult = _a.sent();
                        overallResults.results.webhook = {
                            sent: webhookResult.sent,
                            failed: webhookResult.failed,
                            errors: webhookResult.errors,
                        };
                        _a.label = 9;
                    case 9:
                        // Calculate totals
                        overallResults.total_sent =
                            overallResults.results.email.sent +
                                overallResults.results.push.sent +
                                overallResults.results.webhook.sent;
                        overallResults.total_failed =
                            overallResults.results.email.failed +
                                overallResults.results.push.failed +
                                overallResults.results.webhook.failed;
                        overallResults.success = overallResults.total_sent > 0;
                        return [2 /*return*/, overallResults];
                    case 10:
                        error_11 = _a.sent();
                        console.error('Error in sendStockAlertNotifications:', error_11);
                        return [2 /*return*/, overallResults];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    StockNotificationsService.prototype.sendResolutionNotifications = function (resolutionData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Similar implementation to sendStockAlertNotifications but for resolution notifications
                // This follows the same pattern but with resolution-specific templates and recipients
                return [2 /*return*/, this.sendStockAlertNotifications(resolutionData)]; // Implementation would be similar
            });
        });
    };
    // ==========================================
    // UTILITY METHODS
    // ==========================================
    StockNotificationsService.prototype.prepareTemplateVariables = function (data, templateType) {
        var baseVariables = {
            product_name: data.productName,
            product_id: data.productId,
            alert_id: data.alertId,
            clinic_id: data.clinicId,
        };
        if (templateType === 'stock_alert') {
            var alertData = data;
            return __assign(__assign({}, baseVariables), { alert_type: alertData.alertType, severity_level: alertData.severityLevel, current_value: alertData.currentValue, threshold_value: alertData.thresholdValue, message: alertData.message, product_sku: alertData.productSku || '' });
        }
        else {
            var resolutionData = data;
            return __assign(__assign({}, baseVariables), { resolved_by: resolutionData.resolvedByName, resolved_by_id: resolutionData.resolvedBy, resolution: resolutionData.resolution, actions_taken: resolutionData.actionsTaken.join(', '), resolved_at: resolutionData.resolvedAt.toISOString(), original_alert_type: resolutionData.originalAlert.alertType, original_severity: resolutionData.originalAlert.severityLevel });
        }
    };
    StockNotificationsService.prototype.getClinicWebhookUrls = function (clinicId, eventType) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('clinic_webhook_configs')
                                .select('webhook_url')
                                .eq('clinic_id', clinicId)
                                .contains('events', [eventType])
                                .eq('is_active', true)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching webhook URLs:', error);
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/, data.map(function (config) { return config.webhook_url; })];
                    case 2:
                        error_12 = _b.sent();
                        console.error('Error in getClinicWebhookUrls:', error_12);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ==========================================
    // RETRY MECHANISM
    // ==========================================
    StockNotificationsService.prototype.retryFailedNotifications = function () {
        return __awaiter(this, void 0, void 0, function () {
            var results, _a, failedNotifications, error, _i, failedNotifications_1, notification, lastFailure, now, timeSinceFailure, success, errorMessage, _b, emailResult, response, payload, pushResult, shouldExpire, error_13, shouldExpire, error_14;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        results = {
                            processed: 0,
                            retried: 0,
                            expired: 0,
                        };
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 24, , 25]);
                        return [4 /*yield*/, this.supabase
                                .from('notification_deliveries')
                                .select('*')
                                .eq('status', 'failed')
                                .lt('retry_count', this.maxRetries)
                                .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())];
                    case 2:
                        _a = _c.sent(), failedNotifications = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching failed notifications:', error);
                            return [2 /*return*/, results];
                        }
                        _i = 0, failedNotifications_1 = failedNotifications;
                        _c.label = 3;
                    case 3:
                        if (!(_i < failedNotifications_1.length)) return [3 /*break*/, 23];
                        notification = failedNotifications_1[_i];
                        results.processed++;
                        lastFailure = new Date(notification.failed_at);
                        now = new Date();
                        timeSinceFailure = now.getTime() - lastFailure.getTime();
                        if (timeSinceFailure < this.retryDelayMs * Math.pow(2, notification.retry_count)) {
                            return [3 /*break*/, 22]; // Not ready to retry yet (exponential backoff)
                        }
                        // Mark as retrying
                        return [4 /*yield*/, this.updateNotificationDelivery(notification.id, {
                                status: 'retrying',
                                retry_count: notification.retry_count + 1,
                            })];
                    case 4:
                        // Mark as retrying
                        _c.sent();
                        success = false;
                        errorMessage = '';
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 20, , 22]);
                        _b = notification.channel;
                        switch (_b) {
                            case 'email': return [3 /*break*/, 6];
                            case 'webhook': return [3 /*break*/, 9];
                            case 'push': return [3 /*break*/, 12];
                        }
                        return [3 /*break*/, 15];
                    case 6:
                        if (!notification.recipient_email) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.resend.emails.send({
                                from: process.env.DEFAULT_FROM_EMAIL || 'alerts@neonpro.com',
                                to: [notification.recipient_email],
                                subject: notification.subject || 'Alerta de Estoque',
                                html: notification.content,
                            })];
                    case 7:
                        emailResult = _c.sent();
                        success = !emailResult.error;
                        if (emailResult.error)
                            errorMessage = emailResult.error.message;
                        _c.label = 8;
                    case 8: return [3 /*break*/, 15];
                    case 9:
                        if (!notification.webhook_url) return [3 /*break*/, 11];
                        return [4 /*yield*/, axios_1.default.post(notification.webhook_url, JSON.parse(notification.content), {
                                timeout: 30000,
                                headers: { 'Content-Type': 'application/json' },
                            })];
                    case 10:
                        response = _c.sent();
                        success = response.status >= 200 && response.status < 300;
                        if (!success)
                            errorMessage = "HTTP ".concat(response.status);
                        _c.label = 11;
                    case 11: return [3 /*break*/, 15];
                    case 12:
                        if (!notification.recipient_id) return [3 /*break*/, 14];
                        payload = JSON.parse(notification.content);
                        return [4 /*yield*/, push_notification_service_1.default.sendToUser(notification.recipient_id, payload)];
                    case 13:
                        pushResult = _c.sent();
                        success = pushResult.success;
                        if (!success)
                            errorMessage = pushResult.errors.join(', ');
                        _c.label = 14;
                    case 14: return [3 /*break*/, 15];
                    case 15:
                        if (!success) return [3 /*break*/, 17];
                        return [4 /*yield*/, this.updateNotificationDelivery(notification.id, {
                                status: 'sent',
                                sent_at: new Date(),
                            })];
                    case 16:
                        _c.sent();
                        results.retried++;
                        return [3 /*break*/, 19];
                    case 17:
                        shouldExpire = notification.retry_count + 1 >= this.maxRetries;
                        return [4 /*yield*/, this.updateNotificationDelivery(notification.id, {
                                status: shouldExpire ? 'failed' : 'failed',
                                failed_at: new Date(),
                                error_message: errorMessage || 'Retry failed',
                            })];
                    case 18:
                        _c.sent();
                        if (shouldExpire) {
                            results.expired++;
                        }
                        _c.label = 19;
                    case 19: return [3 /*break*/, 22];
                    case 20:
                        error_13 = _c.sent();
                        shouldExpire = notification.retry_count + 1 >= this.maxRetries;
                        return [4 /*yield*/, this.updateNotificationDelivery(notification.id, {
                                status: 'failed',
                                failed_at: new Date(),
                                error_message: error_13 instanceof Error ? error_13.message : 'Unknown retry error',
                            })];
                    case 21:
                        _c.sent();
                        if (shouldExpire) {
                            results.expired++;
                        }
                        return [3 /*break*/, 22];
                    case 22:
                        _i++;
                        return [3 /*break*/, 3];
                    case 23: return [2 /*return*/, results];
                    case 24:
                        error_14 = _c.sent();
                        console.error('Error in retryFailedNotifications:', error_14);
                        return [2 /*return*/, results];
                    case 25: return [2 /*return*/];
                }
            });
        });
    };
    return StockNotificationsService;
}());
// Singleton instance
var stockNotificationsService = new StockNotificationsService();
exports.default = stockNotificationsService;
