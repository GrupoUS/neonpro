"use strict";
/**
 * RBAC Authorization Middleware for NeonPro
 * Story 1.2: Role-Based Access Control Implementation
 *
 * This middleware provides route-level authorization based on roles and permissions
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
exports.AuthMiddlewares = void 0;
exports.authorize = authorize;
exports.createAuthorizationMiddleware = createAuthorizationMiddleware;
exports.extractPatientId = extractPatientId;
exports.extractAppointmentId = extractAppointmentId;
exports.extractClinicId = extractClinicId;
exports.extractUserId = extractUserId;
exports.withAuthorization = withAuthorization;
exports.checkAuthorization = checkAuthorization;
var server_1 = require("next/server");
var auth_1 = require("@/lib/middleware/auth");
var permissions_1 = require("./permissions");
/**
 * Role hierarchy levels for comparison
 */
var ROLE_HIERARCHY = {
    patient: 1,
    staff: 2,
    manager: 3,
    owner: 4
};
/**
 * Check if user has minimum required role level
 */
function hasMinimumRole(userRole, requiredRole) {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
/**
 * Main authorization middleware function
 */
function authorize(req, config) {
    return __awaiter(this, void 0, void 0, function () {
        var authResult, user, context, resourceId, permissionResult, permissionResult, customResult, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    // Skip authorization if condition is met
                    if (config.skipIf && config.skipIf(req)) {
                        return [2 /*return*/, { authorized: true }];
                    }
                    return [4 /*yield*/, (0, auth_1.authenticateRequest)(req)];
                case 1:
                    authResult = _a.sent();
                    if (!authResult.authenticated || !authResult.user) {
                        return [2 /*return*/, {
                                authorized: false,
                                reason: 'Authentication required',
                                statusCode: 401
                            }];
                    }
                    user = authResult.user;
                    context = {
                        ipAddress: getClientIP(req),
                        userAgent: req.headers.get('user-agent') || 'unknown',
                        path: req.nextUrl.pathname,
                        method: req.method
                    };
                    // Check minimum role requirement
                    if (config.requiredRole && !hasMinimumRole(user.role, config.requiredRole)) {
                        return [2 /*return*/, {
                                authorized: false,
                                user: user,
                                reason: "Minimum role '".concat(config.requiredRole, "' required, user has '").concat(user.role, "'"),
                                statusCode: 403
                            }];
                    }
                    resourceId = config.resourceIdExtractor ? config.resourceIdExtractor(req) : undefined;
                    if (!(config.requiredPermissions && config.requiredPermissions.length > 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, permissions_1.hasAllPermissions)(user, config.requiredPermissions, resourceId, context)];
                case 2:
                    permissionResult = _a.sent();
                    if (!permissionResult.granted) {
                        return [2 /*return*/, {
                                authorized: false,
                                user: user,
                                reason: permissionResult.reason || 'Required permissions not met',
                                statusCode: 403
                            }];
                    }
                    _a.label = 3;
                case 3:
                    if (!(config.anyPermissions && config.anyPermissions.length > 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, permissions_1.hasAnyPermission)(user, config.anyPermissions, resourceId, context)];
                case 4:
                    permissionResult = _a.sent();
                    if (!permissionResult.granted) {
                        return [2 /*return*/, {
                                authorized: false,
                                user: user,
                                reason: permissionResult.reason || 'None of the alternative permissions met',
                                statusCode: 403
                            }];
                    }
                    _a.label = 5;
                case 5:
                    if (!config.customCheck) return [3 /*break*/, 7];
                    return [4 /*yield*/, config.customCheck(user, req)];
                case 6:
                    customResult = _a.sent();
                    if (!customResult) {
                        return [2 /*return*/, {
                                authorized: false,
                                user: user,
                                reason: 'Custom authorization check failed',
                                statusCode: 403
                            }];
                    }
                    _a.label = 7;
                case 7: return [2 /*return*/, {
                        authorized: true,
                        user: user
                    }];
                case 8:
                    error_1 = _a.sent();
                    console.error('Authorization middleware error:', error_1);
                    return [2 /*return*/, {
                            authorized: false,
                            reason: 'Authorization check failed',
                            statusCode: 500
                        }];
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Create authorization middleware for specific configuration
 */
function createAuthorizationMiddleware(config) {
    var _this = this;
    return function (req) { return __awaiter(_this, void 0, void 0, function () {
        var result, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, authorize(req, config)];
                case 1:
                    result = _a.sent();
                    if (!result.authorized) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Authorization failed',
                                message: result.reason || 'Access denied',
                                code: result.statusCode || 403
                            }, { status: result.statusCode || 403 })];
                    }
                    // Add user info to request headers for downstream handlers
                    if (result.user) {
                        response = server_1.NextResponse.next();
                        response.headers.set('x-user-id', result.user.id);
                        response.headers.set('x-user-role', result.user.role);
                        response.headers.set('x-clinic-id', result.user.clinicId || '');
                        return [2 /*return*/, response];
                    }
                    return [2 /*return*/, server_1.NextResponse.next()];
            }
        });
    }); };
}
/**
 * Helper function to extract patient ID from URL
 */
