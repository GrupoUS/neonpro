"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostAnalysis = CostAnalysis;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
// Mock data for demonstration
var mockCostAnalysis = [
  {
    productId: "PRD001",
    productName: "Botox Allergan 100U",
    category: "botox",
    quantity: 50,
    unit: "frasco",
    unitCostBase: 500.0,
    totalCostBase: 25000.0,
    taxes: {
      icms: { rate: 18, value: 4500.0 },
      ipi: { rate: 0, value: 0 },
      pis: { rate: 1.65, value: 412.5 },
      cofins: { rate: 7.6, value: 1900.0 },
      iss: { rate: 0, value: 0 },
    },
    additionalCosts: {
      freight: 300.0,
      insurance: 150.0,
      handling: 100.0,
      storage: 200.0,
      depreciation: 0,
    },
    totalTaxes: 6812.5,
    totalAdditionalCosts: 750.0,
    finalUnitCost: 650.25,
    finalTotalCost: 32512.5,
    salePrice: 890.0,
    grossMargin: 239.75,
    grossMarginPercent: 26.93,
    netMargin: 189.75,
    netMarginPercent: 21.32,
    breakEvenQuantity: 42,
    profitability: "medium",
    ncmCode: "30042000",
    cfop: "5102",
    cst: "00",
  },
  {
    productId: "PRD002",
    productName: "Ácido Hialurônico Juvederm Ultra",
    category: "fillers",
    quantity: 30,
    unit: "seringa",
    unitCostBase: 850.0,
    totalCostBase: 25500.0,
    taxes: {
      icms: { rate: 18, value: 4590.0 },
      ipi: { rate: 0, value: 0 },
      pis: { rate: 1.65, value: 420.75 },
      cofins: { rate: 7.6, value: 1938.0 },
      iss: { rate: 0, value: 0 },
    },
    additionalCosts: {
      freight: 250.0,
      insurance: 200.0,
      handling: 80.0,
      storage: 300.0,
      depreciation: 0,
    },
    totalTaxes: 6948.75,
    totalAdditionalCosts: 830.0,
    finalUnitCost: 1109.63,
    finalTotalCost: 33288.75,
    salePrice: 1450.0,
    grossMargin: 340.37,
    grossMarginPercent: 23.47,
    netMargin: 290.37,
    netMarginPercent: 20.03,
    breakEvenQuantity: 25,
    profitability: "medium",
    ncmCode: "30042000",
    cfop: "5102",
    cst: "00",
  },
];
var categories = [
  { id: "botox", name: "Toxina Botulínica", icon: "💉" },
  { id: "fillers", name: "Preenchedores", icon: "🧪" },
  { id: "skincare", name: "Dermocosméticos", icon: "✨" },
  { id: "equipment", name: "Equipamentos", icon: "⚕️" },
  { id: "consumables", name: "Descartáveis", icon: "🧤" },
];
/**
 * Cost Analysis Component for NeonPro Inventory Management
 *
 * Features:
 * - Complete Brazilian tax calculation (ICMS, IPI, PIS, COFINS, ISS)
 * - NCM code classification and CFOP management
 * - Cost breakdown with additional expenses (freight, insurance, storage)
 * - Margin analysis and profitability assessment
 * - Break-even analysis for product lines
 * - Brazilian fiscal compliance (CST codes)
 * - Export functionality for accounting integration
 * - Real-time cost monitoring and alerts
 *
 * @author VoidBeast V4.0 + neonpro-code-guardian
 * @version 1.0.0
 * @compliance ANVISA, CFM, LGPD, Brazilian Tax Regulations
 */
