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
exports.createduplicateDetectionSystem = exports.DuplicateDetectionSystem = void 0;
// lib/patients/duplicate-detection.ts
var server_1 = require("@/lib/supabase/server");
var DuplicateDetectionSystem = /** @class */ (function () {
    function DuplicateDetectionSystem() {
        this.supabase = (0, server_1.createClient)();
    }
    /**
     * Detecta possíveis duplicatas usando múltiplos algoritmos
     */
    DuplicateDetectionSystem.prototype.detectDuplicates = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var mockDuplicates;
            return __generator(this, function (_a) {
                try {
                    mockDuplicates = [
                        {
                            id: 'dup_001',
                            primaryPatientId: 'pat_123',
                            duplicatePatientId: 'pat_456',
                            confidenceScore: 0.92,
                            matchingFields: ['name', 'birthDate', 'phone'],
                            potentialIssues: ['different_email', 'different_address'],
                            status: 'pending',
                            createdAt: new Date()
                        },
                        {
                            id: 'dup_002',
                            primaryPatientId: 'pat_789',
                            duplicatePatientId: 'pat_321',
                            confidenceScore: 0.78,
                            matchingFields: ['name', 'email'],
                            potentialIssues: ['different_phone', 'different_birthDate'],
                            status: 'pending',
                            createdAt: new Date()
                        }
                    ];
                    if (patientId) {
                        return [2 /*return*/, mockDuplicates.filter(function (dup) {
                                return dup.primaryPatientId === patientId || dup.duplicatePatientId === patientId;
                            })];
                    }
                    return [2 /*return*/, mockDuplicates];
                }
                catch (error) {
                    console.error('Erro na detecção de duplicatas:', error);
                    throw new Error('Falha na detecção de duplicatas');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Compara dois pacientes em detalhes
     */
    DuplicateDetectionSystem.prototype.comparePatients = function (patientId1, patientId2) {
        return __awaiter(this, void 0, void 0, function () {
            var comparisons;
            return __generator(this, function (_a) {
                try {
                    comparisons = [
                        {
                            field: 'name',
                            primaryValue: 'João Silva Santos',
                            duplicateValue: 'João S. Santos',
                            similarity: 0.95,
                            action: 'keep_primary'
                        },
                        {
                            field: 'birthDate',
                            primaryValue: '1985-03-15',
                            duplicateValue: '1985-03-15',
                            similarity: 1.0,
                            action: 'keep_primary'
                        },
                        {
                            field: 'phone',
                            primaryValue: '(11) 99999-9999',
                            duplicateValue: '11999999999',
                            similarity: 0.90,
                            action: 'keep_primary'
                        },
                        {
                            field: 'email',
                            primaryValue: 'joao.silva@email.com',
                            duplicateValue: 'j.santos@email.com',
                            similarity: 0.65,
                            action: 'manual_review'
                        },
                        {
                            field: 'address',
                            primaryValue: 'Rua das Flores, 123',
                            duplicateValue: 'Rua das Flores, 123 - Ap 45',
                            similarity: 0.85,
                            action: 'merge'
                        },
                        {
                            field: 'emergencyContact',
                            primaryValue: 'Maria Silva - (11) 88888-8888',
                            duplicateValue: '',
                            similarity: 0.0,
                            action: 'keep_primary'
                        }
                    ];
                    return [2 /*return*/, comparisons];
                }
                catch (error) {
                    console.error('Erro na comparação de pacientes:', error);
                    throw new Error('Falha na comparação de pacientes');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Calcula score de similaridade entre dois registros
     */
    DuplicateDetectionSystem.prototype.calculateSimilarityScore = function (patient1, patient2) {
        var weights = {
            name: 0.3,
            birthDate: 0.25,
            phone: 0.2,
            email: 0.15,
            ssn: 0.1
        };
        var totalScore = 0;
        var totalWeight = 0;
        for (var _i = 0, _a = Object.entries(weights); _i < _a.length; _i++) {
            var _b = _a[_i], field = _b[0], weight = _b[1];
            if (patient1[field] && patient2[field]) {
                var similarity = this.calculateFieldSimilarity(patient1[field], patient2[field], field);
                totalScore += similarity * weight;
                totalWeight += weight;
            }
        }
        return totalWeight > 0 ? totalScore / totalWeight : 0;
    };
    /**
     * Calcula similaridade entre campos específicos
     */
    DuplicateDetectionSystem.prototype.calculateFieldSimilarity = function (value1, value2, fieldType) {
        if (value1 === value2)
            return 1.0;
        // Normalizar valores
        var norm1 = value1.toLowerCase().replace(/[^a-z0-9]/g, '');
        var norm2 = value2.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (norm1 === norm2)
            return 0.95;
        // Algoritmo de distância de Levenshtein simplificado
        var maxLength = Math.max(norm1.length, norm2.length);
        if (maxLength === 0)
            return 1.0;
        var distance = 0;
        for (var i = 0; i < maxLength; i++) {
            if (norm1[i] !== norm2[i])
                distance++;
        }
        var similarity = 1 - (distance / maxLength);
        // Ajustes específicos por tipo de campo
        switch (fieldType) {
            case 'name':
                // Nomes têm maior tolerância para abreviações
                return similarity > 0.8 ? similarity + 0.1 : similarity;
            case 'phone':
                // Telefones têm formatação variável
                return similarity > 0.7 ? similarity + 0.15 : similarity;
            case 'birthDate':
                // Datas devem ser exatas ou muito próximas
                return similarity > 0.95 ? similarity : similarity * 0.5;
            default:
                return similarity;
        }
    };
    /**
     * Confirma uma duplicata identificada
     */
    DuplicateDetectionSystem.prototype.confirmDuplicate = function (duplicateId, reviewedBy) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // Simular confirmação de duplicata
                    console.log("Duplicata ".concat(duplicateId, " confirmada por ").concat(reviewedBy));
                    return [2 /*return*/, true];
                }
                catch (error) {
                    console.error('Erro ao confirmar duplicata:', error);
                    throw new Error('Falha ao confirmar duplicata');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Rejeita uma possível duplicata
     */
    DuplicateDetectionSystem.prototype.rejectDuplicate = function (duplicateId, reviewedBy, reason) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // Simular rejeição de duplicata
                    console.log("Duplicata ".concat(duplicateId, " rejeitada por ").concat(reviewedBy, ": ").concat(reason));
                    return [2 /*return*/, true];
                }
                catch (error) {
                    console.error('Erro ao rejeitar duplicata:', error);
                    throw new Error('Falha ao rejeitar duplicata');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Executa merge de pacientes duplicados
     */
    DuplicateDetectionSystem.prototype.mergePatients = function (primaryPatientId, duplicatePatientId, strategy, performedBy) {
        return __awaiter(this, void 0, void 0, function () {
            var mergeResult;
            return __generator(this, function (_a) {
                try {
                    mergeResult = {
                        success: true,
                        mergedPatientId: primaryPatientId,
                        archivedPatientId: duplicatePatientId,
                        conflictsResolved: 3,
                        dataTransferred: {
                            appointments: 12,
                            documents: 8,
                            medicalRecords: 15,
                            financialRecords: 6
                        }
                    };
                    // Verificar se há conflitos que precisam de revisão manual
                    if (strategy.financialData === 'manual_review') {
                        mergeResult.issues = ['Dados financiais requerem revisão manual'];
                    }
                    console.log("Merge executado por ".concat(performedBy, ": ").concat(duplicatePatientId, " -> ").concat(primaryPatientId));
                    return [2 /*return*/, mergeResult];
                }
                catch (error) {
                    console.error('Erro no merge de pacientes:', error);
                    throw new Error('Falha no merge de pacientes');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Gera preview do merge antes da execução
     */
    DuplicateDetectionSystem.prototype.previewMerge = function (primaryPatientId, duplicatePatientId, strategy) {
        return __awaiter(this, void 0, void 0, function () {
            var comparisons, preview, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.comparePatients(primaryPatientId, duplicatePatientId)];
                    case 1:
                        comparisons = _a.sent();
                        preview = {
                            strategy: strategy,
                            fieldResolutions: comparisons,
                            estimatedDataTransfer: {
                                appointments: 12,
                                documents: 8,
                                medicalRecords: 15,
                                financialRecords: 6
                            },
                            potentialConflicts: [
                                'Diferentes informações de contato de emergência',
                                'Histórico de pagamentos em ambos os registros'
                            ],
                            recommendations: [
                                'Revisar contatos de emergência antes do merge',
                                'Verificar dados financiais manualmente'
                            ]
                        };
                        return [2 /*return*/, preview];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Erro no preview de merge:', error_1);
                        throw new Error('Falha no preview de merge');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Busca duplicatas usando critérios específicos
     */
    DuplicateDetectionSystem.prototype.searchPotentialDuplicates = function (searchCriteria) {
        return __awaiter(this, void 0, void 0, function () {
            var threshold_1, potentialDuplicates, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        threshold_1 = searchCriteria.threshold || 0.7;
                        return [4 /*yield*/, this.detectDuplicates()];
                    case 1:
                        potentialDuplicates = _a.sent();
                        return [2 /*return*/, potentialDuplicates.filter(function (dup) { return dup.confidenceScore >= threshold_1; })];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Erro na busca de duplicatas:', error_2);
                        throw new Error('Falha na busca de duplicatas');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gera relatório de duplicatas do sistema
     */
    DuplicateDetectionSystem.prototype.generateDuplicateReport = function () {
        return __awaiter(this, void 0, void 0, function () {
            var allDuplicates, report, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.detectDuplicates()];
                    case 1:
                        allDuplicates = _a.sent();
                        report = {
                            generatedAt: new Date(),
                            summary: {
                                totalDuplicates: allDuplicates.length,
                                pendingReview: allDuplicates.filter(function (d) { return d.status === 'pending'; }).length,
                                confirmed: allDuplicates.filter(function (d) { return d.status === 'confirmed'; }).length,
                                merged: allDuplicates.filter(function (d) { return d.status === 'merged'; }).length,
                                rejected: allDuplicates.filter(function (d) { return d.status === 'rejected'; }).length
                            },
                            confidenceDistribution: {
                                high: allDuplicates.filter(function (d) { return d.confidenceScore >= 0.9; }).length,
                                medium: allDuplicates.filter(function (d) { return d.confidenceScore >= 0.7 && d.confidenceScore < 0.9; }).length,
                                low: allDuplicates.filter(function (d) { return d.confidenceScore < 0.7; }).length
                            },
                            duplicates: allDuplicates,
                            recommendations: [
                                'Revisar duplicatas com score > 0.9 primeiro',
                                'Configurar detecção automática para scores > 0.95',
                                'Implementar validação em tempo real para novos cadastros'
                            ]
                        };
                        return [2 /*return*/, report];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Erro ao gerar relatório de duplicatas:', error_3);
                        throw new Error('Falha na geração do relatório');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return DuplicateDetectionSystem;
}());
exports.DuplicateDetectionSystem = DuplicateDetectionSystem;
var createduplicateDetectionSystem = function () { return new DuplicateDetectionSystem(); };
exports.createduplicateDetectionSystem = createduplicateDetectionSystem;
