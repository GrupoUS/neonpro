"use client";

import type {
  Activity,
  BarChart3,
  Calendar,
  Download,
  Filter,
  LineChart as LineChartIcon,
  Maximize2,
  Minimize2,
  MoreVertical,
  PieChart as PieChartIcon,
  RefreshCw,
  Settings,
  Share,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import type {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Skeleton } from "@/components/ui/skeleton";
import type {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
import type { ChartData, ChartType, DashboardWidget } from "@/lib/dashboard/types";

interface ChartWidgetProps {
  widget: DashboardWidget;
  isEditing?: boolean;
  onUpdate?: (updates: Partial<DashboardWidget>) => void;
}

interface ChartConfig {
  type: ChartType;
  showGrid: boolean;
  showLegend: boolean;
  showTooltip: boolean;
  showBrush: boolean;
  showReferenceLine: boolean;
  referenceValue?: number;
  colors: string[];
  height: number;
  animation: boolean;
  responsive: boolean;
  timeRange: "7d" | "30d" | "90d" | "1y" | "all";
  aggregation: "hour" | "day" | "week" | "month";
}

interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
  category?: string;
  [key: string]: any;
}

const CHART_TYPES = {
  line: {
    icon: LineChartIcon,
    label: "Line Chart",
    component: LineChart,
  },
  area: {
    icon: Activity,
    label: "Area Chart",
    component: AreaChart,
  },
  bar: {
    icon: BarChart3,
    label: "Bar Chart",
    component: BarChart,
  },
  pie: {
    icon: PieChartIcon,
    label: "Pie Chart",
    component: PieChart,
  },
};

const DEFAULT_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
  "#ec4899", // pink
  "#6b7280", // gray
];

const TIME_RANGES = {
  "7d": { label: "7 Days", days: 7 },
  "30d": { label: "30 Days", days: 30 },
  "90d": { label: "90 Days", days: 90 },
  "1y": { label: "1 Year", days: 365 },
  all: { label: "All Time", days: null },
};

const AGGREGATIONS = {
  hour: { label: "Hourly", format: "HH:mm" },
  day: { label: "Daily", format: "MMM dd" },
  week: { label: "Weekly", format: "MMM dd" },
  month: { label: "Monthly", format: "MMM yyyy" },
};

