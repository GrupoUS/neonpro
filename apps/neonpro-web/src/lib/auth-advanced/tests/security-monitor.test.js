"use strict";
// Security Monitor Tests
// Story 1.4: Session Management & Security Implementation
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
var vitest_1 = require("vitest");
var security_monitor_1 = require("../security-monitor");
(0, vitest_1.describe)('SecurityMonitor', function () {
    var securityMonitor;
    var mockConfig;
    (0, vitest_1.beforeEach)(function () {
        mockConfig = {
            enableRealTimeMonitoring: true,
            threatDetectionLevel: 'medium',
            maxFailedAttempts: 5,
            lockoutDuration: 15 * 60 * 1000, // 15 minutes
            suspiciousActivityThreshold: 10,
            enableGeolocationTracking: true,
            enableDeviceFingerprinting: true,
            alertThresholds: {
                low: 1,
                medium: 3,
                high: 5,
                critical: 1,
            },
            autoBlockThreshold: 10,
            rateLimitConfig: {
                windowMs: 15 * 60 * 1000, // 15 minutes
                maxRequests: 100,
                blockDuration: 60 * 60 * 1000, // 1 hour
            },
        };
        securityMonitor = new security_monitor_1.SecurityMonitor(mockConfig);
    });
    (0, vitest_1.afterEach)(function () {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('logSecurityEvent', function () {
        (0, vitest_1.it)('should log a security event successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var event;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event = {
                            type: 'login_attempt',
                            userId: 'user123',
                            severity: 'info',
                            details: {
                                success: true,
                                ipAddress: '192.168.1.1',
                            },
                            timestamp: new Date(),
                            ipAddress: '192.168.1.1',
                            userAgent: 'Mozilla/5.0',
                        };
                        return [4 /*yield*/, (0, vitest_1.expect)(securityMonitor.logSecurityEvent(event)).resolves.not.toThrow()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should create alert for high severity events', function () { return __awaiter(void 0, void 0, void 0, function () {
            var event, alerts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event = {
                            type: 'suspicious_activity',
                            userId: 'user123',
                            severity: 'high',
                            details: {
                                reason: 'Multiple failed login attempts',
                                attempts: 6,
                            },
                            timestamp: new Date(),
                            ipAddress: '192.168.1.1',
                            userAgent: 'Mozilla/5.0',
                        };
                        return [4 /*yield*/, securityMonitor.logSecurityEvent(event)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, securityMonitor.getSecurityAlerts('user123')];
                    case 2:
                        alerts = _a.sent();
                        (0, vitest_1.expect)(alerts.length).toBeGreaterThan(0);
                        (0, vitest_1.expect)(alerts[0].severity).toBe('high');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should trigger auto-block for critical events', function () { return __awaiter(void 0, void 0, void 0, function () {
            var event, isBlocked;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event = {
                            type: 'brute_force_attack',
                            userId: 'user123',
                            severity: 'critical',
                            details: {
                                attempts: 15,
                                timeWindow: '5 minutes',
                            },
                            timestamp: new Date(),
                            ipAddress: '192.168.1.1',
                            userAgent: 'Mozilla/5.0',
                        };
                        return [4 /*yield*/, securityMonitor.logSecurityEvent(event)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, securityMonitor.isIPBlocked('192.168.1.1')];
                    case 2:
                        isBlocked = _a.sent();
                        (0, vitest_1.expect)(isBlocked).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('detectAnomalies', function () {
        (0, vitest_1.it)('should detect location anomalies', function () { return __awaiter(void 0, void 0, void 0, function () {
            var sessionData, anomalousSession, anomalies;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionData = {
                            userId: 'user123',
                            ipAddress: '192.168.1.1',
                            userAgent: 'Mozilla/5.0',
                            location: {
                                country: 'US',
                                region: 'CA',
                                city: 'San Francisco',
                                latitude: 37.7749,
                                longitude: -122.4194,
                            },
                            deviceId: 'device123',
                        };
                        // First session - establish baseline
                        return [4 /*yield*/, securityMonitor.detectAnomalies(sessionData)];
                    case 1:
                        // First session - establish baseline
                        _a.sent();
                        anomalousSession = __assign(__assign({}, sessionData), { location: {
                                country: 'RU',
                                region: 'MOW',
                                city: 'Moscow',
                                latitude: 55.7558,
                                longitude: 37.6176,
                            } });
                        return [4 /*yield*/, securityMonitor.detectAnomalies(anomalousSession)];
                    case 2:
                        anomalies = _a.sent();
                        (0, vitest_1.expect)(anomalies.length).toBeGreaterThan(0);
                        (0, vitest_1.expect)(anomalies.some(function (a) { return a.type === 'location_anomaly'; })).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should detect device anomalies', function () { return __awaiter(void 0, void 0, void 0, function () {
            var sessionData, anomalousSession, anomalies;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionData = {
                            userId: 'user123',
                            ipAddress: '192.168.1.1',
                            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                            location: {
                                country: 'US',
                                region: 'CA',
                                city: 'San Francisco',
                                latitude: 37.7749,
                                longitude: -122.4194,
                            },
                            deviceId: 'device123',
                        };
                        // First session - establish baseline
                        return [4 /*yield*/, securityMonitor.detectAnomalies(sessionData)];
                    case 1:
                        // First session - establish baseline
                        _a.sent();
                        anomalousSession = __assign(__assign({}, sessionData), { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', deviceId: 'device456' });
                        return [4 /*yield*/, securityMonitor.detectAnomalies(anomalousSession)];
                    case 2:
                        anomalies = _a.sent();
                        (0, vitest_1.expect)(anomalies.length).toBeGreaterThan(0);
                        (0, vitest_1.expect)(anomalies.some(function (a) { return a.type === 'device_anomaly'; })).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should detect time-based anomalies', function () { return __awaiter(void 0, void 0, void 0, function () {
            var sessionData, anomalies;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionData = {
                            userId: 'user123',
                            ipAddress: '192.168.1.1',
                            userAgent: 'Mozilla/5.0',
                            location: {
                                country: 'US',
                                region: 'CA',
                                city: 'San Francisco',
                                latitude: 37.7749,
                                longitude: -122.4194,
                            },
                            deviceId: 'device123',
                        };
                        // Mock unusual time (3 AM)
                        vitest_1.vi.spyOn(Date.prototype, 'getHours').mockReturnValue(3);
                        return [4 /*yield*/, securityMonitor.detectAnomalies(sessionData)];
                    case 1:
                        anomalies = _a.sent();
                        (0, vitest_1.expect)(anomalies.some(function (a) { return a.type === 'time_anomaly'; })).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('calculateRiskScore', function () {
        (0, vitest_1.it)('should calculate low risk score for normal session', function () { return __awaiter(void 0, void 0, void 0, function () {
            var sessionData, riskScore;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionData = {
                            userId: 'user123',
                            ipAddress: '192.168.1.1',
                            userAgent: 'Mozilla/5.0',
                            location: {
                                country: 'US',
                                region: 'CA',
                                city: 'San Francisco',
                                latitude: 37.7749,
                                longitude: -122.4194,
                            },
                            deviceTrusted: true,
                            mfaVerified: true,
                            recentFailedAttempts: 0,
                        };
                        return [4 /*yield*/, securityMonitor.calculateRiskScore(sessionData)];
                    case 1:
                        riskScore = _a.sent();
                        (0, vitest_1.expect)(riskScore).toBeLessThan(0.3);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should calculate high risk score for suspicious session', function () { return __awaiter(void 0, void 0, void 0, function () {
            var sessionData, riskScore;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionData = {
                            userId: 'user123',
                            ipAddress: '192.168.1.1',
                            userAgent: 'Mozilla/5.0',
                            location: {
                                country: 'CN',
                                region: 'BJ',
                                city: 'Beijing',
                                latitude: 39.9042,
                                longitude: 116.4074,
                            },
                            deviceTrusted: false,
                            mfaVerified: false,
                            recentFailedAttempts: 3,
                        };
                        return [4 /*yield*/, securityMonitor.calculateRiskScore(sessionData)];
                    case 1:
                        riskScore = _a.sent();
                        (0, vitest_1.expect)(riskScore).toBeGreaterThan(0.7);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should increase risk score for untrusted device', function () { return __awaiter(void 0, void 0, void 0, function () {
            var trustedSession, untrustedSession, trustedScore, untrustedScore;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        trustedSession = {
                            userId: 'user123',
                            ipAddress: '192.168.1.1',
                            userAgent: 'Mozilla/5.0',
                            location: {
                                country: 'US',
                                region: 'CA',
                                city: 'San Francisco',
                                latitude: 37.7749,
                                longitude: -122.4194,
                            },
                            deviceTrusted: true,
                            mfaVerified: true,
                            recentFailedAttempts: 0,
                        };
                        untrustedSession = __assign(__assign({}, trustedSession), { deviceTrusted: false });
                        return [4 /*yield*/, securityMonitor.calculateRiskScore(trustedSession)];
                    case 1:
                        trustedScore = _a.sent();
                        return [4 /*yield*/, securityMonitor.calculateRiskScore(untrustedSession)];
                    case 2:
                        untrustedScore = _a.sent();
                        (0, vitest_1.expect)(untrustedScore).toBeGreaterThan(trustedScore);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('getSecurityAlerts', function () {
        (0, vitest_1.it)('should return security alerts for user', function () { return __awaiter(void 0, void 0, void 0, function () {
            var event, alerts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event = {
                            type: 'suspicious_activity',
                            userId: 'user123',
                            severity: 'high',
                            details: {
                                reason: 'Multiple failed login attempts',
                            },
                            timestamp: new Date(),
                            ipAddress: '192.168.1.1',
                            userAgent: 'Mozilla/5.0',
                        };
                        return [4 /*yield*/, securityMonitor.logSecurityEvent(event)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, securityMonitor.getSecurityAlerts('user123')];
                    case 2:
                        alerts = _a.sent();
                        (0, vitest_1.expect)(Array.isArray(alerts)).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should filter alerts by severity', function () { return __awaiter(void 0, void 0, void 0, function () {
            var lowEvent, highEvent, highAlerts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lowEvent = {
                            type: 'login_attempt',
                            userId: 'user123',
                            severity: 'low',
                            details: {},
                            timestamp: new Date(),
                            ipAddress: '192.168.1.1',
                            userAgent: 'Mozilla/5.0',
                        };
                        highEvent = {
                            type: 'suspicious_activity',
                            userId: 'user123',
                            severity: 'high',
                            details: {},
                            timestamp: new Date(),
                            ipAddress: '192.168.1.1',
                            userAgent: 'Mozilla/5.0',
                        };
                        return [4 /*yield*/, securityMonitor.logSecurityEvent(lowEvent)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, securityMonitor.logSecurityEvent(highEvent)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, securityMonitor.getSecurityAlerts('user123', 'high')];
                    case 3:
                        highAlerts = _a.sent();
                        (0, vitest_1.expect)(highAlerts.every(function (alert) { return alert.severity === 'high'; })).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('dismissAlert', function () {
        (0, vitest_1.it)('should dismiss an alert successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var event, alerts, alertId, success, updatedAlerts, dismissedAlert;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event = {
                            type: 'suspicious_activity',
                            userId: 'user123',
                            severity: 'medium',
                            details: {},
                            timestamp: new Date(),
                            ipAddress: '192.168.1.1',
                            userAgent: 'Mozilla/5.0',
                        };
                        return [4 /*yield*/, securityMonitor.logSecurityEvent(event)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, securityMonitor.getSecurityAlerts('user123')];
                    case 2:
                        alerts = _a.sent();
                        (0, vitest_1.expect)(alerts.length).toBeGreaterThan(0);
                        alertId = alerts[0].id;
                        return [4 /*yield*/, securityMonitor.dismissAlert(alertId, 'user123', 'False positive')];
                    case 3:
                        success = _a.sent();
                        (0, vitest_1.expect)(success).toBe(true);
                        return [4 /*yield*/, securityMonitor.getSecurityAlerts('user123')];
                    case 4:
                        updatedAlerts = _a.sent();
                        dismissedAlert = updatedAlerts.find(function (a) { return a.id === alertId; });
                        (0, vitest_1.expect)(dismissedAlert === null || dismissedAlert === void 0 ? void 0 : dismissedAlert.dismissed).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should return false for non-existent alert', function () { return __awaiter(void 0, void 0, void 0, function () {
            var success;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, securityMonitor.dismissAlert('non-existent', 'user123', 'Test')];
                    case 1:
                        success = _a.sent();
                        (0, vitest_1.expect)(success).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('blockIP', function () {
        (0, vitest_1.it)('should block an IP address', function () { return __awaiter(void 0, void 0, void 0, function () {
            var success, isBlocked;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, securityMonitor.blockIP('192.168.1.100', 'Manual block', 60 * 60 * 1000)];
                    case 1:
                        success = _a.sent();
                        (0, vitest_1.expect)(success).toBe(true);
                        return [4 /*yield*/, securityMonitor.isIPBlocked('192.168.1.100')];
                    case 2:
                        isBlocked = _a.sent();
                        (0, vitest_1.expect)(isBlocked).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should unblock an IP address', function () { return __awaiter(void 0, void 0, void 0, function () {
            var success, isBlocked;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, securityMonitor.blockIP('192.168.1.100', 'Test block', 60 * 60 * 1000)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, securityMonitor.unblockIP('192.168.1.100')];
                    case 2:
                        success = _a.sent();
                        (0, vitest_1.expect)(success).toBe(true);
                        return [4 /*yield*/, securityMonitor.isIPBlocked('192.168.1.100')];
                    case 3:
                        isBlocked = _a.sent();
                        (0, vitest_1.expect)(isBlocked).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('getSecurityMetrics', function () {
        (0, vitest_1.it)('should return security metrics', function () { return __awaiter(void 0, void 0, void 0, function () {
            var metrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, securityMonitor.getSecurityMetrics('user123', '24h')];
                    case 1:
                        metrics = _a.sent();
                        (0, vitest_1.expect)(metrics).toBeDefined();
                        (0, vitest_1.expect)(typeof metrics.totalEvents).toBe('number');
                        (0, vitest_1.expect)(typeof metrics.alertsGenerated).toBe('number');
                        (0, vitest_1.expect)(typeof metrics.threatsBlocked).toBe('number');
                        (0, vitest_1.expect)(typeof metrics.averageRiskScore).toBe('number');
                        (0, vitest_1.expect)(Array.isArray(metrics.eventsByType)).toBe(true);
                        (0, vitest_1.expect)(Array.isArray(metrics.alertsBySeverity)).toBe(true);
                        (0, vitest_1.expect)(Array.isArray(metrics.topThreats)).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('isRateLimited', function () {
        (0, vitest_1.it)('should track rate limiting', function () { return __awaiter(void 0, void 0, void 0, function () {
            var identifier, isLimited, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        identifier = '192.168.1.1';
                        return [4 /*yield*/, securityMonitor.isRateLimited(identifier)];
                    case 1:
                        isLimited = _a.sent();
                        (0, vitest_1.expect)(isLimited).toBe(false);
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < mockConfig.rateLimitConfig.maxRequests + 1)) return [3 /*break*/, 5];
                        return [4 /*yield*/, securityMonitor.isRateLimited(identifier)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [4 /*yield*/, securityMonitor.isRateLimited(identifier)];
                    case 6:
                        // Should now be rate limited
                        isLimited = _a.sent();
                        (0, vitest_1.expect)(isLimited).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('generateSecurityReport', function () {
        (0, vitest_1.it)('should generate a security report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, securityMonitor.generateSecurityReport({
                            userId: 'user123',
                            startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
                            endDate: new Date(),
                            includeDetails: true,
                        })];
                    case 1:
                        report = _a.sent();
                        (0, vitest_1.expect)(report).toBeDefined();
                        (0, vitest_1.expect)(report.summary).toBeDefined();
                        (0, vitest_1.expect)(report.events).toBeDefined();
                        (0, vitest_1.expect)(report.alerts).toBeDefined();
                        (0, vitest_1.expect)(report.metrics).toBeDefined();
                        (0, vitest_1.expect)(Array.isArray(report.recommendations)).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should include recommendations in report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var event, report;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event = {
                            type: 'failed_login',
                            userId: 'user123',
                            severity: 'medium',
                            details: {
                                attempts: 3,
                            },
                            timestamp: new Date(),
                            ipAddress: '192.168.1.1',
                            userAgent: 'Mozilla/5.0',
                        };
                        return [4 /*yield*/, securityMonitor.logSecurityEvent(event)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, securityMonitor.generateSecurityReport({
                                userId: 'user123',
                                startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
                                endDate: new Date(),
                                includeDetails: true,
                            })];
                    case 2:
                        report = _a.sent();
                        (0, vitest_1.expect)(report.recommendations.length).toBeGreaterThan(0);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('threat detection', function () {
        (0, vitest_1.it)('should detect brute force attacks', function () { return __awaiter(void 0, void 0, void 0, function () {
            var sessionData, i, event_1, anomalies;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionData = {
                            userId: 'user123',
                            ipAddress: '192.168.1.1',
                            userAgent: 'Mozilla/5.0',
                            location: {
                                country: 'US',
                                region: 'CA',
                                city: 'San Francisco',
                                latitude: 37.7749,
                                longitude: -122.4194,
                            },
                            deviceId: 'device123',
                        };
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < 6)) return [3 /*break*/, 4];
                        event_1 = {
                            type: 'failed_login',
                            userId: 'user123',
                            severity: 'medium',
                            details: {
                                attempt: i + 1,
                            },
                            timestamp: new Date(),
                            ipAddress: '192.168.1.1',
                            userAgent: 'Mozilla/5.0',
                        };
                        return [4 /*yield*/, securityMonitor.logSecurityEvent(event_1)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [4 /*yield*/, securityMonitor.detectAnomalies(sessionData)];
                    case 5:
                        anomalies = _a.sent();
                        (0, vitest_1.expect)(anomalies.some(function (a) { return a.type === 'brute_force'; })).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should detect session hijacking attempts', function () { return __awaiter(void 0, void 0, void 0, function () {
            var sessionData, suspiciousSession, anomalies;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionData = {
                            userId: 'user123',
                            ipAddress: '192.168.1.1',
                            userAgent: 'Mozilla/5.0',
                            location: {
                                country: 'US',
                                region: 'CA',
                                city: 'San Francisco',
                                latitude: 37.7749,
                                longitude: -122.4194,
                            },
                            deviceId: 'device123',
                        };
                        // First establish normal session
                        return [4 /*yield*/, securityMonitor.detectAnomalies(sessionData)];
                    case 1:
                        // First establish normal session
                        _a.sent();
                        suspiciousSession = __assign(__assign({}, sessionData), { ipAddress: '10.0.0.1' });
                        return [4 /*yield*/, securityMonitor.detectAnomalies(suspiciousSession)];
                    case 2:
                        anomalies = _a.sent();
                        (0, vitest_1.expect)(anomalies.some(function (a) { return a.type === 'session_hijacking'; })).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
