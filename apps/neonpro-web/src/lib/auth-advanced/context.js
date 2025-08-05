// Session Context Provider
// Story 1.4: Session Management & Security Implementation
'use client';
"use strict";
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
exports.SessionContext = void 0;
exports.SessionProvider = SessionProvider;
exports.useSessionContext = useSessionContext;
var react_1 = require("react");
var config_1 = require("./config");
var session_manager_1 = require("./session-manager");
var security_monitor_1 = require("./security-monitor");
var device_manager_1 = require("./device-manager");
var utils_1 = require("./utils");
// Initial state
var initialState = {
    currentSession: null,
    activeSessions: [],
    sessionMetrics: null,
    securityEvents: [],
    riskScore: 0,
    securityAlerts: [],
    currentDevice: null,
    registeredDevices: [],
    isLoading: false,
    isConnected: false,
    lastActivity: null,
    config: config_1.DEFAULT_SESSION_CONFIG,
};
// Session reducer
function sessionReducer(state, action) {
    switch (action.type) {
        case 'SET_LOADING':
            return __assign(__assign({}, state), { isLoading: action.payload });
        case 'SET_CURRENT_SESSION':
            return __assign(__assign({}, state), { currentSession: action.payload });
        case 'SET_ACTIVE_SESSIONS':
            return __assign(__assign({}, state), { activeSessions: action.payload });
        case 'SET_SESSION_METRICS':
            return __assign(__assign({}, state), { sessionMetrics: action.payload });
        case 'ADD_SECURITY_EVENT':
            return __assign(__assign({}, state), { securityEvents: __spreadArray([action.payload], state.securityEvents, true).slice(0, 100) });
        case 'SET_SECURITY_EVENTS':
            return __assign(__assign({}, state), { securityEvents: action.payload });
        case 'SET_RISK_SCORE':
            return __assign(__assign({}, state), { riskScore: action.payload });
        case 'SET_SECURITY_ALERTS':
            return __assign(__assign({}, state), { securityAlerts: action.payload });
        case 'SET_CURRENT_DEVICE':
            return __assign(__assign({}, state), { currentDevice: action.payload });
        case 'SET_REGISTERED_DEVICES':
            return __assign(__assign({}, state), { registeredDevices: action.payload });
        case 'SET_CONNECTED':
            return __assign(__assign({}, state), { isConnected: action.payload });
        case 'UPDATE_ACTIVITY':
            return __assign(__assign({}, state), { lastActivity: action.payload });
        case 'UPDATE_CONFIG':
            return __assign(__assign({}, state), { config: __assign(__assign({}, state.config), action.payload) });
        case 'RESET_STATE':
            return __assign({}, initialState);
        default:
            return state;
    }
}
var SessionContext = (0, react_1.createContext)(undefined);
exports.SessionContext = SessionContext;
// Session Provider Component
function SessionProvider(_a) {
    var _this = this;
    var _b, _c;
    var children = _a.children, customConfig = _a.config, userId = _a.userId;
    var _d = (0, react_1.useReducer)(sessionReducer, __assign(__assign({}, initialState), { config: __assign(__assign({}, config_1.DEFAULT_SESSION_CONFIG), customConfig) })), state = _d[0], dispatch = _d[1];
    // Service instances
    var sessionManager = new session_manager_1.SessionManager();
    var securityMonitor = new security_monitor_1.SecurityMonitor();
    var deviceManager = new device_manager_1.DeviceManager();
    // WebSocket connection
    var _e = react_1.default.useState(null), ws = _e[0], setWs = _e[1];
    var _f = react_1.default.useState(null), heartbeatInterval = _f[0], setHeartbeatInterval = _f[1];
    // Session methods
    var createSession = (0, react_1.useCallback)(function (userId, deviceInfo) { return __awaiter(_this, void 0, void 0, function () {
        var session, device, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dispatch({ type: 'SET_LOADING', payload: true });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, sessionManager.createSession(userId, deviceInfo)];
                case 2:
                    session = _a.sent();
                    dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
                    return [4 /*yield*/, deviceManager.registerDevice(userId, deviceInfo)];
                case 3:
                    device = _a.sent();
                    dispatch({ type: 'SET_CURRENT_DEVICE', payload: device });
                    // Start monitoring
                    startHeartbeat();
                    connectWebSocket();
                    return [2 /*return*/, session];
                case 4:
                    error_1 = _a.sent();
                    console.error('Failed to create session:', error_1);
                    throw error_1;
                case 5:
                    dispatch({ type: 'SET_LOADING', payload: false });
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, []);
    var extendSession = (0, react_1.useCallback)(function (sessionId) { return __awaiter(_this, void 0, void 0, function () {
        var extendedSession, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, sessionManager.extendSession(sessionId)];
                case 1:
                    extendedSession = _a.sent();
                    dispatch({ type: 'SET_CURRENT_SESSION', payload: extendedSession });
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Failed to extend session:', error_2);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    var terminateSession = (0, react_1.useCallback)(function (sessionId) { return __awaiter(_this, void 0, void 0, function () {
        var activeSessions, error_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, sessionManager.terminateSession(sessionId)];
                case 1:
                    _b.sent();
                    if (((_a = state.currentSession) === null || _a === void 0 ? void 0 : _a.id) === sessionId) {
                        dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
                        stopHeartbeat();
                        disconnectWebSocket();
                    }
                    if (!userId) return [3 /*break*/, 3];
                    return [4 /*yield*/, sessionManager.getActiveSessions(userId)];
                case 2:
                    activeSessions = _b.sent();
                    dispatch({ type: 'SET_ACTIVE_SESSIONS', payload: activeSessions });
                    _b.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_3 = _b.sent();
                    console.error('Failed to terminate session:', error_3);
                    throw error_3;
                case 5: return [2 /*return*/];
            }
        });
    }); }, [(_b = state.currentSession) === null || _b === void 0 ? void 0 : _b.id, userId]);
    var terminateAllSessions = (0, react_1.useCallback)(function (userId) { return __awaiter(_this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, sessionManager.terminateAllSessions(userId)];
                case 1:
                    _a.sent();
                    dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
                    dispatch({ type: 'SET_ACTIVE_SESSIONS', payload: [] });
                    stopHeartbeat();
                    disconnectWebSocket();
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('Failed to terminate all sessions:', error_4);
                    throw error_4;
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    var refreshSession = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var session, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!state.currentSession)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, sessionManager.getSession(state.currentSession.id)];
                case 2:
                    session = _a.sent();
                    if (session) {
                        dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
                    }
                    else {
                        // Session no longer exists
                        dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
                        stopHeartbeat();
                        disconnectWebSocket();
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.error('Failed to refresh session:', error_5);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [state.currentSession]);
    // Security methods
    var reportSecurityEvent = (0, react_1.useCallback)(function (event) { return __awaiter(_this, void 0, void 0, function () {
        var securityEvent, severity, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, securityMonitor.reportSecurityEvent(event)];
                case 1:
                    securityEvent = _a.sent();
                    dispatch({ type: 'ADD_SECURITY_EVENT', payload: securityEvent });
                    // Update risk score
                    return [4 /*yield*/, updateRiskScore()];
                case 2:
                    // Update risk score
                    _a.sent();
                    severity = utils_1.AuthUtils.SecurityEvent.classifyEventSeverity(event.event_type);
                    if (severity === 'high' || severity === 'critical') {
                        dispatch({
                            type: 'SET_SECURITY_ALERTS',
                            payload: __spreadArray([securityEvent], state.securityAlerts, true),
                        });
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_6 = _a.sent();
                    console.error('Failed to report security event:', error_6);
                    throw error_6;
                case 4: return [2 /*return*/];
            }
        });
    }); }, [state.securityAlerts]);
    var clearSecurityAlerts = (0, react_1.useCallback)(function () {
        dispatch({ type: 'SET_SECURITY_ALERTS', payload: [] });
    }, []);
    var updateRiskScore = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var riskScore, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!state.currentSession)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, securityMonitor.calculateRiskScore(state.currentSession.user_id, state.currentSession.id)];
                case 2:
                    riskScore = _a.sent();
                    dispatch({ type: 'SET_RISK_SCORE', payload: riskScore });
                    return [3 /*break*/, 4];
                case 3:
                    error_7 = _a.sent();
                    console.error('Failed to update risk score:', error_7);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [state.currentSession]);
    // Device methods
    var registerDevice = (0, react_1.useCallback)(function (deviceInfo) { return __awaiter(_this, void 0, void 0, function () {
        var device, devices, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!userId)
                        throw new Error('User ID is required');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, deviceManager.registerDevice(userId, deviceInfo)];
                case 2:
                    device = _a.sent();
                    dispatch({ type: 'SET_CURRENT_DEVICE', payload: device });
                    return [4 /*yield*/, deviceManager.getUserDevices(userId)];
                case 3:
                    devices = _a.sent();
                    dispatch({ type: 'SET_REGISTERED_DEVICES', payload: devices });
                    return [2 /*return*/, device];
                case 4:
                    error_8 = _a.sent();
                    console.error('Failed to register device:', error_8);
                    throw error_8;
                case 5: return [2 /*return*/];
            }
        });
    }); }, [userId]);
    var trustDevice = (0, react_1.useCallback)(function (deviceId) { return __awaiter(_this, void 0, void 0, function () {
        var devices, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, deviceManager.trustDevice(deviceId)];
                case 1:
                    _a.sent();
                    if (!userId) return [3 /*break*/, 3];
                    return [4 /*yield*/, deviceManager.getUserDevices(userId)];
                case 2:
                    devices = _a.sent();
                    dispatch({ type: 'SET_REGISTERED_DEVICES', payload: devices });
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_9 = _a.sent();
                    console.error('Failed to trust device:', error_9);
                    throw error_9;
                case 5: return [2 /*return*/];
            }
        });
    }); }, [userId]);
    var blockDevice = (0, react_1.useCallback)(function (deviceId) { return __awaiter(_this, void 0, void 0, function () {
        var devices, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, deviceManager.blockDevice(deviceId)];
                case 1:
                    _a.sent();
                    if (!userId) return [3 /*break*/, 3];
                    return [4 /*yield*/, deviceManager.getUserDevices(userId)];
                case 2:
                    devices = _a.sent();
                    dispatch({ type: 'SET_REGISTERED_DEVICES', payload: devices });
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_10 = _a.sent();
                    console.error('Failed to block device:', error_10);
                    throw error_10;
                case 5: return [2 /*return*/];
            }
        });
    }); }, [userId]);
    // Activity methods
    var updateActivity = (0, react_1.useCallback)(function () {
        var now = new Date();
        dispatch({ type: 'UPDATE_ACTIVITY', payload: now });
        // Update session activity if session exists
        if (state.currentSession) {
            sessionManager.updateActivity(state.currentSession.id).catch(function (error) {
                console.error('Failed to update session activity:', error);
            });
        }
    }, [state.currentSession]);
    var startHeartbeat = (0, react_1.useCallback)(function () {
        if (heartbeatInterval)
            return;
        var interval = setInterval(function () {
            updateActivity();
        }, state.config.heartbeatInterval);
        setHeartbeatInterval(interval);
    }, [heartbeatInterval, state.config.heartbeatInterval, updateActivity]);
    var stopHeartbeat = (0, react_1.useCallback)(function () {
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            setHeartbeatInterval(null);
        }
    }, [heartbeatInterval]);
    // WebSocket methods
    var connectWebSocket = (0, react_1.useCallback)(function () {
        if (ws || !state.config.realTime.enabled)
            return;
        try {
            var websocket_1 = new WebSocket(state.config.realTime.websocketUrl);
            websocket_1.onopen = function () {
                console.log('WebSocket connected');
                dispatch({ type: 'SET_CONNECTED', payload: true });
                // Subscribe to session events
                if (state.currentSession) {
                    websocket_1.send(JSON.stringify({
                        type: 'subscribe',
                        sessionId: state.currentSession.id,
                        userId: state.currentSession.user_id,
                    }));
                }
            };
            websocket_1.onmessage = function (event) {
                try {
                    var data = JSON.parse(event.data);
                    handleWebSocketEvent(data);
                }
                catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };
            websocket_1.onclose = function () {
                console.log('WebSocket disconnected');
                dispatch({ type: 'SET_CONNECTED', payload: false });
                setWs(null);
                // Attempt to reconnect after delay
                setTimeout(function () {
                    if (state.currentSession) {
                        connectWebSocket();
                    }
                }, 5000);
            };
            websocket_1.onerror = function (error) {
                console.error('WebSocket error:', error);
            };
            setWs(websocket_1);
        }
        catch (error) {
            console.error('Failed to connect WebSocket:', error);
        }
    }, [ws, state.config.realTime, state.currentSession]);
    var disconnectWebSocket = (0, react_1.useCallback)(function () {
        if (ws) {
            ws.close();
            setWs(null);
            dispatch({ type: 'SET_CONNECTED', payload: false });
        }
    }, [ws]);
    // Handle WebSocket events
    var handleWebSocketEvent = (0, react_1.useCallback)(function (event) {
        var _a, _b;
        switch (event.type) {
            case 'session_updated':
                if (event.data.session) {
                    dispatch({ type: 'SET_CURRENT_SESSION', payload: event.data.session });
                }
                break;
            case 'session_terminated':
                if (event.data.sessionId === ((_a = state.currentSession) === null || _a === void 0 ? void 0 : _a.id)) {
                    dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
                    stopHeartbeat();
                    disconnectWebSocket();
                }
                break;
            case 'security_alert':
                if (event.data.securityEvent) {
                    dispatch({ type: 'ADD_SECURITY_EVENT', payload: event.data.securityEvent });
                    dispatch({
                        type: 'SET_SECURITY_ALERTS',
                        payload: __spreadArray([event.data.securityEvent], state.securityAlerts, true),
                    });
                }
                break;
            case 'risk_score_updated':
                if (typeof event.data.riskScore === 'number') {
                    dispatch({ type: 'SET_RISK_SCORE', payload: event.data.riskScore });
                }
                break;
            case 'device_blocked':
                if (event.data.deviceId === ((_b = state.currentDevice) === null || _b === void 0 ? void 0 : _b.id)) {
                    // Current device was blocked, terminate session
                    if (state.currentSession) {
                        terminateSession(state.currentSession.id);
                    }
                }
                break;
        }
    }, [state.currentSession, state.currentDevice, state.securityAlerts, terminateSession]);
    // Utility methods
    var isSessionValid = (0, react_1.useCallback)(function () {
        if (!state.currentSession)
            return false;
        return utils_1.AuthUtils.Session.isSessionValid(state.currentSession);
    }, [state.currentSession]);
    var getTimeUntilExpiry = (0, react_1.useCallback)(function () {
        if (!state.currentSession)
            return 0;
        return utils_1.AuthUtils.Session.getTimeUntilExpiry(state.currentSession);
    }, [state.currentSession]);
    var formatSessionDuration = (0, react_1.useCallback)(function () {
        if (!state.currentSession)
            return '0s';
        var duration = utils_1.AuthUtils.Session.getSessionDuration(state.currentSession);
        return utils_1.AuthUtils.Format.formatDuration(duration);
    }, [state.currentSession]);
    // Initialize session data on mount
    (0, react_1.useEffect)(function () {
        if (userId && state.currentSession) {
            // Load active sessions
            sessionManager.getActiveSessions(userId)
                .then(function (sessions) {
                dispatch({ type: 'SET_ACTIVE_SESSIONS', payload: sessions });
            })
                .catch(function (error) {
                console.error('Failed to load active sessions:', error);
            });
            // Load registered devices
            deviceManager.getUserDevices(userId)
                .then(function (devices) {
                dispatch({ type: 'SET_REGISTERED_DEVICES', payload: devices });
            })
                .catch(function (error) {
                console.error('Failed to load registered devices:', error);
            });
            // Load security events
            securityMonitor.getSecurityEvents(userId, { limit: 50 })
                .then(function (events) {
                dispatch({ type: 'SET_SECURITY_EVENTS', payload: events });
            })
                .catch(function (error) {
                console.error('Failed to load security events:', error);
            });
            // Update risk score
            updateRiskScore();
        }
    }, [userId, (_c = state.currentSession) === null || _c === void 0 ? void 0 : _c.id]);
    // Cleanup on unmount
    (0, react_1.useEffect)(function () {
        return function () {
            stopHeartbeat();
            disconnectWebSocket();
        };
    }, []);
    // Context value
    var contextValue = __assign(__assign({}, state), { createSession: createSession, extendSession: extendSession, terminateSession: terminateSession, terminateAllSessions: terminateAllSessions, refreshSession: refreshSession, reportSecurityEvent: reportSecurityEvent, clearSecurityAlerts: clearSecurityAlerts, updateRiskScore: updateRiskScore, registerDevice: registerDevice, trustDevice: trustDevice, blockDevice: blockDevice, updateActivity: updateActivity, startHeartbeat: startHeartbeat, stopHeartbeat: stopHeartbeat, connectWebSocket: connectWebSocket, disconnectWebSocket: disconnectWebSocket, isSessionValid: isSessionValid, getTimeUntilExpiry: getTimeUntilExpiry, formatSessionDuration: formatSessionDuration });
    return (<SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>);
}
// Hook to use session context
function useSessionContext() {
    var context = (0, react_1.useContext)(SessionContext);
    if (context === undefined) {
        throw new Error('useSessionContext must be used within a SessionProvider');
    }
    return context;
}
