'use client'

/**
 * Advanced Metrics Dashboard Component for NeonPro
 * 
 * Comprehensive analytics dashboard displaying key business metrics,
 * advanced KPIs, and real-time performance indicators with interactive
 * visualizations and drill-down capabilities.
 */

import React, { useState, useMemo, useCallback } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Calendar,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  Zap,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'

// Types for dashboard data
interface MetricValue {
  current: number
  previous: number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'stable'
  target?: number
  benchmark?: number
}

interface KPICard {
  id: string
  title: string
  value: MetricValue
  format: 'currency' | 'number' | 'percentage' | 'duration'
  icon: React.ComponentType<any>
  color: string
  description?: string
}

interface ChartData {
  date: string
  [key: string]: any
}

interface SegmentData {
  name: string
  value: number
  color: string
  change?: number
}

interface BenchmarkData {
  metric: string
  value: number
  benchmark: number
  industry: number
  percentile: number
}

interface AdvancedMetricsDashboardProps {
  kpis: KPICard[]
  timeSeriesData: ChartData[]
  segmentationData: SegmentData[]
  benchmarkData: BenchmarkData[]
  cohortData?: any[]
  forecastData?: any[]
  loading?: boolean
  dateRange: { start: string; end: string }
  className?: string
  onMetricClick?: (metricId: string) => void
  onDateRangeChange?: (start: string, end: string) => void
  onExport?: (format: 'csv' | 'pdf' | 'png') => void
  onRefresh?: () => void
}

// Utility functions
const formatValue = (value: number, format: string) => {
  switch (format) {
    case 'currency':
      return `$${value.toLocaleString()}`
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'duration':
      return `${value}d`
    default:
      return value.toLocaleString()
  }
}

const getChangeColor = (change: number) => {
  if (change > 0) return 'text-green-600'
  if (change < 0) return 'text-red-600'
  return 'text-gray-600'
}

const getChangeIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return TrendingUp
    case 'down':
      return TrendingDown
    default:
      return ArrowUpDown
  }
}

