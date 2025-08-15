/**
 * Marketing ROI Analysis Hooks
 * React hooks for managing marketing ROI data and operations
 *
 * Features:
 * - Marketing campaign ROI tracking and management
 * - Treatment profitability analysis with optimization insights
 * - CAC & LTV analytics with predictive metrics
 * - Real-time ROI monitoring and alert management
 * - Optimization recommendations with implementation tracking
 * - Executive dashboard metrics and trend analysis
 * - Predictive ROI forecasting and scenario planning
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  CreateMarketingCampaignRequest,
  CreateROIAlertRequest,
  MarketingChannel,
  MarketingROIFilters,
  TreatmentROIFilters,
  UpdateCampaignMetricsRequest,
} from '@/app/types/marketing-roi';

// ===== MARKETING CAMPAIGN HOOKS =====

/**
 * Hook to get marketing campaigns with filtering and pagination
 */
export function useMarketingCampaigns(
  clinicId: string,
  filters?: MarketingROIFilters,
  page = 1,
  limit = 20
) {
  return useQuery({
    queryKey: ['marketing-campaigns', clinicId, filters, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        clinic_id: clinicId,
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters?.channel) {
        params.append('channel', filters.channel);
      }
      if (filters?.campaign_type) {
        params.append('campaign_type', filters.campaign_type);
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }
      if (filters?.date_range) {
        params.append('start_date', filters.date_range.start.toISOString());
        params.append('end_date', filters.date_range.end.toISOString());
      }
      if (filters?.min_roi) {
        params.append('min_roi', filters.min_roi.toString());
      }
      if (filters?.max_budget) {
        params.append('max_budget', filters.max_budget.toString());
      }

      const response = await fetch(`/api/marketing-roi/campaigns?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch marketing campaigns');
      }
      return response.json();
    },
    enabled: Boolean(clinicId),
  });
}

/**
 * Hook to get a specific marketing campaign
 */
export function useMarketingCampaign(campaignId: string) {
  return useQuery({
    queryKey: ['marketing-campaign', campaignId],
    queryFn: async () => {
      const response = await fetch(
        `/api/marketing-roi/campaigns/${campaignId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch marketing campaign');
      }
      return response.json();
    },
    enabled: Boolean(campaignId),
  });
}

/**
 * Hook to create a new marketing campaign
 */
export function useCreateMarketingCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clinicId,
      campaignData,
    }: {
      clinicId: string;
      campaignData: CreateMarketingCampaignRequest;
    }) => {
      const response = await fetch('/api/marketing-roi/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinic_id: clinicId,
          ...campaignData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create marketing campaign');
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['marketing-campaigns', variables.clinicId],
      });
      queryClient.invalidateQueries({
        queryKey: ['roi-dashboard-metrics', variables.clinicId],
      });
      toast.success('Campanha de marketing criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar campanha: ${error.message}`);
    },
  });
}

/**
 * Hook to update campaign metrics and recalculate ROI
 */
export function useUpdateCampaignMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignId,
      metrics,
    }: {
      campaignId: string;
      metrics: UpdateCampaignMetricsRequest;
    }) => {
      const response = await fetch(
        `/api/marketing-roi/campaigns/${campaignId}/metrics`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metrics),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update campaign metrics');
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['marketing-campaign', variables.campaignId],
      });
      queryClient.invalidateQueries({
        queryKey: ['marketing-campaigns'],
      });
      queryClient.invalidateQueries({
        queryKey: ['roi-dashboard-metrics'],
      });
      queryClient.invalidateQueries({
        queryKey: ['roi-alerts'],
      });
      toast.success('Métricas da campanha atualizadas com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar métricas: ${error.message}`);
    },
  });
}

// ===== TREATMENT PROFITABILITY HOOKS =====

/**
 * Hook to get treatment profitability analysis
 */
