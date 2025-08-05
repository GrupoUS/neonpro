"use strict";
/**
 * NeonPro - API Gateway Middleware System
 * Comprehensive middleware and plugin system for request processing
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
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
exports.ResponseTransformationMiddleware = exports.RequestValidationMiddleware = exports.AuthorizationMiddleware = exports.AuthenticationMiddleware = exports.RateLimitingMiddleware = exports.RequestLoggingMiddleware = exports.CorsMiddleware = exports.MiddlewareManager = void 0;
/**
 * Middleware Manager
 * Manages and executes middleware chain
 */
var MiddlewareManager = /** @class */ (function () {
    function MiddlewareManager(logger) {
        this.middleware = new Map();
        this.plugins = new Map();
        this.logger = logger;
    }
    /**
     * Register middleware
     */
    MiddlewareManager.prototype.register = function (middleware) {
        var _a;
        this.middleware.set(middleware.name, middleware);
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info('Middleware registered', {
            name: middleware.name,
            order: middleware.order,
            enabled: middleware.enabled
        });
    };
    /**
     * Unregister middleware
     */
    MiddlewareManager.prototype.unregister = function (name) {
        var _a;
        this.middleware.delete(name);
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info('Middleware unregistered', { name: name });
    };
    /**
     * Register plugin
     */
    MiddlewareManager.prototype.registerPlugin = function (plugin) {
        var _a;
        this.plugins.set(plugin.name, plugin);
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info('Plugin registered', {
            name: plugin.name,
            version: plugin.version,
            enabled: plugin.enabled
        });
    };
    /**
     * Unregister plugin
     */
    MiddlewareManager.prototype.unregisterPlugin = function (name) {
        var _a;
        this.plugins.delete(name);
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info('Plugin unregistered', { name: name });
    };
    /**
     * Execute middleware chain
     */
    MiddlewareManager.prototype.execute = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var middlewares, index, next;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        middlewares = this.getOrderedMiddleware();
                        index = 0;
                        next = function () { return __awaiter(_this, void 0, void 0, function () {
                            var middleware, error_1;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!(index < middlewares.length)) return [3 /*break*/, 4];
                                        middleware = middlewares[index++];
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, middleware.handler(context, next)];
                                    case 2:
                                        _b.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        error_1 = _b.sent();
                                        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.error('Middleware error', error_1, {
                                            middleware: middleware.name,
                                            requestId: context.requestId
                                        });
                                        throw error_1;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); };
                        return [4 /*yield*/, next()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get ordered middleware
     */
    MiddlewareManager.prototype.getOrderedMiddleware = function () {
        return Array.from(this.middleware.values())
            .filter(function (m) { return m.enabled; })
            .sort(function (a, b) { return a.order - b.order; });
    };
    /**
     * Get middleware by name
     */
    MiddlewareManager.prototype.getMiddleware = function (name) {
        return this.middleware.get(name);
    };
    /**
     * List all middleware
     */
    MiddlewareManager.prototype.listMiddleware = function () {
        return Array.from(this.middleware.values());
    };
    /**
     * Get plugin by name
     */
    MiddlewareManager.prototype.getPlugin = function (name) {
        return this.plugins.get(name);
    };
    /**
     * List all plugins
     */
    MiddlewareManager.prototype.listPlugins = function () {
        return Array.from(this.plugins.values());
    };
    return MiddlewareManager;
}());
exports.MiddlewareManager = MiddlewareManager;
/**
 * CORS Middleware
 * Handles Cross-Origin Resource Sharing
 */
