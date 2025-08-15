'use client';

/**
 * Advanced Metrics Dashboard Component for NeonPro
 *
 * Comprehensive analytics dashboard displaying key business metrics,
 * advanced KPIs, and real-time performance indicators with interactive
 * visualizations and drill-down capabilities.
 */

import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle,
  DollarSign,
  Download,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types for dashboard data
interface MetricValue {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  benchmark?: number;
}

interface KPICard {
  id: string;
  title: string;
  value: MetricValue;
  format: 'currency' | 'number' | 'percentage' | 'duration';
  icon: React.ComponentType<any>;
  color: string;
  description?: string;
}

interface ChartData {
  date: string;
  [key: string]: any;
}

interface SegmentData {
  name: string;
  value: number;
  color: string;
  change?: number;
}

interface BenchmarkData {
  metric: string;
  value: number;
  benchmark: number;
  industry: number;
  percentile: number;
}

interface AdvancedMetricsDashboardProps {
  kpis: KPICard[];
  timeSeriesData: ChartData[];
  segmentationData: SegmentData[];
  benchmarkData: BenchmarkData[];
  cohortData?: any[];
  forecastData?: any[];
  loading?: boolean;
  dateRange: { start: string; end: string };
  className?: string;
  onMetricClick?: (metricId: string) => void;
  onDateRangeChange?: (start: string, end: string) => void;
  onExport?: (format: 'csv' | 'pdf' | 'png') => void;
  onRefresh?: () => void;
}

// Utility functions
const formatValue = (value: number, format: string) => {
  switch (format) {
    case 'currency':
      return `$${value.toLocaleString()}`;
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'duration':
      return `${value}d`;
    default:
      return value.toLocaleString();
  }
};

const getChangeColor = (change: number) => {
  if (change > 0) return 'text-green-600';
  if (change < 0) return 'text-red-600';
  return 'text-gray-600';
};

const getChangeIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return TrendingUp;
    case 'down':
      return TrendingDown;
    default:
      return ArrowUpDown;
  }
};

const getBenchmarkStatus = (value: number, benchmark: number) => {
  const ratio = value / benchmark;
  if (ratio >= 1.1)
    return { status: 'excellent', color: 'text-green-600', icon: CheckCircle };
  if (ratio >= 0.9)
    return { status: 'good', color: 'text-blue-600', icon: Target };
  if (ratio >= 0.7)
    return { status: 'fair', color: 'text-yellow-600', icon: AlertTriangle };
  return { status: 'poor', color: 'text-red-600', icon: XCircle };
};

