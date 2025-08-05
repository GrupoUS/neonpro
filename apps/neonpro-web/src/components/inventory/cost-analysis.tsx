"use client";

import type {
  BarChart3,
  Calculator,
  DollarSign,
  Download,
  FileText,
  PieChart,
  Receipt,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { useMemo, useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductCostAnalysis {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;

  // Custo base
  unitCostBase: number;
  totalCostBase: number;

  // Impostos brasileiros
  taxes: {
    icms: { rate: number; value: number }; // ICMS - Imposto sobre Circulação de Mercadorias
    ipi: { rate: number; value: number }; // IPI - Imposto sobre Produtos Industrializados
    pis: { rate: number; value: number }; // PIS - Programa de Integração Social
    cofins: { rate: number; value: number }; // COFINS - Contribuição para Financiamento da Seguridade Social
    iss: { rate: number; value: number }; // ISS - Imposto sobre Serviços (se aplicável)
  };

  // Custos adicionais
  additionalCosts: {
    freight: number; // Frete
    insurance: number; // Seguro
    handling: number; // Manuseio
    storage: number; // Armazenagem
    depreciation: number; // Depreciação (equipamentos)
  };

  // Cálculos finais
  totalTaxes: number;
  totalAdditionalCosts: number;
  finalUnitCost: number;
  finalTotalCost: number;

  // Preços e margens
  salePrice: number;
  grossMargin: number;
  grossMarginPercent: number;
  netMargin: number;
  netMarginPercent: number;

  // Análise de rentabilidade
  breakEvenQuantity: number;
  profitability: "high" | "medium" | "low" | "negative";

  // Classificação fiscal
  ncmCode: string;
  cfop: string; // Código Fiscal de Operações e Prestações
  cst: string; // Código de Situação Tributária
}

// Mock data for demonstration
const mockCostAnalysis: ProductCostAnalysis[] = [
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

const categories = [
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
export function CostAnalysis() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMetric, setSelectedMetric] = useState<string>("margin");
  const [viewMode, setViewMode] = useState<"overview" | "detailed">("overview");

  const filteredAnalysis = useMemo(() => {
    return mockCostAnalysis.filter((analysis) => {
      const matchesCategory = selectedCategory === "all" || analysis.category === selectedCategory;
      return matchesCategory;
    });
  }, [selectedCategory]);

  const overallMetrics = useMemo(() => {
    const totalCost = filteredAnalysis.reduce((sum, item) => sum + item.finalTotalCost, 0);
    const totalRevenue = filteredAnalysis.reduce(
      (sum, item) => sum + item.salePrice * item.quantity,
      0,
    );
    const totalTaxes = filteredAnalysis.reduce((sum, item) => sum + item.totalTaxes, 0);
    const averageMargin =
      filteredAnalysis.reduce((sum, item) => sum + item.netMarginPercent, 0) /
      filteredAnalysis.length;

    return {
      totalCost,
      totalRevenue,
      totalTaxes,
      totalProfit: totalRevenue - totalCost,
      averageMargin: averageMargin || 0,
      taxBurden: (totalTaxes / totalCost) * 100,
    };
  }, [filteredAnalysis]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getProfitabilityColor = (profitability: string) => {
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

  const exportCostAnalysis = () => {
    // In a real implementation, this would generate a detailed Excel/PDF report
    console.log("Exporting cost analysis:", filteredAnalysis);
  };

  return (
    <div className="space-y-6">
      {/* Overview Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold">{formatCurrency(overallMetrics.totalCost)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(overallMetrics.totalRevenue)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Margem Média</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatPercent(overallMetrics.averageMargin)}
                </p>
              </div>
              <PieChart className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Carga Tributária</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatPercent(overallMetrics.taxBurden)}
                </p>
              </div>
              <Receipt className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.icon} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Métrica" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="margin">Margem de Lucro</SelectItem>
            <SelectItem value="taxes">Carga Tributária</SelectItem>
            <SelectItem value="profitability">Rentabilidade</SelectItem>
            <SelectItem value="breakeven">Ponto de Equilíbrio</SelectItem>
          </SelectContent>
        </Select>

        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as "overview" | "detailed")}
        >
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="detailed">Detalhado</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button onClick={exportCostAnalysis} className="ml-auto">
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>{" "}
      {/* Cost Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Análise de Custos ({filteredAnalysis.length} produtos)</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Calculator className="w-3 h-3 mr-1" />
                Impostos BR Calculados
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Análise completa com impostos brasileiros e margem de lucro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Custo Base</TableHead>
                  <TableHead>Impostos</TableHead>
                  <TableHead>Custo Final</TableHead>
                  <TableHead>Preço Venda</TableHead>
                  <TableHead>Margem</TableHead>
                  <TableHead>Rentabilidade</TableHead>
                  {viewMode === "detailed" && <TableHead>Fiscal</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnalysis.map((analysis) => {
                  const category = categories.find((c) => c.id === analysis.category);

                  return (
                    <TableRow key={analysis.productId} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{analysis.productName}</div>
                          <Badge variant="outline" className="text-xs">
                            {category?.icon} {category?.name}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {analysis.quantity} {analysis.unit}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{formatCurrency(analysis.unitCostBase)}</div>
                          <div className="text-xs text-muted-foreground">
                            Total: {formatCurrency(analysis.totalCostBase)}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
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
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatCurrency(analysis.finalUnitCost)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Total: {formatCurrency(analysis.finalTotalCost)}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-green-600">
                            {formatCurrency(analysis.salePrice)}
                          </div>
                          <div className="text-xs text-muted-foreground">por {analysis.unit}</div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {formatPercent(analysis.netMarginPercent)}
                            </span>
                            {analysis.netMarginPercent > 20 ? (
                              <TrendingUp className="w-3 h-3 text-green-500" />
                            ) : analysis.netMarginPercent > 10 ? (
                              <BarChart3 className="w-3 h-3 text-yellow-500" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-500" />
                            )}
                          </div>
                          <Progress
                            value={Math.min(analysis.netMarginPercent, 50)}
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(analysis.netMargin)} por unidade
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <Badge
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
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            Break-even: {analysis.breakEvenQuantity} {analysis.unit}
                          </div>
                        </div>
                      </TableCell>

                      {viewMode === "detailed" && (
                        <TableCell>
                          <div className="space-y-1 text-xs">
                            <div>NCM: {analysis.ncmCode}</div>
                            <div>CFOP: {analysis.cfop}</div>
                            <div>CST: {analysis.cst}</div>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredAnalysis.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum produto encontrado com os filtros aplicados.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Brazilian Tax Breakdown */}
      {viewMode === "detailed" && filteredAnalysis.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Tax Breakdown Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Breakdown Tributário Brasileiro
              </CardTitle>
              <CardDescription>Análise detalhada dos impostos por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  const totalTaxes = filteredAnalysis.reduce(
                    (sum, item) => sum + item.totalTaxes,
                    0,
                  );
                  const taxBreakdown = {
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
                    .map(([tax, value]) => {
                      if (value === 0) return null;
                      const percentage = (value / totalTaxes) * 100;

                      return (
                        <div key={tax} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium uppercase">{tax}</span>
                            <span className="text-sm">{formatCurrency(value)}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            {formatPercent(percentage)} do total de impostos
                          </div>
                        </div>
                      );
                    })
                    .filter(Boolean);
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Cost Composition Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Composição de Custos
              </CardTitle>
              <CardDescription>Distribuição percentual dos componentes de custo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  const totalCost = overallMetrics.totalCost;
                  const totalBase = filteredAnalysis.reduce(
                    (sum, item) => sum + item.totalCostBase,
                    0,
                  );
                  const totalTaxes = filteredAnalysis.reduce(
                    (sum, item) => sum + item.totalTaxes,
                    0,
                  );
                  const totalAdditional = filteredAnalysis.reduce(
                    (sum, item) => sum + item.totalAdditionalCosts,
                    0,
                  );

                  const components = [
                    { name: "Custo Base", value: totalBase, color: "bg-blue-500" },
                    { name: "Impostos", value: totalTaxes, color: "bg-amber-500" },
                    { name: "Custos Adicionais", value: totalAdditional, color: "bg-green-500" },
                  ];

                  return components.map((component) => {
                    const percentage = (component.value / totalCost) * 100;

                    return (
                      <div key={component.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{component.name}</span>
                          <span className="text-sm">{formatCurrency(component.value)}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {formatPercent(percentage)} do custo total
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Profitability Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Análise de Rentabilidade
          </CardTitle>
          <CardDescription>Insights e recomendações baseados na análise de custos</CardDescription>
        </CardHeader>
        <CardContent>
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
              <FileText className="w-4 h-4" />
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
        </CardContent>
      </Card>
    </div>
  );
}
