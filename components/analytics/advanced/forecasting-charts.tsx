'use client'

/**
 * Advanced Forecasting Charts Component for NeonPro
 * 
 * Interactive time series forecasting visualization using Recharts.
 * Displays revenue predictions, subscription growth forecasts, and confidence intervals
 * with scenario analysis and accuracy metrics.
 */

import React, { useState, useMemo, useCallback } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Bar,
  ReferenceLine,
  Brush
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  Users, 
  AlertTriangle,
  BarChart3,
  Activity,
  Calendar
} from 'lucide-react'

// Types for forecasting data
interface ForecastData {
  date: string
  actual?: number
  predicted: number
  lower_bound: number
  upper_bound: number
  confidence: number
}

interface ScenarioForecast {
  name: string
  data: ForecastData[]
  color: string
}

interface AccuracyMetrics {
  mae: number
  mape: number
  rmse: number
  accuracy_score: number
  predictions: Array<{
    actual: number
    predicted: number
    date: string
  }>
}

interface ForecastingChartsProps {
  metric: 'subscriptions' | 'revenue' | 'churn_rate' | 'mrr' | 'arr'
  historicalData: Array<{ date: string; value: number }>
  forecastData: ForecastData[]
  scenarios?: ScenarioForecast[]
  accuracyMetrics?: AccuracyMetrics
  loading?: boolean
  className?: string
  onDateRangeChange?: (start: string, end: string) => void
  onScenarioToggle?: (scenario: string, enabled: boolean) => void
}

// Utility functions
const formatValue = (value: number, metric: string) => {
  if (metric === 'revenue' || metric === 'mrr' || metric === 'arr') {
    return `$${value.toLocaleString()}`
  }
  if (metric === 'churn_rate') {
    return `${value.toFixed(1)}%`
  }
  return value.toLocaleString()
}

const getMetricLabel = (metric: string) => {
  const labels = {
    subscriptions: 'Subscriptions',
    revenue: 'Revenue',
    churn_rate: 'Churn Rate',
    mrr: 'Monthly Recurring Revenue',
    arr: 'Annual Recurring Revenue'
  }
  return labels[metric as keyof typeof labels] || metric
}

const getMetricIcon = (metric: string) => {
  switch (metric) {
    case 'revenue':
    case 'mrr':
    case 'arr':
      return DollarSign
    case 'subscriptions':
      return Users
    case 'churn_rate':
      return TrendingDown
    default:
      return Activity
  }
}

