/**
 * Story 11.3: Stock Output Management System
 * Sistema completo de controle de saídas e consumo de materiais
 * Integrates with AI-driven forecasting and automated FIFO management
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockOutputManager = exports.StockOutputManager = void 0;
/**
 * Stock Output Management Class
 * Core logic for managing all stock outputs with FIFO and consumption tracking
 */
var StockOutputManager = /** @class */ (() => {
  function StockOutputManager() {
    this.supabase = createClient(ComponentClient());
  }
  /**
   * Create stock output with automatic FIFO batch selection
   */
  StockOutputManager.prototype.createStockOutput = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var stockValidation,
        itemsWithFIFO,
        totals,
        requiresApproval,
        outputNumber,
        _a,
        output_1,
        outputError,
        itemsData,
        _b,
        items,
        itemsError,
        error_1;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 10, , 11]);
            return [4 /*yield*/, this.validateStockAvailabilityWithFIFO(data.itens)];
          case 1:
            stockValidation = _c.sent();
            if (!stockValidation.available) {
              return [
                2 /*return*/,
                {
                  data: null,
                  error: "Estoque insuficiente: ".concat(
                    stockValidation.unavailableItems.join(", "),
                  ),
                },
              ];
            }
            return [4 /*yield*/, this.applyFIFOSelection(data.itens)];
          case 2:
            itemsWithFIFO = _c.sent();
            totals = this.calculateOutputTotals(itemsWithFIFO);
            return [
              4 /*yield*/,
              this.checkApprovalRequirement(
                data.centro_custo_id,
                totals.valor_total,
                data.tipo_saida,
              ),
            ];
          case 3:
            requiresApproval = _c.sent();
            return [4 /*yield*/, this.generateOutputNumber()];
          case 4:
            outputNumber = _c.sent();
            return [
              4 /*yield*/,
              this.supabase
                .from("saidas_estoque")
                .insert({
                  numero_saida: outputNumber,
                  tipo_saida: data.tipo_saida,
                  centro_custo_id: data.centro_custo_id,
                  profissional_id: data.profissional_id,
                  procedimento_id: data.procedimento_id,
                  agendamento_id: data.agendamento_id,
                  quantidade_total: totals.quantidade,
                  valor_total: totals.valor,
                  custo_total: totals.custo,
                  motivo_saida: data.motivo_saida,
                  observacoes: data.observacoes,
                  automatico: data.automatico || false,
                  requer_aprovacao: requiresApproval,
                  aprovado: !requiresApproval,
                  status: requiresApproval ? "registrada" : "aprovada",
                })
                .select()
                .single(),
            ];
          case 5:
            (_a = _c.sent()), (output_1 = _a.data), (outputError = _a.error);
            if (outputError) throw outputError;
            itemsData = itemsWithFIFO.map((item) => ({
              saida_id: output_1.id,
              produto_id: item.produto_id,
              lote_id: item.lote_id,
              quantidade: item.quantidade,
              custo_unitario: item.custo_unitario,
              localizacao_origem: item.localizacao_origem,
              ordem_fifo: item.ordem_fifo,
              selecionado_automaticamente: item.automatico,
              motivo_item: item.motivo_item,
            }));
            return [
              4 /*yield*/,
              this.supabase.from("itens_saida_estoque").insert(itemsData).select(),
            ];
          case 6:
            (_b = _c.sent()), (items = _b.data), (itemsError = _b.error);
            if (itemsError) throw itemsError;
            if (requiresApproval) return [3 /*break*/, 8];
            return [4 /*yield*/, this.updateBatchQuantities(items)];
          case 7:
            _c.sent();
            _c.label = 8;
          case 8:
            // 9. Log consumption analytics
            return [4 /*yield*/, this.logConsumptionAnalytics(output_1, items)];
          case 9:
            // 9. Log consumption analytics
            _c.sent();
            return [
              2 /*return*/,
              {
                data: __assign(__assign({}, output_1), { itens: items }),
                error: null,
              },
            ];
          case 10:
            error_1 = _c.sent();
            console.error("Error creating stock output:", error_1);
            return [
              2 /*return*/,
              {
                data: null,
                error: "Erro ao processar saída de estoque",
              },
            ];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Automatic procedure material deduction
   */
  StockOutputManager.prototype.processAutomaticProcedureDeduction = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var standardMaterials, materialsForDeduction, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("procedimentos_materiais")
                .select(
                  "\n          *,\n          produto:produtos_estoque(nome, codigo_interno, categoria)\n        ",
                )
                .eq("procedimento_id", data.procedimento_id)
                .eq("ativo", true),
            ];
          case 1:
            standardMaterials = _a.sent().data;
            if (!standardMaterials || standardMaterials.length === 0) {
              return [
                2 /*return*/,
                {
                  data: null,
                  error: "Nenhum material padrão configurado para este procedimento",
                },
              ];
            }
            materialsForDeduction = this.applyManualAdjustments(
              standardMaterials,
              data.ajustes_manuais || [],
            );
            return [
              4 /*yield*/,
              this.createStockOutput({
                tipo_saida: "procedimento",
                centro_custo_id: data.centro_custo_id,
                profissional_id: data.profissional_id,
                procedimento_id: data.procedimento_id,
                agendamento_id: data.agendamento_id,
                itens: materialsForDeduction.map((material) => ({
                  produto_id: material.produto_id,
                  quantidade: material.quantidade_padrao,
                  localizacao_origem: "estoque_principal",
                })),
                motivo_saida: "Baixa autom\u00E1tica - Procedimento realizado",
                automatico: true,
              }),
            ];
          case 2:
            // 3. Create automatic stock output
            return [2 /*return*/, _a.sent()];
          case 3:
            error_2 = _a.sent();
            console.error("Error processing automatic procedure deduction:", error_2);
            return [
              2 /*return*/,
              {
                data: null,
                error: "Erro ao processar baixa automática do procedimento",
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * FIFO batch selection algorithm
   */
  StockOutputManager.prototype.applyFIFOSelection = function (items) {
    return __awaiter(this, void 0, void 0, function () {
      var result,
        _i,
        items_1,
        item,
        availableBatches,
        remainingQuantity,
        fifoOrder,
        _a,
        availableBatches_1,
        batch,
        quantityToTake,
        latestEntry;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            result = [];
            (_i = 0), (items_1 = items);
            _b.label = 1;
          case 1:
            if (!(_i < items_1.length)) return [3 /*break*/, 8];
            item = items_1[_i];
            return [
              4 /*yield*/,
              this.supabase
                .from("lotes_estoque")
                .select("*")
                .eq("produto_id", item.produto_id)
                .eq("status", "disponivel")
                .gt("quantidade_disponivel", 0)
                .eq("bloqueado", false)
                .order("data_validade", { ascending: true })
                .order("prioridade_uso", { ascending: true }),
            ];
          case 2:
            availableBatches = _b.sent().data;
            if (!availableBatches || availableBatches.length === 0) {
              throw new Error(
                "Nenhum lote dispon\u00EDvel para o produto ".concat(item.produto_id),
              );
            }
            remainingQuantity = item.quantidade;
            fifoOrder = 1;
            (_a = 0), (availableBatches_1 = availableBatches);
            _b.label = 3;
          case 3:
            if (!(_a < availableBatches_1.length)) return [3 /*break*/, 6];
            batch = availableBatches_1[_a];
            if (remainingQuantity <= 0) return [3 /*break*/, 6];
            quantityToTake = Math.min(remainingQuantity, batch.quantidade_disponivel);
            return [
              4 /*yield*/,
              this.supabase
                .from("itens_entrada_estoque")
                .select("custo_unitario")
                .eq("lote_id", batch.id)
                .order("criado_em", { ascending: false })
                .limit(1)
                .single(),
            ];
          case 4:
            latestEntry = _b.sent().data;
            result.push({
              produto_id: item.produto_id,
              lote_id: batch.id,
              quantidade: quantityToTake,
              custo_unitario:
                (latestEntry === null || latestEntry === void 0
                  ? void 0
                  : latestEntry.custo_unitario) || 0,
              localizacao_origem: item.localizacao_origem,
              ordem_fifo: fifoOrder++,
              automatico: true,
              numero_lote: batch.numero_lote,
              data_validade: new Date(batch.data_validade),
            });
            remainingQuantity -= quantityToTake;
            _b.label = 5;
          case 5:
            _a++;
            return [3 /*break*/, 3];
          case 6:
            if (remainingQuantity > 0) {
              throw new Error(
                "Quantidade insuficiente em estoque para o produto ".concat(item.produto_id),
              );
            }
            _b.label = 7;
          case 7:
            _i++;
            return [3 /*break*/, 1];
          case 8:
            return [2 /*return*/, result];
        }
      });
    });
  };
  /**
   * Validate stock availability with FIFO consideration
   */
  StockOutputManager.prototype.validateStockAvailabilityWithFIFO = function (items) {
    return __awaiter(this, void 0, void 0, function () {
      var unavailableItems, recommendations, _loop_1, this_1, _i, items_2, item;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            unavailableItems = [];
            recommendations = [];
            _loop_1 = function (item) {
              var batchSummary, totalAvailable, sortedBatches;
              return __generator(this, (_b) => {
                switch (_b.label) {
                  case 0:
                    return [
                      4 /*yield*/,
                      this_1.supabase
                        .from("lotes_estoque")
                        .select(
                          "quantidade_disponivel, numero_lote, data_validade, dias_para_vencer, prioridade_uso, id",
                        )
                        .eq("produto_id", item.produto_id)
                        .eq("status", "disponivel")
                        .eq("bloqueado", false)
                        .gt("quantidade_disponivel", 0),
                    ];
                  case 1:
                    batchSummary = _b.sent().data;
                    totalAvailable =
                      (batchSummary === null || batchSummary === void 0
                        ? void 0
                        : batchSummary.reduce(
                            (sum, batch) => sum + batch.quantidade_disponivel,
                            0,
                          )) || 0;
                    if (totalAvailable < item.quantidade) {
                      unavailableItems.push(item.produto_id);
                    } else {
                      sortedBatches =
                        batchSummary === null || batchSummary === void 0
                          ? void 0
                          : batchSummary
                              .sort((a, b) => {
                                // FIFO logic: expiry date first, then priority
                                if (a.data_validade && b.data_validade) {
                                  return (
                                    new Date(a.data_validade).getTime() -
                                    new Date(b.data_validade).getTime()
                                  );
                                }
                                return a.prioridade_uso - b.prioridade_uso;
                              })
                              .slice(0, 3);
                      recommendations.push.apply(
                        // Top 3 recommendations
                        recommendations,
                        sortedBatches.map((batch) => ({
                          lote_id: batch.id,
                          produto_id: item.produto_id,
                          numero_lote: batch.numero_lote,
                          quantidade_disponivel: batch.quantidade_disponivel,
                          data_validade: new Date(batch.data_validade),
                          dias_para_vencer: batch.dias_para_vencer,
                          prioridade_uso: batch.prioridade_uso,
                          recomendado: batch.dias_para_vencer <= 30,
                          motivo_recomendacao:
                            batch.dias_para_vencer <= 30
                              ? "Próximo ao vencimento"
                              : "FIFO otimizado",
                        })),
                      );
                    }
                    return [2 /*return*/];
                }
              });
            };
            this_1 = this;
            (_i = 0), (items_2 = items);
            _a.label = 1;
          case 1:
            if (!(_i < items_2.length)) return [3 /*break*/, 4];
            item = items_2[_i];
            return [5 /*yield**/, _loop_1(item)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [
              2 /*return*/,
              {
                available: unavailableItems.length === 0,
                unavailableItems: unavailableItems,
                recommendations: recommendations,
              },
            ];
        }
      });
    });
  };
  /**
   * Update batch quantities after output
   */
  StockOutputManager.prototype.updateBatchQuantities = function (items) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, items_3, item;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            (_i = 0), (items_3 = items);
            _a.label = 1;
          case 1:
            if (!(_i < items_3.length)) return [3 /*break*/, 4];
            item = items_3[_i];
            return [
              4 /*yield*/,
              this.supabase.rpc("update_batch_quantity_after_output", {
                p_lote_id: item.lote_id,
                p_quantidade_saida: item.quantidade,
              }),
            ];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check if output requires approval
   */
  StockOutputManager.prototype.checkApprovalRequirement = function (
    centroCustoId,
    valorTotal,
    tipoSaida,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var costCenter;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("centros_custo")
                .select("requer_aprovacao_saida, limite_valor_saida")
                .eq("id", centroCustoId)
                .single(),
            ];
          case 1:
            costCenter = _a.sent().data;
            if (!costCenter) return [2 /*return*/, false];
            // Always require approval for losses and adjustments
            if (["perda", "ajuste", "vencimento"].includes(tipoSaida)) {
              return [2 /*return*/, true];
            }
            // Check value limits
            if (costCenter.limite_valor_saida && valorTotal > costCenter.limite_valor_saida) {
              return [2 /*return*/, true];
            }
            return [2 /*return*/, costCenter.requer_aprovacao_saida];
        }
      });
    });
  };
  /**
   * Generate unique output number
   */
  StockOutputManager.prototype.generateOutputNumber = function () {
    return __awaiter(this, void 0, void 0, function () {
      var today, datePrefix, count, sequentialNumber;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            today = new Date();
            datePrefix = today.toISOString().slice(0, 10).replace(/-/g, "");
            return [
              4 /*yield*/,
              this.supabase
                .from("saidas_estoque")
                .select("*", { count: "exact", head: true })
                .like("numero_saida", "SAI-".concat(datePrefix, "%")),
            ];
          case 1:
            count = _a.sent().count;
            sequentialNumber = String((count || 0) + 1).padStart(4, "0");
            return [2 /*return*/, "SAI-".concat(datePrefix, "-").concat(sequentialNumber)];
        }
      });
    });
  };
  /**
   * Calculate output totals
   */
  StockOutputManager.prototype.calculateOutputTotals = (items) =>
    items.reduce(
      (totals, item) => ({
        quantidade: totals.quantidade + item.quantidade,
        valor: totals.valor + item.quantidade * item.custo_unitario,
        custo: totals.custo + item.quantidade * item.custo_unitario,
      }),
      { quantidade: 0, valor: 0, custo: 0 },
    );
  /**
   * Apply manual adjustments to standard materials
   */
  StockOutputManager.prototype.applyManualAdjustments = (standardMaterials, adjustments) =>
    standardMaterials.map((material) => {
      var adjustment = adjustments.find((adj) => adj.produto_id === material.produto_id);
      return __assign(__assign({}, material), {
        quantidade_padrao:
          (adjustment === null || adjustment === void 0
            ? void 0
            : adjustment.quantidade_ajustada) || material.quantidade_padrao,
      });
    });
  /**
   * Log consumption analytics for ML and reporting
   */
  StockOutputManager.prototype.logConsumptionAnalytics = function (output, items) {
    return __awaiter(this, void 0, void 0, function () {
      var analyticsData, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            analyticsData = {
              saida_id: output.id,
              data_saida: output.data_saida,
              centro_custo_id: output.centro_custo_id,
              profissional_id: output.profissional_id,
              tipo_saida: output.tipo_saida,
              valor_total: output.valor_total,
              itens_consumidos: items.length,
              automatico: output.automatico,
            };
            // Store for future analytics processing
            return [4 /*yield*/, this.supabase.from("logs_consumo").insert(analyticsData)];
          case 1:
            // Store for future analytics processing
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_3 = _a.sent();
            console.error("Error logging consumption analytics:", error_3);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get consumption analysis for period
   */
  StockOutputManager.prototype.getConsumptionAnalysis = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var analysisData, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.calculateConsumptionMetrics(params)];
          case 1:
            analysisData = _a.sent();
            return [
              2 /*return*/,
              {
                data: analysisData,
                error: null,
              },
            ];
          case 2:
            error_4 = _a.sent();
            console.error("Error getting consumption analysis:", error_4);
            return [
              2 /*return*/,
              {
                data: null,
                error: "Erro ao gerar análise de consumo",
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate consumption metrics (placeholder for complex logic)
   */
  StockOutputManager.prototype.calculateConsumptionMetrics = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // This would contain complex SQL aggregations and calculations
        // Returning a mock structure for now
        return [
          2 /*return*/,
          {
            periodo: { inicio: params.dataInicio, fim: params.dataFim },
            total_saidas: 0,
            valor_total_consumido: 0,
            numero_produtos_diferentes: 0,
            numero_procedimentos: 0,
            produtos_mais_consumidos: [],
            produtos_maior_custo: [],
            produtos_maior_desperdicio: [],
            eficiencia_uso: 85,
            desperdicio_percentual: 5,
            economia_fifo: 12,
            variacao_periodo_anterior: 8,
            ranking_profissionais: [],
            ranking_centros_custo: [],
            previsao_demanda: [],
            recomendacoes_otimizacao: [],
            alertas_consumo_anormal: [],
            produtos_desperdicio_alto: [],
          },
        ];
      });
    });
  };
  return StockOutputManager;
})();
exports.StockOutputManager = StockOutputManager;
// Export default instance
exports.stockOutputManager = new StockOutputManager();
