// Teste simples de conexão com Supabase
const testConnection = async () => {
  try {
    console.log('🔍 Testando conexão com Supabase...');
    
    // Simulação básica - apenas verificando se há variáveis de ambiente
    const hasSupabaseUrl = process.env.VITE_SUPABASE_URL || 'não configurado';
    const hasSupabaseKey = process.env.VITE_SUPABASE_ANON_KEY ? 'configurado' : 'não configurado';
    
    console.log('📋 Verificação de Configuração:');
    console.log(`   SUPABASE_URL: ${hasSupabaseUrl}`);
    console.log(`   SUPABASE_ANON_KEY: ${hasSupabaseKey}`);
    
    console.log('✅ Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
};

testConnection();