const getBenchmarkStatus = (value: number, benchmark: number) => {
  const ratio = value / benchmark
  if (ratio >= 1.1) return { status: 'excellent', color: 'text-green-600', icon: CheckCircle }
  if (ratio >= 0.9) return { status: 'good', color: 'text-blue-600', icon: Target }
  if (ratio >= 0.7) return { status: 'fair', color: 'text-yellow-600', icon: AlertTriangle }
  return { status: 'poor', color: 'text-red-600', icon: XCircle }
}

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
  onRefresh
}: AdvancedMetricsDashboardProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'performance' | 'segments' | 'benchmarks'>('overview')
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null)
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line')
  const [timeGranularity, setTimeGranularity] = useState<'day' | 'week' | 'month'>('day')

  // Calculate dashboard summary
  const dashboardSummary = useMemo(() => {
    const totalRevenue = kpis.find(k => k.id === 'revenue')?.value.current || 0
    const totalUsers = kpis.find(k => k.id === 'users')?.value.current || 0
    const avgGrowth = kpis.reduce((sum, kpi) => sum + kpi.value.changePercent, 0) / kpis.length

    const overPerforming = kpis.filter(kpi => 
      kpi.value.target && kpi.value.current >= kpi.value.target
    ).length

    const underPerforming = kpis.filter(kpi => 
      kpi.value.target && kpi.value.current < kpi.value.target * 0.8
    ).length

    return {
      totalRevenue,
      totalUsers,
      avgGrowth,
      overPerforming,
      underPerforming,
      totalKPIs: kpis.length
    }
  }, [kpis])

  // Process time series data for different granularities
  const processedTimeSeriesData = useMemo(() => {
    if (timeGranularity === 'day') return timeSeriesData

    const grouped = timeSeriesData.reduce((acc, item) => {
      const date = new Date(item.date)
      let key: string

      if (timeGranularity === 'week') {
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
        key = weekStart.toISOString().split('T')[0]
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      }

      if (!acc[key]) {
        acc[key] = { date: key, count: 0 }
        Object.keys(item).forEach(k => {
          if (k !== 'date') acc[key][k] = 0
        })
      }

      Object.keys(item).forEach(k => {
        if (k !== 'date' && typeof item[k] === 'number') {
          acc[key][k] += item[k]
        }
      })
      acc[key].count += 1

      return acc
    }, {} as Record<string, any>)

    return Object.values(grouped).map((item: any) => {
      const processed = { ...item }
      Object.keys(processed).forEach(k => {
        if (k !== 'date' && k !== 'count' && typeof processed[k] === 'number') {
          processed[k] = processed[k] / item.count
        }
      })
      delete processed.count
      return processed
    })
  }, [timeSeriesData, timeGranularity])

  // Handle KPI card click
  const handleKPIClick = useCallback((kpiId: string) => {
    setSelectedKPI(kpiId === selectedKPI ? null : kpiId)
    onMetricClick?.(kpiId)
  }, [selectedKPI, onMetricClick])

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg max-w-xs">
        <p className="font-semibold text-gray-900 mb-2">
          {new Date(label).toLocaleDateString()}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`w-full space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-100 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-96 bg-gray-100 rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Comprehensive business metrics and performance insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeGranularity} onValueChange={(value: any) => setTimeGranularity(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport?.('csv')}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatValue(dashboardSummary.totalRevenue, 'currency')}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatValue(dashboardSummary.totalUsers, 'number')}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Avg Growth</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatValue(dashboardSummary.avgGrowth, 'percentage')}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Performance</p>
                <p className="text-lg font-bold text-orange-900">
                  {dashboardSummary.overPerforming}/{dashboardSummary.totalKPIs} KPIs
                </p>
                <p className="text-xs text-orange-700">Above Target</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map((kpi) => {
                const Icon = kpi.icon
                const ChangeIcon = getChangeIcon(kpi.value.trend)
                const isSelected = selectedKPI === kpi.id

                return (
                  <Card 
                    key={kpi.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''
                    }`}
                    onClick={() => handleKPIClick(kpi.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-600">
                          {kpi.title}
                        </CardTitle>
                        <Icon className={`h-4 w-4 ${kpi.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatValue(kpi.value.current, kpi.format)}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <ChangeIcon className={`h-3 w-3 ${getChangeColor(kpi.value.change)}`} />
                          <span className={`text-xs font-medium ${getChangeColor(kpi.value.change)}`}>
                            {kpi.value.changePercent > 0 ? '+' : ''}
                            {kpi.value.changePercent.toFixed(1)}%
                          </span>
                          <span className="text-xs text-gray-500">vs last period</span>
                        </div>

                        {kpi.value.target && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Progress to target</span>
                              <span>{((kpi.value.current / kpi.value.target) * 100).toFixed(0)}%</span>
                            </div>
                            <Progress 
                              value={Math.min((kpi.value.current / kpi.value.target) * 100, 100)} 
                              className="h-1"
                            />
                          </div>
                        )}

                        {kpi.description && (
                          <p className="text-xs text-gray-500 mt-2">{kpi.description}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
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
                    <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
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
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' && (
                      <LineChart data={processedTimeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {kpis.slice(0, 4).map((kpi, index) => (
                          <Line
                            key={kpi.id}
                            type="monotone"
                            dataKey={kpi.id}
                            stroke={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]}
                            strokeWidth={2}
                            name={kpi.title}
                          />
                        ))}
                      </LineChart>
                    )}
                    
                    {chartType === 'area' && (
                      <AreaChart data={processedTimeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {kpis.slice(0, 4).map((kpi, index) => (
                          <Area
                            key={kpi.id}
                            type="monotone"
                            dataKey={kpi.id}
                            stackId="1"
                            stroke={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]}
                            fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]}
                            fillOpacity={0.6}
                            name={kpi.title}
                          />
                        ))}
                      </AreaChart>
                    )}
                    
                    {chartType === 'bar' && (
                      <BarChart data={processedTimeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {kpis.slice(0, 4).map((kpi, index) => (
                          <Bar
                            key={kpi.id}
                            dataKey={kpi.id}
                            fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]}
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

        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart data={kpis.filter(k => k.value.target).map(kpi => ({
                      name: kpi.title,
                      value: Math.min((kpi.value.current / kpi.value.target!) * 100, 150),
                      fill: kpi.color.replace('text-', '#').replace('-600', '')
                    }))}>
                      <RadialBar dataKey="value" cornerRadius={4} fill="#8884d8" />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Achievement']}
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
                    .filter(k => k.value.target)
                    .sort((a, b) => 
                      (b.value.current / b.value.target!) - (a.value.current / a.value.target!)
                    )
                    .map((kpi, index) => {
                      const achievement = (kpi.value.current / kpi.value.target!) * 100
                      const Icon = kpi.icon
                      
                      return (
                        <div key={kpi.id} className="flex items-center gap-4">
                          <div className={`p-2 rounded ${
                            index < 2 ? 'bg-green-100' : index >= kpis.length - 2 ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            <Icon className={`h-4 w-4 ${
                              index < 2 ? 'text-green-600' : index >= kpis.length - 2 ? 'text-red-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm">{kpi.title}</span>
                              <Badge variant={
                                achievement >= 100 ? 'default' : 
                                achievement >= 80 ? 'secondary' : 'destructive'
                              }>
                                {achievement.toFixed(0)}%
                              </Badge>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>{formatValue(kpi.value.current, kpi.format)}</span>
                              <span>Target: {formatValue(kpi.value.target!, kpi.format)}</span>
                            </div>
                            <Progress value={Math.min(achievement, 100)} className="h-1 mt-2" />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={segmentationData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {segmentationData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [value.toLocaleString(), 'Value']}
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
                  {segmentationData.map((segment, index) => (
                    <div key={segment.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded" 
                            style={{ backgroundColor: segment.color }}
                          />
                          <span className="font-medium">{segment.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{segment.value.toLocaleString()}</div>
                          {segment.change !== undefined && (
                            <div className={`text-xs ${getChangeColor(segment.change)}`}>
                              {segment.change > 0 ? '+' : ''}{segment.change.toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                      <Progress 
                        value={(segment.value / Math.max(...segmentationData.map(s => s.value))) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="mt-6">
          <div className="space-y-6">
            {/* Benchmark Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Above Benchmark</p>
                      <p className="text-2xl font-bold text-green-900">
                        {benchmarkData.filter(b => b.value >= b.benchmark).length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-600 text-sm font-medium">Near Benchmark</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {benchmarkData.filter(b => b.value < b.benchmark && b.value >= b.benchmark * 0.8).length}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 text-sm font-medium">Below Benchmark</p>
                      <p className="text-2xl font-bold text-red-900">
                        {benchmarkData.filter(b => b.value < b.benchmark * 0.8).length}
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
                    const status = getBenchmarkStatus(benchmark.value, benchmark.benchmark)
                    const StatusIcon = status.icon
                    
                    return (
                      <div key={benchmark.metric} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <StatusIcon className={`h-5 w-5 ${status.color}`} />
                            <div>
                              <h4 className="font-medium">{benchmark.metric}</h4>
                              <p className="text-sm text-gray-600">
                                {benchmark.percentile}th percentile
                              </p>
                            </div>
                          </div>
                          <Badge variant={
                            status.status === 'excellent' ? 'default' :
                            status.status === 'good' ? 'secondary' :
                            status.status === 'fair' ? 'outline' : 'destructive'
                          }>
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
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Performance vs Benchmark</span>
                            <span>{((benchmark.value / benchmark.benchmark) * 100).toFixed(0)}%</span>
                          </div>
                          <Progress 
                            value={Math.min((benchmark.value / benchmark.benchmark) * 100, 150)} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    )
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
            <strong>Action Required:</strong> {dashboardSummary.underPerforming} KPI(s) are significantly below target. 
            Review performance metrics and consider strategic adjustments.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}