"use client";

import type {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Download,
  LineChart,
  Minus,
  MoreVertical,
  PieChart,
  RefreshCw,
  Settings,
  Share,
  Target,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Skeleton } from "@/components/ui/skeleton";
import type {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
import type {
  DashboardWidget,
  MetricData,
  MetricStatus,
  TrendDirection,
} from "@/lib/dashboard/types";

interface MetricWidgetProps {
  widget: DashboardWidget;
  isEditing?: boolean;
  onUpdate?: (updates: Partial<DashboardWidget>) => void;
}

interface MetricValue {
  current: number;
  previous?: number;
  target?: number;
  unit: string;
  format: "number" | "currency" | "percentage" | "duration";
}

interface MetricTrend {
  direction: TrendDirection;
  percentage: number;
  isGood: boolean;
}

interface MetricConfig {
  showTrend: boolean;
  showTarget: boolean;
  showStatus: boolean;
  showSparkline: boolean;
  colorScheme: "default" | "success" | "warning" | "danger" | "info";
  size: "sm" | "md" | "lg";
  layout: "vertical" | "horizontal";
}

const METRIC_ICONS = {
  revenue: "💰",
  patients: "👥",
  appointments: "📅",
  satisfaction: "😊",
  growth: "📈",
  efficiency: "⚡",
  quality: "⭐",
  time: "⏱️",
  percentage: "📊",
  count: "🔢",
  currency: "💵",
  trend: "📈",
};

const STATUS_CONFIG = {
  excellent: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    label: "Excellent",
  },
  good: {
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    label: "Good",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    label: "Warning",
  },
  critical: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    label: "Critical",
  },
  neutral: {
    icon: Minus,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    label: "Neutral",
  },
};