var CorsMiddleware = /** @class */ (function () {
    function CorsMiddleware() {
    }
    CorsMiddleware.create = function (config) {
        var _this = this;
        return {
            name: 'cors',
            order: 1,
            enabled: true,
            config: config,
            handler: function (context, next) { return __awaiter(_this, void 0, void 0, function () {
                var origin;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Handle preflight requests
                            if (context.method === 'OPTIONS') {
                                context.headers['Access-Control-Allow-Origin'] = config.origins.includes('*')
                                    ? '*'
                                    : config.origins.join(',');
                                context.headers['Access-Control-Allow-Methods'] = config.methods.join(',');
                                context.headers['Access-Control-Allow-Headers'] = config.headers.join(',');
                                context.headers['Access-Control-Allow-Credentials'] = config.credentials.toString();
                                if (config.maxAge) {
                                    context.headers['Access-Control-Max-Age'] = config.maxAge.toString();
                                }
                                // End preflight request
                                return [2 /*return*/];
                            }
                            origin = context.headers['origin'] || context.headers['Origin'];
                            if (origin && (config.origins.includes('*') || config.origins.includes(origin))) {
                                context.headers['Access-Control-Allow-Origin'] = origin;
                            }
                            context.headers['Access-Control-Allow-Credentials'] = config.credentials.toString();
                            context.headers['Vary'] = 'Origin';
                            return [4 /*yield*/, next()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); }
        };
    };
    return CorsMiddleware;
}());
exports.CorsMiddleware = CorsMiddleware;
/**
 * Request Logging Middleware
 * Logs all API requests and responses
 */
var RequestLoggingMiddleware = /** @class */ (function () {
    function RequestLoggingMiddleware() {
    }
    RequestLoggingMiddleware.create = function (config, logger) {
        var _this = this;
        return {
            name: 'request-logging',
            order: 2,
            enabled: config.enabled,
            config: config,
            handler: function (context, next) { return __awaiter(_this, void 0, void 0, function () {
                var startTime, requestLog, duration, error_2, duration;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            startTime = Date.now();
                            requestLog = {
                                requestId: context.requestId,
                                method: context.method,
                                path: context.path,
                                query: context.query,
                                clientId: context.clientId,
                                userId: context.userId,
                                ipAddress: context.ipAddress,
                                userAgent: context.userAgent,
                                timestamp: new Date().toISOString()
                            };
                            if (config.includeHeaders) {
                                requestLog.headers = RequestLoggingMiddleware.sanitizeHeaders(context.headers, config.sensitiveHeaders);
                            }
                            if (config.includeBody && context.body) {
                                requestLog.body = context.body;
                            }
                            logger === null || logger === void 0 ? void 0 : logger.info('API Request', requestLog);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, next()];
                        case 2:
                            _a.sent();
                            duration = Date.now() - startTime;
                            logger === null || logger === void 0 ? void 0 : logger.info('API Response', {
                                requestId: context.requestId,
                                duration: duration,
                                statusCode: context.headers['status-code'] || 200
                            });
                            return [3 /*break*/, 4];
                        case 3:
                            error_2 = _a.sent();
                            duration = Date.now() - startTime;
                            logger === null || logger === void 0 ? void 0 : logger.error('API Error', error_2, {
                                requestId: context.requestId,
                                duration: duration,
                                statusCode: 500
                            });
                            throw error_2;
                        case 4: return [2 /*return*/];
                    }
                });
            }); }
        };
    };
    /**
     * Sanitize headers by removing sensitive information
     */
    RequestLoggingMiddleware.sanitizeHeaders = function (headers, sensitiveHeaders) {
        var sanitized = __assign({}, headers);
        for (var _i = 0, sensitiveHeaders_1 = sensitiveHeaders; _i < sensitiveHeaders_1.length; _i++) {
            var header = sensitiveHeaders_1[_i];
            if (sanitized[header]) {
                sanitized[header] = '[REDACTED]';
            }
        }
        return sanitized;
    };
    return RequestLoggingMiddleware;
}());
exports.RequestLoggingMiddleware = RequestLoggingMiddleware;
/**
 * Rate Limiting Middleware
 * Implements rate limiting based on client ID or IP address
 */
