import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'store_token') {
      const { token_type, encrypted_data, expires_at } = body;

      // Validar dados obrigatórios
      if (!token_type || !encrypted_data) {
        return NextResponse.json(
          { error: 'Tipo de token e dados criptografados são obrigatórios' },
          { status: 400 }
        );
      }

      // Armazenar token de forma segura no banco
      const { data: storedToken, error: storeError } = await supabase
        .from('secure_tokens')
        .insert({
          user_id: user.id,
          token_type,
          encrypted_data,
          expires_at: expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h default
          last_accessed: new Date().toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (storeError) {
        console.error('Erro ao armazenar token:', storeError);
        return NextResponse.json(
          { error: 'Erro ao armazenar token de forma segura' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        token_id: storedToken.id,
        message: 'Token armazenado com segurança'
      });
    }

    if (action === 'retrieve_token') {
      const { token_type } = body;

      if (!token_type) {
        return NextResponse.json(
          { error: 'Tipo de token é obrigatório' },
          { status: 400 }
        );
      }

      // Buscar token ativo mais recente
      const { data: token, error: retrieveError } = await supabase
        .from('secure_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('token_type', token_type)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (retrieveError) {
        return NextResponse.json(
          { error: 'Token não encontrado ou expirado' },
          { status: 404 }
        );
      }

      // Atualizar último acesso
      await supabase
        .from('secure_tokens')
        .update({ last_accessed: new Date().toISOString() })
        .eq('id', token.id);

      return NextResponse.json({
        success: true,
        token: {
          id: token.id,
          token_type: token.token_type,
          encrypted_data: token.encrypted_data,
          expires_at: token.expires_at,
          last_accessed: new Date().toISOString()
        }
      });
    }

    if (action === 'revoke_token') {
      const { token_id, token_type } = body;

      let query = supabase
        .from('secure_tokens')
        .update({ 
          is_active: false,
          revoked_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (token_id) {
        query = query.eq('id', token_id);
      } else if (token_type) {
        query = query.eq('token_type', token_type);
      } else {
        return NextResponse.json(
          { error: 'ID do token ou tipo de token é obrigatório' },
          { status: 400 }
        );
      }

      const { error: revokeError } = await query;

      if (revokeError) {
        console.error('Erro ao revogar token:', revokeError);
        return NextResponse.json(
          { error: 'Erro ao revogar token' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Token revogado com sucesso'
      });
    }

    return NextResponse.json(
      { error: 'Ação não reconhecida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Erro no endpoint de armazenamento de token:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const token_type = searchParams.get('token_type');
    const include_expired = searchParams.get('include_expired') === 'true';

    // Buscar tokens do usuário
    let query = supabase
      .from('secure_tokens')
      .select('id, token_type, expires_at, last_accessed, is_active, created_at, revoked_at')
      .eq('user_id', user.id);

    if (token_type) {
      query = query.eq('token_type', token_type);
    }

    if (!include_expired) {
      query = query.gt('expires_at', new Date().toISOString());
    }

    const { data: tokens, error: tokensError } = await query
      .order('created_at', { ascending: false });

    if (tokensError) {
      console.error('Erro ao buscar tokens:', tokensError);
      return NextResponse.json(
        { error: 'Erro ao buscar tokens' },
        { status: 500 }
      );
    }

    // Estatísticas de tokens
    const active_tokens = tokens?.filter(t => t.is_active && new Date(t.expires_at) > new Date()).length || 0;
    const expired_tokens = tokens?.filter(t => new Date(t.expires_at) <= new Date()).length || 0;
    const revoked_tokens = tokens?.filter(t => !t.is_active).length || 0;

    return NextResponse.json({
      success: true,
      tokens: tokens || [],
      statistics: {
        total: tokens?.length || 0,
        active: active_tokens,
        expired: expired_tokens,
        revoked: revoked_tokens
      }
    });

  } catch (error) {
    console.error('Erro no endpoint de listagem de tokens:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'revoke_all') {
      // Revogar todos os tokens ativos do usuário
      const { error: revokeError } = await supabase
        .from('secure_tokens')
        .update({ 
          is_active: false,
          revoked_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (revokeError) {
        console.error('Erro ao revogar todos os tokens:', revokeError);
        return NextResponse.json(
          { error: 'Erro ao revogar tokens' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Todos os tokens foram revogados'
      });
    }

    if (action === 'cleanup_expired') {
      // Limpar tokens expirados (apenas marcar como inativos)
      const { error: cleanupError } = await supabase
        .from('secure_tokens')
        .update({ 
          is_active: false,
          revoked_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .lt('expires_at', new Date().toISOString())
        .eq('is_active', true);

      if (cleanupError) {
        console.error('Erro ao limpar tokens expirados:', cleanupError);
        return NextResponse.json(
          { error: 'Erro ao limpar tokens expirados' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Tokens expirados foram limpos'
      });
    }

    return NextResponse.json(
      { error: 'Ação de exclusão não reconhecida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Erro no endpoint de exclusão de tokens:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
