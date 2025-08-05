"use strict";
// 🔐 Sistema de Autenticação e Segurança Avançado
// Story 1.4: Session Management & Security Implementation
// Main entry point for the authentication system
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
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
exports.SYSTEM_INFO = exports.performHealthCheck = exports.AuthUtils = exports.AuthSystemPresets = exports.initializeAuthSystem = exports.DEFAULT_SYSTEM_CONFIG = exports.AUTH_SYSTEM_NAME = exports.AUTH_SYSTEM_VERSION = exports.runTestSuite = exports.setupTestEnvironment = exports.TEST_CONFIG = exports.IntegrationTestUtils = exports.PerformanceTestUtils = exports.TestUtils = exports.SUCCESS_MESSAGES = exports.ERROR_MESSAGES = exports.STATUS_CODES = exports.HTTP_METHODS = exports.API_ROUTE_PATTERNS = exports.addSecurityHeaders = exports.parseQueryParams = exports.validateRequestBody = exports.createSuccessResponse = exports.createErrorResponse = exports.apiExtractSessionToken = exports.apiExtractClientIP = exports.createAuthAPIRoutes = exports.createDeviceRoutes = exports.createSecurityRoutes = exports.createSessionRoutes = exports.DEVELOPMENT_CONFIG = exports.DEFAULT_CONFIG = exports.HIGH_SECURITY_CONFIG = exports.isPublicRoute = exports.isStaticRoute = exports.isAPIRoute = exports.extractSessionToken = exports.extractClientIP = exports.createCombinedMiddleware = exports.createSecurityMiddleware = exports.createAuthMiddleware = exports.SessionMetricsComponent = exports.DeviceManagerComponent = exports.SecurityAlerts = exports.SessionStatus = exports.DeviceManager = exports.SecurityMonitor = exports.SessionManager = void 0;
// Core modules
__exportStar(require("./core"), exports);
var core_1 = require("./core");
Object.defineProperty(exports, "SessionManager", { enumerable: true, get: function () { return core_1.SessionManager; } });
Object.defineProperty(exports, "SecurityMonitor", { enumerable: true, get: function () { return core_1.SecurityMonitor; } });
Object.defineProperty(exports, "DeviceManager", { enumerable: true, get: function () { return core_1.DeviceManager; } });
// React components
__exportStar(require("./components"), exports);
var components_1 = require("./components");
Object.defineProperty(exports, "SessionStatus", { enumerable: true, get: function () { return components_1.SessionStatus; } });
Object.defineProperty(exports, "SecurityAlerts", { enumerable: true, get: function () { return components_1.SecurityAlerts; } });
Object.defineProperty(exports, "DeviceManagerComponent", { enumerable: true, get: function () { return components_1.DeviceManager; } });
Object.defineProperty(exports, "SessionMetricsComponent", { enumerable: true, get: function () { return components_1.SessionMetrics; } });
// Middlewares
__exportStar(require("./middleware"), exports);
var middleware_1 = require("./middleware");
Object.defineProperty(exports, "createAuthMiddleware", { enumerable: true, get: function () { return middleware_1.createAuthMiddleware; } });
Object.defineProperty(exports, "createSecurityMiddleware", { enumerable: true, get: function () { return middleware_1.createSecurityMiddleware; } });
Object.defineProperty(exports, "createCombinedMiddleware", { enumerable: true, get: function () { return middleware_1.createCombinedMiddleware; } });
Object.defineProperty(exports, "extractClientIP", { enumerable: true, get: function () { return middleware_1.extractClientIP; } });
Object.defineProperty(exports, "extractSessionToken", { enumerable: true, get: function () { return middleware_1.extractSessionToken; } });
Object.defineProperty(exports, "isAPIRoute", { enumerable: true, get: function () { return middleware_1.isAPIRoute; } });
Object.defineProperty(exports, "isStaticRoute", { enumerable: true, get: function () { return middleware_1.isStaticRoute; } });
Object.defineProperty(exports, "isPublicRoute", { enumerable: true, get: function () { return middleware_1.isPublicRoute; } });
Object.defineProperty(exports, "HIGH_SECURITY_CONFIG", { enumerable: true, get: function () { return middleware_1.HIGH_SECURITY_CONFIG; } });
Object.defineProperty(exports, "DEFAULT_CONFIG", { enumerable: true, get: function () { return middleware_1.DEFAULT_CONFIG; } });
Object.defineProperty(exports, "DEVELOPMENT_CONFIG", { enumerable: true, get: function () { return middleware_1.DEVELOPMENT_CONFIG; } });
// API routes
__exportStar(require("./api"), exports);
var api_1 = require("./api");
Object.defineProperty(exports, "createSessionRoutes", { enumerable: true, get: function () { return api_1.createSessionRoutes; } });
Object.defineProperty(exports, "createSecurityRoutes", { enumerable: true, get: function () { return api_1.createSecurityRoutes; } });
Object.defineProperty(exports, "createDeviceRoutes", { enumerable: true, get: function () { return api_1.createDeviceRoutes; } });
Object.defineProperty(exports, "createAuthAPIRoutes", { enumerable: true, get: function () { return api_1.createAuthAPIRoutes; } });
Object.defineProperty(exports, "apiExtractClientIP", { enumerable: true, get: function () { return api_1.extractClientIP; } });
Object.defineProperty(exports, "apiExtractSessionToken", { enumerable: true, get: function () { return api_1.extractSessionToken; } });
Object.defineProperty(exports, "createErrorResponse", { enumerable: true, get: function () { return api_1.createErrorResponse; } });
Object.defineProperty(exports, "createSuccessResponse", { enumerable: true, get: function () { return api_1.createSuccessResponse; } });
Object.defineProperty(exports, "validateRequestBody", { enumerable: true, get: function () { return api_1.validateRequestBody; } });
Object.defineProperty(exports, "parseQueryParams", { enumerable: true, get: function () { return api_1.parseQueryParams; } });
Object.defineProperty(exports, "addSecurityHeaders", { enumerable: true, get: function () { return api_1.addSecurityHeaders; } });
Object.defineProperty(exports, "API_ROUTE_PATTERNS", { enumerable: true, get: function () { return api_1.API_ROUTE_PATTERNS; } });
Object.defineProperty(exports, "HTTP_METHODS", { enumerable: true, get: function () { return api_1.HTTP_METHODS; } });
Object.defineProperty(exports, "STATUS_CODES", { enumerable: true, get: function () { return api_1.STATUS_CODES; } });
Object.defineProperty(exports, "ERROR_MESSAGES", { enumerable: true, get: function () { return api_1.ERROR_MESSAGES; } });
Object.defineProperty(exports, "SUCCESS_MESSAGES", { enumerable: true, get: function () { return api_1.SUCCESS_MESSAGES; } });
// Test utilities (for development and testing)
var tests_1 = require("./tests");
Object.defineProperty(exports, "TestUtils", { enumerable: true, get: function () { return tests_1.TestUtils; } });
Object.defineProperty(exports, "PerformanceTestUtils", { enumerable: true, get: function () { return tests_1.PerformanceTestUtils; } });
Object.defineProperty(exports, "IntegrationTestUtils", { enumerable: true, get: function () { return tests_1.IntegrationTestUtils; } });
Object.defineProperty(exports, "TEST_CONFIG", { enumerable: true, get: function () { return tests_1.TEST_CONFIG; } });
Object.defineProperty(exports, "setupTestEnvironment", { enumerable: true, get: function () { return tests_1.setupTestEnvironment; } });
Object.defineProperty(exports, "runTestSuite", { enumerable: true, get: function () { return tests_1.runTestSuite; } });
// System configuration and utilities
exports.AUTH_SYSTEM_VERSION = '1.4.0';
exports.AUTH_SYSTEM_NAME = 'NeonPro Advanced Authentication & Security System';
/**
 * Default system configuration
 */
