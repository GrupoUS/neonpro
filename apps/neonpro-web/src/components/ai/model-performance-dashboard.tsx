/**
 * AI Model Performance Dashboard Component
 * 
 * Displays ML model performance metrics, A/B testing statistics,
 * and provides model management capabilities for administrators.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  BarChart3, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface ModelMetrics {
  version: string;
  accuracy: number;
  mae: number; // Mean Absolute Error
  rmse: number; // Root Mean Square Error
  confidenceThreshold: number;
  isActive: boolean;
}

interface ABTestStats {
  total: number;
  control: number;
  ai_prediction: number;
  split_percentage: {
    control: number;
    ai_prediction: number;
  };
}

interface ModelPerformanceData {
  success: boolean;
  models?: ModelMetrics[];
  abTestStats?: ABTestStats;
  error?: string;
}

interface ModelPerformanceDashboardProps {
  className?: string;
  showABStats?: boolean;
  allowModelManagement?: boolean;
}

export default function ModelPerformanceDashboard({
  className = '',
  showABStats = true,
  allowModelManagement = false
}: ModelPerformanceDashboardProps) {
  // State
  const [data, setData] = useState<ModelPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingModel, setUpdatingModel] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadPerformanceData();
  }, [showABStats]);

  /**
   * Load model performance data
   */
  const loadPerformanceData = async () => {
    try {
      setError(null);
      
      const url = new URL('/api/ai/model-performance', window.location.origin);
      if (showABStats) {
        url.searchParams.set('includeABStats', 'true');
      }

      const response = await fetch(url.toString());
      const result: ModelPerformanceData = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load performance data');
      }

      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to load performance data', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh performance data
   */
  const refreshData = async () => {
    setRefreshing(true);
    await loadPerformanceData();
    setRefreshing(false);
    toast.success('Performance data refreshed');
  };

  /**
   * Update model performance
   */
  const updateModelPerformance = async (modelVersion: string) => {
    setUpdatingModel(modelVersion);
    
    try {
      const response = await fetch('/api/ai/model-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelVersion,
          action: 'update_performance'
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update model performance');
      }

      toast.success('Model performance updated');
      await loadPerformanceData(); // Refresh data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast.error('Failed to update model performance', { description: errorMessage });
    } finally {
      setUpdatingModel(null);
    }
  };

  /**
   * Get accuracy badge variant
   */
  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 85) return { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' };
    if (accuracy >= 70) return { variant: 'secondary' as const, icon: Activity, color: 'text-blue-600' };
    return { variant: 'destructive' as const, icon: AlertCircle, color: 'text-orange-600' };
  };

  /**
   * Format metrics for display
   */
  const formatMetric = (value: number, type: 'accuracy' | 'error' | 'threshold') => {
    switch (type) {
      case 'accuracy':
        return `${value.toFixed(1)}%`;
      case 'error':
        return `${value.toFixed(1)} min`;
      case 'threshold':
        return `${(value * 100).toFixed(0)}%`;
      default:
        return value.toString();
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading performance data...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={refreshData} className="mt-4 w-full">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const activeModel = data?.models?.find(m => m.isActive);
  const allModels = data?.models || [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Model Performance</h2>
          <p className="text-muted-foreground">AI model metrics and A/B testing statistics</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="models">Model Details</TabsTrigger>
          {showABStats && <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {activeModel && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Active Model Accuracy */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatMetric(activeModel.accuracy, 'accuracy')}
                  </div>
                  <Progress value={activeModel.accuracy} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Current active model: {activeModel.version}
                  </p>
                </CardContent>
              </Card>

              {/* Mean Absolute Error */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Error (MAE)</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatMetric(activeModel.mae, 'error')}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Lower is better
                  </p>
                </CardContent>
              </Card>

              {/* Confidence Threshold */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confidence Threshold</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatMetric(activeModel.confidenceThreshold, 'threshold')}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Prediction confidence minimum
                  </p>
                </CardContent>
              </Card>

              {/* RMSE */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">RMSE</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatMetric(activeModel.rmse, 'error')}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Root Mean Square Error
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Model Status Alert */}
          {activeModel && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Model <strong>{activeModel.version}</strong> is currently active with{' '}
                <strong>{formatMetric(activeModel.accuracy, 'accuracy')}</strong> accuracy.
                {activeModel.accuracy < 70 && ' Consider retraining or updating the model.'}
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Model Details Tab */}
        <TabsContent value="models" className="space-y-4">
          <div className="space-y-4">
            {allModels.map((model) => (
              <Card key={model.version}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {model.version}
                        {model.isActive && (
                          <Badge variant="default">Active</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {(() => {
                          const { variant, icon: Icon } = getAccuracyBadge(model.accuracy);
                          return (
                            <Badge variant={variant} className="flex items-center gap-1 w-fit mt-1">
                              <Icon className="h-3 w-3" />
                              {formatMetric(model.accuracy, 'accuracy')} accuracy
                            </Badge>
                          );
                        })()}
                      </CardDescription>
                    </div>
                    {allowModelManagement && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateModelPerformance(model.version)}
                        disabled={updatingModel === model.version}
                      >
                        {updatingModel === model.version ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          'Update Metrics'
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">MAE</p>
                      <p className="text-lg font-semibold">{formatMetric(model.mae, 'error')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">RMSE</p>
                      <p className="text-lg font-semibold">{formatMetric(model.rmse, 'error')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Confidence</p>
                      <p className="text-lg font-semibold">{formatMetric(model.confidenceThreshold, 'threshold')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="text-lg font-semibold">{model.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* A/B Testing Tab */}
        {showABStats && data?.abTestStats && (
          <TabsContent value="ab-testing" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Total Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Test Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.abTestStats.total.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Users in A/B test
                  </p>
                </CardContent>
              </Card>

              {/* Control Group */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Control Group</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.abTestStats.control.toLocaleString()}</div>
                  <Progress value={data.abTestStats.split_percentage.control} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {data.abTestStats.split_percentage.control}% of users
                  </p>
                </CardContent>
              </Card>

              {/* AI Prediction Group */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Prediction Group</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.abTestStats.ai_prediction.toLocaleString()}</div>
                  <Progress value={data.abTestStats.split_percentage.ai_prediction} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {data.abTestStats.split_percentage.ai_prediction}% of users
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* A/B Test Status */}
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                A/B testing is active with a {data.abTestStats.split_percentage.control}/{data.abTestStats.split_percentage.ai_prediction} split 
                between control and AI prediction groups. Total participants: {data.abTestStats.total.toLocaleString()}.
              </AlertDescription>
            </Alert>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
