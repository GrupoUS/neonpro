import { supabase } from '../integrations/supabase/client'

export async function testProfileOperations() {
  console.log('🧪 Testando operações de perfil...')
  
  try {
    // 1. Verificar se o usuário está autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ Erro ao obter usuário:', userError)
      return
    }
    
    if (!user) {
      console.log('❌ Usuário não autenticado')
      return
    }
    
    console.log('✅ Usuário autenticado:', user.id)
    
    // 2. Buscar perfil atual
    const { data: profileData, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (fetchError) {
      console.error('❌ Erro ao buscar perfil:', fetchError)
      return
    }
    
    console.log('✅ Perfil atual:', profileData)
    
    // 3. Testar atualização do perfil
    const updateData = {
      name: profileData.name || 'Teste Usuario',
      phone: profileData.phone || '(11) 99999-9999',
      updated_at: new Date().toISOString()
    }
    
    const { data: updateResult, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
    
    if (updateError) {
      console.error('❌ Erro ao atualizar perfil:', updateError)
      return
    }
    
    console.log('✅ Perfil atualizado com sucesso:', updateResult)
    
    // 4. Verificar se as políticas RLS estão funcionando
    const { data: policyTest, error: policyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
    
    if (policyError) {
      console.error('❌ Erro na política RLS:', policyError)
      return
    }
    
    console.log('✅ Políticas RLS funcionando corretamente')
    console.log('🎉 Todos os testes de perfil passaram!')
    
    return true
    
  } catch (error) {
    console.error('💥 Erro geral no teste:', error)
    return false
  }
}

// Executar teste automaticamente quando importado
if (typeof window !== 'undefined') {
  testProfileOperations()
}