exports.DEFAULT_SYSTEM_CONFIG = {
    // Session configuration
    session: {
        maxSessions: 5,
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        extendThreshold: 5 * 60 * 1000, // 5 minutes
        heartbeatInterval: 60 * 1000, // 1 minute
        requireMFA: false,
        requireTrustedDevice: false,
        allowConcurrentSessions: true,
        trackLocation: true,
        logSecurityEvents: true,
        enableRateLimiting: true,
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes
    },
    // Security configuration
    security: {
        enableRealTimeMonitoring: true,
        threatDetectionLevel: 'medium',
        maxFailedAttempts: 5,
        lockoutDuration: 15 * 60 * 1000,
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
            windowMs: 15 * 60 * 1000,
            maxRequests: 100,
            blockDuration: 60 * 60 * 1000,
        },
    },
    // Device configuration
    device: {
        enableFingerprinting: true,
        trustScoreThreshold: 0.7,
        maxDevicesPerUser: 10,
        deviceExpirationDays: 90,
        requireDeviceVerification: false,
        enableLocationTracking: true,
        enableBehaviorAnalysis: true,
    },
};
/**
 * System initialization function
 */
var initializeAuthSystem = function (config) {
    var finalConfig = __assign(__assign(__assign({}, exports.DEFAULT_SYSTEM_CONFIG), config), { session: __assign(__assign({}, exports.DEFAULT_SYSTEM_CONFIG.session), config === null || config === void 0 ? void 0 : config.session), security: __assign(__assign({}, exports.DEFAULT_SYSTEM_CONFIG.security), config === null || config === void 0 ? void 0 : config.security), device: __assign(__assign({}, exports.DEFAULT_SYSTEM_CONFIG.device), config === null || config === void 0 ? void 0 : config.device) });
    // Initialize security monitor first
    var securityMonitor = new SecurityMonitor(finalConfig.security);
    // Initialize session manager with security monitor
    var sessionManager = new SessionManager(finalConfig.session, securityMonitor);
    // Initialize device manager
    var deviceManager = new DeviceManager(finalConfig.device);
    return {
        sessionManager: sessionManager,
        securityMonitor: securityMonitor,
        deviceManager: deviceManager,
        config: finalConfig,
        version: exports.AUTH_SYSTEM_VERSION,
        name: exports.AUTH_SYSTEM_NAME,
    };
};
exports.initializeAuthSystem = initializeAuthSystem;
/**
 * Quick setup for common use cases
 */
