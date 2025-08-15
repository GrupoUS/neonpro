// Teste alternativo: Supabase Client (sem Prisma)
require('dotenv').config({ path: './apps/web/.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseClient() {
  console.log('🔍 Testando Supabase Client (sem Prisma)...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('📊 Variáveis de Ambiente:');
  console.log('SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Ausente');
  console.log(
    'SUPABASE_ANON_KEY:',
    supabaseKey ? '✅ Configurada' : '❌ Ausente'
  );

  if (!(supabaseUrl && supabaseKey)) {
    console.error('❌ Variáveis Supabase não configuradas!');
    return;
  }

  // Criar cliente Supabase
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('\n🔌 Testando conexão Supabase...');

  try {
    // Listar algumas tabelas públicas
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(10);

    if (error) {
      console.error('❌ Erro ao listar tabelas:', error.message);
    } else {
      console.log('✅ Conexão Supabase funcionando!');
      console.log(
        `📋 Encontradas ${tables?.length || 0} tabelas:`,
        tables?.map((t) => t.table_name)
      );
    }

    // Testar acesso às tabelas principais (se existirem)
    console.log('\n🏥 Testando acesso às tabelas do sistema...');

    const tablesToTest = [
      'tenants',
      'profiles',
      'products',
      'appointments',
      'patients',
    ];

    for (const tableName of tablesToTest) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: ${count} registros`);
        }
      } catch (e) {
        console.log(`❌ ${tableName}: Erro - ${e.message}`);
      }
    }
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }

  console.log('\n🎯 RESULTADO:');
  console.log(
    '- Se conexão funcionou: ✅ Supabase OK, problema pode ser no Prisma'
  );
  console.log('- Se falhou: ❌ Problema nas configurações do Supabase');
  console.log('- Próximo passo: Configurar senha do banco para usar Prisma');
}

testSupabaseClient();
