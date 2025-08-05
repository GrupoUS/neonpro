"use client";

import type { endOfMonth, endOfYear, format, startOfMonth, startOfYear, subDays } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Eye,
  EyeOff,
  Filter,
  Info,
  Maximize2,
  Minimize2,
  PieChart,
  RefreshCw,
  Settings,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Progress } from "@/components/ui/progress";
import type { ScrollArea } from "@/components/ui/scroll-area";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Separator } from "@/components/ui/separator";
import type { Switch } from "@/components/ui/switch";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types for Financial KPI Dashboard
interface FinancialKPI {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  target?: number;
  unit: "currency" | "percentage" | "number";
  trend: "up" | "down" | "stable";
  changePercentage: number;
  category: "revenue" | "profitability" | "efficiency" | "liquidity";
  description: string;
  drillDownData?: DrillDownData[];
  alerts?: KPIAlert[];
  benchmarkData?: BenchmarkData;
}

interface DrillDownData {
  id: string;
  label: string;
  value: number;
  percentage: number;
  trend: "up" | "down" | "stable";
  subCategories?: DrillDownData[];
  metadata?: Record<string, any>;
}

interface KPIAlert {
  id: string;
  type: "warning" | "critical" | "info" | "success";
  message: string;
  threshold: number;
  currentValue: number;
  createdAt: Date;
  acknowledged: boolean;
}

interface BenchmarkData {
  industryAverage: number;
  topPerformers: number;
  clinicRanking: number;
  totalClinics: number;
}

interface DashboardFilter {
  dateRange: {
    start: Date;
    end: Date;
    preset: string;
  };
  services: string[];
  providers: string[];
  locations: string[];
  patientSegments: string[];
}

interface DashboardWidget {
  id: string;
  type: "kpi" | "chart" | "table" | "alert";
  title: string;
  size: "small" | "medium" | "large";
  position: { x: number; y: number };
  visible: boolean;
  config: Record<string, any>;
}

interface FinancialKPIDashboardProps {
  clinicId: string;
  userId: string;
  userRole: string;
  onKPIClick?: (kpi: FinancialKPI) => void;
  onExport?: (format: "pdf" | "excel" | "csv") => void;
  className?: string;
}

