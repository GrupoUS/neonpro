import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";

// Definição da hierarquia de roles
const ROLE_HIERARCHY = {
  admin: {
    level: 5,
    permissions: [
      "read_all",
      "write_all",
      "delete_all",
      "manage_users",
      "manage_roles",
      "manage_system",
      "view_analytics",
      "manage_billing",
      "manage_subscriptions",
    ],
    can_manage: ["admin", "doctor", "nurse", "staff", "professional"],
  },
  doctor: {
    level: 4,
    permissions: [
      "read_patients",
      "write_patients",
      "read_appointments",
      "write_appointments",
      "read_medical_records",
      "write_medical_records",
      "manage_prescriptions",
      "view_reports",
      "manage_treatments",
    ],
    can_manage: ["nurse", "staff"],
  },
  nurse: {
    level: 3,
    permissions: [
      "read_patients",
      "write_patients",
      "read_appointments",
      "write_appointments",
      "read_medical_records",
      "assist_treatments",
      "manage_schedules",
    ],
    can_manage: ["staff"],
  },
  staff: {
    level: 2,
    permissions: [
      "read_patients",
      "read_appointments",
      "write_appointments",
      "manage_schedules",
      "basic_reports",
    ],
    can_manage: [],
  },
  professional: {
    level: 1,
    permissions: [
      "read_own_profile",
      "write_own_profile",
      "read_own_appointments",
      "view_own_schedule",
    ],
    can_manage: [],
  },
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const action = searchParams.get("action");

    // Se for para verificar uma permissão específica
    if (action === "check") {
      const targetRole = searchParams.get("target_role");
      const permission = searchParams.get("permission");

      if (!role || !permission) {
        return NextResponse.json(
          { error: "Role e permissão são obrigatórias para verificação" },
          { status: 400 },
        );
      }

      const hasPermission = checkPermission(role as keyof typeof ROLE_HIERARCHY, permission);
      const canManageRole = targetRole
        ? canManageTargetRole(
            role as keyof typeof ROLE_HIERARCHY,
            targetRole as keyof typeof ROLE_HIERARCHY,
          )
        : null;

      return NextResponse.json({
        success: true,
        role,
        permission,
        target_role: targetRole,
        has_permission: hasPermission,
        can_manage_role: canManageRole,
      });
    }

    // Retornar informações completas da hierarquia
    if (role) {
      const roleInfo = ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY];
      if (!roleInfo) {
        return NextResponse.json({ error: "Role não encontrada" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        role,
        level: roleInfo.level,
        permissions: roleInfo.permissions,
        can_manage: roleInfo.can_manage,
      });
    }

    // Retornar hierarquia completa
    return NextResponse.json({
      success: true,
      hierarchy: ROLE_HIERARCHY,
      role_levels: Object.entries(ROLE_HIERARCHY)
        .sort(([, a], [, b]) => b.level - a.level)
        .map(([role, info]) => ({
          role,
          level: info.level,
          permissions_count: info.permissions.length,
          can_manage_count: info.can_manage.length,
        })),
    });
  } catch (error) {
    console.error("Erro no endpoint de permissões:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação e role de admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário é admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem gerenciar permissões." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { action, target_user_id, permissions, reason } = body;

    if (action === "validate_access") {
      const { user_role, required_permission, target_resource } = body;

      if (!user_role || !required_permission) {
        return NextResponse.json(
          { error: "Role do usuário e permissão requerida são obrigatórias" },
          { status: 400 },
        );
      }

      const hasAccess = checkPermission(
        user_role as keyof typeof ROLE_HIERARCHY,
        required_permission,
      );

      // Registrar tentativa de acesso
      const { error: logError } = await supabase.from("role_audit_log").insert({
        user_id: user.id,
        action_type: "access_validation",
        target_resource: target_resource || "unknown",
        metadata: {
          user_role,
          required_permission,
          access_granted: hasAccess,
          validated_at: new Date().toISOString(),
        },
      });

      if (logError) {
        console.error("Erro ao registrar log de validação:", logError);
      }

      return NextResponse.json({
        success: true,
        access_granted: hasAccess,
        user_role,
        required_permission,
        validated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: "Ação não reconhecida" }, { status: 400 });
  } catch (error) {
    console.error("Erro no endpoint de validação de permissões:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// Função para verificar se uma role tem determinada permissão
export function checkPermission(
  userRole: keyof typeof ROLE_HIERARCHY,
  permission: string,
): boolean {
  const roleInfo = ROLE_HIERARCHY[userRole];
  if (!roleInfo) return false;

  return roleInfo.permissions.includes(permission);
}

// Função para verificar se uma role pode gerenciar outra role
export function canManageTargetRole(
  userRole: keyof typeof ROLE_HIERARCHY,
  targetRole: keyof typeof ROLE_HIERARCHY,
): boolean {
  const userRoleInfo = ROLE_HIERARCHY[userRole];
  if (!userRoleInfo) return false;

  return userRoleInfo.can_manage.includes(targetRole);
}

// Função para verificar se uma role tem nível hierárquico superior
function hasHigherLevel(
  userRole: keyof typeof ROLE_HIERARCHY,
  targetRole: keyof typeof ROLE_HIERARCHY,
): boolean {
  const userRoleInfo = ROLE_HIERARCHY[userRole];
  const targetRoleInfo = ROLE_HIERARCHY[targetRole];

  if (!userRoleInfo || !targetRoleInfo) return false;

  return userRoleInfo.level > targetRoleInfo.level;
}
