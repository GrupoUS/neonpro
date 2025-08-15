/**
 * Performance Metrics Panel Component
 * Epic 10 - Story 10.5: Vision Analytics Dashboard (Real-time Insights)
 *
 * Displays comprehensive system and application performance metrics including:
 * - Real-time system resource monitoring (CPU, Memory, Disk, Network)
 * - Application performance metrics (Response times, Throughput, Error rates)
 * - Database performance tracking (Query times, Connection pools)
 * - AI model performance and inference metrics
 * - Performance trends and historical analysis
 *
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
 */

'use client';

import {
  Activity,
  AlertTriangle,
  Brain,
  Clock,
  Cpu,
  Database,
  HardDrive,
  Monitor,
  RefreshCw,
  Server,
  TrendingDown,
  TrendingUp,
  Wifi,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Analytics Engine
import {
  type AnalyticsTimeframe,
  AnalyticsUtils,
  performanceMonitoringEngine,
  type RealtimePerformanceData,
} from '@/lib/analytics';

// Types
interface PerformanceMetricsPanelProps {
  data: RealtimePerformanceData | null;
  isLoading: boolean;
  timeframe: AnalyticsTimeframe;
  clinicId: string;
}

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  status: 'optimal' | 'good' | 'warning' | 'critical';
  trend?: number;
  description?: string;
}

interface PerformanceChartData {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  response_time: number;
  throughput: number;
  error_rate: number;
}

