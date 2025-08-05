"use strict";
/**
 * TASK-001: Foundation Setup & Baseline
 * Error Tracking and Monitoring System
 *
 * Comprehensive error monitoring with categorization, alerting,
 * and baseline error rate establishment for enhancement safety.
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
exports.createerrorTracker = void 0;
exports.trackError = trackError;
exports.useErrorTracking = useErrorTracking;
var client_1 = require("@/lib/supabase/client");
var ErrorTracker = /** @class */ (function () {
    function ErrorTracker() {
        this.supabase = (0, client_1.createClient)();
        this.errorQueue = [];
        this.flushInterval = null;
        this.thresholds = [
            { error_type: 'javascript', max_count_per_hour: 50, max_rate_percentage: 1, alert_enabled: true },
            { error_type: 'api', max_count_per_hour: 30, max_rate_percentage: 2, alert_enabled: true },
            { error_type: 'database', max_count_per_hour: 10, max_rate_percentage: 0.5, alert_enabled: true },
            { error_type: 'authentication', max_count_per_hour: 20, max_rate_percentage: 1, alert_enabled: true }
        ];
        this.setupGlobalErrorHandlers();
        this.startErrorFlushing();
    }
    /**
     * Track an error event
     */
    ErrorTracker.prototype.trackError = function (errorType, error, context) {
        return __awaiter(this, void 0, void 0, function () {
            var errorEvent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        errorEvent = {
                            error_type: errorType,
                            error_message: error instanceof Error ? error.message : error,
                            error_stack: error instanceof Error ? error.stack : undefined,
                            error_code: context === null || context === void 0 ? void 0 : context.error_code,
                            route_path: (context === null || context === void 0 ? void 0 : context.route_path) || window.location.pathname,
                            user_id: context === null || context === void 0 ? void 0 : context.user_id,
                            session_id: (context === null || context === void 0 ? void 0 : context.session_id) || this.getSessionId(),
                            severity: (context === null || context === void 0 ? void 0 : context.severity) || this.determineSeverity(errorType, error),
                            metadata: context === null || context === void 0 ? void 0 : context.metadata,
                            timestamp: new Date().toISOString()
                        };
                        this.errorQueue.push(errorEvent);
                        // Check thresholds for immediate alerting
                        return [4 /*yield*/, this.checkErrorThresholds(errorEvent)];
                    case 1:
                        // Check thresholds for immediate alerting
                        _a.sent();
                        if (!(errorEvent.severity === 'critical')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.flushErrors()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Determine error severity automatically
     */
    ErrorTracker.prototype.determineSeverity = function (errorType, error) {
        var message = error instanceof Error ? error.message : error;
        var lowerMessage = message.toLowerCase();
        // Critical severity indicators
        if (lowerMessage.includes('database') ||
            lowerMessage.includes('connection') ||
            lowerMessage.includes('timeout') ||
            lowerMessage.includes('unauthorized') ||
            errorType === 'database' ||
            errorType === 'authentication') {
            return 'critical';
        }
        // High severity indicators
        if (lowerMessage.includes('api') ||
            lowerMessage.includes('server') ||
            lowerMessage.includes('network') ||
            errorType === 'api') {
            return 'high';
        }
        // Medium severity indicators
        if (lowerMessage.includes('validation') ||
            lowerMessage.includes('permission') ||
            errorType === 'validation') {
            return 'medium';
        }
        // Default to low for JavaScript errors and others
        return 'low';
    };
    /**
     * Setup global error handlers
     */
    ErrorTracker.prototype.setupGlobalErrorHandlers = function () {
        var _this = this;
        // JavaScript errors
        window.addEventListener('error', function (event) {
            _this.trackError('javascript', event.error || event.message, {
                route_path: window.location.pathname,
                metadata: {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                }
            });
        });
        // Promise rejections
        window.addEventListener('unhandledrejection', function (event) {
            _this.trackError('javascript', event.reason, {
                route_path: window.location.pathname,
                severity: 'high',
                metadata: {
                    type: 'unhandled_promise_rejection'
                }
            });
        });
        // Network errors (fetch/XMLHttpRequest)
        this.interceptFetchErrors();
    };
    /**
     * Intercept fetch errors for API monitoring
     */
    ErrorTracker.prototype.interceptFetchErrors = function () {
        var _this = this;
        var originalFetch = window.fetch;
        window.fetch = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(_this, void 0, void 0, function () {
                var response, url, error_1, url;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, originalFetch.apply(void 0, args)];
                        case 1:
                            response = _a.sent();
                            // Track API errors based on status codes
                            if (!response.ok) {
                                url = args[0] instanceof Request ? args[0].url : args[0];
                                this.trackError('api', "HTTP ".concat(response.status, ": ").concat(response.statusText), {
                                    route_path: window.location.pathname,
                                    severity: response.status >= 500 ? 'critical' : 'medium',
                                    error_code: response.status.toString(),
                                    metadata: {
                                        url: url.toString(),
                                        status: response.status,
                                        statusText: response.statusText
                                    }
                                });
                            }
                            return [2 /*return*/, response];
                        case 2:
                            error_1 = _a.sent();
                            url = args[0] instanceof Request ? args[0].url : args[0];
                            this.trackError('network', error_1 instanceof Error ? error_1 : 'Network error', {
                                route_path: window.location.pathname,
                                severity: 'high',
                                metadata: {
                                    url: url.toString(),
                                    type: 'network_error'
                                }
                            });
                            throw error_1;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
    };
    /**
     * Get current session ID
     */
    ErrorTracker.prototype.getSessionId = function () {
        return localStorage.getItem('neonpro_session_id') || 'anonymous';
    };
    /**
     * Check error thresholds and trigger alerts
     */
    ErrorTracker.prototype.checkErrorThresholds = function (errorEvent) {
        return __awaiter(this, void 0, void 0, function () {
            var threshold, oneHourAgo, _a, data, error, hourlyCount, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        threshold = this.thresholds.find(function (t) { return t.error_type === errorEvent.error_type; });
                        if (!threshold || !threshold.alert_enabled)
                            return [2 /*return*/];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        oneHourAgo = new Date();
                        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
                        return [4 /*yield*/, this.supabase
                                .from('system_metrics')
                                .select('id')
                                .eq('metric_type', 'error_count')
                                .eq('metric_name', errorEvent.error_type)
                                .gte('timestamp', oneHourAgo.toISOString())];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error checking thresholds:', error);
                            return [2 /*return*/];
                        }
                        hourlyCount = (data === null || data === void 0 ? void 0 : data.length) || 0;
                        if (!(hourlyCount >= threshold.max_count_per_hour)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.triggerErrorAlert(errorEvent.error_type, hourlyCount, threshold)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: 
                    // Log error count metric
                    return [4 /*yield*/, this.logErrorMetric(errorEvent.error_type, hourlyCount + 1)];
                    case 5:
                        // Log error count metric
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _b.sent();
                        console.error('Error in threshold checking:', error_2);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Trigger error alert
     */
    ErrorTracker.prototype.triggerErrorAlert = function (errorType, count, threshold) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.error("\uD83D\uDEA8 ERROR THRESHOLD EXCEEDED: ".concat(errorType, " - ").concat(count, " errors in the last hour (threshold: ").concat(threshold.max_count_per_hour, ")"));
                        // Log alert as system metric
                        return [4 /*yield*/, this.supabase
                                .from('system_metrics')
                                .insert({
                                metric_type: 'error_alert',
                                metric_name: "".concat(errorType, "_threshold_exceeded"),
                                metric_value: count,
                                metric_unit: 'count',
                                metadata: {
                                    threshold: threshold.max_count_per_hour,
                                    error_type: errorType,
                                    alert_time: new Date().toISOString()
                                }
                            })];
                    case 1:
                        // Log alert as system metric
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Log error metric
     */
    ErrorTracker.prototype.logErrorMetric = function (errorType, count) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('system_metrics')
                                .insert({
                                metric_type: 'error_count',
                                metric_name: errorType,
                                metric_value: count,
                                metric_unit: 'count'
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Error logging error metric:', error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get error summary for a time period
     */
    ErrorTracker.prototype.getErrorSummary = function () {
        return __awaiter(this, arguments, void 0, function (hours, errorType) {
            var startDate, query, _a, data, error, summaryMap_1, error_4;
            if (hours === void 0) { hours = 24; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        startDate = new Date();
                        startDate.setHours(startDate.getHours() - hours);
                        query = this.supabase
                            .from('system_metrics')
                            .select('metric_name, metric_value, timestamp, metadata')
                            .eq('metric_type', 'error_count')
                            .gte('timestamp', startDate.toISOString());
                        if (errorType) {
                            query = query.eq('metric_name', errorType);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error || !data) {
                            console.error('Error fetching error summary:', error);
                            return [2 /*return*/, []];
                        }
                        summaryMap_1 = {};
                        data.forEach(function (record) {
                            var errorType = record.metric_name;
                            if (!summaryMap_1[errorType]) {
                                summaryMap_1[errorType] = {
                                    error_type: errorType,
                                    count: 0,
                                    first_occurrence: record.timestamp,
                                    last_occurrence: record.timestamp,
                                    affected_users: 0,
                                    error_rate: 0
                                };
                            }
                            summaryMap_1[errorType].count += record.metric_value;
                            if (record.timestamp < summaryMap_1[errorType].first_occurrence) {
                                summaryMap_1[errorType].first_occurrence = record.timestamp;
                            }
                            if (record.timestamp > summaryMap_1[errorType].last_occurrence) {
                                summaryMap_1[errorType].last_occurrence = record.timestamp;
                            }
                        });
                        return [2 /*return*/, Object.values(summaryMap_1)];
                    case 2:
                        error_4 = _b.sent();
                        console.error('Error generating error summary:', error_4);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get error baseline data
     */
    ErrorTracker.prototype.getErrorBaseline = function () {
        return __awaiter(this, arguments, void 0, function (days) {
            var startDate, _a, data, error, baseline_1, error_5;
            if (days === void 0) { days = 7; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        startDate = new Date();
                        startDate.setDate(startDate.getDate() - days);
                        return [4 /*yield*/, this.supabase
                                .from('system_metrics')
                                .select('metric_name, metric_value, timestamp')
                                .eq('metric_type', 'error_count')
                                .gte('timestamp', startDate.toISOString())
                                .order('timestamp')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error || !data) {
                            console.error('Error fetching error baseline:', error);
                            return [2 /*return*/, {}];
                        }
                        baseline_1 = {};
                        data.forEach(function (record) {
                            var errorType = record.metric_name;
                            if (!baseline_1[errorType]) {
                                baseline_1[errorType] = {
                                    total_errors: 0,
                                    daily_averages: [],
                                    peak_hour: null,
                                    trend: 'stable'
                                };
                            }
                            baseline_1[errorType].total_errors += record.metric_value;
                            // Add more baseline calculations as needed
                        });
                        return [2 /*return*/, baseline_1];
                    case 2:
                        error_5 = _b.sent();
                        console.error('Error calculating error baseline:', error_5);
                        return [2 /*return*/, {}];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Flush errors to database
     */
    ErrorTracker.prototype.flushErrors = function () {
        return __awaiter(this, void 0, void 0, function () {
            var errorsToFlush, metrics, error, error_6;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.errorQueue.length === 0)
                            return [2 /*return*/];
                        errorsToFlush = __spreadArray([], this.errorQueue, true);
                        this.errorQueue = [];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        metrics = errorsToFlush.map(function (error) { return ({
                            metric_type: 'error_event',
                            metric_name: error.error_type,
                            metric_value: 1,
                            metric_unit: 'count',
                            metadata: __assign({ error_message: error.error_message, error_stack: error.error_stack, error_code: error.error_code, route_path: error.route_path, user_id: error.user_id, session_id: error.session_id, severity: error.severity, timestamp: error.timestamp }, error.metadata)
                        }); });
                        return [4 /*yield*/, this.supabase
                                .from('system_metrics')
                                .insert(metrics)];
                    case 2:
                        error = (_c.sent()).error;
                        if (error) {
                            console.error('Failed to flush errors:', error);
                            // Re-queue errors on failure
                            (_a = this.errorQueue).unshift.apply(_a, errorsToFlush);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _c.sent();
                        console.error('Error flushing errors:', error_6);
                        (_b = this.errorQueue).unshift.apply(_b, errorsToFlush);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Start periodic error flushing
     */
    ErrorTracker.prototype.startErrorFlushing = function () {
        var _this = this;
        this.flushInterval = setInterval(function () {
            _this.flushErrors();
        }, 5000); // Flush every 5 seconds
    };
    /**
     * Cleanup resources
     */
    ErrorTracker.prototype.destroy = function () {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }
        this.flushErrors(); // Final flush
    };
    return ErrorTracker;
}());
// Export singleton instance
var createerrorTracker = function () { return new ErrorTracker(); };
exports.createerrorTracker = createerrorTracker;
// Utility function for manual error tracking
function trackError(errorType, error, context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, errorTracker.trackError(errorType, error, context)];
        });
    });
}
// React Hook for error boundary integration
function useErrorTracking() {
    return {
        trackError: errorTracker.trackError.bind(errorTracker),
        getErrorSummary: errorTracker.getErrorSummary.bind(errorTracker),
        getErrorBaseline: errorTracker.getErrorBaseline.bind(errorTracker)
    };
}