// Mock data generator for demonstration
const generateMockKPIs = (): FinancialKPI[] => {
  const baseDate = new Date();

  return [
    {
      id: "revenue-total",
      name: "Receita Total",
      value: 125000,
      previousValue: 118000,
      target: 130000,
      unit: "currency",
      trend: "up",
      changePercentage: 5.93,
      category: "revenue",
      description: "Receita total do período selecionado",
      drillDownData: [
        { id: "facial", label: "Tratamentos Faciais", value: 45000, percentage: 36, trend: "up" },
        { id: "body", label: "Tratamentos Corporais", value: 38000, percentage: 30.4, trend: "up" },
        { id: "laser", label: "Laser e Luz", value: 25000, percentage: 20, trend: "stable" },
        { id: "products", label: "Produtos", value: 17000, percentage: 13.6, trend: "down" },
      ],
      alerts: [
        {
          id: "revenue-target",
          type: "info",
          message: "Receita 3.8% abaixo da meta mensal",
          threshold: 130000,
          currentValue: 125000,
          createdAt: new Date(),
          acknowledged: false,
        },
      ],
      benchmarkData: {
        industryAverage: 110000,
        topPerformers: 150000,
        clinicRanking: 15,
        totalClinics: 100,
      },
    },
    {
      id: "profit-margin",
      name: "Margem de Lucro",
      value: 32.5,
      previousValue: 28.3,
      target: 35,
      unit: "percentage",
      trend: "up",
      changePercentage: 14.84,
      category: "profitability",
      description: "Margem de lucro líquido sobre receita",
      drillDownData: [
        { id: "gross-margin", label: "Margem Bruta", value: 65.2, percentage: 100, trend: "up" },
        {
          id: "operating-margin",
          label: "Margem Operacional",
          value: 42.1,
          percentage: 64.6,
          trend: "up",
        },
        { id: "net-margin", label: "Margem Líquida", value: 32.5, percentage: 49.8, trend: "up" },
      ],
      benchmarkData: {
        industryAverage: 25.8,
        topPerformers: 40.2,
        clinicRanking: 8,
        totalClinics: 100,
      },
    },
    {
      id: "ebitda",
      name: "EBITDA",
      value: 48500,
      previousValue: 42300,
      target: 52000,
      unit: "currency",
      trend: "up",
      changePercentage: 14.66,
      category: "profitability",
      description: "Lucro antes de juros, impostos, depreciação e amortização",
      drillDownData: [
        {
          id: "operating-income",
          label: "Receita Operacional",
          value: 125000,
          percentage: 100,
          trend: "up",
        },
        {
          id: "operating-expenses",
          label: "Despesas Operacionais",
          value: -76500,
          percentage: -61.2,
          trend: "down",
        },
        { id: "ebitda-result", label: "EBITDA", value: 48500, percentage: 38.8, trend: "up" },
      ],
    },
    {
      id: "cash-flow",
      name: "Fluxo de Caixa",
      value: 35200,
      previousValue: 28900,
      target: 40000,
      unit: "currency",
      trend: "up",
      changePercentage: 21.8,
      category: "liquidity",
      description: "Fluxo de caixa operacional do período",
      alerts: [
        {
          id: "cash-flow-warning",
          type: "warning",
          message: "Fluxo de caixa projetado para próxima semana abaixo do ideal",
          threshold: 40000,
          currentValue: 35200,
          createdAt: new Date(),
          acknowledged: false,
        },
      ],
    },
    {
      id: "roi",
      name: "ROI",
      value: 18.7,
      previousValue: 16.2,
      target: 20,
      unit: "percentage",
      trend: "up",
      changePercentage: 15.43,
      category: "efficiency",
      description: "Retorno sobre investimento",
      benchmarkData: {
        industryAverage: 14.5,
        topPerformers: 25.3,
        clinicRanking: 12,
        totalClinics: 100,
      },
    },
    {
      id: "patient-ltv",
      name: "LTV do Paciente",
      value: 2850,
      previousValue: 2650,
      target: 3000,
      unit: "currency",
      trend: "up",
      changePercentage: 7.55,
      category: "efficiency",
      description: "Valor vitalício médio do paciente",
    },
  ];
};

const generateMockWidgets = (): DashboardWidget[] => [
  {
    id: "revenue-kpi",
    type: "kpi",
    title: "Receita Total",
    size: "medium",
    position: { x: 0, y: 0 },
    visible: true,
    config: {},
  },
  {
    id: "profit-kpi",
    type: "kpi",
    title: "Margem de Lucro",
    size: "medium",
    position: { x: 1, y: 0 },
    visible: true,
    config: {},
  },
  {
    id: "ebitda-kpi",
    type: "kpi",
    title: "EBITDA",
    size: "medium",
    position: { x: 2, y: 0 },
    visible: true,
    config: {},
  },
  {
    id: "cash-flow-kpi",
    type: "kpi",
    title: "Fluxo de Caixa",
    size: "medium",
    position: { x: 0, y: 1 },
    visible: true,
    config: {},
  },
  {
    id: "roi-kpi",
    type: "kpi",
    title: "ROI",
    size: "medium",
    position: { x: 1, y: 1 },
    visible: true,
    config: {},
  },
  {
    id: "ltv-kpi",
    type: "kpi",
    title: "LTV Paciente",
    size: "medium",
    position: { x: 2, y: 1 },
    visible: true,
    config: {},
  },
];

