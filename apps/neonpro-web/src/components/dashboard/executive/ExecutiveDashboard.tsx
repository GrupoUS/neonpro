"use client";

import type { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, subDays } from "date-fns";
import type {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Eye,
  EyeOff,
  Filter,
  Grid3X3,
  LayoutDashboard,
  LineChart,
  List,
  Maximize2,
  Minimize2,
  PieChart,
  RefreshCw,
  Settings,
  Share,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Separator } from "@/components/ui/separator";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Import dashboard engine
import type { ExecutiveDashboardEngine } from "@/lib/dashboard/executive-dashboard-engine";
import type { AlertPanel } from "./AlertPanel";
import type { ChartWidget } from "./ChartWidget";
import type { DashboardGrid } from "./DashboardGrid";
import type { ExecutiveReportGenerator } from "./ExecutiveReportGenerator";
// Import dashboard components
import type { ExecutiveSummary } from "./ExecutiveSummary";
import type { FilterPanel } from "./FilterPanel";
import type { KPICard } from "./KPICard";
import type { MetricWidget } from "./MetricWidget";
import type { PerformanceMetrics } from "./PerformanceMetrics";

// Types
interface DashboardState {
  data: any;
  widgets: DashboardWidget[];
  kpis: KPIMetric[];
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface DashboardFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  categories: string[];
  departments: string[];
  providers: string[];
  patientTypes: string[];
  compareWithPrevious: boolean;
}

interface DashboardUI {
  activeTab: string;
  isFullscreen: boolean;
  showFilters: boolean;
  showAlerts: boolean;
  viewMode: "grid" | "list" | "summary";
  gridLayout: "compact" | "comfortable" | "spacious";
  autoRefresh: boolean;
  refreshInterval: number;
}

interface DashboardWidget {
  id: string;
  type: "metric" | "chart" | "kpi" | "alert" | "summary";
  title: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config: any;
  visible: boolean;
  locked: boolean;
}

interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  previousValue: number;
  unit: string;
  trend: "up" | "down" | "stable";
  status: "excellent" | "good" | "warning" | "critical";
  category: string;
}

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
  category: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface ExecutiveDashboardProps {
  clinicId: string;
  userId: string;
  className?: string;
  defaultTab?: string;
  showHeader?: boolean;
  showFilters?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const DATE_PRESETS = [
  {
    label: "Today",
    value: "today",
    getRange: () => ({ from: new Date(), to: new Date() }),
  },
  {
    label: "Yesterday",
    value: "yesterday",
    getRange: () => {
      const yesterday = subDays(new Date(), 1);
      return { from: yesterday, to: yesterday };
    },
  },
  {
    label: "This Week",
    value: "thisWeek",
    getRange: () => ({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) }),
  },
  {
    label: "This Month",
    value: "thisMonth",
    getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }),
  },
  {
    label: "Last 7 Days",
    value: "last7Days",
    getRange: () => ({ from: subDays(new Date(), 7), to: new Date() }),
  },
  {
    label: "Last 30 Days",
    value: "last30Days",
    getRange: () => ({ from: subDays(new Date(), 30), to: new Date() }),
  },
  {
    label: "Last 90 Days",
    value: "last90Days",
    getRange: () => ({ from: subDays(new Date(), 90), to: new Date() }),
  },
];

const DASHBOARD_TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "metrics", label: "Metrics", icon: BarChart3 },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "alerts", label: "Alerts", icon: AlertTriangle },
];

