/**
 * NeonPro Performance Dashboard Component
 * Real-time performance metrics display with Core Web Vitals tracking
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Gauge, 
  Timer, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface PerformanceMetrics {
  lcp: number
  fid: number
  cls: number
  fcp: number
  ttfb: number
  score: number
  timestamp: string
  page: string
}

interface SystemMetrics {
  memoryUsage: number
  jsHeapSize: number
  loadTime: number
  domNodes: number
  resources: number
}

/**
 * Performance Dashboard with real-time metrics
 */
export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [history, setHistory] = useState<PerformanceMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)

  /**
   * Fetch current performance metrics
   */
  const fetchMetrics = async () => {
    try {
      setIsLoading(true)
      
      // Fetch Core Web Vitals from API
      const response = await fetch('/api/analytics/performance')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.current)
        setHistory(data.history || [])
      }

      // Get system performance metrics
      const systemData = getSystemMetrics()
      setSystemMetrics(systemData)
      
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Get system-level performance metrics
   */
  const getSystemMetrics = (): SystemMetrics => {
    const performance = window.performance
    const memory = (performance as any).memory
    
    return {
      memoryUsage: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0,
      jsHeapSize: memory ? Math.round(memory.totalJSHeapSize / 1024 / 1024) : 0,
      loadTime: Math.round(performance.timing?.loadEventEnd - performance.timing?.navigationStart) || 0,
      domNodes: document.querySelectorAll('*').length,
      resources: performance.getEntriesByType('resource').length
    }
  }

  /**
   * Get performance score color based on value
   */
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  /**
   * Get performance badge variant
   */
  const getBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' => {
    if (score >= 90) return 'default'
    if (score >= 70) return 'secondary'
    return 'destructive'
  }

  /**
   * Format metric value with units
   */
  const formatMetric = (value: number, unit: string): string => {
    return `${value.toFixed(2)}${unit}`
  }

  /**
   * Calculate trend from history
   */
  const calculateTrend = (current: number, history: PerformanceMetrics[]): 'up' | 'down' | 'stable' => {
    if (history.length < 2) return 'stable'
    
    const previous = history[history.length - 2]
    const change = Math.abs(current - (previous as any)[Object.keys(previous)[0]])
    
    if (change < 0.1) return 'stable'
    return current > (previous as any)[Object.keys(previous)[0]] ? 'up' : 'down'
  }

  // Auto-refresh effect
  useEffect(() => {
    fetchMetrics()
    
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(fetchMetrics, 10000) // 10 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading performance metrics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time Core Web Vitals and system metrics
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Stop Auto-refresh' : 'Auto-refresh'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="system">System Metrics</TabsTrigger>
          <TabsTrigger value="history">Performance History</TabsTrigger>
        </TabsList>

        {/* Core Web Vitals Tab */}
        <TabsContent value="vitals">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Overall Performance Score */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <span className={getScoreColor(metrics?.score || 0)}>
                    {metrics?.score || 0}/100
                  </span>
                </div>
                <div className="mt-2">
                  <Progress value={metrics?.score || 0} className="h-2" />
                </div>
                <Badge variant={getBadgeVariant(metrics?.score || 0)} className="mt-2">
                  {(metrics?.score || 0) >= 90 ? 'Excellent' : 
                   (metrics?.score || 0) >= 70 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </CardContent>
            </Card>

            {/* Largest Contentful Paint */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Largest Contentful Paint</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMetric(metrics?.lcp || 0, 's')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Good: &lt;2.5s • Needs Improvement: &lt;4s
                </p>
                <div className="flex items-center mt-2">
                  {(metrics?.lcp || 0) <= 2.5 ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                  )}
                  <span className="text-sm">
                    {(metrics?.lcp || 0) <= 2.5 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* First Input Delay */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">First Input Delay</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMetric(metrics?.fid || 0, 'ms')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Good: &lt;100ms • Needs Improvement: &lt;300ms
                </p>
                <div className="flex items-center mt-2">
                  {(metrics?.fid || 0) <= 100 ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                  )}
                  <span className="text-sm">
                    {(metrics?.fid || 0) <= 100 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Cumulative Layout Shift */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cumulative Layout Shift</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(metrics?.cls || 0).toFixed(3)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Good: &lt;0.1 • Needs Improvement: &lt;0.25
                </p>
                <div className="flex items-center mt-2">
                  {(metrics?.cls || 0) <= 0.1 ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                  )}
                  <span className="text-sm">
                    {(metrics?.cls || 0) <= 0.1 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* First Contentful Paint */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">First Contentful Paint</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMetric(metrics?.fcp || 0, 's')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Good: &lt;1.8s • Needs Improvement: &lt;3s
                </p>
                <div className="flex items-center mt-2">
                  {(metrics?.fcp || 0) <= 1.8 ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                  )}
                  <span className="text-sm">
                    {(metrics?.fcp || 0) <= 1.8 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Time to First Byte */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time to First Byte</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMetric(metrics?.ttfb || 0, 'ms')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Good: &lt;800ms • Needs Improvement: &lt;1800ms
                </p>
                <div className="flex items-center mt-2">
                  {(metrics?.ttfb || 0) <= 800 ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                  )}
                  <span className="text-sm">
                    {(metrics?.ttfb || 0) <= 800 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Metrics Tab */}
        <TabsContent value="system">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemMetrics?.memoryUsage || 0} MB
                </div>
                <p className="text-xs text-muted-foreground">
                  of {systemMetrics?.jsHeapSize || 0} MB total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Load Time</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemMetrics?.loadTime || 0} ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Initial page load
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">DOM Nodes</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemMetrics?.domNodes || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Elements in DOM
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resources</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemMetrics?.resources || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Loaded resources
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Historical performance data over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No historical data available yet.
                  <br />
                  Performance metrics will appear here as they are collected.
                </div>
              ) : (
                <div className="space-y-4">
                  {history.slice(-10).reverse().map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm font-medium">
                          {new Date(metric.timestamp).toLocaleString()}
                        </div>
                        <Badge variant="outline">{metric.page}</Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          Score: <span className={getScoreColor(metric.score)}>{metric.score}</span>
                        </div>
                        <div className="text-sm">
                          LCP: {formatMetric(metric.lcp, 's')}
                        </div>
                        <div className="text-sm">
                          FID: {formatMetric(metric.fid, 'ms')}
                        </div>
                        <div className="text-sm">
                          CLS: {metric.cls.toFixed(3)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}