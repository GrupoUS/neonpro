"use client";

import React, { useState, useMemo } from "react";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Badge } from "@/components/ui/badge";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ScrollArea } from "@/components/ui/scroll-area";
import type { Separator } from "@/components/ui/separator";
import type { Progress } from "@/components/ui/progress";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Stethoscope,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Download,
  Share,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type { cn } from "@/lib/utils";
import type { KPI, KPIAlert } from "./hooks/useFinancialKPIs";

interface DrillDownData {
  id: string;
  label: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
  category: string;
  subcategory?: string;
  details: Record<string, any>;
}

interface TimeSeriesData {
  date: string;
  value: number;
  target?: number;
  previous?: number;
}

interface KPIDrillDownProps {
  kpi: KPI;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// Mock drill-down data generator
const generateDrillDownData = (kpi: KPI): DrillDownData[] => {
  const baseData: DrillDownData[] = [];

  switch (kpi.id) {
    case "revenue":
      return [
        {
          id: "facial-treatments",
          label: "Tratamentos Faciais",
          value: 45000,
          change: 12.5,
          trend: "up",
          category: "Serviços",
          subcategory: "Estética",
          details: {
            sessions: 156,
            avgTicket: 288.46,
            topProcedure: "Limpeza de Pele",
            growth: "+15.2%",
          },
        },
        {
          id: "body-treatments",
          label: "Tratamentos Corporais",
          value: 32000,
          change: 8.3,
          trend: "up",
          category: "Serviços",
          subcategory: "Estética",
          details: {
            sessions: 98,
            avgTicket: 326.53,
            topProcedure: "Massagem Modeladora",
            growth: "+8.3%",
          },
        },
        {
          id: "laser-treatments",
          label: "Laser e Luz",
          value: 28000,
          change: -2.1,
          trend: "down",
          category: "Serviços",
          subcategory: "Tecnologia",
          details: {
            sessions: 76,
            avgTicket: 368.42,
            topProcedure: "Laser CO2",
            growth: "-2.1%",
          },
        },
        {
          id: "injectables",
          label: "Injetáveis",
          value: 25000,
          change: 18.7,
          trend: "up",
          category: "Serviços",
          subcategory: "Procedimentos",
          details: {
            sessions: 54,
            avgTicket: 462.96,
            topProcedure: "Botox",
            growth: "+18.7%",
          },
        },
      ];

    case "profit-margin":
      return [
        {
          id: "high-margin",
          label: "Alta Margem (>60%)",
          value: 65.2,
          change: 3.1,
          trend: "up",
          category: "Margem",
          details: {
            revenue: 45000,
            cost: 15660,
            procedures: ["Botox", "Preenchimento", "Peeling"],
          },
        },
        {
          id: "medium-margin",
          label: "Média Margem (40-60%)",
          value: 52.8,
          change: -1.2,
          trend: "down",
          category: "Margem",
          details: {
            revenue: 32000,
            cost: 15104,
            procedures: ["Limpeza", "Hidratação", "Massagem"],
          },
        },
        {
          id: "low-margin",
          label: "Baixa Margem (<40%)",
          value: 35.4,
          change: -5.3,
          trend: "down",
          category: "Margem",
          details: {
            revenue: 28000,
            cost: 18088,
            procedures: ["Laser", "Equipamentos", "Materiais"],
          },
        },
      ];

    default:
      return [];
  }
};

// Generate time series data
const generateTimeSeriesData = (kpi: KPI): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const baseValue = kpi.value;
    const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
    const value = baseValue * (1 + variation);
    const target = kpi.target;
    const previous = baseValue * 0.95; // 5% lower than current

    data.push({
      date: format(date, "dd/MM", { locale: ptBR }),
      value: Math.round(value * 100) / 100,
      target,
      previous: Math.round(previous * 100) / 100,
    });
  }

  return data;
};

