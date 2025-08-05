"use strict";
// CNPJ Validation API Tests - Story 5.5 AC2
// Testing real-time CNPJ validation and customer verification
// Author: VoidBeast V6.0 Master Orchestrator
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
var globals_1 = require("@jest/globals");
var server_1 = require("next/server");
// Mock Supabase client for CNPJ operations
var mockSupabase = {
    from: globals_1.jest.fn(function () { return ({
        select: globals_1.jest.fn(function () { return ({
            eq: globals_1.jest.fn(function () { return ({
                order: globals_1.jest.fn(function () { return ({
                    limit: globals_1.jest.fn(function () { return Promise.resolve({
                        data: [{
                                id: 'test-validation-id',
                                cnpj: '12345678000190',
                                formatted_cnpj: '12.345.678/0001-90',
                                valid: true,
                                company_data: {
                                    cnpj: '12345678000190',
                                    razao_social: 'CLINICA TESTE LTDA',
                                    nome_fantasia: 'Clínica Teste',
                                    situacao: 'ATIVA'
                                },
                                validated_at: new Date().toISOString()
                            }],
                        error: null
                    }); })
                }); }),
                single: globals_1.jest.fn(function () { return Promise.resolve({
                    data: {
                        id: 'test-validation-id',
                        cnpj: '12345678000190',
                        formatted_cnpj: '12.345.678/0001-90',
                        valid: true,
                        company_data: {
                            cnpj: '12345678000190',
                            razao_social: 'CLINICA TESTE LTDA',
                            nome_fantasia: 'Clínica Teste',
                            situacao: 'ATIVA'
                        },
                        validated_at: new Date().toISOString()
                    },
                    error: null
                }); })
            }); })
        }); }),
        insert: globals_1.jest.fn(function () { return ({
            select: globals_1.jest.fn(function () { return ({
                single: globals_1.jest.fn(function () { return Promise.resolve({
                    data: { id: 'test-insert-id' },
                    error: null
                }); })
            }); })
        }); }),
        upsert: globals_1.jest.fn(function () { return ({
            select: globals_1.jest.fn(function () { return ({
                single: globals_1.jest.fn(function () { return Promise.resolve({
                    data: { id: 'test-upsert-id' },
                    error: null
                }); })
            }); })
        }); })
    }); })
};
// Mock CNPJ Validator Service
globals_1.jest.mock('@/lib/services/brazilian-tax/cnpj-validator', function () { return ({
    CNPJValidator: globals_1.jest.fn().mockImplementation(function () { return ({
        validateCNPJ: globals_1.jest.fn().mockResolvedValue({
            valid: true,
            formatted: '12.345.678/0001-90',
            cnpj_clean: '12345678000190',
            check_digit_valid: true,
            format_valid: true,
            companyData: {
                cnpj: '12345678000190',
                razao_social: 'CLINICA TESTE LTDA',
                nome_fantasia: 'Clínica Teste',
                situacao: 'ATIVA',
                data_situacao: '2020-01-01',
                tipo: 'MATRIZ',
                porte: 'MICRO EMPRESA',
                natureza_juridica: '206-2 - SOCIEDADE EMPRESARIA LIMITADA',
                atividade_principal: {
                    code: '8630-5/01',
                    text: 'Atividade médica ambulatorial com recursos para procedimentos cirúrgicos'
                },
                atividades_secundarias: [],
                capital_social: 50000.00,
                endereco: {
                    logradouro: 'RUA TESTE',
                    numero: '123',
                    complemento: 'SALA 101',
                    bairro: 'CENTRO',
                    municipio: 'SAO PAULO',
                    uf: 'SP',
                    cep: '01000-000'
                },
                telefones: ['(11) 9999-9999'],
                email: 'contato@clinicateste.com.br',
                data_abertura: '2020-01-01',
                ultima_atualizacao: new Date().toISOString()
            },
            validation_source: 'receita_federal',
            cached: false,
            response_time_ms: 450
        }),
        validateCNPJBatch: globals_1.jest.fn().mockResolvedValue({
            batch_id: 'batch-12345',
            total_processed: 3,
            total_valid: 2,
            total_invalid: 1,
            processing_time_ms: 1200,
            results: [
                {
                    cnpj_input: '12345678000190',
                    valid: true,
                    formatted: '12.345.678/0001-90',
                    company_data: {
                        razao_social: 'EMPRESA TESTE 1 LTDA',
                        situacao: 'ATIVA'
                    }
                },
                {
                    cnpj_input: '98765432000111',
                    valid: true,
                    formatted: '98.765.432/0001-11',
                    company_data: {
                        razao_social: 'EMPRESA TESTE 2 LTDA',
                        situacao: 'ATIVA'
                    }
                },
                {
                    cnpj_input: '11111111111111',
                    valid: false,
                    errors: ['Invalid CNPJ format', 'Check digit validation failed']
                }
            ]
        }),
        formatCNPJ: globals_1.jest.fn().mockImplementation(function (cnpj) {
            if (cnpj === '12345678000190')
                return '12.345.678/0001-90';
            return cnpj;
        }),
        cleanCNPJ: globals_1.jest.fn().mockImplementation(function (cnpj) {
            return cnpj.replace(/[^\d]/g, '');
        })
    }); })
}); });
globals_1.jest.mock('@/app/utils/supabase/server', function () { return ({
    createClient: function () { return mockSupabase; }
}); });
// Import CNPJ API handlers
var route_1 = require("@/app/api/tax/cnpj/route");
(0, globals_1.describe)('CNPJ Validation API - Story 5.5 AC2: Real-time CNPJ Validation and Customer Verification', function () {
    var validCNPJ = '12345678000190';
    var invalidCNPJ = '11111111111111';
    var formattedCNPJ = '12.345.678/0001-90';
    (0, globals_1.beforeAll)(function () {
        process.env.NODE_ENV = 'test';
    });
    (0, globals_1.afterAll)(function () {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.describe)('GET /api/tax/cnpj - CNPJ Validation and Lookup', function () {
        (0, globals_1.it)('should validate CNPJ format and check digit', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest("http://localhost/api/tax/cnpj?action=validate&cnpj=".concat(validCNPJ));
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(result.data.valid).toBe(true);
                        (0, globals_1.expect)(result.data.cnpj).toBe(formattedCNPJ);
                        (0, globals_1.expect)(result.data.check_digit_valid).toBe(true);
                        (0, globals_1.expect)(result.data.format_valid).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should retrieve company data from Receita Federal', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest("http://localhost/api/tax/cnpj?action=validate&cnpj=".concat(validCNPJ, "&get_company_data=true"));
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(result.data.valid).toBe(true);
                        (0, globals_1.expect)(result.data.company_data).toHaveProperty('razao_social');
                        (0, globals_1.expect)(result.data.company_data).toHaveProperty('situacao');
                        (0, globals_1.expect)(result.data.company_data).toHaveProperty('atividade_principal');
                        (0, globals_1.expect)(result.data.company_data.razao_social).toBe('CLINICA TESTE LTDA');
                        (0, globals_1.expect)(result.data.company_data.situacao).toBe('ATIVA');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should validate company status (active/inactive)', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest("http://localhost/api/tax/cnpj?action=validate&cnpj=".concat(validCNPJ, "&validate_status=true"));
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(result.data.valid).toBe(true);
                        (0, globals_1.expect)(result.data.company_data.situacao).toBe('ATIVA');
                        (0, globals_1.expect)(result.data.status_valid).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should check cached validation results', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest("http://localhost/api/tax/cnpj?action=validate&cnpj=".concat(validCNPJ, "&use_cache=true"));
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(result.data.valid).toBe(true);
                        (0, globals_1.expect)(result.data).toHaveProperty('cached');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should retrieve validation history for a CNPJ', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest("http://localhost/api/tax/cnpj?action=history&cnpj=".concat(validCNPJ));
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(result.data).toBeInstanceOf(Array);
                        (0, globals_1.expect)(result.data).toHaveLength(1);
                        (0, globals_1.expect)(result.data[0]).toHaveProperty('validated_at');
                        (0, globals_1.expect)(result.data[0].cnpj).toBe(validCNPJ);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should search companies by partial name', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest('http://localhost/api/tax/cnpj?action=search&query=CLINICA%20TESTE');
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(result.data).toBeInstanceOf(Array);
                        (0, globals_1.expect)(result.data[0]).toHaveProperty('razao_social');
                        (0, globals_1.expect)(result.data[0].razao_social).toContain('CLINICA TESTE');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should filter by business activity code', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest('http://localhost/api/tax/cnpj?action=search&activity_code=8630-5');
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(result.data).toBeInstanceOf(Array);
                        (0, globals_1.expect)(result.filters).toEqual({ activity_code: '8630-5' });
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should handle invalid CNPJ gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock invalid CNPJ response
                        globals_1.jest.mocked(require('@/lib/services/brazilian-tax/cnpj-validator').CNPJValidator)
                            .mockImplementationOnce(function () { return ({
                            validateCNPJ: globals_1.jest.fn().mockResolvedValue({
                                valid: false,
                                formatted: null,
                                errors: ['Invalid CNPJ format', 'Check digit validation failed'],
                                validation_source: 'local',
                                response_time_ms: 50
                            })
                        }); });
                        request = new server_1.NextRequest("http://localhost/api/tax/cnpj?action=validate&cnpj=".concat(invalidCNPJ));
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(result.data.valid).toBe(false);
                        (0, globals_1.expect)(result.data.validation_errors).toContain('Invalid CNPJ format');
                        (0, globals_1.expect)(result.data.validation_errors).toContain('Check digit validation failed');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('POST /api/tax/cnpj - Advanced CNPJ Operations', function () {
        (0, globals_1.it)('should validate CNPJ with full company data retrieval', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest('http://localhost/api/tax/cnpj', {
                            method: 'POST',
                            body: JSON.stringify({
                                action: 'validate',
                                cnpj: validCNPJ,
                                validate_status: true,
                                get_company_data: true,
                                store_result: true,
                                validate_activity: true
                            })
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(result.data.valid).toBe(true);
                        (0, globals_1.expect)(result.data.company_data).toHaveProperty('razao_social');
                        (0, globals_1.expect)(result.data.company_data).toHaveProperty('atividade_principal');
                        (0, globals_1.expect)(result.data.company_data).toHaveProperty('endereco');
                        (0, globals_1.expect)(result.data.validation_id).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should perform batch CNPJ validation', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest('http://localhost/api/tax/cnpj', {
                            method: 'POST',
                            body: JSON.stringify({
                                action: 'batch-validate',
                                cnpjs: [validCNPJ, '98765432000111', invalidCNPJ],
                                validate_status: true,
                                get_company_data: false,
                                store_results: true
                            })
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(result.data.batch_id).toBeDefined();
                        (0, globals_1.expect)(result.data.total_processed).toBe(3);
                        (0, globals_1.expect)(result.data.total_valid).toBe(2);
                        (0, globals_1.expect)(result.data.total_invalid).toBe(1);
                        (0, globals_1.expect)(result.data.results).toHaveLength(3);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should update company information cache', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest('http://localhost/api/tax/cnpj', {
                            method: 'POST',
                            body: JSON.stringify({
                                action: 'update-cache',
                                cnpj: validCNPJ,
                                force_update: true,
                                validate_current_status: true
                            })
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(result.data.updated).toBe(true);
                        (0, globals_1.expect)(result.data.cache_id).toBeDefined();
                        (0, globals_1.expect)(result.data.company_data).toHaveProperty('ultima_atualizacao');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should validate CNPJ against blacklist', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest('http://localhost/api/tax/cnpj', {
                            method: 'POST',
                            body: JSON.stringify({
                                action: 'validate',
                                cnpj: validCNPJ,
                                check_blacklist: true,
                                blacklist_sources: ['receita_federal', 'spc', 'serasa']
                            })
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(result.data.valid).toBe(true);
                        (0, globals_1.expect)(result.data.blacklist_check).toHaveProperty('clear');
                        (0, globals_1.expect)(result.data.blacklist_check.clear).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should validate business relationship eligibility', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest('http://localhost/api/tax/cnpj', {
                            method: 'POST',
                            body: JSON.stringify({
                                action: 'validate-relationship',
                                cnpj: validCNPJ,
                                relationship_type: 'healthcare_client',
                                validate_activity_compatibility: true,
                                check_regulatory_compliance: true
                            })
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(result.data.relationship_eligible).toBe(true);
                        (0, globals_1.expect)(result.data.activity_compatible).toBe(true);
                        (0, globals_1.expect)(result.data.compliance_check).toHaveProperty('approved');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should format and clean CNPJ input', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest('http://localhost/api/tax/cnpj', {
                            method: 'POST',
                            body: JSON.stringify({
                                action: 'format',
                                cnpj: '12.345.678/0001-90',
                                output_format: 'clean'
                            })
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(result.data.original).toBe('12.345.678/0001-90');
                        (0, globals_1.expect)(result.data.formatted).toBe(validCNPJ);
                        (0, globals_1.expect)(result.data.clean).toBe(validCNPJ);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should generate validation report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest('http://localhost/api/tax/cnpj', {
                            method: 'POST',
                            body: JSON.stringify({
                                action: 'generate-report',
                                cnpj: validCNPJ,
                                report_type: 'comprehensive',
                                include_history: true,
                                include_related_companies: false
                            })
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(result.data.report_id).toBeDefined();
                        (0, globals_1.expect)(result.data.report_type).toBe('comprehensive');
                        (0, globals_1.expect)(result.data.generation_date).toBeDefined();
                        (0, globals_1.expect)(result.data.sections).toContain('company_data');
                        (0, globals_1.expect)(result.data.sections).toContain('validation_history');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('Error Handling and Edge Cases', function () {
        (0, globals_1.it)('should handle missing CNPJ parameter', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest('http://localhost/api/tax/cnpj?action=validate');
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(400);
                        (0, globals_1.expect)(result.error).toBe('CNPJ parameter is required');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should handle invalid action parameter', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest("http://localhost/api/tax/cnpj?action=invalid&cnpj=".concat(validCNPJ));
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(400);
                        (0, globals_1.expect)(result.error).toBe('Invalid action parameter');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should handle Receita Federal API unavailability', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock API unavailability
                        globals_1.jest.mocked(require('@/lib/services/brazilian-tax/cnpj-validator').CNPJValidator)
                            .mockImplementationOnce(function () { return ({
                            validateCNPJ: globals_1.jest.fn().mockRejectedValue(new Error('Receita Federal API unavailable'))
                        }); });
                        request = new server_1.NextRequest("http://localhost/api/tax/cnpj?action=validate&cnpj=".concat(validCNPJ, "&get_company_data=true"));
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(503);
                        (0, globals_1.expect)(result.error).toBe('External validation service unavailable');
                        (0, globals_1.expect)(result.details).toContain('Receita Federal API unavailable');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should handle database errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock database error
                        mockSupabase.from.mockReturnValueOnce({
                            insert: globals_1.jest.fn(function () { return ({
                                select: globals_1.jest.fn(function () { return ({
                                    single: globals_1.jest.fn(function () { return Promise.resolve({
                                        data: null,
                                        error: { message: 'Database connection failed' }
                                    }); })
                                }); })
                            }); })
                        });
                        request = new server_1.NextRequest('http://localhost/api/tax/cnpj', {
                            method: 'POST',
                            body: JSON.stringify({
                                action: 'validate',
                                cnpj: validCNPJ,
                                store_result: true
                            })
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(500);
                        (0, globals_1.expect)(result.error).toBe('Failed to store validation result');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should handle malformed CNPJ input', function () { return __awaiter(void 0, void 0, void 0, function () {
            var malformedCNPJ, request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        malformedCNPJ = 'abc123def456';
                        request = new server_1.NextRequest("http://localhost/api/tax/cnpj?action=validate&cnpj=".concat(malformedCNPJ));
                        // Mock malformed input response
                        globals_1.jest.mocked(require('@/lib/services/brazilian-tax/cnpj-validator').CNPJValidator)
                            .mockImplementationOnce(function () { return ({
                            validateCNPJ: globals_1.jest.fn().mockResolvedValue({
                                valid: false,
                                errors: ['CNPJ must contain only numbers'],
                                validation_source: 'local',
                                response_time_ms: 10
                            })
                        }); });
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(result.data.valid).toBe(false);
                        (0, globals_1.expect)(result.data.validation_errors).toContain('CNPJ must contain only numbers');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should handle empty batch validation request', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest('http://localhost/api/tax/cnpj', {
                            method: 'POST',
                            body: JSON.stringify({
                                action: 'batch-validate',
                                cnpjs: []
                            })
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(400);
                        (0, globals_1.expect)(result.error).toBe('CNPJs array cannot be empty');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should handle batch validation with too many CNPJs', function () { return __awaiter(void 0, void 0, void 0, function () {
            var largeBatch, request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        largeBatch = Array.from({ length: 101 }, function (_, i) { return "1234567800019".concat(i.toString().padStart(1, '0')); });
                        request = new server_1.NextRequest('http://localhost/api/tax/cnpj', {
                            method: 'POST',
                            body: JSON.stringify({
                                action: 'batch-validate',
                                cnpjs: largeBatch
                            })
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(400);
                        (0, globals_1.expect)(result.error).toBe('Batch size exceeds maximum limit of 100 CNPJs');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('Performance Requirements - AC2', function () {
        (0, globals_1.it)('should complete CNPJ validation within 1 second', function () { return __awaiter(void 0, void 0, void 0, function () {
            var startTime, request, response, endTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        request = new server_1.NextRequest("http://localhost/api/tax/cnpj?action=validate&cnpj=".concat(validCNPJ));
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        endTime = Date.now();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(endTime - startTime).toBeLessThan(1000); // 1 second
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should complete company data retrieval within 2 seconds', function () { return __awaiter(void 0, void 0, void 0, function () {
            var startTime, request, response, endTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        request = new server_1.NextRequest("http://localhost/api/tax/cnpj?action=validate&cnpj=".concat(validCNPJ, "&get_company_data=true"));
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        endTime = Date.now();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(endTime - startTime).toBeLessThan(2000); // 2 seconds
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should handle high-frequency validation requests efficiently', function () { return __awaiter(void 0, void 0, void 0, function () {
            var concurrentRequests, startTime, responses, endTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        concurrentRequests = Array.from({ length: 10 }, function () {
                            return (0, route_1.GET)(new server_1.NextRequest("http://localhost/api/tax/cnpj?action=validate&cnpj=".concat(validCNPJ)));
                        });
                        startTime = Date.now();
                        return [4 /*yield*/, Promise.all(concurrentRequests)];
                    case 1:
                        responses = _a.sent();
                        endTime = Date.now();
                        // All requests should succeed
                        responses.forEach(function (response) {
                            (0, globals_1.expect)(response.status).toBe(200);
                        });
                        // Total time should be reasonable for concurrent processing
                        (0, globals_1.expect)(endTime - startTime).toBeLessThan(3000); // 3 seconds for 10 concurrent requests
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should maintain accuracy under load testing', function () { return __awaiter(void 0, void 0, void 0, function () {
            var testCNPJs, validationPromises, responses, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        testCNPJs = [validCNPJ, '98765432000111', '11223344000155'];
                        validationPromises = testCNPJs.map(function (cnpj) {
                            return (0, route_1.GET)(new server_1.NextRequest("http://localhost/api/tax/cnpj?action=validate&cnpj=".concat(cnpj)));
                        });
                        return [4 /*yield*/, Promise.all(validationPromises)];
                    case 1:
                        responses = _a.sent();
                        return [4 /*yield*/, Promise.all(responses.map(function (r) { return r.json(); }))];
                    case 2:
                        results = _a.sent();
                        // All requests should return valid results
                        results.forEach(function (result, index) {
                            (0, globals_1.expect)(result.data).toHaveProperty('valid');
                            (0, globals_1.expect)(result.data.cnpj || result.data.validation_errors).toBeDefined();
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should cache validation results efficiently', function () { return __awaiter(void 0, void 0, void 0, function () {
            var firstRequest, firstStartTime, firstResponse, firstEndTime, secondRequest, secondStartTime, secondResponse, secondEndTime, firstDuration, secondDuration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        firstRequest = new server_1.NextRequest("http://localhost/api/tax/cnpj?action=validate&cnpj=".concat(validCNPJ, "&get_company_data=true"));
                        firstStartTime = Date.now();
                        return [4 /*yield*/, (0, route_1.GET)(firstRequest)];
                    case 1:
                        firstResponse = _a.sent();
                        firstEndTime = Date.now();
                        secondRequest = new server_1.NextRequest("http://localhost/api/tax/cnpj?action=validate&cnpj=".concat(validCNPJ, "&use_cache=true"));
                        secondStartTime = Date.now();
                        return [4 /*yield*/, (0, route_1.GET)(secondRequest)];
                    case 2:
                        secondResponse = _a.sent();
                        secondEndTime = Date.now();
                        (0, globals_1.expect)(firstResponse.status).toBe(200);
                        (0, globals_1.expect)(secondResponse.status).toBe(200);
                        firstDuration = firstEndTime - firstStartTime;
                        secondDuration = secondEndTime - secondStartTime;
                        (0, globals_1.expect)(secondDuration).toBeLessThan(firstDuration * 0.5); // At least 50% faster
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('Integration with Brazilian Tax Ecosystem', function () {
        (0, globals_1.it)('should validate healthcare business eligibility', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest('http://localhost/api/tax/cnpj', {
                            method: 'POST',
                            body: JSON.stringify({
                                action: 'validate-healthcare-eligibility',
                                cnpj: validCNPJ,
                                check_cnes_registration: true,
                                check_cfm_compliance: true,
                                check_anvisa_license: true
                            })
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(result.data.healthcare_eligible).toBeDefined();
                        (0, globals_1.expect)(result.data.regulatory_checks).toHaveProperty('cnes');
                        (0, globals_1.expect)(result.data.regulatory_checks).toHaveProperty('cfm');
                        (0, globals_1.expect)(result.data.regulatory_checks).toHaveProperty('anvisa');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should validate aesthetic clinic certification', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest('http://localhost/api/tax/cnpj', {
                            method: 'POST',
                            body: JSON.stringify({
                                action: 'validate-aesthetic-clinic',
                                cnpj: validCNPJ,
                                check_medical_licenses: true,
                                check_aesthetic_procedures_permit: true,
                                validate_professional_team: true
                            })
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(result.data.aesthetic_clinic_certified).toBeDefined();
                        (0, globals_1.expect)(result.data.certifications).toHaveProperty('medical_licenses');
                        (0, globals_1.expect)(result.data.certifications).toHaveProperty('aesthetic_procedures');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