exports.AuthSystemPresets = {
    /**
     * High security preset for production environments
     */
    highSecurity: function () { return (0, exports.initializeAuthSystem)({
        session: {
            maxSessions: 3,
            sessionTimeout: 15 * 60 * 1000, // 15 minutes
            requireMFA: true,
            requireTrustedDevice: true,
            allowConcurrentSessions: false,
            maxLoginAttempts: 3,
            lockoutDuration: 30 * 60 * 1000, // 30 minutes
        },
        security: {
            threatDetectionLevel: 'high',
            maxFailedAttempts: 3,
            suspiciousActivityThreshold: 5,
            autoBlockThreshold: 5,
            rateLimitConfig: {
                windowMs: 15 * 60 * 1000,
                maxRequests: 50,
                blockDuration: 2 * 60 * 60 * 1000, // 2 hours
            },
        },
        device: {
            trustScoreThreshold: 0.8,
            maxDevicesPerUser: 5,
            requireDeviceVerification: true,
        },
    }); },
    /**
     * Standard preset for most applications
     */
    standard: function () { return (0, exports.initializeAuthSystem)(); },
    /**
     * Development preset with relaxed security
     */
    development: function () { return (0, exports.initializeAuthSystem)({
        session: {
            sessionTimeout: 60 * 60 * 1000, // 1 hour
            requireMFA: false,
            requireTrustedDevice: false,
            maxLoginAttempts: 10,
            lockoutDuration: 5 * 60 * 1000, // 5 minutes
        },
        security: {
            threatDetectionLevel: 'low',
            maxFailedAttempts: 10,
            suspiciousActivityThreshold: 20,
            autoBlockThreshold: 20,
            rateLimitConfig: {
                windowMs: 15 * 60 * 1000,
                maxRequests: 200,
                blockDuration: 10 * 60 * 1000, // 10 minutes
            },
        },
        device: {
            trustScoreThreshold: 0.5,
            maxDevicesPerUser: 20,
            requireDeviceVerification: false,
        },
    }); },
    /**
     * Enterprise preset with advanced features
     */
    enterprise: function () { return (0, exports.initializeAuthSystem)({
        session: {
            maxSessions: 10,
            sessionTimeout: 45 * 60 * 1000, // 45 minutes
            requireMFA: true,
            requireTrustedDevice: true,
            allowConcurrentSessions: true,
            maxLoginAttempts: 5,
            lockoutDuration: 20 * 60 * 1000, // 20 minutes
        },
        security: {
            threatDetectionLevel: 'critical',
            maxFailedAttempts: 3,
            suspiciousActivityThreshold: 3,
            autoBlockThreshold: 3,
            enableRealTimeMonitoring: true,
            enableGeolocationTracking: true,
            enableDeviceFingerprinting: true,
            rateLimitConfig: {
                windowMs: 10 * 60 * 1000,
                maxRequests: 30,
                blockDuration: 4 * 60 * 60 * 1000, // 4 hours
            },
        },
        device: {
            trustScoreThreshold: 0.9,
            maxDevicesPerUser: 3,
            requireDeviceVerification: true,
            enableBehaviorAnalysis: true,
        },
    }); },
};
/**
 * Utility functions for common operations
 */
