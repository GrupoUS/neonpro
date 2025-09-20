/**
 * Service Analytics Hooks
 * React Query hooks for analytics and reporting
 */

import { serviceAnalyticsService } from "@/services/service-analytics.service";
import type {
  AnalyticsExportRequest,
  AnalyticsFilters,
  AnalyticsTimeRange,
} from "@/types/service-analytics";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query Keys
export const analyticsKeys = {
  all: ["analytics"] as const,
  service: () => [...analyticsKeys.all, "service"] as const,
  serviceAnalytics: (clinicId: string, filters?: AnalyticsFilters) =>
    [...analyticsKeys.service(), clinicId, filters] as const,
  revenue: () => [...analyticsKeys.all, "revenue"] as const,
  revenueAnalytics: (clinicId: string, filters?: AnalyticsFilters) =>
    [...analyticsKeys.revenue(), clinicId, filters] as const,
  usage: () => [...analyticsKeys.all, "usage"] as const,
  usageStatistics: (clinicId: string, filters?: AnalyticsFilters) =>
    [...analyticsKeys.usage(), clinicId, filters] as const,
  professional: () => [...analyticsKeys.all, "professional"] as const,
  professionalPerformance: (
    clinicId: string,
    professionalId?: string,
    filters?: AnalyticsFilters,
  ) =>
    [
      ...analyticsKeys.professional(),
      clinicId,
      professionalId,
      filters,
    ] as const,
  dashboard: (clinicId: string, filters?: AnalyticsFilters) =>
    [...analyticsKeys.all, "dashboard", clinicId, filters] as const,
  realtime: (clinicId: string) =>
    [...analyticsKeys.all, "realtime", clinicId] as const,
  trends: (clinicId: string, granularity: string, filters?: AnalyticsFilters) =>
    [...analyticsKeys.all, "trends", clinicId, granularity, filters] as const,
  insights: (clinicId: string, filters?: AnalyticsFilters) =>
    [...analyticsKeys.all, "insights", clinicId, filters] as const,
};

/**
 * Hook to get service analytics
 */
export function useServiceAnalytics(
  clinicId: string,
  filters?: AnalyticsFilters,
) {
  return useQuery({
    queryKey: analyticsKeys.serviceAnalytics(clinicId, filters),
    queryFn: () =>
      serviceAnalyticsService.getServiceAnalytics(clinicId, filters),
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get revenue analytics
 */
export function useRevenueAnalytics(
  clinicId: string,
  filters?: AnalyticsFilters,
) {
  return useQuery({
    queryKey: analyticsKeys.revenueAnalytics(clinicId, filters),
    queryFn: () =>
      serviceAnalyticsService.getRevenueAnalytics(clinicId, filters),
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get usage statistics
 */
export function useUsageStatistics(
  clinicId: string,
  filters?: AnalyticsFilters,
) {
  return useQuery({
    queryKey: analyticsKeys.usageStatistics(clinicId, filters),
    queryFn: () =>
      serviceAnalyticsService.getUsageStatistics(clinicId, filters),
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to get professional performance
 */
export function useProfessionalPerformance(
  clinicId: string,
  professionalId?: string,
  filters?: AnalyticsFilters,
) {
  return useQuery({
    queryKey: analyticsKeys.professionalPerformance(
      clinicId,
      professionalId,
      filters,
    ),
    queryFn: () =>
      serviceAnalyticsService.getProfessionalPerformance(
        clinicId,
        professionalId,
        filters,
      ),
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get complete analytics dashboard
 */
export function useAnalyticsDashboard(
  clinicId: string,
  filters?: AnalyticsFilters,
) {
  return useQuery({
    queryKey: analyticsKeys.dashboard(clinicId, filters),
    queryFn: () =>
      serviceAnalyticsService.getAnalyticsDashboard(clinicId, filters),
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get real-time analytics
 */
export function useRealTimeAnalytics(clinicId: string) {
  return useQuery({
    queryKey: analyticsKeys.realtime(clinicId),
    queryFn: () => serviceAnalyticsService.getRealTimeAnalytics(clinicId),
    enabled: !!clinicId,
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    staleTime: 1000 * 15, // 15 seconds
  });
}

/**
 * Hook to get revenue trends
 */
export function useRevenueTrends(
  clinicId: string,
  granularity: "daily" | "weekly" | "monthly" = "daily",
  filters?: AnalyticsFilters,
) {
  return useQuery({
    queryKey: analyticsKeys.trends(clinicId, granularity, filters),
    queryFn: () =>
      serviceAnalyticsService.getRevenueTrends(clinicId, granularity, filters),
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get analytics insights
 */
export function useAnalyticsInsights(
  clinicId: string,
  filters?: AnalyticsFilters,
) {
  return useQuery({
    queryKey: analyticsKeys.insights(clinicId, filters),
    queryFn: () =>
      serviceAnalyticsService.getAnalyticsInsights(clinicId, filters),
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to get service comparison
 */
export function useServiceComparison(
  clinicId: string,
  serviceIds: string[],
  filters?: AnalyticsFilters,
) {
  return useQuery({
    queryKey: [
      ...analyticsKeys.service(),
      "comparison",
      clinicId,
      serviceIds,
      filters,
    ],
    queryFn: () =>
      serviceAnalyticsService.getServiceComparison(
        clinicId,
        serviceIds,
        filters,
      ),
    enabled: !!clinicId && serviceIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to export analytics data
 */
export function useExportAnalytics() {
  return useMutation({
    mutationFn: (request: AnalyticsExportRequest) =>
      serviceAnalyticsService.exportAnalytics(request),

    onSuccess: (blob, variables) => {
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const extension =
        variables.format === "excel" ? "xlsx" : variables.format;
      link.download = `analytics-${variables.report_type}-${
        new Date().toISOString().split("T")[0]
      }.${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Relatório exportado com sucesso!");
    },

    onError: (error: Error) => {
      console.error("Error exporting analytics:", error);
      toast.error(`Erro ao exportar relatório: ${error.message}`);
    },
  });
}

/**
 * Hook to get analytics for a specific time range
 */
export function useAnalyticsByTimeRange(
  clinicId: string,
  timeRange: AnalyticsTimeRange,
  customStart?: Date,
  customEnd?: Date,
) {
  const filters: AnalyticsFilters = {};

  if (timeRange === "custom" && customStart && customEnd) {
    filters.start_date = customStart.toISOString();
    filters.end_date = customEnd.toISOString();
  } else if (timeRange !== "custom") {
    const { getTimeRangeDates } = require("@/types/service-analytics");
    const { start, end } = getTimeRangeDates(timeRange);
    filters.start_date = start.toISOString();
    filters.end_date = end.toISOString();
  }

  return useAnalyticsDashboard(clinicId, filters);
}

/**
 * Hook to refresh all analytics data
 */
export function useRefreshAnalytics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Invalidate all analytics queries for the clinic
      await queryClient.invalidateQueries({
        queryKey: analyticsKeys.all,
      });
      return true;
    },

    onSuccess: () => {
      toast.success("Dados de analytics atualizados!");
    },

    onError: (error: Error) => {
      console.error("Error refreshing analytics:", error);
      toast.error("Erro ao atualizar dados de analytics");
    },
  });
}
