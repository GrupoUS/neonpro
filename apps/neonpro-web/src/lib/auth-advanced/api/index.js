"use strict";
// API Routes Index
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
exports.SUCCESS_MESSAGES = exports.ERROR_MESSAGES = exports.STATUS_CODES = exports.HTTP_METHODS = exports.API_ROUTES = exports.RouteUtils = exports.createDeviceRoutes = exports.DeviceRoutes = exports.createSecurityRoutes = exports.SecurityRoutes = exports.createSessionRoutes = exports.SessionRoutes = void 0;
exports.createAuthAPIRoutes = createAuthAPIRoutes;
var session_routes_1 = require("./session-routes");
Object.defineProperty(exports, "SessionRoutes", { enumerable: true, get: function () { return session_routes_1.SessionRoutes; } });
Object.defineProperty(exports, "createSessionRoutes", { enumerable: true, get: function () { return session_routes_1.createSessionRoutes; } });
var security_routes_1 = require("./security-routes");
Object.defineProperty(exports, "SecurityRoutes", { enumerable: true, get: function () { return security_routes_1.SecurityRoutes; } });
Object.defineProperty(exports, "createSecurityRoutes", { enumerable: true, get: function () { return security_routes_1.createSecurityRoutes; } });
var device_routes_1 = require("./device-routes");
Object.defineProperty(exports, "DeviceRoutes", { enumerable: true, get: function () { return device_routes_1.DeviceRoutes; } });
Object.defineProperty(exports, "createDeviceRoutes", { enumerable: true, get: function () { return device_routes_1.createDeviceRoutes; } });
// Combined API routes factory
function createAuthAPIRoutes(sessionManager, securityMonitor, deviceManager) {
    return {
        session: createSessionRoutes(sessionManager, securityMonitor),
        security: createSecurityRoutes(securityMonitor, sessionManager),
        device: createDeviceRoutes(deviceManager, sessionManager, securityMonitor),
    };
}
// Route utilities
exports.RouteUtils = {
    /**
     * Extract client IP from request
     */
    getClientIP: function (request) {
        var headers = request.headers;
        var forwarded = headers.get('x-forwarded-for');
        var realIP = headers.get('x-real-ip');
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        return realIP || 'unknown';
    },
    /**
     * Extract session token from authorization header
     */
    extractSessionToken: function (request) {
        var authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7);
    },
    /**
     * Create error response
     */
    createErrorResponse: function (message, status) {
        if (status === void 0) { status = 400; }
        return new Response(JSON.stringify({ error: message }), {
            status: status,
            headers: { 'Content-Type': 'application/json' },
        });
    },
    /**
     * Create success response
     */
    createSuccessResponse: function (data, status) {
        if (status === void 0) { status = 200; }
        return new Response(JSON.stringify(__assign({ success: true }, data)), {
            status: status,
            headers: { 'Content-Type': 'application/json' },
        });
    },
    /**
     * Validate request body
     */
    validateRequestBody: function (request, requiredFields) {
        return __awaiter(this, void 0, void 0, function () {
            var body, _i, requiredFields_1, field, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, request.json()];
                    case 1:
                        body = _a.sent();
                        for (_i = 0, requiredFields_1 = requiredFields; _i < requiredFields_1.length; _i++) {
                            field = requiredFields_1[_i];
                            if (!body[field]) {
                                return [2 /*return*/, {
                                        valid: false,
                                        error: "Missing required field: ".concat(field),
                                    }];
                            }
                        }
                        return [2 /*return*/, { valid: true, data: body }];
                    case 2:
                        error_1 = _a.sent();
                        return [2 /*return*/, {
                                valid: false,
                                error: 'Invalid JSON body',
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Parse query parameters
     */
    parseQueryParams: function (url) {
        var urlObj = new URL(url);
        var params = {};
        urlObj.searchParams.forEach(function (value, key) {
            params[key] = value;
        });
        return params;
    },
    /**
     * Add security headers to response
     */
    addSecurityHeaders: function (response) {
        var headers = new Headers(response.headers);
        headers.set('X-Content-Type-Options', 'nosniff');
        headers.set('X-Frame-Options', 'DENY');
        headers.set('X-XSS-Protection', '1; mode=block');
        headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        headers.set('Content-Security-Policy', "default-src 'self'");
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: headers,
        });
    },
};
// API route patterns
exports.API_ROUTES = {
    // Session routes
    SESSION_CREATE: '/api/auth/sessions',
    SESSION_GET: '/api/auth/sessions/:sessionId',
    SESSION_UPDATE: '/api/auth/sessions/:sessionId/activity',
    SESSION_EXTEND: '/api/auth/sessions/:sessionId/extend',
    SESSION_TERMINATE: '/api/auth/sessions/:sessionId/terminate',
    SESSION_USER: '/api/auth/sessions/user/:userId',
    SESSION_VALIDATE: '/api/auth/sessions/validate',
    SESSION_METRICS: '/api/auth/sessions/metrics',
    SESSION_CLEANUP: '/api/auth/sessions/cleanup',
    // Security routes
    SECURITY_EVENTS: '/api/auth/security/events',
    SECURITY_ALERTS: '/api/auth/security/alerts',
    SECURITY_DISMISS_ALERT: '/api/auth/security/alerts/:alertId/dismiss',
    SECURITY_METRICS: '/api/auth/security/metrics',
    SECURITY_REPORT: '/api/auth/security/report',
    SECURITY_RISK: '/api/auth/security/risk',
    SECURITY_BLOCK_IP: '/api/auth/security/block-ip',
    SECURITY_UNBLOCK_IP: '/api/auth/security/unblock-ip/:ip',
    SECURITY_BLOCKED_IPS: '/api/auth/security/blocked-ips',
    SECURITY_EXPORT: '/api/auth/security/export',
    // Device routes
    DEVICE_REGISTER: '/api/auth/devices/register',
    DEVICE_USER: '/api/auth/devices/user/:userId',
    DEVICE_GET: '/api/auth/devices/:deviceId',
    DEVICE_TRUST: '/api/auth/devices/:deviceId/trust',
    DEVICE_BLOCK: '/api/auth/devices/:deviceId/block',
    DEVICE_REMOVE: '/api/auth/devices/:deviceId',
    DEVICE_VALIDATE: '/api/auth/devices/validate',
    DEVICE_ANALYTICS: '/api/auth/devices/analytics',
    DEVICE_UPDATE: '/api/auth/devices/:deviceId',
};
// HTTP methods
exports.HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH',
};
// Response status codes
exports.STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
};
// Common error messages
exports.ERROR_MESSAGES = {
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Forbidden - insufficient permissions',
    NOT_FOUND: 'Resource not found',
    INVALID_INPUT: 'Invalid input data',
    SESSION_EXPIRED: 'Session has expired',
    DEVICE_NOT_TRUSTED: 'Device is not trusted',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
    INTERNAL_ERROR: 'Internal server error',
};
// Success messages
exports.SUCCESS_MESSAGES = {
    SESSION_CREATED: 'Session created successfully',
    SESSION_UPDATED: 'Session updated successfully',
    SESSION_TERMINATED: 'Session terminated successfully',
    DEVICE_REGISTERED: 'Device registered successfully',
    DEVICE_TRUSTED: 'Device trusted successfully',
    DEVICE_BLOCKED: 'Device blocked successfully',
    SECURITY_EVENT_LOGGED: 'Security event logged successfully',
    ALERT_DISMISSED: 'Alert dismissed successfully',
};
