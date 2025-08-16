'use client';

/**
 * Advanced Forecasting Charts Component for NeonPro
 *
 * Interactive time series forecasting visualization using Recharts.
 * Displays revenue predictions, subscription growth forecasts, and confidence intervals
 * with scenario analysis and accuracy metrics.
 */

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  DollarSign,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
  Area,
  Bar,
  Brush,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types for forecasting data
type ForecastData = {
  date: string;
  actual?: number;
  predicted: number;
  lower_bound: number;
  upper_bound: number;
  confidence: number;
};

type ScenarioForecast = {
  name: string;
  data: ForecastData[];
  color: string;
};

type AccuracyMetrics = {
  mae: number;
  mape: number;
  rmse: number;
  accuracy_score: number;
  predictions: Array<{
    actual: number;
    predicted: number;
    date: string;
  }>;
};

type ForecastingChartsProps = {
  metric: 'subscriptions' | 'revenue' | 'churn_rate' | 'mrr' | 'arr';
  historicalData: Array<{ date: string; value: number }>;
  forecastData: ForecastData[];
  scenarios?: ScenarioForecast[];
  accuracyMetrics?: AccuracyMetrics;
  loading?: boolean;
  className?: string;
  onDateRangeChange?: (start: string, end: string) => void;
  onScenarioToggle?: (scenario: string, enabled: boolean) => void;
};

// Utility functions
const formatValue = (value: number, metric: string) => {
  if (metric === 'revenue' || metric === 'mrr' || metric === 'arr') {
    return `$${value.toLocaleString()}`;
  }
  if (metric === 'churn_rate') {
    return `${value.toFixed(1)}%`;
  }
  return value.toLocaleString();
};

const getMetricLabel = (metric: string) => {
  const labels = {
    subscriptions: 'Subscriptions',
    revenue: 'Revenue',
    churn_rate: 'Churn Rate',
    mrr: 'Monthly Recurring Revenue',
    arr: 'Annual Recurring Revenue',
  };
  return labels[metric as keyof typeof labels] || metric;
};

const getMetricIcon = (metric: string) => {
  switch (metric) {
    case 'revenue':
    case 'mrr':
    case 'arr':
      return DollarSign;
    case 'subscriptions':
      return Users;
    case 'churn_rate':
      return TrendingDown;
    default:
      return Activity;
  }
};

