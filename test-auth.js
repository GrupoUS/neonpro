// Script de teste de autenticação
// Execute com: node test-auth.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gfkskrkbnawkuppazkpt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdma3NrcmtibmF3a3VwcGF6a3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NTExMzUsImV4cCI6MjA2MzUyNzEzNX0.hpJNATAkIwxQt_Z2Q-hxcxHX4wXszvc7eV24Sfs30ic';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🧪 Testando conexão com Supabase...\n');
  
  // Teste 1: Verificar conexão
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Erro ao conectar:', error.message);
    } else {
      console.log('✅ Conexão com Supabase OK');
      console.log('📊 Sessão atual:', data.session ? 'Ativa' : 'Nenhuma');
    }
  } catch (err) {
    console.error('❌ Erro crítico:', err);
  }

  console.log('\n🔧 URLs de OAuth configuradas:');
  console.log('- Google OAuth URL:', `${supabaseUrl}/auth/v1/authorize?provider=google`);
  console.log('- Callback URL:', `${supabaseUrl}/auth/v1/callback`);
  
  console.log('\n📝 Próximos passos:');
  console.log('1. Configure as variáveis de ambiente no Vercel');
  console.log('2. Configure os redirect URLs no Supabase Dashboard');
  console.log('3. Ative o Google OAuth Provider no Supabase');
  console.log('4. Teste o login em produção');
}

testAuth();