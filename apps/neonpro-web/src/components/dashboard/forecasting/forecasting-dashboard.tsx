/**
 * Demand Forecasting Dashboard - Story 11.1
 * 
 * Comprehensive dashboard for demand forecasting with ≥80% accuracy
 * Includes real-time monitoring, resource allocation, and performance tracking
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Target,
  BarChart3,
  Settings,
  RefreshCw,
  Download
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, parseISO, addDays } from 'date-fns';
import { toast } from 'sonner';

import { DemandForecast, DemandAlert, FORECASTING_CONSTANTS } from '@/types/demand-forecasting';

interface ForecastingDashboardProps {
  className?: string;
}

interface ForecastMetrics {
  overall_accuracy: number;
  total_forecasts: number;
  active_alerts: number;
  confidence_average: number;
  trend_direction: 'up' | 'down' | 'stable';
}

interface ResourceAllocation {
  id: string;
  type: string;
  priority: string;
  cost_impact: number;
  efficiency_gain: number;
}

export default function ForecastingDashboard({ className }: ForecastingDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [forecastParams, setForecastParams] = useState({
    forecastPeriod: 'weekly',
    lookAheadDays: 30,
    includeSeasonality: true,
    includeExternalFactors: true,
    confidenceLevel: 0.95
  });

  const queryClient = useQueryClient();

  // Query for current forecasts
  const { data: forecasts, isLoading: forecastsLoading, error: forecastsError } = useQuery({
    queryKey: ['demand-forecasts', forecastParams],
    queryFn: async () => {
      const params = new URLSearchParams({
        forecastPeriod: forecastParams.forecastPeriod,
        lookAheadDays: forecastParams.lookAheadDays.toString(),
        includeSeasonality: forecastParams.includeSeasonality.toString(),
        includeExternalFactors: forecastParams.includeExternalFactors.toString(),
        confidenceLevel: forecastParams.confidenceLevel.toString()
      });

      const response = await fetch(`/api/forecasting?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch forecasts');
      }
      
      return result.data;
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    staleTime: 2 * 60 * 1000 // Consider data stale after 2 minutes
  });

  // Query for active alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['demand-alerts'],
    queryFn: async () => {
      const response = await fetch('/api/forecasting/alerts');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.success ? result.data : [];
    },
    refetchInterval: 30 * 1000, // Refresh every 30 seconds for alerts
  });

  // Query for resource allocation recommendations
  const { data: resourceAllocations, isLoading: resourceLoading } = useQuery({
    queryKey: ['resource-allocations', forecasts?.forecasts],
    queryFn: async () => {
      if (!forecasts?.forecasts?.length) return [];
      
      const forecastIds = forecasts.forecasts.map((f: DemandForecast) => f.id);
      const response = await fetch('/api/forecasting/resource-allocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forecastIds,
          optimizationType: 'balanced'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.success ? result.data : null;
    },
    enabled: !!forecasts?.forecasts?.length
  });

  // Mutation for generating new forecasts
  const generateForecastMutation = useMutation({
    mutationFn: async (params: typeof forecastParams) => {
      const response = await fetch('/api/forecasting', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to generate forecast');
      }
      
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demand-forecasts'] });
      toast.success('Demand forecast generated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate forecast: ${error.message}`);
    }
  });

  // Calculate metrics
  const metrics: ForecastMetrics = React.useMemo(() => {
    if (!forecasts) {
      return {
        overall_accuracy: 0,
        total_forecasts: 0,
        active_alerts: 0,
        confidence_average: 0,
        trend_direction: 'stable'
      };
    }

    const activeAlerts = alerts?.filter((alert: DemandAlert) => alert.status === 'active').length || 0;
    const confidenceAvg = forecasts.forecasts?.length > 0 
      ? forecasts.forecasts.reduce((sum: number, f: DemandForecast) => sum + f.confidence_level, 0) / forecasts.forecasts.length
      : 0;

    return {
      overall_accuracy: forecasts.accuracy || 0,
      total_forecasts: forecasts.forecasts?.length || 0,
      active_alerts: activeAlerts,
      confidence_average: confidenceAvg,
      trend_direction: forecasts.accuracy >= FORECASTING_CONSTANTS.MIN_ACCURACY_THRESHOLD ? 'up' : 'down'
    };
  }, [forecasts, alerts]);

  // Transform data for charts
  const chartData = React.useMemo(() => {
    if (!forecasts?.forecasts) return [];
    
    return forecasts.forecasts.map((forecast: DemandForecast) => ({
      date: format(parseISO(forecast.period_start), 'MMM dd'),
      predicted_demand: forecast.predicted_demand,
      confidence: Math.round(forecast.confidence_level * 100),
      period: forecast.period_start
    }));
  }, [forecasts]);

  const handleRegenerateForecast = () => {
    generateForecastMutation.mutate(forecastParams);
  };

  const handleExportData = () => {
    if (!forecasts?.forecasts) {
      toast.error('No forecast data to export');
      return;
    }

    const csvData = forecasts.forecasts.map((f: DemandForecast) => ({
      ID: f.id,
      Type: f.forecast_type,
      'Service ID': f.service_id || 'All Services',
      'Period Start': f.period_start,
      'Period End': f.period_end,
      'Predicted Demand': f.predicted_demand,
      'Confidence Level': Math.round(f.confidence_level * 100) + '%',
      'Created At': f.created_at
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `demand-forecasts-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Forecast data exported successfully');
  };

  if (forecastsError) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Forecasts</AlertTitle>
          <AlertDescription>
            {forecastsError.message}. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Demand Forecasting</h1>
          <p className="text-muted-foreground">
            AI-powered demand prediction with ≥80% accuracy
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            disabled={!forecasts?.forecasts?.length}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={handleRegenerateForecast}
            disabled={generateForecastMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${generateForecastMutation.isPending ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forecastsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                `${Math.round(metrics.overall_accuracy * 100)}%`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.overall_accuracy >= FORECASTING_CONSTANTS.MIN_ACCURACY_THRESHOLD ? (
                <span className="text-green-600">Above 80% threshold</span>
              ) : (
                <span className="text-red-600">Below 80% threshold</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Forecasts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forecastsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                metrics.total_forecasts
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Demand predictions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alertsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                metrics.active_alerts
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forecastsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                `${Math.round(metrics.confidence_average * 100)}%`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Prediction confidence
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Demand Forecast Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Demand Forecast Trend</CardTitle>
                <CardDescription>
                  Predicted demand over the next {forecastParams.lookAheadDays} days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {forecastsLoading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="predicted_demand" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Confidence Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Confidence Distribution</CardTitle>
                <CardDescription>
                  Forecast confidence levels across predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {forecastsLoading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="confidence" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Accuracy Status */}
          <Card>
            <CardHeader>
              <CardTitle>Accuracy Status</CardTitle>
              <CardDescription>
                Current forecasting model performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Accuracy</span>
                  <span className="text-sm">
                    {Math.round(metrics.overall_accuracy * 100)}% / 80% required
                  </span>
                </div>
                <Progress 
                  value={metrics.overall_accuracy * 100} 
                  className="w-full"
                />
                {metrics.overall_accuracy >= FORECASTING_CONSTANTS.MIN_ACCURACY_THRESHOLD ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Meeting accuracy requirements
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Below accuracy threshold
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Forecast Details</CardTitle>
              <CardDescription>
                Detailed view of all active demand forecasts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {forecastsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : forecasts?.forecasts?.length > 0 ? (
                <div className="space-y-2">
                  {forecasts.forecasts.map((forecast: DemandForecast) => (
                    <div
                      key={forecast.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {forecast.forecast_type.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(forecast.period_start), 'MMM dd, yyyy')} - 
                          {format(parseISO(forecast.period_end), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-bold">
                          {forecast.predicted_demand} appointments
                        </p>
                        <Badge variant="outline">
                          {Math.round(forecast.confidence_level * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No forecasts available</p>
                  <Button 
                    className="mt-2" 
                    onClick={handleRegenerateForecast}
                    disabled={generateForecastMutation.isPending}
                  >
                    Generate Forecasts
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Allocation</CardTitle>
              <CardDescription>
                AI-recommended resource allocation based on demand forecasts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resourceLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : resourceAllocations?.recommendations?.length > 0 ? (
                <div className="space-y-3">
                  {resourceAllocations.recommendations.map((allocation: any) => (
                    <div
                      key={allocation.forecast_id}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          {allocation.staffing?.required_staff_count || 0} Staff Members
                        </h4>
                        <Badge 
                          variant={
                            allocation.priority_level === 'critical' ? 'destructive' :
                            allocation.priority_level === 'high' ? 'default' : 'secondary'
                          }
                        >
                          {allocation.priority_level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cost Impact: ${allocation.cost_optimization.total_cost_impact.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Efficiency Gain: {allocation.cost_optimization.efficiency_gains.toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    No resource allocations available. Generate forecasts first.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>
                Real-time monitoring alerts for demand and capacity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : alerts?.length > 0 ? (
                <div className="space-y-2">
                  {alerts.map((alert: DemandAlert) => (
                    <Alert
                      key={alert.id}
                      variant={alert.severity === 'critical' ? 'destructive' : 'default'}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="capitalize">
                        {alert.alert_type.replace('_', ' ')} - {alert.severity}
                      </AlertTitle>
                      <AlertDescription>
                        {alert.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-muted-foreground">No active alerts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}