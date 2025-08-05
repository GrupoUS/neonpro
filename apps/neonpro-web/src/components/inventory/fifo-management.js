"use client";
"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIFOManagement = FIFOManagement;
/**
 * Story 11.3: FIFO Management Component
 * Advanced FIFO optimization and expiry management interface
 */
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var icons_1 = require("@/components/ui/icons");
var alert_1 = require("@/components/ui/alert");
var progress_1 = require("@/components/ui/progress");
var table_1 = require("@/components/ui/table");
var inventory_1 = require("@/lib/inventory");
var use_toast_1 = require("@/hooks/use-toast");
function FIFOManagement(_a) {
  var _this = this;
  var onRefresh = _a.onRefresh,
    className = _a.className;
  var _b = (0, react_1.useState)([]),
    fifoAnalysis = _b[0],
    setFifoAnalysis = _b[1];
  var _c = (0, react_1.useState)([]),
    expiryAlerts = _c[0],
    setExpiryAlerts = _c[1];
  var _d = (0, react_1.useState)(true),
    isLoading = _d[0],
    setIsLoading = _d[1];
  var _e = (0, react_1.useState)(null),
    selectedProductId = _e[0],
    setSelectedProductId = _e[1];
  var toast = (0, use_toast_1.useToast)().toast;
  var fifoManager = new inventory_1.FIFOManager();
  (0, react_1.useEffect)(function () {
    loadFIFOData();
  }, []);
  var loadFIFOData = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var _a, analysis, analysisError, _b, alerts, alertsError, error_1, errorMessage;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 3, 4, 5]);
            setIsLoading(true);
            return [4 /*yield*/, fifoManager.getFIFOAnalysis()];
          case 1:
            (_a = _c.sent()), (analysis = _a.data), (analysisError = _a.error);
            if (analysisError) {
              throw new Error(analysisError);
            }
            setFifoAnalysis(analysis || []);
            return [4 /*yield*/, fifoManager.getExpiryAlerts(30)];
          case 2:
            (_b = _c.sent()), (alerts = _b.data), (alertsError = _b.error);
            if (alertsError) {
              throw new Error(alertsError);
            }
            setExpiryAlerts(alerts || []);
            return [3 /*break*/, 5];
          case 3:
            error_1 = _c.sent();
            errorMessage =
              error_1 instanceof Error ? error_1.message : "Erro ao carregar dados FIFO";
            toast({
              title: "Erro",
              description: errorMessage,
              variant: "destructive",
            });
            return [3 /*break*/, 5];
          case 4:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleBlockExpiringBatches = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var _a, blocked, error, error_2, errorMessage;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [4 /*yield*/, fifoManager.blockExpiringBatches(0)];
          case 1:
            (_a = _b.sent()), (blocked = _a.blocked), (error = _a.error);
            if (error) {
              throw new Error(error);
            }
            toast({
              title: "Sucesso",
              description: "".concat(blocked, " lotes vencidos foram bloqueados automaticamente"),
            });
            loadFIFOData();
            onRefresh();
            return [3 /*break*/, 3];
          case 2:
            error_2 = _b.sent();
            errorMessage =
              error_2 instanceof Error ? error_2.message : "Erro ao bloquear lotes vencidos";
            toast({
              title: "Erro",
              description: errorMessage,
              variant: "destructive",
            });
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleExecuteTransfer = function (alert) {
    return __awaiter(_this, void 0, void 0, function () {
      var _a, success, error, error_3, errorMessage;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fifoManager.executeBatchTransfer({
                lote_id: alert.lote_id,
                centro_custo_origem: alert.centro_custo_principal,
                centro_custo_destino: "cc001", // Would be selected by user
                quantidade: Math.min(alert.quantidade_disponivel, 50),
                motivo: "Transfer\u00EAncia autom\u00E1tica - produto vencendo em ".concat(
                  alert.dias_para_vencer,
                  " dias",
                ),
                urgente: alert.dias_para_vencer <= 7,
              }),
            ];
          case 1:
            (_a = _b.sent()), (success = _a.success), (error = _a.error);
            if (!success) {
              throw new Error(error || "Erro ao executar transferência");
            }
            toast({
              title: "Sucesso",
              description: "Transferência executada com sucesso",
            });
            loadFIFOData();
            return [3 /*break*/, 3];
          case 2:
            error_3 = _b.sent();
            errorMessage =
              error_3 instanceof Error ? error_3.message : "Erro ao executar transferência";
            toast({
              title: "Erro",
              description: errorMessage,
              variant: "destructive",
            });
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var getPriorityColor = function (priority) {
    var colors = {
      baixa: "bg-green-100 text-green-800",
      media: "bg-yellow-100 text-yellow-800",
      alta: "bg-orange-100 text-orange-800",
      critica: "bg-red-100 text-red-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };
  var getUrgencyIcon = function (urgency) {
    switch (urgency) {
      case "critica":
        return <icons_1.Icons.AlertTriangle className="h-4 w-4 text-red-500" />;
      case "alta":
        return <icons_1.Icons.AlertCircle className="h-4 w-4 text-orange-500" />;
      case "media":
        return <icons_1.Icons.Info className="h-4 w-4 text-yellow-500" />;
      default:
        return <icons_1.Icons.CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };
  var formatCurrency = function (value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
  if (isLoading) {
    return (
      <div className={"space-y-6 ".concat(className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestão FIFO</h2>
            <p className="text-muted-foreground">Otimização e controle de vencimentos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(function (i) {
            return (
              <card_1.Card key={i}>
                <card_1.CardContent className="p-6">
                  <div className="h-48 bg-gray-200 rounded animate-pulse" />
                </card_1.CardContent>
              </card_1.Card>
            );
          })}
        </div>
      </div>
    );
  }
  var totalExpiring = expiryAlerts.length;
  var criticalAlerts = expiryAlerts.filter(function (alert) {
    return alert.prioridade === "critica";
  }).length;
  var totalWasteValue = expiryAlerts.reduce(function (sum, alert) {
    return sum + alert.valor_estimado;
  }, 0);
  var fifoComplianceScore =
    fifoAnalysis.length > 0
      ? Math.round(
          (fifoAnalysis.reduce(function (sum, analysis) {
            return sum + analysis.economia_fifo / 100;
          }, 0) /
            fifoAnalysis.length) *
            100,
        )
      : 0;
  return (
    <div className={"space-y-6 ".concat(className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão FIFO</h2>
          <p className="text-muted-foreground">Otimização de uso e controle de vencimentos</p>
        </div>
        <div className="flex gap-2">
          <button_1.Button variant="outline" onClick={loadFIFOData}>
            <icons_1.Icons.RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </button_1.Button>
          <button_1.Button
            variant="destructive"
            onClick={handleBlockExpiringBatches}
            disabled={criticalAlerts === 0}
          >
            <icons_1.Icons.Ban className="w-4 h-4 mr-2" />
            Bloquear Vencidos
          </button_1.Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
              FIFO Compliance
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{fifoComplianceScore}%</div>
            <progress_1.Progress value={fifoComplianceScore} className="mt-2" />
            <p className="text-sm text-muted-foreground mt-1">Score de conformidade</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
              Produtos Vencendo
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalExpiring}</div>
            <div className="flex items-center gap-2 mt-2">
              {criticalAlerts > 0 && (
                <badge_1.Badge variant="destructive">{criticalAlerts} críticos</badge_1.Badge>
              )}
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
              Valor em Risco
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalWasteValue)}</div>
            <p className="text-sm text-muted-foreground">Produtos próximos ao vencimento</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
              Economia FIFO
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(
                fifoAnalysis.reduce(function (sum, analysis) {
                  return sum + analysis.desperdicioEvitado;
                }, 0),
              )}
            </div>
            <p className="text-sm text-muted-foreground">Desperdício evitado</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Critical Expiry Alerts */}
      {criticalAlerts > 0 && (
        <alert_1.Alert variant="destructive">
          <icons_1.Icons.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertDescription>
            Existem {criticalAlerts} produtos com vencimento crítico que requerem ação imediata.
          </alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Expiry Alerts Table */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <icons_1.Icons.Clock className="h-5 w-5" />
            Alertas de Vencimento
          </card_1.CardTitle>
          <card_1.CardDescription>Produtos que vencem nos próximos 30 dias</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {expiryAlerts.length > 0
            ? <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Produto</table_1.TableHead>
                    <table_1.TableHead>Lote</table_1.TableHead>
                    <table_1.TableHead>Vencimento</table_1.TableHead>
                    <table_1.TableHead>Dias</table_1.TableHead>
                    <table_1.TableHead>Quantidade</table_1.TableHead>
                    <table_1.TableHead>Valor</table_1.TableHead>
                    <table_1.TableHead>Prioridade</table_1.TableHead>
                    <table_1.TableHead>Ações</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {expiryAlerts.map(function (alert) {
                    return (
                      <table_1.TableRow key={alert.id}>
                        <table_1.TableCell className="font-medium">
                          {alert.nome_produto}
                        </table_1.TableCell>
                        <table_1.TableCell>{alert.numero_lote}</table_1.TableCell>
                        <table_1.TableCell>
                          {alert.data_validade.toLocaleDateString("pt-BR")}
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div className="flex items-center gap-2">
                            {getUrgencyIcon(alert.prioridade)}
                            {alert.dias_para_vencer} dias
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>{alert.quantidade_disponivel}</table_1.TableCell>
                        <table_1.TableCell>
                          {formatCurrency(alert.valor_estimado)}
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <badge_1.Badge className={getPriorityColor(alert.prioridade)}>
                            {alert.prioridade}
                          </badge_1.Badge>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div className="flex gap-1">
                            <button_1.Button
                              size="sm"
                              variant="outline"
                              onClick={function () {
                                return handleExecuteTransfer(alert);
                              }}
                            >
                              <icons_1.Icons.ArrowUpDown className="w-3 h-3 mr-1" />
                              Transferir
                            </button_1.Button>
                            <button_1.Button size="sm" variant="outline">
                              <icons_1.Icons.Users className="w-3 h-3 mr-1" />
                              Usar
                            </button_1.Button>
                          </div>
                        </table_1.TableCell>
                      </table_1.TableRow>
                    );
                  })}
                </table_1.TableBody>
              </table_1.Table>
            : <div className="text-center py-8">
                <icons_1.Icons.CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-muted-foreground">Nenhum produto próximo ao vencimento</p>
              </div>}
        </card_1.CardContent>
      </card_1.Card>

      {/* FIFO Analysis by Product */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <icons_1.Icons.BarChart3 className="h-5 w-5" />
            Análise FIFO por Produto
          </card_1.CardTitle>
          <card_1.CardDescription>
            Análise detalhada de otimização FIFO por produto
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {fifoAnalysis.length > 0
            ? <div className="space-y-6">
                {fifoAnalysis.slice(0, 5).map(function (analysis) {
                  return (
                    <div key={analysis.produto_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">{analysis.nome_produto}</h3>
                        <div className="flex gap-2">
                          <badge_1.Badge variant="outline">
                            {analysis.lotes_disponiveis.length} lotes
                          </badge_1.Badge>
                          <badge_1.Badge variant="secondary">
                            {formatCurrency(analysis.economia_fifo)} economia
                          </badge_1.Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">
                            {analysis.lotes_priorizados.length}
                          </div>
                          <p className="text-sm text-muted-foreground">Lotes Priorizados</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-orange-600">
                            {analysis.lotes_vencendo.length}
                          </div>
                          <p className="text-sm text-muted-foreground">Vencendo Logo</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">
                            {formatCurrency(analysis.desperdicioEvitado)}
                          </div>
                          <p className="text-sm text-muted-foreground">Desperdício Evitado</p>
                        </div>
                      </div>

                      {/* Recommendations */}
                      {analysis.recomendacoes.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Recomendações:</h4>
                          {analysis.recomendacoes.slice(0, 3).map(function (rec, index) {
                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  {getUrgencyIcon(rec.urgencia)}
                                  <span>{rec.acao_recomendada}</span>
                                </div>
                                <badge_1.Badge variant="outline">
                                  {formatCurrency(rec.impacto_financeiro)}
                                </badge_1.Badge>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {fifoAnalysis.length > 5 && (
                  <div className="text-center">
                    <button_1.Button variant="outline">
                      Ver Todos os Produtos ({fifoAnalysis.length})
                    </button_1.Button>
                  </div>
                )}
              </div>
            : <div className="text-center py-8">
                <icons_1.Icons.Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma análise FIFO disponível</p>
              </div>}
        </card_1.CardContent>
      </card_1.Card>

      {/* FIFO Configuration Quick Settings */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <icons_1.Icons.Settings className="h-5 w-5" />
            Configurações FIFO
          </card_1.CardTitle>
          <card_1.CardDescription>Configurações rápidas de otimização FIFO</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Alertas de Vencimento</span>
                <badge_1.Badge variant="secondary">30 dias</badge_1.Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bloqueio Automático</span>
                <badge_1.Badge variant="secondary">7 dias</badge_1.Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Priorização Automática</span>
                <badge_1.Badge variant="secondary">Ativada</badge_1.Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Transferências Sugeridas</span>
                <badge_1.Badge variant="secondary">Ativadas</badge_1.Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Override FIFO</span>
                <badge_1.Badge variant="outline">Restrito</badge_1.Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Justificativa Obrigatória</span>
                <badge_1.Badge variant="secondary">Sim</badge_1.Badge>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button_1.Button variant="outline">
              <icons_1.Icons.Settings className="w-4 h-4 mr-2" />
              Configurar FIFO
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
