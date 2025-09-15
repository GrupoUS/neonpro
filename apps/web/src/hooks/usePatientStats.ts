import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export type PatientStats = {
  totalPatients: number;
  activePatients: number;
  newThisMonth: number;
  upcomingAppointments: number;
};

async function countPatients(
  clinicId: string,
  filters?: { isActive?: boolean; createdFrom?: string },
) {
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

export function usePatientStats(clinicId?: string) {
  return useQuery({
    queryKey: ['patient-stats', clinicId],
    queryFn: async () => {
      // Since the RPC function is not available, we perform the queries separately
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      const [patientsResult, newPatientsResult, appointmentsResult, revenueResult] = await Promise
        .all([
          supabase
            .from('patients')
            .select('id, is_active'),
          supabase
            .from('patients')
            .select('id')
            .gte('created_at', firstDayOfMonth.toISOString()),
          supabase
            .from('appointments')
            .select('id')
            .gte('start_time', tomorrow.toISOString().split('T')[0] + 'T00:00:00Z'),
          supabase
            .from('financial_transactions')
            .select('amount')
            .gte('transaction_date', today.toISOString().split('T')[0] + 'T00:00:00Z')
            .lt('transaction_date', tomorrow.toISOString().split('T')[0] + 'T00:00:00Z'),
        ]);

      if (patientsResult.error) throw patientsResult.error;
      if (newPatientsResult.error) throw newPatientsResult.error;
      if (appointmentsResult.error) throw appointmentsResult.error;
      if (revenueResult.error) throw revenueResult.error;

      const totalPatients = patientsResult.data?.length || 0;
      const activePatients = patientsResult.data?.filter(p => p.is_active)?.length || 0;
      const newThisMonth = newPatientsResult.data?.length || 0;
      const upcomingAppointments = appointmentsResult.data?.length || 0;
      const revenueToday = revenueResult.data?.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
        || 0;

      return {
        totalPatients,
        activePatients,
        newThisMonth,
        upcomingAppointments,
        appointmentsToday: 0, // Legacy, incluir para compatibilidade
        revenueToday,
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider stale after 2 minutes
  });
}
