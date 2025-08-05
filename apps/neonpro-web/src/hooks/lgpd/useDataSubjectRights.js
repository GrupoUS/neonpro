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
exports.useDataSubjectRights = useDataSubjectRights;
var react_1 = require("react");
var LGPDComplianceManager_1 = require("@/lib/lgpd/LGPDComplianceManager");
var use_toast_1 = require("@/hooks/use-toast");
function useDataSubjectRights() {
    var _this = this;
    var _a = (0, react_1.useState)([]), requests = _a[0], setRequests = _a[1];
    var _b = (0, react_1.useState)(0), totalCount = _b[0], setTotalCount = _b[1];
    var _c = (0, react_1.useState)(1), currentPage = _c[0], setCurrentPage = _c[1];
    var _d = (0, react_1.useState)({
        pending: 0,
        inProgress: 0,
        completed: 0,
        rejected: 0
    }), statistics = _d[0], setStatistics = _d[1];
    var _e = (0, react_1.useState)(true), isLoading = _e[0], setIsLoading = _e[1];
    var _f = (0, react_1.useState)(false), isProcessing = _f[0], setIsProcessing = _f[1];
    var _g = (0, react_1.useState)(null), error = _g[0], setError = _g[1];
    var _h = (0, react_1.useState)({
        limit: 20,
        offset: 0,
        sortBy: 'created_at',
        sortOrder: 'desc'
    }), filters = _h[0], setFilters = _h[1];
    var toast = (0, use_toast_1.useToast)().toast;
    var complianceManager = new LGPDComplianceManager_1.LGPDComplianceManager();
    var loadRequests = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, stats, err_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    setError(null);
                    return [4 /*yield*/, complianceManager.getDataSubjectRequests(__assign(__assign({}, filters), { offset: (currentPage - 1) * (filters.limit || 20) }))];
                case 1:
                    response = _a.sent();
                    setRequests(response.data);
                    setTotalCount(response.total);
                    stats = response.data.reduce(function (acc, request) {
                        acc[request.status]++;
                        return acc;
                    }, { pending: 0, inProgress: 0, completed: 0, rejected: 0 });
                    setStatistics(stats);
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    errorMessage = err_1 instanceof Error ? err_1.message : 'Erro ao carregar solicitações';
                    setError(errorMessage);
                    toast({
                        title: 'Erro',
                        description: errorMessage,
                        variant: 'destructive'
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [filters, currentPage, complianceManager, toast]);
    var processRequest = (0, react_1.useCallback)(function (requestId, action, notes) { return __awaiter(_this, void 0, void 0, function () {
        var newStatus_1, updateData_1, err_2, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsProcessing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setError(null);
                    newStatus_1 = action === 'approve' ? 'completed' : 'rejected';
                    updateData_1 = {
                        status: newStatus_1,
                        processed_at: new Date().toISOString(),
                        notes: notes || ''
                    };
                    return [4 /*yield*/, complianceManager.updateDataSubjectRequest(requestId, updateData_1)];
                case 2:
                    _a.sent();
                    // Update local state
                    setRequests(function (prev) { return prev.map(function (request) {
                        return request.id === requestId
                            ? __assign(__assign(__assign({}, request), updateData_1), { updated_at: new Date().toISOString() }) : request;
                    }); });
                    // Update statistics
                    setStatistics(function (prev) {
                        var request = requests.find(function (r) { return r.id === requestId; });
                        if (!request)
                            return prev;
                        var newStats = __assign({}, prev);
                        newStats[request.status]--;
                        newStats[newStatus_1]++;
                        return newStats;
                    });
                    toast({
                        title: 'Solicitação processada',
                        description: "Solicita\u00E7\u00E3o foi ".concat(action === 'approve' ? 'aprovada' : 'rejeitada', " com sucesso.")
                    });
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _a.sent();
                    errorMessage = err_2 instanceof Error ? err_2.message : 'Erro ao processar solicitação';
                    setError(errorMessage);
                    toast({
                        title: 'Erro',
                        description: errorMessage,
                        variant: 'destructive'
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setIsProcessing(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [complianceManager, requests, toast]);
    var updateRequestStatus = (0, react_1.useCallback)(function (requestId, status, notes) { return __awaiter(_this, void 0, void 0, function () {
        var updateData_2, err_3, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsProcessing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setError(null);
                    updateData_2 = __assign(__assign({ status: status, updated_at: new Date().toISOString() }, (notes && { notes: notes })), (status === 'completed' && { processed_at: new Date().toISOString() }));
                    return [4 /*yield*/, complianceManager.updateDataSubjectRequest(requestId, updateData_2)];
                case 2:
                    _a.sent();
                    // Update local state
                    setRequests(function (prev) { return prev.map(function (request) {
                        return request.id === requestId
                            ? __assign(__assign({}, request), updateData_2) : request;
                    }); });
                    // Update statistics
                    setStatistics(function (prev) {
                        var request = requests.find(function (r) { return r.id === requestId; });
                        if (!request)
                            return prev;
                        var newStats = __assign({}, prev);
                        newStats[request.status]--;
                        newStats[status]++;
                        return newStats;
                    });
                    toast({
                        title: 'Status atualizado',
                        description: 'Status da solicitação foi atualizado com sucesso.'
                    });
                    return [3 /*break*/, 5];
                case 3:
                    err_3 = _a.sent();
                    errorMessage = err_3 instanceof Error ? err_3.message : 'Erro ao atualizar status';
                    setError(errorMessage);
                    toast({
                        title: 'Erro',
                        description: errorMessage,
                        variant: 'destructive'
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setIsProcessing(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [complianceManager, requests, toast]);
    var exportRequests = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var csvHeaders, csvRows, csvContent, blob, link, url, errorMessage;
        return __generator(this, function (_a) {
            try {
                setError(null);
                csvHeaders = [
                    'ID',
                    'Tipo',
                    'Usuário',
                    'Email',
                    'Status',
                    'Data de Criação',
                    'Data de Processamento',
                    'Prazo',
                    'Descrição',
                    'Observações'
                ];
                csvRows = requests.map(function (request) { return [
                    request.id,
                    request.request_type,
                    request.user_id || '',
                    request.email || '',
                    request.status,
                    request.created_at,
                    request.processed_at || '',
                    request.deadline || '',
                    request.description || '',
                    request.notes || ''
                ]; });
                csvContent = __spreadArray([csvHeaders], csvRows, true).map(function (row) { return row.map(function (cell) { return "\"".concat(cell, "\""); }).join(','); })
                    .join('\n');
                blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                link = document.createElement('a');
                url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', "lgpd-requests-".concat(new Date().toISOString().split('T')[0], ".csv"));
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast({
                    title: 'Exportação concluída',
                    description: 'Solicitações exportadas com sucesso.'
                });
            }
            catch (err) {
                errorMessage = err instanceof Error ? err.message : 'Erro ao exportar solicitações';
                setError(errorMessage);
                toast({
                    title: 'Erro na exportação',
                    description: errorMessage,
                    variant: 'destructive'
                });
            }
            return [2 /*return*/];
        });
    }); }, [requests, toast]);
    var goToPage = (0, react_1.useCallback)(function (page) {
        setCurrentPage(page);
    }, []);
    // Load data on mount and when filters change
    (0, react_1.useEffect)(function () {
        var loadData = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoading(true);
                        return [4 /*yield*/, loadRequests()];
                    case 1:
                        _a.sent();
                        setIsLoading(false);
                        return [2 /*return*/];
                }
            });
        }); };
        loadData();
    }, [loadRequests]);
    return {
        // Data
        requests: requests,
        totalCount: totalCount,
        currentPage: currentPage,
        statistics: statistics,
        // Loading states
        isLoading: isLoading,
        isProcessing: isProcessing,
        // Filters
        filters: filters,
        setFilters: setFilters,
        // Actions
        loadRequests: loadRequests,
        processRequest: processRequest,
        updateRequestStatus: updateRequestStatus,
        exportRequests: exportRequests,
        // Pagination
        goToPage: goToPage,
        // Error handling
        error: error
    };
}
