import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import type { Database } from '@/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { conflictType, localProfile, googleProfile, resolution } = body;

    // Validar dados obrigatórios
    if (!(conflictType && localProfile && googleProfile && resolution)) {
      return NextResponse.json(
        { error: 'Dados obrigatórios ausentes' },
        { status: 400 }
      );
    }

    let resolvedProfile: Partial<Profile> = {};

    // Resolver conflito baseado na estratégia escolhida
    switch (resolution) {
      case 'keep_local':
        resolvedProfile = { ...localProfile };
        break;

      case 'use_google':
        resolvedProfile = {
          ...localProfile,
          full_name: googleProfile.name || localProfile.full_name,
          avatar_url: googleProfile.picture || localProfile.avatar_url,
          updated_at: new Date().toISOString(),
        };
        break;

      case 'merge_smart':
        resolvedProfile = {
          ...localProfile,
          // Usar nome do Google se o local estiver vazio ou for genérico
          full_name:
            !localProfile.full_name ||
            localProfile.full_name === 'Usuário' ||
            localProfile.full_name.length < 3
              ? googleProfile.name || localProfile.full_name
              : localProfile.full_name,
          // Usar avatar do Google se o local não existir
          avatar_url: localProfile.avatar_url
            ? localProfile.avatar_url
            : googleProfile.picture,
          updated_at: new Date().toISOString(),
        };
        break;

      case 'custom':
        // Para resolução customizada, usar os dados fornecidos
        resolvedProfile = {
          ...localProfile,
          ...body.customData,
          updated_at: new Date().toISOString(),
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Estratégia de resolução inválida' },
          { status: 400 }
        );
    }

    // Atualizar perfil no banco
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(resolvedProfile)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Erro ao resolver conflito de perfil' },
        { status: 500 }
      );
    }

    // Registrar log de auditoria
    const { error: logError } = await supabase
      .from('profile_audit_log')
      .insert({
        profile_id: user.id,
        action_type: 'conflict_resolution',
        old_data: localProfile,
        new_data: updatedProfile,
        metadata: {
          conflict_type: conflictType,
          resolution_strategy: resolution,
          google_data: googleProfile,
          resolved_at: new Date().toISOString(),
        },
      });

    if (logError) {
      // Não falhar a operação por erro de log
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      conflictResolution: {
        type: conflictType,
        strategy: resolution,
        resolvedAt: new Date().toISOString(),
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar perfil atual
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Erro ao buscar perfil' },
        { status: 500 }
      );
    }

    // Simular dados do Google para demonstração
    // Em produção, isso viria da API do Google
    const googleProfile = {
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      email: user.email,
      picture: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      verified_email: Boolean(user.email_confirmed_at),
    };

    // Detectar conflitos potenciais
    const conflicts = [];

    // Conflito de nome
    if (profile.full_name !== googleProfile.name && googleProfile.name) {
      conflicts.push({
        type: 'name_mismatch',
        field: 'full_name',
        local_value: profile.full_name,
        google_value: googleProfile.name,
        severity: 'medium',
      });
    }

    // Conflito de avatar
    if (profile.avatar_url !== googleProfile.picture && googleProfile.picture) {
      conflicts.push({
        type: 'avatar_mismatch',
        field: 'avatar_url',
        local_value: profile.avatar_url,
        google_value: googleProfile.picture,
        severity: 'low',
      });
    }

    return NextResponse.json({
      hasConflicts: conflicts.length > 0,
      conflicts,
      profiles: {
        local: profile,
        google: googleProfile,
      },
      resolutionStrategies: [
        {
          id: 'keep_local',
          name: 'Manter dados locais',
          description: 'Preservar todas as informações atuais do perfil',
        },
        {
          id: 'use_google',
          name: 'Usar dados do Google',
          description: 'Atualizar perfil com informações do Google',
        },
        {
          id: 'merge_smart',
          name: 'Mesclagem inteligente',
          description: 'Combinar dados usando regras inteligentes',
        },
        {
          id: 'custom',
          name: 'Resolução personalizada',
          description: 'Escolher manualmente quais dados usar',
        },
      ],
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
