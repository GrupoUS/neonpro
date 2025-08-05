"use strict";
// Security Middleware
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
exports.createSecurityMiddleware = createSecurityMiddleware;
exports.getMonitoringStats = getMonitoringStats;
exports.clearBlockedIP = clearBlockedIP;
exports.blockIP = blockIP;
var server_1 = require("next/server");
var utils_1 = require("../utils");
// Default security configuration
var DEFAULT_SECURITY_CONFIG = {
    enableThreatDetection: true,
    enableAnomalyDetection: true,
    enableRealTimeMonitoring: true,
    blockHighRiskRequests: true,
    logAllEvents: true,
    alertThresholds: {
        high: 70,
        critical: 90,
    },
    rateLimits: {
        requests: 1000,
        timeWindow: 3600000, // 1 hour
    },
};
// Threat patterns
var THREAT_PATTERNS = {
    sqlInjection: [
        /('|(\-\-)|(;)|(\||\|)|(\*|\*))/i,
        /(union|select|insert|delete|update|drop|create|alter|exec|execute)/i,
    ],
    xss: [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
    ],
    pathTraversal: [
        /\.\.[\/\\]/g,
        /\.\.%2f/gi,
        /\.\.%5c/gi,
    ],
    commandInjection: [
        /[;&|`$(){}\[\]]/g,
        /(cat|ls|pwd|whoami|id|uname)/gi,
    ],
};
// Request analysis cache
var requestAnalysisCache = new Map();
// Real-time monitoring data
var monitoringData = {
    activeRequests: new Map(),
    suspiciousIPs: new Set(),
    blockedIPs: new Set(),
    alertCounts: new Map(),
};
/**
 * Security Middleware Factory
 */
function createSecurityMiddleware(config) {
    if (config === void 0) { config = {}; }
    var finalConfig = __assign(__assign({}, DEFAULT_SECURITY_CONFIG), config);
    return function securityMiddleware(request, securityMonitor, sessionManager) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, clientIP, userAgent, requestId, threatAnalysis, _a, anomalyAnalysis, rateLimitCheck, sessionSecurityCheck, response, error_1;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 18, , 20]);
                        startTime = Date.now();
                        clientIP = getClientIP(request);
                        userAgent = request.headers.get('user-agent') || '';
                        requestId = utils_1.AuthUtils.Crypto.generateSecureId();
                        if (!monitoringData.blockedIPs.has(clientIP)) return [3 /*break*/, 2];
                        return [4 /*yield*/, logSecurityEvent({
                                type: 'blocked_ip_access_attempt',
                                severity: 'high',
                                clientIP: clientIP,
                                userAgent: userAgent,
                                requestId: requestId,
                                details: {
                                    path: request.nextUrl.pathname,
                                    method: request.method,
                                },
                            }, securityMonitor)];
                    case 1:
                        _d.sent();
                        return [2 /*return*/, new server_1.NextResponse('Access denied', { status: 403 })];
                    case 2:
                        // Real-time monitoring
                        if (finalConfig.enableRealTimeMonitoring) {
                            trackActiveRequest(clientIP);
                        }
                        if (!finalConfig.enableThreatDetection) return [3 /*break*/, 8];
                        return [4 /*yield*/, analyzeThreatPatterns(request)];
                    case 3:
                        threatAnalysis = _d.sent();
                        if (!(threatAnalysis.riskScore >= finalConfig.alertThresholds.critical)) return [3 /*break*/, 6];
                        // Block critical threats immediately
                        monitoringData.blockedIPs.add(clientIP);
                        _a = logSecurityEvent;
                        _b = {
                            type: 'critical_threat_detected',
                            severity: 'critical',
                            clientIP: clientIP,
                            userAgent: userAgent,
                            requestId: requestId
                        };
                        _c = {
                            riskScore: threatAnalysis.riskScore,
                            threats: threatAnalysis.threats,
                            path: request.nextUrl.pathname,
                            method: request.method
                        };
                        return [4 /*yield*/, getRequestPayload(request)];
                    case 4: return [4 /*yield*/, _a.apply(void 0, [(_b.details = (_c.payload = _d.sent(),
                                _c),
                                _b), securityMonitor])];
                    case 5:
                        _d.sent();
                        return [2 /*return*/, new server_1.NextResponse('Security threat detected', { status: 403 })];
                    case 6:
                        if (!(threatAnalysis.riskScore >= finalConfig.alertThresholds.high)) return [3 /*break*/, 8];
                        // Log high-risk requests
                        monitoringData.suspiciousIPs.add(clientIP);
                        return [4 /*yield*/, logSecurityEvent({
                                type: 'high_risk_request',
                                severity: 'high',
                                clientIP: clientIP,
                                userAgent: userAgent,
                                requestId: requestId,
                                details: {
                                    riskScore: threatAnalysis.riskScore,
                                    threats: threatAnalysis.threats,
                                    path: request.nextUrl.pathname,
                                    method: request.method,
                                },
                            }, securityMonitor)];
                    case 7:
                        _d.sent();
                        _d.label = 8;
                    case 8:
                        if (!finalConfig.enableAnomalyDetection) return [3 /*break*/, 11];
                        return [4 /*yield*/, detectAnomalies(request, clientIP)];
                    case 9:
                        anomalyAnalysis = _d.sent();
                        if (!anomalyAnalysis.suspicious) return [3 /*break*/, 11];
                        return [4 /*yield*/, logSecurityEvent({
                                type: 'anomaly_detected',
                                severity: 'medium',
                                clientIP: clientIP,
                                userAgent: userAgent,
                                requestId: requestId,
                                details: {
                                    anomalies: anomalyAnalysis.anomalies,
                                    confidence: anomalyAnalysis.confidence,
                                    path: request.nextUrl.pathname,
                                    method: request.method,
                                },
                            }, securityMonitor)];
                    case 10:
                        _d.sent();
                        _d.label = 11;
                    case 11:
                        rateLimitCheck = checkAdvancedRateLimit(clientIP, finalConfig.rateLimits);
                        if (!!rateLimitCheck.allowed) return [3 /*break*/, 13];
                        return [4 /*yield*/, logSecurityEvent({
                                type: 'advanced_rate_limit_exceeded',
                                severity: 'medium',
                                clientIP: clientIP,
                                userAgent: userAgent,
                                requestId: requestId,
                                details: {
                                    requestCount: rateLimitCheck.count,
                                    timeWindow: finalConfig.rateLimits.timeWindow,
                                    limit: finalConfig.rateLimits.requests,
                                },
                            }, securityMonitor)];
                    case 12:
                        _d.sent();
                        return [2 /*return*/, new server_1.NextResponse('Rate limit exceeded', {
                                status: 429,
                                headers: {
                                    'Retry-After': '3600',
                                    'X-RateLimit-Limit': finalConfig.rateLimits.requests.toString(),
                                    'X-RateLimit-Remaining': '0',
                                },
                            })];
                    case 13:
                        if (!sessionManager) return [3 /*break*/, 15];
                        return [4 /*yield*/, validateSessionSecurity(request, sessionManager, securityMonitor)];
                    case 14:
                        sessionSecurityCheck = _d.sent();
                        if (!sessionSecurityCheck.valid) {
                            return [2 /*return*/, new server_1.NextResponse(sessionSecurityCheck.reason, {
                                    status: sessionSecurityCheck.statusCode,
                                })];
                        }
                        _d.label = 15;
                    case 15:
                        response = server_1.NextResponse.next();
                        addSecurityHeaders(response, requestId);
                        if (!finalConfig.logAllEvents) return [3 /*break*/, 17];
                        return [4 /*yield*/, logSecurityEvent({
                                type: 'security_check_passed',
                                severity: 'low',
                                clientIP: clientIP,
                                userAgent: userAgent,
                                requestId: requestId,
                                details: {
                                    path: request.nextUrl.pathname,
                                    method: request.method,
                                    processingTime: Date.now() - startTime,
                                },
                            }, securityMonitor)];
                    case 16:
                        _d.sent();
                        _d.label = 17;
                    case 17: return [2 /*return*/, response];
                    case 18:
                        error_1 = _d.sent();
                        console.error('Security middleware error:', error_1);
                        return [4 /*yield*/, logSecurityEvent({
                                type: 'security_middleware_error',
                                severity: 'high',
                                clientIP: getClientIP(request),
                                userAgent: request.headers.get('user-agent') || '',
                                details: {
                                    error: error_1 instanceof Error ? error_1.message : 'Unknown error',
                                    path: request.nextUrl.pathname,
                                },
                            }, securityMonitor).catch(function () { })];
                    case 19:
                        _d.sent();
                        return [2 /*return*/, new server_1.NextResponse('Security check failed', { status: 500 })];
                    case 20: return [2 /*return*/];
                }
            });
        });
    };
}
/**
 * Analyze threat patterns in request
 */
function analyzeThreatPatterns(request) {
    return __awaiter(this, void 0, void 0, function () {
        var threats, riskScore, url, pathname, searchParams, _i, _a, pattern, _b, _c, pattern, _d, _e, pattern, _f, _g, pattern, body, _h, _j, _k, threatType, patterns, _l, patterns_1, pattern, error_2, suspiciousHeaders, _m, suspiciousHeaders_1, header, value;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    threats = [];
                    riskScore = 0;
                    url = request.nextUrl.toString();
                    pathname = request.nextUrl.pathname;
                    searchParams = request.nextUrl.searchParams.toString();
                    // Check for SQL injection patterns
                    for (_i = 0, _a = THREAT_PATTERNS.sqlInjection; _i < _a.length; _i++) {
                        pattern = _a[_i];
                        if (pattern.test(url) || pattern.test(searchParams)) {
                            threats.push('sql_injection');
                            riskScore += 30;
                            break;
                        }
                    }
                    // Check for XSS patterns
                    for (_b = 0, _c = THREAT_PATTERNS.xss; _b < _c.length; _b++) {
                        pattern = _c[_b];
                        if (pattern.test(url) || pattern.test(searchParams)) {
                            threats.push('xss');
                            riskScore += 25;
                            break;
                        }
                    }
                    // Check for path traversal
                    for (_d = 0, _e = THREAT_PATTERNS.pathTraversal; _d < _e.length; _d++) {
                        pattern = _e[_d];
                        if (pattern.test(pathname)) {
                            threats.push('path_traversal');
                            riskScore += 35;
                            break;
                        }
                    }
                    // Check for command injection
                    for (_f = 0, _g = THREAT_PATTERNS.commandInjection; _f < _g.length; _f++) {
                        pattern = _g[_f];
                        if (pattern.test(url) || pattern.test(searchParams)) {
                            threats.push('command_injection');
                            riskScore += 40;
                            break;
                        }
                    }
                    if (!(request.method === 'POST' || request.method === 'PUT')) return [3 /*break*/, 4];
                    _o.label = 1;
                case 1:
                    _o.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, getRequestPayload(request)];
                case 2:
                    body = _o.sent();
                    if (body) {
                        // Check body for threat patterns
                        for (_h = 0, _j = Object.entries(THREAT_PATTERNS); _h < _j.length; _h++) {
                            _k = _j[_h], threatType = _k[0], patterns = _k[1];
                            for (_l = 0, patterns_1 = patterns; _l < patterns_1.length; _l++) {
                                pattern = patterns_1[_l];
                                if (pattern.test(body)) {
                                    if (!threats.includes(threatType)) {
                                        threats.push(threatType);
                                        riskScore += 20;
                                    }
                                }
                            }
                        }
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _o.sent();
                    // Body parsing failed, might be suspicious
                    riskScore += 10;
                    return [3 /*break*/, 4];
                case 4:
                    suspiciousHeaders = [
                        'x-forwarded-for',
                        'x-real-ip',
                        'x-originating-ip',
                    ];
                    for (_m = 0, suspiciousHeaders_1 = suspiciousHeaders; _m < suspiciousHeaders_1.length; _m++) {
                        header = suspiciousHeaders_1[_m];
                        value = request.headers.get(header);
                        if (value && value.includes('..')) {
                            threats.push('header_manipulation');
                            riskScore += 15;
                        }
                    }
                    return [2 /*return*/, { riskScore: Math.min(riskScore, 100), threats: threats }];
            }
        });
    });
}
/**
 * Detect anomalies in request patterns
 */
function detectAnomalies(request, clientIP) {
    return __awaiter(this, void 0, void 0, function () {
        var anomalies, confidence, activeRequests, userAgent, commonHeaders, missingHeaders, now, hour, referer;
        return __generator(this, function (_a) {
            anomalies = [];
            confidence = 0;
            activeRequests = monitoringData.activeRequests.get(clientIP) || 0;
            if (activeRequests > 50) {
                anomalies.push('high_request_frequency');
                confidence += 30;
            }
            userAgent = request.headers.get('user-agent') || '';
            if (!userAgent || userAgent.length < 10) {
                anomalies.push('suspicious_user_agent');
                confidence += 20;
            }
            commonHeaders = ['accept', 'accept-language', 'accept-encoding'];
            missingHeaders = commonHeaders.filter(function (header) { return !request.headers.get(header); });
            if (missingHeaders.length > 1) {
                anomalies.push('missing_common_headers');
                confidence += 15;
            }
            now = Date.now();
            hour = new Date(now).getHours();
            if (hour >= 2 && hour <= 5) {
                anomalies.push('unusual_time_access');
                confidence += 10;
            }
            referer = request.headers.get('referer');
            if (referer && !referer.includes(request.nextUrl.hostname)) {
                anomalies.push('external_referer');
                confidence += 25;
            }
            return [2 /*return*/, {
                    suspicious: confidence >= 40,
                    anomalies: anomalies,
                    confidence: confidence,
                }];
        });
    });
}
/**
 * Advanced rate limiting with sliding window
 */
function checkAdvancedRateLimit(clientIP, limits) {
    var now = Date.now();
    var key = "rate_limit_advanced:".concat(clientIP);
    // Get or create request log
    var requestLog = requestAnalysisCache.get(key);
    if (!requestLog || requestLog.timestamp + limits.timeWindow < now) {
        requestLog = { riskScore: 0, threats: [], timestamp: now };
        requestAnalysisCache.set(key, requestLog);
    }
    // Simple counter for this implementation
    var currentCount = monitoringData.activeRequests.get(clientIP) || 0;
    return {
        allowed: currentCount < limits.requests,
        count: currentCount,
    };
}
/**
 * Validate session security
 */
function validateSessionSecurity(request, sessionManager, securityMonitor) {
    return __awaiter(this, void 0, void 0, function () {
        var sessionToken, session, clientIP, userAgent, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sessionToken = extractSessionToken(request);
                    if (!sessionToken) {
                        return [2 /*return*/, { valid: true }]; // No session to validate
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, sessionManager.getSession(sessionToken)];
                case 2:
                    session = _a.sent();
                    if (!session) {
                        return [2 /*return*/, {
                                valid: false,
                                reason: 'Invalid session',
                                statusCode: 401,
                            }];
                    }
                    clientIP = getClientIP(request);
                    userAgent = request.headers.get('user-agent') || '';
                    if (!(session.ip_address && session.ip_address !== clientIP)) return [3 /*break*/, 4];
                    return [4 /*yield*/, logSecurityEvent({
                            type: 'session_ip_mismatch',
                            severity: 'high',
                            userId: session.user_id,
                            sessionId: session.id,
                            clientIP: clientIP,
                            userAgent: userAgent,
                            details: {
                                originalIP: session.ip_address,
                                currentIP: clientIP,
                            },
                        }, securityMonitor)];
                case 3:
                    _a.sent();
                    return [2 /*return*/, {
                            valid: false,
                            reason: 'Session security violation',
                            statusCode: 403,
                        }];
                case 4:
                    if (!(session.user_agent && session.user_agent !== userAgent)) return [3 /*break*/, 6];
                    return [4 /*yield*/, logSecurityEvent({
                            type: 'session_user_agent_mismatch',
                            severity: 'medium',
                            userId: session.user_id,
                            sessionId: session.id,
                            clientIP: clientIP,
                            userAgent: userAgent,
                            details: {
                                originalUserAgent: session.user_agent,
                                currentUserAgent: userAgent,
                            },
                        }, securityMonitor)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [2 /*return*/, { valid: true }];
                case 7:
                    error_3 = _a.sent();
                    console.error('Session security validation failed:', error_3);
                    return [2 /*return*/, {
                            valid: false,
                            reason: 'Session validation failed',
                            statusCode: 500,
                        }];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Track active requests
 */
function trackActiveRequest(clientIP) {
    var current = monitoringData.activeRequests.get(clientIP) || 0;
    monitoringData.activeRequests.set(clientIP, current + 1);
    // Clean up after 1 minute
    setTimeout(function () {
        var updated = monitoringData.activeRequests.get(clientIP) || 0;
        if (updated > 0) {
            monitoringData.activeRequests.set(clientIP, updated - 1);
        }
    }, 60000);
}
/**
 * Add security headers to response
 */
function addSecurityHeaders(response, requestId) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-Request-ID', requestId);
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
}
/**
 * Extract client IP address
 */
function getClientIP(request) {
    var forwarded = request.headers.get('x-forwarded-for');
    var realIP = request.headers.get('x-real-ip');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return realIP || 'unknown';
}
/**
 * Extract session token from request
 */
function extractSessionToken(request) {
    var authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    var sessionCookie = request.cookies.get('session_token');
    if (sessionCookie) {
        return sessionCookie.value;
    }
    return null;
}
/**
 * Get request payload safely
 */
function getRequestPayload(request) {
    return __awaiter(this, void 0, void 0, function () {
        var contentType, json, formData, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    contentType = request.headers.get('content-type') || '';
                    if (!contentType.includes('application/json')) return [3 /*break*/, 2];
                    return [4 /*yield*/, request.json()];
                case 1:
                    json = _a.sent();
                    return [2 /*return*/, JSON.stringify(json)];
                case 2:
                    if (!contentType.includes('application/x-www-form-urlencoded')) return [3 /*break*/, 4];
                    return [4 /*yield*/, request.formData()];
                case 3:
                    formData = _a.sent();
                    return [2 /*return*/, Array.from(formData.entries())
                            .map(function (_a) {
                            var key = _a[0], value = _a[1];
                            return "".concat(key, "=").concat(value);
                        })
                            .join('&')];
                case 4:
                    if (!contentType.includes('text/')) return [3 /*break*/, 6];
                    return [4 /*yield*/, request.text()];
                case 5: return [2 /*return*/, _a.sent()];
                case 6: return [2 /*return*/, null];
                case 7:
                    error_4 = _a.sent();
                    return [2 /*return*/, null];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Log security event
 */
function logSecurityEvent(event, securityMonitor) {
    return __awaiter(this, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, securityMonitor.logSecurityEvent(__assign({ id: utils_1.AuthUtils.Crypto.generateSecureId(), timestamp: new Date() }, event))];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    console.error('Failed to log security event:', error_5);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get monitoring statistics
 */
function getMonitoringStats() {
    return {
        activeRequests: Array.from(monitoringData.activeRequests.values())
            .reduce(function (sum, count) { return sum + count; }, 0),
        suspiciousIPs: monitoringData.suspiciousIPs.size,
        blockedIPs: monitoringData.blockedIPs.size,
        totalAlerts: Array.from(monitoringData.alertCounts.values())
            .reduce(function (sum, count) { return sum + count; }, 0),
    };
}
/**
 * Clear blocked IP
 */
function clearBlockedIP(ip) {
    monitoringData.blockedIPs.delete(ip);
    monitoringData.suspiciousIPs.delete(ip);
}
/**
 * Block IP manually
 */
function blockIP(ip) {
    monitoringData.blockedIPs.add(ip);
}
