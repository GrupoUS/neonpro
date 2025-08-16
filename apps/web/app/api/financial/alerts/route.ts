import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// Schema de validação
const AlertsQuerySchema = z.object({
  clinic_id: z.string().uuid(),
  include_resolved: z.boolean().default(false),
});

type Alert = {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
  metadata?: Record<string, any>;
};

// Função para gerar alertas baseados em métricas financeiras
async function generateFinancialAlerts(
  supabase: any,
  clinicId: string
): Promise<Alert[]> {
  const alerts: Alert[] = [];

  try {
    // Buscar dados recentes de cash flow
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const { data: recentCashFlow, error } = await supabase
      .from('cash_flow_monitoring')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('date', thirtyDaysAgo.toISOString())
      .order('date', { ascending: false })
      .limit(30);

    if (error) {
      return alerts;
    }

    if (!recentCashFlow || recentCashFlow.length === 0) {
      alerts.push({
        id: `no-data-${Date.now()}`,
        type: 'warning',
        message:
          'Nenhum dado financeiro encontrado nos últimos 30 dias. Verifique a integração de pagamentos.',
        timestamp: new Date().toISOString(),
        resolved: false,
        metadata: { reason: 'no_financial_data' },
      });
      return alerts;
    }

    // Alert 1: Saldo baixo
    const latestBalance = recentCashFlow[0]?.running_balance || 0;
    if (latestBalance < 5000) {
      alerts.push({
        id: `low-balance-${Date.now()}`,
        type: latestBalance < 1000 ? 'critical' : 'warning',
        message: `Saldo baixo detectado: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(latestBalance)}. Monitore o fluxo de caixa atentamente.`,
        timestamp: new Date().toISOString(),
        resolved: false,
        metadata: { balance: latestBalance, threshold: 5000 },
      });
    }

    // Alert 2: Fluxo negativo consecutivo
    const negativeFlowDays = recentCashFlow
      .slice(0, 7)
      .filter((record) => record.net_cash_flow < 0).length;

    if (negativeFlowDays >= 5) {
      alerts.push({
        id: `negative-flow-${Date.now()}`,
        type: 'critical',
        message: `Fluxo de caixa negativo por ${negativeFlowDays} dias consecutivos. Ação imediata necessária.`,
        timestamp: new Date().toISOString(),
        resolved: false,
        metadata: { negative_days: negativeFlowDays },
      });
    } else if (negativeFlowDays >= 3) {
      alerts.push({
        id: `negative-trend-${Date.now()}`,
        type: 'warning',
        message: `Tendência de fluxo negativo detectada (${negativeFlowDays} dias). Monitore despesas e receitas.`,
        timestamp: new Date().toISOString(),
        resolved: false,
        metadata: { negative_days: negativeFlowDays },
      });
    }

    // Alert 3: Queda significativa na receita
    if (recentCashFlow.length >= 14) {
      const lastWeekInflow = recentCashFlow
        .slice(0, 7)
        .reduce((sum, record) => sum + (record.inflow || 0), 0);

      const previousWeekInflow = recentCashFlow
        .slice(7, 14)
        .reduce((sum, record) => sum + (record.inflow || 0), 0);

      if (previousWeekInflow > 0) {
        const revenueChange =
          ((lastWeekInflow - previousWeekInflow) / previousWeekInflow) * 100;

        if (revenueChange <= -30) {
          alerts.push({
            id: `revenue-drop-${Date.now()}`,
            type: 'critical',
            message: `Queda significativa na receita: ${Math.abs(revenueChange).toFixed(1)}% vs. semana anterior. Investigue possíveis causas.`,
            timestamp: new Date().toISOString(),
            resolved: false,
            metadata: {
              revenue_change: revenueChange,
              current_week: lastWeekInflow,
              previous_week: previousWeekInflow,
            },
          });
        } else if (revenueChange <= -15) {
          alerts.push({
            id: `revenue-decline-${Date.now()}`,
            type: 'warning',
            message: `Declínio na receita detectado: ${Math.abs(revenueChange).toFixed(1)}% vs. semana anterior.`,
            timestamp: new Date().toISOString(),
            resolved: false,
            metadata: {
              revenue_change: revenueChange,
              current_week: lastWeekInflow,
              previous_week: previousWeekInflow,
            },
          });
        }
      }
    }

    // Alert 4: Precisão das predições baixa
    const recordsWithPredictions = recentCashFlow.filter(
      (record) =>
        record.prediction_accuracy !== null &&
        record.prediction_accuracy !== undefined
    );

    if (recordsWithPredictions.length >= 7) {
      const averagePredictionAccuracy =
        recordsWithPredictions.reduce(
          (sum, record) => sum + (record.prediction_accuracy || 0),
          0
        ) / recordsWithPredictions.length;

      if (averagePredictionAccuracy < 0.7) {
        alerts.push({
          id: `low-prediction-accuracy-${Date.now()}`,
          type: 'warning',
          message: `Precisão das predições financeiras baixa: ${(averagePredictionAccuracy * 100).toFixed(1)}%. Considere revisar os modelos.`,
          timestamp: new Date().toISOString(),
          resolved: false,
          metadata: { accuracy: averagePredictionAccuracy },
        });
      }
    }

    // Alert 5: Gastos altos detectados
    const highOutflowDays = recentCashFlow
      .slice(0, 7)
      .filter((record) => Math.abs(record.outflow || 0) > 3000).length;

    if (highOutflowDays >= 3) {
      alerts.push({
        id: `high-expenses-${Date.now()}`,
        type: 'warning',
        message: `Gastos elevados detectados em ${highOutflowDays} dias na última semana. Revise as despesas.`,
        timestamp: new Date().toISOString(),
        resolved: false,
        metadata: { high_outflow_days: highOutflowDays },
      });
    }

    // Alert 6: Crescimento positivo (informativo)
    if (recentCashFlow.length >= 14) {
      const lastWeekInflow = recentCashFlow
        .slice(0, 7)
        .reduce((sum, record) => sum + (record.inflow || 0), 0);

      const previousWeekInflow = recentCashFlow
        .slice(7, 14)
        .reduce((sum, record) => sum + (record.inflow || 0), 0);

      if (previousWeekInflow > 0) {
        const revenueChange =
          ((lastWeekInflow - previousWeekInflow) / previousWeekInflow) * 100;

        if (revenueChange >= 20) {
          alerts.push({
            id: `revenue-growth-${Date.now()}`,
            type: 'info',
            message: `Excelente crescimento na receita: ${revenueChange.toFixed(1)}% vs. semana anterior! 🎉`,
            timestamp: new Date().toISOString(),
            resolved: false,
            metadata: {
              revenue_change: revenueChange,
              current_week: lastWeekInflow,
              previous_week: previousWeekInflow,
            },
          });
        }
      }
    }
  } catch (_error) {
    alerts.push({
      id: `system-error-${Date.now()}`,
      type: 'warning',
      message:
        'Erro ao gerar alertas financeiros. Entre em contato com o suporte se o problema persistir.',
      timestamp: new Date().toISOString(),
      resolved: false,
      metadata: { error: 'system_error' },
    });
  }

  return alerts;
}

// GET - Buscar alertas financeiros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      clinic_id: searchParams.get('clinic_id'),
      include_resolved: searchParams.get('include_resolved') === 'true',
    };

    // Validar parâmetros
    const validatedParams = AlertsQuerySchema.parse(params);

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

    // Gerar alertas baseados em dados atuais
    const alerts = await generateFinancialAlerts(
      supabase,
      validatedParams.clinic_id
    );

    // Filtrar alertas resolvidos se necessário
    const filteredAlerts = validatedParams.include_resolved
      ? alerts
      : alerts.filter((alert) => !alert.resolved);

    return NextResponse.json({
      success: true,
      data: filteredAlerts,
      meta: {
        clinic_id: validatedParams.clinic_id,
        total_alerts: filteredAlerts.length,
        critical_alerts: filteredAlerts.filter((a) => a.type === 'critical')
          .length,
        warning_alerts: filteredAlerts.filter((a) => a.type === 'warning')
          .length,
        info_alerts: filteredAlerts.filter((a) => a.type === 'info').length,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
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

// POST - Marcar alerta como resolvido (futura implementação)
export async function POST(_request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'Alert resolution feature coming soon',
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
