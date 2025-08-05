"use strict";
/**
 * TASK-001: Foundation Setup & Baseline
 * Emergency Response System
 *
 * Automated monitoring and response for critical system issues
 * with rollback capabilities and alerting mechanisms.
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
exports.createemergencyResponse = void 0;
exports.addEmergencyRule = addEmergencyRule;
exports.takeEmergencySnapshot = takeEmergencySnapshot;
exports.resolveEmergencyAlert = resolveEmergencyAlert;
exports.getEmergencyStatus = getEmergencyStatus;
var client_1 = require("@/lib/supabase/client");
var EmergencyResponseSystem = /** @class */ (function () {
    function EmergencyResponseSystem() {
        this.supabase = (0, client_1.createClient)();
        this.rules = new Map();
        this.activeAlerts = new Map();
        this.monitoringInterval = null;
        this.snapshots = [];
        this.maxSnapshots = 50; // Keep last 50 snapshots
        // Default emergency rules
        this.defaultRules = [
            {
                rule_id: 'critical_error_rate',
                rule_name: 'Critical Error Rate',
                trigger_type: 'metric_threshold',
                metric_name: 'error_rate',
                threshold_value: 5,
                threshold_operator: 'gte',
                time_window_minutes: 5,
                severity: 'critical',
                enabled: true,
                cooldown_minutes: 15,
                actions: [
                    { action_type: 'alert', priority: 1, parameters: { channel: 'emergency' } },
                    { action_type: 'feature_flag_disable', target: 'new_features', priority: 2 },
                    { action_type: 'notification', priority: 3, parameters: { recipients: ['admin'] } }
                ]
            },
            {
                rule_id: 'page_load_performance',
                rule_name: 'Page Load Performance Degradation',
                trigger_type: 'metric_threshold',
                metric_name: 'page_load_time',
                threshold_value: 5000,
                threshold_operator: 'gte',
                time_window_minutes: 10,
                severity: 'high',
                enabled: true,
                cooldown_minutes: 30,
                actions: [
                    { action_type: 'alert', priority: 1 },
                    { action_type: 'cache_clear', priority: 2 }
                ]
            },
            {
                rule_id: 'consecutive_failures',
                rule_name: 'Consecutive API Failures',
                trigger_type: 'consecutive_failures',
                metric_name: 'api_failures',
                threshold_operator: 'gte',
                consecutive_count: 5,
                time_window_minutes: 5,
                severity: 'high',
                enabled: true,
                cooldown_minutes: 20,
                actions: [
                    { action_type: 'alert', priority: 1 },
                    { action_type: 'service_restart', target: 'api_service', priority: 2 }
                ]
            },
            {
                rule_id: 'database_performance',
                rule_name: 'Database Performance Issue',
                trigger_type: 'metric_threshold',
                metric_name: 'database_query_time',
                threshold_value: 1000,
                threshold_operator: 'gte',
                time_window_minutes: 5,
                severity: 'high',
                enabled: true,
                cooldown_minutes: 10,
                actions: [
                    { action_type: 'alert', priority: 1 },
                    { action_type: 'notification', priority: 2, parameters: { message: 'Database performance degraded' } }
                ]
            }
        ];
        this.initializeEmergencySystem();
    }
    /**
     * Initialize emergency response system
     */
    EmergencyResponseSystem.prototype.initializeEmergencySystem = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        console.log('🚨 Initializing Emergency Response System...');
                        // Load existing rules
                        return [4 /*yield*/, this.loadRules()];
                    case 1:
                        // Load existing rules
                        _a.sent();
                        if (!(this.rules.size === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.createDefaultRules()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: 
                    // Load active alerts
                    return [4 /*yield*/, this.loadActiveAlerts()];
                    case 4:
                        // Load active alerts
                        _a.sent();
                        // Take initial system snapshot
                        return [4 /*yield*/, this.takeSystemSnapshot()];
                    case 5:
                        // Take initial system snapshot
                        _a.sent();
                        // Start monitoring
                        this.startMonitoring();
                        console.log('✅ Emergency Response System initialized');
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error('Error initializing emergency response system:', error_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load emergency rules from database
     */
    EmergencyResponseSystem.prototype.loadRules = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_2;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('system_metrics')
                                .select('*')
                                .eq('metric_type', 'emergency_rule')
                                .eq('metadata->>enabled', 'true')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error loading emergency rules:', error);
                            return [2 /*return*/];
                        }
                        data === null || data === void 0 ? void 0 : data.forEach(function (record) {
                            if (record.metadata && record.metadata.rule_data) {
                                var rule = record.metadata.rule_data;
                                _this.rules.set(rule.rule_id, rule);
                            }
                        });
                        console.log("Loaded ".concat(this.rules.size, " emergency rules"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        console.error('Error loading rules:', error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create default emergency rules
     */
    EmergencyResponseSystem.prototype.createDefaultRules = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, rule;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('Creating default emergency rules...');
                        _i = 0, _a = this.defaultRules;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        rule = _a[_i];
                        return [4 /*yield*/, this.addRule(rule)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add emergency rule
     */
    EmergencyResponseSystem.prototype.addRule = function (rule) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('system_metrics')
                                .insert({
                                metric_type: 'emergency_rule',
                                metric_name: rule.rule_name,
                                metric_value: rule.enabled ? 1 : 0,
                                metric_unit: 'boolean',
                                metadata: {
                                    rule_data: rule,
                                    enabled: rule.enabled
                                }
                            })];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            console.error('Error storing emergency rule:', error);
                            return [2 /*return*/];
                        }
                        // Cache rule
                        this.rules.set(rule.rule_id, rule);
                        console.log("\u2705 Emergency rule added: ".concat(rule.rule_name));
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Error adding emergency rule:', error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load active alerts
     */
    EmergencyResponseSystem.prototype.loadActiveAlerts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_4;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('system_metrics')
                                .select('*')
                                .eq('metric_type', 'emergency_alert')
                                .eq('metadata->>resolved', 'false')
                                .order('timestamp', { ascending: false })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error loading active alerts:', error);
                            return [2 /*return*/];
                        }
                        data === null || data === void 0 ? void 0 : data.forEach(function (record) {
                            if (record.metadata && record.metadata.alert_data) {
                                var alert_1 = record.metadata.alert_data;
                                _this.activeAlerts.set(alert_1.alert_id, alert_1);
                            }
                        });
                        console.log("Loaded ".concat(this.activeAlerts.size, " active alerts"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _b.sent();
                        console.error('Error loading active alerts:', error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Start monitoring for emergency conditions
     */
    EmergencyResponseSystem.prototype.startMonitoring = function () {
        var _this = this;
        // Monitor every 30 seconds
        this.monitoringInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.checkEmergencyConditions()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Error in emergency monitoring:', error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }, 30000);
        console.log('🔄 Emergency monitoring started');
    };
    /**
     * Check all emergency conditions
     */
    EmergencyResponseSystem.prototype.checkEmergencyConditions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, ruleId, rule, shouldTrigger, error_6;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _i = 0, _a = this.rules;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        _b = _a[_i], ruleId = _b[0], rule = _b[1];
                        if (!rule.enabled)
                            return [3 /*break*/, 7];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, this.evaluateRule(rule)];
                    case 3:
                        shouldTrigger = _c.sent();
                        if (!shouldTrigger) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.triggerEmergencyResponse(rule)];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_6 = _c.sent();
                        console.error("Error evaluating rule ".concat(ruleId, ":"), error_6);
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Evaluate emergency rule
     */
    EmergencyResponseSystem.prototype.evaluateRule = function (rule) {
        return __awaiter(this, void 0, void 0, function () {
            var lastAlert, timeSinceLastAlert, cooldownMs, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        lastAlert = Array.from(this.activeAlerts.values())
                            .find(function (alert) { return alert.rule_id === rule.rule_id; });
                        if (lastAlert) {
                            timeSinceLastAlert = Date.now() - new Date(lastAlert.trigger_time).getTime();
                            cooldownMs = rule.cooldown_minutes * 60 * 1000;
                            if (timeSinceLastAlert < cooldownMs) {
                                return [2 /*return*/, false]; // Still in cooldown
                            }
                        }
                        _a = rule.trigger_type;
                        switch (_a) {
                            case 'metric_threshold': return [3 /*break*/, 1];
                            case 'error_rate': return [3 /*break*/, 3];
                            case 'consecutive_failures': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 7];
                    case 1: return [4 /*yield*/, this.evaluateMetricThreshold(rule)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.evaluateErrorRate(rule)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.evaluateConsecutiveFailures(rule)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * Evaluate metric threshold rule
     */
    EmergencyResponseSystem.prototype.evaluateMetricThreshold = function (rule) {
        return __awaiter(this, void 0, void 0, function () {
            var timeWindowStart, _a, data, error, avgValue, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!rule.metric_name || rule.threshold_value === undefined)
                            return [2 /*return*/, false];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        timeWindowStart = new Date();
                        timeWindowStart.setMinutes(timeWindowStart.getMinutes() - rule.time_window_minutes);
                        return [4 /*yield*/, this.supabase
                                .from('system_metrics')
                                .select('metric_value')
                                .eq('metric_name', rule.metric_name)
                                .gte('timestamp', timeWindowStart.toISOString())
                                .order('timestamp', { ascending: false })];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error || !data || data.length === 0) {
                            return [2 /*return*/, false];
                        }
                        avgValue = data.reduce(function (sum, record) { return sum + record.metric_value; }, 0) / data.length;
                        // Check threshold
                        switch (rule.threshold_operator) {
                            case 'gt': return [2 /*return*/, avgValue > rule.threshold_value];
                            case 'gte': return [2 /*return*/, avgValue >= rule.threshold_value];
                            case 'lt': return [2 /*return*/, avgValue < rule.threshold_value];
                            case 'lte': return [2 /*return*/, avgValue <= rule.threshold_value];
                            case 'eq': return [2 /*return*/, avgValue === rule.threshold_value];
                            default: return [2 /*return*/, false];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _b.sent();
                        console.error('Error evaluating metric threshold:', error_7);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Evaluate error rate rule
     */
    EmergencyResponseSystem.prototype.evaluateErrorRate = function (rule) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would integrate with error tracking system
                // For now, return false
                return [2 /*return*/, false];
            });
        });
    };
    /**
     * Evaluate consecutive failures rule
     */
    EmergencyResponseSystem.prototype.evaluateConsecutiveFailures = function (rule) {
        return __awaiter(this, void 0, void 0, function () {
            var timeWindowStart, _a, data, error, consecutiveFailures, i, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!rule.metric_name || !rule.consecutive_count)
                            return [2 /*return*/, false];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        timeWindowStart = new Date();
                        timeWindowStart.setMinutes(timeWindowStart.getMinutes() - rule.time_window_minutes);
                        return [4 /*yield*/, this.supabase
                                .from('system_metrics')
                                .select('metric_value, timestamp')
                                .eq('metric_name', rule.metric_name)
                                .gte('timestamp', timeWindowStart.toISOString())
                                .order('timestamp', { ascending: false })];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error || !data || data.length < rule.consecutive_count) {
                            return [2 /*return*/, false];
                        }
                        consecutiveFailures = 0;
                        for (i = 0; i < data.length && i < rule.consecutive_count; i++) {
                            if (data[i].metric_value === 1) { // 1 indicates failure
                                consecutiveFailures++;
                            }
                            else {
                                break;
                            }
                        }
                        return [2 /*return*/, consecutiveFailures >= rule.consecutive_count];
                    case 3:
                        error_8 = _b.sent();
                        console.error('Error evaluating consecutive failures:', error_8);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Trigger emergency response
     */
    EmergencyResponseSystem.prototype.triggerEmergencyResponse = function (rule) {
        return __awaiter(this, void 0, void 0, function () {
            var alert, sortedActions, _i, sortedActions_1, action, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDEA8 EMERGENCY TRIGGERED: ".concat(rule.rule_name, " (").concat(rule.severity, ")"));
                        alert = {
                            alert_id: "alert_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
                            rule_id: rule.rule_id,
                            trigger_time: new Date().toISOString(),
                            severity: rule.severity,
                            alert_message: "Emergency condition detected: ".concat(rule.rule_name),
                            trigger_data: {
                                rule_name: rule.rule_name,
                                metric_name: rule.metric_name,
                                threshold_value: rule.threshold_value,
                                time_window_minutes: rule.time_window_minutes
                            },
                            actions_taken: [],
                            resolved: false
                        };
                        sortedActions = __spreadArray([], rule.actions, true).sort(function (a, b) { return a.priority - b.priority; });
                        _i = 0, sortedActions_1 = sortedActions;
                        _a.label = 1;
                    case 1:
                        if (!(_i < sortedActions_1.length)) return [3 /*break*/, 6];
                        action = sortedActions_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.executeEmergencyAction(action, alert)];
                    case 3:
                        _a.sent();
                        alert.actions_taken.push("".concat(action.action_type, ": ").concat(action.target || 'default'));
                        return [3 /*break*/, 5];
                    case 4:
                        error_9 = _a.sent();
                        console.error("Error executing action ".concat(action.action_type, ":"), error_9);
                        alert.actions_taken.push("".concat(action.action_type, ": FAILED - ").concat(error_9));
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: 
                    // Store alert
                    return [4 /*yield*/, this.storeAlert(alert)];
                    case 7:
                        // Store alert
                        _a.sent();
                        // Cache alert
                        this.activeAlerts.set(alert.alert_id, alert);
                        // Take emergency snapshot
                        return [4 /*yield*/, this.takeSystemSnapshot('emergency')];
                    case 8:
                        // Take emergency snapshot
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute emergency action
     */
    EmergencyResponseSystem.prototype.executeEmergencyAction = function (action, alert) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("\u26A1 Executing emergency action: ".concat(action.action_type));
                        _a = action.action_type;
                        switch (_a) {
                            case 'alert': return [3 /*break*/, 1];
                            case 'feature_flag_disable': return [3 /*break*/, 3];
                            case 'cache_clear': return [3 /*break*/, 5];
                            case 'service_restart': return [3 /*break*/, 7];
                            case 'rollback': return [3 /*break*/, 9];
                            case 'notification': return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 13];
                    case 1: return [4 /*yield*/, this.sendAlert(alert, action.parameters)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 14];
                    case 3: return [4 /*yield*/, this.disableFeatureFlag(action.target, action.parameters)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 14];
                    case 5: return [4 /*yield*/, this.clearCache(action.target, action.parameters)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 14];
                    case 7: return [4 /*yield*/, this.restartService(action.target, action.parameters)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 14];
                    case 9: return [4 /*yield*/, this.performRollback(action.parameters)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 14];
                    case 11: return [4 /*yield*/, this.sendNotification(alert, action.parameters)];
                    case 12:
                        _b.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        console.warn("Unknown emergency action: ".concat(action.action_type));
                        _b.label = 14;
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send emergency alert
     */
    EmergencyResponseSystem.prototype.sendAlert = function (alert, parameters) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("\uD83D\uDEA8 EMERGENCY ALERT: ".concat(alert.alert_message));
                // Log alert to console (in production, this would integrate with alerting systems)
                console.error("\n    \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n    \u2551              EMERGENCY ALERT              \u2551\n    \u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563\n    \u2551 Rule: ".concat(alert.rule_id.padEnd(32), " \u2551\n    \u2551 Severity: ").concat(alert.severity.padEnd(28), " \u2551\n    \u2551 Time: ").concat(new Date(alert.trigger_time).toLocaleString().padEnd(28), " \u2551\n    \u2551 Message: ").concat(alert.alert_message.substring(0, 27).padEnd(27), " \u2551\n    \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n    "));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Disable feature flag
     */
    EmergencyResponseSystem.prototype.disableFeatureFlag = function (flagName, parameters) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!flagName)
                            return [2 /*return*/];
                        console.log("\uD83D\uDEAB Disabling feature flag: ".concat(flagName));
                        // This would integrate with your feature flag system
                        // For now, just log the action
                        // Store the action
                        return [4 /*yield*/, this.supabase
                                .from('system_metrics')
                                .insert({
                                metric_type: 'emergency_action',
                                metric_name: 'feature_flag_disable',
                                metric_value: 1,
                                metric_unit: 'action',
                                metadata: {
                                    flag_name: flagName,
                                    disabled_at: new Date().toISOString(),
                                    reason: 'emergency_response'
                                }
                            })];
                    case 1:
                        // This would integrate with your feature flag system
                        // For now, just log the action
                        // Store the action
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clear cache
     */
    EmergencyResponseSystem.prototype.clearCache = function (cacheType, parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheNames;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDDD1\uFE0F Clearing cache: ".concat(cacheType || 'all'));
                        if (!('caches' in window)) return [3 /*break*/, 3];
                        return [4 /*yield*/, caches.keys()];
                    case 1:
                        cacheNames = _a.sent();
                        return [4 /*yield*/, Promise.all(cacheNames.map(function (name) { return caches.delete(name); }))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        // Clear local storage if specified
                        if (cacheType === 'localStorage' || cacheType === 'all') {
                            localStorage.clear();
                        }
                        // Clear session storage if specified
                        if (cacheType === 'sessionStorage' || cacheType === 'all') {
                            sessionStorage.clear();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Restart service (placeholder)
     */
    EmergencyResponseSystem.prototype.restartService = function (serviceName, parameters) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDD04 Service restart triggered: ".concat(serviceName || 'unknown'));
                        // This would integrate with your service management system
                        // Log the restart action
                        return [4 /*yield*/, this.supabase
                                .from('system_metrics')
                                .insert({
                                metric_type: 'emergency_action',
                                metric_name: 'service_restart',
                                metric_value: 1,
                                metric_unit: 'action',
                                metadata: {
                                    service_name: serviceName,
                                    restart_time: new Date().toISOString(),
                                    reason: 'emergency_response'
                                }
                            })];
                    case 1:
                        // This would integrate with your service management system
                        // Log the restart action
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Perform rollback
     */
    EmergencyResponseSystem.prototype.performRollback = function (parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var preEmergencySnapshot, _i, _a, _b, flagName, enabled;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log('↩️ Emergency rollback initiated');
                        preEmergencySnapshot = this.snapshots.find(function (s) {
                            return s.system_state.system_health === 'healthy';
                        });
                        if (!preEmergencySnapshot) {
                            console.error('No healthy snapshot found for rollback');
                            return [2 /*return*/];
                        }
                        console.log("Rolling back to snapshot: ".concat(preEmergencySnapshot.snapshot_id));
                        // Restore feature flags
                        for (_i = 0, _a = Object.entries(preEmergencySnapshot.system_state.feature_flags); _i < _a.length; _i++) {
                            _b = _a[_i], flagName = _b[0], enabled = _b[1];
                            // This would restore feature flag states
                            console.log("Restoring feature flag ".concat(flagName, ": ").concat(enabled));
                        }
                        // Log rollback action
                        return [4 /*yield*/, this.supabase
                                .from('system_metrics')
                                .insert({
                                metric_type: 'emergency_action',
                                metric_name: 'rollback',
                                metric_value: 1,
                                metric_unit: 'action',
                                metadata: {
                                    snapshot_id: preEmergencySnapshot.snapshot_id,
                                    rollback_time: new Date().toISOString(),
                                    reason: 'emergency_response'
                                }
                            })];
                    case 1:
                        // Log rollback action
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send notification
     */
    EmergencyResponseSystem.prototype.sendNotification = function (alert, parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var message, recipients;
            return __generator(this, function (_a) {
                console.log("\uD83D\uDCE2 Sending emergency notification");
                message = (parameters === null || parameters === void 0 ? void 0 : parameters.message) || alert.alert_message;
                recipients = (parameters === null || parameters === void 0 ? void 0 : parameters.recipients) || ['admin'];
                // This would integrate with your notification system
                console.log("Notification sent to ".concat(recipients.join(', '), ": ").concat(message));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Store alert in database
     */
    EmergencyResponseSystem.prototype.storeAlert = function (alert) {
        return __awaiter(this, void 0, void 0, function () {
            var error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('system_metrics')
                                .insert({
                                metric_type: 'emergency_alert',
                                metric_name: alert.rule_id,
                                metric_value: alert.severity === 'critical' ? 4 : alert.severity === 'high' ? 3 : alert.severity === 'medium' ? 2 : 1,
                                metric_unit: 'severity',
                                metadata: {
                                    alert_data: alert,
                                    resolved: alert.resolved
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _a.sent();
                        console.error('Error storing alert:', error_10);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Take system snapshot
     */
    EmergencyResponseSystem.prototype.takeSystemSnapshot = function () {
        return __awaiter(this, arguments, void 0, function (reason) {
            var snapshot;
            var _a;
            if (reason === void 0) { reason = 'periodic'; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        snapshot = {
                            snapshot_id: "snapshot_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
                            snapshot_time: new Date().toISOString(),
                            system_state: {
                                feature_flags: {}, // This would come from feature flag system
                                performance_metrics: {
                                    page_load_time: performance.now(),
                                    memory_usage: ((_a = performance.memory) === null || _a === void 0 ? void 0 : _a.usedJSHeapSize) / (1024 * 1024) || 0
                                },
                                error_rates: {}, // This would come from error tracking
                                active_users: 1, // This would come from analytics
                                system_health: this.determineSystemHealth()
                            }
                        };
                        // Store snapshot
                        this.snapshots.push(snapshot);
                        // Keep only last N snapshots
                        if (this.snapshots.length > this.maxSnapshots) {
                            this.snapshots.shift();
                        }
                        // Store in database for persistence
                        return [4 /*yield*/, this.supabase
                                .from('system_metrics')
                                .insert({
                                metric_type: 'system_snapshot',
                                metric_name: reason,
                                metric_value: 1,
                                metric_unit: 'snapshot',
                                metadata: {
                                    snapshot_data: snapshot
                                }
                            })];
                    case 1:
                        // Store in database for persistence
                        _b.sent();
                        console.log("\uD83D\uDCF8 System snapshot taken: ".concat(snapshot.snapshot_id, " (").concat(reason, ")"));
                        return [2 /*return*/, snapshot];
                }
            });
        });
    };
    /**
     * Determine current system health
     */
    EmergencyResponseSystem.prototype.determineSystemHealth = function () {
        var criticalAlerts = Array.from(this.activeAlerts.values())
            .filter(function (alert) { return !alert.resolved && alert.severity === 'critical'; });
        var highAlerts = Array.from(this.activeAlerts.values())
            .filter(function (alert) { return !alert.resolved && alert.severity === 'high'; });
        if (criticalAlerts.length > 0) {
            return 'critical';
        }
        else if (highAlerts.length > 2) {
            return 'degraded';
        }
        else {
            return 'healthy';
        }
    };
    /**
     * Resolve alert
     */
    EmergencyResponseSystem.prototype.resolveAlert = function (alertId_1) {
        return __awaiter(this, arguments, void 0, function (alertId, method) {
            var alert;
            if (method === void 0) { method = 'manual'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        alert = this.activeAlerts.get(alertId);
                        if (!alert) {
                            console.warn("Alert not found: ".concat(alertId));
                            return [2 /*return*/];
                        }
                        alert.resolved = true;
                        alert.resolution_time = new Date().toISOString();
                        alert.resolution_method = method;
                        // Update in database
                        return [4 /*yield*/, this.supabase
                                .from('system_metrics')
                                .update({
                                metadata: {
                                    alert_data: alert,
                                    resolved: true
                                }
                            })
                                .eq('metric_type', 'emergency_alert')
                                .eq('metric_name', alert.rule_id)];
                    case 1:
                        // Update in database
                        _a.sent();
                        // Remove from active alerts
                        this.activeAlerts.delete(alertId);
                        console.log("\u2705 Alert resolved: ".concat(alertId, " (").concat(method, ")"));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get system status
     */
    EmergencyResponseSystem.prototype.getSystemStatus = function () {
        return {
            health: this.determineSystemHealth(),
            active_alerts: this.activeAlerts.size,
            active_rules: Array.from(this.rules.values()).filter(function (r) { return r.enabled; }).length,
            recent_snapshots: this.snapshots.length,
            last_snapshot: this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1].snapshot_time : null
        };
    };
    /**
     * Cleanup resources
     */
    EmergencyResponseSystem.prototype.destroy = function () {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
    };
    return EmergencyResponseSystem;
}());
// Export singleton instance
var createemergencyResponse = function () { return new EmergencyResponseSystem(); };
exports.createemergencyResponse = createemergencyResponse;
// Utility functions
function addEmergencyRule(rule) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, emergencyResponse.addRule(rule)];
        });
    });
}
function takeEmergencySnapshot(reason) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, emergencyResponse.takeSystemSnapshot(reason)];
        });
    });
}
function resolveEmergencyAlert(alertId, method) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, emergencyResponse.resolveAlert(alertId, method)];
        });
    });
}
function getEmergencyStatus() {
    return emergencyResponse.getSystemStatus();
}
