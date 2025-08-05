"use strict";
/**
 * Security Event Logger - Advanced Security Monitoring and Threat Detection
 *
 * Comprehensive security event logging, pattern analysis, and threat detection
 * for the NeonPro session management system.
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2024
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
exports.SecurityEventLogger = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var utils_1 = require("./utils");
/**
 * Security Event Logger Class
 *
 * Core security monitoring operations:
 * - Event logging and categorization
 * - Pattern analysis and anomaly detection
 * - Risk assessment and threat scoring
 * - Automated response triggers
 * - Security reporting and analytics
 */
var SecurityEventLogger = /** @class */ (function () {
    function SecurityEventLogger(config) {
        this.patternCache = new Map();
        this.riskScores = new Map();
        this.config = config;
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    }
    /**
     * Log a security event
     */
    SecurityEventLogger.prototype.logEvent = function (type, severity, userId, deviceId, details, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function () {
            var riskScore, threatLevel, eventId, eventData, _a, data, error, securityEvent, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        // Validate input
                        if (!(0, utils_1.validateUUID)(userId)) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: {
                                        code: 'INVALID_USER_ID',
                                        message: 'Invalid user ID format'
                                    },
                                    timestamp: new Date().toISOString()
                                }];
                        }
                        if (deviceId && !(0, utils_1.validateUUID)(deviceId)) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: {
                                        code: 'INVALID_DEVICE_ID',
                                        message: 'Invalid device ID format'
                                    },
                                    timestamp: new Date().toISOString()
                                }];
                        }
                        return [4 /*yield*/, this.calculateRiskScore(type, severity, userId, details)];
                    case 1:
                        riskScore = _b.sent();
                        threatLevel = this.determineThreatLevel(riskScore, severity);
                        eventId = crypto.randomUUID();
                        eventData = (0, utils_1.removeUndefined)({
                            id: eventId,
                            type: type,
                            severity: severity,
                            user_id: userId,
                            device_id: deviceId,
                            ip_address: ipAddress,
                            user_agent: userAgent,
                            details: details ? JSON.stringify(details) : null,
                            risk_score: riskScore,
                            threat_level: threatLevel,
                            resolved: false,
                            created_at: new Date().toISOString()
                        });
                        return [4 /*yield*/, this.supabase
                                .from('security_events')
                                .insert(eventData)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: {
                                        code: 'EVENT_LOG_FAILED',
                                        message: 'Failed to log security event',
                                        details: { error: error.message }
                                    },
                                    timestamp: new Date().toISOString()
                                }];
                        }
                        securityEvent = this.convertToSecurityEvent(data);
                        if (!(threatLevel === 'critical' || threatLevel === 'high')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.triggerAutomatedResponse(securityEvent)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: 
                    // Update pattern analysis
                    return [4 /*yield*/, this.updatePatternAnalysis(userId, type, severity)];
                    case 5:
                        // Update pattern analysis
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                data: securityEvent,
                                timestamp: new Date().toISOString()
                            }];
                    case 6:
                        error_1 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: {
                                    code: 'EVENT_LOG_ERROR',
                                    message: 'Error logging security event',
                                    details: { error: error_1 instanceof Error ? error_1.message : 'Unknown error' }
                                },
                                timestamp: new Date().toISOString()
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyze security patterns for a user
     */
    SecurityEventLogger.prototype.analyzePatterns = function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, timeWindow) {
            var startTime, _a, events, error, patterns, anomalies, riskAssessment, error_2;
            if (timeWindow === void 0) { timeWindow = 24; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!(0, utils_1.validateUUID)(userId)) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: {
                                        code: 'INVALID_USER_ID',
                                        message: 'Invalid user ID format'
                                    },
                                    timestamp: new Date().toISOString()
                                }];
                        }
                        startTime = new Date(Date.now() - timeWindow * 60 * 60 * 1000).toISOString();
                        return [4 /*yield*/, this.supabase
                                .from('security_events')
                                .select('*')
                                .eq('user_id', userId)
                                .gte('created_at', startTime)
                                .order('created_at', { ascending: false })];
                    case 1:
                        _a = _b.sent(), events = _a.data, error = _a.error;
                        if (error) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: {
                                        code: 'PATTERN_ANALYSIS_FAILED',
                                        message: 'Failed to analyze security patterns'
                                    },
                                    timestamp: new Date().toISOString()
                                }];
                        }
                        patterns = this.detectPatterns(events || []);
                        anomalies = this.detectAnomalies(events || []);
                        riskAssessment = this.assessUserRisk(userId, events || []);
                        // Cache patterns for future reference
                        this.patternCache.set(userId, patterns);
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    userId: userId,
                                    timeWindow: timeWindow,
                                    eventCount: (events === null || events === void 0 ? void 0 : events.length) || 0,
                                    patterns: patterns,
                                    anomalies: anomalies,
                                    riskAssessment: riskAssessment,
                                    analyzedAt: new Date().toISOString()
                                },
                                timestamp: new Date().toISOString()
                            }];
                    case 2:
                        error_2 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: {
                                    code: 'PATTERN_ANALYSIS_ERROR',
                                    message: 'Error analyzing security patterns',
                                    details: { error: error_2 instanceof Error ? error_2.message : 'Unknown error' }
                                },
                                timestamp: new Date().toISOString()
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get security events with filtering
     */
    SecurityEventLogger.prototype.getEvents = function (userId_1, type_1, severity_1, startDate_1, endDate_1) {
        return __awaiter(this, arguments, void 0, function (userId, type, severity, startDate, endDate, limit) {
            var query, _a, data, error, events, error_3;
            var _this = this;
            if (limit === void 0) { limit = 100; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('security_events')
                            .select('*');
                        if (userId) {
                            if (!(0, utils_1.validateUUID)(userId)) {
                                return [2 /*return*/, {
                                        success: false,
                                        error: {
                                            code: 'INVALID_USER_ID',
                                            message: 'Invalid user ID format'
                                        },
                                        timestamp: new Date().toISOString()
                                    }];
                            }
                            query = query.eq('user_id', userId);
                        }
                        if (type) {
                            query = query.eq('type', type);
                        }
                        if (severity) {
                            query = query.eq('severity', severity);
                        }
                        if (startDate) {
                            query = query.gte('created_at', startDate);
                        }
                        if (endDate) {
                            query = query.lte('created_at', endDate);
                        }
                        return [4 /*yield*/, query
                                .order('created_at', { ascending: false })
                                .limit(limit)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: {
                                        code: 'GET_EVENTS_FAILED',
                                        message: 'Failed to retrieve security events'
                                    },
                                    timestamp: new Date().toISOString()
                                }];
                        }
                        events = (data || []).map(function (row) { return _this.convertToSecurityEvent(row); });
                        return [2 /*return*/, {
                                success: true,
                                data: events,
                                timestamp: new Date().toISOString()
                            }];
                    case 2:
                        error_3 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: {
                                    code: 'GET_EVENTS_ERROR',
                                    message: 'Error retrieving security events',
                                    details: { error: error_3 instanceof Error ? error_3.message : 'Unknown error' }
                                },
                                timestamp: new Date().toISOString()
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Resolve a security event
     */
    SecurityEventLogger.prototype.resolveEvent = function (eventId, resolution, resolvedBy) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, securityEvent, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!(0, utils_1.validateUUID)(eventId)) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: {
                                        code: 'INVALID_EVENT_ID',
                                        message: 'Invalid event ID format'
                                    },
                                    timestamp: new Date().toISOString()
                                }];
                        }
                        return [4 /*yield*/, this.supabase
                                .from('security_events')
                                .update({
                                resolved: true,
                                resolution: resolution,
                                resolved_by: resolvedBy,
                                resolved_at: new Date().toISOString()
                            })
                                .eq('id', eventId)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error || !data) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: {
                                        code: 'EVENT_RESOLVE_FAILED',
                                        message: 'Failed to resolve security event'
                                    },
                                    timestamp: new Date().toISOString()
                                }];
                        }
                        securityEvent = this.convertToSecurityEvent(data);
                        return [2 /*return*/, {
                                success: true,
                                data: securityEvent,
                                timestamp: new Date().toISOString()
                            }];
                    case 2:
                        error_4 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: {
                                    code: 'EVENT_RESOLVE_ERROR',
                                    message: 'Error resolving security event',
                                    details: { error: error_4 instanceof Error ? error_4.message : 'Unknown error' }
                                },
                                timestamp: new Date().toISOString()
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate security report
     */
    SecurityEventLogger.prototype.generateSecurityReport = function (startDate, endDate, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, events, error, securityEvents, totalEvents, eventsBySeverity, eventsByType, threatLevelDistribution, topThreats, resolvedEvents, unresolvedEvents, averageRiskScore, trends, recommendations, error_5;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('security_events')
                            .select('*')
                            .gte('created_at', startDate)
                            .lte('created_at', endDate);
                        if (userId) {
                            query = query.eq('user_id', userId);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), events = _a.data, error = _a.error;
                        if (error) {
                            throw new Error("Failed to fetch events for report: ".concat(error.message));
                        }
                        securityEvents = (events || []).map(function (row) { return _this.convertToSecurityEvent(row); });
                        totalEvents = securityEvents.length;
                        eventsBySeverity = this.groupEventsBySeverity(securityEvents);
                        eventsByType = this.groupEventsByType(securityEvents);
                        threatLevelDistribution = this.getThreatLevelDistribution(securityEvents);
                        topThreats = this.getTopThreats(securityEvents);
                        resolvedEvents = securityEvents.filter(function (e) { return e.resolved; }).length;
                        unresolvedEvents = totalEvents - resolvedEvents;
                        averageRiskScore = this.calculateAverageRiskScore(securityEvents);
                        trends = this.identifySecurityTrends(securityEvents);
                        recommendations = this.generateSecurityRecommendations(securityEvents, trends);
                        return [2 /*return*/, {
                                reportId: crypto.randomUUID(),
                                startDate: startDate,
                                endDate: endDate,
                                userId: userId,
                                summary: {
                                    totalEvents: totalEvents,
                                    resolvedEvents: resolvedEvents,
                                    unresolvedEvents: unresolvedEvents,
                                    averageRiskScore: averageRiskScore,
                                    highestThreatLevel: this.getHighestThreatLevel(securityEvents)
                                },
                                eventsBySeverity: eventsBySeverity,
                                eventsByType: eventsByType,
                                threatLevelDistribution: threatLevelDistribution,
                                topThreats: topThreats,
                                trends: trends,
                                recommendations: recommendations,
                                generatedAt: new Date().toISOString()
                            }];
                    case 2:
                        error_5 = _b.sent();
                        throw new Error("Error generating security report: ".concat(error_5 instanceof Error ? error_5.message : 'Unknown error'));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clean up old security events
     */
    SecurityEventLogger.prototype.cleanupOldEvents = function () {
        return __awaiter(this, arguments, void 0, function (retentionDays) {
            var cutoffDate, _a, data, error, error_6;
            if (retentionDays === void 0) { retentionDays = 90; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        cutoffDate = new Date();
                        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
                        return [4 /*yield*/, this.supabase
                                .from('security_events')
                                .delete()
                                .lt('created_at', cutoffDate.toISOString())
                                .select('id')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: {
                                        code: 'EVENT_CLEANUP_FAILED',
                                        message: 'Failed to cleanup old security events'
                                    },
                                    timestamp: new Date().toISOString()
                                }];
                        }
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    deletedCount: (data === null || data === void 0 ? void 0 : data.length) || 0,
                                    cutoffDate: cutoffDate.toISOString(),
                                    cleanupDate: new Date().toISOString()
                                },
                                timestamp: new Date().toISOString()
                            }];
                    case 2:
                        error_6 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: {
                                    code: 'EVENT_CLEANUP_ERROR',
                                    message: 'Error cleaning up old security events',
                                    details: { error: error_6 instanceof Error ? error_6.message : 'Unknown error' }
                                },
                                timestamp: new Date().toISOString()
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check for security violations
     */
    SecurityEventLogger.prototype.checkSecurityViolations = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var violations, now, oneHour, oneDay, failedLogins, suspiciousActivity, concurrentSessions, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!(0, utils_1.validateUUID)(userId)) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: {
                                        code: 'INVALID_USER_ID',
                                        message: 'Invalid user ID format'
                                    },
                                    timestamp: new Date().toISOString()
                                }];
                        }
                        violations = [];
                        now = new Date();
                        oneHour = 60 * 60 * 1000;
                        oneDay = 24 * oneHour;
                        return [4 /*yield*/, this.getRecentEventCount(userId, 'login_failed', new Date(now.getTime() - oneHour).toISOString())];
                    case 1:
                        failedLogins = _a.sent();
                        if (failedLogins >= this.config.maxFailedLogins) {
                            violations.push({
                                type: 'excessive_failed_logins',
                                severity: 'high',
                                count: failedLogins,
                                threshold: this.config.maxFailedLogins,
                                timeWindow: '1 hour'
                            });
                        }
                        return [4 /*yield*/, this.getRecentEventCount(userId, 'suspicious_activity', new Date(now.getTime() - oneDay).toISOString())];
                    case 2:
                        suspiciousActivity = _a.sent();
                        if (suspiciousActivity >= this.config.maxSuspiciousActivity) {
                            violations.push({
                                type: 'excessive_suspicious_activity',
                                severity: 'medium',
                                count: suspiciousActivity,
                                threshold: this.config.maxSuspiciousActivity,
                                timeWindow: '24 hours'
                            });
                        }
                        return [4 /*yield*/, this.getRecentEventCount(userId, 'concurrent_session_violation', new Date(now.getTime() - oneHour).toISOString())];
                    case 3:
                        concurrentSessions = _a.sent();
                        if (concurrentSessions > 0) {
                            violations.push({
                                type: 'concurrent_session_violations',
                                severity: 'medium',
                                count: concurrentSessions,
                                threshold: 0,
                                timeWindow: '1 hour'
                            });
                        }
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    userId: userId,
                                    violations: violations,
                                    violationCount: violations.length,
                                    checkedAt: now.toISOString()
                                },
                                timestamp: new Date().toISOString()
                            }];
                    case 4:
                        error_7 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: {
                                    code: 'SECURITY_CHECK_ERROR',
                                    message: 'Error checking security violations',
                                    details: { error: error_7 instanceof Error ? error_7.message : 'Unknown error' }
                                },
                                timestamp: new Date().toISOString()
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Private helper methods
     */
    SecurityEventLogger.prototype.calculateRiskScore = function (type, severity, userId, details) {
        return __awaiter(this, void 0, void 0, function () {
            var baseScore, typeScores, severityMultipliers, userRiskScore, historicalFactor;
            return __generator(this, function (_a) {
                baseScore = 0;
                typeScores = {
                    'login_success': 1,
                    'login_failed': 3,
                    'logout': 1,
                    'session_created': 1,
                    'session_expired': 2,
                    'device_registered': 2,
                    'device_trusted': 1,
                    'device_blocked': 5,
                    'suspicious_activity': 4,
                    'concurrent_session_violation': 3,
                    'security_breach': 8,
                    'unauthorized_access': 7,
                    'data_access': 2,
                    'permission_escalation': 6,
                    'account_locked': 4,
                    'password_changed': 2,
                    'email_changed': 3,
                    'profile_updated': 1
                };
                baseScore = typeScores[type] || 1;
                severityMultipliers = {
                    'low': 1,
                    'medium': 1.5,
                    'high': 2.5,
                    'critical': 4
                };
                baseScore *= severityMultipliers[severity];
                userRiskScore = this.riskScores.get(userId) || 0;
                historicalFactor = Math.min(userRiskScore / 100, 2);
                baseScore *= (1 + historicalFactor);
                // Context-specific adjustments
                if (details) {
                    if (details.newLocation)
                        baseScore *= 1.3;
                    if (details.newDevice)
                        baseScore *= 1.2;
                    if (details.offHours)
                        baseScore *= 1.1;
                    if (details.vpnDetected)
                        baseScore *= 1.2;
                    if (details.torDetected)
                        baseScore *= 2.0;
                }
                return [2 /*return*/, Math.round(baseScore * 10) / 10]; // Round to 1 decimal
            });
        });
    };
    SecurityEventLogger.prototype.determineThreatLevel = function (riskScore, severity) {
        if (severity === 'critical' || riskScore >= 15)
            return 'critical';
        if (severity === 'high' || riskScore >= 10)
            return 'high';
        if (severity === 'medium' || riskScore >= 5)
            return 'medium';
        return 'low';
    };
    SecurityEventLogger.prototype.triggerAutomatedResponse = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Log automated response trigger
                        return [4 /*yield*/, this.logEvent('security_breach', 'high', event.userId, event.deviceId, {
                                triggeredBy: event.id,
                                originalEvent: event.type,
                                automatedResponse: true
                            })];
                    case 1:
                        // Log automated response trigger
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        console.error('Error triggering automated response:', error_8);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SecurityEventLogger.prototype.updatePatternAnalysis = function (userId, type, severity) {
        return __awaiter(this, void 0, void 0, function () {
            var currentScore, increment;
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    currentScore = this.riskScores.get(userId) || 0;
                    increment = severity === 'critical' ? 5 : severity === 'high' ? 3 : severity === 'medium' ? 2 : 1;
                    this.riskScores.set(userId, currentScore + increment);
                    // Decay risk scores over time (simple implementation)
                    setTimeout(function () {
                        var score = _this.riskScores.get(userId) || 0;
                        _this.riskScores.set(userId, Math.max(0, score - 1));
                    }, 24 * 60 * 60 * 1000); // 24 hours
                }
                catch (error) {
                    console.error('Error updating pattern analysis:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    SecurityEventLogger.prototype.detectPatterns = function (events) {
        var patterns = [];
        // Detect repeated failed logins
        var failedLogins = events.filter(function (e) { return e.type === 'login_failed'; });
        if (failedLogins.length >= 3) {
            patterns.push({
                type: 'repeated_failed_logins',
                severity: 'high',
                count: failedLogins.length,
                description: "".concat(failedLogins.length, " failed login attempts detected"),
                firstOccurrence: failedLogins[failedLogins.length - 1].created_at,
                lastOccurrence: failedLogins[0].created_at
            });
        }
        // Detect suspicious device registrations
        var deviceRegistrations = events.filter(function (e) { return e.type === 'device_registered'; });
        if (deviceRegistrations.length >= 3) {
            patterns.push({
                type: 'multiple_device_registrations',
                severity: 'medium',
                count: deviceRegistrations.length,
                description: "".concat(deviceRegistrations.length, " new devices registered"),
                firstOccurrence: deviceRegistrations[deviceRegistrations.length - 1].created_at,
                lastOccurrence: deviceRegistrations[0].created_at
            });
        }
        return patterns;
    };
    SecurityEventLogger.prototype.detectAnomalies = function (events) {
        var anomalies = [];
        // Detect unusual time patterns
        var offHoursEvents = events.filter(function (e) {
            var hour = new Date(e.created_at).getHours();
            return hour < 6 || hour > 22; // Outside 6 AM - 10 PM
        });
        if (offHoursEvents.length > events.length * 0.3) {
            anomalies.push({
                type: 'unusual_time_pattern',
                description: 'High percentage of activity outside normal hours',
                percentage: Math.round((offHoursEvents.length / events.length) * 100)
            });
        }
        return anomalies;
    };
    SecurityEventLogger.prototype.assessUserRisk = function (userId, events) {
        var riskFactors = [];
        var totalEvents = events.length;
        var highSeverityEvents = events.filter(function (e) { return e.severity === 'high' || e.severity === 'critical'; });
        var highSeverityRatio = totalEvents > 0 ? highSeverityEvents.length / totalEvents : 0;
        if (highSeverityRatio > 0.2) {
            riskFactors.push('High percentage of severe security events');
        }
        var failedLogins = events.filter(function (e) { return e.type === 'login_failed'; });
        if (failedLogins.length > 5) {
            riskFactors.push('Excessive failed login attempts');
        }
        var riskLevel = riskFactors.length === 0 ? 'low' :
            riskFactors.length <= 2 ? 'medium' : 'high';
        return {
            level: riskLevel,
            factors: riskFactors,
            score: this.riskScores.get(userId) || 0
        };
    };
    SecurityEventLogger.prototype.getRecentEventCount = function (userId, type, since) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('security_events')
                                .select('id', { count: 'exact' })
                                .eq('user_id', userId)
                                .eq('type', type)
                                .gte('created_at', since)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error getting recent event count:', error);
                            return [2 /*return*/, 0];
                        }
                        return [2 /*return*/, (data === null || data === void 0 ? void 0 : data.length) || 0];
                    case 2:
                        error_9 = _b.sent();
                        console.error('Error getting recent event count:', error_9);
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SecurityEventLogger.prototype.groupEventsBySeverity = function (events) {
        return events.reduce(function (acc, event) {
            acc[event.severity] = (acc[event.severity] || 0) + 1;
            return acc;
        }, {});
    };
    SecurityEventLogger.prototype.groupEventsByType = function (events) {
        return events.reduce(function (acc, event) {
            acc[event.type] = (acc[event.type] || 0) + 1;
            return acc;
        }, {});
    };
    SecurityEventLogger.prototype.getThreatLevelDistribution = function (events) {
        return events.reduce(function (acc, event) {
            acc[event.threatLevel] = (acc[event.threatLevel] || 0) + 1;
            return acc;
        }, {});
    };
    SecurityEventLogger.prototype.getTopThreats = function (events) {
        var _this = this;
        var threatCounts = this.groupEventsByType(events);
        return Object.entries(threatCounts)
            .map(function (_a) {
            var type = _a[0], count = _a[1];
            return ({
                type: type,
                count: count,
                severity: _this.getMostCommonSeverity(events.filter(function (e) { return e.type === type; }))
            });
        })
            .sort(function (a, b) { return b.count - a.count; })
            .slice(0, 5);
    };
    SecurityEventLogger.prototype.getMostCommonSeverity = function (events) {
        var _a;
        var severityCounts = this.groupEventsBySeverity(events);
        return ((_a = Object.entries(severityCounts)
            .sort(function (_a, _b) {
            var a = _a[1];
            var b = _b[1];
            return b - a;
        })[0]) === null || _a === void 0 ? void 0 : _a[0]) || 'low';
    };
    SecurityEventLogger.prototype.calculateAverageRiskScore = function (events) {
        if (events.length === 0)
            return 0;
        var total = events.reduce(function (sum, event) { return sum + event.riskScore; }, 0);
        return Math.round((total / events.length) * 10) / 10;
    };
    SecurityEventLogger.prototype.getHighestThreatLevel = function (events) {
        var levels = ['low', 'medium', 'high', 'critical'];
        var _loop_1 = function (i) {
            if (events.some(function (e) { return e.threatLevel === levels[i]; })) {
                return { value: levels[i] };
            }
        };
        for (var i = levels.length - 1; i >= 0; i--) {
            var state_1 = _loop_1(i);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return 'low';
    };
    SecurityEventLogger.prototype.identifySecurityTrends = function (events) {
        // Simple trend analysis - could be enhanced with more sophisticated algorithms
        var trends = [];
        var recentEvents = events.filter(function (e) {
            var eventDate = new Date(e.createdAt);
            var daysDiff = (Date.now() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysDiff <= 7;
        });
        var olderEvents = events.filter(function (e) {
            var eventDate = new Date(e.createdAt);
            var daysDiff = (Date.now() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysDiff > 7 && daysDiff <= 14;
        });
        var recentCount = recentEvents.length;
        var olderCount = olderEvents.length;
        if (recentCount > olderCount * 1.5) {
            trends.push({
                type: 'increasing_activity',
                description: 'Security events are increasing',
                change: "+".concat(Math.round(((recentCount - olderCount) / olderCount) * 100), "%")
            });
        }
        else if (recentCount < olderCount * 0.5) {
            trends.push({
                type: 'decreasing_activity',
                description: 'Security events are decreasing',
                change: "-".concat(Math.round(((olderCount - recentCount) / olderCount) * 100), "%")
            });
        }
        return trends;
    };
    SecurityEventLogger.prototype.generateSecurityRecommendations = function (events, trends) {
        var recommendations = [];
        var failedLogins = events.filter(function (e) { return e.type === 'login_failed'; }).length;
        if (failedLogins > 10) {
            recommendations.push('Consider implementing additional authentication factors');
            recommendations.push('Review and strengthen password policies');
        }
        var suspiciousActivity = events.filter(function (e) { return e.type === 'suspicious_activity'; }).length;
        if (suspiciousActivity > 5) {
            recommendations.push('Enhance device fingerprinting and detection');
            recommendations.push('Implement stricter device trust policies');
        }
        var increasingTrend = trends.find(function (t) { return t.type === 'increasing_activity'; });
        if (increasingTrend) {
            recommendations.push('Monitor security events more closely due to increasing activity');
            recommendations.push('Consider implementing automated response mechanisms');
        }
        if (recommendations.length === 0) {
            recommendations.push('Security posture appears stable - continue monitoring');
        }
        return recommendations;
    };
    SecurityEventLogger.prototype.convertToSecurityEvent = function (row) {
        return {
            id: row.id,
            type: row.type,
            severity: row.severity,
            userId: row.user_id,
            deviceId: row.device_id,
            ipAddress: row.ip_address,
            userAgent: row.user_agent,
            details: row.details ? JSON.parse(row.details) : undefined,
            riskScore: row.risk_score,
            threatLevel: row.threat_level,
            resolved: row.resolved,
            resolution: row.resolution,
            resolvedBy: row.resolved_by,
            resolvedAt: row.resolved_at,
            createdAt: row.created_at
        };
    };
    return SecurityEventLogger;
}());
exports.SecurityEventLogger = SecurityEventLogger;
exports.default = SecurityEventLogger;
