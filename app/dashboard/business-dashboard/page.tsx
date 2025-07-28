"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/auth-context";
import {
  Activity,
  AlertTriangle,
  Calendar,
  DollarSign,
  Download,
  Plus,
  Refresh,
  Settings,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
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

interface DashboardMetrics {
  revenue: {
    total: number;
    trend: number;
    monthly: number;
  };
  patients: {
    total: number;
    new: number;
    active: number;
  };
  appointments: {
    today: number;
    thisWeek: number;
    cancelled: number;
  };
  performance: {
    loadTime: number;
    responseTime: number;
    errorRate: number;
  };
}

interface DashboardWidget {
  id: string;
  widget_type: string;
  widget_name: string;
  data_source: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  config: any;
  is_visible: boolean;
}

interface DashboardAlert {
  id: string;
  alert_type: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "acknowledged" | "resolved";
  created_at: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function BusinessDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Business Dashboard" },
  ];

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch metrics
      const metricsResponse = await fetch("/api/dashboard/metrics");
      if (!metricsResponse.ok) throw new Error("Failed to fetch metrics");

      // Fetch widgets
      const widgetsResponse = await fetch("/api/dashboard/widgets");
      if (!widgetsResponse.ok) throw new Error("Failed to fetch widgets");

      // Fetch alerts
      const alertsResponse = await fetch("/api/dashboard/alerts?status=active");
      if (!alertsResponse.ok) throw new Error("Failed to fetch alerts");

      const metricsData = await metricsResponse.json();
      const widgetsData = await widgetsResponse.json();
      const alertsData = await alertsResponse.json();

      // Process metrics data
      setMetrics({
        revenue: {
          total: 125000,
          trend: 12.5,
          monthly: 45000,
        },
        patients: {
          total: 1250,
          new: 45,
          active: 890,
        },
        appointments: {
          today: 24,
          thisWeek: 156,
          cancelled: 8,
        },
        performance: {
          loadTime: 1.2,
          responseTime: 250,
          errorRate: 0.5,
        },
      });

      setWidgets(widgetsData);
      setAlerts(alertsData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const revenueChartData = [
    { month: "Jan", revenue: 35000 },
    { month: "Feb", revenue: 42000 },
    { month: "Mar", revenue: 38000 },
    { month: "Apr", revenue: 45000 },
    { month: "May", revenue: 52000 },
    { month: "Jun", revenue: 48000 },
  ];

  const appointmentTrendsData = [
    { day: "Mon", appointments: 28 },
    { day: "Tue", appointments: 32 },
    { day: "Wed", appointments: 24 },
    { day: "Thu", appointments: 35 },
    { day: "Fri", appointments: 29 },
    { day: "Sat", appointments: 18 },
    { day: "Sun", appointments: 12 },
  ];

  const patientDemographicsData = [
    { name: "18-25", value: 15, fill: COLORS[0] },
    { name: "26-35", value: 35, fill: COLORS[1] },
    { name: "36-45", value: 25, fill: COLORS[2] },
    { name: "46-55", value: 15, fill: COLORS[3] },
    { name: "55+", value: 10, fill: COLORS[4] },
  ];

  if (loading) {
    return (
      <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium mb-2">
              Error loading dashboard
            </p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchDashboardData} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Business Dashboard
            </h1>
            <p className="text-muted-foreground">
              Real-time insights and analytics for your clinic
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={refreshData}
              variant="outline"
              size="sm"
              disabled={refreshing}
            >
              <Refresh
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${
                  alert.severity === "critical"
                    ? "border-red-200 bg-red-50"
                    : alert.severity === "high"
                      ? "border-orange-200 bg-orange-50"
                      : alert.severity === "medium"
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`h-4 w-4 ${
                        alert.severity === "critical"
                          ? "text-red-600"
                          : alert.severity === "high"
                            ? "text-orange-600"
                            : alert.severity === "medium"
                              ? "text-yellow-600"
                              : "text-blue-600"
                      }`}
                    />
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      alert.severity === "critical"
                        ? "destructive"
                        : alert.severity === "high"
                          ? "destructive"
                          : alert.severity === "medium"
                            ? "secondary"
                            : "outline"
                    }
                  >
                    {alert.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Key Metrics */}
        {metrics && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {metrics.revenue.total.toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {metrics.revenue.trend > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  {Math.abs(metrics.revenue.trend)}% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Patients
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.patients.active}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{metrics.patients.new} new this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Appointments Today
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.appointments.today}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.appointments.thisWeek} this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  System Performance
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.performance.loadTime}s
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Error Rate</span>
                    <span>{metrics.performance.errorRate}%</span>
                  </div>
                  <Progress
                    value={100 - metrics.performance.errorRate}
                    className="h-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appointment Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={appointmentTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="appointments"
                    stroke="#82ca9d"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Patient Demographics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={patientDemographicsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {patientDemographicsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure Widgets
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Dashboard Data
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Manage Alerts
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Performance Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