export function ForecastingCharts({
  metric,
  historicalData,
  forecastData,
  scenarios = [],
  accuracyMetrics,
  loading = false,
  className = '',
  onDateRangeChange,
  onScenarioToggle,
}: ForecastingChartsProps) {
  const [selectedView, setSelectedView] = useState<
    'forecast' | 'scenarios' | 'accuracy'
  >('forecast');
  const [enabledScenarios, setEnabledScenarios] = useState<Set<string>>(
    new Set(scenarios.map((s) => s.name)),
  );
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(true);
  const [_zoomDomain, setZoomDomain] = useState<[string, string] | null>(null);

  // Combine historical and forecast data
  const combinedData = useMemo(() => {
    const historical = historicalData.map((d) => ({
      ...d,
      type: 'historical' as const,
    }));

    const forecast = forecastData.map((d) => ({
      date: d.date,
      value: d.predicted,
      predicted: d.predicted,
      lower_bound: d.lower_bound,
      upper_bound: d.upper_bound,
      confidence: d.confidence,
      type: 'forecast' as const,
    }));

    return [...historical, ...forecast];
  }, [historicalData, forecastData]);

  // Calculate forecast insights
  const forecastInsights = useMemo(() => {
    if (forecastData.length === 0) {
      return null;
    }

    const _firstForecast = forecastData[0];
    const lastForecast = forecastData.at(-1);
    const lastHistorical = historicalData.at(-1);

    const growth = lastHistorical
      ? ((lastForecast.predicted - lastHistorical.value) /
          lastHistorical.value) *
        100
      : 0;

    const averageConfidence =
      forecastData.reduce((sum, f) => sum + f.confidence, 0) /
      forecastData.length;

    const volatility =
      forecastData.reduce((sum, f) => {
        const range = f.upper_bound - f.lower_bound;
        const midpoint = (f.upper_bound + f.lower_bound) / 2;
        return sum + range / midpoint;
      }, 0) / forecastData.length;

    return {
      growth: Math.round(growth * 100) / 100,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      volatility: Math.round(volatility * 100) / 100,
      trend: growth > 5 ? 'positive' : growth < -5 ? 'negative' : 'stable',
      forecastPeriods: forecastData.length,
    };
  }, [forecastData, historicalData]);

  // Handle scenario toggle
  const handleScenarioToggle = useCallback(
    (scenarioName: string) => {
      const newEnabled = new Set(enabledScenarios);
      if (newEnabled.has(scenarioName)) {
        newEnabled.delete(scenarioName);
      } else {
        newEnabled.add(scenarioName);
      }
      setEnabledScenarios(newEnabled);
      onScenarioToggle?.(scenarioName, newEnabled.has(scenarioName));
    },
    [enabledScenarios, onScenarioToggle],
  );

  // Custom tooltip for forecast chart
  const ForecastTooltip = ({ active, payload, label }: any) => {
    if (!(active && payload && payload.length)) {
      return null;
    }

    const data = payload[0].payload;
    const isHistorical = data.type === 'historical';

    return (
      <div className="max-w-xs rounded-lg border bg-white p-4 shadow-lg">
        <p className="mb-2 font-semibold text-gray-900">
          {new Date(label).toLocaleDateString()}
        </p>

        {isHistorical ? (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-500" />
            <span className="text-gray-600 text-sm">Actual:</span>
            <span className="font-medium text-sm">
              {formatValue(data.value, metric)}
            </span>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-500" />
              <span className="text-gray-600 text-sm">Predicted:</span>
              <span className="font-medium text-sm">
                {formatValue(data.predicted, metric)}
              </span>
            </div>
            {showConfidenceInterval && (
              <>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Range:</span>
                  <span>
                    {formatValue(data.lower_bound, metric)} -{' '}
                    {formatValue(data.upper_bound, metric)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Confidence:</span>
                  <span>{data.confidence}%</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const MetricIcon = getMetricIcon(metric);

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <div className="h-6 animate-pulse rounded bg-gray-200" />
          <div className="h-4 animate-pulse rounded bg-gray-100" />
        </CardHeader>
        <CardContent>
          <div className="h-96 animate-pulse rounded bg-gray-50" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MetricIcon className="h-5 w-5 text-blue-600" />
              {getMetricLabel(metric)} Forecast
            </CardTitle>
            <CardDescription>
              Predictive analysis with confidence intervals and scenario
              modeling
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowConfidenceInterval(!showConfidenceInterval)}
              size="sm"
              variant={showConfidenceInterval ? 'default' : 'outline'}
            >
              Confidence Bands
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          onValueChange={(value: any) => setSelectedView(value)}
          value={selectedView}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
          </TabsList>

          <TabsContent className="mt-6" value="forecast">
            <div className="space-y-6">
              {/* Forecast Insights */}
              {forecastInsights && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-700 text-sm">
                        Growth
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      {forecastInsights.trend === 'positive' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : forecastInsights.trend === 'negative' ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : (
                        <Activity className="h-4 w-4 text-gray-600" />
                      )}
                      <span className="font-bold text-blue-900 text-xl">
                        {forecastInsights.growth > 0 ? '+' : ''}
                        {forecastInsights.growth}%
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-green-50 p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-700 text-sm">
                        Confidence
                      </span>
                    </div>
                    <p className="mt-1 font-bold text-green-900 text-xl">
                      {forecastInsights.averageConfidence}%
                    </p>
                  </div>

                  <div className="rounded-lg bg-orange-50 p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-700 text-sm">
                        Volatility
                      </span>
                    </div>
                    <p className="mt-1 font-bold text-orange-900 text-xl">
                      {(forecastInsights.volatility * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="rounded-lg bg-purple-50 p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-700 text-sm">
                        Periods
                      </span>
                    </div>
                    <p className="mt-1 font-bold text-purple-900 text-xl">
                      {forecastInsights.forecastPeriods}
                    </p>
                  </div>
                </div>
              )}

              {/* Main Forecast Chart */}
              <div className="h-96">
                <ResponsiveContainer height="100%" width="100%">
                  <ComposedChart data={combinedData}>
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
                    <YAxis
                      tickFormatter={(value) => formatValue(value, metric)}
                    />
                    <Tooltip content={<ForecastTooltip />} />
                    <Legend />

                    {/* Confidence Interval Area */}
                    {showConfidenceInterval && (
                      <Area
                        dataKey="upper_bound"
                        fill="rgba(34, 197, 94, 0.1)"
                        name="Upper Bound"
                        stackId="confidence"
                        stroke="none"
                        type="monotone"
                      />
                    )}
                    {showConfidenceInterval && (
                      <Area
                        dataKey="lower_bound"
                        fill="rgba(255, 255, 255, 1)"
                        name="Lower Bound"
                        stackId="confidence"
                        stroke="none"
                        type="monotone"
                      />
                    )}

                    {/* Historical Data Line */}
                    <Line
                      connectNulls={false}
                      dataKey="value"
                      dot={(props) =>
                        props.payload.type === 'historical'
                          ? { ...props, fill: '#3b82f6', r: 3 }
                          : false
                      }
                      name="Actual"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      type="monotone"
                    />

                    {/* Forecast Line */}
                    <Line
                      connectNulls={false}
                      dataKey="predicted"
                      dot={(props) =>
                        props.payload.type === 'forecast'
                          ? { ...props, fill: '#22c55e', r: 3 }
                          : false
                      }
                      name="Predicted"
                      stroke="#22c55e"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      type="monotone"
                    />

                    {/* Current Date Reference Line */}
                    <ReferenceLine
                      label={{ value: 'Now', position: 'topRight' }}
                      stroke="#6b7280"
                      strokeDasharray="2 2"
                      x={historicalData.at(-1)?.date}
                    />

                    <Brush
                      dataKey="date"
                      height={30}
                      onChange={(domain) => {
                        if (
                          domain &&
                          domain.startIndex !== undefined &&
                          domain.endIndex !== undefined
                        ) {
                          const start = combinedData[domain.startIndex]?.date;
                          const end = combinedData[domain.endIndex]?.date;
                          if (start && end) {
                            setZoomDomain([start, end]);
                            onDateRangeChange?.(start, end);
                          }
                        }
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Forecast Summary */}
              {forecastData.length > 0 && (
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Forecast Summary:</strong> Based on historical
                    trends, we predict{' '}
                    <strong>{getMetricLabel(metric).toLowerCase()}</strong> will{' '}
                    {forecastInsights?.trend === 'positive'
                      ? 'increase'
                      : forecastInsights?.trend === 'negative'
                        ? 'decrease'
                        : 'remain stable'}{' '}
                    by{' '}
                    <strong>{Math.abs(forecastInsights?.growth || 0)}%</strong>{' '}
                    over the next {forecastData.length} periods with{' '}
                    {forecastInsights?.averageConfidence}% confidence.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent className="mt-6" value="scenarios">
            <div className="space-y-6">
              {/* Scenario Controls */}
              <div className="flex flex-wrap gap-2">
                {scenarios.map((scenario) => (
                  <Button
                    className="flex items-center gap-2"
                    key={scenario.name}
                    onClick={() => handleScenarioToggle(scenario.name)}
                    size="sm"
                    variant={
                      enabledScenarios.has(scenario.name)
                        ? 'default'
                        : 'outline'
                    }
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: scenario.color }}
                    />
                    {scenario.name}
                  </Button>
                ))}
              </div>

              {/* Scenario Comparison Chart */}
              <div className="h-96">
                <ResponsiveContainer height="100%" width="100%">
                  <LineChart>
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
                    <YAxis
                      tickFormatter={(value) => formatValue(value, metric)}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        formatValue(value, metric),
                        'Predicted',
                      ]}
                      labelFormatter={(date) =>
                        new Date(date).toLocaleDateString()
                      }
                    />
                    <Legend />

                    {/* Historical Data */}
                    <Line
                      data={historicalData}
                      dataKey="value"
                      name="Historical"
                      stroke="#6b7280"
                      strokeWidth={2}
                      type="monotone"
                    />

                    {/* Scenario Lines */}
                    {scenarios
                      .filter((scenario) => enabledScenarios.has(scenario.name))
                      .map((scenario) => (
                        <Line
                          data={scenario.data}
                          dataKey="predicted"
                          key={scenario.name}
                          name={scenario.name}
                          stroke={scenario.color}
                          strokeDasharray="5 5"
                          strokeWidth={2}
                          type="monotone"
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Scenario Summary Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {scenarios.map((scenario) => {
                  const lastForecast = scenario.data.at(-1);
                  const firstForecast = scenario.data[0];
                  const growth = firstForecast
                    ? ((lastForecast.predicted - firstForecast.predicted) /
                        firstForecast.predicted) *
                      100
                    : 0;

                  return (
                    <Card
                      className={`border-l-4 ${enabledScenarios.has(scenario.name) ? 'opacity-100' : 'opacity-50'}`}
                      key={scenario.name}
                      style={{ borderLeftColor: scenario.color }}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 font-medium text-sm">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: scenario.color }}
                          />
                          {scenario.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-xs">
                              Final Value
                            </span>
                            <span className="font-medium text-sm">
                              {formatValue(lastForecast.predicted, metric)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-xs">
                              Growth
                            </span>
                            <div className="flex items-center gap-1">
                              {growth > 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-500" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-red-500" />
                              )}
                              <span className="font-medium text-sm">
                                {growth > 0 ? '+' : ''}
                                {growth.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-xs">
                              Confidence
                            </span>
                            <Badge variant="secondary">
                              {lastForecast.confidence}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent className="mt-6" value="accuracy">
            {accuracyMetrics ? (
              <div className="space-y-6">
                {/* Accuracy Metrics Overview */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="rounded-lg bg-green-50 p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-700 text-sm">
                        Accuracy Score
                      </span>
                    </div>
                    <p className="mt-1 font-bold text-2xl text-green-900">
                      {accuracyMetrics.accuracy_score.toFixed(1)}%
                    </p>
                    <Progress
                      className="mt-2"
                      value={accuracyMetrics.accuracy_score}
                    />
                  </div>

                  <div className="rounded-lg bg-blue-50 p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-700 text-sm">
                        MAE
                      </span>
                    </div>
                    <p className="mt-1 font-bold text-2xl text-blue-900">
                      {formatValue(accuracyMetrics.mae, metric)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-purple-50 p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-700 text-sm">
                        MAPE
                      </span>
                    </div>
                    <p className="mt-1 font-bold text-2xl text-purple-900">
                      {accuracyMetrics.mape.toFixed(1)}%
                    </p>
                  </div>

                  <div className="rounded-lg bg-orange-50 p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-700 text-sm">
                        RMSE
                      </span>
                    </div>
                    <p className="mt-1 font-bold text-2xl text-orange-900">
                      {formatValue(accuracyMetrics.rmse, metric)}
                    </p>
                  </div>
                </div>

                {/* Accuracy Chart */}
                <div className="h-96">
                  <ResponsiveContainer height="100%" width="100%">
                    <ComposedChart data={accuracyMetrics.predictions}>
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
                      <YAxis
                        tickFormatter={(value) => formatValue(value, metric)}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          formatValue(value, metric),
                          name === 'actual' ? 'Actual' : 'Predicted',
                        ]}
                        labelFormatter={(date) =>
                          new Date(date).toLocaleDateString()
                        }
                      />
                      <Legend />

                      {/* Actual vs Predicted Lines */}
                      <Line
                        dataKey="actual"
                        name="Actual"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        type="monotone"
                      />
                      <Line
                        dataKey="predicted"
                        name="Predicted"
                        stroke="#22c55e"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        type="monotone"
                      />

                      {/* Error Bars */}
                      <Bar
                        dataKey={(entry: any) =>
                          Math.abs(entry.actual - entry.predicted)
                        }
                        fill="rgba(239, 68, 68, 0.3)"
                        name="Prediction Error"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Accuracy Insights */}
                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Model Performance:</strong> The forecasting model
                    achieves{' '}
                    <strong>
                      {accuracyMetrics.accuracy_score.toFixed(1)}%
                    </strong>{' '}
                    accuracy with an average error of{' '}
                    <strong>{formatValue(accuracyMetrics.mae, metric)}</strong>.
                    The model is{' '}
                    {accuracyMetrics.accuracy_score >= 80
                      ? 'highly reliable'
                      : accuracyMetrics.accuracy_score >= 60
                        ? 'moderately reliable'
                        : 'needs improvement'}{' '}
                    for business planning.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="py-12 text-center">
                <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 font-medium text-gray-900 text-lg">
                  No Accuracy Data Available
                </h3>
                <p className="text-gray-600">
                  Run model validation to see accuracy metrics and performance
                  analysis.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
