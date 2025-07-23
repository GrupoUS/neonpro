/**
 * Performance Dashboard - Real-time Performance Monitoring
 * 
 * Displays Web Vitals, bundle analysis, and performance metrics
 * Integrated with NeonPro performance monitoring system
 */

import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity, Zap, TrendingUp, Clock, Server, Database } from 'lucide-react'
import { createClient } from '@/app/utils/supabase/server'
import { redirect } from 'next/navigation'

// Performance score thresholds
const PERFORMANCE_THRESHOLDS = {
  excellent: 90,
  good: 70,
  needs_improvement: 50,
  poor: 0
} as const

function getPerformanceGrade(score: number): { label: string; color: string } {
  if (score >= PERFORMANCE_THRESHOLDS.excellent) {
    return { label: 'Excellent', color: 'bg-green-500' }
  } else if (score >= PERFORMANCE_THRESHOLDS.good) {
    return { label: 'Good', color: 'bg-blue-500' }
  } else if (score >= PERFORMANCE_THRESHOLDS.needs_improvement) {
    return { label: 'Needs Improvement', color: 'bg-yellow-500' }
  } else {
    return { label: 'Poor', color: 'bg-red-500' }
  }
}

// Mock performance data (in production, this would come from the database)
const mockPerformanceData = {
  overallScore: 87,
  coreWebVitals: {
    lcp: { value: 2.1, threshold: 2.5, good: true },
    fid: { value: 95, threshold: 100, good: true },
    cls: { value: 0.08, threshold: 0.1, good: true },
    fcp: { value: 1.8, threshold: 1.8, good: true },
    ttfb: { value: 800, threshold: 800, good: true }
  },
  bundleSize: {
    totalSize: 1.2, // MB
    gzippedSize: 0.35, // MB
    chunkCount: 12,
    optimization: 78
  },
  cachePerformance: {
    hitRate: 85,
    missCount: 145,
    invalidations: 23,
    avgResponseTime: 45
  },
  deployment: {
    buildTime: 142, // seconds
    deployTime: 89, // seconds
    lastDeploy: new Date().toISOString(),
    status: 'healthy'
  }
}

function PerformanceMetric({ 
  title, 
  value, 
  unit, 
  threshold, 
  icon: Icon, 
  isGood 
}: {
  title: string
  value: number
  unit: string
  threshold: number
  icon: any
  isGood: boolean
}) {
  const percentage = Math.min((threshold / value) * 100, 100)
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}{unit}
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <Progress value={percentage} className="flex-1" />
          <Badge variant={isGood ? "default" : "destructive"}>
            {isGood ? "Good" : "Poor"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Threshold: {threshold}{unit}
        </p>
      </CardContent>
    </Card>
  )
}

function BundleAnalysis() {
  const { totalSize, gzippedSize, chunkCount, optimization } = mockPerformanceData.bundleSize
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Bundle Analysis
        </CardTitle>
        <CardDescription>
          JavaScript bundle size and optimization metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Total Size</p>
            <p className="text-2xl font-bold">{totalSize} MB</p>
          </div>
          <div>
            <p className="text-sm font-medium">Gzipped</p>
            <p className="text-2xl font-bold">{gzippedSize} MB</p>
          </div>
          <div>
            <p className="text-sm font-medium">Chunks</p>
            <p className="text-2xl font-bold">{chunkCount}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Optimization</p>
            <p className="text-2xl font-bold">{optimization}%</p>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Bundle Optimization</span>
            <span>{optimization}%</span>
          </div>
          <Progress value={optimization} />
        </div>
      </CardContent>
    </Card>
  )
}

