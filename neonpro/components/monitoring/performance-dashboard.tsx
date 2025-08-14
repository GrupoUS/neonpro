/**
 * Performance Dashboard Component - VIBECODE V1.0
 * Real-time monitoring dashboard for subscription middleware
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Database, Zap, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  memoryUsage: number;
  errorRate: number;
  cacheHitRate: number;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: { status: string; responseTime: number };
    cache: { status: string; responseTime: number };
    subscription: { status: string; responseTime: number };
  };
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Update every 5s
    
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const [metricsRes, healthRes] = await Promise.all([
        fetch('/api/monitoring/metrics'),
        fetch('/api/health')
      ]);
      
      if (metricsRes.ok && healthRes.ok) {
        const [metricsData, healthData] = await Promise.all([
          metricsRes.json(),
          healthRes.json()
        ]);
        
        setMetrics(metricsData);
        setHealth(healthData);
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            System Health
            {health && (
              <Badge 
                variant="outline" 
                className={`${getStatusColor(health.status)} text-white`}
              >
                {health.status.toUpperCase()}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Last updated: {health?.timestamp ? 
              new Date(health.timestamp).toLocaleString() : 'Never'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {health && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="text-sm font-medium">Database</span>
                {getStatusIcon(health.checks.database.status)}
                <span className="text-xs text-muted-foreground">
                  {health.checks.database.responseTime}ms
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">Cache</span>
                {getStatusIcon(health.checks.cache.status)}
                <span className="text-xs text-muted-foreground">
                  {health.checks.cache.responseTime}ms
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm font-medium">Subscription</span>
                {getStatusIcon(health.checks.subscription.status)}
                <span className="text-xs text-muted-foreground">
                  {health.checks.subscription.responseTime}ms
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Response Time */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Response Time
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.responseTime || 0}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Average response time
                </p>
              </CardContent>
            </Card>

            {/* Throughput */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Throughput
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.throughput || 0}/s
                </div>
                <p className="text-xs text-muted-foreground">
                  Requests per second
                </p>
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Memory Usage
                </CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.memoryUsage || 0}%
                </div>
                <Progress value={metrics?.memoryUsage || 0} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  System memory usage
                </p>
              </CardContent>
            </Card>

            {/* Error Rate */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Error Rate
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.errorRate || 0}%
                </div>
                <Progress 
                  value={metrics?.errorRate || 0} 
                  className="mt-2"
                  // @ts-ignore
                  indicatorClassName={metrics?.errorRate && metrics.errorRate > 5 ? "bg-red-500" : "bg-green-500"}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Request error rate
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detailed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cache Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Cache Performance</CardTitle>
                <CardDescription>
                  Cache hit rate and efficiency metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Hit Rate</span>
                    <span className="text-sm text-muted-foreground">
                      {metrics?.cacheHitRate || 0}%
                    </span>
                  </div>
                  <Progress value={metrics?.cacheHitRate || 0} />
                  <p className="text-xs text-muted-foreground">
                    Higher cache hit rates improve performance
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* System Resources */}
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
                <CardDescription>
                  Current system resource utilization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Memory</span>
                      <span className="text-sm text-muted-foreground">
                        {metrics?.memoryUsage || 0}%
                      </span>
                    </div>
                    <Progress value={metrics?.memoryUsage || 0} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Monitor resource usage to prevent bottlenecks
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}