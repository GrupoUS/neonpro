
import { supabase } from '@/lib/supabase';

export const testSupabaseConnection = async () => {
  console.log('🔍 Testando conexão com Supabase...');
  
  try {
    // Teste 1: Verificar se o cliente Supabase foi inicializado
    if (!supabase) {
      throw new Error('Cliente Supabase não foi inicializado');
    }
    
    console.log('✅ Cliente Supabase inicializado');

    // Teste 2: Verificar autenticação
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Erro na autenticação:', authError);
      return { success: false, error: 'Erro na autenticação' };
    }

    if (!session) {
      console.log('⚠️ Usuário não autenticado');
      return { success: false, error: 'Usuário não autenticado' };
    }

    console.log('✅ Usuário autenticado:', session.user.email);

    // Teste 3: Verificar acesso ao banco de dados
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles' as any)
        .select('id, name, email')
        .limit(1);

      if (profilesError) {
        console.error('❌ Erro ao acessar tabela profiles:', profilesError);
        return { success: false, error: 'Erro ao acessar banco de dados' };
      }

      console.log('✅ Acesso ao banco de dados funcionando');
      console.log('📊 Dados de teste (profiles):', profiles);

    } catch (dbError) {
      console.error('❌ Erro na conexão com banco:', dbError);
      return { success: false, error: 'Erro na conexão com banco de dados' };
    }

    // Teste 4: Verificar tabelas principais existem
    const tablesToTest = ['clients', 'services', 'professionals'];
    
    for (const table of tablesToTest) {
      try {
        const { error } = await supabase
          .from(table as any)
          .select('id')
          .limit(1);
        
        if (error) {
          console.warn(`⚠️ Tabela ${table} pode não existir ou não ter dados:`, error.message);
        } else {
          console.log(`✅ Tabela ${table} acessível`);
        }
      } catch (tableError) {
        console.warn(`⚠️ Erro ao testar tabela ${table}:`, tableError);
      }
    }

    console.log('🎉 Teste de conexão concluído com sucesso!');
    return { 
      success: true, 
      user: session.user,
      message: 'Conexão com Supabase funcionando corretamente'
    };

  } catch (error) {
    console.error('❌ Erro geral no teste de conexão:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

// Função para debug específico de uma tabela
export const debugTable = async (tableName: string) => {
  console.log(`🔍 Debugando tabela: ${tableName}`);
  
  try {
    const { data, error, count } = await supabase
      .from(tableName as any)
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      console.error(`❌ Erro na tabela ${tableName}:`, error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Tabela ${tableName}:`);
    console.log(`📊 Total de registros: ${count}`);
    console.log(`📄 Primeiros 5 registros:`, data);

    return { success: true, data, count };
  } catch (error) {
    console.error(`❌ Erro inesperado na tabela ${tableName}:`, error);
    return { success: false, error: 'Erro inesperado' };
  }
};
