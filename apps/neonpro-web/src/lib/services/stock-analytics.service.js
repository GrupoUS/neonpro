"use strict";
// Stock Analytics Service
// Analytics and metrics system for stock alert resolution tracking
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
var StockAnalyticsService = /** @class */ (function () {
    function StockAnalyticsService() {
    }
    StockAnalyticsService.prototype.getSupabaseClient = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // ==========================================
    // METRICS CALCULATION
    // ==========================================
    StockAnalyticsService.prototype.calculateDailyMetrics = function (clinicId, date, alertType, severityLevel) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, startOfDay, endOfDay, query, _a, alerts, error, totalAlertsCreated, resolvedAlerts, dismissedAlerts, totalAlertsResolved, totalAlertsDismissed, resolutionTimes, acknowledgmentTimes, avgResolutionTime, avgAcknowledgmentTime, fastestResolutionTime, slowestResolutionTime, resolutionRate, thirtyDaysAgo, recurrenceCount, notificationMetrics, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.getSupabaseClient()];
                    case 1:
                        supabase = _b.sent();
                        startOfDay = new Date(date);
                        startOfDay.setHours(0, 0, 0, 0);
                        endOfDay = new Date(date);
                        endOfDay.setHours(23, 59, 59, 999);
                        query = supabase
                            .from('stock_alerts_history')
                            .select('*')
                            .eq('clinic_id', clinicId)
                            .gte('created_at', startOfDay.toISOString())
                            .lte('created_at', endOfDay.toISOString());
                        // Apply filters if specified
                        if (alertType && alertType !== 'all') {
                            query = query.eq('alert_type', alertType);
                        }
                        if (severityLevel && severityLevel !== 'all') {
                            query = query.eq('severity_level', severityLevel);
                        }
                        return [4 /*yield*/, query];
                    case 2:
                        _a = _b.sent(), alerts = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching alerts for metrics:', error);
                            return [2 /*return*/, null];
                        }
                        totalAlertsCreated = alerts.length;
                        resolvedAlerts = alerts.filter(function (a) { return a.status === 'resolved'; });
                        dismissedAlerts = alerts.filter(function (a) { return a.status === 'dismissed'; });
                        totalAlertsResolved = resolvedAlerts.length;
                        totalAlertsDismissed = dismissedAlerts.length;
                        resolutionTimes = resolvedAlerts
                            .filter(function (a) { return a.resolved_at; })
                            .map(function (a) {
                            var created = new Date(a.created_at);
                            var resolved = new Date(a.resolved_at);
                            return (resolved.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
                        });
                        acknowledgmentTimes = alerts
                            .filter(function (a) { return a.acknowledged_at; })
                            .map(function (a) {
                            var created = new Date(a.created_at);
                            var acknowledged = new Date(a.acknowledged_at);
                            return (acknowledged.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
                        });
                        avgResolutionTime = resolutionTimes.length > 0
                            ? resolutionTimes.reduce(function (sum, time) { return sum + time; }, 0) / resolutionTimes.length
                            : undefined;
                        avgAcknowledgmentTime = acknowledgmentTimes.length > 0
                            ? acknowledgmentTimes.reduce(function (sum, time) { return sum + time; }, 0) / acknowledgmentTimes.length
                            : undefined;
                        fastestResolutionTime = resolutionTimes.length > 0 ? Math.min.apply(Math, resolutionTimes) : undefined;
                        slowestResolutionTime = resolutionTimes.length > 0 ? Math.max.apply(Math, resolutionTimes) : undefined;
                        resolutionRate = totalAlertsCreated > 0
                            ? (totalAlertsResolved / totalAlertsCreated) * 100
                            : 0;
                        thirtyDaysAgo = new Date(date.getTime() - (30 * 24 * 60 * 60 * 1000));
                        return [4 /*yield*/, this.calculateRecurrenceCount(clinicId, thirtyDaysAgo, date, alertType, severityLevel)];
                    case 3:
                        recurrenceCount = _b.sent();
                        return [4 /*yield*/, this.calculateNotificationMetrics(clinicId, date, alertType, severityLevel)];
                    case 4:
                        notificationMetrics = _b.sent();
                        return [2 /*return*/, {
                                id: '', // Will be set when saving to database
                                clinic_id: clinicId,
                                metric_date: date,
                                alert_type: (alertType || 'all'),
                                severity_level: (severityLevel || 'all'),
                                total_alerts_created: totalAlertsCreated,
                                total_alerts_resolved: totalAlertsResolved,
                                total_alerts_dismissed: totalAlertsDismissed,
                                avg_resolution_time_hours: avgResolutionTime,
                                avg_acknowledgment_time_hours: avgAcknowledgmentTime,
                                fastest_resolution_time_hours: fastestResolutionTime,
                                slowest_resolution_time_hours: slowestResolutionTime,
                                resolution_rate_percentage: resolutionRate,
                                recurrence_count: recurrenceCount,
                                automation_triggered_count: notificationMetrics.automationTriggered,
                                notification_sent_count: notificationMetrics.notificationsSent,
                                notification_success_rate: notificationMetrics.successRate,
                            }];
                    case 5:
                        error_1 = _b.sent();
                        console.error('Error calculating daily metrics:', error_1);
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    StockAnalyticsService.prototype.calculateRecurrenceCount = function (clinicId, startDate, endDate, alertType, severityLevel) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, alerts, error, productCounts, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSupabaseClient()];
                    case 1:
                        supabase = _b.sent();
                        query = supabase
                            .from('stock_alerts_history')
                            .select('product_id')
                            .eq('clinic_id', clinicId)
                            .gte('created_at', startDate.toISOString())
                            .lte('created_at', endDate.toISOString());
                        if (alertType && alertType !== 'all') {
                            query = query.eq('alert_type', alertType);
                        }
                        if (severityLevel && severityLevel !== 'all') {
                            query = query.eq('severity_level', severityLevel);
                        }
                        return [4 /*yield*/, query];
                    case 2:
                        _a = _b.sent(), alerts = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error calculating recurrence count:', error);
                            return [2 /*return*/, 0];
                        }
                        productCounts = alerts.reduce(function (acc, alert) {
                            acc[alert.product_id] = (acc[alert.product_id] || 0) + 1;
                            return acc;
                        }, {});
                        return [2 /*return*/, Object.values(productCounts).filter(function (count) { return count > 1; }).length];
                    case 3:
                        error_2 = _b.sent();
                        console.error('Error in calculateRecurrenceCount:', error_2);
                        return [2 /*return*/, 0];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StockAnalyticsService.prototype.calculateNotificationMetrics = function (clinicId, date, alertType, severityLevel) {
        return __awaiter(this, void 0, void 0, function () {
            var startOfDay, endOfDay, supabase, _a, notifications, error, filteredNotifications, totalNotifications, successfulNotifications, successRate, automationTriggered, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        startOfDay = new Date(date);
                        startOfDay.setHours(0, 0, 0, 0);
                        endOfDay = new Date(date);
                        endOfDay.setHours(23, 59, 59, 999);
                        return [4 /*yield*/, this.getSupabaseClient()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('notification_deliveries')
                                .select("\n          *,\n          stock_alerts_history!inner(\n            alert_type,\n            severity_level\n          )\n        ")
                                .eq('clinic_id', clinicId)
                                .gte('created_at', startOfDay.toISOString())
                                .lte('created_at', endOfDay.toISOString())];
                    case 2:
                        _a = _b.sent(), notifications = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching notification metrics:', error);
                            return [2 /*return*/, { automationTriggered: 0, notificationsSent: 0, successRate: 0 }];
                        }
                        filteredNotifications = notifications === null || notifications === void 0 ? void 0 : notifications.filter(function (notif) {
                            var alert = notif.stock_alerts_history;
                            if (alertType && alertType !== 'all' && alert.alert_type !== alertType)
                                return false;
                            if (severityLevel && severityLevel !== 'all' && alert.severity_level !== severityLevel)
                                return false;
                            return true;
                        });
                        totalNotifications = filteredNotifications.length;
                        successfulNotifications = filteredNotifications.filter(function (n) {
                            return n.status === 'sent' || n.status === 'delivered';
                        }).length;
                        successRate = totalNotifications > 0
                            ? (successfulNotifications / totalNotifications) * 100
                            : 0;
                        return [4 /*yield*/, this.countAutomationTriggers(clinicId, date, alertType, severityLevel)];
                    case 3:
                        automationTriggered = _b.sent();
                        return [2 /*return*/, {
                                automationTriggered: automationTriggered,
                                notificationsSent: totalNotifications,
                                successRate: successRate
                            }];
                    case 4:
                        error_3 = _b.sent();
                        console.error('Error in calculateNotificationMetrics:', error_3);
                        return [2 /*return*/, { automationTriggered: 0, notificationsSent: 0, successRate: 0 }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    StockAnalyticsService.prototype.countAutomationTriggers = function (clinicId, date, alertType, severityLevel) {
        return __awaiter(this, void 0, void 0, function () {
            var startOfDay, endOfDay, supabase, purchaseOrderQuery, _a, purchaseItems, purchaseError, purchaseOrderTriggers, configUpdateQuery, _b, configUpdates, configError, configUpdateTriggers, reorderQuery, _c, reorderSuggestions, reorderError, reorderTriggers, error_4;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, , 6]);
                        startOfDay = new Date(date);
                        startOfDay.setHours(0, 0, 0, 0);
                        endOfDay = new Date(date);
                        endOfDay.setHours(23, 59, 59, 999);
                        return [4 /*yield*/, this.getSupabaseClient()];
                    case 1:
                        supabase = _d.sent();
                        purchaseOrderQuery = supabase
                            .from('purchase_order_items')
                            .select('alert_trigger_id')
                            .not('alert_trigger_id', 'is', null)
                            .gte('created_at', startOfDay.toISOString())
                            .lte('created_at', endOfDay.toISOString());
                        return [4 /*yield*/, purchaseOrderQuery];
                    case 2:
                        _a = _d.sent(), purchaseItems = _a.data, purchaseError = _a.error;
                        purchaseOrderTriggers = (purchaseItems === null || purchaseItems === void 0 ? void 0 : purchaseItems.length) || 0;
                        configUpdateQuery = supabase
                            .from('alert_config_updates_log')
                            .select('trigger_alert_id')
                            .not('trigger_alert_id', 'is', null)
                            .gte('created_at', startOfDay.toISOString())
                            .lte('created_at', endOfDay.toISOString());
                        return [4 /*yield*/, configUpdateQuery];
                    case 3:
                        _b = _d.sent(), configUpdates = _b.data, configError = _b.error;
                        configUpdateTriggers = (configUpdates === null || configUpdates === void 0 ? void 0 : configUpdates.length) || 0;
                        reorderQuery = supabase
                            .from('reorder_suggestions')
                            .select('trigger_alert_id')
                            .eq('clinic_id', clinicId)
                            .not('trigger_alert_id', 'is', null)
                            .gte('created_at', startOfDay.toISOString())
                            .lte('created_at', endOfDay.toISOString());
                        return [4 /*yield*/, reorderQuery];
                    case 4:
                        _c = _d.sent(), reorderSuggestions = _c.data, reorderError = _c.error;
                        reorderTriggers = (reorderSuggestions === null || reorderSuggestions === void 0 ? void 0 : reorderSuggestions.length) || 0;
                        return [2 /*return*/, purchaseOrderTriggers + configUpdateTriggers + reorderTriggers];
                    case 5:
                        error_4 = _d.sent();
                        console.error('Error counting automation triggers:', error_4);
                        return [2 /*return*/, 0];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // ==========================================
    // METRICS STORAGE
    // ==========================================
    StockAnalyticsService.prototype.saveMetrics = function (metrics) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, error, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSupabaseClient()];
                    case 1:
                        supabase = _a.sent();
                        return [4 /*yield*/, supabase
                                .from('alert_resolution_analytics')
                                .upsert({
                                clinic_id: metrics.clinic_id,
                                metric_date: metrics.metric_date.toISOString().split('T')[0], // Date only
                                alert_type: metrics.alert_type,
                                severity_level: metrics.severity_level,
                                total_alerts_created: metrics.total_alerts_created,
                                total_alerts_resolved: metrics.total_alerts_resolved,
                                total_alerts_dismissed: metrics.total_alerts_dismissed,
                                avg_resolution_time_hours: metrics.avg_resolution_time_hours,
                                avg_acknowledgment_time_hours: metrics.avg_acknowledgment_time_hours,
                                fastest_resolution_time_hours: metrics.fastest_resolution_time_hours,
                                slowest_resolution_time_hours: metrics.slowest_resolution_time_hours,
                                resolution_rate_percentage: metrics.resolution_rate_percentage,
                                recurrence_count: metrics.recurrence_count,
                                automation_triggered_count: metrics.automation_triggered_count,
                                notification_sent_count: metrics.notification_sent_count,
                                notification_success_rate: metrics.notification_success_rate,
                            })];
                    case 2:
                        error = (_a.sent()).error;
                        if (error) {
                            console.error('Error saving metrics:', error);
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, true];
                    case 3:
                        error_5 = _a.sent();
                        console.error('Error in saveMetrics:', error_5);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ==========================================
    // ANALYTICS QUERIES
    // ==========================================
    StockAnalyticsService.prototype.getMetrics = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, dbQuery, _a, data, error, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSupabaseClient()];
                    case 1:
                        supabase = _b.sent();
                        dbQuery = supabase
                            .from('alert_resolution_analytics')
                            .select('*')
                            .eq('clinic_id', query.clinicId)
                            .gte('metric_date', query.startDate.toISOString().split('T')[0])
                            .lte('metric_date', query.endDate.toISOString().split('T')[0]);
                        if (query.alertType) {
                            dbQuery = dbQuery.eq('alert_type', query.alertType);
                        }
                        if (query.severityLevel) {
                            dbQuery = dbQuery.eq('severity_level', query.severityLevel);
                        }
                        return [4 /*yield*/, dbQuery.order('metric_date', { ascending: true })];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching metrics:', error);
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/, data.map(function (row) { return (__assign(__assign({}, row), { metric_date: new Date(row.metric_date) })); })];
                    case 3:
                        error_6 = _b.sent();
                        console.error('Error in getMetrics:', error_6);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StockAnalyticsService.prototype.getResolutionTimeAnalysis = function (clinicId, startDate, endDate, alertType) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, alerts, error, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSupabaseClient()];
                    case 1:
                        supabase = _b.sent();
                        query = supabase
                            .from('stock_alerts_history')
                            .select('id, created_at, acknowledged_at, resolved_at, alert_type')
                            .eq('clinic_id', clinicId)
                            .gte('created_at', startDate.toISOString())
                            .lte('created_at', endDate.toISOString())
                            .not('resolved_at', 'is', null);
                        if (alertType) {
                            query = query.eq('alert_type', alertType);
                        }
                        return [4 /*yield*/, query];
                    case 2:
                        _a = _b.sent(), alerts = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching resolution time analysis:', error);
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/, alerts.map(function (alert) {
                                var created = new Date(alert.created_at);
                                var acknowledged = alert.acknowledged_at ? new Date(alert.acknowledged_at) : undefined;
                                var resolved = new Date(alert.resolved_at);
                                var acknowledgmentTime = acknowledged
                                    ? (acknowledged.getTime() - created.getTime()) / (1000 * 60 * 60)
                                    : undefined;
                                var resolutionTime = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);
                                return {
                                    alert_id: alert.id,
                                    created_at: created,
                                    acknowledged_at: acknowledged,
                                    resolved_at: resolved,
                                    acknowledgment_time_hours: acknowledgmentTime,
                                    resolution_time_hours: resolutionTime,
                                    total_time_hours: resolutionTime,
                                };
                            })];
                    case 3:
                        error_7 = _b.sent();
                        console.error('Error in getResolutionTimeAnalysis:', error_7);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StockAnalyticsService.prototype.getRecurrencePatterns = function (clinicId_1) {
        return __awaiter(this, arguments, void 0, function (clinicId, lookbackDays) {
            var startDate, supabase, _a, alerts, error, patterns_1, error_8;
            if (lookbackDays === void 0) { lookbackDays = 90; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        startDate = new Date();
                        startDate.setDate(startDate.getDate() - lookbackDays);
                        return [4 /*yield*/, this.getSupabaseClient()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('stock_alerts_history')
                                .select("\n          product_id,\n          alert_type,\n          created_at,\n          products!inner(name)\n        ")
                                .eq('clinic_id', clinicId)
                                .gte('created_at', startDate.toISOString())
                                .order('created_at', { ascending: true })];
                    case 2:
                        _a = _b.sent(), alerts = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching recurrence patterns:', error);
                            return [2 /*return*/, []];
                        }
                        patterns_1 = new Map();
                        alerts.forEach(function (alert) {
                            var key = "".concat(alert.product_id, "_").concat(alert.alert_type);
                            if (!patterns_1.has(key)) {
                                patterns_1.set(key, {
                                    product_id: alert.product_id,
                                    product_name: alert.products.name,
                                    alert_type: alert.alert_type,
                                    dates: [],
                                });
                            }
                            patterns_1.get(key).dates.push(new Date(alert.created_at));
                        });
                        // Calculate patterns for products with multiple alerts
                        return [2 /*return*/, Array.from(patterns_1.values())
                                .filter(function (pattern) { return pattern.dates.length > 1; })
                                .map(function (pattern) {
                                var sortedDates = pattern.dates.sort(function (a, b) { return a.getTime() - b.getTime(); });
                                var intervals = [];
                                for (var i = 1; i < sortedDates.length; i++) {
                                    var days = (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
                                    intervals.push(days);
                                }
                                var avgDaysBetween = intervals.reduce(function (sum, days) { return sum + days; }, 0) / intervals.length;
                                // Determine trend (simplified - compare first half to second half)
                                var mid = Math.floor(intervals.length / 2);
                                var firstHalfAvg = intervals.slice(0, mid).reduce(function (sum, days) { return sum + days; }, 0) / mid;
                                var secondHalfAvg = intervals.slice(mid).reduce(function (sum, days) { return sum + days; }, 0) / (intervals.length - mid);
                                var trend = 'stable';
                                if (secondHalfAvg < firstHalfAvg * 0.8) {
                                    trend = 'increasing'; // Shorter intervals = increasing frequency
                                }
                                else if (secondHalfAvg > firstHalfAvg * 1.2) {
                                    trend = 'decreasing'; // Longer intervals = decreasing frequency
                                }
                                return {
                                    product_id: pattern.product_id,
                                    product_name: pattern.product_name,
                                    alert_type: pattern.alert_type,
                                    frequency_count: pattern.dates.length,
                                    avg_days_between: Math.round(avgDaysBetween * 100) / 100,
                                    last_occurrence: sortedDates[sortedDates.length - 1],
                                    trend: trend,
                                };
                            })
                                .sort(function (a, b) { return b.frequency_count - a.frequency_count; })];
                    case 3:
                        error_8 = _b.sent();
                        console.error('Error in getRecurrencePatterns:', error_8);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ==========================================
    // DASHBOARD METRICS
    // ==========================================
    StockAnalyticsService.prototype.getDashboardSummary = function (clinicId_1) {
        return __awaiter(this, arguments, void 0, function (clinicId, days) {
            var endDate, startDate, metrics, totalAlerts, resolvedAlerts, resolutionRate, avgResolutionTime, criticalAlertsCount, recurringIssuesCount, notificationSuccessRate, supabase, _a, alertTypes, alertTypesError, topAlertTypes, resolutionTrend, error_9;
            if (days === void 0) { days = 30; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        endDate = new Date();
                        startDate = new Date();
                        startDate.setDate(startDate.getDate() - days);
                        return [4 /*yield*/, this.getMetrics({
                                clinicId: clinicId,
                                startDate: startDate,
                                endDate: endDate,
                                groupBy: 'day',
                            })];
                    case 1:
                        metrics = _b.sent();
                        totalAlerts = metrics.reduce(function (sum, m) { return sum + m.total_alerts_created; }, 0);
                        resolvedAlerts = metrics.reduce(function (sum, m) { return sum + m.total_alerts_resolved; }, 0);
                        resolutionRate = totalAlerts > 0 ? (resolvedAlerts / totalAlerts) * 100 : 0;
                        avgResolutionTime = metrics
                            .filter(function (m) { return m.avg_resolution_time_hours; })
                            .reduce(function (sum, m) { return sum + (m.avg_resolution_time_hours || 0); }, 0) /
                            metrics.filter(function (m) { return m.avg_resolution_time_hours; }).length || 0;
                        criticalAlertsCount = metrics
                            .filter(function (m) { return m.severity_level === 'critical'; })
                            .reduce(function (sum, m) { return sum + m.total_alerts_created; }, 0);
                        recurringIssuesCount = metrics.reduce(function (sum, m) { return sum + m.recurrence_count; }, 0);
                        notificationSuccessRate = metrics
                            .filter(function (m) { return m.notification_success_rate; })
                            .reduce(function (sum, m) { return sum + (m.notification_success_rate || 0); }, 0) /
                            metrics.filter(function (m) { return m.notification_success_rate; }).length || 0;
                        return [4 /*yield*/, this.getSupabaseClient()];
                    case 2:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('stock_alerts_history')
                                .select('alert_type')
                                .eq('clinic_id', clinicId)
                                .gte('created_at', startDate.toISOString())
                                .lte('created_at', endDate.toISOString())];
                    case 3:
                        _a = _b.sent(), alertTypes = _a.data, alertTypesError = _a.error;
                        topAlertTypes = alertTypes
                            ? Object.entries(alertTypes.reduce(function (acc, alert) {
                                acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
                                return acc;
                            }, {}))
                                .map(function (_a) {
                                var type = _a[0], count = _a[1];
                                return ({ type: type, count: count });
                            })
                                .sort(function (a, b) { return b.count - a.count; })
                                .slice(0, 5)
                            : [];
                        resolutionTrend = metrics
                            .filter(function (m) { return m.alert_type === 'all' && m.severity_level === 'all'; })
                            .map(function (m) { return ({
                            date: m.metric_date.toISOString().split('T')[0],
                            resolved: m.total_alerts_resolved,
                            created: m.total_alerts_created,
                        }); });
                        return [2 /*return*/, {
                                totalAlerts: totalAlerts,
                                resolvedAlerts: resolvedAlerts,
                                resolutionRate: Math.round(resolutionRate * 100) / 100,
                                avgResolutionTime: Math.round(avgResolutionTime * 100) / 100,
                                criticalAlertsCount: criticalAlertsCount,
                                recurringIssuesCount: recurringIssuesCount,
                                notificationSuccessRate: Math.round(notificationSuccessRate * 100) / 100,
                                topAlertTypes: topAlertTypes,
                                resolutionTrend: resolutionTrend,
                            }];
                    case 4:
                        error_9 = _b.sent();
                        console.error('Error in getDashboardSummary:', error_9);
                        return [2 /*return*/, {
                                totalAlerts: 0,
                                resolvedAlerts: 0,
                                resolutionRate: 0,
                                avgResolutionTime: 0,
                                criticalAlertsCount: 0,
                                recurringIssuesCount: 0,
                                notificationSuccessRate: 0,
                                topAlertTypes: [],
                                resolutionTrend: [],
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // ==========================================
    // AUTOMATED METRICS CALCULATION
    // ==========================================
    StockAnalyticsService.prototype.processMetricsForDate = function (clinicId, date) {
        return __awaiter(this, void 0, void 0, function () {
            var results, alertTypes, severityLevels, _i, alertTypes_1, alertType, _a, severityLevels_1, severityLevel, metrics, saved, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        results = {
                            processed: 0,
                            success: 0,
                            failed: 0,
                            errors: [],
                        };
                        alertTypes = ['low_stock', 'expiring', 'expired', 'overstock', 'critical_shortage', 'all'];
                        severityLevels = ['low', 'medium', 'high', 'critical', 'all'];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 10, , 11]);
                        _i = 0, alertTypes_1 = alertTypes;
                        _b.label = 2;
                    case 2:
                        if (!(_i < alertTypes_1.length)) return [3 /*break*/, 9];
                        alertType = alertTypes_1[_i];
                        _a = 0, severityLevels_1 = severityLevels;
                        _b.label = 3;
                    case 3:
                        if (!(_a < severityLevels_1.length)) return [3 /*break*/, 8];
                        severityLevel = severityLevels_1[_a];
                        results.processed++;
                        return [4 /*yield*/, this.calculateDailyMetrics(clinicId, date, alertType, severityLevel)];
                    case 4:
                        metrics = _b.sent();
                        if (!metrics) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.saveMetrics(metrics)];
                    case 5:
                        saved = _b.sent();
                        if (saved) {
                            results.success++;
                        }
                        else {
                            results.failed++;
                            results.errors.push("Failed to save metrics for ".concat(alertType, "/").concat(severityLevel));
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        results.failed++;
                        results.errors.push("Failed to calculate metrics for ".concat(alertType, "/").concat(severityLevel));
                        _b.label = 7;
                    case 7:
                        _a++;
                        return [3 /*break*/, 3];
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9: return [2 /*return*/, results];
                    case 10:
                        error_10 = _b.sent();
                        console.error('Error in processMetricsForDate:', error_10);
                        results.errors.push(error_10 instanceof Error ? error_10.message : 'Unknown error');
                        return [2 /*return*/, results];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    return StockAnalyticsService;
}());
// Singleton instance
var stockAnalyticsService = new StockAnalyticsService();
exports.default = stockAnalyticsService;
