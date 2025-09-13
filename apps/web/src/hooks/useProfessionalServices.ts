/**
 * Professional Services Hooks
 * React Query hooks for managing professional-service relationships
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { professionalServicesService } from '@/services/professional-services.service';
import type {
  CreateProfessionalServiceRequest,
  UpdateProfessionalServiceRequest,
  BulkAssignServicesRequest,
  SetPrimaryProfessionalRequest,
  ProfessionalServiceFilters,
} from '@/types/professional-services';

// Query keys
export const professionalServicesKeys = {
  all: ['professional-services'] as const,
  lists: () => [...professionalServicesKeys.all, 'list'] as const,
  list: (filters: ProfessionalServiceFilters) => [...professionalServicesKeys.lists(), filters] as const,
  detailed: (clinicId: string) => [...professionalServicesKeys.all, 'detailed', clinicId] as const,
  servicesByProfessional: (professionalId: string) => [...professionalServicesKeys.all, 'by-professional', professionalId] as const,
  professionalsByService: (serviceId: string) => [...professionalServicesKeys.all, 'by-service', serviceId] as const,
  stats: (clinicId: string) => [...professionalServicesKeys.all, 'stats', clinicId] as const,
  canPerform: (professionalId: string, serviceId: string) => [...professionalServicesKeys.all, 'can-perform', professionalId, serviceId] as const,
  recommended: (serviceId: string) => [...professionalServicesKeys.all, 'recommended', serviceId] as const,
};

/**
 * Get professional-service relationships with optional filtering
 */
export function useProfessionalServices(filters: ProfessionalServiceFilters = {}) {
  return useQuery({
    queryKey: professionalServicesKeys.list(filters),
    queryFn: () => professionalServicesService.getProfessionalServices(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get detailed professional-service relationships for a clinic
 */
export function useProfessionalServicesDetailed(clinicId: string) {
  return useQuery({
    queryKey: professionalServicesKeys.detailed(clinicId),
    queryFn: () => professionalServicesService.getProfessionalServicesDetailed(clinicId),
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get services by professional
 */
export function useServicesByProfessional(professionalId: string) {
  return useQuery({
    queryKey: professionalServicesKeys.servicesByProfessional(professionalId),
    queryFn: () => professionalServicesService.getServicesByProfessional(professionalId),
    enabled: !!professionalId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get professionals by service
 */
export function useProfessionalsByService(serviceId: string) {
  return useQuery({
    queryKey: professionalServicesKeys.professionalsByService(serviceId),
    queryFn: () => professionalServicesService.getProfessionalsByService(serviceId),
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get professional-service statistics
 */
export function useProfessionalServiceStats(clinicId: string) {
  return useQuery({
    queryKey: professionalServicesKeys.stats(clinicId),
    queryFn: () => professionalServicesService.getProfessionalServiceStats(clinicId),
    enabled: !!clinicId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Check if professional can perform service
 */
export function useCanProfessionalPerformService(professionalId: string, serviceId: string) {
  return useQuery({
    queryKey: professionalServicesKeys.canPerform(professionalId, serviceId),
    queryFn: () => professionalServicesService.canProfessionalPerformService(professionalId, serviceId),
    enabled: !!professionalId && !!serviceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get recommended professional for service
 */
export function useRecommendedProfessionalForService(serviceId: string) {
  return useQuery({
    queryKey: professionalServicesKeys.recommended(serviceId),
    queryFn: () => professionalServicesService.getRecommendedProfessionalForService(serviceId),
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create professional-service relationship
 */
export function useCreateProfessionalService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateProfessionalServiceRequest) =>
      professionalServicesService.createProfessionalService(request),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: professionalServicesKeys.all });
      
      toast.success('Serviço atribuído ao profissional com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atribuir serviço: ${error.message}`);
    },
  });
}

/**
 * Update professional-service relationship
 */
export function useUpdateProfessionalService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateProfessionalServiceRequest) =>
      professionalServicesService.updateProfessionalService(request),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: professionalServicesKeys.all });
      
      toast.success('Atribuição de serviço atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar atribuição: ${error.message}`);
    },
  });
}

/**
 * Delete professional-service relationship
 */
export function useDeleteProfessionalService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => professionalServicesService.deleteProfessionalService(id),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: professionalServicesKeys.all });
      
      toast.success('Atribuição de serviço removida com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover atribuição: ${error.message}`);
    },
  });
}

/**
 * Bulk assign services to professional
 */
export function useBulkAssignServices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkAssignServicesRequest) =>
      professionalServicesService.bulkAssignServices(request),
    onSuccess: (count) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: professionalServicesKeys.all });
      
      toast.success(`${count} serviços atribuídos com sucesso!`);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atribuir serviços: ${error.message}`);
    },
  });
}

/**
 * Set primary professional for service
 */
export function useSetPrimaryProfessional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SetPrimaryProfessionalRequest) =>
      professionalServicesService.setPrimaryProfessional(request),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: professionalServicesKeys.all });
      
      toast.success('Profissional principal definido com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao definir profissional principal: ${error.message}`);
    },
  });
}

/**
 * Toggle professional-service assignment
 */
export function useToggleProfessionalService() {
  const createMutation = useCreateProfessionalService();
  const deleteMutation = useDeleteProfessionalService();

  return useMutation({
    mutationFn: async ({ 
      isAssigned, 
      professionalServiceId, 
      createRequest 
    }: {
      isAssigned: boolean;
      professionalServiceId?: string;
      createRequest?: CreateProfessionalServiceRequest;
    }) => {
      if (isAssigned && professionalServiceId) {
        // Remove assignment
        await deleteMutation.mutateAsync(professionalServiceId);
        return { action: 'removed' };
      } else if (!isAssigned && createRequest) {
        // Add assignment
        await createMutation.mutateAsync(createRequest);
        return { action: 'added' };
      }
      throw new Error('Invalid toggle operation');
    },
    onSuccess: (result) => {
      const message = result.action === 'added' 
        ? 'Serviço atribuído com sucesso!' 
        : 'Atribuição removida com sucesso!';
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(`Erro na operação: ${error.message}`);
    },
  });
}
