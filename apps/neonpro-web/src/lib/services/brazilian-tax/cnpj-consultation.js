"use strict";
/**
 * CNPJ Consultation Service
 * Integration with Brasil API for company data consultation
 * Compliant with rate limits and caching strategies
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
exports.CNPJConsultationService = exports.CNPJConsultationError = void 0;
var cnpj_validator_1 = require("./cnpj-validator");
/**
 * Error types for API consultation
 */
var CNPJConsultationError;
(function (CNPJConsultationError) {
    CNPJConsultationError["INVALID_FORMAT"] = "INVALID_FORMAT";
    CNPJConsultationError["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    CNPJConsultationError["API_ERROR"] = "API_ERROR";
    CNPJConsultationError["NETWORK_ERROR"] = "NETWORK_ERROR";
    CNPJConsultationError["NOT_FOUND"] = "NOT_FOUND";
    CNPJConsultationError["FORBIDDEN"] = "FORBIDDEN";
})(CNPJConsultationError || (exports.CNPJConsultationError = CNPJConsultationError = {}));
var DEFAULT_CONFIG = {
    useCache: true,
    forceRefresh: false,
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
};
/**
 * Main CNPJ consultation service
 */
var CNPJConsultationService = /** @class */ (function () {
    function CNPJConsultationService() {
    }
    /**
     * Consult CNPJ data from Brasil API
     */
    CNPJConsultationService.consultCNPJ = function (cnpj_1) {
        return __awaiter(this, arguments, void 0, function (cnpj, clientIP, config) {
            var finalConfig, validation, cleanedCNPJ, cached, data, transformed, error_1;
            var _a;
            if (clientIP === void 0) { clientIP = 'unknown'; }
            if (config === void 0) { config = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        finalConfig = __assign(__assign({}, DEFAULT_CONFIG), config);
                        validation = (0, cnpj_validator_1.validateCNPJFormat)(cnpj);
                        if (!validation.valid) {
                            return [2 /*return*/, {
                                    success: false,
                                    cached: false,
                                    errors: validation.errors || ['CNPJ inválido']
                                }];
                        }
                        cleanedCNPJ = (0, cnpj_validator_1.cleanCNPJ)(cnpj);
                        // Check cache first (unless force refresh)
                        if (finalConfig.useCache && !finalConfig.forceRefresh) {
                            cached = cnpj_validator_1.CNPJCache.get(cleanedCNPJ);
                            if (cached) {
                                return [2 /*return*/, {
                                        success: true,
                                        data: cached,
                                        cached: true,
                                        cache_expiry: (_a = cnpj_validator_1.CNPJCache.getCacheExpiry(cleanedCNPJ)) === null || _a === void 0 ? void 0 : _a.toISOString()
                                    }];
                            }
                        }
                        // Check rate limiting
                        if (!cnpj_validator_1.CNPJRateLimiter.canMakeRequest(clientIP)) {
                            return [2 /*return*/, {
                                    success: false,
                                    cached: false,
                                    errors: [CNPJConsultationError.RATE_LIMIT_EXCEEDED],
                                    rate_limit: {
                                        remaining: cnpj_validator_1.CNPJRateLimiter.getRemainingRequests(clientIP),
                                        reset_time: cnpj_validator_1.CNPJRateLimiter.getResetTime(clientIP).toISOString()
                                    }
                                }];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.fetchWithRetry("".concat(this.BASE_URL, "/").concat(cleanedCNPJ), finalConfig)];
                    case 2:
                        data = _b.sent();
                        transformed = this.transformBrasilAPIResponse(data);
                        // Cache successful result
                        if (finalConfig.useCache) {
                            cnpj_validator_1.CNPJCache.set(cleanedCNPJ, transformed);
                        }
                        return [2 /*return*/, {
                                success: true,
                                data: transformed,
                                cached: false,
                                rate_limit: {
                                    remaining: cnpj_validator_1.CNPJRateLimiter.getRemainingRequests(clientIP),
                                    reset_time: cnpj_validator_1.CNPJRateLimiter.getResetTime(clientIP).toISOString()
                                }
                            }];
                    case 3:
                        error_1 = _b.sent();
                        return [2 /*return*/, this.handleConsultationError(error_1, clientIP)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetch with retry logic and timeout
     */
    CNPJConsultationService.fetchWithRetry = function (url_1, config_1) {
        return __awaiter(this, arguments, void 0, function (url, config, attempt) {
            var controller, timeoutId, response, data, error_2;
            if (attempt === void 0) { attempt = 1; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        controller = new AbortController();
                        timeoutId = setTimeout(function () { return controller.abort(); }, config.timeout);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 7]);
                        return [4 /*yield*/, fetch(url, {
                                method: 'GET',
                                headers: {
                                    'User-Agent': 'NeonPro/1.0 (Clinic Management System)',
                                    'Accept': 'application/json',
                                },
                                signal: controller.signal
                            })];
                    case 2:
                        response = _a.sent();
                        clearTimeout(timeoutId);
                        if (!response.ok) {
                            if (response.status === 404) {
                                throw new Error(CNPJConsultationError.NOT_FOUND);
                            }
                            if (response.status === 403 || response.status === 429) {
                                throw new Error(CNPJConsultationError.RATE_LIMIT_EXCEEDED);
                            }
                            throw new Error(CNPJConsultationError.API_ERROR);
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        return [2 /*return*/, data];
                    case 4:
                        error_2 = _a.sent();
                        clearTimeout(timeoutId);
                        if (!(attempt < config.retryAttempts &&
                            error_2 instanceof Error &&
                            error_2.name !== CNPJConsultationError.NOT_FOUND)) return [3 /*break*/, 6];
                        return [4 /*yield*/, new Promise(function (resolve) {
                                return setTimeout(resolve, config.retryDelay * attempt);
                            })];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, this.fetchWithRetry(url, config, attempt + 1)];
                    case 6: throw error_2;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Transform Brasil API response to our interface
     */
    CNPJConsultationService.transformBrasilAPIResponse = function (response) {
        var _a;
        return {
            cnpj: response.cnpj,
            razao_social: response.razao_social,
            nome_fantasia: response.nome_fantasia || undefined,
            porte: response.porte,
            atividade_principal: {
                code: response.cnae_fiscal,
                text: response.cnae_fiscal_descricao
            },
            atividades_secundarias: response.cnaes_secundarios.map(function (cnae) { return ({
                code: cnae.codigo,
                text: cnae.descricao
            }); }),
            endereco: {
                logradouro: "".concat(response.descricao_tipo_logradouro, " ").concat(response.logradouro),
                numero: response.numero,
                complemento: response.complemento || undefined,
                bairro: response.bairro,
                municipio: response.municipio,
                uf: response.uf,
                cep: response.cep
            },
            telefone: response.ddd_telefone_1 ?
                "(".concat(response.ddd_telefone_1.slice(0, 2), ") ").concat(response.ddd_telefone_1.slice(2)) :
                undefined,
            situacao: response.descricao_situacao_cadastral,
            data_situacao: response.data_situacao_cadastral,
            motivo_situacao: response.motivo_situacao_cadastral || undefined,
            natureza_juridica: response.codigo_natureza_juridica,
            capital_social: parseFloat(response.capital_social.replace(',', '.')),
            data_inicio_atividade: response.data_inicio_atividade,
            qsa: (_a = response.qsa) === null || _a === void 0 ? void 0 : _a.map(function (socio) { return ({
                nome: socio.nome_socio,
                qual: socio.codigo_qualificacao_socio,
                nome_rep_legal: socio.nome_representante_legal,
                qual_rep_legal: socio.codigo_qualificacao_representante_legal
            }); })
        };
    };
    /**
     * Handle consultation errors
     */
    CNPJConsultationService.handleConsultationError = function (error, clientIP) {
        var errorType = CNPJConsultationError.API_ERROR;
        var errorMessage = 'Erro desconhecido na consulta';
        if (error instanceof Error) {
            switch (error.message) {
                case CNPJConsultationError.NOT_FOUND:
                    errorType = CNPJConsultationError.NOT_FOUND;
                    errorMessage = 'CNPJ não encontrado na Receita Federal';
                    break;
                case CNPJConsultationError.RATE_LIMIT_EXCEEDED:
                    errorType = CNPJConsultationError.RATE_LIMIT_EXCEEDED;
                    errorMessage = 'Limite de consultas excedido. Tente novamente em alguns minutos.';
                    break;
                case 'AbortError':
                    errorType = CNPJConsultationError.NETWORK_ERROR;
                    errorMessage = 'Timeout na consulta. Tente novamente.';
                    break;
                default:
                    if (error.name === 'TypeError' && error.message.includes('fetch')) {
                        errorType = CNPJConsultationError.NETWORK_ERROR;
                        errorMessage = 'Erro de conexão. Verifique sua internet.';
                    }
            }
        }
        return {
            success: false,
            cached: false,
            errors: [errorMessage],
            rate_limit: {
                remaining: cnpj_validator_1.CNPJRateLimiter.getRemainingRequests(clientIP),
                reset_time: cnpj_validator_1.CNPJRateLimiter.getResetTime(clientIP).toISOString()
            }
        };
    };
    /**
     * Batch consultation for multiple CNPJs
     */
    CNPJConsultationService.batchConsultCNPJ = function (cnpjs_1) {
        return __awaiter(this, arguments, void 0, function (cnpjs, clientIP, config) {
            var results, batchSize, delay, i, batch, batchPromises;
            var _this = this;
            if (clientIP === void 0) { clientIP = 'unknown'; }
            if (config === void 0) { config = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = new Map();
                        batchSize = 2;
                        delay = 1000;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < cnpjs.length)) return [3 /*break*/, 5];
                        batch = cnpjs.slice(i, i + batchSize);
                        batchPromises = batch.map(function (cnpj) { return __awaiter(_this, void 0, void 0, function () {
                            var result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.consultCNPJ(cnpj, clientIP, config)];
                                    case 1:
                                        result = _a.sent();
                                        results.set(cnpj, result);
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(batchPromises)];
                    case 2:
                        _a.sent();
                        if (!(i + batchSize < cnpjs.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay); })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i += batchSize;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Clear all caches (for admin purposes)
     */
    CNPJConsultationService.clearCache = function () {
        cnpj_validator_1.CNPJCache.clear();
    };
    /**
     * Get cache statistics
     */
    CNPJConsultationService.getCacheStats = function () {
        var _a;
        // Note: This is a simplified implementation
        // In production, you might want more detailed statistics
        var entriesCount = ((_a = cnpj_validator_1.CNPJCache.cache) === null || _a === void 0 ? void 0 : _a.size) || 0;
        return {
            cached_entries: entriesCount,
            cache_size_estimate: "~".concat(entriesCount * 2, "KB")
        };
    };
    CNPJConsultationService.BASE_URL = 'https://brasilapi.com.br/api/cnpj/v1';
    return CNPJConsultationService;
}());
exports.CNPJConsultationService = CNPJConsultationService;
exports.default = CNPJConsultationService;
