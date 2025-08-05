"use strict";
/**
 * Story 11.3: Consumption Analytics and Cost Control System
 * Advanced analytics for consumption patterns and cost optimization
 */
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
exports.consumptionAnalyzer = exports.ConsumptionAnalyzer = void 0;
/**
 * Consumption Analytics System
 * Advanced analytics for consumption patterns and cost optimization
 */
var ConsumptionAnalyzer = /** @class */ (function () {
    function ConsumptionAnalyzer() {
        this.supabase = createClient(ComponentClient());
    }
    /**
     * Get comprehensive consumption analytics for cost center
     */
    ConsumptionAnalyzer.prototype.getConsumptionAnalytics = function (centroCustoId, dataInicio, dataFim) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, consumptions, consumptionError, totalQuantity, totalValue, uniqueProducts, totalDays, productConsumptions, trends, costEfficiency, alerts, analytics, error_1;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.supabase
                                .from('saidas_estoque')
                                .select("\n          *,\n          produto:produtos_estoque(nome, categoria, preco_custo),\n          centro_custo:centros_custo(nome)\n        ")
                                .eq('centro_custo_id', centroCustoId)
                                .gte('data_saida', dataInicio.toISOString())
                                .lte('data_saida', dataFim.toISOString())
                                .eq('status', 'confirmada')];
                    case 1:
                        _a = _d.sent(), consumptions = _a.data, consumptionError = _a.error;
                        if (consumptionError)
                            throw consumptionError;
                        if (!consumptions || consumptions.length === 0) {
                            return [2 /*return*/, {
                                    data: null,
                                    error: 'Nenhum consumo encontrado para o período'
                                }];
                        }
                        totalQuantity = consumptions.reduce(function (sum, c) { return sum + c.quantidade; }, 0);
                        totalValue = consumptions.reduce(function (sum, c) { return sum + c.valor_total; }, 0);
                        uniqueProducts = new Set(consumptions.map(function (c) { return c.produto_id; })).size;
                        totalDays = Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
                        return [4 /*yield*/, this.calculateProductConsumptions(consumptions, totalValue)];
                    case 2:
                        productConsumptions = _d.sent();
                        return [4 /*yield*/, this.calculateConsumptionTrends(centroCustoId, dataInicio, dataFim)];
                    case 3:
                        trends = _d.sent();
                        return [4 /*yield*/, this.calculateCostEfficiency(consumptions, centroCustoId)];
                    case 4:
                        costEfficiency = _d.sent();
                        return [4 /*yield*/, this.generateConsumptionAlerts(consumptions, productConsumptions)];
                    case 5:
                        alerts = _d.sent();
                        analytics = {
                            periodo: {
                                data_inicio: dataInicio,
                                data_fim: dataFim,
                                total_dias: totalDays
                            },
                            centro_custo_id: centroCustoId,
                            nome_centro_custo: ((_c = (_b = consumptions[0]) === null || _b === void 0 ? void 0 : _b.centro_custo) === null || _c === void 0 ? void 0 : _c.nome) || 'Centro de Custo',
                            consumo_total: {
                                quantidade: totalQuantity,
                                valor_total: totalValue,
                                numero_produtos: uniqueProducts,
                                numero_movimentacoes: consumptions.length
                            },
                            media_diaria: {
                                quantidade: totalQuantity / totalDays,
                                valor: totalValue / totalDays,
                                movimentacoes: consumptions.length / totalDays
                            },
                            produtos_mais_consumidos: productConsumptions,
                            tendencias: trends,
                            eficiencia_custos: costEfficiency,
                            alertas: alerts
                        };
                        return [2 /*return*/, {
                                data: analytics,
                                error: null
                            }];
                    case 6:
                        error_1 = _d.sent();
                        console.error('Error getting consumption analytics:', error_1);
                        return [2 /*return*/, {
                                data: null,
                                error: 'Erro ao analisar consumo'
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get consumption forecast for products
     */
    ConsumptionAnalyzer.prototype.getConsumptionForecast = function (centroCustoId_1, produtoIds_1) {
        return __awaiter(this, arguments, void 0, function (centroCustoId, produtoIds, diasPrevisao) {
            var sixMonthsAgo, query, _a, historicalData, error, productGroups, forecasts, resolvedForecasts, error_2;
            var _this = this;
            if (diasPrevisao === void 0) { diasPrevisao = 30; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        sixMonthsAgo = new Date();
                        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                        query = this.supabase
                            .from('saidas_estoque')
                            .select("\n          *,\n          produto:produtos_estoque(nome, categoria)\n        ")
                            .eq('centro_custo_id', centroCustoId)
                            .gte('data_saida', sixMonthsAgo.toISOString())
                            .eq('status', 'confirmada');
                        if (produtoIds && produtoIds.length > 0) {
                            query = query.in('produto_id', produtoIds);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), historicalData = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        if (!historicalData || historicalData.length === 0) {
                            return [2 /*return*/, {
                                    data: [],
                                    error: 'Dados históricos insuficientes para previsão'
                                }];
                        }
                        productGroups = historicalData.reduce(function (acc, consumption) {
                            var productId = consumption.produto_id;
                            if (!acc[productId]) {
                                acc[productId] = [];
                            }
                            acc[productId].push(consumption);
                            return acc;
                        }, {});
                        forecasts = Object.entries(productGroups).map(function (_a) {
                            var productId = _a[0], consumptions = _a[1];
                            return _this.calculateProductForecast(productId, consumptions, diasPrevisao);
                        });
                        return [4 /*yield*/, Promise.all(forecasts)];
                    case 2:
                        resolvedForecasts = _b.sent();
                        return [2 /*return*/, {
                                data: resolvedForecasts,
                                error: null
                            }];
                    case 3:
                        error_2 = _b.sent();
                        console.error('Error getting consumption forecast:', error_2);
                        return [2 /*return*/, {
                                data: null,
                                error: 'Erro ao calcular previsão de consumo'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Identify consumption patterns
     */
    ConsumptionAnalyzer.prototype.identifyConsumptionPatterns = function (centroCustoId_1) {
        return __awaiter(this, arguments, void 0, function (centroCustoId, mesesAnalise) {
            var startDate, _a, consumptions, error, productGroups, patterns, resolvedPatterns, error_3;
            var _this = this;
            if (mesesAnalise === void 0) { mesesAnalise = 6; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        startDate = new Date();
                        startDate.setMonth(startDate.getMonth() - mesesAnalise);
                        return [4 /*yield*/, this.supabase
                                .from('saidas_estoque')
                                .select("\n          *,\n          produto:produtos_estoque(nome, categoria)\n        ")
                                .eq('centro_custo_id', centroCustoId)
                                .gte('data_saida', startDate.toISOString())
                                .eq('status', 'confirmada')
                                .order('data_saida', { ascending: true })];
                    case 1:
                        _a = _b.sent(), consumptions = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        if (!consumptions || consumptions.length === 0) {
                            return [2 /*return*/, {
                                    data: [],
                                    error: 'Dados insuficientes para análise de padrões'
                                }];
                        }
                        productGroups = consumptions.reduce(function (acc, consumption) {
                            var productId = consumption.produto_id;
                            if (!acc[productId]) {
                                acc[productId] = [];
                            }
                            acc[productId].push(consumption);
                            return acc;
                        }, {});
                        patterns = Object.entries(productGroups).map(function (_a) {
                            var productId = _a[0], productConsumptions = _a[1];
                            return _this.analyzeProductPattern(centroCustoId, productId, productConsumptions);
                        });
                        return [4 /*yield*/, Promise.all(patterns)];
                    case 2:
                        resolvedPatterns = _b.sent();
                        return [2 /*return*/, {
                                data: resolvedPatterns,
                                error: null
                            }];
                    case 3:
                        error_3 = _b.sent();
                        console.error('Error identifying consumption patterns:', error_3);
                        return [2 /*return*/, {
                                data: null,
                                error: 'Erro ao identificar padrões de consumo'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate cost optimization recommendations
     */
    ConsumptionAnalyzer.prototype.generateCostOptimizationRecommendations = function (centroCustoId, dataInicio, dataFim) {
        return __awaiter(this, void 0, void 0, function () {
            var analytics, opportunities, supplierOpportunities, batchOpportunities, wasteOpportunities, substitutionOpportunities, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.getConsumptionAnalytics(centroCustoId, dataInicio, dataFim)];
                    case 1:
                        analytics = (_a.sent()).data;
                        if (!analytics) {
                            return [2 /*return*/, {
                                    data: [],
                                    error: 'Dados insuficientes para recomendações'
                                }];
                        }
                        opportunities = [];
                        return [4 /*yield*/, this.analyzeSupplierConsolidation(analytics.produtos_mais_consumidos)];
                    case 2:
                        supplierOpportunities = _a.sent();
                        opportunities.push.apply(opportunities, supplierOpportunities);
                        return [4 /*yield*/, this.analyzeBatchOptimization(analytics.produtos_mais_consumidos)];
                    case 3:
                        batchOpportunities = _a.sent();
                        opportunities.push.apply(opportunities, batchOpportunities);
                        return [4 /*yield*/, this.analyzeWasteReduction(centroCustoId, dataInicio, dataFim)];
                    case 4:
                        wasteOpportunities = _a.sent();
                        opportunities.push.apply(opportunities, wasteOpportunities);
                        return [4 /*yield*/, this.analyzeProductSubstitution(analytics.produtos_mais_consumidos)];
                    case 5:
                        substitutionOpportunities = _a.sent();
                        opportunities.push.apply(opportunities, substitutionOpportunities);
                        // Sort by potential savings
                        opportunities.sort(function (a, b) { return b.economia_estimada - a.economia_estimada; });
                        return [2 /*return*/, {
                                data: opportunities,
                                error: null
                            }];
                    case 6:
                        error_4 = _a.sent();
                        console.error('Error generating cost optimization recommendations:', error_4);
                        return [2 /*return*/, {
                                data: null,
                                error: 'Erro ao gerar recomendações de otimização'
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate product consumptions
     */
    ConsumptionAnalyzer.prototype.calculateProductConsumptions = function (consumptions, totalValue) {
        return __awaiter(this, void 0, void 0, function () {
            var productGroups;
            return __generator(this, function (_a) {
                productGroups = consumptions.reduce(function (acc, consumption) {
                    var _a, _b;
                    var productId = consumption.produto_id;
                    if (!acc[productId]) {
                        acc[productId] = {
                            produto_id: productId,
                            nome_produto: ((_a = consumption.produto) === null || _a === void 0 ? void 0 : _a.nome) || 'Produto não identificado',
                            categoria: ((_b = consumption.produto) === null || _b === void 0 ? void 0 : _b.categoria) || 'Sem categoria',
                            quantidade_consumida: 0,
                            valor_consumido: 0,
                            numero_movimentacoes: 0,
                            valores_unitarios: []
                        };
                    }
                    acc[productId].quantidade_consumida += consumption.quantidade;
                    acc[productId].valor_consumido += consumption.valor_total;
                    acc[productId].numero_movimentacoes += 1;
                    acc[productId].valores_unitarios.push(consumption.valor_unitario || 0);
                    return acc;
                }, {});
                return [2 /*return*/, Object.values(productGroups).map(function (group) {
                        var custoMedio = group.valores_unitarios.reduce(function (sum, val) { return sum + val; }, 0) / group.valores_unitarios.length;
                        var percentualConsumo = (group.valor_consumido / totalValue) * 100;
                        return {
                            produto_id: group.produto_id,
                            nome_produto: group.nome_produto,
                            categoria: group.categoria,
                            quantidade_consumida: group.quantidade_consumida,
                            valor_consumido: group.valor_consumido,
                            numero_movimentacoes: group.numero_movimentacoes,
                            custo_medio_unitario: custoMedio,
                            percentual_consumo_total: percentualConsumo,
                            tendencia_mensal: 'estavel', // Would be calculated with historical data
                            variacao_percentual: 0 // Would be calculated with historical data
                        };
                    }).sort(function (a, b) { return b.valor_consumido - a.valor_consumido; })];
            });
        });
    };
    /**
     * Calculate consumption trends
     */
    ConsumptionAnalyzer.prototype.calculateConsumptionTrends = function (centroCustoId, dataInicio, dataFim) {
        return __awaiter(this, void 0, void 0, function () {
            var trends, totalDays, weekCount, week, weekStart, weekEnd, weekConsumptions, totalQuantity, totalValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        trends = [];
                        totalDays = Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
                        weekCount = Math.ceil(totalDays / 7);
                        week = 0;
                        _a.label = 1;
                    case 1:
                        if (!(week < weekCount)) return [3 /*break*/, 4];
                        weekStart = new Date(dataInicio);
                        weekStart.setDate(weekStart.getDate() + (week * 7));
                        weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekEnd.getDate() + 6);
                        return [4 /*yield*/, this.supabase
                                .from('saidas_estoque')
                                .select('quantidade, valor_total')
                                .eq('centro_custo_id', centroCustoId)
                                .gte('data_saida', weekStart.toISOString())
                                .lte('data_saida', weekEnd.toISOString())
                                .eq('status', 'confirmada')];
                    case 2:
                        weekConsumptions = (_a.sent()).data;
                        if (weekConsumptions) {
                            totalQuantity = weekConsumptions.reduce(function (sum, c) { return sum + c.quantidade; }, 0);
                            totalValue = weekConsumptions.reduce(function (sum, c) { return sum + c.valor_total; }, 0);
                            trends.push({
                                periodo: "Semana ".concat(week + 1),
                                quantidade_consumida: totalQuantity,
                                valor_consumido: totalValue,
                                variacao_quantidade: week > 0 ? ((totalQuantity - trends[week - 1].quantidade_consumida) / trends[week - 1].quantidade_consumida) * 100 : 0,
                                variacao_valor: week > 0 ? ((totalValue - trends[week - 1].valor_consumido) / trends[week - 1].valor_consumido) * 100 : 0,
                                eficiencia_score: this.calculateEfficiencyScore(totalQuantity, totalValue)
                            });
                        }
                        _a.label = 3;
                    case 3:
                        week++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, trends];
                }
            });
        });
    };
    /**
     * Calculate cost efficiency
     */
    ConsumptionAnalyzer.prototype.calculateCostEfficiency = function (consumptions, centroCustoId) {
        return __awaiter(this, void 0, void 0, function () {
            var totalValue, totalQuantity, avgCostPerUnit, efficiencyScore, potentialSavings, identifiedWaste, opportunities;
            return __generator(this, function (_a) {
                totalValue = consumptions.reduce(function (sum, c) { return sum + c.valor_total; }, 0);
                totalQuantity = consumptions.reduce(function (sum, c) { return sum + c.quantidade; }, 0);
                avgCostPerUnit = totalValue / totalQuantity;
                efficiencyScore = this.calculateEfficiencyScore(totalQuantity, totalValue);
                potentialSavings = totalValue * 0.15;
                identifiedWaste = totalValue * 0.05;
                opportunities = [
                    {
                        tipo: 'consolidacao_fornecedor',
                        descricao: 'Consolidar compras com fornecedores preferenciais',
                        economia_estimada: potentialSavings * 0.4,
                        complexidade: 'media',
                        prazo_implementacao: 30,
                        impacto_operacional: 'moderado'
                    },
                    {
                        tipo: 'otimizacao_lote',
                        descricao: 'Otimizar tamanhos de lote de compra',
                        economia_estimada: potentialSavings * 0.3,
                        complexidade: 'baixa',
                        prazo_implementacao: 15,
                        impacto_operacional: 'minimo'
                    },
                    {
                        tipo: 'reducao_desperdicio',
                        descricao: 'Implementar controles de desperdício',
                        economia_estimada: identifiedWaste,
                        complexidade: 'alta',
                        prazo_implementacao: 60,
                        impacto_operacional: 'significativo'
                    }
                ];
                return [2 /*return*/, {
                        score_eficiencia: efficiencyScore,
                        custo_por_unidade_media: avgCostPerUnit,
                        economia_potencial: potentialSavings,
                        desperdicioIdentificado: identifiedWaste,
                        oportunidades_melhoria: opportunities
                    }];
            });
        });
    };
    /**
     * Generate consumption alerts
     */
    ConsumptionAnalyzer.prototype.generateConsumptionAlerts = function (consumptions, productConsumptions) {
        return __awaiter(this, void 0, void 0, function () {
            var alerts;
            return __generator(this, function (_a) {
                alerts = [];
                // Alert for high-cost products
                productConsumptions.forEach(function (product, index) {
                    if (product.percentual_consumo_total > 20) {
                        alerts.push({
                            id: "alert-high-cost-".concat(index),
                            tipo: 'custo_elevado',
                            produto_id: product.produto_id,
                            nome_produto: product.nome_produto,
                            descricao: "Produto representa ".concat(product.percentual_consumo_total.toFixed(1), "% do consumo total"),
                            valor_impacto: product.valor_consumido,
                            gravidade: product.percentual_consumo_total > 30 ? 'alta' : 'media',
                            acao_recomendada: 'Revisar fornecedores e preços para este produto',
                            data_detectado: new Date()
                        });
                    }
                    if (product.custo_medio_unitario > 100) {
                        alerts.push({
                            id: "alert-expensive-".concat(index),
                            tipo: 'custo_elevado',
                            produto_id: product.produto_id,
                            nome_produto: product.nome_produto,
                            descricao: "Produto com custo unit\u00E1rio elevado: R$ ".concat(product.custo_medio_unitario.toFixed(2)),
                            valor_impacto: product.valor_consumido,
                            gravidade: 'media',
                            acao_recomendada: 'Buscar alternativas ou negociar preços',
                            data_detectado: new Date()
                        });
                    }
                });
                return [2 /*return*/, alerts];
            });
        });
    };
    /**
     * Calculate product forecast
     */
    ConsumptionAnalyzer.prototype.calculateProductForecast = function (productId, consumptions, diasPrevisao) {
        return __awaiter(this, void 0, void 0, function () {
            var totalQuantity, totalValue, avgDailyConsumption, forecastQuantity, avgUnitCost, forecastValue;
            var _a, _b;
            return __generator(this, function (_c) {
                totalQuantity = consumptions.reduce(function (sum, c) { return sum + c.quantidade; }, 0);
                totalValue = consumptions.reduce(function (sum, c) { return sum + c.valor_total; }, 0);
                avgDailyConsumption = totalQuantity / 180;
                forecastQuantity = avgDailyConsumption * diasPrevisao;
                avgUnitCost = totalValue / totalQuantity;
                forecastValue = forecastQuantity * avgUnitCost;
                return [2 /*return*/, {
                        produto_id: productId,
                        nome_produto: ((_b = (_a = consumptions[0]) === null || _a === void 0 ? void 0 : _a.produto) === null || _b === void 0 ? void 0 : _b.nome) || 'Produto não identificado',
                        previsao_quantidade: forecastQuantity,
                        previsao_valor: forecastValue,
                        confianca_previsao: 75, // Simplified confidence
                        sazonalidade_detectada: false, // Would implement seasonality detection
                        fatores_influencia: ['Histórico de consumo', 'Tendência linear'],
                        recomendacao_compra: {
                            quantidade_recomendada: forecastQuantity * 1.1, // 10% safety margin
                            prazo_compra_ideal: Math.max(7, diasPrevisao - 14),
                            justificativa: 'Baseado em consumo histórico com margem de segurança',
                            economia_esperada: forecastValue * 0.05 // 5% expected savings
                        }
                    }];
            });
        });
    };
    /**
     * Analyze product consumption pattern
     */
    ConsumptionAnalyzer.prototype.analyzeProductPattern = function (centroCustoId, productId, consumptions) {
        return __awaiter(this, void 0, void 0, function () {
            var monthlyConsumption, avgQuantity, hourPatterns, dayPatterns, peakHours, peakDays, patternType;
            return __generator(this, function (_a) {
                monthlyConsumption = consumptions.length / 6;
                avgQuantity = consumptions.reduce(function (sum, c) { return sum + c.quantidade; }, 0) / consumptions.length;
                hourPatterns = consumptions.map(function (c) { return new Date(c.data_saida).getHours(); });
                dayPatterns = consumptions.map(function (c) { return new Date(c.data_saida).getDay(); });
                peakHours = this.findPeakHours(hourPatterns);
                peakDays = this.findPeakDays(dayPatterns);
                patternType = 'regular';
                if (monthlyConsumption < 1)
                    patternType = 'irregular';
                else if (monthlyConsumption > 4)
                    patternType = 'regular';
                return [2 /*return*/, {
                        centro_custo_id: centroCustoId,
                        produto_id: productId,
                        padrao_identificado: patternType,
                        frequencia_uso: monthlyConsumption,
                        quantidade_media_uso: avgQuantity,
                        horarios_pico: peakHours,
                        dias_semana_pico: peakDays,
                        correlacoes: [] // Would implement correlation analysis
                    }];
            });
        });
    };
    /**
     * Find peak hours from hour patterns
     */
    ConsumptionAnalyzer.prototype.findPeakHours = function (hours) {
        var hourCounts = hours.reduce(function (acc, hour) {
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {});
        var sortedHours = Object.entries(hourCounts)
            .sort(function (_a, _b) {
            var a = _a[1];
            var b = _b[1];
            return b - a;
        })
            .slice(0, 3)
            .map(function (_a) {
            var hour = _a[0];
            return "".concat(hour, ":00");
        });
        return sortedHours;
    };
    /**
     * Find peak days from day patterns
     */
    ConsumptionAnalyzer.prototype.findPeakDays = function (days) {
        var dayCounts = days.reduce(function (acc, day) {
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(dayCounts)
            .sort(function (_a, _b) {
            var a = _a[1];
            var b = _b[1];
            return b - a;
        })
            .slice(0, 3)
            .map(function (_a) {
            var day = _a[0];
            return parseInt(day);
        });
    };
    /**
     * Calculate efficiency score
     */
    ConsumptionAnalyzer.prototype.calculateEfficiencyScore = function (quantity, value) {
        // Simplified efficiency calculation
        var costPerUnit = value / quantity;
        var benchmarkCost = 10; // Benchmark cost per unit
        var efficiency = Math.max(0, Math.min(100, 100 - ((costPerUnit - benchmarkCost) / benchmarkCost) * 100));
        return Math.round(efficiency);
    };
    /**
     * Analyze supplier consolidation opportunities
     */
    ConsumptionAnalyzer.prototype.analyzeSupplierConsolidation = function (products) {
        return __awaiter(this, void 0, void 0, function () {
            var highValueProducts;
            return __generator(this, function (_a) {
                highValueProducts = products.filter(function (p) { return p.valor_consumido > 1000; });
                if (highValueProducts.length > 5) {
                    return [2 /*return*/, [{
                                tipo: 'consolidacao_fornecedor',
                                descricao: "Consolidar ".concat(highValueProducts.length, " produtos de alto valor com fornecedores preferenciais"),
                                economia_estimada: highValueProducts.reduce(function (sum, p) { return sum + p.valor_consumido; }, 0) * 0.08,
                                complexidade: 'media',
                                prazo_implementacao: 45,
                                impacto_operacional: 'moderado'
                            }]];
                }
                return [2 /*return*/, []];
            });
        });
    };
    /**
     * Analyze batch optimization opportunities
     */
    ConsumptionAnalyzer.prototype.analyzeBatchOptimization = function (products) {
        return __awaiter(this, void 0, void 0, function () {
            var opportunities;
            return __generator(this, function (_a) {
                opportunities = [];
                products.forEach(function (product) {
                    if (product.numero_movimentacoes > 10 && product.valor_consumido > 500) {
                        opportunities.push({
                            tipo: 'otimizacao_lote',
                            descricao: "Otimizar lotes de compra para ".concat(product.nome_produto, " (").concat(product.numero_movimentacoes, " movimenta\u00E7\u00F5es)"),
                            economia_estimada: product.valor_consumido * 0.05,
                            complexidade: 'baixa',
                            prazo_implementacao: 15,
                            impacto_operacional: 'minimo'
                        });
                    }
                });
                return [2 /*return*/, opportunities.slice(0, 5)]; // Top 5 opportunities
            });
        });
    };
    /**
     * Analyze waste reduction opportunities
     */
    ConsumptionAnalyzer.prototype.analyzeWasteReduction = function (centroCustoId, dataInicio, dataFim) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Simplified waste analysis - would involve complex waste detection
                return [2 /*return*/, [{
                            tipo: 'reducao_desperdicio',
                            descricao: 'Implementar controles FIFO e monitoramento de vencimentos',
                            economia_estimada: 2500,
                            complexidade: 'alta',
                            prazo_implementacao: 60,
                            impacto_operacional: 'significativo'
                        }]];
            });
        });
    };
    /**
     * Analyze product substitution opportunities
     */
    ConsumptionAnalyzer.prototype.analyzeProductSubstitution = function (products) {
        return __awaiter(this, void 0, void 0, function () {
            var expensiveProducts;
            return __generator(this, function (_a) {
                expensiveProducts = products.filter(function (p) { return p.custo_medio_unitario > 50; });
                return [2 /*return*/, expensiveProducts.slice(0, 3).map(function (product) { return ({
                        tipo: 'substituicao_produto',
                        descricao: "Avaliar substitutos para ".concat(product.nome_produto, " (R$ ").concat(product.custo_medio_unitario.toFixed(2), "/unidade)"),
                        economia_estimada: product.valor_consumido * 0.15,
                        complexidade: 'alta',
                        prazo_implementacao: 90,
                        impacto_operacional: 'significativo'
                    }); })];
            });
        });
    };
    return ConsumptionAnalyzer;
}());
exports.ConsumptionAnalyzer = ConsumptionAnalyzer;
// Export default instance
exports.consumptionAnalyzer = new ConsumptionAnalyzer();
