"use strict";
/**
 * Security Audit Logging System
 *
 * Comprehensive audit logging for authentication events with security monitoring,
 * suspicious activity detection, and compliance reporting.
 *
 * Features:
 * - All authentication attempts and outcomes
 * - Session creation and termination tracking
 * - Failed login attempts monitoring
 * - Suspicious activity detection and alerting
 * - Security event reporting and analytics
 * - LGPD-compliant logging with data retention
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
exports.createsecurityAuditLogger = exports.RiskLevel = exports.AuditSeverity = exports.AuditEventType = void 0;
exports.logAuthEvent = logAuthEvent;
exports.getSecurityMetrics = getSecurityMetrics;
exports.getSecurityReport = getSecurityReport;
var client_1 = require("@/lib/supabase/client");
// Audit event types
var AuditEventType;
(function (AuditEventType) {
    AuditEventType["LOGIN_ATTEMPT"] = "login_attempt";
    AuditEventType["LOGIN_SUCCESS"] = "login_success";
    AuditEventType["LOGIN_FAILURE"] = "login_failure";
    AuditEventType["LOGOUT"] = "logout";
    AuditEventType["SESSION_CREATED"] = "session_created";
    AuditEventType["SESSION_EXPIRED"] = "session_expired";
    AuditEventType["SESSION_TERMINATED"] = "session_terminated";
    AuditEventType["TOKEN_REFRESH"] = "token_refresh";
    AuditEventType["OAUTH_FLOW_START"] = "oauth_flow_start";
    AuditEventType["OAUTH_FLOW_SUCCESS"] = "oauth_flow_success";
    AuditEventType["OAUTH_FLOW_FAILURE"] = "oauth_flow_failure";
    AuditEventType["PERMISSION_DENIED"] = "permission_denied";
    AuditEventType["SUSPICIOUS_ACTIVITY"] = "suspicious_activity";
    AuditEventType["ACCOUNT_LOCKOUT"] = "account_lockout";
    AuditEventType["PASSWORD_RESET"] = "password_reset";
    AuditEventType["PROFILE_UPDATE"] = "profile_update";
    AuditEventType["ROLE_CHANGE"] = "role_change";
})(AuditEventType || (exports.AuditEventType = AuditEventType = {}));
var AuditSeverity;
(function (AuditSeverity) {
    AuditSeverity["INFO"] = "info";
    AuditSeverity["WARNING"] = "warning";
    AuditSeverity["ERROR"] = "error";
    AuditSeverity["CRITICAL"] = "critical";
})(AuditSeverity || (exports.AuditSeverity = AuditSeverity = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "low";
    RiskLevel["MEDIUM"] = "medium";
    RiskLevel["HIGH"] = "high";
    RiskLevel["CRITICAL"] = "critical";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
// Suspicious activity patterns
var SUSPICIOUS_PATTERNS = {
    MULTIPLE_FAILED_LOGINS: {
        threshold: 5,
        timeWindowMinutes: 15,
        riskLevel: RiskLevel.HIGH
    },
    RAPID_LOGIN_ATTEMPTS: {
        threshold: 10,
        timeWindowMinutes: 5,
        riskLevel: RiskLevel.MEDIUM
    },
    LOGIN_FROM_NEW_LOCATION: {
        riskLevel: RiskLevel.MEDIUM
    },
    LOGIN_FROM_NEW_DEVICE: {
        riskLevel: RiskLevel.LOW
    },
    CONCURRENT_SESSIONS_DIFFERENT_IPS: {
        threshold: 3,
        riskLevel: RiskLevel.HIGH
    },
    OAUTH_MULTIPLE_FAILURES: {
        threshold: 3,
        timeWindowMinutes: 10,
        riskLevel: RiskLevel.MEDIUM
    }
};
var SecurityAuditLogger = /** @class */ (function () {
    function SecurityAuditLogger() {
        this.supabase = (0, client_1.createClient)();
        this.eventQueue = [];
        this.isProcessing = false;
    }
    /**
     * Log authentication event
     */
    SecurityAuditLogger.prototype.logEvent = function (type_1) {
        return __awaiter(this, arguments, void 0, function (type, details, userId, sessionId) {
            var event_1, error_1;
            var _a;
            if (details === void 0) { details = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        _a = {
                            id: this.generateEventId(),
                            type: type,
                            severity: this.determineSeverity(type, details),
                            riskLevel: this.assessRiskLevel(type, details),
                            userId: userId,
                            sessionId: sessionId,
                            email: details.email
                        };
                        return [4 /*yield*/, this.getClientIP()];
                    case 1:
                        _a.ipAddress = _b.sent(),
                            _a.userAgent = this.getUserAgent(),
                            _a.timestamp = Date.now(),
                            _a.details = details,
                            _a.outcome = this.determineOutcome(type, details);
                        return [4 /*yield*/, this.generateDeviceFingerprint()];
                    case 2:
                        _a.deviceFingerprint = _b.sent();
                        return [4 /*yield*/, this.getLocationInfo()];
                    case 3:
                        event_1 = (_a.location = _b.sent(),
                            _a.metadata = {
                                url: window.location.href,
                                referrer: document.referrer,
                                screenResolution: "".concat(screen.width, "x").concat(screen.height),
                                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                            },
                            _a);
                        // Add to queue for batch processing
                        this.eventQueue.push(event_1);
                        if (!(event_1.severity === AuditSeverity.CRITICAL || this.eventQueue.length >= 10)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.processEventQueue()];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: 
                    // Detect suspicious patterns in real-time
                    return [4 /*yield*/, this.detectSuspiciousActivity(event_1)];
                    case 6:
                        // Detect suspicious patterns in real-time
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _b.sent();
                        console.error('Error logging audit event:', error_1);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Log successful login
     */
    SecurityAuditLogger.prototype.logLoginSuccess = function (userId_1, sessionId_1) {
        return __awaiter(this, arguments, void 0, function (userId, sessionId, method) {
            if (method === void 0) { method = 'oauth'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.logEvent(AuditEventType.LOGIN_SUCCESS, {
                            method: method,
                            loginDuration: performance.now()
                        }, userId, sessionId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Log failed login attempt
     */
    SecurityAuditLogger.prototype.logLoginFailure = function (email_1, reason_1) {
        return __awaiter(this, arguments, void 0, function (email, reason, method) {
            if (method === void 0) { method = 'oauth'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.logEvent(AuditEventType.LOGIN_FAILURE, {
                            email: email,
                            reason: reason,
                            method: method,
                            failureType: this.categorizeFailure(reason)
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Log session creation
     */
    SecurityAuditLogger.prototype.logSessionCreated = function (userId, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.logEvent(AuditEventType.SESSION_CREATED, {
                            sessionTimeout: 120 // minutes
                        }, userId, sessionId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Log session termination
     */
    SecurityAuditLogger.prototype.logSessionTerminated = function (userId, sessionId, reason) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.logEvent(AuditEventType.SESSION_TERMINATED, {
                            reason: reason,
                            sessionDuration: this.calculateSessionDuration(sessionId)
                        }, userId, sessionId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Log OAuth flow events
     */
    SecurityAuditLogger.prototype.logOAuthFlow = function (stage, details) {
        return __awaiter(this, void 0, void 0, function () {
            var eventType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        eventType = stage === 'start' ? AuditEventType.OAUTH_FLOW_START :
                            stage === 'success' ? AuditEventType.OAUTH_FLOW_SUCCESS :
                                AuditEventType.OAUTH_FLOW_FAILURE;
                        return [4 /*yield*/, this.logEvent(eventType, __assign({ provider: 'google', flowDuration: details.duration }, details))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Log permission denied events
     */
    SecurityAuditLogger.prototype.logPermissionDenied = function (userId, resource, action) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.logEvent(AuditEventType.PERMISSION_DENIED, {
                            resource: resource,
                            action: action,
                            requiredRole: this.getRequiredRole(resource, action)
                        }, userId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get security metrics for time range
     */
    SecurityAuditLogger.prototype.getSecurityMetrics = function () {
        return __awaiter(this, arguments, void 0, function (hoursBack) {
            var cutoffTime_1, events, metrics;
            if (hoursBack === void 0) { hoursBack = 24; }
            return __generator(this, function (_a) {
                try {
                    cutoffTime_1 = Date.now() - (hoursBack * 60 * 60 * 1000);
                    events = this.getStoredEvents().filter(function (event) { return event.timestamp > cutoffTime_1; });
                    metrics = {
                        totalEvents: events.length,
                        successfulLogins: events.filter(function (e) { return e.type === AuditEventType.LOGIN_SUCCESS; }).length,
                        failedLogins: events.filter(function (e) { return e.type === AuditEventType.LOGIN_FAILURE; }).length,
                        suspiciousActivities: events.filter(function (e) { return e.type === AuditEventType.SUSPICIOUS_ACTIVITY; }).length,
                        accountLockouts: events.filter(function (e) { return e.type === AuditEventType.ACCOUNT_LOCKOUT; }).length,
                        uniqueUsers: new Set(events.map(function (e) { return e.userId; }).filter(Boolean)).size,
                        uniqueIPs: new Set(events.map(function (e) { return e.ipAddress; })).size,
                        riskDistribution: this.calculateRiskDistribution(events),
                        timeRangeHours: hoursBack
                    };
                    return [2 /*return*/, metrics];
                }
                catch (error) {
                    console.error('Error getting security metrics:', error);
                    return [2 /*return*/, this.getEmptyMetrics(hoursBack)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Detect suspicious activity patterns
     */
    SecurityAuditLogger.prototype.detectSuspiciousActivity = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var recentEvents, suspiciousPatterns, failedLogins, rapidAttempts, _i, suspiciousPatterns_1, pattern, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        recentEvents = this.getRecentEvents(60) // Last hour
                        ;
                        suspiciousPatterns = [];
                        // Check for multiple failed logins
                        if (event.type === AuditEventType.LOGIN_FAILURE) {
                            failedLogins = recentEvents.filter(function (e) {
                                return e.type === AuditEventType.LOGIN_FAILURE &&
                                    e.email === event.email &&
                                    e.timestamp > Date.now() - (SUSPICIOUS_PATTERNS.MULTIPLE_FAILED_LOGINS.timeWindowMinutes * 60 * 1000);
                            });
                            if (failedLogins.length >= SUSPICIOUS_PATTERNS.MULTIPLE_FAILED_LOGINS.threshold) {
                                suspiciousPatterns.push({
                                    pattern: 'MULTIPLE_FAILED_LOGINS',
                                    description: "".concat(failedLogins.length, " tentativas de login falharam para ").concat(event.email),
                                    riskLevel: SUSPICIOUS_PATTERNS.MULTIPLE_FAILED_LOGINS.riskLevel,
                                    occurrences: failedLogins.length,
                                    affectedUsers: [event.email],
                                    timeframe: {
                                        start: Math.min.apply(Math, failedLogins.map(function (e) { return e.timestamp; })),
                                        end: Date.now()
                                    }
                                });
                            }
                        }
                        rapidAttempts = recentEvents.filter(function (e) {
                            return (e.type === AuditEventType.LOGIN_ATTEMPT || e.type === AuditEventType.LOGIN_FAILURE) &&
                                e.ipAddress === event.ipAddress &&
                                e.timestamp > Date.now() - (SUSPICIOUS_PATTERNS.RAPID_LOGIN_ATTEMPTS.timeWindowMinutes * 60 * 1000);
                        });
                        if (rapidAttempts.length >= SUSPICIOUS_PATTERNS.RAPID_LOGIN_ATTEMPTS.threshold) {
                            suspiciousPatterns.push({
                                pattern: 'RAPID_LOGIN_ATTEMPTS',
                                description: "".concat(rapidAttempts.length, " tentativas r\u00E1pidas de login do IP ").concat(event.ipAddress),
                                riskLevel: SUSPICIOUS_PATTERNS.RAPID_LOGIN_ATTEMPTS.riskLevel,
                                occurrences: rapidAttempts.length,
                                affectedUsers: __spreadArray([], new Set(rapidAttempts.map(function (e) { return e.email; }).filter(Boolean)), true),
                                timeframe: {
                                    start: Math.min.apply(Math, rapidAttempts.map(function (e) { return e.timestamp; })),
                                    end: Date.now()
                                }
                            });
                        }
                        _i = 0, suspiciousPatterns_1 = suspiciousPatterns;
                        _a.label = 1;
                    case 1:
                        if (!(_i < suspiciousPatterns_1.length)) return [3 /*break*/, 5];
                        pattern = suspiciousPatterns_1[_i];
                        return [4 /*yield*/, this.logEvent(AuditEventType.SUSPICIOUS_ACTIVITY, {
                                pattern: pattern.pattern,
                                description: pattern.description,
                                riskLevel: pattern.riskLevel,
                                occurrences: pattern.occurrences,
                                affectedUsers: pattern.affectedUsers
                            })
                            // Alert if high risk
                        ];
                    case 2:
                        _a.sent();
                        if (!(pattern.riskLevel === RiskLevel.HIGH || pattern.riskLevel === RiskLevel.CRITICAL)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.sendSecurityAlert(pattern)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_2 = _a.sent();
                        console.error('Error detecting suspicious activity:', error_2);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get security report
     */
    SecurityAuditLogger.prototype.getSecurityReport = function () {
        return __awaiter(this, arguments, void 0, function (hoursBack) {
            var metrics, suspiciousPatterns, recommendations;
            if (hoursBack === void 0) { hoursBack = 24; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSecurityMetrics(hoursBack)];
                    case 1:
                        metrics = _a.sent();
                        return [4 /*yield*/, this.getSuspiciousPatterns(hoursBack)];
                    case 2:
                        suspiciousPatterns = _a.sent();
                        recommendations = this.generateRecommendations(metrics, suspiciousPatterns);
                        return [2 /*return*/, {
                                metrics: metrics,
                                suspiciousPatterns: suspiciousPatterns,
                                recommendations: recommendations
                            }];
                }
            });
        });
    };
    // Private methods
    SecurityAuditLogger.prototype.processEventQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var eventsToProcess, storedEvents, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.isProcessing || this.eventQueue.length === 0)
                            return [2 /*return*/];
                        this.isProcessing = true;
                        eventsToProcess = __spreadArray([], this.eventQueue, true);
                        this.eventQueue = [];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, 5, 6]);
                        storedEvents = this.getStoredEvents();
                        storedEvents.push.apply(storedEvents, eventsToProcess);
                        // Keep only last 1000 events in localStorage
                        if (storedEvents.length > 1000) {
                            storedEvents.splice(0, storedEvents.length - 1000);
                        }
                        localStorage.setItem('security_audit_events', JSON.stringify(storedEvents));
                        if (!(process.env.NODE_ENV === 'production')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.sendToMonitoringService(eventsToProcess)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [3 /*break*/, 6];
                    case 4:
                        error_3 = _b.sent();
                        console.error('Error processing event queue:', error_3);
                        // Re-queue events if processing failed
                        (_a = this.eventQueue).unshift.apply(_a, eventsToProcess);
                        return [3 /*break*/, 6];
                    case 5:
                        this.isProcessing = false;
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SecurityAuditLogger.prototype.generateEventId = function () {
        return "audit_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    };
    SecurityAuditLogger.prototype.determineSeverity = function (type, details) {
        switch (type) {
            case AuditEventType.SUSPICIOUS_ACTIVITY:
            case AuditEventType.ACCOUNT_LOCKOUT:
                return AuditSeverity.CRITICAL;
            case AuditEventType.LOGIN_FAILURE:
            case AuditEventType.PERMISSION_DENIED:
                return AuditSeverity.ERROR;
            case AuditEventType.SESSION_EXPIRED:
            case AuditEventType.OAUTH_FLOW_FAILURE:
                return AuditSeverity.WARNING;
            default:
                return AuditSeverity.INFO;
        }
    };
    SecurityAuditLogger.prototype.assessRiskLevel = function (type, details) {
        if (type === AuditEventType.SUSPICIOUS_ACTIVITY) {
            return details.riskLevel || RiskLevel.HIGH;
        }
        if (type === AuditEventType.LOGIN_FAILURE && details.failureType === 'brute_force') {
            return RiskLevel.HIGH;
        }
        if (type === AuditEventType.PERMISSION_DENIED) {
            return RiskLevel.MEDIUM;
        }
        return RiskLevel.LOW;
    };
    SecurityAuditLogger.prototype.determineOutcome = function (type, details) {
        if (type.includes('SUCCESS') || type === AuditEventType.LOGIN_SUCCESS) {
            return 'success';
        }
        if (type.includes('FAILURE') || type === AuditEventType.LOGIN_FAILURE) {
            return 'failure';
        }
        return 'pending';
    };
    SecurityAuditLogger.prototype.getClientIP = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // In production, get real IP from server
                    return [2 /*return*/, 'client_ip'];
                }
                catch (_b) {
                    return [2 /*return*/, 'unknown'];
                }
                return [2 /*return*/];
            });
        });
    };
    SecurityAuditLogger.prototype.getUserAgent = function () {
        return navigator.userAgent.substring(0, 255);
    };
    SecurityAuditLogger.prototype.generateDeviceFingerprint = function () {
        return __awaiter(this, void 0, void 0, function () {
            var canvas, ctx, fingerprint;
            return __generator(this, function (_a) {
                try {
                    canvas = document.createElement('canvas');
                    ctx = canvas.getContext('2d');
                    ctx === null || ctx === void 0 ? void 0 : ctx.fillText('fingerprint', 10, 10);
                    fingerprint = [
                        navigator.userAgent,
                        navigator.language,
                        screen.width + 'x' + screen.height,
                        new Date().getTimezoneOffset(),
                        canvas.toDataURL()
                    ].join('|');
                    // Simple hash (use crypto in production)
                    return [2 /*return*/, btoa(fingerprint).substring(0, 32)];
                }
                catch (_b) {
                    return [2 /*return*/, 'unknown'];
                }
                return [2 /*return*/];
            });
        });
    };
    SecurityAuditLogger.prototype.getLocationInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // In production, get location from IP geolocation service
                    return [2 /*return*/, { country: 'BR', city: 'Unknown' }];
                }
                catch (_b) {
                    return [2 /*return*/, undefined];
                }
                return [2 /*return*/];
            });
        });
    };
    SecurityAuditLogger.prototype.getStoredEvents = function () {
        try {
            var stored = localStorage.getItem('security_audit_events');
            return stored ? JSON.parse(stored) : [];
        }
        catch (_a) {
            return [];
        }
    };
    SecurityAuditLogger.prototype.getRecentEvents = function (minutesBack) {
        var cutoff = Date.now() - (minutesBack * 60 * 1000);
        return this.getStoredEvents().filter(function (event) { return event.timestamp > cutoff; });
    };
    SecurityAuditLogger.prototype.categorizeFailure = function (reason) {
        if (reason.includes('password'))
            return 'invalid_credentials';
        if (reason.includes('oauth'))
            return 'oauth_failure';
        if (reason.includes('blocked'))
            return 'account_blocked';
        if (reason.includes('rate'))
            return 'rate_limited';
        return 'unknown';
    };
    SecurityAuditLogger.prototype.calculateSessionDuration = function (sessionId) {
        var events = this.getStoredEvents();
        var createdEvent = events.find(function (e) {
            return e.sessionId === sessionId && e.type === AuditEventType.SESSION_CREATED;
        });
        return createdEvent ? Date.now() - createdEvent.timestamp : 0;
    };
    SecurityAuditLogger.prototype.getRequiredRole = function (resource, action) {
        // In production, get from permissions system
        return 'admin';
    };
    SecurityAuditLogger.prototype.calculateRiskDistribution = function (events) {
        var _a;
        var distribution = (_a = {},
            _a[RiskLevel.LOW] = 0,
            _a[RiskLevel.MEDIUM] = 0,
            _a[RiskLevel.HIGH] = 0,
            _a[RiskLevel.CRITICAL] = 0,
            _a);
        events.forEach(function (event) {
            distribution[event.riskLevel]++;
        });
        return distribution;
    };
    SecurityAuditLogger.prototype.getEmptyMetrics = function (hoursBack) {
        var _a;
        return {
            totalEvents: 0,
            successfulLogins: 0,
            failedLogins: 0,
            suspiciousActivities: 0,
            accountLockouts: 0,
            uniqueUsers: 0,
            uniqueIPs: 0,
            riskDistribution: (_a = {},
                _a[RiskLevel.LOW] = 0,
                _a[RiskLevel.MEDIUM] = 0,
                _a[RiskLevel.HIGH] = 0,
                _a[RiskLevel.CRITICAL] = 0,
                _a),
            timeRangeHours: hoursBack
        };
    };
    SecurityAuditLogger.prototype.getSuspiciousPatterns = function (hoursBack) {
        return __awaiter(this, void 0, void 0, function () {
            var events;
            return __generator(this, function (_a) {
                events = this.getRecentEvents(hoursBack * 60);
                return [2 /*return*/, events
                        .filter(function (e) { return e.type === AuditEventType.SUSPICIOUS_ACTIVITY; })
                        .map(function (e) { return ({
                        pattern: e.details.pattern,
                        description: e.details.description,
                        riskLevel: e.details.riskLevel,
                        occurrences: e.details.occurrences,
                        affectedUsers: e.details.affectedUsers,
                        timeframe: {
                            start: e.timestamp,
                            end: e.timestamp
                        }
                    }); })];
            });
        });
    };
    SecurityAuditLogger.prototype.generateRecommendations = function (metrics, patterns) {
        var recommendations = [];
        if (metrics.failedLogins > metrics.successfulLogins * 0.1) {
            recommendations.push('Alto número de logins falhados detectado. Considere implementar CAPTCHA.');
        }
        if (patterns.some(function (p) { return p.riskLevel === RiskLevel.HIGH; })) {
            recommendations.push('Atividades suspeitas detectadas. Revise logs de segurança.');
        }
        if (metrics.uniqueIPs > metrics.uniqueUsers * 2) {
            recommendations.push('Múltiplos IPs por usuário. Considere autenticação de dois fatores.');
        }
        return recommendations;
    };
    SecurityAuditLogger.prototype.sendSecurityAlert = function (pattern) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.warn('ALERTA DE SEGURANÇA:', pattern);
                return [2 /*return*/];
            });
        });
    };
    SecurityAuditLogger.prototype.sendToMonitoringService = function (events) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // Send to monitoring service (Sentry, DataDog, etc.)
                    console.log('Sending events to monitoring:', events.length);
                }
                catch (error) {
                    console.error('Failed to send events to monitoring:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    return SecurityAuditLogger;
}());
// Export singleton instance
var createsecurityAuditLogger = function () { return new SecurityAuditLogger(); };
exports.createsecurityAuditLogger = createsecurityAuditLogger;
// Export convenience functions
function logAuthEvent(type, details, userId, sessionId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, securityAuditLogger.logEvent(type, details, userId, sessionId)];
        });
    });
}
function getSecurityMetrics(hoursBack) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, securityAuditLogger.getSecurityMetrics(hoursBack)];
        });
    });
}
function getSecurityReport(hoursBack) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, securityAuditLogger.getSecurityReport(hoursBack)];
        });
    });
}
