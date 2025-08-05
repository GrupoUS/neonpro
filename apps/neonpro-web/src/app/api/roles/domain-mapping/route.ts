import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/database.types';

type RoleDomainMapping = Database['public']['Tables']['role_domain_mappings']['Row'];

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
        { error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' },
        { status: 403 }
      );
    }

    // Buscar todos os mapeamentos de domínio
    const { data: mappings, error: mappingsError } = await supabase
      .from('role_domain_mappings')
      .select('*')
      .order('domain', { ascending: true });

    if (mappingsError) {
      console.error('Erro ao buscar mapeamentos de domínio:', mappingsError);
      return NextResponse.json(
        { error: 'Erro ao buscar mapeamentos de domínio' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mappings: mappings || [],
      total: mappings?.length || 0
    });

  } catch (error) {
    console.error('Erro no endpoint de mapeamentos de domínio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem criar mapeamentos.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { domain, default_role, priority, is_active } = body;

    // Validar dados obrigatórios
    if (!domain || !default_role) {
      return NextResponse.json(
        { error: 'Domínio e role padrão são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar se o role é válido
    const validRoles = ['admin', 'doctor', 'nurse', 'staff', 'professional'];
    if (!validRoles.includes(default_role)) {
      return NextResponse.json(
        { error: 'Role inválida. Valores permitidos: ' + validRoles.join(', ') },
        { status: 400 }
      );
    }

    // Verificar se o domínio já existe
    const { data: existingMapping, error: checkError } = await supabase
      .from('role_domain_mappings')
      .select('id')
      .eq('domain', domain.toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar domínio existente:', checkError);
      return NextResponse.json(
        { error: 'Erro ao verificar domínio' },
        { status: 500 }
      );
    }

    if (existingMapping) {
      return NextResponse.json(
        { error: 'Este domínio já possui um mapeamento configurado' },
        { status: 409 }
      );
    }

    // Criar novo mapeamento
    const newMapping = {
      domain: domain.toLowerCase(),
      default_role,
      priority: priority || 1,
      is_active: is_active !== undefined ? is_active : true,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: createdMapping, error: createError } = await supabase
      .from('role_domain_mappings')
      .insert(newMapping)
      .select()
      .single();

    if (createError) {
      console.error('Erro ao criar mapeamento:', createError);
      return NextResponse.json(
        { error: 'Erro ao criar mapeamento de domínio' },
        { status: 500 }
      );
    }

    // Registrar log de auditoria
    const { error: logError } = await supabase
      .from('role_audit_log')
      .insert({
        user_id: user.id,
        action_type: 'domain_mapping_created',
        target_domain: domain.toLowerCase(),
        new_role: default_role,
        metadata: {
          mapping_id: createdMapping.id,
          priority: priority || 1,
          created_at: new Date().toISOString()
        }
      });

    if (logError) {
      console.error('Erro ao registrar log de auditoria:', logError);
      // Não falhar a operação por erro de log
    }

    return NextResponse.json({
      success: true,
      mapping: createdMapping,
      message: 'Mapeamento de domínio criado com sucesso'
    });

  } catch (error) {
    console.error('Erro no endpoint de criação de mapeamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
