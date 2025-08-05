/**
 * NeonPro Audit Reports API
 *
 * API para geração e gestão de relatórios de auditoria.
 * Permite criar, consultar e exportar relatórios personalizados.
 *
 * Endpoints:
 * - GET /api/audit/reports - Lista relatórios
 * - POST /api/audit/reports - Gera novo relatório
 * - GET /api/audit/reports/[id] - Baixa relatório específico
 *
 * @author APEX Master Developer
 * @version 1.0.0
 */

import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { cookies } from "next/headers";
import type { z } from "zod";
import type { AuditSeverity, logAuditEvent, AuditEventType } from "@/lib/audit/audit-system";
import type { rateLimit } from "@/lib/security/rate-limiting";
import type { validateCSRF } from "@/lib/security/csrf-protection";
import type { logSecurityEvent } from "@/lib/security/security-events";

// =====================================================
// SCHEMAS DE VALIDAÇÃO
// =====================================================

const ReportQuerySchema = z.object({
  status: z.enum(["pending", "generating", "completed", "failed"]).optional(),
  type: z.enum(["security", "compliance", "activity", "performance"]).optional(),
  created_by: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
});

const CreateReportSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(["security", "compliance", "activity", "performance"]),
  filters: z.object({
    start_date: z.string().datetime(),
    end_date: z.string().datetime(),
    event_types: z.array(z.string()).optional(),
    severity_levels: z.array(z.nativeEnum(AuditSeverity)).optional(),
    user_ids: z.array(z.string()).optional(),
    resource_types: z.array(z.string()).optional(),
  }),
  format: z.enum(["pdf", "csv", "json", "xlsx"]).default("pdf"),
  include_charts: z.boolean().default(true),
  include_summary: z.boolean().default(true),
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const remoteAddr = request.headers.get("x-vercel-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return realIP || remoteAddr || "unknown";
}

async function validateReportAccess(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, permissions")
      .eq("user_id", userId)
      .single();

    if (!profile) return false;

    const hasReportAccess =
      profile.role === "admin" ||
      profile.role === "security_admin" ||
      profile.role === "compliance_officer" ||
      profile.permissions?.includes("audit.reports");

    return hasReportAccess;
  } catch (error) {
    console.error("Erro ao validar acesso de relatórios:", error);
    return false;
  }
}

function parseReportFilters(searchParams: URLSearchParams) {
  const filters: any = {};

  if (searchParams.get("status")) {
    filters.status = searchParams.get("status");
  }

  if (searchParams.get("type")) {
    filters.type = searchParams.get("type");
  }

  if (searchParams.get("created_by")) {
    filters.created_by = searchParams.get("created_by");
  }

  if (searchParams.get("limit")) {
    filters.limit = parseInt(searchParams.get("limit")!);
  }

  if (searchParams.get("offset")) {
    filters.offset = parseInt(searchParams.get("offset")!);
  }

  return filters;
}

async function generateReportData(supabase: any, filters: any) {
  try {
    // Construir query base
    let query = supabase
      .from("audit_logs")
      .select("*")
      .gte("created_at", filters.start_date)
      .lte("created_at", filters.end_date)
      .order("created_at", { ascending: false });

    // Aplicar filtros opcionais
    if (filters.event_types?.length > 0) {
      query = query.in("event_type", filters.event_types);
    }

    if (filters.severity_levels?.length > 0) {
      query = query.in("severity", filters.severity_levels);
    }

    if (filters.user_ids?.length > 0) {
      query = query.in("user_id", filters.user_ids);
    }

    if (filters.resource_types?.length > 0) {
      query = query.in("resource_type", filters.resource_types);
    }

    const { data: logs, error } = await query;

    if (error) {
      throw error;
    }

    return logs || [];
  } catch (error) {
    console.error("Erro ao gerar dados do relatório:", error);
    throw error;
  }
}

