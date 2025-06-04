import { supabase } from '../lib/supabase';

export const testTransactionInsertion = async () => {
  console.log('=== TESTANDO INSERÇÃO DE TRANSAÇÃO ===');
  
  try {
    // Verificar se o usuário está autenticado
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError);
      return false;
    }
    
    if (!session?.user) {
      console.error('❌ Usuário não autenticado');
      return false;
    }
    
    console.log('✅ Usuário autenticado:', session.user.id);
    
    // Tentar inserir uma transação de teste
    const transacaoTeste = {
      descricao: 'Teste de Transação - Debug',
      valor: 100.50,
      tipo: 'receita' as const,
      categoria: 'Procedimentos Estéticos',
      data_transacao: new Date().toISOString().split('T')[0],
      observacoes: 'Transação criada pelo debugger',
      user_id: session.user.id
    };
    
    console.log('📝 Tentando inserir transação:', transacaoTeste);
    
    const { data, error } = await supabase
      .from('transacoes')
      .insert(transacaoTeste)
      .select();
    
    if (error) {
      console.error('❌ Erro ao inserir transação:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }
    
    console.log('✅ Transação inserida com sucesso:', data);
    
    // Verificar se a transação foi realmente salva
    const { data: retrievedData, error: retrieveError } = await supabase
      .from('transacoes')
      .select('*')
      .eq('id', data[0].id)
      .single();
    
    if (retrieveError) {
      console.error('❌ Erro ao recuperar transação:', retrieveError);
      return false;
    }
    
    console.log('✅ Transação recuperada com sucesso:', retrievedData);
    
    // Limpar a transação de teste
    const { error: deleteError } = await supabase
      .from('transacoes')
      .delete()
      .eq('id', data[0].id);
    
    if (deleteError) {
      console.warn('⚠️ Não foi possível deletar a transação de teste:', deleteError);
    } else {
      console.log('🧹 Transação de teste removida');
    }
    
    return true;
    
  } catch (error) {
    console.error('💥 Erro inesperado no teste de transação:', error);
    return false;
  }
};

export const testTransactionRetrieval = async () => {
  console.log('=== TESTANDO RECUPERAÇÃO DE TRANSAÇÕES ===');
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('❌ Usuário não autenticado');
      return false;
    }
    
    console.log('✅ Usuário autenticado:', session.user.id);
    
    // Tentar buscar todas as transações do usuário
    const { data, error, count } = await supabase
      .from('transacoes')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar transações:', error);
      return false;
    }
    
    console.log(`✅ Encontradas ${count} transações do usuário`);
    console.log('📊 Transações:', data);
    
    return true;
    
  } catch (error) {
    console.error('💥 Erro inesperado na busca de transações:', error);
    return false;
  }
};

export const testTransactionPermissions = async () => {
  console.log('=== TESTANDO PERMISSÕES RLS ===');
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('❌ Usuário não autenticado');
      return false;
    }
    
    // Tentar buscar todas as transações (sem filtro de user_id)
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('❌ Erro ao testar permissões:', error);
      return false;
    }
    
    // Com RLS ativo, devemos ver apenas nossas próprias transações
    const allBelongToUser = data?.every(t => t.user_id === session.user.id) ?? true;
    
    if (allBelongToUser) {
      console.log('✅ RLS funcionando corretamente - apenas transações do usuário foram retornadas');
    } else {
      console.warn('⚠️ RLS pode estar mal configurado - transações de outros usuários foram retornadas');
    }
    
    return allBelongToUser;
    
  } catch (error) {
    console.error('💥 Erro inesperado no teste de permissões:', error);
    return false;
  }
};

export const runAllTransactionTests = async () => {
  console.log('🧪 INICIANDO TESTES DE TRANSAÇÕES');
  console.log('=====================================');
  
  const results = {
    insertion: await testTransactionInsertion(),
    retrieval: await testTransactionRetrieval(),
    permissions: await testTransactionPermissions()
  };
  
  console.log('=====================================');
  console.log('📋 RESUMO DOS TESTES:');
  console.log(`• Inserção: ${results.insertion ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log(`• Recuperação: ${results.retrieval ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log(`• Permissões: ${results.permissions ? '✅ PASSOU' : '❌ FALHOU'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 RESULTADO GERAL: ${allPassed ? '✅ TODOS OS TESTES PASSARAM' : '❌ ALGUNS TESTES FALHARAM'}`);
  
  return results;
};
