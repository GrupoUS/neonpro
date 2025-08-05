/**
 * Real-time Subscription Status Hook
 *
 * React hook that provides real-time subscription status updates with
 * automatic UI synchronization and state management.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */
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
exports.useSubscriptionStatus = useSubscriptionStatus;
exports.useSubscriptionStatusSimple = useSubscriptionStatusSimple;
exports.useSubscriptionFeatures = useSubscriptionFeatures;
var react_1 = require("react");
var auth_context_1 = require("../contexts/auth-context");
var subscription_realtime_1 = require("../lib/subscription-realtime");
/**
 * Hook for real-time subscription status management
 *
 * @param options Configuration options for the hook
 * @returns Subscription state, actions, and utilities
 */
function useSubscriptionStatus(options) {
    var _this = this;
    if (options === void 0) { options = {}; }
    var user = (0, auth_context_1.useAuth)().user;
    var _a = (0, react_1.useState)({
        status: 'trialing',
        tier: null,
        features: [],
        gracePeriodEnd: null,
        nextBilling: null,
        isLoading: false,
        isConnected: false,
        lastUpdate: null,
        error: null
    }), state = _a[0], setState = _a[1];
    var _b = (0, react_1.useState)([]), events = _b[0], setEvents = _b[1];
    var _c = (0, react_1.useState)({
        connectionsActive: 0,
        messagesReceived: 0,
        messagesSent: 0,
        reconnectAttempts: 0,
        lastConnected: '',
        uptime: 0,
        latency: 0
    }), metrics = _c[0], setMetrics = _c[1];
    var unsubscribeRef = (0, react_1.useRef)(null);
    var optionsRef = (0, react_1.useRef)(options);
    // Update options ref when options change
    (0, react_1.useEffect)(function () {
        optionsRef.current = options;
    }, [options]);
    /**
     * Handle subscription status updates
     */
    var handleSubscriptionUpdate = (0, react_1.useCallback)(function (update) {
        var status = update.status, previousStatus = update.previousStatus, _a = update.metadata, metadata = _a === void 0 ? {} : _a, event = update.event, timestamp = update.timestamp;
        if (optionsRef.current.enableLogging) {
            console.log("[useSubscriptionStatus] Received update:", update);
        }
        // Add event to history (keep last 50 events)
        setEvents(function (prev) { return __spreadArray([update], prev.slice(0, 49), true); });
        // Update state
        setState(function (prevState) { return (__assign(__assign({}, prevState), { status: status, tier: metadata.tier || prevState.tier, features: metadata.features || prevState.features, gracePeriodEnd: metadata.gracePeriodEnd || prevState.gracePeriodEnd, nextBilling: metadata.nextBilling || prevState.nextBilling, lastUpdate: timestamp, isLoading: false, error: null })); });
        // Trigger status change callback
        if (optionsRef.current.onStatusChange && previousStatus !== status) {
            optionsRef.current.onStatusChange(status, previousStatus);
        }
        // Handle specific events
        switch (event) {
            case 'subscription_expired':
            case 'subscription_cancelled':
                if (optionsRef.current.enableLogging) {
                    console.warn("[useSubscriptionStatus] Subscription ".concat(event));
                }
                break;
            case 'subscription_activated':
            case 'subscription_upgraded':
                if (optionsRef.current.enableLogging) {
                    console.info("[useSubscriptionStatus] Subscription ".concat(event));
                }
                break;
            case 'payment_failed':
                setState(function (prev) { return (__assign(__assign({}, prev), { error: 'Payment failed. Please update your payment method.' })); });
                if (optionsRef.current.onError) {
                    optionsRef.current.onError('Payment failed. Please update your payment method.');
                }
                break;
        }
    }, []);
    /**
     * Connect to real-time updates
     */
    var connect = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var unsubscribe, errorMessage_1;
        return __generator(this, function (_a) {
            if (!(user === null || user === void 0 ? void 0 : user.id) || unsubscribeRef.current) {
                return [2 /*return*/];
            }
            setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: true })); });
            try {
                unsubscribe = subscription_realtime_1.subscriptionRealtimeManager.subscribe(user.id, handleSubscriptionUpdate);
                unsubscribeRef.current = unsubscribe;
                setState(function (prev) { return (__assign(__assign({}, prev), { isConnected: true, isLoading: false, error: null })); });
                if (optionsRef.current.onConnect) {
                    optionsRef.current.onConnect();
                }
                if (optionsRef.current.enableLogging) {
                    console.log("[useSubscriptionStatus] Connected for user ".concat(user.id));
                }
            }
            catch (error) {
                errorMessage_1 = error instanceof Error ? error.message : 'Failed to connect';
                setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: false, error: errorMessage_1 })); });
                if (optionsRef.current.onError) {
                    optionsRef.current.onError(errorMessage_1);
                }
            }
            return [2 /*return*/];
        });
    }); }, [user === null || user === void 0 ? void 0 : user.id, handleSubscriptionUpdate]);
    /**
     * Disconnect from real-time updates
     */
    var disconnect = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
            setState(function (prev) { return (__assign(__assign({}, prev), { isConnected: false, isLoading: false })); });
            if (optionsRef.current.onDisconnect) {
                optionsRef.current.onDisconnect();
            }
            if (optionsRef.current.enableLogging) {
                console.log("[useSubscriptionStatus] Disconnected");
            }
            return [2 /*return*/];
        });
    }); }, []);
    /**
     * Refresh subscription status
     */
    var refresh = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1, errorMessage_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(user === null || user === void 0 ? void 0 : user.id)) {
                        return [2 /*return*/];
                    }
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: true })); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, subscription_realtime_1.subscriptionRealtimeManager.forceRefresh(user.id)];
                case 2:
                    _a.sent();
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: false })); });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    errorMessage_2 = error_1 instanceof Error ? error_1.message : 'Failed to refresh';
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: false, error: errorMessage_2 })); });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [user === null || user === void 0 ? void 0 : user.id]);
    /**
     * Clear current error
     */
    var clearError = (0, react_1.useCallback)(function () {
        setState(function (prev) { return (__assign(__assign({}, prev), { error: null })); });
    }, []);
    /**
     * Check if user can access a specific feature
     */
    var canAccessFeature = (0, react_1.useCallback)(function (feature) {
        if (!state.features.length) {
            return false;
        }
        return state.features.includes(feature);
    }, [state.features]);
    // Update metrics periodically
    (0, react_1.useEffect)(function () {
        var updateMetrics = function () {
            setMetrics(subscription_realtime_1.subscriptionRealtimeManager.getMetrics());
        };
        updateMetrics();
        var interval = setInterval(updateMetrics, 5000); // Update every 5 seconds
        return function () { return clearInterval(interval); };
    }, []);
    // Auto-connect on mount if enabled
    (0, react_1.useEffect)(function () {
        if (options.autoConnect !== false && (user === null || user === void 0 ? void 0 : user.id)) {
            connect();
        }
        return function () {
            disconnect();
        };
    }, [user === null || user === void 0 ? void 0 : user.id, connect, disconnect, options.autoConnect]);
    // Update connection status based on realtime manager
    (0, react_1.useEffect)(function () {
        var checkConnection = function () {
            var isConnected = subscription_realtime_1.subscriptionRealtimeManager.isConnectedToRealtime();
            setState(function (prev) { return (__assign(__assign({}, prev), { isConnected: isConnected })); });
        };
        var interval = setInterval(checkConnection, 1000); // Check every second
        return function () { return clearInterval(interval); };
    }, []);
    // Computed values
    var isExpired = state.status === 'expired' || state.status === 'cancelled';
    var isActive = state.status === 'active' || state.status === 'trialing';
    return __assign(__assign({}, state), { 
        // Computed values
        isExpired: isExpired, isActive: isActive, 
        // Actions
        connect: connect, disconnect: disconnect, refresh: refresh, clearError: clearError, canAccessFeature: canAccessFeature, 
        // Additional data
        metrics: metrics, events: events });
}
/**
 * Simplified hook for just subscription status (no real-time updates)
 */
