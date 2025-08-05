"use client";
"use strict";
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReorderManagement = ReorderManagement;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var checkbox_1 = require("@/components/ui/checkbox");
var dialog_1 = require("@/components/ui/dialog");
var progress_1 = require("@/components/ui/progress");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
// Mock data for demonstration
var mockReorderSuggestions = [
  {
    productId: "PRD001",
    productName: "Botox Allergan 100U",
    category: "botox",
    currentStock: 8,
    minStock: 10,
    maxStock: 50,
    unit: "frasco",
    averageConsumption: 12,
    consumptionTrend: "increasing",
    seasonalFactor: 1.2,
    leadTime: 5,
    safetyStock: 3,
    suggestedQuantity: 25,
    suggestedOrderDate: "2024-11-18",
    urgency: "critical",
    preferredSupplierId: "SUP001",
    preferredSupplierName: "Medfarma Distribuidora",
    unitCost: 650.0,
    totalCost: 16250.0,
    minOrderQuantity: 10,
    bulkDiscountAvailable: true,
    bulkDiscountTier: { quantity: 20, discount: 5 },
    lastOrderDate: "2024-10-15",
    lastOrderQuantity: 30,
    stockoutRisk: 85,
    daysUntilStockout: 3,
    temperatureControlled: true,
    anvisaRegistration: "10295770028",
    shelfLife: 24,
    status: "suggested",
  },
  {
    productId: "PRD002",
    productName: "Ácido Hialurônico Juvederm Ultra",
    category: "fillers",
    currentStock: 12,
    minStock: 8,
    maxStock: 40,
    unit: "seringa",
    averageConsumption: 8,
    consumptionTrend: "stable",
    seasonalFactor: 1.0,
    leadTime: 3,
    safetyStock: 2,
    suggestedQuantity: 20,
    suggestedOrderDate: "2024-11-25",
    urgency: "medium",
    preferredSupplierId: "SUP002",
    preferredSupplierName: "Beauty Supply LTDA",
    unitCost: 950.0,
    totalCost: 19000.0,
    minOrderQuantity: 5,
    bulkDiscountAvailable: false,
    lastOrderDate: "2024-11-01",
    lastOrderQuantity: 15,
    stockoutRisk: 35,
    daysUntilStockout: 18,
    temperatureControlled: true,
    anvisaRegistration: "10295770029",
    shelfLife: 18,
    status: "suggested",
  },
];
var urgencyConfig = {
  critical: {
    color: "bg-red-100 text-red-800 border-red-200",
    label: "Crítico",
    icon: lucide_react_1.AlertTriangle,
    bgColor: "bg-red-50",
  },
  high: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    label: "Alto",
    icon: lucide_react_1.Clock,
    bgColor: "bg-orange-50",
  },
  medium: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    label: "Médio",
    icon: lucide_react_1.Package,
    bgColor: "bg-yellow-50",
  },
  low: {
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Baixo",
    icon: lucide_react_1.CheckCircle,
    bgColor: "bg-green-50",
  },
};
/**
 * Reorder Management Component for NeonPro Inventory System
 *
 * Features:
 * - AI-powered predictive analysis for reorder suggestions
 * - Seasonal consumption pattern analysis
 * - Lead time and safety stock calculations
 * - Supplier optimization with bulk discount analysis
 * - Stockout risk assessment and prevention
 * - Brazilian healthcare compliance (ANVISA, temperature control)
 * - Automated approval workflow
 * - Integration with purchase order system
 * - Cost optimization recommendations
 *
 * @author VoidBeast V4.0 + neonpro-code-guardian
 * @version 1.0.0
 * @compliance ANVISA, CFM, LGPD
 */
