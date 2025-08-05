import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { cookies } from "next/headers";
import type { z } from "zod";

// Schema de validaï¿½ï¿½o para configuraï¿½ï¿½o de automaï¿½ï¿½o
const AutomationConfigSchema = z.object({
  enabled: z.boolean(),
  schedules: z.object({
    consentExpiry: z.string(),
    dataRetention: z.string(),
    auditReports: z.string(),
    healthChecks: z.string(),
    anonymization: z.string(),
  }),
  notifications: z.object({
    email: z.boolean(),
    webhook: z.boolean(),
    dashboard: z.boolean(),
    webhookUrl: z.string().url().optional(),
  }),
  thresholds: z.object({
    riskScore: z.number().min(0).max(100),
    complianceScore: z.number().min(0).max(100),
    auditCoverage: z.number().min(0).max(100),
    consentExpiryDays: z.number().min(1).max(365),
  }),
  features: z.object({
    autoConsentManagement: z.boolean(),
    autoDataSubjectRights: z.boolean(),
    autoAuditReporting: z.boolean(),
    autoAnonymization: z.boolean(),
    realTimeMonitoring: z.boolean(),
  }),
});
// GET - Obter configuraï¿½ï¿½o atual
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

    // Buscar configuraï¿½ï¿½o atual
    const { data: config, error } = await supabase
      .from("lgpd_automation_config")
      .select("*")
      .eq("clinic_id", session.user.user_metadata.clinic_id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    // Se nï¿½o existe configuraï¿½ï¿½o, retornar padrï¿½o
    if (!config) {
      const defaultConfig = {
        enabled: false,
        schedules: {
          consentExpiry: "0 2 * * *", // 2h da manhï¿½ diariamente
          dataRetention: "0 3 * * 0", // 3h da manhï¿½ aos domingos
          auditReports: "0 1 1 * *", // 1h da manhï¿½ no primeiro dia do mï¿½s
          healthChecks: "0 */6 * * *", // A cada 6 horas
          anonymization: "0 4 * * 0", // 4h da manhï¿½ aos domingos
        },
        notifications: {
          email: true,
          webhook: false,
          dashboard: true,
          webhookUrl: "",
        },
        thresholds: {
          riskScore: 70,
          complianceScore: 85,
          auditCoverage: 90,
          consentExpiryDays: 365,
        },
        features: {
          autoConsentManagement: true,
          autoDataSubjectRights: true,
          autoAuditReporting: true,
          autoAnonymization: false,
          realTimeMonitoring: true,
        },
      };

      return NextResponse.json({
        success: true,
        data: defaultConfig,
      });
    }

    return NextResponse.json({
      success: true,
      data: config.config,
    });
  } catch (error) {
    console.error("Erro ao obter configuraï¿½ï¿½o:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}

// PUT - Atualizar configuraï¿½ï¿½o
export async function PUT(request: NextRequest) {
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

    // Validar dados
    const validationResult = AutomationConfigSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Dados invï¿½lidos",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const config = validationResult.data;
    const clinicId = session.user.user_metadata.clinic_id;

    // Upsert configuraï¿½ï¿½o
    const { data, error } = await supabase
      .from("lgpd_automation_config")
      .upsert({
        clinic_id: clinicId,
        config: config,
        updated_at: new Date().toISOString(),
        updated_by: session.user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Registrar evento de auditoria
    await supabase.from("lgpd_audit_trail").insert({
      clinic_id: clinicId,
      event_type: "system",
      action: "automation_config_updated",
      user_id: session.user.id,
      details: {
        previousConfig: body.previousConfig || null,
        newConfig: config,
      },
      severity: "info",
    });
    return NextResponse.json({
      success: true,
      data: data.config,
      message: "Configuraï¿½ï¿½o atualizada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar configuraï¿½ï¿½o:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