function CacheMetrics() {
  const { hitRate, missCount, invalidations, avgResponseTime } = mockPerformanceData.cachePerformance
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Cache Performance
        </CardTitle>
        <CardDescription>
          Caching effectiveness and response times
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Hit Rate</p>
            <p className="text-2xl font-bold">{hitRate}%</p>
          </div>
          <div>
            <p className="text-sm font-medium">Miss Count</p>
            <p className="text-2xl font-bold">{missCount}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Invalidations</p>
            <p className="text-2xl font-bold">{invalidations}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Avg Response</p>
            <p className="text-2xl font-bold">{avgResponseTime}ms</p>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Cache Hit Rate</span>
            <span>{hitRate}%</span>
          </div>
          <Progress value={hitRate} />
        </div>
      </CardContent>
    </Card>
  )
}

function DeploymentStatus() {
  const { buildTime, deployTime, lastDeploy, status } = mockPerformanceData.deployment
  const deployDate = new Date(lastDeploy).toLocaleString()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Deployment Status
        </CardTitle>
        <CardDescription>
          Build and deployment performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          <Badge variant={status === 'healthy' ? "default" : "destructive"}>
            {status}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Build Time</p>
            <p className="text-lg font-bold">{buildTime}s</p>
          </div>
          <div>
            <p className="text-sm font-medium">Deploy Time</p>
            <p className="text-lg font-bold">{deployTime}s</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">Last Deployment</p>
          <p className="text-sm text-muted-foreground">{deployDate}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function PerformanceDashboard() {
  // Check authentication
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  const performanceGrade = getPerformanceGrade(mockPerformanceData.overallScore)
  const { coreWebVitals } = mockPerformanceData

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Performance Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time performance monitoring and optimization insights
        </p>
      </div>

      {/* Overall Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Overall Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold">
              {mockPerformanceData.overallScore}
            </div>
            <div className="flex-1">
              <Progress value={mockPerformanceData.overallScore} className="mb-2" />
              <Badge className={performanceGrade.color}>
                {performanceGrade.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Core Web Vitals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <PerformanceMetric
            title="Largest Contentful Paint"
            value={coreWebVitals.lcp.value}
            unit="s"
            threshold={coreWebVitals.lcp.threshold}
            icon={Clock}
            isGood={coreWebVitals.lcp.good}
          />
          <PerformanceMetric
            title="First Input Delay"
            value={coreWebVitals.fid.value}
            unit="ms"
            threshold={coreWebVitals.fid.threshold}
            icon={Zap}
            isGood={coreWebVitals.fid.good}
          />
          <PerformanceMetric
            title="Cumulative Layout Shift"
            value={coreWebVitals.cls.value}
            unit=""
            threshold={coreWebVitals.cls.threshold}
            icon={TrendingUp}
            isGood={coreWebVitals.cls.good}
          />
          <PerformanceMetric
            title="First Contentful Paint"
            value={coreWebVitals.fcp.value}
            unit="s"
            threshold={coreWebVitals.fcp.threshold}
            icon={Activity}
            isGood={coreWebVitals.fcp.good}
          />
          <PerformanceMetric
            title="Time to First Byte"
            value={coreWebVitals.ttfb.value}
            unit="ms"
            threshold={coreWebVitals.ttfb.threshold}
            icon={Server}
            isGood={coreWebVitals.ttfb.good}
          />
        </div>
      </div>

      {/* Performance Analysis */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Performance Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BundleAnalysis />
          <CacheMetrics />
          <DeploymentStatus />
        </div>
      </div>

      {/* Performance Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Recommendations</CardTitle>
          <CardDescription>
            AI-powered suggestions to improve your application performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold">Optimize Bundle Size</h4>
              <p className="text-sm text-muted-foreground">
                Consider code splitting and dynamic imports to reduce initial bundle size by ~15%
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold">Cache Performance</h4>
              <p className="text-sm text-muted-foreground">
                Your cache hit rate is excellent at 85%. Consider implementing browser caching for static assets.
              </p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold">Image Optimization</h4>
              <p className="text-sm text-muted-foreground">
                Implement WebP format and lazy loading to improve LCP by ~0.3 seconds
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}