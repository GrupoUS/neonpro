'use client'

/**
 * Advanced Cohort Heatmap Component for NeonPro
 * 
 * Interactive cohort analysis visualization using Recharts.
 * Displays retention rates across cohorts and time periods
 * with advanced features like tooltips, animations, and filtering.
 */

import React, { useState, useMemo, useCallback } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Target } from 'lucide-react'

// Types for cohort data
interface CohortData {
  cohortId: string
  cohortName: string
  startDate: string
  userCount: number
  periods: Array<{
    period: number
    retentionRate: number
    activeUsers: number
    revenue: number
    averageRevenuePerUser: number
    churnRate: number
  }>
}

interface CohortHeatmapProps {
  cohorts: CohortData[]
  loading?: boolean
  className?: string
  onCohortSelect?: (cohortId: string) => void
  onPeriodSelect?: (period: number) => void
}

// Color scales for heatmap
const getRetentionColor = (rate: number) => {
  if (rate >= 80) return '#10b981' // Green
  if (rate >= 60) return '#f59e0b' // Yellow
  if (rate >= 40) return '#f97316' // Orange
  if (rate >= 20) return '#ef4444' // Red
  return '#6b7280' // Gray
}

const getIntensity = (rate: number) => {
  return Math.min(Math.max(rate / 100, 0.1), 1)
}

