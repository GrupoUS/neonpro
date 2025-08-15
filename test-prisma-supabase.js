// Teste de conexão Prisma + Supabase
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: './apps/web/.env.local' });

async function testPrismaSupabaseConnection() {
  console.log('🔍 Testando conexão Prisma + Supabase...\n');

  // Verificar variáveis de ambiente
  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  console.log('📊 Variáveis de Ambiente:');
  console.log('DATABASE_URL:', dbUrl ? '✅ Configurada' : '❌ Ausente');
  console.log('DIRECT_URL:', directUrl ? '✅ Configurada' : '❌ Ausente');

  if (!dbUrl) {
    console.error('❌ DATABASE_URL não configurada!');
    return;
  }

  // Criar cliente Prisma
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('\n🔌 Testando conexão...');

    // Teste básico de conectividade
    await prisma.$connect();
    console.log('✅ Conexão Prisma estabelecida!');

    // Listar tabelas disponíveis
    console.log('\n📋 Testando acesso às tabelas:');

    try {
      const tenants = await prisma.tenant.count();
      console.log(`✅ Tenants: ${tenants} registros`);
    } catch (e) {
      console.log('❌ Tenants: Erro -', e.message);
    }

    try {
      const profiles = await prisma.profile.count();
      console.log(`✅ Profiles: ${profiles} registros`);
    } catch (e) {
      console.log('❌ Profiles: Erro -', e.message);
    }

    try {
      const products = await prisma.product.count();
      console.log(`✅ Products: ${products} registros`);
    } catch (e) {
      console.log('❌ Products: Erro -', e.message);
    }

    // Teste de query bruta (verificar se consegue acessar outras tabelas do Supabase)
    console.log('\n🔍 Testando acesso direto ao banco (SQL):');
    try {
      const result =
        await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name LIMIT 10`;
      console.log('✅ Primeiras 10 tabelas do banco:');
      result.forEach((row, i) => console.log(`   ${i + 1}. ${row.table_name}`));
    } catch (e) {
      console.log('❌ Query SQL falhou:', e.message);
    }
  } catch (error) {
    console.error('❌ Erro na conexão Prisma:', error.message);

    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 SOLUÇÃO: Verifique a senha do banco Supabase em:');
      console.log('   1. Supabase Dashboard > Settings > Database');
      console.log('   2. Atualize SUPABASE_DB_PASSWORD no .env.local');
    }

    if (error.message.includes('connection refused')) {
      console.log('\n💡 SOLUÇÃO: Verifique a URL de conexão do Supabase');
    }
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexão Prisma fechada.');
  }

  console.log('\n🎯 RESULTADO:');
  console.log('- Se todas as tabelas apareceram: ✅ Prisma + Supabase OK');
  console.log('- Se houver erros de auth: ❌ Configurar senha do banco');
  console.log('- Se houver erros de conexão: ❌ Verificar URL Supabase');
}

testPrismaSupabaseConnection();
