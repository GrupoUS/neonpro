import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '../utils/trpc';

export const useAppointments = (clinicId: string) => {
  return useQuery({
    queryKey: ['appointments', clinicId],
    queryFn: () => trpc.appointments.list.query({ clinicId }),
    enabled: !!clinicId,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: trpc.appointments.create.mutate,
    onSuccess: (data, variables) => {
      // Invalidate and refetch appointments list
      queryClient.invalidateQueries({ 
        queryKey: ['appointments', variables.clinic_id] 
      });
      
      // Optimistically update the cache
      queryClient.setQueryData(['appointments', variables.clinic_id], (old: any[]) => 
        old ? [...old, data] : [data]
      );
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: trpc.appointments.update.mutate,
    onSuccess: (data, variables) => {
      // Update specific appointment in cache
      queryClient.setQueryData(['appointments'], (old: any[]) => 
        old ? old.map(item => item.id === data.id ? data : item) : [data]
      );
    },
  });
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: trpc.appointments.delete.mutate,
    onSuccess: (_, variables) => {
      // Remove appointment from cache
      queryClient.setQueryData(['appointments'], (old: any[]) => 
        old ? old.filter(item => item.id !== variables.id) : []
      );
    },
  });
};