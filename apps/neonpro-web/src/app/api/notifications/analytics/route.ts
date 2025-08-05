/**
 * API Endpoint: Notification Analytics
 * 
 * Endpoint para métricas, relatórios e insights de notificações
 * 
 * @route GET /api/notifications/analytics
 * @author APEX Architecture Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { notificationAnalytics } from '@/lib/notifications/analytics/notification-analytics';

// ================================================================================
// VALIDATION SCHEMAS
// ================================================================================

const AnalyticsQuerySchema = z.object({
  metric: z.enum(['overview', 'performance', 'engagement', 'channels', 'trends']).default('overview'),
  period: z.enum(['hour', 'day', 'week', 'month', 'quarter', 'year']).default('week'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  groupBy: z.enum(['type', 'channel', 'status', 'user']).optional(),
  filters: z.object({
    type: z.string().optional(),
    channel: z.string().optional(),
    status: z.string().optional(),
    userId: z.string().uuid().optional(),
  }).optional(),
});

// ================================================================================
// HELPER FUNCTIONS
// ================================================================================

async function validateAuth(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return { error: 'Não autenticado', status: 401 };
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Usuário inválido', status: 401 };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id, role, permissions')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return { error: 'Perfil não encontrado', status: 404 };
  }

  // Verificar permissões de analytics
  const canViewAnalytics = profile.permissions?.includes('view_analytics') || 
                          ['admin', 'manager'].includes(profile.role);

  if (!canViewAnalytics) {
    return { error: 'Sem permissão para visualizar analytics', status: 403 };
  }

  return { user, profile, supabase };
}

/**
 * Calcula período baseado em parâmetros
 */
function calculatePeriod(period: string, dateFrom?: string, dateTo?: string) {
  const now = new Date();
  let from: Date;
  const to: Date = dateTo ? new Date(dateTo) : now;

  if (dateFrom) {
    from = new Date(dateFrom);
  } else {
    switch (period) {
      case 'hour':
        from = new Date(now.getTime() - (60 * 60 * 1000)); // 1 hora
        break;
      case 'day':
        from = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 1 dia
        break;
      case 'week':
        from = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // 1 semana
        break;
      case 'month':
        from = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 dias
        break;
      case 'quarter':
        from = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000)); // 90 dias
        break;
      case 'year':
        from = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000)); // 365 dias
        break;
      default:
        from = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    }
  }

  return { from, to };
}

// ================================================================================
// API HANDLERS
// ================================================================================

/**
 * GET /api/notifications/analytics
 * Retorna métricas e relatórios de notificações
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { profile } = authResult;
    const { searchParams } = new URL(request.url);
    
    // Validar parâmetros
    const queryParams = {
      metric: searchParams.get('metric') || 'overview',
      period: searchParams.get('period') || 'week',
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      groupBy: searchParams.get('groupBy') || undefined,
      filters: {
        type: searchParams.get('filterType') || undefined,
        channel: searchParams.get('filterChannel') || undefined,
        status: searchParams.get('filterStatus') || undefined,
        userId: searchParams.get('filterUserId') || undefined,
      },
    };

    const validationResult = AnalyticsQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const query = validationResult.data;
    const { from, to } = calculatePeriod(query.period, query.dateFrom, query.dateTo);

    // Buscar métricas baseadas no tipo solicitado
    let analyticsData;

    switch (query.metric) {
      case 'overview':
        analyticsData = await notificationAnalytics.getOverviewMetrics(
          profile.clinic_id,
          from,
          to
        );
        break;

      case 'performance':
        analyticsData = await notificationAnalytics.getPerformanceMetrics(
          profile.clinic_id,
          from,
          to,
          query.filters
        );
        break;

      case 'engagement':
        analyticsData = await notificationAnalytics.getEngagementMetrics(
          profile.clinic_id,
          from,
          to,
          query.filters
        );
        break;

      case 'channels':
        analyticsData = await notificationAnalytics.getChannelAnalytics(
          profile.clinic_id,
          from,
          to
        );
        break;

      case 'trends':
        analyticsData = await notificationAnalytics.getTrendAnalysis(
          profile.clinic_id,
          from,
          to,
          query.groupBy || 'type'
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Tipo de métrica não suportado' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      metric: query.metric,
      period: {
        from: from.toISOString(),
        to: to.toISOString(),
        duration: query.period,
      },
      filters: query.filters,
      data: analyticsData,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Erro nas analytics de notificações:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
