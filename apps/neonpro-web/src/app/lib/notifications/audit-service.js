"use strict";
/**
 * NeonPro - Audit Service for HIPAA Compliance
 * Comprehensive logging for notification activities and compliance tracking
 */
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
exports.AuditService = void 0;
var client_1 = require("@/lib/supabase/client");
var AuditService = /** @class */ (function () {
    function AuditService() {
    }
    /**
     * Log notification activity for HIPAA compliance
     */
    AuditService.prototype.log = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            var auditData, error, error_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        auditData = {
                            action: entry.action,
                            recipient_id: entry.recipientId,
                            notification_id: entry.notificationId,
                            notification_type: entry.notificationType,
                            channel: entry.channel,
                            success: entry.success,
                            error_message: entry.error,
                            reason: entry.reason,
                            delivered_at: (_a = entry.deliveredAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
                            scheduled_for: (_b = entry.scheduledFor) === null || _b === void 0 ? void 0 : _b.toISOString(),
                            metadata: entry.metadata,
                            ip_address: entry.ipAddress,
                            user_agent: entry.userAgent,
                            session_id: entry.sessionId,
                            timestamp: new Date().toISOString()
                        };
                        return [4 /*yield*/, client_1.supabase
                                .from('notification_audit_log')
                                .insert(auditData)];
                    case 1:
                        error = (_c.sent()).error;
                        if (error) {
                            console.error('Failed to write audit log:', error);
                            // Don't throw error - logging failure shouldn't break notification flow
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, true];
                    case 2:
                        error_1 = _c.sent();
                        console.error('Audit service error:', error_1);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Log successful notification delivery
     */
    AuditService.prototype.logDelivery = function (notificationId, recipientId, channel, type, deliveredAt) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.log({
                            action: 'notification_sent',
                            notificationId: notificationId,
                            recipientId: recipientId,
                            channel: channel,
                            notificationType: type,
                            success: true,
                            deliveredAt: deliveredAt || new Date()
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Log notification failure
     */
    AuditService.prototype.logFailure = function (notificationId, recipientId, channel, type, error) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.log({
                            action: 'notification_failed',
                            notificationId: notificationId,
                            recipientId: recipientId,
                            channel: channel,
                            notificationType: type,
                            success: false,
                            error: error
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Log notification scheduling
     */
    AuditService.prototype.logScheduling = function (notificationId, recipientId, channel, type, scheduledFor) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.log({
                            action: 'notification_scheduled',
                            notificationId: notificationId,
                            recipientId: recipientId,
                            channel: channel,
                            notificationType: type,
                            scheduledFor: scheduledFor
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Log notification cancellation
     */
    AuditService.prototype.logCancellation = function (notificationId, recipientId, reason) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.log({
                            action: 'notification_cancelled',
                            notificationId: notificationId,
                            recipientId: recipientId,
                            reason: reason
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Log consent changes
     */
    AuditService.prototype.logConsentChange = function (recipientId, action, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.log({
                            action: action,
                            recipientId: recipientId,
                            metadata: metadata
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Log preferences update
     */
    AuditService.prototype.logPreferencesUpdate = function (recipientId, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.log({
                            action: 'preferences_updated',
                            recipientId: recipientId,
                            metadata: metadata
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }; /**
     * Get audit trail for specific notification
     */
    AuditService.prototype.getNotificationAuditTrail = function (notificationId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, client_1.supabase
                                .from('notification_audit_log')
                                .select('*')
                                .eq('notification_id', notificationId)
                                .order('timestamp', { ascending: true })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Failed to get audit trail:', error);
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/, data || []];
                    case 2:
                        error_2 = _b.sent();
                        console.error('Error getting audit trail:', error_2);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get audit trail for specific recipient (with HIPAA access controls)
     */
    AuditService.prototype.getRecipientAuditTrail = function (recipientId_1, startDate_1, endDate_1) {
        return __awaiter(this, arguments, void 0, function (recipientId, startDate, endDate, limit) {
            var query, _a, data, error, error_3;
            if (limit === void 0) { limit = 100; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = client_1.supabase
                            .from('notification_audit_log')
                            .select('*')
                            .eq('recipient_id', recipientId);
                        if (startDate) {
                            query = query.gte('timestamp', startDate.toISOString());
                        }
                        if (endDate) {
                            query = query.lte('timestamp', endDate.toISOString());
                        }
                        return [4 /*yield*/, query
                                .order('timestamp', { ascending: false })
                                .limit(limit)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Failed to get recipient audit trail:', error);
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/, data || []];
                    case 2:
                        error_3 = _b.sent();
                        console.error('Error getting recipient audit trail:', error_3);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate compliance report for specific time period
     */
    AuditService.prototype.generateComplianceReport = function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, logs, sent, successful, failed, cancelled, consentChanges, channelBreakdown_1, typeBreakdown_1, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, client_1.supabase
                                .from('notification_audit_log')
                                .select('action, channel, notification_type, success')
                                .gte('timestamp', startDate.toISOString())
                                .lte('timestamp', endDate.toISOString())];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Failed to generate compliance report:', error);
                            return [2 /*return*/, this.getEmptyReport()];
                        }
                        logs = data || [];
                        sent = logs.filter(function (l) { return l.action === 'notification_sent'; });
                        successful = sent.filter(function (l) { return l.success === true; }).length;
                        failed = sent.filter(function (l) { return l.success === false; }).length;
                        cancelled = logs.filter(function (l) { return l.action === 'notification_cancelled'; }).length;
                        consentChanges = logs.filter(function (l) {
                            return l.action === 'consent_granted' || l.action === 'consent_revoked';
                        }).length;
                        channelBreakdown_1 = {};
                        sent.forEach(function (log) {
                            if (log.channel) {
                                channelBreakdown_1[log.channel] = (channelBreakdown_1[log.channel] || 0) + 1;
                            }
                        });
                        typeBreakdown_1 = {};
                        sent.forEach(function (log) {
                            if (log.notification_type) {
                                typeBreakdown_1[log.notification_type] = (typeBreakdown_1[log.notification_type] || 0) + 1;
                            }
                        });
                        return [2 /*return*/, {
                                totalNotifications: sent.length,
                                successfulDeliveries: successful,
                                failedDeliveries: failed,
                                cancelledNotifications: cancelled,
                                consentChanges: consentChanges,
                                deliveryRate: sent.length > 0 ? (successful / sent.length) * 100 : 0,
                                channelBreakdown: channelBreakdown_1,
                                typeBreakdown: typeBreakdown_1
                            }];
                    case 2:
                        error_4 = _b.sent();
                        console.error('Error generating compliance report:', error_4);
                        return [2 /*return*/, this.getEmptyReport()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Archive old audit logs (HIPAA requires 7-year retention)
     */
    AuditService.prototype.archiveOldLogs = function () {
        return __awaiter(this, arguments, void 0, function (olderThanYears) {
            var cutoffDate, _a, data, error, error_5;
            if (olderThanYears === void 0) { olderThanYears = 7; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        cutoffDate = new Date();
                        cutoffDate.setFullYear(cutoffDate.getFullYear() - olderThanYears);
                        return [4 /*yield*/, client_1.supabase
                                .from('notification_audit_log')
                                .update({
                                archived: true,
                                archived_at: new Date().toISOString()
                            })
                                .lt('timestamp', cutoffDate.toISOString())
                                .is('archived', false)
                                .select('id')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Failed to archive old logs:', error);
                            return [2 /*return*/, 0];
                        }
                        return [2 /*return*/, (data === null || data === void 0 ? void 0 : data.length) || 0];
                    case 2:
                        error_5 = _b.sent();
                        console.error('Error archiving old logs:', error_5);
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get delivery statistics for dashboard
     */
    AuditService.prototype.getDeliveryStatistics = function () {
        return __awaiter(this, arguments, void 0, function (days) {
            var startDate, _a, data, error, logs, dailyGroups_1, channelGroups_1, dailyStats, channelStats_1, error_6;
            if (days === void 0) { days = 30; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        startDate = new Date();
                        startDate.setDate(startDate.getDate() - days);
                        return [4 /*yield*/, client_1.supabase
                                .from('notification_audit_log')
                                .select('timestamp, action, channel, success')
                                .eq('action', 'notification_sent')
                                .gte('timestamp', startDate.toISOString())
                                .order('timestamp', { ascending: true })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Failed to get delivery statistics:', error);
                            return [2 /*return*/, { dailyStats: [], channelStats: {} }];
                        }
                        logs = data || [];
                        dailyGroups_1 = {};
                        channelGroups_1 = {};
                        logs.forEach(function (log) {
                            var date = new Date(log.timestamp).toISOString().split('T')[0];
                            // Daily stats
                            if (!dailyGroups_1[date])
                                dailyGroups_1[date] = [];
                            dailyGroups_1[date].push(log);
                            // Channel stats
                            if (log.channel) {
                                if (!channelGroups_1[log.channel])
                                    channelGroups_1[log.channel] = [];
                                channelGroups_1[log.channel].push(log);
                            }
                        });
                        dailyStats = Object.entries(dailyGroups_1).map(function (_a) {
                            var date = _a[0], logs = _a[1];
                            return ({
                                date: date,
                                sent: logs.length,
                                delivered: logs.filter(function (l) { return l.success === true; }).length,
                                failed: logs.filter(function (l) { return l.success === false; }).length
                            });
                        });
                        channelStats_1 = {};
                        Object.entries(channelGroups_1).forEach(function (_a) {
                            var channel = _a[0], logs = _a[1];
                            var delivered = logs.filter(function (l) { return l.success === true; }).length;
                            channelStats_1[channel] = {
                                sent: logs.length,
                                delivered: delivered,
                                deliveryRate: logs.length > 0 ? (delivered / logs.length) * 100 : 0
                            };
                        });
                        return [2 /*return*/, { dailyStats: dailyStats, channelStats: channelStats_1 }];
                    case 2:
                        error_6 = _b.sent();
                        console.error('Error getting delivery statistics:', error_6);
                        return [2 /*return*/, { dailyStats: [], channelStats: {} }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AuditService.prototype.getEmptyReport = function () {
        return {
            totalNotifications: 0,
            successfulDeliveries: 0,
            failedDeliveries: 0,
            cancelledNotifications: 0,
            consentChanges: 0,
            deliveryRate: 0,
            channelBreakdown: {},
            typeBreakdown: {}
        };
    };
    return AuditService;
}());
exports.AuditService = AuditService;
