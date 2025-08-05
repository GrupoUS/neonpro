// lib/search/search-client.ts
"use client";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchClient = exports.SearchClient = void 0;
var SearchClient = /** @class */ (function () {
    function SearchClient() {
    }
    /**
     * Executa busca através da API
     */
    SearchClient.prototype.search = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var searchParams, response, result, error_1;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        _k.trys.push([0, 3, , 4]);
                        searchParams = new URLSearchParams();
                        searchParams.set('q', query.term);
                        if ((_a = query.filters) === null || _a === void 0 ? void 0 : _a.types) {
                            searchParams.set('types', query.filters.types.join(','));
                        }
                        if ((_b = query.filters) === null || _b === void 0 ? void 0 : _b.dateRange) {
                            searchParams.set('dateFrom', query.filters.dateRange.start.toISOString());
                            searchParams.set('dateTo', query.filters.dateRange.end.toISOString());
                        }
                        if ((_c = query.filters) === null || _c === void 0 ? void 0 : _c.patientId) {
                            searchParams.set('patientId', query.filters.patientId);
                        }
                        if ((_d = query.options) === null || _d === void 0 ? void 0 : _d.limit) {
                            searchParams.set('limit', query.options.limit.toString());
                        }
                        if ((_e = query.options) === null || _e === void 0 ? void 0 : _e.offset) {
                            searchParams.set('offset', query.options.offset.toString());
                        }
                        if ((_f = query.options) === null || _f === void 0 ? void 0 : _f.sortBy) {
                            searchParams.set('sortBy', query.options.sortBy);
                        }
                        if ((_g = query.options) === null || _g === void 0 ? void 0 : _g.sortOrder) {
                            searchParams.set('sortOrder', query.options.sortOrder);
                        }
                        if ((_h = query.options) === null || _h === void 0 ? void 0 : _h.fuzzy) {
                            searchParams.set('fuzzy', 'true');
                        }
                        if ((_j = query.options) === null || _j === void 0 ? void 0 : _j.highlight) {
                            searchParams.set('highlight', 'true');
                        }
                        return [4 /*yield*/, fetch("/api/search?".concat(searchParams.toString()))];
                    case 1:
                        response = _k.sent();
                        if (!response.ok) {
                            throw new Error('Erro na busca');
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _k.sent();
                        if (!result.success) {
                            throw new Error(result.error || 'Erro na busca');
                        }
                        return [2 /*return*/, result.data];
                    case 3:
                        error_1 = _k.sent();
                        console.error('Erro no cliente de busca:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Busca avançada através da API
     */
    SearchClient.prototype.advancedSearch = function (criteria) {
        return __awaiter(this, void 0, void 0, function () {
            var response, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch('/api/search', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    action: 'advanced_search',
                                    criteria: criteria
                                })
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error('Erro na busca avançada');
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        if (!result.success) {
                            throw new Error(result.error || 'Erro na busca avançada');
                        }
                        return [2 /*return*/, result.data];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Erro na busca avançada:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Salva uma busca através da API
     */
    SearchClient.prototype.saveSearch = function (name, query, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch('/api/search', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    action: 'save_search',
                                    name: name,
                                    query: query,
                                    userId: userId
                                })
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error('Erro ao salvar busca');
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        if (!result.success) {
                            throw new Error(result.error || 'Erro ao salvar busca');
                        }
                        return [2 /*return*/, result.data.id];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Erro ao salvar busca:', error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Obtém estatísticas através da API
     */
    SearchClient.prototype.getStatistics = function () {
        return __awaiter(this, arguments, void 0, function (timeframe) {
            var response, result, error_4;
            if (timeframe === void 0) { timeframe = '30days'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch('/api/search', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    action: 'get_statistics',
                                    timeframe: timeframe
                                })
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error('Erro ao obter estatísticas');
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        if (!result.success) {
                            throw new Error(result.error || 'Erro ao obter estatísticas');
                        }
                        return [2 /*return*/, result.data];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Erro ao obter estatísticas:', error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return SearchClient;
}());
exports.SearchClient = SearchClient;
exports.searchClient = new SearchClient();
