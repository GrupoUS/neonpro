/**
 * Service Types hooks with React Query integration
 * Handles aesthetic clinic services and procedures
 */

import {
  type ServiceType,
  serviceTypeService,
} from "@/services/service-types.service";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import React from "react";

// Query keys for service types
export const serviceTypeKeys = {
  all: ["serviceTypes"] as const,
  lists: () => [...serviceTypeKeys.all, "list"] as const,
  list: (clinicId?: string, filters?: any) =>
    [...serviceTypeKeys.lists(), clinicId, filters] as const,
  details: () => [...serviceTypeKeys.all, "detail"] as const,
  detail: (id: string) => [...serviceTypeKeys.details(), id] as const,
  search: (query: string, clinicId?: string) =>
    [...serviceTypeKeys.all, "search", query, clinicId] as const,
  categories: (clinicId?: string) =>
    [...serviceTypeKeys.all, "categories", clinicId] as const,
  byCategory: (category: string, clinicId?: string) =>
    [...serviceTypeKeys.all, "byCategory", category, clinicId] as const,
};

/**
 * Hook to get all service types
 */
export function useServiceTypes(
  clinicId?: string,
  options?: Omit<UseQueryOptions<ServiceType[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: serviceTypeKeys.list(clinicId),
    queryFn: () => serviceTypeService.getServiceTypes(clinicId),
    staleTime: 10 * 60 * 1000, // 10 minutes - service types don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
}

/**
 * Hook to search service types
 */
export function useSearchServiceTypes(
  query: string,
  clinicId?: string,
  options?: Omit<UseQueryOptions<ServiceType[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: serviceTypeKeys.search(query, clinicId),
    queryFn: () => serviceTypeService.searchServiceTypes(query, clinicId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: query.length >= 2, // Only search with 2+ characters
    ...options,
  });
}

/**
 * Hook to get service type by ID
 */
export function useServiceType(
  serviceTypeId: string,
  options?: Omit<
    UseQueryOptions<ServiceType | null, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: serviceTypeKeys.detail(serviceTypeId),
    queryFn: () => serviceTypeService.getServiceType(serviceTypeId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!serviceTypeId,
    ...options,
  });
}

/**
 * Hook to get service types by category
 */
export function useServiceTypesByCategory(
  category: string,
  clinicId?: string,
  options?: Omit<UseQueryOptions<ServiceType[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: serviceTypeKeys.byCategory(category, clinicId),
    queryFn: () =>
      serviceTypeService.getServiceTypesByCategory(category, clinicId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!category,
    ...options,
  });
}

/**
 * Hook to get available service categories
 */
export function useServiceCategories(
  clinicId?: string,
  options?: Omit<UseQueryOptions<string[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: serviceTypeKeys.categories(clinicId),
    queryFn: () => serviceTypeService.getServiceCategories(clinicId),
    staleTime: 15 * 60 * 1000, // 15 minutes - categories change rarely
    gcTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
}

/**
 * Hook for popular/recommended services
 */
export function usePopularServices(clinicId?: string) {
  return useServiceTypes(clinicId, {
    select: (services) => {
      // Return services sorted by popularity (could be based on usage stats)
      // For now, just return first 6 services
      return services.slice(0, 6);
    },
  });
}

/**
 * Hook to get services grouped by category
 */
export function useServicesByCategory(clinicId?: string) {
  const { data: services } = useServiceTypes(clinicId);
  const { data: categories } = useServiceCategories(clinicId);

  const servicesByCategory = React.useMemo(() => {
    if (!services || !categories) return {};

    return categories.reduce(
      (acc, category) => {
        acc[category] = services.filter(
          (service) => service.category === category,
        );
        return acc;
      },
      {} as Record<string, ServiceType[]>,
    );
  }, [services, categories]);

  return servicesByCategory;
}
