// =====================================================================================
// RETENTION ANALYTICS HOOKS
// Epic 7.4: Patient Retention Analytics + Predictions
// React hooks for retention analytics, churn prediction, and retention strategies
// =====================================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { RetentionAnalyticsService } from '@/app/lib/services/retention-analytics-service';
import {
  ChurnModelType,
  type ChurnPrediction,
  ChurnRiskLevel,
  type CreateRetentionStrategy,
  type PatientRetentionMetrics,
} from '@/app/types/retention-analytics';

// =====================================================================================
// SERVICE INSTANCE
// =====================================================================================

const retentionService = new RetentionAnalyticsService();

// =====================================================================================
// PATIENT RETENTION METRICS HOOKS
// =====================================================================================

/**
 * Hook to get patient retention metrics
 */
export function usePatientRetentionMetrics(
  patientId: string,
  clinicId: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: ['patient-retention-metrics', patientId, clinicId],
    queryFn: () =>
      retentionService.getPatientRetentionMetrics(patientId, clinicId),
    enabled:
      options?.enabled !== false && Boolean(patientId) && Boolean(clinicId),
    refetchInterval: options?.refetchInterval || 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get clinic-wide retention metrics
 */
export function useClinicRetentionMetrics(
  clinicId: string,
  options?: {
    limit?: number;
    offset?: number;
    enabled?: boolean;
  }
) {
  const { limit = 100, offset = 0, enabled = true } = options || {};

  return useQuery({
    queryKey: ['clinic-retention-metrics', clinicId, limit, offset],
    queryFn: () =>
      retentionService.getClinicRetentionMetrics(clinicId, limit, offset),
    enabled: enabled && Boolean(clinicId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to calculate patient retention metrics
 */
export function useCalculatePatientRetentionMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      clinicId,
    }: {
      patientId: string;
      clinicId: string;
    }) =>
      retentionService.calculatePatientRetentionMetrics(patientId, clinicId),
    onSuccess: (data) => {
      // Invalidate and update related queries
      queryClient.invalidateQueries({
        queryKey: [
          'patient-retention-metrics',
          data.patient_id,
          data.clinic_id,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ['clinic-retention-metrics', data.clinic_id],
      });
    },
  });
}

// =====================================================================================
// CHURN PREDICTION HOOKS
// =====================================================================================

/**
 * Hook to get churn predictions for clinic
 */
export function useChurnPredictions(
  clinicId: string,
  options?: {
    riskLevel?: ChurnRiskLevel;
    limit?: number;
    offset?: number;
    enabled?: boolean;
  }
) {
  const { riskLevel, limit = 100, offset = 0, enabled = true } = options || {};

  return useQuery({
    queryKey: ['churn-predictions', clinicId, riskLevel, limit, offset],
    queryFn: () =>
      retentionService.getChurnPredictions(clinicId, riskLevel, limit, offset),
    enabled: enabled && Boolean(clinicId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to generate churn prediction for a patient
 */
export function useGenerateChurnPrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      clinicId,
      modelType = ChurnModelType.ENSEMBLE,
    }: {
      patientId: string;
      clinicId: string;
      modelType?: ChurnModelType;
    }) =>
      retentionService.generateChurnPrediction(patientId, clinicId, modelType),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['churn-predictions', data.clinic_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['retention-dashboard', data.clinic_id],
      });
    },
  });
}

// =====================================================================================
// RETENTION STRATEGIES HOOKS
// =====================================================================================

/**
 * Hook to get retention strategies for clinic
 */
export function useRetentionStrategies(
  clinicId: string,
  options?: {
    activeOnly?: boolean;
    enabled?: boolean;
  }
) {
  const { activeOnly = false, enabled = true } = options || {};

  return useQuery({
    queryKey: ['retention-strategies', clinicId, activeOnly],
    queryFn: () =>
      retentionService.getRetentionStrategies(clinicId, activeOnly),
    enabled: enabled && Boolean(clinicId),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to create retention strategy
 */
export function useCreateRetentionStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (strategy: CreateRetentionStrategy) =>
      retentionService.createRetentionStrategy(strategy),
    onSuccess: (data) => {
      // Invalidate strategies list
      queryClient.invalidateQueries({
        queryKey: ['retention-strategies', data.clinic_id],
      });
    },
  });
}

/**
 * Hook to execute retention strategy
 */
export function useExecuteRetentionStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      strategyId,
      patientIds,
    }: {
      strategyId: string;
      patientIds: string[];
    }) => retentionService.executeRetentionStrategy(strategyId, patientIds),
    onSuccess: (_data, _variables) => {
      // Invalidate performance data
      queryClient.invalidateQueries({
        queryKey: ['retention-performance'],
      });
      queryClient.invalidateQueries({
        queryKey: ['retention-strategies'],
      });
    },
  });
}

// =====================================================================================
// RETENTION ANALYTICS DASHBOARD HOOKS
// =====================================================================================

/**
 * Hook to get comprehensive retention analytics dashboard
 */
