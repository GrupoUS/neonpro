import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { cookies } from "next/headers";
import type { LGPDAutomationOrchestrator } from "@/lib/compliance/lgpd-automation-orchestrator";
import type { z } from "zod";

// Schema de validaï¿½ï¿½o para configuraï¿½ï¿½o de automaï¿½ï¿½o
const AutomationConfigSchema = z.object({
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

// GET - Obter status da automaï¿½ï¿½o
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticaï¿½ï¿½o
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orchestrator = new LGPDAutomationOrchestrator(supabase);

    // Obter status geral da automaï¿½ï¿½o
    const status = await orchestrator.getAutomationStatus();

    // Obter mï¿½tricas do dashboard
    const metrics = await orchestrator.getDashboardMetrics();

    // Verificar saï¿½de da conformidade
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
    console.error("Erro ao obter status da automaï¿½ï¿½o:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}

// POST - Executar automaï¿½ï¿½o manual
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticaï¿½ï¿½o
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, params } = body;

    const orchestrator = new LGPDAutomationOrchestrator(supabase);

    let result;

    switch (action) {
      case "run_full_automation":
        result = await orchestrator.runFullAutomation();
        break;

      case "process_consent_automation":
        result = await orchestrator.processConsentAutomation();
        break;

      case "process_data_subject_rights":
        result = await orchestrator.processDataSubjectRights();
        break;

      case "run_audit_automation":
        result = await orchestrator.runAuditAutomation();
        break;

      case "generate_compliance_reports":
        result = await orchestrator.generateComplianceReports();
        break;

      case "run_anonymization":
        result = await orchestrator.runAnonymization();
        break;

      case "health_check":
        result = await orchestrator.performComplianceHealthCheck();
        break;

      default:
        return NextResponse.json({ error: "Aï¿½ï¿½o nï¿½o reconhecida" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao executar automaï¿½ï¿½o:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