export function useTreatmentProfitabilityAnalysis(
  clinicId: string,
  filters?: TreatmentROIFilters
) {
  return useQuery({
    queryKey: ['treatment-profitability', clinicId, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        clinic_id: clinicId,
      });

      if (filters?.treatment_ids?.length) {
        filters.treatment_ids.forEach((id) =>
          params.append('treatment_ids', id)
        );
      }
      if (filters?.min_roi) {
        params.append('min_roi', filters.min_roi.toString());
      }
      if (filters?.min_procedures) {
        params.append('min_procedures', filters.min_procedures.toString());
      }
      if (filters?.date_range) {
        params.append('start_date', filters.date_range.start.toISOString());
        params.append('end_date', filters.date_range.end.toISOString());
      }
      if (filters?.sort_by) {
        params.append('sort_by', filters.sort_by);
      }
      if (filters?.sort_order) {
        params.append('sort_order', filters.sort_order);
      }

      const response = await fetch(
        `/api/marketing-roi/treatment-profitability?${params}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch treatment profitability analysis');
      }
      return response.json();
    },
    enabled: Boolean(clinicId),
  });
}

/**
 * Hook to calculate treatment ROI for a specific treatment
 */
export function useCalculateTreatmentROI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clinicId,
      treatmentId,
      periodStart,
      periodEnd,
    }: {
      clinicId: string;
      treatmentId: string;
      periodStart: Date;
      periodEnd: Date;
    }) => {
      const response = await fetch(
        '/api/marketing-roi/treatment-profitability/calculate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clinic_id: clinicId,
            treatment_id: treatmentId,
            period_start: periodStart.toISOString(),
            period_end: periodEnd.toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to calculate treatment ROI');
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['treatment-profitability', variables.clinicId],
      });
      queryClient.invalidateQueries({
        queryKey: ['roi-dashboard-metrics', variables.clinicId],
      });
      toast.success('Análise de ROI do tratamento calculada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao calcular ROI do tratamento: ${error.message}`);
    },
  });
}

// ===== CAC & LTV ANALYTICS HOOKS =====

/**
 * Hook to get CAC & LTV analysis
 */
export function useCACLTVAnalysis(
  clinicId: string,
  periodStart: Date,
  periodEnd: Date
) {
  return useQuery({
    queryKey: ['cac-ltv-analysis', clinicId, periodStart, periodEnd],
    queryFn: async () => {
      const params = new URLSearchParams({
        clinic_id: clinicId,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
      });

      const response = await fetch(
        `/api/marketing-roi/cac-ltv-analysis?${params}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch CAC & LTV analysis');
      }
      return response.json();
    },
    enabled: Boolean(clinicId) && Boolean(periodStart) && Boolean(periodEnd),
  });
}

/**
 * Hook to calculate CAC for a specific channel
 */
export function useCalculateCAC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clinicId,
      channel,
      periodStart,
      periodEnd,
    }: {
      clinicId: string;
      channel: MarketingChannel;
      periodStart: Date;
      periodEnd: Date;
    }) => {
      const response = await fetch('/api/marketing-roi/cac/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinic_id: clinicId,
          channel,
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to calculate CAC');
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['cac-ltv-analysis', variables.clinicId],
      });
      toast.success('CAC calculado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao calcular CAC: ${error.message}`);
    },
  });
}

/**
 * Hook to calculate LTV for customers
 */
export function useCalculateLTV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clinicId,
      patientId,
      acquisitionChannel,
    }: {
      clinicId: string;
      patientId?: string;
      acquisitionChannel?: MarketingChannel;
    }) => {
      const response = await fetch('/api/marketing-roi/ltv/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinic_id: clinicId,
          patient_id: patientId,
          acquisition_channel: acquisitionChannel,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to calculate LTV');
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['cac-ltv-analysis', variables.clinicId],
      });
      toast.success('LTV calculado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao calcular LTV: ${error.message}`);
    },
  });
}

// ===== ROI MONITORING & ALERTS HOOKS =====

/**
 * Hook to get active ROI alerts
 */
export function useROIAlerts(clinicId: string) {
  return useQuery({
    queryKey: ['roi-alerts', clinicId],
    queryFn: async () => {
      const response = await fetch(
        `/api/marketing-roi/alerts?clinic_id=${clinicId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch ROI alerts');
      }
      return response.json();
    },
    enabled: Boolean(clinicId),
    refetchInterval: 30_000, // Refetch every 30 seconds for real-time alerts
  });
}

/**
 * Hook to create a new ROI alert
 */
export function useCreateROIAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clinicId,
      alertData,
    }: {
      clinicId: string;
      alertData: CreateROIAlertRequest;
    }) => {
      const response = await fetch('/api/marketing-roi/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinic_id: clinicId,
          ...alertData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create ROI alert');
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['roi-alerts', variables.clinicId],
      });
      toast.success('Alerta de ROI criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar alerta: ${error.message}`);
    },
  });
}

/**
 * Hook to acknowledge/resolve ROI alerts
 */
export function useUpdateROIAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      alertId,
      status,
    }: {
      alertId: string;
      status: 'acknowledged' | 'resolved' | 'dismissed';
    }) => {
      const response = await fetch(`/api/marketing-roi/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update ROI alert');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['roi-alerts'],
      });
      const statusMessages = {
        acknowledged: 'Alerta reconhecido com sucesso!',
        resolved: 'Alerta resolvido com sucesso!',
        dismissed: 'Alerta dispensado com sucesso!',
      };
      toast.success(
        statusMessages[data.status] || 'Alerta atualizado com sucesso!'
      );
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar alerta: ${error.message}`);
    },
  });
}

