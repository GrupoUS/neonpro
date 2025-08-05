'use client';
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
exports.useSecurityMonitor = useSecurityMonitor;
var react_1 = require("react");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var session_utils_1 = require("@/lib/auth/utils/session-utils");
var session_config_1 = require("@/lib/auth/config/session-config");
function useSecurityMonitor() {
    var _this = this;
    var supabase = (0, auth_helpers_nextjs_1.createClientComponentClient)();
    var _a = (0, react_1.useState)({
        alerts: [],
        suspiciousActivities: [],
        riskScore: 0,
        isMonitoring: false,
        lastCheck: null,
        threatLevel: 'low'
    }), state = _a[0], setState = _a[1];
    var _b = (0, react_1.useState)([]), threats = _b[0], setThreats = _b[1];
    var _c = (0, react_1.useState)({
        failedLogins: 0,
        suspiciousIPs: [],
        deviceAnomalies: 0,
        sessionViolations: 0,
        lastIncident: null
    }), metrics = _c[0], setMetrics = _c[1];
    var monitoringInterval = (0, react_1.useRef)(null);
    var alertCallbacks = (0, react_1.useRef)([]);
    // Start security monitoring
    var startMonitoring = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (state.isMonitoring)
                        return [2 /*return*/];
                    setState(function (prev) { return (__assign(__assign({}, prev), { isMonitoring: true })); });
                    // Initial security check
                    return [4 /*yield*/, performSecurityCheck()];
                case 1:
                    // Initial security check
                    _a.sent();
                    // Set up periodic monitoring
                    monitoringInterval.current = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, performSecurityCheck()];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }, session_config_1.SessionConfig.security.monitoringInterval);
                    console.log('Security monitoring started');
                    return [2 /*return*/];
            }
        });
    }); }, [state.isMonitoring]);
    // Stop security monitoring
    var stopMonitoring = (0, react_1.useCallback)(function () {
        if (monitoringInterval.current) {
            clearInterval(monitoringInterval.current);
            monitoringInterval.current = null;
        }
        setState(function (prev) { return (__assign(__assign({}, prev), { isMonitoring: false })); });
        console.log('Security monitoring stopped');
    }, []);
    // Perform comprehensive security check
    var performSecurityCheck = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var user, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 1:
                    user = (_a.sent()).data.user;
                    if (!user)
                        return [2 /*return*/];
                    // Check for security events
                    return [4 /*yield*/, checkSecurityEvents(user.id)];
                case 2:
                    // Check for security events
                    _a.sent();
                    // Check for suspicious activities
                    return [4 /*yield*/, checkSuspiciousActivities(user.id)];
                case 3:
                    // Check for suspicious activities
                    _a.sent();
                    // Analyze device patterns
                    return [4 /*yield*/, analyzeDevicePatterns(user.id)];
                case 4:
                    // Analyze device patterns
                    _a.sent();
                    // Calculate risk score
                    return [4 /*yield*/, calculateRiskScore()];
                case 5:
                    // Calculate risk score
                    _a.sent();
                    // Update last check timestamp
                    setState(function (prev) { return (__assign(__assign({}, prev), { lastCheck: new Date() })); });
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('Security check failed:', error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); }, [supabase]);
    // Check for new security events
    var checkSecurityEvents = (0, react_1.useCallback)(function (userId) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, newEvents_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/auth/session/security?limit=50&severity=medium,high,critical", {
                            method: 'GET',
                            headers: { 'Content-Type': 'application/json' }
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    newEvents_1 = data.events || [];
                    setState(function (prev) {
                        var existingIds = new Set(prev.alerts.map(function (alert) { return alert.id; }));
                        var freshEvents = newEvents_1.filter(function (event) { return !existingIds.has(event.id); });
                        // Trigger alerts for new high-severity events
                        freshEvents.forEach(function (event) {
                            if (event.severity === 'high' || event.severity === 'critical') {
                                triggerThreatAlert({
                                    id: event.id,
                                    type: event.eventType,
                                    severity: event.severity,
                                    description: event.description || "Security event: ".concat(event.eventType),
                                    timestamp: new Date(event.createdAt),
                                    metadata: event.metadata || {},
                                    resolved: false
                                });
                            }
                        });
                        return __assign(__assign({}, prev), { alerts: __spreadArray(__spreadArray([], freshEvents, true), prev.alerts, true).slice(0, 100) // Keep last 100 alerts
                         });
                    });
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error('Failed to check security events:', error_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    // Check for suspicious activities
    var checkSuspiciousActivities = (0, react_1.useCallback)(function (userId) { return __awaiter(_this, void 0, void 0, function () {
        var _a, activities_1, error, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, supabase
                            .from('suspicious_activities')
                            .select('*')
                            .eq('userId', userId)
                            .eq('resolved', false)
                            .order('createdAt', { ascending: false })
                            .limit(20)];
                case 1:
                    _a = _b.sent(), activities_1 = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    setState(function (prev) { return (__assign(__assign({}, prev), { suspiciousActivities: activities_1 || [] })); });
                    // Check for new suspicious activities
                    activities_1 === null || activities_1 === void 0 ? void 0 : activities_1.forEach(function (activity) {
                        if (activity.riskScore >= 70) {
                            triggerThreatAlert({
                                id: activity.id,
                                type: 'suspicious_login',
                                severity: activity.riskScore >= 90 ? 'critical' : 'high',
                                description: activity.description,
                                timestamp: new Date(activity.createdAt),
                                metadata: activity.metadata || {},
                                resolved: activity.resolved
                            });
                        }
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _b.sent();
                    console.error('Failed to check suspicious activities:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [supabase]);
    // Analyze device usage patterns
    var analyzeDevicePatterns = (0, react_1.useCallback)(function (userId) { return __awaiter(_this, void 0, void 0, function () {
        var _a, devices, error, currentFingerprint_1, currentDevice, anomalies, error_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, supabase
                            .from('user_devices')
                            .select('*')
                            .eq('userId', userId)
                            .order('lastUsed', { ascending: false })];
                case 1:
                    _a = _b.sent(), devices = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    currentFingerprint_1 = session_utils_1.SessionUtils.generateDeviceFingerprint();
                    currentDevice = devices === null || devices === void 0 ? void 0 : devices.find(function (device) { return device.fingerprint === currentFingerprint_1; });
                    // Check for device anomalies
                    if (devices) {
                        anomalies = detectDeviceAnomalies(devices, currentDevice);
                        anomalies.forEach(function (anomaly) {
                            triggerThreatAlert({
                                id: "device-anomaly-".concat(Date.now()),
                                type: 'device_anomaly',
                                severity: 'medium',
                                description: anomaly.description,
                                timestamp: new Date(),
                                metadata: anomaly.metadata,
                                resolved: false
                            });
                        });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _b.sent();
                    console.error('Failed to analyze device patterns:', error_4);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [supabase]);
    // Detect device anomalies
    var detectDeviceAnomalies = function (devices, currentDevice) {
        var anomalies = [];
        // Check for too many devices
        if (devices.length > session_config_1.SessionConfig.security.maxDevicesPerUser) {
            anomalies.push({
                description: "Too many devices registered (".concat(devices.length, "/").concat(session_config_1.SessionConfig.security.maxDevicesPerUser, ")"),
                metadata: { deviceCount: devices.length, maxAllowed: session_config_1.SessionConfig.security.maxDevicesPerUser }
            });
        }
        // Check for untrusted device usage
        var untrustedDevices = devices.filter(function (device) { return !device.isTrusted && device.lastUsed; });
        if (untrustedDevices.length > 0) {
            anomalies.push({
                description: "".concat(untrustedDevices.length, " untrusted device(s) recently used"),
                metadata: { untrustedDevices: untrustedDevices.map(function (d) { return d.id; }) }
            });
        }
        // Check for suspicious device locations
        if (currentDevice && currentDevice.location) {
            var recentDevices = devices.filter(function (device) {
                return device.lastUsed &&
                    new Date(device.lastUsed) > new Date(Date.now() - 24 * 60 * 60 * 1000);
            } // Last 24 hours
            );
            var locations = recentDevices
                .map(function (device) { return device.location; })
                .filter(Boolean);
            var uniqueLocations = new Set(locations);
            if (uniqueLocations.size > 3) {
                anomalies.push({
                    description: "Multiple locations detected in 24h (".concat(uniqueLocations.size, " locations)"),
                    metadata: { locations: Array.from(uniqueLocations) }
                });
            }
        }
        return anomalies;
    };
    // Calculate overall risk score
    var calculateRiskScore = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var riskScore, threatLevel, recentAlerts, recentSuspicious, unresolvedThreats;
        return __generator(this, function (_a) {
            riskScore = 0;
            threatLevel = 'low';
            recentAlerts = state.alerts.filter(function (alert) {
                return new Date(alert.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
            });
            recentAlerts.forEach(function (alert) {
                switch (alert.severity) {
                    case 'low':
                        riskScore += 10;
                        break;
                    case 'medium':
                        riskScore += 25;
                        break;
                    case 'high':
                        riskScore += 50;
                        break;
                    case 'critical':
                        riskScore += 100;
                        break;
                }
            });
            recentSuspicious = state.suspiciousActivities.filter(function (activity) {
                return new Date(activity.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
            });
            recentSuspicious.forEach(function (activity) {
                riskScore += activity.riskScore || 0;
            });
            unresolvedThreats = threats.filter(function (threat) { return !threat.resolved; });
            riskScore += unresolvedThreats.length * 15;
            // Determine threat level
            if (riskScore >= 200)
                threatLevel = 'critical';
            else if (riskScore >= 100)
                threatLevel = 'high';
            else if (riskScore >= 50)
                threatLevel = 'medium';
            else
                threatLevel = 'low';
            setState(function (prev) { return (__assign(__assign({}, prev), { riskScore: riskScore, threatLevel: threatLevel })); });
            // Update metrics
            setMetrics(function (prev) { return (__assign(__assign({}, prev), { failedLogins: recentAlerts.filter(function (alert) { return alert.eventType === 'login_failed'; }).length, deviceAnomalies: unresolvedThreats.filter(function (threat) { return threat.type === 'device_anomaly'; }).length, sessionViolations: recentAlerts.filter(function (alert) { return alert.eventType === 'session_violation'; }).length, lastIncident: recentAlerts.length > 0 ? new Date(Math.max.apply(Math, recentAlerts.map(function (alert) { return new Date(alert.createdAt).getTime(); }))) : null })); });
            return [2 /*return*/];
        });
    }); }, [state.alerts, state.suspiciousActivities, threats]);
    // Trigger threat alert
    var triggerThreatAlert = (0, react_1.useCallback)(function (threat) {
        setThreats(function (prev) {
            var exists = prev.some(function (t) { return t.id === threat.id; });
            if (exists)
                return prev;
            var newThreats = __spreadArray([threat], prev, true).slice(0, 50); // Keep last 50 threats
            // Notify callbacks
            alertCallbacks.current.forEach(function (callback) {
                try {
                    callback(threat);
                }
                catch (error) {
                    console.error('Alert callback failed:', error);
                }
            });
            return newThreats;
        });
    }, []);
    // Resolve threat
    var resolveThreat = (0, react_1.useCallback)(function (threatId) {
        setThreats(function (prev) {
            return prev.map(function (threat) {
                return threat.id === threatId ? __assign(__assign({}, threat), { resolved: true }) : threat;
            });
        });
    }, []);
    // Subscribe to threat alerts
    var onThreatAlert = (0, react_1.useCallback)(function (callback) {
        alertCallbacks.current.push(callback);
        // Return unsubscribe function
        return function () {
            alertCallbacks.current = alertCallbacks.current.filter(function (cb) { return cb !== callback; });
        };
    }, []);
    // Get security recommendations
    var getSecurityRecommendations = (0, react_1.useCallback)(function () {
        var recommendations = [];
        if (state.riskScore > 100) {
            recommendations.push('Consider changing your password immediately');
            recommendations.push('Review and remove untrusted devices');
        }
        if (state.suspiciousActivities.length > 0) {
            recommendations.push('Review recent login activities');
        }
        if (metrics.deviceAnomalies > 0) {
            recommendations.push('Verify all registered devices are yours');
        }
        if (state.threatLevel === 'critical') {
            recommendations.push('Contact support immediately');
            recommendations.push('Consider temporarily disabling account access');
        }
        return recommendations;
    }, [state.riskScore, state.suspiciousActivities.length, state.threatLevel, metrics.deviceAnomalies]);
    // Initialize monitoring on mount
    (0, react_1.useEffect)(function () {
        startMonitoring();
        return function () {
            stopMonitoring();
        };
    }, [startMonitoring, stopMonitoring]);
    // Cleanup on unmount
    (0, react_1.useEffect)(function () {
        return function () {
            if (monitoringInterval.current) {
                clearInterval(monitoringInterval.current);
            }
        };
    }, []);
    return __assign(__assign({}, state), { threats: threats, metrics: metrics, 
        // Actions
        startMonitoring: startMonitoring, stopMonitoring: stopMonitoring, performSecurityCheck: performSecurityCheck, resolveThreat: resolveThreat, onThreatAlert: onThreatAlert, getSecurityRecommendations: getSecurityRecommendations, 
        // Computed
        hasActiveThreats: threats.some(function (threat) { return !threat.resolved; }), criticalThreats: threats.filter(function (threat) { return !threat.resolved && threat.severity === 'critical'; }), isHighRisk: state.riskScore > 100 || state.threatLevel === 'high' || state.threatLevel === 'critical' });
}
