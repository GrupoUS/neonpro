'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';
import { 
  useRetentionDashboard, 
  useChurnPredictions, 
  useRetentionStrategies 
} from '@/hooks/use-retention-analytics';
import { RetentionMetricsCards } from './retention-metrics-cards';
import { RetentionChartsGrid } from './retention-charts-grid';
import { ChurnPredictionsTable } from './churn-predictions-table';
import { RetentionStrategiesPanel } from './retention-strategies-panel';
import { PatientEngagementTimeline } from './patient-engagement-timeline';

interface RetentionAnalyticsDashboardProps {
  clinicId: string;
}

export function RetentionAnalyticsDashboard({ clinicId }: RetentionAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { 
    data: dashboardData, 
    loading: dashboardLoading, 
    error: dashboardError 
  } = useRetentionDashboard(clinicId);
  
  const { 
    data: predictions, 
    loading: predictionsLoading 
  } = useChurnPredictions(clinicId);
  
  const { 
    data: strategies, 
    loading: strategiesLoading 
  } = useRetentionStrategies(clinicId);

  if (dashboardError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar dados de retenção: {dashboardError.message}
        </AlertDescription>
      </Alert>
    );
  }

  const isLoading = dashboardLoading || predictionsLoading || strategiesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando analytics de retenção...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      {dashboardData && (
        <RetentionMetricsCards metrics={dashboardData.overview_metrics} />
      )}

      {/* Tabs de navegação */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="predictions">Previsões</TabsTrigger>
          <TabsTrigger value="strategies">Estratégias</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {dashboardData && (
            <RetentionChartsGrid
              cohortData={dashboardData.cohort_analysis}
              segmentData={dashboardData.segment_analysis}
              trendsData={dashboardData.retention_trends}
            />
          )}
        </TabsContent>

        {/* Previsões de Churn */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Previsões de Perda de Pacientes
              </h3>
              {predictions && (
                <ChurnPredictionsTable predictions={predictions} />
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Estratégias de Retenção */}
        <TabsContent value="strategies" className="space-y-6">
          {strategies && (
            <RetentionStrategiesPanel 
              strategies={strategies} 
              clinicId={clinicId}
            />
          )}
        </TabsContent>

        {/* Engajamento de Pacientes */}
        <TabsContent value="engagement" className="space-y-6">
          <PatientEngagementTimeline clinicId={clinicId} />
        </TabsContent>

        {/* Tendências */}
        <TabsContent value="trends" className="space-y-6">
          {dashboardData && (
            <div className="grid gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Análise de Tendências de Retenção
                </h3>
                {/* Gráficos de tendências detalhadas */}
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Gráficos de tendências serão implementados aqui
                </div>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}