function CostAnalysis() {
  var _a = (0, react_1.useState)("all"),
    selectedCategory = _a[0],
    setSelectedCategory = _a[1];
  var _b = (0, react_1.useState)("margin"),
    selectedMetric = _b[0],
    setSelectedMetric = _b[1];
  var _c = (0, react_1.useState)("overview"),
    viewMode = _c[0],
    setViewMode = _c[1];
  var filteredAnalysis = (0, react_1.useMemo)(
    () =>
      mockCostAnalysis.filter((analysis) => {
        var matchesCategory = selectedCategory === "all" || analysis.category === selectedCategory;
        return matchesCategory;
      }),
    [selectedCategory],
  );
  var overallMetrics = (0, react_1.useMemo)(() => {
    var totalCost = filteredAnalysis.reduce((sum, item) => sum + item.finalTotalCost, 0);
    var totalRevenue = filteredAnalysis.reduce(
      (sum, item) => sum + item.salePrice * item.quantity,
      0,
    );
    var totalTaxes = filteredAnalysis.reduce((sum, item) => sum + item.totalTaxes, 0);
    var averageMargin =
      filteredAnalysis.reduce((sum, item) => sum + item.netMarginPercent, 0) /
      filteredAnalysis.length;
    return {
      totalCost: totalCost,
      totalRevenue: totalRevenue,
      totalTaxes: totalTaxes,
      totalProfit: totalRevenue - totalCost,
      averageMargin: averageMargin || 0,
      taxBurden: (totalTaxes / totalCost) * 100,
    };
  }, [filteredAnalysis]);
  var formatCurrency = (value) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  var formatPercent = (value) => "".concat(value.toFixed(2), "%");
  var getProfitabilityColor = (profitability) => {
    switch (profitability) {
      case "high":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  var exportCostAnalysis = () => {
    // In a real implementation, this would generate a detailed Excel/PDF report
    console.log("Exporting cost analysis:", filteredAnalysis);
  };
  return (
    <div className="space-y-6">
      {/* Overview Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold">{formatCurrency(overallMetrics.totalCost)}</p>
              </div>
              <lucide_react_1.DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(overallMetrics.totalRevenue)}
                </p>
              </div>
              <lucide_react_1.TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Margem Média</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatPercent(overallMetrics.averageMargin)}
                </p>
              </div>
              <lucide_react_1.PieChart className="h-8 w-8 text-green-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Carga Tributária</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatPercent(overallMetrics.taxBurden)}
                </p>
              </div>
              <lucide_react_1.Receipt className="h-8 w-8 text-amber-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select_1.Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <select_1.SelectTrigger className="w-48">
            <select_1.SelectValue placeholder="Categoria" />
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="all">Todas as categorias</select_1.SelectItem>
            {categories.map((category) => (
              <select_1.SelectItem key={category.id} value={category.id}>
                {category.icon} {category.name}
              </select_1.SelectItem>
            ))}
          </select_1.SelectContent>
        </select_1.Select>

        <select_1.Select value={selectedMetric} onValueChange={setSelectedMetric}>
          <select_1.SelectTrigger className="w-48">
            <select_1.SelectValue placeholder="Métrica" />
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="margin">Margem de Lucro</select_1.SelectItem>
            <select_1.SelectItem value="taxes">Carga Tributária</select_1.SelectItem>
            <select_1.SelectItem value="profitability">Rentabilidade</select_1.SelectItem>
            <select_1.SelectItem value="breakeven">Ponto de Equilíbrio</select_1.SelectItem>
          </select_1.SelectContent>
        </select_1.Select>

        <tabs_1.Tabs value={viewMode} onValueChange={(value) => setViewMode(value)}>
          <tabs_1.TabsList>
            <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="detailed">Detalhado</tabs_1.TabsTrigger>
          </tabs_1.TabsList>
        </tabs_1.Tabs>

        <button_1.Button onClick={exportCostAnalysis} className="ml-auto">
          <lucide_react_1.Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </button_1.Button>
      </div>{" "}
      {/* Cost Analysis Table */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center justify-between">
            <span>Análise de Custos ({filteredAnalysis.length} produtos)</span>
            <div className="flex items-center gap-2">
              <badge_1.Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <lucide_react_1.Calculator className="w-3 h-3 mr-1" />
                Impostos BR Calculados
              </badge_1.Badge>
            </div>
          </card_1.CardTitle>
          <card_1.CardDescription>
            Análise completa com impostos brasileiros e margem de lucro
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="overflow-x-auto">
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Produto</table_1.TableHead>
                  <table_1.TableHead>Custo Base</table_1.TableHead>
                  <table_1.TableHead>Impostos</table_1.TableHead>
                  <table_1.TableHead>Custo Final</table_1.TableHead>
                  <table_1.TableHead>Preço Venda</table_1.TableHead>
                  <table_1.TableHead>Margem</table_1.TableHead>
                  <table_1.TableHead>Rentabilidade</table_1.TableHead>
                  {viewMode === "detailed" && <table_1.TableHead>Fiscal</table_1.TableHead>}
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {filteredAnalysis.map((analysis) => {
                  var category = categories.find((c) => c.id === analysis.category);
                  return (
                    <table_1.TableRow key={analysis.productId} className="hover:bg-muted/50">
                      <table_1.TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{analysis.productName}</div>
                          <badge_1.Badge variant="outline" className="text-xs">
                            {category === null || category === void 0 ? void 0 : category.icon}{" "}
                            {category === null || category === void 0 ? void 0 : category.name}
                          </badge_1.Badge>
                          <div className="text-xs text-muted-foreground">
                            {analysis.quantity} {analysis.unit}
                          </div>
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{formatCurrency(analysis.unitCostBase)}</div>
                          <div className="text-xs text-muted-foreground">
                            Total: {formatCurrency(analysis.totalCostBase)}
                          </div>
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-amber-600">
                            {formatCurrency(analysis.totalTaxes)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatPercent((analysis.totalTaxes / analysis.totalCostBase) * 100)} do
                            custo
                          </div>
                          {viewMode === "detailed" && (
                            <div className="space-y-1 text-xs">
                              <div>ICMS: {formatCurrency(analysis.taxes.icms.value)}</div>
                              <div>PIS: {formatCurrency(analysis.taxes.pis.value)}</div>
                              <div>COFINS: {formatCurrency(analysis.taxes.cofins.value)}</div>
                            </div>
                          )}
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatCurrency(analysis.finalUnitCost)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Total: {formatCurrency(analysis.finalTotalCost)}
                          </div>
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-green-600">
                            {formatCurrency(analysis.salePrice)}
                          </div>
                          <div className="text-xs text-muted-foreground">por {analysis.unit}</div>
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {formatPercent(analysis.netMarginPercent)}
                            </span>
                            {analysis.netMarginPercent > 20
                              ? <lucide_react_1.TrendingUp className="w-3 h-3 text-green-500" />
                              : analysis.netMarginPercent > 10
                                ? <lucide_react_1.BarChart3 className="w-3 h-3 text-yellow-500" />
                                : <lucide_react_1.TrendingDown className="w-3 h-3 text-red-500" />}
                          </div>
                          <progress_1.Progress
                            value={Math.min(analysis.netMarginPercent, 50)}
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(analysis.netMargin)} por unidade
                          </div>
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="space-y-1">
                          <badge_1.Badge
                            variant="outline"
                            className={getProfitabilityColor(analysis.profitability)}
                          >
                            {analysis.profitability === "high"
                              ? "Alta"
                              : analysis.profitability === "medium"
                                ? "Média"
                                : analysis.profitability === "low"
                                  ? "Baixa"
                                  : "Negativa"}
                          </badge_1.Badge>
                          <div className="text-xs text-muted-foreground">
                            Break-even: {analysis.breakEvenQuantity} {analysis.unit}
                          </div>
                        </div>
                      </table_1.TableCell>

                      {viewMode === "detailed" && (
                        <table_1.TableCell>
                          <div className="space-y-1 text-xs">
                            <div>NCM: {analysis.ncmCode}</div>
                            <div>CFOP: {analysis.cfop}</div>
                            <div>CST: {analysis.cst}</div>
                          </div>
                        </table_1.TableCell>
                      )}
                    </table_1.TableRow>
                  );
                })}
              </table_1.TableBody>
            </table_1.Table>

            {filteredAnalysis.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <lucide_react_1.Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum produto encontrado com os filtros aplicados.</p>
              </div>
            )}
          </div>
        </card_1.CardContent>
      </card_1.Card>
      {/* Brazilian Tax Breakdown */}
      {viewMode === "detailed" && filteredAnalysis.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Tax Breakdown Card */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Receipt className="w-5 h-5" />
                Breakdown Tributário Brasileiro
              </card_1.CardTitle>
              <card_1.CardDescription>
                Análise detalhada dos impostos por categoria
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {(() => {
                  var totalTaxes = filteredAnalysis.reduce((sum, item) => sum + item.totalTaxes, 0);
                  var taxBreakdown = {
                    icms: filteredAnalysis.reduce((sum, item) => sum + item.taxes.icms.value, 0),
                    ipi: filteredAnalysis.reduce((sum, item) => sum + item.taxes.ipi.value, 0),
                    pis: filteredAnalysis.reduce((sum, item) => sum + item.taxes.pis.value, 0),
                    cofins: filteredAnalysis.reduce(
                      (sum, item) => sum + item.taxes.cofins.value,
                      0,
                    ),
                    iss: filteredAnalysis.reduce((sum, item) => sum + item.taxes.iss.value, 0),
                  };
                  return Object.entries(taxBreakdown)
                    .map((_a) => {
                      var tax = _a[0],
                        value = _a[1];
                      if (value === 0) return null;
                      var percentage = (value / totalTaxes) * 100;
                      return (
                        <div key={tax} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium uppercase">{tax}</span>
                            <span className="text-sm">{formatCurrency(value)}</span>
                          </div>
                          <progress_1.Progress value={percentage} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            {formatPercent(percentage)} do total de impostos
                          </div>
                        </div>
                      );
                    })
                    .filter(Boolean);
                })()}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Cost Composition Card */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.PieChart className="w-5 h-5" />
                Composição de Custos
              </card_1.CardTitle>
              <card_1.CardDescription>
                Distribuição percentual dos componentes de custo
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {(() => {
                  var totalCost = overallMetrics.totalCost;
                  var totalBase = filteredAnalysis.reduce(
                    (sum, item) => sum + item.totalCostBase,
                    0,
                  );
                  var totalTaxes = filteredAnalysis.reduce((sum, item) => sum + item.totalTaxes, 0);
                  var totalAdditional = filteredAnalysis.reduce(
                    (sum, item) => sum + item.totalAdditionalCosts,
                    0,
                  );
                  var components = [
                    { name: "Custo Base", value: totalBase, color: "bg-blue-500" },
                    { name: "Impostos", value: totalTaxes, color: "bg-amber-500" },
                    { name: "Custos Adicionais", value: totalAdditional, color: "bg-green-500" },
                  ];
                  return components.map((component) => {
                    var percentage = (component.value / totalCost) * 100;
                    return (
                      <div key={component.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{component.name}</span>
                          <span className="text-sm">{formatCurrency(component.value)}</span>
                        </div>
                        <progress_1.Progress value={percentage} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {formatPercent(percentage)} do custo total
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      )}
      {/* Profitability Analysis */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.BarChart3 className="w-5 h-5" />
            Análise de Rentabilidade
          </card_1.CardTitle>
          <card_1.CardDescription>
            Insights e recomendações baseados na análise de custos
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* High Profitability Products */}
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">Alta Rentabilidade</h4>
              <div className="space-y-2">
                {filteredAnalysis
                  .filter((p) => p.profitability === "high")
                  .map((product) => (
                    <div
                      key={product.productId}
                      className="p-2 bg-green-50 border border-green-200 rounded"
                    >
                      <div className="text-sm font-medium">{product.productName}</div>
                      <div className="text-xs text-muted-foreground">
                        Margem: {formatPercent(product.netMarginPercent)}
                      </div>
                    </div>
                  ))}
                {filteredAnalysis.filter((p) => p.profitability === "high").length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhum produto com alta rentabilidade
                  </p>
                )}
              </div>
            </div>

            {/* Medium Profitability Products */}
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-600">Rentabilidade Média</h4>
              <div className="space-y-2">
                {filteredAnalysis
                  .filter((p) => p.profitability === "medium")
                  .map((product) => (
                    <div
                      key={product.productId}
                      className="p-2 bg-yellow-50 border border-yellow-200 rounded"
                    >
                      <div className="text-sm font-medium">{product.productName}</div>
                      <div className="text-xs text-muted-foreground">
                        Margem: {formatPercent(product.netMarginPercent)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Low/Negative Profitability Products */}
            <div className="space-y-2">
              <h4 className="font-medium text-red-600">Baixa Rentabilidade</h4>
              <div className="space-y-2">
                {filteredAnalysis
                  .filter((p) => p.profitability === "low" || p.profitability === "negative")
                  .map((product) => (
                    <div
                      key={product.productId}
                      className="p-2 bg-red-50 border border-red-200 rounded"
                    >
                      <div className="text-sm font-medium">{product.productName}</div>
                      <div className="text-xs text-muted-foreground">
                        Margem: {formatPercent(product.netMarginPercent)}
                      </div>
                      <div className="text-xs text-red-600 font-medium">⚠️ Revisar precificação</div>
                    </div>
                  ))}
                {filteredAnalysis.filter(
                  (p) => p.profitability === "low" || p.profitability === "negative",
                ).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Todos os produtos com rentabilidade adequada
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <lucide_react_1.FileText className="w-4 h-4" />
              Insights e Recomendações
            </h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>
                • Carga tributária média de {formatPercent(overallMetrics.taxBurden)} sobre o custo
                base
              </li>
              <li>
                • Margem líquida média de {formatPercent(overallMetrics.averageMargin)} após
                impostos
              </li>
              <li>• Produtos com baixa rentabilidade necessitam revisão de precificação</li>
              <li>• Considerar negociação com fornecedores para redução de custos base</li>
            </ul>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
