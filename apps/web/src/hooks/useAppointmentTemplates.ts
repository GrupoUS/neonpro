/**
 * Appointment Templates Hooks
 * React Query hooks for appointment template management
 */

import { appointmentTemplatesService } from "@/services/appointment-templates.service";
import type {
  AppointmentTemplateFilters,
  CreateAppointmentTemplateData,
  UpdateAppointmentTemplateData,
  // AppointmentTemplate, // keep type available if needed later
} from "@/types/appointment-templates";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query Keys
export const appointmentTemplateKeys = {
  all: ["appointment-templates"] as const,
  lists: () => [...appointmentTemplateKeys.all, "list"] as const,
  list: (filters: AppointmentTemplateFilters) =>
    [...appointmentTemplateKeys.lists(), filters] as const,
  details: () => [...appointmentTemplateKeys.all, "detail"] as const,
  detail: (id: string) => [...appointmentTemplateKeys.details(), id] as const,
  categories: () => [...appointmentTemplateKeys.all, "categories"] as const,
  category: (category: string, clinicId?: string) =>
    [...appointmentTemplateKeys.categories(), category, clinicId] as const,
  defaults: (clinicId?: string) =>
    [...appointmentTemplateKeys.all, "defaults", clinicId] as const,
};

/**
 * Hook to get all appointment templates
 */
export function useAppointmentTemplates(filters?: AppointmentTemplateFilters) {
  return useQuery({
    queryKey: appointmentTemplateKeys.list(filters || {}),
    // service accepts optional filters; pass only when defined to keep types happy
    queryFn: () =>
      appointmentTemplatesService.getAppointmentTemplates(filters ?? undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get appointment template by ID
 */
export function useAppointmentTemplate(templateId: string) {
  return useQuery({
    queryKey: appointmentTemplateKeys.detail(templateId),
    queryFn: () =>
      appointmentTemplatesService.getAppointmentTemplate(templateId),
    enabled: !!templateId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get templates by category
 */
export function useAppointmentTemplatesByCategory(
  category: string,
  clinicId?: string,
) {
  return useQuery({
    queryKey: appointmentTemplateKeys.category(category, clinicId),
    queryFn: () =>
      appointmentTemplatesService.getTemplatesByCategory(category, clinicId),
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get default templates
 */
export function useDefaultAppointmentTemplates(clinicId?: string) {
  return useQuery({
    queryKey: appointmentTemplateKeys.defaults(clinicId),
    queryFn: () => appointmentTemplatesService.getDefaultTemplates(clinicId),
    staleTime: 10 * 60 * 1000, // 10 minutes - defaults don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to create appointment template
 */
export function useCreateAppointmentTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateData,
      clinicId,
      userId,
    }: {
      templateData: CreateAppointmentTemplateData;
      clinicId: string;
      userId: string;
    }) => {
      return appointmentTemplatesService.createAppointmentTemplate(
        templateData,
        clinicId,
        userId,
      );
    },
    onSuccess: (newTemplate) => {
      // Invalidate and refetch appointment templates
      queryClient.invalidateQueries({ queryKey: appointmentTemplateKeys.all });

      toast.success("Template de agendamento criado com sucesso!", {
        description: `Template "${newTemplate.name}" foi criado.`,
      });
    },
    onError: (error: Error) => {
      console.error("Error creating appointment template:", error);
      toast.error("Erro ao criar template", {
        description: error.message || "Ocorreu um erro inesperado.",
      });
    },
  });
}

/**
 * Hook to update appointment template
 */
export function useUpdateAppointmentTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      updateData,
      userId,
    }: {
      templateId: string;
      updateData: UpdateAppointmentTemplateData;
      userId: string;
    }) => {
      return appointmentTemplatesService.updateAppointmentTemplate(
        templateId,
        updateData,
        userId,
      );
    },
    onSuccess: (updatedTemplate) => {
      // Update the specific template in cache
      queryClient.setQueryData(
        appointmentTemplateKeys.detail(updatedTemplate.id),
        updatedTemplate,
      );

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({
        queryKey: appointmentTemplateKeys.lists(),
      });

      toast.success("Template atualizado com sucesso!", {
        description: `Template "${updatedTemplate.name}" foi atualizado.`,
      });
    },
    onError: (error: Error) => {
      console.error("Error updating appointment template:", error);
      toast.error("Erro ao atualizar template", {
        description: error.message || "Ocorreu um erro inesperado.",
      });
    },
  });
}

/**
 * Hook to delete appointment template
 */
export function useDeleteAppointmentTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      return appointmentTemplatesService.deleteAppointmentTemplate(templateId);
    },
    onSuccess: (_, templateId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: appointmentTemplateKeys.detail(templateId),
      });

      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: appointmentTemplateKeys.lists(),
      });

      toast.success("Template removido com sucesso!");
    },
    onError: (error: Error) => {
      console.error("Error deleting appointment template:", error);
      toast.error("Erro ao remover template", {
        description: error.message || "Ocorreu um erro inesperado.",
      });
    },
  });
}

/**
 * Hook to get popular/recommended templates
 */
export function usePopularAppointmentTemplates(clinicId?: string) {
  return useAppointmentTemplates({ clinicId, isActive: true });
}

/**
 * Hook to search appointment templates
 */
export function useSearchAppointmentTemplates(
  searchQuery: string,
  clinicId?: string,
) {
  return useQuery({
    queryKey: [
      ...appointmentTemplateKeys.lists(),
      { search: searchQuery, clinicId },
    ],
    queryFn: () =>
      appointmentTemplatesService.getAppointmentTemplates({
        search: searchQuery,
        clinicId,
        isActive: true,
      }),
    enabled: searchQuery.length >= 2, // Only search with 2+ characters
    staleTime: 30 * 1000, // 30 seconds for search results
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get template categories with counts
 */
export function useAppointmentTemplateCategories(clinicId?: string) {
  const { data: templates } = useAppointmentTemplates({
    clinicId,
    isActive: true,
  });

  return {
    data: templates
      ? templates.reduce(
          (acc, template) => {
            const category = template.category;
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        )
      : undefined,
    isLoading: !templates,
  };
}
