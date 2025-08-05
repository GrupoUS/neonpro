"use strict";
// Sentry monitoring utilities for NeonPro
// Provides centralized error handling and monitoring functions
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
exports.withErrorMonitoring = withErrorMonitoring;
exports.reportError = reportError;
exports.withPerformanceMonitoring = withPerformanceMonitoring;
exports.monitorDatabaseOperation = monitorDatabaseOperation;
exports.trackUserAction = trackUserAction;
exports.trackBusinessMetric = trackBusinessMetric;
exports.reportAuthError = reportAuthError;
var Sentry = require("@sentry/nextjs");
var server_1 = require("next/server");
/**
 * API Route error handler wrapper
 * Automatically captures errors and sends them to Sentry
 */
function withErrorMonitoring(handler) {
    var _this = this;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            var error_1, request, requestInfo_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, handler.apply(void 0, args)];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        error_1 = _b.sent();
                        request = args[0];
                        requestInfo_1 = {
                            method: request === null || request === void 0 ? void 0 : request.method,
                            url: request === null || request === void 0 ? void 0 : request.url,
                            userAgent: (_a = request === null || request === void 0 ? void 0 : request.headers) === null || _a === void 0 ? void 0 : _a.get('user-agent'),
                            timestamp: new Date().toISOString(),
                        };
                        // Report to Sentry
                        Sentry.withScope(function (scope) {
                            scope.setTag('type', 'api-error');
                            scope.setContext('request', requestInfo_1);
                            if (error_1 instanceof Error) {
                                scope.setLevel('error');
                                Sentry.captureException(error_1);
                            }
                            else {
                                scope.setLevel('error');
                                Sentry.captureMessage("API Error: ".concat(String(error_1)));
                            }
                        });
                        // Log for debugging
                        console.error('API Route Error:', error_1, requestInfo_1);
                        // Return appropriate error response
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Internal Server Error',
                                timestamp: new Date().toISOString(),
                            }, { status: 500 })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
}
/**
 * Manual error reporting function
 * Use this to manually report errors with custom context
 */
function reportError(error, context) {
    Sentry.withScope(function (scope) {
        // Set user context
        if (context === null || context === void 0 ? void 0 : context.user) {
            scope.setUser({
                id: context.user.id,
                email: context.user.email,
            });
            scope.setTag('clinicId', context.user.clinicId || 'unknown');
        }
        // Set custom tags
        if (context === null || context === void 0 ? void 0 : context.tags) {
            Object.entries(context.tags).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                scope.setTag(key, value);
            });
        }
        // Set extra context
        if (context === null || context === void 0 ? void 0 : context.extra) {
            Object.entries(context.extra).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                scope.setContext(key, value);
            });
        }
        // Set level
        scope.setLevel((context === null || context === void 0 ? void 0 : context.level) || 'error');
        // Capture error or message
        if (error instanceof Error) {
            Sentry.captureException(error);
        }
        else {
            Sentry.captureMessage(String(error));
        }
    });
}
/**
 * Performance monitoring for critical operations
 */
function withPerformanceMonitoring(name, operation) {
    var transaction = Sentry.startTransaction({
        op: 'function',
        name: name,
    });
    Sentry.getCurrentScope().setSpan(transaction);
    return operation()
        .then(function (result) {
        transaction.setStatus('ok');
        return result;
    })
        .catch(function (error) {
        transaction.setStatus('internal_error');
        Sentry.captureException(error);
        throw error;
    })
        .finally(function () {
        transaction.end();
    });
}
/**
 * Database operation monitoring
 * Tracks slow queries and database errors
 */
function monitorDatabaseOperation(operation, query) {
    return function (target, propertyKey, descriptor) {
        var originalMethod = descriptor.value;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var startTime, transaction, result, duration, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            startTime = Date.now();
                            transaction = Sentry.startTransaction({
                                op: 'db.query',
                                name: operation,
                            });
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, 4, 5]);
                            return [4 /*yield*/, originalMethod.apply(this, args)];
                        case 2:
                            result = _a.sent();
                            duration = Date.now() - startTime;
                            transaction.setStatus('ok');
                            transaction.setData('duration', duration);
                            // Log slow queries (>1s)
                            if (duration > 1000) {
                                Sentry.addBreadcrumb({
                                    message: "Slow database operation: ".concat(operation),
                                    data: { duration: duration, query: query },
                                    level: 'warning',
                                    category: 'database',
                                });
                            }
                            return [2 /*return*/, result];
                        case 3:
                            error_2 = _a.sent();
                            transaction.setStatus('internal_error');
                            Sentry.withScope(function (scope) {
                                scope.setTag('operation', operation);
                                scope.setContext('database', {
                                    query: query || 'unknown',
                                    duration: Date.now() - startTime,
                                });
                                Sentry.captureException(error_2);
                            });
                            throw error_2;
                        case 4:
                            transaction.end();
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        return descriptor;
    };
}
/**
 * User action tracking for important business operations
 */
function trackUserAction(action, properties) {
    Sentry.addBreadcrumb({
        message: "User action: ".concat(action),
        data: properties,
        level: 'info',
        category: 'user',
    });
}
/**
 * Business metric tracking
 */
function trackBusinessMetric(metric, value, tags) {
    Sentry.metrics.gauge(metric, value, {
        tags: __assign(__assign({}, tags), { feature: 'neonpro' }),
    });
}
/**
 * Auth error handler specifically for authentication issues
 */
function reportAuthError(error, context) {
    Sentry.withScope(function (scope) {
        scope.setTag('errorType', 'authentication');
        scope.setTag('provider', context.provider || 'unknown');
        scope.setTag('operation', context.operation || 'unknown');
        if (context.userId) {
            scope.setUser({
                id: context.userId,
                email: context.email,
            });
        }
        scope.setLevel('warning');
        Sentry.captureException(error);
    });
}
