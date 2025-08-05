"use strict";
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
var globals_1 = require("@jest/globals");
var session_manager_1 = require("@/lib/auth/session-manager");
var security_audit_framework_1 = require("@/lib/auth/security-audit-framework");
// Mock Supabase client
globals_1.jest.mock('@/app/utils/supabase/server', function () { return ({
    createServerClient: globals_1.jest.fn(function () { return ({
        auth: {
            getSession: globals_1.jest.fn(function () { return ({
                data: {
                    session: {
                        user: { id: 'test-user-id' },
                        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                    }
                }
            }); }),
            refreshSession: globals_1.jest.fn(function () { return ({ error: null }); }),
        },
        from: globals_1.jest.fn(function () { return ({
            select: globals_1.jest.fn(function () { return ({
                eq: globals_1.jest.fn(function () { return ({
                    eq: globals_1.jest.fn(function () { return ({
                        gte: globals_1.jest.fn(function () { return ({
                            data: [],
                            error: null
                        }); })
                    }); })
                }); })
            }); }),
            insert: globals_1.jest.fn(function () { return ({
                error: null
            }); }),
            update: globals_1.jest.fn(function () { return ({
                eq: globals_1.jest.fn(function () { return ({
                    error: null
                }); })
            }); }),
            single: globals_1.jest.fn(function () { return ({
                data: {
                    session_id: 'test-session-id',
                    user_id: 'test-user-id',
                    device_info: {
                        userAgent: 'test-agent',
                        ip: '127.0.0.1',
                        deviceType: 'desktop',
                        browser: 'chrome'
                    },
                    created_at: new Date().toISOString(),
                    last_activity: new Date().toISOString(),
                    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                    is_active: true,
                    risk_score: 0,
                },
                error: null
            }); })
        }); })
    }); })
}); });
// Mock performance tracker
globals_1.jest.mock('@/lib/auth/performance-tracker', function () { return ({
    performanceTracker: {
        recordMetric: globals_1.jest.fn(),
    }
}); });
(0, globals_1.describe)('TASK-002 Final Integration Tests - Advanced Authentication Features', function () {
    (0, globals_1.beforeEach)(function () {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.describe)('Advanced Session Management', function () {
        (0, globals_1.test)('should extend session when within threshold', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, session_manager_1.sessionManager.extendSessionIfNeeded('test-session-id')];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(typeof result).toBe('boolean');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should validate session security and detect risks', function () { return __awaiter(void 0, void 0, void 0, function () {
            var validation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, session_manager_1.sessionManager.validateSessionSecurity('test-session-id', {
                            userAgent: 'test-agent',
                            ip: '127.0.0.1',
                        })];
                    case 1:
                        validation = _a.sent();
                        (0, globals_1.expect)(validation).toHaveProperty('isValid');
                        (0, globals_1.expect)(validation).toHaveProperty('riskLevel');
                        (0, globals_1.expect)(['low', 'medium', 'high']).toContain(validation.riskLevel);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should manage concurrent sessions', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, globals_1.expect)(session_manager_1.sessionManager.manageConcurrentSessions('test-user-id', 'current-session-id')).resolves.not.toThrow()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should check reauth requirements for sensitive operations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var requiresReauth;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, session_manager_1.sessionManager.requiresReauth('test-session-id', 'change_password')];
                    case 1:
                        requiresReauth = _a.sent();
                        (0, globals_1.expect)(typeof requiresReauth).toBe('boolean');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should update session activity', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, globals_1.expect)(session_manager_1.sessionManager.updateSessionActivity('test-session-id', {
                            action: 'page_view',
                            resource: '/dashboard',
                            metadata: { page: 'home' }
                        })).resolves.not.toThrow()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('Security Audit Framework', function () {
        (0, globals_1.test)('should log security events successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, globals_1.expect)(security_audit_framework_1.securityAuditFramework.logSecurityEvent({
                            eventType: 'authentication',
                            severity: 'low',
                            userId: 'test-user-id',
                            sessionId: 'test-session-id',
                            resource: 'login',
                            action: 'test_login',
                            outcome: 'success',
                            metadata: { test: true },
                            ipAddress: '127.0.0.1',
                            userAgent: 'test-agent',
                        })).resolves.not.toThrow()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should generate compliance reports', function () { return __awaiter(void 0, void 0, void 0, function () {
            var period, report;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        period = {
                            start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
                            end: new Date(),
                        };
                        return [4 /*yield*/, security_audit_framework_1.securityAuditFramework.generateComplianceReport(period)];
                    case 1:
                        report = _a.sent();
                        (0, globals_1.expect)(report).toHaveProperty('period');
                        (0, globals_1.expect)(report).toHaveProperty('lgpdCompliance');
                        (0, globals_1.expect)(report).toHaveProperty('securityMetrics');
                        (0, globals_1.expect)(report).toHaveProperty('riskAssessment');
                        (0, globals_1.expect)(report.lgpdCompliance).toHaveProperty('dataAccessRequests');
                        (0, globals_1.expect)(report.lgpdCompliance).toHaveProperty('dataExportRequests');
                        (0, globals_1.expect)(report.lgpdCompliance).toHaveProperty('dataDeletionRequests');
                        (0, globals_1.expect)(report.securityMetrics).toHaveProperty('failedLoginAttempts');
                        (0, globals_1.expect)(report.securityMetrics).toHaveProperty('suspiciousActivities');
                        (0, globals_1.expect)(report.riskAssessment).toHaveProperty('overallRiskScore');
                        (0, globals_1.expect)(report.riskAssessment).toHaveProperty('recommendations');
                        (0, globals_1.expect)(Array.isArray(report.riskAssessment.recommendations)).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should handle different security event types', function () { return __awaiter(void 0, void 0, void 0, function () {
            var eventTypes, severities, outcomes, _i, eventTypes_1, eventType, _a, severities_1, severity, _b, outcomes_1, outcome;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        eventTypes = ['authentication', 'authorization', 'data_access', 'configuration', 'security_violation'];
                        severities = ['low', 'medium', 'high', 'critical'];
                        outcomes = ['success', 'failure', 'blocked'];
                        _i = 0, eventTypes_1 = eventTypes;
                        _c.label = 1;
                    case 1:
                        if (!(_i < eventTypes_1.length)) return [3 /*break*/, 8];
                        eventType = eventTypes_1[_i];
                        _a = 0, severities_1 = severities;
                        _c.label = 2;
                    case 2:
                        if (!(_a < severities_1.length)) return [3 /*break*/, 7];
                        severity = severities_1[_a];
                        _b = 0, outcomes_1 = outcomes;
                        _c.label = 3;
                    case 3:
                        if (!(_b < outcomes_1.length)) return [3 /*break*/, 6];
                        outcome = outcomes_1[_b];
                        return [4 /*yield*/, (0, globals_1.expect)(security_audit_framework_1.securityAuditFramework.logSecurityEvent({
                                eventType: eventType,
                                severity: severity,
                                userId: 'test-user-id',
                                resource: 'test-resource',
                                action: 'test-action',
                                outcome: outcome,
                                metadata: { eventType: eventType, severity: severity, outcome: outcome },
                                ipAddress: '127.0.0.1',
                                userAgent: 'test-agent',
                            })).resolves.not.toThrow()];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        _b++;
                        return [3 /*break*/, 3];
                    case 6:
                        _a++;
                        return [3 /*break*/, 2];
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('Integration Between Session Management and Security Audit', function () {
        (0, globals_1.test)('should integrate session validation with security logging', function () { return __awaiter(void 0, void 0, void 0, function () {
            var validation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, session_manager_1.sessionManager.validateSessionSecurity('test-session-id', {
                            userAgent: 'suspicious-agent',
                            ip: '192.168.1.100',
                        })];
                    case 1:
                        validation = _a.sent();
                        // Validate that security event would be logged appropriately
                        (0, globals_1.expect)(validation).toHaveProperty('isValid');
                        (0, globals_1.expect)(validation).toHaveProperty('riskLevel');
                        // Test security event logging for session validation
                        return [4 /*yield*/, (0, globals_1.expect)(security_audit_framework_1.securityAuditFramework.logSecurityEvent({
                                eventType: 'authentication',
                                severity: validation.riskLevel === 'high' ? 'high' : 'low',
                                userId: 'test-user-id',
                                sessionId: 'test-session-id',
                                resource: 'session',
                                action: 'security_validation',
                                outcome: validation.isValid ? 'success' : 'blocked',
                                metadata: { riskLevel: validation.riskLevel },
                                ipAddress: '192.168.1.100',
                                userAgent: 'suspicious-agent',
                            })).resolves.not.toThrow()];
                    case 2:
                        // Test security event logging for session validation
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should integrate session extension with audit logging', function () { return __awaiter(void 0, void 0, void 0, function () {
            var extended;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, session_manager_1.sessionManager.extendSessionIfNeeded('test-session-id')];
                    case 1:
                        extended = _a.sent();
                        // Test corresponding audit log
                        return [4 /*yield*/, (0, globals_1.expect)(security_audit_framework_1.securityAuditFramework.logSecurityEvent({
                                eventType: 'authentication',
                                severity: 'low',
                                userId: 'test-user-id',
                                sessionId: 'test-session-id',
                                resource: 'session',
                                action: 'extend_attempt',
                                outcome: extended ? 'success' : 'failure',
                                metadata: { extended: extended },
                                ipAddress: '127.0.0.1',
                                userAgent: 'test-agent',
                            })).resolves.not.toThrow()];
                    case 2:
                        // Test corresponding audit log
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('Performance and Quality Validation', function () {
        (0, globals_1.test)('should maintain performance targets', function () { return __awaiter(void 0, void 0, void 0, function () {
            var start, sessionTime, auditStart, auditTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        start = Date.now();
                        // Test session operations performance
                        return [4 /*yield*/, session_manager_1.sessionManager.extendSessionIfNeeded('test-session-id')];
                    case 1:
                        // Test session operations performance
                        _a.sent();
                        return [4 /*yield*/, session_manager_1.sessionManager.validateSessionSecurity('test-session-id', {
                                userAgent: 'test-agent',
                                ip: '127.0.0.1',
                            })];
                    case 2:
                        _a.sent();
                        sessionTime = Date.now() - start;
                        (0, globals_1.expect)(sessionTime).toBeLessThan(1000); // Should complete within 1 second
                        auditStart = Date.now();
                        // Test audit framework performance
                        return [4 /*yield*/, security_audit_framework_1.securityAuditFramework.logSecurityEvent({
                                eventType: 'authentication',
                                severity: 'low',
                                userId: 'test-user-id',
                                resource: 'test',
                                action: 'performance_test',
                                outcome: 'success',
                                metadata: {},
                                ipAddress: '127.0.0.1',
                                userAgent: 'test-agent',
                            })];
                    case 3:
                        // Test audit framework performance
                        _a.sent();
                        auditTime = Date.now() - auditStart;
                        (0, globals_1.expect)(auditTime).toBeLessThan(500); // Should complete within 500ms
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should handle error scenarios gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var validation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, session_manager_1.sessionManager.validateSessionSecurity('invalid-session', {
                            userAgent: 'test-agent',
                            ip: '127.0.0.1',
                        })];
                    case 1:
                        validation = _a.sent();
                        (0, globals_1.expect)(validation.isValid).toBe(false);
                        (0, globals_1.expect)(validation.riskLevel).toBe('high');
                        // Test with missing data
                        return [4 /*yield*/, (0, globals_1.expect)(session_manager_1.sessionManager.extendSessionIfNeeded('')).resolves.toBe(false)];
                    case 2:
                        // Test with missing data
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('LGPD Compliance Validation', function () {
        (0, globals_1.test)('should support LGPD data subject rights', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Test data access request logging
                    return [4 /*yield*/, (0, globals_1.expect)(security_audit_framework_1.securityAuditFramework.logSecurityEvent({
                            eventType: 'data_access',
                            severity: 'medium',
                            userId: 'test-user-id',
                            resource: 'personal_data',
                            action: 'data_access_request',
                            outcome: 'success',
                            metadata: {
                                dataType: 'personal_information',
                                requestType: 'access',
                                consentVerified: true
                            },
                            ipAddress: '127.0.0.1',
                            userAgent: 'test-agent',
                        })).resolves.not.toThrow()];
                    case 1:
                        // Test data access request logging
                        _a.sent();
                        // Test data export request
                        return [4 /*yield*/, (0, globals_1.expect)(security_audit_framework_1.securityAuditFramework.logSecurityEvent({
                                eventType: 'data_access',
                                severity: 'medium',
                                userId: 'test-user-id',
                                resource: 'personal_data',
                                action: 'data_export',
                                outcome: 'success',
                                metadata: {
                                    exportFormat: 'json',
                                    consentVerified: true,
                                    dataRetentionCompliance: true
                                },
                                ipAddress: '127.0.0.1',
                                userAgent: 'test-agent',
                            })).resolves.not.toThrow()];
                    case 2:
                        // Test data export request
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should generate LGPD compliance metrics', function () { return __awaiter(void 0, void 0, void 0, function () {
            var period, report;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        period = {
                            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                            end: new Date(),
                        };
                        return [4 /*yield*/, security_audit_framework_1.securityAuditFramework.generateComplianceReport(period)];
                    case 1:
                        report = _a.sent();
                        (0, globals_1.expect)(report.lgpdCompliance).toBeDefined();
                        (0, globals_1.expect)(typeof report.lgpdCompliance.dataAccessRequests).toBe('number');
                        (0, globals_1.expect)(typeof report.lgpdCompliance.dataExportRequests).toBe('number');
                        (0, globals_1.expect)(typeof report.lgpdCompliance.dataDeletionRequests).toBe('number');
                        (0, globals_1.expect)(typeof report.lgpdCompliance.consentUpdates).toBe('number');
                        (0, globals_1.expect)(typeof report.lgpdCompliance.breachNotifications).toBe('number');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
(0, globals_1.describe)('TASK-002 Completion Validation', function () {
    (0, globals_1.test)('should confirm all TASK-002 components are operational', function () { return __awaiter(void 0, void 0, void 0, function () {
        var components;
        return __generator(this, function (_a) {
            components = {
                sessionManager: session_manager_1.sessionManager,
                securityAuditFramework: security_audit_framework_1.securityAuditFramework,
            };
            (0, globals_1.expect)(components.sessionManager).toBeDefined();
            (0, globals_1.expect)(components.securityAuditFramework).toBeDefined();
            // Test that all main functions are callable
            (0, globals_1.expect)(typeof session_manager_1.sessionManager.extendSessionIfNeeded).toBe('function');
            (0, globals_1.expect)(typeof session_manager_1.sessionManager.validateSessionSecurity).toBe('function');
            (0, globals_1.expect)(typeof session_manager_1.sessionManager.manageConcurrentSessions).toBe('function');
            (0, globals_1.expect)(typeof session_manager_1.sessionManager.requiresReauth).toBe('function');
            (0, globals_1.expect)(typeof session_manager_1.sessionManager.updateSessionActivity).toBe('function');
            (0, globals_1.expect)(typeof security_audit_framework_1.securityAuditFramework.logSecurityEvent).toBe('function');
            (0, globals_1.expect)(typeof security_audit_framework_1.securityAuditFramework.generateComplianceReport).toBe('function');
            return [2 /*return*/];
        });
    }); });
    (0, globals_1.test)('should validate TASK-002 quality standards', function () { return __awaiter(void 0, void 0, void 0, function () {
        var period, report;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Test error handling
                return [4 /*yield*/, (0, globals_1.expect)(session_manager_1.sessionManager.validateSessionSecurity('', { userAgent: '', ip: '' })).resolves.toMatchObject({
                        isValid: false,
                        riskLevel: 'high'
                    })];
                case 1:
                    // Test error handling
                    _a.sent();
                    period = {
                        start: new Date('2025-01-01'),
                        end: new Date('2025-01-24'),
                    };
                    return [4 /*yield*/, security_audit_framework_1.securityAuditFramework.generateComplianceReport(period)];
                case 2:
                    report = _a.sent();
                    (0, globals_1.expect)(report.period.start).toEqual(period.start);
                    (0, globals_1.expect)(report.period.end).toEqual(period.end);
                    return [2 /*return*/];
            }
        });
    }); });
});
// Performance benchmark test
(0, globals_1.describe)('TASK-002 Performance Benchmarks', function () {
    (0, globals_1.test)('should meet authentication performance targets', function () { return __awaiter(void 0, void 0, void 0, function () {
        var iterations, times, i, start, averageTime, maxTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    iterations = 10;
                    times = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < iterations)) return [3 /*break*/, 6];
                    start = Date.now();
                    return [4 /*yield*/, session_manager_1.sessionManager.extendSessionIfNeeded('test-session-id')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, session_manager_1.sessionManager.validateSessionSecurity('test-session-id', {
                            userAgent: 'test-agent',
                            ip: '127.0.0.1',
                        })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, security_audit_framework_1.securityAuditFramework.logSecurityEvent({
                            eventType: 'authentication',
                            severity: 'low',
                            userId: 'test-user-id',
                            resource: 'benchmark',
                            action: 'performance_test',
                            outcome: 'success',
                            metadata: { iteration: i },
                            ipAddress: '127.0.0.1',
                            userAgent: 'test-agent',
                        })];
                case 4:
                    _a.sent();
                    times.push(Date.now() - start);
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 1];
                case 6:
                    averageTime = times.reduce(function (a, b) { return a + b; }, 0) / times.length;
                    maxTime = Math.max.apply(Math, times);
                    // Performance targets from TASK-002 requirements
                    (0, globals_1.expect)(averageTime).toBeLessThan(350); // Average should be under 350ms
                    (0, globals_1.expect)(maxTime).toBeLessThan(1000); // Max should be under 1 second
                    console.log("TASK-002 Performance Results:\n      Average: ".concat(averageTime.toFixed(2), "ms\n      Maximum: ").concat(maxTime, "ms\n      Target: <350ms average, <1000ms maximum\n      Status: ").concat(averageTime < 350 && maxTime < 1000 ? '✅ PASSED' : '❌ FAILED'));
                    return [2 /*return*/];
            }
        });
    }); });
});
