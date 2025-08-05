"use strict";
/**
 * Story 11.3: FIFO Management and Batch Control System
 * Advanced FIFO optimization with expiry management and intelligent batch selection
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
exports.fifoManager = exports.FIFOManager = void 0;
var stock_output_management_1 = require("./stock-output-management");
/**
 * FIFO Management System
 * Advanced batch control with expiry optimization and intelligent selection
 */
var FIFOManager = /** @class */ (function () {
    function FIFOManager() {
        this.supabase = createClient(ComponentClient());
        this.stockOutputManager = new stock_output_management_1.StockOutputManager();
    }
    /**
     * Get comprehensive FIFO analysis for all products or specific product
     */
    FIFOManager.prototype.getFIFOAnalysis = function (productId) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, batches, error, batchesByProduct, analyses, resolvedAnalyses, error_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        query = this.supabase
                            .from('lotes_estoque')
                            .select("\n          *,\n          produto:produtos_estoque(nome, codigo_interno, categoria, preco_custo)\n        ")
                            .eq('status', 'disponivel')
                            .gt('quantidade_disponivel', 0);
                        if (productId) {
                            query = query.eq('produto_id', productId);
                        }
                        return [4 /*yield*/, query
                                .order('data_validade', { ascending: true })];
                    case 1:
                        _a = _b.sent(), batches = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        batchesByProduct = (batches === null || batches === void 0 ? void 0 : batches.reduce(function (acc, batch) {
                            var productId = batch.produto_id;
                            if (!acc[productId]) {
                                acc[productId] = [];
                            }
                            acc[productId].push(batch);
                            return acc;
                        }, {})) || {};
                        analyses = Object.entries(batchesByProduct).map(function (_a) {
                            var productId = _a[0], productBatches = _a[1];
                            return _this.analyzeProductFIFO(productId, productBatches);
                        });
                        return [4 /*yield*/, Promise.all(analyses)];
                    case 2:
                        resolvedAnalyses = _b.sent();
                        return [2 /*return*/, {
                                data: resolvedAnalyses,
                                error: null
                            }];
                    case 3:
                        error_1 = _b.sent();
                        console.error('Error getting FIFO analysis:', error_1);
                        return [2 /*return*/, {
                                data: null,
                                error: 'Erro ao analisar FIFO'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get expiry alerts for products nearing expiration
     */
    FIFOManager.prototype.getExpiryAlerts = function () {
        return __awaiter(this, arguments, void 0, function (daysAhead) {
            var _a, expiringBatches, error, alerts, error_2;
            var _this = this;
            if (daysAhead === void 0) { daysAhead = 30; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('lotes_estoque')
                                .select("\n          *,\n          produto:produtos_estoque(nome, codigo_interno, preco_custo)\n        ")
                                .eq('status', 'disponivel')
                                .gt('quantidade_disponivel', 0)
                                .lte('dias_para_vencer', daysAhead)
                                .order('dias_para_vencer', { ascending: true })];
                    case 1:
                        _a = _b.sent(), expiringBatches = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        alerts = (expiringBatches === null || expiringBatches === void 0 ? void 0 : expiringBatches.map(function (batch) {
                            var _a, _b;
                            var daysToExpiry = batch.dias_para_vencer;
                            var estimatedValue = batch.quantidade_disponivel * (((_a = batch.produto) === null || _a === void 0 ? void 0 : _a.preco_custo) || 0);
                            return {
                                id: "alert-".concat(batch.id),
                                produto_id: batch.produto_id,
                                nome_produto: ((_b = batch.produto) === null || _b === void 0 ? void 0 : _b.nome) || 'Produto não identificado',
                                lote_id: batch.id,
                                numero_lote: batch.numero_lote,
                                data_validade: new Date(batch.data_validade),
                                dias_para_vencer: daysToExpiry,
                                quantidade_disponivel: batch.quantidade_disponivel,
                                valor_estimado: estimatedValue,
                                centro_custo_principal: batch.localizacao_principal,
                                acoes_disponiveis: _this.generateExpiryActions(batch, estimatedValue),
                                prioridade: _this.calculateExpiryPriority(daysToExpiry, estimatedValue)
                            };
                        })) || [];
                        return [2 /*return*/, {
                                data: alerts,
                                error: null
                            }];
                    case 2:
                        error_2 = _b.sent();
                        console.error('Error getting expiry alerts:', error_2);
                        return [2 /*return*/, {
                                data: null,
                                error: 'Erro ao buscar alertas de vencimento'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Optimize FIFO selection for specific consumption
     */
    FIFOManager.prototype.optimizeFIFOSelection = function (requests) {
        return __awaiter(this, void 0, void 0, function () {
            var optimizedSelections, _i, requests_1, request, selection, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        optimizedSelections = [];
                        _i = 0, requests_1 = requests;
                        _a.label = 1;
                    case 1:
                        if (!(_i < requests_1.length)) return [3 /*break*/, 4];
                        request = requests_1[_i];
                        return [4 /*yield*/, this.selectOptimalBatches(request)];
                    case 2:
                        selection = _a.sent();
                        optimizedSelections.push.apply(optimizedSelections, selection);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, {
                            data: optimizedSelections,
                            error: null
                        }];
                    case 5:
                        error_3 = _a.sent();
                        console.error('Error optimizing FIFO selection:', error_3);
                        return [2 /*return*/, {
                                data: null,
                                error: 'Erro ao otimizar seleção FIFO'
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute batch transfer between cost centers
     */
    FIFOManager.prototype.executeBatchTransfer = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var batch, transferNumber, _a, transfer, transferError, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.supabase
                                .from('lotes_estoque')
                                .select('*')
                                .eq('id', data.lote_id)
                                .single()];
                    case 1:
                        batch = (_b.sent()).data;
                        if (!batch) {
                            return [2 /*return*/, { success: false, error: 'Lote não encontrado' }];
                        }
                        if (batch.quantidade_disponivel < data.quantidade) {
                            return [2 /*return*/, { success: false, error: 'Quantidade insuficiente no lote' }];
                        }
                        return [4 /*yield*/, this.generateTransferNumber()];
                    case 2:
                        transferNumber = _b.sent();
                        return [4 /*yield*/, this.supabase
                                .from('transferencias_internas')
                                .insert({
                                numero_transferencia: transferNumber,
                                centro_custo_origem: data.centro_custo_origem,
                                centro_custo_destino: data.centro_custo_destino,
                                localizacao_origem: batch.localizacao_principal,
                                localizacao_destino: data.centro_custo_destino,
                                motivo_transferencia: data.motivo,
                                urgente: data.urgente || false,
                                quantidade_total: data.quantidade,
                                valor_total: data.quantidade * (batch.custo_unitario || 0),
                                status: 'aprovada', // Auto-approve for FIFO optimization
                                aprovado: true,
                                aprovado_em: new Date().toISOString()
                            })
                                .select()
                                .single()];
                    case 3:
                        _a = _b.sent(), transfer = _a.data, transferError = _a.error;
                        if (transferError)
                            throw transferError;
                        // 3. Create transfer item
                        return [4 /*yield*/, this.supabase
                                .from('itens_transferencia_interna')
                                .insert({
                                transferencia_id: transfer.id,
                                produto_id: batch.produto_id,
                                lote_id: batch.id,
                                quantidade_solicitada: data.quantidade,
                                quantidade_transferida: data.quantidade,
                                status: 'transferido'
                            })];
                    case 4:
                        // 3. Create transfer item
                        _b.sent();
                        // 4. Update batch location and quantities
                        return [4 /*yield*/, this.supabase
                                .from('lotes_estoque')
                                .update({
                                localizacao_principal: data.centro_custo_destino,
                                quantidade_atual: batch.quantidade_atual - data.quantidade,
                                ultima_movimentacao: new Date().toISOString()
                            })
                                .eq('id', data.lote_id)];
                    case 5:
                        // 4. Update batch location and quantities
                        _b.sent();
                        // 5. Log movement
                        return [4 /*yield*/, this.logBatchMovement({
                                lote_id: data.lote_id,
                                tipo_movimento: 'transferencia',
                                quantidade: -data.quantidade,
                                quantidade_anterior: batch.quantidade_atual,
                                quantidade_posterior: batch.quantidade_atual - data.quantidade,
                                motivo: "Transfer\u00EAncia FIFO: ".concat(data.motivo),
                                documento_origem: transfer.numero_transferencia
                            })];
                    case 6:
                        // 5. Log movement
                        _b.sent();
                        return [2 /*return*/, { success: true, error: null }];
                    case 7:
                        error_4 = _b.sent();
                        console.error('Error executing batch transfer:', error_4);
                        return [2 /*return*/, { success: false, error: 'Erro ao executar transferência' }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Block expired or near-expiry batches
     */
    FIFOManager.prototype.blockExpiringBatches = function () {
        return __awaiter(this, arguments, void 0, function (daysThreshold) {
            var expiringBatches, blockError, _i, expiringBatches_1, batch, error_5;
            if (daysThreshold === void 0) { daysThreshold = 0; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.supabase
                                .from('lotes_estoque')
                                .select('id, numero_lote, produto_id, dias_para_vencer')
                                .eq('status', 'disponivel')
                                .eq('bloqueado', false)
                                .lte('dias_para_vencer', daysThreshold)];
                    case 1:
                        expiringBatches = (_a.sent()).data;
                        if (!expiringBatches || expiringBatches.length === 0) {
                            return [2 /*return*/, { blocked: 0, error: null }];
                        }
                        return [4 /*yield*/, this.supabase
                                .from('lotes_estoque')
                                .update({
                                bloqueado: true,
                                status: daysThreshold <= 0 ? 'vencido' : 'bloqueado',
                                motivo_bloqueio: daysThreshold <= 0
                                    ? 'Produto vencido - bloqueio automático'
                                    : "Pr\u00F3ximo ao vencimento - ".concat(daysThreshold, " dias")
                            })
                                .in('id', expiringBatches.map(function (b) { return b.id; }))];
                    case 2:
                        blockError = (_a.sent()).error;
                        if (blockError)
                            throw blockError;
                        _i = 0, expiringBatches_1 = expiringBatches;
                        _a.label = 3;
                    case 3:
                        if (!(_i < expiringBatches_1.length)) return [3 /*break*/, 6];
                        batch = expiringBatches_1[_i];
                        return [4 /*yield*/, this.logBatchMovement({
                                lote_id: batch.id,
                                tipo_movimento: 'bloqueio',
                                quantidade: 0,
                                quantidade_anterior: 0,
                                quantidade_posterior: 0,
                                motivo: daysThreshold <= 0 ? 'Bloqueio por vencimento' : 'Bloqueio preventivo'
                            })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, { blocked: expiringBatches.length, error: null }];
                    case 7:
                        error_5 = _a.sent();
                        console.error('Error blocking expiring batches:', error_5);
                        return [2 /*return*/, { blocked: 0, error: 'Erro ao bloquear lotes vencidos' }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get batch movement history
     */
    FIFOManager.prototype.getBatchMovementHistory = function (loteId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, movements, error, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('movimentacoes_lote')
                                .select("\n          *,\n          responsavel:auth.users(nome)\n        ")
                                .eq('lote_id', loteId)
                                .order('data_movimento', { ascending: false })];
                    case 1:
                        _a = _b.sent(), movements = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, {
                                data: movements,
                                error: null
                            }];
                    case 2:
                        error_6 = _b.sent();
                        console.error('Error getting batch movement history:', error_6);
                        return [2 /*return*/, {
                                data: null,
                                error: 'Erro ao buscar histórico de movimentações'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyze FIFO for specific product
     */
    FIFOManager.prototype.analyzeProductFIFO = function (productId, batches) {
        return __awaiter(this, void 0, void 0, function () {
            var sortedBatches, lotesPriorizados, lotesVencendo, economiaFifo, desperdicioEvitado, recomendacoes;
            var _a, _b;
            return __generator(this, function (_c) {
                sortedBatches = batches.sort(function (a, b) {
                    if (a.data_validade && b.data_validade) {
                        return new Date(a.data_validade).getTime() - new Date(b.data_validade).getTime();
                    }
                    return a.prioridade_uso - b.prioridade_uso;
                });
                lotesPriorizados = sortedBatches.filter(function (b) { return b.prioridade_uso <= 3; });
                lotesVencendo = sortedBatches.filter(function (b) { return b.dias_para_vencer <= 30; });
                economiaFifo = this.calculateFIFOEconomy(sortedBatches);
                desperdicioEvitado = this.calculateWastePrevention(lotesVencendo);
                recomendacoes = this.generateFIFORecommendations(sortedBatches);
                return [2 /*return*/, {
                        produto_id: productId,
                        nome_produto: ((_b = (_a = batches[0]) === null || _a === void 0 ? void 0 : _a.produto) === null || _b === void 0 ? void 0 : _b.nome) || 'Produto não identificado',
                        lotes_disponiveis: sortedBatches,
                        lotes_priorizados: lotesPriorizados,
                        lotes_vencendo: lotesVencendo,
                        economia_fifo: economiaFifo,
                        desperdicioEvitado: desperdicioEvitado,
                        recomendacoes: recomendacoes
                    }];
            });
        });
    };
    /**
     * Select optimal batches for consumption
     */
    FIFOManager.prototype.selectOptimalBatches = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var availableBatches, selectedBatches, remainingQuantity, _i, availableBatches_1, batch, quantityToTake;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('lotes_estoque')
                            .select('*')
                            .eq('produto_id', request.produto_id)
                            .eq('status', 'disponivel')
                            .gt('quantidade_disponivel', 0)
                            .eq('bloqueado', false)
                            .order('data_validade', { ascending: true })
                            .order('prioridade_uso', { ascending: true })];
                    case 1:
                        availableBatches = (_a.sent()).data;
                        if (!availableBatches || availableBatches.length === 0) {
                            return [2 /*return*/, []];
                        }
                        selectedBatches = [];
                        remainingQuantity = request.quantidade_necessaria;
                        for (_i = 0, availableBatches_1 = availableBatches; _i < availableBatches_1.length; _i++) {
                            batch = availableBatches_1[_i];
                            if (remainingQuantity <= 0)
                                break;
                            quantityToTake = Math.min(remainingQuantity, batch.quantidade_disponivel);
                            selectedBatches.push({
                                lote_id: batch.id,
                                produto_id: batch.produto_id,
                                numero_lote: batch.numero_lote,
                                quantidade_disponivel: quantityToTake,
                                data_validade: new Date(batch.data_validade),
                                dias_para_vencer: batch.dias_para_vencer,
                                prioridade_uso: batch.prioridade_uso,
                                recomendado: batch.dias_para_vencer <= 30 || batch.prioridade_uso <= 3,
                                motivo_recomendacao: this.getRecommendationReason(batch)
                            });
                            remainingQuantity -= quantityToTake;
                        }
                        return [2 /*return*/, selectedBatches];
                }
            });
        });
    };
    /**
     * Generate expiry actions for a batch
     */
    FIFOManager.prototype.generateExpiryActions = function (batch, estimatedValue) {
        var actions = [];
        var daysToExpiry = batch.dias_para_vencer;
        if (daysToExpiry > 7) {
            actions.push({
                tipo: 'uso_prioritario',
                descricao: 'Priorizar uso em procedimentos',
                impacto_financeiro: estimatedValue * 0.95,
                prazo_execucao: daysToExpiry - 2,
                probabilidade_sucesso: 85
            });
            actions.push({
                tipo: 'transferencia',
                descricao: 'Transferir para setor de maior consumo',
                impacto_financeiro: estimatedValue * 0.90,
                prazo_execucao: 3,
                probabilidade_sucesso: 70
            });
        }
        if (daysToExpiry > 3) {
            actions.push({
                tipo: 'promocao',
                descricao: 'Promoção interna ou desconto',
                impacto_financeiro: estimatedValue * 0.70,
                prazo_execucao: daysToExpiry,
                probabilidade_sucesso: 60
            });
        }
        if (daysToExpiry <= 7) {
            actions.push({
                tipo: 'devolucao',
                descricao: 'Devolução ao fornecedor (se possível)',
                impacto_financeiro: estimatedValue * 0.80,
                prazo_execucao: 2,
                probabilidade_sucesso: 30
            });
        }
        actions.push({
            tipo: 'descarte',
            descricao: 'Descarte controlado',
            impacto_financeiro: 0,
            prazo_execucao: 1,
            probabilidade_sucesso: 100
        });
        return actions;
    };
    /**
     * Calculate expiry priority based on days and value
     */
    FIFOManager.prototype.calculateExpiryPriority = function (daysToExpiry, estimatedValue) {
        if (daysToExpiry <= 0)
            return 'critica';
        if (daysToExpiry <= 3)
            return 'alta';
        if (daysToExpiry <= 7 || estimatedValue > 1000)
            return 'media';
        return 'baixa';
    };
    /**
     * Get recommendation reason for batch
     */
    FIFOManager.prototype.getRecommendationReason = function (batch) {
        if (batch.dias_para_vencer <= 7)
            return 'Vencimento iminente';
        if (batch.dias_para_vencer <= 30)
            return 'Próximo ao vencimento';
        if (batch.prioridade_uso <= 3)
            return 'Alta prioridade FIFO';
        return 'FIFO otimizado';
    };
    /**
     * Calculate FIFO economy (simplified)
     */
    FIFOManager.prototype.calculateFIFOEconomy = function (batches) {
        // This would contain complex calculations
        // For now, returning a placeholder
        return batches.length * 50; // R$ 50 per batch in FIFO savings
    };
    /**
     * Calculate waste prevention value
     */
    FIFOManager.prototype.calculateWastePrevention = function (expiringBatches) {
        return expiringBatches.reduce(function (total, batch) {
            return total + (batch.quantidade_disponivel * (batch.custo_unitario || 0));
        }, 0);
    };
    /**
     * Generate FIFO recommendations
     */
    FIFOManager.prototype.generateFIFORecommendations = function (batches) {
        var recommendations = [];
        batches.forEach(function (batch) {
            if (batch.dias_para_vencer <= 7) {
                recommendations.push({
                    tipo: 'usar_prioritario',
                    lote_id: batch.id,
                    numero_lote: batch.numero_lote,
                    dias_para_vencer: batch.dias_para_vencer,
                    quantidade_disponivel: batch.quantidade_disponivel,
                    acao_recomendada: 'Usar prioritariamente em até 3 dias',
                    urgencia: 'critica',
                    impacto_financeiro: batch.quantidade_disponivel * (batch.custo_unitario || 0)
                });
            }
            else if (batch.dias_para_vencer <= 30) {
                recommendations.push({
                    tipo: 'promocao_uso',
                    lote_id: batch.id,
                    numero_lote: batch.numero_lote,
                    dias_para_vencer: batch.dias_para_vencer,
                    quantidade_disponivel: batch.quantidade_disponivel,
                    acao_recomendada: 'Promover uso em procedimentos adequados',
                    urgencia: 'media',
                    impacto_financeiro: batch.quantidade_disponivel * (batch.custo_unitario || 0) * 0.8
                });
            }
        });
        return recommendations;
    };
    /**
     * Log batch movement
     */
    FIFOManager.prototype.logBatchMovement = function (movement) {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('movimentacoes_lote')
                                .insert(__assign(__assign({}, movement), { data_movimento: new Date().toISOString(), auditoria_completa: true }))];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        console.error('Error logging batch movement:', error_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate transfer number
     */
    FIFOManager.prototype.generateTransferNumber = function () {
        return __awaiter(this, void 0, void 0, function () {
            var today, datePrefix, count, sequentialNumber;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        today = new Date();
                        datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');
                        return [4 /*yield*/, this.supabase
                                .from('transferencias_internas')
                                .select('*', { count: 'exact', head: true })
                                .like('numero_transferencia', "TRF-".concat(datePrefix, "%"))];
                    case 1:
                        count = (_a.sent()).count;
                        sequentialNumber = String((count || 0) + 1).padStart(4, '0');
                        return [2 /*return*/, "TRF-".concat(datePrefix, "-").concat(sequentialNumber)];
                }
            });
        });
    };
    return FIFOManager;
}());
exports.FIFOManager = FIFOManager;
// Export default instance
exports.fifoManager = new FIFOManager();