export function useRetentionAnalyticsDashboard(
  clinicId: string,
  periodStart: string,
  periodEnd: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: ['retention-dashboard', clinicId, periodStart, periodEnd],
    queryFn: () =>
      retentionService.generateRetentionAnalyticsDashboard(
        clinicId,
        periodStart,
        periodEnd
      ),
    enabled:
      options?.enabled !== false &&
      Boolean(clinicId) &&
      Boolean(periodStart) &&
      Boolean(periodEnd),
    refetchInterval: options?.refetchInterval || 15 * 60 * 1000, // 15 minutes
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// =====================================================================================
// ADVANCED ANALYTICS HOOKS
// =====================================================================================

/**
 * Hook for real-time churn risk monitoring
 */
export function useChurnRiskMonitoring(
  clinicId: string,
  options?: {
    enabled?: boolean;
    refreshInterval?: number;
  }
) {
  const [alerts, setAlerts] = useState<{
    criticalRisk: number;
    highRisk: number;
    mediumRisk: number;
    newPredictions: number;
  }>({
    criticalRisk: 0,
    highRisk: 0,
    mediumRisk: 0,
    newPredictions: 0,
  });

  const { data: predictions } = useChurnPredictions(clinicId, {
    enabled: options?.enabled,
  });

  // Calculate real-time alerts
  React.useEffect(() => {
    if (predictions) {
      const critical = predictions.filter(
        (p) => p.risk_level === ChurnRiskLevel.CRITICAL
      ).length;
      const high = predictions.filter(
        (p) => p.risk_level === ChurnRiskLevel.HIGH
      ).length;
      const medium = predictions.filter(
        (p) => p.risk_level === ChurnRiskLevel.MEDIUM
      ).length;

      // Count predictions from last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const newPredictions = predictions.filter(
        (p) => new Date(p.prediction_date) > yesterday
      ).length;

      setAlerts({
        criticalRisk: critical,
        highRisk: high,
        mediumRisk: medium,
        newPredictions,
      });
    }
  }, [predictions]);

  return {
    alerts,
    predictions,
    isLoading: !predictions,
  };
}

/**
 * Hook for retention strategy performance analytics
 */
export function useRetentionStrategyAnalytics(
  clinicId: string,
  strategyId?: string,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: ['retention-strategy-analytics', clinicId, strategyId],
    queryFn: async () => {
      // Get strategy performance data
      const strategies =
        await retentionService.getRetentionStrategies(clinicId);

      if (strategyId) {
        const strategy = strategies.find((s) => s.id === strategyId);
        return strategy ? [strategy] : [];
      }

      return strategies;
    },
    enabled: options?.enabled !== false && Boolean(clinicId),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for patient risk scoring and insights
 */
export function usePatientRiskInsights(
  patientId: string,
  clinicId: string,
  options?: {
    enabled?: boolean;
  }
) {
  const { data: metrics } = usePatientRetentionMetrics(patientId, clinicId, {
    enabled: options?.enabled,
  });

  const { data: predictions } = useQuery({
    queryKey: ['patient-churn-predictions', patientId, clinicId],
    queryFn: async () => {
      const allPredictions =
        await retentionService.getChurnPredictions(clinicId);
      return allPredictions.filter((p) => p.patient_id === patientId);
    },
    enabled:
      options?.enabled !== false && Boolean(patientId) && Boolean(clinicId),
  });

  // Generate insights based on metrics and predictions
  const insights = React.useMemo(() => {
    if (!metrics) {
      return null;
    }

    const riskFactors = [];
    const recommendations = [];

    // Analyze risk factors
    if (metrics.days_since_last_appointment > 60) {
      riskFactors.push({
        factor: 'Long time since last appointment',
        severity: 'high',
        value: `${metrics.days_since_last_appointment} days`,
      });
      recommendations.push('Schedule follow-up call to re-engage patient');
    }

    if (metrics.response_rate < 0.5) {
      riskFactors.push({
        factor: 'Low follow-up response rate',
        severity: 'medium',
        value: `${Math.round(metrics.response_rate * 100)}%`,
      });
      recommendations.push('Review communication strategy and channels');
    }

    if (metrics.satisfaction_score < 7) {
      riskFactors.push({
        factor: 'Low satisfaction score',
        severity: 'high',
        value: `${metrics.satisfaction_score}/10`,
      });
      recommendations.push('Address satisfaction concerns immediately');
    }

    if (metrics.cancellation_rate > 0.3) {
      riskFactors.push({
        factor: 'High cancellation rate',
        severity: 'medium',
        value: `${Math.round(metrics.cancellation_rate * 100)}%`,
      });
      recommendations.push('Investigate scheduling or service issues');
    }

    return {
      riskLevel: metrics.churn_risk_level,
      riskScore: metrics.churn_risk_score,
      riskFactors,
      recommendations,
      daysToChurn: metrics.days_to_predicted_churn,
      lifetimeValue: metrics.lifetime_value,
      trend:
        predictions && predictions.length > 1
          ? predictions[0].churn_probability - predictions[1].churn_probability
          : 0,
    };
  }, [metrics, predictions]);

  return {
    metrics,
    predictions,
    insights,
    isLoading: !metrics,
  };
}

// =====================================================================================
// BULK OPERATIONS HOOKS
// =====================================================================================

/**
 * Hook for bulk churn prediction generation
 */
export function useBulkChurnPrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clinicId,
      patientIds,
      modelType = ChurnModelType.ENSEMBLE,
    }: {
      clinicId: string;
      patientIds: string[];
      modelType?: ChurnModelType;
    }) => {
      const predictions = [];

      // Generate predictions in batches to avoid overwhelming the system
      const batchSize = 10;
      for (let i = 0; i < patientIds.length; i += batchSize) {
        const batch = patientIds.slice(i, i + batchSize);
        const batchPromises = batch.map((patientId) =>
          retentionService.generateChurnPrediction(
            patientId,
            clinicId,
            modelType
          )
        );

        const batchResults = await Promise.allSettled(batchPromises);
        const successful = batchResults
          .filter(
            (result): result is PromiseFulfilledResult<ChurnPrediction> =>
              result.status === 'fulfilled'
          )
          .map((result) => result.value);

        predictions.push(...successful);
      }

      return predictions;
    },
    onSuccess: (data) => {
      if (data.length > 0) {
        const clinicId = data[0].clinic_id;
        queryClient.invalidateQueries({
          queryKey: ['churn-predictions', clinicId],
        });
        queryClient.invalidateQueries({
          queryKey: ['retention-dashboard', clinicId],
        });
      }
    },
  });
}

