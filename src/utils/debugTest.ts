
import { supabase } from '../lib/supabase';
import { SupabaseDebugger } from './supabaseDebugger';

export const runCompleteDiagnostic = async () => {
  console.log('🔍 Iniciando diagnóstico completo da integração com Supabase...\n');
  
  try {
    // Executar health check completo
    const healthCheck = await SupabaseDebugger.healthCheck();
    
    console.log('\n=== RESULTADOS DO DIAGNÓSTICO ===\n');
    
    if (!healthCheck.connection.success) {
      console.error('🚨 PROBLEMA CRÍTICO: Falha na conexão com Supabase');
      console.error('Erro:', healthCheck.connection.error);
      console.error('Detalhes:', healthCheck.connection.details);
      return;
    }
    
    if (!healthCheck.tables.success) {
      console.error('🚨 PROBLEMA CRÍTICO: Tabelas ausentes no banco');
      console.error('Erro:', healthCheck.tables.error);
      console.error('Detalhes:', healthCheck.tables.data);
      return;
    }
    
    if (!healthCheck.auth.success) {
      console.warn('⚠️ AVISO: Usuário não autenticado');
      console.warn('Para testar operações completas, faça login no aplicativo');
    }
    
    if (!healthCheck.rls.success) {
      console.error('🚨 PROBLEMA: Políticas RLS com erro');
      console.error('Erro:', healthCheck.rls.error);
      console.error('Detalhes:', healthCheck.rls.details);
    }
    
    // 5. Testar operações básicas
    console.log('\n🧪 Testando operações básicas...');
    
    // Teste de inserção em profiles (se usuário autenticado)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('Testando update de profile...');
      const { data, error } = await supabase
        .from('profiles')
        .update({ name: 'Teste Debug' })
        .eq('id', user.id)
        .select();
      
      if (error) {
        console.error('❌ Erro no update de profile:', error);
      } else {
        console.log('✅ Update de profile funcionando:', data);
      }
      
      // Teste de inserção em transactions (usando a tabela correta)
      console.log('Testando inserção de transação...');
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          description: 'Teste Debug',
          amount: 100.00,
          type: 'income',
          category: 'Teste',
          transaction_date: new Date().toISOString(),
          user_id: user.id
        })
        .select();
      
      if (transactionError) {
        console.error('❌ Erro na inserção de transação:', transactionError);
      } else {
        console.log('✅ Inserção de transação funcionando:', transactionData);
        
        // Limpar dados de teste
        if (transactionData && transactionData[0]) {
          await supabase.from('transactions').delete().eq('id', transactionData[0].id);
          console.log('🧹 Dados de teste removidos');
        }
      }
    } else {
      console.log('ℹ️ Nenhum usuário autenticado para testar operações');
    }
    
    console.log('\n✅ Diagnóstico completo finalizado!');
    
  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error);
  }
};
