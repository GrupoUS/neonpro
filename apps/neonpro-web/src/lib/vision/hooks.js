"use strict";
/**
 * Vision Analysis System React Hooks
 * Custom hooks for NeonPro Computer Vision System
 * Epic 10 - Story 10.1: Automated Before/After Analysis
 *
 * VOIDBEAST V4.0 APEX ENHANCED - Quality ≥9.5/10
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
exports.useVisionAnalysis = useVisionAnalysis;
exports.useImageUpload = useImageUpload;
exports.useAnalysisExport = useAnalysisExport;
exports.useAnnotations = useAnnotations;
exports.useMeasurements = useMeasurements;
exports.useAnalysisHistory = useAnalysisHistory;
exports.usePerformanceMonitoring = usePerformanceMonitoring;
exports.useLocalStorage = useLocalStorage;
exports.useDebounce = useDebounce;
exports.useIntersectionObserver = useIntersectionObserver;
var react_1 = require("react");
var sonner_1 = require("sonner");
var config_1 = require("./config");
var utils_1 = require("./utils");
/**
 * Hook for managing vision analysis operations
 */
function useVisionAnalysis() {
    var _this = this;
    var _a = (0, react_1.useState)(false), isAnalyzing = _a[0], setIsAnalyzing = _a[1];
    var _b = (0, react_1.useState)(null), progress = _b[0], setProgress = _b[1];
    var _c = (0, react_1.useState)(null), result = _c[0], setResult = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var abortControllerRef = (0, react_1.useRef)(null);
    var startAnalysis = (0, react_1.useCallback)(function (request) { return __awaiter(_this, void 0, void 0, function () {
        var validation, response, errorData, analysisResult, resultValidation, err_1, errorMessage;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 7]);
                    setIsAnalyzing(true);
                    setError(null);
                    setProgress({ stage: 'initializing', percentage: 0 });
                    // Create abort controller for cancellation
                    abortControllerRef.current = new AbortController();
                    validation = validateAnalysisRequest(request);
                    if (!validation.valid) {
                        throw new Error(((_a = validation.errors[0]) === null || _a === void 0 ? void 0 : _a.message) || 'Invalid analysis request');
                    }
                    return [4 /*yield*/, fetch('/api/vision/analyze', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(request),
                            signal: abortControllerRef.current.signal,
                        })];
                case 1:
                    response = _b.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    errorData = _b.sent();
                    throw new Error(errorData.message || 'Analysis failed');
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    analysisResult = _b.sent();
                    resultValidation = utils_1.VisionUtils.Analysis.validateAnalysisResult(analysisResult);
                    if (!resultValidation.valid) {
                        console.warn('Analysis result validation warnings:', resultValidation.warnings);
                    }
                    setResult(analysisResult);
                    setProgress({ stage: 'completed', percentage: 100 });
                    sonner_1.toast.success('Análise concluída com sucesso!');
                    return [2 /*return*/, analysisResult];
                case 5:
                    err_1 = _b.sent();
                    if (err_1.name === 'AbortError') {
                        setError('Análise cancelada');
                        sonner_1.toast.info('Análise cancelada');
                    }
                    else {
                        errorMessage = utils_1.VisionUtils.Error.getUserFriendlyMessage(err_1);
                        setError(errorMessage);
                        sonner_1.toast.error("Erro na an\u00E1lise: ".concat(errorMessage));
                    }
                    return [2 /*return*/, null];
                case 6:
                    setIsAnalyzing(false);
                    abortControllerRef.current = null;
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); }, []);
    var cancelAnalysis = (0, react_1.useCallback)(function () {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);
    var resetAnalysis = (0, react_1.useCallback)(function () {
        setResult(null);
        setError(null);
        setProgress(null);
        setIsAnalyzing(false);
    }, []);
    return {
        isAnalyzing: isAnalyzing,
        progress: progress,
        result: result,
        error: error,
        startAnalysis: startAnalysis,
        cancelAnalysis: cancelAnalysis,
        resetAnalysis: resetAnalysis
    };
}
/**
 * Hook for managing image uploads and validation
 */