export function ExecutiveDashboard({
  clinicId,
  userId,
  className = "",
  defaultTab = "overview",
  showHeader = true,
  showFilters = true,
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutes
}: ExecutiveDashboardProps) {
  // Dashboard state
  const [state, setState] = useState<DashboardState>({
    data: null,
    widgets: [],
    kpis: [],
    alerts: [],
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  // Dashboard filters
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      from: subDays(new Date(), 30),
      to: new Date(),
    },
    categories: [],
    departments: [],
    providers: [],
    patientTypes: [],
    compareWithPrevious: false,
  });

  // Dashboard UI state
  const [ui, setUI] = useState<DashboardUI>({
    activeTab: defaultTab,
    isFullscreen: false,
    showFilters: showFilters,
    showAlerts: true,
    viewMode: "grid",
    gridLayout: "comfortable",
    autoRefresh,
    refreshInterval,
  });

  // Dashboard engine instance
  const [dashboardEngine] = useState(() => new ExecutiveDashboardEngine());

  // Real-time subscription
  const [realtimeSubscription, setRealtimeSubscription] = useState<any>(null);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Initialize dashboard engine
      await dashboardEngine.initialize({
        clinicId,
        userId,
        dateRange: filters.dateRange,
        filters: {
          categories: filters.categories,
          departments: filters.departments,
          providers: filters.providers,
          patientTypes: filters.patientTypes,
        },
        realTimeEnabled: ui.autoRefresh,
        refreshInterval: ui.refreshInterval,
      });

      // Load dashboard data
      const dashboardData = await dashboardEngine.getDashboardData();
      const kpis = await dashboardEngine.calculateKPIs();
      const alerts = await dashboardEngine.getAlerts();
      const widgets = generateDefaultWidgets();

      setState({
        data: dashboardData,
        widgets,
        kpis,
        alerts,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });

      // Setup real-time updates if enabled
      if (ui.autoRefresh) {
        const subscription = await dashboardEngine.setupRealTimeUpdates({
          onUpdate: (updatedData) => {
            setState((prev) => ({
              ...prev,
              data: { ...prev.data, ...updatedData },
              lastUpdated: new Date(),
            }));
          },
          onError: (error) => {
            console.error("Real-time update error:", error);
          },
        });
        setRealtimeSubscription(subscription);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load dashboard data",
      }));
    }
  }, [clinicId, userId, filters, ui.autoRefresh, ui.refreshInterval, dashboardEngine]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadDashboardData();

    // Cleanup real-time subscription on unmount
    return () => {
      if (realtimeSubscription) {
        realtimeSubscription.unsubscribe?.();
      }
    };
  }, [loadDashboardData]);

  // Auto-refresh interval
  useEffect(() => {
    if (!ui.autoRefresh) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, ui.refreshInterval);

    return () => clearInterval(interval);
  }, [ui.autoRefresh, ui.refreshInterval, loadDashboardData]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<DashboardFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Handle UI changes
  const handleUIChange = useCallback((newUI: Partial<DashboardUI>) => {
    setUI((prev) => ({ ...prev, ...newUI }));
  }, []);

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    await loadDashboardData();
  }, [loadDashboardData]);

  // Handle date preset selection
  const handleDatePresetChange = useCallback(
    (presetValue: string) => {
      const preset = DATE_PRESETS.find((p) => p.value === presetValue);
      if (preset) {
        const range = preset.getRange();
        handleFilterChange({ dateRange: range });
      }
    },
    [handleFilterChange],
  );

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      const exportData = {
        dashboard: state.data,
        kpis: state.kpis,
        alerts: state.alerts,
        filters,
        period: filters.dateRange,
        exportedAt: new Date().toISOString(),
        clinicId,
        userId,
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `executive-dashboard-${format(new Date(), "yyyy-MM-dd-HHmm")}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export dashboard:", error);
    }
  }, [state, filters, clinicId, userId]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      handleUIChange({ isFullscreen: true });
    } else {
      document.exitFullscreen();
      handleUIChange({ isFullscreen: false });
    }
  }, [handleUIChange]);

  // Get active alerts count
  const activeAlertsCount = state.alerts.filter((alert) => !alert.acknowledged).length;

  // Get critical alerts count
  const criticalAlertsCount = state.alerts.filter(
    (alert) => alert.severity === "critical" && !alert.acknowledged,
  ).length;

  if (state.isLoading && !state.data) {
    return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading executive dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        <Card className="m-6">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold mb-2">Dashboard Error</h3>
              <p className="text-muted-foreground mb-4">{state.error}</p>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Brain className="h-6 w-6" />
                  Executive Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Last updated: {state.lastUpdated ? format(state.lastUpdated, "PPp") : "Never"}
                  {state.isLoading && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Updating...
                    </span>
                  )}
                </p>
              </div>

              {/* Date Range Selector */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select onValueChange={handleDatePresetChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_PRESETS.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Alerts Badge */}
              {activeAlertsCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUIChange({ activeTab: "alerts" })}
                  className={
                    criticalAlertsCount > 0
                      ? "border-red-200 text-red-600"
                      : "border-yellow-200 text-yellow-600"
                  }
                >
                  <Bell className="h-4 w-4 mr-1" />
                  {activeAlertsCount}
                  {criticalAlertsCount > 0 && (
                    <Badge variant="destructive" className="ml-1 text-xs">
                      {criticalAlertsCount}
                    </Badge>
                  )}
                </Button>
              )}

              {/* Auto-refresh toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUIChange({ autoRefresh: !ui.autoRefresh })}
                className={ui.autoRefresh ? "bg-green-50 border-green-200 text-green-700" : ""}
              >
                <RefreshCw className={`h-4 w-4 ${ui.autoRefresh ? "animate-spin" : ""}`} />
              </Button>

              {/* Filters toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUIChange({ showFilters: !ui.showFilters })}
                className={ui.showFilters ? "bg-blue-50 border-blue-200 text-blue-700" : ""}
              >
                <Filter className="h-4 w-4" />
              </Button>

              {/* Export */}
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" />
              </Button>

              {/* Fullscreen toggle */}
              <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                {ui.isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {ui.showFilters && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <FilterPanel filters={filters} onFiltersChange={handleFilterChange} className="" />
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={ui.activeTab} onValueChange={(tab) => handleUIChange({ activeTab: tab })}>
          <TabsList className="grid w-full grid-cols-5">
            {DASHBOARD_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.id === "alerts" && activeAlertsCount > 0 && (
                    <Badge variant="destructive" className="ml-1 text-xs">
                      {activeAlertsCount}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Executive Summary */}
            <ExecutiveSummary
              clinicId={clinicId}
              dateRange={filters.dateRange}
              autoRefresh={ui.autoRefresh}
              refreshInterval={ui.refreshInterval}
            />

            {/* Key KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {state.kpis.slice(0, 4).map((kpi) => (
                <KPICard
                  key={kpi.id}
                  metric={kpi}
                  showTrend={true}
                  showTarget={true}
                  className=""
                />
              ))}
            </div>

            {/* Dashboard Grid */}
            <DashboardGrid
              widgets={state.widgets}
              onWidgetsChange={(widgets) => setState((prev) => ({ ...prev, widgets }))}
              layout={ui.gridLayout}
              editable={true}
              className=""
            />
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <PerformanceMetrics
              clinicId={clinicId}
              dateRange={filters.dateRange}
              showTargets={true}
              showBenchmarks={true}
              showTrends={true}
              autoRefresh={ui.autoRefresh}
              refreshInterval={ui.refreshInterval}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartWidget
                id="revenue-trend"
                title="Revenue Trend"
                type="line"
                dataSource="revenue"
                config={{
                  showGrid: true,
                  showLegend: true,
                  showTooltip: true,
                  colors: ["#3b82f6", "#10b981"],
                  height: 300,
                  animated: true,
                  responsive: true,
                }}
                refreshInterval={ui.refreshInterval}
              />

              <ChartWidget
                id="patient-distribution"
                title="Patient Distribution"
                type="pie"
                dataSource="patients"
                config={{
                  showLegend: true,
                  showTooltip: true,
                  colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
                  height: 300,
                  animated: true,
                  responsive: true,
                }}
                refreshInterval={ui.refreshInterval}
              />
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <ExecutiveReportGenerator
              clinicId={clinicId}
              dateRange={filters.dateRange}
              className=""
            />
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <AlertPanel
              alerts={state.alerts}
              onAlertsChange={(alerts) => setState((prev) => ({ ...prev, alerts }))}
              autoRefresh={ui.autoRefresh}
              refreshInterval={ui.refreshInterval}
              className=""
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper function to generate default widgets
function generateDefaultWidgets(): DashboardWidget[] {
  return [
    {
      id: "revenue-metric",
      type: "metric",
      title: "Monthly Revenue",
      position: { x: 0, y: 0, w: 3, h: 2 },
      config: {
        metric: "revenue",
        format: "currency",
        showTrend: true,
        showTarget: true,
      },
      visible: true,
      locked: false,
    },
    {
      id: "patient-satisfaction",
      type: "metric",
      title: "Patient Satisfaction",
      position: { x: 3, y: 0, w: 3, h: 2 },
      config: {
        metric: "satisfaction",
        format: "number",
        showTrend: true,
        showTarget: true,
      },
      visible: true,
      locked: false,
    },
    {
      id: "appointments-chart",
      type: "chart",
      title: "Appointments Trend",
      position: { x: 6, y: 0, w: 6, h: 4 },
      config: {
        type: "line",
        dataSource: "appointments",
        timeRange: "30d",
      },
      visible: true,
      locked: false,
    },
    {
      id: "efficiency-metric",
      type: "metric",
      title: "Operational Efficiency",
      position: { x: 0, y: 2, w: 3, h: 2 },
      config: {
        metric: "efficiency",
        format: "percentage",
        showTrend: true,
        showTarget: true,
      },
      visible: true,
      locked: false,
    },
    {
      id: "wait-time-metric",
      type: "metric",
      title: "Average Wait Time",
      position: { x: 3, y: 2, w: 3, h: 2 },
      config: {
        metric: "waitTime",
        format: "duration",
        showTrend: true,
        showTarget: true,
      },
      visible: true,
      locked: false,
    },
  ];
}
