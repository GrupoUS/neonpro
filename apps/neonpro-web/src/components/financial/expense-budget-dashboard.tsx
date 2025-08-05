// Expense & Budget Management Dashboard
// Epic 5, Story 5.1, Task 5: Expense & Budget Management UI
// Created: 2025-01-27
// Author: VoidBeast V4.0 (BMad Method Implementation)
// =====================================================================================

"use client";

import type {
  AlertTriangle,
  Building,
  Calendar,
  DollarSign,
  Download,
  PieChart,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
  Truck,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ExpenseBudgetEngine } from "@/lib/financial/expense-budget-engine";

interface ExpenseCategory {
  categoryId: string;
  categoryName: string;
  parentCategoryId?: string;
  budgetAllocation: number;
  actualSpending: number;
  variance: number;
  variancePercent: number;
  alertThreshold: number;
  isOverBudget: boolean;
}

interface BudgetAlert {
  alertId: string;
  categoryId: string;
  categoryName: string;
  alertType: "warning" | "critical" | "exceeded";
  threshold: number;
  currentAmount: number;
  message: string;
  createdAt: Date;
  isResolved: boolean;
}

interface VendorExpenseData {
  vendorId: string;
  vendorName: string;
  category: string;
  totalSpent: number;
  transactionCount: number;
  averageAmount: number;
  paymentTerms: string;
  lastPayment: Date;
  outstandingAmount: number;
  performanceScore: number;
}