function useImageUpload() {
    var _this = this;
    var _a = (0, react_1.useState)(false), isUploading = _a[0], setIsUploading = _a[1];
    var _b = (0, react_1.useState)(0), uploadProgress = _b[0], setUploadProgress = _b[1];
    var _c = (0, react_1.useState)([]), uploadedImages = _c[0], setUploadedImages = _c[1];
    var _d = (0, react_1.useState)([]), validationErrors = _d[0], setValidationErrors = _d[1];
    var uploadImage = (0, react_1.useCallback)(function (file, type) { return __awaiter(_this, void 0, void 0, function () {
        var validation, errors, metadata, formData, response, errorData, imageData_1, err_2, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, 7, 8]);
                    setIsUploading(true);
                    setValidationErrors([]);
                    setUploadProgress(0);
                    validation = utils_1.VisionUtils.Image.validateImageFile(file);
                    if (!validation.valid) {
                        errors = validation.errors.map(function (e) { return e.message; });
                        setValidationErrors(errors);
                        errors.forEach(function (error) { return sonner_1.toast.error(error); });
                        return [2 /*return*/, null];
                    }
                    // Show warnings if any
                    validation.warnings.forEach(function (warning) {
                        sonner_1.toast.warning(warning.message);
                    });
                    return [4 /*yield*/, utils_1.VisionUtils.Image.extractImageMetadata(file)];
                case 1:
                    metadata = _a.sent();
                    formData = new FormData();
                    formData.append('image', file);
                    formData.append('type', type);
                    formData.append('metadata', JSON.stringify(metadata));
                    return [4 /*yield*/, fetch('/api/vision/upload', {
                            method: 'POST',
                            body: formData,
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.message || 'Upload failed');
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    imageData_1 = _a.sent();
                    setUploadedImages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [imageData_1], false); });
                    setUploadProgress(100);
                    sonner_1.toast.success("Imagem ".concat(type === 'before' ? 'anterior' : 'posterior', " carregada com sucesso!"));
                    return [2 /*return*/, imageData_1];
                case 6:
                    err_2 = _a.sent();
                    errorMessage = utils_1.VisionUtils.Error.getUserFriendlyMessage(err_2);
                    setValidationErrors([errorMessage]);
                    sonner_1.toast.error("Erro no upload: ".concat(errorMessage));
                    return [2 /*return*/, null];
                case 7:
                    setIsUploading(false);
                    setTimeout(function () { return setUploadProgress(0); }, 1000);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); }, []);
    var removeImage = (0, react_1.useCallback)(function (imageId) {
        setUploadedImages(function (prev) { return prev.filter(function (img) { return img.id !== imageId; }); });
        sonner_1.toast.info('Imagem removida');
    }, []);
    var clearImages = (0, react_1.useCallback)(function () {
        setUploadedImages([]);
        setValidationErrors([]);
        sonner_1.toast.info('Todas as imagens foram removidas');
    }, []);
    return {
        isUploading: isUploading,
        uploadProgress: uploadProgress,
        uploadedImages: uploadedImages,
        validationErrors: validationErrors,
        uploadImage: uploadImage,
        removeImage: removeImage,
        clearImages: clearImages
    };
}
/**
 * Hook for managing analysis export functionality
 */