var RateLimitingMiddleware = /** @class */ (function () {
    function RateLimitingMiddleware() {
        this.rateLimitStore = new Map();
    }
    RateLimitingMiddleware.create = function (config) {
        var _this = this;
        var instance = new RateLimitingMiddleware();
        return {
            name: 'rate-limiting',
            order: 3,
            enabled: true,
            config: config,
            handler: function (context, next) { return __awaiter(_this, void 0, void 0, function () {
                var key, allowed, rateLimitInfo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            key = config.keyGenerator
                                ? config.keyGenerator(context)
                                : context.clientId || context.ipAddress;
                            allowed = instance.checkRateLimit(key, config);
                            if (!allowed) {
                                rateLimitInfo = instance.getRateLimitInfo(key, config);
                                // Add rate limit headers
                                context.headers['X-RateLimit-Limit'] = config.maxRequests.toString();
                                context.headers['X-RateLimit-Remaining'] = rateLimitInfo.remaining.toString();
                                context.headers['X-RateLimit-Reset'] = Math.ceil(rateLimitInfo.resetTime.getTime() / 1000).toString();
                                throw new Error('Rate limit exceeded');
                            }
                            return [4 /*yield*/, next()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); }
        };
    };
    /**
     * Check if request is within rate limit
     */
    RateLimitingMiddleware.prototype.checkRateLimit = function (key, config) {
        var now = new Date();
        var rateLimitData = this.rateLimitStore.get(key);
        if (!rateLimitData || rateLimitData.resetTime < now) {
            rateLimitData = {
                count: 0,
                resetTime: new Date(now.getTime() + config.windowMs)
            };
        }
        if (rateLimitData.count >= config.maxRequests) {
            return false;
        }
        rateLimitData.count++;
        this.rateLimitStore.set(key, rateLimitData);
        return true;
    };
    /**
     * Get rate limit information
     */
    RateLimitingMiddleware.prototype.getRateLimitInfo = function (key, config) {
        var rateLimitData = this.rateLimitStore.get(key);
        if (!rateLimitData) {
            return {
                remaining: config.maxRequests,
                resetTime: new Date(Date.now() + config.windowMs)
            };
        }
        return {
            remaining: Math.max(0, config.maxRequests - rateLimitData.count),
            resetTime: rateLimitData.resetTime
        };
    };
    return RateLimitingMiddleware;
}());
exports.RateLimitingMiddleware = RateLimitingMiddleware;
/**
 * Authentication Middleware
 * Handles API key and JWT authentication
 */
var AuthenticationMiddleware = /** @class */ (function () {
    function AuthenticationMiddleware() {
    }
    AuthenticationMiddleware.create = function (config) {
        var _this = this;
        return {
            name: 'authentication',
            order: 4,
            enabled: config.required,
            config: config,
            handler: function (context, next) { return __awaiter(_this, void 0, void 0, function () {
                var apiKey, result, authHeader, token, result;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!!context.route.authentication.required) return [3 /*break*/, 2];
                            return [4 /*yield*/, next()];
                        case 1:
                            _b.sent();
                            return [2 /*return*/];
                        case 2:
                            apiKey = context.headers[config.apiKeyHeader.toLowerCase()] ||
                                ((_a = context.headers['authorization']) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', ''));
                            if (!apiKey) return [3 /*break*/, 5];
                            return [4 /*yield*/, config.validateApiKey(apiKey)];
                        case 3:
                            result = _b.sent();
                            if (!result.valid) return [3 /*break*/, 5];
                            context.clientId = result.clientId;
                            context.userId = result.userId;
                            return [4 /*yield*/, next()];
                        case 4:
                            _b.sent();
                            return [2 /*return*/];
                        case 5:
                            if (!config.validateJwt) return [3 /*break*/, 8];
                            authHeader = context.headers['authorization'];
                            if (!(authHeader && authHeader.startsWith('Bearer '))) return [3 /*break*/, 8];
                            token = authHeader.substring(7);
                            return [4 /*yield*/, config.validateJwt(token)];
                        case 6:
                            result = _b.sent();
                            if (!(result.valid && result.payload)) return [3 /*break*/, 8];
                            context.userId = result.payload.sub || result.payload.userId;
                            context.userRoles = result.payload.roles;
                            context.userPermissions = result.payload.permissions;
                            return [4 /*yield*/, next()];
                        case 7:
                            _b.sent();
                            return [2 /*return*/];
                        case 8: throw new Error('Authentication required');
                    }
                });
            }); }
        };
    };
    return AuthenticationMiddleware;
}());
exports.AuthenticationMiddleware = AuthenticationMiddleware;
/**
 * Authorization Middleware
 * Handles role-based and permission-based authorization
 */
