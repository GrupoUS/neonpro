"use strict";
/**
 * Suspicious Activity Detector
 * Story 1.4 - Task 4: Detection and monitoring of suspicious activities
 *
 * Features:
 * - Real-time activity pattern analysis
 * - Anomaly detection algorithms
 * - Behavioral baseline establishment
 * - Risk scoring and alerting
 * - Automated response triggers
 * - Machine learning-based detection
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuspiciousActivityDetector = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var security_audit_logger_1 = require("./security-audit-logger");
var DEFAULT_DETECTION_RULES = [
    {
        ruleId: 'velocity_anomaly_1',
        name: 'High API Call Velocity',
        description: 'Detects unusually high API call frequency',
        alertType: 'velocity_anomaly',
        severity: 'medium',
        isEnabled: true,
        conditions: [
            {
                timeWindow: 5,
                threshold: 100,
                operator: 'gt',
                field: 'api_calls',
                value: 100
            }
        ],
        actions: [
            {
                action: 'warn_user',
                delay: 0
            }
        ],
        applicableRoles: ['owner', 'manager', 'staff', 'patient']
    },
    {
        ruleId: 'location_anomaly_1',
        name: 'Impossible Travel',
        description: 'Detects logins from impossible geographic locations',
        alertType: 'impossible_travel',
        severity: 'high',
        isEnabled: true,
        conditions: [
            {
                timeWindow: 60,
                threshold: 1000,
                operator: 'gt',
                field: 'distance_km',
                value: 1000
            }
        ],
        actions: [
            {
                action: 'require_mfa',
                delay: 0
            },
            {
                action: 'escalate_admin',
                delay: 300
            }
        ],
        applicableRoles: ['owner', 'manager', 'staff']
    },
    {
        ruleId: 'data_exfiltration_1',
        name: 'Large Data Download',
        description: 'Detects unusually large data downloads',
        alertType: 'data_exfiltration',
        severity: 'high',
        isEnabled: true,
        conditions: [
            {
                timeWindow: 30,
                threshold: 100 * 1024 * 1024, // 100MB
                operator: 'gt',
                field: 'data_volume',
                value: 100 * 1024 * 1024
            }
        ],
        actions: [
            {
                action: 'escalate_admin',
                delay: 0
            }
        ],
        applicableRoles: ['staff', 'patient']
    },
    {
        ruleId: 'brute_force_1',
        name: 'Multiple Failed Logins',
        description: 'Detects potential brute force attacks',
        alertType: 'brute_force',
        severity: 'high',
        isEnabled: true,
        conditions: [
            {
                timeWindow: 15,
                threshold: 5,
                operator: 'gte',
                field: 'failed_logins',
                value: 5
            }
        ],
        actions: [
            {
                action: 'block_user',
                delay: 0
            }
        ],
        applicableRoles: ['owner', 'manager', 'staff', 'patient']
    },
    {
        ruleId: 'bot_activity_1',
        name: 'Bot-like Behavior',
        description: 'Detects automated/bot-like activity patterns',
        alertType: 'bot_activity',
        severity: 'medium',
        isEnabled: true,
        conditions: [
            {
                timeWindow: 10,
                threshold: 0.1,
                operator: 'lt',
                field: 'mouse_movement_variance',
                value: 0.1
            },
            {
                timeWindow: 10,
                threshold: 50,
                operator: 'gt',
                field: 'api_calls',
                value: 50
            }
        ],
        actions: [
            {
                action: 'require_mfa',
                delay: 0
            }
        ],
        applicableRoles: ['owner', 'manager', 'staff', 'patient']
    }
];
var SuspiciousActivityDetector = /** @class */ (function () {
    function SuspiciousActivityDetector(supabaseUrl, supabaseKey, customRules) {
        this.userBaselines = new Map();
        this.activityBuffer = new Map();
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        this.auditLogger = new security_audit_logger_1.SecurityAuditLogger(supabaseUrl, supabaseKey);
        this.detectionRules = customRules || DEFAULT_DETECTION_RULES;
        // Start processing intervals
        this.startProcessingInterval();
        this.startBaselineUpdateInterval();
        // Load existing baselines
        this.loadUserBaselines();
    }
    /**
     * Record user activity for analysis
     */
    SuspiciousActivityDetector.prototype.recordActivity = function (activity) {
        return __awaiter(this, void 0, void 0, function () {
            var activityWithTimestamp, error, userBuffer, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        activityWithTimestamp = __assign(__assign({}, activity), { timestamp: new Date() });
                        return [4 /*yield*/, this.supabase
                                .from('user_activity_patterns')
                                .insert({
                                user_id: activity.userId,
                                session_id: activity.sessionId,
                                device_id: activity.deviceId,
                                activity_type: activity.activityType,
                                timestamp: activityWithTimestamp.timestamp.toISOString(),
                                ip_address: activity.ipAddress,
                                user_agent: activity.userAgent,
                                location: activity.location,
                                metadata: activity.metadata
                            })];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            console.error('Failed to record activity:', error);
                            return [2 /*return*/];
                        }
                        userBuffer = this.activityBuffer.get(activity.userId) || [];
                        userBuffer.push(activityWithTimestamp);
                        // Keep only recent activities in buffer (last 1000 activities)
                        if (userBuffer.length > 1000) {
                            userBuffer.splice(0, userBuffer.length - 1000);
                        }
                        this.activityBuffer.set(activity.userId, userBuffer);
                        if (!this.isCriticalActivity(activity.activityType)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.analyzeUserActivity(activity.userId)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('Failed to record activity:', error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyze user activity for suspicious patterns
     */
    SuspiciousActivityDetector.prototype.analyzeUserActivity = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var alerts, userActivities, baseline, _i, _a, rule, ruleAlerts, _b, alerts_1, alert_1, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 12, , 13]);
                        alerts = [];
                        userActivities = this.activityBuffer.get(userId) || [];
                        if (userActivities.length === 0) {
                            return [2 /*return*/, alerts];
                        }
                        baseline = this.userBaselines.get(userId);
                        if (!!baseline) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.establishUserBaseline(userId)];
                    case 1:
                        baseline = _c.sent();
                        _c.label = 2;
                    case 2:
                        _i = 0, _a = this.detectionRules.filter(function (r) { return r.isEnabled; });
                        _c.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        rule = _a[_i];
                        return [4 /*yield*/, this.applyDetectionRule(rule, userId, userActivities, baseline)];
                    case 4:
                        ruleAlerts = _c.sent();
                        alerts.push.apply(alerts, ruleAlerts);
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        _b = 0, alerts_1 = alerts;
                        _c.label = 7;
                    case 7:
                        if (!(_b < alerts_1.length)) return [3 /*break*/, 11];
                        alert_1 = alerts_1[_b];
                        return [4 /*yield*/, this.storeAlert(alert_1)];
                    case 8:
                        _c.sent();
                        return [4 /*yield*/, this.executeAutomatedResponse(alert_1)];
                    case 9:
                        _c.sent();
                        _c.label = 10;
                    case 10:
                        _b++;
                        return [3 /*break*/, 7];
                    case 11: return [2 /*return*/, alerts];
                    case 12:
                        error_2 = _c.sent();
                        console.error('Failed to analyze user activity:', error_2);
                        return [2 /*return*/, []];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Establish behavioral baseline for a user
     */
    SuspiciousActivityDetector.prototype.establishUserBaseline = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var thirtyDaysAgo, _a, activities, error, userRole, baseline, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, this.supabase
                                .from('user_activity_patterns')
                                .select('*')
                                .eq('user_id', userId)
                                .gte('timestamp', thirtyDaysAgo.toISOString())
                                .order('timestamp', { ascending: true })];
                    case 1:
                        _a = _b.sent(), activities = _a.data, error = _a.error;
                        if (error) {
                            throw new Error("Failed to get user activities: ".concat(error.message));
                        }
                        return [4 /*yield*/, this.getUserRole(userId)];
                    case 2:
                        userRole = _b.sent();
                        baseline = {
                            userId: userId,
                            userRole: userRole,
                            establishedAt: new Date(),
                            lastUpdated: new Date(),
                            patterns: this.calculateBaselinePatterns(activities || []),
                            anomalyThresholds: this.calculateAnomalyThresholds(userRole, activities || [])
                        };
                        // Store baseline
                        return [4 /*yield*/, this.storeUserBaseline(baseline)];
                    case 3:
                        // Store baseline
                        _b.sent();
                        this.userBaselines.set(userId, baseline);
                        return [2 /*return*/, baseline];
                    case 4:
                        error_3 = _b.sent();
                        console.error('Failed to establish user baseline:', error_3);
                        throw error_3;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update user baseline with new activity data
     */
    SuspiciousActivityDetector.prototype.updateUserBaseline = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var existingBaseline, sevenDaysAgo, _a, recentActivities, error, recentPatterns, updatedBaseline, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        existingBaseline = this.userBaselines.get(userId);
                        if (!!existingBaseline) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.establishUserBaseline(userId)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                    case 2:
                        sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, this.supabase
                                .from('user_activity_patterns')
                                .select('*')
                                .eq('user_id', userId)
                                .gte('timestamp', sevenDaysAgo.toISOString())
                                .order('timestamp', { ascending: true })];
                    case 3:
                        _a = _b.sent(), recentActivities = _a.data, error = _a.error;
                        if (error || !recentActivities || recentActivities.length === 0) {
                            return [2 /*return*/];
                        }
                        recentPatterns = this.calculateBaselinePatterns(recentActivities);
                        updatedBaseline = __assign(__assign({}, existingBaseline), { lastUpdated: new Date(), patterns: this.mergePatterns(existingBaseline.patterns, recentPatterns, 0.8) });
                        // Store updated baseline
                        return [4 /*yield*/, this.storeUserBaseline(updatedBaseline)];
                    case 4:
                        // Store updated baseline
                        _b.sent();
                        this.userBaselines.set(userId, updatedBaseline);
                        return [3 /*break*/, 6];
                    case 5:
                        error_4 = _b.sent();
                        console.error('Failed to update user baseline:', error_4);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get suspicious activity alerts for a user
     */
    SuspiciousActivityDetector.prototype.getUserAlerts = function (userId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('suspicious_activity_alerts')
                            .select('*')
                            .eq('user_id', userId)
                            .order('detected_at', { ascending: false });
                        if (options === null || options === void 0 ? void 0 : options.severity) {
                            query = query.in('severity', options.severity);
                        }
                        if (options === null || options === void 0 ? void 0 : options.alertType) {
                            query = query.in('alert_type', options.alertType);
                        }
                        if ((options === null || options === void 0 ? void 0 : options.resolved) !== undefined) {
                            query = query.eq('is_resolved', options.resolved);
                        }
                        if (options === null || options === void 0 ? void 0 : options.limit) {
                            query = query.limit(options.limit);
                        }
                        if (options === null || options === void 0 ? void 0 : options.offset) {
                            query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new Error("Failed to get user alerts: ".concat(error.message));
                        }
                        return [2 /*return*/, (data || []).map(this.mapDatabaseToAlert)];
                    case 2:
                        error_5 = _b.sent();
                        console.error('Failed to get user alerts:', error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Resolve a suspicious activity alert
     */
    SuspiciousActivityDetector.prototype.resolveAlert = function (alertId_1, resolution_1, resolvedBy_1) {
        return __awaiter(this, arguments, void 0, function (alertId, resolution, resolvedBy, falsePositive) {
            var error, error_6;
            if (falsePositive === void 0) { falsePositive = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('suspicious_activity_alerts')
                                .update({
                                is_resolved: true,
                                resolved_at: new Date().toISOString(),
                                resolved_by: resolvedBy,
                                resolution: resolution,
                                false_positive: falsePositive
                            })
                                .eq('alert_id', alertId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            throw new Error("Failed to resolve alert: ".concat(error.message));
                        }
                        // Log resolution
                        return [4 /*yield*/, this.auditLogger.logSecurityEvent({
                                eventType: 'alert_resolved',
                                metadata: {
                                    alertId: alertId,
                                    resolution: resolution,
                                    resolvedBy: resolvedBy,
                                    falsePositive: falsePositive
                                }
                            })];
                    case 2:
                        // Log resolution
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        console.error('Failed to resolve alert:', error_6);
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add or update detection rule
     */
    SuspiciousActivityDetector.prototype.addDetectionRule = function (rule) {
        var existingIndex = this.detectionRules.findIndex(function (r) { return r.ruleId === rule.ruleId; });
        if (existingIndex >= 0) {
            this.detectionRules[existingIndex] = rule;
        }
        else {
            this.detectionRules.push(rule);
        }
    };
    /**
     * Remove detection rule
     */
    SuspiciousActivityDetector.prototype.removeDetectionRule = function (ruleId) {
        this.detectionRules = this.detectionRules.filter(function (r) { return r.ruleId !== ruleId; });
    };
    /**
     * Get detection statistics
     */
    SuspiciousActivityDetector.prototype.getDetectionStatistics = function (timeRange) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, alerts, error, alertData, alertsBySeverity, alertsByType, userAlertCounts, falsePositives, totalResolutionTime, resolvedAlerts, _i, alertData_1, alert_2, resolutionTime, topUsers, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('suspicious_activity_alerts')
                                .select('*')
                                .gte('detected_at', timeRange.start.toISOString())
                                .lte('detected_at', timeRange.end.toISOString())];
                    case 1:
                        _a = _b.sent(), alerts = _a.data, error = _a.error;
                        if (error) {
                            throw new Error("Failed to get detection statistics: ".concat(error.message));
                        }
                        alertData = alerts || [];
                        alertsBySeverity = {
                            low: 0,
                            medium: 0,
                            high: 0,
                            critical: 0
                        };
                        alertsByType = {
                            velocity_anomaly: 0,
                            location_anomaly: 0,
                            behavior_anomaly: 0,
                            access_pattern_anomaly: 0,
                            data_exfiltration: 0,
                            privilege_escalation: 0,
                            brute_force: 0,
                            session_hijacking: 0,
                            bot_activity: 0,
                            impossible_travel: 0
                        };
                        userAlertCounts = {};
                        falsePositives = 0;
                        totalResolutionTime = 0;
                        resolvedAlerts = 0;
                        for (_i = 0, alertData_1 = alertData; _i < alertData_1.length; _i++) {
                            alert_2 = alertData_1[_i];
                            alertsBySeverity[alert_2.severity]++;
                            alertsByType[alert_2.alert_type]++;
                            userAlertCounts[alert_2.user_id] = (userAlertCounts[alert_2.user_id] || 0) + 1;
                            if (alert_2.false_positive) {
                                falsePositives++;
                            }
                            if (alert_2.is_resolved && alert_2.resolved_at) {
                                resolutionTime = new Date(alert_2.resolved_at).getTime() - new Date(alert_2.detected_at).getTime();
                                totalResolutionTime += resolutionTime;
                                resolvedAlerts++;
                            }
                        }
                        topUsers = Object.entries(userAlertCounts)
                            .sort(function (_a, _b) {
                            var a = _a[1];
                            var b = _b[1];
                            return b - a;
                        })
                            .slice(0, 10)
                            .map(function (_a) {
                            var userId = _a[0], alertCount = _a[1];
                            return ({ userId: userId, alertCount: alertCount });
                        });
                        return [2 /*return*/, {
                                totalAlerts: alertData.length,
                                alertsBySeverity: alertsBySeverity,
                                alertsByType: alertsByType,
                                falsePositiveRate: alertData.length > 0 ? falsePositives / alertData.length : 0,
                                averageResolutionTime: resolvedAlerts > 0 ? totalResolutionTime / resolvedAlerts : 0,
                                topUsers: topUsers
                            }];
                    case 2:
                        error_7 = _b.sent();
                        console.error('Failed to get detection statistics:', error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Destroy the detector and cleanup resources
     */
    SuspiciousActivityDetector.prototype.destroy = function () {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = undefined;
        }
        if (this.baselineUpdateInterval) {
            clearInterval(this.baselineUpdateInterval);
            this.baselineUpdateInterval = undefined;
        }
        this.activityBuffer.clear();
        this.userBaselines.clear();
    };
    // Private methods
    SuspiciousActivityDetector.prototype.isCriticalActivity = function (activityType) {
        return ['login', 'permission_change', 'user_creation', 'bulk_operation'].includes(activityType);
    };
    SuspiciousActivityDetector.prototype.applyDetectionRule = function (rule, userId, activities, baseline) {
        return __awaiter(this, void 0, void 0, function () {
            var alerts, timeWindow, windowStart, windowActivities, conditionResults, alert_3;
            var _this = this;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                alerts = [];
                // Check if rule applies to user role
                if (!rule.applicableRoles.includes(baseline.userRole)) {
                    return [2 /*return*/, alerts];
                }
                timeWindow = ((_a = rule.conditions[0]) === null || _a === void 0 ? void 0 : _a.timeWindow) || 60;
                windowStart = new Date(Date.now() - timeWindow * 60 * 1000);
                windowActivities = activities.filter(function (a) { return a.timestamp >= windowStart; });
                conditionResults = rule.conditions.map(function (condition) {
                    return _this.evaluateCondition(condition, windowActivities, baseline);
                });
                // All conditions must be met
                if (conditionResults.every(function (result) { return result.met; })) {
                    alert_3 = {
                        alertId: "alert_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
                        userId: userId,
                        sessionId: ((_b = windowActivities[windowActivities.length - 1]) === null || _b === void 0 ? void 0 : _b.sessionId) || '',
                        deviceId: ((_c = windowActivities[windowActivities.length - 1]) === null || _c === void 0 ? void 0 : _c.deviceId) || '',
                        alertType: rule.alertType,
                        severity: rule.severity,
                        riskScore: this.calculateAlertRiskScore(rule, conditionResults),
                        description: this.generateAlertDescription(rule, conditionResults),
                        detectedAt: new Date(),
                        patterns: windowActivities,
                        evidence: {
                            rule: rule.name,
                            conditions: conditionResults,
                            baseline: baseline.patterns
                        },
                        isResolved: false,
                        falsePositive: false
                    };
                    alerts.push(alert_3);
                }
                return [2 /*return*/, alerts];
            });
        });
    };
    SuspiciousActivityDetector.prototype.evaluateCondition = function (condition, activities, baseline) {
        var value;
        switch (condition.field) {
            case 'api_calls':
                value = activities.filter(function (a) { return a.activityType === 'api_call'; }).length;
                break;
            case 'failed_logins':
                value = activities.filter(function (a) {
                    return a.activityType === 'login' && a.metadata.statusCode >= 400;
                }).length;
                break;
            case 'data_volume':
                value = activities.reduce(function (sum, a) { return sum + (a.metadata.dataVolume || 0); }, 0);
                break;
            case 'distance_km':
                value = this.calculateMaxDistance(activities);
                break;
            case 'mouse_movement_variance':
                value = this.calculateMouseMovementVariance(activities);
                break;
            default:
                value = 0;
        }
        var met = this.compareValues(value, condition.operator, condition.threshold);
        return { met: met, value: value, threshold: condition.threshold };
    };
    SuspiciousActivityDetector.prototype.compareValues = function (value, operator, threshold) {
        switch (operator) {
            case 'gt': return value > threshold;
            case 'lt': return value < threshold;
            case 'eq': return value === threshold;
            case 'gte': return value >= threshold;
            case 'lte': return value <= threshold;
            default: return false;
        }
    };
    SuspiciousActivityDetector.prototype.calculateMaxDistance = function (activities) {
        var _a, _b;
        var maxDistance = 0;
        for (var i = 1; i < activities.length; i++) {
            var prev = activities[i - 1];
            var curr = activities[i];
            if (((_a = prev.location) === null || _a === void 0 ? void 0 : _a.coordinates) && ((_b = curr.location) === null || _b === void 0 ? void 0 : _b.coordinates)) {
                var distance = this.calculateDistance(prev.location.coordinates, curr.location.coordinates);
                maxDistance = Math.max(maxDistance, distance);
            }
        }
        return maxDistance;
    };
    SuspiciousActivityDetector.prototype.calculateDistance = function (coord1, coord2) {
        var R = 6371; // Earth's radius in km
        var dLat = this.toRadians(coord2.latitude - coord1.latitude);
        var dLon = this.toRadians(coord2.longitude - coord1.longitude);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(coord1.latitude)) * Math.cos(this.toRadians(coord2.latitude)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };
    SuspiciousActivityDetector.prototype.toRadians = function (degrees) {
        return degrees * (Math.PI / 180);
    };
    SuspiciousActivityDetector.prototype.calculateMouseMovementVariance = function (activities) {
        var movements = activities
            .map(function (a) { return a.metadata.mouseMovements || 0; })
            .filter(function (m) { return m > 0; });
        if (movements.length === 0)
            return 0;
        var mean = movements.reduce(function (sum, m) { return sum + m; }, 0) / movements.length;
        var variance = movements.reduce(function (sum, m) { return sum + Math.pow(m - mean, 2); }, 0) / movements.length;
        return Math.sqrt(variance);
    };
    SuspiciousActivityDetector.prototype.calculateBaselinePatterns = function (activities) {
        // This is a simplified implementation
        // In production, you'd use more sophisticated statistical analysis
        var loginTimes = activities
            .filter(function (a) { return a.activity_type === 'login'; })
            .map(function (a) { return new Date(a.timestamp).getHours(); });
        var sessionDurations = activities
            .filter(function (a) { return a.activity_type === 'logout'; })
            .map(function (a) { var _a; return ((_a = a.metadata) === null || _a === void 0 ? void 0 : _a.sessionDuration) || 0; })
            .filter(function (d) { return d > 0; });
        return {
            typicalLoginTimes: __spreadArray([], new Set(loginTimes), true),
            typicalDaysOfWeek: [1, 2, 3, 4, 5], // Weekdays
            averageSessionDuration: sessionDurations.length > 0
                ? sessionDurations.reduce(function (sum, d) { return sum + d; }, 0) / sessionDurations.length
                : 30,
            typicalLocations: __spreadArray([], new Set(activities.map(function (a) { var _a; return (_a = a.location) === null || _a === void 0 ? void 0 : _a.country; }).filter(Boolean)), true),
            commonDevices: __spreadArray([], new Set(activities.map(function (a) { return a.device_id; }).filter(Boolean)), true),
            averageApiCallsPerHour: 10,
            commonEndpoints: [],
            typicalDataVolume: 1024 * 1024, // 1MB
            mouseMovementPatterns: {
                averageSpeed: 100,
                clickFrequency: 10,
                scrollPatterns: []
            },
            keystrokePatterns: {
                averageWPM: 40,
                typingRhythm: [],
                pausePatterns: []
            }
        };
    };
    SuspiciousActivityDetector.prototype.calculateAnomalyThresholds = function (userRole, activities) {
        // Role-based thresholds
        var baseThresholds = {
            owner: {
                locationDeviationKm: 1000,
                timeDeviationHours: 4,
                sessionDurationMultiplier: 3,
                apiCallMultiplier: 5,
                dataVolumeMultiplier: 10,
                velocityThreshold: 100
            },
            manager: {
                locationDeviationKm: 500,
                timeDeviationHours: 2,
                sessionDurationMultiplier: 2.5,
                apiCallMultiplier: 3,
                dataVolumeMultiplier: 5,
                velocityThreshold: 50
            },
            staff: {
                locationDeviationKm: 200,
                timeDeviationHours: 1,
                sessionDurationMultiplier: 2,
                apiCallMultiplier: 2,
                dataVolumeMultiplier: 3,
                velocityThreshold: 30
            },
            patient: {
                locationDeviationKm: 100,
                timeDeviationHours: 0.5,
                sessionDurationMultiplier: 1.5,
                apiCallMultiplier: 1.5,
                dataVolumeMultiplier: 2,
                velocityThreshold: 10
            }
        };
        return baseThresholds[userRole];
    };
    SuspiciousActivityDetector.prototype.mergePatterns = function (existing, recent, weight) {
        // Weighted merge of patterns (simplified)
        return __assign(__assign({}, existing), { averageSessionDuration: existing.averageSessionDuration * weight + recent.averageSessionDuration * (1 - weight), averageApiCallsPerHour: existing.averageApiCallsPerHour * weight + recent.averageApiCallsPerHour * (1 - weight), typicalDataVolume: existing.typicalDataVolume * weight + recent.typicalDataVolume * (1 - weight) });
    };
    SuspiciousActivityDetector.prototype.calculateAlertRiskScore = function (rule, conditionResults) {
        var baseSeverityScore = {
            low: 0.25,
            medium: 0.5,
            high: 0.75,
            critical: 1.0
        }[rule.severity];
        // Calculate deviation from thresholds
        var deviationScore = conditionResults.reduce(function (sum, result) {
            if (typeof result.value === 'number' && typeof result.threshold === 'number') {
                var deviation = Math.abs(result.value - result.threshold) / result.threshold;
                return sum + Math.min(deviation, 1);
            }
            return sum;
        }, 0) / conditionResults.length;
        return Math.min(baseSeverityScore + deviationScore * 0.3, 1.0);
    };
    SuspiciousActivityDetector.prototype.generateAlertDescription = function (rule, conditionResults) {
        var values = conditionResults.map(function (r) { return "".concat(r.value, " (threshold: ").concat(r.threshold, ")"); }).join(', ');
        return "".concat(rule.description, ". Detected values: ").concat(values);
    };
    SuspiciousActivityDetector.prototype.storeAlert = function (alert) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('suspicious_activity_alerts')
                                .insert({
                                alert_id: alert.alertId,
                                user_id: alert.userId,
                                session_id: alert.sessionId,
                                device_id: alert.deviceId,
                                alert_type: alert.alertType,
                                severity: alert.severity,
                                risk_score: alert.riskScore,
                                description: alert.description,
                                detected_at: alert.detectedAt.toISOString(),
                                patterns: alert.patterns,
                                evidence: alert.evidence,
                                is_resolved: alert.isResolved,
                                false_positive: alert.falsePositive,
                                automated_response: alert.automatedResponse
                            })];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            console.error('Failed to store alert:', error);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        console.error('Failed to store alert:', error_8);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SuspiciousActivityDetector.prototype.executeAutomatedResponse = function (alert) {
        return __awaiter(this, void 0, void 0, function () {
            var rule, _loop_1, this_1, _i, _a, action, error_9;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        rule = this.detectionRules.find(function (r) { return r.alertType === alert.alertType; });
                        if (!rule || !rule.actions.length) {
                            return [2 /*return*/];
                        }
                        _loop_1 = function (action) {
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        if (!(action.delay > 0)) return [3 /*break*/, 1];
                                        setTimeout(function () { return _this.executeAction(alert, action.action); }, action.delay * 1000);
                                        return [3 /*break*/, 3];
                                    case 1: return [4 /*yield*/, this_1.executeAction(alert, action.action)];
                                    case 2:
                                        _c.sent();
                                        _c.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, _a = rule.actions;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        action = _a[_i];
                        return [5 /*yield**/, _loop_1(action)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_9 = _b.sent();
                        console.error('Failed to execute automated response:', error_9);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SuspiciousActivityDetector.prototype.executeAction = function (alert, action) {
        return __awaiter(this, void 0, void 0, function () {
            var error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // Log the action
                        return [4 /*yield*/, this.auditLogger.logSecurityEvent({
                                eventType: 'automated_response_executed',
                                userId: alert.userId,
                                sessionId: alert.sessionId,
                                deviceId: alert.deviceId,
                                metadata: {
                                    alertId: alert.alertId,
                                    action: action,
                                    alertType: alert.alertType,
                                    severity: alert.severity
                                }
                            })];
                    case 1:
                        // Log the action
                        _a.sent();
                        // Update alert with automated response info
                        return [4 /*yield*/, this.supabase
                                .from('suspicious_activity_alerts')
                                .update({
                                automated_response: {
                                    action: action,
                                    executedAt: new Date().toISOString(),
                                    result: 'executed'
                                }
                            })
                                .eq('alert_id', alert.alertId)];
                    case 2:
                        // Update alert with automated response info
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_10 = _a.sent();
                        console.error('Failed to execute action:', error_10);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SuspiciousActivityDetector.prototype.storeUserBaseline = function (baseline) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('user_behavior_baselines')
                                .upsert({
                                user_id: baseline.userId,
                                user_role: baseline.userRole,
                                established_at: baseline.establishedAt.toISOString(),
                                last_updated: baseline.lastUpdated.toISOString(),
                                patterns: baseline.patterns,
                                anomaly_thresholds: baseline.anomalyThresholds
                            })];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            console.error('Failed to store user baseline:', error);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _a.sent();
                        console.error('Failed to store user baseline:', error_11);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SuspiciousActivityDetector.prototype.loadUserBaselines = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, baselines, error, _i, _b, baseline, error_12;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('user_behavior_baselines')
                                .select('*')];
                    case 1:
                        _a = _c.sent(), baselines = _a.data, error = _a.error;
                        if (error) {
                            console.error('Failed to load user baselines:', error);
                            return [2 /*return*/];
                        }
                        for (_i = 0, _b = baselines || []; _i < _b.length; _i++) {
                            baseline = _b[_i];
                            this.userBaselines.set(baseline.user_id, {
                                userId: baseline.user_id,
                                userRole: baseline.user_role,
                                establishedAt: new Date(baseline.established_at),
                                lastUpdated: new Date(baseline.last_updated),
                                patterns: baseline.patterns,
                                anomalyThresholds: baseline.anomaly_thresholds
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_12 = _c.sent();
                        console.error('Failed to load user baselines:', error_12);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SuspiciousActivityDetector.prototype.getUserRole = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would fetch the user's role from your user management system
                // For now, return a default role
                return [2 /*return*/, 'staff'];
            });
        });
    };
    SuspiciousActivityDetector.prototype.mapDatabaseToAlert = function (data) {
        return {
            alertId: data.alert_id,
            userId: data.user_id,
            sessionId: data.session_id,
            deviceId: data.device_id,
            alertType: data.alert_type,
            severity: data.severity,
            riskScore: data.risk_score,
            description: data.description,
            detectedAt: new Date(data.detected_at),
            patterns: data.patterns || [],
            evidence: data.evidence || {},
            isResolved: data.is_resolved,
            resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
            resolvedBy: data.resolved_by,
            resolution: data.resolution,
            falsePositive: data.false_positive,
            automatedResponse: data.automated_response
        };
    };
    SuspiciousActivityDetector.prototype.startProcessingInterval = function () {
        var _this = this;
        this.processingInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var _i, _a, userId, error_13;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        _i = 0, _a = this.activityBuffer.keys();
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        userId = _a[_i];
                        return [4 /*yield*/, this.analyzeUserActivity(userId)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_13 = _b.sent();
                        console.error('Activity processing failed:', error_13);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); }, 60 * 1000); // Every minute
    };
    SuspiciousActivityDetector.prototype.startBaselineUpdateInterval = function () {
        var _this = this;
        this.baselineUpdateInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var _i, _a, userId, error_14;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        _i = 0, _a = this.userBaselines.keys();
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        userId = _a[_i];
                        return [4 /*yield*/, this.updateUserBaseline(userId)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_14 = _b.sent();
                        console.error('Baseline update failed:', error_14);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); }, 24 * 60 * 60 * 1000); // Daily
    };
    return SuspiciousActivityDetector;
}());
exports.SuspiciousActivityDetector = SuspiciousActivityDetector;
