"use strict";
/**
 * Advanced Statistical Insights Hook for NeonPro
 *
 * Custom hook providing advanced statistical analysis capabilities including:
 * - Correlation analysis between different metrics
 * - Anomaly detection with automated alerts
 * - Predictive insights using statistical models
 * - Comparative analysis across time periods
 * - Statistical significance testing for A/B experiments
 *
 * Uses statistical functions from SQL backend and provides UI-ready insights.
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
exports.useStatisticalInsights = useStatisticalInsights;
exports.useABTestAnalysis = useABTestAnalysis;
exports.useMetricBenchmarking = useMetricBenchmarking;
exports.useStatisticalFormatters = useStatisticalFormatters;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var client_1 = require("@/lib/supabase/client");
/**
 * Main statistical insights hook
 */
function useStatisticalInsights(initialConfig) {
    var _this = this;
    var _a;
    var queryClient = (0, react_query_1.useQueryClient)();
    var supabase = yield (0, client_1.createClient)();
    var _b = (0, react_1.useState)(initialConfig), config = _b[0], setConfig = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    // Query key for caching
    var queryKey = (0, react_1.useMemo)(function () { return [
        'statistical-insights',
        config.metrics,
        config.timeRange,
        config.analysisType,
        config.confidenceLevel
    ]; }, [config]);
    // Main insights query
    var _d = (0, react_query_1.useQuery)({
        queryKey: queryKey,
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch('/api/analytics/insights', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    config: config,
                                    analysisDepth: 'comprehensive'
                                })
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error('Failed to generate insights');
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, {
                                correlations: data.correlations || [],
                                anomalies: data.anomalies || [],
                                predictions: data.predictions || [],
                                comparisons: data.comparisons || [],
                                significance: data.significance || [],
                                insights: data.insights || [],
                                recommendations: data.recommendations || []
                            }];
                    case 3:
                        err_1 = _a.sent();
                        console.error('Statistical insights error:', err_1);
                        throw err_1;
                    case 4: return [2 /*return*/];
                }
            });
        }); },
        staleTime: 15 * 60 * 1000, // 15 minutes
        cacheTime: 60 * 60 * 1000, // 1 hour
        retry: 2,
        enabled: config.metrics.length > 0
    }), insightsData = _d.data, isLoading = _d.isLoading, refreshInsights = _d.refetch;
    // Run comprehensive analysis mutation
    var runAnalysisMutation = (0, react_query_1.useMutation)({
        mutationFn: function (analysisConfig) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch('/api/analytics/statistical-analysis', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(analysisConfig)
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error('Analysis failed');
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function (data) {
            queryClient.setQueryData(queryKey, data);
            setError(null);
        },
        onError: function (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
        }
    });
    // Anomaly detection mutation
    var anomalyDetectionMutation = (0, react_query_1.useMutation)({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var response;
            var metric = _b.metric, threshold = _b.threshold;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, fetch('/api/analytics/anomaly-detection', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                metric: metric,
                                threshold: threshold,
                                timeRange: config.timeRange,
                                includeContext: true
                            })
                        })];
                    case 1:
                        response = _c.sent();
                        if (!response.ok)
                            throw new Error('Anomaly detection failed');
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function (data) {
            // Update anomalies in current data
            queryClient.setQueryData(queryKey, function (old) { return (__assign(__assign({}, old), { anomalies: __spreadArray(__spreadArray([], ((old === null || old === void 0 ? void 0 : old.anomalies) || []), true), data.anomalies, true) })); });
            setError(null);
        },
        onError: function (err) {
            setError(err instanceof Error ? err.message : 'Anomaly detection failed');
        }
    });
    // Correlation analysis mutation
    var correlationAnalysisMutation = (0, react_query_1.useMutation)({
        mutationFn: function (metrics) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (metrics.length < 2) {
                            throw new Error('At least 2 metrics required for correlation analysis');
                        }
                        return [4 /*yield*/, fetch('/api/analytics/correlation-analysis', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    metrics: metrics,
                                    timeRange: config.timeRange,
                                    confidenceLevel: config.confidenceLevel
                                })
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error('Correlation analysis failed');
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function (data) {
            queryClient.setQueryData(queryKey, function (old) { return (__assign(__assign({}, old), { correlations: data.correlations, insights: __spreadArray(__spreadArray([], ((old === null || old === void 0 ? void 0 : old.insights) || []), true), data.insights, true) })); });
            setError(null);
        },
        onError: function (err) {
            setError(err instanceof Error ? err.message : 'Correlation analysis failed');
        }
    });
    // Prediction generation mutation
    var predictionMutation = (0, react_query_1.useMutation)({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var response;
            var metric = _b.metric, timeframe = _b.timeframe;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, fetch('/api/analytics/predictions', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                metric: metric,
                                timeframe: timeframe,
                                confidenceLevel: config.confidenceLevel,
                                includeFactors: true
                            })
                        })];
                    case 1:
                        response = _c.sent();
                        if (!response.ok)
                            throw new Error('Prediction generation failed');
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function (data) {
            queryClient.setQueryData(queryKey, function (old) { return (__assign(__assign({}, old), { predictions: __spreadArray(__spreadArray([], ((old === null || old === void 0 ? void 0 : old.predictions) || []), true), [data.prediction], false), recommendations: __spreadArray(__spreadArray([], ((old === null || old === void 0 ? void 0 : old.recommendations) || []), true), data.recommendations, true) })); });
            setError(null);
        },
        onError: function (err) {
            setError(err instanceof Error ? err.message : 'Prediction generation failed');
        }
    });
    // Export analysis mutation
    var exportAnalysisMutation = (0, react_query_1.useMutation)({
        mutationFn: function (format) { return __awaiter(_this, void 0, void 0, function () {
            var response, blob, url, a;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!insightsData)
                            throw new Error('No analysis data to export');
                        return [4 /*yield*/, fetch('/api/analytics/export', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    type: 'statistical-insights',
                                    format: format,
                                    data: insightsData
                                })
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error('Export failed');
                        return [4 /*yield*/, response.blob()];
                    case 2:
                        blob = _a.sent();
                        url = window.URL.createObjectURL(blob);
                        a = document.createElement('a');
                        a.href = url;
                        a.download = "statistical-insights-".concat(new Date().toISOString().split('T')[0], ".").concat(format);
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (err) {
            setError(err instanceof Error ? err.message : 'Export failed');
        }
    });
    // Actions
    var runAnalysis = (0, react_1.useCallback)(function (analysisConfig) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setConfig(analysisConfig);
                    return [4 /*yield*/, runAnalysisMutation.mutateAsync(analysisConfig)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [runAnalysisMutation]);
    var detectAnomalies = (0, react_1.useCallback)(function (metric, threshold) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, anomalyDetectionMutation.mutateAsync({ metric: metric, threshold: threshold })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [anomalyDetectionMutation]);
    var analyzeCorrelations = (0, react_1.useCallback)(function (metrics) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, correlationAnalysisMutation.mutateAsync(metrics)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [correlationAnalysisMutation]);
    var generatePredictions = (0, react_1.useCallback)(function (metric, timeframe) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, predictionMutation.mutateAsync({ metric: metric, timeframe: timeframe })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [predictionMutation]);
    var exportAnalysis = (0, react_1.useCallback)(function (format) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exportAnalysisMutation.mutateAsync(format)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [exportAnalysisMutation]);
    return {
        // State
        correlations: (insightsData === null || insightsData === void 0 ? void 0 : insightsData.correlations) || [],
        anomalies: (insightsData === null || insightsData === void 0 ? void 0 : insightsData.anomalies) || [],
        predictions: (insightsData === null || insightsData === void 0 ? void 0 : insightsData.predictions) || [],
        comparisons: (insightsData === null || insightsData === void 0 ? void 0 : insightsData.comparisons) || [],
        significance: (insightsData === null || insightsData === void 0 ? void 0 : insightsData.significance) || [],
        insights: (insightsData === null || insightsData === void 0 ? void 0 : insightsData.insights) || [],
        recommendations: (insightsData === null || insightsData === void 0 ? void 0 : insightsData.recommendations) || [],
        isLoading: isLoading || runAnalysisMutation.isPending,
        error: error || ((_a = runAnalysisMutation.error) === null || _a === void 0 ? void 0 : _a.message) || null,
        lastAnalysis: insightsData ? new Date() : null,
        // Actions
        runAnalysis: runAnalysis,
        detectAnomalies: detectAnomalies,
        analyzeCorrelations: analyzeCorrelations,
        generatePredictions: generatePredictions,
        refreshInsights: refreshInsights,
        exportAnalysis: exportAnalysis
    };
}
/**
 * Hook for A/B test significance analysis
 */
function useABTestAnalysis(testId) {
    var _this = this;
    return (0, react_query_1.useQuery)({
        queryKey: ['ab-test-analysis', testId],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch('/api/analytics/ab-test-analysis', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ testId: testId })
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error('A/B test analysis failed');
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        enabled: !!testId,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
}
/**
 * Hook for metric benchmarking
 */
function useMetricBenchmarking(metrics) {
    var _this = this;
    return (0, react_query_1.useQuery)({
        queryKey: ['metric-benchmarking', metrics],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch('/api/analytics/benchmarking', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                metrics: metrics,
                                includePeerComparison: true,
                                includeIndustryStandards: true
                            })
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error('Benchmarking analysis failed');
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        enabled: metrics.length > 0,
        staleTime: 24 * 60 * 60 * 1000 // 24 hours
    });
}
/**
 * Utility hook for statistical formatting
 */
function useStatisticalFormatters() {
    return (0, react_1.useMemo)(function () { return ({
        formatCorrelation: function (correlation) {
            return correlation >= 0 ? "+".concat(correlation.toFixed(3)) : correlation.toFixed(3);
        },
        getCorrelationStrength: function (correlation) {
            var abs = Math.abs(correlation);
            if (abs >= 0.7)
                return 'Strong';
            if (abs >= 0.4)
                return 'Moderate';
            return 'Weak';
        },
        getCorrelationColor: function (correlation) {
            var abs = Math.abs(correlation);
            if (abs >= 0.7)
                return 'text-green-600';
            if (abs >= 0.4)
                return 'text-yellow-600';
            return 'text-red-600';
        },
        formatSignificance: function (pValue) {
            if (pValue < 0.001)
                return 'p < 0.001 (***)';
            if (pValue < 0.01)
                return "p = ".concat(pValue.toFixed(3), " (**)");
            if (pValue < 0.05)
                return "p = ".concat(pValue.toFixed(3), " (*)");
            return "p = ".concat(pValue.toFixed(3), " (ns)");
        },
        formatConfidence: function (confidence) {
            return "".concat(Math.round(confidence), "%");
        },
        formatDeviation: function (deviation) {
            return "".concat(deviation >= 0 ? '+' : '').concat(deviation.toFixed(2), "\u03C3");
        },
        getAnomalySeverityColor: function (severity) {
            switch (severity) {
                case 'high': return 'text-red-600';
                case 'medium': return 'text-yellow-600';
                case 'low': return 'text-blue-600';
                default: return 'text-gray-600';
            }
        },
        getAnomalySeverityBadge: function (severity) {
            switch (severity) {
                case 'high': return 'destructive';
                case 'medium': return 'secondary';
                default: return 'default';
            }
        }
    }); }, []);
}
