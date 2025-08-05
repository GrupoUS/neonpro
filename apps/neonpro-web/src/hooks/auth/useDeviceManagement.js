"use strict";
// =====================================================
// useDeviceManagement Hook - Device Trust & Security
// Story 1.4: Session Management & Security
// =====================================================
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
exports.useDeviceManagement = useDeviceManagement;
var react_1 = require("react");
var useSupabase_1 = require("@/hooks/useSupabase");
var session_1 = require("@/lib/auth/session");
var sonner_1 = require("sonner");
// =====================================================
// MAIN HOOK
// =====================================================
function useDeviceManagement(userId, options) {
    var _this = this;
    var _a, _b;
    if (options === void 0) { options = {}; }
    var _c = options.autoRegister, autoRegister = _c === void 0 ? true : _c, _d = options.showNotifications, showNotifications = _d === void 0 ? true : _d, _e = options.trackDeviceChanges, trackDeviceChanges = _e === void 0 ? true : _e, _f = options.validateOnMount, validateOnMount = _f === void 0 ? true : _f;
    var supabase = (0, useSupabase_1.useSupabase)().supabase;
    var deviceManagerRef = (0, react_1.useRef)(null);
    // State
    var _g = (0, react_1.useState)({
        isLoading: true,
        currentDevice: null,
        trustedDevices: [],
        deviceValidation: null,
        error: null
    }), state = _g[0], setState = _g[1];
    // =====================================================
    // INITIALIZATION
    // =====================================================
    (0, react_1.useEffect)(function () {
        if (!supabase)
            return;
        deviceManagerRef.current = new session_1.DeviceManager(supabase);
        if (userId && validateOnMount) {
            initializeDeviceManagement();
        }
        else {
            setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: false })); });
        }
    }, [supabase, userId, validateOnMount]);
    var initializeDeviceManagement = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var currentDevice, validation, trustedDevices, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!userId || !deviceManagerRef.current)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: true, error: null })); });
                    return [4 /*yield*/, getCurrentDeviceInfo()
                        // Validate current device
                    ];
                case 2:
                    currentDevice = _a.sent();
                    return [4 /*yield*/, deviceManagerRef.current.validateDevice(userId, currentDevice.fingerprint, {
                            userAgent: currentDevice.userAgent,
                            ipAddress: currentDevice.ipAddress,
                            location: currentDevice.location
                        })
                        // Get trusted devices
                    ];
                case 3:
                    validation = _a.sent();
                    return [4 /*yield*/, deviceManagerRef.current.getTrustedDevices(userId)];
                case 4:
                    trustedDevices = _a.sent();
                    setState({
                        isLoading: false,
                        currentDevice: currentDevice,
                        trustedDevices: trustedDevices,
                        deviceValidation: validation,
                        error: null
                    });
                    if (!(autoRegister && !validation.isRegistered)) return [3 /*break*/, 6];
                    return [4 /*yield*/, registerDevice()];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    // Show notification for new device
                    if (showNotifications && !validation.isTrusted) {
                        sonner_1.toast.warning('New device detected. Consider marking it as trusted if this is your device.', {
                            action: {
                                label: 'Trust Device',
                                onClick: function () { return trustCurrentDevice(); }
                            },
                            duration: 10000
                        });
                    }
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.error('Device management initialization error:', error_1);
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: false, error: error_1 instanceof Error ? error_1.message : 'Initialization failed' })); });
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); }, [userId, autoRegister, showNotifications]);
    // =====================================================
    // DEVICE ACTIONS
    // =====================================================
    var registerDevice = (0, react_1.useCallback)(function (deviceName) { return __awaiter(_this, void 0, void 0, function () {
        var result_1, validation_1, error_2, errorMessage_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!userId || !deviceManagerRef.current || !state.currentDevice) {
                        return [2 /*return*/, false];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: true, error: null })); });
                    return [4 /*yield*/, deviceManagerRef.current.registerDevice(userId, state.currentDevice.fingerprint, {
                            deviceName: deviceName || generateDeviceName(),
                            userAgent: state.currentDevice.userAgent,
                            ipAddress: state.currentDevice.ipAddress,
                            location: state.currentDevice.location
                        })];
                case 2:
                    result_1 = _a.sent();
                    if (!result_1.success) return [3 /*break*/, 4];
                    return [4 /*yield*/, deviceManagerRef.current.validateDevice(userId, state.currentDevice.fingerprint, {
                            userAgent: state.currentDevice.userAgent,
                            ipAddress: state.currentDevice.ipAddress,
                            location: state.currentDevice.location
                        })];
                case 3:
                    validation_1 = _a.sent();
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: false, deviceValidation: validation_1 })); });
                    if (showNotifications) {
                        sonner_1.toast.success('Device registered successfully');
                    }
                    return [2 /*return*/, true];
                case 4:
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: false, error: result_1.error || 'Device registration failed' })); });
                    if (showNotifications) {
                        sonner_1.toast.error(result_1.error || 'Device registration failed');
                    }
                    return [2 /*return*/, false];
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    errorMessage_1 = error_2 instanceof Error ? error_2.message : 'Device registration failed';
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: false, error: errorMessage_1 })); });
                    if (showNotifications) {
                        sonner_1.toast.error(errorMessage_1);
                    }
                    return [2 /*return*/, false];
                case 7: return [2 /*return*/];
            }
        });
    }); }, [userId, state.currentDevice, showNotifications]);
    var trustDevice = (0, react_1.useCallback)(function (deviceId) { return __awaiter(_this, void 0, void 0, function () {
        var result, error_3, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!userId || !deviceManagerRef.current) {
                        return [2 /*return*/, false];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, deviceManagerRef.current.trustDevice(userId, deviceId)];
                case 2:
                    result = _a.sent();
                    if (!result.success) return [3 /*break*/, 4];
                    // Refresh trusted devices
                    return [4 /*yield*/, refreshDevices()];
                case 3:
                    // Refresh trusted devices
                    _a.sent();
                    if (showNotifications) {
                        sonner_1.toast.success('Device marked as trusted');
                    }
                    return [2 /*return*/, true];
                case 4:
                    if (showNotifications) {
                        sonner_1.toast.error(result.error || 'Failed to trust device');
                    }
                    return [2 /*return*/, false];
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    errorMessage = error_3 instanceof Error ? error_3.message : 'Failed to trust device';
                    if (showNotifications) {
                        sonner_1.toast.error(errorMessage);
                    }
                    return [2 /*return*/, false];
                case 7: return [2 /*return*/];
            }
        });
    }); }, [userId, showNotifications]);
    var untrustDevice = (0, react_1.useCallback)(function (deviceId) { return __awaiter(_this, void 0, void 0, function () {
        var result, error_4, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!userId || !deviceManagerRef.current) {
                        return [2 /*return*/, false];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, deviceManagerRef.current.untrustDevice(userId, deviceId)];
                case 2:
                    result = _a.sent();
                    if (!result.success) return [3 /*break*/, 4];
                    // Refresh trusted devices
                    return [4 /*yield*/, refreshDevices()];
                case 3:
                    // Refresh trusted devices
                    _a.sent();
                    if (showNotifications) {
                        sonner_1.toast.success('Device trust removed');
                    }
                    return [2 /*return*/, true];
                case 4:
                    if (showNotifications) {
                        sonner_1.toast.error(result.error || 'Failed to untrust device');
                    }
                    return [2 /*return*/, false];
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_4 = _a.sent();
                    errorMessage = error_4 instanceof Error ? error_4.message : 'Failed to untrust device';
                    if (showNotifications) {
                        sonner_1.toast.error(errorMessage);
                    }
                    return [2 /*return*/, false];
                case 7: return [2 /*return*/];
            }
        });
    }); }, [userId, showNotifications]);
    var removeDevice = (0, react_1.useCallback)(function (deviceId) { return __awaiter(_this, void 0, void 0, function () {
        var result, error_5, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!userId || !deviceManagerRef.current) {
                        return [2 /*return*/, false];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, deviceManagerRef.current.removeDevice(userId, deviceId)];
                case 2:
                    result = _a.sent();
                    if (!result.success) return [3 /*break*/, 4];
                    // Refresh trusted devices
                    return [4 /*yield*/, refreshDevices()];
                case 3:
                    // Refresh trusted devices
                    _a.sent();
                    if (showNotifications) {
                        sonner_1.toast.success('Device removed successfully');
                    }
                    return [2 /*return*/, true];
                case 4:
                    if (showNotifications) {
                        sonner_1.toast.error(result.error || 'Failed to remove device');
                    }
                    return [2 /*return*/, false];
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_5 = _a.sent();
                    errorMessage = error_5 instanceof Error ? error_5.message : 'Failed to remove device';
                    if (showNotifications) {
                        sonner_1.toast.error(errorMessage);
                    }
                    return [2 /*return*/, false];
                case 7: return [2 /*return*/];
            }
        });
    }); }, [userId, showNotifications]);
    var refreshDevices = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var trustedDevices_1, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!userId || !deviceManagerRef.current)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deviceManagerRef.current.getTrustedDevices(userId)];
                case 2:
                    trustedDevices_1 = _a.sent();
                    setState(function (prev) { return (__assign(__assign({}, prev), { trustedDevices: trustedDevices_1 })); });
                    return [3 /*break*/, 4];
                case 3:
                    error_6 = _a.sent();
                    console.error('Failed to refresh devices:', error_6);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [userId]);
    var validateCurrentDevice = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var validation_2, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!userId || !deviceManagerRef.current || !state.currentDevice) {
                        return [2 /*return*/, null];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deviceManagerRef.current.validateDevice(userId, state.currentDevice.fingerprint, {
                            userAgent: state.currentDevice.userAgent,
                            ipAddress: state.currentDevice.ipAddress,
                            location: state.currentDevice.location
                        })];
                case 2:
                    validation_2 = _a.sent();
                    setState(function (prev) { return (__assign(__assign({}, prev), { deviceValidation: validation_2 })); });
                    return [2 /*return*/, validation_2];
                case 3:
                    error_7 = _a.sent();
                    console.error('Device validation error:', error_7);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [userId, state.currentDevice]);
    var reportSuspiciousDevice = (0, react_1.useCallback)(function (deviceId, reason) { return __awaiter(_this, void 0, void 0, function () {
        var result, error_8, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!userId || !deviceManagerRef.current) {
                        return [2 /*return*/, false];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deviceManagerRef.current.reportSuspiciousDevice(userId, deviceId, reason)];
                case 2:
                    result = _a.sent();
                    if (result.success) {
                        if (showNotifications) {
                            sonner_1.toast.success('Suspicious device reported');
                        }
                        return [2 /*return*/, true];
                    }
                    else {
                        if (showNotifications) {
                            sonner_1.toast.error(result.error || 'Failed to report device');
                        }
                        return [2 /*return*/, false];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_8 = _a.sent();
                    errorMessage = error_8 instanceof Error ? error_8.message : 'Failed to report device';
                    if (showNotifications) {
                        sonner_1.toast.error(errorMessage);
                    }
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [userId, showNotifications]);
    // =====================================================
    // HELPER FUNCTIONS
    // =====================================================
    var trustCurrentDevice = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!((_a = state.deviceValidation) === null || _a === void 0 ? void 0 : _a.deviceId)) return [3 /*break*/, 2];
                    return [4 /*yield*/, trustDevice(state.deviceValidation.deviceId)];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); }, [state.deviceValidation, trustDevice]);
    // =====================================================
    // COMPUTED VALUES
    // =====================================================
    var isCurrentDeviceTrusted = ((_a = state.deviceValidation) === null || _a === void 0 ? void 0 : _a.isTrusted) || false;
    var deviceRiskLevel = ((_b = state.deviceValidation) === null || _b === void 0 ? void 0 : _b.riskLevel) || 'medium';
    var deviceStats = {
        totalDevices: state.trustedDevices.length,
        trustedDevices: state.trustedDevices.filter(function (d) { return d.isTrusted; }).length,
        recentDevices: state.trustedDevices.filter(function (d) {
            var daysSinceLastUsed = (Date.now() - d.lastUsedAt.getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceLastUsed <= 7;
        }).length
    };
    // =====================================================
    // DEVICE CHANGE TRACKING
    // =====================================================
    (0, react_1.useEffect)(function () {
        if (!trackDeviceChanges || !state.currentDevice)
            return;
        var checkDeviceChanges = function () { return __awaiter(_this, void 0, void 0, function () {
            var currentDevice;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getCurrentDeviceInfo()];
                    case 1:
                        currentDevice = _a.sent();
                        if (!(state.currentDevice &&
                            currentDevice.fingerprint !== state.currentDevice.fingerprint)) return [3 /*break*/, 3];
                        if (showNotifications) {
                            sonner_1.toast.warning('Device fingerprint changed. Please re-authenticate.');
                        }
                        if (!userId) return [3 /*break*/, 3];
                        return [4 /*yield*/, validateCurrentDevice()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // Check device changes periodically
        var interval = setInterval(checkDeviceChanges, 5 * 60 * 1000); // Every 5 minutes
        return function () { return clearInterval(interval); };
    }, [trackDeviceChanges, state.currentDevice, showNotifications, userId, validateCurrentDevice]);
    // =====================================================
    // RETURN HOOK INTERFACE
    // =====================================================
    return {
        // State
        isLoading: state.isLoading,
        currentDevice: state.currentDevice,
        trustedDevices: state.trustedDevices,
        deviceValidation: state.deviceValidation,
        error: state.error,
        // Actions
        registerDevice: registerDevice,
        trustDevice: trustDevice,
        untrustDevice: untrustDevice,
        removeDevice: removeDevice,
        refreshDevices: refreshDevices,
        validateCurrentDevice: validateCurrentDevice,
        reportSuspiciousDevice: reportSuspiciousDevice,
        // Computed
        isCurrentDeviceTrusted: isCurrentDeviceTrusted,
        deviceRiskLevel: deviceRiskLevel,
        deviceStats: deviceStats
    };
}
// =====================================================
// UTILITY FUNCTIONS
// =====================================================
/**
 * Get current device information
 */
function getCurrentDeviceInfo() {
    return __awaiter(this, void 0, void 0, function () {
        var fingerprint, ipAddress, location;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, generateDeviceFingerprint()];
                case 1:
                    fingerprint = _a.sent();
                    return [4 /*yield*/, getClientIP()];
                case 2:
                    ipAddress = _a.sent();
                    return [4 /*yield*/, getLocation()];
                case 3:
                    location = _a.sent();
                    return [2 /*return*/, {
                            fingerprint: fingerprint,
                            userAgent: navigator.userAgent,
                            ipAddress: ipAddress,
                            location: location
                        }];
            }
        });
    });
}
/**
 * Generate device fingerprint
 */