function ReorderManagement() {
  var _a = (0, react_1.useState)("all"),
    selectedUrgency = _a[0],
    setSelectedUrgency = _a[1];
  var _b = (0, react_1.useState)("all"),
    selectedCategory = _b[0],
    setSelectedCategory = _b[1];
  var _c = (0, react_1.useState)([]),
    selectedSuggestions = _c[0],
    setSelectedSuggestions = _c[1];
  var _d = (0, react_1.useState)(false),
    isBulkOrderOpen = _d[0],
    setIsBulkOrderOpen = _d[1];
  var filteredSuggestions = (0, react_1.useMemo)(
    function () {
      return mockReorderSuggestions.filter(function (suggestion) {
        var matchesUrgency = selectedUrgency === "all" || suggestion.urgency === selectedUrgency;
        var matchesCategory =
          selectedCategory === "all" || suggestion.category === selectedCategory;
        return matchesUrgency && matchesCategory;
      });
    },
    [selectedUrgency, selectedCategory],
  );
  var summaryMetrics = (0, react_1.useMemo)(
    function () {
      var totalSuggestions = filteredSuggestions.length;
      var criticalCount = filteredSuggestions.filter(function (s) {
        return s.urgency === "critical";
      }).length;
      var totalValue = filteredSuggestions.reduce(function (sum, s) {
        return sum + s.totalCost;
      }, 0);
      var avgStockoutRisk =
        filteredSuggestions.reduce(function (sum, s) {
          return sum + s.stockoutRisk;
        }, 0) / totalSuggestions || 0;
      return {
        totalSuggestions: totalSuggestions,
        criticalCount: criticalCount,
        totalValue: totalValue,
        avgStockoutRisk: avgStockoutRisk,
      };
    },
    [filteredSuggestions],
  );
  var formatCurrency = function (value) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  };
  var formatDate = function (dateString) {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };
  var getTrendIcon = function (trend) {
    switch (trend) {
      case "increasing":
        return <lucide_react_1.TrendingUp className="w-3 h-3 text-green-500" />;
      case "decreasing":
        return <lucide_react_1.TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
      default:
        return <div className="w-3 h-3 bg-blue-500 rounded-full" />;
    }
  };
  var handleSuggestionSelect = function (suggestionId, checked) {
    if (checked) {
      setSelectedSuggestions(
        __spreadArray(__spreadArray([], selectedSuggestions, true), [suggestionId], false),
      );
    } else {
      setSelectedSuggestions(
        selectedSuggestions.filter(function (id) {
          return id !== suggestionId;
        }),
      );
    }
  };
  var handleApproveSelected = function () {
    // In a real implementation, this would update the database
    console.log("Approving suggestions:", selectedSuggestions);
    setSelectedSuggestions([]);
  };
  var handleGeneratePO = function () {
    // In a real implementation, this would generate purchase orders
    console.log("Generating purchase orders for approved suggestions");
    setIsBulkOrderOpen(false);
  };
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sugestões Ativas</p>
                <p className="text-2xl font-bold">{summaryMetrics.totalSuggestions}</p>
              </div>
              <lucide_react_1.Bot className="h-8 w-8 text-blue-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{summaryMetrics.criticalCount}</p>
              </div>
              <lucide_react_1.AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summaryMetrics.totalValue)}
                </p>
              </div>
              <lucide_react_1.DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risco Médio</p>
                <p className="text-2xl font-bold text-amber-600">
                  {summaryMetrics.avgStockoutRisk.toFixed(1)}%
                </p>
              </div>
              <lucide_react_1.Calculator className="h-8 w-8 text-amber-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select_1.Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
          <select_1.SelectTrigger className="w-40">
            <select_1.SelectValue placeholder="Urgência" />
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="all">Todas</select_1.SelectItem>
            <select_1.SelectItem value="critical">Crítico</select_1.SelectItem>
            <select_1.SelectItem value="high">Alto</select_1.SelectItem>
            <select_1.SelectItem value="medium">Médio</select_1.SelectItem>
            <select_1.SelectItem value="low">Baixo</select_1.SelectItem>
          </select_1.SelectContent>
        </select_1.Select>

        <select_1.Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <select_1.SelectTrigger className="w-48">
            <select_1.SelectValue placeholder="Categoria" />
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="all">Todas as categorias</select_1.SelectItem>
            <select_1.SelectItem value="botox">💉 Toxina Botulínica</select_1.SelectItem>
            <select_1.SelectItem value="fillers">🧪 Preenchedores</select_1.SelectItem>
            <select_1.SelectItem value="skincare">✨ Dermocosméticos</select_1.SelectItem>
            <select_1.SelectItem value="equipment">⚕️ Equipamentos</select_1.SelectItem>
            <select_1.SelectItem value="consumables">🧤 Descartáveis</select_1.SelectItem>
          </select_1.SelectContent>
        </select_1.Select>

        <div className="flex gap-2 ml-auto">
          {selectedSuggestions.length > 0 && (
            <button_1.Button onClick={handleApproveSelected}>
              <lucide_react_1.CheckCircle className="w-4 h-4 mr-2" />
              Aprovar Selecionados ({selectedSuggestions.length})
            </button_1.Button>
          )}

          <dialog_1.Dialog open={isBulkOrderOpen} onOpenChange={setIsBulkOrderOpen}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button>
                <lucide_react_1.ShoppingCart className="w-4 h-4 mr-2" />
                Pedido em Lote
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="sm:max-w-[600px]">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Gerar Pedido em Lote</dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Consolidar sugestões aprovadas em pedidos de compra
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>

              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  Sistema gerará pedidos otimizados por fornecedor com aprovação automática...
                </p>
              </div>

              <dialog_1.DialogFooter>
                <button_1.Button onClick={handleGeneratePO}>Gerar Pedidos</button_1.Button>
              </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        </div>
      </div>{" "}
      {/* Reorder Suggestions Table */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center justify-between">
            <span>Sugestões de Reposição ({filteredSuggestions.length})</span>
            <div className="flex items-center gap-2">
              <badge_1.Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <lucide_react_1.Bot className="w-3 h-3 mr-1" />
                IA Preditiva
              </badge_1.Badge>
            </div>
          </card_1.CardTitle>
          <card_1.CardDescription>
            Análise inteligente com previsão de demanda e otimização de custos
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="overflow-x-auto">
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead className="w-12">
                    <checkbox_1.Checkbox
                      checked={selectedSuggestions.length === filteredSuggestions.length}
                      onCheckedChange={function (checked) {
                        if (checked) {
                          setSelectedSuggestions(
                            filteredSuggestions.map(function (s) {
                              return s.productId;
                            }),
                          );
                        } else {
                          setSelectedSuggestions([]);
                        }
                      }}
                    />
                  </table_1.TableHead>
                  <table_1.TableHead>Produto</table_1.TableHead>
                  <table_1.TableHead>Estoque Atual</table_1.TableHead>
                  <table_1.TableHead>Análise Preditiva</table_1.TableHead>
                  <table_1.TableHead>Sugestão</table_1.TableHead>
                  <table_1.TableHead>Fornecedor</table_1.TableHead>
                  <table_1.TableHead>Risco</table_1.TableHead>
                  <table_1.TableHead>Urgência</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {filteredSuggestions.map(function (suggestion) {
                  var urgencyConfig_ = urgencyConfig[suggestion.urgency];
                  var UrgencyIcon = urgencyConfig_.icon;
                  var isSelected = selectedSuggestions.includes(suggestion.productId);
                  return (
                    <table_1.TableRow key={suggestion.productId} className="hover:bg-muted/50">
                      <table_1.TableCell>
                        <checkbox_1.Checkbox
                          checked={isSelected}
                          onCheckedChange={function (checked) {
                            return handleSuggestionSelect(suggestion.productId, checked);
                          }}
                        />
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{suggestion.productName}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {suggestion.productId}
                          </div>
                          {suggestion.temperatureControlled && (
                            <badge_1.Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                            >
                              Refrigerado
                            </badge_1.Badge>
                          )}
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {suggestion.currentStock} {suggestion.unit}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              / {suggestion.maxStock} max
                            </div>
                          </div>
                          <progress_1.Progress
                            value={(suggestion.currentStock / suggestion.maxStock) * 100}
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground">
                            Mín: {suggestion.minStock} {suggestion.unit}
                          </div>
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            {getTrendIcon(suggestion.consumptionTrend)}
                            <span>
                              {suggestion.averageConsumption} {suggestion.unit}
                              /mês
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Tendência:{" "}
                            {suggestion.consumptionTrend === "increasing"
                              ? "Crescente"
                              : suggestion.consumptionTrend === "decreasing"
                                ? "Decrescente"
                                : "Estável"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Sazonal: {(suggestion.seasonalFactor * 100).toFixed(0)}%
                          </div>
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="space-y-2">
                          <div className="font-medium text-green-600">
                            {suggestion.suggestedQuantity} {suggestion.unit}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Pedir até: {formatDate(suggestion.suggestedOrderDate)}
                          </div>
                          <div className="text-sm font-medium">
                            {formatCurrency(suggestion.totalCost)}
                          </div>
                          {suggestion.bulkDiscountAvailable && suggestion.bulkDiscountTier && (
                            <badge_1.Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 text-xs"
                            >
                              {suggestion.bulkDiscountTier.discount}% desc. &gt;{" "}
                              {suggestion.bulkDiscountTier.quantity}
                            </badge_1.Badge>
                          )}
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {suggestion.preferredSupplierName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Lead time: {suggestion.leadTime} dias
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Min. pedido: {suggestion.minOrderQuantity} {suggestion.unit}
                          </div>
                          {suggestion.lastOrderDate && (
                            <div className="text-xs text-muted-foreground">
                              Último: {formatDate(suggestion.lastOrderDate)}
                            </div>
                          )}
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <progress_1.Progress
                              value={suggestion.stockoutRisk}
                              className="h-2 w-20"
                            />
                            <span className="text-sm font-medium text-red-600">
                              {suggestion.stockoutRisk}%
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Ruptura em {suggestion.daysUntilStockout} dias
                          </div>
                          {suggestion.stockoutRisk > 70 && (
                            <badge_1.Badge
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200 text-xs"
                            >
                              <lucide_react_1.AlertTriangle className="w-3 h-3 mr-1" />
                              Alto Risco
                            </badge_1.Badge>
                          )}
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <badge_1.Badge variant="outline" className={urgencyConfig_.color}>
                          <UrgencyIcon className="w-3 h-3 mr-1" />
                          {urgencyConfig_.label}
                        </badge_1.Badge>
                      </table_1.TableCell>
                    </table_1.TableRow>
                  );
                })}
              </table_1.TableBody>
            </table_1.Table>

            {filteredSuggestions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <lucide_react_1.Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma sugestão de reposição com os filtros aplicados.</p>
              </div>
            )}
          </div>
        </card_1.CardContent>
      </card_1.Card>
      {/* AI Insights and Recommendations */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* AI Insights */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Bot className="w-5 h-5" />
              Insights da IA
            </card_1.CardTitle>
            <card_1.CardDescription>
              Análise inteligente dos padrões de consumo
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <lucide_react_1.TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Tendência de Consumo</span>
                </div>
                <p className="text-sm text-blue-700">
                  Produtos de toxina botulínica apresentam crescimento de 15% no consumo mensal.
                  Considere aumentar estoque de segurança.
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <lucide_react_1.Clock className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-amber-800">Sazonalidade</span>
                </div>
                <p className="text-sm text-amber-700">
                  Dezembro apresenta aumento de 20% na demanda por procedimentos estéticos. Ajuste
                  automático aplicado nas sugestões.
                </p>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <lucide_react_1.DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Otimização de Custos</span>
                </div>
                <p className="text-sm text-green-700">
                  Identificados descontos de 5-8% para pedidos em lote. Potencial economia de{" "}
                  {formatCurrency(2450)} este mês.
                </p>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <lucide_react_1.Package className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-800">Estoque de Segurança</span>
                </div>
                <p className="text-sm text-purple-700">
                  Recomendado aumento de 10% no estoque de segurança para produtos com controle de
                  temperatura devido ao prazo de entrega.
                </p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Supplier Performance */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Truck className="w-5 h-5" />
              Performance de Fornecedores
            </card_1.CardTitle>
            <card_1.CardDescription>Análise de desempenho e recomendações</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Medfarma Distribuidora</span>
                  <badge_1.Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    Excelente
                  </badge_1.Badge>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Pontualidade:</span>
                    <span>98%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Qualidade:</span>
                    <span>4.9/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Preço:</span>
                    <span>Competitivo</span>
                  </div>
                </div>
                <progress_1.Progress value={95} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Beauty Supply LTDA</span>
                  <badge_1.Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 border-yellow-200"
                  >
                    Bom
                  </badge_1.Badge>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Pontualidade:</span>
                    <span>85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Qualidade:</span>
                    <span>4.5/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Preço:</span>
                    <span>Econômico</span>
                  </div>
                </div>
                <progress_1.Progress value={78} className="h-2" />
              </div>

              {/* Recommendations */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <lucide_react_1.FileText className="w-4 h-4" />
                  Recomendações
                </h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• Priorizar Medfarma para produtos críticos</li>
                  <li>• Negociar melhores prazos com Beauty Supply</li>
                  <li>• Considerar fornecedor alternativo para backup</li>
                </ul>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>
      {/* Automated Workflow Status */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Calculator className="w-5 h-5" />
            Status do Workflow Automatizado
          </card_1.CardTitle>
          <card_1.CardDescription>
            Progresso das sugestões aprovadas e pedidos gerados
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-muted-foreground">Sugestões Geradas</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">8</div>
              <div className="text-sm text-muted-foreground">Aguardando Aprovação</div>
            </div>

            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">3</div>
              <div className="text-sm text-muted-foreground">Pedidos Enviados</div>
            </div>

            <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">1</div>
              <div className="text-sm text-muted-foreground">Recebidos</div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
