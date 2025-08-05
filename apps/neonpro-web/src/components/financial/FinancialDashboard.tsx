"use client";

import type { Alert, AlertDescription, AlertTitle } from "@neonpro/ui/alert";
import type { Badge } from "@neonpro/ui/badge";
import type { Button } from "@neonpro/ui/button";
import type { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@neonpro/ui/card";
import type { Progress } from "@neonpro/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@neonpro/ui/select";
import type { Skeleton } from "@neonpro/ui/skeleton";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@neonpro/ui/tabs";
import type {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  LineChart,
  PieChart,
  RefreshCw,
  Settings,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import type { FinancialSystem, getDefaultFinancialConfig } from "@/lib/financial";
import type { FinancialCharts } from "./FinancialCharts";
import type { FinancialInsights } from "./FinancialInsights";
import type { FinancialKPICards } from "./FinancialKPICards";
import type { FinancialReports } from "./FinancialReports";
import type { FinancialSettings } from "./FinancialSettings";

interface FinancialDashboardProps {
  clinicId: string;
  supabaseUrl: string;
  supabaseKey: string;
  className?: string;
}

interface DashboardData {
  kpis: any;
  analytics: any;
  charts: any;
  reports: any;
  insights: any;
  lastUpdated: Date;
}

interface SystemHealth {
  status: "healthy" | "degraded" | "unhealthy";
  modules: Record<string, { status: string; message?: string }>;
  overall_score: number;
}

export function FinancialDashboard({
  clinicId,
  supabaseUrl,
  supabaseKey,
  className = "",
}: FinancialDashboardProps) {
  // State Management
  const [financialSystem, setFinancialSystem] = useState<FinancialSystem | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month" | "quarter" | "year">(
    "month",
  );
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(300000); // 5 minutes

  // Initialize Financial System
  const initializeSystem = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const config = getDefaultFinancialConfig(clinicId, supabaseUrl, supabaseKey);
      const system = new FinancialSystem(config);

      await system.initialize();
      setFinancialSystem(system);

      // Load initial data
      await loadDashboardData(system);
      await checkSystemHealth(system);
    } catch (err) {
      console.error("Failed to initialize financial system:", err);
      setError("Failed to initialize financial system. Please check your configuration.");
    } finally {
      setLoading(false);
    }
  }, [clinicId, supabaseUrl, supabaseKey]);

  // Load Dashboard Data
  const loadDashboardData = useCallback(
    async (system?: FinancialSystem) => {
      try {
        const activeSystem = system || financialSystem;
        if (!activeSystem) return;

        const overview = await activeSystem.getFinancialOverview(timeframe);
        setDashboardData({
          ...overview,
          lastUpdated: new Date(),
        });
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Failed to load dashboard data.");
      }
    },
    [financialSystem, timeframe],
  );

  // Check System Health
  const checkSystemHealth = useCallback(
    async (system?: FinancialSystem) => {
      try {
        const activeSystem = system || financialSystem;
        if (!activeSystem) return;

        const health = await activeSystem.healthCheck();
        setSystemHealth(health);
      } catch (err) {
        console.error("Failed to check system health:", err);
      }
    },
    [financialSystem],
  );

  // Refresh Data
  const refreshData = useCallback(async () => {
    if (!financialSystem || refreshing) return;

    try {
      setRefreshing(true);
      await Promise.all([loadDashboardData(), checkSystemHealth()]);
    } catch (err) {
      console.error("Failed to refresh data:", err);
    } finally {
      setRefreshing(false);
    }
  }, [financialSystem, refreshing, loadDashboardData, checkSystemHealth]);

  // Auto Refresh Effect
  useEffect(() => {
    if (!autoRefresh || !financialSystem) return;

    const interval = setInterval(refreshData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshData, financialSystem]);

  // Initialize on mount
  useEffect(() => {
    initializeSystem();

    // Cleanup on unmount
    return () => {
      if (financialSystem) {
        financialSystem.shutdown();
      }
    };
  }, [initializeSystem]);

  // Timeframe change effect
  useEffect(() => {
    if (financialSystem && !loading) {
      loadDashboardData();
    }
  }, [timeframe, financialSystem, loading, loadDashboardData]);

  // Render Loading State
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render Error State
  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button onClick={initializeSystem} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Get status color for system health
  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "degraded":
        return "text-yellow-600";
      case "unhealthy":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Get status icon for system health
  const getHealthIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4" />;
      case "unhealthy":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive financial analytics and business intelligence
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* System Health Indicator */}
          {systemHealth && (
            <Badge
              variant={systemHealth.status === "healthy" ? "default" : "destructive"}
              className={`${getHealthColor(systemHealth.status)} flex items-center gap-1`}
            >
              {getHealthIcon(systemHealth.status)}
              {systemHealth.status} ({systemHealth.overall_score.toFixed(0)}%)
            </Badge>
          )}

          {/* Last Updated */}
          {dashboardData && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {dashboardData.lastUpdated.toLocaleTimeString()}
            </div>
          )}

          {/* Refresh Button */}
          <Button onClick={refreshData} disabled={refreshing} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Timeframe:</label>
            <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Auto Refresh Toggle */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
            >
              <Zap className="h-4 w-4 mr-2" />
              Auto Refresh
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          {dashboardData?.kpis && (
            <FinancialKPICards
              kpis={dashboardData.kpis}
              timeframe={timeframe}
              loading={refreshing}
            />
          )}

          {/* Charts Grid */}
          {dashboardData?.charts && (
            <FinancialCharts
              charts={dashboardData.charts}
              timeframe={timeframe}
              loading={refreshing}
            />
          )}

          {/* Quick Insights */}
          {dashboardData?.insights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Key Insights
                  </CardTitle>
                  <CardDescription>
                    Automated financial insights and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.insights.slice(0, 3).map((insight: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div
                          className={`p-1 rounded-full ${
                            insight.type === "positive"
                              ? "bg-green-100 text-green-600"
                              : insight.type === "warning"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-red-100 text-red-600"
                          }`}
                        >
                          {insight.type === "positive" ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : insight.type === "warning" ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                          {insight.recommendation && (
                            <p className="text-xs text-blue-600 mt-1">{insight.recommendation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Status
                  </CardTitle>
                  <CardDescription>Financial system health and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {systemHealth && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Health</span>
                        <Badge
                          variant={systemHealth.status === "healthy" ? "default" : "destructive"}
                        >
                          {systemHealth.status}
                        </Badge>
                      </div>

                      <Progress value={systemHealth.overall_score} className="h-2" />

                      <div className="space-y-2">
                        {Object.entries(systemHealth.modules).map(([module, status]) => (
                          <div key={module} className="flex items-center justify-between text-sm">
                            <span className="capitalize">{module.replace("_", " ")}</span>
                            <div
                              className={`flex items-center gap-1 ${getHealthColor(status.status)}`}
                            >
                              {getHealthIcon(status.status)}
                              <span className="capitalize">{status.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {dashboardData?.analytics && (
            <FinancialCharts
              charts={dashboardData.charts}
              analytics={dashboardData.analytics}
              timeframe={timeframe}
              loading={refreshing}
              detailed={true}
            />
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {dashboardData?.reports && financialSystem && (
            <FinancialReports
              reports={dashboardData.reports}
              financialSystem={financialSystem}
              timeframe={timeframe}
              loading={refreshing}
            />
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          {dashboardData?.insights && (
            <FinancialInsights
              insights={dashboardData.insights}
              analytics={dashboardData.analytics}
              kpis={dashboardData.kpis}
              timeframe={timeframe}
              loading={refreshing}
            />
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {financialSystem && (
            <FinancialSettings
              financialSystem={financialSystem}
              autoRefresh={autoRefresh}
              refreshInterval={refreshInterval}
              onAutoRefreshChange={setAutoRefresh}
              onRefreshIntervalChange={setRefreshInterval}
              onSystemReset={initializeSystem}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FinancialDashboard;
