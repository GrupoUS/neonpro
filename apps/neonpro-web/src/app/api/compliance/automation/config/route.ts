import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers';
import { z } from 'zod';

// Schema de validação para configuração de automação
const AutomationConfigSchema = z.object({
  enabled: z.boolean(),
  schedules: z.object({
    consentExpiry: z.string(),
    dataRetention: z.string(),
    auditReports: z.string(),
    healthChecks: z.string(),
    anonymization: z.string()
  }),
  notifications: z.object({
    email: z.boolean(),
    webhook: z.boolean(),
    dashboard: z.boolean(),
    webhookUrl: z.string().url().optional()
  }),
  thresholds: z.object({
    riskScore: z.number().min(0).max(100),
    complianceScore: z.number().min(0).max(100),
    auditCoverage: z.number().min(0).max(100),
    consentExpiryDays: z.number().min(1).max(365)
  }),
  features: z.object({
    autoConsentManagement: z.boolean(),
    autoDataSubjectRights: z.boolean(),
    autoAuditReporting: z.boolean(),
    autoAnonymization: z.boolean(),
    realTimeMonitoring: z.boolean()
  })
});
// GET - Obter configuração atual
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Verificar autenticação
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Buscar configuração atual
    const { data: config, error } = await supabase
      .from('lgpd_automation_config')
      .select('*')
      .eq('clinic_id', session.user.user_metadata.clinic_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Se não existe configuração, retornar padrão
    if (!config) {
      const defaultConfig = {
        enabled: false,
        schedules: {
          consentExpiry: '0 2 * * *', // 2h da manhã diariamente
          dataRetention: '0 3 * * 0', // 3h da manhã aos domingos
          auditReports: '0 1 1 * *', // 1h da manhã no primeiro dia do mês
          healthChecks: '0 */6 * * *', // A cada 6 horas
          anonymization: '0 4 * * 0' // 4h da manhã aos domingos
        },        notifications: {
          email: true,
          webhook: false,
          dashboard: true,
          webhookUrl: ''
        },
        thresholds: {
          riskScore: 70,
          complianceScore: 85,
          auditCoverage: 90,
          consentExpiryDays: 365
        },
        features: {
          autoConsentManagement: true,
          autoDataSubjectRights: true,
          autoAuditReporting: true,
          autoAnonymization: false,
          realTimeMonitoring: true
        }
      };
      
      return NextResponse.json({
        success: true,
        data: defaultConfig
      });
    }

    return NextResponse.json({
      success: true,
      data: config.config
    });
    
  } catch (error) {
    console.error('Erro ao obter configuração:', error);    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// PUT - Atualizar configuração
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Verificar autenticação
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validar dados
    const validationResult = AutomationConfigSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validationResult.error.errors
        },
        { status: 400 }
      );    }

    const config = validationResult.data;
    const clinicId = session.user.user_metadata.clinic_id;

    // Upsert configuração
    const { data, error } = await supabase
      .from('lgpd_automation_config')
      .upsert({
        clinic_id: clinicId,
        config: config,
        updated_at: new Date().toISOString(),
        updated_by: session.user.id
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Registrar evento de auditoria
    await supabase
      .from('lgpd_audit_trail')
      .insert({
        clinic_id: clinicId,
        event_type: 'system',
        action: 'automation_config_updated',
        user_id: session.user.id,
        details: {
          previousConfig: body.previousConfig || null,
          newConfig: config
        },
        severity: 'info'
      });
    return NextResponse.json({
      success: true,
      data: data.config,
      message: 'Configuração atualizada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}