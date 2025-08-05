"use strict";
// Intelligent Session Timeout System
// Implements activity-based session management with role-specific timeouts
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
exports.IntelligentTimeoutManager = void 0;
exports.getTimeoutManager = getTimeoutManager;
var session_config_1 = require("@/lib/auth/config/session-config");
var session_utils_1 = require("@/lib/auth/utils/session-utils");
var IntelligentTimeoutManager = /** @class */ (function () {
    function IntelligentTimeoutManager() {
        this.activityBuffer = new Map();
        this.timeoutTimers = new Map();
        this.warningTimers = new Map();
        this.activeWarnings = new Map();
        this.sessionExtensions = new Map();
        this.config = session_config_1.SessionConfig.getInstance();
        this.utils = new session_utils_1.SessionUtils();
        this.initializeActivityTracking();
    }
    /**
     * Initialize activity tracking for the current session
     */
    IntelligentTimeoutManager.prototype.initializeActivityTracking = function () {
        var _this = this;
        if (typeof window !== 'undefined') {
            // Mouse movement tracking
            document.addEventListener('mousemove', this.throttle(function () {
                _this.recordActivity('mouse_move');
            }, 1000));
            // Keyboard input tracking
            document.addEventListener('keydown', function () {
                _this.recordActivity('keyboard_input');
            });
            // Click tracking
            document.addEventListener('click', function () {
                _this.recordActivity('click');
            });
            // Scroll tracking
            document.addEventListener('scroll', this.throttle(function () {
                _this.recordActivity('scroll');
            }, 2000));
            // Page visibility change
            document.addEventListener('visibilitychange', function () {
                if (document.visibilityState === 'visible') {
                    _this.recordActivity('page_navigation');
                }
            });
            // Form interaction tracking
            document.addEventListener('input', function () {
                _this.recordActivity('form_interaction');
            });
            // Focus tracking
            window.addEventListener('focus', function () {
                _this.recordActivity('system_interaction');
            });
        }
    };
    /**
     * Start timeout management for a session
     */
    IntelligentTimeoutManager.prototype.startTimeoutManagement = function (session) {
        var _this = this;
        var timeoutConfig = this.getTimeoutConfig(session.userId);
        var timeoutDuration = timeoutConfig.baseTimeout * 60 * 1000; // Convert to milliseconds
        // Clear any existing timers
        this.clearSessionTimers(session.id);
        // Initialize activity buffer
        this.activityBuffer.set(session.id, []);
        this.sessionExtensions.set(session.id, 0);
        // Schedule warning timers
        this.scheduleWarnings(session, timeoutConfig);
        // Schedule main timeout
        var timeoutTimer = setTimeout(function () {
            _this.handleSessionTimeout(session);
        }, timeoutDuration);
        this.timeoutTimers.set(session.id, timeoutTimer);
        console.log("Timeout management started for session ".concat(session.id, " with ").concat(timeoutConfig.baseTimeout, " minute timeout"));
    };
    /**
     * Record user activity
     */
    IntelligentTimeoutManager.prototype.recordActivity = function (type, metadata) {
        var sessionId = this.getCurrentSessionId();
        if (!sessionId)
            return;
        var activity = {
            type: type,
            timestamp: Date.now(),
            sessionId: sessionId,
            userId: this.getCurrentUserId() || '',
            metadata: metadata
        };
        // Add to buffer
        var buffer = this.activityBuffer.get(sessionId) || [];
        buffer.push(activity);
        // Keep only last 100 activities
        if (buffer.length > 100) {
            buffer.shift();
        }
        this.activityBuffer.set(sessionId, buffer);
        // Check if session should be extended based on activity
        this.evaluateSessionExtension(sessionId);
    };
    /**
     * Record API call activity
     */
    IntelligentTimeoutManager.prototype.recordApiActivity = function (endpoint, method) {
        this.recordActivity('api_call', {
            endpoint: endpoint,
            method: method,
            timestamp: Date.now()
        });
    };
    /**
     * Record data entry activity
     */
    IntelligentTimeoutManager.prototype.recordDataEntry = function (formId, fieldCount) {
        this.recordActivity('data_entry', {
            formId: formId,
            fieldCount: fieldCount,
            timestamp: Date.now()
        });
    };
    /**
     * Get timeout configuration for user role
     */
    IntelligentTimeoutManager.prototype.getTimeoutConfig = function (userId) {
        var userRole = this.getUserRole(userId);
        var policy = this.config.getSessionPolicy(userRole);
        return {
            role: userRole,
            baseTimeout: policy.maxSessionDuration,
            warningIntervals: [5, 1], // 5 minutes and 1 minute warnings
            extensionGracePeriod: 15,
            maxExtensions: 3,
            activityThreshold: 2, // 2 activities per minute
            inactivityGracePeriod: 5
        };
    };
    /**
     * Schedule timeout warnings
     */
    IntelligentTimeoutManager.prototype.scheduleWarnings = function (session, config) {
        var _this = this;
        var warnings = [];
        config.warningIntervals.forEach(function (minutesBefore, index) {
            var warningTime = (config.baseTimeout - minutesBefore) * 60 * 1000;
            var warningType = index === config.warningIntervals.length - 1 ? 'final' : 'initial';
            var timer = setTimeout(function () {
                _this.showTimeoutWarning(session, minutesBefore * 60, warningType);
            }, warningTime);
            var warning = {
                id: _this.utils.generateSessionToken(),
                sessionId: session.id,
                warningType: warningType,
                timeRemaining: minutesBefore * 60,
                scheduledAt: Date.now() + warningTime,
                dismissed: false
            };
            warnings.push(warning);
            _this.warningTimers.set("".concat(session.id, "_").concat(warning.id), timer);
        });
        this.activeWarnings.set(session.id, warnings);
    };
    /**
     * Show timeout warning to user
     */
    IntelligentTimeoutManager.prototype.showTimeoutWarning = function (session, timeRemaining, type) {
        var minutes = Math.floor(timeRemaining / 60);
        var seconds = timeRemaining % 60;
        var message = type === 'final'
            ? "Sua sess\u00E3o expirar\u00E1 em ".concat(minutes, ":").concat(seconds.toString().padStart(2, '0'), ". Clique em \"Continuar\" para estender.")
            : "Sua sess\u00E3o expirar\u00E1 em ".concat(minutes, " minutos devido \u00E0 inatividade.");
        // Dispatch custom event for UI to handle
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('sessionTimeoutWarning', {
                detail: {
                    sessionId: session.id,
                    message: message,
                    timeRemaining: timeRemaining,
                    type: type,
                    canExtend: this.canExtendSession(session.id)
                }
            }));
        }
        console.warn("Session timeout warning: ".concat(message));
    };
    /**
     * Extend session timeout
     */
    IntelligentTimeoutManager.prototype.extendSession = function (sessionId, reason) {
        return __awaiter(this, void 0, void 0, function () {
            var response, extensions, session, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.canExtendSession(sessionId)) {
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, fetch('/api/session/extend', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    extendMinutes: this.getTimeoutConfig('').extensionGracePeriod,
                                    reason: reason || 'User activity detected'
                                })
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 4];
                        extensions = this.sessionExtensions.get(sessionId) || 0;
                        this.sessionExtensions.set(sessionId, extensions + 1);
                        return [4 /*yield*/, this.getSessionById(sessionId)];
                    case 3:
                        session = _a.sent();
                        if (session) {
                            this.startTimeoutManagement(session);
                        }
                        // Dismiss active warnings
                        this.dismissWarnings(sessionId);
                        console.log("Session ".concat(sessionId, " extended successfully"));
                        return [2 /*return*/, true];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.error('Failed to extend session:', error_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * Check if session can be extended
     */
    IntelligentTimeoutManager.prototype.canExtendSession = function (sessionId) {
        var extensions = this.sessionExtensions.get(sessionId) || 0;
        var config = this.getTimeoutConfig('');
        return extensions < config.maxExtensions;
    };
    /**
     * Evaluate if session should be automatically extended based on activity
     */
    IntelligentTimeoutManager.prototype.evaluateSessionExtension = function (sessionId) {
        var activities = this.activityBuffer.get(sessionId) || [];
        var now = Date.now();
        var recentActivities = activities.filter(function (a) { return now - a.timestamp < 60000; }); // Last minute
        var config = this.getTimeoutConfig('');
        if (recentActivities.length >= config.activityThreshold) {
            // High activity detected, consider auto-extension
            var warnings = this.activeWarnings.get(sessionId) || [];
            var hasActiveWarnings = warnings.some(function (w) { return !w.dismissed; });
            if (hasActiveWarnings && this.canExtendSession(sessionId)) {
                this.extendSession(sessionId, 'High user activity detected');
            }
        }
    };
    /**
     * Handle session timeout
     */
    IntelligentTimeoutManager.prototype.handleSessionTimeout = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var activities, now_1, recentActivity, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        activities = this.activityBuffer.get(session.id) || [];
                        now_1 = Date.now();
                        recentActivity = activities.find(function (a) { return now_1 - a.timestamp < 30000; });
                        if (!(recentActivity && this.canExtendSession(session.id))) return [3 /*break*/, 2];
                        // Grace period extension for recent activity
                        return [4 /*yield*/, this.extendSession(session.id, 'Grace period for recent activity')];
                    case 1:
                        // Grace period extension for recent activity
                        _a.sent();
                        return [2 /*return*/];
                    case 2: 
                    // Terminate session
                    return [4 /*yield*/, fetch('/api/session/terminate', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                reason: 'Session timeout due to inactivity'
                            })
                        })];
                    case 3:
                        // Terminate session
                        _a.sent();
                        // Clean up
                        this.clearSessionTimers(session.id);
                        this.activityBuffer.delete(session.id);
                        this.sessionExtensions.delete(session.id);
                        this.activeWarnings.delete(session.id);
                        // Notify user
                        if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('sessionExpired', {
                                detail: {
                                    sessionId: session.id,
                                    reason: 'Session expired due to inactivity'
                                }
                            }));
                        }
                        console.log("Session ".concat(session.id, " timed out and terminated"));
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.error('Error handling session timeout:', error_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Dismiss timeout warnings
     */
    IntelligentTimeoutManager.prototype.dismissWarnings = function (sessionId) {
        var _this = this;
        var warnings = this.activeWarnings.get(sessionId) || [];
        warnings.forEach(function (warning) {
            warning.dismissed = true;
            var timerId = "".concat(sessionId, "_").concat(warning.id);
            var timer = _this.warningTimers.get(timerId);
            if (timer) {
                clearTimeout(timer);
                _this.warningTimers.delete(timerId);
            }
        });
    };
    /**
     * Clear all timers for a session
     */
    IntelligentTimeoutManager.prototype.clearSessionTimers = function (sessionId) {
        var _this = this;
        // Clear main timeout timer
        var timeoutTimer = this.timeoutTimers.get(sessionId);
        if (timeoutTimer) {
            clearTimeout(timeoutTimer);
            this.timeoutTimers.delete(sessionId);
        }
        // Clear warning timers
        var warnings = this.activeWarnings.get(sessionId) || [];
        warnings.forEach(function (warning) {
            var timerId = "".concat(sessionId, "_").concat(warning.id);
            var timer = _this.warningTimers.get(timerId);
            if (timer) {
                clearTimeout(timer);
                _this.warningTimers.delete(timerId);
            }
        });
    };
    /**
     * Get session activity analytics
     */
    IntelligentTimeoutManager.prototype.getSessionActivity = function (sessionId) {
        var activities = this.activityBuffer.get(sessionId) || [];
        var now = Date.now();
        var recentActivities = activities.filter(function (a) { return now - a.timestamp < 300000; }); // Last 5 minutes
        var activityTypes = {
            mouse_move: 0,
            keyboard_input: 0,
            click: 0,
            scroll: 0,
            page_navigation: 0,
            api_call: 0,
            form_interaction: 0,
            file_upload: 0,
            data_entry: 0,
            system_interaction: 0
        };
        activities.forEach(function (activity) {
            activityTypes[activity.type]++;
        });
        var lastActivity = activities.length > 0 ? activities[activities.length - 1].timestamp : 0;
        var activityScore = Math.min(100, (recentActivities.length / 10) * 100); // Score out of 100
        return {
            totalActivities: activities.length,
            recentActivities: recentActivities.length,
            activityTypes: activityTypes,
            lastActivity: lastActivity,
            activityScore: activityScore
        };
    };
    /**
     * Stop timeout management for a session
     */
    IntelligentTimeoutManager.prototype.stopTimeoutManagement = function (sessionId) {
        this.clearSessionTimers(sessionId);
        this.activityBuffer.delete(sessionId);
        this.sessionExtensions.delete(sessionId);
        this.activeWarnings.delete(sessionId);
    };
    /**
     * Utility functions
     */
    IntelligentTimeoutManager.prototype.throttle = function (func, limit) {
        var inThrottle;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(function () { return inThrottle = false; }, limit);
            }
        };
    };
    IntelligentTimeoutManager.prototype.getCurrentSessionId = function () {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sessionId');
        }
        return null;
    };
    IntelligentTimeoutManager.prototype.getCurrentUserId = function () {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('userId');
        }
        return null;
    };
    IntelligentTimeoutManager.prototype.getUserRole = function (userId) {
        // This would typically come from user context or API
        // For now, return a default role
        return 'patient';
    };
    IntelligentTimeoutManager.prototype.getSessionById = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, fetch("/api/session/validate?sessionId=".concat(sessionId))];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, data.session];
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        console.error('Failed to get session:', error_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, null];
                }
            });
        });
    };
    return IntelligentTimeoutManager;
}());
exports.IntelligentTimeoutManager = IntelligentTimeoutManager;
// Singleton instance
var timeoutManager = null;
function getTimeoutManager() {
    if (!timeoutManager) {
        timeoutManager = new IntelligentTimeoutManager();
    }
    return timeoutManager;
}
// Export for use in React components
exports.default = IntelligentTimeoutManager;
