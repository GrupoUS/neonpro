"use strict";
/**
 * LGPD Breach Detection & Notification System
 *
 * Automated detection, assessment, and notification system for data breaches
 * in healthcare environments, ensuring LGPD compliance and rapid response.
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
exports.NotificationRecipient = exports.AffectedDataCategory = exports.BreachType = exports.BreachSeverity = void 0;
var server_1 = require("@/app/lib/supabase/server");
var lgpd_audit_1 = require("../audit/lgpd-audit");
// Breach severity levels
var BreachSeverity;
(function (BreachSeverity) {
    BreachSeverity["LOW"] = "low";
    BreachSeverity["MEDIUM"] = "medium";
    BreachSeverity["HIGH"] = "high";
    BreachSeverity["CRITICAL"] = "critical";
})(BreachSeverity || (exports.BreachSeverity = BreachSeverity = {}));
// Breach types
var BreachType;
(function (BreachType) {
    BreachType["UNAUTHORIZED_ACCESS"] = "unauthorized_access";
    BreachType["DATA_LEAK"] = "data_leak";
    BreachType["SYSTEM_COMPROMISE"] = "system_compromise";
    BreachType["INSIDER_THREAT"] = "insider_threat";
    BreachType["EXTERNAL_ATTACK"] = "external_attack";
    BreachType["HUMAN_ERROR"] = "human_error";
    BreachType["TECHNICAL_FAILURE"] = "technical_failure";
    BreachType["THIRD_PARTY_BREACH"] = "third_party_breach";
})(BreachType || (exports.BreachType = BreachType = {}));
// Affected data categories
var AffectedDataCategory;
(function (AffectedDataCategory) {
    AffectedDataCategory["PERSONAL_DATA"] = "personal_data";
    AffectedDataCategory["SENSITIVE_PERSONAL_DATA"] = "sensitive_personal_data";
    AffectedDataCategory["HEALTH_DATA"] = "health_data";
    AffectedDataCategory["BIOMETRIC_DATA"] = "biometric_data";
    AffectedDataCategory["FINANCIAL_DATA"] = "financial_data";
    AffectedDataCategory["GENETIC_DATA"] = "genetic_data";
    AffectedDataCategory["AUTHENTICATION_DATA"] = "authentication_data";
})(AffectedDataCategory || (exports.AffectedDataCategory = AffectedDataCategory = {}));
// Notification recipients
var NotificationRecipient;
(function (NotificationRecipient) {
    NotificationRecipient["DPO"] = "dpo";
    NotificationRecipient["IT_SECURITY"] = "it_security";
    NotificationRecipient["MANAGEMENT"] = "management";
    NotificationRecipient["LEGAL"] = "legal";
    NotificationRecipient["DATA_SUBJECTS"] = "data_subjects";
    NotificationRecipient["ANPD"] = "anpd";
    NotificationRecipient["ANVISA"] = "anvisa";
})(NotificationRecipient || (exports.NotificationRecipient = NotificationRecipient = {}));
var BreachDetectionSystem = /** @class */ (function () {
    function BreachDetectionSystem() {
        this.supabase = (0, server_1.createClient)();
        this.detectionRules = new Map();
        this.isMonitoring = false;
        this.loadDetectionRules();
        this.setupDefaultRules();
    }
    // Load detection rules from database
    BreachDetectionSystem.prototype.loadDetectionRules = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, rules, error, error_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_breach_detection_rules')
                                .select('*')
                                .eq('enabled', true)];
                    case 1:
                        _a = _b.sent(), rules = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        this.detectionRules.clear();
                        rules === null || rules === void 0 ? void 0 : rules.forEach(function (rule) {
                            _this.detectionRules.set(rule.id, rule);
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        console.error('Error loading breach detection rules:', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Setup default detection rules
    BreachDetectionSystem.prototype.setupDefaultRules = function () {
        var _this = this;
        var defaultRules = [
            {
                name: 'Multiple Failed Login Attempts',
                description: 'Detect potential brute force attacks',
                enabled: true,
                eventTypes: ['authentication_failed'],
                thresholds: { failed_attempts: 5, time_window: 300 },
                conditions: { consecutive: true },
                autoSeverity: BreachSeverity.MEDIUM,
                autoNotifications: [NotificationRecipient.IT_SECURITY],
                autoContainmentActions: ['lock_account', 'alert_security_team']
            },
            {
                name: 'Unusual Data Access Pattern',
                description: 'Detect unusual data access volumes or patterns',
                enabled: true,
                eventTypes: ['data_access'],
                thresholds: { access_volume: 1000, time_window: 3600 },
                conditions: { deviation_factor: 3 },
                autoSeverity: BreachSeverity.HIGH,
                autoNotifications: [NotificationRecipient.IT_SECURITY, NotificationRecipient.DPO],
                autoContainmentActions: ['monitor_user', 'alert_security_team']
            },
            {
                name: 'Data Export Anomaly',
                description: 'Detect large or unusual data exports',
                enabled: true,
                eventTypes: ['data_export'],
                thresholds: { export_size: 10000, record_count: 5000 },
                conditions: { outside_hours: true },
                autoSeverity: BreachSeverity.CRITICAL,
                autoNotifications: [NotificationRecipient.IT_SECURITY, NotificationRecipient.DPO, NotificationRecipient.MANAGEMENT],
                autoContainmentActions: ['suspend_export', 'alert_security_team', 'investigate_immediately']
            },
            {
                name: 'Unauthorized System Access',
                description: 'Detect access from unauthorized locations or devices',
                enabled: true,
                eventTypes: ['system_access'],
                thresholds: {},
                conditions: { unauthorized_location: true, unknown_device: true },
                autoSeverity: BreachSeverity.HIGH,
                autoNotifications: [NotificationRecipient.IT_SECURITY],
                autoContainmentActions: ['require_mfa', 'alert_security_team']
            },
            {
                name: 'Database Query Anomaly',
                description: 'Detect unusual database queries or access patterns',
                enabled: true,
                eventTypes: ['database_query'],
                thresholds: { query_complexity: 5, execution_time: 30 },
                conditions: { sensitive_tables: true },
                autoSeverity: BreachSeverity.MEDIUM,
                autoNotifications: [NotificationRecipient.IT_SECURITY],
                autoContainmentActions: ['log_detailed', 'alert_security_team']
            }
        ];
        // Add default rules if not already present
        defaultRules.forEach(function (rule) {
            var ruleId = "default_".concat(rule.name.toLowerCase().replace(/\s+/g, '_'));
            if (!_this.detectionRules.has(ruleId)) {
                var fullRule = __assign(__assign({}, rule), { id: ruleId, createdAt: new Date(), updatedAt: new Date(), triggerCount: 0 });
                _this.detectionRules.set(ruleId, fullRule);
            }
        });
    };
    // Start breach monitoring
    BreachDetectionSystem.prototype.startMonitoring = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isMonitoring)
                            return [2 /*return*/];
                        this.isMonitoring = true;
                        // Set up real-time monitoring
                        this.monitoringInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.runDetectionCycle()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }, 60000); // Run every minute
                        // Set up database triggers for real-time detection
                        return [4 /*yield*/, this.setupDatabaseTriggers()];
                    case 1:
                        // Set up database triggers for real-time detection
                        _a.sent();
                        return [4 /*yield*/, lgpd_audit_1.lgpdAuditLogger.logEvent({
                                eventType: 'breach_monitoring_started',
                                userId: 'system',
                                userRole: 'system',
                                resource: 'breach_detection_system',
                                action: 'start_monitoring',
                                outcome: 'success',
                                details: { rules_count: this.detectionRules.size }
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Stop breach monitoring
    BreachDetectionSystem.prototype.stopMonitoring = function () {
        if (!this.isMonitoring)
            return;
        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = undefined;
        }
    };
    // Run detection cycle
    BreachDetectionSystem.prototype.runDetectionCycle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, rule, detected, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        _i = 0, _a = this.detectionRules.values();
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        rule = _a[_i];
                        if (!rule.enabled)
                            return [3 /*break*/, 4];
                        return [4 /*yield*/, this.evaluateRule(rule)];
                    case 2:
                        detected = _b.sent();
                        if (!detected) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.handleDetection(rule, detected)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_2 = _b.sent();
                        console.error('Error in breach detection cycle:', error_2);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // Evaluate detection rule
    BreachDetectionSystem.prototype.evaluateRule = function (rule) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, events, error, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_audit_log')
                                .select('*')
                                .in('event_type', rule.eventTypes)
                                .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Last hour
                                .order('created_at', { ascending: false })];
                    case 1:
                        _a = _b.sent(), events = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        if (!events || events.length === 0)
                            return [2 /*return*/, null
                                // Apply rule logic
                            ];
                        // Apply rule logic
                        return [2 /*return*/, this.applyRuleLogic(rule, events)];
                    case 2:
                        error_3 = _b.sent();
                        console.error("Error evaluating rule ".concat(rule.id, ":"), error_3);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Apply rule logic to events
    BreachDetectionSystem.prototype.applyRuleLogic = function (rule, events) {
        // Implement specific logic based on rule type
        switch (rule.name) {
            case 'Multiple Failed Login Attempts':
                return this.detectFailedLogins(rule, events);
            case 'Unusual Data Access Pattern':
                return this.detectUnusualAccess(rule, events);
            case 'Data Export Anomaly':
                return this.detectExportAnomaly(rule, events);
            case 'Unauthorized System Access':
                return this.detectUnauthorizedAccess(rule, events);
            case 'Database Query Anomaly':
                return this.detectQueryAnomaly(rule, events);
            default:
                return null;
        }
    };
    // Detect failed login patterns
    BreachDetectionSystem.prototype.detectFailedLogins = function (rule, events) {
        var failedLogins = events.filter(function (e) { return e.outcome === 'failure'; });
        var groupedByUser = this.groupEventsByUser(failedLogins);
        for (var _i = 0, _a = Object.entries(groupedByUser); _i < _a.length; _i++) {
            var _b = _a[_i], userId = _b[0], userEvents = _b[1];
            if (userEvents.length >= rule.thresholds.failed_attempts) {
                var timeSpan = new Date(userEvents[0].created_at).getTime() -
                    new Date(userEvents[userEvents.length - 1].created_at).getTime();
                if (timeSpan <= rule.thresholds.time_window * 1000) {
                    return {
                        userId: userId,
                        failedAttempts: userEvents.length,
                        timeSpan: timeSpan / 1000,
                        events: userEvents
                    };
                }
            }
        }
        return null;
    };
    // Detect unusual data access
    BreachDetectionSystem.prototype.detectUnusualAccess = function (rule, events) {
        var accessEvents = events.filter(function (e) { return e.action === 'read' || e.action === 'access'; });
        var groupedByUser = this.groupEventsByUser(accessEvents);
        for (var _i = 0, _a = Object.entries(groupedByUser); _i < _a.length; _i++) {
            var _b = _a[_i], userId = _b[0], userEvents = _b[1];
            if (userEvents.length >= rule.thresholds.access_volume) {
                return {
                    userId: userId,
                    accessCount: userEvents.length,
                    events: userEvents
                };
            }
        }
        return null;
    };
    // Detect data export anomalies
    BreachDetectionSystem.prototype.detectExportAnomaly = function (rule, events) {
        var exportEvents = events.filter(function (e) { return e.action === 'export'; });
        for (var _i = 0, exportEvents_1 = exportEvents; _i < exportEvents_1.length; _i++) {
            var event_1 = exportEvents_1[_i];
            var eventTime = new Date(event_1.created_at).getHours();
            var isOutsideHours = eventTime < 8 || eventTime > 18; // Outside business hours
            if (isOutsideHours && rule.conditions.outside_hours) {
                return {
                    userId: event_1.user_id,
                    exportTime: event_1.created_at,
                    outsideHours: true,
                    event: event_1
                };
            }
        }
        return null;
    };
    // Detect unauthorized access
    BreachDetectionSystem.prototype.detectUnauthorizedAccess = function (rule, events) {
        // This would typically check against known IP ranges, device fingerprints, etc.
        // For now, we'll check for suspicious patterns in the metadata
        for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
            var event_2 = events_1[_i];
            var metadata = event_2.details || {};
            if (metadata.suspicious_location || metadata.unknown_device) {
                return {
                    userId: event_2.user_id,
                    suspiciousIndicators: {
                        location: metadata.suspicious_location,
                        device: metadata.unknown_device
                    },
                    event: event_2
                };
            }
        }
        return null;
    };
    // Detect database query anomalies
    BreachDetectionSystem.prototype.detectQueryAnomaly = function (rule, events) {
        var queryEvents = events.filter(function (e) { return e.action === 'query'; });
        for (var _i = 0, queryEvents_1 = queryEvents; _i < queryEvents_1.length; _i++) {
            var event_3 = queryEvents_1[_i];
            var details = event_3.details || {};
            if (details.execution_time > rule.thresholds.execution_time ||
                details.complexity_score > rule.thresholds.query_complexity) {
                return {
                    userId: event_3.user_id,
                    queryComplexity: details.complexity_score,
                    executionTime: details.execution_time,
                    event: event_3
                };
            }
        }
        return null;
    };
    return BreachDetectionSystem;
}());
