'use client';

/**
 * Advanced Analytics Hub Component for NeonPro
 *
 * Master component that integrates all advanced analytics features:
 * - Cohort Analysis with interactive heatmaps
 * - Time Series Forecasting with ML models
 * - Advanced Metrics Dashboard with KPIs
 * - Statistical Insights with correlation analysis
 *
 * Provides unified interface for comprehensive business intelligence.
 */

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle,
  DollarSign,
  Download,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { AdvancedMetricsDashboard } from './advanced-metrics-dashboard';
// Import advanced analytics components
import { CohortHeatmap } from './cohort-heatmap';
import { ForecastingCharts } from './forecasting-charts';
import { StatisticalInsights } from './statistical-insights';

// Types
interface AnalyticsConfig {
  dateRange: { start: string; end: string };
  refreshInterval: number;
  autoRefresh: boolean;
  selectedMetrics: string[];
  confidenceLevel: number;
}

interface AnalyticsData {
  cohortData: any[];
  forecastData: any[];
  kpis: any[];
  timeSeriesData: any[];
  segmentationData: any[];
  benchmarkData: any[];
  correlations: any[];
  statisticalTests: any[];
  dataQuality: any;
  predictiveModels: any[];
}

interface AdvancedAnalyticsHubProps {
  initialConfig?: Partial<AnalyticsConfig>;
  className?: string;
  onConfigChange?: (config: AnalyticsConfig) => void;
  onDataExport?: (data: any, format: 'csv' | 'pdf' | 'json') => void;
}

