"use strict";
/**
 * @fileoverview Unit tests for SessionDashboard component
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
var SessionDashboard_1 = require("@/components/admin/sessions/SessionDashboard");
var useSession_1 = require("@/hooks/useSession");
// Mock hooks
vitest_1.vi.mock('@/hooks/useSession');
var mockUseSession = useSession_1.useSession;
var mockUseSecurityEvents = useSession_1.useSecurityEvents;
var mockUseDeviceManagement = useSession_1.useDeviceManagement;
// Mock UI components
vitest_1.vi.mock('@/components/ui/card', function () { return ({
    Card: function (_a) {
        var children = _a.children, className = _a.className;
        return <div className={className}>{children}</div>;
    },
    CardContent: function (_a) {
        var children = _a.children;
        return <div>{children}</div>;
    },
    CardDescription: function (_a) {
        var children = _a.children;
        return <div>{children}</div>;
    },
    CardHeader: function (_a) {
        var children = _a.children;
        return <div>{children}</div>;
    },
    CardTitle: function (_a) {
        var children = _a.children;
        return <h3>{children}</h3>;
    }
}); });
vitest_1.vi.mock('@/components/ui/tabs', function () { return ({
    Tabs: function (_a) {
        var children = _a.children, defaultValue = _a.defaultValue;
        return <div data-testid="tabs" data-default-value={defaultValue}>{children}</div>;
    },
    TabsContent: function (_a) {
        var children = _a.children, value = _a.value;
        return <div data-testid={"tab-content-".concat(value)}>{children}</div>;
    },
    TabsList: function (_a) {
        var children = _a.children;
        return <div>{children}</div>;
    },
    TabsTrigger: function (_a) {
        var children = _a.children, value = _a.value;
        return <button data-testid={"tab-".concat(value)}>{children}</button>;
    }
}); });
vitest_1.vi.mock('@/components/ui/alert', function () { return ({
    Alert: function (_a) {
        var children = _a.children, variant = _a.variant;
        return <div data-testid="alert" data-variant={variant}>{children}</div>;
    },
    AlertDescription: function (_a) {
        var children = _a.children;
        return <div>{children}</div>;
    }
}); });
vitest_1.vi.mock('@/components/ui/badge', function () { return ({
    Badge: function (_a) {
        var children = _a.children, variant = _a.variant;
        return <span data-testid="badge" data-variant={variant}>{children}</span>;
    }
}); });
vitest_1.vi.mock('@/components/ui/button', function () { return ({
    Button: function (_a) {
        var children = _a.children, onClick = _a.onClick, variant = _a.variant, size = _a.size;
        return (<button onClick={onClick} data-variant={variant} data-size={size}>{children}</button>);
    }
}); });
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
    id: 'device-123',
    fingerprint: 'device-fingerprint-123',
    name: 'Test Device',
    type: 'desktop',
    os: 'Windows 10',
    browser: 'Chrome',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    trustLevel: 'trusted',
    status: 'active',
    firstSeen: new Date(),
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
};
(0, vitest_1.describe)('SessionDashboard', function () {
    var defaultProps = {
        userId: 'user-123'
    };
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
        // Mock useSession hook
        mockUseSession.mockReturnValue({
            sessions: [mockSessionData],
            activeSessions: [mockSessionData],
            loading: false,
            error: null,
            createSession: vitest_1.vi.fn(),
            updateActivity: vitest_1.vi.fn(),
            terminateSession: vitest_1.vi.fn(),
            terminateAllSessions: vitest_1.vi.fn(),
            refreshSessions: vitest_1.vi.fn()
        });
        // Mock useSecurityEvents hook
        mockUseSecurityEvents.mockReturnValue({
            events: [mockSecurityEvent],
            unresolvedEvents: [mockSecurityEvent],
            loading: false,
            error: null,
            logEvent: vitest_1.vi.fn(),
            resolveEvent: vitest_1.vi.fn(),
            refreshEvents: vitest_1.vi.fn()
        });
        // Mock useDeviceManagement hook
        mockUseDeviceManagement.mockReturnValue({
            devices: [mockDevice],
            trustedDevices: [mockDevice],
            suspiciousDevices: [],
            loading: false,
            error: null,
            updateTrustLevel: vitest_1.vi.fn(),
            refreshDevices: vitest_1.vi.fn()
        });
    });
    (0, vitest_1.it)('should render dashboard with all sections', function () {
        (0, react_1.render)(<SessionDashboard_1.SessionDashboard {...defaultProps}/>);
        (0, vitest_1.expect)(react_1.screen.getByText('Session Management Dashboard')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('Monitor and manage user sessions, security events, and device access')).toBeInTheDocument();
        // Check for tabs
        (0, vitest_1.expect)(react_1.screen.getByTestId('tab-overview')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByTestId('tab-sessions')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByTestId('tab-security')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByTestId('tab-devices')).toBeInTheDocument();
    });
    (0, vitest_1.it)('should display session statistics in overview', function () {
        (0, react_1.render)(<SessionDashboard_1.SessionDashboard {...defaultProps}/>);
        (0, vitest_1.expect)(react_1.screen.getByText('Active Sessions')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('1')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('Security Events')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('Trusted Devices')).toBeInTheDocument();
    });
    (0, vitest_1.it)('should show loading state', function () {
        mockUseSession.mockReturnValue({
            sessions: [],
            activeSessions: [],
            loading: true,
            error: null,
            createSession: vitest_1.vi.fn(),
            updateActivity: vitest_1.vi.fn(),
            terminateSession: vitest_1.vi.fn(),
            terminateAllSessions: vitest_1.vi.fn(),
            refreshSessions: vitest_1.vi.fn()
        });
        (0, react_1.render)(<SessionDashboard_1.SessionDashboard {...defaultProps}/>);
        (0, vitest_1.expect)(react_1.screen.getByText('Loading session data...')).toBeInTheDocument();
    });
    (0, vitest_1.it)('should show error state', function () {
        mockUseSession.mockReturnValue({
            sessions: [],
            activeSessions: [],
            loading: false,
            error: 'Failed to load sessions',
            createSession: vitest_1.vi.fn(),
            updateActivity: vitest_1.vi.fn(),
            terminateSession: vitest_1.vi.fn(),
            terminateAllSessions: vitest_1.vi.fn(),
            refreshSessions: vitest_1.vi.fn()
        });
        (0, react_1.render)(<SessionDashboard_1.SessionDashboard {...defaultProps}/>);
        (0, vitest_1.expect)(react_1.screen.getByTestId('alert')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('Failed to load sessions')).toBeInTheDocument();
    });
    (0, vitest_1.it)('should display session details in sessions tab', function () {
        (0, react_1.render)(<SessionDashboard_1.SessionDashboard {...defaultProps}/>);
        // Switch to sessions tab
        react_1.fireEvent.click(react_1.screen.getByTestId('tab-sessions'));
        (0, vitest_1.expect)(react_1.screen.getByText('session-123')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('192.168.1.1')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('Active')).toBeInTheDocument();
    });
    (0, vitest_1.it)('should display security events in security tab', function () {
        (0, react_1.render)(<SessionDashboard_1.SessionDashboard {...defaultProps}/>);
        // Switch to security tab
        react_1.fireEvent.click(react_1.screen.getByTestId('tab-security'));
        (0, vitest_1.expect)(react_1.screen.getByText('event-123')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('unusual_location')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('Medium')).toBeInTheDocument();
    });
    (0, vitest_1.it)('should display devices in devices tab', function () {
        (0, react_1.render)(<SessionDashboard_1.SessionDashboard {...defaultProps}/>);
        // Switch to devices tab
        react_1.fireEvent.click(react_1.screen.getByTestId('tab-devices'));
        (0, vitest_1.expect)(react_1.screen.getByText('Test Device')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('desktop')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('Windows 10')).toBeInTheDocument();
    });
    (0, vitest_1.it)('should handle session termination', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockTerminateSession, terminateButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockTerminateSession = vitest_1.vi.fn().mockResolvedValue({ success: true });
                    mockUseSession.mockReturnValue({
                        sessions: [mockSessionData],
                        activeSessions: [mockSessionData],
                        loading: false,
                        error: null,
                        createSession: vitest_1.vi.fn(),
                        updateActivity: vitest_1.vi.fn(),
                        terminateSession: mockTerminateSession,
                        terminateAllSessions: vitest_1.vi.fn(),
                        refreshSessions: vitest_1.vi.fn()
                    });
                    (0, react_1.render)(<SessionDashboard_1.SessionDashboard {...defaultProps}/>);
                    // Switch to sessions tab
                    react_1.fireEvent.click(react_1.screen.getByTestId('tab-sessions'));
                    terminateButton = react_1.screen.getByText('Terminate');
                    react_1.fireEvent.click(terminateButton);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(mockTerminateSession).toHaveBeenCalledWith('session-123');
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should handle security event resolution', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockResolveEvent, resolveButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockResolveEvent = vitest_1.vi.fn().mockResolvedValue({ success: true });
                    mockUseSecurityEvents.mockReturnValue({
                        events: [mockSecurityEvent],
                        unresolvedEvents: [mockSecurityEvent],
                        loading: false,
                        error: null,
                        logEvent: vitest_1.vi.fn(),
                        resolveEvent: mockResolveEvent,
                        refreshEvents: vitest_1.vi.fn()
                    });
                    (0, react_1.render)(<SessionDashboard_1.SessionDashboard {...defaultProps}/>);
                    // Switch to security tab
                    react_1.fireEvent.click(react_1.screen.getByTestId('tab-security'));
                    resolveButton = react_1.screen.getByText('Resolve');
                    react_1.fireEvent.click(resolveButton);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(mockResolveEvent).toHaveBeenCalledWith('event-123', vitest_1.expect.any(String), vitest_1.expect.any(String));
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should handle device trust level update', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockUpdateTrustLevel, trustButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockUpdateTrustLevel = vitest_1.vi.fn().mockResolvedValue({ success: true });
                    mockUseDeviceManagement.mockReturnValue({
                        devices: [__assign(__assign({}, mockDevice), { trustLevel: 'unknown' })],
                        trustedDevices: [],
                        suspiciousDevices: [],
                        loading: false,
                        error: null,
                        updateTrustLevel: mockUpdateTrustLevel,
                        refreshDevices: vitest_1.vi.fn()
                    });
                    (0, react_1.render)(<SessionDashboard_1.SessionDashboard {...defaultProps}/>);
                    // Switch to devices tab
                    react_1.fireEvent.click(react_1.screen.getByTestId('tab-devices'));
                    trustButton = react_1.screen.getByText('Trust');
                    react_1.fireEvent.click(trustButton);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(mockUpdateTrustLevel).toHaveBeenCalledWith('device-123', 'trusted');
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should refresh data when refresh button is clicked', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockRefreshSessions, mockRefreshEvents, mockRefreshDevices, refreshButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockRefreshSessions = vitest_1.vi.fn();
                    mockRefreshEvents = vitest_1.vi.fn();
                    mockRefreshDevices = vitest_1.vi.fn();
                    mockUseSession.mockReturnValue({
                        sessions: [mockSessionData],
                        activeSessions: [mockSessionData],
                        loading: false,
                        error: null,
                        createSession: vitest_1.vi.fn(),
                        updateActivity: vitest_1.vi.fn(),
                        terminateSession: vitest_1.vi.fn(),
                        terminateAllSessions: vitest_1.vi.fn(),
                        refreshSessions: mockRefreshSessions
                    });
                    mockUseSecurityEvents.mockReturnValue({
                        events: [mockSecurityEvent],
                        unresolvedEvents: [mockSecurityEvent],
                        loading: false,
                        error: null,
                        logEvent: vitest_1.vi.fn(),
                        resolveEvent: vitest_1.vi.fn(),
                        refreshEvents: mockRefreshEvents
                    });
                    mockUseDeviceManagement.mockReturnValue({
                        devices: [mockDevice],
                        trustedDevices: [mockDevice],
                        suspiciousDevices: [],
                        loading: false,
                        error: null,
                        updateTrustLevel: vitest_1.vi.fn(),
                        refreshDevices: mockRefreshDevices
                    });
                    (0, react_1.render)(<SessionDashboard_1.SessionDashboard {...defaultProps}/>);
                    refreshButton = react_1.screen.getByText('Refresh');
                    react_1.fireEvent.click(refreshButton);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(mockRefreshSessions).toHaveBeenCalled();
                            (0, vitest_1.expect)(mockRefreshEvents).toHaveBeenCalled();
                            (0, vitest_1.expect)(mockRefreshDevices).toHaveBeenCalled();
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should show security alerts for unresolved events', function () {
        var highSeverityEvent = __assign(__assign({}, mockSecurityEvent), { id: 'event-456', severity: 'high' });
        mockUseSecurityEvents.mockReturnValue({
            events: [mockSecurityEvent, highSeverityEvent],
            unresolvedEvents: [mockSecurityEvent, highSeverityEvent],
            loading: false,
            error: null,
            logEvent: vitest_1.vi.fn(),
            resolveEvent: vitest_1.vi.fn(),
            refreshEvents: vitest_1.vi.fn()
        });
        (0, react_1.render)(<SessionDashboard_1.SessionDashboard {...defaultProps}/>);
        // Should show alert for high severity events
        (0, vitest_1.expect)(react_1.screen.getByTestId('alert')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText(/high severity security events/i)).toBeInTheDocument();
    });
    (0, vitest_1.it)('should display correct session status badges', function () {
        var expiredSession = __assign(__assign({}, mockSessionData), { id: 'session-456', isActive: false });
        mockUseSession.mockReturnValue({
            sessions: [mockSessionData, expiredSession],
            activeSessions: [mockSessionData],
            loading: false,
            error: null,
            createSession: vitest_1.vi.fn(),
            updateActivity: vitest_1.vi.fn(),
            terminateSession: vitest_1.vi.fn(),
            terminateAllSessions: vitest_1.vi.fn(),
            refreshSessions: vitest_1.vi.fn()
        });
        (0, react_1.render)(<SessionDashboard_1.SessionDashboard {...defaultProps}/>);
        // Switch to sessions tab
        react_1.fireEvent.click(react_1.screen.getByTestId('tab-sessions'));
        // Should show different status badges
        var badges = react_1.screen.getAllByTestId('badge');
        (0, vitest_1.expect)(badges.some(function (badge) { return badge.textContent === 'Active'; })).toBe(true);
        (0, vitest_1.expect)(badges.some(function (badge) { return badge.textContent === 'Inactive'; })).toBe(true);
    });
    (0, vitest_1.it)('should handle empty states', function () {
        mockUseSession.mockReturnValue({
            sessions: [],
            activeSessions: [],
            loading: false,
            error: null,
            createSession: vitest_1.vi.fn(),
            updateActivity: vitest_1.vi.fn(),
            terminateSession: vitest_1.vi.fn(),
            terminateAllSessions: vitest_1.vi.fn(),
            refreshSessions: vitest_1.vi.fn()
        });
        mockUseSecurityEvents.mockReturnValue({
            events: [],
            unresolvedEvents: [],
            loading: false,
            error: null,
            logEvent: vitest_1.vi.fn(),
            resolveEvent: vitest_1.vi.fn(),
            refreshEvents: vitest_1.vi.fn()
        });
        mockUseDeviceManagement.mockReturnValue({
            devices: [],
            trustedDevices: [],
            suspiciousDevices: [],
            loading: false,
            error: null,
            updateTrustLevel: vitest_1.vi.fn(),
            refreshDevices: vitest_1.vi.fn()
        });
        (0, react_1.render)(<SessionDashboard_1.SessionDashboard {...defaultProps}/>);
        (0, vitest_1.expect)(react_1.screen.getByText('No active sessions')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('No security events')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('No devices registered')).toBeInTheDocument();
    });
});