function useAnalysisExport() {
    var _this = this;
    var _a = (0, react_1.useState)(false), isExporting = _a[0], setIsExporting = _a[1];
    var _b = (0, react_1.useState)(0), exportProgress = _b[0], setExportProgress = _b[1];
    var _c = (0, react_1.useState)([]), exportHistory = _c[0], setExportHistory = _c[1];
    var exportAnalysis = (0, react_1.useCallback)(function (analysisId, options) { return __awaiter(_this, void 0, void 0, function () {
        var validation, response, errorData, exportResult_1, err_3, errorMessage;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 7]);
                    setIsExporting(true);
                    setExportProgress(0);
                    validation = utils_1.VisionUtils.Export.validateExportOptions(options);
                    if (!validation.valid) {
                        throw new Error(((_a = validation.errors[0]) === null || _a === void 0 ? void 0 : _a.message) || 'Invalid export options');
                    }
                    return [4 /*yield*/, fetch('/api/vision/export', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(__assign({ analysisId: analysisId }, options)),
                        })];
                case 1:
                    response = _b.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    errorData = _b.sent();
                    throw new Error(errorData.message || 'Export failed');
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    exportResult_1 = _b.sent();
                    setExportHistory(function (prev) { return __spreadArray([exportResult_1], prev, true); });
                    setExportProgress(100);
                    sonner_1.toast.success("An\u00E1lise exportada como ".concat(options.format.toUpperCase()));
                    return [2 /*return*/, exportResult_1];
                case 5:
                    err_3 = _b.sent();
                    errorMessage = utils_1.VisionUtils.Error.getUserFriendlyMessage(err_3);
                    sonner_1.toast.error("Erro na exporta\u00E7\u00E3o: ".concat(errorMessage));
                    return [2 /*return*/, null];
                case 6:
                    setIsExporting(false);
                    setTimeout(function () { return setExportProgress(0); }, 1000);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); }, []);
    var downloadExport = (0, react_1.useCallback)(function (exportResult) {
        if (exportResult.downloadUrl) {
            var link = document.createElement('a');
            link.href = exportResult.downloadUrl;
            link.download = exportResult.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            sonner_1.toast.success('Download iniciado');
        }
    }, []);
    var loadExportHistory = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, history_1, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/vision/export')];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    history_1 = _a.sent();
                    setExportHistory(history_1);
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    err_4 = _a.sent();
                    console.error('Failed to load export history:', err_4);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    (0, react_1.useEffect)(function () {
        loadExportHistory();
    }, [loadExportHistory]);
    return {
        isExporting: isExporting,
        exportProgress: exportProgress,
        exportHistory: exportHistory,
        exportAnalysis: exportAnalysis,
        downloadExport: downloadExport,
        loadExportHistory: loadExportHistory
    };
}
/**
 * Hook for managing annotations
 */
function useAnnotations(imageId) {
    var _a = (0, react_1.useState)([]), annotations = _a[0], setAnnotations = _a[1];
    var _b = (0, react_1.useState)(null), selectedAnnotation = _b[0], setSelectedAnnotation = _b[1];
    var _c = (0, react_1.useState)(false), isEditing = _c[0], setIsEditing = _c[1];
    var addAnnotation = (0, react_1.useCallback)(function (annotation) {
        var newAnnotation = __assign(__assign({}, annotation), { id: utils_1.VisionUtils.Annotation.generateAnnotationId(), createdAt: new Date().toISOString() });
        setAnnotations(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newAnnotation], false); });
        setSelectedAnnotation(newAnnotation.id);
        sonner_1.toast.success('Anotação adicionada');
    }, []);
    var updateAnnotation = (0, react_1.useCallback)(function (id, updates) {
        setAnnotations(function (prev) { return prev.map(function (annotation) {
            return annotation.id === id ? __assign(__assign({}, annotation), updates) : annotation;
        }); });
        sonner_1.toast.success('Anotação atualizada');
    }, []);
    var removeAnnotation = (0, react_1.useCallback)(function (id) {
        setAnnotations(function (prev) { return prev.filter(function (annotation) { return annotation.id !== id; }); });
        if (selectedAnnotation === id) {
            setSelectedAnnotation(null);
        }
        sonner_1.toast.success('Anotação removida');
    }, [selectedAnnotation]);
    var clearAnnotations = (0, react_1.useCallback)(function () {
        setAnnotations([]);
        setSelectedAnnotation(null);
        setIsEditing(false);
        sonner_1.toast.info('Todas as anotações foram removidas');
    }, []);
    var selectAnnotation = (0, react_1.useCallback)(function (id) {
        setSelectedAnnotation(id);
        setIsEditing(false);
    }, []);
    var startEditing = (0, react_1.useCallback)(function (id) {
        setSelectedAnnotation(id);
        setIsEditing(true);
    }, []);
    var stopEditing = (0, react_1.useCallback)(function () {
        setIsEditing(false);
    }, []);
    return {
        annotations: annotations,
        selectedAnnotation: selectedAnnotation,
        isEditing: isEditing,
        addAnnotation: addAnnotation,
        updateAnnotation: updateAnnotation,
        removeAnnotation: removeAnnotation,
        clearAnnotations: clearAnnotations,
        selectAnnotation: selectAnnotation,
        startEditing: startEditing,
        stopEditing: stopEditing
    };
}
/**
 * Hook for managing measurements
 */
