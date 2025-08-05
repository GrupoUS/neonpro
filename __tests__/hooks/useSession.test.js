"use strict";
/**
 * @fileoverview Unit tests for useSession hooks
 * @version 1.0.0
 * @since 2024-12-01
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
var vitest_1 = require("vitest");
var react_1 = require("@testing-library/react");
var useSession_1 = require("@/hooks/useSession");
var session_1 = require("@/lib/auth/session");
// Mock SessionManager
vitest_1.vi.mock('@/lib/auth/session');
var MockSessionManager = session_1.SessionManager;
// Mock data
var mockSessionData = {
    id: 'session-123',
    userId: 'user-123',
    deviceId: 'device-123',
    sessionToken: 'token-123',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    isActive: true,
    expiresAt: new Date(Date.now() + 3600000),
    lastActivity: new Date(),
    activityCount: 1,
    securityFlags: {},
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date()
};
var mockSecurityEvent = {
    id: 'event-123',
    userId: 'user-123',
    sessionId: 'session-123',
    eventType: 'unusual_location',
    severity: 'medium',
    ipAddress: '192.168.1.1',
    details: { location: 'Unknown' },
    resolved: false,
    timestamp: new Date(),
    createdAt: new Date()
};
var mockDevice = {
    fingerprint: 'device-fingerprint-123',
    name: 'Test Device',
    type: 'desktop',
    os: 'Windows 10',
    browser: 'Chrome',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};
(0, vitest_1.describe)('useSession', function () {
    var mockSessionManager;
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
        mockSessionManager = {
            getUserSessions: vitest_1.vi.fn(),
            createSession: vitest_1.vi.fn(),
            updateSession: vitest_1.vi.fn(),
            terminateSession: vitest_1.vi.fn(),
            terminateAllUserSessions: vitest_1.vi.fn(),
            detectSuspiciousActivity: vitest_1.vi.fn(),
            applySessionPolicies: vitest_1.vi.fn()
        };
        MockSessionManager.mockImplementation(function () { return mockSessionManager; });
    });
    (0, vitest_1.afterEach)(function () {
        vitest_1.vi.restoreAllMocks();
    });
    (0, vitest_1.it)('should initialize with default state', function () {
        var result = (0, react_1.renderHook)(function () { return (0, useSession_1.useSession)('user-123'); }).result;
        (0, vitest_1.expect)(result.current.sessions).toEqual([]);
        (0, vitest_1.expect)(result.current.activeSessions).toEqual([]);
        (0, vitest_1.expect)(result.current.loading).toBe(true);
        (0, vitest_1.expect)(result.current.error).toBeNull();
    });
    (0, vitest_1.it)('should load user sessions on mount', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockSessionManager.getUserSessions.mockResolvedValue({
                        success: true,
                        data: [mockSessionData]
                    });
                    result = (0, react_1.renderHook)(function () { return (0, useSession_1.useSession)('user-123'); }).result;
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(result.current.loading).toBe(false);
                        })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(result.current.sessions).toEqual([mockSessionData]);
                    (0, vitest_1.expect)(result.current.activeSessions).toEqual([mockSessionData]);
                    (0, vitest_1.expect)(mockSessionManager.getUserSessions).toHaveBeenCalledWith('user-123');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should handle loading error', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockSessionManager.getUserSessions.mockResolvedValue({
                        success: false,
                        error: 'Failed to load sessions'
                    });
                    result = (0, react_1.renderHook)(function () { return (0, useSession_1.useSession)('user-123'); }).result;
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(result.current.loading).toBe(false);
                        })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(result.current.error).toBe('Failed to load sessions');
                    (0, vitest_1.expect)(result.current.sessions).toEqual([]);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should create new session', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockSessionManager.getUserSessions.mockResolvedValue({
                        success: true,
                        data: []
                    });
                    mockSessionManager.createSession.mockResolvedValue({
                        success: true,
                        data: mockSessionData
                    });
                    result = (0, react_1.renderHook)(function () { return (0, useSession_1.useSession)('user-123'); }).result;
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(result.current.loading).toBe(false);
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, result.current.createSession(mockDevice, '192.168.1.1')];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(mockSessionManager.createSession).toHaveBeenCalledWith('user-123', mockDevice, '192.168.1.1', undefined);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should update session activity', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockSessionManager.getUserSessions.mockResolvedValue({
                        success: true,
                        data: [mockSessionData]
                    });
                    mockSessionManager.updateSession.mockResolvedValue({
                        success: true,
                        data: __assign(__assign({}, mockSessionData), { activityCount: 2 })
                    });
                    result = (0, react_1.renderHook)(function () { return (0, useSession_1.useSession)('user-123'); }).result;
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(result.current.loading).toBe(false);
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, result.current.updateActivity('session-123')];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(mockSessionManager.updateSession).toHaveBeenCalledWith('session-123', vitest_1.expect.objectContaining({
                        lastActivity: vitest_1.expect.any(Date),
                        activityCount: vitest_1.expect.any(Number)
                    }));
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should terminate session', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockSessionManager.getUserSessions.mockResolvedValue({
                        success: true,
                        data: [mockSessionData]
                    });
                    mockSessionManager.terminateSession.mockResolvedValue({
                        success: true,
                        data: __assign(__assign({}, mockSessionData), { isActive: false })
                    });
                    result = (0, react_1.renderHook)(function () { return (0, useSession_1.useSession)('user-123'); }).result;
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(result.current.loading).toBe(false);
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, result.current.terminateSession('session-123')];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(mockSessionManager.terminateSession).toHaveBeenCalledWith('session-123');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should terminate all sessions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockSessionManager.getUserSessions.mockResolvedValue({
                        success: true,
                        data: [mockSessionData]
                    });
                    mockSessionManager.terminateAllUserSessions.mockResolvedValue({
                        success: true,
                        data: 1
                    });
                    result = (0, react_1.renderHook)(function () { return (0, useSession_1.useSession)('user-123'); }).result;
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(result.current.loading).toBe(false);
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, result.current.terminateAllSessions()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(mockSessionManager.terminateAllUserSessions).toHaveBeenCalledWith('user-123');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should refresh sessions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockSessionManager.getUserSessions.mockResolvedValue({
                        success: true,
                        data: [mockSessionData]
                    });
                    result = (0, react_1.renderHook)(function () { return (0, useSession_1.useSession)('user-123'); }).result;
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(result.current.loading).toBe(false);
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, result.current.refreshSessions()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(mockSessionManager.getUserSessions).toHaveBeenCalledTimes(2);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should filter active sessions correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var inactiveSession, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    inactiveSession = __assign(__assign({}, mockSessionData), { id: 'session-456', isActive: false });
                    mockSessionManager.getUserSessions.mockResolvedValue({
                        success: true,
                        data: [mockSessionData, inactiveSession]
                    });
                    result = (0, react_1.renderHook)(function () { return (0, useSession_1.useSession)('user-123'); }).result;
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(result.current.loading).toBe(false);
                        })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(result.current.sessions).toHaveLength(2);
                    (0, vitest_1.expect)(result.current.activeSessions).toHaveLength(1);
                    (0, vitest_1.expect)(result.current.activeSessions[0].id).toBe('session-123');
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('useSecurityEvents', function () {
    var mockSessionManager;
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
        mockSessionManager = {
            getSecurityEvents: vitest_1.vi.fn(),
            logSecurityEvent: vitest_1.vi.fn(),
            resolveSecurityEvent: vitest_1.vi.fn()
        };
        MockSessionManager.mockImplementation(function () { return mockSessionManager; });
    });
    (0, vitest_1.it)('should initialize with default state', function () {
        var result = (0, react_1.renderHook)(function () { return (0, useSession_1.useSecurityEvents)('user-123'); }).result;
        (0, vitest_1.expect)(result.current.events).toEqual([]);
        (0, vitest_1.expect)(result.current.unresolvedEvents).toEqual([]);
        (0, vitest_1.expect)(result.current.loading).toBe(true);
        (0, vitest_1.expect)(result.current.error).toBeNull();
    });
    (0, vitest_1.it)('should load security events on mount', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockSessionManager.getSecurityEvents.mockResolvedValue({
                        success: true,
                        data: [mockSecurityEvent]
                    });
                    result = (0, react_1.renderHook)(function () { return (0, useSession_1.useSecurityEvents)('user-123'); }).result;
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(result.current.loading).toBe(false);
                        })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(result.current.events).toEqual([mockSecurityEvent]);
                    (0, vitest_1.expect)(result.current.unresolvedEvents).toEqual([mockSecurityEvent]);
                    (0, vitest_1.expect)(mockSessionManager.getSecurityEvents).toHaveBeenCalledWith('user-123', {});
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should apply filters', function () { return __awaiter(void 0, void 0, void 0, function () {
        var filters, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filters = { severity: 'high', resolved: false };
                    mockSessionManager.getSecurityEvents.mockResolvedValue({
                        success: true,
                        data: []
                    });
                    result = (0, react_1.renderHook)(function () { return (0, useSession_1.useSecurityEvents)('user-123', filters); }).result;
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(result.current.loading).toBe(false);
                        })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(mockSessionManager.getSecurityEvents).toHaveBeenCalledWith('user-123', filters);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should log security event', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockSessionManager.getSecurityEvents.mockResolvedValue({
                        success: true,
                        data: []
                    });
                    mockSessionManager.logSecurityEvent.mockResolvedValue({
                        success: true,
                        data: mockSecurityEvent
                    });
                    result = (0, react_1.renderHook)(function () { return (0, useSession_1.useSecurityEvents)('user-123'); }).result;
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(result.current.loading).toBe(false);
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, result.current.logEvent({
                                            userId: 'user-123',
                                            eventType: 'unusual_location',
                                            severity: 'medium',
                                            ipAddress: '192.168.1.1',
                                            details: { location: 'Unknown' }
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(mockSessionManager.logSecurityEvent).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should resolve security event', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockSessionManager.getSecurityEvents.mockResolvedValue({
                        success: true,
                        data: [mockSecurityEvent]
                    });
                    mockSessionManager.resolveSecurityEvent.mockResolvedValue({
                        success: true,
                        data: __assign(__assign({}, mockSecurityEvent), { resolved: true })
                    });
                    result = (0, react_1.renderHook)(function () { return (0, useSession_1.useSecurityEvents)('user-123'); }).result;
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(result.current.loading).toBe(false);
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, result.current.resolveEvent('event-123', 'admin-123', 'False positive')];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(mockSessionManager.resolveSecurityEvent).toHaveBeenCalledWith('event-123', 'admin-123', 'False positive');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should filter unresolved events correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var resolvedEvent, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    resolvedEvent = __assign(__assign({}, mockSecurityEvent), { id: 'event-456', resolved: true });
                    mockSessionManager.getSecurityEvents.mockResolvedValue({
                        success: true,
                        data: [mockSecurityEvent, resolvedEvent]
                    });
                    result = (0, react_1.renderHook)(function () { return (0, useSession_1.useSecurityEvents)('user-123'); }).result;
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(result.current.loading).toBe(false);
                        })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(result.current.events).toHaveLength(2);
                    (0, vitest_1.expect)(result.current.unresolvedEvents).toHaveLength(1);
                    (0, vitest_1.expect)(result.current.unresolvedEvents[0].id).toBe('event-123');
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('useDeviceManagement', function () {
    var mockSessionManager;
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
        mockSessionManager = {
            getDevices: vitest_1.vi.fn(),
            updateDeviceTrust: vitest_1.vi.fn()
        };
        MockSessionManager.mockImplementation(function () { return mockSessionManager; });
    });
    (0, vitest_1.it)('should initialize with default state', function () {
        var result = (0, react_1.renderHook)(function () { return (0, useSession_1.useDeviceManagement)('user-123'); }).result;
        (0, vitest_1.expect)(result.current.devices).toEqual([]);
        (0, vitest_1.expect)(result.current.trustedDevices).toEqual([]);
        (0, vitest_1.expect)(result.current.suspiciousDevices).toEqual([]);
        (0, vitest_1.expect)(result.current.loading).toBe(true);
        (0, vitest_1.expect)(result.current.error).toBeNull();
    });
    (0, vitest_1.it)('should load devices on mount', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockDeviceData, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockDeviceData = __assign(__assign({ id: 'device-123' }, mockDevice), { trustLevel: 'trusted', status: 'active' });
                    mockSessionManager.getDevices.mockResolvedValue({
                        success: true,
                        data: [mockDeviceData]
                    });
                    result = (0, react_1.renderHook)(function () { return (0, useSession_1.useDeviceManagement)('user-123'); }).result;
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(result.current.loading).toBe(false);
                        })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(result.current.devices).toEqual([mockDeviceData]);
                    (0, vitest_1.expect)(result.current.trustedDevices).toEqual([mockDeviceData]);
                    (0, vitest_1.expect)(mockSessionManager.getDevices).toHaveBeenCalledWith('user-123');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should update device trust level', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockDeviceData, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockDeviceData = __assign(__assign({ id: 'device-123' }, mockDevice), { trustLevel: 'unknown', status: 'active' });
                    mockSessionManager.getDevices.mockResolvedValue({
                        success: true,
                        data: [mockDeviceData]
                    });
                    mockSessionManager.updateDeviceTrust.mockResolvedValue({
                        success: true,
                        data: __assign(__assign({}, mockDeviceData), { trustLevel: 'trusted' })
                    });
                    result = (0, react_1.renderHook)(function () { return (0, useSession_1.useDeviceManagement)('user-123'); }).result;
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(result.current.loading).toBe(false);
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, result.current.updateTrustLevel('device-123', 'trusted')];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(mockSessionManager.updateDeviceTrust).toHaveBeenCalledWith('device-123', 'trusted');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should filter devices by trust level correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var trustedDevice, suspiciousDevice, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    trustedDevice = __assign(__assign({ id: 'device-123' }, mockDevice), { trustLevel: 'trusted', status: 'active' });
                    suspiciousDevice = __assign(__assign({ id: 'device-456' }, mockDevice), { trustLevel: 'suspicious', status: 'active' });
                    mockSessionManager.getDevices.mockResolvedValue({
                        success: true,
                        data: [trustedDevice, suspiciousDevice]
                    });
                    result = (0, react_1.renderHook)(function () { return (0, useSession_1.useDeviceManagement)('user-123'); }).result;
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(result.current.loading).toBe(false);
                        })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(result.current.devices).toHaveLength(2);
                    (0, vitest_1.expect)(result.current.trustedDevices).toHaveLength(1);
                    (0, vitest_1.expect)(result.current.suspiciousDevices).toHaveLength(1);
                    (0, vitest_1.expect)(result.current.trustedDevices[0].id).toBe('device-123');
                    (0, vitest_1.expect)(result.current.suspiciousDevices[0].id).toBe('device-456');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should refresh devices', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockSessionManager.getDevices.mockResolvedValue({
                        success: true,
                        data: []
                    });
                    result = (0, react_1.renderHook)(function () { return (0, useSession_1.useDeviceManagement)('user-123'); }).result;
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(result.current.loading).toBe(false);
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, result.current.refreshDevices()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(mockSessionManager.getDevices).toHaveBeenCalledTimes(2);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should handle loading error', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockSessionManager.getDevices.mockResolvedValue({
                        success: false,
                        error: 'Failed to load devices'
                    });
                    result = (0, react_1.renderHook)(function () { return (0, useSession_1.useDeviceManagement)('user-123'); }).result;
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(result.current.loading).toBe(false);
                        })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(result.current.error).toBe('Failed to load devices');
                    (0, vitest_1.expect)(result.current.devices).toEqual([]);
                    return [2 /*return*/];
            }
        });
    }); });
});
