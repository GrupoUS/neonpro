"use strict";
/**
 * Vision Analysis Configuration Hook for NeonPro
 *
 * Custom hook for managing computer vision analysis configuration and user preferences.
 * Provides functionality for:
 * - Loading and updating user-specific configurations
 * - Managing analysis thresholds and processing settings
 * - Handling notification and export preferences
 * - Privacy and sharing settings management
 * - Advanced feature toggles
 *
 * Integrates with the vision config API and provides real-time updates.
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
exports.useVisionConfig = useVisionConfig;
var react_1 = require("react");
var sonner_1 = require("sonner");
// Default configuration
var DEFAULT_CONFIG = {
    accuracyThreshold: 0.85,
    confidenceThreshold: 0.80,
    processingTimeLimit: 30000, // 30 seconds
    imageProcessing: {
        maxResolution: 2048,
        compressionQuality: 0.9,
        enablePreprocessing: true,
        autoEnhancement: true,
    },
    notifications: {
        analysisComplete: true,
        lowAccuracyAlert: true,
        processingTimeAlert: true,
        emailNotifications: false,
    },
    export: {
        defaultFormat: 'json',
        includeImages: true,
        includeAnnotations: true,
        includeMetrics: true,
        autoExport: false,
    },
    privacy: {
        dataRetentionDays: 365,
        allowAnalytics: true,
        shareWithResearch: false,
        anonymizeExports: true,
    },
    advanced: {
        enableBatchProcessing: false,
        useGPUAcceleration: true,
        enableRealTimeAnalysis: false,
    },
};
function useVisionConfig() {
    var _this = this;
    var _a = (0, react_1.useState)({
        config: null,
        isLoading: false,
        error: null,
        hasUnsavedChanges: false,
    }), state = _a[0], setState = _a[1];
    var _b = (0, react_1.useState)(null), originalConfig = _b[0], setOriginalConfig = _b[1];
    /**
     * Load configuration from API
     */
    var loadConfig = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, config_1, error_1, errorMessage_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: true, error: null })); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/vision/config')];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to load configuration');
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    config_1 = data.config || DEFAULT_CONFIG;
                    setState(function (prev) { return (__assign(__assign({}, prev), { config: config_1, isLoading: false, hasUnsavedChanges: false })); });
                    setOriginalConfig(config_1);
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    errorMessage_1 = error_1 instanceof Error ? error_1.message : 'Failed to load configuration';
                    setState(function (prev) { return (__assign(__assign({}, prev), { error: errorMessage_1, isLoading: false })); });
                    console.error('Config load error:', error_1);
                    sonner_1.toast.error('Failed to load configuration');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    /**
     * Update configuration (local state only)
     */
    var updateConfig = (0, react_1.useCallback)(function (updates) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setState(function (prev) {
                if (!prev.config)
                    return prev;
                var newConfig = __assign(__assign({}, prev.config), updates);
                var hasChanges = JSON.stringify(newConfig) !== JSON.stringify(originalConfig);
                return __assign(__assign({}, prev), { config: newConfig, hasUnsavedChanges: hasChanges });
            });
            return [2 /*return*/];
        });
    }); }, [originalConfig]);
    /**
     * Save configuration to API
     */
    var saveConfig = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_2, errorMessage_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!state.config) {
                        sonner_1.toast.error('No configuration to save');
                        return [2 /*return*/];
                    }
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: true, error: null })); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/vision/config', {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ config: state.config }),
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to save configuration');
                    }
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: false, hasUnsavedChanges: false })); });
                    setOriginalConfig(state.config);
                    sonner_1.toast.success('Configuration saved successfully');
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    errorMessage_2 = error_2 instanceof Error ? error_2.message : 'Failed to save configuration';
                    setState(function (prev) { return (__assign(__assign({}, prev), { error: errorMessage_2, isLoading: false })); });
                    console.error('Config save error:', error_2);
                    sonner_1.toast.error('Failed to save configuration');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [state.config]);
    /**
     * Reset configuration to defaults
     */
    var resetToDefaults = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, config_2, error_3, errorMessage_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: true, error: null })); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/vision/config', {
                            method: 'POST',
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to reset configuration');
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    config_2 = data.config || DEFAULT_CONFIG;
                    setState(function (prev) { return (__assign(__assign({}, prev), { config: config_2, isLoading: false, hasUnsavedChanges: false })); });
                    setOriginalConfig(config_2);
                    sonner_1.toast.success('Configuration reset to defaults');
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    errorMessage_3 = error_3 instanceof Error ? error_3.message : 'Failed to reset configuration';
                    setState(function (prev) { return (__assign(__assign({}, prev), { error: errorMessage_3, isLoading: false })); });
                    console.error('Config reset error:', error_3);
                    sonner_1.toast.error('Failed to reset configuration');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    /**
     * Discard unsaved changes
     */
    var discardChanges = (0, react_1.useCallback)(function () {
        if (originalConfig) {
            setState(function (prev) { return (__assign(__assign({}, prev), { config: originalConfig, hasUnsavedChanges: false, error: null })); });
            sonner_1.toast.success('Changes discarded');
        }
    }, [originalConfig]);
    // Load configuration on mount
    (0, react_1.useEffect)(function () {
        loadConfig();
    }, [loadConfig]);
    return __assign(__assign({}, state), { loadConfig: loadConfig, updateConfig: updateConfig, resetToDefaults: resetToDefaults, saveConfig: saveConfig, discardChanges: discardChanges });
}
exports.default = useVisionConfig;