export function ChartWidget({ widget, isEditing, onUpdate }: ChartWidgetProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("30d");
  const [selectedAggregation, setSelectedAggregation] = useState<string>("day");

  const config: ChartConfig = {
    type: "line",
    showGrid: true,
    showLegend: true,
    showTooltip: true,
    showBrush: false,
    showReferenceLine: false,
    colors: DEFAULT_COLORS,
    height: 300,
    animation: true,
    responsive: true,
    timeRange: "30d",
    aggregation: "day",
    ...widget.config,
  };

  // Fetch chart data
  useEffect(() => {
    const fetchData = async () => {
      if (!widget.dataSource) {
        setError("No data source configured");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Simulate API call - replace with actual implementation
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Generate mock data based on time range and aggregation
        const mockData = generateMockChartData(
          selectedTimeRange as any,
          selectedAggregation as any,
          config.type,
        );

        setData(mockData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load chart data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up auto-refresh
    if (widget.refreshInterval && widget.refreshInterval > 0) {
      const interval = setInterval(fetchData, widget.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [
    widget.dataSource,
    widget.refreshInterval,
    selectedTimeRange,
    selectedAggregation,
    config.type,
  ]);

  // Process data for different chart types
  const processedData = useMemo(() => {
    if (!data.length) return [];

    switch (config.type) {
      case "pie": {
        // Aggregate data for pie chart
        const pieData = data.reduce(
          (acc, item) => {
            const category = item.category || "Other";
            const existing = acc.find((d) => d.name === category);
            if (existing) {
              existing.value += item.value;
            } else {
              acc.push({ name: category, value: item.value });
            }
            return acc;
          },
          [] as { name: string; value: number }[],
        );
        return pieData;
      }

      default:
        return data.map((item) => ({
          ...item,
          timestamp: formatTimestamp(item.timestamp, selectedAggregation as any),
        }));
    }
  }, [data, config.type, selectedAggregation]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    if (!data.length) return null;

    const values = data.map((d) => d.value);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Calculate trend
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    const trend = secondAvg > firstAvg ? "up" : secondAvg < firstAvg ? "down" : "stable";
    const trendPercentage = firstAvg !== 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

    return {
      total,
      average,
      min,
      max,
      trend,
      trendPercentage: Math.abs(trendPercentage),
      count: values.length,
    };
  }, [data]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    // Trigger data refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Handle export
  const handleExport = () => {
    const csvContent = data.map((row) => Object.values(row).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${widget.title}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Render chart based on type
  const renderChart = () => {
    if (!processedData.length) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <div>No data available</div>
          </div>
        </div>
      );
    }

    const chartHeight = isExpanded ? 500 : config.height;

    switch (config.type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={processedData}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
              <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              {config.showTooltip && (
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
              )}
              {config.showLegend && <Legend />}
              <Line
                type="monotone"
                dataKey="value"
                stroke={config.colors[0]}
                strokeWidth={2}
                dot={{ fill: config.colors[0], strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, stroke: config.colors[0], strokeWidth: 2 }}
                animationDuration={config.animation ? 1000 : 0}
              />
              {config.showReferenceLine && config.referenceValue && (
                <ReferenceLine
                  y={config.referenceValue}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label="Target"
                />
              )}
              {config.showBrush && <Brush dataKey="timestamp" height={30} />}
            </LineChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={processedData}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
              <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              {config.showTooltip && (
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
              )}
              {config.showLegend && <Legend />}
              <Area
                type="monotone"
                dataKey="value"
                stroke={config.colors[0]}
                fill={config.colors[0]}
                fillOpacity={0.3}
                strokeWidth={2}
                animationDuration={config.animation ? 1000 : 0}
              />
              {config.showReferenceLine && config.referenceValue && (
                <ReferenceLine
                  y={config.referenceValue}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label="Target"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={processedData}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
              <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              {config.showTooltip && (
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
              )}
              {config.showLegend && <Legend />}
              <Bar
                dataKey="value"
                fill={config.colors[0]}
                radius={[2, 2, 0, 0]}
                animationDuration={config.animation ? 1000 : 0}
              />
              {config.showReferenceLine && config.referenceValue && (
                <ReferenceLine
                  y={config.referenceValue}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label="Target"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                outerRadius={Math.min(chartHeight * 0.35, 120)}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                animationDuration={config.animation ? 1000 : 0}
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={config.colors[index % config.colors.length]} />
                ))}
              </Pie>
              {config.showTooltip && (
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
              )}
              {config.showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full border-red-200 bg-red-50">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-red-600">
            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
            <div className="font-medium">Error loading chart</div>
            <div className="text-sm">{error}</div>
            <Button size="sm" variant="outline" className="mt-2" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`h-full transition-all duration-200 hover:shadow-md ${
        isExpanded ? "fixed inset-4 z-50 bg-white" : ""
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>

            {stats && (
              <div className="flex items-center gap-1">
                {stats.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : stats.trend === "down" ? (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                ) : null}

                {stats.trend !== "stable" && (
                  <Badge variant="secondary" className="text-xs">
                    {stats.trendPercentage.toFixed(1)}%
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>

            {isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIME_RANGES).map(([key, range]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedAggregation} onValueChange={setSelectedAggregation}>
            <SelectTrigger className="w-24 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(AGGREGATIONS).map(([key, agg]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  {agg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {stats && (
            <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
              <span>Avg: {stats.average.toFixed(1)}</span>
              <span>•</span>
              <span>Max: {stats.max.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">{renderChart()}</CardContent>
    </Card>
  );
}

// Helper functions
function generateMockChartData(
  timeRange: "7d" | "30d" | "90d" | "1y" | "all",
  aggregation: "hour" | "day" | "week" | "month",
  chartType: ChartType,
): ChartDataPoint[] {
  const now = new Date();
  const days = TIME_RANGES[timeRange].days || 365;
  const points: ChartDataPoint[] = [];

  let interval: number;
  switch (aggregation) {
    case "hour":
      interval = 60 * 60 * 1000; // 1 hour
      break;
    case "day":
      interval = 24 * 60 * 60 * 1000; // 1 day
      break;
    case "week":
      interval = 7 * 24 * 60 * 60 * 1000; // 1 week
      break;
    case "month":
      interval = 30 * 24 * 60 * 60 * 1000; // 1 month
      break;
    default:
      interval = 24 * 60 * 60 * 1000;
  }

  const totalPoints = Math.min(Math.floor((days * 24 * 60 * 60 * 1000) / interval), 100);

  for (let i = 0; i < totalPoints; i++) {
    const timestamp = new Date(now.getTime() - (totalPoints - i) * interval);
    const baseValue = 100 + Math.sin(i * 0.1) * 50;
    const noise = (Math.random() - 0.5) * 20;
    const trend = i * 0.5;

    points.push({
      timestamp: timestamp.toISOString(),
      value: Math.max(0, baseValue + noise + trend),
      category:
        chartType === "pie"
          ? ["Category A", "Category B", "Category C", "Category D"][i % 4]
          : undefined,
    });
  }

  return points;
}

function formatTimestamp(
  timestamp: string,
  aggregation: "hour" | "day" | "week" | "month",
): string {
  const date = new Date(timestamp);

  switch (aggregation) {
    case "hour":
      return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    case "day":
      return date.toLocaleDateString("pt-BR", { month: "short", day: "numeric" });
    case "week":
    case "month":
      return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
    default:
      return date.toLocaleDateString("pt-BR");
  }
}
