import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LGPDAutomationOrchestrator } from '@/lib/compliance/lgpd-automation-orchestrator';

// Schema de validação para configuração de automação
const _AutomationConfigSchema = z.object({
  enabled: z.boolean(),
  schedules: z.object({
    consentExpiry: z.string(),
    dataRetention: z.string(),
    auditReports: z.string(),
    healthChecks: z.string(),
  }),
  notifications: z.object({
    email: z.boolean(),
    webhook: z.boolean(),
    dashboard: z.boolean(),
  }),
  thresholds: z.object({
    riskScore: z.number().min(0).max(100),
    complianceScore: z.number().min(0).max(100),
    auditCoverage: z.number().min(0).max(100),
  }),
});

// GET - Obter status da automação
export async function GET(_request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verificar autenticação
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orchestrator = new LGPDAutomationOrchestrator(supabase);

    // Obter status geral da automação
    const status = await orchestrator.getAutomationStatus();

    // Obter métricas do dashboard
    const metrics = await orchestrator.getDashboardMetrics();

    // Verificar saúde da conformidade
    const healthCheck = await orchestrator.performComplianceHealthCheck();

    return NextResponse.json({
      success: true,
      data: {
        status,
        metrics,
        healthCheck,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// POST - Executar automação manual
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verificar autenticação
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, params } = body;

    const orchestrator = new LGPDAutomationOrchestrator(supabase);

    let result;

    switch (action) {
      case 'run_full_automation':
        result = await orchestrator.runFullAutomation();
        break;

      case 'process_consent_automation':
        result = await orchestrator.processConsentAutomation();
        break;

      case 'process_data_subject_rights':
        result = await orchestrator.processDataSubjectRights();
        break;

      case 'run_audit_automation':
        result = await orchestrator.runAuditAutomation();
        break;

      case 'generate_compliance_reports':
        result = await orchestrator.generateComplianceReports();
        break;

      case 'run_anonymization':
        result = await orchestrator.runAnonymization();
        break;

      case 'health_check':
        result = await orchestrator.performComplianceHealthCheck();
        break;

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