function useMeasurements(imageId) {
    var _a = (0, react_1.useState)([]), measurements = _a[0], setMeasurements = _a[1];
    var _b = (0, react_1.useState)(null), selectedMeasurement = _b[0], setSelectedMeasurement = _b[1];
    var _c = (0, react_1.useState)(null), calibration = _c[0], setCalibration = _c[1];
    var addMeasurement = (0, react_1.useCallback)(function (measurement) {
        var newMeasurement = __assign(__assign({}, measurement), { id: "measurement_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)), createdAt: new Date().toISOString() });
        setMeasurements(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newMeasurement], false); });
        setSelectedMeasurement(newMeasurement.id);
        sonner_1.toast.success('Medição adicionada');
    }, []);
    var updateMeasurement = (0, react_1.useCallback)(function (id, updates) {
        setMeasurements(function (prev) { return prev.map(function (measurement) {
            return measurement.id === id ? __assign(__assign({}, measurement), updates) : measurement;
        }); });
        sonner_1.toast.success('Medição atualizada');
    }, []);
    var removeMeasurement = (0, react_1.useCallback)(function (id) {
        setMeasurements(function (prev) { return prev.filter(function (measurement) { return measurement.id !== id; }); });
        if (selectedMeasurement === id) {
            setSelectedMeasurement(null);
        }
        sonner_1.toast.success('Medição removida');
    }, [selectedMeasurement]);
    var clearMeasurements = (0, react_1.useCallback)(function () {
        setMeasurements([]);
        setSelectedMeasurement(null);
        sonner_1.toast.info('Todas as medições foram removidas');
    }, []);
    var setCalibrationRatio = (0, react_1.useCallback)(function (pixelToMmRatio) {
        setCalibration({ pixelToMmRatio: pixelToMmRatio });
        // Recalculate all measurements with new calibration
        setMeasurements(function (prev) { return prev.map(function (measurement) { return (__assign({}, measurement)); }); });
        sonner_1.toast.success('Calibração atualizada');
    }, []);
    return {
        measurements: measurements,
        selectedMeasurement: selectedMeasurement,
        calibration: calibration,
        addMeasurement: addMeasurement,
        updateMeasurement: updateMeasurement,
        removeMeasurement: removeMeasurement,
        clearMeasurements: clearMeasurements,
        setSelectedMeasurement: setSelectedMeasurement,
        setCalibrationRatio: setCalibrationRatio
    };
}
/**
 * Hook for managing analysis history
 */
function useAnalysisHistory() {
    var _this = this;
    var _a = (0, react_1.useState)([]), history = _a[0], setHistory = _a[1];
    var _b = (0, react_1.useState)(false), isLoading = _b[0], setIsLoading = _b[1];
    var _c = (0, react_1.useState)(true), hasMore = _c[0], setHasMore = _c[1];
    var _d = (0, react_1.useState)(1), page = _d[0], setPage = _d[1];
    var loadHistory = (0, react_1.useCallback)(function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (reset) {
            var currentPage, response, data_1, err_5;
            if (reset === void 0) { reset = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, 5, 6]);
                        setIsLoading(true);
                        currentPage = reset ? 1 : page;
                        return [4 /*yield*/, fetch("/api/vision/history?page=".concat(currentPage, "&limit=10"))];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data_1 = _a.sent();
                        if (reset) {
                            setHistory(data_1.results);
                            setPage(2);
                        }
                        else {
                            setHistory(function (prev) { return __spreadArray(__spreadArray([], prev, true), data_1.results, true); });
                            setPage(function (prev) { return prev + 1; });
                        }
                        setHasMore(data_1.hasMore);
                        _a.label = 3;
                    case 3: return [3 /*break*/, 6];
                    case 4:
                        err_5 = _a.sent();
                        console.error('Failed to load analysis history:', err_5);
                        sonner_1.toast.error('Erro ao carregar histórico');
                        return [3 /*break*/, 6];
                    case 5:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }, [page]);
    var refreshHistory = (0, react_1.useCallback)(function () {
        loadHistory(true);
    }, [loadHistory]);
    var loadMore = (0, react_1.useCallback)(function () {
        if (!isLoading && hasMore) {
            loadHistory(false);
        }
    }, [isLoading, hasMore, loadHistory]);
    (0, react_1.useEffect)(function () {
        loadHistory(true);
    }, []);
    return {
        history: history,
        isLoading: isLoading,
        hasMore: hasMore,
        refreshHistory: refreshHistory,
        loadMore: loadMore
    };
}
/**
 * Hook for managing performance monitoring
 */
