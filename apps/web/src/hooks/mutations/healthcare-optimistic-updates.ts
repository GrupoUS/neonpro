import type { QueryClient } from '@tanstack/react-query';

export const _healthcareOptimisticUpdates = {
  patient: {
    async updateMedicalRecord(
      queryClient: QueryClient,
      patientId: string,
      record: any,
    ) {
      const key = ['patients', patientId, 'medical-records'] as const;
      const prev = queryClient.getQueryData(key);
      queryClient.setQueryData(_key, (current: any[] = []) => {
        const idx = current.findIndex(r => r?.id === record.id);
        if (idx >= 0) {
          const copy = current.slice();
          copy[idx] = { ...current[idx], ...record };
          return copy;
        }
        return [...current, record];
      });
      return { rollback: () => queryClient.setQueryData(key, prev), record };
    },
    async delete(queryClient: QueryClient, patientId: string) {
      const key = ['patients', 'detail', patientId] as const;
      const prev = queryClient.getQueryData(key);
      queryClient.removeQueries({ queryKey: key });
      return { rollback: () => queryClient.setQueryData(key, prev) };
    },
  },
  appointment: {
    async update(queryClient: QueryClient, appointmentId: string, update: any) {
      const key = ['appointments', 'detail', appointmentId] as const;
      const prev = queryClient.getQueryData(key) as any;
      const next = { ...prev, ...update };
      queryClient.setQueryData(key, next);
      return {
        rollback: () => queryClient.setQueryData(key, prev),
        update: next,
      };
    },
  },
} as const;
