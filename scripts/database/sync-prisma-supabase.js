// Sincronização Schema Prisma → Supabase
require('dotenv').config({ path: './apps/web/.env.local' });

async function syncPrismaToSupabase() {
  console.log('🔄 Sincronizando Schema Prisma → Supabase...\n');

  console.log('📋 INSTRUÇÕES PARA SINCRONIZAÇÃO:');
  console.log('');
  console.log('1️⃣ **OPÇÃO 1: Push do Schema (Desenvolvimento):**');
  console.log('   cd apps/web');
  console.log('   npx prisma db push');
  console.log('   # ⚠️  CUIDADO: Pode sobrescrever dados existentes');
  console.log('');
  console.log('2️⃣ **OPÇÃO 2: Migration (Produção - RECOMENDADO):**');
  console.log('   cd apps/web');
  console.log('   npx prisma migrate dev --name init');
  console.log('   # ✅ Seguro: Cria arquivos de migração');
  console.log('');
  console.log('3️⃣ **Verificar estado atual:**');
  console.log('   npx prisma migrate status');
  console.log('   npx prisma db pull  # Puxar schema do banco para Prisma');
  console.log('');

  // Verificar configuração atual
  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  console.log('📊 STATUS ATUAL:');
  console.log('DATABASE_URL:', dbUrl ? '✅ Configurada' : '❌ Ausente');
  console.log('DIRECT_URL:', directUrl ? '✅ Configurada' : '❌ Ausente');
  console.log(
    'DB_PASSWORD:',
    dbPassword && dbPassword !== 'your_database_password_here'
      ? '✅ Configurada'
      : '❌ Precisa configurar'
  );

  if (!dbPassword || dbPassword === 'your_database_password_here') {
    console.log('');
    console.log('🔐 **AÇÃO NECESSÁRIA:**');
    console.log('   1. Obtenha a senha do banco no Supabase Dashboard');
    console.log('   2. Atualize SUPABASE_DB_PASSWORD no .env.local');
    console.log('   3. Execute os comandos de sincronização acima');
    return;
  }

  console.log('');
  console.log('🚀 **PRÓXIMOS PASSOS:**');
  console.log('   1. Escolha a opção de sincronização (db push ou migrate)');
  console.log('   2. Execute os comandos no diretório apps/web');
  console.log('   3. Teste a conexão com: node ../../test-prisma-supabase.js');
  console.log('');
  console.log('💡 **RECOMENDAÇÃO:**');
  console.log('   - Use "db push" para desenvolvimento rápido');
  console.log('   - Use "migrate" para controle de versão do schema');
}

syncPrismaToSupabase();
