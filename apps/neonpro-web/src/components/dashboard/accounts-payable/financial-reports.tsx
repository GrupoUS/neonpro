"use client";

import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  AgingReportItem,
  BudgetTrackingReport,
  CategoryExpenseReport,
  financialReportsService,
  FinancialSummaryMetrics,
  VendorPerformanceMetrics,
} from "@/lib/services/financial-reports-service";
import type {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Download,
  Filter,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { useEffect, useState } from "react";

interface FinancialReportsPageProps {
  clinicId: string;
}

export default function FinancialReportsPage({ clinicId }: FinancialReportsPageProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  // Estados para dados dos relatórios
  const [summary, setSummary] = useState<FinancialSummaryMetrics | null>(null);
  const [agingData, setAgingData] = useState<AgingReportItem[]>([]);
  const [vendorPerformance, setVendorPerformance] = useState<VendorPerformanceMetrics[]>([]);
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpenseReport[]>([]);
  const [budgetTracking, setBudgetTracking] = useState<BudgetTrackingReport | null>(null);

  // Filtros de período
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");

  const loadReportsData = async () => {
    try {
      setLoading(true);

      // Carregar dados em paralelo
      const [summaryData, agingReport, performanceData, categoryData, budgetData] =
        await Promise.all([
          financialReportsService.getFinancialSummary(clinicId),
          financialReportsService.getAgingReport(clinicId),
          financialReportsService.getVendorPerformanceReport(clinicId, "2025-01-01", "2025-07-21"),
          financialReportsService.getCategoryExpenseReport(clinicId, 2025, 7),
          financialReportsService.getBudgetTrackingReport(clinicId, "2025-07"),
        ]);

      setSummary(summaryData);
      setAgingData(agingReport);
      setVendorPerformance(performanceData);
      setCategoryExpenses(categoryData);
      setBudgetTracking(budgetData);
    } catch (error) {
      console.error("Error loading reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, [clinicId, selectedPeriod]);

  const handleExportReport = (reportType: string) => {
    console.log(`Exporting ${reportType} report...`);
    // Implementar exportação
  };

  const handleRefreshData = () => {
    loadReportsData();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">
            Análises e relatórios do sistema de contas a pagar
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Resumo Executivo */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {financialReportsService.formatCurrency(summary.total_payables)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Badge
                  variant={summary.total_overdue > 0 ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {summary.total_overdue > 0 ? "Em atraso" : "Em dia"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.active_vendors}</div>
              <p className="text-xs text-muted-foreground">de {summary.vendor_count} cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prazo Médio de Pagamento</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.avg_payment_period.toFixed(1)} dias</div>
              <p className="text-xs text-muted-foreground">Média dos últimos 90 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Economia YTD</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {financialReportsService.formatCurrency(summary.cost_savings_ytd)}
              </div>
              <p className="text-xs text-muted-foreground">Descontos e otimizações</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs de Relatórios */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary">Resumo</TabsTrigger>
          <TabsTrigger value="aging">Aging</TabsTrigger>
          <TabsTrigger value="vendors">Fornecedores</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="budget">Orçamento</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Gráfico de Aging */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Vencimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agingData.map((item) => (
                    <div key={item.vendor_id} className="flex items-center justify-between">
                      <span className="text-sm">{item.vendor_name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {financialReportsService.formatCurrency(item.total_amount)}
                        </span>
                        {item.overdue_count > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {item.overdue_count} em atraso
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Categorias */}
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoria (Mês Atual)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryExpenses.slice(0, 5).map((category) => (
                    <div key={category.category_id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{category.category_name}</span>
                        <span className="text-lg">
                          {financialReportsService.getTrendIcon(category.trend)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {financialReportsService.formatCurrency(category.current_month)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {financialReportsService.formatPercentage(
                            category.budget_used_percentage,
                          )}{" "}
                          do orçamento
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="aging" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Relatório de Aging - Contas a Pagar</CardTitle>
              <Button variant="outline" size="sm" onClick={() => handleExportReport("aging")}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fornecedor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Atual (0-30)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        31-60 dias
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        61-90 dias
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        +90 dias
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {agingData.map((item) => (
                      <tr key={item.vendor_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.vendor_name}
                            </div>
                            <div className="text-sm text-gray-500">{item.vendor_document}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {financialReportsService.formatCurrency(item.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {financialReportsService.formatCurrency(item.current)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {financialReportsService.formatCurrency(item.days_31_60)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {financialReportsService.formatCurrency(item.days_61_90)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {financialReportsService.formatCurrency(item.days_over_90)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.overdue_count > 0 ? (
                            <Badge variant="destructive">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {item.overdue_count} em atraso
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Em dia
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Performance de Fornecedores</CardTitle>
              <Button variant="outline" size="sm" onClick={() => handleExportReport("vendors")}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendorPerformance.map((vendor) => (
                  <div key={vendor.vendor_id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{vendor.vendor_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {vendor.total_invoices} faturas •{" "}
                          {financialReportsService.formatCurrency(vendor.total_amount)}
                        </p>
                      </div>
                      <Badge
                        variant={financialReportsService.getRiskColor(vendor.risk_score)}
                        className="text-sm"
                      >
                        Risco: {vendor.risk_score}/10
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Prazo Médio:</span>
                        <p className="font-medium">{vendor.avg_payment_time.toFixed(1)} dias</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pontualidade:</span>
                        <p className="font-medium">
                          {financialReportsService.formatPercentage(vendor.on_time_percentage)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Descontos:</span>
                        <p className="font-medium text-green-600">
                          {financialReportsService.formatCurrency(vendor.total_discounts_taken)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Último Pagamento:</span>
                        <p className="font-medium">
                          {new Date(vendor.last_payment_date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Análise por Categoria</CardTitle>
              <Button variant="outline" size="sm" onClick={() => handleExportReport("categories")}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryExpenses.map((category) => (
                  <div key={category.category_id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{category.category_name}</h3>
                        <span className="text-lg">
                          {financialReportsService.getTrendIcon(category.trend)}
                        </span>
                      </div>
                      <Badge
                        variant={financialReportsService.getBudgetHealthColor(
                          category.budget_used_percentage,
                        )}
                      >
                        {financialReportsService.formatPercentage(category.budget_used_percentage)}{" "}
                        do orçamento
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Mês Atual:</span>
                        <p className="font-medium">
                          {financialReportsService.formatCurrency(category.current_month)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mês Anterior:</span>
                        <p className="font-medium">
                          {financialReportsService.formatCurrency(category.previous_month)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ano até agora:</span>
                        <p className="font-medium">
                          {financialReportsService.formatCurrency(category.year_to_date)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Faturas:</span>
                        <p className="font-medium">
                          {category.invoice_count} • Média:{" "}
                          {financialReportsService.formatCurrency(category.avg_invoice_amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          {budgetTracking && (
            <>
              {/* Alertas de Orçamento */}
              {budgetTracking.alerts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                      Alertas de Orçamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {budgetTracking.alerts.map((alert, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-3 border rounded-lg"
                        >
                          <AlertTriangle className="h-5 w-5 mt-0.5 text-yellow-600" />
                          <div>
                            <p className="font-medium">{alert.category}</p>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                            <p className="text-sm font-medium text-red-600">
                              Valor: {financialReportsService.formatCurrency(alert.amount)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Resumo do Orçamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumo Orçamentário - {budgetTracking.period}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Orçado</p>
                      <p className="text-2xl font-bold">
                        {financialReportsService.formatCurrency(budgetTracking.total_budget)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Gasto</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {financialReportsService.formatCurrency(budgetTracking.total_spent)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Comprometido</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {financialReportsService.formatCurrency(budgetTracking.total_committed)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Disponível</p>
                      <p
                        className={`text-2xl font-bold ${
                          budgetTracking.remaining_budget < 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {financialReportsService.formatCurrency(budgetTracking.remaining_budget)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {budgetTracking.categories.map((category, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{category.category_name}</h4>
                          <Badge
                            variant={financialReportsService.getBudgetHealthColor(
                              category.utilization_percentage,
                            )}
                          >
                            {financialReportsService.formatPercentage(
                              category.utilization_percentage,
                            )}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Orçado:</span>
                            <p className="font-medium">
                              {financialReportsService.formatCurrency(category.budgeted)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Gasto:</span>
                            <p className="font-medium">
                              {financialReportsService.formatCurrency(category.spent)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Disponível:</span>
                            <p
                              className={`font-medium ${
                                category.remaining < 0 ? "text-red-600" : "text-green-600"
                              }`}
                            >
                              {financialReportsService.formatCurrency(category.remaining)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
