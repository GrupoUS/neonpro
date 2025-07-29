"use client";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ChevronLeft,
  DollarSign,
  Minus,
  PieChart,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DrillDownLevel {
  id: string;
  name: string;
  value: number;
  percentage: number;
  trend: "up" | "down" | "neutral";
  trendValue: number;
  children?: DrillDownLevel[];
}

interface DrillDownData {
  kpiId: string;
  kpiName: string;
  totalValue: number;
  unit: string;
  levels: DrillDownLevel[];
  breadcrumb: Array<{ name: string; level: number }>;
  currentLevel: number;
  maxLevel: number;
}

interface DrillDownAnalysisProps {
  kpiId: string;
  kpiName: string;
  initialValue: number;
  unit: "currency" | "percentage" | "number" | "count";
  onClose: () => void;
}

export function DrillDownAnalysis({
  kpiId,
  kpiName,
  initialValue,
  unit,
  onClose,
}: DrillDownAnalysisProps) {
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  // Color palette for charts
  const getColorForIndex = (index: number) => {
    const colors = [
      "#0088FE",
      "#00C49F",
      "#FFBB28",
      "#FF8042",
      "#8884D8",
      "#82CA9D",
      "#FFC658",
      "#FF6B6B",
    ];
    return colors[index % colors.length];
  };

  useEffect(() => {
    loadDrillDownData();
  }, [kpiId, currentPath]);

  const loadDrillDownData = async () => {
    setLoading(true);

    // Mock data - In real implementation, this would come from the KPI Engine
    const mockData = generateMockDrillDownData(
      kpiId,
      kpiName,
      initialValue,
      unit
    );

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    setDrillDownData(mockData);
    setLoading(false);
  };

  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case "currency":
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value);
      case "percentage":
        return `${value.toFixed(1)}%`;
      case "count":
        return Math.round(value).toString();
      default:
        return value.toFixed(2);
    }
  };

  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case "down":
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const drillDown = (levelId: string, levelName: string) => {
    setCurrentPath([...currentPath, levelId]);
  };

  const navigateUp = (levelIndex: number) => {
    setCurrentPath(currentPath.slice(0, levelIndex));
  };

  const getChartData = () => {
    if (!drillDownData) return [];

    return drillDownData.levels.map((level) => ({
      name:
        level.name.length > 15
          ? level.name.substring(0, 15) + "..."
          : level.name,
      value: level.value,
      percentage: level.percentage,
      trend: level.trendValue,
    }));
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Carregando análise detalhada...</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!drillDownData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Erro ao carregar dados</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Não foi possível carregar os dados de análise detalhada.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = getChartData();

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Análise Detalhada: {drillDownData.kpiName}
              </CardTitle>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="#"
                      onClick={() => setCurrentPath([])}
                      className="text-sm"
                    >
                      {drillDownData.kpiName}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {drillDownData.breadcrumb.map((crumb, index) => (
                    <div key={index} className="flex items-center">
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {index === drillDownData.breadcrumb.length - 1 ? (
                          <BreadcrumbPage className="text-sm">
                            {crumb.name}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            href="#"
                            onClick={() => navigateUp(crumb.level)}
                            className="text-sm"
                          >
                            {crumb.name}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Valor Total
                </p>
                <p className="text-2xl font-bold">
                  {formatValue(drillDownData.totalValue, drillDownData.unit)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Componentes
                </p>
                <p className="text-2xl font-bold">
                  {drillDownData.levels.length}
                </p>
              </div>
              <PieChart className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Nível Atual
                </p>
                <p className="text-2xl font-bold">
                  {drillDownData.currentLevel + 1} / {drillDownData.maxLevel}
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição por Componente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis fontSize={12} />
                <Tooltip
                  formatter={(value: number) => [
                    formatValue(value, drillDownData.unit),
                    "Valor",
                  ]}
                />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Participação Percentual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="percentage"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getColorForIndex(index)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Detalhes por Componente
          </CardTitle>
          <CardDescription>
            Clique em um componente para fazer drill-down mais profundo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Componente</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Participação</TableHead>
                <TableHead className="text-right">Tendência</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drillDownData.levels.map((level) => (
                <TableRow
                  key={level.id}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{level.name}</TableCell>
                  <TableCell className="text-right">
                    {formatValue(level.value, drillDownData.unit)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">
                      {level.percentage.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {getTrendIcon(level.trend)}
                      <span className={`text-sm ${getTrendColor(level.trend)}`}>
                        {Math.abs(level.trendValue).toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {level.children && level.children.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => drillDown(level.id, level.name)}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Mock data generator
function generateMockDrillDownData(
  kpiId: string,
  kpiName: string,
  initialValue: number,
  unit: string
): DrillDownData {
  const mockDataStructures: Record<string, DrillDownLevel[]> = {
    total_revenue: [
      {
        id: "aesthetic_services",
        name: "Serviços Estéticos",
        value: initialValue * 0.65,
        percentage: 65,
        trend: "up",
        trendValue: 12.5,
        children: [
          {
            id: "facial_treatments",
            name: "Tratamentos Faciais",
            value: initialValue * 0.35,
            percentage: 35,
            trend: "up",
            trendValue: 8.2,
          },
          {
            id: "body_treatments",
            name: "Tratamentos Corporais",
            value: initialValue * 0.2,
            percentage: 20,
            trend: "up",
            trendValue: 15.1,
          },
          {
            id: "hair_removal",
            name: "Depilação",
            value: initialValue * 0.1,
            percentage: 10,
            trend: "down",
            trendValue: -2.3,
          },
        ],
      },
      {
        id: "wellness_services",
        name: "Serviços de Bem-estar",
        value: initialValue * 0.25,
        percentage: 25,
        trend: "up",
        trendValue: 8.7,
        children: [
          {
            id: "massage",
            name: "Massoterapia",
            value: initialValue * 0.15,
            percentage: 15,
            trend: "up",
            trendValue: 6.4,
          },
          {
            id: "aromatherapy",
            name: "Aromaterapia",
            value: initialValue * 0.1,
            percentage: 10,
            trend: "up",
            trendValue: 11.2,
          },
        ],
      },
      {
        id: "products",
        name: "Produtos",
        value: initialValue * 0.1,
        percentage: 10,
        trend: "neutral",
        trendValue: 0.5,
        children: [
          {
            id: "skincare",
            name: "Cuidados com a Pele",
            value: initialValue * 0.07,
            percentage: 7,
            trend: "up",
            trendValue: 3.1,
          },
          {
            id: "supplements",
            name: "Suplementos",
            value: initialValue * 0.03,
            percentage: 3,
            trend: "down",
            trendValue: -4.2,
          },
        ],
      },
    ],
    gross_margin: [
      {
        id: "high_margin_services",
        name: "Serviços Alta Margem",
        value: 75,
        percentage: 60,
        trend: "up",
        trendValue: 5.2,
      },
      {
        id: "medium_margin_services",
        name: "Serviços Média Margem",
        value: 50,
        percentage: 30,
        trend: "neutral",
        trendValue: 1.1,
      },
      {
        id: "low_margin_services",
        name: "Serviços Baixa Margem",
        value: 25,
        percentage: 10,
        trend: "down",
        trendValue: -2.8,
      },
    ],
  };

  const levels = mockDataStructures[kpiId] || [
    {
      id: "component_1",
      name: "Componente Principal",
      value: initialValue * 0.7,
      percentage: 70,
      trend: "up",
      trendValue: 5.2,
    },
    {
      id: "component_2",
      name: "Componente Secundário",
      value: initialValue * 0.3,
      percentage: 30,
      trend: "down",
      trendValue: -2.1,
    },
  ];

  return {
    kpiId,
    kpiName,
    totalValue: initialValue,
    unit,
    levels,
    breadcrumb: [],
    currentLevel: 0,
    maxLevel: 3,
  };
}
