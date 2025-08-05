"use client";

// Financial KPI Dashboard Component
// Description: Real-time financial KPI dashboard with drill-down capabilities
// Author: Dev Agent
// Date: 2025-01-26

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import type { Input } from "@/components/ui/input";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  AlertTriangle,
  Settings,
  Download,
  RefreshCw,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  Edit,
  Copy,
  Trash2,
  Plus,
  Grid3X3,
} from "lucide-react";

import type {
  FinancialKPI,
  KPIAlert,
  DashboardLayout,
  DashboardWidget,
  DrillDownResult,
  KPICalculationResult,
  DashboardFilters,
} from "@/lib/types/kpi-types";

interface KPIDashboardProps {
  userId: string;
  dashboardId?: string;
  isEditable?: boolean;
  refreshInterval?: number;
}

interface KPICardProps {
  kpi: FinancialKPI;
  isEditing?: boolean;
  onDrillDown?: (kpiId: string, dimension: string) => void;
  onEdit?: () => void;
  onRemove?: () => void;
}

interface DrillDownModalProps {
  kpi: FinancialKPI | null;
  dimension: string;
  results: DrillDownResult[];
  isOpen: boolean;
  onClose: () => void;
  onDrillDeeper?: (dimension: string, value: string) => void;
}

interface AlertsPanelProps {
  alerts: KPIAlert[];
  onAcknowledge: (alertId: string) => void;
  onViewDetails: (alert: KPIAlert) => void;
}