async function createReportRecord(supabase: any, reportData: any, userId: string) {
  const { data: report, error } = await supabase
    .from("audit_reports")
    .insert({
      name: reportData.name,
      description: reportData.description,
      type: reportData.type,
      filters: reportData.filters,
      format: reportData.format,
      status: "generating",
      created_by: userId,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return report;
}

// =====================================================
// GET: LISTAR RELATÓRIOS
// =====================================================

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = await rateLimit({
      key: `audit-reports-${clientIP}`,
      limit: 60,
      window: 60000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Autenticação
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validação de permissões
    const hasAccess = await validateReportAccess(supabase, user.id);
    if (!hasAccess) {
      await logSecurityEvent({
        type: "insufficient_permissions",
        severity: "medium",
        description: "Usuário sem permissões para acessar relatórios de auditoria",
        user_id: user.id,
        ip_address: clientIP,
        user_agent: request.headers.get("user-agent") || undefined,
      });

      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Parse e validação dos filtros
    const { searchParams } = new URL(request.url);
    const rawFilters = parseReportFilters(searchParams);

    const validationResult = ReportQuerySchema.safeParse(rawFilters);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const filters = validationResult.data;

    // Construir query
    let query = supabase
      .from("audit_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1);

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.type) {
      query = query.eq("type", filters.type);
    }

    if (filters.created_by) {
      query = query.eq("created_by", filters.created_by);
    }

    const { data: reports, error: queryError } = await query;

    if (queryError) {
      throw queryError;
    }

    // Contar total para paginação
    let countQuery = supabase.from("audit_reports").select("*", { count: "exact", head: true });

    if (filters.status) {
      countQuery = countQuery.eq("status", filters.status);
    }

    if (filters.type) {
      countQuery = countQuery.eq("type", filters.type);
    }

    if (filters.created_by) {
      countQuery = countQuery.eq("created_by", filters.created_by);
    }

    const { count } = await countQuery;

    // Log da consulta
    await logAuditEvent({
      event_type: AuditEventType.REPORT_ACCESS,
      severity: AuditSeverity.LOW,
      description: "Consulta de relatórios de auditoria realizada",
      user_id: user.id,
      ip_address: clientIP,
      user_agent: request.headers.get("user-agent") || undefined,
      metadata: {
        filters_applied: filters,
        results_count: reports?.length || 0,
      },
    });

    return NextResponse.json({
      success: true,
      data: reports || [],
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error("Erro na consulta de relatórios:", error);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// =====================================================
// POST: GERAR NOVO RELATÓRIO
// =====================================================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = await rateLimit({
      key: `create-report-${clientIP}`,
      limit: 10,
      window: 60000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Autenticação
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validação CSRF
    const csrfValid = await validateCSRF(request);
    if (!csrfValid) {
      await logSecurityEvent({
        type: "csrf_validation_failed",
        severity: "high",
        description: "Falha na validação CSRF para criação de relatório",
        user_id: user.id,
        ip_address: clientIP,
        user_agent: request.headers.get("user-agent") || undefined,
      });

      return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
    }

    // Validação de permissões
    const hasAccess = await validateReportAccess(supabase, user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Parse e validação do body
    const body = await request.json();
    const validationResult = CreateReportSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const reportData = validationResult.data;

    // Validar período do relatório
    const startDate = new Date(reportData.filters.start_date);
    const endDate = new Date(reportData.filters.end_date);

    if (startDate >= endDate) {
      return NextResponse.json({ error: "Start date must be before end date" }, { status: 400 });
    }

    // Limitar período máximo (1 ano)
    const maxPeriod = 365 * 24 * 60 * 60 * 1000; // 1 ano em ms
    if (endDate.getTime() - startDate.getTime() > maxPeriod) {
      return NextResponse.json({ error: "Report period cannot exceed 1 year" }, { status: 400 });
    }

    // Criar registro do relatório
    const report = await createReportRecord(supabase, reportData, user.id);

    // Iniciar geração assíncrona do relatório
    // Em produção, isso seria feito em uma fila de background
    try {
      const reportLogs = await generateReportData(supabase, reportData.filters);

      // Atualizar status para completed
      await supabase
        .from("audit_reports")
        .update({
          status: "completed",
          data: reportLogs,
          completed_at: new Date().toISOString(),
          file_size: JSON.stringify(reportLogs).length,
        })
        .eq("id", report.id);
    } catch (generateError) {
      console.error("Erro na geração do relatório:", generateError);

      // Atualizar status para failed
      await supabase
        .from("audit_reports")
        .update({
          status: "failed",
          error_message: generateError.message,
        })
        .eq("id", report.id);
    }

    // Log da criação
    await logAuditEvent({
      event_type: AuditEventType.REPORT_GENERATION,
      severity: AuditSeverity.MEDIUM,
      description: `Relatório de auditoria criado: ${reportData.name}`,
      user_id: user.id,
      ip_address: clientIP,
      user_agent: request.headers.get("user-agent") || undefined,
      resource_type: "audit_report",
      resource_id: report.id,
      metadata: {
        report_type: reportData.type,
        format: reportData.format,
        filters: reportData.filters,
      },
    });

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Erro na criação de relatório:", error);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// =====================================================
// OPTIONS: CORS
// =====================================================

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
    },
  });
}