export function ForecastingCharts({
  metric,
  historicalData,
  forecastData,
  scenarios = [],
  accuracyMetrics,
  loading = false,
  className = '',
  onDateRangeChange,
  onScenarioToggle
}: ForecastingChartsProps) {
  const [selectedView, setSelectedView] = useState<'forecast' | 'scenarios' | 'accuracy'>('forecast')
  const [enabledScenarios, setEnabledScenarios] = useState<Set<string>>(
    new Set(scenarios.map(s => s.name))
  )
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(true)
  const [zoomDomain, setZoomDomain] = useState<[string, string] | null>(null)

  // Combine historical and forecast data
  const combinedData = useMemo(() => {
    const historical = historicalData.map(d => ({
      ...d,
      type: 'historical' as const
    }))

    const forecast = forecastData.map(d => ({
      date: d.date,
      value: d.predicted,
      predicted: d.predicted,
      lower_bound: d.lower_bound,
      upper_bound: d.upper_bound,
      confidence: d.confidence,
      type: 'forecast' as const
    }))

    return [...historical, ...forecast]
  }, [historicalData, forecastData])

  // Calculate forecast insights
  const forecastInsights = useMemo(() => {
    if (forecastData.length === 0) return null

    const firstForecast = forecastData[0]
    const lastForecast = forecastData[forecastData.length - 1]
    const lastHistorical = historicalData[historicalData.length - 1]

    const growth = lastHistorical 
      ? ((lastForecast.predicted - lastHistorical.value) / lastHistorical.value) * 100
      : 0

    const averageConfidence = forecastData.reduce((sum, f) => sum + f.confidence, 0) / forecastData.length
    
    const volatility = forecastData.reduce((sum, f) => {
      const range = f.upper_bound - f.lower_bound
      const midpoint = (f.upper_bound + f.lower_bound) / 2
      return sum + (range / midpoint)
    }, 0) / forecastData.length

    return {
      growth: Math.round(growth * 100) / 100,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      volatility: Math.round(volatility * 100) / 100,
      trend: growth > 5 ? 'positive' : growth < -5 ? 'negative' : 'stable',
      forecastPeriods: forecastData.length
    }
  }, [forecastData, historicalData])

  // Handle scenario toggle
  const handleScenarioToggle = useCallback((scenarioName: string) => {
    const newEnabled = new Set(enabledScenarios)
    if (newEnabled.has(scenarioName)) {
      newEnabled.delete(scenarioName)
    } else {
      newEnabled.add(scenarioName)
    }
    setEnabledScenarios(newEnabled)
    onScenarioToggle?.(scenarioName, newEnabled.has(scenarioName))
  }, [enabledScenarios, onScenarioToggle])

  // Custom tooltip for forecast chart
  const ForecastTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    const data = payload[0].payload
    const isHistorical = data.type === 'historical'

    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg max-w-xs">
        <p className="font-semibold text-gray-900 mb-2">
          {new Date(label).toLocaleDateString()}
        </p>
        
        {isHistorical ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-sm text-gray-600">Actual:</span>
            <span className="text-sm font-medium">
              {formatValue(data.value, metric)}
            </span>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-sm text-gray-600">Predicted:</span>
              <span className="text-sm font-medium">
                {formatValue(data.predicted, metric)}
              </span>
            </div>
            {showConfidenceInterval && (
              <>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Range:</span>
                  <span>
                    {formatValue(data.lower_bound, metric)} - {formatValue(data.upper_bound, metric)}
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
    )
  }

  const MetricIcon = getMetricIcon(metric)

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-100 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-50 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
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
              Predictive analysis with confidence intervals and scenario modeling
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showConfidenceInterval ? "default" : "outline"}
              size="sm"
              onClick={() => setShowConfidenceInterval(!showConfidenceInterval)}
            >
              Confidence Bands
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
          </TabsList>

          <TabsContent value="forecast" className="mt-6">
            <div className="space-y-6">
              {/* Forecast Insights */}
              {forecastInsights && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Growth</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {forecastInsights.trend === 'positive' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : forecastInsights.trend === 'negative' ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : (
                        <Activity className="h-4 w-4 text-gray-600" />
                      )}
                      <span className="text-xl font-bold text-blue-900">
                        {forecastInsights.growth > 0 ? '+' : ''}{forecastInsights.growth}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Confidence</span>
                    </div>
                    <p className="text-xl font-bold text-green-900 mt-1">
                      {forecastInsights.averageConfidence}%
                    </p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-700">Volatility</span>
                    </div>
                    <p className="text-xl font-bold text-orange-900 mt-1">
                      {(forecastInsights.volatility * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">Periods</span>
                    </div>
                    <p className="text-xl font-bold text-purple-900 mt-1">
                      {forecastInsights.forecastPeriods}
                    </p>
                  </div>
                </div>
              )}

              {/* Main Forecast Chart */}
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={combinedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatValue(value, metric)}
                    />
                    <Tooltip content={<ForecastTooltip />} />
                    <Legend />

                    {/* Confidence Interval Area */}
                    {showConfidenceInterval && (
                      <Area
                        type="monotone"
                        dataKey="upper_bound"
                        stackId="confidence"
                        stroke="none"
                        fill="rgba(34, 197, 94, 0.1)"
                        name="Upper Bound"
                      />
                    )}
                    {showConfidenceInterval && (
                      <Area
                        type="monotone"
                        dataKey="lower_bound"
                        stackId="confidence"
                        stroke="none"
                        fill="rgba(255, 255, 255, 1)"
                        name="Lower Bound"
                      />
                    )}

                    {/* Historical Data Line */}
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={(props) => props.payload.type === 'historical' ? { ...props, fill: '#3b82f6', r: 3 } : false}
                      connectNulls={false}
                      name="Actual"
                    />

                    {/* Forecast Line */}
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#22c55e"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={(props) => props.payload.type === 'forecast' ? { ...props, fill: '#22c55e', r: 3 } : false}
                      connectNulls={false}
                      name="Predicted"
                    />

                    {/* Current Date Reference Line */}
                    <ReferenceLine 
                      x={historicalData[historicalData.length - 1]?.date} 
                      stroke="#6b7280" 
                      strokeDasharray="2 2"
                      label={{ value: "Now", position: "topRight" }}
                    />

                    <Brush 
                      dataKey="date" 
                      height={30}
                      onChange={(domain) => {
                        if (domain && domain.startIndex !== undefined && domain.endIndex !== undefined) {
                          const start = combinedData[domain.startIndex]?.date
                          const end = combinedData[domain.endIndex]?.date
                          if (start && end) {
                            setZoomDomain([start, end])
                            onDateRangeChange?.(start, end)
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
                    <strong>Forecast Summary:</strong> Based on historical trends, we predict{' '}
                    <strong>{getMetricLabel(metric).toLowerCase()}</strong> will{' '}
                    {forecastInsights?.trend === 'positive' ? 'increase' : 
                     forecastInsights?.trend === 'negative' ? 'decrease' : 'remain stable'} by{' '}
                    <strong>{Math.abs(forecastInsights?.growth || 0)}%</strong> over the next{' '}
                    {forecastData.length} periods with {forecastInsights?.averageConfidence}% confidence.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="scenarios" className="mt-6">
            <div className="space-y-6">
              {/* Scenario Controls */}
              <div className="flex flex-wrap gap-2">
                {scenarios.map((scenario) => (
                  <Button
                    key={scenario.name}
                    variant={enabledScenarios.has(scenario.name) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleScenarioToggle(scenario.name)}
                    className="flex items-center gap-2"
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: scenario.color }}
                    />
                    {scenario.name}
                  </Button>
                ))}
              </div>

              {/* Scenario Comparison Chart */}
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    />
                    <YAxis tickFormatter={(value) => formatValue(value, metric)} />
                    <Tooltip 
                      formatter={(value: number) => [formatValue(value, metric), 'Predicted']}
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <Legend />

                    {/* Historical Data */}
                    <Line
                      data={historicalData}
                      type="monotone"
                      dataKey="value"
                      stroke="#6b7280"
                      strokeWidth={2}
                      name="Historical"
                    />

                    {/* Scenario Lines */}
                    {scenarios
                      .filter(scenario => enabledScenarios.has(scenario.name))
                      .map((scenario) => (
                        <Line
                          key={scenario.name}
                          data={scenario.data}
                          type="monotone"
                          dataKey="predicted"
                          stroke={scenario.color}
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name={scenario.name}
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Scenario Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenarios.map((scenario) => {
                  const lastForecast = scenario.data[scenario.data.length - 1]
                  const firstForecast = scenario.data[0]
                  const growth = firstForecast 
                    ? ((lastForecast.predicted - firstForecast.predicted) / firstForecast.predicted) * 100
                    : 0

                  return (
                    <Card 
                      key={scenario.name} 
                      className={`border-l-4 ${enabledScenarios.has(scenario.name) ? 'opacity-100' : 'opacity-50'}`}
                      style={{ borderLeftColor: scenario.color }}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: scenario.color }}
                          />
                          {scenario.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Final Value</span>
                            <span className="text-sm font-medium">
                              {formatValue(lastForecast.predicted, metric)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Growth</span>
                            <div className="flex items-center gap-1">
                              {growth > 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-500" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-red-500" />
                              )}
                              <span className="text-sm font-medium">
                                {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Confidence</span>
                            <Badge variant="secondary">
                              {lastForecast.confidence}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="accuracy" className="mt-6">
            {accuracyMetrics ? (
              <div className="space-y-6">
                {/* Accuracy Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Accuracy Score</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {accuracyMetrics.accuracy_score.toFixed(1)}%
                    </p>
                    <Progress value={accuracyMetrics.accuracy_score} className="mt-2" />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">MAE</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {formatValue(accuracyMetrics.mae, metric)}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">MAPE</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900 mt-1">
                      {accuracyMetrics.mape.toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-700">RMSE</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-900 mt-1">
                      {formatValue(accuracyMetrics.rmse, metric)}
                    </p>
                  </div>
                </div>

                {/* Accuracy Chart */}
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={accuracyMetrics.predictions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      />
                      <YAxis tickFormatter={(value) => formatValue(value, metric)} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          formatValue(value, metric), 
                          name === 'actual' ? 'Actual' : 'Predicted'
                        ]}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Legend />

                      {/* Actual vs Predicted Lines */}
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Actual"
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#22c55e"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Predicted"
                      />

                      {/* Error Bars */}
                      <Bar
                        dataKey={(entry: any) => Math.abs(entry.actual - entry.predicted)}
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
                    <strong>Model Performance:</strong> The forecasting model achieves{' '}
                    <strong>{accuracyMetrics.accuracy_score.toFixed(1)}%</strong> accuracy with an average error of{' '}
                    <strong>{formatValue(accuracyMetrics.mae, metric)}</strong>. The model is{' '}
                    {accuracyMetrics.accuracy_score >= 80 ? 'highly reliable' : 
                     accuracyMetrics.accuracy_score >= 60 ? 'moderately reliable' : 'needs improvement'} for business planning.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Accuracy Data Available</h3>
                <p className="text-gray-600">
                  Run model validation to see accuracy metrics and performance analysis.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}