export function AdvancedMetricsDashboard({
  kpis,
  timeSeriesData,
  segmentationData,
  benchmarkData,
  cohortData = [],
  forecastData = [],
  loading = false,
  dateRange,
  className = '',
  onMetricClick,
  onDateRangeChange,
  onExport,
  onRefresh,
}: AdvancedMetricsDashboardProps) {
  const [selectedView, setSelectedView] = useState<
    'overview' | 'performance' | 'segments' | 'benchmarks'
  >('overview');
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [timeGranularity, setTimeGranularity] = useState<
    'day' | 'week' | 'month'
  >('day');

  // Calculate dashboard summary
  const dashboardSummary = useMemo(() => {
    const totalRevenue =
      kpis.find((k) => k.id === 'revenue')?.value.current || 0;
    const totalUsers = kpis.find((k) => k.id === 'users')?.value.current || 0;
    const avgGrowth =
      kpis.reduce((sum, kpi) => sum + kpi.value.changePercent, 0) / kpis.length;

    const overPerforming = kpis.filter(
      (kpi) => kpi.value.target && kpi.value.current >= kpi.value.target
    ).length;

    const underPerforming = kpis.filter(
      (kpi) => kpi.value.target && kpi.value.current < kpi.value.target * 0.8
    ).length;

    return {
      totalRevenue,
      totalUsers,
      avgGrowth,
      overPerforming,
      underPerforming,
      totalKPIs: kpis.length,
    };
  }, [kpis]);

  // Process time series data for different granularities
  const processedTimeSeriesData = useMemo(() => {
    if (timeGranularity === 'day') return timeSeriesData;

    const grouped = timeSeriesData.reduce(
      (acc, item) => {
        const date = new Date(item.date);
        let key: string;

        if (timeGranularity === 'week') {
          const weekStart = new Date(
            date.setDate(date.getDate() - date.getDay())
          );
          key = weekStart.toISOString().split('T')[0];
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }

        if (!acc[key]) {
          acc[key] = { date: key, count: 0 };
          Object.keys(item).forEach((k) => {
            if (k !== 'date') acc[key][k] = 0;
          });
        }

        Object.keys(item).forEach((k) => {
          if (k !== 'date' && typeof item[k] === 'number') {
            acc[key][k] += item[k];
          }
        });
        acc[key].count += 1;

        return acc;
      },
      {} as Record<string, any>
    );

    return Object.values(grouped).map((item: any) => {
      const processed = { ...item };
      Object.keys(processed).forEach((k) => {
        if (k !== 'date' && k !== 'count' && typeof processed[k] === 'number') {
          processed[k] = processed[k] / item.count;
        }
      });
      delete processed.count;
      return processed;
    });
  }, [timeSeriesData, timeGranularity]);

  // Handle KPI card click
  const handleKPIClick = useCallback(
    (kpiId: string) => {
      setSelectedKPI(kpiId === selectedKPI ? null : kpiId);
      onMetricClick?.(kpiId);
    },
    [selectedKPI, onMetricClick]
  );

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!(active && payload && payload.length)) return null;

    return (
      <div className="max-w-xs rounded-lg border bg-white p-4 shadow-lg">
        <p className="mb-2 font-semibold text-gray-900">
          {new Date(label).toLocaleDateString()}
        </p>
        {payload.map((entry: any, index: number) => (
          <div className="flex items-center gap-2 text-sm" key={index}>
            <div
              className="h-3 w-3 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium">
              {typeof entry.value === 'number'
                ? entry.value.toLocaleString()
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`w-full space-y-6 ${className}`}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card className="animate-pulse" key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 rounded bg-gray-200" />
              </CardHeader>
              <CardContent>
                <div className="mb-2 h-8 rounded bg-gray-200" />
                <div className="h-3 rounded bg-gray-100" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-96 rounded bg-gray-100" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl text-gray-900">
            Advanced Analytics Dashboard
          </h2>
          <p className="mt-1 text-gray-600">
            Comprehensive business metrics and performance insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value: any) => setTimeGranularity(value)}
            value={timeGranularity}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onRefresh} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => onExport?.('csv')} size="sm" variant="outline">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-600 text-sm">
                  Total Revenue
                </p>
                <p className="font-bold text-2xl text-blue-900">
                  {formatValue(dashboardSummary.totalRevenue, 'currency')}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-600 text-sm">
                  Active Users
                </p>
                <p className="font-bold text-2xl text-green-900">
                  {formatValue(dashboardSummary.totalUsers, 'number')}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-purple-600 text-sm">
                  Avg Growth
                </p>
                <p className="font-bold text-2xl text-purple-900">
                  {formatValue(dashboardSummary.avgGrowth, 'percentage')}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-orange-600 text-sm">
                  Performance
                </p>
                <p className="font-bold text-lg text-orange-900">
                  {dashboardSummary.overPerforming}/{dashboardSummary.totalKPIs}{' '}
                  KPIs
                </p>
                <p className="text-orange-700 text-xs">Above Target</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs
        onValueChange={(value: any) => setSelectedView(value)}
        value={selectedView}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent className="mt-6" value="overview">
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {kpis.map((kpi) => {
                const Icon = kpi.icon;
                const ChangeIcon = getChangeIcon(kpi.value.trend);
                const isSelected = selectedKPI === kpi.id;

                return (
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'shadow-md ring-2 ring-blue-500' : ''
                    }`}
                    key={kpi.id}
                    onClick={() => handleKPIClick(kpi.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-medium text-gray-600 text-sm">
                          {kpi.title}
                        </CardTitle>
                        <Icon className={`h-4 w-4 ${kpi.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <p className="font-bold text-2xl text-gray-900">
                          {formatValue(kpi.value.current, kpi.format)}
                        </p>

                        <div className="flex items-center gap-2">
                          <ChangeIcon
                            className={`h-3 w-3 ${getChangeColor(kpi.value.change)}`}
                          />
                          <span
                            className={`font-medium text-xs ${getChangeColor(kpi.value.change)}`}
                          >
                            {kpi.value.changePercent > 0 ? '+' : ''}
                            {kpi.value.changePercent.toFixed(1)}%
                          </span>
                          <span className="text-gray-500 text-xs">
                            vs last period
                          </span>
                        </div>

                        {kpi.value.target && (
                          <div className="mt-2">
                            <div className="mb-1 flex justify-between text-gray-600 text-xs">
                              <span>Progress to target</span>
                              <span>
                                {(
                                  (kpi.value.current / kpi.value.target) *
                                  100
                                ).toFixed(0)}
                                %
                              </span>
                            </div>
                            <Progress
                              className="h-1"
                              value={Math.min(
                                (kpi.value.current / kpi.value.target) * 100,
                                100
                              )}
                            />
                          </div>
                        )}

                        {kpi.description && (
                          <p className="mt-2 text-gray-500 text-xs">
                            {kpi.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Time Series Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Metrics Trend</CardTitle>
                    <CardDescription>
                      Historical performance over time
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      onValueChange={(value: any) => setChartType(value)}
                      value={chartType}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">Line</SelectItem>
                        <SelectItem value="area">Area</SelectItem>
                        <SelectItem value="bar">Bar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer height="100%" width="100%">
                    {chartType === 'line' && (
                      <LineChart data={processedTimeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(date) =>
                            new Date(date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          }
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {kpis.slice(0, 4).map((kpi, index) => (
                          <Line
                            dataKey={kpi.id}
                            key={kpi.id}
                            name={kpi.title}
                            stroke={
                              ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][
                                index
                              ]
                            }
                            strokeWidth={2}
                            type="monotone"
                          />
                        ))}
                      </LineChart>
                    )}

                    {chartType === 'area' && (
                      <AreaChart data={processedTimeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(date) =>
                            new Date(date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          }
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {kpis.slice(0, 4).map((kpi, index) => (
                          <Area
                            dataKey={kpi.id}
                            fill={
                              ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][
                                index
                              ]
                            }
                            fillOpacity={0.6}
                            key={kpi.id}
                            name={kpi.title}
                            stackId="1"
                            stroke={
                              ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][
                                index
                              ]
                            }
                            type="monotone"
                          />
                        ))}
                      </AreaChart>
                    )}

                    {chartType === 'bar' && (
                      <BarChart data={processedTimeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(date) =>
                            new Date(date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          }
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {kpis.slice(0, 4).map((kpi, index) => (
                          <Bar
                            dataKey={kpi.id}
                            fill={
                              ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][
                                index
                              ]
                            }
                            key={kpi.id}
                            name={kpi.title}
                          />
                        ))}
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent className="mt-6" value="performance">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Performance Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance vs Targets</CardTitle>
                <CardDescription>
                  How each KPI performs against its target
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer height="100%" width="100%">
                    <RadialBarChart
                      data={kpis
                        .filter((k) => k.value.target)
                        .map((kpi) => ({
                          name: kpi.title,
                          value: Math.min(
                            (kpi.value.current / kpi.value.target!) * 100,
                            150
                          ),
                          fill: kpi.color
                            .replace('text-', '#')
                            .replace('-600', ''),
                        }))}
                    >
                      <RadialBar
                        cornerRadius={4}
                        dataKey="value"
                        fill="#8884d8"
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          `${value.toFixed(1)}%`,
                          'Achievement',
                        ]}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top & Bottom Performers</CardTitle>
                <CardDescription>
                  KPIs ranked by performance vs target
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {kpis
                    .filter((k) => k.value.target)
                    .sort(
                      (a, b) =>
                        b.value.current / b.value.target! -
                        a.value.current / a.value.target!
                    )
                    .map((kpi, index) => {
                      const achievement =
                        (kpi.value.current / kpi.value.target!) * 100;
                      const Icon = kpi.icon;

                      return (
                        <div className="flex items-center gap-4" key={kpi.id}>
                          <div
                            className={`rounded p-2 ${
                              index < 2
                                ? 'bg-green-100'
                                : index >= kpis.length - 2
                                  ? 'bg-red-100'
                                  : 'bg-gray-100'
                            }`}
                          >
                            <Icon
                              className={`h-4 w-4 ${
                                index < 2
                                  ? 'text-green-600'
                                  : index >= kpis.length - 2
                                    ? 'text-red-600'
                                    : 'text-gray-600'
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">
                                {kpi.title}
                              </span>
                              <Badge
                                variant={
                                  achievement >= 100
                                    ? 'default'
                                    : achievement >= 80
                                      ? 'secondary'
                                      : 'destructive'
                                }
                              >
                                {achievement.toFixed(0)}%
                              </Badge>
                            </div>
                            <div className="mt-1 flex justify-between text-gray-600 text-xs">
                              <span>
                                {formatValue(kpi.value.current, kpi.format)}
                              </span>
                              <span>
                                Target:{' '}
                                {formatValue(kpi.value.target!, kpi.format)}
                              </span>
                            </div>
                            <Progress
                              className="mt-2 h-1"
                              value={Math.min(achievement, 100)}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent className="mt-6" value="segments">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Segmentation Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Market Segmentation</CardTitle>
                <CardDescription>
                  Distribution across key segments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer height="100%" width="100%">
                    <PieChart>
                      <Pie
                        cx="50%"
                        cy="50%"
                        data={segmentationData}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                      >
                        {segmentationData.map((entry, index) => (
                          <Cell fill={entry.color} key={index} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          value.toLocaleString(),
                          'Value',
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Segment Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Segment Performance</CardTitle>
                <CardDescription>
                  Growth and performance by segment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {segmentationData.map((segment, _index) => (
                    <div className="space-y-2" key={segment.name}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded"
                            style={{ backgroundColor: segment.color }}
                          />
                          <span className="font-medium">{segment.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {segment.value.toLocaleString()}
                          </div>
                          {segment.change !== undefined && (
                            <div
                              className={`text-xs ${getChangeColor(segment.change)}`}
                            >
                              {segment.change > 0 ? '+' : ''}
                              {segment.change.toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                      <Progress
                        className="h-2"
                        value={
                          (segment.value /
                            Math.max(...segmentationData.map((s) => s.value))) *
                          100
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent className="mt-6" value="benchmarks">
          <div className="space-y-6">
            {/* Benchmark Overview */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-600 text-sm">
                        Above Benchmark
                      </p>
                      <p className="font-bold text-2xl text-green-900">
                        {
                          benchmarkData.filter((b) => b.value >= b.benchmark)
                            .length
                        }
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-yellow-600">
                        Near Benchmark
                      </p>
                      <p className="font-bold text-2xl text-yellow-900">
                        {
                          benchmarkData.filter(
                            (b) =>
                              b.value < b.benchmark &&
                              b.value >= b.benchmark * 0.8
                          ).length
                        }
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-600 text-sm">
                        Below Benchmark
                      </p>
                      <p className="font-bold text-2xl text-red-900">
                        {
                          benchmarkData.filter(
                            (b) => b.value < b.benchmark * 0.8
                          ).length
                        }
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Benchmark Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Benchmark Comparison</CardTitle>
                <CardDescription>
                  Performance vs industry benchmarks and targets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {benchmarkData.map((benchmark) => {
                    const status = getBenchmarkStatus(
                      benchmark.value,
                      benchmark.benchmark
                    );
                    const StatusIcon = status.icon;

                    return (
                      <div className="space-y-3" key={benchmark.metric}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <StatusIcon className={`h-5 w-5 ${status.color}`} />
                            <div>
                              <h4 className="font-medium">
                                {benchmark.metric}
                              </h4>
                              <p className="text-gray-600 text-sm">
                                {benchmark.percentile}th percentile
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              status.status === 'excellent'
                                ? 'default'
                                : status.status === 'good'
                                  ? 'secondary'
                                  : status.status === 'fair'
                                    ? 'outline'
                                    : 'destructive'
                            }
                          >
                            {status.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Your Value</span>
                            <p className="font-medium text-lg">
                              {benchmark.value.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Benchmark</span>
                            <p className="font-medium text-lg">
                              {benchmark.benchmark.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Industry Avg</span>
                            <p className="font-medium text-lg">
                              {benchmark.industry.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-gray-600 text-xs">
                            <span>Performance vs Benchmark</span>
                            <span>
                              {(
                                (benchmark.value / benchmark.benchmark) *
                                100
                              ).toFixed(0)}
                              %
                            </span>
                          </div>
                          <Progress
                            className="h-2"
                            value={Math.min(
                              (benchmark.value / benchmark.benchmark) * 100,
                              150
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Items Alert */}
      {dashboardSummary.underPerforming > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Action Required:</strong> {dashboardSummary.underPerforming}{' '}
            KPI(s) are significantly below target. Review performance metrics
            and consider strategic adjustments.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