/**
 * Hook for bulk retention metrics calculation
 */
export function useBulkRetentionMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clinicId,
      patientIds,
    }: {
      clinicId: string;
      patientIds: string[];
    }) => {
      const metrics = [];

      // Calculate metrics in batches
      const batchSize = 5; // Smaller batch for metrics calculation
      for (let i = 0; i < patientIds.length; i += batchSize) {
        const batch = patientIds.slice(i, i + batchSize);
        const batchPromises = batch.map((patientId) =>
          retentionService.calculatePatientRetentionMetrics(patientId, clinicId)
        );

        const batchResults = await Promise.allSettled(batchPromises);
        const successful = batchResults
          .filter(
            (
              result
            ): result is PromiseFulfilledResult<PatientRetentionMetrics> =>
              result.status === 'fulfilled'
          )
          .map((result) => result.value);

        metrics.push(...successful);
      }

      return metrics;
    },
    onSuccess: (data) => {
      if (data.length > 0) {
        const clinicId = data[0].clinic_id;
        queryClient.invalidateQueries({
          queryKey: ['clinic-retention-metrics', clinicId],
        });
      }
    },
  });
}

// =====================================================================================
// UTILITY HOOKS
// =====================================================================================

/**
 * Hook for formatting retention analytics data
 */
export function useRetentionAnalyticsFormatters() {
  const formatRiskLevel = (
    level: ChurnRiskLevel
  ): { color: string; label: string } => {
    switch (level) {
      case ChurnRiskLevel.CRITICAL:
        return { color: 'red', label: 'Critical Risk' };
      case ChurnRiskLevel.HIGH:
        return { color: 'orange', label: 'High Risk' };
      case ChurnRiskLevel.MEDIUM:
        return { color: 'yellow', label: 'Medium Risk' };
      case ChurnRiskLevel.LOW:
        return { color: 'green', label: 'Low Risk' };
      default:
        return { color: 'gray', label: 'Unknown' };
    }
  };

  const formatChurnProbability = (probability: number): string => {
    return `${Math.round(probability * 100)}%`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDaysToChurn = (days: number | null): string => {
    if (!days) {
      return 'N/A';
    }
    if (days < 30) {
      return `${days} dias`;
    }
    if (days < 365) {
      return `${Math.round(days / 30)} meses`;
    }
    return `${Math.round(days / 365)} anos`;
  };

  const formatRetentionRate = (rate: number): string => {
    return `${Math.round(rate * 100)}%`;
  };

  return {
    formatRiskLevel,
    formatChurnProbability,
    formatCurrency,
    formatDaysToChurn,
    formatRetentionRate,
  };
}

/**
 * Hook for retention analytics export functionality
 */
export function useRetentionAnalyticsExport() {
  const exportToCsv = (_data: any[], _filename: string) => {};

  const exportToPdf = (_data: any[], _filename: string) => {};

  const exportToExcel = (_data: any[], _filename: string) => {};

  return {
    exportToCsv,
    exportToPdf,
    exportToExcel,
  };
}

// Re-export React for useMemo and useEffect
import React from 'react';

export default {
  usePatientRetentionMetrics,
  useClinicRetentionMetrics,
  useCalculatePatientRetentionMetrics,
  useChurnPredictions,
  useGenerateChurnPrediction,
  useRetentionStrategies,
  useCreateRetentionStrategy,
  useExecuteRetentionStrategy,
  useRetentionAnalyticsDashboard,
  useChurnRiskMonitoring,
  useRetentionStrategyAnalytics,
  usePatientRiskInsights,
  useBulkChurnPrediction,
  useBulkRetentionMetrics,
  useRetentionAnalyticsFormatters,
  useRetentionAnalyticsExport,
};