exports.AuthUtils = {
    /**
     * Generate secure session ID
     */
    generateSessionId: function () {
        return crypto.randomUUID ? crypto.randomUUID() :
            Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
    },
    /**
     * Generate device fingerprint
     */
    generateDeviceFingerprint: function (userAgent, additionalData) {
        var data = __assign(__assign({ userAgent: userAgent }, additionalData), { timestamp: Date.now() });
        // Simple hash function for fingerprinting
        var hash = 0;
        var str = JSON.stringify(data);
        for (var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    },
    /**
     * Calculate risk score based on various factors
     */
    calculateRiskScore: function (factors) {
        var score = 0;
        if (factors.isNewDevice)
            score += 0.3;
        if (factors.isNewLocation)
            score += 0.4;
        if (factors.failedAttempts)
            score += Math.min(factors.failedAttempts * 0.1, 0.5);
        // Time-based risk (higher risk during unusual hours)
        if (factors.timeOfDay !== undefined) {
            if (factors.timeOfDay < 6 || factors.timeOfDay > 22)
                score += 0.1;
        }
        // Weekend access might be unusual for business apps
        if (factors.dayOfWeek !== undefined) {
            if (factors.dayOfWeek === 0 || factors.dayOfWeek === 6)
                score += 0.05;
        }
        return Math.min(score, 1); // Cap at 1.0
    },
    /**
     * Validate session token format
     */
    isValidSessionToken: function (token) {
        return typeof token === 'string' && token.length > 10;
    },
    /**
     * Extract IP address from various sources
     */
    extractIPAddress: function (request) {
        var _a, _b, _c, _d, _e;
        return ((_b = (_a = request.headers) === null || _a === void 0 ? void 0 : _a['x-forwarded-for']) === null || _b === void 0 ? void 0 : _b.split(',')[0]) ||
            ((_c = request.headers) === null || _c === void 0 ? void 0 : _c['x-real-ip']) ||
            ((_d = request.connection) === null || _d === void 0 ? void 0 : _d.remoteAddress) ||
            ((_e = request.socket) === null || _e === void 0 ? void 0 : _e.remoteAddress) ||
            '127.0.0.1';
    },
    /**
     * Format duration in human-readable format
     */
    formatDuration: function (ms) {
        var seconds = Math.floor(ms / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        var days = Math.floor(hours / 24);
        if (days > 0)
            return "".concat(days, "d ").concat(hours % 24, "h");
        if (hours > 0)
            return "".concat(hours, "h ").concat(minutes % 60, "m");
        if (minutes > 0)
            return "".concat(minutes, "m ").concat(seconds % 60, "s");
        return "".concat(seconds, "s");
    },
};
/**
 * System health check
 */
var performHealthCheck = function (authSystem) { return __awaiter(void 0, void 0, void 0, function () {
    var results, sessionMetrics, error_1, securityMetrics, error_2, deviceAnalytics, error_3, healthyChecks;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                results = {
                    timestamp: new Date().toISOString(),
                    version: exports.AUTH_SYSTEM_VERSION,
                    status: 'healthy',
                    checks: {
                        sessionManager: false,
                        securityMonitor: false,
                        deviceManager: false,
                    },
                    metrics: {
                        activeSessions: 0,
                        securityEvents: 0,
                        registeredDevices: 0,
                    },
                    errors: [],
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, authSystem.sessionManager.getMetrics()];
            case 2:
                sessionMetrics = _a.sent();
                results.checks.sessionManager = true;
                results.metrics.activeSessions = sessionMetrics.activeSessions;
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                results.errors.push("SessionManager: ".concat(error_1));
                return [3 /*break*/, 4];
            case 4:
                _a.trys.push([4, 6, , 7]);
                return [4 /*yield*/, authSystem.securityMonitor.getMetrics()];
            case 5:
                securityMetrics = _a.sent();
                results.checks.securityMonitor = true;
                results.metrics.securityEvents = securityMetrics.totalEvents;
                return [3 /*break*/, 7];
            case 6:
                error_2 = _a.sent();
                results.errors.push("SecurityMonitor: ".concat(error_2));
                return [3 /*break*/, 7];
            case 7:
                _a.trys.push([7, 9, , 10]);
                return [4 /*yield*/, authSystem.deviceManager.getAnalytics()];
            case 8:
                deviceAnalytics = _a.sent();
                results.checks.deviceManager = true;
                results.metrics.registeredDevices = deviceAnalytics.totalDevices;
                return [3 /*break*/, 10];
            case 9:
                error_3 = _a.sent();
                results.errors.push("DeviceManager: ".concat(error_3));
                return [3 /*break*/, 10];
            case 10:
                healthyChecks = Object.values(results.checks).filter(Boolean).length;
                if (healthyChecks === 3) {
                    results.status = 'healthy';
                }
                else if (healthyChecks >= 2) {
                    results.status = 'degraded';
                }
                else {
                    results.status = 'unhealthy';
                }
                return [2 /*return*/, results];
        }
    });
}); };
exports.performHealthCheck = performHealthCheck;
// Export system information
exports.SYSTEM_INFO = {
    name: exports.AUTH_SYSTEM_NAME,
    version: exports.AUTH_SYSTEM_VERSION,
    description: 'Advanced authentication and security system for modern web applications',
    features: [
        'Session Management',
        'Real-time Security Monitoring',
        'Device Management & Fingerprinting',
        'Threat Detection & Prevention',
        'Rate Limiting & DDoS Protection',
        'Multi-factor Authentication Support',
        'Geolocation Tracking',
        'Behavioral Analysis',
        'Comprehensive Logging & Metrics',
        'React Components',
        'API Routes',
        'Middleware Integration',
    ],
    author: 'NeonPro Development Team',
    license: 'MIT',
    repository: 'https://github.com/neonpro/auth-system',
    documentation: 'https://docs.neonpro.dev/auth',
};
// Default export for convenience
exports.default = {
    initializeAuthSystem: exports.initializeAuthSystem,
    AuthSystemPresets: exports.AuthSystemPresets,
    AuthUtils: exports.AuthUtils,
    performHealthCheck: exports.performHealthCheck,
    SYSTEM_INFO: exports.SYSTEM_INFO,
    DEFAULT_SYSTEM_CONFIG: exports.DEFAULT_SYSTEM_CONFIG,
    AUTH_SYSTEM_VERSION: exports.AUTH_SYSTEM_VERSION,
    AUTH_SYSTEM_NAME: exports.AUTH_SYSTEM_NAME,
};
