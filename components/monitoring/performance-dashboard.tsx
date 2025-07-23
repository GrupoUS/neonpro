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
    try {      const [metricsRes, healthRes] = await Promise.all([
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
      </Card>