var AuthorizationMiddleware = /** @class */ (function () {
    function AuthorizationMiddleware() {
    }
    AuthorizationMiddleware.create = function (config) {
        var _this = this;
        return {
            name: 'authorization',
            order: 5,
            enabled: true,
            config: config,
            handler: function (context, next) { return __awaiter(_this, void 0, void 0, function () {
                var route, hasAdminRole;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!!context.route.authentication.required) return [3 /*break*/, 2];
                            return [4 /*yield*/, next()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                        case 2:
                            route = context.route;
                            if (!(config.adminRoles && context.userRoles)) return [3 /*break*/, 4];
                            hasAdminRole = config.adminRoles.some(function (role) {
                                return context.userRoles.includes(role);
                            });
                            if (!hasAdminRole) return [3 /*break*/, 4];
                            return [4 /*yield*/, next()];
                        case 3:
                            _a.sent();
                            return [2 /*return*/];
                        case 4:
                            // Check required roles
                            if (config.checkRoles && route.authentication.roles && route.authentication.roles.length > 0) {
                                if (!context.userRoles ||
                                    !route.authentication.roles.some(function (role) { return context.userRoles.includes(role); })) {
                                    throw new Error('Insufficient role permissions');
                                }
                            }
                            // Check required permissions
                            if (config.checkPermissions && route.authentication.permissions && route.authentication.permissions.length > 0) {
                                if (!context.userPermissions ||
                                    !route.authentication.permissions.some(function (perm) { return context.userPermissions.includes(perm); })) {
                                    throw new Error('Insufficient permissions');
                                }
                            }
                            return [4 /*yield*/, next()];
                        case 5:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); }
        };
    };
    return AuthorizationMiddleware;
}());
exports.AuthorizationMiddleware = AuthorizationMiddleware;
/**
 * Request Validation Middleware
 * Validates request parameters, query, and body
 */
var RequestValidationMiddleware = /** @class */ (function () {
    function RequestValidationMiddleware() {
    }
    RequestValidationMiddleware.create = function (config) {
        var _this = this;
        return {
            name: 'request-validation',
            order: 6,
            enabled: true,
            config: config,
            handler: function (context, next) { return __awaiter(_this, void 0, void 0, function () {
                var route, errors, paramErrors, queryErrors, bodyParam, bodyErrors;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            route = context.route;
                            errors = [];
                            // Validate parameters
                            if (config.validateParams && route.documentation.parameters) {
                                paramErrors = RequestValidationMiddleware.validateParameters(context.params || {}, route.documentation.parameters.filter(function (p) { return p.in === 'path'; }), config.strictMode);
                                errors.push.apply(errors, paramErrors);
                            }
                            // Validate query parameters
                            if (config.validateQuery && route.documentation.parameters) {
                                queryErrors = RequestValidationMiddleware.validateParameters(context.query || {}, route.documentation.parameters.filter(function (p) { return p.in === 'query'; }), config.strictMode);
                                errors.push.apply(errors, queryErrors);
                            }
                            // Validate request body
                            if (config.validateBody && context.body && route.documentation.parameters) {
                                bodyParam = route.documentation.parameters.find(function (p) { return p.in === 'body'; });
                                if (bodyParam) {
                                    bodyErrors = RequestValidationMiddleware.validateBody(context.body, bodyParam.schema, config.strictMode);
                                    errors.push.apply(errors, bodyErrors);
                                }
                            }
                            if (errors.length > 0) {
                                throw new Error("Validation errors: ".concat(errors.join(', ')));
                            }
                            return [4 /*yield*/, next()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); }
        };
    };
    /**
     * Validate parameters against schema
     */
    RequestValidationMiddleware.validateParameters = function (values, parameters, strictMode) {
        var errors = [];
        for (var _i = 0, parameters_1 = parameters; _i < parameters_1.length; _i++) {
            var param = parameters_1[_i];
            var value = values[param.name];
            // Check required parameters
            if (param.required && (value === undefined || value === null)) {
                errors.push("Missing required parameter: ".concat(param.name));
                continue;
            }
            // Skip validation if parameter is not provided and not required
            if (value === undefined || value === null) {
                continue;
            }
            // Validate parameter type and format
            var paramErrors = RequestValidationMiddleware.validateValue(value, param.schema, param.name);
            errors.push.apply(errors, paramErrors);
        }
        return errors;
    };
    /**
     * Validate request body against schema
     */
    RequestValidationMiddleware.validateBody = function (body, schema, strictMode) {
        return RequestValidationMiddleware.validateValue(body, schema, 'body');
    };
    /**
     * Validate value against schema
     */
    RequestValidationMiddleware.validateValue = function (value, schema, fieldName) {
        var errors = [];
        if (!schema) {
            return errors;
        }
        // Type validation
        if (schema.type) {
            var actualType = Array.isArray(value) ? 'array' : typeof value;
            if (actualType !== schema.type) {
                errors.push("".concat(fieldName, " must be of type ").concat(schema.type, ", got ").concat(actualType));
                return errors;
            }
        }
        // String validations
        if (schema.type === 'string') {
            if (schema.minLength && value.length < schema.minLength) {
                errors.push("".concat(fieldName, " must be at least ").concat(schema.minLength, " characters long"));
            }
            if (schema.maxLength && value.length > schema.maxLength) {
                errors.push("".concat(fieldName, " must be at most ").concat(schema.maxLength, " characters long"));
            }
            if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
                errors.push("".concat(fieldName, " does not match required pattern"));
            }
            if (schema.enum && !schema.enum.includes(value)) {
                errors.push("".concat(fieldName, " must be one of: ").concat(schema.enum.join(', ')));
            }
        }
        // Number validations
        if (schema.type === 'number' || schema.type === 'integer') {
            if (schema.minimum !== undefined && value < schema.minimum) {
                errors.push("".concat(fieldName, " must be at least ").concat(schema.minimum));
            }
            if (schema.maximum !== undefined && value > schema.maximum) {
                errors.push("".concat(fieldName, " must be at most ").concat(schema.maximum));
            }
        }
        // Array validations
        if (schema.type === 'array') {
            if (schema.minItems && value.length < schema.minItems) {
                errors.push("".concat(fieldName, " must have at least ").concat(schema.minItems, " items"));
            }
            if (schema.maxItems && value.length > schema.maxItems) {
                errors.push("".concat(fieldName, " must have at most ").concat(schema.maxItems, " items"));
            }
            // Validate array items
            if (schema.items) {
                value.forEach(function (item, index) {
                    var itemErrors = RequestValidationMiddleware.validateValue(item, schema.items, "".concat(fieldName, "[").concat(index, "]"));
                    errors.push.apply(errors, itemErrors);
                });
            }
        }
        // Object validations
        if (schema.type === 'object' && schema.properties) {
            for (var _i = 0, _a = Object.entries(schema.properties); _i < _a.length; _i++) {
                var _b = _a[_i], propName = _b[0], propSchema = _b[1];
                var propValue = value[propName];
                if (schema.required && schema.required.includes(propName) &&
                    (propValue === undefined || propValue === null)) {
                    errors.push("".concat(fieldName, ".").concat(propName, " is required"));
                    continue;
                }
                if (propValue !== undefined && propValue !== null) {
                    var propErrors = RequestValidationMiddleware.validateValue(propValue, propSchema, "".concat(fieldName, ".").concat(propName));
                    errors.push.apply(errors, propErrors);
                }
            }
        }
        return errors;
    };
    return RequestValidationMiddleware;
}());
exports.RequestValidationMiddleware = RequestValidationMiddleware;
/**
 * Response Transformation Middleware
 * Transforms and formats API responses
 */
var ResponseTransformationMiddleware = /** @class */ (function () {
    function ResponseTransformationMiddleware() {
    }
    ResponseTransformationMiddleware.create = function (config) {
        var _this = this;
        return {
            name: 'response-transformation',
            order: 100, // Execute last
            enabled: true,
            config: config,
            handler: function (context, next) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, next()];
                        case 1:
                            _a.sent();
                            // Transform response if present
                            if (context.response) {
                                context.response = ResponseTransformationMiddleware.transformResponse(context.response, config, context);
                            }
                            return [2 /*return*/];
                    }
                });
            }); }
        };
    };
    /**
     * Transform response data
     */
    ResponseTransformationMiddleware.transformResponse = function (response, config, context) {
        var transformed = response;
        // Remove null values
        if (config.removeNullValues) {
            transformed = ResponseTransformationMiddleware.removeNullValues(transformed);
        }
        // Format dates
        if (config.formatDates) {
            transformed = ResponseTransformationMiddleware.formatDates(transformed);
        }
        // Wrap response
        if (config.wrapResponses) {
            transformed = {
                success: true,
                data: transformed
            };
            // Include metadata
            if (config.includeMetadata) {
                transformed.meta = {
                    timestamp: new Date().toISOString(),
                    requestId: context.requestId,
                    version: '1.0.0'
                };
            }
        }
        return transformed;
    };
    /**
     * Remove null and undefined values
     */
    ResponseTransformationMiddleware.removeNullValues = function (obj) {
        if (obj === null || obj === undefined) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(function (item) { return ResponseTransformationMiddleware.removeNullValues(item); });
        }
        if (typeof obj === 'object') {
            var cleaned = {};
            for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], value = _b[1];
                if (value !== null && value !== undefined) {
                    cleaned[key] = ResponseTransformationMiddleware.removeNullValues(value);
                }
            }
            return cleaned;
        }
        return obj;
    };
    /**
     * Format date objects to ISO strings
     */
    ResponseTransformationMiddleware.formatDates = function (obj) {
        if (obj instanceof Date) {
            return obj.toISOString();
        }
        if (Array.isArray(obj)) {
            return obj.map(function (item) { return ResponseTransformationMiddleware.formatDates(item); });
        }
        if (typeof obj === 'object' && obj !== null) {
            var formatted = {};
            for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], value = _b[1];
                formatted[key] = ResponseTransformationMiddleware.formatDates(value);
            }
            return formatted;
        }
        return obj;
    };
    return ResponseTransformationMiddleware;
}());
exports.ResponseTransformationMiddleware = ResponseTransformationMiddleware;