// Chart colors
const COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981",
  accent: "#f59e0b",
  danger: "#ef4444",
  muted: "#6b7280",
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function KPIDrillDown({ kpi, isOpen, onClose, className = "" }: KPIDrillDownProps) {
  const [activeTab, setActiveTab] = useState("breakdown");
  const [chartType, setChartType] = useState<"bar" | "pie" | "line">("bar");

  const drillDownData = useMemo(() => generateDrillDownData(kpi), [kpi]);
  const timeSeriesData = useMemo(() => generateTimeSeriesData(kpi), [kpi]);

  if (!isOpen) return null;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Get trend icon
  const getTrendIcon = (trend: "up" | "down" | "stable", change: number) => {
    if (trend === "up") {
      return (
        <TrendingUp className={cn("h-4 w-4", change > 0 ? "text-green-500" : "text-red-500")} />
      );
    } else if (trend === "down") {
      return (
        <TrendingDown className={cn("h-4 w-4", change < 0 ? "text-red-500" : "text-green-500")} />
      );
    }
    return <div className="h-4 w-4" />;
  };

  // Render breakdown chart
  const renderBreakdownChart = () => {
    if (chartType === "bar") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={drillDownData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" angle={-45} textAnchor="end" height={80} fontSize={12} />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [
                kpi.format === "currency" ? formatCurrency(value) : formatPercentage(value),
                "Valor",
              ]}
            />
            <Bar dataKey="value" fill={COLORS.primary} />
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (chartType === "pie") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={drillDownData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {drillDownData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [
                kpi.format === "currency" ? formatCurrency(value) : formatPercentage(value),
                "Valor",
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  // Render trend chart
  const renderTrendChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={timeSeriesData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          formatter={(value: number, name: string) => [
            kpi.format === "currency" ? formatCurrency(value) : formatPercentage(value),
            name === "value" ? "Atual" : name === "target" ? "Meta" : "Anterior",
          ]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={COLORS.primary}
          fill={COLORS.primary}
          fillOpacity={0.3}
        />
        <Line type="monotone" dataKey="target" stroke={COLORS.secondary} strokeDasharray="5 5" />
        <Line type="monotone" dataKey="previous" stroke={COLORS.muted} strokeDasharray="3 3" />
      </AreaChart>
    </ResponsiveContainer>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className={cn("w-full max-w-6xl max-h-[90vh] overflow-hidden", className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div>
                <CardTitle className="text-xl flex items-center space-x-2">
                  <span>{kpi.name}</span>
                  <Badge
                    variant={
                      kpi.status === "good"
                        ? "default"
                        : kpi.status === "warning"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {kpi.status === "good"
                      ? "Bom"
                      : kpi.status === "warning"
                        ? "Atenção"
                        : "Crítico"}
                  </Badge>
                </CardTitle>

                <CardDescription className="flex items-center space-x-4 mt-1">
                  <span className="text-2xl font-bold">
                    {kpi.format === "currency"
                      ? formatCurrency(kpi.value)
                      : formatPercentage(kpi.value)}
                  </span>

                  <div className="flex items-center space-x-1">
                    {getTrendIcon(kpi.trend, kpi.change)}
                    <span
                      className={cn(
                        "text-sm font-medium",
                        kpi.change > 0
                          ? "text-green-600"
                          : kpi.change < 0
                            ? "text-red-600"
                            : "text-gray-600",
                      )}
                    >
                      {kpi.change > 0 ? "+" : ""}
                      {formatPercentage(kpi.change)}
                    </span>
                  </div>

                  {kpi.target && (
                    <div className="text-sm text-muted-foreground">
                      Meta:{" "}
                      {kpi.format === "currency"
                        ? formatCurrency(kpi.target)
                        : formatPercentage(kpi.target)}
                    </div>
                  )}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>

              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="breakdown" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Detalhamento</span>
              </TabsTrigger>

              <TabsTrigger value="trends" className="flex items-center space-x-2">
                <LineChartIcon className="h-4 w-4" />
                <span>Tendências</span>
              </TabsTrigger>

              <TabsTrigger value="analysis" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Análise</span>
              </TabsTrigger>

              <TabsTrigger value="insights" className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Insights</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="breakdown" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Detalhamento por Categoria</h3>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={chartType === "bar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("bar")}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>

                  <Button
                    variant={chartType === "pie" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("pie")}
                  >
                    <PieChartIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Visualização</CardTitle>
                  </CardHeader>
                  <CardContent>{renderBreakdownChart()}</CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dados Detalhados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {drillDownData.map((item) => (
                          <div key={item.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{item.label}</h4>
                              <div className="flex items-center space-x-1">
                                {getTrendIcon(item.trend, item.change)}
                                <span
                                  className={cn(
                                    "text-sm font-medium",
                                    item.change > 0 ? "text-green-600" : "text-red-600",
                                  )}
                                >
                                  {item.change > 0 ? "+" : ""}
                                  {formatPercentage(item.change)}
                                </span>
                              </div>
                            </div>

                            <div className="text-lg font-bold mb-2">
                              {kpi.format === "currency"
                                ? formatCurrency(item.value)
                                : formatPercentage(item.value)}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                              {Object.entries(item.details).map(([key, value]) => (
                                <div key={key}>
                                  <span className="capitalize">{key}:</span> {value}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6 mt-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Evolução Temporal (30 dias)</h3>

                <Card>
                  <CardContent className="pt-6">{renderTrendChart()}</CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Tendência Geral</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(kpi.trend, kpi.change)}
                      <span className="text-lg font-bold">
                        {kpi.change > 0 ? "+" : ""}
                        {formatPercentage(kpi.change)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">vs. período anterior</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Volatilidade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">Baixa</div>
                    <Progress value={25} className="mt-2" />
                    <p className="text-sm text-muted-foreground mt-1">Variação de ±2.5%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Previsão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold text-green-600">Positiva</div>
                    <div className="text-sm text-muted-foreground mt-1">+5.2% próximos 30 dias</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6 mt-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Análise Comparativa</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Performance vs Meta</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Atual</span>
                          <span className="font-bold">
                            {kpi.format === "currency"
                              ? formatCurrency(kpi.value)
                              : formatPercentage(kpi.value)}
                          </span>
                        </div>

                        {kpi.target && (
                          <>
                            <div className="flex justify-between items-center">
                              <span>Meta</span>
                              <span className="font-bold">
                                {kpi.format === "currency"
                                  ? formatCurrency(kpi.target)
                                  : formatPercentage(kpi.target)}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progresso</span>
                                <span>{Math.round((kpi.value / kpi.target) * 100)}%</span>
                              </div>
                              <Progress value={(kpi.value / kpi.target) * 100} />
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Benchmark do Setor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Sua Performance</span>
                          <Badge variant="default">Acima da Média</Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Percentil</span>
                            <span className="font-medium">75º</span>
                          </div>
                          <Progress value={75} />
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Você está melhor que 75% das clínicas similares
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6 mt-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Insights e Recomendações</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Pontos Fortes</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• Crescimento consistente nos últimos 30 dias</li>
                        <li>• Performance acima da meta estabelecida</li>
                        <li>• Baixa volatilidade indica estabilidade</li>
                        <li>• Tendência positiva para próximo período</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <span>Oportunidades</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• Expandir serviços de alta margem</li>
                        <li>• Otimizar custos operacionais</li>
                        <li>• Implementar programas de fidelidade</li>
                        <li>• Investir em marketing digital</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ações Recomendadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-medium">Curto Prazo (1-2 semanas)</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Revisar precificação dos serviços de baixa margem e implementar promoções
                          para serviços de alta margem.
                        </p>
                      </div>

                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-medium">Médio Prazo (1-3 meses)</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Desenvolver programa de fidelidade e investir em treinamento da equipe
                          para aumentar ticket médio.
                        </p>
                      </div>

                      <div className="border-l-4 border-purple-500 pl-4">
                        <h4 className="font-medium">Longo Prazo (3-6 meses)</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Expandir portfólio de serviços e considerar abertura de nova unidade
                          baseada no crescimento atual.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
