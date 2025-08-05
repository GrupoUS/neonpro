"use client";

import type {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  Clock,
  DollarSign,
  Download,
  Filter,
  Package,
  PieChart as PieChartIcon,
  RotateCcw,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import type {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DatePickerWithRange } from "@/components/ui/date-range-picker";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { useInventory } from "@/hooks/inventory/use-inventory";
import type { useReports } from "@/hooks/inventory/use-reports";
import type { CustomReportBuilder } from "./custom-report-builder";

interface AnalyticsKPI {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: "increase" | "decrease" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface InventoryAnalyticsData {
  stockTurnoverData: Array<{
    product: string;
    turnoverRate: number;
    daysInStock: number;
    value: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    value: number;
    volume: number;
    margin: number;
    fill: string;
  }>;
  movementTrends: Array<{
    date: string;
    stockIn: number;
    stockOut: number;
    netMovement: number;
  }>;
  abcAnalysis: Array<{
    category: "A" | "B" | "C";
    products: number;
    revenue: number;
    percentage: number;
    fill: string;
  }>;
  seasonalTrends: Array<{
    month: string;
    demand: number;
    supply: number;
    shortage: number;
  }>;
  supplierPerformance: Array<{
    supplier: string;
    deliveryTime: number;
    qualityScore: number;
    costEfficiency: number;
    reliability: number;
  }>;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1", "#d084d0"];

export function AdvancedAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const { state: inventoryState, isLoading } = useInventory();
  const { generateAnalytics, exportReport, isGenerating } = useReports();

  // Mock data - in production, this would come from useReports hook
  const analyticsData: InventoryAnalyticsData = useMemo(
    () => ({
      stockTurnoverData: [
        { product: "Produto A", turnoverRate: 12.5, daysInStock: 29, value: 85000 },
        { product: "Produto B", turnoverRate: 8.2, daysInStock: 44, value: 62000 },
        { product: "Produto C", turnoverRate: 15.8, daysInStock: 23, value: 78000 },
        { product: "Produto D", turnoverRate: 6.1, daysInStock: 60, value: 45000 },
        { product: "Produto E", turnoverRate: 11.3, daysInStock: 32, value: 69000 },
      ],
      categoryPerformance: [
        { category: "Medicamentos", value: 45, volume: 2800, margin: 32, fill: "#8884d8" },
        { category: "Materiais", value: 28, volume: 1900, margin: 28, fill: "#82ca9d" },
        { category: "Equipamentos", value: 15, volume: 680, margin: 45, fill: "#ffc658" },
        { category: "Consumíveis", value: 12, volume: 1200, margin: 18, fill: "#ff7c7c" },
      ],
      movementTrends: [
        { date: "01/01", stockIn: 850, stockOut: 720, netMovement: 130 },
        { date: "02/01", stockIn: 920, stockOut: 890, netMovement: 30 },
        { date: "03/01", stockIn: 780, stockOut: 950, netMovement: -170 },
        { date: "04/01", stockIn: 1100, stockOut: 820, netMovement: 280 },
        { date: "05/01", stockIn: 890, stockOut: 1050, netMovement: -160 },
        { date: "06/01", stockIn: 1200, stockOut: 980, netMovement: 220 },
        { date: "07/01", stockIn: 950, stockOut: 1100, netMovement: -150 },
      ],
      abcAnalysis: [
        { category: "A", products: 15, revenue: 75, percentage: 75, fill: "#ff4444" },
        { category: "B", products: 35, revenue: 20, percentage: 20, fill: "#ffaa44" },
        { category: "C", products: 50, revenue: 5, percentage: 5, fill: "#44ff44" },
      ],
      seasonalTrends: [
        { month: "Jan", demand: 85, supply: 90, shortage: 5 },
        { month: "Fev", demand: 92, supply: 88, shortage: 12 },
        { month: "Mar", demand: 78, supply: 95, shortage: 2 },
        { month: "Abr", demand: 105, supply: 82, shortage: 18 },
        { month: "Mai", demand: 98, supply: 105, shortage: 0 },
        { month: "Jun", demand: 112, supply: 98, shortage: 14 },
      ],
      supplierPerformance: [
        {
          supplier: "Fornecedor A",
          deliveryTime: 85,
          qualityScore: 92,
          costEfficiency: 78,
          reliability: 90,
        },
        {
          supplier: "Fornecedor B",
          deliveryTime: 72,
          qualityScore: 88,
          costEfficiency: 85,
          reliability: 85,
        },
        {
          supplier: "Fornecedor C",
          deliveryTime: 95,
          qualityScore: 78,
          costEfficiency: 92,
          reliability: 80,
        },
        {
          supplier: "Fornecedor D",
          deliveryTime: 68,
          qualityScore: 95,
          costEfficiency: 80,
          reliability: 95,
        },
      ],
    }),
    [refreshKey],
  );

  const kpis: AnalyticsKPI[] = useMemo(
    () => [
      {
        id: "turnover",
        title: "Giro de Estoque",
        value: "11.2x",
        change: 8.5,
        changeType: "increase",
        icon: RotateCcw,
        description: "Velocidade média de rotação do estoque",
      },
      {
        id: "accuracy",
        title: "Acurácia do Estoque",
        value: "98.7%",
        change: 2.1,
        changeType: "increase",
        icon: Target,
        description: "Precisão entre estoque físico e sistema",
      },
      {
        id: "carrying-cost",
        title: "Custo de Estoque",
        value: "R$ 485.2K",
        change: -5.8,
        changeType: "decrease",
        icon: DollarSign,
        description: "Valor total investido em estoque",
      },
      {
        id: "stockout-rate",
        title: "Taxa de Ruptura",
        value: "2.3%",
        change: -15.2,
        changeType: "decrease",
        icon: AlertTriangle,
        description: "Percentual de produtos em falta",
      },
      {
        id: "fill-rate",
        title: "Taxa de Atendimento",
        value: "97.8%",
        change: 3.2,
        changeType: "increase",
        icon: Package,
        description: "Percentual de pedidos atendidos completamente",
      },
      {
        id: "avg-lead-time",
        title: "Lead Time Médio",
        value: "12.5 dias",
        change: -8.1,
        changeType: "decrease",
        icon: Clock,
        description: "Tempo médio de reposição",
      },
    ],
    [],
  );

  const handleRefreshData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleExportReport = async (type: "pdf" | "excel") => {
    try {
      await exportReport({
        type,
        dateRange,
        category: selectedCategory,
        supplier: selectedSupplier,
        includeCharts: true,
        includeKPIs: true,
      });
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Avançados de Estoque</h1>
          <p className="text-muted-foreground mt-1">
            Análise detalhada de performance e otimização de inventário
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <DatePickerWithRange
            value={dateRange}
            onChange={setDateRange}
            placeholder="Selecionar período"
          />

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="medicamentos">Medicamentos</SelectItem>
              <SelectItem value="materiais">Materiais</SelectItem>
              <SelectItem value="equipamentos">Equipamentos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Fornecedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="fornecedor-a">Fornecedor A</SelectItem>
              <SelectItem value="fornecedor-b">Fornecedor B</SelectItem>
              <SelectItem value="fornecedor-c">Fornecedor C</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleRefreshData}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>

          <Button variant="outline" size="sm" onClick={() => handleExportReport("pdf")}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>

          <Button variant="outline" size="sm" onClick={() => handleExportReport("excel")}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.id} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {kpi.changeType === "increase" ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : kpi.changeType === "decrease" ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <Activity className="h-3 w-3 text-blue-500" />
                  )}
                  <span
                    className={
                      kpi.changeType === "increase"
                        ? "text-green-500"
                        : kpi.changeType === "decrease"
                          ? "text-red-500"
                          : "text-blue-500"
                    }
                  >
                    {Math.abs(kpi.change)}%
                  </span>
                  <span>vs período anterior</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="turnover" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
          <TabsTrigger value="turnover">Giro de Estoque</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
          <TabsTrigger value="abc">Análise ABC</TabsTrigger>
          <TabsTrigger value="seasonal">Sazonalidade</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>
        {/* Stock Turnover Analysis */}
        <TabsContent value="turnover" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Giro por Produto</CardTitle>
                <CardDescription>Velocidade de rotação dos principais produtos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.stockTurnoverData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="product"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value}${name === "turnoverRate" ? "x" : name === "daysInStock" ? " dias" : ""}`,
                        name === "turnoverRate"
                          ? "Giro"
                          : name === "daysInStock"
                            ? "Dias em Estoque"
                            : "Valor",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="turnoverRate" fill="#8884d8" name="Taxa de Giro" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dias em Estoque</CardTitle>
                <CardDescription>Tempo médio de permanência no estoque</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.stockTurnoverData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="product"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} dias`, "Dias em Estoque"]} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="daysInStock"
                      stroke="#82ca9d"
                      strokeWidth={3}
                      name="Dias em Estoque"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>{" "}
        {/* Category Performance Analysis */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance por Categoria</CardTitle>
                <CardDescription>Distribuição de valor por categoria de produtos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.categoryPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, value }) => `${category}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "Participação"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Volume vs Margem</CardTitle>
                <CardDescription>
                  Análise de volume de vendas versus margem de lucro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.categoryPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="volume" fill="#8884d8" name="Volume" />
                    <Bar yAxisId="right" dataKey="margin" fill="#82ca9d" name="Margem %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* Stock Movements Analysis */}
        <TabsContent value="movements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendências de Movimentação</CardTitle>
              <CardDescription>Análise temporal das entradas e saídas de estoque</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analyticsData.movementTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="stockIn"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    name="Entradas"
                  />
                  <Area
                    type="monotone"
                    dataKey="stockOut"
                    stackId="2"
                    stroke="#ff7c7c"
                    fill="#ff7c7c"
                    name="Saídas"
                  />
                  <Line
                    type="monotone"
                    dataKey="netMovement"
                    stroke="#8884d8"
                    strokeWidth={3}
                    name="Movimento Líquido"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        {/* ABC Analysis */}
        <TabsContent value="abc" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise ABC - Receita</CardTitle>
                <CardDescription>
                  Classificação dos produtos por importância na receita
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <FunnelChart>
                    <Tooltip />
                    <Funnel dataKey="revenue" data={analyticsData.abcAnalysis} isAnimationActive>
                      <LabelList position="right" fill="#000" stroke="none" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição ABC</CardTitle>
                <CardDescription>Percentual de produtos em cada categoria</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.abcAnalysis.map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={
                          item.category === "A"
                            ? "destructive"
                            : item.category === "B"
                              ? "default"
                              : "secondary"
                        }
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                      >
                        {item.category}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">Categoria {item.category}</p>
                        <p className="text-xs text-muted-foreground">{item.products} produtos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.revenue}%</p>
                      <p className="text-xs text-muted-foreground">da receita</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* Seasonal Analysis */}
        <TabsContent value="seasonal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise Sazonal</CardTitle>
              <CardDescription>Padrões de demanda e suprimento ao longo do ano</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.seasonalTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="demand"
                    stroke="#8884d8"
                    strokeWidth={3}
                    name="Demanda"
                  />
                  <Line
                    type="monotone"
                    dataKey="supply"
                    stroke="#82ca9d"
                    strokeWidth={3}
                    name="Suprimento"
                  />
                  <Line
                    type="monotone"
                    dataKey="shortage"
                    stroke="#ff7c7c"
                    strokeWidth={3}
                    name="Falta"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Supplier Performance Analysis */}
        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance dos Fornecedores</CardTitle>
              <CardDescription>
                Análise multidimensional da performance dos fornecedores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={analyticsData.supplierPerformance}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="supplier" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Tempo de Entrega"
                    dataKey="deliveryTime"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Qualidade"
                    dataKey="qualityScore"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Custo-Eficiência"
                    dataKey="costEfficiency"
                    stroke="#ffc658"
                    fill="#ffc658"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Confiabilidade"
                    dataKey="reliability"
                    stroke="#ff7c7c"
                    fill="#ff7c7c"
                    fillOpacity={0.6}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Custom Reports */}
        <TabsContent value="reports" className="space-y-6">
          <CustomReportBuilder />
        </TabsContent>
      </Tabs>

      {/* Additional Insights Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span>Insights Automáticos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-blue-800">
                Produto A tem alta rotação mas baixo estoque de segurança
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <p className="text-sm text-yellow-800">
                Categoria Medicamentos apresenta sazonalidade no Q2
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-green-800">Fornecedor D oferece melhor custo-benefício</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <span>Recomendações</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
              <div>
                <p className="text-sm font-medium">Aumentar estoque de Produto A</p>
                <p className="text-xs text-muted-foreground">Risco de ruptura em 7 dias</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
              <div>
                <p className="text-sm font-medium">Revisar política de Categoria C</p>
                <p className="text-xs text-muted-foreground">Baixa rotação, alto custo</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div>
                <p className="text-sm font-medium">Negociar com Fornecedor B</p>
                <p className="text-xs text-muted-foreground">Oportunidade de redução de 8%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <span>Próximas Ações</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm">Atualizar previsão Q2</p>
              <Badge variant="outline">Em 2 dias</Badge>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">Auditoria física</p>
              <Badge variant="outline">Próxima semana</Badge>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">Reunião fornecedores</p>
              <Badge variant="outline">15/02</Badge>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">Relatório mensal</p>
              <Badge variant="outline">Fim do mês</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
