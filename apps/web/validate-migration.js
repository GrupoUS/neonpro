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
  const results = [];
  let allValid = true;

  requiredFiles.forEach((file) => {
    const info = getFileInfo(file);
    const _status = info.exists ? '✅' : '❌';

    if (info.exists) {
      results.push({ file, status: 'OK', info });
    } else {
      results.push({ file, status: 'MISSING', info });
      allValid = false;
    }
  });

  // Verificar package.json
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.prisma?.seed) {
    } else {
    }

    if (packageJson.devDependencies?.['ts-node']) {
    } else {
    }
  } catch (_error) {
    allValid = false;
  }

  // Verificar .env.local
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
    const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    const hasDatabaseUrl = envContent.includes('DATABASE_URL');

    if (hasSupabaseUrl && hasSupabaseKey && hasDatabaseUrl) {
    } else {
      if (!hasSupabaseUrl) {
      }
      if (!hasSupabaseKey) {
      }
      if (!hasDatabaseUrl) {
      }
    }
  } catch (_error) {}

  // Verificar schema Prisma
  try {
    const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8');
    const hasTenantModel = schemaContent.includes('model Tenant');
    const hasProfileModel = schemaContent.includes('model Profile');
    const hasProductModel = schemaContent.includes('model Product');

    if (hasTenantModel && hasProfileModel && hasProductModel) {
    } else {
      allValid = false;
    }
  } catch (_error) {
    allValid = false;
  }

  const _validFiles = results.filter((r) => r.status === 'OK').length;
  const _totalFiles = results.length;

  if (allValid) {
  } else {
  }

  return allValid;
}

// Executar validação
if (require.main === module) {
  const isValid = validateMigration();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateMigration, requiredFiles };
