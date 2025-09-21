/**
 * Service Categories Hooks
 * React Query hooks for service category management
 */

import { serviceCategoriesService } from '@/services/service-categories.service';
import type {
  CreateServiceCategoryRequest,
  ServiceCategoryFilters,
  UpdateServiceCategoryRequest,
} from '@/types/service-categories'; // keep types used in generics only
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Query Keys
export const serviceCategoryKeys = {
  all: ['serviceCategories'] as const,
  lists: () => [...serviceCategoryKeys.all, 'list'] as const,
  list: (filters?: ServiceCategoryFilters) => [...serviceCategoryKeys.lists(), filters] as const,
  details: () => [...serviceCategoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceCategoryKeys.details(), id] as const,
  withServices: (clinicId: string) =>
    [...serviceCategoryKeys.all, 'withServices', clinicId] as const,
};

/**
 * Hook to get all service categories
 */
export function useServiceCategories(filters?: ServiceCategoryFilters) {
  return useQuery({
    queryKey: serviceCategoryKeys.list(filters),
    queryFn: () => serviceCategoriesService.getServiceCategories(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get service category by ID
 */
export function useServiceCategory(categoryId: string) {
  return useQuery({
    queryKey: serviceCategoryKeys.detail(categoryId),
    queryFn: () => serviceCategoriesService.getServiceCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get service categories with their services
 */
export function useServiceCategoriesWithServices(clinicId: string) {
  return useQuery({
    queryKey: serviceCategoryKeys.withServices(clinicId),
    queryFn: () => serviceCategoriesService.getServiceCategoriesWithServices(clinicId),
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to create a new service category
 */
export function useCreateServiceCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData: CreateServiceCategoryRequest) =>
      serviceCategoriesService.createServiceCategory(categoryData),
    onSuccess: newCategory => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: serviceCategoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: serviceCategoryKeys.withServices(newCategory.clinic_id),
      });

      // Add the new category to the cache
      queryClient.setQueryData(
        serviceCategoryKeys.detail(newCategory.id),
        newCategory,
      );

      toast.success('Categoria criada com sucesso!');
    },
    onError: error => {
      console.error('Error creating service category:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao criar categoria',
      );
    },
  });
}

/**
 * Hook to update a service category
 */
export function useUpdateServiceCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData: UpdateServiceCategoryRequest) =>
      serviceCategoriesService.updateServiceCategory(categoryData),
    onSuccess: updatedCategory => {
      // Update the category in the cache
      queryClient.setQueryData(
        serviceCategoryKeys.detail(updatedCategory.id),
        updatedCategory,
      );

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: serviceCategoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: serviceCategoryKeys.withServices(updatedCategory.clinic_id),
      });

      toast.success('Categoria atualizada com sucesso!');
    },
    onError: error => {
      console.error('Error updating service category:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao atualizar categoria',
      );
    },
  });
}

/**
 * Hook to delete a service category
 */
export function useDeleteServiceCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => serviceCategoriesService.deleteServiceCategory(categoryId),
    onSuccess: (_, categoryId) => {
      // Remove the category from the cache
      queryClient.removeQueries({
        queryKey: serviceCategoryKeys.detail(categoryId),
      });

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: serviceCategoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceCategoryKeys.all });

      toast.success('Categoria excluída com sucesso!');
    },
    onError: error => {
      console.error('Error deleting service category:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao excluir categoria',
      );
    },
  });
}

/**
 * Hook to initialize default categories for a clinic
 */
export function useInitializeDefaultCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clinicId: string) =>
      serviceCategoriesService.initializeDefaultCategories(clinicId),
    onSuccess: (categories, clinicId) => {
      // Add categories to cache
      categories.forEach(_category => {
        queryClient.setQueryData(
          serviceCategoryKeys.detail(category.id),
          category,
        );
      });

      // Invalidate lists to ensure they include new categories
      queryClient.invalidateQueries({ queryKey: serviceCategoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: serviceCategoryKeys.withServices(clinicId),
      });

      toast.success(
        `${categories.length} categorias padrão criadas com sucesso!`,
      );
    },
    onError: error => {
      console.error('Error initializing default categories:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao criar categorias padrão',
      );
    },
  });
}

/**
 * Hook to get active service categories for dropdowns/selects
 */
export function useActiveServiceCategories(clinicId?: string) {
  return useServiceCategories({
    clinic_id: clinicId,
    is_active: true,
  });
}

/**
 * Hook to search service categories
 */
export function useSearchServiceCategories(
  searchQuery: string,
  clinicId?: string,
) {
  return useServiceCategories({
    clinic_id: clinicId,
    search: searchQuery,
    is_active: true,
  });
}
