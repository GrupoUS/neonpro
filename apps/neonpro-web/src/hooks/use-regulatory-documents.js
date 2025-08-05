"use strict";
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
exports.useRegulatoryDocuments = useRegulatoryDocuments;
var react_1 = require("react");
var sonner_1 = require("sonner");
function useRegulatoryDocuments(options) {
    var _this = this;
    var _a;
    if (options === void 0) { options = {}; }
    var _b = (0, react_1.useState)([]), documents = _b[0], setDocuments = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var _e = (0, react_1.useState)(null), pagination = _e[0], setPagination = _e[1];
    var buildQuery = (0, react_1.useCallback)(function () {
        var params = new URLSearchParams();
        if (options.page)
            params.set('page', options.page.toString());
        if (options.limit)
            params.set('limit', options.limit.toString());
        if (options.category)
            params.set('category', options.category);
        if (options.status)
            params.set('status', options.status);
        if (options.search)
            params.set('search', options.search);
        return params.toString();
    }, [options]);
    var fetchDocuments = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var query, response, data_1, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    setError(null);
                    query = buildQuery();
                    return [4 /*yield*/, fetch("/api/regulatory-documents?".concat(query))];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to fetch documents');
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data_1 = _a.sent();
                    if (options.page && options.page > 1) {
                        // Load more - append to existing documents
                        setDocuments(function (prev) { return __spreadArray(__spreadArray([], prev, true), data_1.documents, true); });
                    }
                    else {
                        // Fresh load - replace documents
                        setDocuments(data_1.documents);
                    }
                    setPagination(data_1.pagination);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    setError(err_1 instanceof Error ? err_1.message : 'Unknown error');
                    sonner_1.toast.error('Erro ao carregar documentos regulatórios');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [buildQuery, options.page]);
    var createDocument = (0, react_1.useCallback)(function (data) { return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, result, newDocument_1, err_2, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, fetch('/api/regulatory-documents', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data),
                        })];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    errorData = _a.sent();
                    throw new Error(errorData.error || 'Failed to create document');
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    result = _a.sent();
                    newDocument_1 = result.document;
                    // Add to local state
                    setDocuments(function (prev) { return __spreadArray([newDocument_1], prev, true); });
                    sonner_1.toast.success('Documento regulatório criado com sucesso');
                    return [2 /*return*/, newDocument_1];
                case 5:
                    err_2 = _a.sent();
                    message = err_2 instanceof Error ? err_2.message : 'Erro desconhecido';
                    sonner_1.toast.error("Erro ao criar documento: ".concat(message));
                    return [2 /*return*/, null];
                case 6: return [2 /*return*/];
            }
        });
    }); }, []);
    var updateDocument = (0, react_1.useCallback)(function (id, data) { return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, result, updatedDocument_1, err_3, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, fetch("/api/regulatory-documents/".concat(id), {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data),
                        })];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    errorData = _a.sent();
                    throw new Error(errorData.error || 'Failed to update document');
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    result = _a.sent();
                    updatedDocument_1 = result.document;
                    // Update local state
                    setDocuments(function (prev) {
                        return prev.map(function (doc) { return doc.id === id ? updatedDocument_1 : doc; });
                    });
                    sonner_1.toast.success('Documento regulatório atualizado com sucesso');
                    return [2 /*return*/, updatedDocument_1];
                case 5:
                    err_3 = _a.sent();
                    message = err_3 instanceof Error ? err_3.message : 'Erro desconhecido';
                    sonner_1.toast.error("Erro ao atualizar documento: ".concat(message));
                    return [2 /*return*/, null];
                case 6: return [2 /*return*/];
            }
        });
    }); }, []);
    var deleteDocument = (0, react_1.useCallback)(function (id) { return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, err_4, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/regulatory-documents/".concat(id), {
                            method: 'DELETE',
                        })];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    errorData = _a.sent();
                    throw new Error(errorData.error || 'Failed to delete document');
                case 3:
                    // Remove from local state
                    setDocuments(function (prev) { return prev.filter(function (doc) { return doc.id !== id; }); });
                    sonner_1.toast.success('Documento regulatório excluído com sucesso');
                    return [2 /*return*/, true];
                case 4:
                    err_4 = _a.sent();
                    message = err_4 instanceof Error ? err_4.message : 'Erro desconhecido';
                    sonner_1.toast.error("Erro ao excluir documento: ".concat(message));
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    var loadMore = (0, react_1.useCallback)(function () {
        if (pagination === null || pagination === void 0 ? void 0 : pagination.hasNextPage) {
            fetchDocuments();
        }
    }, [fetchDocuments, pagination === null || pagination === void 0 ? void 0 : pagination.hasNextPage]);
    var refetch = (0, react_1.useCallback)(function () {
        fetchDocuments();
    }, [fetchDocuments]);
    (0, react_1.useEffect)(function () {
        fetchDocuments();
    }, [fetchDocuments]);
    return {
        documents: documents,
        loading: loading,
        error: error,
        pagination: pagination,
        refetch: refetch,
        createDocument: createDocument,
        updateDocument: updateDocument,
        deleteDocument: deleteDocument,
        loadMore: loadMore,
        hasMore: (_a = pagination === null || pagination === void 0 ? void 0 : pagination.hasNextPage) !== null && _a !== void 0 ? _a : false
    };
}