function useSubscriptionStatusSimple() {
    var _this = this;
    var user = (0, auth_context_1.useAuth)().user;
    var _a = (0, react_1.useState)(null), status = _a[0], setStatus = _a[1];
    var _b = (0, react_1.useState)(false), isLoading = _b[0], setIsLoading = _b[1];
    (0, react_1.useEffect)(function () {
        if (!(user === null || user === void 0 ? void 0 : user.id))
            return;
        var fetchStatus = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                setIsLoading(true);
                try {
                    // This would typically call your subscription service
                    // For now, we'll use a placeholder
                    setStatus('active');
                }
                catch (error) {
                    console.error('Failed to fetch subscription status:', error);
                }
                finally {
                    setIsLoading(false);
                }
                return [2 /*return*/];
            });
        }); };
        fetchStatus();
    }, [user === null || user === void 0 ? void 0 : user.id]);
    return {
        status: status,
        isLoading: isLoading,
        isActive: status === 'active' || status === 'trialing',
        isExpired: status === 'expired' || status === 'cancelled'
    };
}
/**
 * Hook for subscription feature access checking
 */
function useSubscriptionFeatures() {
    var _a = useSubscriptionStatus({
        autoConnect: true
    }), features = _a.features, tier = _a.tier, canAccessFeature = _a.canAccessFeature;
    return {
        features: features,
        tier: tier,
        canAccess: canAccessFeature,
        hasBasicFeatures: tier === 'basic' || tier === 'premium' || tier === 'enterprise',
        hasPremiumFeatures: tier === 'premium' || tier === 'enterprise',
        hasEnterpriseFeatures: tier === 'enterprise'
    };
}
