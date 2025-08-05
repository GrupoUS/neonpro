"use strict";
/**
 * Custom React Hook for Multi-Factor Authentication
 *
 * Provides comprehensive MFA functionality with healthcare compliance,
 * real-time updates, and error handling for the NeonPro platform.
 *
 * Features:
 * - MFA setup and verification
 * - Real-time MFA settings updates
 * - Backup code management
 * - Device trust management
 * - Emergency bypass handling
 * - Comprehensive error handling
 * - Healthcare compliance logging
 *
 * @version 1.0.0
 * @author NeonPro Development Team
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
exports.useMFA = useMFA;
exports.useMFAStatistics = useMFAStatistics;
var react_1 = require("react");
var mfa_1 = require("@/lib/auth/mfa");
var auth_1 = require("@/types/auth");
// Hook options with defaults
var DEFAULT_OPTIONS = {
    userId: '',
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
};
/**
 * Custom hook for comprehensive MFA management
 */
function useMFA(options) {
    var _this = this;
    var opts = __assign(__assign({}, DEFAULT_OPTIONS), options);
    // State management
    var _a = (0, react_1.useState)(null), mfaSettings = _a[0], setMfaSettings = _a[1];
    var _b = (0, react_1.useState)(true), isLoading = _b[0], setIsLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    // Refs for cleanup and optimization
    var refreshIntervalRef = (0, react_1.useRef)();
    var abortControllerRef = (0, react_1.useRef)();
    var mfaServiceRef = (0, react_1.useRef)((0, mfa_1.getMFAService)());
    /**
     * Fetch MFA settings from the server
     */
    var fetchMFASettings = (0, react_1.useCallback)(function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (showLoading) {
            var settings, err_1, error_1;
            if (showLoading === void 0) { showLoading = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!opts.userId)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        if (showLoading)
                            setIsLoading(true);
                        setError(null);
                        // Cancel any ongoing requests
                        if (abortControllerRef.current) {
                            abortControllerRef.current.abort();
                        }
                        abortControllerRef.current = new AbortController();
                        return [4 /*yield*/, mfaServiceRef.current.getUserMFASettings(opts.userId)];
                    case 2:
                        settings = _a.sent();
                        setMfaSettings(settings);
                        // Emit event for analytics/monitoring
                        emitMFAEvent('mfa:settings:loaded', {
                            userId: opts.userId,
                            isEnabled: (settings === null || settings === void 0 ? void 0 : settings.isEnabled) || false,
                            methodCount: (settings === null || settings === void 0 ? void 0 : settings.methods.length) || 0,
                        });
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _a.sent();
                        error_1 = err_1 instanceof Error ? err_1 : new Error('Failed to fetch MFA settings');
                        setError(error_1);
                        // Emit error event
                        emitMFAEvent('mfa:settings:error', {
                            userId: opts.userId,
                            error: error_1.message,
                        });
                        console.error('Failed to fetch MFA settings:', error_1);
                        return [3 /*break*/, 5];
                    case 4:
                        if (showLoading)
                            setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }, [opts.userId]);
    /**
     * Setup MFA for the user
     */
    var setupMFA = (0, react_1.useCallback)(function (request) { return __awaiter(_this, void 0, void 0, function () {
        var deviceFingerprint, result, err_2, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!opts.userId) {
                        throw new auth_1.MFAError('User ID is required', 'INVALID_USER_ID');
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    setIsLoading(true);
                    setError(null);
                    // Emit setup started event
                    emitMFAEvent('mfa:setup:started', {
                        userId: opts.userId,
                        method: request.method,
                    });
                    return [4 /*yield*/, getDeviceFingerprint()];
                case 2:
                    deviceFingerprint = _a.sent();
                    return [4 /*yield*/, mfaServiceRef.current.setupMFA(opts.userId, request.method, {
                            phoneNumber: request.phoneNumber,
                            deviceName: request.deviceName,
                            lgpdConsent: request.lgpdConsent,
                            userAgent: request.userAgent,
                            ipAddress: request.ipAddress,
                        })];
                case 3:
                    result = _a.sent();
                    // Refresh settings after successful setup
                    return [4 /*yield*/, fetchMFASettings(false)];
                case 4:
                    // Refresh settings after successful setup
                    _a.sent();
                    // Emit success event
                    emitMFAEvent('mfa:setup:completed', {
                        userId: opts.userId,
                        method: request.method,
                        backupCodesCount: result.backupCodes.length,
                    });
                    return [2 /*return*/, result];
                case 5:
                    err_2 = _a.sent();
                    error_2 = err_2 instanceof Error ? err_2 : new Error('MFA setup failed');
                    setError(error_2);
                    // Emit error event
                    emitMFAEvent('mfa:setup:failed', {
                        userId: opts.userId,
                        error: error_2.message,
                    });
                    throw error_2;
                case 6:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); }, [opts.userId, fetchMFASettings]);
    /**
     * Verify MFA token
     */
    var verifyMFA = (0, react_1.useCallback)(function (request) { return __awaiter(_this, void 0, void 0, function () {
        var deviceFingerprint, _a, result, err_3, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!opts.userId) {
                        throw new auth_1.MFAError('User ID is required', 'INVALID_USER_ID');
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, 7, 8]);
                    setIsLoading(true);
                    setError(null);
                    // Emit verification started event
                    emitMFAEvent('mfa:verify:started', {
                        userId: opts.userId,
                        method: request.method,
                    });
                    _a = request.deviceFingerprint;
                    if (_a) return [3 /*break*/, 3];
                    return [4 /*yield*/, getDeviceFingerprint()];
                case 2:
                    _a = (_b.sent());
                    _b.label = 3;
                case 3:
                    deviceFingerprint = _a;
                    return [4 /*yield*/, mfaServiceRef.current.verifyMFA(opts.userId, request.token, request.method, {
                            deviceFingerprint: deviceFingerprint,
                            userAgent: request.userAgent,
                            ipAddress: request.ipAddress,
                            emergencyBypass: request.emergencyBypass,
                            emergencyReason: request.emergencyReason,
                        })];
                case 4:
                    result = _b.sent();
                    // Refresh settings after verification
                    return [4 /*yield*/, fetchMFASettings(false)];
                case 5:
                    // Refresh settings after verification
                    _b.sent();
                    // Emit appropriate event based on result
                    if (result.isValid) {
                        emitMFAEvent('mfa:verify:success', {
                            userId: opts.userId,
                            method: request.method,
                            isEmergencyBypass: result.isEmergencyBypass,
                        });
                    }
                    else if (result.lockedUntil) {
                        emitMFAEvent('mfa:verify:locked', {
                            userId: opts.userId,
                            lockedUntil: result.lockedUntil,
                            remainingAttempts: result.remainingAttempts,
                        });
                    }
                    else {
                        emitMFAEvent('mfa:verify:failed', {
                            userId: opts.userId,
                            method: request.method,
                            remainingAttempts: result.remainingAttempts,
                        });
                    }
                    return [2 /*return*/, result];
                case 6:
                    err_3 = _b.sent();
                    error_3 = err_3 instanceof Error ? err_3 : new Error('MFA verification failed');
                    setError(error_3);
                    // Emit error event
                    emitMFAEvent('mfa:verify:failed', {
                        userId: opts.userId,
                        error: error_3.message,
                    });
                    throw error_3;
                case 7:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); }, [opts.userId, fetchMFASettings]);
    /**
     * Disable MFA for the user
     */
    var disableMFA = (0, react_1.useCallback)(function (reason) { return __awaiter(_this, void 0, void 0, function () {
        var _a, _b, _c, err_4, error_4;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!opts.userId) {
                        throw new auth_1.MFAError('User ID is required', 'INVALID_USER_ID');
                    }
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 5, 6, 7]);
                    setIsLoading(true);
                    setError(null);
                    _b = (_a = mfaServiceRef.current).disableMFA;
                    _c = [opts.userId];
                    _d = {
                        reason: reason,
                        userAgent: navigator.userAgent
                    };
                    return [4 /*yield*/, getUserIpAddress()];
                case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([(_d.ipAddress = _e.sent(),
                            _d)]))];
                case 3:
                    _e.sent();
                    // Refresh settings after disabling
                    return [4 /*yield*/, fetchMFASettings(false)];
                case 4:
                    // Refresh settings after disabling
                    _e.sent();
                    // Emit disabled event
                    emitMFAEvent('mfa:disabled', {
                        userId: opts.userId,
                        reason: reason,
                    });
                    return [3 /*break*/, 7];
                case 5:
                    err_4 = _e.sent();
                    error_4 = err_4 instanceof Error ? err_4 : new Error('Failed to disable MFA');
                    setError(error_4);
                    throw error_4;
                case 6:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); }, [opts.userId, fetchMFASettings]);
    /**
     * Generate new backup codes
     */
    var generateBackupCodes = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var backupCodes, _a, _b, _c, err_5, error_5;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!opts.userId) {
                        throw new auth_1.MFAError('User ID is required', 'INVALID_USER_ID');
                    }
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 5, 6, 7]);
                    setIsLoading(true);
                    setError(null);
                    _b = (_a = mfaServiceRef.current).generateNewBackupCodes;
                    _c = [opts.userId];
                    _d = {
                        userAgent: navigator.userAgent
                    };
                    return [4 /*yield*/, getUserIpAddress()];
                case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([(_d.ipAddress = _e.sent(),
                            _d)]))];
                case 3:
                    backupCodes = _e.sent();
                    // Refresh settings after generating codes
                    return [4 /*yield*/, fetchMFASettings(false)];
                case 4:
                    // Refresh settings after generating codes
                    _e.sent();
                    // Emit backup codes generated event
                    emitMFAEvent('mfa:backup_codes:generated', {
                        userId: opts.userId,
                        codesCount: backupCodes.length,
                    });
                    return [2 /*return*/, backupCodes];
                case 5:
                    err_5 = _e.sent();
                    error_5 = err_5 instanceof Error ? err_5 : new Error('Failed to generate backup codes');
                    setError(error_5);
                    throw error_5;
                case 6:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); }, [opts.userId, fetchMFASettings]);
    /**
     * Send SMS OTP
     */
    var sendSMSOTP = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var result, _a, _b, _c, err_6, error_6;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!opts.userId) {
                        throw new auth_1.MFAError('User ID is required', 'INVALID_USER_ID');
                    }
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 4, 5, 6]);
                    setIsLoading(true);
                    setError(null);
                    _b = (_a = mfaServiceRef.current).sendSMSOTP;
                    _c = [opts.userId];
                    _d = {
                        userAgent: navigator.userAgent
                    };
                    return [4 /*yield*/, getUserIpAddress()];
                case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([(_d.ipAddress = _e.sent(),
                            _d)]))];
                case 3:
                    result = _e.sent();
                    // Emit SMS sent event
                    emitMFAEvent('mfa:sms:sent', {
                        userId: opts.userId,
                        expiresIn: result.expiresIn,
                    });
                    return [2 /*return*/, result];
                case 4:
                    err_6 = _e.sent();
                    error_6 = err_6 instanceof Error ? err_6 : new Error('Failed to send SMS OTP');
                    setError(error_6);
                    throw error_6;
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [opts.userId]);
    /**
     * Refresh MFA settings manually
     */
    var refresh = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchMFASettings(true)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [fetchMFASettings]);
    // Setup auto-refresh interval
    (0, react_1.useEffect)(function () {
        if (opts.autoRefresh && opts.refreshInterval > 0) {
            refreshIntervalRef.current = setInterval(function () {
                fetchMFASettings(false);
            }, opts.refreshInterval);
            return function () {
                if (refreshIntervalRef.current) {
                    clearInterval(refreshIntervalRef.current);
                }
            };
        }
    }, [opts.autoRefresh, opts.refreshInterval, fetchMFASettings]);
    // Initial fetch
    (0, react_1.useEffect)(function () {
        fetchMFASettings(true);
        // Cleanup on unmount
        return function () {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchMFASettings]);
    return {
        mfaSettings: mfaSettings,
        isLoading: isLoading,
        error: error,
        setupMFA: setupMFA,
        verifyMFA: verifyMFA,
        disableMFA: disableMFA,
        generateBackupCodes: generateBackupCodes,
        sendSMSOTP: sendSMSOTP,
        refresh: refresh,
    };
}
/**
 * Utility functions
 */
