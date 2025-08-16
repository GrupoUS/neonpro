import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Configurações de timeout padrão (em minutos)
const TIMEOUT_CONFIGS = {
  admin: 60, // 1 hora
  doctor: 45, // 45 minutos
  nurse: 30, // 30 minutos
  staff: 20, // 20 minutos
  professional: 15, // 15 minutos
};

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

    // Buscar perfil do usuário para determinar timeout
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Erro ao buscar perfil do usuário' },
        { status: 500 }
      );
    }

    // Buscar configuração personalizada de timeout se existir
    const { data: userTimeout, error: timeoutError } = await supabase
      .from('user_session_settings')
      .select('timeout_minutes, auto_extend_enabled')
      .eq('user_id', user.id)
      .single();

    // Usar timeout personalizado ou padrão baseado na role
    const timeoutMinutes =
      userTimeout?.timeout_minutes ||
      TIMEOUT_CONFIGS[profile.role as keyof typeof TIMEOUT_CONFIGS] ||
      15; // fallback

    // Calcular tempo restante da sessão atual
    const session = await supabase.auth.getSession();
    const sessionExpiresAt = session.data.session?.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = sessionExpiresAt || now + timeoutMinutes * 60;
    const timeRemaining = Math.max(0, expiresAt - now);

    return NextResponse.json({
      success: true,
      timeout_config: {
        timeout_minutes: timeoutMinutes,
        auto_extend_enabled: userTimeout?.auto_extend_enabled,
        role_based_timeout:
          TIMEOUT_CONFIGS[profile.role as keyof typeof TIMEOUT_CONFIGS],
        custom_timeout: userTimeout?.timeout_minutes || null,
      },
      session_info: {
        expires_at: expiresAt,
        time_remaining_seconds: timeRemaining,
        time_remaining_minutes: Math.floor(timeRemaining / 60),
        is_expired: timeRemaining <= 0,
        warning_threshold: 5 * 60, // Avisar 5 minutos antes
        should_warn: timeRemaining <= 5 * 60 && timeRemaining > 0,
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

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
    const { action } = body;

    if (action === 'extend_session') {
      try {
        // Renovar a sessão
        const { data: refreshData, error: refreshError } =
          await supabase.auth.refreshSession();

        if (refreshError) {
          return NextResponse.json(
            { error: 'Não foi possível estender a sessão' },
            { status: 401 }
          );
        }

        // Registrar extensão da sessão
        await supabase.from('session_activity_log').insert({
          user_id: user.id,
          activity_type: 'session_extended',
          metadata: {
            extended_at: new Date().toISOString(),
            new_expires_at: refreshData.session?.expires_at,
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Sessão estendida com sucesso',
          new_expires_at: refreshData.session?.expires_at,
          access_token: refreshData.session?.access_token,
        });
      } catch (_refreshError) {
        return NextResponse.json(
          { error: 'Erro ao estender sessão' },
          { status: 500 }
        );
      }
    }

    if (action === 'update_timeout_config') {
      const { timeout_minutes, auto_extend_enabled } = body;

      // Validar timeout (mínimo 5 minutos, máximo 120 minutos)
      if (timeout_minutes && (timeout_minutes < 5 || timeout_minutes > 120)) {
        return NextResponse.json(
          { error: 'Timeout deve estar entre 5 e 120 minutos' },
          { status: 400 }
        );
      }

      // Upsert configurações de sessão do usuário
      const { data: updatedConfig, error: updateError } = await supabase
        .from('user_session_settings')
        .upsert({
          user_id: user.id,
          timeout_minutes,
          auto_extend_enabled:
            auto_extend_enabled !== undefined ? auto_extend_enabled : false,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: 'Erro ao salvar configurações de timeout' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Configurações de timeout atualizadas',
        config: updatedConfig,
      });
    }

    if (action === 'check_activity') {
      // Registrar atividade do usuário para resetar timeout
      await supabase.from('session_activity_log').insert({
        user_id: user.id,
        activity_type: 'user_activity',
        metadata: {
          activity_at: new Date().toISOString(),
          user_agent: request.headers.get('user-agent') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Atividade registrada',
        activity_recorded_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: 'Ação não reconhecida' },
      { status: 400 }
    );
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest) {
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

    // Forçar expiração da sessão
    try {
      await supabase.auth.signOut();

      // Registrar logout forçado
      await supabase.from('session_activity_log').insert({
        user_id: user.id,
        activity_type: 'forced_logout',
        metadata: {
          logged_out_at: new Date().toISOString(),
          reason: 'timeout_exceeded',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Sessão encerrada por timeout',
      });
    } catch (_signOutError) {
      return NextResponse.json(
        { error: 'Erro ao encerrar sessão' },
        { status: 500 }
      );
    }
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
