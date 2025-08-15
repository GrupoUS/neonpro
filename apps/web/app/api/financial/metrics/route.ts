import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// Schema de validação para parâmetros da query
const MetricsQuerySchema = z.object({
  clinic_id: z.string().uuid(),
  time_range: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
});

interface FinancialMetrics {
  daily_revenue: number;
  monthly_revenue: number;
  annual_revenue: number;
  average_treatment_value: number;
  patient_acquisition_cost: number;
  lifetime_value: number;
  cash_conversion_cycle: number;
  profit_margin: number;
  break_even_point: number;
  growth_rate: number;
}

// Função para calcular métricas financeiras
async function calculateFinancialMetrics(
  supabase: any,
  clinicId: string,
  timeRange: string
): Promise<FinancialMetrics> {
  try {
    // Definir período baseado no time_range
    const now = new Date();
    let startDate: Date;
    let previousPeriodStart: Date;

    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(
          startDate.getTime() - 7 * 24 * 60 * 60 * 1000
        );
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(
          startDate.getTime() - 30 * 24 * 60 * 60 * 1000
        );
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(
          startDate.getTime() - 90 * 24 * 60 * 60 * 1000
        );
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(
          startDate.getTime() - 365 * 24 * 60 * 60 * 1000
        );
        break;
      default:
        throw new Error('Invalid time range');
    }

    // Buscar dados de cash flow para o período atual
    const { data: currentPeriodData, error: currentError } = await supabase
      .from('cash_flow_monitoring')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('date', startDate.toISOString())
      .lte('date', now.toISOString())
      .order('date', { ascending: true });

    if (currentError) {
      console.error('Error fetching current period data:', currentError);
      throw new Error('Failed to fetch current period financial data');
    }

    // Buscar dados do período anterior para comparação
    const { data: previousPeriodData, error: previousError } = await supabase
      .from('cash_flow_monitoring')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('date', previousPeriodStart.toISOString())
      .lt('date', startDate.toISOString())
      .order('date', { ascending: true });

    if (previousError) {
      console.error('Error fetching previous period data:', previousError);
      throw new Error('Failed to fetch previous period financial data');
    }

    // Buscar dados de pacientes para CAC e LTV
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select(`
        id,
        created_at,
        appointments (
          id,
          total_amount,
          status,
          created_at
        )
      `)
      .eq('clinic_id', clinicId)
      .gte('created_at', startDate.toISOString());

    if (patientError) {
      console.error('Error fetching patient data:', patientError);
      // Continue without patient metrics if this fails
    }

    // Calcular métricas básicas
    const totalInflow = currentPeriodData.reduce(
      (sum, record) => sum + (record.inflow || 0),
      0
    );
    const totalOutflow = Math.abs(
      currentPeriodData.reduce((sum, record) => sum + (record.outflow || 0), 0)
    );
    const netCashFlow = totalInflow - totalOutflow;

    const previousTotalInflow = previousPeriodData.reduce(
      (sum, record) => sum + (record.inflow || 0),
      0
    );

    // Calcular métricas por período
    const daysInPeriod =
      timeRange === '7d'
        ? 7
        : timeRange === '30d'
          ? 30
          : timeRange === '90d'
            ? 90
            : 365;
    const daily_revenue = totalInflow / daysInPeriod;
    const monthly_revenue =
      timeRange === '30d' ? totalInflow : (totalInflow / daysInPeriod) * 30;
    const annual_revenue = (totalInflow / daysInPeriod) * 365;

    // Calcular crescimento
    const growth_rate =
      previousTotalInflow > 0
        ? ((totalInflow - previousTotalInflow) / previousTotalInflow) * 100
        : 0;

    // Calcular margem de lucro
    const profit_margin =
      totalInflow > 0 ? (netCashFlow / totalInflow) * 100 : 0;

    // Métricas de pacientes (com fallbacks se não houver dados)
    let average_treatment_value = 0;
    let patient_acquisition_cost = 0;
    let lifetime_value = 0;

    if (patientData && patientData.length > 0) {
      const completedAppointments = patientData.flatMap(
        (patient) =>
          patient.appointments?.filter((apt) => apt.status === 'completed') ||
          []
      );

      if (completedAppointments.length > 0) {
        const totalTreatmentValue = completedAppointments.reduce(
          (sum, apt) => sum + (apt.total_amount || 0),
          0
        );
        average_treatment_value =
          totalTreatmentValue / completedAppointments.length;

        // CAC simplificado (custo de marketing / novos pacientes)
        const marketingCost = totalOutflow * 0.15; // Assume 15% do outflow é marketing
        patient_acquisition_cost =
          patientData.length > 0 ? marketingCost / patientData.length : 0;

        // LTV simplificado (valor médio * frequência estimada * tempo de vida)
        const averageVisitsPerPatient =
          completedAppointments.length / patientData.length;
        lifetime_value = average_treatment_value * averageVisitsPerPatient * 2; // 2 anos de vida média
      }
    }

    // Métricas operacionais
    const cash_conversion_cycle = 30; // Simplificado - dias médios para conversão
    const break_even_point =
      totalOutflow > 0 ? Math.ceil(totalOutflow / daily_revenue) : 0;

    const metrics: FinancialMetrics = {
      daily_revenue,
      monthly_revenue,
      annual_revenue,
      average_treatment_value,
      patient_acquisition_cost,
      lifetime_value,
      cash_conversion_cycle,
      profit_margin,
      break_even_point,
      growth_rate,
    };

    return metrics;
  } catch (error) {
    console.error('Error calculating financial metrics:', error);
    throw new Error('Failed to calculate financial metrics');
  }
}

// GET - Buscar métricas financeiras
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      clinic_id: searchParams.get('clinic_id'),
      time_range: searchParams.get('time_range') || '30d',
    };

    // Validar parâmetros
    const validatedParams = MetricsQuerySchema.parse(params);

    const supabase = createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar acesso à clínica
    const { data: clinicAccess, error: accessError } = await supabase
      .from('clinic_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('clinic_id', validatedParams.clinic_id)
      .single();

    if (accessError || !clinicAccess) {
      return NextResponse.json(
        { error: 'Access denied to clinic' },
        { status: 403 }
      );
    }

    // Calcular métricas
    const metrics = await calculateFinancialMetrics(
      supabase,
      validatedParams.clinic_id,
      validatedParams.time_range
    );

    return NextResponse.json({
      success: true,
      data: metrics,
      meta: {
        clinic_id: validatedParams.clinic_id,
        time_range: validatedParams.time_range,
        calculated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Financial metrics API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