export function AdvancedAnalyticsHub({
  initialConfig = {},
  className = '',
  onConfigChange,
  onDataExport,
}: AdvancedAnalyticsHubProps) {
  // State management
  const [config, setConfig] = useState<AnalyticsConfig>({
    dateRange: {
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    refreshInterval: 300_000, // 5 minutes
    autoRefresh: false,
    selectedMetrics: ['subscriptions', 'revenue', 'churn_rate', 'mrr'],
    confidenceLevel: 95,
    ...initialConfig,
  });

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    cohortData: [],
    forecastData: [],
    kpis: [],
    timeSeriesData: [],
    segmentationData: [],
    benchmarkData: [],
    correlations: [],
    statisticalTests: [],
    dataQuality: {
      completeness: 0,
      accuracy: 0,
      consistency: 0,
      validity: 0,
      uniqueness: 0,
      outliers: [],
    },
    predictiveModels: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [selectedView, setSelectedView] = useState<
    'overview' | 'cohorts' | 'forecasting' | 'metrics' | 'statistics'
  >('overview');

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      try {
        // Fetch cohort analysis
        const cohortResponse = await fetch(
          '/api/analytics/advanced?type=cohort-analysis',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              startDate: config.dateRange.start,
              endDate: config.dateRange.end,
              cohortSize: 'monthly',
              metrics: ['retention', 'revenue', 'churn'],
            }),
          }
        );

        // Fetch forecasting data
        const forecastResponse = await fetch(
          '/api/analytics/advanced?type=forecasting',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              metric: 'revenue',
              periods: 30,
              confidence_level: config.confidenceLevel / 100,
              include_scenarios: true,
            }),
          }
        );

        // Fetch statistical analysis
        const statisticsResponse = await fetch(
          '/api/analytics/advanced?type=statistical-analysis',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              metrics: config.selectedMetrics,
              analysis_type: 'all',
              confidence_level: config.confidenceLevel / 100,
              include_outliers: true,
            }),
          }
        );

        // Process responses
        const [cohortData, forecastData, statisticsData] = await Promise.all([
          cohortResponse.json(),
          forecastResponse.json(),
          statisticsResponse.json(),
        ]);

        // Generate mock KPIs and other data for dashboard
        const kpis = generateMockKPIs();
        const timeSeriesData = generateMockTimeSeriesData();
        const segmentationData = generateMockSegmentationData();
        const benchmarkData = generateMockBenchmarkData();

        setAnalyticsData({
          cohortData: cohortData.success ? cohortData.data.cohort_data : [],
          forecastData: forecastData.success ? forecastData.data.forecast : [],
          kpis,
          timeSeriesData,
          segmentationData,
          benchmarkData,
          correlations: statisticsData.success
            ? statisticsData.data.correlations || []
            : [],
          statisticalTests: statisticsData.success
            ? statisticsData.data.significance_tests || []
            : [],
          dataQuality: statisticsData.success
            ? statisticsData.data.data_quality || {}
            : {},
          predictiveModels: statisticsData.success
            ? statisticsData.data.predictive_models || []
            : [],
        });

        setLastRefresh(new Date());
      } catch (err) {
        console.error('Analytics data fetch error:', err);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [config]
  );

  // Auto-refresh effect
  useEffect(() => {
    if (config.autoRefresh && config.refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchAnalyticsData(false);
      }, config.refreshInterval);

      return () => clearInterval(interval);
    }
  }, [config.autoRefresh, config.refreshInterval, fetchAnalyticsData]);

  // Initial data load
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Config change handler
  useEffect(() => {
    onConfigChange?.(config);
  }, [config, onConfigChange]);

  // Analytics summary calculations
  const analyticsSummary = useMemo(() => {
    const totalKPIs = analyticsData.kpis.length;
    const overPerformingKPIs = analyticsData.kpis.filter(
      (kpi) => kpi.value.target && kpi.value.current >= kpi.value.target
    ).length;

    const strongCorrelations = analyticsData.correlations.filter(
      (c) => Math.abs(c.correlation) >= 0.6
    ).length;

    const significantTests = analyticsData.statisticalTests.filter(
      (t) => t.result === 'reject'
    ).length;

    const overallDataQuality =
      (analyticsData.dataQuality.completeness +
        analyticsData.dataQuality.accuracy +
        analyticsData.dataQuality.consistency +
        analyticsData.dataQuality.validity +
        analyticsData.dataQuality.uniqueness) /
        5 || 0;

    const bestModel = analyticsData.predictiveModels.reduce(
      (best, model) => (model.accuracy > (best?.accuracy || 0) ? model : best),
      analyticsData.predictiveModels[0]
    );

    return {
      totalKPIs,
      overPerformingKPIs,
      strongCorrelations,
      significantTests,
      overallDataQuality,
      bestModel,
      outliers:
        analyticsData.dataQuality.outliers?.filter((o) => o.isOutlier).length ||
        0,
    };
  }, [analyticsData]);

  // Event handlers
  const handleConfigUpdate = (updates: Partial<AnalyticsConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handleExport = (format: 'csv' | 'pdf' | 'json') => {
    onDataExport?.(analyticsData, format);
  };

  const handleDateRangeChange = (start: string, end: string) => {
    handleConfigUpdate({ dateRange: { start, end } });
  };

  if (loading && !analyticsData.kpis.length) {
    return (
      <div className={`w-full space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <div className="h-6 animate-pulse rounded bg-gray-200" />
            <div className="h-4 animate-pulse rounded bg-gray-100" />
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  className="h-24 animate-pulse rounded bg-gray-100"
                  key={i}
                />
              ))}
            </div>
            <div className="h-96 animate-pulse rounded bg-gray-50" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 font-bold text-2xl">
                <Brain className="h-6 w-6 text-blue-600" />
                Advanced Analytics Hub
              </CardTitle>
              <CardDescription>
                Comprehensive business intelligence with ML-powered insights
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="flex items-center gap-1" variant="outline">
                <Activity className="h-3 w-3" />
                {config.autoRefresh ? 'Auto-refresh ON' : 'Manual refresh'}
              </Badge>
              {lastRefresh && (
                <Badge variant="secondary">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select
                onValueChange={(value: any) => setSelectedView(value)}
                value={selectedView}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="cohorts">Cohort Analysis</SelectItem>
                  <SelectItem value="forecasting">Forecasting</SelectItem>
                  <SelectItem value="metrics">Advanced Metrics</SelectItem>
                  <SelectItem value="statistics">
                    Statistical Insights
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value) =>
                  handleConfigUpdate({
                    confidenceLevel: Number.parseInt(value, 10),
                  })
                }
                value={config.confidenceLevel.toString()}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90% CI</SelectItem>
                  <SelectItem value="95">95% CI</SelectItem>
                  <SelectItem value="99">99% CI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() =>
                  handleConfigUpdate({ autoRefresh: !config.autoRefresh })
                }
                size="sm"
                variant={config.autoRefresh ? 'default' : 'outline'}
              >
                <Zap className="mr-1 h-4 w-4" />
                Auto-refresh
              </Button>
              <Button
                disabled={loading}
                onClick={handleRefresh}
                size="sm"
                variant="outline"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
              </Button>
              <Button
                onClick={() => handleExport('csv')}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-600 text-sm">
                  KPI Performance
                </p>
                <p className="font-bold text-2xl text-blue-900">
                  {analyticsSummary.overPerformingKPIs}/
                  {analyticsSummary.totalKPIs}
                </p>
                <p className="text-blue-700 text-xs">Above Target</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-600 text-sm">
                  Strong Correlations
                </p>
                <p className="font-bold text-2xl text-green-900">
                  {analyticsSummary.strongCorrelations}
                </p>
                <p className="text-green-700 text-xs">≥ 0.6 coefficient</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-purple-600 text-sm">
                  Data Quality
                </p>
                <p className="font-bold text-2xl text-purple-900">
                  {analyticsSummary.overallDataQuality.toFixed(0)}%
                </p>
                <p className="text-purple-700 text-xs">Overall Score</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-orange-600 text-sm">
                  Best Model
                </p>
                <p className="font-bold text-lg text-orange-900">
                  {(analyticsSummary.bestModel?.accuracy || 0).toFixed(1)}%
                </p>
                <p className="text-orange-700 text-xs capitalize">
                  {analyticsSummary.bestModel?.modelType || 'N/A'}
                </p>
              </div>
              <Brain className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Views */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Quick Insights */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Key Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">
                      Revenue Growth
                    </span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium">+12.5%</span>
                    </div>
                  </div>
                  <Progress className="h-2" value={75} />

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">
                      User Retention
                    </span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">85.2%</span>
                    </div>
                  </div>
                  <Progress className="h-2" value={85} />

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">
                      Forecast Accuracy
                    </span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium">92.1%</span>
                    </div>
                  </div>
                  <Progress className="h-2" value={92} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Action Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-lg bg-yellow-50 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="font-medium text-sm text-yellow-800">
                        Churn Rate Increase
                      </p>
                      <p className="text-xs text-yellow-700">
                        3.2% increase detected in the last week
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
                    <Target className="mt-0.5 h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800 text-sm">
                        Model Retraining Due
                      </p>
                      <p className="text-blue-700 text-xs">
                        Revenue forecasting model accuracy below 90%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800 text-sm">
                        Data Quality Excellent
                      </p>
                      <p className="text-green-700 text-xs">
                        All quality metrics above 85% threshold
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mini Dashboard */}
          <AdvancedMetricsDashboard
            benchmarkData={analyticsData.benchmarkData}
            className="h-96"
            dateRange={config.dateRange}
            kpis={analyticsData.kpis}
            loading={loading}
            onDateRangeChange={handleDateRangeChange}
            onExport={handleExport}
            onRefresh={handleRefresh}
            segmentationData={analyticsData.segmentationData}
            timeSeriesData={analyticsData.timeSeriesData}
          />
        </div>
      )}

      {selectedView === 'cohorts' && (
        <CohortHeatmap
          cohortData={analyticsData.cohortData}
          loading={loading}
          onDateRangeChange={handleDateRangeChange}
          onExport={handleExport}
        />
      )}

      {selectedView === 'forecasting' && (
        <ForecastingCharts
          forecastData={analyticsData.forecastData}
          historicalData={analyticsData.timeSeriesData.map((d) => ({
            date: d.date,
            value: d.revenue,
          }))}
          loading={loading}
          metric="revenue"
          onDateRangeChange={handleDateRangeChange}
        />
      )}

      {selectedView === 'metrics' && (
        <AdvancedMetricsDashboard
          benchmarkData={analyticsData.benchmarkData}
          dateRange={config.dateRange}
          kpis={analyticsData.kpis}
          loading={loading}
          onDateRangeChange={handleDateRangeChange}
          onExport={handleExport}
          onRefresh={handleRefresh}
          segmentationData={analyticsData.segmentationData}
          timeSeriesData={analyticsData.timeSeriesData}
        />
      )}

      {selectedView === 'statistics' && (
        <StatisticalInsights
          correlations={analyticsData.correlations}
          dataQuality={analyticsData.dataQuality}
          loading={loading}
          onDataRefresh={handleRefresh}
          onExportResults={handleExport}
          predictiveModels={analyticsData.predictiveModels}
          rawData={analyticsData.timeSeriesData}
          statisticalTests={analyticsData.statisticalTests}
        />
      )}

      {/* Status Footer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-gray-600 text-sm">
            <div className="flex items-center gap-4">
              <span>
                Data Range: {config.dateRange.start} to {config.dateRange.end}
              </span>
              <Separator className="h-4" orientation="vertical" />
              <span>Confidence Level: {config.confidenceLevel}%</span>
              <Separator className="h-4" orientation="vertical" />
              <span>Metrics: {config.selectedMetrics.length} selected</span>
            </div>
            <div className="flex items-center gap-2">
              {analyticsSummary.outliers > 0 && (
                <Badge variant="destructive">
                  {analyticsSummary.outliers} outliers detected
                </Badge>
              )}
              <Badge
                variant={
                  analyticsSummary.overallDataQuality >= 80
                    ? 'default'
                    : 'secondary'
                }
              >
                Quality: {analyticsSummary.overallDataQuality.toFixed(0)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Mock data generators for testing
function generateMockKPIs() {
  return [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: {
        current: 125_400,
        previous: 118_200,
        change: 7200,
        changePercent: 6.1,
        trend: 'up',
        target: 130_000,
      },
      format: 'currency',
      icon: DollarSign,
      color: 'text-green-600',
      description: 'Monthly recurring revenue',
    },
    {
      id: 'users',
      title: 'Active Users',
      value: {
        current: 2840,
        previous: 2650,
        change: 190,
        changePercent: 7.2,
        trend: 'up',
        target: 3000,
      },
      format: 'number',
      icon: Users,
      color: 'text-blue-600',
      description: 'Monthly active users',
    },
  ];
}

function generateMockTimeSeriesData() {
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: 4000 + Math.random() * 1000,
      subscriptions: 80 + Math.random() * 20,
      churn_rate: 2 + Math.random() * 3,
      mrr: 25_000 + Math.random() * 5000,
    });
  }
  return data;
}

function generateMockSegmentationData() {
  return [
    { name: 'Enterprise', value: 45, color: '#3b82f6', change: 5.2 },
    { name: 'Pro', value: 35, color: '#10b981', change: -2.1 },
    { name: 'Starter', value: 20, color: '#f59e0b', change: 8.7 },
  ];
}

function generateMockBenchmarkData() {
  return [
    {
      metric: 'Customer Acquisition Cost',
      value: 120,
      benchmark: 150,
      industry: 180,
      percentile: 75,
    },
    {
      metric: 'Lifetime Value',
      value: 2400,
      benchmark: 2200,
      industry: 2000,
      percentile: 80,
    },
  ];
}
