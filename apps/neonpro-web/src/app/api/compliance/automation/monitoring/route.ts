import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers';
import { z } from 'zod';

// Schema para filtros de monitoramento
const MonitoringFiltersSchema = z.object({
  timeRange: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
  eventTypes: z.array(z.string()).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  includeMetrics: z.boolean().default(true),
  includeAlerts: z.boolean().default(true)
});

// GET - Obter dados de monitoramento em tempo real
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticaï¿½ï¿½o
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filters = MonitoringFiltersSchema.parse({
      timeRange: searchParams.get('timeRange') || '24h',
      eventTypes: searchParams.get('eventTypes')?.split(','),
      severity: searchParams.get('severity'),
      includeMetrics: searchParams.get('includeMetrics') !== 'false',
      includeAlerts: searchParams.get('includeAlerts') !== 'false'
    });

    const clinicId = session.user.user_metadata.clinic_id;
    const now = new Date();
    const timeRangeMap = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30
    };
    
    const hoursBack = timeRangeMap[filters.timeRange];
    const startTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

    const monitoringData: any = {
      timestamp: now.toISOString(),
      timeRange: filters.timeRange
    };
    // Obter mï¿½tricas de conformidade se solicitado
    if (filters.includeMetrics) {
      // Mï¿½tricas de consentimento
      const { data: consentMetrics } = await supabase
        .from('lgpd_consent')
        .select('status, created_at')
        .eq('clinic_id', clinicId)
        .gte('created_at', startTime.toISOString());

      // Mï¿½tricas de auditoria
      const { data: auditMetrics } = await supabase
        .from('lgpd_audit_trail')
        .select('event_type, severity, created_at')
        .eq('clinic_id', clinicId)
        .gte('created_at', startTime.toISOString());

      // Mï¿½tricas de solicitaï¿½ï¿½es de direitos
      const { data: requestMetrics } = await supabase
        .from('lgpd_data_subject_requests')
        .select('request_type, status, created_at')
        .eq('clinic_id', clinicId)
        .gte('created_at', startTime.toISOString());

      monitoringData.metrics = {
        consent: {
          total: consentMetrics?.length || 0,
          active: consentMetrics?.filter(c => c.status === 'granted').length || 0,
          revoked: consentMetrics?.filter(c => c.status === 'revoked').length || 0,
          expired: consentMetrics?.filter(c => c.status === 'expired').length || 0
        },
        audit: {
          total: auditMetrics?.length || 0,
          byType: auditMetrics?.reduce((acc, event) => {
            acc[event.event_type] = (acc[event.event_type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {},
          bySeverity: auditMetrics?.reduce((acc, event) => {
            acc[event.severity] = (acc[event.severity] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {}
        },
        dataSubjectRequests: {
          total: requestMetrics?.length || 0,
          byType: requestMetrics?.reduce((acc, req) => {
            acc[req.request_type] = (acc[req.request_type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {},
          byStatus: requestMetrics?.reduce((acc, req) => {
            acc[req.status] = (acc[req.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {}
        }
      };
    }
    // Obter alertas se solicitado
    if (filters.includeAlerts) {
      let alertsQuery = supabase
        .from('lgpd_compliance_alerts')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('created_at', startTime.toISOString())
        .order('created_at', { ascending: false });

      if (filters.severity) {
        alertsQuery = alertsQuery.eq('severity', filters.severity);
      }

      const { data: alerts } = await alertsQuery.limit(50);

      monitoringData.alerts = {
        total: alerts?.length || 0,
        active: alerts?.filter(a => a.status === 'active').length || 0,
        resolved: alerts?.filter(a => a.status === 'resolved').length || 0,
        bySeverity: alerts?.reduce((acc, alert) => {
          acc[alert.severity] = (acc[alert.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {},
        recent: alerts?.slice(0, 10) || []
      };
    }

    // Calcular pontuaï¿½ï¿½o de conformidade em tempo real
    const complianceScore = await calculateComplianceScore(supabase, clinicId);
    monitoringData.complianceScore = complianceScore;

    return NextResponse.json({
      success: true,
      data: monitoringData
    });
    
  } catch (error) {
    console.error('Erro ao obter dados de monitoramento:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
// Funï¿½ï¿½o auxiliar para calcular pontuaï¿½ï¿½o de conformidade
async function calculateComplianceScore(supabase: any, clinicId: string): Promise<number> {
  try {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Verificar consentimentos ativos
    const { data: consents } = await supabase
      .from('lgpd_consent')
      .select('status')
      .eq('clinic_id', clinicId);

    const activeConsents = consents?.filter(c => c.status === 'granted').length || 0;
    const totalConsents = consents?.length || 1;
    const consentScore = (activeConsents / totalConsents) * 30;

    // Verificar cobertura de auditoria
    const { data: auditEvents } = await supabase
      .from('lgpd_audit_trail')
      .select('event_type')
      .eq('clinic_id', clinicId)
      .gte('created_at', last30Days.toISOString());

    const uniqueEventTypes = new Set(auditEvents?.map(e => e.event_type) || []).size;
    const auditScore = Math.min((uniqueEventTypes / 6) * 25, 25); // 6 tipos de eventos esperados

    // Verificar alertas crï¿½ticos
    const { data: criticalAlerts } = await supabase
      .from('lgpd_compliance_alerts')
      .select('id')
      .eq('clinic_id', clinicId)
      .eq('severity', 'critical')
      .eq('status', 'active');

    const alertPenalty = (criticalAlerts?.length || 0) * 5;

    // Verificar processamento de solicitaï¿½ï¿½es
    const { data: requests } = await supabase
      .from('lgpd_data_subject_requests')
      .select('status, created_at')
      .eq('clinic_id', clinicId)
      .gte('created_at', last30Days.toISOString());

    const processedRequests = requests?.filter(r => r.status === 'completed').length || 0;
    const totalRequests = requests?.length || 1;
    const requestScore = (processedRequests / totalRequests) * 20;

    // Verificar dados criptografados
    const encryptionScore = 25; // Assumindo que a criptografia estï¿½ implementada

    const finalScore = Math.max(0, Math.min(100, 
      consentScore + auditScore + requestScore + encryptionScore - alertPenalty
    ));

    return Math.round(finalScore * 100) / 100;
  } catch (error) {
    console.error('Erro ao calcular pontuaï¿½ï¿½o de conformidade:', error);
    return 0;
  }
}