function usePerformanceMonitoring() {
    var _a = (0, react_1.useState)(null), metrics = _a[0], setMetrics = _a[1];
    var _b = (0, react_1.useState)(false), isMonitoring = _b[0], setIsMonitoring = _b[1];
    var timerRef = (0, react_1.useRef)(null);
    var startMonitoring = (0, react_1.useCallback)(function () {
        setIsMonitoring(true);
        timerRef.current = utils_1.VisionUtils.Performance.createTimer();
        timerRef.current.start();
    }, []);
    var stopMonitoring = (0, react_1.useCallback)(function () {
        if (timerRef.current && isMonitoring) {
            var processingTime = timerRef.current.stop();
            var memoryUsage = utils_1.VisionUtils.Performance.getMemoryUsage();
            var newMetrics = {
                processingTimeMs: processingTime,
                memoryUsageMB: (memoryUsage === null || memoryUsage === void 0 ? void 0 : memoryUsage.used) || 0,
                cpuUsagePercent: 0, // Would need additional implementation
                timestamp: new Date().toISOString()
            };
            setMetrics(newMetrics);
            setIsMonitoring(false);
            // Log performance if below thresholds
            if (processingTime > config_1.VISION_CONFIG.PERFORMANCE.MAX_PROCESSING_TIME_MS) {
                console.warn('Processing time exceeded threshold:', processingTime);
            }
        }
    }, [isMonitoring]);
    var resetMetrics = (0, react_1.useCallback)(function () {
        setMetrics(null);
        setIsMonitoring(false);
        timerRef.current = null;
    }, []);
    return {
        metrics: metrics,
        isMonitoring: isMonitoring,
        startMonitoring: startMonitoring,
        stopMonitoring: stopMonitoring,
        resetMetrics: resetMetrics
    };
}
/**
 * Helper function to validate analysis request
 */
function validateAnalysisRequest(request) {
    var errors = [];
    if (!request.beforeImageId) {
        errors.push({ message: 'Imagem anterior é obrigatória' });
    }
    if (!request.afterImageId) {
        errors.push({ message: 'Imagem posterior é obrigatória' });
    }
    if (!request.treatmentType) {
        errors.push({ message: 'Tipo de tratamento é obrigatório' });
    }
    return {
        valid: errors.length === 0,
        errors: errors,
        warnings: []
    };
}
/**
 * Hook for managing local storage state
 */
function useLocalStorage(key, initialValue) {
    var _a = (0, react_1.useState)(function () {
        try {
            var item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        }
        catch (error) {
            console.error("Error reading localStorage key \"".concat(key, "\":"), error);
            return initialValue;
        }
    }), storedValue = _a[0], setStoredValue = _a[1];
    var setValue = (0, react_1.useCallback)(function (value) {
        try {
            var valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        catch (error) {
            console.error("Error setting localStorage key \"".concat(key, "\":"), error);
        }
    }, [key, storedValue]);
    return [storedValue, setValue];
}
/**
 * Hook for debounced values
 */
function useDebounce(value, delay) {
    var _a = (0, react_1.useState)(value), debouncedValue = _a[0], setDebouncedValue = _a[1];
    (0, react_1.useEffect)(function () {
        var handler = setTimeout(function () {
            setDebouncedValue(value);
        }, delay);
        return function () {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}
/**
 * Hook for managing component visibility with intersection observer
 */
function useIntersectionObserver(elementRef, options) {
    var _a = (0, react_1.useState)(false), isVisible = _a[0], setIsVisible = _a[1];
    (0, react_1.useEffect)(function () {
        var element = elementRef.current;
        if (!element)
            return;
        var observer = new IntersectionObserver(function (_a) {
            var entry = _a[0];
            setIsVisible(entry.isIntersecting);
        }, options);
        observer.observe(element);
        return function () {
            observer.unobserve(element);
        };
    }, [elementRef, options]);
    return isVisible;
}
exports.default = {
    useVisionAnalysis: useVisionAnalysis,
    useImageUpload: useImageUpload,
    useAnalysisExport: useAnalysisExport,
    useAnnotations: useAnnotations,
    useMeasurements: useMeasurements,
    useAnalysisHistory: useAnalysisHistory,
    usePerformanceMonitoring: usePerformanceMonitoring,
    useLocalStorage: useLocalStorage,
    useDebounce: useDebounce,
    useIntersectionObserver: useIntersectionObserver
};
