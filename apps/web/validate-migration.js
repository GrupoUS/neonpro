const fs = require('node:fs');
const _path = require('node:path');

// Lista de arquivos que devem existir após a migração
const requiredFiles = [
  // Schema e configurações
  'prisma/schema.prisma',
  'prisma/seed.ts',
  'package.json',
  '.env.local',

  // Componentes
  'components/TenantList.tsx',
  'components/ui/badge.tsx',
  'components/ui/button.tsx',
  'components/ui/card.tsx',
  'components/ui/skeleton.tsx',
  'components/ui/alert.tsx',

  // Páginas e API
  'app/tenants/page.tsx',
  'app/api/tenants/route.ts',

  // Utilitários
  'lib/prisma.ts',
  'lib/supabase.ts',
  'lib/utils.ts',
  'lib/types.ts',

  // Scripts de setup
  'setup.bat',
  'test-migration.js',
  'MIGRATION-SETUP.md',
];

// Função para verificar se um arquivo existe
function _fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (_error) {
    return false;
  }
}

// Função para obter informações do arquivo
function getFileInfo(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    return {
      exists: true,
      size: stats.size,
      lines: content.split('\n').length,
      modified: stats.mtime,
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message,
    };
  }
}

// Função principal de validação
function validateMigration() {
  console.log('🔍 ========================================');
  console.log('🔍 NeonPro - Validação da Migração');
  console.log('🔍 ========================================');
  console.log('');

  const results = [];
  let allValid = true;

  console.log('📁 Verificando arquivos obrigatórios...');
  console.log('');

  requiredFiles.forEach((file) => {
    const info = getFileInfo(file);
    const status = info.exists ? '✅' : '❌';

    if (info.exists) {
      console.log(
        `${status} ${file} (${info.lines} linhas, ${(info.size / 1024).toFixed(1)}KB)`
      );
      results.push({ file, status: 'OK', info });
    } else {
      console.log(`${status} ${file} - ARQUIVO AUSENTE`);
      results.push({ file, status: 'MISSING', info });
      allValid = false;
    }
  });

  console.log('');
  console.log('🔧 Verificando configurações específicas...');
  console.log('');

  // Verificar package.json
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.prisma?.seed) {
      console.log('✅ package.json - Script de seed configurado');
    } else {
      console.log('⚠️ package.json - Script de seed não encontrado');
    }

    if (packageJson.devDependencies?.['ts-node']) {
      console.log('✅ package.json - ts-node instalado');
    } else {
      console.log('⚠️ package.json - ts-node não encontrado');
    }
  } catch (_error) {
    console.log('❌ package.json - Erro ao ler arquivo');
    allValid = false;
  }

  // Verificar .env.local
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
    const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    const hasDatabaseUrl = envContent.includes('DATABASE_URL');

    if (hasSupabaseUrl && hasSupabaseKey && hasDatabaseUrl) {
      console.log('✅ .env.local - Todas as variáveis essenciais configuradas');
    } else {
      console.log('⚠️ .env.local - Algumas variáveis podem estar ausentes');
      if (!hasSupabaseUrl) {
        console.log('   - NEXT_PUBLIC_SUPABASE_URL ausente');
      }
      if (!hasSupabaseKey) {
        console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY ausente');
      }
      if (!hasDatabaseUrl) {
        console.log('   - DATABASE_URL ausente');
      }
    }
  } catch (_error) {
    console.log('❌ .env.local - Erro ao ler arquivo');
  }

  // Verificar schema Prisma
  try {
    const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8');
    const hasTenantModel = schemaContent.includes('model Tenant');
    const hasProfileModel = schemaContent.includes('model Profile');
    const hasProductModel = schemaContent.includes('model Product');

    if (hasTenantModel && hasProfileModel && hasProductModel) {
      console.log('✅ schema.prisma - Todos os modelos essenciais presentes');
    } else {
      console.log('⚠️ schema.prisma - Alguns modelos podem estar ausentes');
      allValid = false;
    }
  } catch (_error) {
    console.log('❌ schema.prisma - Erro ao ler arquivo');
    allValid = false;
  }

  console.log('');
  console.log('📊 ========================================');
  console.log('📊 RESUMO DA VALIDAÇÃO');
  console.log('📊 ========================================');

  const validFiles = results.filter((r) => r.status === 'OK').length;
  const totalFiles = results.length;

  console.log(`✅ Arquivos válidos: ${validFiles}/${totalFiles}`);
  console.log(`❌ Arquivos ausentes: ${totalFiles - validFiles}/${totalFiles}`);

  if (allValid) {
    console.log('');
    console.log('🎉 MIGRAÇÃO VALIDADA COM SUCESSO!');
    console.log('🎉 Todos os arquivos essenciais estão presentes!');
    console.log('');
    console.log('🚀 Próximos passos:');
    console.log('   1. Execute: setup.bat');
    console.log('   2. Aguarde a conclusão do setup');
    console.log('   3. Execute: node test-migration.js');
    console.log('   4. Acesse: http://localhost:3000/tenants');
    console.log('');
    console.log('📖 Para instruções detalhadas, leia: MIGRATION-SETUP.md');
  } else {
    console.log('');
    console.log('⚠️ MIGRAÇÃO INCOMPLETA');
    console.log('⚠️ Alguns arquivos essenciais estão ausentes');
    console.log('');
    console.log('🔧 Verifique os arquivos marcados com ❌ acima');
    console.log('📖 Consulte MIGRATION-SETUP.md para mais detalhes');
  }

  console.log('');

  return allValid;
}

// Executar validação
if (require.main === module) {
  const isValid = validateMigration();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateMigration, requiredFiles };
