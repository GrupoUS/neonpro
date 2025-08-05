// Conversion Charts Component - STORY-SUB-002 Task 4
// Advanced charts for trial conversion analysis using Recharts + shadcn/ui
// Based on research: Recharts patterns + SaaS conversion best practices
// Created: 2025-01-22

"use client";

import type { useState, useEffect } from "react";
import type {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Badge } from "@/components/ui/badge";
import type { TrendingUp, TrendingDown, Calendar, Filter } from "lucide-react";
import type { cn } from "@/lib/utils";

// Chart color palette following shadcn/ui theme
const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  success: "hsl(142, 76%, 36%)",
  warning: "hsl(38, 92%, 50%)",
  error: "hsl(0, 84%, 60%)",
  chart1: "hsl(var(--chart-1))",
  chart2: "hsl(var(--chart-2))",
  chart3: "hsl(var(--chart-3))",
  chart4: "hsl(var(--chart-4))",
  chart5: "hsl(var(--chart-5))",
};

// Types for chart data
interface ConversionData {
  period: string;
  trials: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
}
interface FunnelData {
  stage: string;
  users: number;
  percentage: number;
  dropOff: number;
}

interface SourceData {
  source: string;
  trials: number;
  conversions: number;
  conversionRate: number;
  fill: string;
}

interface ConversionChartsProps {
  className?: string;
  timeRange?: "7d" | "30d" | "90d" | "1y";
}

// Custom tooltip component following shadcn/ui patterns
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="font-medium text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.dataKey}:</span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function ConversionCharts({ className, timeRange = "30d" }: ConversionChartsProps) {
  const [data, setData] = useState<{
    conversionTrend: ConversionData[];
    funnelData: FunnelData[];
    sourceData: SourceData[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange); // Fetch chart data
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics/charts?timeRange=${selectedTimeRange}`);
        const chartData = await response.json();
        setData(chartData);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [selectedTimeRange]);

  // Mock data for demonstration (will be replaced by API)
  const mockConversionTrend: ConversionData[] = [
    { period: "Week 1", trials: 125, conversions: 31, conversionRate: 24.8, revenue: 15500 },
    { period: "Week 2", trials: 142, conversions: 38, conversionRate: 26.8, revenue: 19000 },
    { period: "Week 3", trials: 158, conversions: 45, conversionRate: 28.5, revenue: 22500 },
    { period: "Week 4", trials: 134, conversions: 35, conversionRate: 26.1, revenue: 17500 },
  ];

  const mockFunnelData: FunnelData[] = [
    { stage: "Visitors", users: 1000, percentage: 100, dropOff: 0 },
    { stage: "Sign Ups", users: 150, percentage: 15, dropOff: 85 },
    { stage: "Trial Started", users: 120, percentage: 12, dropOff: 3 },
    { stage: "Engaged", users: 85, percentage: 8.5, dropOff: 3.5 },
    { stage: "Converted", users: 32, percentage: 3.2, dropOff: 5.3 },
  ];

  const mockSourceData: SourceData[] = [
    {
      source: "Organic",
      trials: 45,
      conversions: 18,
      conversionRate: 40,
      fill: CHART_COLORS.chart1,
    },
    {
      source: "Google Ads",
      trials: 32,
      conversions: 8,
      conversionRate: 25,
      fill: CHART_COLORS.chart2,
    },
    {
      source: "Social Media",
      trials: 28,
      conversions: 6,
      conversionRate: 21,
      fill: CHART_COLORS.chart3,
    },
    {
      source: "Referral",
      trials: 22,
      conversions: 9,
      conversionRate: 41,
      fill: CHART_COLORS.chart4,
    },
    { source: "Direct", trials: 18, conversions: 7, conversionRate: 39, fill: CHART_COLORS.chart5 },
  ];

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-32 bg-muted rounded"></div>
                <div className="h-3 w-48 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">Conversion Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Detailed insights into trial conversion performance
          </p>
        </div>
        <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
          <SelectTrigger className="w-32">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
            <SelectItem value="90d">90 days</SelectItem>
            <SelectItem value="1y">1 year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="trend" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trend">Conversion Trend</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
        </TabsList>
        {/* Conversion Trend Chart */}
        <TabsContent value="trend" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conversion Rate Trend</CardTitle>
                <CardDescription>Weekly conversion rate performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockConversionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="conversionRate"
                      stroke={CHART_COLORS.chart1}
                      strokeWidth={2}
                      dot={{ fill: CHART_COLORS.chart1, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>{" "}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue Trend</CardTitle>
                <CardDescription>Weekly revenue from trial conversions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockConversionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={CHART_COLORS.success}
                      fill={CHART_COLORS.success}
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* Conversion Funnel */}
        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Conversion Funnel</CardTitle>
              <CardDescription>User journey from visitor to paying customer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockFunnelData.map((stage, index) => (
                  <div key={stage.stage} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{stage.stage}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{stage.users.toLocaleString()} users</span>
                        <span className="text-muted-foreground">{stage.percentage}%</span>
                        {index > 0 && (
                          <div className="flex items-center text-red-600">
                            <TrendingDown className="mr-1 h-3 w-3" />
                            <span>{stage.dropOff}% drop-off</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-chart-1 to-chart-2 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${stage.percentage}%`,
                          background: `linear-gradient(to right, ${CHART_COLORS.chart1}, ${CHART_COLORS.chart2})`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>{" "}
        {/* Traffic Sources */}
        <TabsContent value="sources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conversion by Source</CardTitle>
                <CardDescription>Performance breakdown by traffic source</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockSourceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="conversions"
                      label={({ name, value, percent }) =>
                        `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                      }
                    >
                      {mockSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Source Performance</CardTitle>
                <CardDescription>Conversion rates by traffic source</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockSourceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis
                      dataKey="source"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="conversionRate"
                      fill={CHART_COLORS.chart3}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
