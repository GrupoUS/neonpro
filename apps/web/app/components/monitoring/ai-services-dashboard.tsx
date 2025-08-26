"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ServiceHealth {
  service: string;
  healthy: boolean;
  status: "healthy" | "degraded" | "unhealthy";
  response_time_ms: number;
  last_updated: string;
  error_rate: number;
  uptime_percentage: number;
  details?: unknown;
}

interface ServiceMetrics {
  service: string;
  timestamp: string;
  requests_per_minute: number;
  avg_response_time: number;
  error_count: number;
  success_count: number;
  cpu_usage: number;
  memory_usage: number;
}

interface ComplianceAlert {
  id: string;
  service: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: string;
  compliance_type: "lgpd" | "anvisa" | "cfm";
  resolved: boolean;
}

interface DashboardData {
  services: ServiceHealth[];
  metrics: ServiceMetrics[];
  alerts: ComplianceAlert[];
  system_overview: {
    total_requests_last_hour: number;
    avg_response_time: number;
    overall_error_rate: number;
    active_sessions: number;
    compliance_score: number;
  };
}

const AIServicesDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    services: [],
    metrics: [],
    alerts: [],
    system_overview: {
      total_requests_last_hour: 0,
      avg_response_time: 0,
      overall_error_rate: 0,
      active_sessions: 0,
      compliance_score: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, _setSelectedTimeRange] = useState("1h");

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [servicesResponse, metricsResponse, alertsResponse] =
        await Promise.all([
          fetch("/api/ai/monitoring/services-health"),
          fetch(`/api/ai/monitoring/metrics?time_range=${selectedTimeRange}`),
          fetch("/api/ai/compliance/alerts?active=true"),
        ]);

      const [servicesData, metricsData, alertsData] = await Promise.all([
        servicesResponse.json(),
        metricsResponse.json(),
        alertsResponse.json(),
      ]);

      if (servicesData.success && metricsData.success) {
        const systemOverview = {
          total_requests_last_hour: metricsData.data.reduce(
            (sum: number, m: ServiceMetrics) =>
              sum + m.requests_per_minute * 60,
            0,
          ),
          avg_response_time:
            metricsData.data.reduce(
              (sum: number, m: ServiceMetrics) => sum + m.avg_response_time,
              0,
            ) / metricsData.data.length || 0,
          overall_error_rate:
            metricsData.data.reduce(
              (sum: number, m: ServiceMetrics) =>
                sum + (m.error_count / (m.error_count + m.success_count)) * 100,
              0,
            ) / metricsData.data.length || 0,
          active_sessions:
            servicesData.data.find(
              (s: ServiceHealth) => s.service === "universal-chat",
            )?.details?.active_sessions || 0,
          compliance_score: alertsData.success
            ? Math.max(0, 100 - alertsData.data.length * 5)
            : 100,
        };

        setDashboardData({
          services: servicesData.data || [],
          metrics: metricsData.data || [],
          alerts: alertsData.success ? alertsData.data : [],
          system_overview: systemOverview,
        });
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTimeRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 30_000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchDashboardData]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "healthy": {
        return "text-green-600 bg-green-100";
      }
      case "degraded": {
        return "text-yellow-600 bg-yellow-100";
      }
      case "unhealthy": {
        return "text-red-600 bg-red-100";
      }
      default: {
        return "text-gray-600 bg-gray-100";
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": {
        return <CheckCircle className="h-4 w-4" />;
      }
      case "degraded": {
        return <AlertTriangle className="h-4 w-4" />;
      }
      case "unhealthy": {
        return <XCircle className="h-4 w-4" />;
      }
      default: {
        return <Clock className="h-4 w-4" />;
      }
    }
  };

  const getAlertSeverityColor = (severity: string): string => {
    switch (severity) {
      case "critical": {
        return "border-red-500 bg-red-50";
      }
      case "high": {
        return "border-orange-500 bg-orange-50";
      }
      case "medium": {
        return "border-yellow-500 bg-yellow-50";
      }
      case "low": {
        return "border-blue-500 bg-blue-50";
      }
      default: {
        return "border-gray-500 bg-gray-50";
      }
    }
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatMetricValue = (value: number, unit: string): string => {
    if (unit === "ms") {
      return value < 1000
        ? `${Math.round(value)}ms`
        : `${(value / 1000).toFixed(1)}s`;
    }
    if (unit === "%") {
      return `${value.toFixed(1)}%`;
    }
    return Math.round(value).toString();
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl text-gray-900">
            AI Services Monitoring
          </h1>
          <p className="text-gray-600">
            Real-time monitoring dashboard for NeonPro Healthcare AI services
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              size="sm"
              variant={autoRefresh ? "default" : "outline"}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`}
              />
              Auto Refresh
            </Button>
            <Button
              disabled={isLoading}
              onClick={fetchDashboardData}
              size="sm"
              variant="outline"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh Now"
              )}
            </Button>
          </div>
          <div className="text-gray-500 text-sm">
            Last updated: {formatTime(lastRefresh.toISOString())}
          </div>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="font-medium text-gray-600 text-sm">
                  Requests/Hour
                </p>
                <p className="font-bold text-2xl text-gray-900">
                  {dashboardData.system_overview.total_requests_last_hour.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="font-medium text-gray-600 text-sm">
                  Avg Response Time
                </p>
                <p className="font-bold text-2xl text-gray-900">
                  {formatMetricValue(
                    dashboardData.system_overview.avg_response_time,
                    "ms",
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="font-medium text-gray-600 text-sm">Error Rate</p>
                <p className="font-bold text-2xl text-gray-900">
                  {formatMetricValue(
                    dashboardData.system_overview.overall_error_rate,
                    "%",
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="font-medium text-gray-600 text-sm">
                  Active Sessions
                </p>
                <p className="font-bold text-2xl text-gray-900">
                  {dashboardData.system_overview.active_sessions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="font-medium text-gray-600 text-sm">
                  Compliance Score
                </p>
                <p className="font-bold text-2xl text-gray-900">
                  {formatMetricValue(
                    dashboardData.system_overview.compliance_score,
                    "%",
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {dashboardData.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-red-500" />
              Active Compliance Alerts ({dashboardData.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.alerts.slice(0, 5).map((alert) => (
              <Alert
                className={getAlertSeverityColor(alert.severity)}
                key={alert.id}
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-start justify-between">
                    <div>
                      <strong>{alert.service}</strong> - {alert.message}
                      <div className="mt-1 text-gray-500 text-xs">
                        {alert.compliance_type.toUpperCase()} •{" "}
                        {formatTime(alert.timestamp)}
                      </div>
                    </div>
                    <Badge
                      variant={
                        alert.severity === "critical"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs className="space-y-6" defaultValue="services">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="services">Service Health</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value="services">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {dashboardData.services.map((service) => (
              <Card key={service.service}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">
                      {service.service.replaceAll("-", " ")}
                    </span>
                    <Badge className={getStatusColor(service.status)}>
                      {getStatusIcon(service.status)}
                      <span className="ml-1">{service.status}</span>
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Response Time</p>
                      <p className="font-semibold">
                        {formatMetricValue(service.response_time_ms, "ms")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Uptime</p>
                      <p className="font-semibold">
                        {formatMetricValue(service.uptime_percentage, "%")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Error Rate</p>
                      <p className="font-semibold">
                        {formatMetricValue(service.error_rate, "%")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Last Check</p>
                      <p className="font-semibold">
                        {formatTime(service.last_updated)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent className="space-y-6" value="performance">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer height={300} width="100%">
                  <LineChart data={dashboardData.metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={formatTime} />
                    <YAxis />
                    <Tooltip labelFormatter={formatTime} />
                    <Line
                      dataKey="avg_response_time"
                      stroke="#8884d8"
                      strokeWidth={2}
                      type="monotone"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer height={300} width="100%">
                  <AreaChart data={dashboardData.metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={formatTime} />
                    <YAxis />
                    <Tooltip labelFormatter={formatTime} />
                    <Area
                      dataKey="requests_per_minute"
                      fill="#82ca9d"
                      stroke="#82ca9d"
                      type="monotone"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate by Service</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer height={300} width="100%">
                  <BarChart data={dashboardData.services}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="service" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="error_rate" fill="#ff7300" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer height={300} width="100%">
                  <PieChart>
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={[
                        {
                          name: "Healthy",
                          value: dashboardData.services.filter(
                            (s) => s.status === "healthy",
                          ).length,
                        },
                        {
                          name: "Degraded",
                          value: dashboardData.services.filter(
                            (s) => s.status === "degraded",
                          ).length,
                        },
                        {
                          name: "Unhealthy",
                          value: dashboardData.services.filter(
                            (s) => s.status === "unhealthy",
                          ).length,
                        },
                      ]}
                      dataKey="value"
                      fill="#8884d8"
                      label
                      outerRadius={80}
                    >
                      {[
                        {
                          name: "Healthy",
                          value: dashboardData.services.filter(
                            (s) => s.status === "healthy",
                          ).length,
                        },
                        {
                          name: "Degraded",
                          value: dashboardData.services.filter(
                            (s) => s.status === "degraded",
                          ).length,
                        },
                        {
                          name: "Unhealthy",
                          value: dashboardData.services.filter(
                            (s) => s.status === "unhealthy",
                          ).length,
                        },
                      ].map((_entry, index) => (
                        <Cell
                          fill={COLORS[index % COLORS.length]}
                          key={`cell-${index}`}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent className="space-y-6" value="compliance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Healthcare Compliance Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <div className="font-bold text-2xl text-green-600">
                    {
                      dashboardData.alerts.filter(
                        (a) => a.compliance_type === "lgpd",
                      ).length
                    }
                  </div>
                  <div className="text-gray-600 text-sm">LGPD Alerts</div>
                </div>
                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <div className="font-bold text-2xl text-blue-600">
                    {
                      dashboardData.alerts.filter(
                        (a) => a.compliance_type === "anvisa",
                      ).length
                    }
                  </div>
                  <div className="text-gray-600 text-sm">ANVISA Alerts</div>
                </div>
                <div className="rounded-lg bg-purple-50 p-4 text-center">
                  <div className="font-bold text-2xl text-purple-600">
                    {
                      dashboardData.alerts.filter(
                        (a) => a.compliance_type === "cfm",
                      ).length
                    }
                  </div>
                  <div className="text-gray-600 text-sm">CFM Alerts</div>
                </div>
              </div>

              <div className="space-y-3">
                {dashboardData.alerts.map((alert) => (
                  <div
                    className={`rounded-lg border p-4 ${getAlertSeverityColor(alert.severity)}`}
                    key={alert.id}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center space-x-2">
                          <Badge variant="outline">
                            {alert.compliance_type.toUpperCase()}
                          </Badge>
                          <Badge
                            variant={
                              alert.severity === "critical"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                        <h4 className="font-semibold">{alert.service}</h4>
                        <p className="text-gray-600 text-sm">{alert.message}</p>
                        <p className="mt-1 text-gray-500 text-xs">
                          {formatTime(alert.timestamp)}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Resolve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="analytics">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Service Usage Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.services.map((service) => (
                    <div
                      className="flex items-center justify-between"
                      key={service.service}
                    >
                      <span className="capitalize">
                        {service.service.replaceAll("-", " ")}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-24 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-blue-600"
                            style={{
                              width: `${Math.min(100, service.uptime_percentage)}%`,
                            }}
                          />
                        </div>
                        <span className="text-gray-600 text-sm">
                          {formatMetricValue(service.uptime_percentage, "%")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Resource Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-sm">CPU Usage</span>
                      <span className="text-gray-600 text-sm">45%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-green-600"
                        style={{ width: "45%" }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-sm">Memory Usage</span>
                      <span className="text-gray-600 text-sm">67%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-yellow-600"
                        style={{ width: "67%" }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-sm">
                        Database Connections
                      </span>
                      <span className="text-gray-600 text-sm">23%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: "23%" }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIServicesDashboard;