// ===== OPTIMIZATION RECOMMENDATIONS HOOKS =====

/**
 * Hook to get optimization recommendations
 */
export function useOptimizationRecommendations(clinicId: string) {
  return useQuery({
    queryKey: ['optimization-recommendations', clinicId],
    queryFn: async () => {
      const response = await fetch(
        `/api/marketing-roi/optimization-recommendations?clinic_id=${clinicId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch optimization recommendations');
      }
      return response.json();
    },
    enabled: Boolean(clinicId),
  });
}

/**
 * Hook to generate new optimization recommendations
 */
export function useGenerateOptimizationRecommendations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clinicId }: { clinicId: string }) => {
      const response = await fetch(
        '/api/marketing-roi/optimization-recommendations/generate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ clinic_id: clinicId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || 'Failed to generate optimization recommendations'
        );
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['optimization-recommendations', variables.clinicId],
      });
      toast.success('Recomendações de otimização geradas com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao gerar recomendações: ${error.message}`);
    },
  });
}

/**
 * Hook to update recommendation status
 */
export function useUpdateRecommendationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recommendationId,
      status,
    }: {
      recommendationId: string;
      status: 'approved' | 'in_progress' | 'completed' | 'rejected';
    }) => {
      const response = await fetch(
        `/api/marketing-roi/optimization-recommendations/${recommendationId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || 'Failed to update recommendation status'
        );
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['optimization-recommendations'],
      });
      const statusMessages = {
        approved: 'Recomendação aprovada com sucesso!',
        in_progress: 'Recomendação em andamento!',
        completed: 'Recomendação concluída com sucesso!',
        rejected: 'Recomendação rejeitada!',
      };
      toast.success(
        statusMessages[data.status] || 'Recomendação atualizada com sucesso!'
      );
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar recomendação: ${error.message}`);
    },
  });
}

// ===== DASHBOARD & ANALYTICS HOOKS =====

/**
 * Hook to get comprehensive ROI dashboard metrics
 */
export function useROIDashboardMetrics(
  clinicId: string,
  periodStart: Date,
  periodEnd: Date,
  includeTrends = false,
  includeComparisons = false,
  includeForecasts = false
) {
  return useQuery({
    queryKey: [
      'roi-dashboard-metrics',
      clinicId,
      periodStart,
      periodEnd,
      includeTrends,
      includeComparisons,
      includeForecasts,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        clinic_id: clinicId,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        include_trends: includeTrends.toString(),
        include_comparisons: includeComparisons.toString(),
        include_forecasts: includeForecasts.toString(),
      });

      const response = await fetch(
        `/api/marketing-roi/dashboard-metrics?${params}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch ROI dashboard metrics');
      }
      return response.json();
    },
    enabled: Boolean(clinicId) && Boolean(periodStart) && Boolean(periodEnd),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get ROI trend data for visualization
 */
export function useROITrendData(
  clinicId: string,
  periodStart: Date,
  periodEnd: Date,
  granularity: 'daily' | 'weekly' | 'monthly' = 'daily'
) {
  return useQuery({
    queryKey: ['roi-trend-data', clinicId, periodStart, periodEnd, granularity],
    queryFn: async () => {
      const params = new URLSearchParams({
        clinic_id: clinicId,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        granularity,
      });

      const response = await fetch(`/api/marketing-roi/trend-data?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ROI trend data');
      }
      return response.json();
    },
    enabled: Boolean(clinicId) && Boolean(periodStart) && Boolean(periodEnd),
  });
}

/**
 * Hook to get ROI comparisons between entities
 */
export function useROIComparisons(
  clinicId: string,
  entityType: 'campaign' | 'treatment' | 'channel',
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  previousPeriodStart: Date,
  previousPeriodEnd: Date
) {
  return useQuery({
    queryKey: [
      'roi-comparisons',
      clinicId,
      entityType,
      currentPeriodStart,
      currentPeriodEnd,
      previousPeriodStart,
      previousPeriodEnd,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        clinic_id: clinicId,
        entity_type: entityType,
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        previous_period_start: previousPeriodStart.toISOString(),
        previous_period_end: previousPeriodEnd.toISOString(),
      });

      const response = await fetch(`/api/marketing-roi/comparisons?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ROI comparisons');
      }
      return response.json();
    },
    enabled:
      Boolean(clinicId) &&
      Boolean(currentPeriodStart) &&
      Boolean(currentPeriodEnd) &&
      Boolean(previousPeriodStart) &&
      Boolean(previousPeriodEnd),
  });
}

// ===== PREDICTIVE ROI HOOKS =====

/**
 * Hook to generate ROI forecasts
 */
export function useGenerateROIForecast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clinicId,
      forecastType,
      entityId,
      forecastPeriodStart,
      forecastPeriodEnd,
    }: {
      clinicId: string;
      forecastType: 'campaign' | 'treatment' | 'channel' | 'overall';
      entityId?: string;
      forecastPeriodStart: Date;
      forecastPeriodEnd: Date;
    }) => {
      const response = await fetch('/api/marketing-roi/forecasts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinic_id: clinicId,
          forecast_type: forecastType,
          entity_id: entityId,
          forecast_period_start: forecastPeriodStart.toISOString(),
          forecast_period_end: forecastPeriodEnd.toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate ROI forecast');
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['roi-forecasts', variables.clinicId],
      });
      toast.success('Previsão de ROI gerada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao gerar previsão: ${error.message}`);
    },
  });
}