const KPICard: React.FC<KPICardProps> = ({ kpi, isEditing, onDrillDown, onEdit, onRemove }) => {
  const formatValue = (value: number, category: string): string => {
    if (category === "revenue" || category === "profitability") {
      if (kpi.kpi_name.includes("Margin") || kpi.kpi_name.includes("Rate")) {
        return `${value.toFixed(1)}%`;
      }
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    }
    if (kpi.kpi_name.includes("Rate") || kpi.kpi_name.includes("Utilization")) {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString("pt-BR");
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case "increasing":
        return "text-green-500";
      case "decreasing":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getVarianceDisplay = (variance?: number) => {
    if (variance === undefined || variance === null) return null;
    const sign = variance >= 0 ? "+" : "";
    return `${sign}${variance.toFixed(1)}%`;
  };

  return (
    <Card className="relative hover:shadow-md transition-shadow">
      {isEditing && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onRemove}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">{kpi.kpi_name}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {kpi.kpi_category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {formatValue(kpi.current_value, kpi.kpi_category)}
            </div>
            {kpi.target_value && (
              <div className="text-sm text-gray-500">
                Target: {formatValue(kpi.target_value, kpi.kpi_category)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {getTrendIcon(kpi.trend_direction)}
            {kpi.variance_percent !== undefined && (
              <span className={`text-sm font-medium ${getTrendColor(kpi.trend_direction)}`}>
                {getVarianceDisplay(kpi.variance_percent)}
              </span>
            )}
          </div>
        </div>

        {!isEditing && onDrillDown && (
          <div className="mt-3 flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDrillDown(kpi.id, "time")}
              className="text-xs"
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              Trend
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDrillDown(kpi.id, "service_type")}
              className="text-xs"
            >
              <PieChart className="h-3 w-3 mr-1" />
              Breakdown
            </Button>
          </div>
        )}

        <div className="mt-2 text-xs text-gray-400">
          Updated: {new Date(kpi.last_updated).toLocaleString("pt-BR")}
        </div>
      </CardContent>
    </Card>
  );
};

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onAcknowledge, onViewDetails }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  if (!alerts.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No active alerts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          Alerts
          <Badge variant="destructive">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.slice(0, 5).map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border ${getAlertColor(alert.alert_type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getAlertIcon(alert.alert_type)}
                <div>
                  <div className="text-sm font-medium">{alert.alert_message}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(alert.created_at).toLocaleString("pt-BR")}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => onViewDetails(alert)}>
                  <Eye className="h-3 w-3" />
                </Button>
                {!alert.is_acknowledged && (
                  <Button size="sm" variant="outline" onClick={() => onAcknowledge(alert.id)}>
                    Acknowledge
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {alerts.length > 5 && (
          <Button variant="ghost" size="sm" className="w-full">
            View {alerts.length - 5} more alerts
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const DrillDownModal: React.FC<DrillDownModalProps> = ({
  kpi,
  dimension,
  results,
  isOpen,
  onClose,
  onDrillDeeper,
}) => {
  if (!kpi) return null;

  const formatValue = (value: number): string => {
    if (kpi.kpi_category === "revenue" || kpi.kpi_category === "profitability") {
      if (kpi.kpi_name.includes("Margin") || kpi.kpi_name.includes("Rate")) {
        return `${value.toFixed(1)}%`;
      }
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    }
    if (kpi.kpi_name.includes("Rate") || kpi.kpi_name.includes("Utilization")) {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString("pt-BR");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {kpi.kpi_name} - {dimension.replace("_", " ").toUpperCase()} Analysis
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown of {kpi.kpi_name} by {dimension.replace("_", " ")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No data available for this breakdown
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{result.dimension_value}</div>
                    <div className="text-sm text-gray-500">
                      {result.percentage_of_total.toFixed(1)}% of total
                      {result.transaction_count && (
                        <span className="ml-2">({result.transaction_count} transactions)</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold">{formatValue(result.value)}</div>
                    {result.variance_from_previous !== undefined && (
                      <div
                        className={`text-sm ${
                          result.variance_from_previous >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {result.variance_from_previous >= 0 ? "+" : ""}
                        {result.variance_from_previous.toFixed(1)}%
                      </div>
                    )}
                  </div>

                  {onDrillDeeper && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDrillDeeper("service_type", result.dimension_value)}
                      className="ml-2"
                    >
                      <BarChart3 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const KPIDashboard: React.FC<KPIDashboardProps> = ({
  userId,
  dashboardId,
  isEditable = false,
  refreshInterval = 30000,
}) => {
  const [kpis, setKpis] = useState<FinancialKPI[]>([]);
  const [alerts, setAlerts] = useState<KPIAlert[]>([]);
  const [dashboard, setDashboard] = useState<DashboardLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<FinancialKPI | null>(null);
  const [drillDownResults, setDrillDownResults] = useState<DrillDownResult[]>([]);
  const [drillDownDimension, setDrillDownDimension] = useState<string>("");
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>({
    time_period: {
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
      preset: "month",
    },
  });

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, [dashboardId]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(() => {
      loadKPIData();
      loadAlerts();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, filters]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadKPIData(),
        loadAlerts(),
        dashboardId ? loadDashboard() : Promise.resolve(),
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadKPIData = async () => {
    try {
      const response = await fetch("/api/analytics/kpis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          time_period: filters.time_period,
          filters,
          include_variance: true,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setKpis(data.data);
      }
    } catch (error) {
      console.error("Error loading KPIs:", error);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await fetch("/api/analytics/alerts?is_acknowledged=false");
      const data = await response.json();
      if (data.success) {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error("Error loading alerts:", error);
    }
  };

  const loadDashboard = async () => {
    if (!dashboardId) return;

    try {
      const response = await fetch(`/api/analytics/dashboards/${dashboardId}`);
      const data = await response.json();
      if (data.success) {
        setDashboard(data.data);
        setFilters(data.data.filters);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };

  const handleDrillDown = async (kpiId: string, dimension: string) => {
    const kpi = kpis.find((k) => k.id === kpiId);
    if (!kpi) return;

    try {
      const response = await fetch("/api/analytics/drill-down", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kpi_id: kpiId,
          dimension,
          filters: filters,
          aggregation_level: dimension === "time" ? "month" : undefined,
          limit: 20,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSelectedKpi(kpi);
        setDrillDownDimension(dimension);
        setDrillDownResults(data.data.results || []);
        setShowDrillDown(true);
      }
    } catch (error) {
      console.error("Error performing drill-down:", error);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/analytics/alerts/${alertId}/acknowledge`, {
        method: "PATCH",
      });

      if (response.ok) {
        setAlerts(alerts.filter((alert) => alert.id !== alertId));
      }
    } catch (error) {
      console.error("Error acknowledging alert:", error);
    }
  };

  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    setFilters({ ...filters, ...newFilters });
  };

  const groupedKpis = useMemo(() => {
    return kpis.reduce(
      (groups, kpi) => {
        const category = kpi.kpi_category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(kpi);
        return groups;
      },
      {} as Record<string, FinancialKPI[]>,
    );
  }, [kpis]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial KPI Dashboard</h1>
          <p className="text-gray-600">Real-time financial metrics and performance indicators</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {isEditable && (
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Done" : "Edit"}
            </Button>
          )}
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Select
              value={filters.time_period?.preset || "custom"}
              onValueChange={(value) => {
                if (value !== "custom") {
                  const now = new Date();
                  let startDate: Date;

                  switch (value) {
                    case "today":
                      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                      break;
                    case "week":
                      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                      break;
                    case "month":
                      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                      break;
                    case "quarter":
                      startDate = new Date(
                        now.getFullYear(),
                        Math.floor(now.getMonth() / 3) * 3,
                        1,
                      );
                      break;
                    case "year":
                      startDate = new Date(now.getFullYear(), 0, 1);
                      break;
                    default:
                      return;
                  }

                  handleFilterChange({
                    time_period: {
                      start_date: startDate.toISOString().split("T")[0],
                      end_date: now.toISOString().split("T")[0],
                      preset: value as any,
                    },
                  });
                }
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="quarter">This quarter</SelectItem>
                <SelectItem value="year">This year</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.time_period?.start_date || ""}
              onChange={(e) =>
                handleFilterChange({
                  time_period: {
                    ...filters.time_period!,
                    start_date: e.target.value,
                    preset: "custom",
                  },
                })
              }
              className="w-40"
            />

            <Input
              type="date"
              value={filters.time_period?.end_date || ""}
              onChange={(e) =>
                handleFilterChange({
                  time_period: {
                    ...filters.time_period!,
                    end_date: e.target.value,
                    preset: "custom",
                  },
                })
              }
              className="w-40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* KPI Cards */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="profitability">Profitability</TabsTrigger>
              <TabsTrigger value="operational">Operational</TabsTrigger>
              <TabsTrigger value="financial_health">Financial Health</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.slice(0, 6).map((kpi) => (
                  <KPICard
                    key={kpi.id}
                    kpi={kpi}
                    isEditing={isEditing}
                    onDrillDown={handleDrillDown}
                  />
                ))}
              </div>
            </TabsContent>

            {Object.entries(groupedKpis).map(([category, categoryKpis]) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryKpis.map((kpi) => (
                    <KPICard
                      key={kpi.id}
                      kpi={kpi}
                      isEditing={isEditing}
                      onDrillDown={handleDrillDown}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Alerts Panel */}
        <div className="lg:col-span-1">
          <AlertsPanel
            alerts={alerts}
            onAcknowledge={handleAcknowledgeAlert}
            onViewDetails={(alert) => console.log("View alert details:", alert)}
          />
        </div>
      </div>

      {/* Drill-down Modal */}
      <DrillDownModal
        kpi={selectedKpi}
        dimension={drillDownDimension}
        results={drillDownResults}
        isOpen={showDrillDown}
        onClose={() => setShowDrillDown(false)}
        onDrillDeeper={(dimension, value) => {
          console.log("Drill deeper:", dimension, value);
        }}
      />
    </div>
  );
};

export default KPIDashboard;
