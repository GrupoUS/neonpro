'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';

type DashboardMetrics = {
  totalPatients: number;
  activePatients: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  upcomingAppointments: number;
  appointmentsGrowth: number;
  activeStaffMembers: number;
  loading: boolean;
  error: Error | null;
};

export function useDashboardMetrics(): DashboardMetrics {
  const [metrics, setMetrics] = useState<
    Omit<DashboardMetrics, 'loading' | 'error'>
  >({
    totalPatients: 0,
    activePatients: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    upcomingAppointments: 0,
    appointmentsGrowth: 0,
    activeStaffMembers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchDashboardMetrics() {
      try {
        setLoading(true);
        setError(null);

        // Buscar métricas em paralelo
        const [
          patientsResult,
          activePatientsResult,
          monthlyRevenueResult,
          previousMonthRevenueResult,
          upcomingAppointmentsResult,
          previousMonthAppointmentsResult,
          activeStaffResult,
        ] = await Promise.all([
          // Total de pacientes
          supabase
            .from('patients')
            .select('id', { count: 'exact', head: true }),

          // Pacientes ativos (com consulta nos últimos 3 meses)
          supabase
            .from('patients')
            .select('id', { count: 'exact', head: true })
            .gte(
              'updated_at',
              new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
            ),

          // Receita do mês atual
          supabase
            .from('financial_transactions')
            .select('amount')
            .eq('type', 'income')
            .gte(
              'date',
              new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1
              ).toISOString()
            ),

          // Receita do mês anterior (para calcular crescimento)
          supabase
            .from('financial_transactions')
            .select('amount')
            .eq('type', 'income')
            .gte(
              'date',
              new Date(
                new Date().getFullYear(),
                new Date().getMonth() - 1,
                1
              ).toISOString()
            )
            .lt(
              'date',
              new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1
              ).toISOString()
            ),

          // Consultas agendadas (próximos 30 dias)
          supabase
            .from('appointments')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'scheduled')
            .gte('appointment_date', new Date().toISOString())
            .lte(
              'appointment_date',
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            ),

          // Consultas do mês anterior (para calcular crescimento)
          supabase
            .from('appointments')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'completed')
            .gte(
              'appointment_date',
              new Date(
                new Date().getFullYear(),
                new Date().getMonth() - 1,
                1
              ).toISOString()
            )
            .lt(
              'appointment_date',
              new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1
              ).toISOString()
            ),

          // Staff ativo
          supabase
            .from('staff_members')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'active'),
        ]);

        // Processar resultados
        const totalPatients = patientsResult.count || 0;
        const activePatients = activePatientsResult.count || 0;

        const monthlyRevenue =
          monthlyRevenueResult.data?.reduce(
            (sum, transaction) => sum + (transaction.amount || 0),
            0
          ) || 0;

        const previousMonthRevenue =
          previousMonthRevenueResult.data?.reduce(
            (sum, transaction) => sum + (transaction.amount || 0),
            0
          ) || 0;

        const revenueGrowth =
          previousMonthRevenue > 0
            ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) *
              100
            : 0;

        const upcomingAppointments = upcomingAppointmentsResult.count || 0;
        const previousMonthAppointments =
          previousMonthAppointmentsResult.count || 0;

        const appointmentsGrowth =
          previousMonthAppointments > 0
            ? ((upcomingAppointments - previousMonthAppointments) /
                previousMonthAppointments) *
              100
            : 0;

        const activeStaffMembers = activeStaffResult.count || 0;

        setMetrics({
          totalPatients,
          activePatients,
          monthlyRevenue,
          revenueGrowth,
          upcomingAppointments,
          appointmentsGrowth,
          activeStaffMembers,
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardMetrics();
  }, [supabase]);

  return {
    ...metrics,
    loading,
    error,
  };
}