export default function ExpenseBudgetDashboard() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("current_month");
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [vendors, setVendors] = useState<VendorExpenseData[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);

  const expenseEngine = new ExpenseBudgetEngine();

  useEffect(() => {
    loadExpenseData();
  }, [period]);

  const loadExpenseData = async () => {
    setLoading(true);
    try {
      const clinicId = "clinic-1"; // Get from context
      const dateRange = parsePeriodToDates(period);

      const [budgetReport, vendorData, trendData, optimizationInsights, costCenterData] =
        await Promise.all([
          expenseEngine.generateBudgetVarianceReport(clinicId, period),
          expenseEngine.analyzeVendorExpenses(clinicId, dateRange),
          expenseEngine.analyzeExpenseTrends(clinicId, dateRange),
          expenseEngine.generateCostOptimizationInsights(clinicId, dateRange),
          expenseEngine.allocateCostsByCenter(clinicId, dateRange),
        ]);

      setCategories(budgetReport.categories);
      setAlerts(budgetReport.alerts);
      setVendors(vendorData);
      setTrends(trendData);
      setInsights(optimizationInsights);
      setCostCenters(costCenterData);
    } catch (error) {
      console.error("Failed to load expense data:", error);
    } finally {
      setLoading(false);
    }
  };

  const parsePeriodToDates = (period: string) => {
    const now = new Date();
    switch (period) {
      case "current_month":
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        };
      case "current_quarter": {
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        return {
          start: new Date(now.getFullYear(), quarterStart, 1),
          end: new Date(now.getFullYear(), quarterStart + 3, 0),
        };
      }
      case "current_year":
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: new Date(now.getFullYear(), 11, 31),
        };
      default:
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(1)}%`;
  };

  const getAlertColor = (alertType: string) => {
    switch (alertType) {
      case "warning":
        return "bg-yellow-100 border-yellow-200 text-yellow-800";
      case "critical":
        return "bg-orange-100 border-orange-200 text-orange-800";
      case "exceeded":
        return "bg-red-100 border-red-200 text-red-800";
      default:
        return "bg-gray-100 border-gray-200 text-gray-800";
    }
  };

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budgetAllocation, 0);
  const totalActual = categories.reduce((sum, cat) => sum + cat.actualSpending, 0);
  const totalVariance = totalActual - totalBudget;
  const variancePercent = totalBudget > 0 ? (totalVariance / totalBudget) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados de despesas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Despesas & Orçamento</h2>
          <p className="text-muted-foreground">
            Controle orçamentário, análise de variação e otimização de custos
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">Mês Atual</SelectItem>
              <SelectItem value="current_quarter">Trimestre Atual</SelectItem>
              <SelectItem value="current_year">Ano Atual</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadExpenseData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Budget Alerts */}
      {alerts.filter((alert) => !alert.isResolved).length > 0 && (
        <div className="space-y-2">
          {alerts
            .filter((alert) => !alert.isResolved)
            .slice(0, 3)
            .map((alert) => (
              <Alert key={alert.alertId} className={getAlertColor(alert.alertType)}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  {alert.alertType === "warning"
                    ? "Atenção"
                    : alert.alertType === "critical"
                      ? "Crítico"
                      : "Orçamento Excedido"}
                  : {alert.categoryName}
                </AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">Alocação total do período</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Real</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalActual)}</div>
            <p className="text-xs text-muted-foreground">Execução orçamentária</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variação</CardTitle>
            {totalVariance > 0 ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${totalVariance > 0 ? "text-red-600" : "text-green-600"}`}
            >
              {totalVariance > 0 ? "+" : ""}
              {formatCurrency(totalVariance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercent(Math.abs(variancePercent))} do orçamento
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter((alert) => !alert.isResolved).length}
            </div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="budget" className="space-y-4">
        <TabsList>
          <TabsTrigger value="budget">Variação Orçamentária</TabsTrigger>
          <TabsTrigger value="vendors">Fornecedores</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="optimization">Otimização</TabsTrigger>
          <TabsTrigger value="centers">Centros de Custo</TabsTrigger>
        </TabsList>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Variação Orçamentária por Categoria</CardTitle>
              <CardDescription>Análise de execução vs planejamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.categoryId} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{category.categoryName}</h4>
                      <div className="flex items-center space-x-2">
                        {category.isOverBudget && <Badge variant="destructive">Excedido</Badge>}
                        <Badge
                          variant={
                            Math.abs(category.variancePercent) < 5
                              ? "default"
                              : Math.abs(category.variancePercent) < 10
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {formatPercent(category.variancePercent)} variação
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Orçado: {formatCurrency(category.budgetAllocation)}</span>
                        <span>Realizado: {formatCurrency(category.actualSpending)}</span>
                      </div>
                      <Progress
                        value={Math.min(
                          100,
                          (category.actualSpending / category.budgetAllocation) * 100,
                        )}
                        className="h-2"
                      />
                      <div className="text-xs text-muted-foreground">
                        Variação: {category.variance > 0 ? "+" : ""}
                        {formatCurrency(category.variance)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Fornecedores</CardTitle>
              <CardDescription>Performance e gastos por fornecedor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendors.map((vendor) => (
                  <div
                    key={vendor.vendorId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{vendor.vendorName}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{vendor.category}</Badge>
                          <Badge
                            variant={
                              vendor.performanceScore > 8
                                ? "default"
                                : vendor.performanceScore > 6
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {vendor.performanceScore.toFixed(1)} score
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Gasto</p>
                          <p className="font-medium">{formatCurrency(vendor.totalSpent)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Transações</p>
                          <p className="font-medium">{vendor.transactionCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Valor Médio</p>
                          <p className="font-medium">{formatCurrency(vendor.averageAmount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pendente</p>
                          <p className="font-medium">{formatCurrency(vendor.outstandingAmount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Último Pagamento</p>
                          <p className="font-medium">
                            {vendor.lastPayment.toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendências de Despesas</CardTitle>
              <CardDescription>Análise temporal e identificação de padrões</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trends.map((trend, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{trend.period}</h4>
                        <Badge variant={trend.growthRate > 0 ? "destructive" : "default"}>
                          {trend.growthRate > 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {trend.growthRate > 0 ? "+" : ""}
                          {formatPercent(trend.growthRate)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Despesas</p>
                          <p className="font-medium">{formatCurrency(trend.totalExpenses)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Volatilidade</p>
                          <p className="font-medium">{formatPercent(trend.volatility)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Economia Potencial</p>
                          <p className="font-medium text-green-600">
                            {formatCurrency(trend.costSavingPotential)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Oportunidades de Otimização</CardTitle>
              <CardDescription>
                Insights para redução de custos e melhoria de eficiência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{insight.category}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            insight.priority === "high"
                              ? "destructive"
                              : insight.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {insight.priority}
                        </Badge>
                        <Badge variant="outline">
                          {formatCurrency(insight.savingsPotential)} economia
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-muted-foreground">Gasto Atual</p>
                        <p className="font-medium">{formatCurrency(insight.currentSpending)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Benchmark</p>
                        <p className="font-medium">{formatCurrency(insight.benchmarkSpending)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Esforço</p>
                        <p className="font-medium">{insight.implementationEffort}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Recomendações:</p>
                      <div className="flex flex-wrap gap-1">
                        {insight.recommendations.map((rec: string, recIndex: number) => (
                          <Badge key={recIndex} variant="outline" className="text-xs">
                            {rec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="centers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Centros de Custo</CardTitle>
              <CardDescription>Alocação departamental e análise de eficiência</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {costCenters.map((center) => (
                  <div
                    key={center.costCenterId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{center.costCenterName}</h4>
                        <Badge variant="outline">{center.department}</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Orçamento</p>
                          <p className="font-medium">{formatCurrency(center.allocatedBudget)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Executado</p>
                          <p className="font-medium">{formatCurrency(center.actualExpenses)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Utilização</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={center.utilizationRate} className="flex-1" />
                            <span className="text-xs">{formatPercent(center.utilizationRate)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Contribuição</p>
                          <p className="font-medium">{formatCurrency(center.profitContribution)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
