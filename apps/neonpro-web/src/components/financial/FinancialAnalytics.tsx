/**
 * TASK-003: Business Logic Enhancement
 * Financial Analytics Dashboard Component
 *
 * Real-time financial analytics with predictive insights,
 * cash flow analysis, and automated reporting.
 */

"use client";

import React, { useState, useEffect } from "react";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Badge } from "@/components/ui/badge";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
} from "lucide-react";
import type {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import type { useToast } from "@/components/ui/use-toast";

interface FinancialMetric {
  label: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
  target?: number;
  unit: "currency" | "percentage" | "number";
}

interface CashFlowData {
  date: string;
  income: number;
  expenses: number;
  profit: number;
  projection?: number;
}

interface ServicePerformance {
  service: string;
  revenue: number;
  count: number;
  avgValue: number;
  growth: number;
  profitMargin: number;
}

interface PredictiveInsight {
  type: "opportunity" | "warning" | "recommendation";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  actionItems?: string[];
}

interface FinancialAnalyticsProps {
  clinicId?: string;
  dateRange?: { start: Date; end: Date };
}

export function FinancialAnalytics({ clinicId, dateRange }: FinancialAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [metrics, setMetrics] = useState<FinancialMetric[]>([]);
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([]);
  const [servicePerformance, setServicePerformance] = useState<ServicePerformance[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { toast } = useToast();

  // Mock data generation - In production, this would fetch from APIs
  useEffect(() => {
    generateMockData();
  }, [selectedPeriod]);

  const generateMockData = () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Financial Metrics
      setMetrics([
        {
          label: "Receita Total",
          value: 145800,
          change: 12.5,
          trend: "up",
          target: 150000,
          unit: "currency",
        },
        {
          label: "Lucro Líquido",
          value: 52030,
          change: 8.3,
          trend: "up",
          target: 55000,
          unit: "currency",
        },
        {
          label: "Margem de Lucro",
          value: 35.7,
          change: -2.1,
          trend: "down",
          target: 40,
          unit: "percentage",
        },
        {
          label: "Pacientes Ativos",
          value: 324,
          change: 15.2,
          trend: "up",
          target: 350,
          unit: "number",
        },
        {
          label: "Ticket Médio",
          value: 450,
          change: 5.8,
          trend: "up",
          target: 500,
          unit: "currency",
        },
        {
          label: "Taxa de Conversão",
          value: 68.5,
          change: 3.2,
          trend: "up",
          target: 70,
          unit: "percentage",
        },
      ]);

      // Cash Flow Data
      const cashFlow = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        income: Math.random() * 8000 + 2000,
        expenses: Math.random() * 4000 + 1000,
        profit: 0,
        projection: Math.random() * 6000 + 3000,
      }));

      cashFlow.forEach((day) => {
        day.profit = day.income - day.expenses;
      });

      setCashFlowData(cashFlow);

      // Service Performance
      setServicePerformance([
        {
          service: "Botox Facial",
          revenue: 45600,
          count: 76,
          avgValue: 600,
          growth: 15.3,
          profitMargin: 45.2,
        },
        {
          service: "Preenchimento Labial",
          revenue: 32800,
          count: 82,
          avgValue: 400,
          growth: 8.7,
          profitMargin: 38.5,
        },
        {
          service: "Consulta Dermatológica",
          revenue: 28400,
          count: 142,
          avgValue: 200,
          growth: 22.1,
          profitMargin: 65.0,
        },
        {
          service: "Limpeza de Pele",
          revenue: 18600,
          count: 124,
          avgValue: 150,
          growth: -5.2,
          profitMargin: 55.8,
        },
      ]);

      // Predictive Insights
      setPredictiveInsights([
        {
          type: "opportunity",
          title: "Oportunidade de Crescimento",
          description:
            "Botox Facial mostra tendência de alta. Recomenda-se aumentar capacidade de atendimento.",
          impact: "high",
          confidence: 87,
          actionItems: [
            "Treinar mais profissionais no procedimento",
            "Ampliar horários de atendimento",
            "Criar campanhas promocionais direcionadas",
          ],
        },
        {
          type: "warning",
          title: "Declínio em Limpeza de Pele",
          description: "Queda de 5.2% na procura por limpeza de pele nos últimos 30 dias.",
          impact: "medium",
          confidence: 92,
          actionItems: [
            "Revisar preços competitivos",
            "Avaliar qualidade do serviço",
            "Implementar programa de fidelidade",
          ],
        },
        {
          type: "recommendation",
          title: "Otimização de Fluxo de Caixa",
          description:
            "Padrão sazonal identificado. Implementar estratégias para períodos de baixa.",
          impact: "medium",
          confidence: 78,
          actionItems: [
            "Criar pacotes promocionais para períodos lentos",
            "Implementar planos de pagamento flexíveis",
            "Diversificar portfólio de serviços",
          ],
        },
      ]);

      setIsLoading(false);
    }, 1500);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getInsightIcon = (type: PredictiveInsight["type"]) => {
    switch (type) {
      case "opportunity":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "recommendation":
        return <Target className="h-5 w-5 text-blue-600" />;
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Análise Financeira</h2>
          <p className="text-gray-600">
            Dashboard com insights preditivos e métricas em tempo real
          </p>
        </div>
        <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="1y">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="insights">Insights AI</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Financial Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                  {getTrendIcon(metric.trend)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.unit === "currency" && formatCurrency(metric.value)}
                    {metric.unit === "percentage" && formatPercentage(metric.value)}
                    {metric.unit === "number" && metric.value.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p
                      className={`text-xs ${metric.change >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {metric.change >= 0 ? "+" : ""}
                      {metric.change}% vs período anterior
                    </p>
                    {metric.target && (
                      <Badge variant="outline" className="text-xs">
                        Meta:{" "}
                        {metric.unit === "currency"
                          ? formatCurrency(metric.target)
                          : metric.unit === "percentage"
                            ? formatPercentage(metric.target)
                            : metric.target.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                  {metric.target && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Tendência de Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={cashFlowData.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).getDate().toString()}
                  />
                  <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value, name) => [formatCurrency(Number(value)), name]}
                    labelFormatter={(date) => new Date(date).toLocaleDateString("pt-BR")}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="Receita"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    name="Despesas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cash Flow Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Fluxo de Caixa Diário
                </CardTitle>
                <CardDescription>
                  Receitas, despesas e projeções dos últimos {cashFlowData.length} dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsLineChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).getDate().toString()}
                    />
                    <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value, name) => [formatCurrency(Number(value)), name]}
                      labelFormatter={(date) => new Date(date).toLocaleDateString("pt-BR")}
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#2563eb"
                      strokeWidth={2}
                      name="Receita"
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#dc2626"
                      strokeWidth={2}
                      name="Despesas"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#16a34a"
                      strokeWidth={2}
                      name="Lucro"
                    />
                    <Line
                      type="monotone"
                      dataKey="projection"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Projeção"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cash Flow Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Período</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const totalIncome = cashFlowData.reduce((sum, day) => sum + day.income, 0);
                  const totalExpenses = cashFlowData.reduce((sum, day) => sum + day.expenses, 0);
                  const totalProfit = totalIncome - totalExpenses;
                  const avgDailyProfit = totalProfit / cashFlowData.length;

                  return (
                    <>
                      <div className="flex justify-between items-center">
                        <span>Receita Total:</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(totalIncome)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Despesas Total:</span>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(totalExpenses)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-2">
                        <span>Lucro Total:</span>
                        <span className="font-bold text-blue-600">
                          {formatCurrency(totalProfit)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Lucro Médio/Dia:</span>
                        <span className="font-semibold">{formatCurrency(avgDailyProfit)}</span>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Indicadores de Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">ROI Mensal</span>
                    <Badge variant="secondary">+23.5%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Eficiência Operacional</span>
                    <Badge variant="secondary">92%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "92%" }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Crescimento vs Meta</span>
                    <Badge variant="secondary">108%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Performance Table */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Performance por Serviço</CardTitle>
                <CardDescription>
                  Análise detalhada de receita e margem por tipo de serviço
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {servicePerformance.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{service.service}</h4>
                        <p className="text-sm text-gray-600">
                          {service.count} procedimentos • {formatCurrency(service.avgValue)} ticket
                          médio
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-semibold">{formatCurrency(service.revenue)}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={service.growth >= 0 ? "default" : "destructive"}>
                            {service.growth >= 0 ? "+" : ""}
                            {service.growth.toFixed(1)}%
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {formatPercentage(service.profitMargin)} margem
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Service Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribuição de Receita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={servicePerformance}
                      dataKey="revenue"
                      nameKey="service"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                      {servicePerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Service Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Crescimento por Serviço</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={servicePerformance} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                    <YAxis type="category" dataKey="service" width={100} />
                    <Tooltip formatter={(value) => [`${value}%`, "Crescimento"]} />
                    <Bar dataKey="growth" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {predictiveInsights.map((insight, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getInsightIcon(insight.type)}
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription className="mt-1">{insight.description}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge
                        variant={
                          insight.impact === "high"
                            ? "destructive"
                            : insight.impact === "medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        Impacto{" "}
                        {insight.impact === "high"
                          ? "Alto"
                          : insight.impact === "medium"
                            ? "Médio"
                            : "Baixo"}
                      </Badge>
                      <p className="text-sm text-gray-600">{insight.confidence}% confiança</p>
                    </div>
                  </div>
                </CardHeader>
                {insight.actionItems && (
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Ações Recomendadas:</h4>
                      <ul className="space-y-1">
                        {insight.actionItems.map((action, actionIndex) => (
                          <li
                            key={actionIndex}
                            className="text-sm text-gray-600 flex items-start gap-2"
                          >
                            <span className="text-blue-600 mt-1">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Generate New Insights Button */}
          <Card>
            <CardContent className="p-6 text-center">
              <Button
                onClick={() => {
                  toast({
                    title: "Gerando Novos Insights",
                    description: "Analisando dados para identificar novas oportunidades...",
                  });
                  setTimeout(() => generateMockData(), 2000);
                }}
                className="w-full sm:w-auto"
              >
                <Target className="mr-2 h-4 w-4" />
                Gerar Novos Insights AI
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
