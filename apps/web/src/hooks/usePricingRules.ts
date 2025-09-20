/**
 * Pricing Rules Hooks
 * React Query hooks for dynamic pricing engine
 */

import { pricingRulesService } from "@/services/pricing-rules.service";
import type {
  CreatePricingRuleRequest,
  PricingRuleFilters,
  UpdatePricingRuleRequest,
} from "@/types/pricing-rules";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query Keys
export const pricingRuleKeys = {
  all: ["pricingRules"] as const,
  lists: () => [...pricingRuleKeys.all, "list"] as const,
  list: (clinicId: string, filters?: PricingRuleFilters) =>
    [...pricingRuleKeys.lists(), clinicId, filters] as const,
  details: () => [...pricingRuleKeys.all, "detail"] as const,
  detail: (id: string) => [...pricingRuleKeys.details(), id] as const,
  calculations: () => [...pricingRuleKeys.all, "calculation"] as const,
  calculation: (clinicId: string, serviceId: string, context: any) =>
    [...pricingRuleKeys.calculations(), clinicId, serviceId, context] as const,
  stats: (clinicId: string) =>
    [...pricingRuleKeys.all, "stats", clinicId] as const,
};

/**
 * Hook to get all pricing rules for a clinic
 */
export function usePricingRules(
  clinicId: string,
  filters?: PricingRuleFilters,
) {
  return useQuery({
    queryKey: pricingRuleKeys.list(clinicId, filters),
    queryFn: () => pricingRulesService.getPricingRules(clinicId, filters),
    enabled: !!clinicId,
  });
}

/**
 * Hook to get a specific pricing rule
 */
export function usePricingRule(id: string) {
  return useQuery({
    queryKey: pricingRuleKeys.detail(id),
    queryFn: () => pricingRulesService.getPricingRule(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new pricing rule
 */
export function useCreatePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clinicId,
      request,
    }: {
      clinicId: string;
      request: CreatePricingRuleRequest;
    }) => pricingRulesService.createPricingRule(clinicId, request),

    onSuccess: (data) => {
      // Invalidate and refetch pricing rules list
      queryClient.invalidateQueries({
        queryKey: pricingRuleKeys.lists(),
      });

      // Add the new rule to the cache
      queryClient.setQueryData(pricingRuleKeys.detail(data.id), data);

      toast.success("Regra de preço criada com sucesso!");
    },

    onError: (error: Error) => {
      console.error("Error creating pricing rule:", error);
      toast.error(`Erro ao criar regra de preço: ${error.message}`);
    },
  });
}

/**
 * Hook to update a pricing rule
 */
export function useUpdatePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: UpdatePricingRuleRequest;
    }) => pricingRulesService.updatePricingRule(id, request),

    onSuccess: (data) => {
      // Update the specific rule in cache
      queryClient.setQueryData(pricingRuleKeys.detail(data.id), data);

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({
        queryKey: pricingRuleKeys.lists(),
      });

      toast.success("Regra de preço atualizada com sucesso!");
    },

    onError: (error: Error) => {
      console.error("Error updating pricing rule:", error);
      toast.error(`Erro ao atualizar regra de preço: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a pricing rule
 */
export function useDeletePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pricingRulesService.deletePricingRule(id),

    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: pricingRuleKeys.detail(id),
      });

      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: pricingRuleKeys.lists(),
      });

      toast.success("Regra de preço excluída com sucesso!");
    },

    onError: (error: Error) => {
      console.error("Error deleting pricing rule:", error);
      toast.error(`Erro ao excluir regra de preço: ${error.message}`);
    },
  });
}

/**
 * Hook to toggle pricing rule active status
 */
export function useTogglePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      pricingRulesService.togglePricingRule(id, isActive),

    onSuccess: (data) => {
      // Update the specific rule in cache
      queryClient.setQueryData(pricingRuleKeys.detail(data.id), data);

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({
        queryKey: pricingRuleKeys.lists(),
      });

      const status = data.is_active ? "ativada" : "desativada";
      toast.success(`Regra de preço ${status} com sucesso!`);
    },

    onError: (error: Error) => {
      console.error("Error toggling pricing rule:", error);
      toast.error(`Erro ao alterar status da regra: ${error.message}`);
    },
  });
}

/**
 * Hook to calculate service pricing with rules
 */
export function useServicePricingCalculation(
  clinicId: string,
  serviceId: string,
  context: {
    professional_id?: string;
    appointment_date?: Date;
    client_id?: string;
    is_first_time_client?: boolean;
  },
) {
  return useQuery({
    queryKey: pricingRuleKeys.calculation(clinicId, serviceId, context),
    queryFn: () =>
      pricingRulesService.calculateServicePricing(clinicId, serviceId, context),
    enabled: !!clinicId && !!serviceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get pricing rules for a specific service
 */
export function useServicePricingRules(clinicId: string, serviceId: string) {
  return useQuery({
    queryKey: [...pricingRuleKeys.lists(), "service", serviceId],
    queryFn: () =>
      pricingRulesService.getServicePricingRules(clinicId, serviceId),
    enabled: !!clinicId && !!serviceId,
  });
}

/**
 * Hook to get pricing rules for a specific professional
 */
export function useProfessionalPricingRules(
  clinicId: string,
  professionalId: string,
) {
  return useQuery({
    queryKey: [...pricingRuleKeys.lists(), "professional", professionalId],
    queryFn: () =>
      pricingRulesService.getProfessionalPricingRules(clinicId, professionalId),
    enabled: !!clinicId && !!professionalId,
  });
}

/**
 * Hook to update pricing rule priorities
 */
export function useUpdatePricingRulePriorities() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: { id: string; priority: number }[]) =>
      pricingRulesService.updatePricingRulePriorities(updates),

    onSuccess: () => {
      // Invalidate all pricing rule lists to refresh priorities
      queryClient.invalidateQueries({
        queryKey: pricingRuleKeys.lists(),
      });

      toast.success("Prioridades das regras atualizadas com sucesso!");
    },

    onError: (error: Error) => {
      console.error("Error updating pricing rule priorities:", error);
      toast.error(`Erro ao atualizar prioridades: ${error.message}`);
    },
  });
}

/**
 * Hook to get pricing statistics
 */
export function usePricingStats(clinicId: string) {
  return useQuery({
    queryKey: pricingRuleKeys.stats(clinicId),
    queryFn: () => pricingRulesService.getPricingStats(clinicId),
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
