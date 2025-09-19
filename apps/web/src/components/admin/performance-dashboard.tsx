/**
 * Healthcare Performance Monitoring Dashboard
 * 
 * Comprehensive real-time performance monitoring for the NeonPro healthcare platform.
 * Tracks system health, user experience, and compliance metrics.
 * 
 * Features:
 * - Core Web Vitals monitoring (LCP, INP, CLS)
 * - API performance and response times
 * - Database query performance
 * - Cache efficiency metrics
 * - Error rates and health status
 * - Healthcare-specific SLA monitoring
 * - Real-time alerts and notifications
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neonpro/ui/components/ui/card';
import { Badge } from '@neonpro/ui/components/ui/badge';
import { Button } from '@neonpro/ui/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@neonpro/ui/components/ui/tabs';
import { Progress } from '@neonpro/ui/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@neonpro/ui/components/ui/alert';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Heart,
  Monitor,
  Server,
  Wifi,
  Zap,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';

// Performance metrics interfaces
interface PerformanceMetrics {
  webVitals: {
    lcp: number; // Largest Contentful Paint
    inp: number; // Interaction to Next Paint
    cls: number; // Cumulative Layout Shift
    fcp: number; // First Contentful Paint
    ttfb: number; // Time to First Byte
  };
  api: {
    avgResponseTime: number;
    p95ResponseTime: number;
    errorRate: number;
    requestsPerMinute: number;
    healthEndpoint: number;
  };
  database: {
    avgQueryTime: number;
    slowQueries: number;
    connectionPoolUsage: number;
    cacheHitRate: number;
  };
  system: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
  };
  healthcare: {
    patientDataAccess: number;
    consultationLoad: number;
    videoCallQuality: number;
    complianceScore: number;
  };
}

interface PerformanceAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

// Mock data generator (in production, this would come from monitoring APIs)
const generateMockMetrics = (): PerformanceMetrics => ({
  webVitals: {
    lcp: Math.random() * 3000 + 1000, // 1-4s
    inp: Math.random() * 300 + 100,   // 100-400ms
    cls: Math.random() * 0.2,         // 0-0.2
    fcp: Math.random() * 2000 + 500,  // 0.5-2.5s
    ttfb: Math.random() * 800 + 200,  // 200-1000ms
  },
  api: {
    avgResponseTime: Math.random() * 500 + 100,
    p95ResponseTime: Math.random() * 1000 + 500,
    errorRate: Math.random() * 5,
    requestsPerMinute: Math.random() * 100 + 50,
    healthEndpoint: Math.random() * 100 + 50,
  },
  database: {
    avgQueryTime: Math.random() * 200 + 50,
    slowQueries: Math.floor(Math.random() * 10),
    connectionPoolUsage: Math.random() * 100,
    cacheHitRate: Math.random() * 30 + 70,
  },
  system: {
    cpuUsage: Math.random() * 100,
    memoryUsage: Math.random() * 100,
    diskUsage: Math.random() * 100,
    networkLatency: Math.random() * 100 + 10,
  },
  healthcare: {
    patientDataAccess: Math.random() * 1000 + 500,
    consultationLoad: Math.random() * 100,
    videoCallQuality: Math.random() * 30 + 70,
    complianceScore: Math.random() * 20 + 80,
  },
});

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(generateMockMetrics());
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh metrics every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setMetrics(generateMockMetrics());
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Generate alerts based on performance thresholds
  useEffect(() => {
    const newAlerts: PerformanceAlert[] = [];

    // Core Web Vitals alerts
    if (metrics.webVitals.lcp > 2500) {
      newAlerts.push({
        id: 'lcp-slow',
        type: 'warning',
        title: 'Slow Page Load',
        message: `LCP is ${Math.round(metrics.webVitals.lcp)}ms (target: <2.5s)`,
        timestamp: new Date(),
        resolved: false,
      });
    }

    if (metrics.webVitals.cls > 0.1) {
      newAlerts.push({
        id: 'cls-high',
        type: 'warning',
        title: 'Layout Instability',
        message: `CLS score is ${metrics.webVitals.cls.toFixed(3)} (target: <0.1)`,
        timestamp: new Date(),
        resolved: false,
      });
    }

    // API performance alerts
    if (metrics.api.errorRate > 1) {
      newAlerts.push({
        id: 'api-errors',
        type: 'error',
        title: 'High API Error Rate',
        message: `Error rate is ${metrics.api.errorRate.toFixed(1)}% (target: <1%)`,
        timestamp: new Date(),
        resolved: false,
      });
    }

    if (metrics.api.avgResponseTime > 2000) {
      newAlerts.push({
        id: 'api-slow',
        type: 'warning',
        title: 'Slow API Response',
        message: `Average response time is ${Math.round(metrics.api.avgResponseTime)}ms (target: <2s)`,
        timestamp: new Date(),
        resolved: false,
      });
    }

    // Healthcare compliance alerts
    if (metrics.healthcare.complianceScore < 95) {
      newAlerts.push({
        id: 'compliance-low',
        type: 'error',
        title: 'Healthcare Compliance Issue',
        message: `Compliance score is ${metrics.healthcare.complianceScore.toFixed(1)}% (target: >95%)`,
        timestamp: new Date(),
        resolved: false,
      });
    }

    setAlerts(newAlerts);
  }, [metrics]);

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMetrics(generateMockMetrics());
    setIsRefreshing(false);
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'bg-green-500';
    if (value <= thresholds.warning) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'Excellent';
    if (value <= thresholds.warning) return 'Good';
    return 'Needs Attention';
  };

  const webVitalsStatus = useMemo(() => {
    const lcp = metrics.webVitals.lcp;
    const inp = metrics.webVitals.inp;
    const cls = metrics.webVitals.cls;

    const lcpStatus = lcp <= 2500 ? 'good' : lcp <= 4000 ? 'needs-improvement' : 'poor';
    const inpStatus = inp <= 200 ? 'good' : inp <= 500 ? 'needs-improvement' : 'poor';
    const clsStatus = cls <= 0.1 ? 'good' : cls <= 0.25 ? 'needs-improvement' : 'poor';

    const overallStatus = [lcpStatus, inpStatus, clsStatus].every(s => s === 'good') 
      ? 'good' 
      : [lcpStatus, inpStatus, clsStatus].some(s => s === 'poor')
      ? 'poor'
      : 'needs-improvement';

    return {
      overall: overallStatus,
      lcp: lcpStatus,
      inp: inpStatus,
      cls: clsStatus,
    };
  }, [metrics.webVitals]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time healthcare platform performance and system health monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Wifi className={`h-4 w-4 mr-2 ${autoRefresh ? 'text-green-500' : 'text-gray-400'}`} />
            Auto Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMetrics}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alert Bar */}
      {alerts.length > 0 && (
        <Alert variant={alerts.some(a => a.type === 'error') ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Performance Alerts ({alerts.length})</AlertTitle>
          <AlertDescription>
            {alerts.slice(0, 2).map(alert => alert.message).join('; ')}
            {alerts.length > 2 && ` +${alerts.length - 2} more`}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="web-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="healthcare">Healthcare Metrics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Healthy</div>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Response</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(metrics.api.avgResponseTime)}ms</div>
                <p className="text-xs text-muted-foreground">
                  Average response time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.database.cacheHitRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Database cache efficiency
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.healthcare.complianceScore.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Healthcare compliance
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals Status</CardTitle>
                <CardDescription>
                  User experience performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      webVitalsStatus.lcp === 'good' ? 'bg-green-500' :
                      webVitalsStatus.lcp === 'needs-improvement' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span>LCP (Largest Contentful Paint)</span>
                  </div>
                  <Badge variant={webVitalsStatus.lcp === 'good' ? 'default' : 'destructive'}>
                    {(metrics.webVitals.lcp / 1000).toFixed(1)}s
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      webVitalsStatus.inp === 'good' ? 'bg-green-500' :
                      webVitalsStatus.inp === 'needs-improvement' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span>INP (Interaction to Next Paint)</span>
                  </div>
                  <Badge variant={webVitalsStatus.inp === 'good' ? 'default' : 'destructive'}>
                    {Math.round(metrics.webVitals.inp)}ms
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      webVitalsStatus.cls === 'good' ? 'bg-green-500' :
                      webVitalsStatus.cls === 'needs-improvement' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span>CLS (Cumulative Layout Shift)</span>
                  </div>
                  <Badge variant={webVitalsStatus.cls === 'good' ? 'default' : 'destructive'}>
                    {metrics.webVitals.cls.toFixed(3)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
                <CardDescription>
                  Infrastructure performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CPU Usage</span>
                    <span>{metrics.system.cpuUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.system.cpuUsage} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory Usage</span>
                    <span>{metrics.system.memoryUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.system.memoryUsage} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Disk Usage</span>
                    <span>{metrics.system.diskUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.system.diskUsage} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Core Web Vitals Tab */}
        <TabsContent value="web-vitals" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>Largest Contentful Paint</span>
                </CardTitle>
                <CardDescription>
                  Time until the largest content element is rendered
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {(metrics.webVitals.lcp / 1000).toFixed(2)}s
                </div>
                <Badge variant={webVitalsStatus.lcp === 'good' ? 'default' : 'destructive'}>
                  {getStatusText(metrics.webVitals.lcp, { good: 2500, warning: 4000 })}
                </Badge>
                <div className="mt-4 text-sm text-muted-foreground">
                  Target: ≤ 2.5s (Good), ≤ 4.0s (Needs Improvement)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Interaction to Next Paint</span>
                </CardTitle>
                <CardDescription>
                  Time from user interaction to next paint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {Math.round(metrics.webVitals.inp)}ms
                </div>
                <Badge variant={webVitalsStatus.inp === 'good' ? 'default' : 'destructive'}>
                  {getStatusText(metrics.webVitals.inp, { good: 200, warning: 500 })}
                </Badge>
                <div className="mt-4 text-sm text-muted-foreground">
                  Target: ≤ 200ms (Good), ≤ 500ms (Needs Improvement)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Cumulative Layout Shift</span>
                </CardTitle>
                <CardDescription>
                  Visual stability during page load
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {metrics.webVitals.cls.toFixed(3)}
                </div>
                <Badge variant={webVitalsStatus.cls === 'good' ? 'default' : 'destructive'}>
                  {getStatusText(metrics.webVitals.cls * 1000, { good: 100, warning: 250 })}
                </Badge>
                <div className="mt-4 text-sm text-muted-foreground">
                  Target: ≤ 0.1 (Good), ≤ 0.25 (Needs Improvement)
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Healthcare Metrics Tab */}
        <TabsContent value="healthcare" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Data Access</CardTitle>
                <CardDescription>Average access time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(metrics.healthcare.patientDataAccess)}ms</div>
                <Badge variant="default">
                  {metrics.healthcare.patientDataAccess < 1000 ? 'Fast' : 'Needs Optimization'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Video Call Quality</CardTitle>
                <CardDescription>Connection success rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.healthcare.videoCallQuality.toFixed(1)}%</div>
                <Badge variant={metrics.healthcare.videoCallQuality > 95 ? 'default' : 'destructive'}>
                  {metrics.healthcare.videoCallQuality > 95 ? 'Excellent' : 'Needs Attention'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consultation Load</CardTitle>
                <CardDescription>Current system capacity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.healthcare.consultationLoad.toFixed(0)}%</div>
                <Progress value={metrics.healthcare.consultationLoad} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Score</CardTitle>
                <CardDescription>Healthcare regulation compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.healthcare.complianceScore.toFixed(1)}%
                </div>
                <Badge variant={metrics.healthcare.complianceScore > 95 ? 'default' : 'destructive'}>
                  {metrics.healthcare.complianceScore > 95 ? 'Compliant' : 'Action Required'}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;