"use strict";
// Auth Middleware Export
// Story 1.4: Session Management & Security Implementation
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
exports.MiddlewarePresets = exports.MiddlewareUtils = exports.blockIP = exports.clearBlockedIP = exports.getMonitoringStats = exports.createSecurityMiddleware = exports.clearSuspiciousActivity = exports.recordSuspiciousActivity = exports.createAuthMiddleware = void 0;
exports.createCombinedMiddleware = createCombinedMiddleware;
// Authentication Middleware
var auth_middleware_1 = require("./auth-middleware");
Object.defineProperty(exports, "createAuthMiddleware", { enumerable: true, get: function () { return auth_middleware_1.createAuthMiddleware; } });
Object.defineProperty(exports, "recordSuspiciousActivity", { enumerable: true, get: function () { return auth_middleware_1.recordSuspiciousActivity; } });
Object.defineProperty(exports, "clearSuspiciousActivity", { enumerable: true, get: function () { return auth_middleware_1.clearSuspiciousActivity; } });
// Security Middleware
var security_middleware_1 = require("./security-middleware");
Object.defineProperty(exports, "createSecurityMiddleware", { enumerable: true, get: function () { return security_middleware_1.createSecurityMiddleware; } });
Object.defineProperty(exports, "getMonitoringStats", { enumerable: true, get: function () { return security_middleware_1.getMonitoringStats; } });
Object.defineProperty(exports, "clearBlockedIP", { enumerable: true, get: function () { return security_middleware_1.clearBlockedIP; } });
Object.defineProperty(exports, "blockIP", { enumerable: true, get: function () { return security_middleware_1.blockIP; } });
// Combined Middleware Factory
var server_1 = require("next/server");
var auth_middleware_2 = require("./auth-middleware");
var security_middleware_2 = require("./security-middleware");
/**
 * Create combined authentication and security middleware
 */
function createCombinedMiddleware(sessionManager, securityMonitor, deviceManager, config) {
    if (config === void 0) { config = {}; }
    var _a = config.auth, authConfig = _a === void 0 ? {} : _a, _b = config.security, securityConfig = _b === void 0 ? {} : _b, _c = config.enableAuth, enableAuth = _c === void 0 ? true : _c, _d = config.enableSecurity, enableSecurity = _d === void 0 ? true : _d;
    var authMiddleware = enableAuth
        ? (0, auth_middleware_2.createAuthMiddleware)(authConfig)
        : null;
    var securityMiddleware = enableSecurity
        ? (0, security_middleware_2.createSecurityMiddleware)(securityConfig)
        : null;
    return function combinedMiddleware(request) {
        return __awaiter(this, void 0, void 0, function () {
            var securityResult, authResult, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!securityMiddleware) return [3 /*break*/, 2];
                        return [4 /*yield*/, securityMiddleware(request, securityMonitor, sessionManager)];
                    case 1:
                        securityResult = _a.sent();
                        if (securityResult && securityResult.status !== 200) {
                            return [2 /*return*/, securityResult];
                        }
                        _a.label = 2;
                    case 2:
                        if (!authMiddleware) return [3 /*break*/, 4];
                        return [4 /*yield*/, authMiddleware(request, sessionManager, securityMonitor, deviceManager)];
                    case 3:
                        authResult = _a.sent();
                        if (authResult && authResult.status !== 200) {
                            return [2 /*return*/, authResult];
                        }
                        _a.label = 4;
                    case 4: 
                    // Continue to the next middleware or route handler
                    return [2 /*return*/, server_1.NextResponse.next()];
                    case 5:
                        error_1 = _a.sent();
                        console.error('Combined middleware error:', error_1);
                        return [2 /*return*/, new server_1.NextResponse('Middleware error', { status: 500 })];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
}
/**
 * Middleware utilities
 */
exports.MiddlewareUtils = {
    /**
     * Extract client IP from request
     */
    getClientIP: function (request) {
        var forwarded = request.headers.get('x-forwarded-for');
        var realIP = request.headers.get('x-real-ip');
        var remoteAddr = request.headers.get('x-remote-addr');
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        return realIP || remoteAddr || 'unknown';
    },
    /**
     * Extract session token from request
     */
    getSessionToken: function (request) {
        var authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        var sessionCookie = request.cookies.get('session_token');
        if (sessionCookie) {
            return sessionCookie.value;
        }
        return null;
    },
    /**
     * Check if request is from API route
     */
    isAPIRoute: function (request) {
        return request.nextUrl.pathname.startsWith('/api/');
    },
    /**
     * Check if request is for static assets
     */
    isStaticAsset: function (request) {
        var pathname = request.nextUrl.pathname;
        return (pathname.startsWith('/_next/') ||
            pathname.startsWith('/static/') ||
            pathname.includes('.') // Files with extensions
        );
    },
    /**
     * Check if request is for public routes
     */
    isPublicRoute: function (request, publicRoutes) {
        if (publicRoutes === void 0) { publicRoutes = []; }
        var pathname = request.nextUrl.pathname;
        var defaultPublicRoutes = [
            '/login',
            '/register',
            '/forgot-password',
            '/reset-password',
            '/verify-email',
            '/',
        ];
        var allPublicRoutes = __spreadArray(__spreadArray([], defaultPublicRoutes, true), publicRoutes, true);
        return allPublicRoutes.some(function (route) { return pathname === route || pathname.startsWith(route + '/'); });
    },
};
/**
 * Middleware configuration presets
 */
exports.MiddlewarePresets = {
    /**
     * High security configuration
     */
    highSecurity: {
        auth: {
            requireAuth: true,
            requireMFA: true,
            checkDeviceTrust: true,
            logSecurityEvents: true,
            rateLimitRequests: true,
            blockSuspiciousActivity: true,
        },
        security: {
            enableThreatDetection: true,
            enableAnomalyDetection: true,
            enableRealTimeMonitoring: true,
            blockHighRiskRequests: true,
            logAllEvents: true,
            alertThresholds: {
                high: 60,
                critical: 80,
            },
            rateLimits: {
                requests: 500,
                timeWindow: 3600000,
            },
        },
    },
    /**
     * Standard security configuration
     */
    standard: {
        auth: {
            requireAuth: true,
            requireMFA: false,
            checkDeviceTrust: true,
            logSecurityEvents: true,
            rateLimitRequests: true,
            blockSuspiciousActivity: true,
        },
        security: {
            enableThreatDetection: true,
            enableAnomalyDetection: true,
            enableRealTimeMonitoring: true,
            blockHighRiskRequests: true,
            logAllEvents: false,
            alertThresholds: {
                high: 70,
                critical: 90,
            },
            rateLimits: {
                requests: 1000,
                timeWindow: 3600000,
            },
        },
    },
    /**
     * Development configuration (less restrictive)
     */
    development: {
        auth: {
            requireAuth: false,
            requireMFA: false,
            checkDeviceTrust: false,
            logSecurityEvents: true,
            rateLimitRequests: false,
            blockSuspiciousActivity: false,
        },
        security: {
            enableThreatDetection: true,
            enableAnomalyDetection: false,
            enableRealTimeMonitoring: false,
            blockHighRiskRequests: false,
            logAllEvents: false,
            alertThresholds: {
                high: 90,
                critical: 95,
            },
            rateLimits: {
                requests: 10000,
                timeWindow: 3600000,
            },
        },
    },
};
