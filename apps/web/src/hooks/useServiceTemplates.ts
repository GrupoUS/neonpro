/**
 * Service Templates Hooks
 * React Query hooks for managing service templates and packages
 */

import { serviceTemplatesService } from '@/services/service-templates.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
// Only import the types we actually use to avoid TS6196
import type {
  CreateServiceTemplateItemRequest,
  CreateServiceTemplateRequest,
  DuplicateServiceTemplateRequest,
  ServiceTemplateFilters,
  UpdateServiceTemplateItemRequest,
  UpdateServiceTemplateRequest,
} from '@/types/service-templates';

// NOTE: Keep imports minimal; these types are used in generics below to satisfy TS

// Query keys
export const serviceTemplatesKeys = {
  all: ['service-templates'] as const,
  lists: () => [...serviceTemplatesKeys.all, 'list'] as const,
  list: (filters: ServiceTemplateFilters) => [...serviceTemplatesKeys.lists(), filters] as const,
  withItems: (clinicId: string) => [...serviceTemplatesKeys.all, 'with-items', clinicId] as const,
  detail: (id: string) => [...serviceTemplatesKeys.all, 'detail', id] as const,
  detailWithItems: (id: string) => [...serviceTemplatesKeys.all, 'detail-with-items', id] as const,
  stats: (clinicId: string) => [...serviceTemplatesKeys.all, 'stats', clinicId] as const,
};

/**
 * Get service templates with optional filtering
 */
export function useServiceTemplates(filters: ServiceTemplateFilters = {}) {
  return useQuery({
    queryKey: serviceTemplatesKeys.list(filters),
    queryFn: () => serviceTemplatesService.getServiceTemplates(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get service templates with items and calculated prices
 */
export function useServiceTemplatesWithItems(clinicId: string) {
  return useQuery({
    queryKey: serviceTemplatesKeys.withItems(clinicId),
    queryFn: () => serviceTemplatesService.getServiceTemplatesWithItems(clinicId),
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get a single service template
 */
export function useServiceTemplate(id: string) {
  return useQuery({
    queryKey: serviceTemplatesKeys.detail(id),
    queryFn: () => serviceTemplatesService.getServiceTemplate(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get a service template with its items
 */
export function useServiceTemplateWithItems(id: string) {
  return useQuery({
    queryKey: serviceTemplatesKeys.detailWithItems(id),
    queryFn: () => serviceTemplatesService.getServiceTemplateWithItems(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get service template statistics
 */
export function useServiceTemplateStats(clinicId: string) {
  return useQuery({
    queryKey: serviceTemplatesKeys.stats(clinicId),
    queryFn: () => serviceTemplatesService.getServiceTemplateStats(clinicId),
    enabled: !!clinicId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Create service template
 */
export function useCreateServiceTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateServiceTemplateRequest) =>
      serviceTemplatesService.createServiceTemplate(request),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: serviceTemplatesKeys.all });

      toast.success('Template de serviço criado com sucesso!');
    },
    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      toast.error(`Erro ao criar template: ${error.message}`);
    },
  });
}

/**
 * Update service template
 */
export function useUpdateServiceTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateServiceTemplateRequest) =>
      serviceTemplatesService.updateServiceTemplate(request),
    onSuccess: data => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: serviceTemplatesKeys.all });
      queryClient.invalidateQueries({
        queryKey: serviceTemplatesKeys.detail(data.id),
      });

      toast.success('Template atualizado com sucesso!');
    },
    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      toast.error(`Erro ao atualizar template: ${error.message}`);
    },
  });
}

/**
 * Delete service template
 */
export function useDeleteServiceTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => serviceTemplatesService.deleteServiceTemplate(id),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: serviceTemplatesKeys.all });

      toast.success('Template removido com sucesso!');
    },
    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      toast.error(`Erro ao remover template: ${error.message}`);
    },
  });
}

/**
 * Add template items
 */
export function useAddTemplateItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      items,
    }: {
      templateId: string;
      items: CreateServiceTemplateItemRequest[];
    }) => serviceTemplatesService.addTemplateItems(templateId, items),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: serviceTemplatesKeys.all });
      queryClient.invalidateQueries({
        queryKey: serviceTemplatesKeys.detailWithItems(variables.templateId),
      });

      toast.success('Serviços adicionados ao template!');
    },
    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      toast.error(`Erro ao adicionar serviços: ${error.message}`);
    },
  });
}

/**
 * Update template item
 */
export function useUpdateTemplateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateServiceTemplateItemRequest) =>
      serviceTemplatesService.updateTemplateItem(request),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: serviceTemplatesKeys.all });

      toast.success('Item do template atualizado!');
    },
    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      toast.error(`Erro ao atualizar item: ${error.message}`);
    },
  });
}

/**
 * Remove template item
 */
export function useRemoveTemplateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => serviceTemplatesService.removeTemplateItem(itemId),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: serviceTemplatesKeys.all });

      toast.success('Item removido do template!');
    },
    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      toast.error(`Erro ao remover item: ${error.message}`);
    },
  });
}

/**
 * Increment template usage
 */
export function useIncrementTemplateUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => serviceTemplatesService.incrementTemplateUsage(templateId),
    onSuccess: () => {
      // Invalidate stats queries to update usage counts
      queryClient.invalidateQueries({ queryKey: serviceTemplatesKeys.all });
    },
    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      console.error('Error incrementing template usage:', error);
      // Don't show error toast for this as it's a background operation
    },
  });
}

/**
 * Duplicate service template
 */
export function useDuplicateServiceTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DuplicateServiceTemplateRequest) =>
      serviceTemplatesService.duplicateServiceTemplate(request),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: serviceTemplatesKeys.all });

      toast.success('Template duplicado com sucesso!');
    },
    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      toast.error(`Erro ao duplicar template: ${error.message}`);
    },
  });
}

/**
 * Toggle template featured status
 */
export function useToggleTemplateFeatured() {
  const updateMutation = useUpdateServiceTemplate();

  return useMutation({
    mutationFn: async ({
      id,
      isFeatured,
    }: {
      id: string;
      isFeatured: boolean;
    }) => {
      await updateMutation.mutateAsync({
        id,
        is_featured: !isFeatured,
      });
    },
    onSuccess: (_, { isFeatured }) => {
      const message = isFeatured
        ? 'Template removido dos destaques'
        : 'Template adicionado aos destaques';
      toast.success(message);
    },
    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      toast.error(`Erro ao alterar destaque: ${error.message}`);
    },
  });
}

/**
 * Toggle template active status
 */
export function useToggleTemplateActive() {
  const updateMutation = useUpdateServiceTemplate();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await updateMutation.mutateAsync({
        id,
        is_active: !isActive,
      });
    },
    onSuccess: (_, { isActive }) => {
      const message = isActive ? 'Template desativado' : 'Template ativado';
      toast.success(message);
    },
    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      toast.error(`Erro ao alterar status: ${error.message}`);
    },
  });
}

/**
 * Get featured templates for a clinic
 */
export function useFeaturedServiceTemplates(clinicId: string) {
  return useServiceTemplates({
    clinic_id: clinicId,
    is_active: true,
    is_featured: true,
  });
}

/**
 * Get templates by type
 */
export function useServiceTemplatesByType(
  clinicId: string,
  templateType: string,
) {
  return useServiceTemplates({
    clinic_id: clinicId,
    is_active: true,
    template_type: templateType as any,
  });
}