export function CohortHeatmap({ 
  cohorts, 
  loading = false, 
  className = '',
  onCohortSelect,
  onPeriodSelect
}: CohortHeatmapProps) {
  const [selectedMetric, setSelectedMetric] = useState<'retention' | 'revenue' | 'churn'>('retention')
  const [selectedView, setSelectedView] = useState<'heatmap' | 'trends' | 'comparison'>('heatmap')
  const [hoveredCell, setHoveredCell] = useState<{ cohort: string, period: number } | null>(null)

  // Transform data for heatmap visualization
  const heatmapData = useMemo(() => {
    if (!cohorts.length) return []

    const maxPeriods = Math.max(...cohorts.map(c => c.periods.length))
    const data = []

    for (let period = 0; period < maxPeriods; period++) {
      const periodData: any = { period: `Period ${period}` }
      
      cohorts.forEach(cohort => {
        const periodMetric = cohort.periods[period]
        if (periodMetric) {
          let value = 0
          if (selectedMetric === 'retention') {
            value = periodMetric.retentionRate
          } else if (selectedMetric === 'revenue') {
            value = periodMetric.averageRevenuePerUser
          } else {
            value = periodMetric.churnRate
          }
          periodData[cohort.cohortName] = value
        }
      })
      
      data.push(periodData)
    }

    return data
  }, [cohorts, selectedMetric])

  // Calculate cohort performance trends
  const trendData = useMemo(() => {
    return cohorts.map(cohort => {
      const periods = cohort.periods.map((period, index) => ({
        period: index,
        retention: period.retentionRate,
        revenue: period.averageRevenuePerUser,
        churn: period.churnRate,
        users: period.activeUsers
      }))

      return {
        cohortId: cohort.cohortId,
        cohortName: cohort.cohortName,
        startDate: cohort.startDate,
        userCount: cohort.userCount,
        periods,
        avgRetention: periods.reduce((sum, p) => sum + p.retention, 0) / periods.length,
        totalRevenue: periods.reduce((sum, p) => sum + p.revenue, 0),
        finalRetention: periods[periods.length - 1]?.retention || 0
      }
    })
  }, [cohorts])

  // Calculate cohort comparison metrics
  const comparisonData = useMemo(() => {
    return cohorts.map(cohort => {
      const periods = cohort.periods
      const initialUsers = cohort.userCount
      const finalPeriod = periods[periods.length - 1]
      
      return {
        cohortName: cohort.cohortName,
        initialUsers,
        finalRetention: finalPeriod?.retentionRate || 0,
        totalRevenue: periods.reduce((sum, p) => sum + p.revenue, 0),
        avgRevenuePerUser: periods.reduce((sum, p) => sum + p.averageRevenuePerUser, 0) / periods.length,
        performanceScore: (finalPeriod?.retentionRate || 0) * 0.6 + 
                         (periods.reduce((sum, p) => sum + p.averageRevenuePerUser, 0) / periods.length) * 0.4
      }
    }).sort((a, b) => b.performanceScore - a.performanceScore)
  }, [cohorts])

  // Custom tooltip for heatmap
  const HeatmapTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mt-1">
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.dataKey}:</span>
            <span className="text-sm font-medium">
              {selectedMetric === 'retention' || selectedMetric === 'churn' 
                ? `${entry.value.toFixed(1)}%`
                : `$${entry.value.toFixed(2)}`
              }
            </span>
          </div>
        ))}
      </div>
    )
  }

  // Trend tooltip
  const TrendTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">Period {label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mt-1">
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.name}:</span>
            <span className="text-sm font-medium">
              {entry.dataKey === 'retention' || entry.dataKey === 'churn'
                ? `${entry.value.toFixed(1)}%`
                : entry.dataKey === 'revenue'
                ? `$${entry.value.toFixed(2)}`
                : entry.value.toLocaleString()
              }
            </span>
          </div>
        ))}
      </div>
    )
  }

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
              <Users className="h-5 w-5 text-blue-600" />
              Cohort Analysis
            </CardTitle>
            <CardDescription>
              Track user retention and revenue across cohorts over time
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retention">Retention</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="churn">Churn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="heatmap" className="mt-6">
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Total Cohorts</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{cohorts.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Avg Retention</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {cohorts.length > 0 
                      ? `${(trendData.reduce((sum, c) => sum + c.avgRetention, 0) / trendData.length).toFixed(1)}%`
                      : '0%'
                    }
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Total Revenue</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    ${trendData.reduce((sum, c) => sum + c.totalRevenue, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Avg Periods</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">
                    {cohorts.length > 0 
                      ? Math.round(cohorts.reduce((sum, c) => sum + c.periods.length, 0) / cohorts.length)
                      : 0
                    }
                  </p>
                </div>
              </div>

              {/* Area Chart for Heatmap Data */}
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={heatmapData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip content={<HeatmapTooltip />} />
                    <Legend />
                    {cohorts.map((cohort, index) => (
                      <Area
                        key={cohort.cohortId}
                        type="monotone"
                        dataKey={cohort.cohortName}
                        stackId="1"
                        stroke={`hsl(${index * 360 / cohorts.length}, 70%, 50%)`}
                        fill={`hsl(${index * 360 / cohorts.length}, 70%, 50%)`}
                        fillOpacity={0.6}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <div className="space-y-6">
              {/* Trend Chart */}
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip content={<TrendTooltip />} />
                    <Legend />
                    {trendData.map((cohort, index) => (
                      <Line
                        key={cohort.cohortId}
                        type="monotone"
                        dataKey={selectedMetric}
                        data={cohort.periods}
                        stroke={`hsl(${index * 360 / trendData.length}, 70%, 50%)`}
                        strokeWidth={2}
                        name={cohort.cohortName}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Cohort Performance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendData.map((cohort) => (
                  <Card key={cohort.cohortId} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{cohort.cohortName}</CardTitle>
                      <CardDescription className="text-xs">
                        Started {new Date(cohort.startDate).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Initial Users</span>
                          <span className="text-sm font-medium">{cohort.userCount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Avg Retention</span>
                          <Badge variant={cohort.avgRetention >= 50 ? "default" : "secondary"}>
                            {cohort.avgRetention.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Final Retention</span>
                          <div className="flex items-center gap-1">
                            {cohort.finalRetention > cohort.periods[0]?.retention ? (
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                            <span className="text-sm font-medium">
                              {cohort.finalRetention.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Total Revenue</span>
                          <span className="text-sm font-medium">${cohort.totalRevenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            <div className="space-y-6">
              {/* Comparison Bar Chart */}
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="cohortName" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        name === 'finalRetention' ? `${value.toFixed(1)}%` : 
                        name.includes('Revenue') ? `$${value.toFixed(2)}` :
                        value.toLocaleString(),
                        name
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="finalRetention" fill="#3b82f6" name="Final Retention %" />
                    <Bar dataKey="avgRevenuePerUser" fill="#10b981" name="Avg Revenue Per User" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Ranking */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Cohort Performance Ranking</h3>
                <div className="space-y-2">
                  {comparisonData.map((cohort, index) => (
                    <div 
                      key={cohort.cohortName}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={index < 3 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{cohort.cohortName}</p>
                          <p className="text-sm text-gray-600">
                            {cohort.initialUsers.toLocaleString()} initial users
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Score: {cohort.performanceScore.toFixed(1)}</p>
                        <p className="text-sm text-gray-600">
                          {cohort.finalRetention.toFixed(1)}% retention
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
