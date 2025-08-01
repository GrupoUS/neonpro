// Story 11.2: No-Show Prediction Analytics Component
// Advanced analytics and performance monitoring

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';

interface AnalyticsData {
  accuracy_trends: Array<{
    date: string;
    accuracy: number;
    predictions_count: number;
  }>;
  model_performance: Record<string, {
    accuracy: number;
    total_predictions: number;
    avg_confidence: number;
  }>;
  intervention_effectiveness: Record<string, {
    success_rate: number;
    total_interventions: number;
    cost_effectiveness: number;
  }>;
  risk_factor_analysis: Array<{
    factor_type: string;
    impact_weight: number;
    frequency: number;
  }>;
}

export default function NoShowPredictionAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [selectedMetric, setSelectedMetric] = useState('accuracy');
  const { toast } = useToast();  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (dateRange?.from) {
        params.append('date_from', dateRange.from.toISOString().split('T')[0]);
      }
      if (dateRange?.to) {
        params.append('date_to', dateRange.to.toISOString().split('T')[0]);
      }

      const response = await fetch(`/api/no-show-prediction/analytics?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Filters</CardTitle>
          <CardDescription>
            Customize your analytics view
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
            />
          </div>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="accuracy">Accuracy Trends</SelectItem>
              <SelectItem value="effectiveness">Intervention Effectiveness</SelectItem>
              <SelectItem value="risk-factors">Risk Factor Analysis</SelectItem>
              <SelectItem value="model-performance">Model Performance</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics} variant="outline">
            <Icons.refresh className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Accuracy Trends */}
      {selectedMetric === 'accuracy' && analytics && (
        <Card>
          <CardHeader>
            <CardTitle>Prediction Accuracy Trends</CardTitle>
            <CardDescription>
              Model accuracy over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.accuracy_trends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{new Date(trend.date).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {trend.predictions_count} predictions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {(trend.accuracy * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">accuracy</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}      {/* Model Performance */}
      {selectedMetric === 'model-performance' && analytics && (
        <Card>
          <CardHeader>
            <CardTitle>Model Performance Comparison</CardTitle>
            <CardDescription>
              Performance metrics by model version
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(analytics.model_performance).map(([version, performance]) => (
                <div key={version} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Model {version}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Accuracy:</span>
                      <span className="font-medium">
                        {(performance.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Predictions:</span>
                      <span className="font-medium">{performance.total_predictions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg Confidence:</span>
                      <span className="font-medium">
                        {(performance.avg_confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Factor Analysis */}
      {selectedMetric === 'risk-factors' && analytics && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Factor Analysis</CardTitle>
            <CardDescription>
              Impact and frequency of risk factors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.risk_factor_analysis.map((factor, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium capitalize">{factor.factor_type.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">
                      Frequency: {factor.frequency} occurrences
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {(factor.impact_weight * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">impact weight</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}