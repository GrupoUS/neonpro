import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação e role de admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário é admin
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || adminProfile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem atribuir roles.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { target_user_id, new_role, reason } = body;

    // Validar dados obrigatórios
    if (!target_user_id || !new_role) {
      return NextResponse.json(
        { error: 'ID do usuário e nova role são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar se o role é válido
    const validRoles = ['admin', 'doctor', 'nurse', 'staff', 'professional'];
    if (!validRoles.includes(new_role)) {
      return NextResponse.json(
        { error: 'Role inválida. Valores permitidos: ' + validRoles.join(', ') },
        { status: 400 }
      );
    }

    // Buscar perfil do usuário alvo
    const { data: targetProfile, error: targetError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', target_user_id)
      .single();

    if (targetError) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se a role está sendo alterada
    if (targetProfile.role === new_role) {
      return NextResponse.json(
        { error: 'O usuário já possui esta role' },
        { status: 400 }
      );
    }

    const old_role = targetProfile.role;

    // Atualizar a role do usuário
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        role: new_role,
        updated_at: new Date().toISOString()
      })
      .eq('id', target_user_id)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar role:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atribuir nova role' },
        { status: 500 }
      );
    }

    // Registrar log de auditoria
    const { error: logError } = await supabase
      .from('role_audit_log')
      .insert({
        user_id: user.id,
        action_type: 'manual_role_assignment',
        target_user_id: target_user_id,
        old_role: old_role,
        new_role: new_role,
        reason: reason || 'Atribuição manual pelo administrador',
        metadata: {
          admin_user_id: user.id,
          target_email: targetProfile.email,
          assignment_date: new Date().toISOString()
        }
      });

    if (logError) {
      console.error('Erro ao registrar log de auditoria:', logError);
      // Não falhar a operação por erro de log
    }

    // Enviar notificação ao usuário (opcional)
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: target_user_id,
          title: 'Role Atualizada',
          message: `Sua role foi alterada de "${old_role}" para "${new_role}" por um administrador.`,
          type: 'role_change',
          is_read: false,
          created_at: new Date().toISOString()
        });
    } catch (notificationError) {
      console.error('Erro ao enviar notificação:', notificationError);
      // Não falhar a operação por erro de notificação
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      roleChange: {
        from: old_role,
        to: new_role,
        assignedBy: user.id,
        assignedAt: new Date().toISOString(),
        reason: reason || 'Atribuição manual pelo administrador'
      },
      message: `Role alterada de "${old_role}" para "${new_role}" com sucesso`
    });

  } catch (error) {
    console.error('Erro no endpoint de atribuição de role:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação e role de admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem visualizar esta informação.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const role_filter = searchParams.get('role');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    // Construir query base
    let query = supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at, updated_at', { count: 'exact' });

    // Aplicar filtros
    if (role_filter && role_filter !== 'all') {
      query = query.eq('role', role_filter);
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    // Aplicar paginação e ordenação
    const { data: profiles, error: profilesError, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (profilesError) {
      console.error('Erro ao buscar perfis:', profilesError);
      return NextResponse.json(
        { error: 'Erro ao buscar perfis de usuários' },
        { status: 500 }
      );
    }

    // Buscar estatísticas de roles
    const { data: roleStats, error: statsError } = await supabase
      .from('profiles')
      .select('role')
      .not('role', 'is', null);

    const stats = roleStats?.reduce((acc: Record<string, number>, profile) => {
      acc[profile.role] = (acc[profile.role] || 0) + 1;
      return acc;
    }, {}) || {};

    return NextResponse.json({
      success: true,
      profiles: profiles || [],
      pagination: {
        current_page: page,
        total_pages: Math.ceil((count || 0) / limit),
        total_items: count || 0,
        items_per_page: limit
      },
      statistics: {
        total_users: count || 0,
        roles_distribution: stats
      }
    });

  } catch (error) {
    console.error('Erro no endpoint de listagem de roles:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
