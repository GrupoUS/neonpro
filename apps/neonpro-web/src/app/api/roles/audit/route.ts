import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { withRoleValidation } from "@/lib/middleware/role-validation";

export const GET = withRoleValidation(
  async (request: NextRequest, validation) => {
    try {
      const supabase = await createClient();
      const { searchParams } = new URL(request.url);

      // Parâmetros de filtro e paginação
      const page = parseInt(searchParams.get("page") || "1");
      const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
      const action_type = searchParams.get("action_type");
      const target_user_id = searchParams.get("target_user_id");
      const start_date = searchParams.get("start_date");
      const end_date = searchParams.get("end_date");

      const offset = (page - 1) * limit;

      // Construir query base
      let query = supabase.from("role_audit_log").select(
        `
          *,
          user:profiles!role_audit_log_user_id_fkey(id, email, full_name),
          target_user:profiles!role_audit_log_target_user_id_fkey(id, email, full_name)
        `,
        { count: "exact" },
      );

      // Aplicar filtros
      if (action_type) {
        query = query.eq("action_type", action_type);
      }

      if (target_user_id) {
        query = query.eq("target_user_id", target_user_id);
      }

      if (start_date) {
        query = query.gte("created_at", start_date);
      }

      if (end_date) {
        query = query.lte("created_at", end_date);
      }

      // Aplicar paginação e ordenação
      const {
        data: auditLogs,
        error: logsError,
        count,
      } = await query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

      if (logsError) {
        console.error("Erro ao buscar logs de auditoria:", logsError);
        return NextResponse.json({ error: "Erro ao buscar logs de auditoria" }, { status: 500 });
      }

      // Buscar estatísticas de tipos de ação
      const { data: actionStats, error: statsError } = await supabase
        .from("role_audit_log")
        .select("action_type")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Últimos 30 dias

      const stats =
        actionStats?.reduce((acc: Record<string, number>, log) => {
          acc[log.action_type] = (acc[log.action_type] || 0) + 1;
          return acc;
        }, {}) || {};

      return NextResponse.json({
        success: true,
        audit_logs: auditLogs || [],
        pagination: {
          current_page: page,
          total_pages: Math.ceil((count || 0) / limit),
          total_items: count || 0,
          items_per_page: limit,
        },
        statistics: {
          total_logs: count || 0,
          actions_last_30_days: stats,
          available_actions: [
            "manual_role_assignment",
            "domain_mapping_created",
            "domain_mapping_updated",
            "domain_mapping_deleted",
            "access_validation",
            "role_hierarchy_check",
            "permission_check",
            "conflict_resolution",
          ],
        },
      });
    } catch (error) {
      console.error("Erro no endpoint de logs de auditoria:", error);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
  },
  {
    requiredRole: ["admin"],
    requiredPermission: ["view_analytics", "manage_system"],
  },
);

export const POST = withRoleValidation(
  async (request: NextRequest, validation) => {
    try {
      const supabase = await createClient();
      const body = await request.json();

      const {
        action_type,
        target_user_id,
        old_role,
        new_role,
        target_domain,
        reason,
        metadata = {},
      } = body;

      // Validar dados obrigatórios
      if (!action_type) {
        return NextResponse.json({ error: "Tipo de ação é obrigatório" }, { status: 400 });
      }

      // Criar entrada de log
      const logEntry = {
        user_id: validation.user.id,
        action_type,
        target_user_id: target_user_id || null,
        old_role: old_role || null,
        new_role: new_role || null,
        target_domain: target_domain || null,
        reason: reason || null,
        metadata: {
          ...metadata,
          manual_entry: true,
          created_by_admin: validation.profile.role === "admin",
          timestamp: new Date().toISOString(),
        },
      };

      const { data: createdLog, error: logError } = await supabase
        .from("role_audit_log")
        .insert(logEntry)
        .select(`
          *,
          user:profiles!role_audit_log_user_id_fkey(id, email, full_name),
          target_user:profiles!role_audit_log_target_user_id_fkey(id, email, full_name)
        `)
        .single();

      if (logError) {
        console.error("Erro ao criar log de auditoria:", logError);
        return NextResponse.json({ error: "Erro ao criar entrada de log" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        audit_log: createdLog,
        message: "Log de auditoria criado com sucesso",
      });
    } catch (error) {
      console.error("Erro no endpoint de criação de log:", error);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
  },
  {
    requiredRole: ["admin"],
  },
);
