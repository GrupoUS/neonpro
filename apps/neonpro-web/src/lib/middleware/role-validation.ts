// lib/middleware/role-validation.ts
// VIBECODE V1.0 - Role-Based Access Control Middleware
// Story 1.4 - OAuth Google Integration Enhancement
// Created: 2025-07-22

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { ROLE_HIERARCHY, checkPermission, canManageTargetRole } from '@/app/api/roles/permissions/route';

export interface RoleValidationOptions {
  requiredRole?: string[];
  requiredPermission?: string[];
  allowSelfAccess?: boolean;
  resourceOwnerField?: string;
}

export interface RoleValidationResult {
  success: boolean;
  user: any;
  profile: any;
  error?: string;
  statusCode?: number;
}

/**
 * Middleware para validação de roles e permissões
 */
export async function validateRole(
  request: NextRequest,
  options: RoleValidationOptions = {}
): Promise<RoleValidationResult> {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        user: null,
        profile: null,
        error: 'Não autorizado - usuário não autenticado',
        statusCode: 401
      };
    }

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        user,
        profile: null,
        error: 'Perfil do usuário não encontrado',
        statusCode: 404
      };
    }

    // Verificar role específica se fornecida
    if (options.requiredRole && options.requiredRole.length > 0) {
      if (!options.requiredRole.includes(profile.role)) {
        return {
          success: false,
          user,
          profile,
          error: `Acesso negado. Roles permitidas: ${options.requiredRole.join(', ')}`,
          statusCode: 403
        };
      }
    }

    // Verificar permissões específicas se fornecidas
    if (options.requiredPermission && options.requiredPermission.length > 0) {
      const hasAllPermissions = options.requiredPermission.every(permission =>
        checkPermission(profile.role as keyof typeof ROLE_HIERARCHY, permission)
      );

      if (!hasAllPermissions) {
        return {
          success: false,
          user,
          profile,
          error: `Permissões insuficientes. Requeridas: ${options.requiredPermission.join(', ')}`,
          statusCode: 403
        };
      }
    }

    // Verificar acesso a recursos próprios se configurado
    if (options.allowSelfAccess && options.resourceOwnerField) {
      const body = await request.json().catch(() => ({}));
      const url = new URL(request.url);
      const resourceOwnerId = body[options.resourceOwnerField] || url.searchParams.get(options.resourceOwnerField);

      if (resourceOwnerId && resourceOwnerId === user.id) {
        // Usuário está acessando seus próprios dados
        return {
          success: true,
          user,
          profile
        };
      }
    }

    return {
      success: true,
      user,
      profile
    };

  } catch (error) {
    console.error('Erro na validação de role:', error);
    return {
      success: false,
      user: null,
      profile: null,
      error: 'Erro interno na validação de permissões',
      statusCode: 500
    };
  }
}

/**
 * Wrapper para middleware de validação de role
 */
export function withRoleValidation(
  handler: (req: NextRequest, validation: RoleValidationResult) => Promise<NextResponse>,
  options: RoleValidationOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const validation = await validateRole(request, options);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.statusCode || 403 }
      );
    }

    return handler(request, validation);
  };
}

/**
 * Validar se o usuário pode gerenciar outro usuário
 */
export async function canManageUser(
  managerUserId: string,
  targetUserId: string
): Promise<{ canManage: boolean; reason?: string }> {
  try {
    const supabase = await createClient();

    // Buscar perfis de ambos os usuários
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, role')
      .in('id', [managerUserId, targetUserId]);

    if (error || !profiles || profiles.length !== 2) {
      return { canManage: false, reason: 'Erro ao buscar informações dos usuários' };
    }

    const managerProfile = profiles.find(p => p.id === managerUserId);
    const targetProfile = profiles.find(p => p.id === targetUserId);

    if (!managerProfile || !targetProfile) {
      return { canManage: false, reason: 'Perfil de usuário não encontrado' };
    }

    // Verificar se pode gerenciar baseado na hierarquia
    const canManage = canManageTargetRole(
      managerProfile.role as keyof typeof ROLE_HIERARCHY,
      targetProfile.role as keyof typeof ROLE_HIERARCHY
    );

    return {
      canManage,
      reason: canManage ? undefined : `Role ${managerProfile.role} não pode gerenciar role ${targetProfile.role}`
    };

  } catch (error) {
    console.error('Erro na verificação de gerenciamento de usuário:', error);
    return { canManage: false, reason: 'Erro interno na verificação' };
  }
}

/**
 * Log de auditoria para ações relacionadas a roles
 */
export async function logRoleAction(
  userId: string,
  actionType: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase
      .from('role_audit_log')
      .insert({
        user_id: userId,
        action_type: actionType,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          user_agent: metadata.user_agent || 'unknown'
        }
      });

  } catch (error) {
    console.error('Erro ao registrar log de auditoria de role:', error);
    // Não propagar o erro para não afetar a operação principal
  }
}
