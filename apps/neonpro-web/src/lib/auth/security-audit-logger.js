"use strict";
/**
 * Security Audit Logger for OAuth and LGPD Compliance
 * Comprehensive logging system for security events and compliance requirements
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
exports.securityAuditLogger = void 0;
var client_1 = require("@/lib/supabase/client");
var performance_tracker_1 = require("./performance-tracker");
var SecurityAuditLogger = /** @class */ (function () {
    function SecurityAuditLogger() {
        this.eventQueue = [];
        this.batchSize = 50;
        this.flushInterval = 30000; // 30 seconds
        this.flushTimer = null;
        this.startBatchProcessor();
    }
    SecurityAuditLogger.getInstance = function () {
        if (!SecurityAuditLogger.instance) {
            SecurityAuditLogger.instance = new SecurityAuditLogger();
        }
        return SecurityAuditLogger.instance;
    };
    /**
     * Log a security event
     */
    SecurityAuditLogger.prototype.logSecurityEvent = function (eventType_1, description_1) {
        return __awaiter(this, arguments, void 0, function (eventType, description, metadata, options) {
            var eventId, timestamp, event;
            if (metadata === void 0) { metadata = {}; }
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        eventId = this.generateEventId();
                        timestamp = Date.now();
                        event = {
                            eventId: eventId,
                            eventType: eventType,
                            severity: options.severity || this.determineSeverity(eventType),
                            userId: options.userId,
                            sessionId: options.sessionId,
                            ipAddress: options.ipAddress || 'unknown',
                            userAgent: options.userAgent || 'unknown',
                            timestamp: timestamp,
                            description: description,
                            metadata: __assign(__assign({}, metadata), { source: 'oauth_system', version: '1.0.0' }),
                            complianceFlags: options.complianceFlags || this.determineComplianceFlags(eventType),
                        };
                        // Add to queue for batch processing
                        this.eventQueue.push(event);
                        if (!(event.severity === 'critical')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.flushEvents()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, eventId];
                }
            });
        });
    };
    /**
     * Log OAuth-specific events
     */
    SecurityAuditLogger.prototype.logOAuthEvent = function (operation_1, provider_1, success_1, userId_1, sessionId_1) {
        return __awaiter(this, arguments, void 0, function (operation, provider, success, userId, sessionId, metadata) {
            var eventType, description;
            if (metadata === void 0) { metadata = {}; }
            return __generator(this, function (_a) {
                eventType = success
                    ? operation === 'signin' || operation === 'signup'
                        ? 'authentication_success'
                        : operation === 'refresh'
                            ? 'oauth_token_refreshed'
                            : 'oauth_token_revoked'
                    : 'authentication_failure';
                description = "OAuth ".concat(operation, " ").concat(success ? 'successful' : 'failed', " for provider ").concat(provider);
                return [2 /*return*/, this.logSecurityEvent(eventType, description, __assign(__assign({}, metadata), { operation: operation, provider: provider, success: success }), {
                        userId: userId,
                        sessionId: sessionId,
                        severity: success ? 'info' : 'warning',
                        complianceFlags: ['lgpd_relevant', 'data_processing'],
                    })];
            });
        });
    };
    /**
     * Log LGPD compliance events
     */
    SecurityAuditLogger.prototype.logLGPDEvent = function (eventType_1, userId_1, complianceData_1) {
        return __awaiter(this, arguments, void 0, function (eventType, userId, complianceData, metadata) {
            var securityEventType, description;
            if (metadata === void 0) { metadata = {}; }
            return __generator(this, function (_a) {
                securityEventType = eventType === 'consent_given'
                    ? 'privacy_consent_given'
                    : eventType === 'consent_withdrawn'
                        ? 'privacy_consent_withdrawn'
                        : eventType === 'data_export'
                            ? 'data_export_requested'
                            : eventType === 'data_deletion'
                                ? 'data_deletion_requested'
                                : 'data_access';
                description = "LGPD ".concat(eventType.replace('_', ' '), " for user ").concat(userId);
                return [2 /*return*/, this.logSecurityEvent(securityEventType, description, __assign(__assign({}, metadata), { lgpd_compliance_data: complianceData, event_category: 'lgpd_compliance' }), {
                        userId: userId,
                        severity: 'info',
                        complianceFlags: ['lgpd_relevant', 'data_processing', 'consent_required'],
                    })];
            });
        });
    };
    /**
     * Log session management events
     */
    SecurityAuditLogger.prototype.logSessionEvent = function (eventType_1, sessionId_1, userId_1, reason_1) {
        return __awaiter(this, arguments, void 0, function (eventType, sessionId, userId, reason, metadata) {
            var securityEventType, description;
            if (metadata === void 0) { metadata = {}; }
            return __generator(this, function (_a) {
                securityEventType = eventType === 'created'
                    ? 'session_created'
                    : eventType === 'expired'
                        ? 'session_expired'
                        : eventType === 'terminated'
                            ? 'session_terminated'
                            : 'suspicious_activity';
                description = "Session ".concat(eventType).concat(reason ? ": ".concat(reason) : '');
                return [2 /*return*/, this.logSecurityEvent(securityEventType, description, __assign(__assign({}, metadata), { reason: reason, session_event_type: eventType }), {
                        userId: userId,
                        sessionId: sessionId,
                        severity: eventType === 'suspicious' ? 'warning' : 'info',
                        complianceFlags: ['lgpd_relevant'],
                    })];
            });
        });
    };
    /**
     * Log data access events
     */
    SecurityAuditLogger.prototype.logDataAccess = function (userId_1, resourceType_1, resourceId_1, operation_1, success_1) {
        return __awaiter(this, arguments, void 0, function (userId, resourceType, resourceId, operation, success, metadata) {
            var eventType, description;
            if (metadata === void 0) { metadata = {}; }
            return __generator(this, function (_a) {
                eventType = operation === 'read'
                    ? 'data_access'
                    : 'data_modification';
                description = "Data ".concat(operation, " ").concat(success ? 'successful' : 'failed', " for ").concat(resourceType, ":").concat(resourceId);
                return [2 /*return*/, this.logSecurityEvent(eventType, description, __assign(__assign({}, metadata), { resource_type: resourceType, resource_id: resourceId, operation: operation, success: success }), {
                        userId: userId,
                        severity: success ? 'info' : 'warning',
                        complianceFlags: ['lgpd_relevant', 'data_processing'],
                    })];
            });
        });
    };
    /**
     * Query audit logs
     */
    SecurityAuditLogger.prototype.queryAuditLogs = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, supabase, queryBuilder, _a, data, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = Date.now();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, (0, client_1.createClient)()];
                    case 2:
                        supabase = _b.sent();
                        queryBuilder = supabase
                            .from('security_audit_log')
                            .select('*')
                            .order('timestamp', { ascending: false });
                        // Apply filters
                        if (query.startDate) {
                            queryBuilder = queryBuilder.gte('timestamp', query.startDate.toISOString());
                        }
                        if (query.endDate) {
                            queryBuilder = queryBuilder.lte('timestamp', query.endDate.toISOString());
                        }
                        if (query.userId) {
                            queryBuilder = queryBuilder.eq('user_id', query.userId);
                        }
                        if (query.sessionId) {
                            queryBuilder = queryBuilder.eq('session_id', query.sessionId);
                        }
                        if (query.eventTypes && query.eventTypes.length > 0) {
                            queryBuilder = queryBuilder.in('event_type', query.eventTypes);
                        }
                        if (query.severity && query.severity.length > 0) {
                            queryBuilder = queryBuilder.in('severity', query.severity);
                        }
                        if (query.limit) {
                            queryBuilder = queryBuilder.limit(query.limit);
                        }
                        if (query.offset) {
                            queryBuilder = queryBuilder.range(query.offset, query.offset + (query.limit || 100) - 1);
                        }
                        return [4 /*yield*/, queryBuilder];
                    case 3:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Audit log query failed:', error);
                            return [2 /*return*/, []];
                        }
                        performance_tracker_1.performanceTracker.recordMetric('audit_log_query', Date.now() - startTime);
                        return [2 /*return*/, data || []];
                    case 4:
                        error_1 = _b.sent();
                        console.error('Audit log query error:', error_1);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate compliance report
     */
    SecurityAuditLogger.prototype.generateComplianceReport = function (startDate_1, endDate_1) {
        return __awaiter(this, arguments, void 0, function (startDate, endDate, complianceFlags) {
            var events, report;
            if (complianceFlags === void 0) { complianceFlags = ['lgpd_relevant']; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.queryAuditLogs({
                            startDate: startDate,
                            endDate: endDate,
                            complianceFlags: complianceFlags,
                        })];
                    case 1:
                        events = _a.sent();
                        report = {
                            period: {
                                start: startDate.toISOString(),
                                end: endDate.toISOString(),
                            },
                            total_events: events.length,
                            events_by_type: this.groupEventsByType(events),
                            events_by_severity: this.groupEventsBySeverity(events),
                            compliance_summary: this.generateComplianceSummary(events),
                            lgpd_specific: this.generateLGPDSummary(events),
                            recommendations: this.generateRecommendations(events),
                        };
                        // Log report generation
                        return [4 /*yield*/, this.logSecurityEvent('compliance_check', 'Compliance report generated', {
                                report_period: report.period,
                                total_events: report.total_events,
                                compliance_flags: complianceFlags,
                            }, {
                                severity: 'info',
                                complianceFlags: ['lgpd_relevant'],
                            })];
                    case 2:
                        // Log report generation
                        _a.sent();
                        return [2 /*return*/, report];
                }
            });
        });
    };
    /**
     * Private helper methods
     */
    SecurityAuditLogger.prototype.generateEventId = function () {
        return "evt_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    };
    SecurityAuditLogger.prototype.determineSeverity = function (eventType) {
        var criticalEvents = [
            'security_violation',
            'suspicious_activity',
        ];
        var warningEvents = [
            'authentication_failure',
            'permission_denied',
            'session_expired',
        ];
        if (criticalEvents.includes(eventType))
            return 'critical';
        if (warningEvents.includes(eventType))
            return 'warning';
        return 'info';
    };
    SecurityAuditLogger.prototype.determineComplianceFlags = function (eventType) {
        var flags = [];
        // LGPD relevant events
        var lgpdEvents = [
            'authentication_success',
            'authentication_failure',
            'data_access',
            'data_modification',
            'privacy_consent_given',
            'privacy_consent_withdrawn',
            'data_export_requested',
            'data_deletion_requested',
        ];
        if (lgpdEvents.includes(eventType)) {
            flags.push('lgpd_relevant', 'data_processing');
        }
        // Consent-related events
        var consentEvents = [
            'privacy_consent_given',
            'privacy_consent_withdrawn',
        ];
        if (consentEvents.includes(eventType)) {
            flags.push('consent_required');
        }
        return flags;
    };
    SecurityAuditLogger.prototype.startBatchProcessor = function () {
        var _this = this;
        this.flushTimer = setInterval(function () {
            if (_this.eventQueue.length > 0) {
                _this.flushEvents();
            }
        }, this.flushInterval);
    };
    SecurityAuditLogger.prototype.flushEvents = function () {
        return __awaiter(this, void 0, void 0, function () {
            var eventsToFlush, supabase, error, error_2;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.eventQueue.length === 0)
                            return [2 /*return*/];
                        eventsToFlush = this.eventQueue.splice(0, this.batchSize);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, (0, client_1.createClient)()];
                    case 2:
                        supabase = _c.sent();
                        return [4 /*yield*/, supabase
                                .from('security_audit_log')
                                .insert(eventsToFlush.map(function (event) { return ({
                                event_id: event.eventId,
                                event_type: event.eventType,
                                severity: event.severity,
                                user_id: event.userId,
                                session_id: event.sessionId,
                                ip_address: event.ipAddress,
                                user_agent: event.userAgent,
                                timestamp: new Date(event.timestamp).toISOString(),
                                description: event.description,
                                metadata: event.metadata,
                                compliance_flags: event.complianceFlags,
                            }); }))];
                    case 3:
                        error = (_c.sent()).error;
                        if (error) {
                            console.error('Audit log batch insert failed:', error);
                            // Re-add events to queue for retry
                            (_a = this.eventQueue).unshift.apply(_a, eventsToFlush);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _c.sent();
                        console.error('Audit log flush error:', error_2);
                        // Re-add events to queue for retry
                        (_b = this.eventQueue).unshift.apply(_b, eventsToFlush);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SecurityAuditLogger.prototype.groupEventsByType = function (events) {
        return events.reduce(function (acc, event) {
            acc[event.event_type] = (acc[event.event_type] || 0) + 1;
            return acc;
        }, {});
    };
    SecurityAuditLogger.prototype.groupEventsBySeverity = function (events) {
        return events.reduce(function (acc, event) {
            acc[event.severity] = (acc[event.severity] || 0) + 1;
            return acc;
        }, {});
    };
    SecurityAuditLogger.prototype.generateComplianceSummary = function (events) {
        var lgpdEvents = events.filter(function (e) {
            return e.compliance_flags && e.compliance_flags.includes('lgpd_relevant');
        });
        return {
            total_compliance_events: lgpdEvents.length,
            data_processing_events: events.filter(function (e) {
                return e.compliance_flags && e.compliance_flags.includes('data_processing');
            }).length,
            consent_events: events.filter(function (e) {
                return e.compliance_flags && e.compliance_flags.includes('consent_required');
            }).length,
        };
    };
    SecurityAuditLogger.prototype.generateLGPDSummary = function (events) {
        var lgpdEvents = events.filter(function (e) {
            return e.compliance_flags && e.compliance_flags.includes('lgpd_relevant');
        });
        return {
            total_lgpd_events: lgpdEvents.length,
            consent_given: events.filter(function (e) { return e.event_type === 'privacy_consent_given'; }).length,
            consent_withdrawn: events.filter(function (e) { return e.event_type === 'privacy_consent_withdrawn'; }).length,
            data_exports: events.filter(function (e) { return e.event_type === 'data_export_requested'; }).length,
            data_deletions: events.filter(function (e) { return e.event_type === 'data_deletion_requested'; }).length,
        };
    };
    SecurityAuditLogger.prototype.generateRecommendations = function (events) {
        var recommendations = [];
        var criticalEvents = events.filter(function (e) { return e.severity === 'critical'; });
        if (criticalEvents.length > 0) {
            recommendations.push('Investigate critical security events immediately');
        }
        var failedAuth = events.filter(function (e) { return e.event_type === 'authentication_failure'; });
        if (failedAuth.length > 10) {
            recommendations.push('High number of authentication failures detected - consider implementing additional security measures');
        }
        var suspiciousActivity = events.filter(function (e) { return e.event_type === 'suspicious_activity'; });
        if (suspiciousActivity.length > 0) {
            recommendations.push('Suspicious activity detected - review and investigate');
        }
        return recommendations;
    };
    /**
     * Cleanup method
     */
    SecurityAuditLogger.prototype.destroy = function () {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
        // Flush remaining events
        if (this.eventQueue.length > 0) {
            this.flushEvents();
        }
    };
    return SecurityAuditLogger;
}());
exports.securityAuditLogger = SecurityAuditLogger.getInstance();