function generateDeviceFingerprint() {
    return __awaiter(this, void 0, void 0, function () {
        var canvas, ctx, fingerprint, hash, i, char;
        var _a;
        return __generator(this, function (_b) {
            canvas = document.createElement('canvas');
            ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.textBaseline = 'top';
                ctx.font = '14px Arial';
                ctx.fillText('Device fingerprint', 2, 2);
            }
            fingerprint = [
                navigator.userAgent,
                navigator.language,
                ((_a = navigator.languages) === null || _a === void 0 ? void 0 : _a.join(',')) || '',
                screen.width + 'x' + screen.height,
                screen.colorDepth,
                new Date().getTimezoneOffset(),
                navigator.hardwareConcurrency || 0,
                navigator.deviceMemory || 0,
                canvas.toDataURL()
            ].join('|');
            hash = 0;
            for (i = 0; i < fingerprint.length; i++) {
                char = fingerprint.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return [2 /*return*/, Math.abs(hash).toString(36)];
        });
    });
}
/**
 * Get client IP address
 */
function getClientIP() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('https://api.ipify.org?format=json')];
                case 1:
                    response = _b.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _b.sent();
                    return [2 /*return*/, data.ip || '127.0.0.1'];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, '127.0.0.1'];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get user location
 */
function getLocation() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('https://ipapi.co/json/')];
                case 1:
                    response = _b.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _b.sent();
                    return [2 /*return*/, "".concat(data.city, ", ").concat(data.country_name)];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, undefined];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Generate a friendly device name
 */
function generateDeviceName() {
    var userAgent = navigator.userAgent;
    // Detect browser
    var browser = 'Unknown Browser';
    if (userAgent.includes('Chrome'))
        browser = 'Chrome';
    else if (userAgent.includes('Firefox'))
        browser = 'Firefox';
    else if (userAgent.includes('Safari'))
        browser = 'Safari';
    else if (userAgent.includes('Edge'))
        browser = 'Edge';
    // Detect OS
    var os = 'Unknown OS';
    if (userAgent.includes('Windows'))
        os = 'Windows';
    else if (userAgent.includes('Mac'))
        os = 'macOS';
    else if (userAgent.includes('Linux'))
        os = 'Linux';
    else if (userAgent.includes('Android'))
        os = 'Android';
    else if (userAgent.includes('iOS'))
        os = 'iOS';
    return "".concat(browser, " on ").concat(os);
}
// =====================================================
// EXPORT DEFAULT
// =====================================================
exports.default = useDeviceManagement;