export default function FinancialKPIDashboard({
  clinicId,
  userId,
  userRole,
  onKPIClick,
  onExport,
  className = "",
}: FinancialKPIDashboardProps) {
  // State management
  const [kpis, setKpis] = useState<FinancialKPI[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [selectedKPI, setSelectedKPI] = useState<FinancialKPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Filter state
  const [filters, setFilters] = useState<DashboardFilter>({
    dateRange: {
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date()),
      preset: "current-month",
    },
    services: [],
    providers: [],
    locations: [],
    patientSegments: [],
  });

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call with realistic delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockKPIs = generateMockKPIs();
      const mockWidgets = generateMockWidgets();

      setKpis(mockKPIs);
      setWidgets(mockWidgets);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Auto-refresh effect
  useEffect(() => {
    loadDashboardData();

    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [loadDashboardData, autoRefresh, refreshInterval]);

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Format number
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat("pt-BR").format(value);
  };

  // Get formatted value based on unit
  const getFormattedValue = (kpi: FinancialKPI): string => {
    switch (kpi.unit) {
      case "currency":
        return formatCurrency(kpi.value);
      case "percentage":
        return formatPercentage(kpi.value);
      case "number":
        return formatNumber(kpi.value);
      default:
        return kpi.value.toString();
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "stable":
        return <Activity className="h-4 w-4 text-yellow-500" />;
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "revenue":
        return <DollarSign className="h-5 w-5" />;
      case "profitability":
        return <PieChart className="h-5 w-5" />;
      case "efficiency":
        return <Target className="h-5 w-5" />;
      case "liquidity":
        return <Activity className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  // Handle KPI click for drill-down
  const handleKPIClick = (kpi: FinancialKPI) => {
    setSelectedKPI(kpi);
    onKPIClick?.(kpi);
  };

  // Handle export
  const handleExport = (format: "pdf" | "excel" | "csv") => {
    onExport?.(format);
  };

  // Filter KPIs by category
  const getKPIsByCategory = (category: string) => {
    return kpis.filter((kpi) => kpi.category === category);
  };

  // Get active alerts
  const activeAlerts = useMemo(() => {
    return kpis.flatMap((kpi) => kpi.alerts || []).filter((alert) => !alert.acknowledged);
  }, [kpis]);

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Carregando dashboard financeiro...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
          <p className="text-muted-foreground">
            Última atualização: {format(lastUpdated, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Auto-refresh toggle */}
          <div className="flex items-center space-x-2">
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} id="auto-refresh" />
            <Label htmlFor="auto-refresh" className="text-sm">
              Auto-refresh
            </Label>
          </div>

          {/* Refresh button */}
          <Button variant="outline" size="sm" onClick={loadDashboardData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          {/* Customize button */}
          <Button variant="outline" size="sm" onClick={() => setIsCustomizing(!isCustomizing)}>
            <Settings className="h-4 w-4 mr-2" />
            Personalizar
          </Button>

          {/* Export dropdown */}
          <Select onValueChange={(value) => handleExport(value as "pdf" | "excel" | "csv")}>
            <SelectTrigger className="w-32">
              <Download className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Exportar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          {activeAlerts.map((alert) => (
            <Alert
              key={alert.id}
              className={`border-l-4 ${
                alert.type === "critical"
                  ? "border-red-500 bg-red-50"
                  : alert.type === "warning"
                    ? "border-yellow-500 bg-yellow-50"
                    : alert.type === "info"
                      ? "border-blue-500 bg-blue-50"
                      : "border-green-500 bg-green-50"
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="profitability">Lucratividade</TabsTrigger>
          <TabsTrigger value="efficiency">Eficiência</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kpis.map((kpi) => (
              <Card
                key={kpi.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleKPIClick(kpi)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.name}</CardTitle>
                  {getCategoryIcon(kpi.category)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getFormattedValue(kpi)}</div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    {getTrendIcon(kpi.trend)}
                    <span
                      className={`${
                        kpi.trend === "up"
                          ? "text-green-600"
                          : kpi.trend === "down"
                            ? "text-red-600"
                            : "text-yellow-600"
                      }`}
                    >
                      {kpi.changePercentage > 0 ? "+" : ""}
                      {kpi.changePercentage.toFixed(1)}%
                    </span>
                    <span>vs período anterior</span>
                  </div>

                  {kpi.target && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Meta</span>
                        <span>
                          {kpi.unit === "currency"
                            ? formatCurrency(kpi.target)
                            : kpi.unit === "percentage"
                              ? formatPercentage(kpi.target)
                              : formatNumber(kpi.target)}
                        </span>
                      </div>
                      <Progress value={(kpi.value / kpi.target) * 100} className="h-2" />
                    </div>
                  )}

                  {kpi.alerts && kpi.alerts.length > 0 && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {kpi.alerts.length} alerta{kpi.alerts.length > 1 ? "s" : ""}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getKPIsByCategory("revenue").map((kpi) => (
              <Card key={kpi.id} className="cursor-pointer" onClick={() => handleKPIClick(kpi)}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>{kpi.name}</span>
                  </CardTitle>
                  <CardDescription>{kpi.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">{getFormattedValue(kpi)}</div>

                  {kpi.drillDownData && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Detalhamento:</h4>
                      {kpi.drillDownData.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <span className="text-sm">{item.label}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {formatCurrency(item.value)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {item.percentage.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {kpi.benchmarkData && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-sm mb-2">Benchmark:</h4>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>
                          Média do setor: {formatCurrency(kpi.benchmarkData.industryAverage)}
                        </div>
                        <div>Top performers: {formatCurrency(kpi.benchmarkData.topPerformers)}</div>
                        <div>
                          Ranking: {kpi.benchmarkData.clinicRanking}º de{" "}
                          {kpi.benchmarkData.totalClinics}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Profitability Tab */}
        <TabsContent value="profitability" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getKPIsByCategory("profitability").map((kpi) => (
              <Card key={kpi.id} className="cursor-pointer" onClick={() => handleKPIClick(kpi)}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>{kpi.name}</span>
                  </CardTitle>
                  <CardDescription>{kpi.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">{getFormattedValue(kpi)}</div>

                  {kpi.drillDownData && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Análise:</h4>
                      {kpi.drillDownData.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <span className="text-sm">{item.label}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {kpi.unit === "percentage"
                                ? formatPercentage(item.value)
                                : formatCurrency(item.value)}
                            </span>
                            {getTrendIcon(item.trend)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Efficiency Tab */}
        <TabsContent value="efficiency" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getKPIsByCategory("efficiency").map((kpi) => (
              <Card key={kpi.id} className="cursor-pointer" onClick={() => handleKPIClick(kpi)}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>{kpi.name}</span>
                  </CardTitle>
                  <CardDescription>{kpi.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">{getFormattedValue(kpi)}</div>

                  {kpi.benchmarkData && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm mb-2">Performance vs Mercado:</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Sua clínica</span>
                          <span className="font-medium">{getFormattedValue(kpi)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Média do setor</span>
                          <span>
                            {kpi.unit === "percentage"
                              ? formatPercentage(kpi.benchmarkData.industryAverage)
                              : formatCurrency(kpi.benchmarkData.industryAverage)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Top 10%</span>
                          <span>
                            {kpi.unit === "percentage"
                              ? formatPercentage(kpi.benchmarkData.topPerformers)
                              : formatCurrency(kpi.benchmarkData.topPerformers)}
                          </span>
                        </div>
                        <Progress
                          value={(kpi.value / kpi.benchmarkData.topPerformers) * 100}
                          className="h-2 mt-2"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Drill-down Modal/Panel */}
      {selectedKPI && (
        <Card className="fixed inset-4 z-50 bg-background shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                {getCategoryIcon(selectedKPI.category)}
                <span>{selectedKPI.name} - Análise Detalhada</span>
              </CardTitle>
              <CardDescription>{selectedKPI.description}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedKPI(null)}>
              <Minimize2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-6">
                {/* KPI Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{getFormattedValue(selectedKPI)}</div>
                    <div className="text-sm text-muted-foreground">Valor Atual</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold flex items-center justify-center space-x-1">
                      {getTrendIcon(selectedKPI.trend)}
                      <span
                        className={`${
                          selectedKPI.trend === "up"
                            ? "text-green-600"
                            : selectedKPI.trend === "down"
                              ? "text-red-600"
                              : "text-yellow-600"
                        }`}
                      >
                        {selectedKPI.changePercentage > 0 ? "+" : ""}
                        {selectedKPI.changePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">Variação</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {selectedKPI.target
                        ? selectedKPI.unit === "currency"
                          ? formatCurrency(selectedKPI.target)
                          : selectedKPI.unit === "percentage"
                            ? formatPercentage(selectedKPI.target)
                            : formatNumber(selectedKPI.target)
                        : "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">Meta</div>
                  </div>
                </div>

                {/* Drill-down Data */}
                {selectedKPI.drillDownData && (
                  <div>
                    <h3 className="font-semibold mb-4">Detalhamento por Categoria</h3>
                    <div className="space-y-3">
                      {selectedKPI.drillDownData.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="font-medium">{item.label}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.percentage.toFixed(1)}% do total
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">
                              {selectedKPI.unit === "currency"
                                ? formatCurrency(item.value)
                                : selectedKPI.unit === "percentage"
                                  ? formatPercentage(item.value)
                                  : formatNumber(item.value)}
                            </span>
                            {getTrendIcon(item.trend)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benchmark Data */}
                {selectedKPI.benchmarkData && (
                  <div>
                    <h3 className="font-semibold mb-4">Benchmark de Mercado</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Média do Setor</div>
                        <div className="font-semibold">
                          {selectedKPI.unit === "currency"
                            ? formatCurrency(selectedKPI.benchmarkData.industryAverage)
                            : selectedKPI.unit === "percentage"
                              ? formatPercentage(selectedKPI.benchmarkData.industryAverage)
                              : formatNumber(selectedKPI.benchmarkData.industryAverage)}
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Top Performers</div>
                        <div className="font-semibold">
                          {selectedKPI.unit === "currency"
                            ? formatCurrency(selectedKPI.benchmarkData.topPerformers)
                            : selectedKPI.unit === "percentage"
                              ? formatPercentage(selectedKPI.benchmarkData.topPerformers)
                              : formatNumber(selectedKPI.benchmarkData.topPerformers)}
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg col-span-2">
                        <div className="text-sm text-muted-foreground">Posição no Ranking</div>
                        <div className="font-semibold">
                          {selectedKPI.benchmarkData.clinicRanking}º lugar de{" "}
                          {selectedKPI.benchmarkData.totalClinics} clínicas
                        </div>
                        <Progress
                          value={
                            ((selectedKPI.benchmarkData.totalClinics -
                              selectedKPI.benchmarkData.clinicRanking +
                              1) /
                              selectedKPI.benchmarkData.totalClinics) *
                            100
                          }
                          className="h-2 mt-2"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Alerts */}
                {selectedKPI.alerts && selectedKPI.alerts.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-4">Alertas Ativos</h3>
                    <div className="space-y-2">
                      {selectedKPI.alerts.map((alert) => (
                        <Alert
                          key={alert.id}
                          className={`${
                            alert.type === "critical"
                              ? "border-red-500"
                              : alert.type === "warning"
                                ? "border-yellow-500"
                                : alert.type === "info"
                                  ? "border-blue-500"
                                  : "border-green-500"
                          }`}
                        >
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="flex justify-between items-start">
                              <span>{alert.message}</span>
                              <Badge variant="outline" className="ml-2">
                                {alert.type}
                              </Badge>
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