function extractPatientId(req) {
    var pathname = req.nextUrl.pathname;
    var match = pathname.match(/\/patients\/([^/]+)/);
    return match ? match[1] : undefined;
}
/**
 * Helper function to extract appointment ID from URL
 */
function extractAppointmentId(req) {
    var pathname = req.nextUrl.pathname;
    var match = pathname.match(/\/appointments\/([^/]+)/);
    return match ? match[1] : undefined;
}
/**
 * Helper function to extract clinic ID from URL
 */
function extractClinicId(req) {
    var pathname = req.nextUrl.pathname;
    var match = pathname.match(/\/clinics\/([^/]+)/);
    return match ? match[1] : undefined;
}
/**
 * Helper function to extract user ID from URL
 */
function extractUserId(req) {
    var pathname = req.nextUrl.pathname;
    var match = pathname.match(/\/users\/([^/]+)/);
    return match ? match[1] : undefined;
}
/**
 * Get client IP address from request
 */
function getClientIP(req) {
    var forwarded = req.headers.get('x-forwarded-for');
    var realIP = req.headers.get('x-real-ip');
    var remoteAddr = req.headers.get('x-remote-addr');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return realIP || remoteAddr || 'unknown';
}
/**
 * Pre-configured authorization middlewares for common use cases
 */
exports.AuthMiddlewares = {
    /**
     * Require owner role
     */
    requireOwner: createAuthorizationMiddleware({
        requiredRole: 'owner'
    }),
    /**
     * Require manager role or higher
     */
    requireManager: createAuthorizationMiddleware({
        requiredRole: 'manager'
    }),
    /**
     * Require staff role or higher
     */
    requireStaff: createAuthorizationMiddleware({
        requiredRole: 'staff'
    }),
    /**
     * Patient data access (read)
     */
    patientRead: createAuthorizationMiddleware({
        anyPermissions: ['patients.read', 'patients.manage'],
        resourceIdExtractor: extractPatientId
    }),
    /**
     * Patient data management
     */
    patientManage: createAuthorizationMiddleware({
        requiredPermissions: ['patients.manage'],
        resourceIdExtractor: extractPatientId
    }),
    /**
     * Appointment access
     */
    appointmentAccess: createAuthorizationMiddleware({
        anyPermissions: ['appointments.read', 'appointments.manage'],
        resourceIdExtractor: extractAppointmentId
    }),
    /**
     * Financial data access
     */
    financialAccess: createAuthorizationMiddleware({
        anyPermissions: ['billing.read', 'billing.manage', 'payments.read', 'payments.manage']
    }),
    /**
     * System administration
     */
    systemAdmin: createAuthorizationMiddleware({
        requiredPermissions: ['system.admin']
    }),
    /**
     * Clinic management
     */
    clinicManage: createAuthorizationMiddleware({
        requiredPermissions: ['clinic.manage'],
        resourceIdExtractor: extractClinicId
    }),
    /**
     * User management
     */
    userManage: createAuthorizationMiddleware({
        requiredPermissions: ['users.manage'],
        resourceIdExtractor: extractUserId
    })
};
/**
 * Decorator for API route handlers with authorization
 */
function withAuthorization(config) {
    return function (handler) {
        var _this = this;
        return function (req, context) { return __awaiter(_this, void 0, void 0, function () {
            var authResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, authorize(req, config)];
                    case 1:
                        authResult = _a.sent();
                        if (!authResult.authorized) {
                            return [2 /*return*/, server_1.NextResponse.json({
                                    error: 'Authorization failed',
                                    message: authResult.reason || 'Access denied',
                                    code: authResult.statusCode || 403
                                }, { status: authResult.statusCode || 403 })];
                        }
                        // Add user to context
                        context.user = authResult.user;
                        return [2 /*return*/, handler(req, context)];
                }
            });
        }); };
    };
}
/**
 * Check authorization without middleware (for use in API routes)
 */
function checkAuthorization(req, config) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, authorize(req, config)];
                case 1:
                    result = _a.sent();
                    if (!result.authorized) {
                        return [2 /*return*/, {
                                authorized: false,
                                error: server_1.NextResponse.json({
                                    error: 'Authorization failed',
                                    message: result.reason || 'Access denied',
                                    code: result.statusCode || 403
                                }, { status: result.statusCode || 403 })
                            }];
                    }
                    return [2 /*return*/, {
                            authorized: true,
                            user: result.user
                        }];
            }
        });
    });
}