/**
 * Generate device fingerprint for device identification
 */
function getDeviceFingerprint() {
    return __awaiter(this, void 0, void 0, function () {
        var fingerprint, encoder, data, hashBuffer, hashArray, hashHex;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fingerprint = {
                        userAgent: navigator.userAgent,
                        language: navigator.language,
                        platform: navigator.platform,
                        screenResolution: "".concat(screen.width, "x").concat(screen.height),
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        cookiesEnabled: navigator.cookieEnabled,
                    };
                    encoder = new TextEncoder();
                    data = encoder.encode(JSON.stringify(fingerprint));
                    return [4 /*yield*/, crypto.subtle.digest('SHA-256', data)];
                case 1:
                    hashBuffer = _a.sent();
                    hashArray = Array.from(new Uint8Array(hashBuffer));
                    hashHex = hashArray.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
                    return [2 /*return*/, hashHex];
            }
        });
    });
}
/**
 * Get user's IP address (client-side approximation)
 */
function getUserIpAddress() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // In production, this would call your backend to get the real IP
                // For now, return a placeholder
                return [2 /*return*/, '0.0.0.0'];
            }
            catch (_b) {
                return [2 /*return*/, '0.0.0.0'];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Emit MFA events for analytics and monitoring
 */
function emitMFAEvent(type, data) {
    var event = {
        type: type,
        userId: data.userId,
        timestamp: new Date(),
        data: data,
    };
    // Emit custom event for application-level handling
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mfa-event', { detail: event }));
    }
    // Log for development
    if (process.env.NODE_ENV === 'development') {
        console.log('MFA Event:', event);
    }
}
/**
 * Hook for MFA statistics (admin/monitoring use)
 */
function useMFAStatistics() {
    var _this = this;
    var _a = (0, react_1.useState)(null), statistics = _a[0], setStatistics = _a[1];
    var _b = (0, react_1.useState)(true), isLoading = _b[0], setIsLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var fetchStatistics = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var stats, err_7, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsLoading(true);
                    setError(null);
                    return [4 /*yield*/, (0, mfa_1.getMFAService)().getMFAStatistics()];
                case 1:
                    stats = _a.sent();
                    setStatistics(stats);
                    return [3 /*break*/, 4];
                case 2:
                    err_7 = _a.sent();
                    error_7 = err_7 instanceof Error ? err_7 : new Error('Failed to fetch MFA statistics');
                    setError(error_7);
                    console.error('Failed to fetch MFA statistics:', error_7);
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    (0, react_1.useEffect)(function () {
        fetchStatistics();
    }, [fetchStatistics]);
    return {
        statistics: statistics,
        isLoading: isLoading,
        error: error,
        refresh: fetchStatistics,
    };
}
exports.default = useMFA;
