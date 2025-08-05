// Story 11.2: No-Show Prediction Overview Component
// Key metrics and real-time dashboard overview

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface OverviewMetrics {
  total_predictions: number;
  accuracy_rate: number;
  high_risk_patients: number;
  interventions_today: number;
  revenue_protected: number;
  cost_savings: number;
  recent_predictions: Array<{
    id: string;
    patient_name: string;
    appointment_date: string;
    risk_score: number;
    intervention_status: string;
  }>;
}

export default function NoShowPredictionOverview() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOverviewMetrics();
  }, []);

  const fetchOverviewMetrics = async () => {// Story 11.2: No-Show Prediction Overview Component
// Key metrics and real-time dashboard overview

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface OverviewMetrics {
  total_predictions: number;
  accuracy_rate: number;
  high_risk_patients: number;
  interventions_today: number;
  revenue_protected: number;
  cost_savings: number;
  recent_predictions: Array<{
    id: string;
    patient_name: string;
    appointment_date: string;
    risk_score: number;
    intervention_status: string;
  }>;
}

export default function NoShowPredictionOverview() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOverviewMetrics();
  }, []);

  const fetchOverviewMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/no-show-prediction?dashboard=overview');
      
      if (!response.ok) {
        throw new Error('Failed to fetch overview metrics');
      }
      
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching overview metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load overview metrics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="h-4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-muted animate-pulse rounded mb-2" />
            <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>;
  }

  if (!metrics) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <Icons.activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_predictions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Active prediction models
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
            <Icons.target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics.accuracy_rate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Model prediction accuracy
            </p>
          </CardContent>
        </Card>        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Patients</CardTitle>
            <Icons.alertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {metrics.high_risk_patients}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring intervention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interventions Today</CardTitle>
            <Icons.bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.interventions_today}</div>
            <p className="text-xs text-muted-foreground">
              Proactive actions taken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Protected</CardTitle>
            <Icons.dollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {metrics.revenue_protected.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <Icons.trendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {metrics.cost_savings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Operational efficiency
            </p>
          </CardContent>
        </Card>
      </div>      {/* Recent Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent High-Risk Predictions</CardTitle>
          <CardDescription>
            Latest patients identified as high-risk for no-shows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.recent_predictions.map((prediction) => (
              <div key={prediction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div>
                    <p className="font-medium">{prediction.patient_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Appointment: {new Date(prediction.appointment_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={prediction.risk_score > 0.7 ? "destructive" : "secondary"}
                  >
                    {(prediction.risk_score * 100).toFixed(0)}% risk
                  </Badge>
                  <Badge 
                    variant={
                      prediction.intervention_status === 'completed' ? 'default' :
                      prediction.intervention_status === 'pending' ? 'secondary' : 'outline'
                    }
                  >
                    {prediction.intervention_status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          {metrics.recent_predictions.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No high-risk predictions found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for no-show prediction management
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" className="justify-start">
            <Icons.plus className="mr-2 h-4 w-4" />
            Run New Prediction
          </Button>
          <Button variant="outline" className="justify-start">
            <Icons.settings className="mr-2 h-4 w-4" />
            Model Settings
          </Button>
          <Button variant="outline" className="justify-start">
            <Icons.download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" className="justify-start">
            <Icons.calendar className="mr-2 h-4 w-4" />
            Schedule Analysis
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
