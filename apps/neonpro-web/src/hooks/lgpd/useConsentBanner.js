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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useConsentBanner = useConsentBanner;
var react_1 = require("react");
var LGPDComplianceManager_1 = require("@/lib/lgpd/LGPDComplianceManager");
var use_toast_1 = require("@/hooks/use-toast");
var CONSENT_STORAGE_KEY = 'lgpd_consent_preferences';
var BANNER_SHOWN_KEY = 'lgpd_banner_shown';
function useConsentBanner() {
    var _this = this;
    var _a = (0, react_1.useState)([]), purposes = _a[0], setPurposes = _a[1];
    var _b = (0, react_1.useState)([]), consentHistory = _b[0], setConsentHistory = _b[1];
    var _c = (0, react_1.useState)({}), preferences = _c[0], setPreferences = _c[1];
    var _d = (0, react_1.useState)(false), showBanner = _d[0], setShowBanner = _d[1];
    var _e = (0, react_1.useState)(false), showPreferences = _e[0], setShowPreferences = _e[1];
    var _f = (0, react_1.useState)(true), isLoading = _f[0], setIsLoading = _f[1];
    var _g = (0, react_1.useState)(false), isSaving = _g[0], setIsSaving = _g[1];
    var _h = (0, react_1.useState)(null), error = _h[0], setError = _h[1];
    var toast = (0, use_toast_1.useToast)().toast;
    var complianceManager = new LGPDComplianceManager_1.LGPDComplianceManager();
    // Load stored preferences from localStorage
    var loadStoredPreferences = (0, react_1.useCallback)(function () {
        try {
            var stored = localStorage.getItem(CONSENT_STORAGE_KEY);
            if (stored) {
                var parsedPreferences = JSON.parse(stored);
                setPreferences(parsedPreferences);
                return parsedPreferences;
            }
        }
        catch (err) {
            console.warn('Failed to load stored consent preferences:', err);
        }
        return {};
    }, []);
    // Save preferences to localStorage
    var saveToStorage = (0, react_1.useCallback)(function (prefs) {
        try {
            localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(prefs));
            localStorage.setItem(BANNER_SHOWN_KEY, 'true');
        }
        catch (err) {
            console.warn('Failed to save consent preferences:', err);
        }
    }, []);
    // Check if banner should be shown
    var shouldShowBanner = (0, react_1.useCallback)(function () {
        try {
            var bannerShown = localStorage.getItem(BANNER_SHOWN_KEY);
            var hasStoredPreferences = localStorage.getItem(CONSENT_STORAGE_KEY);
            return !bannerShown && !hasStoredPreferences;
        }
        catch (err) {
            return true; // Show banner if we can't check localStorage
        }
    }, []);
    // Load consent purposes
    var loadPurposes = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, storedPrefs, newPrefs_1, err_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    setError(null);
                    return [4 /*yield*/, complianceManager.getConsentPurposes()];
                case 1:
                    response = _a.sent();
                    setPurposes(response.data);
                    storedPrefs = loadStoredPreferences();
                    newPrefs_1 = __assign({}, storedPrefs);
                    response.data.forEach(function (purpose) {
                        if (!(purpose.id in newPrefs_1)) {
                            // Default to false for optional purposes, true for essential
                            newPrefs_1[purpose.id] = purpose.required || false;
                        }
                    });
                    setPreferences(newPrefs_1);
                    // Show banner if needed
                    if (shouldShowBanner()) {
                        setShowBanner(true);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    errorMessage = err_1 instanceof Error ? err_1.message : 'Erro ao carregar finalidades de consentimento';
                    setError(errorMessage);
                    console.error('Failed to load consent purposes:', err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [complianceManager, loadStoredPreferences, shouldShowBanner]);
    // Load consent history
    var loadConsentHistory = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, err_2, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    setError(null);
                    return [4 /*yield*/, complianceManager.getConsentRecords({
                            limit: 50,
                            sortBy: 'created_at',
                            sortOrder: 'desc'
                        })];
                case 1:
                    response = _a.sent();
                    setConsentHistory(response.data);
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    errorMessage = err_2 instanceof Error ? err_2.message : 'Erro ao carregar histórico de consentimentos';
                    setError(errorMessage);
                    console.error('Failed to load consent history:', err_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [complianceManager]);
    // Accept all consents
    var acceptAll = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var allAccepted_1, err_3, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsSaving(true);
                    setError(null);
                    allAccepted_1 = {};
                    purposes.forEach(function (purpose) {
                        allAccepted_1[purpose.id] = true;
                    });
                    // Save to backend
                    return [4 /*yield*/, Promise.all(purposes.map(function (purpose) {
                            return complianceManager.recordConsent({
                                purpose_id: purpose.id,
                                granted: true,
                                user_id: 'anonymous', // Will be replaced with actual user ID when available
                                ip_address: '', // Will be filled by backend
                                user_agent: navigator.userAgent
                            });
                        }))];
                case 1:
                    // Save to backend
                    _a.sent();
                    setPreferences(allAccepted_1);
                    saveToStorage(allAccepted_1);
                    setShowBanner(false);
                    toast({
                        title: 'Consentimentos salvos',
                        description: 'Todos os consentimentos foram aceitos com sucesso.'
                    });
                    return [3 /*break*/, 4];
                case 2:
                    err_3 = _a.sent();
                    errorMessage = err_3 instanceof Error ? err_3.message : 'Erro ao salvar consentimentos';
                    setError(errorMessage);
                    toast({
                        title: 'Erro',
                        description: errorMessage,
                        variant: 'destructive'
                    });
                    return [3 /*break*/, 4];
                case 3:
                    setIsSaving(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [purposes, complianceManager, saveToStorage, toast]);
    // Reject all optional consents
    var rejectAll = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var onlyRequired_1, err_4, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsSaving(true);
                    setError(null);
                    onlyRequired_1 = {};
                    purposes.forEach(function (purpose) {
                        onlyRequired_1[purpose.id] = purpose.required || false;
                    });
                    // Save to backend
                    return [4 /*yield*/, Promise.all(purposes.map(function (purpose) {
                            return complianceManager.recordConsent({
                                purpose_id: purpose.id,
                                granted: purpose.required || false,
                                user_id: 'anonymous', // Will be replaced with actual user ID when available
                                ip_address: '', // Will be filled by backend
                                user_agent: navigator.userAgent
                            });
                        }))];
                case 1:
                    // Save to backend
                    _a.sent();
                    setPreferences(onlyRequired_1);
                    saveToStorage(onlyRequired_1);
                    setShowBanner(false);
                    toast({
                        title: 'Consentimentos salvos',
                        description: 'Apenas consentimentos essenciais foram mantidos.'
                    });
                    return [3 /*break*/, 4];
                case 2:
                    err_4 = _a.sent();
                    errorMessage = err_4 instanceof Error ? err_4.message : 'Erro ao salvar consentimentos';
                    setError(errorMessage);
                    toast({
                        title: 'Erro',
                        description: errorMessage,
                        variant: 'destructive'
                    });
                    return [3 /*break*/, 4];
                case 3:
                    setIsSaving(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [purposes, complianceManager, saveToStorage, toast]);
    // Save custom preferences
    var savePreferences = (0, react_1.useCallback)(function (newPreferences) { return __awaiter(_this, void 0, void 0, function () {
        var validatedPreferences_1, err_5, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsSaving(true);
                    setError(null);
                    validatedPreferences_1 = __assign({}, newPreferences);
                    purposes.forEach(function (purpose) {
                        if (purpose.required) {
                            validatedPreferences_1[purpose.id] = true;
                        }
                    });
                    // Save to backend
                    return [4 /*yield*/, Promise.all(Object.entries(validatedPreferences_1).map(function (_a) {
                            var purposeId = _a[0], granted = _a[1];
                            return complianceManager.recordConsent({
                                purpose_id: purposeId,
                                granted: granted,
                                user_id: 'anonymous', // Will be replaced with actual user ID when available
                                ip_address: '', // Will be filled by backend
                                user_agent: navigator.userAgent
                            });
                        }))];
                case 1:
                    // Save to backend
                    _a.sent();
                    setPreferences(validatedPreferences_1);
                    saveToStorage(validatedPreferences_1);
                    setShowBanner(false);
                    setShowPreferences(false);
                    toast({
                        title: 'Preferências salvas',
                        description: 'Suas preferências de consentimento foram atualizadas.'
                    });
                    return [3 /*break*/, 4];
                case 2:
                    err_5 = _a.sent();
                    errorMessage = err_5 instanceof Error ? err_5.message : 'Erro ao salvar preferências';
                    setError(errorMessage);
                    toast({
                        title: 'Erro',
                        description: errorMessage,
                        variant: 'destructive'
                    });
                    return [3 /*break*/, 4];
                case 3:
                    setIsSaving(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [purposes, complianceManager, saveToStorage, toast]);
    // Update single preference
    var updatePreference = (0, react_1.useCallback)(function (purposeId, granted) {
        var purpose = purposes.find(function (p) { return p.id === purposeId; });
        if ((purpose === null || purpose === void 0 ? void 0 : purpose.required) && !granted) {
            toast({
                title: 'Consentimento obrigatório',
                description: 'Este consentimento é obrigatório e não pode ser desabilitado.',
                variant: 'destructive'
            });
            return;
        }
        setPreferences(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[purposeId] = granted, _a)));
        });
    }, [purposes, toast]);
    // Banner control functions
    var showBannerDialog = (0, react_1.useCallback)(function () { return setShowBanner(true); }, []);
    var hideBanner = (0, react_1.useCallback)(function () { return setShowBanner(false); }, []);
    var showPreferencesDialog = (0, react_1.useCallback)(function () { return setShowPreferences(true); }, []);
    var hidePreferences = (0, react_1.useCallback)(function () { return setShowPreferences(false); }, []);
    // Check if user has consent for a specific purpose
    var hasConsent = (0, react_1.useCallback)(function (purposeId) {
        return preferences[purposeId] === true;
    }, [preferences]);
    // Load data on mount
    (0, react_1.useEffect)(function () {
        var loadData = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoading(true);
                        return [4 /*yield*/, Promise.all([loadPurposes(), loadConsentHistory()])];
                    case 1:
                        _a.sent();
                        setIsLoading(false);
                        return [2 /*return*/];
                }
            });
        }); };
        loadData();
    }, [loadPurposes, loadConsentHistory]);
    return {
        // Data
        purposes: purposes,
        consentHistory: consentHistory,
        preferences: preferences,
        // Banner state
        showBanner: showBanner,
        showPreferences: showPreferences,
        // Loading states
        isLoading: isLoading,
        isSaving: isSaving,
        // Actions
        acceptAll: acceptAll,
        rejectAll: rejectAll,
        savePreferences: savePreferences,
        updatePreference: updatePreference,
        // Banner control
        showBannerDialog: showBannerDialog,
        hideBanner: hideBanner,
        showPreferencesDialog: showPreferencesDialog,
        hidePreferences: hidePreferences,
        // Utility
        loadConsentHistory: loadConsentHistory,
        hasConsent: hasConsent,
        // Error handling
        error: error
    };
}
