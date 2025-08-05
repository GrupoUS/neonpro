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
exports.useDemandForecasting = useDemandForecasting;
var react_1 = require("react");
var sonner_1 = require("sonner");
function useDemandForecasting() {
    var _this = this;
    var _a = (0, react_1.useState)(false), isLoading = _a[0], setIsLoading = _a[1];
    var _b = (0, react_1.useState)(null), forecast = _b[0], setForecast = _b[1];
    var _c = (0, react_1.useState)([]), bulkForecasts = _c[0], setBulkForecasts = _c[1];
    var _d = (0, react_1.useState)(null), seasonalAnalysis = _d[0], setSeasonalAnalysis = _d[1];
    var _e = (0, react_1.useState)(null), accuracyAnalysis = _e[0], setAccuracyAnalysis = _e[1];
    var _f = (0, react_1.useState)(null), capabilities = _f[0], setCapabilities = _f[1];
    // Generate single item forecast
    var generateForecast = (0, react_1.useCallback)(function (request) { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_1, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/inventory/forecasting/demand', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(request)
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    if (!response.ok) {
                        throw new Error(result.error || 'Failed to generate forecast');
                    }
                    setForecast(result.data);
                    sonner_1.toast.success('Demand forecast generated successfully');
                    return [2 /*return*/, result.data];
                case 4:
                    error_1 = _a.sent();
                    message = error_1 instanceof Error ? error_1.message : 'Failed to generate forecast';
                    sonner_1.toast.error(message);
                    throw error_1;
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, []);
    // Generate bulk forecasts
    var generateBulkForecast = (0, react_1.useCallback)(function (request) { return __awaiter(_this, void 0, void 0, function () {
        var response, result, _a, successful, failed, error_2, message;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setIsLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/inventory/forecasting/demand', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(request)
                        })];
                case 2:
                    response = _b.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _b.sent();
                    if (!response.ok) {
                        throw new Error(result.error || 'Failed to generate bulk forecasts');
                    }
                    setBulkForecasts(result.data.forecasts);
                    _a = result.data.summary, successful = _a.successful, failed = _a.failed;
                    sonner_1.toast.success("Generated ".concat(successful, " forecasts successfully").concat(failed > 0 ? " (".concat(failed, " failed)") : ''));
                    return [2 /*return*/, result.data];
                case 4:
                    error_2 = _b.sent();
                    message = error_2 instanceof Error ? error_2.message : 'Failed to generate bulk forecasts';
                    sonner_1.toast.error(message);
                    throw error_2;
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, []);
    // Analyze seasonal patterns
    var analyzeSeasonalPatterns = (0, react_1.useCallback)(function (itemId_1, clinicId_1) {
        var args_1 = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args_1[_i - 2] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([itemId_1, clinicId_1], args_1, true), void 0, function (itemId, clinicId, analysisPeriod) {
            var response, result, error_3, message;
            if (analysisPeriod === void 0) { analysisPeriod = 365; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoading(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, fetch('/api/inventory/forecasting/seasonal', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ itemId: itemId, clinicId: clinicId, analysisPeriod: analysisPeriod })
                            })];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 3:
                        result = _a.sent();
                        if (!response.ok) {
                            throw new Error(result.error || 'Failed to analyze seasonal patterns');
                        }
                        setSeasonalAnalysis(result.data);
                        sonner_1.toast.success('Seasonal analysis completed');
                        return [2 /*return*/, result.data];
                    case 4:
                        error_3 = _a.sent();
                        message = error_3 instanceof Error ? error_3.message : 'Failed to analyze seasonal patterns';
                        sonner_1.toast.error(message);
                        throw error_3;
                    case 5:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }, []);
    // Get forecast accuracy analysis
    var getAccuracyAnalysis = (0, react_1.useCallback)(function (clinicId_1, itemId_1) {
        var args_1 = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args_1[_i - 2] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([clinicId_1, itemId_1], args_1, true), void 0, function (clinicId, itemId, period, modelType) {
            var params, response, result, error_4, message;
            if (period === void 0) { period = '30d'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoading(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        params = new URLSearchParams(__assign(__assign({ clinicId: clinicId, period: period }, (itemId && { itemId: itemId })), (modelType && { modelType: modelType })));
                        return [4 /*yield*/, fetch("/api/inventory/forecasting/accuracy?".concat(params))];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 3:
                        result = _a.sent();
                        if (!response.ok) {
                            throw new Error(result.error || 'Failed to get accuracy analysis');
                        }
                        setAccuracyAnalysis(result.data);
                        return [2 /*return*/, result.data];
                    case 4:
                        error_4 = _a.sent();
                        message = error_4 instanceof Error ? error_4.message : 'Failed to get accuracy analysis';
                        sonner_1.toast.error(message);
                        throw error_4;
                    case 5:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }, []);
    // Log forecast accuracy
    var logForecastAccuracy = (0, react_1.useCallback)(function (accuracyData) { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/inventory/forecasting/accuracy', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(accuracyData)
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (!response.ok) {
                        throw new Error(result.error || 'Failed to log accuracy data');
                    }
                    return [2 /*return*/, result.data];
                case 3:
                    error_5 = _a.sent();
                    console.error('Failed to log forecast accuracy:', error_5);
                    throw error_5;
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    // Get forecasting capabilities
    var getCapabilities = (0, react_1.useCallback)(function (clinicId) { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("/api/inventory/forecasting/demand?clinicId=".concat(clinicId))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (!response.ok) {
                        throw new Error(result.error || 'Failed to get capabilities');
                    }
                    setCapabilities(result.data);
                    return [2 /*return*/, result.data];
                case 3:
                    error_6 = _a.sent();
                    console.error('Failed to get forecasting capabilities:', error_6);
                    throw error_6;
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    // Clear current forecast
    var clearForecast = (0, react_1.useCallback)(function () {
        setForecast(null);
    }, []);
    // Clear bulk forecasts
    var clearBulkForecasts = (0, react_1.useCallback)(function () {
        setBulkForecasts([]);
    }, []);
    // Clear seasonal analysis
    var clearSeasonalAnalysis = (0, react_1.useCallback)(function () {
        setSeasonalAnalysis(null);
    }, []);
    // Clear accuracy analysis
    var clearAccuracyAnalysis = (0, react_1.useCallback)(function () {
        setAccuracyAnalysis(null);
    }, []);
    // Calculate forecast confidence score
    var calculateConfidenceScore = (0, react_1.useCallback)(function (forecastResult) {
        var accuracy = forecastResult.accuracy, modelUsed = forecastResult.modelUsed;
        // Base score from model accuracy
        var score = accuracy.lastPeriodAccuracy * 0.4;
        // Adjust based on MAPE (lower is better)
        var mapeScore = Math.max(0, 1 - accuracy.mape);
        score += mapeScore * 0.3;
        // Adjust based on model type reliability
        var modelReliability = {
            'seasonal_decomposition': 0.9,
            'exponential_smoothing': 0.8,
            'linear_regression': 0.7,
            'moving_average': 0.6
        };
        score += (modelReliability[modelUsed] || 0.6) * 0.3;
        return Math.min(1, Math.max(0, score));
    }, []);
    // Get forecast recommendations
    var getForecastRecommendations = (0, react_1.useCallback)(function (forecastResult, seasonalData) {
        var recommendations = __spreadArray([], forecastResult.recommendations, true);
        if (seasonalData) {
            var strongPatterns = seasonalData.seasonalPatterns.filter(function (p) { return p.strength > 0.5; });
            if (strongPatterns.length > 0) {
                recommendations.push('Strong seasonal patterns detected - consider seasonal inventory adjustments');
            }
            if (seasonalData.demandDrivers.appointmentBased) {
                recommendations.push('Demand is appointment-driven - link inventory planning to appointment schedules');
            }
        }
        var confidenceScore = calculateConfidenceScore(forecastResult);
        if (confidenceScore < 0.6) {
            recommendations.push('Low forecast confidence - increase monitoring frequency and safety stock');
        }
        else if (confidenceScore > 0.8) {
            recommendations.push('High forecast confidence - suitable for automated reordering');
        }
        return recommendations;
    }, [calculateConfidenceScore]);
    return {
        // State
        isLoading: isLoading,
        forecast: forecast,
        bulkForecasts: bulkForecasts,
        seasonalAnalysis: seasonalAnalysis,
        accuracyAnalysis: accuracyAnalysis,
        capabilities: capabilities,
        // Actions
        generateForecast: generateForecast,
        generateBulkForecast: generateBulkForecast,
        analyzeSeasonalPatterns: analyzeSeasonalPatterns,
        getAccuracyAnalysis: getAccuracyAnalysis,
        logForecastAccuracy: logForecastAccuracy,
        getCapabilities: getCapabilities,
        // Clear functions
        clearForecast: clearForecast,
        clearBulkForecasts: clearBulkForecasts,
        clearSeasonalAnalysis: clearSeasonalAnalysis,
        clearAccuracyAnalysis: clearAccuracyAnalysis,
        // Utility functions
        calculateConfidenceScore: calculateConfidenceScore,
        getForecastRecommendations: getForecastRecommendations
    };
}
