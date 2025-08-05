"use strict";
/**
 * Subscription Context Test Utilities
 * Provides testing utilities for subscription context and state management
 *
 * @description Comprehensive test utilities for subscription system testing,
 *              including context providers, mock factories, and test helpers
 * @version 1.0.0
 * @created 2025-07-22
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userEvent = exports.createMockResponse = exports.waitFor = exports.createMockSubscriptionHook = exports.renderWithProviders = exports.AllTheProviders = exports.createTestQueryClient = exports.createMockSubscription = exports.createMockUserProfile = void 0;
var react_1 = require("react");
var react_2 = require("@testing-library/react");
var react_query_1 = require("@tanstack/react-query");
// ============================================================================
// Mock Data Factories
// ============================================================================
/**
 * Factory for creating mock user profiles
 */
var createMockUserProfile = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return (__assign({ id: 'test-user-123', email: 'test@example.com', name: 'Test User', role: 'user', createdAt: new Date('2025-01-01'), updatedAt: new Date('2025-07-22') }, overrides));
};
exports.createMockUserProfile = createMockUserProfile;
/**
 * Factory for creating mock subscription statuses
 */
var createMockSubscription = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return (__assign({ id: 'test-subscription-123', userId: 'test-user-123', tier: 'premium', status: 'active', startDate: new Date('2025-01-01'), endDate: new Date('2025-12-31'), autoRenew: true, features: ['feature1', 'feature2', 'premium-feature'], limits: {
            maxUsers: 100,
            maxProjects: 50,
            maxStorage: 10000,
        }, usage: {
            users: 10,
            projects: 5,
            storage: 1000,
        }, metadata: {
            source: 'test',
            environment: 'testing',
        } }, overrides));
};
exports.createMockSubscription = createMockSubscription;
// ============================================================================
// Mock Providers
// ============================================================================
/**
 * Creates a mock QueryClient with disabled retries for testing
 */
var createTestQueryClient = function () {
    return new react_query_1.QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });
};
exports.createTestQueryClient = createTestQueryClient;
var AllTheProviders = function (_a) {
    var children = _a.children, _b = _a.queryClient, queryClient = _b === void 0 ? (0, exports.createTestQueryClient)() : _b;
    return (<react_query_1.QueryClientProvider client={queryClient}>
      {children}
    </react_query_1.QueryClientProvider>);
}; // ============================================================================
exports.AllTheProviders = AllTheProviders;
var renderWithProviders = function (ui, options) {
    if (options === void 0) { options = {}; }
    var queryClient = options.queryClient, renderOptions = __rest(options, ["queryClient"]);
    var Wrapper = function (_a) {
        var children = _a.children;
        return (<exports.AllTheProviders queryClient={queryClient}>
      {children}
    </exports.AllTheProviders>);
    };
    return (0, react_2.render)(ui, __assign({ wrapper: Wrapper }, renderOptions));
};
exports.renderWithProviders = renderWithProviders;
// ============================================================================
// Test Helpers and Utilities
// ============================================================================
/**
 * Creates a mock implementation for subscription hooks
 */
var createMockSubscriptionHook = function (subscription) {
    if (subscription === void 0) { subscription = {}; }
    return ({
        data: (0, exports.createMockSubscription)(subscription),
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
    });
};
exports.createMockSubscriptionHook = createMockSubscriptionHook;
/**
 * Waits for specified time in milliseconds (for async testing)
 */
var waitFor = function (ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
};
exports.waitFor = waitFor;
/**
 * Creates mock server responses for fetch requests
 */
var createMockResponse = function (data, status) {
    if (status === void 0) { status = 200; }
    return ({
        ok: status >= 200 && status < 300,
        status: status,
        json: function () { return Promise.resolve(data); },
        text: function () { return Promise.resolve(JSON.stringify(data)); },
    });
};
exports.createMockResponse = createMockResponse;
// Re-export testing library utilities
__exportStar(require("@testing-library/react"), exports);
var user_event_1 = require("@testing-library/user-event");
Object.defineProperty(exports, "userEvent", { enumerable: true, get: function () { return user_event_1.default; } });