export function PerformanceMetricsPanel({
  data,
  isLoading,
  timeframe,
  clinicId,
}: PerformanceMetricsPanelProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<keyof RealtimePerformanceData['categories']>('system');
  const [historicalData, setHistoricalData] = useState<PerformanceChartData[]>(
    []
  );
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  /**
   * Load historical performance data
   */
  const loadHistoricalData = async () => {
    if (!clinicId || isLoadingHistory) return;

    try {
      setIsLoadingHistory(true);

      const history = await performanceMonitoringEngine.getHistoricalData(
        clinicId,
        AnalyticsUtils.getTimeRangeStart(timeframe),
        new Date()
      );

      setHistoricalData(history);
    } catch (error) {
      console.error('Failed to load historical performance data:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistoricalData();
  }, [loadHistoricalData]);

  /**
   * MetricCard component for individual performance metrics
   */
  const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    unit,
    icon,
    status,
    trend,
    description,
  }) => {
    const statusColors = {
      optimal: 'text-green-600 bg-green-50 border-green-200',
      good: 'text-lime-600 bg-lime-50 border-lime-200',
      warning: 'text-amber-600 bg-amber-50 border-amber-200',
      critical: 'text-red-600 bg-red-50 border-red-200',
    };

    return (
      <Card className={`${statusColors[status]}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            {value.toFixed(1)}
            {unit}
          </div>
          {trend !== undefined && (
            <div className="mt-1 flex items-center text-muted-foreground text-xs">
              {trend > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-red-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-green-500" />
              )}
              {Math.abs(trend).toFixed(1)}% vs last period
            </div>
          )}
          {description && (
            <p className="mt-1 text-muted-foreground text-xs">{description}</p>
          )}
        </CardContent>
      </Card>
    );
  };

  // Memoized calculations
  const categoryData = useMemo(() => {
    if (!data) return null;
    return data.categories[selectedCategory];
  }, [data, selectedCategory]);

  const overallMetrics = useMemo(() => {
    if (!data) return [];

    return [
      {
        title: 'Health Score',
        value: data.healthScore,
        unit: '%',
        icon: <Activity className="h-4 w-4" />,
        status: AnalyticsUtils.getStatusFromScore(data.healthScore) as any,
        trend: data.trends?.healthScore || 0,
        description: 'Overall system health',
      },
      {
        title: 'Availability',
        value: data.summary.availability,
        unit: '%',
        icon: <Server className="h-4 w-4" />,
        status:
          data.summary.availability > 99.5
            ? 'optimal'
            : data.summary.availability > 99
              ? 'good'
              : ('warning' as any),
        trend: data.trends?.availability || 0,
        description: 'System uptime',
      },
      {
        title: 'Efficiency',
        value: data.summary.efficiency,
        unit: '%',
        icon: <Zap className="h-4 w-4" />,
        status:
          data.summary.efficiency > 90
            ? 'optimal'
            : data.summary.efficiency > 80
              ? 'good'
              : ('warning' as any),
        trend: data.trends?.efficiency || 0,
        description: 'Resource utilization efficiency',
      },
      {
        title: 'Security Score',
        value: data.summary.securityScore,
        unit: '%',
        icon: <Monitor className="h-4 w-4" />,
        status:
          data.summary.securityScore > 95
            ? 'optimal'
            : data.summary.securityScore > 90
              ? 'good'
              : ('warning' as any),
        trend: data.trends?.securityScore || 0,
        description: 'Security compliance score',
      },
    ];
  }, [data]);

  const categoryMetrics = useMemo(() => {
    if (!categoryData) return [];

    const metrics = Object.entries(categoryData.metrics).map(([key, value]) => {
      let title, unit, icon, threshold;

      switch (key) {
        case 'cpu_usage':
          title = 'CPU Usage';
          unit = '%';
          icon = <Cpu className="h-4 w-4" />;
          threshold = { optimal: 30, good: 50, warning: 70 };
          break;
        case 'memory_usage':
          title = 'Memory Usage';
          unit = '%';
          icon = <HardDrive className="h-4 w-4" />;
          threshold = { optimal: 40, good: 60, warning: 80 };
          break;
        case 'disk_usage':
          title = 'Disk Usage';
          unit = '%';
          icon = <HardDrive className="h-4 w-4" />;
          threshold = { optimal: 50, good: 70, warning: 85 };
          break;
        case 'network_latency':
          title = 'Network Latency';
          unit = 'ms';
          icon = <Wifi className="h-4 w-4" />;
          threshold = { optimal: 50, good: 100, warning: 200 };
          break;
        case 'avg_response_time':
          title = 'Response Time';
          unit = 'ms';
          icon = <Clock className="h-4 w-4" />;
          threshold = { optimal: 200, good: 500, warning: 1000 };
          break;
        case 'throughput':
          title = 'Throughput';
          unit = ' req/s';
          icon = <TrendingUp className="h-4 w-4" />;
          threshold = { optimal: 100, good: 50, warning: 20 };
          break;
        case 'error_rate':
          title = 'Error Rate';
          unit = '%';
          icon = <AlertTriangle className="h-4 w-4" />;
          threshold = { optimal: 0.1, good: 0.5, warning: 1 };
          break;
        case 'query_time':
          title = 'Query Time';
          unit = 'ms';
          icon = <Database className="h-4 w-4" />;
          threshold = { optimal: 50, good: 100, warning: 200 };
          break;
        case 'inference_time':
          title = 'AI Inference';
          unit = 'ms';
          icon = <Brain className="h-4 w-4" />;
          threshold = { optimal: 300, good: 500, warning: 1000 };
          break;
        default:
          title = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());
          unit = '';
          icon = <Activity className="h-4 w-4" />;
          threshold = { optimal: 80, good: 60, warning: 40 };
      }

      let status: 'optimal' | 'good' | 'warning' | 'critical';
      if (key === 'error_rate') {
        status =
          value <= threshold.optimal
            ? 'optimal'
            : value <= threshold.good
              ? 'good'
              : value <= threshold.warning
                ? 'warning'
                : 'critical';
      } else if (key === 'throughput') {
        status =
          value >= threshold.optimal
            ? 'optimal'
            : value >= threshold.good
              ? 'good'
              : value >= threshold.warning
                ? 'warning'
                : 'critical';
      } else {
        status =
          value <= threshold.optimal
            ? 'optimal'
            : value <= threshold.good
              ? 'good'
              : value <= threshold.warning
                ? 'warning'
                : 'critical';
      }

      return {
        title,
        value: typeof value === 'number' ? value : 0,
        unit,
        icon,
        status,
        trend: data?.trends?.[key] || 0,
      };
    });

    return metrics;
  }, [categoryData, data]);

  // Chart colors
  const chartColors = {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#f59e0b',
    danger: '#ef4444',
    muted: '#6b7280',
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="mb-4 h-8 w-1/3 rounded bg-gray-200" />
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div className="h-32 rounded bg-gray-200" key={i} />
            ))}
          </div>
          <div className="h-96 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex h-96 items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
            <h3 className="mb-2 font-semibold text-gray-900 text-lg">
              No Performance Data
            </h3>
            <p className="text-gray-600">
              Unable to load performance metrics at this time.
            </p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Performance Metrics */}
      <div>
        <h3 className="mb-4 font-semibold text-gray-900 text-lg">
          Overall Performance
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {overallMetrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </div>
      </div>

      {/* Category-Specific Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Detailed Performance Metrics
          </CardTitle>
          <CardDescription>
            Category-specific performance monitoring and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            onValueChange={(value) => setSelectedCategory(value as any)}
            value={selectedCategory}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="application">Application</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="ai_models">AI Models</TabsTrigger>
            </TabsList>

            <TabsContent className="space-y-6" value={selectedCategory}>
              {/* Category Health Score */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-700 text-sm">
                    {selectedCategory.charAt(0).toUpperCase() +
                      selectedCategory.slice(1)}{' '}
                    Health
                  </h4>
                  <div className="mt-1 flex items-center gap-2">
                    <Progress
                      className="w-32"
                      value={categoryData?.healthScore || 0}
                    />
                    <span className="font-mono text-sm">
                      {(categoryData?.healthScore || 0).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <Badge
                  variant={
                    (categoryData?.healthScore || 0) > 90
                      ? 'default'
                      : (categoryData?.healthScore || 0) > 70
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {categoryData?.status || 'Unknown'}
                </Badge>
              </div>

              {/* Category Metrics */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryMetrics.map((metric) => (
                  <MetricCard key={metric.title} {...metric} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      {historicalData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Performance Trends
            </CardTitle>
            <CardDescription>
              Historical performance data over the selected timeframe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleTimeString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)}${name.includes('time') ? 'ms' : name.includes('rate') ? '%' : name.includes('usage') ? '%' : ''}`,
                      name
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase()),
                    ]}
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                  />
                  <Legend />
                  <Line
                    dataKey="cpu"
                    name="CPU Usage"
                    stroke={chartColors.primary}
                    strokeWidth={2}
                    type="monotone"
                  />
                  <Line
                    dataKey="memory"
                    name="Memory Usage"
                    stroke={chartColors.secondary}
                    strokeWidth={2}
                    type="monotone"
                  />
                  <Line
                    dataKey="response_time"
                    name="Response Time"
                    stroke={chartColors.accent}
                    strokeWidth={2}
                    type="monotone"
                  />
                  <Line
                    dataKey="error_rate"
                    name="Error Rate"
                    stroke={chartColors.danger}
                    strokeWidth={2}
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Alerts */}
      {data.alerts && data.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Active Performance Alerts
            </CardTitle>
            <CardDescription>
              Current performance issues requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.alerts.map((alert, index) => (
                <div
                  className="flex items-start gap-3 rounded-lg border p-3"
                  key={index}
                >
                  <AlertTriangle
                    className={`mt-0.5 h-5 w-5 ${
                      alert.severity === 'critical'
                        ? 'text-red-600'
                        : alert.severity === 'warning'
                          ? 'text-amber-600'
                          : 'text-blue-600'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        {alert.title}
                      </h4>
                      <Badge
                        variant={
                          alert.severity === 'critical'
                            ? 'destructive'
                            : alert.severity === 'warning'
                              ? 'secondary'
                              : 'default'
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="mt-1 text-gray-600 text-sm">
                      {alert.description}
                    </p>
                    <p className="mt-2 text-gray-500 text-xs">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
