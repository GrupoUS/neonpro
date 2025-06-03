import { supabase } from '../integrations/supabase/client'

export async function testSupabaseConnection() {
  console.log('🔍 Testando conexão com Supabase...')
  
  try {
    // 1. Testar conexão básica
    console.log('1. Testando conexão básica...')
    const { data: testData, error: testError } = await supabase.from('profiles').select('count').limit(1)
    
    if (testError) {
      console.error('❌ Erro na conexão básica:', testError)
      return { success: false, error: testError }
    }
    console.log('✅ Conexão básica funcionando')

    // 2. Verificar usuário autenticado
    console.log('2. Verificando usuário autenticado...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError)
      return { success: false, error: sessionError }
    }
    
    if (!session?.user) {
      console.warn('⚠️ Usuário não autenticado')
      return { success: false, error: { message: 'Usuário não autenticado' } }
    }
    
    console.log('✅ Usuário autenticado:', session.user.email)

    // 3. Testar operação no perfil
    console.log('3. Testando leitura do perfil...')
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Erro ao ler perfil:', profileError)
      return { success: false, error: profileError }
    }
    
    console.log('✅ Perfil lido com sucesso:', profileData)

    // 4. Testar operação UPDATE no perfil
    console.log('4. Testando UPDATE no perfil...')
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ name: profileData.name || 'Teste' })
      .eq('id', session.user.id)
      .select()
    
    if (updateError) {
      console.error('❌ Erro ao atualizar perfil:', updateError)
      return { success: false, error: updateError }
    }
    
    console.log('✅ Perfil atualizado com sucesso:', updateData)

    // 5. Testar operação na tabela clinicas
    console.log('5. Testando leitura de clínicas...')
    const { data: clinicData, error: clinicError } = await supabase
      .from('clinicas')
      .select('*')
      .eq('user_id', session.user.id)
    
    if (clinicError) {
      console.error('❌ Erro ao ler clínicas:', clinicError)
      return { success: false, error: clinicError }
    }
    
    console.log('✅ Clínicas lidas com sucesso:', clinicData)

    // 6. Testar operação na tabela transacoes
    console.log('6. Testando leitura de transações...')
    const { data: transactionData, error: transactionError } = await supabase
      .from('transacoes')
      .select('*')
      .eq('user_id', session.user.id)
      .limit(5)
    
    if (transactionError) {
      console.error('❌ Erro ao ler transações:', transactionError)
      return { success: false, error: transactionError }
    }
    
    console.log('✅ Transações lidas com sucesso:', transactionData)

    return { 
      success: true, 
      data: {
        user: session.user,
        profile: profileData,
        clinics: clinicData,
        transactions: transactionData
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
    return { success: false, error }
  }
}

// Executar teste automaticamente quando importado
testSupabaseConnection()