export function MetricWidget({ widget, isEditing, onUpdate }: MetricWidgetProps) {
  const [data, setData] = useState<MetricData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const config: MetricConfig = {
    showTrend: true,
    showTarget: true,
    showStatus: true,
    showSparkline: false,
    colorScheme: "default",
    size: "md",
    layout: "vertical",
    ...widget.config,
  };

  // Fetch metric data
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
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data based on widget type
        const mockData = generateMockData(widget.dataSource);
        setData(mockData);
        setLastUpdate(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
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
  }, [widget.dataSource, widget.refreshInterval]);

  // Calculate metric value and trend
  const metricValue: MetricValue | null = useMemo(() => {
    if (!data) return null;

    return {
      current: data.value,
      previous: data.previousValue,
      target: data.targetValue,
      unit: data.unit || "",
      format: data.format || "number",
    };
  }, [data]);

  const metricTrend: MetricTrend | null = useMemo(() => {
    if (!metricValue || metricValue.previous === undefined) return null;

    const change = metricValue.current - metricValue.previous;
    const percentage = metricValue.previous !== 0 ? (change / metricValue.previous) * 100 : 0;

    let direction: TrendDirection = "stable";
    if (Math.abs(percentage) > 0.1) {
      direction = change > 0 ? "up" : "down";
    }

    // Determine if trend is good based on metric type
    const isGood = determineTrendGoodness(direction, widget.dataSource);

    return {
      direction,
      percentage: Math.abs(percentage),
      isGood,
    };
  }, [metricValue, widget.dataSource]);

  const metricStatus: MetricStatus = useMemo(() => {
    if (!metricValue || !data) return "neutral";

    if (data.status) return data.status;

    // Calculate status based on target and thresholds
    if (metricValue.target) {
      const ratio = metricValue.current / metricValue.target;
      if (ratio >= 1.1) return "excellent";
      if (ratio >= 0.9) return "good";
      if (ratio >= 0.7) return "warning";
      return "critical";
    }

    return "neutral";
  }, [metricValue, data]);

  // Format value based on type
  const formatValue = (value: number, format: string): string => {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value);
      case "percentage":
        return `${value.toFixed(1)}%`;
      case "duration": {
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        return `${hours}h ${minutes}m`;
      }
      default:
        return new Intl.NumberFormat("pt-BR").format(value);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    // Trigger data refresh
    setTimeout(() => {
      setLastUpdate(new Date());
      setIsLoading(false);
    }, 1000);
  };

  // Render trend indicator
  const renderTrendIndicator = () => {
    if (!config.showTrend || !metricTrend) return null;

    const TrendIcon =
      metricTrend.direction === "up"
        ? TrendingUp
        : metricTrend.direction === "down"
          ? TrendingDown
          : Minus;

    const trendColor = metricTrend.isGood ? "text-green-600" : "text-red-600";

    return (
      <div className={`flex items-center gap-1 ${trendColor}`}>
        <TrendIcon className="h-4 w-4" />
        <span className="text-sm font-medium">{metricTrend.percentage.toFixed(1)}%</span>
      </div>
    );
  };

  // Render status indicator
  const renderStatusIndicator = () => {
    if (!config.showStatus) return null;

    const statusConfig = STATUS_CONFIG[metricStatus];
    const StatusIcon = statusConfig.icon;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-1 ${statusConfig.color}`}>
              <StatusIcon className="h-4 w-4" />
              <span className="text-xs font-medium">{statusConfig.label}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Status: {statusConfig.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Render target indicator
  const renderTargetIndicator = () => {
    if (!config.showTarget || !metricValue?.target) return null;

    const progress = (metricValue.current / metricValue.target) * 100;
    const isOnTarget = progress >= 90;

    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Target className="h-3 w-3" />
        <span>Target: {formatValue(metricValue.target, metricValue.format)}</span>
        <Badge variant={isOnTarget ? "default" : "secondary"} className="h-4 px-1 text-xs">
          {progress.toFixed(0)}%
        </Badge>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
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
            <XCircle className="h-8 w-8 mx-auto mb-2" />
            <div className="font-medium">Error</div>
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

  if (!metricValue) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
            <div>No data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = STATUS_CONFIG[metricStatus];

  return (
    <Card
      className={`h-full transition-all duration-200 hover:shadow-md ${
        config.colorScheme !== "default" ? statusConfig.bgColor : ""
      } ${config.colorScheme !== "default" ? statusConfig.borderColor : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {widget.title}
          </CardTitle>

          <div className="flex items-center gap-1">
            {renderStatusIndicator()}

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
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export
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
      </CardHeader>

      <CardContent className="pt-0">
        <div
          className={`space-y-2 ${
            config.layout === "horizontal" ? "flex items-center justify-between" : ""
          }`}
        >
          {/* Main Value */}
          <div
            className={`${
              config.size === "lg" ? "text-3xl" : config.size === "sm" ? "text-xl" : "text-2xl"
            } font-bold`}
          >
            {formatValue(metricValue.current, metricValue.format)}
            {metricValue.unit && (
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {metricValue.unit}
              </span>
            )}
          </div>

          {/* Trend and Target */}
          <div className="flex items-center justify-between">
            {renderTrendIndicator()}
            {renderTargetIndicator()}
          </div>

          {/* Previous Value Comparison */}
          {metricValue.previous !== undefined && (
            <div className="text-xs text-muted-foreground">
              Previous: {formatValue(metricValue.previous, metricValue.format)}
            </div>
          )}

          {/* Last Update */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Updated {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions
function generateMockData(dataSource: string): MetricData {
  const baseValue = Math.random() * 1000 + 100;
  const previousValue = baseValue * (0.8 + Math.random() * 0.4);
  const targetValue = baseValue * (1.1 + Math.random() * 0.2);

  const formats = ["number", "currency", "percentage", "duration"];
  const format = formats[Math.floor(Math.random() * formats.length)];

  return {
    value: baseValue,
    previousValue,
    targetValue,
    unit: format === "percentage" ? "%" : format === "currency" ? "R$" : "",
    format: format as any,
    timestamp: new Date(),
    status: ["excellent", "good", "warning", "critical", "neutral"][
      Math.floor(Math.random() * 5)
    ] as MetricStatus,
  };
}

function determineTrendGoodness(direction: TrendDirection, dataSource: string): boolean {
  // Determine if an upward/downward trend is good based on the metric type
  const positiveMetrics = [
    "revenue",
    "patients",
    "satisfaction",
    "efficiency",
    "quality",
    "appointments",
    "growth",
    "productivity",
    "utilization",
  ];

  const negativeMetrics = [
    "costs",
    "wait-time",
    "no-shows",
    "complaints",
    "errors",
    "cancellations",
    "delays",
    "turnover",
  ];

  const isPositiveMetric = positiveMetrics.some((metric) =>
    dataSource.toLowerCase().includes(metric),
  );

  const isNegativeMetric = negativeMetrics.some((metric) =>
    dataSource.toLowerCase().includes(metric),
  );

  if (direction === "up") {
    return isPositiveMetric || !isNegativeMetric;
  } else if (direction === "down") {
    return isNegativeMetric;
  }

  return true; // Stable is generally good
}
