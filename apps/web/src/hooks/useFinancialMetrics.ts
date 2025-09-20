/**
 * Financial Metrics Hooks
 * React Query hooks for financial analytics and reporting
 */

import { FinancialMetricsService } from '@/services/financial-metrics';
import type {
  FinancialMetric,
  MetricsCalculationOptions,
  MetricsHistory,
} from '@/services/financial-metrics';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Query Keys
export const financialKeys = {
  all: ['financial'] as const,
  metrics: () => [...financialKeys.all, 'metrics'] as const,
  metricsCalculation: (options: MetricsCalculationOptions) =>
    [...financialKeys.metrics(), 'calculation', options] as const,
  aggregates: () => [...financialKeys.all, 'aggregates'] as const,
  aggregateData: (options: MetricsCalculationOptions) =>
    [...financialKeys.aggregates(), options] as const,
  history: () => [...financialKeys.all, 'history'] as const,
  metricsHistory: (metricName: string, period: string, months: number) =>
    [...financialKeys.history(), metricName, period, months] as const,
  exports: () => [...financialKeys.all, 'exports'] as const,
  export: (options: MetricsCalculationOptions, format: string) =>
    [...financialKeys.exports(), options, format] as const,
};

/**
 * Hook to calculate financial metrics
 */
export function useFinancialMetrics(options: MetricsCalculationOptions) {
  return useQuery({
    queryKey: financialKeys.metricsCalculation(options),
    queryFn: () => FinancialMetricsService.calculateMetrics(options),
    enabled: !!(options.startDate && options.endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
} /**
 * Hook to get aggregated financial data
 */

export function useFinancialAggregates(options: MetricsCalculationOptions) {
  return useQuery({
    queryKey: financialKeys.aggregateData(options),
    queryFn: () => FinancialMetricsService.aggregateData(options),
    enabled: !!(options.startDate && options.endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get metrics history for trend analysis
 */
export function useMetricsHistory(
  metricName: string,
  period: 'daily' | 'weekly' | 'monthly' | 'yearly',
  months: number = 12,
) {
  return useQuery({
    queryKey: financialKeys.metricsHistory(metricName, period, months),
    queryFn: () => FinancialMetricsService.getMetricsHistory(metricName, period, months),
    enabled: !!metricName,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to export financial metrics
 */
export function useExportMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      options,
      format,
    }: {
      options: MetricsCalculationOptions;
      format: 'csv' | 'excel' | 'pdf';
    }): Promise<Blob> => {
      return FinancialMetricsService.exportMetrics(options, format);
    },
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial-metrics-${new Date().toISOString().split('T')[0]}.${
        variables.format === 'excel' ? 'xlsx' : variables.format
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Relatório exportado com sucesso!');

      // Invalidate export queries
      queryClient.invalidateQueries({
        queryKey: financialKeys.exports(),
      });
    },
    onError: (error: any) => {
      console.error('Error exporting metrics:', error);
      toast.error('Erro ao exportar relatório. Tente novamente.');
    },
  });
}

/**
 * Hook to refresh all financial metrics
 */
export function useRefreshFinancialMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Invalidate all financial queries
      queryClient.invalidateQueries({
        queryKey: financialKeys.all,
      });
      return true;
    },
    onSuccess: () => {
      toast.success('Dados financeiros atualizados!');
    },
    onError: (error: any) => {
      console.error('Error refreshing financial metrics:', error);
      toast.error('Erro ao atualizar dados. Tente novamente.');
    },
  });
}
