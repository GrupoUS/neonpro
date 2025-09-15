import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type PatientStats = {
  totalPatients: number;
  activePatients: number;
  newThisMonth: number;
  upcomingAppointments: number;
};

async function countPatients(clinicId: string, filters?: { isActive?: boolean; createdFrom?: string }) {
  let query = supabase
    .from('patients')
    .select('id', { count: 'exact', head: true })
    .eq('clinic_id', clinicId);

  if (filters?.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }
  if (filters?.createdFrom) {
    query = query.gte('created_at', filters.createdFrom);
  }

  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count || 0;
}

async function countUpcomingAppointments(clinicId: string, fromISO: string, toISO: string) {
  const { count, error } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .gte('start_time', fromISO)
    .lte('start_time', toISO);
  if (error) throw new Error(error.message);
  return count || 0;
}

export function usePatientStats(clinicId: string) {
  return useQuery<PatientStats, Error>({
    queryKey: ['patients-stats', clinicId],
    enabled: !!clinicId,
    staleTime: 30_000,
    gcTime: 120_000,
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const [totalPatients, activePatients, newThisMonth, upcomingAppointments] = await Promise.all([
        countPatients(clinicId),
        countPatients(clinicId, { isActive: true }),
        countPatients(clinicId, { createdFrom: startOfMonth.toISOString() }),
        countUpcomingAppointments(clinicId, now.toISOString(), inSevenDays.toISOString()),
      ]);

      return { totalPatients, activePatients, newThisMonth, upcomingAppointments };
    },
  });
}