/**
 * Hook to get ROI forecasts
 */
export function useROIForecasts(
  clinicId: string,
  forecastType?: 'campaign' | 'treatment' | 'channel' | 'overall'
) {
  return useQuery({
    queryKey: ['roi-forecasts', clinicId, forecastType],
    queryFn: async () => {
      const params = new URLSearchParams({
        clinic_id: clinicId,
      });

      if (forecastType) {
        params.append('forecast_type', forecastType);
      }

      const response = await fetch(`/api/marketing-roi/forecasts?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ROI forecasts');
      }
      return response.json();
    },
    enabled: Boolean(clinicId),
  });
}

// ===== UTILITY HOOKS =====

/**
 * Hook to get marketing ROI insights and recommendations
 */
export function useMarketingROIInsights(clinicId: string) {
  return useQuery({
    queryKey: ['marketing-roi-insights', clinicId],
    queryFn: async () => {
      const response = await fetch(
        `/api/marketing-roi/insights?clinic_id=${clinicId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch marketing ROI insights');
      }
      return response.json();
    },
    enabled: Boolean(clinicId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get key ROI metrics summary
 */
export function useROIMetricsSummary(
  clinicId: string,
  periodStart: Date,
  periodEnd: Date
) {
  return useQuery({
    queryKey: ['roi-metrics-summary', clinicId, periodStart, periodEnd],
    queryFn: async () => {
      const params = new URLSearchParams({
        clinic_id: clinicId,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
      });

      const response = await fetch(
        `/api/marketing-roi/metrics-summary?${params}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch ROI metrics summary');
      }
      return response.json();
    },
    enabled: Boolean(clinicId) && Boolean(periodStart) && Boolean(periodEnd),
  });
}

/**
 * Hook for bulk operations on campaigns
 */
export function useBulkCampaignOperations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      operation,
      campaignIds,
      data,
    }: {
      operation: 'pause' | 'resume' | 'delete' | 'update_budget';
      campaignIds: string[];
      data?: any;
    }) => {
      const response = await fetch('/api/marketing-roi/campaigns/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation,
          campaign_ids: campaignIds,
          data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to execute bulk operation');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['marketing-campaigns'],
      });
      queryClient.invalidateQueries({
        queryKey: ['roi-dashboard-metrics'],
      });
      toast.success('Operação em lote executada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro na operação em lote: ${error.message}`);
    },
  });
}

/**
 * Hook for real-time ROI monitoring
 */
export function useRealTimeROIMonitoring(clinicId: string, enabled = true) {
  return useQuery({
    queryKey: ['real-time-roi-monitoring', clinicId],
    queryFn: async () => {
      const response = await fetch(
        `/api/marketing-roi/real-time-monitoring?clinic_id=${clinicId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch real-time ROI monitoring data');
      }
      return response.json();
    },
    enabled: Boolean(clinicId) && enabled,
    refetchInterval: 10_000, // Refetch every 10 seconds
    refetchIntervalInBackground: true,
  });
}

/**
 * Custom hook for managing ROI calculation settings
 */
export function useROICalculationSettings(clinicId: string) {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['roi-calculation-settings', clinicId],
    queryFn: async () => {
      const response = await fetch(
        `/api/marketing-roi/calculation-settings?clinic_id=${clinicId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch ROI calculation settings');
      }
      return response.json();
    },
    enabled: Boolean(clinicId),
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: any) => {
      const response = await fetch('/api/marketing-roi/calculation-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinic_id: clinicId,
          ...newSettings,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || 'Failed to update ROI calculation settings'
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['roi-calculation-settings', clinicId],
      });
      // Invalidate all ROI-related data as calculation settings changed
      queryClient.invalidateQueries({
        queryKey: ['marketing-campaigns', clinicId],
      });
      queryClient.invalidateQueries({
        queryKey: ['treatment-profitability', clinicId],
      });
      queryClient.invalidateQueries({
        queryKey: ['roi-dashboard-metrics', clinicId],
      });
      toast.success('Configurações de cálculo de ROI atualizadas com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar configurações: ${error.message}`);
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
}
