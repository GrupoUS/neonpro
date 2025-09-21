/**
 * Business Analytics Hooks
 * React Query hooks for business analytics and reporting data
 */

import {
  type AnalyticsDateRange,
  analyticsService,
  // type AppointmentMetrics,
  // type RevenueMetrics,
  // type PatientAnalytics,
  // type ProfessionalPerformance,
  // type PopularServicesData
} from '@/services/analytics.service';
import { useMutation, useQuery } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import { toast } from 'sonner';

/**
 * Default date range (last 30 days)
 */
const getDefaultDateRange = (): AnalyticsDateRange => ({
  startDate: subDays(new Date(), 30),
  endDate: new Date(),
});

/**
 * Hook to get appointment metrics
 */
export function useAppointmentMetrics(
  clinicId: string,
  dateRange: AnalyticsDateRange = getDefaultDateRange(),
) {
  return useQuery({
    queryKey: [
      'appointment-metrics',_clinicId,_dateRange.startDate,_dateRange.endDate,_],
    queryFn: () => analyticsService.getAppointmentMetrics(clinicId, dateRange),
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get revenue metrics
 */
export function useRevenueMetrics(
  clinicId: string,
  dateRange: AnalyticsDateRange = getDefaultDateRange(),
) {
  return useQuery({
    queryKey: [
      'revenue-metrics',_clinicId,_dateRange.startDate,_dateRange.endDate,_],
    queryFn: () => analyticsService.getRevenueMetrics(clinicId, dateRange),
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get patient analytics
 */
export function usePatientAnalytics(
  clinicId: string,
  dateRange: AnalyticsDateRange = getDefaultDateRange(),
) {
  return useQuery({
    queryKey: [
      'patient-analytics',_clinicId,_dateRange.startDate,_dateRange.endDate,_],
    queryFn: () => analyticsService.getPatientAnalytics(clinicId, dateRange),
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get professional performance metrics
 */
export function useProfessionalPerformance(
  clinicId: string,
  dateRange: AnalyticsDateRange = getDefaultDateRange(),
) {
  return useQuery({
    queryKey: [
      'professional-performance',_clinicId,_dateRange.startDate,_dateRange.endDate,_],
    queryFn: () => analyticsService.getProfessionalPerformance(clinicId, dateRange),
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get popular services data
 */
export function usePopularServices(
  clinicId: string,
  dateRange: AnalyticsDateRange = getDefaultDateRange(),
) {
  return useQuery({
    queryKey: [
      'popular-services',_clinicId,_dateRange.startDate,_dateRange.endDate,_],
    queryFn: () => analyticsService.getPopularServices(clinicId, dateRange),
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to export analytics data
 */
export function useExportAnalytics() {
  return useMutation({
    mutationFn: async ({
      clinicId,_dateRange,_reportType,
    }: {
      clinicId: string;
      dateRange: AnalyticsDateRange;
      reportType: 'appointments' | 'revenue' | 'patients' | 'professionals';
    }) => {
      const csvContent = await analyticsService.exportAnalyticsToCSV(
        clinicId,
        dateRange,
        reportType,
      );

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `neonpro-${reportType}-${new Date().toISOString().split('T')[0]}.csv`,
      );
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return csvContent;
    },
    onSuccess: (_,_{ reportType }) => {
      toast.success(`Relatório de ${reportType} exportado com sucesso!`);
    },
    onError: error => {
      console.error('Error exporting analytics:', error);
      toast.error('Erro ao exportar relatório');
    },
  });
}

/**
 * Hook to get comprehensive dashboard data
 */
export function useDashboardData(
  clinicId: string,
  dateRange: AnalyticsDateRange = getDefaultDateRange(),
) {
  const appointmentMetrics = useAppointmentMetrics(clinicId, dateRange);
  const revenueMetrics = useRevenueMetrics(clinicId, dateRange);
  const patientAnalytics = usePatientAnalytics(clinicId, dateRange);
  const professionalPerformance = useProfessionalPerformance(
    clinicId,
    dateRange,
  );
  const popularServices = usePopularServices(clinicId, dateRange);

  return {
    appointmentMetrics,
    revenueMetrics,
    patientAnalytics,
    professionalPerformance,
    popularServices,
    isLoading: appointmentMetrics.isLoading
      || revenueMetrics.isLoading
      || patientAnalytics.isLoading
      || professionalPerformance.isLoading
      || popularServices.isLoading,
    isError: appointmentMetrics.isError
      || revenueMetrics.isError
      || patientAnalytics.isError
      || professionalPerformance.isError
      || popularServices.isError,
    error: appointmentMetrics.error
      || revenueMetrics.error
      || patientAnalytics.error
      || professionalPerformance.error
      || popularServices.error,
  };
}

/**
 * Hook for real-time dashboard updates
 */
export function useRealtimeDashboard(
  clinicId: string,
  dateRange: AnalyticsDateRange = getDefaultDateRange(),
) {
  const dashboardData = useDashboardData(clinicId, dateRange);

  // Refetch data every 5 minutes for real-time updates
  const refetchInterval = 5 * 60 * 1000; // 5 minutes

  return {
    ...dashboardData,
    refetch: () => {
      dashboardData.appointmentMetrics.refetch();
      dashboardData.revenueMetrics.refetch();
      dashboardData.patientAnalytics.refetch();
      dashboardData.professionalPerformance.refetch();
      dashboardData.popularServices.refetch();
    },
    refetchInterval,
  };
}

/**
 * Utility function to format currency
 */
import { formatBRL } from '@neonpro/utils';

export function formatCurrency(value: number): string {
  return formatBRL(value);
}

/**
 * Utility function to format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Utility function to get date range presets
 */
export function getDateRangePresets(): {
  label: string;
  range: AnalyticsDateRange;
}[] {
  const today = new Date();

  return [
    {
      label: 'Últimos 7 dias',
      range: {
        startDate: subDays(today, 7),
        endDate: today,
      },
    },
    {
      label: 'Últimos 30 dias',
      range: {
        startDate: subDays(today, 30),
        endDate: today,
      },
    },
    {
      label: 'Últimos 90 dias',
      range: {
        startDate: subDays(today, 90),
        endDate: today,
      },
    },
    {
      label: 'Este mês',
      range: {
        startDate: new Date(today.getFullYear(), today.getMonth(), 1),
        endDate: today,
      },
    },
    {
      label: 'Mês passado',
      range: {
        startDate: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        endDate: new Date(today.getFullYear(), today.getMonth(), 0),
      },
    },
  ];
}
